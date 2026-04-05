import { Test, TestingModule } from '@nestjs/testing';
import { MessagesService } from './messages.service';
import { DRIZZLE_TOKEN } from '../../database/drizzle.module';
import { RedisService } from '../../common/redis/redis.service';
import { MqttService } from '../../common/mqtt/mqtt.service';
import { ConversationsService } from '../conversations/conversations.service';
import { ChatPushNotificationService } from './chat-push-notification.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('MessagesService', () => {
  let service: MessagesService;
  let mockDb: any;
  let mockRedisService: any;
  let mockMqttService: any;
  let mockConversationsService: any;
  let mockChatPushNotificationService: any;

  const mockConversation = {
    id: 'conv-123',
    appId: 'com.test.app',
    participants: [
      { userId: 'user-1' },
      { userId: 'user-2' },
    ],
  };

  const mockMessage = {
    id: 'msg-123',
    conversationId: 'conv-123',
    senderId: 'user-1',
    content: 'Hello',
    type: 'text',
    createdAt: new Date(),
  };

  const mockEditedMessage = {
    ...mockMessage,
    content: 'Updated text',
    isEdited: true,
    editedAt: new Date(),
  };

  beforeEach(async () => {
    mockDb = {
      insert: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      returning: jest.fn().mockResolvedValue([mockMessage]),
      update: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      query: {
        messages: {
          findFirst: jest.fn(),
          findMany: jest.fn(),
        },
        messageReads: {
          findFirst: jest.fn(),
        },
        messageReactions: {
          findFirst: jest.fn(),
          findMany: jest.fn(),
        },
        user: {
          findFirst: jest.fn(),
        },
      },
    };

    mockRedisService = {
      setTypingWithDebounce: jest.fn().mockResolvedValue(true),
      removeTyping: jest.fn().mockResolvedValue(undefined),
      getTypingUsers: jest.fn().mockResolvedValue(['user-1']),
    };

    mockMqttService = {
      publishToUser: jest.fn().mockResolvedValue(undefined),
      publishToConversation: jest.fn().mockResolvedValue(undefined),
    };

    mockConversationsService = {
      findById: jest.fn().mockResolvedValue(mockConversation),
      updateLastMessage: jest.fn().mockResolvedValue(undefined),
    };

    mockChatPushNotificationService = {
      sendPushNotification: jest.fn().mockResolvedValue(undefined),
      getConversationName: jest.fn().mockResolvedValue('Test Chat'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessagesService,
        { provide: DRIZZLE_TOKEN, useValue: mockDb },
        { provide: RedisService, useValue: mockRedisService },
        { provide: MqttService, useValue: mockMqttService },
        { provide: ConversationsService, useValue: mockConversationsService },
        { provide: ChatPushNotificationService, useValue: mockChatPushNotificationService },
      ],
    }).compile();

    service = module.get<MessagesService>(MessagesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('send', () => {
    it('should send message successfully', async () => {
      mockDb.query.user.findFirst.mockResolvedValue({ name: 'User 1' });

      const result = await service.send(
        'conv-123',
        'user-1',
        'Hello world',
        'com.test.app',
      );

      expect(mockConversationsService.findById).toHaveBeenCalledWith('conv-123', 'user-1');
      expect(mockDb.insert).toHaveBeenCalled();
      expect(mockConversationsService.updateLastMessage).toHaveBeenCalled();
      expect(mockMqttService.publishToConversation).toHaveBeenCalled();
      expect(result).toEqual(mockMessage);
    });

    it('should send reply message', async () => {
      mockDb.query.messages.findFirst.mockResolvedValue(mockMessage);
      mockDb.query.user.findFirst.mockResolvedValue({ name: 'User 1' });

      const result = await service.send(
        'conv-123',
        'user-1',
        'Reply text',
        'com.test.app',
        'text',
        'msg-123',
      );

      expect(mockDb.insert).toHaveBeenCalled();
    });
  });

  describe('getMessages', () => {
    it('should return messages with pagination', async () => {
      const mockMessages = [mockMessage];
      mockDb.query.messages.findMany.mockResolvedValue(mockMessages);

      const result = await service.getMessages('conv-123', 'user-1');

      expect(result).toHaveProperty('messages');
      expect(result).toHaveProperty('hasMore');
      expect(mockConversationsService.findById).toHaveBeenCalledWith('conv-123', 'user-1');
    });

    it('should handle cursor pagination', async () => {
      const cursor = Buffer.from(JSON.stringify({
        createdAt: new Date().toISOString(),
        id: 'msg-100',
      })).toString('base64');

      mockDb.query.messages.findMany.mockResolvedValue([]);

      await service.getMessages('conv-123', 'user-1', 50, undefined, undefined, cursor);

      expect(mockDb.query.messages.findMany).toHaveBeenCalled();
    });
  });

  describe('edit', () => {
    it('should edit own message', async () => {
      mockDb.query.messages.findFirst.mockResolvedValue(mockMessage);
      // Mock the returning chain for update
      mockDb.where.mockReturnThis();
      mockDb.returning = jest.fn().mockResolvedValue([mockEditedMessage]);

      const result = await service.edit('msg-123', 'user-1', 'Updated text', 'com.test.app');

      expect(mockDb.update).toHaveBeenCalled();
      expect(result.isEdited).toBe(true);
    });

    it('should throw ForbiddenException when editing others message', async () => {
      mockDb.query.messages.findFirst.mockResolvedValue(mockMessage);

      await expect(
        service.edit('msg-123', 'user-2', 'Updated', 'com.test.app'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException when message not found', async () => {
      mockDb.query.messages.findFirst.mockResolvedValue(null);

      await expect(
        service.edit('msg-123', 'user-1', 'Updated', 'com.test.app'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete own message', async () => {
      mockDb.query.messages.findFirst.mockResolvedValue(mockMessage);

      const result = await service.delete('msg-123', 'user-1', 'com.test.app');

      expect(mockDb.update).toHaveBeenCalled();
      expect(result.message).toBe('Message deleted');
    });

    it('should throw ForbiddenException when deleting others message', async () => {
      mockDb.query.messages.findFirst.mockResolvedValue(mockMessage);

      await expect(
        service.delete('msg-123', 'user-2', 'com.test.app'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('markAsRead', () => {
    it('should mark message as read', async () => {
      mockDb.query.messages.findFirst.mockResolvedValue(mockMessage);
      mockDb.query.messageReads.findFirst.mockResolvedValue(null);

      const result = await service.markAsRead('msg-123', 'user-2', 'com.test.app');

      expect(mockDb.insert).toHaveBeenCalled();
    });

    it('should return existing read if already marked', async () => {
      const existingRead = { id: 'read-1', messageId: 'msg-123', userId: 'user-2' };
      mockDb.query.messages.findFirst.mockResolvedValue(mockMessage);
      mockDb.query.messageReads.findFirst.mockResolvedValue(existingRead);

      const result = await service.markAsRead('msg-123', 'user-2', 'com.test.app');

      expect(result).toEqual(existingRead);
      expect(mockDb.insert).not.toHaveBeenCalled();
    });
  });

  describe('setTyping', () => {
    it('should publish typing event', async () => {
      await service.setTyping('conv-123', 'user-1', 'com.test.app');

      expect(mockRedisService.setTypingWithDebounce).toHaveBeenCalled();
      expect(mockMqttService.publishToConversation).toHaveBeenCalled();
    });

    it('should not publish if debounce prevents', async () => {
      mockRedisService.setTypingWithDebounce.mockResolvedValueOnce(false);

      await service.setTyping('conv-123', 'user-1', 'com.test.app');

      expect(mockMqttService.publishToConversation).not.toHaveBeenCalled();
    });
  });

  describe('addReaction', () => {
    it('should add new reaction', async () => {
      mockDb.query.messages.findFirst.mockResolvedValue(mockMessage);
      mockDb.query.messageReactions.findFirst.mockResolvedValue(null);

      const result = await service.addReaction('msg-123', 'user-2', '👍', 'com.test.app');

      expect(mockDb.insert).toHaveBeenCalled();
    });

    it('should update existing reaction', async () => {
      const existingReaction = { id: 'react-1', messageId: 'msg-123', userId: 'user-2', reaction: '❤️' };
      mockDb.query.messages.findFirst.mockResolvedValue(mockMessage);
      mockDb.query.messageReactions.findFirst.mockResolvedValue(existingReaction);

      const result = await service.addReaction('msg-123', 'user-2', '👍', 'com.test.app');

      expect(mockDb.update).toHaveBeenCalled();
    });
  });

  describe('removeReaction', () => {
    it('should remove reaction', async () => {
      const existingReaction = { id: 'react-1', messageId: 'msg-123', userId: 'user-2' };
      mockDb.query.messages.findFirst.mockResolvedValue(mockMessage);
      mockDb.query.messageReactions.findFirst.mockResolvedValue(existingReaction);

      const result = await service.removeReaction('msg-123', 'user-2', 'com.test.app');

      expect(mockDb.delete).toHaveBeenCalled();
      expect(result.message).toBe('Reaction removed');
    });

    it('should throw NotFoundException when reaction not found', async () => {
      mockDb.query.messages.findFirst.mockResolvedValue(mockMessage);
      mockDb.query.messageReactions.findFirst.mockResolvedValue(null);

      await expect(
        service.removeReaction('msg-123', 'user-2', 'com.test.app'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getReactions', () => {
    it('should return grouped reactions', async () => {
      const reactions = [
        { id: 'r1', reaction: '👍', user: { id: 'u1' } },
        { id: 'r2', reaction: '👍', user: { id: 'u2' } },
        { id: 'r3', reaction: '❤️', user: { id: 'u3' } },
      ];
      mockDb.query.messages.findFirst.mockResolvedValue(mockMessage);
      mockDb.query.messageReactions.findMany.mockResolvedValue(reactions);

      const result = await service.getReactions('msg-123', 'user-1');

      expect(result.total).toBe(3);
      expect(result.grouped['👍']).toHaveLength(2);
      expect(result.grouped['❤️']).toHaveLength(1);
    });
  });
});
