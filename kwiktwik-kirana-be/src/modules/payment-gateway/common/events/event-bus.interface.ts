/**
 * Event Bus Interface
 * 
 * Provides a way to publish and subscribe to events across the payment system.
 * This enables loose coupling between components and supports async processing.
 */

// ============================================================================
// Event Types
// ============================================================================

/**
 * Payment event types
 */
export const PaymentEventTypes = {
  // Subscription events
  SUBSCRIPTION_CREATED: 'payment.subscription.created',
  SUBSCRIPTION_ACTIVATED: 'payment.subscription.activated',
  SUBSCRIPTION_CANCELLED: 'payment.subscription.cancelled',
  SUBSCRIPTION_EXPIRED: 'payment.subscription.expired',
  SUBSCRIPTION_PAUSED: 'payment.subscription.paused',
  SUBSCRIPTION_RESUMED: 'payment.subscription.resumed',
  SUBSCRIPTION_REACTIVATED: 'payment.subscription.reactivated',
  SUBSCRIPTION_SETUP_FAILED: 'payment.subscription.setup_failed',

  // Payment events
  PAYMENT_SUCCESSFUL: 'payment.payment.successful',
  PAYMENT_FAILED: 'payment.payment.failed',
  PAYMENT_REFUNDED: 'payment.payment.refunded',
  PAYMENT_PENDING: 'payment.payment.pending',

  // Order events
  ORDER_CREATED: 'payment.order.created',
  ORDER_COMPLETED: 'payment.order.completed',
  ORDER_FAILED: 'payment.order.failed',

  // Webhook events
  WEBHOOK_RECEIVED: 'payment.webhook.received',
  WEBHOOK_PROCESSED: 'payment.webhook.processed',
  WEBHOOK_FAILED: 'payment.webhook.failed',

  // Provider events
  PROVIDER_HEALTH_CHECK: 'payment.provider.health_check',
  PROVIDER_ERROR: 'payment.provider.error',
} as const;

export type PaymentEventType = typeof PaymentEventTypes[keyof typeof PaymentEventTypes];

// ============================================================================
// Event Interfaces
// ============================================================================

/**
 * Event metadata
 */
export interface EventMetadata {
  /** Unique correlation ID for tracing */
  readonly correlationId: string;
  /** Source of the event */
  readonly source: string;
  /** Timestamp when event was created */
  readonly timestamp: Date;
  /** App ID associated with the event */
  readonly appId: string;
  /** User ID associated with the event (if applicable) */
  readonly userId?: string;
  /** Provider that triggered the event */
  readonly provider?: string;
  /** Additional metadata */
  readonly [key: string]: unknown;
}

/**
 * Base event interface
 */
export interface PaymentEvent<T = unknown> {
  /** Unique event ID */
  readonly eventId: string;
  /** Event type */
  readonly eventType: PaymentEventType | string;
  /** Event version for schema evolution */
  readonly version: number;
  /** Event timestamp */
  readonly timestamp: Date;
  /** Event payload */
  readonly payload: T;
  /** Event metadata */
  readonly metadata: EventMetadata;
}

// ============================================================================
// Subscription Event Payloads
// ============================================================================

export interface SubscriptionCreatedPayload {
  readonly subscriptionId: string;
  readonly merchantSubscriptionId: string;
  readonly userId: string;
  readonly appId: string;
  readonly planId: string;
  readonly provider: string;
  readonly subscriptionType: string;
  readonly initialAmount: number;
  readonly recurringAmount: number;
  readonly currency: string;
  readonly frequency: string;
}

export interface SubscriptionActivatedPayload {
  readonly subscriptionId: string;
  readonly merchantSubscriptionId: string;
  readonly userId: string;
  readonly appId: string;
  readonly providerSubscriptionId: string;
  readonly activatedAt: Date;
  readonly nextBillingDate: Date | null;
}

