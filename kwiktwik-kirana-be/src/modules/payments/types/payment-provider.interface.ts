/**
 * Payment Provider Interface
 *
 * Core contract for all payment providers. Loosely coupled - pure TypeScript.
 */

import type {
  CreateOrderParams,
  OrderResult,
  VerifyPaymentParams,
  VerifyResult,
  CreateSubscriptionParams,
  SubscriptionResult,
  HandleWebhookParams,
  WebhookResult,
  RefundResult,
} from './common.types';

export interface PaymentProvider {
  readonly providerType: string;

  createOrder(params: CreateOrderParams): Promise<OrderResult>;
  verifyPayment(params: VerifyPaymentParams): Promise<VerifyResult>;
  createSubscription?(params: CreateSubscriptionParams): Promise<SubscriptionResult>;
  handleWebhook(params: HandleWebhookParams): Promise<WebhookResult>;
  refund?(orderId: string, amount?: number): Promise<RefundResult>;
  checkOrderStatus?(orderId: string): Promise<OrderResult>;
  getPublicConfig(): Record<string, unknown>;
  healthCheck?(): Promise<{ healthy: boolean; message?: string }>;
}

export class PaymentError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly provider: string,
    public readonly originalError?: unknown,
  ) {
    super(message);
    this.name = 'PaymentError';
  }
}

export class UnsupportedOperationError extends PaymentError {
  constructor(provider: string, operation: string) {
    super(`${operation} is not supported by provider: ${provider}`, 'UNSUPPORTED_OPERATION', provider);
    this.name = 'UnsupportedOperationError';
  }
}

export class ConfigError extends Error {
  constructor(message: string, public readonly configId: string, public readonly provider: string) {
    super(message);
    this.name = 'ConfigError';
  }
}
