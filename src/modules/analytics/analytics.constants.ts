/**
 * Analytics event constants
 * All event names should be in UPPER_SNAKE_CASE format
 */
export const ANALYTICS_EVENTS = {
  // Payment events
  PAYMENT_CAPTURED: 'payment_captured',
  PAYMENT_FAILED: 'payment_failed',
  PAYMENT_AUTHORIZED: 'payment_authorized',

  // Subscription events
  SUBSCRIPTION_ACTIVATED: 'subscription_activated',
  SUBSCRIPTION_CHARGED: 'subscription_charged',
  SUBSCRIPTION_CANCELLED: 'cancel_subscription',
  SUBSCRIPTION_PENDING: 'subscription_pending',
  SUBSCRIPTION_HALTED: 'subscription_halted',
  SUBSCRIPTION_PAUSED: 'subscription_paused',
  SUBSCRIPTION_RESUMED: 'subscription_resumed',
  SUBSCRIPTION_COMPLETED: 'subscription_completed',
  SUBSCRIPTION_AUTHENTICATED: 'subscription_authenticated',
  SUBSCRIPTION_NOT_CANCELLED_4H: 'trial_not_cancel_in_4_hour',

  // Token events
  TOKEN_CONFIRMED: 'token_confirmed',
  TOKEN_REJECTED: 'token_rejected',
  TOKEN_PAUSED: 'token_paused',
  TOKEN_CANCELLED: 'token_cancelled',

  // Order events
  ORDER_PAID: 'order_paid',
} as const;

export type AnalyticsEventName =
  (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];
