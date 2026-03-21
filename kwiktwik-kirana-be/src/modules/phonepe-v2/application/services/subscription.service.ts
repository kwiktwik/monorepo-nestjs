import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { nanoid } from 'nanoid';
import { PhonePeHttpClient } from '../../infrastructure/http/phonepe-http.client';
import { PhonePeAuthManager } from '../../infrastructure/http/auth-manager';
import {
  SUBSCRIPTION_REPOSITORY,
  REDEMPTION_REPOSITORY,
} from '../../constants';
import type {
  SubscriptionRepository,
  RedemptionRepository,
} from '../interfaces/repository.interface';
import { Subscription } from '../../domain/entities/subscription.entity';
import { Redemption } from '../../domain/entities/redemption.entity';
import type {
  SubscriptionFrequency,
  AuthWorkflowType,
  AmountType,
} from '../../domain/enums/subscription.enum';

export interface SetupSubscriptionRequest {
  userId: string;
  appId: string;
  amount?: number; // Initial amount in rupees (optional)
  maxAmount: number; // Max amount in rupees
  frequency: SubscriptionFrequency;
  redirectUrl: string;
  merchantSubscriptionId?: string;
  authWorkflowType?: AuthWorkflowType;
  amountType?: AmountType;
  expireAt?: Date;
  metadata?: Record<string, unknown>;
}

export interface SetupSubscriptionResponse {
  orderId: string;
  merchantSubscriptionId: string;
  merchantOrderId: string;
  redirectUrl: string;
  state: string;
  expireAt: Date;
  merchantId: string;
}

export interface NotifyRedemptionRequest {
  userId: string;
  appId: string;
  merchantSubscriptionId: string;
  amount: number; // Amount in rupees
  metadata?: Record<string, unknown>;
}

export interface NotifyRedemptionResponse {
  orderId: string;
  merchantOrderId: string;
  state: string;
  expireAt: Date;
}

export interface GetSubscriptionStatusResponse {
  merchantSubscriptionId: string;
  phonepeSubscriptionId: string | null;
  state: string;
  maxAmount: number;
  frequency: string;
  canRedeem: boolean;
}

/**
 * Service for managing PhonePe Autopay subscriptions and redemptions
 */
@Injectable()
export class SubscriptionService {
  private readonly logger = new Logger(SubscriptionService.name);

  constructor(
    private readonly httpClient: PhonePeHttpClient,
    private readonly authManager: PhonePeAuthManager,
    @Inject(SUBSCRIPTION_REPOSITORY)
    private readonly subscriptionRepo: SubscriptionRepository,
    @Inject(REDEMPTION_REPOSITORY)
    private readonly redemptionRepo: RedemptionRepository,
  ) {}

  /**
   * Setup a new subscription mandate
   * User will be redirected to PhonePe to approve the mandate
   */
  async setupSubscription(
    request: SetupSubscriptionRequest,
  ): Promise<SetupSubscriptionResponse> {
    const merchantSubscriptionId = request.merchantSubscriptionId || nanoid(10);
    const merchantOrderId = nanoid(10);

    // Check if merchant subscription ID already exists
    const exists = await this.subscriptionRepo.existsByMerchantSubscriptionId(
      merchantSubscriptionId,
    );
    if (exists) {
      throw new BadRequestException(
        `Subscription with ID ${merchantSubscriptionId} already exists`,
      );
    }

    // Create domain entity
    const subscription = Subscription.create({
      id: nanoid(10),
      merchantSubscriptionId,
      userId: request.userId,
      appId: request.appId,
      maxAmount: Math.round(request.maxAmount * 100), // Convert to paise
      frequency: request.frequency,
      authWorkflowType: request.authWorkflowType || 'TRANSACTION',
      amountType: request.amountType || 'VARIABLE',
      expireAt: request.expireAt,
      metadata: request.metadata || {},
    });

    // Save to database
    await this.subscriptionRepo.create(subscription);

    // Call PhonePe API
    const response = await this.httpClient.setupSubscription(request.appId, {
      merchantOrderId,
      amount: request.amount
        ? Math.round(request.amount * 100)
        : subscription.maxAmount,
      paymentFlow: {
        type: 'SUBSCRIPTION_CHECKOUT_SETUP',
        merchantUrls: {
          redirectUrl: request.redirectUrl,
        },
        subscriptionDetails: {
          subscriptionType: 'RECURRING',
          merchantSubscriptionId,
          authWorkflowType: subscription.authWorkflowType,
          amountType: subscription.amountType,
          maxAmount: subscription.maxAmount,
          frequency: subscription.frequency,
          productType: 'UPI_MANDATE',
          expireAt: subscription.expireAt
            ? subscription.expireAt.getTime()
            : undefined,
        },
      },
      expireAfter: 1800, // 30 minutes
      metaInfo: request.metadata as Record<string, string>,
    });

    // Update subscription state
    subscription.markAsActivationInProgress();
    await this.subscriptionRepo.update(subscription);

    this.logger.log(
      `Subscription setup initiated: ${merchantSubscriptionId} for user ${request.userId}`,
    );

    // Get merchant ID for SDK configuration
    const credentials = this.authManager.getCredentials(request.appId);

    return {
      orderId: response.orderId,
      merchantSubscriptionId,
      merchantOrderId,
      redirectUrl: response.redirectUrl,
      state: response.state,
      expireAt: new Date(response.expireAt),
      merchantId: credentials.merchantId,
    };
  }

