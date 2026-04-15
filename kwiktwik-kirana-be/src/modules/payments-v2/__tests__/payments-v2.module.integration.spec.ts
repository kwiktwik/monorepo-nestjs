/**
 * Payments V2 Module Integration Tests
 * 
 * Tests the full module integration including:
 * - Module compilation
 * - Service injection
 * - Controller endpoints
 * - Repository operations
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import request from 'supertest';
import { PaymentsV2Module } from '../payments-v2.module';
import { SubscriptionManagerService } from '../services/subscription-manager.service';
import { PaymentConfigService } from '../config/payment-config.service';
import { BillingSchedulerService } from '../scheduler/billing-scheduler.service';
import type { ISubscriptionRepository } from '../infrastructure/repositories/subscription.repository.interface';
import type { IOrderRepository } from '../infrastructure/repositories/order.repository.interface';
import { SubscriptionStatus } from '../types/subscription-status.enum';
import { SubscriptionType } from '../types/subscription-type.enum';
import { PaymentProvider } from '../types/provider.enum';

// ============================================================================
// Test Setup
// ============================================================================

describe('PaymentsV2Module (Integration)', () => {
  let app: INestApplication;
  let subscriptionManager: SubscriptionManagerService;
  let configService: PaymentConfigService;
  let billingScheduler: BillingSchedulerService;
  let subscriptionRepo: ISubscriptionRepository;
  let orderRepo: IOrderRepository;

  beforeAll(async () => {
    // Set required environment variables for testing
    process.env.PAYMENT_USE_DB_REPOS = 'false'; // Use in-memory repos for tests
    process.env.PAYMENT_BILLING_SCHEDULER_ENABLED = 'true';
    process.env.RAZORPAY_COM_PAYMENTALERT_APP_KEY_ID = 'test_key_id';
    process.env.RAZORPAY_COM_PAYMENTALERT_APP_KEY_SECRET = 'test_key_secret';
    process.env.RAZORPAY_COM_PAYMENTALERT_APP_WEBHOOK_SECRET = 'test_webhook_secret';
    process.env.PHONEPE_COM_PAYMENTALERT_APP_CLIENT_ID = 'test_client_id';
    process.env.PHONEPE_COM_PAYMENTALERT_APP_CLIENT_SECRET = 'test_client_secret';
    process.env.PHONEPE_COM_PAYMENTALERT_APP_MERCHANT_ID = 'test_merchant_id';
    process.env.PHONEPE_COM_PAYMENTALERT_APP_SALT_KEY = 'test_salt_key';
    process.env.PHONEPE_COM_PAYMENTALERT_APP_SALT_INDEX = '1';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [PaymentsV2Module],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));

    // Get service instances
    subscriptionManager = app.get<SubscriptionManagerService>(SubscriptionManagerService);
    configService = app.get<PaymentConfigService>(PaymentConfigService);
    billingScheduler = app.get<BillingSchedulerService>(BillingSchedulerService);
    subscriptionRepo = app.get<ISubscriptionRepository>('ISubscriptionRepository');
    orderRepo = app.get<IOrderRepository>('IOrderRepository');

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  // ============================================================================
  // Module Compilation Tests
  // ============================================================================

  describe('module compilation', () => {
    it('should compile successfully', () => {
      expect(app).toBeDefined();
    });

    it('should provide SubscriptionManagerService', () => {
      expect(subscriptionManager).toBeDefined();
    });

    it('should provide PaymentConfigService', () => {
      expect(configService).toBeDefined();
    });

    it('should provide BillingSchedulerService', () => {
      expect(billingScheduler).toBeDefined();
    });

    it('should provide ISubscriptionRepository', () => {
      expect(subscriptionRepo).toBeDefined();
    });

    it('should provide IOrderRepository', () => {
      expect(orderRepo).toBeDefined();
    });
  });

  // ============================================================================
  // Configuration Tests
  // ============================================================================

  describe('configuration', () => {
    it('should initialize config service', () => {
      const registeredApps = configService.getRegisteredAppIds();
      expect(registeredApps).toBeDefined();
    });

    it('should load Razorpay configurations', () => {
      const configs = configService.getRazorpayConfigs();
      expect(configs).toBeDefined();
    });

    it('should load PhonePe configurations', () => {
      const configs = configService.getPhonePeConfigs();
      expect(configs).toBeDefined();
    });

    it('should get plan configuration', () => {
      const plan = configService.getPlanConfig('com.paymentalert.app', 'premium_monthly');
      expect(plan).toBeDefined();
      expect(plan?.initialAmount).toBeDefined();
      expect(plan?.recurringAmount).toBeDefined();
    });
  });

  // ============================================================================
  // Repository Tests
  // ============================================================================

  describe('subscription repository', () => {
    const testSubscription = {
      id: 'test_sub_123',
      merchantSubscriptionId: 'merchant_test_sub_123',
      userId: 'user_123',
      appId: 'com.paymentalert.app',
      subscriptionType: SubscriptionType.USER_MANAGED,
      provider: PaymentProvider.RAZORPAY,
      planId: 'premium_monthly',
      pricing: {
        initialAmount: 4900,
        recurringAmount: 4900,
        currency: 'INR',
        frequency: 'MONTHLY' as const,
        totalCycles: null,
      },
      status: SubscriptionStatus.CREATED,
      providerData: {
        subscriptionId: '',
        orderId: null,
        customerId: null,
        planId: '',
        mandateId: null,
        raw: {},
        lastSyncedAt: new Date(),
      },
      billingCycleCount: 0,
      nextBillingDate: null,
      lastBillingDate: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      activatedAt: null,
      cancelledAt: null,
      expiredAt: null,
      retryConfig: null,
      paymentFailures: [],
      consecutiveFailures: 0,
      isPremium: false,
      metadata: {
        environment: 'SANDBOX' as const,
        configId: 'test_config',
        source: 'api',
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: [],
        custom: {},
      },
    };

    it('should save a subscription', async () => {
      await subscriptionRepo.save(testSubscription as any);
      const found = await subscriptionRepo.findById('test_sub_123');
      expect(found).toBeDefined();
      expect(found?.id).toBe('test_sub_123');
    });

    it('should find subscription by merchant ID', async () => {
      await subscriptionRepo.save(testSubscription as any);
      const found = await subscriptionRepo.findByMerchantId('merchant_test_sub_123');
      expect(found).toBeDefined();
      expect(found?.merchantSubscriptionId).toBe('merchant_test_sub_123');
    });

    it('should find subscriptions by user ID', async () => {
      await subscriptionRepo.save(testSubscription as any);
      const found = await subscriptionRepo.findByUserId('user_123');
      expect(found).toBeDefined();
      expect(found.length).toBeGreaterThan(0);
    });

    it('should find subscriptions needing billing', async () => {
      // Create a subscription that needs billing
      const needsBilling = {
        ...testSubscription,
        id: 'test_sub_needs_billing',
        merchantSubscriptionId: 'merchant_needs_billing',
        status: SubscriptionStatus.ACTIVE,
        nextBillingDate: new Date(Date.now() - 3600000), // 1 hour ago
      };
      await subscriptionRepo.save(needsBilling as any);

      const found = await subscriptionRepo.findNeedingBilling();
      expect(found).toBeDefined();
      expect(found.some(s => s.id === 'test_sub_needs_billing')).toBe(true);
    });
  });

  // ============================================================================
  // Billing Scheduler Tests
  // ============================================================================

  describe('billing scheduler', () => {
    it('should return status', () => {
      const status = billingScheduler.getStatus();
      expect(status).toHaveProperty('enabled');
      expect(status).toHaveProperty('isRunning');
    });

    it('should trigger manual billing run', async () => {
      const result = await billingScheduler.triggerBillingRun();
      expect(result).toHaveProperty('processed');
      expect(result).toHaveProperty('successful');
      expect(result).toHaveProperty('failed');
      expect(result).toHaveProperty('skipped');
      expect(result).toHaveProperty('durationMs');
    });
  });

  // ============================================================================
  // Subscription Manager Tests
  // ============================================================================

  describe('subscription manager', () => {
    it('should get subscription by ID', async () => {
      const subscription = await subscriptionManager.getSubscription('test_sub_123');
      expect(subscription).toBeDefined();
    });

    it('should get subscription by merchant ID', async () => {
      const subscription = await subscriptionManager.getSubscriptionByMerchantId('merchant_test_sub_123');
      expect(subscription).toBeDefined();
    });

    it('should get active subscriptions for user', async () => {
      const subscriptions = await subscriptionManager.getActiveSubscriptions('user_123');
      expect(subscriptions).toBeDefined();
    });
  });

  // ============================================================================
  // Webhook Controller Tests
  // ============================================================================

  describe('webhook controller', () => {
    it('should accept Razorpay webhooks', () => {
      return request(app.getHttpServer())
        .post('/webhooks/razorpay')
        .send({
          entity: 'event',
          event: 'payment.captured',
          payload: {
            payment: {
              entity: {
                id: 'pay_test',
                amount: 4900,
                currency: 'INR',
                status: 'captured',
              },
            },
          },
        })
        .expect(201);
    });

    it('should accept PhonePe webhooks', () => {
      return request(app.getHttpServer())
        .post('/webhooks/phonepe')
        .send({
          type: 'SUBSCRIPTION_REDEMPTION_ORDER_COMPLETED',
          data: {
            subscriptionId: 'sub_test',
            orderId: 'order_test',
            amount: 4900,
            state: 'COMPLETED',
          },
        })
        .expect(201);
    });
  });
});

// ============================================================================
// Subscription API Controller Integration Tests
// ============================================================================

describe('Subscription API Controller (Integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.PAYMENT_USE_DB_REPOS = 'false';
    process.env.RAZORPAY_COM_PAYMENTALERT_APP_KEY_ID = 'test_key_id';
    process.env.RAZORPAY_COM_PAYMENTALERT_APP_KEY_SECRET = 'test_key_secret';
    process.env.RAZORPAY_COM_PAYMENTALERT_APP_WEBHOOK_SECRET = 'test_webhook_secret';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [PaymentsV2Module],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /v1/subscriptions', () => {
    it('should return 401 without auth', () => {
      return request(app.getHttpServer())
        .get('/v1/subscriptions')
        .expect(401);
    });
  });

  describe('POST /v1/subscriptions', () => {
    it('should return 401 without auth', () => {
      return request(app.getHttpServer())
        .post('/v1/subscriptions')
        .send({
          planId: 'premium_monthly',
          provider: 'RAZORPAY',
          subscriptionType: 'PROVIDER_MANAGED',
        })
        .expect(401);
    });
  });

  describe('POST /v1/subscriptions/:id/cancel', () => {
    it('should return 401 without auth', () => {
      return request(app.getHttpServer())
        .post('/v1/subscriptions/test_id/cancel')
        .expect(401);
    });
  });

  describe('POST /v1/subscriptions/:id/verify', () => {
    it('should return 401 without auth', () => {
      return request(app.getHttpServer())
        .post('/v1/subscriptions/test_id/verify')
        .expect(401);
    });
  });
});
