import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  user,
  pushTokens,
  notificationRateLimits,
  cronNotificationLogs,
  subscriptions,
  phonepeSubscriptions,
  orders,
} from "@/db/schema";
import { eq, and, lte, notExists, sql } from "drizzle-orm";
import { NotificationService } from "@/lib/services/notification-service";

// Secret for authenticating cron requests
const CRON_SECRET = process.env.CRON_SECRET || "";

// Configuration
const MAX_NOTIFICATIONS_PER_DAY = 4;
const NOTIFICATION_DELAY_HOURS = 3;

// Notification templates
const NOTIFICATION_TEMPLATES = [
  {
    type: "welcome_reminder",
    title: "Soundbox mein aapka swagat hai! 🎵",
    body: "Free trial shuru karo aur unlimited payment announcements ka mazaa lo. Setup mein sirf 2 minute!",
  },
  {
    type: "feature_highlight",
    title: "Kya aapko pata hai? 🤔",
    body: "Premium users ko milti hai unlimited announcements — har payment ki awaaz, seedha aapke phone se!",
  },
  {
    type: "social_proof",
    title: "10,000+ dukandaar use kar rahe hain! 🚀",
    body: "Kashmir se Kanyakumari tak, sab Soundbox pe bharosa karte hain apni dukaan ke liye.",
  },
  {
    type: "last_chance",
    title: "Abhi nahi toh kab? ⚡",
    body: "Aapka free trial abhi bhi wait kar raha hai. Ek baar try karo — pasand aaye toh rakho!",
  },
];

