/**
 * One-Time Order Provider Interface
 *
 * Defines the contract for providers that support one-time (non-subscription) payments.
 * Separated from SubscriptionProvider to keep concerns distinct.
 */

import type { PaymentProvider } from '../../types/provider.enum';
import type {
  AnyProviderConfig,
  GetOrderStatusParams,
  OrderStatusResult,
  RefundPaymentParams,
  RefundPaymentResult,
} from './subscription-provider.interface';

// ============================================================================
// Create Order Types
// ============================================================================

export interface CreateOneTimeOrderParams {
  readonly merchantOrderId: string;
  readonly amount: number;
  readonly currency: string;
  readonly receipt?: string;
  readonly notes?: Record<string, string>;
  readonly redirectUrl?: string;
  readonly contact?: string;
}

export interface CreateOneTimeOrderResult {
  readonly success: boolean;
  readonly merchantOrderId: string;
  readonly providerOrderId: string;
  readonly redirectUrl: string | null;
  readonly checkoutConfig: Record<string, unknown>;
  readonly state: string;
  readonly expiresAt: Date | null;
  readonly error: string | null;
  readonly errorCode: string | null;
}

// ============================================================================
// Verify Payment Types
// ============================================================================

export interface VerifyPaymentParams {
  readonly merchantOrderId: string;
  readonly providerOrderId?: string;
  readonly providerPaymentId: string;
  readonly signature: string;
}

export interface VerifyPaymentResult {
  readonly verified: boolean;
  readonly orderId: string;
  readonly paymentId: string;
  readonly error: string | null;
}

// ============================================================================
// One-Time Order Provider Interface
// ============================================================================

export interface OneTimeOrderProvider {
  readonly provider: PaymentProvider;

  initialize(config: AnyProviderConfig): void;

  getPublicConfig(): Record<string, unknown>;

  createOrder(params: CreateOneTimeOrderParams): Promise<CreateOneTimeOrderResult>;

  getOrderStatus(params: GetOrderStatusParams): Promise<OrderStatusResult>;

  verifyPayment(params: VerifyPaymentParams): Promise<VerifyPaymentResult>;

  refundPayment(params: RefundPaymentParams): Promise<RefundPaymentResult>;
}