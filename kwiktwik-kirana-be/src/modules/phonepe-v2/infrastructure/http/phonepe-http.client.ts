import { Injectable, Logger } from '@nestjs/common';
import { PhonePeAuthManager } from './auth-manager';
import {
  SubscriptionFrequency,
  AuthWorkflowType,
  AmountType,
} from '../../domain/enums/subscription.enum';

// Request/Response types
export interface SetupSubscriptionRequest {
  merchantOrderId: string;
  amount: number;
  paymentFlow: {
    type: 'SUBSCRIPTION_CHECKOUT_SETUP';
    merchantUrls: {
      redirectUrl: string;
    };
    paymentModeConfig?: {
      type: 'UPI_INTENT' | 'UPI_COLLECT' | 'UPI_QR';
    };
    subscriptionDetails: {
      subscriptionType: 'RECURRING';
      merchantSubscriptionId: string;
      authWorkflowType: AuthWorkflowType;
      amountType: AmountType;
      maxAmount: number;
      frequency: SubscriptionFrequency;
      productType: 'UPI_MANDATE';
      expireAt?: number; // epoch in milliseconds
    };
  };
  expireAfter?: number;
  metaInfo?: Record<string, string>;
}

export interface SetupSubscriptionResponse {
  orderId: string;
  state: 'PENDING';
  expireAt: number;
  redirectUrl: string;
}

export interface SetupSubscriptionMobileRequest {
  merchantOrderId: string;
  amount: number;
  paymentFlow: {
    type: 'SUBSCRIPTION_CHECKOUT_SETUP';
    message?: string;
    subscriptionDetails: {
      subscriptionType: 'RECURRING';
      merchantSubscriptionId: string;
      authWorkflowType: AuthWorkflowType;
      amountType: AmountType;
      maxAmount: number;
      frequency: SubscriptionFrequency;
      productType: 'UPI_MANDATE';
      expireAt?: number; // epoch in milliseconds
    };
  };
  expireAfter?: number;
  metaInfo?: Record<string, string>;
}

export interface SetupSubscriptionMobileResponse {
  orderId: string;
  state: 'PENDING';
  expireAt: number;
  token: string;
}

export interface NotifyRedemptionRequest {
  merchantOrderId: string;
  amount: number;
  paymentFlow: {
    type: 'SUBSCRIPTION_CHECKOUT_REDEMPTION';
    merchantSubscriptionId: string;
    redemptionRetryStrategy: 'STANDARD'; // PhonePe handles retries
    autoDebit: true; // Always true for auto-charge
  };
}

export interface NotifyRedemptionResponse {
  orderId: string;
  state: 'NOTIFICATION_IN_PROGRESS';
  expireAt: number;
}

export interface GetSubscriptionStatusResponse {
  merchantSubscriptionId: string;
  subscriptionId: string;
  state: string;
  productType: string | null;
  authInstrumentType: string | null;
  authWorkflowType: AuthWorkflowType;
  amountType: AmountType;
  currency: string;
  maxAmount: number;
  frequency: SubscriptionFrequency;
  expireAt: number;
  pauseStartDate: number | null;
  pauseEndDate: number | null;
}

export interface GetOrderStatusResponse {
  merchantId: string;
  merchantOrderId: string;
  orderId: string;
  state: string;
  amount: number;
  expireAt: number;
  paymentDetails?: Array<{
    transactionId: string;
    paymentMode: string | null;
    timestamp: number;
    amount: number;
    state: string;
    errorCode?: string;
    detailedErrorCode?: string;
  }>;
}

/**
 * HTTP Client for PhonePe Autopay APIs
 */
@Injectable()
export class PhonePeHttpClient {
  private readonly logger = new Logger(PhonePeHttpClient.name);

  constructor(private readonly authManager: PhonePeAuthManager) {}

