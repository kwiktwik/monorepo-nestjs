import { Test, TestingModule } from '@nestjs/testing';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
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
    createTestNotification: jest.fn(),
    pollTestNotification: jest.fn(),
    ackTestNotification: jest.fn(),
    registerPushToken: jest.fn(),
    deletePushToken: jest.fn(),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [NotificationController],
      providers: [
        {
          provide: NotificationService,
          useValue: mockNotificationService,
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
    await app.close();
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
