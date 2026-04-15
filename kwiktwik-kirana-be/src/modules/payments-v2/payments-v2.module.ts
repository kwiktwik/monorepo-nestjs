/**
 * Payments V2 NestJS Module
 * 
 * Provides a unified payment system supporting multiple providers:
 * - Razorpay (subscriptions, one-time payments)
 * - PhonePe (UPI Autopay, UPI Mandate, one-time payments)
 * 
 * Key features:
 * - Provider-agnostic subscription management
 * - Unified state machine for subscription/order statuses
 * - Unified error handling with provider error mappers
 * - Normalized webhook processing
 * - Idempotency support for safe retries
 * - Event-driven architecture for loose coupling
 * - Drizzle ORM for persistent storage
 * - Encryption for sensitive credentials
 * - Scheduled billing for user-managed subscriptions
 */

import { Module, Global, OnModuleInit } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

// Services
import { SubscriptionStateMachineService } from './services/subscription-state-machine.service';
import { SubscriptionManagerService } from './services/subscription-manager.service';
import { WebhookHandlerService } from './services/webhook-handler.service';
import { PaymentConfigService } from './config/payment-config.service';

// New Services
import { WebhookProcessorService } from './webhooks/webhook-processor.service';
import { IdempotencyService, InMemoryIdempotencyStore } from './common/idempotency/idempotency.service';

// Scheduler
import { BillingSchedulerService } from './scheduler/billing-scheduler.service';

// Event Bus
import { InMemoryEventBus } from './common/events/in-memory-event-bus';
import type { IEventBus } from './common/events/event-bus.interface';

// Security
import { EncryptionService } from './common/security/encryption.service';

// Provider Factory
import { ProviderFactory } from './providers/factory/provider.factory';

// Controllers
import { WebhookController } from './controllers/webhook.controller';
import { SubscriptionApiController } from './controllers/subscription-api.controller';

// Repositories
import { InMemorySubscriptionRepository } from './infrastructure/repositories/in-memory-subscription.repository';
import { InMemoryOrderRepository } from './infrastructure/repositories/in-memory-order.repository';
import { DrizzleSubscriptionRepository } from './infrastructure/repositories/drizzle-subscription.repository';
import { DrizzleOrderRepository } from './infrastructure/repositories/drizzle-order.repository';

// Types
import type { ISubscriptionRepository } from './infrastructure/repositories/subscription.repository.interface';
import type { IOrderRepository } from './infrastructure/repositories/order.repository.interface';

// Database
import { DRIZZLE_TOKEN } from '../../database/drizzle.module';

// Feature flags
const USE_DATABASE_REPOSITORIES = process.env.PAYMENT_USE_DB_REPOS !== 'false';
const ENABLE_BILLING_SCHEDULER = process.env.PAYMENT_BILLING_SCHEDULER_ENABLED !== 'false';

/**
 * Payments V2 Module
 * 
 * Provides:
 * - Subscription state machine
 * - Provider factory with multi-provider support
 * - Subscription manager (PROVIDER_MANAGED and USER_MANAGED)
 * - Unified webhook handler
 * - Payment configuration
 * - Webhook endpoints
 * - Repository implementations (in-memory or Drizzle)
 * - Idempotency service for safe retries
 * - Event bus for async processing
 * - Encryption service for credentials
 * - Scheduled billing for user-managed subscriptions
 */
@Global()
@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [WebhookController, SubscriptionApiController],
  providers: [
    // Configuration
    PaymentConfigService,
    
    // Provider Factory
    ProviderFactory,
    
    // Core Services
    SubscriptionStateMachineService,
    SubscriptionManagerService,
    WebhookHandlerService,
    
    // Webhook Processing
    WebhookProcessorService,
    
    // Idempotency
    IdempotencyService,
    {
      provide: 'IdempotencyStore',
      useClass: InMemoryIdempotencyStore,
    },
    
    // Event Bus
    {
      provide: 'IEventBus',
      useClass: InMemoryEventBus,
    },
    
    // Encryption
    EncryptionService,
    
    // Billing Scheduler (conditionally added based on feature flag)
    ...(ENABLE_BILLING_SCHEDULER ? [BillingSchedulerService] : []),
    
    // Repositories - use Drizzle for production, in-memory for development
    ...(USE_DATABASE_REPOSITORIES
      ? [
          {
            provide: 'ISubscriptionRepository',
            useClass: DrizzleSubscriptionRepository,
          },
          {
            provide: 'IOrderRepository',
            useClass: DrizzleOrderRepository,
          },
        ]
      : [
          {
            provide: 'ISubscriptionRepository',
            useClass: InMemorySubscriptionRepository,
          },
          {
            provide: 'IOrderRepository',
            useClass: InMemoryOrderRepository,
          },
        ]),
  ],
  exports: [
    // Configuration
    PaymentConfigService,
    
    // Provider Factory
    ProviderFactory,
    
    // Core Services
    SubscriptionStateMachineService,
    SubscriptionManagerService,
    WebhookHandlerService,
    
    // Webhook Processing
    WebhookProcessorService,
    
    // Idempotency
    IdempotencyService,
    'IdempotencyStore',
    
    // Event Bus
    'IEventBus',
    
    // Encryption
    EncryptionService,
    
    // Billing Scheduler
    ...(ENABLE_BILLING_SCHEDULER ? [BillingSchedulerService] : []),
    
    // Repositories
    'ISubscriptionRepository',
    'IOrderRepository',
  ],
})
export class PaymentsV2Module implements OnModuleInit {
  constructor(private readonly configService: PaymentConfigService) {}

  onModuleInit(): void {
    this.configService.initialize();
  }
}
