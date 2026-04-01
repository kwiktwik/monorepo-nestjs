import { Injectable, Logger, Inject } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { eq, and, lte, gte, isNotNull } from 'drizzle-orm';
import { DRIZZLE_TOKEN } from '../../../database/drizzle.module';
import * as schema from '../../../database/schema';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { AnalyticsService } from '../../analytics/analytics.service';
import { ANALYTICS_EVENTS } from '../../analytics/analytics.constants';

interface EligibleSubscription {
  id: string;
  razorpaySubscriptionId: string | null;
  razorpayPlanId: string | null;
  userId: string;
  appId: string;
  customerId: string;
  status: string;
  createdAt: Date;
  userEmail: string | null;
  userPhone: string | null;
  userName: string | null;
}

/**
 * Scheduler service that sends analytics events for subscriptions
 * that have not been cancelled within 4 hours of creation.
 * 
 * This service runs every hour and processes eligible subscriptions
 * that meet the following criteria:
 * - Status is 'active'
 * - Created at least 4 hours ago (user did not cancel within 4h)
 * - Created no more than 24 hours ago (to avoid historical data spike)
 * - fourHourEventSent flag is false (event not yet sent)
 * - Has a valid Razorpay subscription ID
 * 
 * Each subscription is processed only once (lifetime) using the
 * fourHourEventSent flag as an idempotency check.
 */
@Injectable()
export class FourHourEventSchedulerService {
  private readonly logger = new Logger(FourHourEventSchedulerService.name);
  private readonly BATCH_SIZE = 100;

  constructor(
    @Inject(DRIZZLE_TOKEN)
    private readonly db: NodePgDatabase<typeof schema>,
    private readonly analyticsService: AnalyticsService,
  ) {}

  /**
   * Cron job that runs every hour to check for eligible subscriptions
   * and send the trial_not_cancel_in_4_hour analytics event.
   * 
   * Eligibility criteria:
   * - Status = 'active'
   * - Created at least 4 hours ago
   * - Created within last 24 hours
   * - fourHourEventSent = false
   * - Has razorpaySubscriptionId
   */
  @Cron(CronExpression.EVERY_HOUR)
  async processFourHourEvents(): Promise<void> {
    const startTime = Date.now();
    const requestId = `4h-cron-${Date.now()}`;

    this.logger.log(`[${requestId}] 🕐 Starting 4-hour event processing cron`);

    try {
      const eligibleSubscriptions = await this.findEligibleSubscriptions();

      this.logger.log(
        `[${requestId}] 📊 Found ${eligibleSubscriptions.length} eligible subscription(s) for 4-hour event`,
      );

      if (eligibleSubscriptions.length === 0) {
        this.logger.log(`[${requestId}] ✅ No eligible subscriptions found`);
        return;
      }

      // Process in batches to avoid overwhelming the analytics service
      let processed = 0;
      let failed = 0;

      for (let i = 0; i < eligibleSubscriptions.length; i += this.BATCH_SIZE) {
        const batch = eligibleSubscriptions.slice(i, i + this.BATCH_SIZE);
        const batchNumber = Math.floor(i / this.BATCH_SIZE) + 1;
        const totalBatches = Math.ceil(eligibleSubscriptions.length / this.BATCH_SIZE);

        this.logger.log(
          `[${requestId}] 🔄 Processing batch ${batchNumber}/${totalBatches} (${batch.length} subscriptions)`,
        );

        for (const subscription of batch) {
          try {
            await this.processSubscription(subscription, requestId);
            processed++;
          } catch (error) {
            failed++;
            this.logger.error(
              `[${requestId}] ❌ Failed to process subscription ${subscription.razorpaySubscriptionId}:`,
              error,
            );
            // Continue processing other subscriptions even if one fails
          }
        }

        // Small delay between batches to prevent rate limiting
        if (i + this.BATCH_SIZE < eligibleSubscriptions.length) {
          await this.delay(1000);
        }
      }

      const processingTime = Date.now() - startTime;
      this.logger.log(`[${requestId}] ✅ Cron completed:`, {
        total: eligibleSubscriptions.length,
        processed,
        failed,
        processingTimeMs: processingTime,
      });
    } catch (error) {
      this.logger.error(`[${requestId}] ❌ Cron job failed:`, error);
      throw error;
    }
  }

