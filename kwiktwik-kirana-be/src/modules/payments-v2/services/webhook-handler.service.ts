/**
 * Webhook Handler Service
 * 
 * Handles webhook events from Razorpay and PhonePe.
 * Routes events to appropriate handlers based on event type.
 */

import { Injectable, Logger, Inject, Optional } from '@nestjs/common';
import { SubscriptionStateMachineService } from './subscription-state-machine.service';
import { ProviderFactory } from '../providers/factory/provider.factory';
import { PaymentConfigService } from '../config/payment-config.service';
import type { ISubscriptionRepository } from '../infrastructure/repositories/subscription.repository.interface';
import type { IOrderRepository } from '../infrastructure/repositories/order.repository.interface';
import { InMemorySubscriptionRepository } from '../infrastructure/repositories/in-memory-subscription.repository';
import { InMemoryOrderRepository } from '../infrastructure/repositories/in-memory-order.repository';
import type { WebhookEvent } from '../providers/interfaces/subscription-provider.interface';
import { PaymentProvider } from '../types/provider.enum';
import { SubscriptionType } from '../types/subscription-type.enum';
import { SubscriptionStatus, StateMachineEvent } from '../types/subscription-status.enum';
import { transitionSubscriptionStatus, recordSuccessfulPayment, recordPaymentFailure } from '../domain/entities/subscription.entity';
import { createPaymentFailure } from '../domain/entities/subscription.entity';
import { mapRazorpaySubscriptionStatus } from '../types/razorpay.types';
import { mapPhonePeSubscriptionState } from '../types/phonepe.types';

// ============================================================================
// Types
// ============================================================================

/**
 * Webhook processing result
 */
export interface WebhookProcessResult {
  readonly success: boolean;
  readonly eventId: string;
  readonly eventType: string;
  readonly subscriptionId: string | null;
  readonly orderId: string | null;
  readonly error: string | null;
}

/**
 * Webhook handler function type
 */
export type WebhookHandler = (event: WebhookEvent) => Promise<WebhookProcessResult>;

/**
 * Webhook verification result
 */
export interface WebhookVerificationResult {
  readonly valid: boolean;
  readonly provider: PaymentProvider | null;
  readonly configId: string | null;
}

// ============================================================================
// Service
// ============================================================================

/**
 * Webhook Handler Service
 * 
 * Processes webhooks from payment providers.
 */
@Injectable()
export class WebhookHandlerService {
  private readonly logger = new Logger(WebhookHandlerService.name);
  private readonly handlers: Map<string, WebhookHandler> = new Map();

  constructor(
    private readonly stateMachine: SubscriptionStateMachineService,
    private readonly providerFactory: ProviderFactory,
    private readonly configService: PaymentConfigService,
    @Inject('ISubscriptionRepository') @Optional() private readonly subscriptionRepository: ISubscriptionRepository,
    @Inject('IOrderRepository') @Optional() private readonly orderRepository: IOrderRepository,
  ) {
    this.registerDefaultHandlers();
  }

  /**
   * Get subscription repository (with fallback to in-memory)
   */
  private getSubscriptionRepo(): ISubscriptionRepository {
    return this.subscriptionRepository ?? new InMemorySubscriptionRepository();
  }

  /**
   * Get order repository (with fallback to in-memory)
   */
  private getOrderRepo(): IOrderRepository {
    return this.orderRepository ?? new InMemoryOrderRepository();
  }

