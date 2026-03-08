import { Injectable, Inject, Logger } from '@nestjs/common';
import { DRIZZLE_TOKEN } from '../../database/drizzle.module';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../database/schema';
import { eq, and } from 'drizzle-orm';
import { RedisService } from '../../common/redis/redis.service';
import * as admin from 'firebase-admin';

const { pushTokens, conversations, conversationParticipants } = schema;

@Injectable()
export class ChatPushNotificationService {
  private readonly logger = new Logger(ChatPushNotificationService.name);

  constructor(
    @Inject(DRIZZLE_TOKEN) private db: NodePgDatabase<typeof schema>,
    private redisService: RedisService,
  ) {}

  async sendPushNotification(
    appId: string,
    userId: string,
    senderName: string,
    conversationName: string,
    messagePreview: string,
    messageType: string,
    conversationId: string,
  ) {
    const isOnline = await this.redisService.isUserOnline(userId, appId);

    if (isOnline) {
      this.logger.debug(`User ${userId} is online, skipping push notification`);
      return;
    }

    const tokens = await this.db.query.pushTokens.findMany({
      where: and(
        eq(pushTokens.userId, userId),
        eq(pushTokens.appId, appId),
        eq(pushTokens.isActive, true),
      ),
    });

    if (tokens.length === 0) {
      this.logger.debug(`No push tokens found for user ${userId}`);
      return;
    }

    const tokenStrings = tokens.map((t) => t.token);

    const notification = {
      title: conversationName || 'New message',
      body: `${senderName}: ${messagePreview.substring(0, 100)}`,
    };

    const data = {
      type: 'chat_message',
      conversationId,
      messageType,
      click_action: 'OPEN_CHAT',
    };

    try {
      const response = await admin.messaging().sendEachForMulticast({
        tokens: tokenStrings,
        notification,
        data,
        android: {
          priority: 'high' as const,
          notification: {
            channelId: 'chat_messages',
            priority: 'high' as const,
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
            },
          },
        },
      });

      const failedTokens: string[] = [];
      if (response.failureCount > 0) {
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            failedTokens.push(tokenStrings[idx]);
          }
        });

        if (failedTokens.length > 0) {
          await this.db
            .update(pushTokens)
            .set({ isActive: false })
            .where(
              and(
                eq(pushTokens.token, failedTokens[0]),
                eq(pushTokens.appId, appId),
              ),
            );
        }
      }

      this.logger.log(
        `Push notification sent to ${response.successCount} devices, failed: ${response.failureCount}`,
      );

      return {
        success: response.successCount,
        failed: response.failureCount,
      };
    } catch (error) {
      this.logger.error(
        `Failed to send push notification: ${(error as Error).message}`,
      );
      throw error;
    }
  }

  async getConversationName(
    conversationId: string,
    appId: string,
  ): Promise<string> {
    const conversation = await this.db.query.conversations.findFirst({
      where: eq(conversations.id, conversationId),
    });

    if (conversation?.type === 'group' && conversation.name) {
      return conversation.name;
    }

    if (conversation?.type === 'direct') {
      const participants =
        await this.db.query.conversationParticipants.findMany({
          where: eq(conversationParticipants.conversationId, conversationId),
          with: {
            user: true,
          },
        });

      if (participants.length > 0) {
        return (
          participants[0].user?.name ||
          participants[0].user?.phoneNumber ||
          'Unknown'
        );
      }
    }

    return 'Chat';
  }
}
