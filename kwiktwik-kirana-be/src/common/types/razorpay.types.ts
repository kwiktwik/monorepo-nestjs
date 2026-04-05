/**
 * Razorpay webhook and API types
 * These types represent Razorpay's API responses and webhook payloads
 */
import { subscriptionStatusEnum } from '../../database/schema';

/** Derived from the DB pgEnum — single source of truth for subscription statuses */
export type RazorpaySubscriptionStatus =
  (typeof subscriptionStatusEnum.enumValues)[number];

export interface RazorpayRefundEntity {
  id: string;
  entity: string;
  payment_id: string;
  amount: number;
  currency: string;
  status: string;
  order_id?: string;
  [key: string]: unknown;
}

export interface RazorpayWebhookPayload {
  entity: string;
  account_id: string;
  event: string;
  contains: string[];
  payload: {
    payment?: {
      entity: RazorpayPaymentEntity;
    };
    subscription?: {
      entity: RazorpaySubscriptionEntity;
    };
    order?: {
      entity: RazorpayOrderEntity;
    };
    token?: {
      entity: RazorpayTokenEntity;
    };
    refund?: {
      entity: RazorpayRefundEntity;
    };
  };
  created_at: number;
}

export interface RazorpayPaymentEntity {
  id: string;
  entity: string;
  order_id?: string;
  invoice_id?: string;
  amount: number;
  currency: string;
  status: string;
  method?: string;
  email?: string;
  contact?: string;
  customer_id?: string;
  token_id?: string;
  amount_refunded?: number;
  refund_status?: string | null;
  captured?: boolean | string;
  description?: string;
  error_code?: string | null;
  error_description?: string | null;
  error_reason?: string | null;
  error_source?: string | null;
  created_at?: number;
  [key: string]: unknown;
}

export interface RazorpaySubscriptionEntity {
  id: string;
  entity: 'subscription';
  plan_id: string;
  customer_id: string | null;
  status: RazorpaySubscriptionStatus;
  current_start: number | null;
  current_end: number | null;
  ended_at: number | null;
  quantity: number;
  notes: Record<string, string> | null;
  charge_at: number | null;       // Unix timestamp of next charge
  start_at: number | null;        // Unix timestamp when subscription starts
  end_at: number | null;          // Unix timestamp when subscription ends
  auth_attempts: number;
  total_count: number;
  paid_count: number;
  customer_notify: boolean;
  created_at: number;
  expire_by: number | null;       // Auth payment expiry (Unix)
  short_url: string | null;
  has_scheduled_changes: boolean;
  change_scheduled_at: string | null;
  source: string;
  offer_id: string | null;
  remaining_count: number;
  [key: string]: unknown;
}

/**
 * Razorpay subscription status constants
 */
export const RazorpaySubscriptionStatuses = {
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

/**
 * Razorpay order status constants.
 * Lifecycle: created → attempted → paid
 */
export const RazorpayOrderStatuses = {
  CREATED: 'created',    // Order created, payment not attempted yet
  ATTEMPTED: 'attempted', // Payment started but not completed
  PAID: 'paid',          // Payment successful — DO NOT create another order
} as const;

export type RazorpayOrderStatus =
  (typeof RazorpayOrderStatuses)[keyof typeof RazorpayOrderStatuses];

export interface RazorpayOrderEntity {
  id: string;
  entity: string;
  amount: number;
  amount_paid?: number;
  amount_due?: number;
  currency: string;
  receipt?: string | null;
  offer_id?: string | null;
  status: string;
  attempts?: number;
  notes?: Record<string, string> | unknown[];
  created_at?: number;
  [key: string]: unknown;
}

export interface RazorpayTokenEntity {
  id: string;
  order_id?: string;
  [key: string]: unknown;
}
