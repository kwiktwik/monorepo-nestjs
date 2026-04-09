import { Test, TestingModule } from '@nestjs/testing';
import { ConversationsService } from './conversations.service';
import { DRIZZLE_TOKEN } from '../../database/drizzle.module';
import { RedisService } from '../../common/redis/redis.service';
import { MqttService } from '../../common/mqtt/mqtt.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('ConversationsService', () => {
  let service: ConversationsService;
  let mockDb: any;
  let mockRedisService: any;
  let mockMqttService: any;

  const mockConversation = {
    id: 'conv-123',
    appId: 'com.test.app',
    type: 'direct',
    name: null,
    description: null,
    createdBy: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    lastMessageAt: null,
    lastMessagePreview: null,
    participants: [
      {
        id: 'part-1',
        userId: 'user-1',
        role: 'admin',
        user: { id: 'user-1', name: 'User 1' },
      },
      {
        id: 'part-2',
        userId: 'user-2',
        role: 'member',
        user: { id: 'user-2', name: 'User 2' },
      },
    ],
  };

  const mockGroupConversation = {
    ...mockConversation,
    type: 'group',
    name: 'Test Group',
  };

  beforeEach(async () => {
    mockDb = {
      insert: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      returning: jest.fn().mockResolvedValue([mockConversation]),
      update: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      query: {
        conversations: {
          findFirst: jest.fn(),
          findMany: jest.fn(),
        },
        conversationParticipants: {
          findFirst: jest.fn(),
          findMany: jest.fn(),
        },
        messages: {
          findMany: jest.fn(),
        },
      },
    };

    mockRedisService = {
      cacheConversationParticipants: jest.fn().mockResolvedValue(undefined),
      getConversationParticipants: jest
        .fn()
        .mockResolvedValue(['user-1', 'user-2']),
    };

    mockMqttService = {
      publishToUser: jest.fn().mockResolvedValue(undefined),
      publishToConversation: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConversationsService,
        { provide: DRIZZLE_TOKEN, useValue: mockDb },
        { provide: RedisService, useValue: mockRedisService },
        { provide: MqttService, useValue: mockMqttService },
      ],
    }).compile();

    service = module.get<ConversationsService>(ConversationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a direct conversation', async () => {
      mockDb.query.conversations.findFirst.mockResolvedValue(mockConversation);

      const result = await service.create('com.test.app', 'user-1', 'direct', [
        'user-1',
        'user-2',
      ]);

      expect(mockDb.insert).toHaveBeenCalled();
      expect(mockRedisService.cacheConversationParticipants).toHaveBeenCalled();
      expect(mockMqttService.publishToUser).toHaveBeenCalledTimes(2);
    });

    it('should create a group conversation with name', async () => {
      mockDb.query.conversations.findFirst.mockResolvedValue(
        mockGroupConversation,
      );

      const result = await service.create(
        'com.test.app',
        'user-1',
        'group',
        ['user-1', 'user-2', 'user-3'],
        'Test Group',
        'A test group',
      );

      expect(mockDb.insert).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return conversation for participant', async () => {
      mockDb.query.conversations.findFirst.mockResolvedValue(mockConversation);

      const result = await service.findById('conv-123', 'user-1');

      expect(result).toEqual(mockConversation);
    });

    it('should throw NotFoundException when conversation not found', async () => {
      mockDb.query.conversations.findFirst.mockResolvedValue(null);

      await expect(service.findById('conv-123', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException when user is not participant', async () => {
      mockDb.query.conversations.findFirst.mockResolvedValue(mockConversation);

      await expect(service.findById('conv-123', 'user-3')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('getUserConversations', () => {
    it('should return conversations for user', async () => {
      mockDb.query.conversationParticipants.findMany.mockResolvedValue([
        { conversation: mockConversation },
      ]);

      const result = await service.getUserConversations(
        'com.test.app',
        'user-1',
      );

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getOrCreateDirectConversation', () => {
    it('should create new conversation if none exists', async () => {
      mockDb.query.conversationParticipants.findMany.mockResolvedValue([]);
      mockDb.query.conversations.findFirst.mockResolvedValue(mockConversation);

      const result = await service.getOrCreateDirectConversation(
        'com.test.app',
        'user-1',
        'user-2',
      );

      expect(mockDb.insert).toHaveBeenCalled();
    });

    it('should return existing conversation if found', async () => {
      mockDb.query.conversationParticipants.findMany.mockResolvedValue([
        { conversationId: 'conv-123' },
      ]);
      mockDb.query.conversations.findMany.mockResolvedValue([mockConversation]);
      mockDb.query.conversationParticipants.findMany.mockResolvedValue([
        { userId: 'user-2' },
      ]);
      mockDb.query.conversations.findFirst.mockResolvedValue(mockConversation);

      const result = await service.getOrCreateDirectConversation(
        'com.test.app',
        'user-1',
        'user-2',
      );

      expect(result).toEqual(mockConversation);
    });
  });

  describe('addParticipant', () => {
    it('should add participant to group when user is admin', async () => {
      // Use mockResolvedValue (not Once) so it works for multiple calls
      mockDb.query.conversations.findFirst.mockResolvedValue(
        mockGroupConversation,
      );

      // For checkIsAdmin - user is admin
      mockDb.query.conversationParticipants.findFirst
        .mockResolvedValueOnce({
          id: 'part-1',
          userId: 'user-1',
          role: 'admin',
        })
        // For checking if new user already exists - not found
        .mockResolvedValueOnce(null);

      await service.addParticipant(
        'conv-123',
        'user-1',
        'user-3',
        'com.test.app',
      );

      expect(mockDb.insert).toHaveBeenCalled();
      expect(mockMqttService.publishToUser).toHaveBeenCalled();
    });

    it('should throw ForbiddenException for direct conversations', async () => {
      mockDb.query.conversations.findFirst.mockResolvedValue(mockConversation);

      await expect(
        service.addParticipant('conv-123', 'user-1', 'user-3', 'com.test.app'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('markAsRead', () => {
    it('should mark conversation as read', async () => {
      mockDb.returning = jest.fn().mockResolvedValue([{ id: 'read-1' }]);

      const result = await service.markAsRead('conv-123', 'user-1');

      expect(result).toEqual({ message: 'Marked as read' });
    });
  });

  describe('removeParticipant', () => {
    it('should allow user to remove themselves', async () => {
      mockDb.query.conversations.findFirst.mockResolvedValue(
        mockGroupConversation,
      );
      mockDb.query.conversationParticipants.findFirst.mockResolvedValue({
        role: 'member',
      });

      const result = await service.removeParticipant(
        'conv-123',
        'user-2',
        'user-2',
        'com.test.app',
      );

      expect(result).toEqual({ message: 'Participant removed' });
      expect(mockDb.delete).toHaveBeenCalled();
    });

    it('should allow admin to remove other participants', async () => {
      mockDb.query.conversations.findFirst.mockResolvedValue(
        mockGroupConversation,
      );
      mockDb.query.conversationParticipants.findFirst.mockResolvedValue({
        role: 'admin',
      });

      const result = await service.removeParticipant(
        'conv-123',
        'user-1',
        'user-2',
        'com.test.app',
      );

      expect(result).toEqual({ message: 'Participant removed' });
      expect(mockMqttService.publishToUser).toHaveBeenCalled();
    });

    it('should throw ForbiddenException when non-admin tries to remove others', async () => {
      mockDb.query.conversations.findFirst.mockResolvedValue(
        mockGroupConversation,
      );
      mockDb.query.conversationParticipants.findFirst.mockResolvedValue({
        role: 'member',
      });

      await expect(
        service.removeParticipant(
          'conv-123',
          'user-2',
          'user-1',
          'com.test.app',
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException when trying to remove creator', async () => {
      mockDb.query.conversations.findFirst.mockResolvedValue({
        ...mockGroupConversation,
        createdBy: 'user-1',
      });
      mockDb.query.conversationParticipants.findFirst.mockResolvedValue({
        role: 'admin',
      });

      await expect(
        service.removeParticipant(
          'conv-123',
          'user-1',
          'user-1',
          'com.test.app',
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getUnreadCount', () => {
    it('should return unread count for participant', async () => {
      mockDb.query.conversationParticipants.findFirst.mockResolvedValue({
        lastReadAt: new Date('2024-01-01'),
      });
      mockDb.query.messages.findMany.mockResolvedValue([
        { createdAt: new Date('2024-01-02'), senderId: 'user-2' },
        { createdAt: new Date('2024-01-03'), senderId: 'user-2' },
      ]);

      const result = await service.getUnreadCount('conv-123', 'user-1');

      expect(result).toBe(2);
    });

    it('should return total messages count when never read', async () => {
      mockDb.query.conversationParticipants.findFirst.mockResolvedValue({
        lastReadAt: null,
      });
      mockDb.query.messages.findMany.mockResolvedValue([
        { createdAt: new Date(), senderId: 'user-2' },
        { createdAt: new Date(), senderId: 'user-2' },
      ]);

      const result = await service.getUnreadCount('conv-123', 'user-1');

      expect(result).toBe(2);
    });

    it('should return 0 when user is not participant', async () => {
      mockDb.query.conversationParticipants.findFirst.mockResolvedValue(null);

      const result = await service.getUnreadCount('conv-123', 'user-1');

      expect(result).toBe(0);
    });

    it('should not count own messages as unread', async () => {
      mockDb.query.conversationParticipants.findFirst.mockResolvedValue({
        lastReadAt: new Date('2024-01-01'),
      });
      mockDb.query.messages.findMany.mockResolvedValue([
        { createdAt: new Date('2024-01-02'), senderId: 'user-1' },
        { createdAt: new Date('2024-01-03'), senderId: 'user-2' },
      ]);

      const result = await service.getUnreadCount('conv-123', 'user-1');

      expect(result).toBe(1);
    });
  });

  describe('promoteToAdmin', () => {
    it('should promote member to admin when requester is admin', async () => {
      mockDb.query.conversations.findFirst
        .mockResolvedValueOnce(mockGroupConversation)
        .mockResolvedValueOnce(mockGroupConversation);
      mockDb.query.conversationParticipants.findFirst
        .mockResolvedValueOnce({
          id: 'part-1',
          userId: 'user-1',
          role: 'admin',
        })
        .mockResolvedValueOnce({
          id: 'part-2',
          userId: 'user-2',
          role: 'member',
        });

      const result = await service.promoteToAdmin(
        'conv-123',
        'user-1',
        'user-2',
        'com.test.app',
      );

      expect(result).toEqual({ message: 'User promoted to admin' });
      expect(mockDb.update).toHaveBeenCalled();
      expect(mockMqttService.publishToUser).toHaveBeenCalled();
    });

    it('should throw NotFoundException when user to promote is not participant', async () => {
      mockDb.query.conversations.findFirst
        .mockResolvedValueOnce(mockGroupConversation)
        .mockResolvedValueOnce(mockGroupConversation);
      mockDb.query.conversationParticipants.findFirst
        .mockResolvedValueOnce({
          id: 'part-1',
          userId: 'user-1',
          role: 'admin',
        })
        .mockResolvedValueOnce(null);

      await expect(
        service.promoteToAdmin('conv-123', 'user-1', 'user-3', 'com.test.app'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when user is already admin', async () => {
      mockDb.query.conversations.findFirst
        .mockResolvedValueOnce(mockGroupConversation)
        .mockResolvedValueOnce(mockGroupConversation);
      mockDb.query.conversationParticipants.findFirst
        .mockResolvedValueOnce({
          id: 'part-1',
          userId: 'user-1',
          role: 'admin',
        })
        .mockResolvedValueOnce({
          id: 'part-2',
          userId: 'user-2',
          role: 'admin',
        });

      await expect(
        service.promoteToAdmin('conv-123', 'user-1', 'user-2', 'com.test.app'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException when non-admin tries to promote', async () => {
      mockDb.query.conversations.findFirst.mockResolvedValue(
        mockGroupConversation,
      );
      mockDb.query.conversationParticipants.findFirst.mockResolvedValue({
        role: 'member',
      });

      await expect(
        service.promoteToAdmin('conv-123', 'user-2', 'user-3', 'com.test.app'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('demoteFromAdmin', () => {
    it('should demote admin to member when requester is admin', async () => {
      mockDb.query.conversations.findFirst
        .mockResolvedValueOnce(mockGroupConversation)
        .mockResolvedValueOnce({
          ...mockGroupConversation,
          createdBy: 'user-1',
        });
      mockDb.query.conversationParticipants.findFirst
        .mockResolvedValueOnce({
          id: 'part-1',
          userId: 'user-1',
          role: 'admin',
        })
        .mockResolvedValueOnce({
          id: 'part-2',
          userId: 'user-2',
          role: 'admin',
        });

      const result = await service.demoteFromAdmin(
        'conv-123',
        'user-1',
        'user-2',
        'com.test.app',
      );

      expect(result).toEqual({ message: 'User demoted to member' });
      expect(mockDb.update).toHaveBeenCalled();
    });

    it('should throw ForbiddenException when trying to demote creator', async () => {
      mockDb.query.conversations.findFirst
        .mockResolvedValueOnce(mockGroupConversation)
        .mockResolvedValueOnce({
          ...mockGroupConversation,
          createdBy: 'user-1',
        });
      mockDb.query.conversationParticipants.findFirst.mockResolvedValueOnce({
        id: 'part-1',
        role: 'admin',
      });

      await expect(
        service.demoteFromAdmin('conv-123', 'user-2', 'user-1', 'com.test.app'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException when user is not admin', async () => {
      mockDb.query.conversations.findFirst
        .mockResolvedValueOnce(mockGroupConversation)
        .mockResolvedValueOnce(mockGroupConversation);
      mockDb.query.conversationParticipants.findFirst
        .mockResolvedValueOnce({ id: 'part-1', role: 'admin' })
        .mockResolvedValueOnce({ id: 'part-2', role: 'member' });

      await expect(
        service.demoteFromAdmin('conv-123', 'user-1', 'user-2', 'com.test.app'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('updateGroup', () => {
    it('should update group details when user is admin', async () => {
      mockDb.query.conversations.findFirst
        .mockResolvedValueOnce(mockGroupConversation)
        .mockResolvedValueOnce(mockGroupConversation);
      mockDb.query.conversationParticipants.findFirst.mockResolvedValue({
        role: 'admin',
      });

      const updates = {
        name: 'Updated Group Name',
        description: 'New description',
      };
      const result = await service.updateGroup(
        'conv-123',
        'user-1',
        updates,
        'com.test.app',
      );

      expect(mockDb.update).toHaveBeenCalled();
      expect(mockMqttService.publishToUser).toHaveBeenCalledTimes(2);
    });

    it('should update only avatarUrl', async () => {
      mockDb.query.conversations.findFirst
        .mockResolvedValueOnce(mockGroupConversation)
        .mockResolvedValueOnce(mockGroupConversation);
      mockDb.query.conversationParticipants.findFirst.mockResolvedValue({
        role: 'admin',
      });

      const updates = { avatarUrl: 'https://example.com/avatar.jpg' };
      await service.updateGroup('conv-123', 'user-1', updates, 'com.test.app');

      expect(mockDb.update).toHaveBeenCalled();
    });

    it('should throw ForbiddenException when non-admin tries to update', async () => {
      mockDb.query.conversations.findFirst.mockResolvedValue(
        mockGroupConversation,
      );
      mockDb.query.conversationParticipants.findFirst.mockResolvedValue({
        role: 'member',
      });

      await expect(
        service.updateGroup(
          'conv-123',
          'user-2',
          { name: 'New Name' },
          'com.test.app',
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('updateLastMessage', () => {
    it('should update last message preview', async () => {
      mockDb.returning = jest.fn().mockResolvedValue([{ id: 'conv-123' }]);

      await service.updateLastMessage(
        'conv-123',
        'Hello world this is a long message',
      );

      expect(mockDb.update).toHaveBeenCalled();
      expect(mockDb.set).toHaveBeenCalledWith(
        expect.objectContaining({
          lastMessagePreview: 'Hello world this is a long message'.substring(
            0,
            100,
          ),
        }),
      );
    });
  });
});
