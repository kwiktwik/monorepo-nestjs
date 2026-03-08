import { Injectable, NotFoundException, ForbiddenException, Inject } from '@nestjs/common';
import { DRIZZLE_TOKEN } from '../../database/drizzle.module';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../database/schema';
import { eq, and, desc, lt, gt } from 'drizzle-orm';
import { RedisService } from '../../common/redis/redis.service';
import { MqttService } from '../../common/mqtt/mqtt.service';
import { ConversationsService } from '../conversations/conversations.service';
import { v4 as uuidv4 } from 'uuid';

const { messages, messageReads, conversations, conversationParticipants } = schema;

@Injectable()
export class MessagesService {
  constructor(
    @Inject(DRIZZLE_TOKEN) private db: NodePgDatabase<typeof schema>,
    private redisService: RedisService,
    private mqttService: MqttService,
    private conversationsService: ConversationsService,
  ) { }

  async send(
    conversationId: string,
    senderId: string,
    content: string,
    type: string = 'text',
    replyToId?: string,
    appId?: string,
  ) {
    // Verify user is participant
    const conversation = await this.conversationsService.findById(conversationId, senderId);

    // Create message
    const [message] = await this.db.insert(messages).values({
      id: uuidv4(),
      conversationId,
      senderId,
      content,
      type,
      replyToId: replyToId || null,
    }).returning();

    // Update conversation last message
    await this.conversationsService.updateLastMessage(conversationId, content);

    // Get all participants
    const participantIds = conversation.participants.map(p => p.userId);

    // Publish to MQTT for real-time delivery
    if (appId) {
      await this.mqttService.publishToConversation(appId, conversationId, 'message/new', {
        message,
        conversationId,
      });

      // Also publish to each user's personal topic
      for (const userId of participantIds) {
        if (userId !== senderId) {
          await this.mqttService.publishToUser(appId, userId, 'message/new', {
            message,
            conversationId,
          });
        }
      }
    }

    return message;
  }

  async getMessages(
    conversationId: string,
    userId: string,
    limit: number = 50,
    before?: string,
    after?: string,
  ) {
    // Verify user is participant
    await this.conversationsService.findById(conversationId, userId);

    // Get all messages first then filter (simpler approach for Drizzle)
    const allMessages = await this.db.query.messages.findMany({
      where: and(
        eq(messages.conversationId, conversationId),
        eq(messages.isDeleted, false)
      ),
      with: {
        sender: true,
        replyTo: true,
      },
      orderBy: [desc(messages.createdAt)],
    });

    let filteredMessages = allMessages;

    if (before) {
      const beforeMsg = allMessages.find(m => m.id === before);
      if (beforeMsg) {
        filteredMessages = allMessages.filter(m => m.createdAt < beforeMsg.createdAt);
      }
    } else if (after) {
      const afterMsg = allMessages.find(m => m.id === after);
      if (afterMsg) {
        filteredMessages = allMessages.filter(m => m.createdAt > afterMsg.createdAt);
      }
    }

    return filteredMessages.slice(0, limit);
  }

  async edit(messageId: string, userId: string, content: string, appId?: string) {
    const message = await this.db.query.messages.findFirst({
      where: eq(messages.id, messageId),
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.senderId !== userId) {
      throw new ForbiddenException('You can only edit your own messages');
    }

    const [updated] = await this.db.update(messages)
      .set({
        content,
        isEdited: true,
        editedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(messages.id, messageId))
      .returning();

    // Update conversation last message preview if needed
    await this.conversationsService.updateLastMessage(message.conversationId, content);

    // Publish edit event
    if (appId) {
      await this.mqttService.publishToConversation(appId, message.conversationId, 'message/edited', {
        message: updated,
      });
    }

    return updated;
  }

  async delete(messageId: string, userId: string, appId?: string) {
    const message = await this.db.query.messages.findFirst({
      where: eq(messages.id, messageId),
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.senderId !== userId) {
      throw new ForbiddenException('You can only delete your own messages');
    }

    await this.db.update(messages)
      .set({
        isDeleted: true,
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(messages.id, messageId));

    // Publish delete event
    if (appId) {
      await this.mqttService.publishToConversation(appId, message.conversationId, 'message/deleted', {
        messageId,
        conversationId: message.conversationId,
      });
    }

    return { message: 'Message deleted' };
  }

  async markAsRead(messageId: string, userId: string, appId?: string) {
    const message = await this.db.query.messages.findFirst({
      where: eq(messages.id, messageId),
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    // Check if already read
    const existingRead = await this.db.query.messageReads.findFirst({
      where: and(
        eq(messageReads.messageId, messageId),
        eq(messageReads.userId, userId)
      ),
    });

    if (existingRead) {
      return existingRead;
    }

    const [read] = await this.db.insert(messageReads).values({
      id: uuidv4(),
      messageId,
      userId,
    }).returning();

    // Publish read event
    if (appId) {
      await this.mqttService.publishToUser(appId, message.senderId, 'message/read', {
        messageId,
        readBy: userId,
        conversationId: message.conversationId,
      });
    }

    return read;
  }

  async getReadReceipts(messageId: string, userId: string) {
    const message = await this.db.query.messages.findFirst({
      where: eq(messages.id, messageId),
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    return this.db.query.messageReads.findMany({
      where: eq(messageReads.messageId, messageId),
      with: {
        user: true,
      },
    });
  }

  async setTyping(conversationId: string, userId: string, appId: string) {
    await this.redisService.setTyping(conversationId, userId);

    // Publish typing event
    await this.mqttService.publishToConversation(appId, conversationId, 'typing', {
      userId,
      isTyping: true,
    });
  }

  async stopTyping(conversationId: string, userId: string, appId: string) {
    await this.redisService.removeTyping(conversationId, userId);

    // Publish stop typing event
    await this.mqttService.publishToConversation(appId, conversationId, 'typing', {
      userId,
      isTyping: false,
    });
  }

  async getTypingUsers(conversationId: string) {
    return this.redisService.getTypingUsers(conversationId);
  }
}
