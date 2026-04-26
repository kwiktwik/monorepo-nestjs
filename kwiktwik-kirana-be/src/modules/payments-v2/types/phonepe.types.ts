/**
 * PhonePe Provider Types
 * 
 * Types extracted from PhonePe API documentation.
 * These represent the exact structure of PhonePe's API responses and requests.
 */

import { SubscriptionStatus } from './subscription-status.enum';
import { OrderStatus } from './order-status.enum';
import { BillingFrequency } from './frequency.enum';

// ============================================================================
// PhonePe Subscription States
// ============================================================================

/**
 * PhonePe subscription state values (from API)
 */
export const PhonePeSubscriptionState = {
  CREATED: 'CREATED',
  ACTIVATION_IN_PROGRESS: 'ACTIVATION_IN_PROGRESS',
  ACTIVE: 'ACTIVE',
  PAUSE_IN_PROGRESS: 'PAUSE_IN_PROGRESS',
  PAUSED: 'PAUSED',
  UNPAUSE_IN_PROGRESS: 'UNPAUSE_IN_PROGRESS',
  CANCEL_IN_PROGRESS: 'CANCEL_IN_PROGRESS',
  CANCELLED: 'CANCELLED',
  REVOKE_IN_PROGRESS: 'REVOKE_IN_PROGRESS',
  REVOKED: 'REVOKED',
  EXPIRED: 'EXPIRED',
  FAILED: 'FAILED',
  COMPLETED: 'COMPLETED',
} as const;

export type PhonePeSubscriptionState = typeof PhonePeSubscriptionState[keyof typeof PhonePeSubscriptionState];

/**
 * All PhonePe subscription states
 */
export const ALL_PHONEPE_SUBSCRIPTION_STATES: readonly PhonePeSubscriptionState[] = [
  PhonePeSubscriptionState.CREATED,
  PhonePeSubscriptionState.ACTIVATION_IN_PROGRESS,
  PhonePeSubscriptionState.ACTIVE,
  PhonePeSubscriptionState.PAUSE_IN_PROGRESS,
  PhonePeSubscriptionState.PAUSED,
  PhonePeSubscriptionState.UNPAUSE_IN_PROGRESS,
  PhonePeSubscriptionState.CANCEL_IN_PROGRESS,
  PhonePeSubscriptionState.CANCELLED,
  PhonePeSubscriptionState.REVOKE_IN_PROGRESS,
  PhonePeSubscriptionState.REVOKED,
  PhonePeSubscriptionState.EXPIRED,
  PhonePeSubscriptionState.FAILED,
  PhonePeSubscriptionState.COMPLETED,
] as const;

/**
 * PhonePe order/transaction states
 */
export const PhonePeOrderState = {
  PENDING: 'PENDING',
  NOTIFICATION_IN_PROGRESS: 'NOTIFICATION_IN_PROGRESS',
  NOTIFIED: 'NOTIFIED',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
} as const;

export type PhonePeOrderState = typeof PhonePeOrderState[keyof typeof PhonePeOrderState];

/**
 * All PhonePe order states
 */
export const ALL_PHONEPE_ORDER_STATES: readonly PhonePeOrderState[] = [
  PhonePeOrderState.PENDING,
  PhonePeOrderState.NOTIFICATION_IN_PROGRESS,
  PhonePeOrderState.NOTIFIED,
  PhonePeOrderState.COMPLETED,
  PhonePeOrderState.FAILED,
] as const;

/**
 * PhonePe payment flow types
 */
export const PhonePePaymentFlowType = {
  SUBSCRIPTION_CHECKOUT_SETUP: 'SUBSCRIPTION_CHECKOUT_SETUP',
  SUBSCRIPTION_CHECKOUT_REDEMPTION: 'SUBSCRIPTION_CHECKOUT_REDEMPTION',
  SUBSCRIPTION_REDEMPTION: 'SUBSCRIPTION_REDEMPTION',
} as const;

export type PhonePePaymentFlowType = typeof PhonePePaymentFlowType[keyof typeof PhonePePaymentFlowType];

/**
 * PhonePe auth workflow types
 */
export const PhonePeAuthWorkflowType = {
  TRANSACTION: 'TRANSACTION',
  PENNY_DROP: 'PENNY_DROP',
} as const;

export type PhonePeAuthWorkflowType = typeof PhonePeAuthWorkflowType[keyof typeof PhonePeAuthWorkflowType];

/**
 * PhonePe amount types
 */
export const PhonePeAmountType = {
  FIXED: 'FIXED',
  VARIABLE: 'VARIABLE',
} as const;

