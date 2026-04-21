import { Test, TestingModule } from '@nestjs/testing';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { NotificationLogQueueService } from './notification-log-queue.service';
import { NotificationLogProcessor } from './notification-log-queue.processor';
import {
  INestApplication,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';
import request from 'supertest';
import { AppIdGuard } from '../../common/guards/app-id.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

interface AuthenticatedRequest {
  user: { userId: string; appId: string };
}

interface NotificationListResponse {
  data: Array<{ id: number; title: string; content: string }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface CreateNotificationResponse {
  data: Array<{ id: number; status: string }>;
  processed: number;
}

interface TestNotificationResponse {
  found?: boolean;
  success?: boolean;
  id?: number;
}

interface PushTokenResponse {
  success: boolean;
}

class MockUserGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<AuthenticatedRequest>();
    req.user = { userId: 'test-user-id', appId: 'com.test.app' };
    return true;
  }
}

describe('NotificationController', () => {
  let app: INestApplication;

  const mockNotificationService = {
    findAll: jest.fn(),
    create: jest.fn(),
    createV2: jest.fn(),
    updateStatus: jest.fn(),
    createTestNotification: jest.fn(),
    pollTestNotification: jest.fn(),
    ackTestNotification: jest.fn(),
    registerPushToken: jest.fn(),
    deletePushToken: jest.fn(),
  };

  const mockNotificationLogQueueService = {
    getQueueStats: jest.fn(),
    isAsyncModeEnabled: jest.fn().mockReturnValue(true),
  };

  const mockNotificationLogProcessor = {
    getMetrics: jest.fn().mockReturnValue({ processed: 0, duplicates: 0 }),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [NotificationController],
      providers: [
        {
          provide: NotificationService,
          useValue: mockNotificationService,
        },
        {
          provide: NotificationLogQueueService,
          useValue: mockNotificationLogQueueService,
        },
        {
          provide: NotificationLogProcessor,
          useValue: mockNotificationLogProcessor,
        },
      ],
    })
      .overrideGuard(AppIdGuard)
      .useValue(new MockUserGuard())
      .overrideGuard(JwtAuthGuard)
      .useValue(new MockUserGuard())
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
    jest.clearAllMocks();
  });

  describe('GET /notifications/v1', () => {
    it('should return notifications list', async () => {
      const mockNotifications: NotificationListResponse = {
        data: [{ id: 1, title: 'Test Notification', content: 'Test content' }],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      };
      mockNotificationService.findAll.mockResolvedValue(mockNotifications);

      const res = await request(app.getHttpServer())
        .get('/notifications/v1')
        .set('X-App-ID', 'com.test.app');
      const response = {
        status: res.status,
        body: res.body as NotificationListResponse,
      };

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(mockNotifications.data);
    });

    it('should handle query parameters', async () => {
      mockNotificationService.findAll.mockResolvedValue({
        data: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
      });

      const res = await request(app.getHttpServer())
        .get('/notifications/v1?page=2&limit=20&startDate=2024-01-01')
        .set('X-App-ID', 'com.test.app');

      expect(res.status).toBe(200);
      expect(mockNotificationService.findAll).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          page: 2,
          limit: 20,
          startDate: '2024-01-01',
        }),
      );
    });
  });

  describe('POST /notifications/v1', () => {
    it('should create notification', async () => {
      const mockResult: CreateNotificationResponse = {
        data: [{ id: 1, status: 'success' }],
        processed: 1,
      };
      mockNotificationService.create.mockResolvedValue(mockResult);

      const res = await request(app.getHttpServer())
        .post('/notifications/v1')
        .set('X-App-ID', 'com.test.app')
        .send({
          package_name: 'com.test.app',
          title: 'Test',
          content: 'Test content',
        });
      const response = {
        status: res.status,
        body: res.body as CreateNotificationResponse,
      };

      expect(response.status).toBe(201);
      expect(response.body.data).toBeDefined();
    });
  });

  describe('POST /notifications/v2', () => {
    it('should create notification with pre-parsed data', async () => {
      const mockResult: CreateNotificationResponse = {
        data: [{ id: 1, status: 'success' }],
        processed: 1,
      };
      mockNotificationService.createV2.mockResolvedValue(mockResult);

      const res = await request(app.getHttpServer())
        .post('/notifications/v2')
        .set('X-App-ID', 'com.test.app')
        .send({
          notificationId: 'com.phonepe.app_1709876543210_abc123',
          packageName: 'com.phonepe.app',
          title: 'Payment Received',
          content: 'You received ₹500 from John Doe',
          timestamp: '2024-01-15T10:30:00.000Z',
          hasTransaction: true,
          amount: '500',
          payerName: 'John Doe',
          transactionType: 'RECEIVED',
        });
      const response = {
        status: res.status,
        body: res.body as CreateNotificationResponse,
      };

      expect(response.status).toBe(201);
      expect(response.body.data).toBeDefined();
      expect(mockNotificationService.createV2).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          notificationId: 'com.phonepe.app_1709876543210_abc123',
          hasTransaction: true,
          amount: '500',
        }),
      );
    });

    it('should validate required fields', async () => {
      const res = await request(app.getHttpServer())
        .post('/notifications/v2')
        .set('X-App-ID', 'com.test.app')
        .send({
          // Missing required fields
          title: 'Test',
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Validation failed');
      expect(res.body.errors).toBeDefined();
    });

    it('should validate transaction type enum', async () => {
      const res = await request(app.getHttpServer())
        .post('/notifications/v2')
        .set('X-App-ID', 'com.test.app')
        .send({
          notificationId: 'test-123',
          packageName: 'com.test.app',
          title: 'Test',
          content: 'Test content',
          timestamp: '2024-01-15T10:30:00.000Z',
          hasTransaction: false,
          transactionType: 'INVALID_TYPE',
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Validation failed');
    });

    it('should validate timestamp format', async () => {
      const res = await request(app.getHttpServer())
        .post('/notifications/v2')
        .set('X-App-ID', 'com.test.app')
        .send({
          notificationId: 'test-123',
          packageName: 'com.test.app',
          title: 'Test',
          content: 'Test content',
          timestamp: 'invalid-date',
          hasTransaction: false,
          transactionType: 'UNKNOWN',
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Validation failed');
    });

    it('should accept non-transaction notification', async () => {
      const mockResult: CreateNotificationResponse = {
        data: [{ id: 1, status: 'success' }],
        processed: 1,
      };
      mockNotificationService.createV2.mockResolvedValue(mockResult);

      const res = await request(app.getHttpServer())
        .post('/notifications/v2')
        .set('X-App-ID', 'com.test.app')
        .send({
          notificationId: 'com.whatsapp_1709876543210_def456',
          packageName: 'com.whatsapp',
          title: 'New Message',
          content: 'Hello! How are you?',
          timestamp: '2024-01-15T10:30:00.000Z',
          hasTransaction: false,
          transactionType: 'UNKNOWN',
          appName: 'WhatsApp',
        });

      expect(res.status).toBe(201);
      expect(mockNotificationService.createV2).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          hasTransaction: false,
          transactionType: 'UNKNOWN',
        }),
      );
    });
  });

  describe('PATCH /notifications/status', () => {
    it('should update notification status', async () => {
      mockNotificationService.updateStatus.mockResolvedValue({
        success: true,
        notificationLogId: 123,
        updated: {
          notificationLog: { ttsAnnounced: true },
          enhanced: { ttsAnnounced: true, teamNotificationSent: false },
        },
      });

      const res = await request(app.getHttpServer())
        .patch('/notifications/status')
        .set('X-App-ID', 'com.test.app')
        .send({
          notificationLogId: 123,
          ttsAnnounced: true,
          teamNotificationSent: false,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(mockNotificationService.updateStatus).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          notificationLogId: 123,
          ttsAnnounced: true,
          teamNotificationSent: false,
        }),
      );
    });
  });

  describe('GET /notifications/test', () => {
    it('should poll test notification', async () => {
      mockNotificationService.pollTestNotification.mockResolvedValue({
        found: false,
      });

      const res = await request(app.getHttpServer())
        .get('/notifications/test')
        .set('X-App-ID', 'com.test.app');
      const response = {
        status: res.status,
        body: res.body as TestNotificationResponse,
      };

      expect(response.status).toBe(200);
      expect(response.body.found).toBe(false);
    });
  });

  describe('POST /notifications/test', () => {
    it('should create test notification', async () => {
      mockNotificationService.createTestNotification.mockResolvedValue({
        success: true,
        id: 1,
      });

      const res = await request(app.getHttpServer())
        .post('/notifications/test')
        .set('X-App-ID', 'com.test.app')
        .send({ action: 'create' });
      const response = {
        status: res.status,
        body: res.body as TestNotificationResponse,
      };

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it('should acknowledge test notification', async () => {
      mockNotificationService.ackTestNotification.mockResolvedValue({
        success: true,
      });

      const res = await request(app.getHttpServer())
        .post('/notifications/test')
        .set('X-App-ID', 'com.test.app')
        .send({ action: 'ack', id: 1 });
      const response = {
        status: res.status,
        body: res.body as TestNotificationResponse,
      };

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it('should throw error for invalid action', async () => {
      const res = await request(app.getHttpServer())
        .post('/notifications/test')
        .set('X-App-ID', 'com.test.app')
        .send({ action: 'invalid' });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /notifications/register', () => {
    it('should register push token', async () => {
      mockNotificationService.registerPushToken.mockResolvedValue({
        success: true,
      });

      const res = await request(app.getHttpServer())
        .post('/notifications/register')
        .set('X-App-ID', 'com.test.app')
        .send({
          token: 'fcm-token-123',
          appId: 'com.test.app',
        });
      const response = {
        status: res.status,
        body: res.body as PushTokenResponse,
      };

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });
  });

  describe('DELETE /notifications/register', () => {
    it('should delete push token', async () => {
      mockNotificationService.deletePushToken.mockResolvedValue({
        success: true,
      });

      const res = await request(app.getHttpServer())
        .delete('/notifications/register')
        .set('X-App-ID', 'com.test.app')
        .send({
          token: 'fcm-token-123',
          appId: 'com.test.app',
        });
      const response = {
        status: res.status,
        body: res.body as PushTokenResponse,
      };

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});
