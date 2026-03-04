import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/better-auth/auth";
import { db } from "@/db";
import { enhancedNotifications, notificationLogs } from "@/db/schema";
import { desc, eq, like, and, SQL, gte, lte } from "drizzle-orm";
import {
  TransactionType,
  parsePaymentDetails,
  getCleanAppName,
  generateTTSMessage,
  getInternalBaseUrl,
} from "@/lib/utils/notification-utils";
import { getAdvancedNotificationProcessor } from "@/lib/services/advanced-notification-processor";

/**
 * Parse UTC date string to Date object.
 */
function parseUTCDate(dateString: string): Date | null {
  if (!dateString) return null;
  const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(dateString);
  const date = isDateOnly
    ? new Date(dateString + "T00:00:00.000Z")
    : new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
}

/**
 * GET /api/notifications/v1
 *
 * List notifications from the new tables only (enhanced_notifications).
 * Supports pagination and filters: startDate, endDate, transactionType, packageName, appName.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized - no valid session" },
        { status: 401 }
      );
    }
    const userId = session.user.id;

    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "10")));
    const offset = (page - 1) * limit;

    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const transactionType = searchParams.get("transactionType");
    const packageName = searchParams.get("packageName");
    const appName = searchParams.get("appName");

    const conditions: SQL[] = [eq(enhancedNotifications.userId, userId)];

    if (startDate) {
      const start = parseUTCDate(startDate);
      if (start) {
        if (/^\d{4}-\d{2}-\d{2}$/.test(startDate)) start.setUTCHours(0, 0, 0, 0);
        conditions.push(gte(enhancedNotifications.timestamp, start));
      }
    }
    if (endDate) {
      const end = parseUTCDate(endDate);
      if (end) {
        if (/^\d{4}-\d{2}-\d{2}$/.test(endDate)) end.setUTCHours(23, 59, 59, 999);
        conditions.push(lte(enhancedNotifications.timestamp, end));
      }
    }
    if (transactionType && ["RECEIVED", "SENT", "UNKNOWN"].includes(transactionType)) {
      conditions.push(eq(enhancedNotifications.transactionType, transactionType as "RECEIVED" | "SENT" | "UNKNOWN"));
    }
    if (packageName) {
      conditions.push(eq(enhancedNotifications.packageName, packageName));
    }
    if (appName) {
      conditions.push(like(enhancedNotifications.appName, `%${appName}%`));
    }

    const whereClause = and(...conditions);

    const [rows, countRows] = await Promise.all([
      db
        .select()
        .from(enhancedNotifications)
        .where(whereClause)
        .orderBy(desc(enhancedNotifications.timestamp))
        .limit(limit)
        .offset(offset),
      db
        .select({ id: enhancedNotifications.id })
        .from(enhancedNotifications)
        .where(whereClause),
    ]);

    const total = countRows.length;
    const totalPages = Math.ceil(total / limit);

    const data = rows.map((row) => {
      const amount = row.amount ? parseFloat(row.amount) : 0;
      const readNotification = generateTTSMessage(amount, row.payerName, row.hasTransaction);
      return {
        id: row.id,
        notificationId: row.notificationId,
        originalNotificationId: row.originalNotificationId,
        packageName: row.packageName,
        appName: row.appName,
        title: row.title,
        content: row.content,
        bigText: row.bigText,
        timestamp: row.timestamp,
        hasTransaction: row.hasTransaction,
        amount: row.amount,
        payerName: row.payerName,
        transactionType: row.transactionType,
        processingTimeMs: row.processingTimeMs,
        notificationLogId: row.notificationLogId,
        ttsAnnounced: row.ttsAnnounced,
        teamNotificationSent: row.teamNotificationSent,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        readNotification,
        metadata: {
          from: row.payerName || "Unknown",
          amount: amount,
          isValid: row.hasTransaction && amount > 0,
        },
      };
    });

    return NextResponse.json({
      data,
      pagination: { page, limit, total, totalPages },
    });
  } catch (error) {
    console.error("[GET /api/notifications/v1] Error:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch notifications";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST /api/notifications/v1
 *
 * Create a notification using only the new tables (notification_logs, enhanced_notifications).
 * Does not write to the legacy notifications table.
 * Same request body as POST /api/notifications; returns notificationLogId and enhancedNotificationId.
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized - no valid session" },
        { status: 401 }
      );
    }
    const userId = session.user.id;

    // Parse body - handle both array and single object
    let bodyData;
    try {
      bodyData = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const items = Array.isArray(bodyData) ? bodyData : [bodyData];
    const results = [];

    for (const item of items) {
      try {
        // Map snake_case to camelCase
        const packageName = item.package_name || item.packageName;

        // Skip if no package name (essential)
        if (!packageName) {
          results.push({ error: "Missing package_name", status: "failed" });
          continue;
        }

        if (item.userId && item.userId !== userId) {
          // Skip items for other users if mistakenly sent
          results.push({ error: "Forbidden user", id: item.notification_id || item.notificationId });
          continue;
        }

        const providedNotificationId = item.notification_id || item.notificationId || item.id;
        const notificationId = providedNotificationId
          ? providedNotificationId.toString()
          : `${packageName}_${Date.now()}_${Math.random().toString(36).substring(7)}`;

        // Prefer provided timestamp, ensure Date object
        let timestamp = new Date();
        if (item.timestamp) {
          // timestamp can be string "2026-02-02 09:25:38.212+00" or simple ms
          timestamp = new Date(item.timestamp);
        }
        if (isNaN(timestamp.getTime())) {
          timestamp = new Date(); // Fallback
        }

        const title = item.title || "";
        const content = item.content || item.text || "";
        const bigText = item.big_text || item.bigText || "";
        const appName = item.app_name || item.appName || getCleanAppName(packageName);

        // Check duplication in enhancedNotifications (unique constraint)
        // Check for existing notificationId in enhancedNotifications
        // Using "findFirst" or direct select since we have unique constraint on notificationId
        const existing = await db
          .select({ id: enhancedNotifications.id })
          .from(enhancedNotifications)
          .where(eq(enhancedNotifications.notificationId, notificationId))
          .limit(1);

        if (existing.length > 0) {
          results.push({
            status: "duplicate",
            notificationId: notificationId,
            message: "Notification already processed",
          });
          continue;
        }

        // Transaction parsing logic
        // If the user provided detailed transaction info, use it.
        const providedHasTransaction = item.has_transaction ?? item.hasTransaction;
        const providedAmount = item.amount ? String(item.amount) : null;
        const providedPayerName = item.payer_name || item.payerName;
        const providedTransactionType = item.transaction_type || item.transactionType;

        // processing_metadata might be a JSON string in the payload
        let processingMetadata = item.processing_metadata || item.processingMetadata || {};
        if (typeof processingMetadata === "string") {
          try {
            processingMetadata = JSON.parse(processingMetadata);
          } catch { }
        }

        let paymentDetails: ReturnType<typeof parsePaymentDetails> = null;

        // If we trust the client's parsing (hasTransaction is explicitly true or provided amount)
        if (providedHasTransaction === true || providedAmount) {
          paymentDetails = {
            amount: providedAmount || null,
            payerName: providedPayerName,
            transactionType: (providedTransactionType as TransactionType) || TransactionType.UNKNOWN,
            // Mocking other fields if needed, or we just utilize extraction below
          };
          // Also mark as processed in the advanced processor to keep state processing consistent
          getAdvancedNotificationProcessor().markAsProcessed(notificationId);
        } else {
          // Use Advanced Notification Processor for server-side parsing
          const processor = getAdvancedNotificationProcessor();
          const processed = await processor.processNotification(
            notificationId,
            packageName,
            title,
            content,
            bigText
          );

          paymentDetails = {
            amount: processed.amount,
            payerName: processed.payerName,
            transactionType: processed.transactionType,
          };
        }

        // --- Logic matches original POST but inside loop ---

        let notificationLogId: number | null = null;
        let transactionType: TransactionType = paymentDetails?.transactionType ?? TransactionType.UNKNOWN;
        if (providedTransactionType && ["RECEIVED", "SENT", "UNKNOWN"].includes(providedTransactionType)) {
          transactionType = providedTransactionType as TransactionType;
        }

        const processingTimeMs = item.processing_time_ms ?? (Date.now() - startTime);

        const hasTransaction = Boolean(paymentDetails?.amount) || providedHasTransaction === true;

        // Insert into notificationLogs
        const logEntry = await db
          .insert(notificationLogs)
          .values({
            userId,
            notificationId,
            packageName,
            appName,
            timestamp: timestamp,
            title,
            text: content,
            bigText,
            hasTransaction,
            amount: paymentDetails?.amount ?? null,
            payerName: paymentDetails?.payerName ?? providedPayerName ?? null,
            transactionType,
            processingTimeMs: Number(processingTimeMs) || 0,
            ttsAnnounced: item.tts_announced ?? item.ttsAnnounced ?? false,
          })
          .returning();

        notificationLogId = logEntry[0]?.id ?? null;

        // Enhanced Notification
        let enhancedNotificationId: number | null = null;
        // Only insert if it's a transaction (based on original logic: "if (hasTransaction ...)")
        // OR if user explicitly says hasTransaction
        if (hasTransaction && notificationLogId !== null && (paymentDetails?.amount || providedAmount)) {
          const finalAmount = paymentDetails?.amount || providedAmount || "0";
          const finalPayer = paymentDetails?.payerName || providedPayerName;

          const enhancedRows = await db
            .insert(enhancedNotifications)
            .values({
              userId,
              notificationId,
              originalNotificationId: null,
              packageName,
              appName,
              title,
              content,
              bigText,
              timestamp: timestamp,
              hasTransaction: true,
              amount: finalAmount,
              payerName: finalPayer,
              transactionType,
              processingTimeMs: Number(processingTimeMs) || 0,
              processingMetadata: {
                ...processingMetadata,
                original_log_id: item.notification_log_id, // Keep reference if provided
              },
              notificationLogId,
              ttsAnnounced: item.tts_announced ?? item.ttsAnnounced ?? false,
              teamNotificationSent: item.team_notification_sent ?? item.teamNotificationSent ?? false,
            })
            .returning();
          enhancedNotificationId = enhancedRows[0]?.id ?? null;
        }

        // Analytics & Team Notify (Optimistic, fire and forget)
        try {
          const { AnalyticsService } = await import("@/lib/services/analytics-service");
          if (notificationLogId) {
            AnalyticsService.logNotificationEvent("created", {
              notification_log_id: notificationLogId,
              package_name: packageName,
              has_transaction: hasTransaction,
              userId,
            });
          }
          if (paymentDetails?.amount) {
            AnalyticsService.logNotificationEvent("detected", {
              source: appName,
              amount: parseFloat(paymentDetails.amount),
              transaction_type: transactionType,
              userId,
            });
          }
        } catch {
          // Analytics optional
        }

        // Team notify
        if (
          transactionType === TransactionType.RECEIVED &&
          enhancedNotificationId &&
          (paymentDetails?.amount || providedAmount)
        ) {
          const finalAmount = paymentDetails?.amount || providedAmount;
          if (finalAmount) {
            fetch(`${getInternalBaseUrl(request.nextUrl.origin)}/api/notifications/team-notify`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                ...Object.fromEntries(
                  [...request.headers.entries()].filter(
                    ([name]) =>
                      !["connection", "keep-alive", "content-length", "host", "content-type"].includes(
                        name.toLowerCase()
                      )
                  )
                ),
              },
              body: JSON.stringify({
                notificationLogId,
                amount: finalAmount,
                payerName: paymentDetails?.payerName || providedPayerName,
                appName,
                teamMemberCount: 0,
              }),
            }).catch((err) =>
              console.warn("[POST /api/notifications/v1] Team notify failed:", err)
            );
          }
        }

        // Construct full response object matching GET structure
        const responseItem = {
          id: enhancedNotificationId ?? notificationLogId,
          notificationId,
          notificationLogId,
          packageName,
          appName,
          title,
          content,
          bigText,
          timestamp,
          hasTransaction,
          amount: paymentDetails?.amount || providedAmount || null,
          payerName: paymentDetails?.payerName || providedPayerName || null,
          transactionType,
          processingTimeMs: Number(processingTimeMs) || 0,
          ttsAnnounced: item.tts_announced ?? item.ttsAnnounced ?? false,
          teamNotificationSent: item.team_notification_sent ?? item.teamNotificationSent ?? false,
          createdAt: new Date(), // Approximation
          updatedAt: new Date(),
          readNotification: generateTTSMessage(
            paymentDetails?.amount || providedAmount,
            paymentDetails?.payerName || providedPayerName,
            hasTransaction
          ),
          status: "success",
        };

        results.push(responseItem);
      } catch (err) {
        console.error("Error processing item:", item, err);
        results.push({
          status: "error",
          message: err instanceof Error ? err.message : "Unknown error",
          notificationId: item.notification_id,
        });
      }
    }

    return NextResponse.json(
      {
        data: results,
        processed: results.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[POST /api/notifications/v1] Error:", error);
    const message = error instanceof Error ? error.message : "Failed to create notification";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
