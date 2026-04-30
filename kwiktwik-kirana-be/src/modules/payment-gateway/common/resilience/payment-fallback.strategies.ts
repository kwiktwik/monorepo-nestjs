/**
 * Payment Fallback Strategies
 *
 * Provides fallback strategies for payment operations when circuit is open.
 * Different operations have different fallback behaviors:
 * - setupSubscription: Queue for retry, return pending status
 * - chargeSubscription: Queue for retry with scheduled processing
 * - getSubscriptionStatus: Return cached data or degraded status
 * - cancelSubscription: Queue for retry (critical operation)
 * - getOrderStatus: Return cached data or degraded status
 */

import { Logger } from '@nestjs/common';
import type { PaymentProvider } from '../../types/provider.enum';
import type {
  SetupSubscriptionResult,
  ChargeSubscriptionResult,
  SubscriptionStatusResult,
  OrderStatusResult,
  CancelSubscriptionResult,
  SetupSubscriptionParams,
  ChargeSubscriptionParams,
  GetSubscriptionStatusParams,
  GetOrderStatusParams,
  CancelSubscriptionParams,
} from '../../providers/interfaces/subscription-provider.interface';
import { CircuitOpenError } from './circuit-breaker.service';

// ============================================================================
// Types
// ============================================================================

export type OperationType =
  | 'setupSubscription'
  | 'chargeSubscription'
  | 'getSubscriptionStatus'
  | 'getOrderStatus'
  | 'cancelSubscription'
  | 'pauseSubscription'
  | 'resumeSubscription'
  | 'refundPayment';

export interface QueuedOperation {
  readonly id: string;
  readonly provider: PaymentProvider;
  readonly operation: OperationType;
  readonly params: unknown;
  readonly queuedAt: Date;
  readonly retryCount: number;
  readonly maxRetries: number;
  readonly nextRetryAt: Date;
}

export interface FallbackContext {
  readonly provider: PaymentProvider;
  readonly operation: OperationType;
  readonly originalError: Error;
  readonly cachedData?: unknown;
}

export interface PaymentFallbackConfig {
  /** Whether to queue operations for retry */
  readonly enableRetryQueue: boolean;
  /** Max retries for queued operations */
  readonly maxRetries: number;
  /** Initial delay before first retry (ms) */
  readonly initialRetryDelayMs: number;
  /** Max delay between retries (ms) */
  readonly maxRetryDelayMs: number;
  /** Whether to use cached data when available */
  readonly useCachedData: boolean;
}

const DEFAULT_CONFIG: PaymentFallbackConfig = {
  enableRetryQueue: true,
  maxRetries: 5,
  initialRetryDelayMs: 1000,
  maxRetryDelayMs: 60000,
  useCachedData: true,
};

// ============================================================================
// Fallback Strategy Interface
// ============================================================================

export interface FallbackStrategy<TParams, TResult> {
  execute(
    params: TParams,
    context: FallbackContext,
  ): Promise<TResult>;
}

// ============================================================================
// Setup Subscription Fallback
// ============================================================================

/**
 * Fallback for subscription setup
 *
 * Strategy:
 * 1. Return a pending status indicating the request is queued
 * 2. Queue the operation for retry when circuit closes
 * 3. Include a reference ID for tracking
 */
