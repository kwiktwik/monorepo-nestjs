/**
 * Subscription Manager Service
 * 
 * Orchestrates subscription lifecycle across different providers.
 * Handles both provider-managed and user-managed subscriptions.
 */

import { Injectable, Logger, Inject } from '@nestjs/common';
import { SubscriptionStateMachineService } from '../services/subscription-state-machine.service';
import { ProviderFactory } from '../providers/factory/provider.factory';
import { PaymentConfigService } from '../config/payment-config.service';
import type { ISubscriptionRepository } from '../infrastructure/repositories/subscription.repository.interface';
import type { IOrderRepository } from '../infrastructure/repositories/order.repository.interface';
import type { SubscriptionProvider, AnyProviderConfig } from '../providers/interfaces/subscription-provider.interface';
import type { Subscription, CreateSubscriptionParams } from '../domain/entities/subscription.entity';
import type { Order, CreateOrderParams } from '../domain/entities/order.entity';
import { createSubscription, transitionSubscriptionStatus } from '../domain/entities/subscription.entity';
import { createOrder, markOrderAsPaid, markOrderAsFailed } from '../domain/entities/order.entity';
import { PaymentProvider } from '../types/provider.enum';
import { SubscriptionType } from '../types/subscription-type.enum';
import { SubscriptionStatus, StateMachineEvent } from '../types/subscription-status.enum';
import { OrderStatus } from '../types/order-status.enum';
import { generateMerchantSubscriptionId, generateMerchantOrderId } from '../providers/base/provider-utils';

// ============================================================================
// Types
// ============================================================================

/**
 * Parameters for creating a subscription
 */
export interface CreateSubscriptionInput {
  /** User ID */
  readonly userId: string;
  /** App ID */
  readonly appId: string;
  /** Plan ID (internal) */
  readonly planId: string;
  /** Provider's plan ID (optional, will create if not provided) */
  readonly providerPlanId?: string;
  /** Subscription type */
  readonly subscriptionType: SubscriptionType;
  /** Payment provider */
  readonly provider: PaymentProvider;
  /** Account ID (optional) */
  readonly accountId?: string;
  /** Initial amount in paise */
  readonly initialAmount: number;
  /** Recurring amount in paise */
  readonly recurringAmount: number;
  /** Currency */
  readonly currency?: string;
  /** Billing frequency */
  readonly frequency: string;
  /** Total cycles (null = unlimited) */
  readonly totalCycles?: number;
  /** Customer email */
  readonly customerEmail?: string;
  /** Customer phone */
  readonly customerPhone?: string;
  /** Redirect URL */
  readonly redirectUrl?: string;
  /** Custom metadata */
  readonly metadata?: Record<string, string>;
}

/**
 * Result of subscription creation
 */
export interface CreateSubscriptionResult {
  readonly success: boolean;
  readonly subscription: Subscription | null;
  readonly order: Order | null;
  readonly providerSubscriptionId: string | null;
  readonly providerOrderId: string | null;
  readonly intentUrl: string | null;
  readonly redirectUrl: string | null;
  readonly error: string | null;
}

/**
 * Parameters for charging a subscription
 */
export interface ChargeSubscriptionInput {
  /** Subscription ID */
  readonly subscriptionId: string;
  /** Amount to charge (optional, uses recurring amount) */
  readonly amount?: number;
  /** Custom metadata */
  readonly metadata?: Record<string, string>;
}

/**
 * Result of subscription charge
 */
export interface ChargeSubscriptionResult {
  readonly success: boolean;
  readonly subscription: Subscription | null;
  readonly order: Order | null;
  readonly transactionId: string | null;
  readonly error: string | null;
}

/**
 * Parameters for cancelling a subscription
 */
export interface CancelSubscriptionInput {
  /** Subscription ID */
  readonly subscriptionId: string;
  /** Cancellation reason */
  readonly reason?: string;
}

/**
 * Result of subscription cancellation
 */
export interface CancelSubscriptionResult {
  readonly success: boolean;
  readonly subscription: Subscription | null;
  readonly error: string | null;
}

// ============================================================================
// Service
// ============================================================================

/**
 * Subscription Manager Service
 * 
 * Main service for managing subscriptions across providers.
 */
@Injectable()
export class SubscriptionManagerService {
  private readonly logger = new Logger(SubscriptionManagerService.name);

