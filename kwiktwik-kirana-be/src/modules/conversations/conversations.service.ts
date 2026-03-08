import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { DRIZZLE_TOKEN } from '../../database/drizzle.module';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../database/schema';
import { eq, and, desc, inArray } from 'drizzle-orm';
import { RedisService } from '../../common/redis/redis.service';
import { MqttService } from '../../common/mqtt/mqtt.service';
import { v4 as uuidv4 } from 'uuid';

const { conversations, conversationParticipants, messages } = schema;

@Injectable()
export class ConversationsService {
  constructor(
    @Inject(DRIZZLE_TOKEN) private db: NodePgDatabase<typeof schema>,
    private redisService: RedisService,
    private mqttService: MqttService,
  ) {}

  async create(
    appId: string,
    creatorId: string,
    type: 'direct' | 'group',
    participantIds: string[],
    name?: string,
    description?: string,
  ) {
    const [conversation] = await this.db
      .insert(conversations)
      .values({
        id: uuidv4(),
        appId,
        type,
        name: name || null,
        description: description || null,
        createdBy: creatorId,
      })
      .returning();

    // Add participants
    const participantValues = participantIds.map((userId) => ({
      id: uuidv4(),
      conversationId: conversation.id,
      appId,
      userId,
      role: userId === creatorId ? 'admin' : 'member',
    }));

    await this.db.insert(conversationParticipants).values(participantValues);

    // Cache participants in Redis
    await this.redisService.cacheConversationParticipants(
      conversation.id,
      participantIds,
    );

    // Notify participants via MQTT
    for (const userId of participantIds) {
      await this.mqttService.publishToUser(
        appId,
        userId,
        'conversation/created',
        {
          conversation,
        },
      );
    }

    return this.findById(conversation.id, creatorId);
  }

