import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { subscriptions, user } from "@/db/schema";
import { and, eq, lte, gte, isNotNull } from "drizzle-orm";
import { sendAnalyticsEvent } from "@/lib/events/server";
import { ANALYTICS_EVENTS } from "@/lib/events/constant";

// Secret for authenticating cron requests
const CRON_SECRET = process.env.CRON_SECRET || "";

/*
  UNDERSTANDING: Equivalent SQL for what this cron does
  -----------------------------------------------
  1) SELECT (find eligible subscriptions — active, created ≥4h ago, event not yet sent, has Razorpay id):

  SELECT
    s.id,
    s.razorpay_subscription_id AS "razorpaySubscriptionId",
    s.razorpay_plan_id AS "razorpayPlanId",
    s.user_id AS "userId",
    s.app_id AS "appId",
    s.customer_id AS "customerId",
    s.status,
    s.created_at AS "createdAt",
    u.email AS "userEmail",
    u."phoneNumber" AS "userPhone",
    u.name AS "userName"
  FROM subscriptions s
  LEFT JOIN "user" u ON s.user_id = u.id
  WHERE s.status = 'active'
    AND s.created_at <= :fourHoursAgo   -- created at least 4h ago (user did not cancel within 4h)
    AND s.four_hour_event_sent = false   -- fire only once per subscription (lifetime)
    AND s.razorpay_subscription_id IS NOT NULL;

  2) For each row (in code): if user has email → send analytics event, then:

  UPDATE subscriptions
  SET four_hour_event_sent = true,
      updated_at = NOW()
  WHERE razorpay_subscription_id = :razorpaySubscriptionId;
*/