export type PhonePeAmountType = typeof PhonePeAmountType[keyof typeof PhonePeAmountType];

/**
 * PhonePe product types
 */
export const PhonePeProductType = {
  UPI_MANDATE: 'UPI_MANDATE',
} as const;

export type PhonePeProductType = typeof PhonePeProductType[keyof typeof PhonePeProductType];

/**
 * PhonePe subscription types
 */
export const PhonePeSubscriptionType = {
  RECURRING: 'RECURRING',
} as const;

export type PhonePeSubscriptionType = typeof PhonePeSubscriptionType[keyof typeof PhonePeSubscriptionType];

/**
 * PhonePe redemption retry strategy
 */
export const PhonePeRedemptionRetryStrategy = {
  STANDARD: 'STANDARD',
  CUSTOM: 'CUSTOM',
} as const;

export type PhonePeRedemptionRetryStrategy = typeof PhonePeRedemptionRetryStrategy[keyof typeof PhonePeRedemptionRetryStrategy];

/**
 * PhonePe frequency values
 */
export const PhonePeFrequency = {
  DAILY: 'DAILY',
  WEEKLY: 'WEEKLY',
  FORTNIGHTLY: 'FORTNIGHTLY',
  MONTHLY: 'MONTHLY',
  BIMONTHLY: 'BIMONTHLY',
  QUARTERLY: 'QUARTERLY',
  HALFYEARLY: 'HALFYEARLY',
  YEARLY: 'YEARLY',
  ONDEMAND: 'ONDEMAND',
} as const;

export type PhonePeFrequency = typeof PhonePeFrequency[keyof typeof PhonePeFrequency];

/**
 * PhonePe payment mode
 */
export const PhonePePaymentMode = {
  UPI_MANDATE: 'UPI_MANDATE',
} as const;

export type PhonePePaymentMode = typeof PhonePePaymentMode[keyof typeof PhonePePaymentMode];

// ============================================================================
// API Response Types
// ============================================================================

/**
 * PhonePe subscription status response
 */
export interface PhonePeSubscriptionStatusResponse {
  readonly merchantSubscriptionId: string;
  readonly subscriptionId: string;
  readonly state: PhonePeSubscriptionState;
  readonly productType: PhonePeProductType | null;
  readonly authInstrumentType: string | null;
  readonly authWorkflowType: PhonePeAuthWorkflowType;
  readonly amountType: PhonePeAmountType;
  readonly currency: string;
  readonly maxAmount: number;
  readonly frequency: PhonePeFrequency;
  readonly expireAt: number;
  readonly pauseStartDate: number | null;
  readonly pauseEndDate: number | null;
}

/**
 * PhonePe setup subscription response
 */
export interface PhonePeSetupSubscriptionResponse {
  readonly orderId: string;
  readonly state: 'PENDING';
  readonly expireAt: number;
  readonly redirectUrl: string;
}

/**
 * PhonePe subscription details (for setup request)
 */
export interface PhonePeSubscriptionDetails {
  readonly subscriptionType: PhonePeSubscriptionType;
  readonly merchantSubscriptionId: string;
  readonly authWorkflowType: PhonePeAuthWorkflowType;
  readonly amountType: PhonePeAmountType;
  readonly maxAmount: number;
  readonly frequency: PhonePeFrequency;
  readonly productType: PhonePeProductType;
  readonly expireAt?: number;
}

/**
 * PhonePe setup subscription request
 */
export interface PhonePeSetupSubscriptionRequest {
  readonly merchantOrderId: string;
  readonly amount: number;
  readonly paymentFlow: {
    readonly type: typeof PhonePePaymentFlowType.SUBSCRIPTION_CHECKOUT_SETUP;
    readonly merchantUrls: {
      readonly redirectUrl: string;
    };
    readonly subscriptionDetails: PhonePeSubscriptionDetails;
  };
  readonly expireAfter?: number;
  readonly metaInfo?: PhonePeMetaInfo;
}

/**
 * PhonePe notify redemption request
 */
export interface PhonePeNotifyRedemptionRequest {
  readonly merchantOrderId: string;
  readonly amount: number;
  readonly paymentFlow: {
    readonly type: typeof PhonePePaymentFlowType.SUBSCRIPTION_REDEMPTION;
    readonly merchantSubscriptionId: string;
    readonly redemptionRetryStrategy?: PhonePeRedemptionRetryStrategy;
    readonly autoDebit?: boolean;
  };
  readonly metaInfo?: PhonePeMetaInfo;
}

/**
 * PhonePe notify redemption response
 */