  async findById(conversationId: string, userId: string) {
    const conversation = await this.db.query.conversations.findFirst({
      where: eq(conversations.id, conversationId),
      with: {
        participants: {
          with: {
            user: true,
          },
        },
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    // Check if user is participant
    const isParticipant = conversation.participants.some(
      (p) => p.userId === userId,
    );
    if (!isParticipant) {
      throw new ForbiddenException(
        'You are not a participant of this conversation',
      );
    }

    return conversation;
  }

  async getUserConversations(appId: string, userId: string) {
    const participations =
      await this.db.query.conversationParticipants.findMany({
        where: eq(conversationParticipants.userId, userId),
        with: {
          conversation: {
            with: {
              participants: {
                with: {
                  user: true,
                },
              },
            },
          },
        },
      });

    return participations
      .map((p) => p.conversation)
      .filter(
        (c): c is NonNullable<typeof c> => c !== null && c.appId === appId,
      )
      .sort((a, b) => {
        const aTime = a.lastMessageAt?.getTime() || 0;
        const bTime = b.lastMessageAt?.getTime() || 0;
        return bTime - aTime;
      });
  }

  async getOrCreateDirectConversation(
    appId: string,
    userId: string,
    otherUserId: string,
  ) {
    const userParticipations =
      await this.db.query.conversationParticipants.findMany({
        where: eq(conversationParticipants.userId, userId),
      });

    if (userParticipations.length === 0) {
      return this.create(appId, userId, 'direct', [userId, otherUserId]);
    }

    const conversationIds = userParticipations.map((p) => p.conversationId);

    const directConversations = await this.db.query.conversations.findMany({
      where: and(
        eq(conversations.type, 'direct'),
        inArray(conversations.id, conversationIds),
        eq(conversations.appId, appId),
      ),
    });

    for (const conversation of directConversations) {
      const otherParticipants =
        await this.db.query.conversationParticipants.findMany({
          where: and(
            eq(conversationParticipants.conversationId, conversation.id),
            eq(conversationParticipants.userId, otherUserId),
          ),
        });

      if (otherParticipants.length > 0) {
        return this.findById(conversation.id, userId);
      }
    }

    return this.create(appId, userId, 'direct', [userId, otherUserId]);
  }

  async updateLastMessage(conversationId: string, messagePreview: string) {
    await this.db
      .update(conversations)
      .set({
        lastMessageAt: new Date(),
        lastMessagePreview: messagePreview.substring(0, 100),
        updatedAt: new Date(),
      })
      .where(eq(conversations.id, conversationId));
  }

  async addParticipant(
    conversationId: string,
    userId: string,
    newUserId: string,
    appId: string,
  ) {
    const conversation = await this.findById(conversationId, userId);

    if (conversation.type !== 'group') {
      throw new ForbiddenException(
        'Cannot add participants to direct conversations',
      );
    }

    // Only admins can add participants
    await this.requireAdmin(conversationId, userId);

    // Check if already a participant
    const existing = await this.db.query.conversationParticipants.findFirst({
      where: and(
        eq(conversationParticipants.conversationId, conversationId),
        eq(conversationParticipants.userId, newUserId),
      ),
    });

    if (existing) {
      throw new ForbiddenException('User is already a participant');
    }

    await this.db.insert(conversationParticipants).values({
      id: uuidv4(),
      conversationId,
      appId: conversation.appId,
      userId: newUserId,
      role: 'member',
    });

    // Update Redis cache
    const currentParticipants =
      await this.redisService.getConversationParticipants(conversationId);
    await this.redisService.cacheConversationParticipants(conversationId, [
      ...currentParticipants,
      newUserId,
    ]);

    // Notify the new participant
    await this.mqttService.publishToUser(
      appId,
      newUserId,
      'conversation/added',
      {
        conversationId,
      },
    );

    return this.findById(conversationId, userId);
  }

  async removeParticipant(
    conversationId: string,
    userId: string,
    removeUserId: string,
    appId: string,
  ) {
    const conversation = await this.findById(conversationId, userId);

    // Users can remove themselves, but removing others requires admin
    if (removeUserId !== userId) {
      await this.requireAdmin(conversationId, userId);
    }

    // Cannot remove the creator
    if (removeUserId === conversation.createdBy) {
      throw new ForbiddenException('Cannot remove the conversation creator');
    }

    await this.db
      .delete(conversationParticipants)
      .where(
        and(
          eq(conversationParticipants.conversationId, conversationId),
          eq(conversationParticipants.userId, removeUserId),
        ),
      );

    // Update Redis cache
    const currentParticipants =
      await this.redisService.getConversationParticipants(conversationId);
    await this.redisService.cacheConversationParticipants(
      conversationId,
      currentParticipants.filter((id) => id !== removeUserId),
    );

    // Notify the removed user
    await this.mqttService.publishToUser(
      appId,
      removeUserId,
      'conversation/removed',
      {
        conversationId,
      },
    );

    return { message: 'Participant removed' };
  }

  async markAsRead(conversationId: string, userId: string) {
    await this.db
      .update(conversationParticipants)
      .set({ lastReadAt: new Date() })
      .where(
        and(
          eq(conversationParticipants.conversationId, conversationId),
          eq(conversationParticipants.userId, userId),
        ),
      );

    return { message: 'Marked as read' };
  }

  async getUnreadCount(conversationId: string, userId: string) {
    const participant = await this.db.query.conversationParticipants.findFirst({
      where: and(
        eq(conversationParticipants.conversationId, conversationId),
        eq(conversationParticipants.userId, userId),
      ),
    });

    if (!participant) {
      return 0;
    }

    const unreadMessages = await this.db.query.messages.findMany({
      where: and(
        eq(messages.conversationId, conversationId),
        eq(messages.isDeleted, false),
      ),
    });

    if (!participant.lastReadAt) {
      return unreadMessages.length;
    }

    return unreadMessages.filter(
      (m) => m.createdAt > participant.lastReadAt! && m.senderId !== userId,
    ).length;
  }

  // Admin helper methods
  private async checkIsAdmin(
    conversationId: string,
    userId: string,
  ): Promise<boolean> {
    const participant = await this.db.query.conversationParticipants.findFirst({
      where: and(
        eq(conversationParticipants.conversationId, conversationId),
        eq(conversationParticipants.userId, userId),
      ),
    });

    return participant?.role === 'admin';
  }

  private async requireAdmin(
    conversationId: string,
    userId: string,
  ): Promise<void> {
    const isAdmin = await this.checkIsAdmin(conversationId, userId);
    if (!isAdmin) {
      throw new ForbiddenException('Admin privileges required for this action');
    }
  }

  async promoteToAdmin(
    conversationId: string,
    userId: string,
    promoteUserId: string,
    appId: string,
  ) {
    await this.findById(conversationId, userId);

    // Only admins can promote
    await this.requireAdmin(conversationId, userId);

    // Check if user to promote is a participant
    const participant = await this.db.query.conversationParticipants.findFirst({
      where: and(
        eq(conversationParticipants.conversationId, conversationId),
        eq(conversationParticipants.userId, promoteUserId),
      ),
    });

    if (!participant) {
      throw new NotFoundException('User is not a participant in this group');
    }

    if (participant.role === 'admin') {
      throw new ForbiddenException('User is already an admin');
    }

    await this.db
      .update(conversationParticipants)
      .set({ role: 'admin' })
      .where(eq(conversationParticipants.id, participant.id));

    // Notify the promoted user
    await this.mqttService.publishToUser(
      appId,
      promoteUserId,
      'conversation/admin-promoted',
      {
        conversationId,
        promotedBy: userId,
      },
    );

    return { message: 'User promoted to admin' };
  }

  async demoteFromAdmin(
    conversationId: string,
    userId: string,
    demoteUserId: string,
    appId: string,
  ) {
    await this.findById(conversationId, userId);

    // Only admins can demote
    await this.requireAdmin(conversationId, userId);

    // Cannot demote the creator
    const conversation = await this.db.query.conversations.findFirst({
      where: eq(conversations.id, conversationId),
    });

    if (demoteUserId === conversation?.createdBy) {
      throw new ForbiddenException('Cannot demote the conversation creator');
    }

    // Check if user to demote is a participant
    const participant = await this.db.query.conversationParticipants.findFirst({
      where: and(
        eq(conversationParticipants.conversationId, conversationId),
        eq(conversationParticipants.userId, demoteUserId),
      ),
    });

    if (!participant) {
      throw new NotFoundException('User is not a participant in this group');
    }

    if (participant.role !== 'admin') {
      throw new ForbiddenException('User is not an admin');
    }

    await this.db
      .update(conversationParticipants)
      .set({ role: 'member' })
      .where(eq(conversationParticipants.id, participant.id));

    // Notify the demoted user
    await this.mqttService.publishToUser(
      appId,
      demoteUserId,
      'conversation/admin-demoted',
      {
        conversationId,
        demotedBy: userId,
      },
    );

    return { message: 'User demoted to member' };
  }

  async updateGroup(
    conversationId: string,
    userId: string,
    updates: { name?: string; description?: string; avatarUrl?: string },
    appId: string,
  ) {
    await this.findById(conversationId, userId);

    // Only admins can update group details
    await this.requireAdmin(conversationId, userId);

    await this.db
      .update(conversations)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(conversations.id, conversationId));

    // Notify all participants
    const participants =
      await this.redisService.getConversationParticipants(conversationId);
    for (const participantId of participants) {
      await this.mqttService.publishToUser(
        appId,
        participantId,
        'conversation/updated',
        {
          conversationId,
          updates,
        },
      );
    }

    return this.findById(conversationId, userId);
  }
}
