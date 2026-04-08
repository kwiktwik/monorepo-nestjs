/**
 * Common Payment Types
 *
 * Shared types used across all payment providers.
 * Loosely coupled: Pure TypeScript, no framework dependencies.
 */

export interface OrderResult {
  orderId: string;
  amount: number;
  currency: string;
  status: OrderStatus;
  provider: string;
  providerData?: Record<string, unknown>;
  token?: string;
  redirectUrl?: string;
  expiresAt?: number;
}

export type OrderStatus =
  | 'created'
  | 'attempted'
  | 'paid'
  | 'failed'
  | 'cancelled'
  | 'pending'
  | 'completed'
  | 'refunded';

export interface VerifyResult {
  isValid: boolean;
  paymentId?: string;
  orderId: string;
  status: PaymentStatus;
  amount?: number;
  error?: string;
  provider: string;
  providerData?: Record<string, unknown>;
}

export type PaymentStatus =
  | 'authorized'
  | 'captured'
  | 'failed'
  | 'refunded'
  | 'pending'
  | 'completed';

export interface SubscriptionResult {
  subscriptionId: string;
  customerId?: string;
  status: SubscriptionStatus;
  provider: string;
  redirectUrl?: string;
  expiresAt?: number;
  providerData?: Record<string, unknown>;
}

export type SubscriptionStatus =
  | 'created'
  | 'authenticated'
  | 'active'
  | 'paused'
  | 'cancelled'
  | 'completed'
  | 'failed'
  | 'halted'
  | 'pending';

export interface WebhookResult {
  isValid: boolean;
  eventType: string;
  orderId?: string;
  subscriptionId?: string;
  paymentId?: string;
  payload: Record<string, unknown>;
  provider: string;
}

export interface RefundResult {
  refundId: string;
  orderId: string;
  amount: number;
  status: 'processed' | 'pending' | 'failed';
  providerData?: Record<string, unknown>;
}

export interface CreateOrderParams {
  appId: string;
  amount: number;
  currency?: string;
  orderId?: string;
  customer?: { id?: string; name?: string; email?: string; phone?: string };
  redirectUrl?: string;
  notes?: Record<string, unknown>;
  providerOptions?: Record<string, unknown>;
}

export interface VerifyPaymentParams {
  appId: string;
  orderId: string;
  paymentId?: string;
  signature?: string;
  providerOptions?: Record<string, unknown>;
}

export interface CreateSubscriptionParams {
  appId: string;
  planId?: string;
  amount?: number;
  currency?: string;
  customer?: { id?: string; name?: string; email?: string; phone?: string };
  frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'on_demand';
  maxAmount?: number;
  expireAt?: number;
  notes?: Record<string, unknown>;
  providerOptions?: Record<string, unknown>;
}

export interface HandleWebhookParams {
  appId: string;
  payload: Record<string, unknown> | string;
  signature?: string;
  headers?: Record<string, string>;
}
