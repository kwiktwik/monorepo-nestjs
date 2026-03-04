import { Test, TestingModule } from '@nestjs/testing';
import { RazorpayWebhookController } from './razorpay-webhook.controller';
import { RazorpayWebhookService } from './razorpay-webhook.service';
import { INestApplication, BadRequestException } from '@nestjs/common';
import request from 'supertest';

describe('RazorpayWebhookController', () => {
  let app: INestApplication;
  let webhookService: jest.Mocked<RazorpayWebhookService>;

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
    webhookService = moduleFixture.get(RazorpayWebhookService);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
    jest.clearAllMocks();
  });

  describe('POST /razorpay/webhook', () => {
    it('should process webhook successfully', async () => {
      mockWebhookService.processWebhook.mockResolvedValue({ received: true });

      const response = await request(app.getHttpServer())
        .post('/razorpay/webhook?appId=com.test.app')
        .set('x-razorpay-signature', 'valid-signature')
        .send({ event: 'payment.authorized' });

      expect(response.status).toBe(201);
      expect(response.body.received).toBe(true);
    });

    it('should handle missing appId', async () => {
      const response = await request(app.getHttpServer())
        .post('/razorpay/webhook')
        .set('x-razorpay-signature', 'signature')
        .send({});

      expect(response.status).toBe(400);
    });

    it('should handle missing signature', async () => {
      const response = await request(app.getHttpServer())
        .post('/razorpay/webhook?appId=com.test.app')
        .send({ event: 'payment.authorized' });

      expect(response.status).toBe(401);
    });

    it('should handle invalid signature', async () => {
      mockWebhookService.processWebhook.mockRejectedValue(
        new BadRequestException('Invalid signature'),
      );

      const response = await request(app.getHttpServer())
        .post('/razorpay/webhook?appId=com.test.app')
        .set('x-razorpay-signature', 'invalid-signature')
        .send({ event: 'payment.authorized' });

      expect(response.status).toBe(400);
    });
  });
});
