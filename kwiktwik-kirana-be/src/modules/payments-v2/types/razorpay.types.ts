/**
 * Razorpay Provider Types
 * 
 * Types extracted from Razorpay API documentation.
 * These represent the exact structure of Razorpay's API responses and requests.
 */

import type { PaymentProvider } from './provider.enum';

/**
 * Razorpay subscription status values (from API)
 */
export const RazorpaySubscriptionStatus = {
  CREATED: 'created',
  AUTHENTICATED: 'authenticated',
  ACTIVE: 'active',
  PENDING: 'pending',
  HALTED: 'halted',
  PAUSED: 'paused',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
  EXPIRED: 'expired',
} as const;

export type RazorpaySubscriptionStatus = typeof RazorpaySubscriptionStatus[keyof typeof RazorpaySubscriptionStatus];

/**
 * All Razorpay subscription statuses
 */
export const ALL_RAZORPAY_SUBSCRIPTION_STATUSES: readonly RazorpaySubscriptionStatus[] = [
  RazorpaySubscriptionStatus.CREATED,
  RazorpaySubscriptionStatus.AUTHENTICATED,
  RazorpaySubscriptionStatus.ACTIVE,
  RazorpaySubscriptionStatus.PENDING,
  RazorpaySubscriptionStatus.HALTED,
  RazorpaySubscriptionStatus.PAUSED,
  RazorpaySubscriptionStatus.CANCELLED,
  RazorpaySubscriptionStatus.COMPLETED,
  RazorpaySubscriptionStatus.EXPIRED,
] as const;

/**
 * Razorpay order status values (from API)
 */
export const RazorpayOrderStatus = {
  CREATED: 'created',
  ATTEMPTED: 'attempted',
  PAID: 'paid',
} as const;

export type RazorpayOrderStatus = typeof RazorpayOrderStatus[keyof typeof RazorpayOrderStatus];

/**
 * Razorpay payment status values (from API)
 */
export const RazorpayPaymentStatus = {
  CREATED: 'created',
  AUTHORIZED: 'authorized',
  CAPTURED: 'captured',
  REFUNDED: 'refunded',
  FAILED: 'failed',
} as const;

export type RazorpayPaymentStatus = typeof RazorpayPaymentStatus[keyof typeof RazorpayPaymentStatus];

/**
 * Razorpay payment method values
 */
export const RazorpayPaymentMethod = {
  CARD: 'card',
  NETBANKING: 'netbanking',
  WALLET: 'wallet',
  EM: 'emi',
  UPI: 'upi',
} as const;

export type RazorpayPaymentMethod = typeof RazorpayPaymentMethod[keyof typeof RazorpayPaymentMethod];

// ============================================================================
// API Response Types
// ============================================================================

/**
 * Razorpay subscription entity (from API response)
 */
export interface RazorpaySubscriptionEntity {
  readonly id: string;
  readonly entity: 'subscription';
  readonly plan_id: string;
  readonly customer_id: string | null;
  readonly status: RazorpaySubscriptionStatus;
  readonly current_start: number | null;
  readonly current_end: number | null;
  readonly ended_at: number | null;
  readonly quantity: number;
  readonly notes: Record<string, string> | null;
  readonly charge_at: number | null;
  readonly start_at: number | null;
  readonly end_at: number | null;
  readonly auth_attempts: number;
  readonly total_count: number;
  readonly paid_count: number;
  readonly customer_notify: boolean;
  readonly created_at: number;
  readonly expire_by: number | null;
  readonly short_url: string | null;
  readonly has_scheduled_changes: boolean;
  readonly change_scheduled_at: string | null;
  readonly source: string;
  readonly offer_id: string | null;
  readonly remaining_count: number;
}

/**
 * Razorpay order entity (from API response)
 */
