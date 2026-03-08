import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { DRIZZLE_TOKEN } from '../../database/drizzle.module';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../database/schema';
import { eq, and, desc, lt, gt, sql, inArray } from 'drizzle-orm';
import { RedisService } from '../../common/redis/redis.service';
import { MqttService } from '../../common/mqtt/mqtt.service';
import { ConversationsService } from '../conversations/conversations.service';
import { v4 as uuidv4 } from 'uuid';

const {
  messages,
  messageReads,
  conversations,
  conversationParticipants,
  messageReactions,
  mediaAttachments,
} = schema;

@Injectable()
export class MessagesService {
  constructor(
    @Inject(DRIZZLE_TOKEN) private db: NodePgDatabase<typeof schema>,
    private redisService: RedisService,
    private mqttService: MqttService,
    private conversationsService: ConversationsService,
  ) {}

  async send(
    conversationId: string,
    senderId: string,
    content: string,
    type: string = 'text',
    replyToId?: string,
    appId?: string,
  ) {
    // Verify user is participant
    const conversation = await this.conversationsService.findById(
      conversationId,
      senderId,
    );

    // Create message
    const [message] = await this.db
      .insert(messages)
      .values({
        id: uuidv4(),
        conversationId,
        senderId,
        content,
        type,
        replyToId: replyToId || null,
      })
      .returning();

    // Update conversation last message
    await this.conversationsService.updateLastMessage(conversationId, content);

    // Get all participants
    const participantIds = conversation.participants.map((p) => p.userId);

    // Publish to MQTT for real-time delivery
    if (appId) {
      await this.mqttService.publishToConversation(
        appId,
        conversationId,
        'message/new',
        {
          message,
          conversationId,
        },
      );

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
    cursor?: string,
  ) {
    // Verify user is participant
    await this.conversationsService.findById(conversationId, userId);

    const pageSize = Math.min(Math.max(limit, 1), 100); // Cap between 1 and 100

    // Build query conditions
    const conditions = [
      eq(messages.conversationId, conversationId),
      eq(messages.isDeleted, false),
    ];

    // Cursor-based pagination for better performance
    if (cursor) {
      try {
        const cursorData = JSON.parse(Buffer.from(cursor, 'base64').toString());
        if (cursorData.createdAt && cursorData.id) {
          conditions.push(
            sql`(${messages.createdAt}, ${messages.id}) < (${cursorData.createdAt}, ${cursorData.id})`,
          );
        }
      } catch {
        // Invalid cursor, ignore
      }
    } else if (before) {
      const beforeMessage = await this.db.query.messages.findFirst({
        where: eq(messages.id, before),
        columns: { createdAt: true },
      });
      if (beforeMessage) {
        conditions.push(lt(messages.createdAt, beforeMessage.createdAt));
      }
    } else if (after) {
      const afterMessage = await this.db.query.messages.findFirst({
        where: eq(messages.id, after),
        columns: { createdAt: true },
      });
      if (afterMessage) {
        conditions.push(gt(messages.createdAt, afterMessage.createdAt));
      }
    }

    const whereClause = and(...conditions);

    // Fetch messages with pagination using SQL LIMIT/OFFSET equivalent
    const results = await this.db.query.messages.findMany({
      where: whereClause,
      with: {
        sender: true,
        replyTo: {
          with: {
            sender: true,
          },
        },
        reactions: {
          with: {
            user: true,
          },
        },
        attachments: true,
      },
      orderBy: [desc(messages.createdAt), desc(messages.id)],
      limit: pageSize + 1, // Fetch one extra to determine if there are more
    });

    const hasMore = results.length > pageSize;
    const messagesList = hasMore ? results.slice(0, pageSize) : results;

    // Generate next cursor if there are more results
    let nextCursor: string | undefined;
    if (hasMore && messagesList.length > 0) {
      const lastMessage = messagesList[messagesList.length - 1];
      const cursorData = {
        createdAt: lastMessage.createdAt.toISOString(),
        id: lastMessage.id,
      };
      nextCursor = Buffer.from(JSON.stringify(cursorData)).toString('base64');
    }

    return {
      messages: messagesList,
      nextCursor,
      hasMore,
    };
  }

  async edit(
    messageId: string,
    userId: string,
    content: string,
    appId?: string,
  ) {
    const message = await this.db.query.messages.findFirst({
      where: eq(messages.id, messageId),
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.senderId !== userId) {
      throw new ForbiddenException('You can only edit your own messages');
    }

    const [updated] = await this.db
      .update(messages)
      .set({
        content,
        isEdited: true,
        editedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(messages.id, messageId))
      .returning();

    // Update conversation last message preview if needed
    await this.conversationsService.updateLastMessage(
      message.conversationId,
      content,
    );

    // Publish edit event
    if (appId) {
      await this.mqttService.publishToConversation(
        appId,
        message.conversationId,
        'message/edited',
        {
          message: updated,
        },
      );
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

    await this.db
      .update(messages)
      .set({
        isDeleted: true,
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(messages.id, messageId));

    // Publish delete event
    if (appId) {
      await this.mqttService.publishToConversation(
        appId,
        message.conversationId,
        'message/deleted',
        {
          messageId,
          conversationId: message.conversationId,
        },
      );
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
        eq(messageReads.userId, userId),
      ),
    });

    if (existingRead) {
      return existingRead;
    }

    const [read] = await this.db
      .insert(messageReads)
      .values({
        id: uuidv4(),
        messageId,
        userId,
      })
      .returning();

    // Publish read event
    if (appId) {
      await this.mqttService.publishToUser(
        appId,
        message.senderId,
        'message/read',
        {
          messageId,
          readBy: userId,
          conversationId: message.conversationId,
        },
      );
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
    const shouldBroadcast = await this.redisService.setTypingWithDebounce(
      conversationId,
      userId,
      3000, // 3 second debounce
      5, // 5 second TTL
    );

    // Only publish if debounce allowed it
    if (shouldBroadcast) {
      await this.mqttService.publishToConversation(
        appId,
        conversationId,
        'typing',
        {
          userId,
          isTyping: true,
        },
      );
    }
  }

  async stopTyping(conversationId: string, userId: string, appId: string) {
    await this.redisService.removeTyping(conversationId, userId);

    // Publish stop typing event
    await this.mqttService.publishToConversation(
      appId,
      conversationId,
      'typing',
      {
        userId,
        isTyping: false,
      },
    );
  }

  async getTypingUsers(conversationId: string) {
    return this.redisService.getTypingUsers(conversationId);
  }

  // Message reactions
  async addReaction(
    messageId: string,
    userId: string,
    reaction: string,
    appId?: string,
  ) {
    const message = await this.db.query.messages.findFirst({
      where: eq(messages.id, messageId),
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    // Check if user already has this reaction (upsert pattern)
    const existingReaction = await this.db.query.messageReactions.findFirst({
      where: and(
        eq(messageReactions.messageId, messageId),
        eq(messageReactions.userId, userId),
      ),
    });

    if (existingReaction) {
      // Update existing reaction
      const [updated] = await this.db
        .update(messageReactions)
        .set({ reaction })
        .where(eq(messageReactions.id, existingReaction.id))
        .returning();

      // Publish reaction update event
      if (appId) {
        await this.mqttService.publishToConversation(
          appId,
          message.conversationId,
          'message/reaction',
          {
            messageId,
            reaction: updated,
            action: 'updated',
          },
        );
      }

      return updated;
    }

    // Create new reaction
    const [newReaction] = await this.db
      .insert(messageReactions)
      .values({
        id: uuidv4(),
        messageId,
        userId,
        reaction,
      })
      .returning();

    // Publish reaction added event
    if (appId) {
      await this.mqttService.publishToConversation(
        appId,
        message.conversationId,
        'message/reaction',
        {
          messageId,
          reaction: newReaction,
          action: 'added',
        },
      );
    }

    return newReaction;
  }

  async removeReaction(messageId: string, userId: string, appId?: string) {
    const message = await this.db.query.messages.findFirst({
      where: eq(messages.id, messageId),
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    const existingReaction = await this.db.query.messageReactions.findFirst({
      where: and(
        eq(messageReactions.messageId, messageId),
        eq(messageReactions.userId, userId),
      ),
    });

    if (!existingReaction) {
      throw new NotFoundException('Reaction not found');
    }

    await this.db
      .delete(messageReactions)
      .where(eq(messageReactions.id, existingReaction.id));

    // Publish reaction removed event
    if (appId) {
      await this.mqttService.publishToConversation(
        appId,
        message.conversationId,
        'message/reaction',
        {
          messageId,
          reactionId: existingReaction.id,
          userId,
          action: 'removed',
        },
      );
    }

    return { message: 'Reaction removed' };
  }

  async getReactions(messageId: string, userId: string) {
    const message = await this.db.query.messages.findFirst({
      where: eq(messages.id, messageId),
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    // Check if user is participant in the conversation
    await this.conversationsService.findById(message.conversationId, userId);

    const reactions = await this.db.query.messageReactions.findMany({
      where: eq(messageReactions.messageId, messageId),
      with: {
        user: true,
      },
    });

    // Group by reaction type
    const grouped = reactions.reduce(
      (acc, r) => {
        if (!acc[r.reaction]) {
          acc[r.reaction] = [];
        }
        acc[r.reaction].push(r);
        return acc;
      },
      {} as Record<string, typeof reactions>,
    );

    return {
      total: reactions.length,
      grouped,
    };
  }
}
