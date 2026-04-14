/**
 * Unified Webhook Types
 * 
 * Normalized webhook event types and structures across all providers.
 * Based on official Razorpay and PhonePe webhook documentation.
 */

import type { PaymentProvider } from '../types/provider.enum';
import type { SubscriptionStatus } from '../types/subscription-status.enum';
import type { OrderStatus } from '../types/order-status.enum';
import type { SubscriptionType } from '../types/subscription-type.enum';

// ============================================================================
// Normalized Webhook Event Types
// ============================================================================

/**
 * Normalized webhook event types - unified across providers
 * 
 * These represent the canonical event types that all provider-specific
 * events are mapped to.
 */
export const NormalizedWebhookEventType = {
  // === Subscription Lifecycle Events ===
  /** Subscription created successfully */
  SUBSCRIPTION_CREATED: 'subscription.created',
  /** Subscription authenticated (mandate approved) */
  SUBSCRIPTION_AUTHENTICATED: 'subscription.authenticated',
  /** Subscription activated (first payment successful) */
  SUBSCRIPTION_ACTIVATED: 'subscription.activated',
  /** Subscription paused */
  SUBSCRIPTION_PAUSED: 'subscription.paused',
  /** Subscription resumed */
  SUBSCRIPTION_RESUMED: 'subscription.resumed',
  /** Subscription cancelled */
  SUBSCRIPTION_CANCELLED: 'subscription.cancelled',
  /** Subscription expired (end of cycle or timeout) */
  SUBSCRIPTION_EXPIRED: 'subscription.expired',
  /** Subscription halted (multiple failures) */
  SUBSCRIPTION_HALTED: 'subscription.halted',
  /** Subscription failed to setup */
  SUBSCRIPTION_FAILED: 'subscription.failed',
  /** Subscription revoked by user */
  SUBSCRIPTION_REVOKED: 'subscription.revoked',
  /** Subscription completed all cycles */
  SUBSCRIPTION_COMPLETED: 'subscription.completed',

  // === Payment Events ===
  /** Payment initiated */
  PAYMENT_INITIATED: 'payment.initiated',
  /** Payment authorized but not captured */
  PAYMENT_AUTHORIZED: 'payment.authorized',
  /** Payment captured successfully */
  PAYMENT_CAPTURED: 'payment.captured',
  /** Payment failed */
  PAYMENT_FAILED: 'payment.failed',
  /** Payment refunded */
  PAYMENT_REFUNDED: 'payment.refunded',
  /** Payment partially refunded */
  PAYMENT_PARTIALLY_REFUNDED: 'payment.partially_refunded',

  // === Mandate Events ===
  /** Mandate/token created */
  MANDATE_CREATED: 'mandate.created',
  /** Mandate approved by user */
  MANDATE_APPROVED: 'mandate.approved',
  /** Mandate rejected by user */
  MANDATE_REJECTED: 'mandate.rejected',
  /** Mandate revoked by user */
  MANDATE_REVOKED: 'mandate.revoked',
  /** Mandate expired */
  MANDATE_EXPIRED: 'mandate.expired',

  // === Redemption Events (PhonePe specific, normalized) ===
  /** Redemption notified to user */
  REDEMPTION_NOTIFIED: 'redemption.notified',
  /** Redemption notification failed */
  REDEMPTION_NOTIFICATION_FAILED: 'redemption.notification_failed',
  /** Redemption completed */
  REDEMPTION_COMPLETED: 'redemption.completed',
  /** Redemption failed */
  REDEMPTION_FAILED: 'redemption.failed',
  /** Redemption transaction completed */
  REDEMPTION_TRANSACTION_COMPLETED: 'redemption.transaction.completed',
  /** Redemption transaction failed */
  REDEMPTION_TRANSACTION_FAILED: 'redemption.transaction.failed',

  // === Refund Events ===
  /** Refund initiated */
  REFUND_INITIATED: 'refund.initiated',
  /** Refund completed */
  REFUND_COMPLETED: 'refund.completed',
  /** Refund failed */
  REFUND_FAILED: 'refund.failed',

  // === Order Events ===
  /** Order paid */
  ORDER_PAID: 'order.paid',
  /** Order created */
  ORDER_CREATED: 'order.created',

  // === Token Events (Razorpay specific) ===
  /** Token confirmed */
  TOKEN_CONFIRMED: 'token.confirmed',
  /** Token rejected */
  TOKEN_REJECTED: 'token.rejected',
  /** Token paused */
  TOKEN_PAUSED: 'token.paused',
  /** Token cancelled */
  TOKEN_CANCELLED: 'token.cancelled',

} as const;