export interface RazorpayOrderEntity {
  readonly id: string;
  readonly entity: 'order';
  readonly amount: number;
  readonly amount_paid: number;
  readonly amount_due: number;
  readonly currency: string;
  readonly receipt: string | null;
  readonly offer_id: string | null;
  readonly status: RazorpayOrderStatus;
  readonly attempts: number;
  readonly notes: Record<string, string> | null;
  readonly created_at: number;
}

/**
 * Razorpay payment entity (from API response)
 */
export interface RazorpayPaymentEntity {
  readonly id: string;
  readonly entity: 'payment';
  readonly order_id: string | null;
  readonly invoice_id: string | null;
  readonly amount: number;
  readonly currency: string;
  readonly status: RazorpayPaymentStatus;
  readonly method: RazorpayPaymentMethod | null;
  readonly amount_refunded: number;
  readonly refund_status: string | null;
  readonly captured: boolean;
  readonly description: string | null;
  readonly card_id: string | null;
  readonly card: RazorpayCardDetails | null;
  readonly bank: string | null;
  readonly wallet: string | null;
  readonly vpa: string | null;
  readonly email: string;
  readonly contact: string;
  readonly customer_id: string | null;
  readonly token_id: string | null;
  readonly notes: Record<string, string> | null;
  readonly fee: number;
  readonly tax: number;
  readonly error_code: string | null;
  readonly error_description: string | null;
  readonly error_reason: string | null;
  readonly error_source: string | null;
  readonly error_step: string | null;
  readonly created_at: number;
}

/**
 * Razorpay card details (nested in payment entity)
 */
export interface RazorpayCardDetails {
  readonly id: string | null;
  readonly entity: 'card';
  readonly name: string | null;
  readonly last4: string;
  readonly network: string;
  readonly type: 'credit' | 'debit' | 'prepaid' | 'unknown';
  readonly issuer: string;
  readonly international: boolean;
  readonly emi: boolean;
  readonly sub_type: string | null;
}

/**
 * Razorpay token entity (for recurring payments)
 */
export interface RazorpayTokenEntity {
  readonly id: string;
  readonly entity: 'token';
  readonly token: string;
  readonly bank: string | null;
  readonly wallet: string | null;
  readonly method: RazorpayPaymentMethod;
  readonly vpa: string | null;
  readonly recurring: boolean;
  readonly auth_type: string | null;
  readonly mrn: string | null;
  readonly card: RazorpayCardDetails | null;
}

/**
 * Razorpay customer entity
 */
export interface RazorpayCustomerEntity {
  readonly id: string;
  readonly entity: 'customer';
  readonly name: string;
  readonly email: string;
  readonly contact: string;
  readonly gstin: string | null;
  readonly notes: Record<string, string>;
  readonly created_at: number;
}

/**
 * Razorpay plan entity
 */
export interface RazorpayPlanEntity {
  readonly id: string;
  readonly entity: 'plan';
  readonly interval: number;
  readonly period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  readonly item: {
    readonly id: string;
    readonly entity: 'plan_item';
    readonly name: string;
    readonly amount: number;
    readonly currency: string;
    readonly description: string;
  };
  readonly notes: Record<string, string> | null;
  readonly created_at: number;
}

/**
 * Razorpay refund entity
 */
export interface RazorpayRefundEntity {
  readonly id: string;
  readonly entity: 'refund';
  readonly payment_id: string;
  readonly order_id: string | null;
  readonly amount: number;
  readonly currency: string;
  readonly notes: Record<string, string> | null;
  readonly receipt: string | null;
  readonly acquirer_data: {
    readonly arn: string | null;
    readonly upi_transaction_id: string | null;
  } | null;
  readonly created_at: number;
  readonly batch_id: string | null;
  readonly status: 'pending' | 'processed' | 'failed';
  readonly speed_processed: 'normal' | 'optimum' | null;
  readonly speed_requested: 'normal' | 'optimum' | null;
}

// ============================================================================
// Webhook Types
// ============================================================================

