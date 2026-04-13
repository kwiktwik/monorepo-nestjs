import { Test, TestingModule } from '@nestjs/testing';
import {
  NotificationProcessor,
  NotificationJobData,
} from './notification.processor';
import { InMemoryEventBus } from './in-memory-event-bus';
import { EventHandlerRegistry } from './event-handler.registry';
import { NotificationChannelType } from '../types/notification-event.types';
import { DefaultEventHandler } from './handlers/default.handler';
import { PaymentReceivedHandler } from './handlers/payment-received.handler';
import { AnalyticsService } from '../../analytics/analytics.service';

describe('NotificationProcessor', () => {
  let processor: NotificationProcessor;
  let mockEventBus: any;
  let mockAnalyticsService: any;
  let handlerRegistry: EventHandlerRegistry;

  beforeEach(async () => {
    mockEventBus = {
      publish: jest.fn().mockResolvedValue([
        {
          channel: NotificationChannelType.InApp,
          delivered: true,
          deliveredAt: new Date(),
        },
      ]),
    };

    // Mock AnalyticsService for Mixpanel tracking (queue-first, no DB)
    mockAnalyticsService = {
      sendEvent: jest
        .fn()
        .mockResolvedValue({ overallSuccess: true, results: [] }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationProcessor,
        { provide: InMemoryEventBus, useValue: mockEventBus },
        EventHandlerRegistry,
        { provide: AnalyticsService, useValue: mockAnalyticsService },
      ],
    }).compile();

    processor = module.get<NotificationProcessor>(NotificationProcessor);
    handlerRegistry = module.get<EventHandlerRegistry>(EventHandlerRegistry);

    // Register handlers
    handlerRegistry.register(new PaymentReceivedHandler());
    handlerRegistry.setDefaultHandler(new DefaultEventHandler());
  });

  it('should be defined', () => {
    expect(processor).toBeDefined();
  });

  describe('process', () => {
    const createJob = (overrides: Partial<NotificationJobData> = {}) =>
      ({
        id: 'job-123',
        name: 'test-event',
        data: {
          eventId: 'event-123',
          appId: 'com.test.app',
          userId: 'user-123',
          eventType: 'payment.received',
          payload: { amount: 100 },
          channels: [NotificationChannelType.InApp],
          scheduledFor: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          ...overrides,
        } as NotificationJobData,
        attemptsMade: 0,
      }) as any;

    it('should process event using handler registry', async () => {
      const job = createJob({
        eventType: 'payment.received',
        payload: { amount: 100 },
      });

      await processor.process(job);

      expect(mockEventBus.publish).toHaveBeenCalled();
    });

    it('should process unknown event types with default handler', async () => {
      const job = createJob({
        eventType: 'random.unknown.event',
        payload: {},
      });

      await processor.process(job);

      expect(mockEventBus.publish).toHaveBeenCalled();
    });

    it('should route to DLQ after max retries (tracks to Mixpanel)', async () => {
      const job = createJob({
        eventType: 'payment.received',
        payload: { amount: -1 }, // Invalid - will fail validation
      });
      job.attemptsMade = 4; // Exceeds max retries

      await processor.process(job);

      // Queue-first: tracks to Mixpanel instead of DB
      expect(mockAnalyticsService.sendEvent).toHaveBeenCalled();
    });

    it('should track delivered channels individually even on partial delivery', async () => {
      mockEventBus.publish.mockResolvedValueOnce([
        {
          channel: NotificationChannelType.Push,
          delivered: true,
          detail: 'Sent to 1/1 devices',
          deliveredAt: new Date('2026-04-13T10:00:00.000Z'),
        },
        {
          channel: NotificationChannelType.InApp,
          delivered: false,
          detail: 'In-app write failed',
          deliveredAt: new Date('2026-04-13T10:00:01.000Z'),
        },
      ]);

      const job = createJob({
        channels: [NotificationChannelType.Push, NotificationChannelType.InApp],
      });

      await processor.process(job);

      const deliveredEvent = mockAnalyticsService.sendEvent.mock.calls.find(
        ([input]: [{ eventName: string }]) =>
          input.eventName === 'notification_event_delivered',
      )?.[0];

      const partialEvent = mockAnalyticsService.sendEvent.mock.calls.find(
        ([input]: [{ eventName: string }]) =>
          input.eventName === 'notification_event_partial',
      )?.[0];

      expect(deliveredEvent).toMatchObject({
        eventName: 'notification_event_delivered',
        appId: 'com.test.app',
        userData: {
          userId: 'user-123',
        },
        eventProperties: expect.objectContaining({
          channel: NotificationChannelType.Push,
          allChannelsSucceeded: false,
        }),
      });

      expect(partialEvent).toMatchObject({
        eventName: 'notification_event_partial',
        eventProperties: expect.objectContaining({
          failedChannels: JSON.stringify([NotificationChannelType.InApp]),
          successfulChannels: JSON.stringify([NotificationChannelType.Push]),
        }),
      });
    });
  });

  describe('getMetrics', () => {
    it('should return metrics object', () => {
      const metrics = processor.getMetrics();

      expect(metrics).toHaveProperty('processed');
      expect(metrics).toHaveProperty('failed');
      expect(metrics).toHaveProperty('deadLetter');
      expect(metrics).toHaveProperty('byEventType');
    });
  });
});