export interface PhonePeNotifyRedemptionResponse {
  readonly orderId: string;
  readonly state: PhonePeOrderState;
  readonly expireAt: number;
}

/**
 * PhonePe execute redemption request
 */
export interface PhonePeExecuteRedemptionRequest {
  readonly merchantOrderId: string;
}

/**
 * PhonePe execute redemption response
 */
export interface PhonePeExecuteRedemptionResponse {
  readonly transactionId: string;
  readonly state: 'PENDING';
}

/**
 * PhonePe redemption order status response (when notified)
 */
export interface PhonePeRedemptionOrderStatusNotified {
  readonly merchantId: string;
  readonly merchantOrderId: string;
  readonly orderId: string;
  readonly state: 'NOTIFIED' | 'NOTIFICATION_IN_PROGRESS';
  readonly amount: number;
  readonly expireAt: number;
  readonly paymentFlow: {
    readonly type: typeof PhonePePaymentFlowType.SUBSCRIPTION_REDEMPTION;
    readonly merchantSubscriptionId: string;
    readonly redemptionRetryStrategy: PhonePeRedemptionRetryStrategy;
    readonly autoDebit: boolean;
    readonly validAfter: number;
    readonly validUpto: number;
    readonly notifiedAt: number;
  };
  readonly paymentDetails: readonly [];
}

/**
 * PhonePe payment detail
 */
export interface PhonePePaymentDetail {
  readonly amount: number;
  readonly paymentMode: PhonePePaymentMode;
  readonly timestamp: number;
  readonly transactionId: string;
  readonly state: 'COMPLETED' | 'FAILED' | 'PENDING';
  readonly rail: {
    readonly type: 'UPI';
    readonly utr: string;
    readonly vpa: string;
    readonly umn: string;
  };
  readonly instrument: {
    readonly type: 'ACCOUNT';
    readonly maskedAccountNumber: string;
    readonly ifsc: string;
    readonly accountHolderName: string;
    readonly accountType: 'SAVINGS' | 'CURRENT';
  };
  readonly errorCode?: string;
  readonly detailedErrorCode?: string;
}

/**
 * PhonePe redemption order status response (when completed)
 */
export interface PhonePeRedemptionOrderStatusCompleted {
  readonly merchantId: string;
  readonly merchantOrderId: string;
  readonly orderId: string;
  readonly state: 'COMPLETED' | 'FAILED';
  readonly amount: number;
  readonly expireAt: number;
  readonly metaInfo?: PhonePeMetaInfo;
  readonly paymentFlow: {
    readonly type: typeof PhonePePaymentFlowType.SUBSCRIPTION_REDEMPTION;
    readonly merchantSubscriptionId: string;
    readonly redemptionRetryStrategy: PhonePeRedemptionRetryStrategy;
    readonly autoDebit: boolean;
    readonly validAfter: number;
    readonly validUpto: number;
    readonly notifiedAt: number;
  };
  readonly errorCode?: string;
  readonly detailedErrorCode?: string;
  readonly paymentDetails: readonly PhonePePaymentDetail[];
}

/**
 * PhonePe redemption order status response (union type)
 */
export type PhonePeRedemptionOrderStatusResponse =
  | PhonePeRedemptionOrderStatusNotified
  | PhonePeRedemptionOrderStatusCompleted;

/**
 * PhonePe meta info
 */
export interface PhonePeMetaInfo {
  readonly udf1?: string;
  readonly udf2?: string;
  readonly udf3?: string;
  readonly udf4?: string;
  readonly udf5?: string;
  readonly udf6?: string;
  readonly udf7?: string;
  readonly udf8?: string;
  readonly udf10?: string;
  readonly udf11?: string;
  readonly udf12?: string;
  readonly udf13?: string;
  readonly udf14?: string;
  readonly udf15?: string;
}

// ============================================================================
// Webhook Types
// ============================================================================

/**
 * PhonePe webhook event types
 */
