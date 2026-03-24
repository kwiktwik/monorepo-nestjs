import { Injectable, Logger } from '@nestjs/common';
import { PhonePeAuthManager } from './auth-manager';
import {
  SubscriptionFrequency,
  AuthWorkflowType,
  AmountType,
} from '../../domain/enums/subscription.enum';
import { SUBSCRIPTION_SETUP } from '../../constants';

// Request/Response types for Custom Checkout
export interface SetupSubscriptionRequest {
  merchantOrderId: string;
  amount: number;
  expireAt?: number; // epoch in milliseconds
  paymentFlow: {
    type: typeof SUBSCRIPTION_SETUP;
    merchantSubscriptionId: string;
    authWorkflowType: AuthWorkflowType;
    amountType: AmountType;
    maxAmount: number;
    frequency: SubscriptionFrequency;
    expireAt?: number; // epoch in milliseconds
    paymentMode: {
      type: 'UPI_INTENT' | 'UPI_COLLECT' | 'UPI_QR';
      targetApp?: string; // Package name for Android, app identifier for iOS
    };
  };
  deviceContext: {
    deviceOS: 'ANDROID' | 'IOS';
  };
  metaInfo?: Record<string, string>;
}

export interface SetupSubscriptionResponse {
  orderId: string;
  state: 'PENDING';
  intentUrl: string; // UPI intent URL to invoke payment app
}

export interface NotifyRedemptionRequest {
  merchantOrderId: string;
  amount: number;
  paymentFlow: {
    type: 'SUBSCRIPTION_REDEMPTION';
    merchantSubscriptionId: string;
  };
}

export interface NotifyRedemptionResponse {
  orderId: string;
  state: 'NOTIFICATION_IN_PROGRESS';
  expireAt: number;
}

export interface ExecuteRedemptionRequest {
  merchantOrderId: string;
  amount: number;
  paymentFlow: {
    type: 'SUBSCRIPTION_REDEMPTION';
    merchantSubscriptionId: string;
  };
}

export interface ExecuteRedemptionResponse {
  orderId: string;
  state: string;
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
 * HTTP Client for PhonePe Autopay Custom Checkout APIs
 */
@Injectable()
export class PhonePeHttpClient {
  private readonly logger = new Logger(PhonePeHttpClient.name);

  constructor(private readonly authManager: PhonePeAuthManager) {}

  /**
   * Setup a new subscription mandate (Custom Checkout - UPI Intent)
   * POST /subscriptions/v2/setup
   */
  async setupSubscription(
    appId: string,
    request: SetupSubscriptionRequest,
  ): Promise<SetupSubscriptionResponse> {
    const url = `${this.authManager.getBaseUrl(appId)}/subscriptions/v2/setup`;
    const token = await this.authManager.getToken(appId);

    this.logger.log(
      `[PhonePe API] Setting up subscription for ${appId}: ${request.paymentFlow.merchantSubscriptionId}`,
    );
    this.logger.debug(`[PhonePe API] Request URL: ${url}`);
    this.logger.debug(`[PhonePe API] Request body: ${JSON.stringify(request)}`);

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

    const responseText = await response.text();
    this.logger.debug(`[PhonePe API] Response: ${responseText}`);

    if (!response.ok) {
      this.logger.error(
        `[PhonePe API] Subscription setup failed: ${responseText}`,
      );
      throw new Error(
        `PhonePe subscription setup failed: ${response.status} - ${responseText}`,
      );
    }

    const data = JSON.parse(responseText);
    this.logger.log(
      `[PhonePe API] Subscription setup success: orderId=${data.orderId}, state=${data.state}`,
    );
    return data;
  }

  /**
   * Notify user about upcoming redemption (PhonePe handles execution after notification period)
   * POST /subscriptions/v2/notify
   */
  async notifyRedemption(
    appId: string,
    request: NotifyRedemptionRequest,
  ): Promise<NotifyRedemptionResponse> {
    const baseUrl = this.authManager.getBaseUrl(appId);
    const token = await this.authManager.getToken(appId);

    const url = `${baseUrl}/subscriptions/v2/notify`;

    this.logger.log(
      `[PhonePe API] Notifying redemption for ${appId}: order=${request.merchantOrderId}, sub=${request.paymentFlow.merchantSubscriptionId}`,
    );
    this.logger.debug(`[PhonePe API] Request URL: ${url}`);
    this.logger.debug(`[PhonePe API] Request body: ${JSON.stringify(request)}`);

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

    const responseText = await response.text();
    this.logger.debug(`[PhonePe API] Response: ${responseText}`);

    if (!response.ok) {
      this.logger.error(
        `[PhonePe API] Redemption notification failed: ${responseText}`,
      );
      throw new Error(
        `PhonePe redemption notification failed: ${response.status} - ${responseText}`,
      );
    }

    const data = JSON.parse(responseText);
    this.logger.log(
      `[PhonePe API] Redemption notify response: orderId=${data.orderId}, state=${data.state}`,
    );
    return data;
  }

