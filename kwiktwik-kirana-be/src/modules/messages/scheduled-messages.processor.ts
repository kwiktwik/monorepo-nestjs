import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger, Inject } from '@nestjs/common';
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
export class ScheduledMessagesProcessor extends WorkerHost {
  private readonly logger = new Logger(ScheduledMessagesProcessor.name);

  constructor(
    private readonly scheduledMessagesService: ScheduledMessagesService,
    @Inject(DRIZZLE_TOKEN) private readonly db: NodePgDatabase<typeof schema>,
    private readonly mqttService: MqttService,
  ) {
    super();
  }

  async process(job: Job<ScheduledMessageJobData>): Promise<void> {
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
    this.logger.error(`Job ${job.id} failed: ${error.message}`);
  }
}
