import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger, Inject, Optional } from '@nestjs/common';
import { Job } from 'bullmq';
import { InMemoryEventBus } from './in-memory-event-bus';
import { EventHandlerRegistry, HandlerResult } from './event-handler.registry';
import {
  EventEnvelope,
  NotificationChannelType,
} from '../types/notification-event.types';
import { AnalyticsService } from '../../analytics/analytics.service';
import { DRIZZLE_TOKEN } from '../../../database/drizzle.module';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, sql } from 'drizzle-orm';
import * as schema from '../../../database/schema';

/**
 * Job data structure for delayed notification events
 */
export interface NotificationJobData {
  eventId: string;
  appId: string;
  userId: string;
  eventType: string;
  payload: Record<string, unknown>;
  channels: NotificationChannelType[];
  metadata?: Record<string, unknown>;
  scheduledFor: string; // ISO timestamp when the job should be processed
  createdAt: string;
}

/**
 * Job types supported by the notification queue
 */
export enum NotificationJobType {
  DELAYED_EVENT = 'delayed-event',
  CHECKOUT_ABANDONED = 'checkout-abandoned',
  SUBSCRIPTION_REMINDER = 'subscription-reminder',
}

/**
 * Queue name constant
 */
export const NOTIFICATION_QUEUE_NAME = 'notification-events';

/**
 * Notification Processor using @nestjs/bullmq WorkerHost pattern
 *
 * QUEUE-FIRST, HIGH-SCALE optimized:
 * - Event-type based routing via EventHandlerRegistry
 * - Special handling for delayed events (checkout-abandoned, etc.)
 * - Retry via BullMQ, DLQ tracking via Mixpanel
 * - NO DB writes - tracking via Mixpanel instead
 */
