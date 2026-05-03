/**
 * Webhook Handler Service
 * 
 * Handles webhook events from Razorpay and PhonePe.
 * Routes events to appropriate handlers based on event type.
 */

import { Injectable, Logger, Inject, Optional } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { SubscriptionStateMachineService } from './subscription-state-machine.service';
import { ProviderFactory } from '../providers/factory/provider.factory';
import { PaymentConfigService } from '../config/payment-config.service';
import type { ISubscriptionRepository } from '../infrastructure/repositories/subscription.repository.interface';
import type { IOrderRepository } from '../infrastructure/repositories/order.repository.interface';
import type { WebhookEvent } from '../providers/interfaces/subscription-provider.interface';
import { PaymentProvider } from '../types/provider.enum';
import { SubscriptionType } from '../types/subscription-type.enum';
import { SubscriptionStatus, StateMachineEvent } from '../types/subscription-status.enum';
import { transitionSubscriptionStatus, recordSuccessfulPayment, recordPaymentFailure } from '../domain/entities/subscription.entity';
import { createPaymentFailure } from '../domain/entities/subscription.entity';
import { mapRazorpaySubscriptionStatus } from '../types/razorpay.types';
import { mapPhonePeSubscriptionState } from '../types/phonepe.types';
import { eq, and, sql } from 'drizzle-orm';
import { DRIZZLE_TOKEN } from '../../../database/drizzle.module';
import { paymentWebhookEvents } from '../database/schema';

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
    @Inject('ISubscriptionRepository') private readonly subscriptionRepository: ISubscriptionRepository,
    @Inject('IOrderRepository') private readonly orderRepository: IOrderRepository,
    @Inject(DRIZZLE_TOKEN) @Optional() private readonly db: NodePgDatabase<any> | null,
  ) {
    this.registerDefaultHandlers();
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
    const payloadPreview = typeof payload === 'string'
      ? payload.substring(0, 500)
      : JSON.stringify(payload).substring(0, 500);
    this.logger.log(`[${provider}] processWebhook started | signature_length=${signature?.length ?? 0} | payload_preview=${payloadPreview}`);

    try {
      // Verify signature and get config
      this.logger.log(`[${provider}] Verifying webhook signature...`);
      const verification = await this.verifyWebhook(provider, payload, signature);
      if (!verification.valid) {
        this.logger.warn(`[${provider}] Signature verification FAILED | no matching config found for signature`);
        return this.createErrorResult('invalid_signature', 'Webhook signature verification failed');
      }
      this.logger.log(`[${provider}] Signature verification PASSED | configId=${verification.configId}`);

      // Get provider instance (need to determine subscription type from payload)
      const subscriptionType = this.detectSubscriptionType(payload);
      this.logger.log(`[${provider}] Detected subscriptionType=${subscriptionType}`);

      // Use the configId from the verification to find the matching config
      const config = verification.configId
        ? this.configService.getConfigById(verification.configId)
        : this.configService.getFirstConfigForProvider(provider);

      if (!config) {
        this.logger.error(`[${provider}] Provider configuration not found | configId=${verification.configId}`);
        return this.createErrorResult('config_not_found', 'Provider configuration not found');
      }

      const providerInstance = this.providerFactory.getProvider(
        provider,
        subscriptionType,
        config,
      );

      // Parse webhook event
      this.logger.log(`[${provider}] Parsing webhook event...`);
      const event = await providerInstance.parseWebhookEvent({
        payload,
        signature,
        headers,
      });
      this.logger.log(
        `[${provider}] Parsed webhook | eventId=${event.eventId} | eventType=${event.eventType} | mappedEventType=${event.mappedEventType} | signatureValid=${event.signatureValid} | merchantSubscriptionId=${event.merchantSubscriptionId} | merchantOrderId=${event.merchantOrderId} | paymentId=${event.paymentId} | appId=${event.appId}`,
      );

      if (!event.signatureValid) {
        this.logger.warn(`[${provider}] Parsed event has signatureValid=false | eventId=${event.eventId}`);
        return this.createErrorResult(event.eventId, 'Invalid webhook signature');
      }

      // Persist the webhook event for audit trail
      await this.persistWebhookEvent(event, provider);

      // Get handler for event type
      const handler = this.getHandler(event.mappedEventType);
      let result: WebhookProcessResult;
      if (handler) {
        this.logger.log(`[${provider}] Dispatching to handler for mappedEventType=${event.mappedEventType}`);
        result = await handler(event);
      } else {
        this.logger.warn(`[${provider}] No handler registered for mappedEventType=${event.mappedEventType} | eventType=${event.eventType}`);
        result = await this.handleDefault(event);
      }

      this.logger.log(
        `[${provider}] Handler result | eventId=${event.eventId} | mappedEventType=${event.mappedEventType} | success=${result.success} | error=${result.error ?? 'none'}`,
      );

      // Update webhook event status after processing
      await this.updateWebhookEventStatus(
        event.eventId,
        provider,
        result.success ? 'PROCESSED' : 'FAILED',
        result.success ? undefined : result.error ?? undefined,
      );

      return result;
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'Unknown error';
      const stack = error instanceof Error ? error.stack : '';
      this.logger.error(`[${provider}] processWebhook FAILED | error=${errMsg} | stack=${stack}`);
      return this.createErrorResult('processing_error', errMsg);
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

    this.logger.log(`[${provider}] verifyWebhook | configs_count=${configs.length} | signature_length=${signature?.length ?? 0}`);

    if (configs.length === 0) {
      this.logger.warn(`[${provider}] No provider configs found for signature verification`);
    }

    for (const config of configs) {
      // PhonePe uses saltKey for signature verification, not webhookSecret
      const hasVerificationKey = config.webhookSecret
        || (config.provider === 'PHONEPE' && 'saltKey' in config && (config as any).saltKey);
      if (!hasVerificationKey) {
        this.logger.warn(`[${provider}] Config ${config.configId} has no webhookSecret or saltKey, skipping`);
        continue;
      }

      const providerInstance = this.providerFactory.getProvider(
        provider,
        SubscriptionType.PROVIDER_MANAGED, // Use any type for verification
        config,
      );

      const isValid = providerInstance.verifyWebhookSignature(payload, signature);
      this.logger.log(`[${provider}] Signature check against configId=${config.configId} | valid=${isValid}`);

      if (isValid) {
        return {
          valid: true,
          provider,
          configId: config.configId,
        };
      }
    }

    this.logger.warn(`[${provider}] Signature did not match any config`);
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
    // Subscription setup completed (PhonePe)
    this.registerHandler('subscription.setup.completed', this.handleSubscriptionActivated.bind(this));
    
    // Subscription setup failed (PhonePe)
    this.registerHandler('subscription.setup.failed', this.handlePaymentFailed.bind(this));

    // Subscription authenticated (Razorpay)
    this.registerHandler('subscription.authenticated', this.handleSubscriptionAuthenticated.bind(this));
    
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
    
    // Subscription paused
    this.registerHandler('subscription.paused', this.handleSubscriptionPaused.bind(this));
    
    // Subscription unpaused/resumed
    this.registerHandler('subscription.unpaused', this.handleSubscriptionResumed.bind(this));
    this.registerHandler('subscription.resumed', this.handleSubscriptionResumed.bind(this));
    
    // Subscription completed
    this.registerHandler('subscription.completed', this.handleSubscriptionCompleted.bind(this));
    
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
   * Handle subscription authenticated event (Razorpay)
   */
  private async handleSubscriptionAuthenticated(event: WebhookEvent): Promise<WebhookProcessResult> {
    this.logger.log(`Subscription authenticated: ${event.merchantSubscriptionId}`);
    
    await this.findAndUpdateSubscription(
      event.merchantSubscriptionId,
      SubscriptionStatus.AUTHENTICATED,
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
    this.logger.log(`Subscription charged | merchantSubscriptionId=${event.merchantSubscriptionId} | paymentId=${event.paymentId} | amount=${event.amount}`);
    
    // Find subscription and record successful payment
    const subscription = await this.subscriptionRepository
      .findByMerchantId(event.merchantSubscriptionId ?? '');
    
    if (subscription) {
      this.logger.log(`Recording successful payment | merchantSubscriptionId=${event.merchantSubscriptionId} | paymentId=${event.paymentId} | paidCount=${subscription.paidCount}`);
      const updated = recordSuccessfulPayment(subscription, event.paymentId ?? '');
      await this.subscriptionRepository.save(updated);
    } else {
      this.logger.warn(`Subscription not found for charged event | merchantSubscriptionId=${event.merchantSubscriptionId}`);
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
    this.logger.warn(`Payment failed | merchantSubscriptionId=${event.merchantSubscriptionId} | errorCode=${event.errorCode} | errorMessage=${event.errorMessage} | merchantOrderId=${event.merchantOrderId}`);
    
    const subscription = await this.subscriptionRepository
      .findByMerchantId(event.merchantSubscriptionId ?? '');
    
    if (subscription) {
      this.logger.log(`Recording payment failure | merchantSubscriptionId=${event.merchantSubscriptionId} | subscriptionType=${subscription.subscriptionType} | currentStatus=${subscription.status} | failureCount=${subscription.failureCount}`);
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
        this.logger.log(`User-managed subscription, transitioning to RETRYING | merchantSubscriptionId=${event.merchantSubscriptionId}`);
        const transitionResult = transitionSubscriptionStatus(withFailure, SubscriptionStatus.RETRYING);
        await this.subscriptionRepository.save(transitionResult.subscription);
      } else {
        await this.subscriptionRepository.save(withFailure);
      }
    } else {
      this.logger.warn(`Subscription not found for payment failure | merchantSubscriptionId=${event.merchantSubscriptionId}`);
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
   * Handle subscription paused event
   */
  private async handleSubscriptionPaused(event: WebhookEvent): Promise<WebhookProcessResult> {
    this.logger.log(`Subscription paused: ${event.merchantSubscriptionId}`);
    
    await this.findAndUpdateSubscription(
      event.merchantSubscriptionId,
      SubscriptionStatus.PAUSED,
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
   * Handle subscription resumed/unpaused event
   */
  private async handleSubscriptionResumed(event: WebhookEvent): Promise<WebhookProcessResult> {
    this.logger.log(`Subscription resumed: ${event.merchantSubscriptionId}`);
    
    await this.findAndUpdateSubscription(
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
   * Handle subscription completed event
   */
  private async handleSubscriptionCompleted(event: WebhookEvent): Promise<WebhookProcessResult> {
    this.logger.log(`Subscription completed: ${event.merchantSubscriptionId}`);
    
    await this.findAndUpdateSubscription(
      event.merchantSubscriptionId,
      SubscriptionStatus.COMPLETED,
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
    this.logger.log(`Redemption completed | merchantSubscriptionId=${event.merchantSubscriptionId} | paymentId=${event.paymentId} | merchantOrderId=${event.merchantOrderId}`);
    
    const subscription = await this.subscriptionRepository
      .findByMerchantId(event.merchantSubscriptionId ?? '');
    
    if (subscription) {
      this.logger.log(`Recording redemption payment | merchantSubscriptionId=${event.merchantSubscriptionId} | paidCount=${subscription.paidCount}`);
      const updated = recordSuccessfulPayment(subscription, event.paymentId ?? '');
      await this.subscriptionRepository.save(updated);
    } else {
      this.logger.warn(`Subscription not found for redemption | merchantSubscriptionId=${event.merchantSubscriptionId}`);
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
    this.logger.warn(`Redemption failed | merchantSubscriptionId=${event.merchantSubscriptionId} | errorCode=${event.errorCode} | merchantOrderId=${event.merchantOrderId}`);
    
    const subscription = await this.subscriptionRepository
      .findByMerchantId(event.merchantSubscriptionId ?? '');
    
    if (subscription && subscription.subscriptionType === SubscriptionType.USER_MANAGED) {
      this.logger.log(`User-managed subscription, transitioning to RETRYING | merchantSubscriptionId=${event.merchantSubscriptionId}`);
      await this.findAndUpdateSubscription(
        event.merchantSubscriptionId,
        SubscriptionStatus.RETRYING,
      );
    } else if (!subscription) {
      this.logger.warn(`Subscription not found for redemption failure | merchantSubscriptionId=${event.merchantSubscriptionId}`);
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
    this.logger.log(`Transaction completed | merchantSubscriptionId=${event.merchantSubscriptionId} | paymentId=${event.paymentId} | merchantOrderId=${event.merchantOrderId}`);
    
    const subscription = await this.subscriptionRepository
      .findByMerchantId(event.merchantSubscriptionId ?? '');
    
    if (subscription) {
      this.logger.log(`Recording transaction payment | merchantSubscriptionId=${event.merchantSubscriptionId} | paidCount=${subscription.paidCount}`);
      const updated = recordSuccessfulPayment(subscription, event.paymentId ?? '');
      await this.subscriptionRepository.save(updated);
    } else {
      this.logger.warn(`Subscription not found for transaction | merchantSubscriptionId=${event.merchantSubscriptionId}`);
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
    this.logger.warn(`Transaction failed | merchantSubscriptionId=${event.merchantSubscriptionId} | errorCode=${event.errorCode} | merchantOrderId=${event.merchantOrderId}`);
    
    const subscription = await this.subscriptionRepository
      .findByMerchantId(event.merchantSubscriptionId ?? '');
    
    if (subscription) {
      this.logger.log(`Recording transaction failure | merchantSubscriptionId=${event.merchantSubscriptionId} | failureCount=${subscription.failureCount}`);
      const failure = createPaymentFailure(
        'transaction_failed',
        event.errorCode ?? null,
        event.errorMessage ?? null,
        { raw: event.rawPayload },
        event.merchantOrderId,
      );
      
      const withFailure = recordPaymentFailure(subscription, failure);
      await this.subscriptionRepository.save(withFailure);
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
    this.logger.warn(`Unhandled event type | mappedEventType=${event.mappedEventType} | eventType=${event.eventType} | eventId=${event.eventId}`);
    
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
    try {
      const payloadObj = typeof payload === 'string' ? JSON.parse(payload) : payload;
      
      // Check for hints in the payload
      const notes = payloadObj?.payload?.subscription?.entity?.notes ?? 
                    payloadObj?.payload?.order?.entity?.notes ?? 
                    payloadObj?.data ?? {};
      
      if (notes.subscription_type === 'USER_MANAGED') {
        return SubscriptionType.USER_MANAGED;
      }
      
      return SubscriptionType.PROVIDER_MANAGED;
    } catch (error) {
      this.logger.warn(`detectSubscriptionType failed to parse payload, defaulting to PROVIDER_MANAGED | error=${error instanceof Error ? error.message : error}`);
      return SubscriptionType.PROVIDER_MANAGED;
    }
  }

  /**
   * Find subscription by merchant ID and update status
   */
  private async findAndUpdateSubscription(
    merchantSubscriptionId: string | null,
    newStatus: SubscriptionStatus,
  ): Promise<void> {
    if (!merchantSubscriptionId) {
      this.logger.warn(`findAndUpdateSubscription called with null merchantSubscriptionId | targetStatus=${newStatus}`);
      return;
    }
    
    const subscription = await this.subscriptionRepository.findByMerchantId(merchantSubscriptionId);
    if (!subscription) {
      this.logger.warn(`Subscription not found | merchantSubscriptionId=${merchantSubscriptionId} | targetStatus=${newStatus}`);
      return;
    }
    
    this.logger.log(`Transitioning subscription | merchantSubscriptionId=${merchantSubscriptionId} | currentStatus=${subscription.status} -> targetStatus=${newStatus}`);
    const result = transitionSubscriptionStatus(subscription, newStatus);
    if (result.success) {
      await this.subscriptionRepository.save(result.subscription);
      this.logger.log(`Subscription updated | merchantSubscriptionId=${merchantSubscriptionId} | newStatus=${newStatus}`);
    } else {
      this.logger.warn(`Subscription transition rejected | merchantSubscriptionId=${merchantSubscriptionId} | currentStatus=${subscription.status} -> targetStatus=${newStatus}`);
    }
  }

  /**
   * Persist webhook event to database for audit trail
   */
  private async persistWebhookEvent(event: WebhookEvent, provider: PaymentProvider): Promise<void> {
    if (!this.db) {
      this.logger.warn(`[${provider}] Skipping webhook event persistence — no DB connection`);
      return;
    }

    try {
      const id = `wh_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      this.logger.log(`[${provider}] Persisting webhook event | id=${id} | eventId=${event.eventId} | eventType=${event.eventType}`);

      await this.db.insert(paymentWebhookEvents).values({
        id,
        provider,
        appId: event.appId,
        eventId: event.eventId,
        eventType: event.eventType,
        normalizedEventType: event.mappedEventType,
        status: 'PROCESSING',
        merchantSubscriptionId: event.merchantSubscriptionId,
        providerSubscriptionId: event.providerSubscriptionId,
        merchantOrderId: event.merchantOrderId,
        providerOrderId: event.providerOrderId,
        paymentId: event.paymentId,
        parsedData: event.rawPayload,
        rawPayload: event.rawPayload,
        signatureValid: event.signatureValid,
        eventTimestamp: event.timestamp,
        processingAttempts: 1,
        lastProcessingAttemptAt: new Date(),
      }).onConflictDoUpdate({
        target: [paymentWebhookEvents.provider, paymentWebhookEvents.eventId],
        set: {
          status: 'DUPLICATE' as const,
          processingAttempts: sql`${paymentWebhookEvents.processingAttempts} + 1`,
          lastProcessingAttemptAt: new Date(),
        },
      });
    } catch (error) {
      this.logger.error(
        `Failed to persist webhook event ${event.eventId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Update webhook event status after processing
   */
  private async updateWebhookEventStatus(
    eventId: string,
    provider: PaymentProvider,
    status: 'PROCESSED' | 'FAILED',
    processingError?: string,
  ): Promise<void> {
    if (!this.db) return;

    try {
      await this.db
        .update(paymentWebhookEvents)
        .set({
          status,
          processedAt: status === 'PROCESSED' ? new Date() : undefined,
          processingError: processingError ?? null,
        })
        .where(
          and(
            eq(paymentWebhookEvents.provider, provider),
            eq(paymentWebhookEvents.eventId, eventId),
          ),
        );
    } catch (error) {
      this.logger.error(
        `Failed to update webhook event status ${eventId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
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
