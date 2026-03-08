import {
  Injectable,
  Inject,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DRIZZLE_TOKEN } from '../../database/drizzle.module';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../database/schema';
import { eq, and, desc, asc } from 'drizzle-orm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { v4 as uuidv4 } from 'uuid';

const { scheduledMessages, messages, conversations } = schema;

export const SCHEDULED_MESSAGES_QUEUE = 'scheduled-messages';

export interface ScheduledMessageJobData {
  scheduledMessageId: string;
}

@Injectable()
export class ScheduledMessagesService {
  private readonly logger = new Logger(ScheduledMessagesService.name);

  constructor(
    @Inject(DRIZZLE_TOKEN) private db: NodePgDatabase<typeof schema>,
    @InjectQueue(SCHEDULED_MESSAGES_QUEUE) private scheduledQueue: Queue,
  ) {}

  async scheduleMessage(
    conversationId: string,
    senderId: string,
    content: string,
    appId: string,
    sendAt: Date,
    type: string = 'text',
    replyToId?: string,
  ) {
    if (sendAt <= new Date()) {
      throw new BadRequestException('Scheduled time must be in the future');
    }

    const maxFutureDate = new Date();
    maxFutureDate.setDate(maxFutureDate.getDate() + 30);
    if (sendAt > maxFutureDate) {
      throw new BadRequestException(
        'Cannot schedule messages more than 30 days in advance',
      );
    }

    const [scheduled] = await this.db
      .insert(scheduledMessages)
      .values({
        id: uuidv4(),
        conversationId,
        appId,
        senderId,
        content,
        type,
        replyToId: replyToId || null,
        sendAt,
        status: 'pending',
        metadata: {},
      })
      .returning();

    const delay = sendAt.getTime() - Date.now();
    await this.scheduledQueue.add(
      'send-scheduled-message',
      { scheduledMessageId: scheduled.id },
      { delay, removeOnComplete: true, removeOnFail: false },
    );

    this.logger.log(
      `Scheduled message ${scheduled.id} for ${sendAt.toISOString()}`,
    );

    return scheduled;
  }

  async getScheduledMessages(conversationId: string, userId: string) {
    await this.db.query.conversations.findFirst({
      where: and(eq(conversations.id, conversationId)),
    });

    return this.db.query.scheduledMessages.findMany({
      where: and(
        eq(scheduledMessages.conversationId, conversationId),
        eq(scheduledMessages.senderId, userId),
        eq(scheduledMessages.status, 'pending'),
      ),
      orderBy: [asc(scheduledMessages.sendAt)],
    });
  }

  async getUserScheduledMessages(userId: string) {
    return this.db.query.scheduledMessages.findMany({
      where: and(
        eq(scheduledMessages.senderId, userId),
        eq(scheduledMessages.status, 'pending'),
      ),
      orderBy: [desc(scheduledMessages.sendAt)],
    });
  }

  async cancelScheduledMessage(messageId: string, userId: string) {
    const scheduled = await this.db.query.scheduledMessages.findFirst({
      where: eq(scheduledMessages.id, messageId),
    });

    if (!scheduled) {
      throw new NotFoundException('Scheduled message not found');
    }

    if (scheduled.senderId !== userId) {
      throw new NotFoundException('Scheduled message not found');
    }

    if (scheduled.status !== 'pending') {
      throw new BadRequestException(
        'Can only cancel pending scheduled messages',
      );
    }

    await this.db
      .update(scheduledMessages)
      .set({ status: 'cancelled', updatedAt: new Date() })
      .where(eq(scheduledMessages.id, messageId));

    return { message: 'Scheduled message cancelled' };
  }

  async processScheduledMessage(scheduledMessageId: string) {
    const scheduled = await this.db.query.scheduledMessages.findFirst({
      where: eq(scheduledMessages.id, scheduledMessageId),
    });

    if (!scheduled || scheduled.status !== 'pending') {
      this.logger.warn(
        `Scheduled message ${scheduledMessageId} not found or already processed`,
      );
      return;
    }

    try {
      const [message] = await this.db
        .insert(messages)
        .values({
          id: uuidv4(),
          conversationId: scheduled.conversationId,
          appId: scheduled.appId,
          senderId: scheduled.senderId,
          content: scheduled.content,
          type: scheduled.type,
          replyToId: scheduled.replyToId,
          metadata: {
            scheduledMessageId: scheduled.id,
          },
        })
        .returning();

      await this.db
        .update(scheduledMessages)
        .set({
          status: 'sent',
          sentAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(scheduledMessages.id, scheduledMessageId));

      this.logger.log(`Sent scheduled message ${scheduledMessageId}`);

      return message;
    } catch (error) {
      await this.db
        .update(scheduledMessages)
        .set({
          status: 'failed',
          errorMessage: (error as Error).message,
          updatedAt: new Date(),
        })
        .where(eq(scheduledMessages.id, scheduledMessageId));

      throw error;
    }
  }
}
