import { Test, TestingModule } from '@nestjs/testing';
import { RazorpayController } from './razorpay.controller';
import { INestApplication, BadRequestException } from '@nestjs/common';
import request from 'supertest';
import { AppIdGuard } from '../../common/guards/app-id.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ExecutionContext } from '@nestjs/common';

jest.mock('./razorpay.service', () => ({
  RazorpayService: jest.fn().mockImplementation(() => ({
    createSubscriptionV2: jest.fn(),
    verifyPayment: jest.fn(),
    getDynamicPlanId: jest.fn(),
  })),
}));

import { RazorpayService } from './razorpay.service';

class MockUserGuard {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    req.user = { userId: 'test-user-id', appId: 'com.test.app' };
    return true;
  }
}

describe('RazorpayController', () => {
  let app: INestApplication;
  let razorpayService: jest.Mocked<RazorpayService>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [RazorpayController],
      providers: [
        {
          provide: RazorpayService,
          useValue: {
            createSubscriptionV2: jest.fn(),
            verifyPayment: jest.fn(),
            getDynamicPlanId: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(AppIdGuard)
      .useValue(new MockUserGuard())
      .overrideGuard(JwtAuthGuard)
      .useValue(new MockUserGuard())
      .compile();

    app = moduleFixture.createNestApplication();
    razorpayService = moduleFixture.get(RazorpayService);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
    jest.clearAllMocks();
  });

  describe('POST /razorpay/subscriptions/v2', () => {
    it('should create subscription with intent flow', async () => {
      (razorpayService.createSubscriptionV2 as jest.Mock).mockResolvedValue({
        subscription: { id: 'sub_123' },
        razorpaySubscription: { key: 'key_123' },
        subscriptionId: 'local_sub_123',
        message: 'Subscription created',
      });

      const response = await request(app.getHttpServer())
        .post('/razorpay/subscriptions/v2')
        .set('X-App-ID', 'com.test.app')
        .send({
          plan_id: 'plan_123',
          quantity: 1,
          flow: 'intent',
          notes: {
            email: 'test@example.com',
            contact: '9876543210',
          },
        });

      expect(response.status).toBe(201);
      expect(response.body.subscription).toBeDefined();
    });

    it('should handle missing email and contact', async () => {
      (razorpayService.createSubscriptionV2 as jest.Mock).mockRejectedValue(
        new BadRequestException('email and contact are required'),
      );

      const response = await request(app.getHttpServer())
        .post('/razorpay/subscriptions/v2')
        .set('X-App-ID', 'com.test.app')
        .send({
          notes: {},
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /razorpay/verify', () => {
    it('should verify payment successfully', async () => {
      (razorpayService.verifyPayment as jest.Mock).mockResolvedValue({
        verified: true,
      });

      const response = await request(app.getHttpServer())
        .post('/razorpay/verify')
        .set('X-App-ID', 'com.test.app')
        .send({
          razorpay_payment_id: 'pay_123',
          razorpay_signature: 'valid_signature',
          razorpay_subscription_id: 'sub_123',
        });

      expect(response.status).toBe(201);
      expect(response.body.verified).toBe(true);
    });

    it('should handle missing subscription or order id', async () => {
      (razorpayService.verifyPayment as jest.Mock).mockRejectedValue(
        new BadRequestException(
          'Either razorpay_subscription_id or razorpay_order_id is required',
        ),
      );

      const response = await request(app.getHttpServer())
        .post('/razorpay/verify')
        .set('X-App-ID', 'com.test.app')
        .send({
          razorpay_payment_id: 'pay_123',
          razorpay_signature: 'signature',
        });

      expect(response.status).toBe(400);
    });
  });
});
