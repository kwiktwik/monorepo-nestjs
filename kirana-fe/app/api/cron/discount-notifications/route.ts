import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { abandonedCheckouts, orders, subscriptions, phonepeSubscriptions } from "@/db/schema";
import { eq, and, isNotNull, lte, or, notExists, gt, inArray } from "drizzle-orm";
import { NotificationService } from "@/lib/services/notification-service";
import { ORDER_STATUS } from "@/lib/constants/order-status";

// Secret for authenticating cron requests
const CRON_SECRET = process.env.CRON_SECRET || "";

// Notification schedule: minutes after checkout
const NOTIFICATION_SCHEDULE = [
  { afterMinutes: 30, title: "Special Offer!", body: "Complete your purchase at a special price - 50% off!" },
  { afterMinutes: 12 * 60, title: "Don't Miss Out!", body: "Your 50% off special discount is still waiting for you!" },
  { afterMinutes: 23 * 60, title: "Last Chance!", body: "Only 1 hour left! Your 50% off offer expires soon. Grab it now!" },
];

const MAX_NOTIFICATIONS = 3;

/*
  UNDERSTANDING: Equivalent SQL for what this cron does
  -----------------------------------------------
  1) Find abandoned checkouts eligible for notification:
  
  SELECT * FROM abandoned_checkouts
  WHERE checkout_started_at IS NOT NULL
    AND (offer_expires_at IS NULL OR offer_expires_at > NOW())
    AND notifications_sent < 3
    AND (next_notification_scheduled_at IS NULL OR next_notification_scheduled_at <= NOW());

  2) For each eligible checkout:
     - Send push notification based on notification schedule
     - Update notifications_sent count
     - Calculate and set next_notification_scheduled_at
*/

