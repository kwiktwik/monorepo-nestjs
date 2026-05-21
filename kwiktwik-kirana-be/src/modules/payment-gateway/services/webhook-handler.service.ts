/**
 * Webhook Handler Service
 * 
 * Handles webhook events from Razorpay and PhonePe.
 * Routes events to appropriate handlers based on event type.
 */

import { Injectable, Logger, Inject, Optional } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { SubscriptionStateMachineService } from './subscription-state-machine.service';
import { EntitlementService } from './entitlement.service';
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
import { markOrderAsPaid, markOrderAsRefunded } from '../domain/entities/order.entity';
import { mapRazorpaySubscriptionStatus, RazorpayWebhookEvent } from '../types/razorpay.types';
import { mapPhonePeSubscriptionState } from '../types/phonepe.types';
import { eq, and, sql } from 'drizzle-orm';
import { DRIZZLE_TOKEN } from '../../../database/drizzle.module';
import { paymentWebhookEvents, paymentTokens } from '../database/schema';
import { generateId } from '../providers/base/provider-utils';

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
    private readonly entitlementService: EntitlementService,
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
    
    // Payment captured (one-time order)
    this.registerHandler('payment.captured', this.handlePaymentCaptured.bind(this));

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
    
    // Token confirmed (Charge at Will — Razorpay)
    this.registerHandler('token.confirmed', this.handleTokenConfirmed.bind(this));
    
    // Token rejected (Charge at Will — Razorpay)
    this.registerHandler('token.rejected', this.handleTokenRejected.bind(this));
    
    // Token cancelled (Charge at Will — Razorpay)
    this.registerHandler('token.cancelled', this.handleTokenCancelled.bind(this));
    
    // Payment authorized — extract token_id for recurring setups
    this.registerHandler('payment.authorized', this.handlePaymentAuthorized.bind(this));

    // Payment downtime resolved (Razorpay infrastructure event — informational only)
    this.registerHandler('payment.downtime.resolved', this.handlePaymentDowntime.bind(this));
    this.registerHandler('payment.downtime.started', this.handlePaymentDowntime.bind(this));

    // Order paid (Razorpay one-time / user-managed)
    this.registerHandler(RazorpayWebhookEvent.ORDER_PAID, this.handleOrderPaid.bind(this));

    // Refund events
    this.registerHandler(RazorpayWebhookEvent.REFUND_CREATED, this.handleRefundCreated.bind(this));
    this.registerHandler(RazorpayWebhookEvent.REFUND_PROCESSED, this.handleRefundProcessed.bind(this));
    this.registerHandler(RazorpayWebhookEvent.REFUND_FAILED, this.handleRefundFailed.bind(this));

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
   * Handle payment captured event (one-time orders)
   */
  private async handlePaymentCaptured(event: WebhookEvent): Promise<WebhookProcessResult> {
    const providerOrderId = event.merchantOrderId ?? event.providerOrderId;
    this.logger.log(`Payment captured | providerOrderId=${providerOrderId} | paymentId=${event.paymentId}`);

    if (!providerOrderId) {
      this.logger.warn('Payment captured event has no order ID, skipping order update');
      return {
        success: true,
        eventId: event.eventId,
        eventType: event.eventType,
        subscriptionId: event.merchantSubscriptionId,
        orderId: null,
        error: null,
      };
    }

    const order = await this.orderRepository.findByProviderOrderId(
      event.provider,
      providerOrderId,
    );

    if (!order) {
      this.logger.warn(`Order not found for payment captured | providerOrderId=${providerOrderId}`);
      return {
        success: true,
        eventId: event.eventId,
        eventType: event.eventType,
        subscriptionId: event.merchantSubscriptionId,
        orderId: null,
        error: null,
      };
    }

    if (order.status === 'CAPTURED') {
      this.logger.log(`Order already captured, skipping | orderId=${order.id}`);
      return {
        success: true,
        eventId: event.eventId,
        eventType: event.eventType,
        subscriptionId: event.merchantSubscriptionId,
        orderId: order.id,
        error: null,
      };
    }

    const updated = markOrderAsPaid(order, event.paymentId ?? '', {
      paymentId: event.paymentId,
    });
    await this.orderRepository.save(updated);
    this.logger.log(`Order marked as CAPTURED via webhook | orderId=${order.id} | paymentId=${event.paymentId}`);

    // Grant entitlement for ONE_TIME orders with a plan
    if (order.orderType === 'ONE_TIME' && order.planId) {
      const planConfig = await this.configService.getPlanConfig(order.appId, order.planId);
      if (planConfig?.premiumDurationDays) {
        await this.entitlementService.grantFromOrder({
          orderId: order.id,
          userId: order.userId,
          appId: order.appId,
          planId: order.planId,
          durationDays: planConfig.premiumDurationDays,
        });
      }
    }

    // Activate USER_MANAGED subscription on payment capture
    if (order.orderType === 'SUBSCRIPTION_SETUP' && order.subscriptionId) {
      await this.activateUserManagedSubscription(order.subscriptionId, event.paymentId);
    }

    return {
      success: true,
      eventId: event.eventId,
      eventType: event.eventType,
      subscriptionId: event.merchantSubscriptionId,
      orderId: order.id,
      error: null,
    };
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
    
    await this.findAndUpdateSubscription(
      event.merchantSubscriptionId,
      SubscriptionStatus.ACTIVE,
    );

    // Grant premium entitlement
    if (event.merchantSubscriptionId) {
      const sub = await this.subscriptionRepository.findByMerchantId(event.merchantSubscriptionId);
      if (sub) {
        await this.entitlementService.grantFromSubscription({
          subscriptionId: sub.id,
          userId: sub.userId,
          appId: sub.appId,
          planId: sub.planId,
        });
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
   * Handle subscription charged event
   */
  private async handleSubscriptionCharged(event: WebhookEvent): Promise<WebhookProcessResult> {
    this.logger.log(`Subscription charged | merchantSubscriptionId=${event.merchantSubscriptionId} | paymentId=${event.paymentId} | amount=${event.amount}`);
    
    // Find subscription and record successful payment
    const subscription = await this.subscriptionRepository
      .findByMerchantId(event.merchantSubscriptionId ?? '');
    
    if (subscription) {
      this.logger.log(`Recording successful payment | merchantSubscriptionId=${event.merchantSubscriptionId} | paymentId=${event.paymentId} | billingCycleCount=${subscription.billingCycleCount}`);
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

    if (event.merchantSubscriptionId) {
      const sub = await this.subscriptionRepository.findByMerchantId(event.merchantSubscriptionId);
      if (sub) {
        await this.entitlementService.revokeFromSubscription(sub.id, 'subscription_cancelled');
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
   * Handle subscription expired event
   */
  private async handleSubscriptionExpired(event: WebhookEvent): Promise<WebhookProcessResult> {
    this.logger.log(`Subscription expired: ${event.merchantSubscriptionId}`);
    
    await this.findAndUpdateSubscription(
      event.merchantSubscriptionId,
      SubscriptionStatus.EXPIRED,
    );

    if (event.merchantSubscriptionId) {
      const sub = await this.subscriptionRepository.findByMerchantId(event.merchantSubscriptionId);
      if (sub) {
        await this.entitlementService.revokeFromSubscription(sub.id, 'subscription_expired');
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
   * Handle subscription halted event
   */
  private async handleSubscriptionHalted(event: WebhookEvent): Promise<WebhookProcessResult> {
    this.logger.log(`Subscription halted: ${event.merchantSubscriptionId}`);
    
    // For provider-managed subscriptions, halted means max retries exceeded
    await this.findAndUpdateSubscription(
      event.merchantSubscriptionId,
      SubscriptionStatus.EXPIRED,
    );

    if (event.merchantSubscriptionId) {
      const sub = await this.subscriptionRepository.findByMerchantId(event.merchantSubscriptionId);
      if (sub) {
        await this.entitlementService.revokeFromSubscription(sub.id, 'subscription_halted');
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
   * Handle payment failed event
   */
  private async handlePaymentFailed(event: WebhookEvent): Promise<WebhookProcessResult> {
    this.logger.warn(`Payment failed | merchantSubscriptionId=${event.merchantSubscriptionId} | errorCode=${event.errorCode} | errorMessage=${event.errorMessage} | merchantOrderId=${event.merchantOrderId}`);
    
    const subscription = await this.subscriptionRepository
      .findByMerchantId(event.merchantSubscriptionId ?? '');
    
    if (subscription) {
      this.logger.log(`Recording payment failure | merchantSubscriptionId=${event.merchantSubscriptionId} | subscriptionType=${subscription.subscriptionType} | currentStatus=${subscription.status} | consecutiveFailures=${subscription.consecutiveFailures}`);
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
   * Handle payment authorized event
   *
   * When a payment is authorized with recurring:true, the response contains
   * a token_id. We extract it and persist it so future charges can use it.
   */
  private async handlePaymentAuthorized(event: WebhookEvent): Promise<WebhookProcessResult> {
    this.logger.log(`Payment authorized | paymentId=${event.paymentId} | merchantOrderId=${event.merchantOrderId}`);

    // Extract token_id from the raw payment entity
    const paymentEntity = (event.rawPayload as any)?.payload?.payment?.entity;
    const tokenId = paymentEntity?.token_id;
    const customerId = paymentEntity?.customer_id;

    if (tokenId && customerId) {
      this.logger.log(`Recurring token found in authorized payment | tokenId=${tokenId} | customerId=${customerId}`);
      await this.persistToken({
        event,
        providerTokenId: tokenId,
        providerCustomerId: customerId,
        status: 'CREATED',
        authPaymentId: event.paymentId ?? undefined,
        customerEmail: paymentEntity?.email,
        customerContact: paymentEntity?.contact,
        paymentMethod: paymentEntity?.method,
      });

      // Store token on the subscription's providerData
      await this.storeTokenOnSubscription(event, tokenId, customerId);
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
   * Handle token confirmed event (Charge at Will)
   *
   * Fired by Razorpay when a recurring token is confirmed by the issuing bank.
   * After this, the token can be used for charge-at-will payments.
   */
  private async handleTokenConfirmed(event: WebhookEvent): Promise<WebhookProcessResult> {
    const tokenEntity = (event.rawPayload as any)?.payload?.token?.entity;
    const tokenId = tokenEntity?.id;
    const customerId = tokenEntity?.customer_id ?? (event.rawPayload as any)?.payload?.payment?.entity?.customer_id;

    this.logger.log(`Token confirmed | tokenId=${tokenId} | customerId=${customerId}`);

    if (tokenId) {
      await this.persistToken({
        event,
        providerTokenId: tokenId,
        providerCustomerId: customerId ?? '',
        status: 'CONFIRMED',
        customerEmail: tokenEntity?.email ?? (event.rawPayload as any)?.payload?.payment?.entity?.email,
        customerContact: tokenEntity?.contact ?? (event.rawPayload as any)?.payload?.payment?.entity?.contact,
        paymentMethod: tokenEntity?.method,
      });

      // Update existing CREATED token to CONFIRMED
      await this.updateTokenStatus(tokenId, event.provider, 'CONFIRMED');

      // Store on subscription
      if (customerId) {
        await this.storeTokenOnSubscription(event, tokenId, customerId);
      }

      // Activate USER_MANAGED subscription when token is confirmed
      // (UPI mandates are officially registered at this point)
      await this.activateUserManagedSubscriptionFromEvent(event);
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
   * Handle token rejected event (Charge at Will)
   */
  private async handleTokenRejected(event: WebhookEvent): Promise<WebhookProcessResult> {
    const tokenEntity = (event.rawPayload as any)?.payload?.token?.entity;
    const tokenId = tokenEntity?.id;

    this.logger.warn(`Token rejected | tokenId=${tokenId}`);

    if (tokenId) {
      await this.updateTokenStatus(tokenId, event.provider, 'REJECTED');
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
   * Handle token cancelled event (Charge at Will)
   *
   * Fired when a recurring token/mandate is cancelled (by customer or bank).
   * Updates token status and cancels the associated subscription.
   */
  private async handleTokenCancelled(event: WebhookEvent): Promise<WebhookProcessResult> {
    const tokenEntity = (event.rawPayload as any)?.payload?.token?.entity;
    const tokenId = tokenEntity?.id;

    this.logger.warn(`Token cancelled | tokenId=${tokenId}`);

    if (tokenId) {
      await this.updateTokenStatus(tokenId, event.provider, 'CANCELLED');
    }

    // Cancel the associated USER_MANAGED subscription
    let subscription = event.merchantSubscriptionId
      ? await this.subscriptionRepository.findByMerchantId(event.merchantSubscriptionId)
      : null;

    // Fallback: resolve via order notes
    if (!subscription) {
      const orderNotes = (event.rawPayload as any)?.payload?.order?.entity?.notes
        ?? (event.rawPayload as any)?.payload?.payment?.entity?.notes;
      const merchantSubId = orderNotes?.merchant_subscription_id;
      if (merchantSubId) {
        subscription = await this.subscriptionRepository.findByMerchantId(merchantSubId);
      }
    }

    if (subscription && subscription.subscriptionType === SubscriptionType.USER_MANAGED) {
      this.logger.log(`Cancelling USER_MANAGED subscription due to token cancellation | subscriptionId=${subscription.id}`);
      const result = transitionSubscriptionStatus(subscription, SubscriptionStatus.CANCELLED);
      if (result.success) {
        await this.subscriptionRepository.save(result.subscription);
        await this.entitlementService.revokeFromSubscription(subscription.id, 'token_cancelled');
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
   * Handle payment downtime events (Razorpay infrastructure)
   *
   * Informational events about payment method availability.
   * No business action required — just acknowledge.
   */
  private async handlePaymentDowntime(event: WebhookEvent): Promise<WebhookProcessResult> {
    this.logger.log(`Payment downtime event | eventType=${event.eventType} | mappedEventType=${event.mappedEventType}`);

    return {
      success: true,
      eventId: event.eventId,
      eventType: event.eventType,
      subscriptionId: null,
      orderId: null,
      error: null,
    };
  }

  /**
   * Handle order.paid event (Razorpay one-time / user-managed orders)
   *
   * Delegates to handlePaymentCaptured — both events indicate the order
   * has been successfully paid.
   */
  private async handleOrderPaid(event: WebhookEvent): Promise<WebhookProcessResult> {
    this.logger.log(`Order paid | providerOrderId=${event.providerOrderId} | paymentId=${event.paymentId}`);
    return this.handlePaymentCaptured(event);
  }

  /**
   * Handle refund.created event
   *
   * A refund has been initiated. Log and acknowledge — the order status
   * update happens when the refund is processed.
   */
  private async handleRefundCreated(event: WebhookEvent): Promise<WebhookProcessResult> {
    const refundEntity = (event.rawPayload as any)?.payload?.refund?.entity;
    const refundId = refundEntity?.id ?? null;
    const paymentId = refundEntity?.payment_id ?? event.paymentId;
    const refundAmount = refundEntity?.amount ?? null;

    this.logger.log(`Refund created | refundId=${refundId} | paymentId=${paymentId} | amount=${refundAmount}`);

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
   * Handle refund.processed event
   *
   * The refund has been completed. Find the order by provider order ID
   * (from the refund or payment entity) and mark it as REFUNDED.
   */
  private async handleRefundProcessed(event: WebhookEvent): Promise<WebhookProcessResult> {
    const refundEntity = (event.rawPayload as any)?.payload?.refund?.entity;
    const paymentEntity = (event.rawPayload as any)?.payload?.payment?.entity;
    const refundId = refundEntity?.id ?? '';
    const providerOrderId = refundEntity?.order_id ?? paymentEntity?.order_id ?? event.merchantOrderId ?? event.providerOrderId;
    const refundAmount = refundEntity?.amount ?? null;
    const paymentAmount = paymentEntity?.amount ?? null;

    this.logger.log(
      `Refund processed | refundId=${refundId} | providerOrderId=${providerOrderId} | refundAmount=${refundAmount} | paymentAmount=${paymentAmount}`,
    );

    if (!providerOrderId) {
      this.logger.warn('Refund processed event has no order ID, skipping order update');
      return {
        success: true,
        eventId: event.eventId,
        eventType: event.eventType,
        subscriptionId: event.merchantSubscriptionId,
        orderId: null,
        error: null,
      };
    }

    const order = await this.orderRepository.findByProviderOrderId(
      event.provider,
      providerOrderId,
    );

    if (!order) {
      this.logger.warn(`Order not found for refund processed | providerOrderId=${providerOrderId}`);
      return {
        success: true,
        eventId: event.eventId,
        eventType: event.eventType,
        subscriptionId: event.merchantSubscriptionId,
        orderId: null,
        error: null,
      };
    }

    if (order.status === 'REFUNDED') {
      this.logger.log(`Order already refunded, skipping | orderId=${order.id}`);
      return {
        success: true,
        eventId: event.eventId,
        eventType: event.eventType,
        subscriptionId: event.merchantSubscriptionId,
        orderId: order.id,
        error: null,
      };
    }

    const updated = markOrderAsRefunded(order, refundId);
    await this.orderRepository.save(updated);
    this.logger.log(`Order marked as REFUNDED via webhook | orderId=${order.id} | refundId=${refundId}`);

    // Revoke entitlement for refunded ONE_TIME orders
    if (order.orderType === 'ONE_TIME' && order.planId) {
      await this.entitlementService.revokeFromOrder(order.id, 'refund_processed');
    }

    // Cancel USER_MANAGED subscription if the setup order is refunded
    if (order.orderType === 'SUBSCRIPTION_SETUP' && order.subscriptionId) {
      const sub = await this.subscriptionRepository.findById(order.subscriptionId);
      if (sub && sub.subscriptionType === SubscriptionType.USER_MANAGED) {
        this.logger.log(`Cancelling USER_MANAGED subscription due to refund | subscriptionId=${sub.id}`);
        const result = transitionSubscriptionStatus(sub, SubscriptionStatus.CANCELLED);
        if (result.success) {
          await this.subscriptionRepository.save(result.subscription);
          await this.entitlementService.revokeFromSubscription(sub.id, 'order_refunded');
        }
      }
    }

    return {
      success: true,
      eventId: event.eventId,
      eventType: event.eventType,
      subscriptionId: event.merchantSubscriptionId,
      orderId: order.id,
      error: null,
    };
  }

  /**
   * Handle refund.failed event
   *
   * Log the failure. The order remains in its current state.
   */
  private async handleRefundFailed(event: WebhookEvent): Promise<WebhookProcessResult> {
    const refundEntity = (event.rawPayload as any)?.payload?.refund?.entity;
    const refundId = refundEntity?.id ?? null;
    const paymentId = refundEntity?.payment_id ?? event.paymentId;

    this.logger.warn(`Refund failed | refundId=${refundId} | paymentId=${paymentId}`);

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
   * Persist a token to the payment_tokens table
   */
  private async persistToken(params: {
    event: WebhookEvent;
    providerTokenId: string;
    providerCustomerId: string;
    status: 'CREATED' | 'CONFIRMED';
    authPaymentId?: string;
    customerEmail?: string;
    customerContact?: string;
    paymentMethod?: string;
  }): Promise<void> {
    if (!this.db) return;

    try {
      // Resolve the subscription to get userId/appId
      const subscription = params.event.merchantSubscriptionId
        ? await this.subscriptionRepository.findByMerchantId(params.event.merchantSubscriptionId)
        : null;

      // Also try to find subscription via order notes
      let userId = subscription?.userId;
      let appId = subscription?.appId ?? params.event.appId;
      let subscriptionId = subscription?.id;
      let configId = subscription?.metadata?.configId ?? '';

      if (!subscription) {
        // Try to find via order
        const order = params.event.merchantOrderId
          ? await this.orderRepository.findByProviderOrderId(params.event.provider, params.event.merchantOrderId)
          : null;
        if (order) {
          userId = order.userId;
          appId = order.appId;
          subscriptionId = order.subscriptionId ?? undefined;
          configId = order.configId;
        }
      }

      if (!userId || !appId) {
        this.logger.warn(`Cannot persist token — no userId/appId found | tokenId=${params.providerTokenId}`);
        return;
      }

      await this.db.insert(paymentTokens).values({
        id: generateId('tok'),
        userId,
        appId: appId!,
        subscriptionId: subscriptionId ?? null,
        provider: params.event.provider,
        configId,
        providerTokenId: params.providerTokenId,
        providerCustomerId: params.providerCustomerId,
        status: params.status,
        authPaymentId: params.authPaymentId ?? null,
        customerEmail: params.customerEmail ?? null,
        customerContact: params.customerContact ?? null,
        providerData: params.event.rawPayload,
        confirmedAt: params.status === 'CONFIRMED' ? new Date() : null,
      }).onConflictDoNothing();

      this.logger.log(`Token persisted | tokenId=${params.providerTokenId} | status=${params.status} | subscriptionId=${subscriptionId}`);
    } catch (error) {
      this.logger.error(`Failed to persist token ${params.providerTokenId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update an existing token's status
   */
  private async updateTokenStatus(
    providerTokenId: string,
    provider: PaymentProvider,
    status: 'CONFIRMED' | 'REJECTED' | 'CANCELLED' | 'EXPIRED',
  ): Promise<void> {
    if (!this.db) return;

    try {
      await this.db
        .update(paymentTokens)
        .set({
          status,
          updatedAt: new Date(),
          ...(status === 'CONFIRMED' ? { confirmedAt: new Date() } : {}),
          ...(status === 'CANCELLED' || status === 'REJECTED' ? { revokedAt: new Date() } : {}),
        })
        .where(
          and(
            eq(paymentTokens.providerTokenId, providerTokenId),
            eq(paymentTokens.provider, provider),
          ),
        );
    } catch (error) {
      this.logger.error(`Failed to update token status ${providerTokenId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Store token and customer ID on the subscription's providerData
   */
  private async storeTokenOnSubscription(
    event: WebhookEvent,
    tokenId: string,
    customerId: string,
  ): Promise<void> {
    if (!event.merchantSubscriptionId) {
      // Try to find subscription from order notes
      const orderNotes = (event.rawPayload as any)?.payload?.order?.entity?.notes
        ?? (event.rawPayload as any)?.payload?.payment?.entity?.notes;
      const merchantSubId = orderNotes?.merchant_subscription_id;
      if (merchantSubId) {
        const sub = await this.subscriptionRepository.findByMerchantId(merchantSubId);
        if (sub) {
          const updated = {
            ...sub,
            providerData: {
              ...sub.providerData,
              tokenId,
              customerId,
            },
          };
          await this.subscriptionRepository.save(updated);
          this.logger.log(`Token stored on subscription via order notes | subscriptionId=${sub.id} | tokenId=${tokenId}`);
        }
      }
      return;
    }

    const sub = await this.subscriptionRepository.findByMerchantId(event.merchantSubscriptionId);
    if (sub) {
      const updated = {
        ...sub,
        providerData: {
          ...sub.providerData,
          tokenId,
          customerId,
        },
      };
      await this.subscriptionRepository.save(updated);
      this.logger.log(`Token stored on subscription | subscriptionId=${sub.id} | tokenId=${tokenId}`);
    }
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

    if (event.merchantSubscriptionId) {
      const sub = await this.subscriptionRepository.findByMerchantId(event.merchantSubscriptionId);
      if (sub) {
        await this.entitlementService.revokeFromSubscription(sub.id, 'subscription_revoked');
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
   * Handle redemption completed event (PhonePe)
   */
  private async handleRedemptionCompleted(event: WebhookEvent): Promise<WebhookProcessResult> {
    this.logger.log(`Redemption completed | merchantSubscriptionId=${event.merchantSubscriptionId} | paymentId=${event.paymentId} | merchantOrderId=${event.merchantOrderId}`);
    
    const subscription = await this.subscriptionRepository
      .findByMerchantId(event.merchantSubscriptionId ?? '');
    
    if (subscription) {
      this.logger.log(`Recording redemption payment | merchantSubscriptionId=${event.merchantSubscriptionId} | billingCycleCount=${subscription.billingCycleCount}`);
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
      this.logger.log(`Recording transaction payment | merchantSubscriptionId=${event.merchantSubscriptionId} | billingCycleCount=${subscription.billingCycleCount}`);
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
      this.logger.log(`Recording transaction failure | merchantSubscriptionId=${event.merchantSubscriptionId} | consecutiveFailures=${subscription.consecutiveFailures}`);
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
   * Activate a USER_MANAGED subscription by its ID.
   * Called from handlePaymentCaptured when a SUBSCRIPTION_SETUP order is captured.
   */
  private async activateUserManagedSubscription(
    subscriptionId: string,
    paymentId: string | null,
  ): Promise<void> {
    const subscription = await this.subscriptionRepository.findById(subscriptionId);
    if (!subscription) {
      this.logger.warn(`activateUserManagedSubscription: subscription not found | subscriptionId=${subscriptionId}`);
      return;
    }

    if (subscription.subscriptionType !== SubscriptionType.USER_MANAGED) {
      this.logger.log(`activateUserManagedSubscription: not USER_MANAGED, skipping | subscriptionId=${subscriptionId} | type=${subscription.subscriptionType}`);
      return;
    }

    if (subscription.status === SubscriptionStatus.ACTIVE) {
      this.logger.log(`activateUserManagedSubscription: already ACTIVE | subscriptionId=${subscriptionId}`);
      return;
    }

    this.logger.log(`activateUserManagedSubscription: transitioning to ACTIVE | subscriptionId=${subscriptionId} | currentStatus=${subscription.status}`);
    const result = transitionSubscriptionStatus(subscription, SubscriptionStatus.ACTIVE);
    if (result.success) {
      await this.subscriptionRepository.save(result.subscription);
      this.logger.log(`activateUserManagedSubscription: activated | subscriptionId=${subscriptionId}`);

      // Grant premium entitlement
      await this.entitlementService.grantFromSubscription({
        subscriptionId: subscription.id,
        userId: subscription.userId,
        appId: subscription.appId,
        planId: subscription.planId,
      });
    } else {
      this.logger.warn(`activateUserManagedSubscription: transition rejected | subscriptionId=${subscriptionId} | currentStatus=${subscription.status} | error=${result.transitionError}`);
    }
  }

  /**
   * Activate a USER_MANAGED subscription from a webhook event (e.g. token.confirmed).
   * Resolves the subscription via merchantSubscriptionId or order notes.
   */
  private async activateUserManagedSubscriptionFromEvent(event: WebhookEvent): Promise<void> {
    // Try merchantSubscriptionId first
    let subscription = event.merchantSubscriptionId
      ? await this.subscriptionRepository.findByMerchantId(event.merchantSubscriptionId)
      : null;

    // Fallback: resolve via order notes
    if (!subscription) {
      const orderNotes = (event.rawPayload as any)?.payload?.order?.entity?.notes
        ?? (event.rawPayload as any)?.payload?.payment?.entity?.notes;
      const merchantSubId = orderNotes?.merchant_subscription_id;
      if (merchantSubId) {
        subscription = await this.subscriptionRepository.findByMerchantId(merchantSubId);
      }
    }

    // Fallback: resolve via order's subscriptionId
    if (!subscription && event.merchantOrderId) {
      const order = await this.orderRepository.findByProviderOrderId(event.provider, event.merchantOrderId);
      if (order?.subscriptionId) {
        subscription = await this.subscriptionRepository.findById(order.subscriptionId);
      }
    }

    if (!subscription) {
      this.logger.warn(`activateUserManagedSubscriptionFromEvent: no subscription found for event | eventId=${event.eventId}`);
      return;
    }

    await this.activateUserManagedSubscription(subscription.id, event.paymentId ?? null);
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
