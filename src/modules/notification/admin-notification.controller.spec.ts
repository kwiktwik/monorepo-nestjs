import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AdminNotificationController } from './admin-notification.controller';
import { NotificationService } from './notification.service';

describe('AdminNotificationController', () => {
  let app: INestApplication;
  let notificationService: jest.Mocked<NotificationService>;

  const mockNotificationService = {
    findUserByPhone: jest.fn(),
    createTestNotification: jest.fn(),
    sendTestNotificationByPhone: jest.fn(),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AdminNotificationController],
      providers: [
        {
          provide: NotificationService,
          useValue: mockNotificationService,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    notificationService = moduleFixture.get(NotificationService);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
    jest.clearAllMocks();
  });

  describe('POST /admin/notifications/send-test', () => {
    it('should send notification to existing user', async () => {
      const mockUser = {
        id: 'user-123',
        name: 'Test User',
        phoneNumber: '+919876543210',
      };
      const mockNotification = { success: true, id: 1 };

      mockNotificationService.sendTestNotificationByPhone.mockResolvedValue({
        success: true,
        user: mockUser,
        notification: mockNotification,
      });

      const response = await request(app.getHttpServer())
        .post('/admin/notifications/send-test')
        .send({
          phoneNumber: '+919876543210',
          payload: { message: 'Test notification', amount: 100 },
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.user).toEqual(mockUser);
      expect(response.body.notification).toEqual(mockNotification);
      expect(
        mockNotificationService.sendTestNotificationByPhone,
      ).toHaveBeenCalledWith('+919876543210', undefined, {
        message: 'Test notification',
        amount: 100,
      });
    });

    it('should return error for non-existing user', async () => {
      mockNotificationService.sendTestNotificationByPhone.mockResolvedValue({
        success: false,
        error: 'User not found',
      });

      const response = await request(app.getHttpServer())
        .post('/admin/notifications/send-test')
        .send({
          phoneNumber: '+919999999999',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('User not found');
    });

    it('should send notification without payload', async () => {
      const mockUser = {
        id: 'user-123',
        name: 'Test User',
        phoneNumber: '+919876543210',
      };

      mockNotificationService.sendTestNotificationByPhone.mockResolvedValue({
        success: true,
        user: mockUser,
        notification: { success: true, id: 2 },
      });

      const response = await request(app.getHttpServer())
        .post('/admin/notifications/send-test')
        .send({
          phoneNumber: '+919876543210',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(
        mockNotificationService.sendTestNotificationByPhone,
      ).toHaveBeenCalledWith('+919876543210', undefined, undefined);
    });

    it('should handle empty phone number', async () => {
      mockNotificationService.sendTestNotificationByPhone.mockResolvedValue({
        success: false,
        error: 'User not found',
      });

      const response = await request(app.getHttpServer())
        .post('/admin/notifications/send-test')
        .send({
          phoneNumber: '',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(false);
    });

    it('should handle complex payload', async () => {
      const complexPayload = {
        message: 'Payment received',
        amount: 1500.5,
        transactionType: 'RECEIVED',
        payerName: 'John Doe',
        metadata: {
          orderId: 'order-123',
          timestamp: new Date().toISOString(),
        },
      };

      mockNotificationService.sendTestNotificationByPhone.mockResolvedValue({
        success: true,
        user: { id: 'user-1', name: 'Test', phoneNumber: '+919876543210' },
        notification: { success: true, id: 3 },
      });

      const response = await request(app.getHttpServer())
        .post('/admin/notifications/send-test')
        .send({
          phoneNumber: '+919876543210',
          payload: complexPayload,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(
        mockNotificationService.sendTestNotificationByPhone,
      ).toHaveBeenCalledWith('+919876543210', undefined, complexPayload);
    });
  });
});
