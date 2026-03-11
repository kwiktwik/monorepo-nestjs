/**
 * API response types for external payment providers
 * These types define the structure of responses from Razorpay, PhonePe, etc.
 */

/**
 * Generic payment provider response
 */
export interface PaymentProviderResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  errorCode?: string;
}

/**
 * Razorpay subscription response
 */
export interface RazorpaySubscriptionResponse {
  id: string;
  status:
    | 'created'
    | 'authenticated'
    | 'active'
    | 'pending'
    | 'halted'
    | 'cancelled'
    | 'completed'
    | 'expired';
  current_start?: number;
  current_end?: number;
  ended_at?: number | null;
  quantity: number;
  notes?: Record<string, string>;
  charge_at?: number;
  start_at?: number;
  end_at?: number | null;
  auth_attempts?: number;
  total_count?: number;
  paid_count?: number;
  customer_notify?: number;
  created_at: number;
  expire_by?: number | null;
  short_url?: string | null;
  has_scheduled_changes?: boolean;
  change_scheduled_at?: number | null;
  source?: string;
  payment_method?: string;
  offer_id?: string | null;
  remaining_count?: number;
}

/**
 * Razorpay plan response
 */
export interface RazorpayPlanResponse {
  id: string;
  entity: string;
  interval: number;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  item: {
    id: string;
    active: boolean;
    amount: number;
    unit_amount: number;
    currency: string;
    name: string;
    description?: string;
  };
  notes?: Record<string, string>;
}

/**
 * Razorpay order response
 */
export interface RazorpayOrderResponse {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt?: string;
  status: 'created' | 'attempted' | 'paid';
  attempts: number;
  notes?: Record<string, string>;
  created_at: number;
}

/**
 * PhonePe order response
 */
export interface PhonePeOrderResponse {
  success: boolean;
  code: string;
  message: string;
  data?: {
    merchantId: string;
    merchantTransactionId: string;
    instrumentResponse?: {
      type: string;
      redirectInfo?: {
        url: string;
        method: string;
      };
    };
  };
}

/**
 * PhonePe status response
 */
export interface PhonePeStatusResponse {
  success: boolean;
  code: string;
  message: string;
  data?: {
    merchantId: string;
    merchantTransactionId: string;
    state: 'COMPLETED' | 'PENDING' | 'FAILED';
    amount: number;
    transactionId?: string;
    paymentMode?: string;
    responseCode?: string;
  };
}

/**
 * Payment verification payload
 */
export interface PaymentVerificationPayload {
  razorpay_payment_id?: string;
  razorpay_signature?: string;
  razorpay_subscription_id?: string;
  razorpay_order_id?: string;
}

/**
 * Webhook payload structure
 */
export interface WebhookPayload {
  event: string;
  entity: string;
  contains?: string[];
  payload: {
    payment?: {
      entity: Record<string, unknown>;
    };
    subscription?: {
      entity: Record<string, unknown>;
    };
    order?: {
      entity: Record<string, unknown>;
    };
  };
  created_at: number;
}

/**
 * Generic API client interface
 * Implement this for any external API client
 */
export interface ApiClient<TConfig, TResponse> {
  readonly config: TConfig;
  request<R = TResponse>(
    endpoint: string,
    options?: Record<string, unknown>,
  ): Promise<R>;
}

/**
 * API error structure
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  statusCode?: number;
}