  /**
   * Process a webhook event
   */
  async processWebhook(
    provider: PaymentProvider,
    payload: string | Record<string, unknown>,
    signature: string,
    headers: Record<string, string>,
  ): Promise<WebhookProcessResult> {
    try {
      // Verify signature and get config
      const verification = await this.verifyWebhook(provider, payload, signature);
      if (!verification.valid) {
        return this.createErrorResult('invalid_signature', 'Webhook signature verification failed');
      }

      // Get provider instance (need to determine subscription type from payload)
      const subscriptionType = this.detectSubscriptionType(payload);
      
      const config = this.configService.getConfig({
        appId: '', // Will be extracted from payload
        provider,
      });

      if (!config) {
        return this.createErrorResult('config_not_found', 'Provider configuration not found');
      }

      const providerInstance = this.providerFactory.getProvider(
        provider,
        subscriptionType,
        config,
      );

      // Parse webhook event
      const event = await providerInstance.parseWebhookEvent({
        payload,
        signature,
        headers,
      });

      if (!event.signatureValid) {
        return this.createErrorResult(event.eventId, 'Invalid webhook signature');
      }

      // Get handler for event type
      const handler = this.getHandler(event.mappedEventType);
      if (handler) {
        return handler(event);
      }

      // Default handling
      return this.handleDefault(event);
    } catch (error) {
      this.logger.error(`Failed to process webhook: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return this.createErrorResult('processing_error', error instanceof Error ? error.message : 'Unknown error');
    }
  }

  /**
   * Verify webhook signature
   */
  async verifyWebhook(
    provider: PaymentProvider,
    payload: string | Record<string, unknown>,
    signature: string,
  ): Promise<WebhookVerificationResult> {
    // Get all configs for the provider
    const configs = provider === PaymentProvider.RAZORPAY
      ? this.configService.getRazorpayConfigs()
      : this.configService.getPhonePeConfigs();

    for (const config of configs) {
      if (!config.webhookSecret) continue;

      const providerInstance = this.providerFactory.getProvider(
        provider,
        SubscriptionType.PROVIDER_MANAGED, // Use any type for verification
        config,
      );

      if (providerInstance.verifyWebhookSignature(payload, signature)) {
        return {
          valid: true,
          provider,
          configId: config.configId,
        };
      }
    }

    return {
      valid: false,
      provider: null,
      configId: null,
    };
  }

  /**
   * Register a custom handler for an event type
   */
  registerHandler(eventType: string, handler: WebhookHandler): void {
    this.handlers.set(eventType, handler);
    this.logger.debug(`Registered handler for event type: ${eventType}`);
  }

  /**
   * Get handler for event type
   */
  private getHandler(eventType: string): WebhookHandler | undefined {
    return this.handlers.get(eventType);
  }

  /**
   * Register default handlers
   */
  private registerDefaultHandlers(): void {
    // Subscription activated
    this.registerHandler('subscription.activated', this.handleSubscriptionActivated.bind(this));
    
    // Subscription charged
    this.registerHandler('subscription.charged', this.handleSubscriptionCharged.bind(this));
    
    // Subscription cancelled
    this.registerHandler('subscription.cancelled', this.handleSubscriptionCancelled.bind(this));
    
    // Subscription expired
    this.registerHandler('subscription.expired', this.handleSubscriptionExpired.bind(this));
    
    // Subscription halted/failed
    this.registerHandler('subscription.halted', this.handleSubscriptionHalted.bind(this));
    
    // Payment failed
    this.registerHandler('payment.failed', this.handlePaymentFailed.bind(this));
    
    // Subscription revoked
    this.registerHandler('subscription.revoked', this.handleSubscriptionRevoked.bind(this));
    
    // Redemption completed (PhonePe)
    this.registerHandler('subscription.redemption.completed', this.handleRedemptionCompleted.bind(this));
    
    // Redemption failed (PhonePe)
    this.registerHandler('subscription.redemption.failed', this.handleRedemptionFailed.bind(this));
    
    // Transaction completed (PhonePe)
    this.registerHandler('subscription.transaction.completed', this.handleTransactionCompleted.bind(this));
    
    // Transaction failed (PhonePe)
    this.registerHandler('subscription.transaction.failed', this.handleTransactionFailed.bind(this));
  }

  /**
   * Handle subscription activated event
   */
  private async handleSubscriptionActivated(event: WebhookEvent): Promise<WebhookProcessResult> {
    this.logger.log(`Subscription activated: ${event.merchantSubscriptionId}`);
    
    const subscription = await this.findAndUpdateSubscription(
      event.merchantSubscriptionId,
      SubscriptionStatus.ACTIVE,
    );
    
    return {
      success: true,
      eventId: event.eventId,
      eventType: event.eventType,
      subscriptionId: event.merchantSubscriptionId,
      orderId: event.merchantOrderId,
      error: null,
    };
  }

  /**
   * Handle subscription charged event
   */
  private async handleSubscriptionCharged(event: WebhookEvent): Promise<WebhookProcessResult> {
    this.logger.log(`Subscription charged: ${event.merchantSubscriptionId}`);
    
    // Find subscription and record successful payment
    const subscription = await this.getSubscriptionRepo()
      .findByMerchantId(event.merchantSubscriptionId ?? '');
    
    if (subscription) {
      const updated = recordSuccessfulPayment(subscription, event.paymentId ?? '');
      await this.getSubscriptionRepo().save(updated);
    }
    
    return {
      success: true,
      eventId: event.eventId,
      eventType: event.eventType,
      subscriptionId: event.merchantSubscriptionId,
      orderId: event.merchantOrderId,
      error: null,
    };
  }

  /**
   * Handle subscription cancelled event
   */
  private async handleSubscriptionCancelled(event: WebhookEvent): Promise<WebhookProcessResult> {
    this.logger.log(`Subscription cancelled: ${event.merchantSubscriptionId}`);
    
    await this.findAndUpdateSubscription(
      event.merchantSubscriptionId,
      SubscriptionStatus.CANCELLED,
    );
    
    return {
      success: true,
      eventId: event.eventId,
      eventType: event.eventType,
      subscriptionId: event.merchantSubscriptionId,
      orderId: event.merchantOrderId,
      error: null,
    };
  }

  /**
   * Handle subscription expired event
   */
  private async handleSubscriptionExpired(event: WebhookEvent): Promise<WebhookProcessResult> {
    this.logger.log(`Subscription expired: ${event.merchantSubscriptionId}`);
    
    await this.findAndUpdateSubscription(
      event.merchantSubscriptionId,
      SubscriptionStatus.EXPIRED,
    );
    
    return {
      success: true,
      eventId: event.eventId,
      eventType: event.eventType,
      subscriptionId: event.merchantSubscriptionId,
      orderId: event.merchantOrderId,
      error: null,
    };
  }

  /**
   * Handle subscription halted event
   */
  private async handleSubscriptionHalted(event: WebhookEvent): Promise<WebhookProcessResult> {
    this.logger.log(`Subscription halted: ${event.merchantSubscriptionId}`);
    
    // For provider-managed subscriptions, halted means max retries exceeded
    await this.findAndUpdateSubscription(
      event.merchantSubscriptionId,
      SubscriptionStatus.EXPIRED,
    );
    
    return {
      success: true,
      eventId: event.eventId,
      eventType: event.eventType,
      subscriptionId: event.merchantSubscriptionId,
      orderId: event.merchantOrderId,
      error: null,
    };
  }

  /**
   * Handle payment failed event
   */
  private async handlePaymentFailed(event: WebhookEvent): Promise<WebhookProcessResult> {
    this.logger.log(`Payment failed for subscription: ${event.merchantSubscriptionId}`);
    
    const subscription = await this.getSubscriptionRepo()
      .findByMerchantId(event.merchantSubscriptionId ?? '');
    
    if (subscription) {
      // Record the failure
      const failure = createPaymentFailure(
        'payment_failed',
        event.errorCode ?? null,
        event.errorMessage ?? null,
        { raw: event.rawPayload },
        event.merchantOrderId,
      );
      
      const withFailure = recordPaymentFailure(subscription, failure);
      
      // For user-managed subscriptions, transition to RETRYING
      // For provider-managed, the provider handles retries
      if (subscription.subscriptionType === SubscriptionType.USER_MANAGED) {
        const transitionResult = transitionSubscriptionStatus(withFailure, SubscriptionStatus.RETRYING);
        await this.getSubscriptionRepo().save(transitionResult.subscription);
      } else {
        await this.getSubscriptionRepo().save(withFailure);
      }
    }
    
    return {
      success: true,
      eventId: event.eventId,
      eventType: event.eventType,
      subscriptionId: event.merchantSubscriptionId,
      orderId: event.merchantOrderId,
      error: null,
    };
  }

  /**
   * Handle subscription revoked event
   */
  private async handleSubscriptionRevoked(event: WebhookEvent): Promise<WebhookProcessResult> {
    this.logger.log(`Subscription revoked: ${event.merchantSubscriptionId}`);
    
    await this.findAndUpdateSubscription(
      event.merchantSubscriptionId,
      SubscriptionStatus.REVOKED,
    );
    
    return {
      success: true,
      eventId: event.eventId,
      eventType: event.eventType,
      subscriptionId: event.merchantSubscriptionId,
      orderId: event.merchantOrderId,
      error: null,
    };
  }

  /**
   * Handle redemption completed event (PhonePe)
   */
  private async handleRedemptionCompleted(event: WebhookEvent): Promise<WebhookProcessResult> {
    this.logger.log(`Redemption completed: ${event.merchantSubscriptionId}`);
    
    const subscription = await this.getSubscriptionRepo()
      .findByMerchantId(event.merchantSubscriptionId ?? '');
    
    if (subscription) {
      const updated = recordSuccessfulPayment(subscription, event.paymentId ?? '');
      await this.getSubscriptionRepo().save(updated);
    }
    
    return {
      success: true,
      eventId: event.eventId,
      eventType: event.eventType,
      subscriptionId: event.merchantSubscriptionId,
      orderId: event.merchantOrderId,
      error: null,
    };
  }

  /**
   * Handle redemption failed event (PhonePe)
   */
  private async handleRedemptionFailed(event: WebhookEvent): Promise<WebhookProcessResult> {
    this.logger.log(`Redemption failed: ${event.merchantSubscriptionId}`);
    
    const subscription = await this.getSubscriptionRepo()
      .findByMerchantId(event.merchantSubscriptionId ?? '');
    
    if (subscription && subscription.subscriptionType === SubscriptionType.USER_MANAGED) {
      // Transition to RETRYING for user-managed subscriptions
      await this.findAndUpdateSubscription(
        event.merchantSubscriptionId,
        SubscriptionStatus.RETRYING,
      );
    }
    
    return {
      success: true,
      eventId: event.eventId,
      eventType: event.eventType,
      subscriptionId: event.merchantSubscriptionId,
      orderId: event.merchantOrderId,
      error: null,
    };
  }

  /**
   * Handle transaction completed event (PhonePe)
   */
  private async handleTransactionCompleted(event: WebhookEvent): Promise<WebhookProcessResult> {
    this.logger.log(`Transaction completed: ${event.merchantSubscriptionId}`);
    
    const subscription = await this.getSubscriptionRepo()
      .findByMerchantId(event.merchantSubscriptionId ?? '');
    
    if (subscription) {
      const updated = recordSuccessfulPayment(subscription, event.paymentId ?? '');
      await this.getSubscriptionRepo().save(updated);
    }
    
    return {
      success: true,
      eventId: event.eventId,
      eventType: event.eventType,
      subscriptionId: event.merchantSubscriptionId,
      orderId: event.merchantOrderId,
      error: null,
    };
  }

  /**
   * Handle transaction failed event (PhonePe)
   */
  private async handleTransactionFailed(event: WebhookEvent): Promise<WebhookProcessResult> {
    this.logger.log(`Transaction failed: ${event.merchantSubscriptionId}`);
    
    const subscription = await this.getSubscriptionRepo()
      .findByMerchantId(event.merchantSubscriptionId ?? '');
    
    if (subscription) {
      const failure = createPaymentFailure(
        'transaction_failed',
        event.errorCode ?? null,
        event.errorMessage ?? null,
        { raw: event.rawPayload },
        event.merchantOrderId,
      );
      
      const withFailure = recordPaymentFailure(subscription, failure);
      await this.getSubscriptionRepo().save(withFailure);
    }
    
    return {
      success: true,
      eventId: event.eventId,
      eventType: event.eventType,
      subscriptionId: event.merchantSubscriptionId,
      orderId: event.merchantOrderId,
      error: null,
    };
  }

  /**
   * Default handler for unregistered event types
   */
  private async handleDefault(event: WebhookEvent): Promise<WebhookProcessResult> {
    this.logger.debug(`Unhandled event type: ${event.mappedEventType}`);
    
    return {
      success: true,
      eventId: event.eventId,
      eventType: event.eventType,
      subscriptionId: event.merchantSubscriptionId,
      orderId: event.merchantOrderId,
      error: null,
    };
  }

  /**
   * Detect subscription type from payload
   */
  private detectSubscriptionType(payload: string | Record<string, unknown>): SubscriptionType {
    const payloadObj = typeof payload === 'string' ? JSON.parse(payload) : payload;
    
    // Check for hints in the payload
    const notes = payloadObj?.payload?.subscription?.entity?.notes ?? 
                  payloadObj?.payload?.order?.entity?.notes ?? 
                  payloadObj?.data ?? {};
    
    if (notes.subscription_type === 'USER_MANAGED') {
      return SubscriptionType.USER_MANAGED;
    }
    
    return SubscriptionType.PROVIDER_MANAGED;
  }

  /**
   * Find subscription by merchant ID and update status
   */
  private async findAndUpdateSubscription(
    merchantSubscriptionId: string | null,
    newStatus: SubscriptionStatus,
  ): Promise<void> {
    if (!merchantSubscriptionId) return;
    
    const subscription = await this.getSubscriptionRepo().findByMerchantId(merchantSubscriptionId);
    if (!subscription) {
      this.logger.warn(`Subscription not found for webhook update: ${merchantSubscriptionId}`);
      return;
    }
    
    const result = transitionSubscriptionStatus(subscription, newStatus);
    if (result.success) {
      await this.getSubscriptionRepo().save(result.subscription);
    }
  }

  /**
   * Create error result
   */
  private createErrorResult(eventId: string, error: string): WebhookProcessResult {
    return {
      success: false,
      eventId,
      eventType: 'error',
      subscriptionId: null,
      orderId: null,
      error,
    };
  }
}
