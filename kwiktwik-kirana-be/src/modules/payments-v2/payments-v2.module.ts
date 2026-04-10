/**
 * Payments V2 NestJS Module
 */

import { Module, Global, OnModuleInit } from '@nestjs/common';
import { SubscriptionStateMachineService } from './services/subscription-state-machine.service';
import { SubscriptionManagerService } from './services/subscription-manager.service';
import { WebhookHandlerService } from './services/webhook-handler.service';
import { PaymentConfigService } from './config/payment-config.service';
import { ProviderFactory } from './providers/factory/provider.factory';
import { WebhookController } from './controllers/webhook.controller';
import { InMemorySubscriptionRepository } from './infrastructure/repositories/in-memory-subscription.repository';
import { InMemoryOrderRepository } from './infrastructure/repositories/in-memory-order.repository';
import type { ISubscriptionRepository } from './infrastructure/repositories/subscription.repository.interface';
import type { IOrderRepository } from './infrastructure/repositories/order.repository.interface';

/**
 * Payments V2 Module
 * 
 * Provides:
 * - Subscription state machine
 * - Provider factory
 * - Subscription manager
 * - Webhook handler
 * - Payment configuration
 * - Webhook endpoints
 * - Repository implementations
 */
@Global()
@Module({
  controllers: [WebhookController],
  providers: [
    // Configuration
    PaymentConfigService,
    
    // Provider Factory
    ProviderFactory,
    
    // Services
    SubscriptionStateMachineService,
    SubscriptionManagerService,
    WebhookHandlerService,
    
    // Repositories (in-memory by default, override with database implementation)
    {
      provide: 'ISubscriptionRepository',
      useClass: InMemorySubscriptionRepository,
    },
    {
      provide: 'IOrderRepository',
      useClass: InMemoryOrderRepository,
    },
  ],
  exports: [
    PaymentConfigService,
    ProviderFactory,
    SubscriptionStateMachineService,
    SubscriptionManagerService,
    WebhookHandlerService,
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
