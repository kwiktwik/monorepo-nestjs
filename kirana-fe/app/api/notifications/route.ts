import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/better-auth/auth";
import { db } from "@/db";
import { notifications, enhancedNotifications, notificationLogs } from "@/db/schema";
import { desc, eq, like, and, SQL, gte, lte, sql } from "drizzle-orm";
import { parseUPINotification } from "@/lib/utils/upi-parser";
import { getNotificationProcessor } from "@/lib/services/notification-processor";
import {
  TransactionType,
  parsePaymentDetails,
  getCleanAppName,
  getInternalBaseUrl,
} from "@/lib/utils/notification-utils";

/**
 * Parse UTC date string to Date object
 * Supports ISO 8601 formats: YYYY-MM-DD, YYYY-MM-DDTHH:mm:ssZ, etc.
 * All dates are parsed and returned in UTC
 * @param dateString - Date string in UTC/ISO format
 * @returns Date object in UTC or null if invalid
 */
function parseUTCDate(dateString: string): Date | null {
  if (!dateString) {
    return null;
  }

  let date: Date;

  // If it's just a date (YYYY-MM-DD), parse it as UTC midnight
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    date = new Date(dateString + "T00:00:00.000Z");
  } else {
    // For full ISO strings, parse directly (should include Z or timezone)
    date = new Date(dateString);
  }

  // Validate the date
  if (isNaN(date.getTime())) {
    return null;
  }

  return date;
}

