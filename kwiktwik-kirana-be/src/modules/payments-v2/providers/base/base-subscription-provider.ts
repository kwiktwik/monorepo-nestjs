/**
 * Base Subscription Provider
 * 
 * Shared functionality for all subscription providers.
 * Reduces code duplication between provider implementations.
 */

import { Logger } from '@nestjs/common';
import type { PaymentProvider } from '../../types/provider.enum';
import type { SubscriptionType } from '../../types/subscription-type.enum';
import type {
  SubscriptionProvider,
  AnyProviderConfig,
  SetupSubscriptionParams,
  SetupSubscriptionResult,
  ChargeSubscriptionParams,
  ChargeSubscriptionResult,
  GetSubscriptionStatusParams,
  SubscriptionStatusResult,
  GetOrderStatusParams,
  OrderStatusResult,
  CancelSubscriptionParams,
  CancelSubscriptionResult,
  ParseWebhookParams,
  WebhookEvent,
} from '../interfaces/subscription-provider.interface';
import {
  generateId,
  generateMerchantSubscriptionId,
  generateMerchantOrderId,
  unixToDate,
  createProviderError,
  ProviderError,
} from './provider-utils';

/**
 * Abstract base class for subscription providers
 * 
 * Provides common functionality:
 * - Configuration management
 * - Webhook signature verification
 * - Error handling
 * - Logging
 */
export abstract class BaseSubscriptionProvider implements SubscriptionProvider {
  protected readonly logger: Logger;
  protected config: AnyProviderConfig | null = null;

  abstract readonly provider: PaymentProvider;
  abstract readonly subscriptionType: SubscriptionType;

  constructor() {
    this.logger = new Logger(this.constructor.name);
  }

  /**
   * Initialize provider with configuration
   */
  abstract initialize(config: AnyProviderConfig): void;

  /**
   * Get public configuration for client-side
   */
  abstract getPublicConfig(): Record<string, unknown>;

  /**
   * Setup a new subscription
   */
  abstract setupSubscription(params: SetupSubscriptionParams): Promise<SetupSubscriptionResult>;

  /**
   * Charge subscription
   */
  abstract chargeSubscription(params: ChargeSubscriptionParams): Promise<ChargeSubscriptionResult>;

  /**
   * Get subscription status
   */
  abstract getSubscriptionStatus(params: GetSubscriptionStatusParams): Promise<SubscriptionStatusResult>;

  /**
   * Get order status
   */
  abstract getOrderStatus(params: GetOrderStatusParams): Promise<OrderStatusResult>;

  /**
   * Cancel subscription
   */
  abstract cancelSubscription(params: CancelSubscriptionParams): Promise<CancelSubscriptionResult>;

  /**
   * Parse webhook event
   */
  abstract parseWebhookEvent(params: ParseWebhookParams): Promise<WebhookEvent>;

  /**
   * Verify webhook signature
   */
  abstract verifyWebhookSignature(
    payload: string | Record<string, unknown>,
    signature: string,
  ): boolean;

  /**
   * Health check
   */
  async healthCheck(): Promise<{ readonly healthy: boolean; readonly message: string | null }> {
    try {
      this.ensureInitialized();
      return { healthy: true, message: null };
    } catch (error) {
      return {
        healthy: false,
        message: error instanceof Error ? error.message : 'Health check failed',
      };
    }
  }

  /**
   * Ensure provider is initialized
   */
  protected ensureInitialized(): void {
    if (!this.config) {
      throw createProviderError(
        'Provider not initialized',
        'NOT_INITIALIZED',
        this.provider,
      );
    }
  }

  /**
   * Create a successful setup result
   */
  protected createSetupSuccessResult(
    params: SetupSubscriptionParams,
    providerSubscriptionId: string | null,
    providerOrderId: string,
    state: string,
    options?: {
      intentUrl?: string | null;
      redirectUrl?: string | null;
      expiresAt?: Date | null;
      providerData?: Record<string, unknown>;
    },
  ): SetupSubscriptionResult {
    return {
      success: true,
      merchantSubscriptionId: params.merchantSubscriptionId,
      merchantOrderId: params.merchantOrderId,
      providerSubscriptionId,
      providerOrderId,
      intentUrl: options?.intentUrl ?? null,
      redirectUrl: options?.redirectUrl ?? params.redirectUrl ?? null,
      state,
      expiresAt: options?.expiresAt ?? null,
      providerData: options?.providerData ?? {},
      error: null,
      errorCode: null,
    };
  }

