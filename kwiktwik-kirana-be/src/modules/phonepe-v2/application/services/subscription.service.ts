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
import { PAYWALL_PLANS } from '../../../config/config.data';

export interface SetupSubscriptionBaseRequest {
  userId: string;
  appId: string;
  planId: string; // Plan ID from PAYWALL_PLANS (e.g., 'plan_PHONEPE_AUTOPAY_001')
  merchantSubscriptionId?: string;
  metadata?: Record<string, unknown>;
}

export interface SetupSubscriptionMobileRequest
  extends SetupSubscriptionBaseRequest {
  // Mobile SDK flow — no redirectUrl needed
}

export interface SetupSubscriptionWebRequest
  extends SetupSubscriptionBaseRequest {
  redirectUrl: string; // Required for web checkout
}

/** @deprecated Use SetupSubscriptionMobileRequest or SetupSubscriptionWebRequest */
export type SetupSubscriptionRequest =
  | SetupSubscriptionMobileRequest
  | SetupSubscriptionWebRequest;

export interface SetupSubscriptionResponse {
  orderId: string;
  token: string;
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
   * Setup a new subscription via the Mobile SDK flow.
   * Returns a token for the PhonePe SDK — no redirectUrl involved.
   */
  async setupSubscriptionMobile(
    request: SetupSubscriptionMobileRequest,
  ): Promise<SetupSubscriptionResponse> {
    const { subscription, merchantOrderId, amount, credentials } =
      await this.resolvePlanAndCreateSubscription(request);
    const merchantSubscriptionId = subscription.merchantSubscriptionId;

    const mobileResponse = await this.httpClient.setupSubscriptionMobile(
      request.appId,
      {
        merchantOrderId,
        amount: Math.round(amount * 100),
        paymentFlow: {
          type: 'SUBSCRIPTION_CHECKOUT_SETUP',
          message: request.metadata?.message as string,
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
      },
    );

    subscription.markAsActivationInProgress();
    await this.subscriptionRepo.update(subscription);

    this.logger.log(
      `Subscription (mobile) setup initiated: ${merchantSubscriptionId} for user ${request.userId}`,
    );

    return {
      orderId: mobileResponse.orderId,
      token: mobileResponse.token,
      merchantSubscriptionId,
      merchantOrderId,
      redirectUrl: '',
      state: mobileResponse.state,
      expireAt: new Date(mobileResponse.expireAt),
      merchantId: credentials.merchantId,
    };
  }

  /**
   * Setup a new subscription via the Web Checkout flow.
   * Requires a redirectUrl; returns a PhonePe-hosted checkout URL.
   */
  async setupSubscriptionWeb(
    request: SetupSubscriptionWebRequest,
  ): Promise<SetupSubscriptionResponse> {
    const { subscription, merchantOrderId, amount, credentials, upiPaymentMode } =
      await this.resolvePlanAndCreateSubscription(request);
    const merchantSubscriptionId = subscription.merchantSubscriptionId;

    const webResponse = await this.httpClient.setupSubscription(
      request.appId,
      {
        merchantOrderId,
        amount: Math.round(amount * 100),
        paymentFlow: {
          type: 'SUBSCRIPTION_CHECKOUT_SETUP',
          merchantUrls: { redirectUrl: request.redirectUrl },
          paymentModeConfig: { type: upiPaymentMode },
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
      },
    );

    // Extract SDK token from redirectUrl if caller needs it for hybrid flows
    let sdkToken = '';
    try {
      const url = new URL(webResponse.redirectUrl);
      sdkToken = url.searchParams.get('token') || '';
    } catch (error) {
      this.logger.warn(
        `Failed to extract token from redirectUrl: ${error.message}`,
      );
    }

    subscription.markAsActivationInProgress();
    await this.subscriptionRepo.update(subscription);

    this.logger.log(
      `Subscription (web) setup initiated: ${merchantSubscriptionId} for user ${request.userId}`,
    );

    return {
      orderId: webResponse.orderId,
      token: sdkToken,
      merchantSubscriptionId,
      merchantOrderId,
      redirectUrl: webResponse.redirectUrl,
      state: webResponse.state,
      expireAt: new Date(webResponse.expireAt),
      merchantId: credentials.merchantId,
    };
  }

  /**
   * Resolves the plan config, checks for duplicates, creates and persists
   * the Subscription entity, and returns everything callers need.
   */
  private async resolvePlanAndCreateSubscription(request: SetupSubscriptionBaseRequest) {
    const merchantSubscriptionId = request.merchantSubscriptionId || nanoid(10);
    const merchantOrderId = nanoid(10);

    const exists = await this.subscriptionRepo.existsByMerchantSubscriptionId(
      merchantSubscriptionId,
    );
    if (exists) {
      throw new BadRequestException(
        `Subscription with ID ${merchantSubscriptionId} already exists`,
      );
    }

    if (!request.planId) {
      throw new BadRequestException('planId is required');
    }

    const planEntry = Object.entries(PAYWALL_PLANS).find(
      ([, plan]) => plan.plan_id === request.planId,
    );
    if (!planEntry) {
      throw new BadRequestException(
        `Plan not found for plan_id: ${request.planId}`,
      );
    }

    const [planName, planConfig] = planEntry;
    this.logger.log(`Using plan: ${planName} (${planConfig.plan_id})`);

    if (!('phonepeConfig' in planConfig)) {
      throw new BadRequestException(
        `Plan ${request.planId} is not configured for PhonePe`,
      );
    }

    const phonepeConfig = planConfig.phonepeConfig;
    const maxAmount = phonepeConfig.maxAmount / 100;
    const frequency = phonepeConfig.frequency as SubscriptionFrequency;
    const authWorkflowType = phonepeConfig.authWorkflowType as AuthWorkflowType;
    const amountType = phonepeConfig.amountType as AmountType;
    const upiPaymentMode = phonepeConfig.upiPaymentMode;
    const amount = parseInt(
      planConfig.pricing.initialAmount.replace(/[^0-9]/g, ''),
    );

    const credentials = this.authManager.getCredentials(request.appId);

    const subscription = Subscription.create({
      id: nanoid(10),
      merchantSubscriptionId,
      userId: request.userId,
      appId: request.appId,
      maxAmount: Math.round(maxAmount * 100),
      frequency,
      authWorkflowType,
      amountType,
      expireAt: undefined,
      metadata: {
        ...(request.metadata || {}),
        planId: request.planId,
        planName,
      },
      environment: credentials.env,
    });

    await this.subscriptionRepo.create(subscription);

    return { subscription, merchantOrderId, amount, credentials, upiPaymentMode };
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

    try {
      if (!subscription.phonepeSubscriptionId) {
        throw new Error(
          `Subscription ${request.merchantSubscriptionId} has no phonepeSubscriptionId — is it activated?`,
        );
      }

      // Call PhonePe API
      const response = await this.httpClient.notifyRedemption(request.appId, {
        merchantOrderId,
        amount: redemption.amount,
        paymentFlow: {
          type: 'SUBSCRIPTION_CHECKOUT_REDEMPTION',
          merchantSubscriptionId: request.merchantSubscriptionId,
          subscriptionId: subscription.phonepeSubscriptionId, // PhonePe's OMS... ID
          redemptionRetryStrategy: 'STANDARD', // PhonePe handles retries
          autoDebit: true,
        },
      });

      // Update redemption with PhonePe response
      this.logger.log(
        `[PhonePe] Marking redemption as notified: merchantOrderId=${merchantOrderId}, phonepeOrderId=${response.orderId}, expireAt=${new Date(response.expireAt).toISOString()}`,
      );
      redemption.markAsNotified(
        response.orderId,
        new Date(response.expireAt), // Use PhonePe's actual expiration time
      );
      this.logger.log(
        `[PhonePe] Redemption state after markAsNotified: state=${redemption.state}, phonepeOrderId=${redemption.phonepeOrderId}, expireAt=${redemption.expireAt?.toISOString()}`,
      );
      await this.redemptionRepo.update(redemption);
      this.logger.log(
        `[PhonePe] Redemption updated in database: id=${redemption.id}`,
      );

      this.logger.log(
        `Redemption notified: ${merchantOrderId} for subscription ${request.merchantSubscriptionId}`,
      );

      return {
        orderId: response.orderId,
        merchantOrderId,
        state: response.state,
        expireAt: new Date(response.expireAt),
      };
    } catch (error) {
      // PhonePe notification failed - mark redemption as FAILED
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorCode =
        error instanceof Error && 'code' in error
          ? (error as any).code
          : 'NOTIFICATION_FAILED';

      this.logger.error(
        `[PhonePe] Redemption notification failed: merchantOrderId=${merchantOrderId}, error=${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
      );

      // Mark redemption as failed with error details
      redemption.markNotificationFailed(errorCode, errorMessage);

      // Update metadata with error info
      (redemption as any).metadata = {
        ...(redemption as any).metadata,
        notificationFailedAt: new Date().toISOString(),
        notificationError: errorMessage,
        notificationErrorCode: errorCode,
      };

      await this.redemptionRepo.update(redemption);

      this.logger.log(
        `[PhonePe] Redemption marked as FAILED: merchantOrderId=${merchantOrderId}, state=${redemption.state}`,
      );

      // Re-throw the error so caller knows it failed
      throw error;
    }
  }

  /**
   * Get subscription status
   */
  async getSubscriptionStatus(
    appId: string,
    merchantSubscriptionId: string,
  ): Promise<GetSubscriptionStatusResponse> {
    // Get subscription from DB first to check environment
    const subscription =
      await this.subscriptionRepo.findByMerchantSubscriptionId(
        merchantSubscriptionId,
      );

    if (!subscription) {
      throw new NotFoundException(
        `Subscription ${merchantSubscriptionId} not found`,
      );
    }

    // Try to get from PhonePe using the stored environment from metadata
    try {
      const environment =
        (subscription.metadata.environment as 'SANDBOX' | 'PRODUCTION') ||
        'SANDBOX';
      const phonepeStatus = await this.httpClient.getSubscriptionStatus(
        appId,
        merchantSubscriptionId,
        environment,
      );

      // Sync state if different
      const phonepeState = phonepeStatus.state.toUpperCase();
      if (this.isStateTransitionValid(subscription.state, phonepeState)) {
        this.applyStateTransition(subscription, phonepeState);
        await this.subscriptionRepo.update(subscription);
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
   * Sync subscription status from order status (manual fallback when webhook not received)
   */
  async syncSubscriptionFromOrder(
    appId: string,
    merchantOrderId: string,
    merchantSubscriptionId: string,
  ): Promise<GetSubscriptionStatusResponse> {
    // First check order status
    const orderStatus = await this.httpClient.getOrderStatus(
      appId,
      merchantOrderId,
      true,
    );

    // Find local subscription
    const subscription =
      await this.subscriptionRepo.findByMerchantSubscriptionId(
        merchantSubscriptionId,
      );

    if (!subscription) {
      throw new NotFoundException(
        `Subscription ${merchantSubscriptionId} not found`,
      );
    }

    // If order is completed and subscription is still in ACTIVATION_IN_PROGRESS, activate it
    if (
      orderStatus.state === 'COMPLETED' &&
      subscription.state === 'ACTIVATION_IN_PROGRESS'
    ) {
      this.logger.log(
        `Order ${merchantOrderId} is COMPLETED, activating subscription ${merchantSubscriptionId}`,
      );
      subscription.activate(orderStatus.orderId);
      await this.subscriptionRepo.update(subscription);
    }

    // Return updated status
    return this.getSubscriptionStatus(appId, merchantSubscriptionId);
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