  /**
   * Setup a new subscription mandate (Web Checkout)
   * POST /checkout/v2/pay
   */
  async setupSubscription(
    appId: string,
    request: SetupSubscriptionRequest,
  ): Promise<SetupSubscriptionResponse> {
    const baseUrl = this.authManager.getBaseUrl(appId);
    const token = await this.authManager.getToken(appId);

    const url = `${baseUrl}/checkout/v2/pay`;

    this.logger.log(
      `Setting up subscription for ${appId}: ${request.paymentFlow.subscriptionDetails.merchantSubscriptionId}`,
    );

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `O-Bearer ${token}`,
        Accept: 'application/json',
      },
      body: JSON.stringify(request),
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      const error = await response.text();
      this.logger.error(`Subscription setup failed: ${error}`);
      throw new Error(
        `PhonePe subscription setup failed: ${response.status} - ${error}`,
      );
    }

    const data = await response.json();
    return data;
  }

  /**
   * Setup a new subscription mandate (Mobile SDK)
   * POST /checkout/v2/sdk/order
   * No redirectUrl required - returns token for SDK
   */
  async setupSubscriptionMobile(
    appId: string,
    request: SetupSubscriptionMobileRequest,
  ): Promise<SetupSubscriptionMobileResponse> {
    const baseUrl = this.authManager.getBaseUrl(appId);
    const token = await this.authManager.getToken(appId);

    const url = `${baseUrl}/checkout/v2/sdk/order`;

    this.logger.log(
      `Setting up mobile SDK subscription for ${appId}: ${request.paymentFlow.subscriptionDetails.merchantSubscriptionId}`,
    );

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `O-Bearer ${token}`,
        Accept: 'application/json',
      },
      body: JSON.stringify(request),
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      const error = await response.text();
      this.logger.error(`Mobile SDK subscription setup failed: ${error}`);
      throw new Error(
        `PhonePe mobile SDK subscription setup failed: ${response.status} - ${error}`,
      );
    }

    const data = await response.json();
    return data;
  }

  /**
   * Notify user about upcoming redemption (PhonePe handles execution)
   * POST /checkout/v2/subscriptions/notify
   */
  async notifyRedemption(
    appId: string,
    request: NotifyRedemptionRequest,
  ): Promise<NotifyRedemptionResponse> {
    const baseUrl = this.authManager.getBaseUrl(appId);
    const token = await this.authManager.getToken(appId);

    const url = `${baseUrl}/checkout/v2/subscriptions/notify`;

    this.logger.log(
      `Notifying redemption for ${appId}: order=${request.merchantOrderId}, sub=${request.paymentFlow.merchantSubscriptionId}`,
    );

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `O-Bearer ${token}`,
        Accept: 'application/json',
      },
      body: JSON.stringify(request),
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      const error = await response.text();
      this.logger.error(`Redemption notification failed: ${error}`);
      throw new Error(
        `PhonePe redemption notification failed: ${response.status} - ${error}`,
      );
    }

    const data = await response.json();
    return data;
  }

  /**
   * Get subscription status
   * GET /checkout/v2/subscriptions/{merchantSubscriptionId}/status
   */
  async getSubscriptionStatus(
    appId: string,
    merchantSubscriptionId: string,
    environment?: 'SANDBOX' | 'PRODUCTION',
  ): Promise<GetSubscriptionStatusResponse> {
    const baseUrl = environment
      ? environment === 'PRODUCTION'
        ? 'https://api.phonepe.com/apis/pg'
        : 'https://api-preprod.phonepe.com/apis/pg-sandbox'
      : this.authManager.getBaseUrl(appId);
    const token = await this.authManager.getToken(appId);

    const url = `${baseUrl}/checkout/v2/subscriptions/${merchantSubscriptionId}/status`;

    this.logger.log(
      `Getting subscription status for ${merchantSubscriptionId}`,
    );

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `O-Bearer ${token}`,
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      const error = await response.text();
      this.logger.error(`Get subscription status failed: ${error}`);
      throw new Error(
        `PhonePe get subscription status failed: ${response.status} - ${error}`,
      );
    }

    const data = await response.json();
    return data;
  }

  /**
   * Get order status (for both setup and redemption)
   * GET /checkout/v2/order/{merchantOrderId}/status
   */
  async getOrderStatus(
    appId: string,
    merchantOrderId: string,
    details: boolean = false,
  ): Promise<GetOrderStatusResponse> {
    const baseUrl = this.authManager.getBaseUrl(appId);
    const token = await this.authManager.getToken(appId);

    const url = `${baseUrl}/checkout/v2/order/${merchantOrderId}/status?details=${details}`;

    this.logger.log(`Getting order status for ${merchantOrderId}`);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `O-Bearer ${token}`,
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      const error = await response.text();
      this.logger.error(`Get order status failed: ${error}`);
      throw new Error(
        `PhonePe get order status failed: ${response.status} - ${error}`,
      );
    }

    const data = await response.json();
    return data;
  }
}