/**
 * Razorpay webhook event types
 */
export const RazorpayWebhookEvent = {
  // Payment events
  PAYMENT_AUTHORIZED: 'payment.authorized',
  PAYMENT_CAPTURED: 'payment.captured',
  PAYMENT_FAILED: 'payment.failed',
  PAYMENT_REFUNDED: 'payment.refunded',
  PAYMENT_DOWNTIME_RESOLVED: 'payment.downtime.resolved',

  // Order events
  ORDER_PAID: 'order.paid',

  // Subscription events
  SUBSCRIPTION_AUTHENTICATED: 'subscription.authenticated',
  SUBSCRIPTION_ACTIVATED: 'subscription.activated',
  SUBSCRIPTION_CHARGED: 'subscription.charged',
  SUBSCRIPTION_PENDING: 'subscription.pending',
  SUBSCRIPTION_HALTED: 'subscription.halted',
  SUBSCRIPTION_PAUSED: 'subscription.paused',
  SUBSCRIPTION_RESUMED: 'subscription.resumed',
  SUBSCRIPTION_CANCELLED: 'subscription.cancelled',
  SUBSCRIPTION_COMPLETED: 'subscription.completed',
  SUBSCRIPTION_UPDATED: 'subscription.updated',
  SUBSCRIPTION_EXPIRED: 'subscription.expired',

  // Token events
  TOKEN_CONFIRMED: 'token.confirmed',
  TOKEN_REJECTED: 'token.rejected',
  TOKEN_PAUSED: 'token.paused',
  TOKEN_CANCELLED: 'token.cancelled',

  // Refund events
  REFUND_CREATED: 'refund.created',
  REFUND_PROCESSED: 'refund.processed',
  REFUND_FAILED: 'refund.failed',
} as const;

export type RazorpayWebhookEvent = typeof RazorpayWebhookEvent[keyof typeof RazorpayWebhookEvent];

/**
 * Razorpay webhook payload structure
 */
export interface RazorpayWebhookPayload {
  readonly entity: 'event';
  readonly account_id: string;
  readonly event: RazorpayWebhookEvent;
  readonly contains: readonly string[];
  readonly payload: {
    readonly payment?: {
      readonly entity: RazorpayPaymentEntity;
    };
    readonly subscription?: {
      readonly entity: RazorpaySubscriptionEntity;
    };
    readonly order?: {
      readonly entity: RazorpayOrderEntity;
    };
    readonly token?: {
      readonly entity: RazorpayTokenEntity;
    };
    readonly refund?: {
      readonly entity: RazorpayRefundEntity;
    };
    readonly customer?: {
      readonly entity: RazorpayCustomerEntity;
    };
  };
  readonly created_at: number;
}

// ============================================================================
// API Request Types
// ============================================================================

/**
 * Razorpay create subscription request
 */
export interface RazorpayCreateSubscriptionRequest {
  readonly plan_id: string;
  readonly customer_notify: boolean;
  readonly quantity?: number;
  readonly total_count: number;
  readonly start_at?: number;
  readonly expire_by?: number;
  readonly customer_id?: string;
  readonly notes?: Record<string, string>;
}

/**
 * Razorpay create order request
 */
export interface RazorpayCreateOrderRequest {
  readonly amount: number;
  readonly currency: string;
  readonly receipt?: string;
  readonly notes?: Record<string, string>;
  readonly payment_capture?: boolean | number;
}

/**
 * Razorpay create customer request
 */
export interface RazorpayCreateCustomerRequest {
  readonly name: string;
  readonly email: string;
  readonly contact: string;
  readonly fail_existing?: '0' | '1';
  readonly notes?: Record<string, string>;
}

// ============================================================================
// Mapping Functions
// ============================================================================

import { SubscriptionStatus } from './subscription-status.enum';

/**
 * Map Razorpay subscription status to our unified status
 */