export interface SubscriptionCancelledPayload {
  readonly subscriptionId: string;
  readonly merchantSubscriptionId: string;
  readonly userId: string;
  readonly appId: string;
  readonly cancelledAt: Date;
  readonly reason: string | null;
}

export interface SubscriptionExpiredPayload {
  readonly subscriptionId: string;
  readonly merchantSubscriptionId: string;
  readonly userId: string;
  readonly appId: string;
  readonly expiredAt: Date;
  readonly reason: string;
  readonly consecutiveFailures: number;
}

// ============================================================================
// Payment Event Payloads
// ============================================================================

export interface PaymentSuccessfulPayload {
  readonly orderId: string;
  readonly merchantOrderId: string;
  readonly subscriptionId: string | null;
  readonly userId: string;
  readonly appId: string;
  readonly provider: string;
  readonly transactionId: string;
  readonly amount: number;
  readonly currency: string;
  readonly paymentMethod: string | null;
  readonly paidAt: Date;
}

export interface PaymentFailedPayload {
  readonly orderId: string;
  readonly merchantOrderId: string;
  readonly subscriptionId: string | null;
  readonly userId: string;
  readonly appId: string;
  readonly provider: string;
  readonly amount: number;
  readonly currency: string;
  readonly errorCode: string | null;
  readonly errorMessage: string | null;
  readonly failedAt: Date;
}

// ============================================================================
// Webhook Event Payloads
// ============================================================================

export interface WebhookReceivedPayload {
  readonly provider: string;
  readonly eventType: string;
  readonly eventId: string;
  readonly appId: string | null;
  readonly merchantSubscriptionId: string | null;
  readonly merchantOrderId: string | null;
  readonly signatureValid: boolean;
  readonly rawPayload: Record<string, unknown>;
}

// ============================================================================
// Event Handler
// ============================================================================

/**
 * Event handler function type
 */
export type EventHandler<T = unknown> = (event: PaymentEvent<T>) => Promise<void> | void;

/**
 * Event handler registration
 */
export interface EventHandlerRegistration<T = unknown> {
  /** Event type to listen to */
  readonly eventType: string;
  /** Handler function */
  readonly handler: EventHandler<T>;
  /** Optional priority (higher = executed first) */
  readonly priority?: number;
  /** Whether to retry on failure */
  readonly retryOnFailure?: boolean;
  /** Max retry attempts */
  readonly maxRetries?: number;
}

// ============================================================================
// Event Bus Interface
// ============================================================================

/**
 * Event bus interface for publishing and subscribing to events
 */
export interface IEventBus {
  /**
   * Publish an event to all subscribers
   */
  publish<T>(event: PaymentEvent<T>): Promise<void>;

  /**
   * Subscribe to an event type
   */
  subscribe<T>(registration: EventHandlerRegistration<T>): () => void;

  /**
   * Subscribe to multiple event types
   */
  subscribeToAll<T>(
    eventTypes: readonly string[],
    handler: EventHandler<T>,
  ): () => void;

  /**
   * Get all registered handlers for an event type
   */
  getHandlers(eventType: string): readonly EventHandlerRegistration[];

  /**
   * Health check for the event bus
   */
  healthCheck(): Promise<{ healthy: boolean; message?: string }>;
}

// ============================================================================
// Event Factory
// ============================================================================

/**
 * Create a new payment event
 */
export function createPaymentEvent<T>(
  eventType: PaymentEventType | string,
  payload: T,
  metadata: EventMetadata,
  eventId?: string,
): PaymentEvent<T> {
  return {
    eventId: eventId ?? generateEventId(),
    eventType,
    version: 1,
    timestamp: new Date(),
    payload,
    metadata,
  };
}

/**
 * Generate a unique event ID
 */
function generateEventId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 11);
  return `evt_${timestamp}_${random}`;
}

/**
 * Generate a correlation ID
 */
export function generateCorrelationId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 9);
  return `corr_${timestamp}_${random}`;
}