export const PhonePeWebhookEvent = {
  // Setup callbacks (API integration flow)
  SUBSCRIPTION_SETUP_ORDER_COMPLETED: 'subscription.setup.order.completed',
  SUBSCRIPTION_SETUP_ORDER_FAILED: 'subscription.setup.order.failed',
  // Setup callbacks (Standard Checkout flow)
  CHECKOUT_ORDER_COMPLETED: 'checkout.order.completed',
  CHECKOUT_ORDER_FAILED: 'checkout.order.failed',

  // State change callbacks
  SUBSCRIPTION_PAUSED: 'subscription.paused',
  SUBSCRIPTION_UNPAUSED: 'subscription.unpaused',
  SUBSCRIPTION_REVOKED: 'subscription.revoked',
  SUBSCRIPTION_CANCELLED: 'subscription.cancelled',

  // Notification callbacks
  SUBSCRIPTION_NOTIFICATION_COMPLETED: 'subscription.notification.completed',
  SUBSCRIPTION_NOTIFICATION_FAILED: 'subscription.notification.failed',

  // Redemption callbacks
  SUBSCRIPTION_REDEMPTION_ORDER_COMPLETED: 'subscription.redemption.order.completed',
  SUBSCRIPTION_REDEMPTION_ORDER_FAILED: 'subscription.redemption.order.failed',
  SUBSCRIPTION_REDEMPTION_TRANSACTION_COMPLETED: 'subscription.redemption.transaction.completed',
  SUBSCRIPTION_REDEMPTION_TRANSACTION_FAILED: 'subscription.redemption.transaction.failed',

  // Refund callbacks
  PG_REFUND_ACCEPTED: 'pg.refund.accepted',
  PG_REFUND_COMPLETED: 'pg.refund.completed',
  PG_REFUND_FAILED: 'pg.refund.failed',
} as const;

export type PhonePeWebhookEvent = typeof PhonePeWebhookEvent[keyof typeof PhonePeWebhookEvent];

/**
 * PhonePe webhook payload structure
 */
export interface PhonePeWebhookPayload {
  readonly type: PhonePeWebhookEvent;
  readonly payload: string; // Base64 encoded
}

/**
 * PhonePe decoded webhook payload
 */
export interface PhonePeDecodedWebhookPayload {
  /** @deprecated Use `event` instead — PhonePe docs say `type` will be deprecated */
  readonly type?: string;
  /** The canonical event identifier per PhonePe docs */
  readonly event: PhonePeWebhookEvent;
  /** Webhook payload data — PhonePe uses "payload" as the key */
  readonly payload: {
    readonly merchantId?: string;
    readonly merchantSubscriptionId?: string;
    readonly subscriptionId?: string;
    readonly merchantOrderId?: string;
    readonly orderId?: string;
    readonly transactionId?: string;
    readonly state?: PhonePeSubscriptionState | PhonePeOrderState;
    readonly amount?: number;
    readonly currency?: string;
    readonly errorCode?: string;
    readonly detailedErrorCode?: string;
    readonly paymentFlow?: {
      readonly type?: string;
      readonly merchantSubscriptionId?: string;
      readonly subscriptionId?: string;
    };
    readonly paymentDetails?: readonly PhonePePaymentDetail[];
  };
}

// ============================================================================
// Cancel Subscription Types
// ============================================================================

/**
 * PhonePe cancel subscription response
 */
export interface PhonePeCancelSubscriptionResponse {
  readonly state: PhonePeSubscriptionState;
}

// ============================================================================
// Mapping Functions
// ============================================================================

/**
 * Map PhonePe subscription state to our unified status
 */
export function mapPhonePeSubscriptionState(phonePeState: PhonePeSubscriptionState): SubscriptionStatus {
  const mapping: Readonly<Record<PhonePeSubscriptionState, SubscriptionStatus>> = {
    [PhonePeSubscriptionState.CREATED]: SubscriptionStatus.CREATED,
    [PhonePeSubscriptionState.ACTIVATION_IN_PROGRESS]: SubscriptionStatus.ACTIVATION_IN_PROGRESS,
    [PhonePeSubscriptionState.ACTIVE]: SubscriptionStatus.ACTIVE,
    [PhonePeSubscriptionState.PAUSE_IN_PROGRESS]: SubscriptionStatus.PAUSED,
    [PhonePeSubscriptionState.PAUSED]: SubscriptionStatus.PAUSED,
    [PhonePeSubscriptionState.UNPAUSE_IN_PROGRESS]: SubscriptionStatus.ACTIVE,
    [PhonePeSubscriptionState.CANCEL_IN_PROGRESS]: SubscriptionStatus.CANCEL_IN_PROGRESS,
    [PhonePeSubscriptionState.CANCELLED]: SubscriptionStatus.CANCELLED,
    [PhonePeSubscriptionState.REVOKE_IN_PROGRESS]: SubscriptionStatus.REVOKED,
    [PhonePeSubscriptionState.REVOKED]: SubscriptionStatus.REVOKED,
    [PhonePeSubscriptionState.EXPIRED]: SubscriptionStatus.EXPIRED,
    [PhonePeSubscriptionState.FAILED]: SubscriptionStatus.FAILED,
    [PhonePeSubscriptionState.COMPLETED]: SubscriptionStatus.COMPLETED,
  };

  return mapping[phonePeState];
}

