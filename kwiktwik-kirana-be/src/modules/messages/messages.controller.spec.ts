import { Test, TestingModule } from '@nestjs/testing';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { ScheduledMessagesService } from './scheduled-messages.service';

describe('MessagesController', () => {
  let controller: MessagesController;
  let service: MessagesService;
  let scheduledService: ScheduledMessagesService;

  const mockMessagesService = {
    send: jest.fn(),
    getMessages: jest.fn(),
    edit: jest.fn(),
    delete: jest.fn(),
    markAsRead: jest.fn(),
    getReadReceipts: jest.fn(),
    setTyping: jest.fn(),
    stopTyping: jest.fn(),
    getTypingUsers: jest.fn(),
    addReaction: jest.fn(),
    removeReaction: jest.fn(),
    getReactions: jest.fn(),
    sendMediaMessage: jest.fn(),
    getMediaAttachments: jest.fn(),
  };

  const mockScheduledMessagesService = {
    scheduleMessage: jest.fn(),
    getUserScheduledMessages: jest.fn(),
    cancelScheduledMessage: jest.fn(),
  };

  const mockUser = { userId: 'user-1' };
  const appId = 'com.test.app';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MessagesController],
      providers: [
        { provide: MessagesService, useValue: mockMessagesService },
        { provide: ScheduledMessagesService, useValue: mockScheduledMessagesService },
      ],
    }).compile();

    controller = module.get<MessagesController>(MessagesController);
    service = module.get<MessagesService>(MessagesService);
    scheduledService = module.get<ScheduledMessagesService>(ScheduledMessagesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('sendMessage', () => {
    it('should send message', async () => {
      const dto = { conversationId: 'conv-123', content: 'Hello' };
      const mockResult = { id: 'msg-123', content: 'Hello' };
      mockMessagesService.send.mockResolvedValue(mockResult);

      const result = await controller.sendMessage(dto, mockUser, appId);

      expect(service.send).toHaveBeenCalledWith(
        dto.conversationId,
        mockUser.userId,
        dto.content,
        appId,
        undefined, // type is undefined when not provided
        undefined,
      );
      expect(result).toEqual(mockResult);
    });

    it('should send reply message', async () => {
      const dto = { conversationId: 'conv-123', content: 'Reply', replyToId: 'msg-100', type: 'text' };
      mockMessagesService.send.mockResolvedValue({ id: 'msg-123' });

      await controller.sendMessage(dto, mockUser, appId);

      expect(service.send).toHaveBeenCalledWith(
        dto.conversationId,
        mockUser.userId,
        dto.content,
        appId,
        'text',
        'msg-100',
      );
    });
  });

  describe('getMessages', () => {
    it('should get messages', async () => {
      const mockResult = {
        messages: [{ id: 'msg-1' }],
        nextCursor: 'cursor',
        hasMore: true,
      };
      mockMessagesService.getMessages.mockResolvedValue(mockResult);

      const result = await controller.getMessages('conv-123', mockUser);

      expect(service.getMessages).toHaveBeenCalledWith(
        'conv-123',
        mockUser.userId,
        50,
        undefined,
        undefined,
        undefined,
      );
      expect(result).toEqual(mockResult);
    });

    it('should get messages with pagination params', async () => {
      mockMessagesService.getMessages.mockResolvedValue({ messages: [] });

      await controller.getMessages('conv-123', mockUser, '20', 'before-id', 'after-id', 'cursor-123');

      expect(service.getMessages).toHaveBeenCalledWith(
        'conv-123',
        mockUser.userId,
        20,
        'before-id',
        'after-id',
        'cursor-123',
      );
    });
  });

  describe('editMessage', () => {
    it('should edit message', async () => {
      const dto = { content: 'Updated' };
      mockMessagesService.edit.mockResolvedValue({ id: 'msg-123', content: 'Updated' });

      const result = await controller.editMessage('msg-123', dto, mockUser, appId);

      expect(service.edit).toHaveBeenCalledWith(
        'msg-123',
        mockUser.userId,
        dto.content,
        appId,
      );
    });
  });

  describe('deleteMessage', () => {
    it('should delete message', async () => {
      mockMessagesService.delete.mockResolvedValue({ message: 'Message deleted' });

      const result = await controller.deleteMessage('msg-123', mockUser, appId);

      expect(service.delete).toHaveBeenCalledWith('msg-123', mockUser.userId, appId);
    });
  });

  describe('markAsRead', () => {
    it('should mark message as read', async () => {
      mockMessagesService.markAsRead.mockResolvedValue({ id: 'read-1' });

      const result = await controller.markAsRead('msg-123', mockUser, appId);

      expect(service.markAsRead).toHaveBeenCalledWith('msg-123', mockUser.userId, appId);
    });
  });

  describe('setTyping', () => {
    it('should set typing status', async () => {
      mockMessagesService.setTyping.mockResolvedValue(undefined);

      await controller.setTyping('conv-123', mockUser, appId);

      expect(service.setTyping).toHaveBeenCalledWith('conv-123', mockUser.userId, appId);
    });
  });

  describe('stopTyping', () => {
    it('should stop typing', async () => {
      mockMessagesService.stopTyping.mockResolvedValue(undefined);

      await controller.stopTyping('conv-123', mockUser, appId);

      expect(service.stopTyping).toHaveBeenCalledWith('conv-123', mockUser.userId, appId);
    });
  });

  describe('getTypingUsers', () => {
    it('should get typing users', async () => {
      mockMessagesService.getTypingUsers.mockResolvedValue(['user-1', 'user-2']);

      const result = await controller.getTypingUsers('conv-123');

      expect(service.getTypingUsers).toHaveBeenCalledWith('conv-123');
      expect(result).toEqual({ typingUsers: ['user-1', 'user-2'] });
    });
  });

  describe('addReaction', () => {
    it('should add reaction', async () => {
      mockMessagesService.addReaction.mockResolvedValue({ id: 'react-1' });

      const result = await controller.addReaction('msg-123', '👍', mockUser, appId);

      expect(service.addReaction).toHaveBeenCalledWith(
        'msg-123',
        mockUser.userId,
        '👍',
        appId,
      );
    });
  });

  describe('removeReaction', () => {
    it('should remove reaction', async () => {
      mockMessagesService.removeReaction.mockResolvedValue({ message: 'Reaction removed' });

      const result = await controller.removeReaction('msg-123', mockUser, appId);

      expect(service.removeReaction).toHaveBeenCalledWith('msg-123', mockUser.userId, appId);
    });
  });

  describe('getReactions', () => {
    it('should get reactions', async () => {
      mockMessagesService.getReactions.mockResolvedValue({ total: 5, grouped: {} });

      const result = await controller.getReactions('msg-123', mockUser);

      expect(service.getReactions).toHaveBeenCalledWith('msg-123', mockUser.userId);
    });
  });

  describe('sendMediaMessage', () => {
    it('should send media message', async () => {
      const dto = {
        conversationId: 'conv-123',
        type: 'image',
        url: 'https://example.com/image.jpg',
        fileName: 'image.jpg',
      };
      mockMessagesService.sendMediaMessage.mockResolvedValue({
        message: { id: 'msg-123' },
        attachment: { id: 'att-1' },
      });

      const result = await controller.sendMediaMessage(dto, mockUser, appId);

      expect(service.sendMediaMessage).toHaveBeenCalledWith(
        'conv-123',
        mockUser.userId,
        appId,
        {
          type: dto.type,
          url: dto.url,
          thumbnailUrl: undefined,
          fileName: dto.fileName,
          fileSize: undefined,
          mimeType: undefined,
          width: undefined,
          height: undefined,
          duration: undefined,
        },
        undefined,
      );
    });
  });

  describe('getMediaAttachments', () => {
    it('should get media attachments', async () => {
      const mockAttachments = [{ id: 'att-1', type: 'image' }];
      mockMessagesService.getMediaAttachments.mockResolvedValue(mockAttachments);

      const result = await controller.getMediaAttachments('conv-123', mockUser);

      expect(service.getMediaAttachments).toHaveBeenCalledWith('conv-123', mockUser.userId);
      expect(result).toEqual(mockAttachments);
    });
  });

  describe('scheduleMessage', () => {
    it('should schedule a message', async () => {
      const dto = {
        conversationId: 'conv-123',
        content: 'Scheduled message',
        sendAt: '2024-12-01T10:00:00Z',
      };
      mockScheduledMessagesService.scheduleMessage.mockResolvedValue({ id: 'sched-1' });

      const result = await controller.scheduleMessage(dto, mockUser, appId);

      expect(scheduledService.scheduleMessage).toHaveBeenCalledWith(
        'conv-123',
        mockUser.userId,
        'Scheduled message',
        appId,
        new Date('2024-12-01T10:00:00Z'),
        'text',
        undefined,
      );
    });
  });

  describe('getScheduledMessages', () => {
    it('should get all scheduled messages for user', async () => {
      const mockMessages = [{ id: 'sched-1', content: 'Hello' }];
      mockScheduledMessagesService.getUserScheduledMessages.mockResolvedValue(mockMessages);

      const result = await controller.getScheduledMessages(mockUser);

      expect(scheduledService.getUserScheduledMessages).toHaveBeenCalledWith(mockUser.userId);
    });
  });

  describe('cancelScheduledMessage', () => {
    it('should cancel scheduled message', async () => {
      mockScheduledMessagesService.cancelScheduledMessage.mockResolvedValue({ success: true });

      const result = await controller.cancelScheduledMessage('sched-1', mockUser);

      expect(scheduledService.cancelScheduledMessage).toHaveBeenCalledWith('sched-1', mockUser.userId);
    });
  });
});