/**
 * Cron endpoint to send discount notifications to users who abandoned checkout.
 * 
 * Notification schedule:
 * - 30 mins after checkout: "Complete your purchase at special price!"
 * - 12 hours after checkout: "Your special discount offer is waiting!"
 * - 23 hours after checkout: "Last chance! Offer expires in 1 hour"
 * 
 * Runs every 15-30 minutes to check if notifications need to be sent.
 * Each user gets max 3 notifications.
 * 
 * Authentication: Requires Authorization header with Bearer token matching CRON_SECRET
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = `cron-discount-${Date.now()}`;

  try {
    console.log(`\n${"=".repeat(80)}`);
    console.log(`[CRON ${requestId}] 🕐 Discount notifications cron started at ${new Date().toISOString()}`);

    // Validate authentication
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!CRON_SECRET || token !== CRON_SECRET) {
      console.error(`[CRON ${requestId}] ❌ Unauthorized access attempt`);
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    console.log(`[CRON ${requestId}] ✅ Authentication successful`);

    // Check if dry run mode
    const { searchParams } = new URL(request.url);
    const isDryRun = searchParams.get("dryRun") === "true";
    if (isDryRun) {
      console.log(`[CRON ${requestId}] 🧪 DRY RUN MODE - No notifications will be sent`);
    }

    const now = new Date();

    // Find eligible abandoned checkouts for notifications
    // Conditions:
    // 1. checkout_started_at exists
    // 2. notifications_sent < 3 (max notifications)
    // 3. next_notification_scheduled_at <= now (time to send) or not scheduled yet
    // 4. Exclude premium users (captured order, active subscription, active phonepe subscription)

    // Helper to check equivalent app IDs in SQL
    type AppIdColumn =
      | typeof abandonedCheckouts.appId
      | typeof orders.appId
      | typeof subscriptions.appId
      | typeof phonepeSubscriptions.appId;

    const isEquivalentAppId = (targetAppIdCol: AppIdColumn, sourceAppIdCol: AppIdColumn) => or(
      eq(targetAppIdCol, sourceAppIdCol),
      and(
        inArray(targetAppIdCol, ['alertpay-default', 'alertpay-android']),
        inArray(sourceAppIdCol, ['alertpay-default', 'alertpay-android'])
      )
    );

    const eligibleCheckouts = await db
      .select()
      .from(abandonedCheckouts)
      .where(
        and(
          isNotNull(abandonedCheckouts.checkoutStartedAt),
          lte(abandonedCheckouts.notificationsSent, MAX_NOTIFICATIONS - 1),
          or(
            isNotNull(abandonedCheckouts.nextNotificationScheduledAt),
            isNotNull(abandonedCheckouts.checkoutStartedAt)
          ),

          // Exclusion 1: No captured order for same user & equivalent app
          notExists(
            db.select().from(orders).where(
              and(
                eq(orders.userId, abandonedCheckouts.userId),
                isEquivalentAppId(orders.appId, abandonedCheckouts.appId),
                eq(orders.status, ORDER_STATUS.CAPTURED)
              )
            )
          ),

          // Exclusion 2: No active subscription for same user & equivalent app
          notExists(
            db.select().from(subscriptions).where(
              and(
                eq(subscriptions.userId, abandonedCheckouts.userId),
                isEquivalentAppId(subscriptions.appId, abandonedCheckouts.appId),
                or(
                  eq(subscriptions.status, ORDER_STATUS.ACTIVE),
                  and(
                    eq(subscriptions.status, ORDER_STATUS.CANCELLED),
                    isNotNull(subscriptions.endAt),
                    gt(subscriptions.endAt, now)
                  )
                )
              )
            )
          ),

          // Exclusion 3: No active PhonePe subscription
          notExists(
            db.select().from(phonepeSubscriptions).where(
              and(
                eq(phonepeSubscriptions.userId, abandonedCheckouts.userId),
                isEquivalentAppId(phonepeSubscriptions.appId, abandonedCheckouts.appId),
                eq(phonepeSubscriptions.state, "ACTIVE")
              )
            )
          )
        )
      );

    // Filter for those who are due for notification
    const dueCheckouts = eligibleCheckouts.filter(checkout => {
      // Check if offer has expired
      let offerExpired = false;
      if (checkout.offerExpiresAt) {
        offerExpired = now > checkout.offerExpiresAt;
      } else if (checkout.checkoutStartedAt) {
        // Calculate: checkoutStartedAt + 30 mins + 24 hours
        const calculatedExpiry = new Date(
          checkout.checkoutStartedAt.getTime() + 30 * 60 * 1000 + 24 * 60 * 60 * 1000
        );
        offerExpired = now > calculatedExpiry;
      }

      if (offerExpired) return false;

      // Check if it's time to send notification
      if (checkout.nextNotificationScheduledAt) {
        return now >= checkout.nextNotificationScheduledAt;
      }

      // If no next notification scheduled, calculate when to send first one
      if (checkout.checkoutStartedAt) {
        const firstNotificationTime = new Date(
          checkout.checkoutStartedAt.getTime() + NOTIFICATION_SCHEDULE[0].afterMinutes * 60 * 1000
        );
        return now >= firstNotificationTime;
      }

      return false;
    });

    console.log(`[CRON ${requestId}] 📊 Found ${eligibleCheckouts.length} eligible checkouts, ${dueCheckouts.length} due for notification`);

    if (dueCheckouts.length === 0) {
      const processingTime = Date.now() - startTime;
      console.log(`[CRON ${requestId}] ✅ No due notifications. Completed in ${processingTime}ms`);
      console.log(`${"=".repeat(80)}\n`);

      return NextResponse.json({
        success: true,
        processed: 0,
        total: 0,
        dryRun: isDryRun,
        message: "No due notifications found",
      });
    }

    // Setup batching to prevent serverless function timeouts
    const BATCH_SIZE = 100;

    // Process each checkout
    let processed = 0;
    let failed = 0;
    let sent = 0;

    for (let i = 0; i < dueCheckouts.length; i += BATCH_SIZE) {
      const batch = dueCheckouts.slice(i, i + BATCH_SIZE);
      console.log(`[CRON ${requestId}] 📦 Processing batch ${Math.floor(i / BATCH_SIZE) + 1} of ${Math.ceil(dueCheckouts.length / BATCH_SIZE)} (${batch.length} checkouts)`);

      // Collect DB update payloads for successful notifications; flushed in one
      // transaction at the end of each batch instead of one query per checkout.
      type UpdatePayload = {
        id: number;
        notificationsSent: number;
        nextNotificationScheduledAt: Date | null;
      };
      const pendingUpdates: UpdatePayload[] = [];

      await Promise.allSettled(batch.map(async (checkout) => {
        try {
          console.log(`[CRON ${requestId}] 🔄 Processing checkout ${checkout.id} for user ${checkout.userId}...`);

          const notificationsSent = checkout.notificationsSent || 0;

          // Get the next notification in schedule
          const notificationConfig = NOTIFICATION_SCHEDULE[notificationsSent];

          if (!notificationConfig) {
            console.log(`[CRON ${requestId}] ⏭️  Max notifications reached for checkout ${checkout.id}, skipping`);
            return;
          }

          console.log(`[CRON ${requestId}] 📤 Sending notification #${notificationsSent + 1} to user ${checkout.userId}`);

          if (!isDryRun) {
            try {
              // Send push notification
              await NotificationService.sendToUser(
                checkout.userId,
                checkout.appId,
                {
                  title: notificationConfig.title,
                  body: notificationConfig.body,
                  data: {
                    type: "discount_offer",
                    checkoutId: checkout.id.toString(),
                    action: "open_subscription",
                  },
                }
              );

              sent++;
              console.log(`[CRON ${requestId}] ✅ Notification sent successfully to user ${checkout.userId}`);

              const newNotificationsSent = notificationsSent + 1;
              let nextNotificationTime: Date | null = null;

              if (newNotificationsSent < MAX_NOTIFICATIONS && checkout.checkoutStartedAt) {
                nextNotificationTime = new Date(
                  checkout.checkoutStartedAt.getTime() +
                  NOTIFICATION_SCHEDULE[newNotificationsSent].afterMinutes * 60 * 1000
                );
              }

              // Queue for batch DB update instead of updating immediately
              pendingUpdates.push({
                id: checkout.id,
                notificationsSent: newNotificationsSent,
                nextNotificationScheduledAt: nextNotificationTime,
              });

            } catch (notificationError) {
              const isNoTokens =
                notificationError instanceof Error &&
                notificationError.message.includes("No active push tokens found");
              if (isNoTokens) {
                console.log(`[CRON ${requestId}] ⏭️  Skipping user ${checkout.userId}: no push tokens`);
              } else {
                failed++;
                console.error(`[CRON ${requestId}] ❌ Failed to send notification to user ${checkout.userId}:`, notificationError);
              }
            }
          } else {
            console.log(`[CRON ${requestId}] 🧪 DRY RUN - Would have sent notification to user ${checkout.userId}`);
            sent++;
          }

          processed++;

        } catch (error) {
          failed++;
          console.error(`[CRON ${requestId}] ❌ Failed to process checkout ${checkout.id}:`, error);
        }
      }));

      // Flush all DB updates for this batch in a single transaction
      if (pendingUpdates.length > 0) {
        console.log(`[CRON ${requestId}] 💾 Flushing ${pendingUpdates.length} DB update(s) in one transaction`);
        await db.transaction(async (tx) => {
          await Promise.all(pendingUpdates.map((u) =>
            tx
              .update(abandonedCheckouts)
              .set({
                notificationsSent: u.notificationsSent,
                lastNotificationSentAt: now,
                nextNotificationScheduledAt: u.nextNotificationScheduledAt,
                discountNotificationSent: true,
                discountNotificationSentAt: now,
              })
              .where(eq(abandonedCheckouts.id, u.id))
          ));
        });
        console.log(`[CRON ${requestId}] ✅ DB batch update committed for ${pendingUpdates.length} checkout(s)`);
      }
    }

    const processingTime = Date.now() - startTime;
    console.log(`[CRON ${requestId}] 📊 Summary:`, {
      total: dueCheckouts.length,
      processed,
      sent,
      failed,
      dryRun: isDryRun,
      processingTimeMs: processingTime,
    });
    console.log(`[CRON ${requestId}] ✅ Cron job completed in ${processingTime}ms`);
    console.log(`${"=".repeat(80)}\n`);

    return NextResponse.json({
      success: true,
      total: dueCheckouts.length,
      processed,
      sent,
      failed,
      dryRun: isDryRun,
      processingTimeMs: processingTime,
      message: `Processed ${processed} checkout(s), sent ${sent} notifications`,
    });

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`[CRON ${requestId}] ❌ Cron job error after ${processingTime}ms:`, error);
    console.log(`${"=".repeat(80)}\n`);

    return NextResponse.json(
      {
        error: "Cron job processing failed",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