export class SetupSubscriptionFallback
  implements FallbackStrategy<SetupSubscriptionParams, SetupSubscriptionResult>
{
  private readonly logger = new Logger(SetupSubscriptionFallback.name);
  private readonly config: PaymentFallbackConfig;
  private readonly queue: QueuedOperation[] = [];

  constructor(config: Partial<PaymentFallbackConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  async execute(
    params: SetupSubscriptionParams,
    context: FallbackContext,
  ): Promise<SetupSubscriptionResult> {
    this.logger.warn(
      `Setup subscription fallback triggered for ${context.provider}:${params.merchantSubscriptionId}`,
    );

    // Queue for retry if enabled
    if (this.config.enableRetryQueue) {
      const queuedOp = this.createQueuedOperation(
        context.provider,
        'setupSubscription',
        params,
      );
      this.queue.push(queuedOp);

      this.logger.log(
        `Queued setup subscription ${params.merchantSubscriptionId} for retry (ID: ${queuedOp.id})`,
      );
    }

    // Return pending status
    return {
      success: false,
      merchantSubscriptionId: params.merchantSubscriptionId,
      merchantOrderId: params.merchantOrderId,
      providerSubscriptionId: null,
      providerOrderId: '',
      intentUrl: null,
      redirectUrl: params.redirectUrl,
      state: 'pending_retry',
      expiresAt: null,
      providerData: {
        fallback: true,
        reason: 'provider_unavailable',
        queuedForRetry: this.config.enableRetryQueue,
      },
      error: 'Payment provider temporarily unavailable. Request queued for retry.',
      errorCode: 'PROVIDER_UNAVAILABLE',
    };
  }

  private createQueuedOperation(
    provider: PaymentProvider,
    operation: OperationType,
    params: unknown,
  ): QueuedOperation {
    const now = new Date();
    return {
      id: `fallback_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      provider,
      operation,
      params,
      queuedAt: now,
      retryCount: 0,
      maxRetries: this.config.maxRetries,
      nextRetryAt: new Date(now.getTime() + this.config.initialRetryDelayMs),
    };
  }

  getQueue(): QueuedOperation[] {
    return [...this.queue];
  }

  clearQueue(): void {
    this.queue.length = 0;
  }
}

// ============================================================================
// Charge Subscription Fallback
// ============================================================================

/**
 * Fallback for subscription charge
 *
 * Strategy:
 * 1. Return pending charge status
 * 2. Queue for retry (critical for billing)
 * 3. Mark as high priority for retry queue
 */
export class ChargeSubscriptionFallback
  implements FallbackStrategy<ChargeSubscriptionParams, ChargeSubscriptionResult>
{
  private readonly logger = new Logger(ChargeSubscriptionFallback.name);
  private readonly config: PaymentFallbackConfig;
  private readonly queue: QueuedOperation[] = [];

  constructor(config: Partial<PaymentFallbackConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  async execute(
    params: ChargeSubscriptionParams,
    context: FallbackContext,
  ): Promise<ChargeSubscriptionResult> {
    this.logger.warn(
      `Charge subscription fallback triggered for ${context.provider}:${params.merchantSubscriptionId}`,
    );

    // Always queue charge operations - they're critical for billing
    if (this.config.enableRetryQueue) {
      const queuedOp = this.createQueuedOperation(
        context.provider,
        'chargeSubscription',
        { ...params, priority: 'high' },
      );
      this.queue.push(queuedOp);

      this.logger.log(
        `Queued charge subscription ${params.merchantSubscriptionId} for retry (ID: ${queuedOp.id})`,
      );
    }

    return {
      success: false,
      merchantOrderId: params.merchantOrderId,
      providerOrderId: '',
      transactionId: null,
      amount: params.amount,
      currency: params.currency,
      state: 'pending_retry',
      paidAt: null,
      providerData: {
        fallback: true,
        reason: 'provider_unavailable',
        queuedForRetry: this.config.enableRetryQueue,
        priority: 'high',
      },
      error: 'Payment provider temporarily unavailable. Charge queued for retry.',
      errorCode: 'PROVIDER_UNAVAILABLE',
    };
  }

  private createQueuedOperation(
    provider: PaymentProvider,
    operation: OperationType,
    params: unknown,
  ): QueuedOperation {
    const now = new Date();
    return {
      id: `fallback_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      provider,
      operation,
      params,
      queuedAt: now,
      retryCount: 0,
      maxRetries: this.config.maxRetries,
      nextRetryAt: new Date(now.getTime() + this.config.initialRetryDelayMs),
    };
  }

  getQueue(): QueuedOperation[] {
    return [...this.queue];
  }

  clearQueue(): void {
    this.queue.length = 0;
  }
}

// ============================================================================
// Get Subscription Status Fallback
// ============================================================================

/**
 * Fallback for subscription status check
 *
 * Strategy:
 * 1. Return cached data if available
 * 2. Return degraded status indicating data may be stale
 */
export class GetSubscriptionStatusFallback
  implements FallbackStrategy<GetSubscriptionStatusParams, SubscriptionStatusResult>
{
  private readonly logger = new Logger(GetSubscriptionStatusFallback.name);
  private readonly config: PaymentFallbackConfig;

  constructor(config: Partial<PaymentFallbackConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  async execute(
    params: GetSubscriptionStatusParams,
    context: FallbackContext,
  ): Promise<SubscriptionStatusResult> {
    this.logger.warn(
      `Get subscription status fallback for ${context.provider}:${params.merchantSubscriptionId}`,
    );

    // Check for cached data
    const cachedData = context.cachedData as SubscriptionStatusResult | undefined;
    if (cachedData && this.config.useCachedData) {
      this.logger.debug(`Returning cached status for ${params.merchantSubscriptionId}`);
      return {
        ...cachedData,
        providerData: {
          ...cachedData.providerData,
          fallback: true,
          cachedAt: new Date().toISOString(),
          reason: 'provider_unavailable',
        },
      };
    }

    // Return degraded status
    return {
      merchantSubscriptionId: params.merchantSubscriptionId,
      providerSubscriptionId: params.providerSubscriptionId,
      providerState: 'unknown',
      mappedStatus: 'UNKNOWN',
      maxAmount: null,
      frequency: null,
      nextBillingDate: null,
      paidCount: 0,
      remainingCount: null,
      canCharge: false,
      providerData: {
        fallback: true,
        reason: 'provider_unavailable',
        degraded: true,
      },
    };
  }
}

// ============================================================================
// Get Order Status Fallback
// ============================================================================

/**
 * Fallback for order status check
 *
 * Strategy:
 * 1. Return cached data if available
 * 2. Return degraded status indicating data may be stale
 */
export class GetOrderStatusFallback
  implements FallbackStrategy<GetOrderStatusParams, OrderStatusResult>
{
  private readonly logger = new Logger(GetOrderStatusFallback.name);
  private readonly config: PaymentFallbackConfig;

  constructor(config: Partial<PaymentFallbackConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  async execute(
    params: GetOrderStatusParams,
    context: FallbackContext,
  ): Promise<OrderStatusResult> {
    this.logger.warn(
      `Get order status fallback for ${context.provider}:${params.merchantOrderId}`,
    );

    // Check for cached data
    const cachedData = context.cachedData as OrderStatusResult | undefined;
    if (cachedData && this.config.useCachedData) {
      this.logger.debug(`Returning cached status for ${params.merchantOrderId}`);
      return {
        ...cachedData,
        providerData: {
          ...cachedData.providerData,
          fallback: true,
          cachedAt: new Date().toISOString(),
          reason: 'provider_unavailable',
        },
      };
    }

    // Return degraded status
    return {
      merchantOrderId: params.merchantOrderId,
      providerOrderId: params.providerOrderId,
      providerState: 'unknown',
      mappedStatus: 'UNKNOWN',
      amount: 0,
      currency: 'INR',
      expiresAt: null,
      paymentDetails: [],
      providerData: {
        fallback: true,
        reason: 'provider_unavailable',
        degraded: true,
      },
    };
  }
}

// ============================================================================
// Cancel Subscription Fallback
// ============================================================================

/**
 * Fallback for subscription cancellation
 *
 * Strategy:
 * 1. Queue for retry (critical operation)
 * 2. Return pending status
 */
export class CancelSubscriptionFallback
  implements FallbackStrategy<CancelSubscriptionParams, CancelSubscriptionResult>
{
  private readonly logger = new Logger(CancelSubscriptionFallback.name);
  private readonly config: PaymentFallbackConfig;
  private readonly queue: QueuedOperation[] = [];

  constructor(config: Partial<PaymentFallbackConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  async execute(
    params: CancelSubscriptionParams,
    context: FallbackContext,
  ): Promise<CancelSubscriptionResult> {
    this.logger.warn(
      `Cancel subscription fallback for ${context.provider}:${params.merchantSubscriptionId}`,
    );

    // Queue for retry - cancellation is important
    if (this.config.enableRetryQueue) {
      const queuedOp = this.createQueuedOperation(
        context.provider,
        'cancelSubscription',
        params,
      );
      this.queue.push(queuedOp);

      this.logger.log(
        `Queued cancel subscription ${params.merchantSubscriptionId} for retry (ID: ${queuedOp.id})`,
      );
    }

    return {
      success: false,
      state: 'cancel_pending',
      cancelledAt: null,
      error: 'Payment provider temporarily unavailable. Cancellation queued for retry.',
    };
  }

  private createQueuedOperation(
    provider: PaymentProvider,
    operation: OperationType,
    params: unknown,
  ): QueuedOperation {
    const now = new Date();
    return {
      id: `fallback_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      provider,
      operation,
      params,
      queuedAt: now,
      retryCount: 0,
      maxRetries: this.config.maxRetries,
      nextRetryAt: new Date(now.getTime() + this.config.initialRetryDelayMs),
    };
  }

  getQueue(): QueuedOperation[] {
    return [...this.queue];
  }

  clearQueue(): void {
    this.queue.length = 0;
  }
}

// ============================================================================
// Fallback Strategy Factory
// ============================================================================

/**
 * Factory for creating fallback strategies
 */
export class FallbackStrategyFactory {
  private readonly setupFallback: SetupSubscriptionFallback;
  private readonly chargeFallback: ChargeSubscriptionFallback;
  private readonly statusFallback: GetSubscriptionStatusFallback;
  private readonly orderStatusFallback: GetOrderStatusFallback;
  private readonly cancelFallback: CancelSubscriptionFallback;

  constructor(config: Partial<PaymentFallbackConfig> = {}) {
    this.setupFallback = new SetupSubscriptionFallback(config);
    this.chargeFallback = new ChargeSubscriptionFallback(config);
    this.statusFallback = new GetSubscriptionStatusFallback(config);
    this.orderStatusFallback = new GetOrderStatusFallback(config);
    this.cancelFallback = new CancelSubscriptionFallback(config);
  }

  getSetupFallback(): SetupSubscriptionFallback {
    return this.setupFallback;
  }

  getChargeFallback(): ChargeSubscriptionFallback {
    return this.chargeFallback;
  }

  getStatusFallback(): GetSubscriptionStatusFallback {
    return this.statusFallback;
  }

  getOrderStatusFallback(): GetOrderStatusFallback {
    return this.orderStatusFallback;
  }

  getCancelFallback(): CancelSubscriptionFallback {
    return this.cancelFallback;
  }

  /**
   * Get all queued operations from all fallback strategies
   */
  getAllQueuedOperations(): QueuedOperation[] {
    return [
      ...this.setupFallback.getQueue(),
      ...this.chargeFallback.getQueue(),
      ...this.cancelFallback.getQueue(),
    ];
  }

  /**
   * Clear all queues
   */
  clearAllQueues(): void {
    this.setupFallback.clearQueue();
    this.chargeFallback.clearQueue();
    this.cancelFallback.clearQueue();
  }
}
