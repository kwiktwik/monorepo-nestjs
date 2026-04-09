import { Test, TestingModule } from '@nestjs/testing';
import { ConversationsController } from './conversations.controller';
import { ConversationsService } from './conversations.service';

describe('ConversationsController', () => {
  let controller: ConversationsController;
  let service: ConversationsService;

  const mockConversationsService = {
    create: jest.fn(),
    findById: jest.fn(),
    getUserConversations: jest.fn(),
    getOrCreateDirectConversation: jest.fn(),
    addParticipant: jest.fn(),
    markAsRead: jest.fn(),
    getUnreadCount: jest.fn(),
    promoteToAdmin: jest.fn(),
    demoteFromAdmin: jest.fn(),
    updateGroup: jest.fn(),
  };

  const mockUser = { userId: 'user-1' };
  const appId = 'com.test.app';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConversationsController],
      providers: [
        { provide: ConversationsService, useValue: mockConversationsService },
      ],
    }).compile();

    controller = module.get<ConversationsController>(ConversationsController);
    service = module.get<ConversationsService>(ConversationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create conversation', async () => {
      const dto = {
        type: 'direct' as const,
        participantIds: ['user-1', 'user-2'],
      };
      const mockResult = { id: 'conv-123', type: 'direct' };
      mockConversationsService.create.mockResolvedValue(mockResult);

      const result = await controller.create(dto, mockUser, appId);

      expect(service.create).toHaveBeenCalledWith(
        appId,
        mockUser.userId,
        dto.type,
        dto.participantIds,
        undefined,
        undefined,
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('getUserConversations', () => {
    it('should return user conversations', async () => {
      const mockConversations = [{ id: 'conv-123' }];
      mockConversationsService.getUserConversations.mockResolvedValue(
        mockConversations,
      );

      const result = await controller.getUserConversations(mockUser, appId);

      expect(service.getUserConversations).toHaveBeenCalledWith(
        appId,
        mockUser.userId,
      );
      expect(result).toEqual(mockConversations);
    });
  });

  describe('getConversation', () => {
    it('should return conversation by id', async () => {
      const mockConversation = { id: 'conv-123' };
      mockConversationsService.findById.mockResolvedValue(mockConversation);

      const result = await controller.getConversation('conv-123', mockUser);

      expect(service.findById).toHaveBeenCalledWith(
        'conv-123',
        mockUser.userId,
      );
      expect(result).toEqual(mockConversation);
    });
  });

  describe('getOrCreateDirectConversation', () => {
    it('should get or create direct conversation', async () => {
      const mockConversation = { id: 'conv-123', type: 'direct' };
      mockConversationsService.getOrCreateDirectConversation.mockResolvedValue(
        mockConversation,
      );

      const result = await controller.getOrCreateDirectConversation(
        'user-2',
        mockUser,
        appId,
      );

      expect(service.getOrCreateDirectConversation).toHaveBeenCalledWith(
        appId,
        mockUser.userId,
        'user-2',
      );
      expect(result).toEqual(mockConversation);
    });
  });

  describe('addParticipant', () => {
    it('should add participant', async () => {
      const mockResult = { message: 'Participant added' };
      mockConversationsService.addParticipant.mockResolvedValue(mockResult);

      const result = await controller.addParticipant(
        'conv-123',
        'user-3',
        mockUser,
        appId,
      );

      expect(service.addParticipant).toHaveBeenCalledWith(
        'conv-123',
        mockUser.userId,
        'user-3',
        appId,
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('markAsRead', () => {
    it('should mark conversation as read', async () => {
      const mockResult = { message: 'Marked as read' };
      mockConversationsService.markAsRead.mockResolvedValue(mockResult);

      const result = await controller.markAsRead('conv-123', mockUser);

      expect(service.markAsRead).toHaveBeenCalledWith(
        'conv-123',
        mockUser.userId,
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('getUnreadCount', () => {
    it('should return unread count', async () => {
      mockConversationsService.getUnreadCount.mockResolvedValue(5);

      const result = await controller.getUnreadCount('conv-123', mockUser);

      expect(service.getUnreadCount).toHaveBeenCalledWith(
        'conv-123',
        mockUser.userId,
      );
      expect(result).toEqual({ unreadCount: 5 });
    });
  });

  describe('promoteToAdmin', () => {
    it('should promote user to admin', async () => {
      const mockResult = { message: 'User promoted to admin' };
      mockConversationsService.promoteToAdmin.mockResolvedValue(mockResult);

      const result = await controller.promoteToAdmin(
        'conv-123',
        'user-2',
        mockUser,
        appId,
      );

      expect(service.promoteToAdmin).toHaveBeenCalledWith(
        'conv-123',
        mockUser.userId,
        'user-2',
        appId,
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('demoteFromAdmin', () => {
    it('should demote user from admin', async () => {
      const mockResult = { message: 'User demoted from admin' };
      mockConversationsService.demoteFromAdmin.mockResolvedValue(mockResult);

      const result = await controller.demoteFromAdmin(
        'conv-123',
        'user-2',
        mockUser,
        appId,
      );

      expect(service.demoteFromAdmin).toHaveBeenCalledWith(
        'conv-123',
        mockUser.userId,
        'user-2',
        appId,
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('updateGroup', () => {
    it('should update group details', async () => {
      const updates = { name: 'New Name', description: 'New Description' };
      const mockResult = { id: 'conv-123', ...updates };
      mockConversationsService.updateGroup.mockResolvedValue(mockResult);

      const result = await controller.updateGroup(
        'conv-123',
        updates,
        mockUser,
        appId,
      );

      expect(service.updateGroup).toHaveBeenCalledWith(
        'conv-123',
        mockUser.userId,
        updates,
        appId,
      );
      expect(result).toEqual(mockResult);
    });
  });
});