export async function GET(request: NextRequest) {
  let session: any = null;

  try {
    // Get the Better Auth session from the incoming request
    session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized - no valid session" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Ensure userId is present and valid
    if (!userId || typeof userId !== "string") {
      return NextResponse.json(
        { error: "Unauthorized - invalid user ID" },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;

    // Pagination
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    // Filters
    const packageName = searchParams.get("packageName");
    const title = searchParams.get("title");
    const hasRemoved = searchParams.get("hasRemoved");
    const onGoing = searchParams.get("onGoing");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const conditions: SQL[] = [];

    // ALWAYS filter by userId first - only return notifications for the authenticated user
    // This ensures users can only access their own notifications
    conditions.push(eq(notifications.userId, userId));

    // Add additional filters
    if (packageName) {
      conditions.push(eq(notifications.packageName, packageName));
    }
    if (title) {
      conditions.push(like(notifications.title, `%${title}%`));
    }
    if (hasRemoved !== null && hasRemoved !== undefined) {
      conditions.push(eq(notifications.hasRemoved, hasRemoved === "true"));
    }
    if (onGoing !== null && onGoing !== undefined) {
      conditions.push(eq(notifications.onGoing, onGoing === "true"));
    }
    if (startDate) {
      const start = parseUTCDate(startDate);
      if (start) {
        // Ensure start date is at beginning of day in UTC
        if (/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
          start.setUTCHours(0, 0, 0, 0);
        }
        conditions.push(gte(notifications.createdAt, start));
      }
    }
    if (endDate) {
      const end = parseUTCDate(endDate);
      if (end) {
        // Ensure end date is at end of day in UTC
        if (/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
          end.setUTCHours(23, 59, 59, 999);
        }
        conditions.push(lte(notifications.createdAt, end));
      }
    }

    // Only return notifications with isValid: true in metadata
    // Handle null metadata and check if isValid is true
    conditions.push(
      sql`${notifications.metadata} IS NOT NULL AND ${notifications.metadata}->>'isValid' = 'true'`
    );

    // Always combine conditions with AND - userId filter is always included
    const whereClause = and(...conditions);

    // Log for debugging - confirm userId filter is applied
    console.log(`[GET /api/notifications] Filtering notifications for userId: ${userId}`);

    const [data, countResult] = await Promise.all([
      db
        .select()
        .from(notifications)
        .where(whereClause)
        .orderBy(desc(notifications.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: notifications.id })
        .from(notifications)
        .where(whereClause),
    ]);

    const total = countResult.length;
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      data: data.map((item) => ({
        ...item,
        metadata: item.metadata || {
          from: "Unknown",
          amount: 0,
          isValid: false,
        },
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error("[GET /api/notifications] Error:", error);

    // Log to Mixpanel
    try {
      const { AnalyticsService } = await import("@/lib/services/analytics-service");
      await AnalyticsService.logError(error, "GET /api/notifications", {
        userId: session?.user?.id || "unknown",
      });
    } catch (e) {
      console.error("Failed to log error to Mixpanel", e);
    }

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message || "Failed to fetch notifications" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let userId: string | undefined;
  let body: any;
  let notificationId: string | undefined;

  try {
    // Get the Better Auth session from the incoming request
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized - no valid session" },
        { status: 401 }
      );
    }

    userId = session.user.id;

    // Ensure userId is present and valid
    if (!userId || typeof userId !== "string") {
      return NextResponse.json(
        { error: "Unauthorized - invalid user ID" },
        { status: 401 }
      );
    }

    body = await request.json();

    // Ensure no userId is provided in the request body - use authenticated user's ID only
    if (body.userId && body.userId !== userId) {
      return NextResponse.json(
        { error: "Forbidden - cannot create notification for another user" },
        { status: 403 }
      );
    }

    console.log(
      `[POST /api/notifications] Processing notification for userId: ${userId}, package: ${body.packageName}`
    );

    // Get notification processor for duplicate detection
    const processor = getNotificationProcessor();

    // Generate unique notification ID
    notificationId = `${body.packageName}_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const timestamp = body.timestamp || Date.now();

    // Check for duplicate notification
    if (processor.isProcessed(notificationId!)) {
      console.log(
        `[POST /api/notifications] ⏭️ Skipping duplicate notification: ${notificationId}`
      );
      return NextResponse.json(
        {
          error: "Duplicate notification",
          notificationId,
          message: "This notification has already been processed"
        },
        { status: 409 } // Conflict
      );
    }

    // STAGE 1: Parse payment details using enhanced parser
    const paymentDetails = parsePaymentDetails(
      body.packageName,
      body.title,
      body.content || "",
      body.bigText || ""
    );

    let notificationLogId: number | null = null;
    let transactionType: TransactionType = TransactionType.UNKNOWN;
    let processingTimeMs = 0;

    // STAGE 2: Create notification log (ALWAYS log for audit trail)
    // NOTE: This requires the notificationLogs table to exist
    // Run the migration script manually before using this feature
    try {
      const hasTransaction = !!(paymentDetails && paymentDetails.amount);

      const logEntry = await db
        .insert(notificationLogs)
        .values({
          userId,
          notificationId: notificationId!,
          packageName: body.packageName,
          appName: getCleanAppName(body.packageName),
          timestamp: new Date(timestamp),
          title: body.title,
          text: body.content || "",
          bigText: body.bigText || "",
          hasTransaction,
          amount: paymentDetails?.amount || null,
          payerName: paymentDetails?.payerName || null,
          transactionType: paymentDetails?.transactionType || TransactionType.UNKNOWN,
          processingTimeMs: Date.now() - startTime,
          ttsAnnounced: false,
        })
        .returning();

      notificationLogId = logEntry[0]?.id || null;
      if (hasTransaction && paymentDetails) {
        transactionType = paymentDetails.transactionType;
      }
      processingTimeMs = Date.now() - startTime;

      console.log(
        `[POST /api/notifications] ✅ STAGE 2 COMPLETE: Notification log created with ID: ${notificationLogId}`
      );
    } catch (error) {
      // Gracefully handle if notificationLogs table doesn't exist yet
      console.warn(
        `[POST /api/notifications] ⚠️ STAGE 2 SKIPPED: Notification log table may not exist yet. Run migration to enable this feature.`,
        error instanceof Error ? error.message : error
      );
      // Continue processing - this is optional functionality
      if (paymentDetails && paymentDetails.amount) {
        transactionType = paymentDetails.transactionType;
      }
      processingTimeMs = Date.now() - startTime;
    }

    // Parse UPI notification using original parser for backward compatibility
    const { amount: extractedAmount, from: extractedFrom, isValid } =
      parseUPINotification(body.packageName, body.title, body.content);

    let readNotification: string | "" = "";
    if (isValid && extractedAmount && extractedAmount > 0) {
      // Amount is already in rupees
      readNotification = `₹${extractedAmount.toLocaleString("en-IN")} received from ${extractedFrom}`;
    }

    const metadata = {
      from: extractedFrom || paymentDetails?.payerName || "Unknown",
      amount: extractedAmount || parseFloat(paymentDetails?.amount || "0") || 0,
      isValid,
    };

    const processingMetadata = {
      notificationId: notificationId!,
      processingTimeMs,
      transactionType,
      hasNotificationLog: notificationLogId !== null,
    };

    // STAGE 3A: Create notification record in ORIGINAL table (unchanged behavior)
    const newNotification = await db
      .insert(notifications)
      .values({
        userId,
        canReply: body.canReply ?? false,
        packageName: body.packageName,
        title: body.title,
        content: body.content,
        hasRemoved: body.hasRemoved ?? false,
        haveExtraPicture: body.haveExtraPicture ?? false,
        onGoing: body.onGoing ?? false,
        metadata,
      })
      .returning();

    const notification = newNotification[0];

    // STAGE 3B: Create enhanced notification record in NEW table (if migration run)
    let enhancedNotificationId: number | null = null;
    if (paymentDetails && paymentDetails.amount) {
      try {
        const enhancedNotif = await db
          .insert(enhancedNotifications)
          .values({
            userId,
            notificationId: notificationId!,
            originalNotificationId: notification.id,
            packageName: body.packageName,
            appName: getCleanAppName(body.packageName),
            title: body.title,
            content: body.content || "",
            bigText: body.bigText || "",
            timestamp: new Date(timestamp),
            hasTransaction: true,
            amount: paymentDetails.amount,
            payerName: paymentDetails.payerName,
            transactionType,
            processingTimeMs,
            processingMetadata,
            notificationLogId,
            ttsAnnounced: false,
            teamNotificationSent: false,
          })
          .returning();

        enhancedNotificationId = enhancedNotif[0]?.id || null;
        console.log(
          `[POST /api/notifications] ✅ Enhanced notification created: id=${enhancedNotificationId}`
        );
      } catch (error) {
        console.warn(
          `[POST /api/notifications] ⚠️ Enhanced notification table may not exist yet. Run migration to enable.`,
          error instanceof Error ? error.message : error
        );
      }
    }

    // Mark notification as processed to prevent duplicates
    processor.markAsProcessed(notificationId!);

    console.log(
      `[POST /api/notifications] ✅ Notification created: id=${notification.id}, type=${transactionType}, logId=${notificationLogId}`
    );

    // STAGE 4: Log analytics events
    try {
      const { AnalyticsService } = await import("@/lib/services/analytics-service");

      if (notificationLogId) {
        AnalyticsService.logNotificationEvent("created", {
          notification_log_id: notificationLogId,
          package_name: body.packageName,
          has_transaction: true,
          userId,
        });
      }

      if (paymentDetails && paymentDetails.amount) {
        AnalyticsService.logNotificationEvent("detected", {
          source: getCleanAppName(body.packageName),
          amount: parseFloat(paymentDetails.amount),
          transaction_type: transactionType,
          userId,
        });
      }
    } catch (error) {
      console.warn("[POST /api/notifications] Analytics logging failed:", error);
    }

    // STAGE 5: Trigger team notification for RECEIVED transactions (optional)
    // This runs asynchronously and doesn't block the response
    if (
      transactionType === TransactionType.RECEIVED &&
      notificationLogId &&
      paymentDetails?.amount
    ) {
      const forbiddenHeaders = new Set(["connection", "keep-alive", "content-length", "host", "content-type"]);
      const safeHeaders = Object.fromEntries(
        [...request.headers.entries()].filter(
          ([name]) => !forbiddenHeaders.has(name.toLowerCase())
        )
      );
      // Fire and forget - don't await (use internal base URL to avoid HTTPS→HTTP SSL errors)
      fetch(`${getInternalBaseUrl(request.nextUrl.origin)}/api/notifications/team-notify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...safeHeaders,
        },
        body: JSON.stringify({
          notificationLogId,
          amount: paymentDetails.amount,
          payerName: paymentDetails.payerName,
          appName: getCleanAppName(body.packageName),
          teamMemberCount: body.teamMemberCount || 0,
        }),
      }).catch((error) => {
        console.warn(
          "[POST /api/notifications] Team notification trigger failed:",
          error
        );
      });
    }

    return NextResponse.json(
      {
        id: notification.id,
        canReply: notification.canReply,
        packageName: notification.packageName,
        title: notification.title,
        content: notification.content,
        hasRemoved: notification.hasRemoved,
        haveExtraPicture: notification.haveExtraPicture,
        onGoing: notification.onGoing,
        createdAt: notification.createdAt,
        readNotification,
        metadata: notification.metadata || metadata,
        // Enhanced processing fields (only if available)
        transactionType,
        processingMetadata,
        notificationLogId,
        enhancedNotificationId, // NEW: ID from enhanced_notifications table
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/notifications] Error:", error);

    // Log to Mixpanel
    try {
      const { AnalyticsService } = await import("@/lib/services/analytics-service");
      await AnalyticsService.logError(error, "POST /api/notifications", {
        userId: userId || "unknown",
        packageName: body?.packageName || "unknown",
        notificationId: notificationId || "unknown",
      });
    } catch (e) {
      console.error("Failed to log error to Mixpanel", e);
    }

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message || "Failed to create notification" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