  /**
   * Notify user about upcoming redemption
   * PhonePe will handle auto-debit after notification period
   */
  async notifyRedemption(
    request: NotifyRedemptionRequest,
  ): Promise<NotifyRedemptionResponse> {
    // Find subscription
    const subscription =
      await this.subscriptionRepo.findByMerchantSubscriptionId(
        request.merchantSubscriptionId,
      );

    if (!subscription) {
      throw new NotFoundException(
        `Subscription ${request.merchantSubscriptionId} not found`,
      );
    }

    // Verify subscription belongs to user and app
    if (subscription.userId !== request.userId) {
      throw new BadRequestException('Subscription does not belong to user');
    }

    if (subscription.appId !== request.appId) {
      throw new BadRequestException('Subscription does not belong to app');
    }

    // Check if subscription is active
    if (!subscription.canRedeem()) {
      throw new BadRequestException(
        `Cannot redeem from subscription in state: ${subscription.state}`,
      );
    }

    // Check for existing active redemption
    const existingRedemption =
      await this.redemptionRepo.findActiveBySubscriptionId(
        request.merchantSubscriptionId,
      );

    if (existingRedemption) {
      throw new BadRequestException(
        `Active redemption already exists for subscription: ${request.merchantSubscriptionId}`,
      );
    }

    // Create redemption entity
    const merchantOrderId = nanoid(10);
    const redemption = Redemption.create({
      id: nanoid(10),
      merchantOrderId,
      merchantSubscriptionId: request.merchantSubscriptionId,
      userId: request.userId,
      appId: request.appId,
      amount: Math.round(request.amount * 100), // Convert to paise
      autoDebit: true, // PhonePe handles execution
      metadata: request.metadata || {},
    });

    // Save to database
    await this.redemptionRepo.create(redemption);

    // Call PhonePe API
    const response = await this.httpClient.notifyRedemption(request.appId, {
      merchantOrderId,
      amount: redemption.amount,
      paymentFlow: {
        type: 'SUBSCRIPTION_CHECKOUT_REDEMPTION',
        merchantSubscriptionId: request.merchantSubscriptionId,
        redemptionRetryStrategy: 'STANDARD', // PhonePe handles retries
        autoDebit: true,
      },
    });

    // Update redemption with PhonePe response
    redemption.markAsNotified(
      response.orderId,
      new Date(Date.now() + 24 * 60 * 60 * 1000), // validAfter: 24 hours from now
      new Date(Date.now() + 48 * 60 * 60 * 1000), // validUpto: 48 hours from now
    );
    await this.redemptionRepo.update(redemption);

    this.logger.log(
      `Redemption notified: ${merchantOrderId} for subscription ${request.merchantSubscriptionId}`,
    );

    return {
      orderId: response.orderId,
      merchantOrderId,
      state: response.state,
      expireAt: new Date(response.expireAt),
    };
  }

