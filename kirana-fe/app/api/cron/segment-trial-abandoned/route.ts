import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  pushTokens,
  notificationRateLimits,
  cronNotificationLogs,
  subscriptions,
  phonepeSubscriptions,
  orders,
} from "@/db/schema";
import { eq, and, lte, notExists, sql, inArray } from "drizzle-orm";
import { NotificationService } from "@/lib/services/notification-service";

// Secret for authenticating cron requests
const CRON_SECRET = process.env.CRON_SECRET || "";

// Configuration
const MAX_NOTIFICATIONS_PER_DAY = 4;

// Notification templates for trial-ended users
const NOTIFICATION_TEMPLATES = [
  {
    type: "trial_ended_reminder",
    title: "Aapka trial khatam ho gaya! 🎵",
    body: "Wapas aao aur premium features ka mazaa lo. Abhi subscribe karo!",
  },
  {
    type: "value_reminder",
    title: "Fayde mat chodo! ⚡",
    body: "Aap har payment ki awaaz sun rahe the. Continue karne ke liye subscribe karo!",
  },
  {
    type: "social_proof",
    title: "10,000+ khush dukandaar join kar chuke hain! 🚀",
    body: "Jaano kyun itne saare log Soundbox pe bharosa karte hain apni dukaan ke liye. Abhi subscribe karo!",
  },
  {
    type: "final_reminder",
    title: "Last mauka! 🔔",
    body: "Aapke premium features wait kar rahe hain. Subscribe karo aur koi bhi payment miss mat karo!",
  },
];

/**
 * SEGMENT 2: "Trial Ended — Not Converted"
 *
 * Users who:
 * - Had a trial subscription
 * - Trial has ended (status = cancelled)
 * - Did NOT convert to paid
 * - No active subscription currently
 * - Have active push tokens
 *
 * These are warm leads who tried the product but didn't subscribe.
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = `cron-trial-ended-${Date.now()}`;

  try {
    console.log(`\n${"=".repeat(80)}`);
    console.log(
      `[CRON ${requestId}] 🕐 Trial-Ended Segment Cron started at ${new Date().toISOString()}`,
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
    const today = now.toISOString().split("T")[0];

    console.log(
      `[CRON ${requestId}] 🔍 Finding users whose trial ended and didn't convert`,
    );

    // Step 1: Find subscriptions that ended (trial over) with no conversion
    const endedSubscriptions = await db
      .select({
        userId: subscriptions.userId,
        appId: subscriptions.appId,
      })
      .from(subscriptions)
      .where(
        and(
          // Subscription ended (trial over)
          eq(subscriptions.status, "cancelled"),

          // Has end date in the past (trial actually ended)
          lte(subscriptions.endAt, now),

          // NO captured orders (never paid for anything)
          notExists(
            db
              .select()
              .from(orders)
              .where(
                and(
                  eq(orders.userId, subscriptions.userId),
                  eq(orders.status, "captured"),
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
                  eq(phonepeSubscriptions.userId, subscriptions.userId),
                  eq(phonepeSubscriptions.state, "ACTIVE"),
                ),
              ),
          ),
        ),
      )
      .limit(1000);

    if (endedSubscriptions.length === 0) {
      console.log(
        `[CRON ${requestId}] 📊 Found 0 eligible users (trial ended, not converted)`,
      );
      return NextResponse.json({
        success: true,
        processed: 0,
        total: 0,
        dryRun: isDryRun,
        message: "No eligible users found",
      });
    }

    // Step 2: Filter to users who have active push tokens
    const userIds = endedSubscriptions.map((s) => s.userId);
    const usersWithTokens = await db
      .select({
        userId: pushTokens.userId,
        appId: pushTokens.appId,
      })
      .from(pushTokens)
      .where(
        and(inArray(pushTokens.userId, userIds), eq(pushTokens.isActive, true)),
      );

    // Create map of userId -> appId (from push tokens)
    const userAppMap = new Map();
    for (const ut of usersWithTokens) {
      if (!userAppMap.has(ut.userId)) {
        userAppMap.set(ut.userId, ut.appId);
      }
    }

    // Filter subscriptions to only those with push tokens
    const eligibleUsers = endedSubscriptions
      .filter((s) => userAppMap.has(s.userId))
      .map((s) => ({
        userId: s.userId,
        appId: userAppMap.get(s.userId) || s.appId,
      }));

    console.log(
      `[CRON ${requestId}] 📊 Found ${eligibleUsers.length} eligible users (trial ended, not converted)`,
    );

    if (eligibleUsers.length === 0) {
      return NextResponse.json({
        success: true,
        processed: 0,
        total: 0,
        dryRun: isDryRun,
        message: "No eligible users with push tokens found",
      });
    }

    // Check rate limits
    const usersWithRateLimitInfo = await Promise.all(
      eligibleUsers.map(async (userData) => {
        const rateLimit = await db
          .select()
          .from(notificationRateLimits)
          .where(
            and(
              eq(notificationRateLimits.userId, userData.userId),
              eq(notificationRateLimits.appId, userData.appId),
              eq(notificationRateLimits.date, today),
            ),
          )
          .limit(1);

        return {
          ...userData,
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
                  segment: "trial_ended",
                  notificationType: template.type,
                },
              },
            );

            // Log success
            await db.insert(cronNotificationLogs).values({
              userId: userData.userId,
              appId: userData.appId,
              segment: "trial_ended",
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
              segment: "trial_ended",
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
