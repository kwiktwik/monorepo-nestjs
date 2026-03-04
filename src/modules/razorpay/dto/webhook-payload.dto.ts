export interface RazorpayWebhookPayload {
  event: string;
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
  };
}

export interface RazorpayPaymentEntity {
  id: string;
  order_id?: string;
  invoice_id?: string;
  amount: number;
  currency: string;
  status: string;
  method?: string;
  error_code?: string;
  error_description?: string;
  error_reason?: string;
  error_source?: string;
  [key: string]: unknown;
}

export interface RazorpaySubscriptionEntity {
  id: string;
  plan_id: string;
  quantity: number;
  total_count: number;
  paid_count?: number;
  remaining_count?: number;
  status: string;
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
  amount: number;
  amount_paid?: number;
  currency: string;
  status: string;
  [key: string]: unknown;
}

export interface RazorpayTokenEntity {
  id: string;
  order_id?: string;
  [key: string]: unknown;
}