  /**
   * Get subscription status
   */
  async getSubscriptionStatus(
    appId: string,
    merchantSubscriptionId: string,
  ): Promise<GetSubscriptionStatusResponse> {
    // Try to get from PhonePe first
    try {
      const phonepeStatus = await this.httpClient.getSubscriptionStatus(
        appId,
        merchantSubscriptionId,
      );

      // Update local state if needed
      const subscription =
        await this.subscriptionRepo.findByMerchantSubscriptionId(
          merchantSubscriptionId,
        );

      if (subscription) {
        // Sync state if different
        const phonepeState = phonepeStatus.state.toUpperCase();
        if (this.isStateTransitionValid(subscription.state, phonepeState)) {
          this.applyStateTransition(subscription, phonepeState);
          await this.subscriptionRepo.update(subscription);
        }
      }

      return {
        merchantSubscriptionId: phonepeStatus.merchantSubscriptionId,
        phonepeSubscriptionId: phonepeStatus.subscriptionId,
        state: phonepeStatus.state,
        maxAmount: phonepeStatus.maxAmount / 100, // Convert to rupees
        frequency: phonepeStatus.frequency,
        canRedeem: phonepeStatus.state === 'ACTIVE',
      };
    } catch (error) {
      // Fall back to local state if PhonePe call fails
      const subscription =
        await this.subscriptionRepo.findByMerchantSubscriptionId(
          merchantSubscriptionId,
        );

      if (!subscription) {
        throw new NotFoundException(
          `Subscription ${merchantSubscriptionId} not found`,
        );
      }

      return {
        merchantSubscriptionId: subscription.merchantSubscriptionId,
        phonepeSubscriptionId: subscription.phonepeSubscriptionId,
        state: subscription.state,
        maxAmount: subscription.maxAmount / 100,
        frequency: subscription.frequency,
        canRedeem: subscription.canRedeem(),
      };
    }
  }

  /**
   * Get user's subscriptions
   */
  async getUserSubscriptions(
    userId: string,
    appId: string,
  ): Promise<GetSubscriptionStatusResponse[]> {
    const subscriptions = await this.subscriptionRepo.findByUserId(
      userId,
      appId,
    );

    return subscriptions.map((sub) => ({
      merchantSubscriptionId: sub.merchantSubscriptionId,
      phonepeSubscriptionId: sub.phonepeSubscriptionId,
      state: sub.state,
      maxAmount: sub.maxAmount / 100,
      frequency: sub.frequency,
      canRedeem: sub.canRedeem(),
    }));
  }

  private isStateTransitionValid(fromState: string, toState: string): boolean {
    // Define valid transitions
    const transitions: Record<string, string[]> = {
      CREATED: ['ACTIVATION_IN_PROGRESS', 'FAILED'],
      ACTIVATION_IN_PROGRESS: ['ACTIVE', 'FAILED'],
      ACTIVE: ['PAUSED', 'CANCELLED', 'REVOKED', 'EXPIRED'],
      PAUSED: ['ACTIVE'],
    };

    return transitions[fromState]?.includes(toState) || false;
  }

  private applyStateTransition(subscription: Subscription, newState: string) {
    switch (newState) {
      case 'ACTIVE':
        if (!subscription.phonepeSubscriptionId) {
          // We need the phonepe subscription ID, but it's not available here
          // This would typically come from webhook
          subscription.activate('pending');
        }
        break;
      case 'PAUSED':
        subscription.pause();
        break;
      case 'CANCELLED':
        subscription.initiateCancellation();
        subscription.confirmCancellation();
        break;
      case 'REVOKED':
        subscription.revoke();
        break;
      case 'FAILED':
        subscription.markAsFailed();
        break;
    }
  }

  /**
   * Get order status with payment details
   */
  async getOrderStatus(
    appId: string,
    merchantOrderId: string,
    details?: boolean,
  ): Promise<{
    merchantId: string;
    merchantOrderId: string;
    orderId: string;
    state: string;
    amount: number;
    expireAt: Date;
    paymentDetails?: Array<{
      transactionId: string;
      paymentMode: string | null;
      timestamp: Date;
      amount: number;
      state: string;
    }>;
  }> {
    const response = await this.httpClient.getOrderStatus(
      appId,
      merchantOrderId,
      details ?? false,
    );

    return {
      merchantId: response.merchantId,
      merchantOrderId: response.merchantOrderId,
      orderId: response.orderId,
      state: response.state,
      amount: response.amount / 100, // Convert from paise to rupees
      expireAt: new Date(response.expireAt),
      paymentDetails: response.paymentDetails?.map((detail) => ({
        transactionId: detail.transactionId,
        paymentMode: detail.paymentMode,
        timestamp: new Date(detail.timestamp),
        amount: detail.amount / 100, // Convert from paise to rupees
        state: detail.state,
      })),
    };
  }
}
