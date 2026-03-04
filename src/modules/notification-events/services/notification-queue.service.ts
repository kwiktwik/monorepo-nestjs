import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { NotificationChannelType } from '../types/notification-event.types';
import { NotificationJobData, NotificationJobType, NOTIFICATION_QUEUE_NAME } from './notification.processor';

/**
 * Default delay for checkout abandoned checks (30 minutes)
 */
const DEFAULT_DELAY_MS = 30 * 60 * 1000;

/**
 * Service for scheduling delayed notification events
 * Uses BullMQ queue injected via @nestjs/bullmq
 */
@Injectable()
export class NotificationQueueService {
  private readonly logger = new Logger(NotificationQueueService.name);

  constructor(
    @InjectQueue(NOTIFICATION_QUEUE_NAME)
    private readonly notificationQueue: Queue<NotificationJobData>,
  ) {}

  /**
   * Schedule a delayed notification event
   * @param eventData The event data
   * @param delayMs Delay in milliseconds (default: 30 minutes)
   * @returns Job ID
   */
  async scheduleDelayedEvent(
    eventData: Omit<NotificationJobData, 'scheduledFor' | 'createdAt'>,
    delayMs: number = DEFAULT_DELAY_MS,
  ): Promise<string> {
    const now = new Date();
    const scheduledFor = new Date(now.getTime() + delayMs);

    const jobData: NotificationJobData = {
      ...eventData,
      scheduledFor: scheduledFor.toISOString(),
      createdAt: now.toISOString(),
    };

    const job = await this.notificationQueue.add(
      eventData.eventType,
      jobData,
      {
        delay: delayMs,
        jobId: `delayed-${eventData.eventId}-${Date.now()}`,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
        removeOnComplete: 100,
        removeOnFail: 50,
      },
    );

    this.logger.log(
      `📅 [SCHEDULED] Event: ${eventData.eventType} | User: ${eventData.userId} ` +
      `| Job: ${job.id} | Delay: ${delayMs}ms | Scheduled for: ${scheduledFor.toISOString()}`,
    );

    return job.id!;
  }

  /**
   * Schedule a checkout abandoned check
   * This will check if user is premium after the delay period
   * If not premium, send notification to complete purchase
   * 
   * @param userId User ID
   * @param appId App ID
   * @param checkoutData Checkout related data
   * @param delayMs Delay in milliseconds (default: 30 minutes)
   */
  async scheduleCheckoutAbandonedCheck(
    userId: string,
    appId: string,
    checkoutData: {
      orderId?: string;
      amount?: number;
      currency?: string;
      planName?: string;
    },
    delayMs: number = DEFAULT_DELAY_MS,
  ): Promise<string> {
    const eventId = `checkout-abandoned-${userId}-${Date.now()}`;
    
    this.logger.log(
      `🛒 [CHECKOUT] Scheduling abandoned check for user ${userId} ` +
      `| Order: ${checkoutData.orderId || 'N/A'} | Amount: ${checkoutData.amount || 'N/A'} ` +
      `| Plan: ${checkoutData.planName || 'N/A'}`,
    );
    
    return this.scheduleDelayedEvent(
      {
        eventId,
        appId,
        userId,
        eventType: NotificationJobType.CHECKOUT_ABANDONED,
        payload: {
          ...checkoutData,
          checkType: 'premium_status',
        },
        channels: [NotificationChannelType.Push, NotificationChannelType.InApp],
        metadata: {
          source: 'checkout-abandoned-check',
          originalDelayMs: delayMs,
        },
      },
      delayMs,
    );
  }

  /**
   * Get queue statistics
   */
  async getQueueStats(): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
  }> {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      this.notificationQueue.getWaitingCount(),
      this.notificationQueue.getActiveCount(),
      this.notificationQueue.getCompletedCount(),
      this.notificationQueue.getFailedCount(),
      this.notificationQueue.getDelayedCount(),
    ]);

    return { waiting, active, completed, failed, delayed };
  }

  /**
   * Get all delayed jobs (useful for debugging)
   */
  async getDelayedJobs(): Promise<Array<{ id: string; data: NotificationJobData; delay: number }>> {
    const jobs = await this.notificationQueue.getDelayed();
    
    return jobs.map(job => ({
      id: job.id!,
      data: job.data,
      delay: job.delay || 0,
    }));
  }

  /**
   * Remove a specific job by ID
   */
  async removeJob(jobId: string): Promise<void> {
    const job = await this.notificationQueue.getJob(jobId);
    if (job) {
      await job.remove();
      this.logger.log(`🗑️  [REMOVED] Job ${jobId} removed from queue`);
    }
  }
}