  /**
   * Execute redemption directly (for merchant-controlled debit)
   * POST /subscriptions/v2/redeem
   */
  async executeRedemption(
    appId: string,
    request: ExecuteRedemptionRequest,
  ): Promise<ExecuteRedemptionResponse> {
    const baseUrl = this.authManager.getBaseUrl(appId);
    const token = await this.authManager.getToken(appId);

    const url = `${baseUrl}/subscriptions/v2/redeem`;

    this.logger.log(
      `[PhonePe API] Executing redemption for ${appId}: order=${request.merchantOrderId}, sub=${request.paymentFlow.merchantSubscriptionId}`,
    );
    this.logger.debug(`[PhonePe API] Request URL: ${url}`);
    this.logger.debug(`[PhonePe API] Request body: ${JSON.stringify(request)}`);

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

    const responseText = await response.text();
    this.logger.debug(`[PhonePe API] Response: ${responseText}`);

    if (!response.ok) {
      this.logger.error(
        `[PhonePe API] Redemption execution failed: ${responseText}`,
      );
      throw new Error(
        `PhonePe redemption execution failed: ${response.status} - ${responseText}`,
      );
    }

    const data = JSON.parse(responseText);
    this.logger.log(
      `[PhonePe API] Redemption execute response: orderId=${data.orderId}, state=${data.state}`,
    );
    return data;
  }

  /**
   * Get subscription status
   * GET /subscriptions/v2/{merchantSubscriptionId}/status
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

    const url = `${baseUrl}/subscriptions/v2/${merchantSubscriptionId}/status`;

    this.logger.log(
      `[PhonePe API] Getting subscription status for ${merchantSubscriptionId} (env: ${environment || 'default'})`,
    );
    this.logger.debug(`[PhonePe API] Request URL: ${url}`);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `O-Bearer ${token}`,
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(10000),
    });

    const responseText = await response.text();
    this.logger.debug(`[PhonePe API] Response: ${responseText}`);

    if (!response.ok) {
      this.logger.error(
        `[PhonePe API] Get subscription status failed: ${responseText}`,
      );
      throw new Error(
        `PhonePe get subscription status failed: ${response.status} - ${responseText}`,
      );
    }

    const data = JSON.parse(responseText);
    this.logger.log(
      `[PhonePe API] Subscription status: ${data.state}, subscriptionId: ${data.subscriptionId}`,
    );
    return data;
  }

  /**
   * Get order status (for both setup and redemption)
   * GET /subscriptions/v2/order/{merchantOrderId}/status
   */
  async getOrderStatus(
    appId: string,
    merchantOrderId: string,
    details: boolean = false,
  ): Promise<GetOrderStatusResponse> {
    const baseUrl = this.authManager.getBaseUrl(appId);
    const token = await this.authManager.getToken(appId);

    const url = `${baseUrl}/subscriptions/v2/order/${merchantOrderId}/status?details=${details}`;

    this.logger.log(
      `[PhonePe API] Getting order status for ${merchantOrderId}`,
    );
    this.logger.debug(`[PhonePe API] Request URL: ${url}`);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `O-Bearer ${token}`,
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(10000),
    });

    const responseText = await response.text();
    this.logger.debug(`[PhonePe API] Response: ${responseText}`);

    if (!response.ok) {
      this.logger.error(
        `[PhonePe API] Get order status failed: ${responseText}`,
      );
      throw new Error(
        `PhonePe get order status failed: ${response.status} - ${responseText}`,
      );
    }

    const data = JSON.parse(responseText);
    this.logger.log(
      `[PhonePe API] Order status: ${data.state}, orderId: ${data.orderId}`,
    );
    return data;
  }
}