export type NormalizedWebhookEventType = typeof NormalizedWebhookEventType[keyof typeof NormalizedWebhookEventType];

// ============================================================================
// Webhook Event Categories
// ============================================================================

/**
 * Webhook event category for routing
 */
export const WebhookEventCategory = {
  SUBSCRIPTION: 'SUBSCRIPTION',
  PAYMENT: 'PAYMENT',
  MANDATE: 'MANDATE',
  REDEMPTION: 'REDEMPTION',
  REFUND: 'REFUND',
  ORDER: 'ORDER',
  TOKEN: 'TOKEN',
  UNKNOWN: 'UNKNOWN',
} as const;

export type WebhookEventCategory = typeof WebhookEventCategory[keyof typeof WebhookEventCategory];

/**
 * Get category for an event type
 */
export function getEventCategory(eventType: NormalizedWebhookEventType): WebhookEventCategory {
  if (eventType.startsWith('subscription.')) return WebhookEventCategory.SUBSCRIPTION;
  if (eventType.startsWith('payment.')) return WebhookEventCategory.PAYMENT;
  if (eventType.startsWith('mandate.')) return WebhookEventCategory.MANDATE;
  if (eventType.startsWith('redemption.')) return WebhookEventCategory.REDEMPTION;
  if (eventType.startsWith('refund.')) return WebhookEventCategory.REFUND;
  if (eventType.startsWith('order.')) return WebhookEventCategory.ORDER;
  if (eventType.startsWith('token.')) return WebhookEventCategory.TOKEN;
  return WebhookEventCategory.UNKNOWN;
}

// ============================================================================
// Normalized Webhook Event
// ============================================================================

/**
 * Payment instrument details from webhook
 */
export interface PaymentInstrument {
  readonly type: 'ACCOUNT' | 'CARD' | 'WALLET' | 'UPI';
  readonly maskedAccountNumber?: string;
  readonly ifsc?: string;
  readonly accountHolderName?: string;
  readonly accountType?: 'SAVINGS' | 'CURRENT';
  readonly last4?: string;
  readonly network?: string;
  readonly issuer?: string;
  readonly cardType?: 'credit' | 'debit' | 'prepaid';
}

/**
 * Payment rail details (UPI specific)
 */
export interface PaymentRail {
  readonly type: 'UPI' | 'CARD' | 'NETBANKING' | 'WALLET';
  readonly utr?: string;
  readonly vpa?: string;
  readonly umn?: string;
}

/**
 * Payment details from webhook
 */
export interface WebhookPaymentDetail {
  readonly transactionId: string;
  readonly paymentMode: string;
  readonly timestamp: Date;
  readonly amount: number;
  readonly currency: string;
  readonly state: 'COMPLETED' | 'FAILED' | 'PENDING';
  readonly instrument?: PaymentInstrument;
  readonly rail?: PaymentRail;
  readonly errorCode?: string;
  readonly detailedErrorCode?: string;
}

/**
 * Normalized webhook event - unified structure
 * 
 * This is the canonical structure that all provider webhooks are parsed into.
 */
export interface NormalizedWebhookEvent {
  // === Event Identity ===
  /** Unique event ID (provider-specific or generated) */
  readonly eventId: string;
  /** Normalized event type */
  readonly eventType: NormalizedWebhookEventType;
  /** Payment provider that sent the webhook */
  readonly provider: PaymentProvider;
  /** Original provider event type */
  readonly providerEventType: string;
  /** Event timestamp */
  readonly timestamp: Date;

  // === Entity References ===
  /** Merchant subscription ID (our ID) */
  readonly merchantSubscriptionId: string | null;
  /** Provider subscription ID */
  readonly providerSubscriptionId: string | null;
  /** Merchant order ID (our ID) */
  readonly merchantOrderId: string | null;
  /** Provider order ID */
  readonly providerOrderId: string | null;
  /** Payment/transaction ID */
  readonly paymentId: string | null;
  /** Refund ID */
  readonly refundId: string | null;
  /** Token/mandate ID */
  readonly tokenId: string | null;

  // === Status Information ===
  /** Previous status (if available) */
  readonly previousStatus: string | null;
  /** Current status from provider */
  readonly currentStatus: string;
  /** Mapped unified subscription status */
  readonly unifiedSubscriptionStatus: SubscriptionStatus | null;
  /** Mapped unified order status */
  readonly unifiedOrderStatus: OrderStatus | null;