/**
 * Cron endpoint to check for subscriptions that haven't been cancelled within 4 hours.
 * Fires the "trial not cancel in 4 hour" event only once per subscription (lifetime), keyed by Razorpay subscription id.
 * Should be called every hour by an external cron service.
 *
 * Eligibility: active subscription, created at least 4 hours ago (user did not cancel in 4h), event not yet sent.
 *
 * Authentication: Requires Authorization header with Bearer token matching CRON_SECRET
 *
 * Query parameters:
 * - dryRun: If "true", only logs what would be processed without sending events or updating DB
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = `cron-${Date.now()}`;

  try {
    console.log(`\n${"=".repeat(80)}`);
    console.log(`[CRON ${requestId}] 🕐 Check subscriptions started at ${new Date().toISOString()}`);

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
      console.log(`[CRON ${requestId}] 🧪 DRY RUN MODE - No events will be sent or database updated`);
    }

    // Time window: subscriptions created at least 4 hours ago (user did not cancel within 4h)
    const now = new Date();
    const fourHoursAgo = new Date(now.getTime() - 4 * 60 * 60 * 1000);
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    console.log(`[CRON ${requestId}] 🔍 Searching for subscriptions created between 24h and 4h ago:`, {
      createdAtAfterOrAt: twentyFourHoursAgo.toISOString(),
      createdAtBeforeOrAt: fourHoursAgo.toISOString(),
      now: now.toISOString(),
    });

    // Query for eligible subscriptions with user data (JOIN to avoid N+1 queries)
    // Only Razorpay subscription id is used for updates; event fires once per subscription (fourHourEventSent).
    const eligibleSubscriptions = await db
      .select({
        id: subscriptions.id,
        razorpaySubscriptionId: subscriptions.razorpaySubscriptionId,
        razorpayPlanId: subscriptions.razorpayPlanId,
        userId: subscriptions.userId,
        appId: subscriptions.appId,
        customerId: subscriptions.customerId,
        status: subscriptions.status,
        createdAt: subscriptions.createdAt,
        // User fields (joined)
        userEmail: user.email,
        userPhone: user.phoneNumber,
        userName: user.name,
      })
      .from(subscriptions)
      .leftJoin(user, eq(subscriptions.userId, user.id))
      .where(
        and(
          eq(subscriptions.status, "active"),
          // Created at least 4 hours ago...
          lte(subscriptions.createdAt, fourHoursAgo),
          // ...but no more than 24 hours ago (to avoid historical data spike)
          gte(subscriptions.createdAt, twentyFourHoursAgo),
          // Fire only once per subscription (lifetime)
          eq(subscriptions.fourHourEventSent, false),
          // Only process rows we can update by Razorpay subscription id
          isNotNull(subscriptions.razorpaySubscriptionId)
        )
      );

    console.log(`[CRON ${requestId}] 📊 Found ${eligibleSubscriptions.length} eligible subscription(s)`);

    if (eligibleSubscriptions.length === 0) {
      const processingTime = Date.now() - startTime;
      console.log(`[CRON ${requestId}] ✅ No eligible subscriptions found. Completed in ${processingTime}ms`);
      console.log(`${"=".repeat(80)}\n`);

      return NextResponse.json({
        success: true,
        processed: 0,
        total: 0,
        dryRun: isDryRun,
        message: "No eligible subscriptions found",
      });
    }

    // Process each subscription
    let processed = 0;
    let failed = 0;

    for (const subscription of eligibleSubscriptions) {
      try {
        console.log(`[CRON ${requestId}] 🔄 Processing subscription ${subscription.razorpaySubscriptionId}...`);
        console.log(`[CRON ${requestId}] 📋 Details:`, {
          id: subscription.id,
          userId: subscription.userId,
          appId: subscription.appId,
          status: subscription.status,
          createdAt: subscription.createdAt.toISOString(),
        });

        if (!isDryRun) {
          // Check if user data exists (from JOIN) — required to fire the event
          if (subscription.userEmail) {
            // Prepare user info from joined data
            const nameParts = subscription.userName?.split(" ") ?? [];
            const userInfo = {
              userId: subscription.userId,
              email: subscription.userEmail,
              phone: subscription.userPhone ?? undefined,
              firstName: nameParts[0] ?? undefined,
              lastName: nameParts.slice(1).join(" ") || undefined,
            };

            // Event properties for Firebase/Mixpanel (full context)
            const eventProperties = {
              subscription_id: subscription.razorpaySubscriptionId ?? undefined,
              plan_id: subscription.razorpayPlanId ?? undefined,
              app_id: subscription.appId ?? undefined,
              customer_id: subscription.customerId ?? undefined,
              status: subscription.status ?? undefined,
              hours_since_creation: 4,
            };

            // Facebook Conversion API custom data (subscription/customer identifiers)
            const facebookCustomData = {
              subscription_id: subscription.razorpaySubscriptionId ?? undefined,
              customer_id: subscription.customerId ?? undefined,
            };

            // Fire event to Firebase, Facebook, and Mixpanel
            console.log(`[CRON ${requestId}] 📤 Sending ${ANALYTICS_EVENTS.SUBSCRIPTION_NOT_CANCELLED_4H} event...`);

            // Use razorpaySubscriptionId as deduplication key to prevent duplicates on retry
            const deduplicationId = subscription.razorpaySubscriptionId || `sub-4h-${subscription.id}`;

            const eventSent = await sendAnalyticsEvent(
              ANALYTICS_EVENTS.SUBSCRIPTION_NOT_CANCELLED_4H,
              userInfo,
              eventProperties,
              facebookCustomData,
              subscription.appId ?? undefined,
              deduplicationId
            );

            if (eventSent) {
              console.log(`[CRON ${requestId}] ✅ Event sent successfully`);

              // Mark as sent once per subscription (lifetime); update only by Razorpay subscription id
              if (!subscription.razorpaySubscriptionId) {
                console.warn(`[CRON ${requestId}] ⚠️  Missing razorpaySubscriptionId — skipping DB update`);
              } else {
                await db
                  .update(subscriptions)
                  .set({
                    fourHourEventSent: true,
                    updatedAt: new Date(),
                  })
                  .where(eq(subscriptions.razorpaySubscriptionId, subscription.razorpaySubscriptionId));
                console.log(`[CRON ${requestId}] ✅ Database updated for subscription ${subscription.razorpaySubscriptionId} - fourHourEventSent = true (once in lifetime)`);
              }
            } else {
              console.warn(`[CRON ${requestId}] ⚠️  Event send failed for subscription ${subscription.razorpaySubscriptionId} — skipping DB update to RETRY next run`);
            }
          } else {
            console.warn(`[CRON ${requestId}] ⚠️  User not found for userId: ${subscription.userId} — skipping event and DB update (will retry next run)`);
          }
        } else {
          console.log(`[CRON ${requestId}] 🧪 DRY RUN - Would have sent event for subscription ${subscription.razorpaySubscriptionId}`);
        }

        processed++;
        console.log(`[CRON ${requestId}] ✅ Successfully processed subscription ${subscription.razorpaySubscriptionId}`);
      } catch (error) {
        failed++;
        console.error(`[CRON ${requestId}] ❌ Failed to process subscription ${subscription.razorpaySubscriptionId}:`, error);
        // Continue processing other subscriptions even if one fails
      }
    }

    const processingTime = Date.now() - startTime;
    console.log(`[CRON ${requestId}] 📊 Summary:`, {
      total: eligibleSubscriptions.length,
      processed,
      failed,
      dryRun: isDryRun,
      processingTimeMs: processingTime,
    });
    console.log(`[CRON ${requestId}] ✅ Cron job completed in ${processingTime}ms`);
    console.log(`${"=".repeat(80)}\n`);

    return NextResponse.json({
      success: true,
      total: eligibleSubscriptions.length,
      processed,
      failed,
      dryRun: isDryRun,
      processingTimeMs: processingTime,
      message: `Successfully processed ${processed} subscription(s)`,
    });
  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`[CRON ${requestId}] ❌ Cron job error after ${processingTime}ms:`, error);
    console.error(`[CRON ${requestId}] Stack trace:`, error instanceof Error ? error.stack : "No stack trace");
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
