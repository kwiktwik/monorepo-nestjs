/**
 * Shared test-module bootstrap for payment-gateway integration tests.
 *
 * Manually composes only the service layer (no controllers, no guards,
 * no Prometheus metrics) so we avoid deep dependency chains into Redis,
 * prom-client, JWT, etc. Tests exercise the service + provider layer
 * directly — the HTTP/controller layer is not under test here.
 */
import { Test, type TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import nock from 'nock';

// Services
import { SubscriptionManagerService } from '../../services/subscription-manager.service';
import { WebhookHandlerService } from '../../services/webhook-handler.service';
import { SubscriptionStateMachineService } from '../../services/subscription-state-machine.service';
import { PaymentConfigService } from '../../config/payment-config.service';
import { WebhookProcessorService } from '../../webhooks/webhook-processor.service';
import { IdempotencyService, InMemoryIdempotencyStore } from '../../common/idempotency/idempotency.service';
import { InMemoryEventBus } from '../../common/events/in-memory-event-bus';
import { EncryptionService } from '../../common/security/encryption.service';
import { CircuitBreakerService } from '../../common/resilience/circuit-breaker.service';
import { ProviderFactory } from '../../providers/factory/provider.factory';
import { BillingSchedulerService } from '../../scheduler/billing-scheduler.service';

// Repositories (in-memory for tests)
import { InMemorySubscriptionRepository } from '../../infrastructure/repositories/in-memory-subscription.repository';
import { InMemoryOrderRepository } from '../../infrastructure/repositories/in-memory-order.repository';
import type { ISubscriptionRepository } from '../../infrastructure/repositories/subscription.repository.interface';
import type { IOrderRepository } from '../../infrastructure/repositories/order.repository.interface';

// Database token (optional injection in services)
import { DRIZZLE_TOKEN } from '../../../../database/drizzle.module';

import {
  TEST_RAZORPAY_WEBHOOK_SECRET,
  TEST_PHONEPE_SALT_KEY,
} from './webhook-payloads';
import { resetRazorpayCounters } from './fake-razorpay-api';

// ─── Environment (set before module compilation) ────────────────

function setTestEnv(): void {
  // Razorpay credentials (env pattern: RAZORPAY_{APPID}_{ACCOUNTID}_KEY_ID)
  // → parsed appId = "testapp", accountId = "default"
  process.env.RAZORPAY_TESTAPP_DEFAULT_KEY_ID = 'rzp_test_key_id';
  process.env.RAZORPAY_TESTAPP_DEFAULT_KEY_SECRET = 'rzp_test_key_secret';
  process.env.RAZORPAY_TESTAPP_DEFAULT_WEBHOOK_SECRET = TEST_RAZORPAY_WEBHOOK_SECRET;

  // PhonePe credentials (env pattern: PHONEPE_{APPID}_{ACCOUNTID}_CLIENT_ID)
  // → parsed appId = "testapp", accountId = "default"
  process.env.PHONEPE_TESTAPP_DEFAULT_CLIENT_ID = 'pp_test_client_id';
  process.env.PHONEPE_TESTAPP_DEFAULT_CLIENT_SECRET = 'pp_test_client_secret';
  process.env.PHONEPE_TESTAPP_DEFAULT_MERCHANT_ID = 'pp_test_merchant';
  process.env.PHONEPE_TESTAPP_DEFAULT_SALT_KEY = TEST_PHONEPE_SALT_KEY;
  process.env.PHONEPE_TESTAPP_DEFAULT_SALT_INDEX = '1';
  process.env.PHONEPE_TESTAPP_DEFAULT_WEBHOOK_SECRET = TEST_PHONEPE_SALT_KEY;
}

// ─── Handles returned to tests ──────────────────────────────────

export interface TestContext {
  module: TestingModule;
  subscriptionManager: SubscriptionManagerService;
  webhookHandler: WebhookHandlerService;
  configService: PaymentConfigService;
  subscriptionRepo: ISubscriptionRepository;
  orderRepo: IOrderRepository;
}

// ─── Bootstrap ──────────────────────────────────────────────────

export async function createTestApp(): Promise<TestContext> {
  setTestEnv();

  // Circuit breaker with null redis (in-memory fallback)
  const circuitBreaker = new CircuitBreakerService(null);
  const providerFactory = new ProviderFactory(undefined, {
    enableRetryQueue: false,
    maxRetries: 0,
  });

  const module = await Test.createTestingModule({
    imports: [ConfigModule.forRoot({ isGlobal: true }), ScheduleModule.forRoot()],
    providers: [
      // Config
      PaymentConfigService,

      // Provider layer
      { provide: CircuitBreakerService, useValue: circuitBreaker },
      { provide: ProviderFactory, useValue: providerFactory },

      // Core services
      SubscriptionStateMachineService,
      SubscriptionManagerService,
      WebhookHandlerService,
      WebhookProcessorService,

      // Idempotency
      IdempotencyService,
      { provide: 'IdempotencyStore', useClass: InMemoryIdempotencyStore },

      // Event bus
      { provide: 'IEventBus', useClass: InMemoryEventBus },

      // Security
      EncryptionService,

      // Scheduler
      BillingSchedulerService,

      // Repositories
      { provide: 'ISubscriptionRepository', useClass: InMemorySubscriptionRepository },
      { provide: 'IOrderRepository', useClass: InMemoryOrderRepository },

      // Drizzle token — not used in tests (services inject with @Optional)
      { provide: DRIZZLE_TOKEN, useValue: null },
    ],
  }).compile();

  await module.init();

  // Initialize config (reads env vars for provider credentials)
  const configService = module.get(PaymentConfigService);
  await configService.initialize();

  return {
    module,
    subscriptionManager: module.get(SubscriptionManagerService),
    webhookHandler: module.get(WebhookHandlerService),
    configService,
    subscriptionRepo: module.get<ISubscriptionRepository>('ISubscriptionRepository'),
    orderRepo: module.get<IOrderRepository>('IOrderRepository'),
  };
}

export async function destroyTestApp(ctx: TestContext): Promise<void> {
  if (ctx?.module) {
    await ctx.module.close();
  }
}

export function cleanupAfterEach(): void {
  nock.cleanAll();
  nock.enableNetConnect();
  resetRazorpayCounters();
}