/**
 * SEGMENT 1: "Installed — No Purchase"
 *
 * Users who installed the app but NEVER purchased anything (trial or paid).
 * These are cold leads who haven't experienced the product yet.
 *
 * Eligibility:
 * - User created 3+ hours ago
 * - NO captured orders (never paid for anything)
 * - NO active subscription currently
 * - Less than 4 notifications sent today
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = `cron-no-purchase-${Date.now()}`;

  try {
    console.log(`\n${"=".repeat(80)}`);
    console.log(
      `[CRON ${requestId}] 🕐 No-Purchase Segment Cron started at ${new Date().toISOString()}`,
    );

    // Validate authentication
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!CRON_SECRET || token !== CRON_SECRET) {
      console.error(`[CRON ${requestId}] ❌ Unauthorized access attempt`);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if dry run mode
    const { searchParams } = new URL(request.url);
    const isDryRun = searchParams.get("dryRun") === "true";
    if (isDryRun) {
      console.log(`[CRON ${requestId}] 🧪 DRY RUN MODE`);
    }

    const now = new Date();
    const threeHoursAgo = new Date(
      now.getTime() - NOTIFICATION_DELAY_HOURS * 60 * 60 * 1000,
    );
    const today = now.toISOString().split("T")[0];

    console.log(
      `[CRON ${requestId}] 🔍 Finding users created 3+ hours ago who never purchased`,
    );

    // Find users who NEVER purchased and have push tokens
    const eligibleUsersRaw = await db
      .select({
        userId: user.id,
        appId: pushTokens.appId,
        userName: user.name,
        userEmail: user.email,
        createdAt: user.createdAt,
      })
      .from(user)
      .innerJoin(pushTokens, eq(pushTokens.userId, user.id))
      .where(
        and(
          // User created 3+ hours ago
          lte(user.createdAt, threeHoursAgo),

          // Has active push tokens
          eq(pushTokens.isActive, true),

          // NO captured orders (never purchased)
          notExists(
            db
              .select()
              .from(orders)
              .where(
                and(eq(orders.userId, user.id), eq(orders.status, "captured")),
              ),
          ),

          // NO active subscription
          notExists(
            db
              .select()
              .from(subscriptions)
              .where(
                and(
                  eq(subscriptions.userId, user.id),
                  eq(subscriptions.status, "active"),
                ),
              ),
          ),

          // NO active PhonePe subscription
          notExists(
            db
              .select()
              .from(phonepeSubscriptions)
              .where(
                and(
                  eq(phonepeSubscriptions.userId, user.id),
                  eq(phonepeSubscriptions.state, "ACTIVE"),
                ),
              ),
          ),
        ),
      )
      .limit(1000);

    // Deduplicate users (a user might have multiple push tokens for different apps)
    const userMap = new Map();
    for (const u of eligibleUsersRaw) {
      if (!userMap.has(u.userId)) {
        userMap.set(u.userId, u);
      }
    }
    const eligibleUsers = Array.from(userMap.values());

    console.log(
      `[CRON ${requestId}] 📊 Found ${eligibleUsers.length} eligible users (never purchased)`,
    );

    if (eligibleUsers.length === 0) {
      return NextResponse.json({
        success: true,
        processed: 0,
        total: 0,
        dryRun: isDryRun,
        message: "No eligible users found",
      });
    }

    // Check rate limits
    const usersWithRateLimitInfo = await Promise.all(
      eligibleUsers.map(async (userData) => {
        const appId = userData.appId || "alertpay-default";

        const rateLimit = await db
          .select()
          .from(notificationRateLimits)
          .where(
            and(
              eq(notificationRateLimits.userId, userData.userId),
              eq(notificationRateLimits.appId, appId),
              eq(notificationRateLimits.date, today),
            ),
          )
          .limit(1);

        return {
          ...userData,
          appId,
          currentNotificationCount: rateLimit[0]?.count || 0,
          canSendNotification:
            (rateLimit[0]?.count || 0) < MAX_NOTIFICATIONS_PER_DAY,
        };
      }),
    );

    const usersToNotify = usersWithRateLimitInfo.filter(
      (u) => u.canSendNotification,
    );
    const skippedDueToRateLimit = usersWithRateLimitInfo.filter(
      (u) => !u.canSendNotification,
    );

    if (usersToNotify.length === 0) {
      return NextResponse.json({
        success: true,
        processed: 0,
        total: eligibleUsers.length,
        skippedDueToRateLimit: skippedDueToRateLimit.length,
        dryRun: isDryRun,
        message: "All users reached daily limit",
      });
    }

    // Send notifications
    let processed = 0;
    let sent = 0;
    let failed = 0;

    for (const userData of usersToNotify) {
      try {
        const template =
          NOTIFICATION_TEMPLATES[
            Math.min(userData.currentNotificationCount, 3)
          ];

        if (!isDryRun) {
          try {
            const response = await NotificationService.sendToUser(
              userData.userId,
              userData.appId,
              {
                title: template.title,
                body: template.body,
                data: {
                  type: "segment_notification",
                  segment: "no_purchase",
                  notificationType: template.type,
                },
              },
            );

            // Log success
            await db.insert(cronNotificationLogs).values({
              userId: userData.userId,
              appId: userData.appId,
              segment: "no_purchase",
              notificationType: template.type,
              title: template.title,
              body: template.body,
              status: "sent",
              sentAt: now,
              fcmMessageId: response.responses[0]?.messageId || null,
            });

            // Update rate limit
            await db
              .insert(notificationRateLimits)
              .values({
                userId: userData.userId,
                appId: userData.appId,
                date: today,
                count: 1,
                lastNotificationAt: now,
              })
              .onConflictDoUpdate({
                target: [
                  notificationRateLimits.userId,
                  notificationRateLimits.appId,
                  notificationRateLimits.date,
                ],
                set: {
                  count: sql`${notificationRateLimits.count} + 1`,
                  lastNotificationAt: now,
                  updatedAt: now,
                },
              });

            sent++;
          } catch (error) {
            // Log failure
            await db.insert(cronNotificationLogs).values({
              userId: userData.userId,
              appId: userData.appId,
              segment: "no_purchase",
              notificationType: template.type,
              title: template.title,
              body: template.body,
              status: "failed",
              sentAt: now,
              errorMessage:
                error instanceof Error ? error.message : String(error),
            });
            throw error;
          }
        }

        processed++;
      } catch (error) {
        failed++;
        console.error(
          `[CRON ${requestId}] ❌ Failed for user ${userData.userId}:`,
          error,
        );
      }
    }

    return NextResponse.json({
      success: true,
      total: eligibleUsers.length,
      processed,
      sent,
      failed,
      skippedDueToRateLimit: skippedDueToRateLimit.length,
      dryRun: isDryRun,
      message: `Processed ${processed}, sent ${sent}`,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Cron failed",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
