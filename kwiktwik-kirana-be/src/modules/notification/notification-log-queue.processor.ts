import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger, Inject, Optional, OnModuleDestroy } from '@nestjs/common';
import { Job } from 'bullmq';
import { DRIZZLE_TOKEN } from '../../database/drizzle.module';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import * as schema from '../../database/schema';

/**
 * Queue name for notification log writes
 */
export const NOTIFICATION_LOG_QUEUE_NAME = '{notification-logs}';

/**
 * Job data for notification log writes
 */
export interface NotificationLogJobData {
  userId: string;
  notificationId: string;
  packageName: string;
  appName: string;
  timestamp: string;
  title: string | null;
  text: string | null;
  bigText: string | null;
  hasTransaction: boolean;
  amount: string | null;
  payerName: string | null;
  transactionType: 'RECEIVED' | 'SENT' | 'UNKNOWN';
  processingTimeMs: number;
  ttsAnnounced: boolean;
  teamNotificationSent: boolean;
  processingMetadata: Record<string, unknown>;
  jobId: string;
}

/**
 * Result returned to the API response
 */
export interface NotificationLogJobResult {
  notificationLogId: number | null;
  enhancedNotificationId: number | null;
  status: 'success' | 'duplicate' | 'queued';
}

/**
 * Notification Log Queue Processor
 *
 * Handles async writes to notification_logs and enhanced_notifications tables.
 * This offloads write-heavy operations from the API response path.
 *
 * Benefits:
 * - API responds immediately (reduced latency)
 * - Batched writes reduce DB load
 * - Retries on transient failures
 * - Graceful degradation on queue failure
 */
@Processor(NOTIFICATION_LOG_QUEUE_NAME, {
  concurrency: 10, // Process 10 jobs concurrently
  limiter: {
    max: 500, // Max 500 jobs per second
    duration: 1000,
  },
})
export class NotificationLogProcessor
  extends WorkerHost
  implements OnModuleDestroy
{
  private readonly logger = new Logger(NotificationLogProcessor.name);
  private isShuttingDown = false;

  constructor(
    @Inject(DRIZZLE_TOKEN)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {
    super();
    this.logger.log('📝 Notification log processor initialized');
  }

  async onModuleDestroy(): Promise<void> {
    this.isShuttingDown = true;
    this.logger.log('🛑 Notification log processor shutting down...');

    if (this.worker) {
      try {
        await this.worker.close(true);
        this.logger.log('✅ Notification log worker closed gracefully');
      } catch (error) {
        this.logger.error(
          `❌ Error closing notification log worker: ${(error as Error).message}`,
        );
      }
    }
  }

  private metrics = {
    processed: 0,
    duplicates: 0,
    failed: 0,
  };

  async process(
    job: Job<NotificationLogJobData>,
  ): Promise<NotificationLogJobResult> {
    if (this.isShuttingDown) {
      this.logger.warn(`Job ${job.id} skipped - processor shutting down`);
      throw new Error('Processor shutting down');
    }

    const data = job.data;
    const startTime = Date.now();

    // this.logger.debug(
    //   `Processing notification log: ${data.notificationId} for user ${data.userId}`,
    // );

    try {
      return await this.db.transaction(async (tx) => {
        // Check for duplicate in enhanced_notifications (has unique constraint)
        const existing = await tx
          .select({ id: schema.enhancedNotifications.id })
          .from(schema.enhancedNotifications)
          .where(
            eq(schema.enhancedNotifications.notificationId, data.notificationId),
          )
          .limit(1);

        if (existing.length > 0) {
          this.metrics.duplicates++;
          return {
            notificationLogId: null,
            enhancedNotificationId: existing[0].id,
            status: 'duplicate',
          };
        }

        // Insert into notification_logs
        const logEntry = await tx
          .insert(schema.notificationLogs)
          .values({
            userId: data.userId,
            notificationId: data.notificationId,
            packageName: data.packageName,
            appName: data.appName,
            timestamp: new Date(data.timestamp),
            title: data.title,
            text: data.text,
            bigText: data.bigText,
            hasTransaction: data.hasTransaction,
            amount: data.amount,
            payerName: data.payerName,
            transactionType: data.transactionType,
            processingTimeMs: data.processingTimeMs,
            ttsAnnounced: data.ttsAnnounced,
          })
          .returning();

        const notificationLogId = logEntry[0]?.id ?? null;
        let enhancedNotificationId: number | null = null;

        // Insert into enhanced_notifications if has transaction
        if (data.hasTransaction && notificationLogId !== null) {
          const enhancedRows = await tx
            .insert(schema.enhancedNotifications)
            .values({
              userId: data.userId,
              notificationId: data.notificationId,
              originalNotificationId: null,
              packageName: data.packageName,
              appName: data.appName,
              title: data.title,
              content: data.text,
              bigText: data.bigText,
              timestamp: new Date(data.timestamp),
              hasTransaction: true,
              amount: data.amount,
              payerName: data.payerName,
              transactionType: data.transactionType,
              processingTimeMs: data.processingTimeMs,
              processingMetadata: data.processingMetadata,
              notificationLogId,
              ttsAnnounced: data.ttsAnnounced,
              teamNotificationSent: data.teamNotificationSent,
            })
            .returning();
          enhancedNotificationId = enhancedRows[0]?.id ?? null;
        }

        this.metrics.processed++;
        return {
          notificationLogId,
          enhancedNotificationId,
          status: 'success',
        };
      });
    } catch (error) {
      this.metrics.failed++;
      this.logger.error(
        `Failed to process notification log: ${(error as Error).message}`,
      );
      throw error; // Let BullMQ handle retry
    }
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job<NotificationLogJobData>) {
    // this.logger.debug(`Job ${job.id} completed`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<NotificationLogJobData>, error: Error) {
    this.logger.error(`Job ${job?.id} failed: ${error.message}`);
  }

  getMetrics() {
    return { ...this.metrics };
  }
}