  /**
   * Create a failed setup result
   */
  protected createSetupFailedResult(
    params: SetupSubscriptionParams,
    error: string,
    errorCode: string = 'SETUP_FAILED',
  ): SetupSubscriptionResult {
    return {
      success: false,
      merchantSubscriptionId: params.merchantSubscriptionId,
      merchantOrderId: params.merchantOrderId,
      providerSubscriptionId: null,
      providerOrderId: '',
      intentUrl: null,
      redirectUrl: null,
      state: 'failed',
      expiresAt: null,
      providerData: {},
      error,
      errorCode,
    };
  }

  /**
   * Create a successful charge result
   */
  protected createChargeSuccessResult(
    params: ChargeSubscriptionParams,
    providerOrderId: string,
    state: string,
    options?: {
      transactionId?: string | null;
      paidAt?: Date | null;
      providerData?: Record<string, unknown>;
    },
  ): ChargeSubscriptionResult {
    return {
      success: true,
      merchantOrderId: params.merchantOrderId,
      providerOrderId,
      transactionId: options?.transactionId ?? null,
      amount: params.amount,
      currency: params.currency,
      state,
      paidAt: options?.paidAt ?? null,
      providerData: options?.providerData ?? {},
      error: null,
      errorCode: null,
    };
  }

  /**
   * Create a failed charge result
   */
  protected createChargeFailedResult(
    params: ChargeSubscriptionParams,
    error: string,
    errorCode: string = 'CHARGE_FAILED',
    options?: {
      providerOrderId?: string;
      providerData?: Record<string, unknown>;
    },
  ): ChargeSubscriptionResult {
    return {
      success: false,
      merchantOrderId: params.merchantOrderId,
      providerOrderId: options?.providerOrderId ?? '',
      transactionId: null,
      amount: params.amount,
      currency: params.currency,
      state: 'failed',
      paidAt: null,
      providerData: options?.providerData ?? {},
      error,
      errorCode,
    };
  }

  /**
   * Create a successful cancel result
   */
  protected createCancelSuccessResult(
    state: string,
    cancelledAt: Date = new Date(),
  ): CancelSubscriptionResult {
    return {
      success: true,
      state,
      cancelledAt,
      error: null,
    };
  }

  /**
   * Create a failed cancel result
   */
  protected createCancelFailedResult(
    error: string,
    state: string = 'cancel_failed',
  ): CancelSubscriptionResult {
    return {
      success: false,
      state,
      cancelledAt: null,
      error,
    };
  }

  /**
   * Handle provider errors consistently
   */
  protected handleProviderError(
    operation: string,
    error: unknown,
    fallbackCode: string = 'PROVIDER_ERROR',
  ): never {
    if (error instanceof ProviderError) {
      throw error;
    }

    const message = error instanceof Error ? error.message : 'Unknown error';
    const code = (error as { error?: { code?: string } })?.error?.code ?? fallbackCode;

    throw createProviderError(
      `${operation} failed: ${message}`,
      code,
      this.provider,
      error instanceof Error ? error : null,
    );
  }

  /**
   * Extract error from provider response
   */
  protected extractError(error: unknown): { message: string; code: string } {
    if (error instanceof Error) {
      const providerError = (error as { error?: { description?: string; code?: string } }).error;
      return {
        message: providerError?.description ?? error.message,
        code: providerError?.code ?? 'UNKNOWN_ERROR',
      };
    }

    return {
      message: 'Unknown error',
      code: 'UNKNOWN_ERROR',
    };
  }

  /**
   * Log operation
   */
  protected logOperation(operation: string, details: Record<string, unknown>): void {
    this.logger.debug({
      operation,
      provider: this.provider,
      subscriptionType: this.subscriptionType,
      ...details,
    });
  }
}