  /**
   * Find eligible subscriptions for the 4-hour event.
   * 
   * Criteria:
   * - Status is 'active'
   * - Created at least 4 hours ago (lte comparison)
   * - Created no more than 24 hours ago (gte comparison)
   * - fourHourEventSent is false
   * - Has a valid Razorpay subscription ID
   */
  private async findEligibleSubscriptions(): Promise<EligibleSubscription[]> {
    const now = new Date();
    const fourHoursAgo = new Date(now.getTime() - 4 * 60 * 60 * 1000);
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    this.logger.debug('Querying for eligible subscriptions:', {
      fourHoursAgo: fourHoursAgo.toISOString(),
      twentyFourHoursAgo: twentyFourHoursAgo.toISOString(),
      now: now.toISOString(),
    });

    const results = await this.db
      .select({
        id: schema.subscriptions.id,
        razorpaySubscriptionId: schema.subscriptions.razorpaySubscriptionId,
        razorpayPlanId: schema.subscriptions.razorpayPlanId,
        userId: schema.subscriptions.userId,
        appId: schema.subscriptions.appId,
        customerId: schema.subscriptions.customerId,
        status: schema.subscriptions.status,
        createdAt: schema.subscriptions.createdAt,
        userEmail: schema.user.email,
        userPhone: schema.user.phoneNumber,
        userName: schema.user.name,
      })
      .from(schema.subscriptions)
      .leftJoin(schema.user, eq(schema.subscriptions.userId, schema.user.id))
      .where(
        and(
          eq(schema.subscriptions.status, 'active'),
          // Created at least 4 hours ago (user did not cancel within 4h)
          lte(schema.subscriptions.createdAt, fourHoursAgo),
          // Created no more than 24 hours ago (to avoid historical data spike)
          gte(schema.subscriptions.createdAt, twentyFourHoursAgo),
          // Fire only once per subscription (lifetime)
          eq(schema.subscriptions.fourHourEventSent, false),
          // Only process rows with valid Razorpay subscription ID
          isNotNull(schema.subscriptions.razorpaySubscriptionId),
        ),
      );

    return results;
  }

  /**
   * Process a single subscription and send the analytics event.
   * 
   * Steps:
   * 1. Validate user data exists
   * 2. Prepare user info and event properties
   * 3. Send analytics event via AnalyticsService
   * 4. Mark subscription as processed (fourHourEventSent = true)
   */
  private async processSubscription(
    subscription: EligibleSubscription,
    requestId: string,
  ): Promise<void> {
    const subId = subscription.razorpaySubscriptionId;

    this.logger.debug(`[${requestId}] 🔄 Processing subscription ${subId}`, {
      userId: subscription.userId,
      appId: subscription.appId,
      createdAt: subscription.createdAt.toISOString(),
    });

    // Check if user data exists (from JOIN) - required to fire the event
    if (!subscription.userEmail) {
      this.logger.warn(
        `[${requestId}] ⚠️ User email not found for userId: ${subscription.userId} - skipping`,
      );
      return;
    }

    // Prepare user info from joined data
    const nameParts = subscription.userName?.split(' ') ?? [];
    const userInfo = {
      userId: subscription.userId,
      email: subscription.userEmail,
      phone: subscription.userPhone ?? undefined,
      firstName: nameParts[0] ?? undefined,
      lastName: nameParts.slice(1).join(' ') || undefined,
    };

    // Event properties for analytics
    const eventProperties = {
      subscription_id: subscription.razorpaySubscriptionId ?? undefined,
      plan_id: subscription.razorpayPlanId ?? undefined,
      app_id: subscription.appId ?? undefined,
      customer_id: subscription.customerId ?? undefined,
      status: subscription.status ?? undefined,
      hours_since_creation: 4,
    };

    // Facebook Conversion API custom data
    const facebookCustomData = {
      subscription_id: subscription.razorpaySubscriptionId ?? undefined,
      customer_id: subscription.customerId ?? undefined,
    };

    // Use razorpaySubscriptionId as deduplication key
    const deduplicationId = subscription.razorpaySubscriptionId || `sub-4h-${subscription.id}`;

    this.logger.debug(`[${requestId}] 📤 Sending ${ANALYTICS_EVENTS.SUBSCRIPTION_NOT_CANCELLED_4H} event`, {
      subscriptionId: subId,
      userId: subscription.userId,
    });

    // Send analytics event
    const response = await this.analyticsService.sendEvent({
      eventName: ANALYTICS_EVENTS.SUBSCRIPTION_NOT_CANCELLED_4H,
      userData: userInfo,
      eventProperties,
      facebookCustomData,
      appId: subscription.appId,
      deduplicationId,
    });

    if (response.overallSuccess) {
      this.logger.log(`[${requestId}] ✅ Event sent successfully for ${subId}`);

      // Mark as sent once per subscription (lifetime)
      await this.markEventAsSent(subscription);

      this.logger.log(
        `[${requestId}] ✅ Database updated for subscription ${subId} - fourHourEventSent = true`,
      );
    } else {
      // Log failure details but don't update flag - will retry next run
      const failures = response.results
        .filter((r) => !r.success)
        .map((r) => `${r.provider}: ${r.error}`)
        .join(', ');

      this.logger.warn(
        `[${requestId}] ⚠️ Event send failed for ${subId} - will retry next run. Failures: ${failures}`,
      );
    }
  }

  /**
   * Mark the subscription as having the 4-hour event sent.
   * This ensures the event is only sent once per subscription (lifetime).
   */
  private async markEventAsSent(subscription: EligibleSubscription): Promise<void> {
    if (!subscription.razorpaySubscriptionId) {
      this.logger.warn('Missing razorpaySubscriptionId - skipping DB update');
      return;
    }

    await this.db
      .update(schema.subscriptions)
      .set({
        fourHourEventSent: true,
        updatedAt: new Date(),
      })
      .where(
        eq(
          schema.subscriptions.razorpaySubscriptionId,
          subscription.razorpaySubscriptionId,
        ),
      );
  }

  /**
   * Utility method to delay execution.
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