export function mapRazorpaySubscriptionStatus(
  razorpayStatus: RazorpaySubscriptionStatus,
): SubscriptionStatus {
  const mapping: Readonly<Record<RazorpaySubscriptionStatus, SubscriptionStatus>> = {
    [RazorpaySubscriptionStatus.CREATED]: SubscriptionStatus.CREATED,
    [RazorpaySubscriptionStatus.AUTHENTICATED]: SubscriptionStatus.AUTHENTICATED,
    [RazorpaySubscriptionStatus.ACTIVE]: SubscriptionStatus.ACTIVE,
    [RazorpaySubscriptionStatus.PENDING]: SubscriptionStatus.PENDING_AUTH,
    [RazorpaySubscriptionStatus.HALTED]: SubscriptionStatus.EXPIRED,
    [RazorpaySubscriptionStatus.PAUSED]: SubscriptionStatus.PAUSED,
    [RazorpaySubscriptionStatus.CANCELLED]: SubscriptionStatus.CANCELLED,
    [RazorpaySubscriptionStatus.COMPLETED]: SubscriptionStatus.COMPLETED,
    [RazorpaySubscriptionStatus.EXPIRED]: SubscriptionStatus.EXPIRED,
  };

  return mapping[razorpayStatus];
}

/**
 * Map our unified status to Razorpay subscription status
 */
export function toRazorpaySubscriptionStatus(
  status: SubscriptionStatus,
): RazorpaySubscriptionStatus | null {
  const mapping: Readonly<Partial<Record<SubscriptionStatus, RazorpaySubscriptionStatus>>> = {
    [SubscriptionStatus.CREATED]: RazorpaySubscriptionStatus.CREATED,
    [SubscriptionStatus.AUTHENTICATED]: RazorpaySubscriptionStatus.AUTHENTICATED,
    [SubscriptionStatus.ACTIVE]: RazorpaySubscriptionStatus.ACTIVE,
    [SubscriptionStatus.PENDING_AUTH]: RazorpaySubscriptionStatus.PENDING,
    [SubscriptionStatus.PAUSED]: RazorpaySubscriptionStatus.PAUSED,
    [SubscriptionStatus.CANCELLED]: RazorpaySubscriptionStatus.CANCELLED,
    [SubscriptionStatus.COMPLETED]: RazorpaySubscriptionStatus.COMPLETED,
    [SubscriptionStatus.EXPIRED]: RazorpaySubscriptionStatus.EXPIRED,
  };

  return mapping[status] ?? null;
}

import { OrderStatus } from './order-status.enum';

/**
 * Map Razorpay order status to our unified status
 */
export function mapRazorpayOrderStatus(razorpayStatus: RazorpayOrderStatus): OrderStatus {
  const mapping: Readonly<Record<RazorpayOrderStatus, OrderStatus>> = {
    [RazorpayOrderStatus.CREATED]: OrderStatus.CREATED,
    [RazorpayOrderStatus.ATTEMPTED]: OrderStatus.PENDING,
    [RazorpayOrderStatus.PAID]: OrderStatus.CAPTURED,
  };

  return mapping[razorpayStatus];
}

/**
 * Map Razorpay payment status to our unified status
 */
export function mapRazorpayPaymentStatus(razorpayStatus: RazorpayPaymentStatus): OrderStatus {
  const mapping: Readonly<Record<RazorpayPaymentStatus, OrderStatus>> = {
    [RazorpayPaymentStatus.CREATED]: OrderStatus.CREATED,
    [RazorpayPaymentStatus.AUTHORIZED]: OrderStatus.AUTHORIZED,
    [RazorpayPaymentStatus.CAPTURED]: OrderStatus.CAPTURED,
    [RazorpayPaymentStatus.REFUNDED]: OrderStatus.REFUNDED,
    [RazorpayPaymentStatus.FAILED]: OrderStatus.FAILED,
  };

  return mapping[razorpayStatus];
}
