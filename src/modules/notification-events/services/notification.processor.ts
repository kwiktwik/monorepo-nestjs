import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger, Inject } from '@nestjs/common';
import { Job } from 'bullmq';
import { InMemoryEventBus } from './in-memory-event-bus';
import {
  EventEnvelope,
  NotificationChannelType,
} from '../types/notification-event.types';
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
 * This processor handles delayed notification events, including:
 * - Checkout abandoned checks
 * - Subscription reminders
 * - Any other delayed notification events
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
    @Inject(DRIZZLE_TOKEN)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {
    super();
  }

  /**
   * Main job processor method - called by BullMQ for each job
   */
  async process(job: Job<NotificationJobData>): Promise<void> {
    const data = job.data;

    this.logger.log(
      `🔄 [PROCESSING] Job ${job.id} | Type: ${data.eventType} | User: ${data.userId}`,
    );
    this.logger.debug(`   Job data: ${JSON.stringify(data, null, 2)}`);

    // Update event status in database (if exists)
    await this.updateEventStatus(data.eventId, 'PROCESSING');

    try {
      // Special handling for checkout-abandoned events
      if (data.eventType === NotificationJobType.CHECKOUT_ABANDONED) {
        await this.handleCheckoutAbandoned(job);
        return;
      }

      // Default handling for other event types
      await this.sendNotification(job);
    } catch (error) {
      this.logger.error(
        `❌ [FAILED] Job ${job.id} failed: ${(error as Error).message}`,
      );
      await this.updateEventStatus(
        data.eventId,
        'FAILED',
        (error as Error).message,
      );
      throw error;
    }
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
      await this.updateEventStatus(
        data.eventId,
        'COMPLETED',
        'User is premium, skipped',
      );
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
      await this.updateEventStatus(data.eventId, 'COMPLETED');
      this.logger.log(
        `✅ [COMPLETED] Event ${data.eventId} delivered to all channels`,
      );
    } else {
      await this.updateEventStatus(
        data.eventId,
        'COMPLETED',
        `Partial delivery - failed: ${failedChannels.join(', ')}`,
      );
      this.logger.warn(
        `⚠️  [PARTIAL] Event ${data.eventId} completed with failures: ${failedChannels.join(', ')}`,
      );
    }
  }

  /**
   * Check if user has premium/active subscription
   */
  private async checkUserPremiumStatus(
    userId: string,
    appId: string,
  ): Promise<boolean> {
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
   * Update event status in database (optional - event may not exist for delayed jobs)
   */
  private async updateEventStatus(
    eventId: string,
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED',
    detail?: string,
  ): Promise<void> {
    try {
      const updateData: Record<string, unknown> = {
        status,
        processedAt: new Date(),
      };

      if (status === 'FAILED') {
        updateData.retryCount = sql`${schema.notificationEvents.retryCount} + 1`;
      }

      await this.db
        .update(schema.notificationEvents)
        .set(updateData)
        .where(eq(schema.notificationEvents.id, eventId));

      this.logger.debug(`Updated event ${eventId} status to ${status}`);
    } catch (error) {
      // Event might not exist in DB for delayed jobs, that's okay
      this.logger.debug(
        `Could not update event ${eventId} status: ${(error as Error).message}`,
      );
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
}
