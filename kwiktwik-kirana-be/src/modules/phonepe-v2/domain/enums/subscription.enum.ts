/**
 * PhonePe Subscription States
 * Lifecycle: CREATED → ACTIVATION_IN_PROGRESS → ACTIVE → [PAUSED/CANCELLED/REVOKED/EXPIRED]
 */
export type SubscriptionState =
  | 'CREATED' // Initial state when subscription is created
  | 'ACTIVATION_IN_PROGRESS' // User is setting up mandate
  | 'ACTIVE' // Mandate approved, ready for redemptions
  | 'PAUSED' // Temporarily paused by user
  | 'CANCEL_IN_PROGRESS' // Cancellation initiated
  | 'CANCELLED' // Cancelled by merchant
  | 'REVOKED' // Revoked by user
  | 'EXPIRED' // Subscription expired
  | 'FAILED'; // Setup failed

/**
 * Frequency options for recurring payments
 */
export type SubscriptionFrequency =
  | 'DAILY'
  | 'WEEKLY'
  | 'FORTNIGHTLY'
  | 'MONTHLY'
  | 'BIMONTHLY'
  | 'QUARTERLY'
  | 'HALFYEARLY'
  | 'YEARLY'
  | 'ONDEMAND';

/**
 * Authorization workflow types
 */
export type AuthWorkflowType = 'TRANSACTION' | 'PENNY_DROP';

/**
 * Amount type for subscription
 */
export type AmountType = 'FIXED' | 'VARIABLE';

/**
 * Product type - currently only UPI_MANDATE is supported
 */
export type ProductType = 'UPI_MANDATE';

/**
 * Redemption states for tracking auto-debit status
 */
export type RedemptionState =
  | 'NOTIFICATION_IN_PROGRESS'
  | 'NOTIFIED'
  | 'PENDING'
  | 'COMPLETED'
  | 'FAILED';

/**
 * Webhook event types from PhonePe
 */
export type PhonePeWebhookEvent =
  // Setup callbacks
  | 'checkout.order.completed'
  | 'checkout.order.failed'
  // State change callbacks
  | 'subscription.paused'
  | 'subscription.unpaused'
  | 'subscription.revoked'
  | 'subscription.cancelled'
  // Notification callbacks
  | 'subscription.notification.completed'
  | 'subscription.notification.failed'
  // Redemption callbacks (auto-debit results)
  | 'subscription.redemption.order.completed'
  | 'subscription.redemption.order.failed'
  | 'subscription.redemption.transaction.completed'
  | 'subscription.redemption.transaction.failed';
