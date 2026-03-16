/**
 * Razorpay webhook and API types
 * These types represent Razorpay's API responses and webhook payloads
 */

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
  plan_id: string;
  quantity: number;
  total_count: number;
  paid_count?: number;
  remaining_count?: number;
  status:
    | 'created'
    | 'authenticated'
    | 'active'
    | 'pending'
    | 'halted'
    | 'paused'
    | 'cancelled'
    | 'completed'
    | 'expired';
  start_at?: number;
  end_at?: number;
  charge_at?: number;
  current_start?: number;
  current_end?: number;
  ended_at?: number;
  latest_invoice?: {
    amount?: number;
    currency?: string;
  };
  [key: string]: unknown;
}

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