@Processor(NOTIFICATION_QUEUE_NAME, {
  concurrency: 5,
  limiter: {
    max: 100,
    duration: 1000,
  },
})
export class NotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(
    private readonly eventBus: InMemoryEventBus,
    private readonly handlerRegistry: EventHandlerRegistry,
    @Optional()
    private readonly analyticsService?: AnalyticsService,
    @Optional()
    @Inject(DRIZZLE_TOKEN)
    private readonly db?: NodePgDatabase<typeof schema>,
  ) {
    super();
  }

  // Simple in-memory metrics (can be replaced with Prometheus later)
  private metrics = {
    processed: 0,
    failed: 0,
    deadLetter: 0,
    byEventType: new Map<string, number>(),
  };

  /**
   * Main job processor method - called by BullMQ for each job
   */
  async process(job: Job<NotificationJobData>): Promise<void> {
    const data = job.data;
    const startTime = Date.now();

    this.logger.log(
      `🔄 [PROCESSING] Job ${job.id} | Type: ${data.eventType} | User: ${data.userId}`,
    );
    this.logger.debug(`   Job data: ${JSON.stringify(data, null, 2)}`);

    // Check retry count - route to DLQ if max retries exceeded
    const MAX_RETRIES = 3;
    if (job.attemptsMade > MAX_RETRIES) {
      this.logger.error(
        `💀 [DLQ] Max retries (${MAX_RETRIES}) exceeded for event ${data.eventId}`,
      );
      this.trackToMixpanel(data.appId, 'notification_event_dlq', {
        eventId: data.eventId,
        eventType: data.eventType,
        userId: data.userId,
        reason: `Max retries exceeded after ${job.attemptsMade} attempts`,
      });
      this.metrics.deadLetter++;
      return; // Don't throw - don't retry anymore
    }

    // Track processing start to Mixpanel
    this.trackToMixpanel(data.appId, 'notification_event_processing', {
      eventId: data.eventId,
      eventType: data.eventType,
      userId: data.userId,
      attempt: job.attemptsMade + 1,
    });

    try {
      // Special handling for checkout-abandoned events (premium check)
      if (
        data.eventType === (NotificationJobType.CHECKOUT_ABANDONED as string)
      ) {
        await this.handleCheckoutAbandoned(job);
      } else {
        // All other events go through the handler registry
        await this.handleEventWithRegistry(job);
      }

      // Success metrics
      this.metrics.processed++;
      const count = this.metrics.byEventType.get(data.eventType) || 0;
      this.metrics.byEventType.set(data.eventType, count + 1);

      // Track success to Mixpanel
      this.trackToMixpanel(data.appId, 'notification_event_completed', {
        eventId: data.eventId,
        eventType: data.eventType,
        userId: data.userId,
        durationMs: Date.now() - startTime,
        channels: data.channels,
      });

      this.logger.log(
        `✅ [SUCCESS] Job ${job.id} processed in ${Date.now() - startTime}ms`,
      );
    } catch (error) {
      this.metrics.failed++;
      this.logger.error(
        `❌ [FAILED] Job ${job.id} failed: ${(error as Error).message}`,
      );

      // Track failure to Mixpanel
      this.trackToMixpanel(data.appId, 'notification_event_failed', {
        eventId: data.eventId,
        eventType: data.eventType,
        userId: data.userId,
        error: (error as Error).message,
        attempt: job.attemptsMade + 1,
      });

      // Check if we should route to DLQ
      if (job.attemptsMade >= MAX_RETRIES) {
        this.trackToMixpanel(data.appId, 'notification_event_dlq', {
          eventId: data.eventId,
          eventType: data.eventType,
          userId: data.userId,
          reason: `Failed after ${job.attemptsMade} attempts: ${(error as Error).message}`,
        });
        this.metrics.deadLetter++;
      }

      throw error; // Let BullMQ handle retry
    }
  }

  /**
   * Handle event using the EventHandlerRegistry
   * This enables different processing logic per event type
   */
  private async handleEventWithRegistry(
    job: Job<NotificationJobData>,
  ): Promise<void> {
    const data = job.data;

    // Build event envelope
    const envelope: EventEnvelope = {
      eventId: data.eventId,
      appId: data.appId,
      userId: data.userId,
      eventType: data.eventType,
      payload: data.payload,
      channels: data.channels,
      createdAt: new Date(data.createdAt),
      metadata: {
        ...data.metadata,
        processedAt: new Date().toISOString(),
        delayed: true,
        scheduledFor: data.scheduledFor,
        jobId: job.id,
      },
    };

    // Process through handler registry (custom logic per event type)
    const handlerResult: HandlerResult =
      await this.handlerRegistry.processEvent(envelope);

    if (!handlerResult.success) {
      this.logger.warn(
        `⚠️  [HANDLER] Event ${data.eventId} handler returned failure: ${handlerResult.detail}`,
      );

      if (handlerResult.shouldRetry) {
        throw new Error(handlerResult.detail || 'Handler failed with retry');
      }
      // Non-retryable failure - still try to send notification
    }

    // Send through notification channels
    await this.sendNotification(job);
  }

  /**
   * Handle checkout abandoned event
   * Checks if user is premium before sending notification
   */
  private async handleCheckoutAbandoned(
    job: Job<NotificationJobData>,
  ): Promise<void> {
    const data = job.data;

    this.logger.log(
      `🔍 [PREMIUM CHECK] Checking premium status for user ${data.userId}`,
    );

    const isPremium = await this.checkUserPremiumStatus(
      data.userId,
      data.appId,
    );

    if (isPremium) {
      this.logger.log(
        `⏭️  [SKIPPED] User ${data.userId} is already premium - skipping notification`,
      );
      this.trackToMixpanel(data.appId, 'notification_event_skipped', {
        eventId: data.eventId,
        eventType: data.eventType,
        userId: data.userId,
        reason: 'User is premium',
      });
      return;
    }

    this.logger.log(
      `✅ [PREMIUM CHECK] User ${data.userId} is NOT premium - proceeding with notification`,
    );

    await this.sendNotification(job);
  }

  /**
   * Send notification through configured channels
   */
  private async sendNotification(job: Job<NotificationJobData>): Promise<void> {
    const data = job.data;

    // Build event envelope
    const envelope: EventEnvelope = {
      eventId: data.eventId,
      appId: data.appId,
      userId: data.userId,
      eventType: data.eventType,
      payload: data.payload,
      channels: data.channels,
      createdAt: new Date(data.createdAt),
      metadata: {
        ...data.metadata,
        processedAt: new Date().toISOString(),
        delayed: true,
        scheduledFor: data.scheduledFor,
        jobId: job.id,
      },
    };

    this.logger.log(
      `📤 [SENDING] Sending notification via channels: ${data.channels.join(', ')}`,
    );

    // Send through event bus
    const results = await this.eventBus.publish(envelope);

    // Check results
    const allSucceeded = results.every((r) => r.delivered);
    const failedChannels = results
      .filter((r) => !r.delivered)
      .map((r) => r.channel);

    if (allSucceeded) {
      this.trackToMixpanel(data.appId, 'notification_event_delivered', {
        eventId: data.eventId,
        eventType: data.eventType,
        userId: data.userId,
        channels: data.channels,
      });
      this.logger.log(
        `✅ [COMPLETED] Event ${data.eventId} delivered to all channels`,
      );
    } else {
      this.trackToMixpanel(data.appId, 'notification_event_partial', {
        eventId: data.eventId,
        eventType: data.eventType,
        userId: data.userId,
        failedChannels,
      });
      this.logger.warn(
        `⚠️  [PARTIAL] Event ${data.eventId} completed with failures: ${failedChannels.join(', ')}`,
      );
    }
  }

  /**
   * Check if user has premium/active subscription
   * Returns false if DB not available or on error (fail-safe)
   */
  private async checkUserPremiumStatus(
    userId: string,
    appId: string,
  ): Promise<boolean> {
    // If no DB available, skip premium check (assume not premium)
    if (!this.db) {
      this.logger.debug(`DB not available - skipping premium check for user ${userId}`);
      return false;
    }

    try {
      const subscriptions = await this.db
        .select()
        .from(schema.subscriptions)
        .where(
          sql`${schema.subscriptions.userId} = ${userId} AND ${schema.subscriptions.appId} = ${appId}`,
        )
        .limit(1);

      if (subscriptions.length === 0) {
        this.logger.debug(`No subscription found for user ${userId}`);
        return false;
      }

      const sub = subscriptions[0];
      const activeStatuses = ['active', 'authenticated'];
      const isPremium = activeStatuses.includes(sub.status);

      this.logger.debug(
        `Subscription found: status=${sub.status}, isPremium=${isPremium}`,
      );

      return isPremium;
    } catch (error) {
      this.logger.error(
        `Error checking premium status for user ${userId}: ${(error as Error).message}`,
      );
      return false;
    }
  }

  /**
   * Track event to Mixpanel (non-blocking, fire-and-forget)
   * Used instead of DB writes for high-scale tracking
   */
  private trackToMixpanel(
    appId: string,
    eventName: string,
    properties: Record<string, unknown>,
  ): void {
    if (!this.analyticsService) return;

    try {
      // Convert unknown values to string | number | boolean | undefined for EventProperties
      const eventProps: Record<string, string | number | boolean | undefined> = {};
      for (const [key, value] of Object.entries(properties)) {
        if (value === undefined || value === null) {
          eventProps[key] = undefined;
        } else if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
          eventProps[key] = value;
        } else {
          eventProps[key] = JSON.stringify(value);
        }
      }

      this.analyticsService
        .sendEvent({
          eventName,
          appId,
          userData: {
            userId: properties.userId as string | undefined,
          },
          eventProperties: eventProps,
        })
        .catch((err) => {
          this.logger.debug(`Mixpanel track failed (non-critical): ${err.message}`);
        });
    } catch (error) {
      this.logger.debug(`Mixpanel track error: ${(error as Error).message}`);
    }
  }

  /**
   * Worker event handlers
   */
  @OnWorkerEvent('completed')
  onCompleted(job: Job<NotificationJobData>) {
    this.logger.log(
      `🎉 [WORKER] Job ${job.id} (${job.name}) marked as completed`,
    );
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<NotificationJobData>, error: Error) {
    this.logger.error(
      `💥 [WORKER] Job ${job?.id} (${job?.name}) failed: ${error.message}`,
    );
  }

  @OnWorkerEvent('error')
  onError(error: Error) {
    this.logger.error(`🔥 [WORKER] Worker error: ${error.message}`);
  }

  @OnWorkerEvent('active')
  onActive(job: Job<NotificationJobData>) {
    this.logger.debug(`⏳ [WORKER] Job ${job.id} is now active`);
  }

  @OnWorkerEvent('progress')
  onProgress(job: Job<NotificationJobData>, progress: number) {
    this.logger.debug(`📊 [WORKER] Job ${job.id} progress: ${progress}%`);
  }

  /**
   * Get processor metrics (for monitoring/debugging)
   */
  getMetrics() {
    return {
      processed: this.metrics.processed,
      failed: this.metrics.failed,
      deadLetter: this.metrics.deadLetter,
      byEventType: Object.fromEntries(this.metrics.byEventType),
    };
  }
}
