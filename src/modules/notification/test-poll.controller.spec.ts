import { Test, TestingModule } from '@nestjs/testing';
import { TestPollController } from './test-poll.controller';
import { NotificationService } from './notification.service';
import {
  INestApplication,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';
import request from 'supertest';
import { AppIdGuard } from '../../common/guards/app-id.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

class MockUserGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    req.user = { userId: 'test-user-id', appId: 'com.test.app' };
    return true;
  }
}

describe('TestPollController', () => {
  let app: INestApplication;
  let notificationService: jest.Mocked<NotificationService>;

  const mockNotificationService = {
    pollTestNotification: jest.fn(),
    createTestNotification: jest.fn(),
    ackTestNotification: jest.fn(),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [TestPollController],
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
    notificationService = moduleFixture.get(NotificationService);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
    jest.clearAllMocks();
  });

  describe('GET /test/poll', () => {
    it('should poll for test notification', async () => {
      mockNotificationService.pollTestNotification.mockResolvedValue({
        found: false,
      });

      const response = await request(app.getHttpServer())
        .get('/test/poll')
        .set('X-App-ID', 'com.test.app');

      expect(response.status).toBe(200);
      expect(response.body.found).toBe(false);
    });

    it('should return found notification', async () => {
      mockNotificationService.pollTestNotification.mockResolvedValue({
        found: true,
        notification: { id: 1, payload: { message: 'test' } },
      });

      const response = await request(app.getHttpServer())
        .get('/test/poll')
        .set('X-App-ID', 'com.test.app');

      expect(response.status).toBe(200);
      expect(response.body.found).toBe(true);
      expect(response.body.notification).toBeDefined();
    });
  });

  describe('POST /test/poll', () => {
    it('should create test notification', async () => {
      mockNotificationService.createTestNotification.mockResolvedValue({
        success: true,
        id: 1,
      });

      const response = await request(app.getHttpServer())
        .post('/test/poll')
        .set('X-App-ID', 'com.test.app')
        .send({ action: 'create' });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it('should acknowledge test notification', async () => {
      mockNotificationService.ackTestNotification.mockResolvedValue({
        success: true,
      });

      const response = await request(app.getHttpServer())
        .post('/test/poll')
        .set('X-App-ID', 'com.test.app')
        .send({ action: 'ack', id: 1 });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it('should throw error for missing notification ID on ack', async () => {
      const response = await request(app.getHttpServer())
        .post('/test/poll')
        .set('X-App-ID', 'com.test.app')
        .send({ action: 'ack' });

      expect(response.status).toBe(400);
    });

    it('should throw error for invalid action', async () => {
      const response = await request(app.getHttpServer())
        .post('/test/poll')
        .set('X-App-ID', 'com.test.app')
        .send({ action: 'invalid' });

      expect(response.status).toBe(400);
    });
  });
});
