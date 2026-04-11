import { Test, TestingModule } from '@nestjs/testing';
import { NotificationEventsService } from './notification-events.service';
import { NotificationChannelType } from './types/notification-event.types';
import { NotificationQueueService } from './services/notification-queue.service';
import { RedisService } from '../../common/redis/redis.service';
import { AnalyticsService } from '../analytics/analytics.service';

describe('NotificationEventsService', () => {
  let service: NotificationEventsService;
  let mockQueueService: any;
  let mockRedisService: any;
  let mockAnalyticsService: any;

  beforeEach(async () => {
    mockQueueService = {
      scheduleDelayedEvent: jest.fn().mockResolvedValue('job-123'),
    };

    // Mock RedisService for idempotency
    mockRedisService = {
      isRedisEnabled: jest.fn().mockReturnValue(true),
      getClient: jest.fn().mockReturnValue({
        setnx: jest.fn().mockResolvedValue(1), // 1 = new key set (not duplicate)
        expire: jest.fn().mockResolvedValue(1),
      }),
    };

    // Mock AnalyticsService for Mixpanel tracking
    mockAnalyticsService = {
      sendEvent: jest
        .fn()
        .mockResolvedValue({ overallSuccess: true, results: [] }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationEventsService,
        { provide: NotificationQueueService, useValue: mockQueueService },
        { provide: RedisService, useValue: mockRedisService },
        { provide: AnalyticsService, useValue: mockAnalyticsService },
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

      // Queue-first: No DB insert - should enqueue to queue
      expect(mockQueueService.scheduleDelayedEvent).toHaveBeenCalled();
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

    it('should ignore appId from body and use header appId (security)', async () => {
      const dto = {
        eventType: 'user_signup',
        payload: {},
        // appId in body should be ignored - security fix
      };

      await service.ingestEvent('user-123', 'com.test.app', dto);

      // Queue-first: Should enqueue to queue with header appId
      expect(mockQueueService.scheduleDelayedEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          appId: 'com.test.app',
        }),
        0,
      );
    });

    it('should default to InApp channel when no channels provided', async () => {
      const dto = {
        eventType: 'user_signup',
        payload: {},
      };

      await service.ingestEvent('user-123', 'com.test.app', dto);

      // Queue-first: check queue receives channels in payload
      expect(mockQueueService.scheduleDelayedEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: expect.objectContaining({
            _channels: [NotificationChannelType.InApp],
          }),
        }),
        0,
      );
    });

    it('should include metadata in payload when provided', async () => {
      const dto = {
        eventType: 'user_signup',
        payload: { data: 'value' },
        metadata: { key: 'meta' },
      };

      await service.ingestEvent('user-123', 'com.test.app', dto);

      // Queue-first: check queue receives metadata
      expect(mockQueueService.scheduleDelayedEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: expect.objectContaining({
            data: 'value',
            _channels: [NotificationChannelType.InApp],
            _metadata: { key: 'meta' },
          }),
        }),
        0,
      );
    });

    it('should force push-only for subscription.halted when channels are provided', async () => {
      const dto = {
        eventType: 'subscription.halted',
        payload: { subscriptionId: 'sub_123' },
        channels: [
          NotificationChannelType.InApp,
          NotificationChannelType.Sms,
          NotificationChannelType.Push,
        ],
      };

      await service.ingestEvent('user-123', 'com.test.app', dto);

      expect(mockQueueService.scheduleDelayedEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          channels: [NotificationChannelType.Push],
          payload: expect.objectContaining({
            _channels: [NotificationChannelType.Push],
          }),
        }),
        0,
      );
    });

    it('should force push-only for subscription.cancelled when no channels are provided', async () => {
      const dto = {
        eventType: 'subscription.cancelled',
        payload: { subscriptionId: 'sub_123' },
      };

      await service.ingestEvent('user-123', 'com.test.app', dto);

      expect(mockQueueService.scheduleDelayedEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          channels: [NotificationChannelType.Push],
          payload: expect.objectContaining({
            _channels: [NotificationChannelType.Push],
          }),
        }),
        0,
      );
    });

    it('should return duplicate status for existing eventId (idempotency via Redis)', async () => {
      // Simulate duplicate - Redis SETNX returns 0 (key already exists)
      mockRedisService.getClient.mockReturnValueOnce({
        setnx: jest.fn().mockResolvedValue(0), // 0 = already exists (duplicate)
      });

      const dto = {
        eventType: 'user_signup',
        payload: {},
        eventId: 'existing-event-id',
      };

      const result = await service.ingestEvent('user-123', 'com.test.app', dto);

      expect(result.isDuplicate).toBe(true);
      // Queue should not be called for duplicates
      expect(mockQueueService.scheduleDelayedEvent).not.toHaveBeenCalled();
    });

    it('should reject payment event without amount (schema validation)', async () => {
      const dto = {
        eventType: 'payment.received',
        payload: { currency: 'INR' }, // missing amount
      };

      await expect(
        service.ingestEvent('user-123', 'com.test.app', dto),
      ).rejects.toThrow('Event validation failed');
    });

    it('should reject order event without orderId (schema validation)', async () => {
      const dto = {
        eventType: 'order.completed',
        payload: { status: 'done' }, // missing orderId
      };

      await expect(
        service.ingestEvent('user-123', 'com.test.app', dto),
      ).rejects.toThrow('Event validation failed');
    });

    it('should accept valid payment event (queue-first)', async () => {
      const dto = {
        eventType: 'payment.received',
        payload: { amount: 100, currency: 'INR' },
      };

      const result = await service.ingestEvent('user-123', 'com.test.app', dto);

      expect(result.accepted).toBe(true);
      expect(result.eventId).toBeDefined();
      // Queue-first: should enqueue to queue, not DB
      expect(mockQueueService.scheduleDelayedEvent).toHaveBeenCalled();
    });
  });
});
