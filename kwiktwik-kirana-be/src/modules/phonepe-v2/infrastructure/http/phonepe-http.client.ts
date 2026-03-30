import { Injectable, Logger } from '@nestjs/common';
import { PhonePeAuthManager } from './auth-manager';
import {
  SubscriptionFrequency,
  AuthWorkflowType,
  AmountType,
} from '../../domain/enums/subscription.enum';
import { SUBSCRIPTION_SETUP } from '../../constants';
import {
  PhonePeSubscriptionSetupException,
  PhonePeRedemptionNotificationException,
  PhonePeRedemptionExecutionException,
  PhonePeSubscriptionStatusException,
  PhonePeOrderStatusException,
  PhonePeTimeoutException,
  PhonePeRetryExhaustedException,
} from '../exceptions/phonepe.exceptions';

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 10000,
  retryableStatuses: [408, 429, 500, 502, 503, 504],
  retryableErrors: ['ECONNRESET', 'ETIMEDOUT', 'ECONNREFUSED', 'ENOTFOUND'],
};

// Timeout configuration (in milliseconds)
const TIMEOUT_CONFIG = {
  default: 30000,
  statusCheck: 10000,
};

// Request/Response types for Custom Checkout
export interface SetupSubscriptionRequest {
  merchantOrderId: string;
  amount: number;
  expireAt?: number;
  paymentFlow: {
    type: typeof SUBSCRIPTION_SETUP;
    merchantSubscriptionId: string;
    authWorkflowType: AuthWorkflowType;
    amountType: AmountType;
    maxAmount: number;
    frequency: SubscriptionFrequency;
    expireAt?: number;
    paymentMode: {
      type: 'UPI_INTENT' | 'UPI_COLLECT' | 'UPI_QR';
      targetApp?: string;
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
  intentUrl: string;
}

export interface NotifyRedemptionRequest {
  merchantOrderId: string;
  amount: number;
  expireAt?: number;
  paymentFlow: {
    type: 'SUBSCRIPTION_REDEMPTION';
    merchantSubscriptionId: string;
    redemptionRetryStrategy?: 'STANDARD' | 'CUSTOM';
    autoDebit?: boolean;
  };
  metaInfo?: Record<string, string>;
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

interface RequestConfig {
  method: 'GET' | 'POST';
  body?: unknown;
  timeout?: number;
  skipRetry?: boolean;
}

/**
 * HTTP Client for PhonePe Autopay Custom Checkout APIs
 * Features:
 * - Centralized request handling
 * - Exponential backoff retry logic
 * - Domain-specific exceptions
 * - Configurable timeouts
 */
@Injectable()
export class PhonePeHttpClient {
  private readonly logger = new Logger(PhonePeHttpClient.name);

  constructor(private readonly authManager: PhonePeAuthManager) {}

  /**
   * Centralized HTTP request method with retry logic
   */
  private async makeRequest<T>(
    appId: string,
    endpoint: string,
    config: RequestConfig,
    errorFactory: (status: number, response: string) => Error,
  ): Promise<T> {
    const baseUrl = this.authManager.getBaseUrl(appId);
    const url = `${baseUrl}${endpoint}`;
    const token = await this.authManager.getToken(appId);
    const timeout = config.timeout || TIMEOUT_CONFIG.default;

    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          const delay = this.calculateBackoff(attempt);
          this.logger.warn(
            `[PhonePe API] Retry attempt ${attempt}/${RETRY_CONFIG.maxRetries} for ${endpoint} after ${delay}ms`,
          );
          await this.sleep(delay);
        }

        this.logger.debug(`[PhonePe API] Request: ${config.method} ${url}`);
        if (config.body) {
          this.logger.debug(
            `[PhonePe API] Body: ${JSON.stringify(config.body)}`,
          );
        }

        const response = await fetch(url, {
          method: config.method,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `O-Bearer ${token}`,
            Accept: 'application/json',
          },
          body: config.body ? JSON.stringify(config.body) : undefined,
          signal: AbortSignal.timeout(timeout),
        });

        const responseText = await response.text();
        this.logger.debug(`[PhonePe API] Response: ${responseText}`);

        if (!response.ok) {
          if (this.isRetryableStatus(response.status) && !config.skipRetry) {
            lastError = new Error(`HTTP ${response.status}: ${responseText}`);
            continue;
          }
          throw errorFactory(response.status, responseText);
        }

        return JSON.parse(responseText) as T;
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          lastError = new PhonePeTimeoutException(
            `Request timeout after ${timeout}ms`,
            endpoint,
          );
          if (!config.skipRetry) continue;
          throw lastError;
        }

        if (
          error instanceof Error &&
          this.isRetryableError(error) &&
          !config.skipRetry
        ) {
          lastError = error;
          continue;
        }

        if (error instanceof Error && this.isDomainException(error)) {
          throw error;
        }

        lastError = error instanceof Error ? error : new Error(String(error));
        if (!config.skipRetry) continue;
        throw lastError;
      }
    }

    throw new PhonePeRetryExhaustedException(
      RETRY_CONFIG.maxRetries,
      lastError!,
    );
  }

  /**
   * Calculate exponential backoff delay with jitter
   */
  private calculateBackoff(attempt: number): number {
    const exponentialDelay =
      RETRY_CONFIG.baseDelayMs * Math.pow(2, attempt - 1);
    const jitter = Math.random() * 1000;
    return Math.min(exponentialDelay + jitter, RETRY_CONFIG.maxDelayMs);
  }

  /**
   * Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Check if HTTP status is retryable
   */
  private isRetryableStatus(status: number): boolean {
    return RETRY_CONFIG.retryableStatuses.includes(status);
  }

  /**
   * Check if error is retryable (network errors)
   */
  private isRetryableError(error: Error): boolean {
    return RETRY_CONFIG.retryableErrors.some((code) =>
      error.message.includes(code),
    );
  }

  /**
   * Check if error is already a domain exception
   */
  private isDomainException(error: Error): boolean {
    return (
      error.name.includes('PhonePe') ||
      error.constructor.name.includes('PhonePe')
    );
  }

  /**
   * Setup a new subscription mandate (Custom Checkout - UPI Intent)
   * POST /subscriptions/v2/setup
   */
  async setupSubscription(
    appId: string,
    request: SetupSubscriptionRequest,
  ): Promise<SetupSubscriptionResponse> {
    this.logger.log(
      `[PhonePe API] Setting up subscription for ${appId}: ${request.paymentFlow.merchantSubscriptionId}`,
    );

    const response = await this.makeRequest<SetupSubscriptionResponse>(
      appId,
      '/subscriptions/v2/setup',
      {
        method: 'POST',
        body: request,
        timeout: TIMEOUT_CONFIG.default,
      },
      (status, responseText) =>
        new PhonePeSubscriptionSetupException(status, responseText),
    );

    this.logger.log(
      `[PhonePe API] Subscription setup success: orderId=${response.orderId}, state=${response.state}`,
    );
    return response;
  }

  /**
   * Parse PhonePe error response to extract error code
   */
  private parsePhonePeError(responseText: string): {
    code: string;
    message: string;
  } {
    try {
      const parsed = JSON.parse(responseText);
      return {
        code: parsed.errorCode || parsed.code || 'UNKNOWN_ERROR',
        message: parsed.message || parsed.errorMessage || responseText,
      };
    } catch {
      return { code: 'UNKNOWN_ERROR', message: responseText };
    }
  }

  /**
   * Notify user about upcoming redemption (PhonePe handles execution after notification period)
   * POST /subscriptions/v2/notify
   */
  async notifyRedemption(
    appId: string,
    request: NotifyRedemptionRequest,
  ): Promise<NotifyRedemptionResponse> {
    this.logger.log(
      `[PhonePe API] Notifying redemption for ${appId}: order=${request.merchantOrderId}, sub=${request.paymentFlow.merchantSubscriptionId}`,
    );

    const response = await this.makeRequest<NotifyRedemptionResponse>(
      appId,
      '/subscriptions/v2/notify',
      {
        method: 'POST',
        body: request,
        timeout: TIMEOUT_CONFIG.default,
      },
      (status, responseText) => {
        const error = this.parsePhonePeError(responseText);
        return new PhonePeRedemptionNotificationException(
          status,
          responseText,
          error.message,
          error.code,
        );
      },
    );

    this.logger.log(
      `[PhonePe API] Redemption notify response: orderId=${response.orderId}, state=${response.state}`,
    );
    return response;
  }

  /**
   * Execute redemption directly (for merchant-controlled debit)
   * POST /subscriptions/v2/redeem
   */
  async executeRedemption(
    appId: string,
    request: ExecuteRedemptionRequest,
  ): Promise<ExecuteRedemptionResponse> {
    this.logger.log(
      `[PhonePe API] Executing redemption for ${appId}: order=${request.merchantOrderId}, sub=${request.paymentFlow.merchantSubscriptionId}`,
    );

    const response = await this.makeRequest<ExecuteRedemptionResponse>(
      appId,
      '/subscriptions/v2/redeem',
      {
        method: 'POST',
        body: request,
        timeout: TIMEOUT_CONFIG.default,
      },
      (status, responseText) =>
        new PhonePeRedemptionExecutionException(status, responseText),
    );

    this.logger.log(
      `[PhonePe API] Redemption execute response: orderId=${response.orderId}, state=${response.state}`,
    );
    return response;
  }

  /**
   * Get subscription status
   * GET /subscriptions/v2/{merchantSubscriptionId}/status
   */
  async getSubscriptionStatus(
    appId: string,
    merchantSubscriptionId: string,
  ): Promise<GetSubscriptionStatusResponse> {
    this.logger.log(
      `[PhonePe API] Getting subscription status for ${merchantSubscriptionId}`,
    );

    const response = await this.makeRequest<GetSubscriptionStatusResponse>(
      appId,
      `/subscriptions/v2/${merchantSubscriptionId}/status`,
      {
        method: 'GET',
        timeout: TIMEOUT_CONFIG.statusCheck,
      },
      (status, responseText) =>
        new PhonePeSubscriptionStatusException(status, responseText),
    );

    this.logger.log(
      `[PhonePe API] Subscription status: ${response.state}, subscriptionId: ${response.subscriptionId}`,
    );
    return response;
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
    this.logger.log(
      `[PhonePe API] Getting order status for ${merchantOrderId}`,
    );

    const response = await this.makeRequest<GetOrderStatusResponse>(
      appId,
      `/subscriptions/v2/order/${merchantOrderId}/status?details=${details}`,
      {
        method: 'GET',
        timeout: TIMEOUT_CONFIG.statusCheck,
      },
      (status, responseText) =>
        new PhonePeOrderStatusException(status, responseText),
    );

    this.logger.log(
      `[PhonePe API] Order status: ${response.state}, orderId=${response.orderId}`,
    );
    return response;
  }
}
