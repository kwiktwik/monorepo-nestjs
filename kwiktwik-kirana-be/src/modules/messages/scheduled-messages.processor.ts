import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger, Inject, OnModuleDestroy } from '@nestjs/common';
import { Job } from 'bullmq';
import {
  ScheduledMessagesService,
  SCHEDULED_MESSAGES_QUEUE,
  ScheduledMessageJobData,
} from './scheduled-messages.service';
import { DRIZZLE_TOKEN } from '../../database/drizzle.module';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../database/schema';
import { MqttService } from '../../common/mqtt/mqtt.service';
import { eq, and } from 'drizzle-orm';

@Processor(SCHEDULED_MESSAGES_QUEUE, {
  concurrency: 5,
})
export class ScheduledMessagesProcessor
  extends WorkerHost
  implements OnModuleDestroy
{
  private readonly logger = new Logger(ScheduledMessagesProcessor.name);
  private isShuttingDown = false;

  constructor(
    private readonly scheduledMessagesService: ScheduledMessagesService,
    @Inject(DRIZZLE_TOKEN) private readonly db: NodePgDatabase<typeof schema>,
    private readonly mqttService: MqttService,
  ) {
    super();
  }

  /**
   * Graceful shutdown handler - closes the worker properly before app shutdown
   * This prevents ECONNRESET errors when Redis connection is closed
   */
  async onModuleDestroy(): Promise<void> {
    this.isShuttingDown = true;
    this.logger.log(
      '🛑 [SHUTDOWN] Scheduled messages processor shutting down gracefully...',
    );

    if (this.worker) {
      try {
        // Close the worker gracefully - waits for active jobs to complete
        // with a 5 second timeout for forceful close
        await this.worker.close(true);
        this.logger.log(
          '✅ [SHUTDOWN] Scheduled messages worker closed gracefully',
        );
      } catch (error) {
        this.logger.error(
          `❌ [SHUTDOWN] Error closing scheduled messages worker: ${(error as Error).message}`,
        );
      }
    }
  }

  async process(job: Job<ScheduledMessageJobData>): Promise<void> {
    // Skip processing if shutting down
    if (this.isShuttingDown) {
      this.logger.warn(
        `⚠️ [SKIPPED] Job ${job.id} skipped - processor is shutting down`,
      );
      return;
    }

    const { scheduledMessageId } = job.data;

    this.logger.log(`Processing scheduled message ${scheduledMessageId}`);

    const message =
      await this.scheduledMessagesService.processScheduledMessage(
        scheduledMessageId,
      );

    if (message) {
      const scheduled = await this.db.query.scheduledMessages.findFirst({
        where: eq(schema.scheduledMessages.id, scheduledMessageId),
      });

      if (scheduled) {
        const conversation = await this.db.query.conversations.findFirst({
          where: eq(schema.conversations.id, scheduled.conversationId),
          with: {
            participants: true,
          },
        });

        const appId = scheduled.metadata?.appId as string | undefined;
        if (appId && conversation) {
          await this.mqttService.publishToConversation(
            appId,
            scheduled.conversationId,
            'message/new',
            {
              message,
              conversationId: scheduled.conversationId,
            },
          );

          const participantIds = conversation.participants.map((p) => p.userId);
          for (const userId of participantIds) {
            if (userId !== scheduled.senderId) {
              await this.mqttService.publishToUser(
                appId,
                userId,
                'message/new',
                {
                  message,
                  conversationId: scheduled.conversationId,
                },
              );
            }
          }
        }
      }
    }
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job<ScheduledMessageJobData>) {
    this.logger.log(`Job ${job.id} completed`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<ScheduledMessageJobData>, error: Error) {
    // Skip logging connection errors during shutdown (expected behavior)
    if (
      this.isShuttingDown &&
      (error.message.includes('ECONNRESET') ||
        error.message.includes('Connection is closed'))
    ) {
      this.logger.debug(
        `[WORKER] Expected connection error during shutdown: ${error.message}`,
      );
      return;
    }
    this.logger.error(`Job ${job.id} failed: ${error.message}`);
  }

  @OnWorkerEvent('error')
  onError(error: Error) {
    // Skip logging connection errors during shutdown (expected behavior)
    if (
      this.isShuttingDown &&
      (error.message.includes('ECONNRESET') ||
        error.message.includes('Connection is closed'))
    ) {
      this.logger.debug(
        `[WORKER] Expected connection error during shutdown: ${error.message}`,
      );
      return;
    }
    this.logger.error(`🔥 [WORKER] Worker error: ${error.message}`);
  }
}