  // === Subscription Type ===
  /** Subscription type (PROVIDER_MANAGED or USER_MANAGED) */
  readonly subscriptionType: SubscriptionType | null;

  // === Payment Details ===
  /** Amount in paise */
  readonly amount: number | null;
  /** Currency code */
  readonly currency: string | null;
  /** Payment method used */
  readonly paymentMethod: string | null;
  /** Payment details array */
  readonly paymentDetails: readonly WebhookPaymentDetail[];

  // === Error Information ===
  /** Error code if failed */
  readonly errorCode: string | null;
  /** Detailed error code */
  readonly detailedErrorCode: string | null;
  /** Error message */
  readonly errorMessage: string | null;

  // === Verification ===
  /** Whether webhook signature is valid */
  readonly signatureValid: boolean;
  /** Whether event has been processed */
  readonly processed: boolean;

  // === App Context ===
  /** App ID (extracted from metadata) */
  readonly appId: string | null;
  /** User ID (extracted from metadata) */
  readonly userId: string | null;

  // === Raw Data ===
  /** Raw payload from provider */
  readonly rawPayload: Record<string, unknown>;
  /** Provider-specific metadata */
  readonly providerMetadata: Record<string, unknown>;
}

// ============================================================================
// Webhook Headers
// ============================================================================

/**
 * Webhook headers interface
 */
export interface WebhookHeaders {
  /** Signature header */
  readonly signature?: string;
  /** Timestamp header */
  readonly timestamp?: string;
  /** Content type */
  readonly contentType?: string;
  /** Authorization header (PhonePe) */
  readonly authorization?: string;
  /** All headers */
  readonly [key: string]: string | undefined;
}

// ============================================================================
// Webhook Parse Result
// ============================================================================

/**
 * Result of parsing a webhook
 */
export interface WebhookParseResult {
  /** Whether parsing was successful */
  readonly success: boolean;
  /** Parsed event (if successful) */
  readonly event?: NormalizedWebhookEvent;
  /** Error (if failed) */
  readonly error?: string;
  /** Error code (if failed) */
  readonly errorCode?: string;
}

// ============================================================================
// Webhook Handler Types
// ============================================================================

/**
 * Webhook handler function type
 */
export type WebhookHandler = (
  event: NormalizedWebhookEvent,
) => Promise<WebhookHandlerResult>;

/**
 * Result of webhook handler execution
 */
export interface WebhookHandlerResult {
  /** Whether handling was successful */
  readonly success: boolean;
  /** Actions taken */
  readonly actions?: readonly WebhookAction[];
  /** Error message (if failed) */
  readonly error?: string;
  /** Whether to retry */
  readonly retry?: boolean;
}

/**
 * Action taken by webhook handler
 */
export type WebhookAction =
  | { readonly type: 'UPDATE_SUBSCRIPTION_STATUS'; readonly subscriptionId: string; readonly status: SubscriptionStatus }
  | { readonly type: 'UPDATE_ORDER_STATUS'; readonly orderId: string; readonly status: OrderStatus }
  | { readonly type: 'RECORD_PAYMENT'; readonly orderId: string; readonly paymentId: string; readonly amount: number }
  | { readonly type: 'SEND_NOTIFICATION'; readonly userId: string; readonly template: string; readonly data: Record<string, unknown> }
  | { readonly type: 'SCHEDULE_RETRY'; readonly subscriptionId: string; readonly delayMs: number }
  | { readonly type: 'UPDATE_PREMIUM_STATUS'; readonly userId: string; readonly isPremium: boolean }
  | { readonly type: 'LOG_EVENT'; readonly eventType: string; readonly data: Record<string, unknown> };

// ============================================================================
// Event Type Mappings
// ============================================================================

/**
 * Razorpay event type to normalized event type mapping
 */
