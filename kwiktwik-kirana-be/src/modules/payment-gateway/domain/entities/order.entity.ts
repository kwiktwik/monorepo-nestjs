/**
 * Order Entity
 * 
 * Represents a payment order for one-time payments or subscription charges.
 * Every order tracks subscription type and provider.
 */

import type { PaymentProvider } from '../../types/provider.enum';
import type { SubscriptionType } from '../../types/subscription-type.enum';
import type { OrderStatus } from '../../types/order-status.enum';
import type { PaymentMethodType } from '../../types/payment-method.types';

// ============================================================================
// Provider Data Types
// ============================================================================

/**
 * Provider-specific order data stored as JSONB
 */
export interface ProviderOrderData {
  /** Provider's order ID */
  readonly orderId: string;
  /** Provider's payment ID (after payment) */
  readonly paymentId: string | null;
  /** Provider's refund ID (if refunded) */
  readonly refundId: string | null;
  /** Provider's token/mandate ID (for recurring) */
  readonly tokenId: string | null;
  /** Provider's transaction ID */
  readonly transactionId: string | null;
  /** Provider's raw order object */
  readonly raw: Record<string, unknown>;
  /** Payment intent URL (for client-side) */
  readonly intentUrl: string | null;
}

/**
 * Create empty provider order data
 */
export function createEmptyProviderOrderData(): ProviderOrderData {
  return {
    orderId: '',
    paymentId: null,
    refundId: null,
    tokenId: null,
    transactionId: null,
    raw: {},
    intentUrl: null,
  };
}

// ============================================================================
// Order Metadata
// ============================================================================

/**
 * Order metadata for tracking and auditing
 */
export interface OrderMetadata {
  /** Environment: SANDBOX or PRODUCTION */
  readonly environment: 'SANDBOX' | 'PRODUCTION';
  /** Configuration ID used */
  readonly configId: string;
  /** Description of the order */
  readonly description: string | null;
  /** Custom notes */
  readonly notes: Record<string, string>;
  /** Creation timestamp */
  readonly createdAt: Date;
  /** Last update timestamp */
  readonly updatedAt: Date;
}

/**
 * Create default order metadata
 */
