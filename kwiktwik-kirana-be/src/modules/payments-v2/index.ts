/**
 * Payments V2 Module
 * 
 * A unified payment module supporting multiple payment providers
 * with both provider-managed and user-managed subscription types.
 * 
 * Key Features:
 * - Clear state machine with valid transitions
 * - Provider-specific types from documentation (no any/unknown)
 * - Support for Razorpay and PhonePe
 * - Correct subscription cycle mapping for both providers
 * - Event-driven architecture
 * - Drizzle ORM persistence
 * - Encryption for credentials
 * - Scheduled billing for user-managed subscriptions
 */

// ============================================================================
// Module Exports
// ============================================================================

// NestJS Module
export { PaymentsV2Module } from './payments-v2.module';

// Types (primary export for all types)
export * from './types';

// Domain
export * from './domain';

// Providers
export * from './providers';

// Services (excluding types that conflict with types/index.ts)
export {
  SubscriptionStateMachineService,
  SubscriptionManagerService,
  WebhookHandlerService,
} from './services';
export type {
  StateTransitionContext,
  StateMachineResult,
  StateTransitionHandler,
  StateMachineConfig,
} from './services';
export type {
  CreateSubscriptionInput,
  CreateSubscriptionResult,
  ChargeSubscriptionInput,
  ChargeSubscriptionResult,
  CancelSubscriptionInput,
  CancelSubscriptionResult,
} from './services';
export type {
  WebhookProcessResult,
  WebhookVerificationResult,
} from './services';

// Config
export * from './config';

// Controllers
export * from './controllers';

// Infrastructure
export * from './infrastructure';

// Scheduler
export {
  BillingSchedulerService,
  type BillingSchedulerConfig,
  type BillingProcessResult,
  type BillingBatchResult,
} from './scheduler/billing-scheduler.service';

// Event Bus
export type {
  IEventBus,
  PaymentEvent,
  PaymentEventType,
  EventMetadata,
  EventHandler,
  EventHandlerRegistration,
  SubscriptionCreatedPayload,
  SubscriptionActivatedPayload,
  SubscriptionCancelledPayload,
  SubscriptionExpiredPayload,
  PaymentSuccessfulPayload,
  PaymentFailedPayload,
  WebhookReceivedPayload,
} from './common/events/event-bus.interface';
export {
  PaymentEventTypes,
  createPaymentEvent,
  generateCorrelationId,
} from './common/events/event-bus.interface';
export { InMemoryEventBus } from './common/events/in-memory-event-bus';

// Security
export {
  EncryptionService,
  ProviderCredentialsEncryption,
} from './common/security/encryption.service';
export type {
  EncryptedData,
  EncryptionKeyStatus,
} from './common/security/encryption.service';

// Repositories
export { DrizzleSubscriptionRepository } from './infrastructure/repositories/drizzle-subscription.repository';
export { DrizzleOrderRepository } from './infrastructure/repositories/drizzle-order.repository';
