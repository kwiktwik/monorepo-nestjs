import { Test, TestingModule } from '@nestjs/testing';
import { NotificationEventsService } from './notification-events.service';
import { DRIZZLE_TOKEN } from '../../database/drizzle.module';
import { NotificationChannelType } from './types/notification-event.types';

describe('NotificationEventsService', () => {
  let service: NotificationEventsService;
  let mockDb: any;

  beforeEach(async () => {
    mockDb = {
      insert: jest.fn().mockReturnThis(),
      values: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationEventsService,
        { provide: DRIZZLE_TOKEN, useValue: mockDb },
      ],
    }).compile();

    service = module.get<NotificationEventsService>(NotificationEventsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('ingestEvent', () => {
    it('should ingest event with all fields', async () => {
      const dto = {
        eventType: 'user_signup',
        payload: { userName: 'John' },
        channels: [NotificationChannelType.Push, NotificationChannelType.InApp],
        metadata: { source: 'mobile' },
        appId: 'com.test.app',
      };

      const result = await service.ingestEvent('user-123', 'com.test.app', dto);

      expect(mockDb.insert).toHaveBeenCalled();
      expect(mockDb.values).toHaveBeenCalledWith(
        expect.objectContaining({
          appId: 'com.test.app',
          eventName: 'user_signup',
          userId: 'user-123',
          status: 'PENDING',
          retryCount: 0,
        }),
      );
      expect(result.accepted).toBe(true);
      expect(result.eventId).toBeDefined();
      expect(result.enqueuedAt).toBeDefined();
    });

    it('should use provided eventId when available', async () => {
      const dto = {
        eventType: 'user_signup',
        payload: {},
        eventId: 'custom-event-id',
      };

      const result = await service.ingestEvent('user-123', 'com.test.app', dto);

      expect(result.eventId).toBe('custom-event-id');
    });

    it('should use dto appId when provided', async () => {
      const dto = {
        eventType: 'user_signup',
        payload: {},
        appId: 'custom.app.id',
      };

      await service.ingestEvent('user-123', 'com.test.app', dto);

      expect(mockDb.values).toHaveBeenCalledWith(
        expect.objectContaining({
          appId: 'custom.app.id',
        }),
      );
    });

    it('should default to InApp channel when no channels provided', async () => {
      const dto = {
        eventType: 'user_signup',
        payload: {},
      };

      await service.ingestEvent('user-123', 'com.test.app', dto);

      expect(mockDb.values).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: expect.objectContaining({
            _channels: [NotificationChannelType.InApp],
          }),
        }),
      );
    });

    it('should include metadata in payload when provided', async () => {
      const dto = {
        eventType: 'user_signup',
        payload: { data: 'value' },
        metadata: { key: 'meta' },
      };

      await service.ingestEvent('user-123', 'com.test.app', dto);

      expect(mockDb.values).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: expect.objectContaining({
            data: 'value',
            _channels: [NotificationChannelType.InApp],
            _metadata: { key: 'meta' },
          }),
        }),
      );
    });
  });
});
