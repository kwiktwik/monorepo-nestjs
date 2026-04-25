import { Test, TestingModule } from '@nestjs/testing';
import { NotificationEventsController } from './notification-events.controller';
import { NotificationEventsService } from './notification-events.service';
import { NotificationQueueService } from './services/notification-queue.service';
import { AppIdGuard } from '../../common/guards/app-id.guard';

describe('NotificationEventsController', () => {
  let controller: NotificationEventsController;
  let service: NotificationEventsService;
  let queueService: NotificationQueueService;

  const mockNotificationEventsService = {
    ingestEvent: jest.fn(),
  };

  const mockNotificationQueueService = {
    scheduleCheckoutAbandonedCheck: jest.fn(),
    getQueueStats: jest.fn(),
  };

  const mockUser = { userId: 'user-123' };
  const appId = 'com.test.app';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationEventsController],
      providers: [
        {
          provide: NotificationEventsService,
          useValue: mockNotificationEventsService,
        },
        {
          provide: NotificationQueueService,
          useValue: mockNotificationQueueService,
        },
      ],
    })
      .overrideGuard(AppIdGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<NotificationEventsController>(
      NotificationEventsController,
    );
    service = module.get<NotificationEventsService>(NotificationEventsService);
    queueService = module.get<NotificationQueueService>(
      NotificationQueueService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('ingest', () => {
    it('should ingest event successfully', async () => {
      const dto = {
        eventType: 'test_event',
        payload: { data: 'value' },
      };

      const mockResult = {
        accepted: true,
        eventId: 'event-123',
        enqueuedAt: '2024-01-01T00:00:00Z',
      };

      mockNotificationEventsService.ingestEvent.mockResolvedValue(mockResult);

      const result = await controller.ingest(mockUser, appId, dto);

      expect(service.ingestEvent).toHaveBeenCalledWith(
        mockUser.userId,
        appId,
        dto,
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('scheduleCheckoutAbandoned', () => {
    it('should schedule checkout abandoned check', async () => {
      const body = {
        orderId: 'order-123',
        amount: 999,
        currency: 'INR',
        planName: 'Premium',
      };

      mockNotificationQueueService.scheduleCheckoutAbandonedCheck.mockResolvedValue(
        'job-123',
      );

      const result = await controller.scheduleCheckoutAbandoned(
        mockUser,
        appId,
        body,
      );

      expect(queueService.scheduleCheckoutAbandonedCheck).toHaveBeenCalled();
      expect(result.accepted).toBe(true);
      expect(result.jobId).toBe('job-123');
    });

    it('should use default delay when not provided', async () => {
      const body = {};

      mockNotificationQueueService.scheduleCheckoutAbandonedCheck.mockResolvedValue(
        'job-123',
      );

      const result = await controller.scheduleCheckoutAbandoned(
        mockUser,
        appId,
        body,
      );

      expect(result.message).toContain('30 minutes');
    });
  });

  describe('getQueueStats', () => {
    it('should return queue stats', async () => {
      const mockStats = { pending: 5, processing: 2 };
      mockNotificationQueueService.getQueueStats.mockResolvedValue(mockStats);

      const result = await controller.getQueueStats();

      expect(queueService.getQueueStats).toHaveBeenCalled();
      expect(result).toEqual(mockStats);
    });
  });
});