/**
 * Map our unified status to PhonePe subscription state
 */
export function toPhonePeSubscriptionState(status: SubscriptionStatus): PhonePeSubscriptionState | null {
  const mapping: Readonly<Partial<Record<SubscriptionStatus, PhonePeSubscriptionState>>> = {
    [SubscriptionStatus.CREATED]: PhonePeSubscriptionState.CREATED,
    [SubscriptionStatus.ACTIVATION_IN_PROGRESS]: PhonePeSubscriptionState.ACTIVATION_IN_PROGRESS,
    [SubscriptionStatus.ACTIVE]: PhonePeSubscriptionState.ACTIVE,
    [SubscriptionStatus.PAUSED]: PhonePeSubscriptionState.PAUSED,
    [SubscriptionStatus.CANCEL_IN_PROGRESS]: PhonePeSubscriptionState.CANCEL_IN_PROGRESS,
    [SubscriptionStatus.CANCELLED]: PhonePeSubscriptionState.CANCELLED,
    [SubscriptionStatus.REVOKED]: PhonePeSubscriptionState.REVOKED,
    [SubscriptionStatus.EXPIRED]: PhonePeSubscriptionState.EXPIRED,
    [SubscriptionStatus.FAILED]: PhonePeSubscriptionState.FAILED,
    [SubscriptionStatus.COMPLETED]: PhonePeSubscriptionState.COMPLETED,
  };

  return mapping[status] ?? null;
}

/**
 * Map PhonePe order state to our unified order status
 */
export function mapPhonePeOrderState(phonePeState: PhonePeOrderState): OrderStatus {
  const mapping: Readonly<Record<PhonePeOrderState, OrderStatus>> = {
    [PhonePeOrderState.PENDING]: OrderStatus.PENDING,
    [PhonePeOrderState.NOTIFICATION_IN_PROGRESS]: OrderStatus.PENDING,
    [PhonePeOrderState.NOTIFIED]: OrderStatus.PENDING,
    [PhonePeOrderState.COMPLETED]: OrderStatus.CAPTURED,
    [PhonePeOrderState.FAILED]: OrderStatus.FAILED,
  };

  return mapping[phonePeState];
}

/**
 * Map PhonePe frequency to our unified frequency
 */
export function mapPhonePeFrequency(phonePeFrequency: PhonePeFrequency): BillingFrequency {
  const mapping: Readonly<Record<PhonePeFrequency, BillingFrequency>> = {
    [PhonePeFrequency.DAILY]: BillingFrequency.DAILY,
    [PhonePeFrequency.WEEKLY]: BillingFrequency.WEEKLY,
    [PhonePeFrequency.FORTNIGHTLY]: BillingFrequency.FORTNIGHTLY,
    [PhonePeFrequency.MONTHLY]: BillingFrequency.MONTHLY,
    [PhonePeFrequency.BIMONTHLY]: BillingFrequency.BIMONTHLY,
    [PhonePeFrequency.QUARTERLY]: BillingFrequency.QUARTERLY,
    [PhonePeFrequency.HALFYEARLY]: BillingFrequency.HALF_YEARLY,
    [PhonePeFrequency.YEARLY]: BillingFrequency.YEARLY,
    [PhonePeFrequency.ONDEMAND]: BillingFrequency.ON_DEMAND,
  };

  return mapping[phonePeFrequency];
}

/**
 * Map our unified frequency to PhonePe frequency
 */
export function toPhonePeFrequency(frequency: BillingFrequency): PhonePeFrequency {
  const mapping: Readonly<Record<BillingFrequency, PhonePeFrequency>> = {
    [BillingFrequency.DAILY]: PhonePeFrequency.DAILY,
    [BillingFrequency.WEEKLY]: PhonePeFrequency.WEEKLY,
    [BillingFrequency.FORTNIGHTLY]: PhonePeFrequency.FORTNIGHTLY,
    [BillingFrequency.MONTHLY]: PhonePeFrequency.MONTHLY,
    [BillingFrequency.BIMONTHLY]: PhonePeFrequency.BIMONTHLY,
    [BillingFrequency.QUARTERLY]: PhonePeFrequency.QUARTERLY,
    [BillingFrequency.HALF_YEARLY]: PhonePeFrequency.HALFYEARLY,
    [BillingFrequency.YEARLY]: PhonePeFrequency.YEARLY,
    [BillingFrequency.ON_DEMAND]: PhonePeFrequency.ONDEMAND,
  };

  return mapping[frequency];
}