  constructor(
    private readonly stateMachine: SubscriptionStateMachineService,
    private readonly providerFactory: ProviderFactory,
    private readonly configService: PaymentConfigService,
    @Inject('ISubscriptionRepository') private readonly subscriptionRepository: ISubscriptionRepository,
    @Inject('IOrderRepository') private readonly orderRepository: IOrderRepository,
  ) {}

  /**
   * Create a new subscription
   */
  async createSubscription(input: CreateSubscriptionInput): Promise<CreateSubscriptionResult> {
    try {
      // Get provider configuration
      const config = this.configService.getConfig({
        appId: input.appId,
        provider: input.provider,
        accountId: input.accountId,
      });

      if (!config) {
        return this.createErrorResult('Configuration not found', input);
      }

      // Get provider instance
      const provider = this.providerFactory.getProvider(
        input.provider,
        input.subscriptionType,
        config,
      );

      // Generate IDs
      const subscriptionId = generateMerchantSubscriptionId();
      const orderId = generateMerchantOrderId();

      // Create subscription entity
      const subscriptionParams: CreateSubscriptionParams = {
        id: subscriptionId,
        merchantSubscriptionId: subscriptionId,
        userId: input.userId,
        appId: input.appId,
        subscriptionType: input.subscriptionType,
        provider: input.provider,
        planId: input.planId,
        pricing: {
          initialAmount: input.initialAmount,
          recurringAmount: input.recurringAmount,
          currency: input.currency ?? 'INR',
          frequency: input.frequency as any,
          totalCycles: input.totalCycles ?? null,
        },
        providerData: {},
        environment: config.environment,
        configId: config.configId,
        source: 'api',
      };

      let subscription = createSubscription(subscriptionParams);

      // Create order entity
      const orderParams: CreateOrderParams = {
        id: orderId,
        merchantOrderId: orderId,
        userId: input.userId,
        appId: input.appId,
        orderType: 'SUBSCRIPTION_SETUP',
        subscriptionType: input.subscriptionType,
        provider: input.provider,
        configId: config.configId,
        environment: config.environment,
        subscriptionId: subscriptionId,
        amount: input.initialAmount || input.recurringAmount,
        currency: input.currency,
      };

      let order = createOrder(orderParams);

      // Call provider to setup subscription
      const setupResult = await provider.setupSubscription({
        merchantSubscriptionId: subscriptionId,
        merchantOrderId: orderId,
        userId: input.userId,
        appId: input.appId,
        planId: input.planId,
        providerPlanId: input.providerPlanId ?? '',
        pricing: subscription.pricing,
        customerEmail: input.customerEmail ?? null,
        customerPhone: input.customerPhone ?? null,
        redirectUrl: input.redirectUrl ?? null,
        metadata: input.metadata ?? {},
      });

      if (!setupResult.success) {
        // Update subscription status to FAILED
        const failedResult = transitionSubscriptionStatus(subscription, SubscriptionStatus.FAILED);
        subscription = failedResult.subscription;

        // Save failed subscription
        await this.subscriptionRepository.save(subscription);

        return {
          success: false,
          subscription,
          order,
          providerSubscriptionId: null,
          providerOrderId: null,
          intentUrl: null,
          redirectUrl: null,
          error: setupResult.error,
        };
      }

      // Update subscription with provider data
      subscription = {
        ...subscription,
        providerData: {
          subscriptionId: setupResult.providerSubscriptionId ?? '',
          orderId: setupResult.providerOrderId,
          customerId: null,
          planId: input.providerPlanId ?? '',
          mandateId: null,
          raw: setupResult.providerData,
          lastSyncedAt: new Date(),
        },
      };

      // Update order with provider data
      order = {
        ...order,
        providerData: {
          ...order.providerData,
          orderId: setupResult.providerOrderId,
          intentUrl: setupResult.intentUrl,
        },
      };

      // Transition subscription status based on setup result
      const targetStatus = this.getInitialStatusFromSetup(setupResult.state);
      const transitionResult = transitionSubscriptionStatus(subscription, targetStatus);
      subscription = transitionResult.subscription;

      // Save to repository — subscription first, then order
      // If order save fails, clean up the subscription to avoid orphaned records
      await this.subscriptionRepository.save(subscription);
      try {
        await this.orderRepository.save(order);
      } catch (orderSaveError) {
        this.logger.error(`Failed to save order ${orderId}, rolling back subscription ${subscriptionId}`);
        try {
          await this.subscriptionRepository.delete(subscriptionId);
        } catch (rollbackError) {
          this.logger.error(`Failed to rollback subscription ${subscriptionId}: ${rollbackError instanceof Error ? rollbackError.message : 'Unknown error'}`);
        }
        throw orderSaveError;
      }

      this.logger.log(`Created subscription ${subscriptionId} with status ${subscription.status}`);

      return {
        success: true,
        subscription,
        order,
        providerSubscriptionId: setupResult.providerSubscriptionId,
        providerOrderId: setupResult.providerOrderId,
        intentUrl: setupResult.intentUrl,
        redirectUrl: setupResult.redirectUrl,
        error: null,
      };
    } catch (error) {
      this.logger.error(`Failed to create subscription: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return this.createErrorResult(error instanceof Error ? error.message : 'Unknown error', input);
    }
  }

  /**
   * Charge a subscription (for user-managed or manual charges)
   */
  async chargeSubscription(input: ChargeSubscriptionInput): Promise<ChargeSubscriptionResult> {
    try {
      // Get subscription from repository
      const subscription = await this.subscriptionRepository.findById(input.subscriptionId);
      if (!subscription) {
        return {
          success: false,
          subscription: null,
          order: null,
          transactionId: null,
          error: 'Subscription not found',
        };
      }

      // Check if subscription can be charged
      if (!this.stateMachine.canCharge(subscription)) {
        return {
          success: false,
          subscription,
          order: null,
          transactionId: null,
          error: `Subscription cannot be charged in status: ${subscription.status}`,
        };
      }

      // Get provider configuration
      const config = this.configService.getConfig({
        appId: subscription.appId,
        provider: subscription.provider,
      });

      if (!config) {
        return {
          success: false,
          subscription,
          order: null,
          transactionId: null,
          error: 'Configuration not found',
        };
      }

      // Get provider instance
      const provider = this.providerFactory.getProvider(
        subscription.provider,
        subscription.subscriptionType,
        config,
      );

      // Generate order ID
      const orderId = generateMerchantOrderId();
      const amount = input.amount ?? subscription.pricing.recurringAmount;

      // Create order entity
      let order = createOrder({
        id: orderId,
        merchantOrderId: orderId,
        userId: subscription.userId,
        appId: subscription.appId,
        orderType: 'SUBSCRIPTION_RECURRING',
        subscriptionType: subscription.subscriptionType,
        provider: subscription.provider,
        configId: subscription.metadata.configId,
        environment: subscription.metadata.environment,
        subscriptionId: subscription.id,
        amount,
        currency: subscription.pricing.currency,
      });

      // Call provider to charge
      const chargeResult = await provider.chargeSubscription({
        merchantSubscriptionId: subscription.merchantSubscriptionId,
        providerSubscriptionId: subscription.providerData.subscriptionId,
        merchantOrderId: orderId,
        amount,
        currency: subscription.pricing.currency,
        metadata: input.metadata ?? {},
      });

      // Update order with result
      if (chargeResult.success) {
        order = markOrderAsPaid(order, chargeResult.transactionId ?? '', {
          orderId: chargeResult.providerOrderId,
        });
      } else {
        order = markOrderAsFailed(order, chargeResult.error ?? 'Charge failed', {
          orderId: chargeResult.providerOrderId,
        });
      }

      // Save order
      await this.orderRepository.save(order);

      this.logger.log(`Charged subscription ${input.subscriptionId}: ${chargeResult.success ? 'success' : 'failed'}`);

      return {
        success: chargeResult.success,
        subscription,
        order,
        transactionId: chargeResult.transactionId,
        error: chargeResult.error,
      };
    } catch (error) {
      this.logger.error(`Failed to charge subscription: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return {
        success: false,
        subscription: null,
        order: null,
        transactionId: null,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(input: CancelSubscriptionInput): Promise<CancelSubscriptionResult> {
    try {
      // Get subscription from repository
      const subscription = await this.subscriptionRepository.findById(input.subscriptionId);
      if (!subscription) {
        return {
          success: false,
          subscription: null,
          error: 'Subscription not found',
        };
      }

      // Check if subscription can be cancelled
      if (subscription.status === SubscriptionStatus.CANCELLED) {
        return {
          success: true,
          subscription,
          error: null,
        };
      }

      // Get provider configuration
      const config = this.configService.getConfig({
        appId: subscription.appId,
        provider: subscription.provider,
      });

      if (!config) {
        return {
          success: false,
          subscription,
          error: 'Configuration not found',
        };
      }

      // Get provider instance
      const provider = this.providerFactory.getProvider(
        subscription.provider,
        subscription.subscriptionType,
        config,
      );

      // Call provider to cancel
      const cancelResult = await provider.cancelSubscription({
        merchantSubscriptionId: subscription.merchantSubscriptionId,
        providerSubscriptionId: subscription.providerData.subscriptionId,
        reason: input.reason ?? null,
      });

      // Update subscription status
      const targetStatus = cancelResult.success 
        ? SubscriptionStatus.CANCELLED 
        : subscription.status;
      
      const transitionResult = transitionSubscriptionStatus(subscription, targetStatus);
      const updatedSubscription = transitionResult.subscription;

      // Save updated subscription
      await this.subscriptionRepository.save(updatedSubscription);

      this.logger.log(`Cancelled subscription ${input.subscriptionId}: ${cancelResult.success ? 'success' : 'failed'}`);

      return {
        success: cancelResult.success,
        subscription: updatedSubscription,
        error: cancelResult.error,
      };
    } catch (error) {
      this.logger.error(`Failed to cancel subscription: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return {
        success: false,
        subscription: null,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get subscription by ID
   */
  async getSubscription(subscriptionId: string): Promise<Subscription | null> {
    return this.subscriptionRepository.findById(subscriptionId);
  }

  /**
   * Get subscription by merchant ID
   */
  async getSubscriptionByMerchantId(merchantSubscriptionId: string): Promise<Subscription | null> {
    return this.subscriptionRepository.findByMerchantId(merchantSubscriptionId);
  }

  /**
   * Get all active subscriptions for a user
   */
  async getActiveSubscriptions(userId: string): Promise<readonly Subscription[]> {
    return this.subscriptionRepository.findActiveByUserId(userId);
  }

  /**
   * Get subscriptions needing billing (for scheduled jobs)
   */
  async getSubscriptionsNeedingBilling(): Promise<readonly Subscription[]> {
    return this.subscriptionRepository.findNeedingBilling();
  }

  /**
   * Sync subscription status with provider
   */
  async syncSubscriptionStatus(subscriptionId: string): Promise<Subscription | null> {
    const subscription = await this.subscriptionRepository.findById(subscriptionId);
    if (!subscription) {
      return null;
    }

    const config = this.configService.getConfig({
      appId: subscription.appId,
      provider: subscription.provider,
    });

    if (!config) {
      return subscription;
    }

    const provider = this.providerFactory.getProvider(
      subscription.provider,
      subscription.subscriptionType,
      config,
    );

    const statusResult = await provider.getSubscriptionStatus({
      merchantSubscriptionId: subscription.merchantSubscriptionId,
      providerSubscriptionId: subscription.providerData.subscriptionId,
    });

    // Map and update status
    const mappedStatus = statusResult.mappedStatus as SubscriptionStatus;
    const transitionResult = transitionSubscriptionStatus(subscription, mappedStatus);
    const updatedSubscription = transitionResult.subscription;

    // Save updated subscription
    await this.subscriptionRepository.save(updatedSubscription);

    return updatedSubscription;
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  private createErrorResult(error: string, input: CreateSubscriptionInput): CreateSubscriptionResult {
    return {
      success: false,
      subscription: null,
      order: null,
      providerSubscriptionId: null,
      providerOrderId: null,
      intentUrl: null,
      redirectUrl: null,
      error,
    };
  }

  private getInitialStatusFromSetup(state: string): SubscriptionStatus {
    // Map provider state to initial subscription status
    const stateMap: Record<string, SubscriptionStatus> = {
      'created': SubscriptionStatus.CREATED,
      'pending': SubscriptionStatus.PENDING_AUTH,
      'authenticated': SubscriptionStatus.AUTHENTICATED,
      'active': SubscriptionStatus.ACTIVE,
      'activation_in_progress': SubscriptionStatus.ACTIVATION_IN_PROGRESS,
    };

    return stateMap[state.toLowerCase()] ?? SubscriptionStatus.CREATED;
  }
}
