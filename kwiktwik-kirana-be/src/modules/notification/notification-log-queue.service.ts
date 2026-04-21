import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import {
  NOTIFICATION_LOG_QUEUE_NAME,
  NotificationLogJobData,
  NotificationLogJobResult,
} from './notification-log-queue.processor';

/**
 * Sanitize string by removing null bytes (\x00) which PostgreSQL doesn't accept.
 * Also trim whitespace and return null for empty strings.
 */
function sanitizeString(value: string | null | undefined): string | null {
  if (value === null || value === undefined) {
    return null;
  }
  const sanitized = value.replace(/\x00/g, '').trim();
  return sanitized.length > 0 ? sanitized : null;
}

/**
 * Notification Log Queue Service
 *
 * Handles queuing of notification log writes for async processing.
 * This reduces API latency by offloading DB writes to a background queue.
 *
 * Features:
 * - Async writes via BullMQ queue
 * - Graceful fallback to sync writes if queue unavailable
 * - Feature flag to enable/disable async mode
 */
@Injectable()
export class NotificationLogQueueService implements OnModuleInit {
  private readonly logger = new Logger(NotificationLogQueueService.name);
  private isQueueAvailable = false;

  constructor(
    @InjectQueue(NOTIFICATION_LOG_QUEUE_NAME)
    private readonly logQueue: Queue<NotificationLogJobData, NotificationLogJobResult>,
  ) {}

  async onModuleInit() {
    // Check if queue is available
    try {
      // Check if queue is connected by trying to get waiting count
      await this.logQueue.getWaitingCount();
      this.isQueueAvailable = true;
      this.logger.log('✅ Notification log queue is ready');
    } catch (error) {
      this.logger.warn(
        '⚠️ Notification log queue not available, will use sync writes',
      );
      this.isQueueAvailable = false;
    }
  }

  /**
   * Check if async queue mode is enabled
   * Controlled by environment variable NOTIFICATION_LOG_ASYNC_ENABLED
   */
  isAsyncModeEnabled(): boolean {
    return (
      process.env.NOTIFICATION_LOG_ASYNC_ENABLED !== 'false' &&
      this.isQueueAvailable
    );
  }

  /**
   * Queue a notification log write for async processing
   * Returns immediately with a 'queued' status
   */
  async queueNotificationLog(
    data: Omit<NotificationLogJobData, 'jobId'>,
  ): Promise<NotificationLogJobResult> {
    const jobId = `${data.notificationId}-${Date.now()}`;

    try {
      await this.logQueue.add('notification-log', {
        ...data,
        jobId,
      }, {
        jobId,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
        removeOnComplete: {
          age: 3600, // Keep completed jobs for 1 hour
          count: 1000, // Keep max 1000 completed jobs
        },
        removeOnFail: {
          age: 86400, // Keep failed jobs for 24 hours
        },
      });

      this.logger.debug(`Queued notification log: ${data.notificationId}`);

      return {
        notificationLogId: null,
        enhancedNotificationId: null,
        status: 'queued',
      };
    } catch (error) {
      this.logger.error(
        `Failed to queue notification log: ${(error as Error).message}`,
      );
      throw error;
    }
  }

  /**
   * Get queue statistics
   */
  async getQueueStats() {
    if (!this.isQueueAvailable) {
      return { available: false };
    }

    try {
      const [waiting, active, completed, failed] = await Promise.all([
        this.logQueue.getWaitingCount(),
        this.logQueue.getActiveCount(),
        this.logQueue.getCompletedCount(),
        this.logQueue.getFailedCount(),
      ]);

      return {
        available: true,
        waiting,
        active,
        completed,
        failed,
      };
    } catch (error) {
      return {
        available: false,
        error: (error as Error).message,
      };
    }
  }
}