export function createDefaultOrderMetadata(
  environment: 'SANDBOX' | 'PRODUCTION',
  configId: string,
): OrderMetadata {
  return {
    environment,
    configId,
    description: null,
    notes: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

// ============================================================================
// Order Types
// ============================================================================

/**
 * Order type enum
 */
export const OrderType = {
  /** One-time payment */
  ONE_TIME: 'ONE_TIME',
  /** Subscription setup payment (initial) */
  SUBSCRIPTION_SETUP: 'SUBSCRIPTION_SETUP',
  /** Subscription recurring charge */
  SUBSCRIPTION_RECURRING: 'SUBSCRIPTION_RECURRING',
  /** Subscription retry charge (user-managed) */
  SUBSCRIPTION_RETRY: 'SUBSCRIPTION_RETRY',
} as const;

export type OrderType = typeof OrderType[keyof typeof OrderType];

// ============================================================================
// Order Entity
// ============================================================================

/**
 * Order entity interface
 * 
 * CRITICAL: Every order tracks:
 * - subscriptionType: How billing is managed
 * - provider: Which payment provider
 * - orderType: What kind of order this is
 */
export interface Order {
  // === Identity ===
  /** Internal order ID */
  readonly id: string;
  /** Merchant order ID (unique, used for provider communication) */
  readonly merchantOrderId: string;

  // === Ownership ===
  /** User who owns this order */
  readonly userId: string;
  /** App this order belongs to */
  readonly appId: string;

  // === Type and Provider Tracking (CRITICAL) ===
  /** Order type */
  readonly orderType: OrderType;
  /** Subscription type: PROVIDER_MANAGED or USER_MANAGED */
  readonly subscriptionType: SubscriptionType;
  /** Payment provider: RAZORPAY or PHONEPE */
  readonly provider: PaymentProvider;

  // === Configuration Reference ===
  /** Configuration ID used */
  readonly configId: string;
  /** Environment */
  readonly environment: 'SANDBOX' | 'PRODUCTION';

  // === Subscription Reference ===
  /** Subscription ID (if this is a subscription-related order) */
  readonly subscriptionId: string | null;

  // === Order Details ===
  /** Amount in smallest currency unit (paise) */
  readonly amount: number;
  /** Currency code */
  readonly currency: string;
  /** Current order status */
  readonly status: OrderStatus;
  /** Payment method used (if known) */
  readonly paymentMethodType?: PaymentMethodType;

  // === Timestamps ===
  /** Creation timestamp */
  readonly createdAt: Date;
  /** Last update timestamp */
  readonly updatedAt: Date;
  /** Payment completion timestamp */
  readonly paidAt: Date | null;
  /** Refund timestamp */
  readonly refundedAt: Date | null;
  /** Order expiration timestamp */
  readonly expiresAt: Date | null;

  // === Provider Data ===
  /** Provider-specific order data */
  readonly providerData: ProviderOrderData;

  // === Metadata ===
  readonly metadata: OrderMetadata;
}

// ============================================================================
// Order Creation
// ============================================================================

/**
 * Parameters for creating an order
 */
export interface CreateOrderParams {
  readonly id: string;
  readonly merchantOrderId: string;
  readonly userId: string;
  readonly appId: string;
  readonly orderType: OrderType;
  readonly subscriptionType: SubscriptionType;
  readonly provider: PaymentProvider;
  readonly configId: string;
  readonly environment: 'SANDBOX' | 'PRODUCTION';
  readonly subscriptionId?: string;
  readonly amount: number;
  readonly currency?: string;
  readonly providerData?: Partial<ProviderOrderData>;
  readonly expiresAt?: Date;
  readonly description?: string;
  readonly notes?: Record<string, string>;
}

/**
 * Create a new order entity
 */
export function createOrder(params: CreateOrderParams): Order {
  const now = new Date();

  const providerData: ProviderOrderData = {
    orderId: params.providerData?.orderId ?? '',
    paymentId: params.providerData?.paymentId ?? null,
    refundId: params.providerData?.refundId ?? null,
    tokenId: params.providerData?.tokenId ?? null,
    transactionId: params.providerData?.transactionId ?? null,
    raw: params.providerData?.raw ?? {},
    intentUrl: params.providerData?.intentUrl ?? null,
  };

  const metadata: OrderMetadata = {
    environment: params.environment,
    configId: params.configId,
    description: params.description ?? null,
    notes: params.notes ?? {},
    createdAt: now,
    updatedAt: now,
  };

  return {
    id: params.id,
    merchantOrderId: params.merchantOrderId,
    userId: params.userId,
    appId: params.appId,
    orderType: params.orderType,
    subscriptionType: params.subscriptionType,
    provider: params.provider,
    configId: params.configId,
    environment: params.environment,
    subscriptionId: params.subscriptionId ?? null,
    amount: params.amount,
    currency: params.currency ?? 'INR',
    status: 'CREATED',
    createdAt: now,
    updatedAt: now,
    paidAt: null,
    refundedAt: null,
    expiresAt: params.expiresAt ?? null,
    providerData,
    metadata,
  };
}

// ============================================================================
// Order Status Transitions
// ============================================================================

/**
 * Valid order status transitions
 */
const VALID_ORDER_TRANSITIONS: Readonly<Record<OrderStatus, readonly OrderStatus[]>> = {
  CREATED: ['PENDING', 'AUTHORIZED', 'FAILED', 'CANCELLED'] as const,
  PENDING: ['AUTHORIZED', 'CAPTURED', 'FAILED', 'CANCELLED'] as const,
  AUTHORIZED: ['CAPTURED', 'FAILED', 'CANCELLED', 'REFUNDED'] as const,
  CAPTURED: ['REFUNDED'] as const,
  FAILED: [] as const,
  CANCELLED: [] as const,
  REFUNDED: [] as const,
} as const;

/**
 * Check if order status transition is valid
 */
export function isValidOrderTransition(from: OrderStatus, to: OrderStatus): boolean {
  return VALID_ORDER_TRANSITIONS[from].includes(to);
}

/**
 * Transition order to a new status
 */
export function transitionOrderStatus(
  order: Order,
  newStatus: OrderStatus,
): Order {
  if (!isValidOrderTransition(order.status, newStatus)) {
    throw new Error(
      `Invalid order status transition from ${order.status} to ${newStatus}`,
    );
  }

  const now = new Date();

  if (newStatus === 'CAPTURED') {
    return {
      ...order,
      status: newStatus,
      paidAt: now,
      metadata: {
        ...order.metadata,
        updatedAt: now,
      },
    };
  }

  if (newStatus === 'REFUNDED') {
    return {
      ...order,
      status: newStatus,
      refundedAt: now,
      metadata: {
        ...order.metadata,
        updatedAt: now,
      },
    };
  }

  return {
    ...order,
    status: newStatus,
    metadata: {
      ...order.metadata,
      updatedAt: now,
    },
  };
}

// ============================================================================
// Domain Operations
// ============================================================================

/**
 * Update provider data on order
 */
export function updateOrderProviderData(
  order: Order,
  updates: Partial<ProviderOrderData>,
): Order {
  return {
    ...order,
    providerData: {
      ...order.providerData,
      ...updates,
    },
    metadata: {
      ...order.metadata,
      updatedAt: new Date(),
    },
  };
}

/**
 * Mark order as paid
 */
export function markOrderAsPaid(
  order: Order,
  paymentId: string,
  providerData?: Partial<ProviderOrderData>,
): Order {
  const now = new Date();
  return {
    ...order,
    status: 'CAPTURED',
    paidAt: now,
    providerData: {
      ...order.providerData,
      paymentId,
      ...providerData,
    },
    metadata: {
      ...order.metadata,
      updatedAt: now,
    },
  };
}

/**
 * Mark order as failed
 */
export function markOrderAsFailed(
  order: Order,
  reason?: string,
  providerData?: Partial<ProviderOrderData>,
): Order {
  const now = new Date();
  return {
    ...order,
    status: 'FAILED',
    providerData: {
      ...order.providerData,
      ...providerData,
    },
    metadata: {
      ...order.metadata,
      updatedAt: now,
      notes: reason ? { ...order.metadata.notes, failure_reason: reason } : order.metadata.notes,
    },
  };
}

/**
 * Mark order as refunded
 */
export function markOrderAsRefunded(
  order: Order,
  refundId: string,
  providerData?: Partial<ProviderOrderData>,
): Order {
  const now = new Date();
  return {
    ...order,
    status: 'REFUNDED',
    refundedAt: now,
    providerData: {
      ...order.providerData,
      refundId,
      ...providerData,
    },
    metadata: {
      ...order.metadata,
      updatedAt: now,
    },
  };
}

/**
 * Check if order is in a terminal state
 */
export function isTerminalOrder(order: Order): boolean {
  return ['CAPTURED', 'FAILED', 'CANCELLED', 'REFUNDED'].includes(order.status);
}

/**
 * Check if order was successful
 */
export function isSuccessfulOrder(order: Order): boolean {
  return order.status === 'CAPTURED';
}

/**
 * Check if order can be refunded
 */
export function canRefundOrder(order: Order): boolean {
  return order.status === 'CAPTURED' || order.status === 'AUTHORIZED';
}

/**
 * Reconstruct order from persistence
 */
export function reconstructOrder(data: {
  readonly id: string;
  readonly merchantOrderId: string;
  readonly userId: string;
  readonly appId: string;
  readonly orderType: OrderType;
  readonly subscriptionType: SubscriptionType;
  readonly provider: PaymentProvider;
  readonly configId: string;
  readonly environment: 'SANDBOX' | 'PRODUCTION';
  readonly subscriptionId: string | null;
  readonly amount: number;
  readonly currency: string;
  readonly status: OrderStatus;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly paidAt: Date | null;
  readonly refundedAt: Date | null;
  readonly expiresAt: Date | null;
  readonly providerData: ProviderOrderData;
  readonly metadata: OrderMetadata;
}): Order {
  return data;
}
