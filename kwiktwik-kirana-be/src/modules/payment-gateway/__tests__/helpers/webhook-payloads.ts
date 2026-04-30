/**
 * Webhook Payload Factories
 *
 * Creates realistic webhook payloads for Razorpay and PhonePe,
 * including correct signatures so the webhook handler accepts them.
 */
import { createHmac } from 'crypto';

// ─── Constants used across tests ────────────────────────────────

export const TEST_RAZORPAY_WEBHOOK_SECRET = 'test_rzp_webhook_secret_123';
export const TEST_PHONEPE_SALT_KEY = 'test_phonepe_salt_key_sha256';

// ─── Razorpay ───────────────────────────────────────────────────

export interface RazorpayWebhookOverrides {
  event?: string;
  subscriptionId?: string;
  subscriptionStatus?: string;
  paymentId?: string;
  paymentStatus?: string;
  paymentAmount?: number;
  orderId?: string;
  accountId?: string;
  errorCode?: string;
  errorDescription?: string;
  notes?: Record<string, string>;
}

export function createRazorpayWebhookPayload(overrides: RazorpayWebhookOverrides = {}) {
  const now = Math.floor(Date.now() / 1000);

  const payload: Record<string, unknown> = {
    entity: 'event',
    account_id: overrides.accountId ?? 'acc_test_123',
    event: overrides.event ?? 'subscription.activated',
    contains: ['subscription'],
    created_at: now,
    payload: {
      subscription: {
        entity: {
          id: overrides.subscriptionId ?? 'sub_test_123',
          plan_id: 'plan_test_1',
          status: overrides.subscriptionStatus ?? 'active',
          total_count: 12,
          paid_count: 1,
          remaining_count: 11,
          charge_at: now + 86400,
          short_url: 'https://rzp.io/i/fake',
          created_at: now - 3600,
          notes: overrides.notes ?? {},
        },
      },
      payment: overrides.paymentId
        ? {
            entity: {
              id: overrides.paymentId,
              amount: overrides.paymentAmount ?? 4900,
              currency: 'INR',
              status: overrides.paymentStatus ?? 'captured',
              order_id: overrides.orderId ?? null,
              method: 'upi',
              error_code: overrides.errorCode ?? null,
              error_description: overrides.errorDescription ?? null,
              created_at: now,
            },
          }
        : undefined,
      order: overrides.orderId
        ? {
            entity: {
              id: overrides.orderId,
              amount: overrides.paymentAmount ?? 4900,
              currency: 'INR',
              status: 'paid',
              notes: overrides.notes ?? {},
            },
          }
        : undefined,
    },
  };

  const body = JSON.stringify(payload);
  const signature = createHmac('sha256', TEST_RAZORPAY_WEBHOOK_SECRET)
    .update(body)
    .digest('hex');

  return { body: payload, rawBody: body, signature };
}

// ─── PhonePe ────────────────────────────────────────────────────

export interface PhonePeWebhookOverrides {
  event?: string;
  merchantSubscriptionId?: string;
  subscriptionId?: string;
  merchantOrderId?: string;
  orderId?: string;
  transactionId?: string;
  state?: string;
  amount?: number;
  errorCode?: string;
  detailedErrorCode?: string;
}

export function createPhonePeWebhookPayload(overrides: PhonePeWebhookOverrides = {}) {
  const innerPayload = {
    event: overrides.event ?? 'subscription.setup.order.completed',
    payload: {
      merchantSubscriptionId: overrides.merchantSubscriptionId ?? 'MSUB_test_123',
      subscriptionId: overrides.subscriptionId ?? 'PPSUB_test_123',
      merchantOrderId: overrides.merchantOrderId ?? 'MORD_test_123',
      orderId: overrides.orderId ?? 'PPO_test_123',
      transactionId: overrides.transactionId ?? null,
      state: overrides.state ?? 'COMPLETED',
      amount: overrides.amount ?? 4900,
      currency: 'INR',
      errorCode: overrides.errorCode ?? null,
      detailedErrorCode: overrides.detailedErrorCode ?? null,
      paymentFlow: {
        type: 'SUBSCRIPTION_CHECKOUT_SETUP',
        merchantSubscriptionId: overrides.merchantSubscriptionId ?? 'MSUB_test_123',
        subscriptionId: overrides.subscriptionId ?? 'PPSUB_test_123',
      },
    },
  };

  // PhonePe sends the payload as a JSON body with the event structure
  // (not base64 in all webhook modes — standard checkout sends JSON directly)
  const body = innerPayload;

  // PhonePe uses Authorization header = pre-computed SHA256(username:password)
  // which is compared against saltKey stored in config
  const signature = TEST_PHONEPE_SALT_KEY;

  return { body, signature };
}

/**
 * Create a base64-encoded PhonePe webhook payload
 * (used for API Integration flow where payload comes as base64)
 */
export function createPhonePeBase64WebhookPayload(overrides: PhonePeWebhookOverrides = {}) {
  const { body } = createPhonePeWebhookPayload(overrides);
  const encoded = Buffer.from(JSON.stringify(body)).toString('base64');
  return {
    body: encoded,
    signature: TEST_PHONEPE_SALT_KEY,
  };
}
