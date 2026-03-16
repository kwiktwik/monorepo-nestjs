import { Test, TestingModule } from '@nestjs/testing';
import { RazorpayWebhookController } from './razorpay-webhook.controller';
import { RazorpayWebhookService } from './razorpay-webhook.service';
import { INestApplication, BadRequestException } from '@nestjs/common';
import request from 'supertest';

interface WebhookResponse {
  received: boolean;
}

describe('RazorpayWebhookController', () => {
  let app: INestApplication;

  const mockWebhookService = {
    processWebhook: jest.fn(),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [RazorpayWebhookController],
      providers: [
        {
          provide: RazorpayWebhookService,
          useValue: mockWebhookService,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
    jest.clearAllMocks();
  });

  describe('POST /razorpay/webhook', () => {
    it('should process webhook successfully', async () => {
      mockWebhookService.processWebhook.mockResolvedValue({ received: true });

      const res = await request(app.getHttpServer())
        .post('/razorpay/webhook')
        .set('x-razorpay-signature', 'valid-signature')
        .set('x-razorpay-event-id', 'test-event-123')
        .send({ event: 'payment.authorized', account_id: 'acc_test_123' });
      const response = {
        status: res.status,
        body: res.body as WebhookResponse,
      };

      expect(response.status).toBe(201);
      expect(response.body.received).toBe(true);
    });

    it('should handle missing account_id', async () => {
      const res = await request(app.getHttpServer())
        .post('/razorpay/webhook')
        .set('x-razorpay-signature', 'signature')
        .set('x-razorpay-event-id', 'test-event-123')
        .send({ event: 'payment.authorized' });

      expect(res.status).toBe(400);
    });

    it('should handle missing signature', async () => {
      const res = await request(app.getHttpServer())
        .post('/razorpay/webhook')
        .set('x-razorpay-event-id', 'test-event-123')
        .send({ event: 'payment.authorized', account_id: 'acc_test_123' });

      expect(res.status).toBe(401);
    });

    it('should handle missing event ID', async () => {
      const res = await request(app.getHttpServer())
        .post('/razorpay/webhook')
        .set('x-razorpay-signature', 'valid-signature')
        .send({ event: 'payment.authorized', account_id: 'acc_test_123' });

      expect(res.status).toBe(400);
    });

    it('should handle invalid signature', async () => {
      mockWebhookService.processWebhook.mockRejectedValue(
        new BadRequestException('Invalid signature'),
      );

      const res = await request(app.getHttpServer())
        .post('/razorpay/webhook')
        .set('x-razorpay-signature', 'invalid-signature')
        .set('x-razorpay-event-id', 'test-event-123')
        .send({ event: 'payment.authorized', account_id: 'acc_test_123' });

      expect(res.status).toBe(400);
    });
  });
});