export const RazorpayEventMapping: Readonly<Record<string, NormalizedWebhookEventType>> = {
  // Subscription events
  'subscription.authenticated': NormalizedWebhookEventType.SUBSCRIPTION_AUTHENTICATED,
  'subscription.activated': NormalizedWebhookEventType.SUBSCRIPTION_ACTIVATED,
  'subscription.charged': NormalizedWebhookEventType.PAYMENT_CAPTURED,
  'subscription.pending': NormalizedWebhookEventType.SUBSCRIPTION_CREATED,
  'subscription.halted': NormalizedWebhookEventType.SUBSCRIPTION_HALTED,
  'subscription.paused': NormalizedWebhookEventType.SUBSCRIPTION_PAUSED,
  'subscription.resumed': NormalizedWebhookEventType.SUBSCRIPTION_RESUMED,
  'subscription.cancelled': NormalizedWebhookEventType.SUBSCRIPTION_CANCELLED,
  'subscription.completed': NormalizedWebhookEventType.SUBSCRIPTION_COMPLETED,
  'subscription.expired': NormalizedWebhookEventType.SUBSCRIPTION_EXPIRED,

  // Payment events
  'payment.authorized': NormalizedWebhookEventType.PAYMENT_AUTHORIZED,
  'payment.captured': NormalizedWebhookEventType.PAYMENT_CAPTURED,
  'payment.failed': NormalizedWebhookEventType.PAYMENT_FAILED,
  'payment.refunded': NormalizedWebhookEventType.PAYMENT_REFUNDED,

  // Order events
  'order.paid': NormalizedWebhookEventType.ORDER_PAID,

  // Token events
  'token.confirmed': NormalizedWebhookEventType.TOKEN_CONFIRMED,
  'token.rejected': NormalizedWebhookEventType.TOKEN_REJECTED,
  'token.paused': NormalizedWebhookEventType.TOKEN_PAUSED,
  'token.cancelled': NormalizedWebhookEventType.TOKEN_CANCELLED,

  // Refund events
  'refund.created': NormalizedWebhookEventType.REFUND_INITIATED,
  'refund.processed': NormalizedWebhookEventType.REFUND_COMPLETED,
  'refund.failed': NormalizedWebhookEventType.REFUND_FAILED,
};

/**
 * PhonePe event type to normalized event type mapping
 */
export const PhonePeEventMapping: Readonly<Record<string, NormalizedWebhookEventType>> = {
  // Setup events
  'checkout.order.completed': NormalizedWebhookEventType.SUBSCRIPTION_CREATED,
  'checkout.order.failed': NormalizedWebhookEventType.SUBSCRIPTION_FAILED,

  // State change events
  'subscription.paused': NormalizedWebhookEventType.SUBSCRIPTION_PAUSED,
  'subscription.unpaused': NormalizedWebhookEventType.SUBSCRIPTION_RESUMED,
  'subscription.revoked': NormalizedWebhookEventType.MANDATE_REVOKED,
  'subscription.cancelled': NormalizedWebhookEventType.SUBSCRIPTION_CANCELLED,

  // Notification events
  'subscription.notification.completed': NormalizedWebhookEventType.REDEMPTION_NOTIFIED,
  'subscription.notification.failed': NormalizedWebhookEventType.REDEMPTION_NOTIFICATION_FAILED,

  // Redemption events
  'subscription.redemption.order.completed': NormalizedWebhookEventType.REDEMPTION_COMPLETED,
  'subscription.redemption.order.failed': NormalizedWebhookEventType.REDEMPTION_FAILED,
  'subscription.redemption.transaction.completed': NormalizedWebhookEventType.REDEMPTION_TRANSACTION_COMPLETED,
  'subscription.redemption.transaction.failed': NormalizedWebhookEventType.REDEMPTION_TRANSACTION_FAILED,

  // Refund events
  'pg.refund.accepted': NormalizedWebhookEventType.REFUND_INITIATED,
  'pg.refund.completed': NormalizedWebhookEventType.REFUND_COMPLETED,
  'pg.refund.failed': NormalizedWebhookEventType.REFUND_FAILED,
};

/**
 * Normalize Razorpay event type
 */
export function normalizeRazorpayEventType(razorpayEvent: string): NormalizedWebhookEventType {
  return RazorpayEventMapping[razorpayEvent] ?? NormalizedWebhookEventType.PAYMENT_FAILED;
}

/**
 * Normalize PhonePe event type
 */
export function normalizePhonePeEventType(phonePeEvent: string): NormalizedWebhookEventType {
  return PhonePeEventMapping[phonePeEvent] ?? NormalizedWebhookEventType.PAYMENT_FAILED;
}

/**
 * Normalize event type for any provider
 */
export function normalizeEventType(
  provider: PaymentProvider,
  providerEventType: string,
): NormalizedWebhookEventType {
  if (provider === 'RAZORPAY') {
    return normalizeRazorpayEventType(providerEventType);
  }
  if (provider === 'PHONEPE') {
    return normalizePhonePeEventType(providerEventType);
  }
  return NormalizedWebhookEventType.PAYMENT_FAILED;
}
