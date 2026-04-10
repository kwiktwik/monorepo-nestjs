/**
 * Subscription Entity
 * 
 * The core domain entity representing a subscription.
 * Every entity tracks:
 * - Subscription type (PROVIDER_MANAGED | USER_MANAGED)
 * - Payment provider (RAZORPAY | PHONEPE)
 * - Provider-specific data
 */

import type { PaymentProvider } from '../../types/provider.enum';
import type { SubscriptionType } from '../../types/subscription-type.enum';
import type { SubscriptionStatus, StateTransitionResult } from '../../types/subscription-status.enum';
import type { BillingFrequency } from '../../types/frequency.enum';
import { attemptTransition, canCharge, isPremiumStatus } from '../../types/subscription-status.enum';
import { calculateNextBillingDate } from '../../types/frequency.enum';

// ============================================================================
// Value Objects
// ============================================================================

/**
 * Money value object for precise amount handling
 */
export interface Money {
  /** Amount in smallest currency unit (paise for INR) */
  readonly amount: number;
  /** ISO 4217 currency code */
  readonly currency: string;
}

/**
 * Create a money value object
 */
export function createMoney(amount: number, currency: string = 'INR'): Money {
  if (amount < 0) {
    throw new Error('Amount cannot be negative');
  }
  return { amount, currency };
}

/**
 * Pricing information for a subscription
 */
export interface SubscriptionPricing {
  /** Initial/trial amount in paise */
  readonly initialAmount: number;
  /** Recurring amount in paise */
  readonly recurringAmount: number;
  /** Currency code */
  readonly currency: string;
  /** Billing frequency */
  readonly frequency: BillingFrequency;
  /** Total number of billing cycles (null = unlimited) */
  readonly totalCycles: number | null;
}

// ============================================================================
// Provider Data Types
// ============================================================================

/**
 * Provider-specific subscription data stored as JSONB
 */
export interface ProviderSubscriptionData {
  /** Provider's subscription ID */
  readonly subscriptionId: string;
  /** Provider's order ID (for setup) */
  readonly orderId: string | null;
  /** Provider's customer ID */
  readonly customerId: string | null;
  /** Provider's plan ID */
  readonly planId: string;
  /** Provider's mandate/token ID (for recurring) */
  readonly mandateId: string | null;
  /** Provider's raw subscription object (for debugging) */
  readonly raw: Record<string, unknown>;
  /** Last sync timestamp */
  readonly lastSyncedAt: Date;
}

/**
 * Create empty provider data placeholder
 */
export function createEmptyProviderData(): ProviderSubscriptionData {
  return {
    subscriptionId: '',
    orderId: null,
    customerId: null,
    planId: '',
    mandateId: null,
    raw: {},
    lastSyncedAt: new Date(),
  };
}

// ============================================================================
// Retry Configuration (User-Managed Subscriptions)
// ============================================================================

/**
 * Retry configuration for user-managed subscriptions
 */
export interface RetryConfig {
  /** Maximum retry attempts before marking as expired */
  readonly maxAttempts: number;
  /** Base delay between retries in minutes */
  readonly baseDelayMinutes: number;
  /** Exponential backoff multiplier */
  readonly backoffMultiplier: number;
  /** Current retry count */
  readonly currentAttempt: number;
  /** Next retry timestamp */
  readonly nextRetryAt: Date | null;
  /** Grace period end timestamp */
  readonly gracePeriodEndAt: Date | null;
}

/**
 * Default retry configuration
 */
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelayMinutes: 60,
  backoffMultiplier: 2,
  currentAttempt: 0,
  nextRetryAt: null,
  gracePeriodEndAt: null,
};

/**
 * Create retry configuration
 */
export function createRetryConfig(
  maxAttempts: number = 3,
  baseDelayMinutes: number = 60,
): RetryConfig {
  return {
    maxAttempts,
    baseDelayMinutes,
    backoffMultiplier: 2,
    currentAttempt: 0,
    nextRetryAt: null,
    gracePeriodEndAt: null,
  };
}

// ============================================================================
// Payment Failure Tracking
// ============================================================================

/**
 * Payment failure record
 */
export interface PaymentFailure {
  /** When the failure occurred */
  readonly failedAt: Date;
  /** Failure reason code */
  readonly reason: string;
  /** Error code from provider */
  readonly errorCode: string | null;
  /** Error message from provider */
  readonly errorMessage: string | null;
  /** Provider's response (for debugging) */
  readonly providerResponse: Record<string, unknown> | null;
  /** Order ID that failed */
  readonly orderId: string | null;
}

/**
 * Create a payment failure record
 */
export function createPaymentFailure(
  reason: string,
  errorCode: string | null = null,
  errorMessage: string | null = null,
  providerResponse: Record<string, unknown> | null = null,
  orderId: string | null = null,
): PaymentFailure {
  return {
    failedAt: new Date(),
    reason,
    errorCode,
    errorMessage,
    providerResponse,
    orderId,
  };
}

// ============================================================================
// Subscription Metadata
// ============================================================================

/**
 * Subscription metadata for tracking and auditing
 */
export interface SubscriptionMetadata {
  /** Environment: SANDBOX or PRODUCTION */
  readonly environment: 'SANDBOX' | 'PRODUCTION';
  /** Configuration ID used */
  readonly configId: string;
  /** Source of subscription creation */
  readonly source: string;
  /** Creation timestamp */
  readonly createdAt: Date;
  /** Last update timestamp */
  readonly updatedAt: Date;
  /** Optional tags for categorization */
  readonly tags: readonly string[];
  /** Custom metadata */
  readonly custom: Record<string, unknown>;
}

/**
 * Create default metadata
 */
export function createDefaultMetadata(
  environment: 'SANDBOX' | 'PRODUCTION',
  configId: string,
): SubscriptionMetadata {
  return {
    environment,
    configId,
    source: 'api',
    createdAt: new Date(),
    updatedAt: new Date(),
    tags: [],
    custom: {},
  };
}

// ============================================================================
// Subscription Entity
// ============================================================================

/**
 * Subscription entity interface
 * 
 * CRITICAL: Every subscription tracks:
 * - subscriptionType: How billing is managed
 * - provider: Which payment provider
 * - providerData: Provider-specific details
 */
export interface Subscription {
  // === Identity ===
  /** Internal subscription ID */
  readonly id: string;
  /** Merchant subscription ID (unique, used for provider communication) */
  readonly merchantSubscriptionId: string;

  // === Ownership ===
  /** User who owns this subscription */
  readonly userId: string;
  /** App this subscription belongs to */
  readonly appId: string;

  // === Type and Provider Tracking (CRITICAL) ===
  /** Subscription type: PROVIDER_MANAGED or USER_MANAGED */
  readonly subscriptionType: SubscriptionType;
  /** Payment provider: RAZORPAY or PHONEPE */
  readonly provider: PaymentProvider;

  // === Plan Reference ===
  /** Internal plan ID */
  readonly planId: string;
  /** Pricing details */
  readonly pricing: SubscriptionPricing;

  // === Status ===
  /** Current subscription status */
  readonly status: SubscriptionStatus;

  // === Billing ===
  /** Number of completed billing cycles */
  readonly billingCycleCount: number;
  /** Next billing date (null if not active or on-demand) */
  readonly nextBillingDate: Date | null;
  /** Last billing date */
  readonly lastBillingDate: Date | null;

  // === Timestamps ===
  /** Creation timestamp */
  readonly createdAt: Date;
  /** Last update timestamp */
  readonly updatedAt: Date;
  /** Activation timestamp */
  readonly activatedAt: Date | null;
  /** Cancellation timestamp */
  readonly cancelledAt: Date | null;
  /** Expiration timestamp */
  readonly expiredAt: Date | null;

  // === Provider Data ===
  /** Provider-specific subscription data */
  readonly providerData: ProviderSubscriptionData;

  // === Retry Configuration (for USER_MANAGED) ===
  /** Retry configuration (null for PROVIDER_MANAGED) */
  readonly retryConfig: RetryConfig | null;

  // === Payment Failure Tracking ===
  /** History of payment failures */
  readonly paymentFailures: readonly PaymentFailure[];
  /** Consecutive failure count */
  readonly consecutiveFailures: number;

  // === Premium Status ===
  /** Whether user has premium access */
  readonly isPremium: boolean;

  // === Metadata ===
  readonly metadata: SubscriptionMetadata;
}

// ============================================================================
// Subscription Creation
// ============================================================================

/**
 * Parameters for creating a subscription
 */
export interface CreateSubscriptionParams {
  readonly id: string;
  readonly merchantSubscriptionId: string;
  readonly userId: string;
  readonly appId: string;
  readonly subscriptionType: SubscriptionType;
  readonly provider: PaymentProvider;
  readonly planId: string;
  readonly pricing: SubscriptionPricing;
  readonly providerData: Partial<ProviderSubscriptionData>;
  readonly environment: 'SANDBOX' | 'PRODUCTION';
  readonly configId: string;
  readonly source?: string;
  readonly tags?: readonly string[];
  readonly customMetadata?: Record<string, unknown>;
}

/**
 * Create a new subscription entity
 */
export function createSubscription(params: CreateSubscriptionParams): Subscription {
  const now = new Date();

  const providerData: ProviderSubscriptionData = {
    subscriptionId: params.providerData.subscriptionId ?? '',
    orderId: params.providerData.orderId ?? null,
    customerId: params.providerData.customerId ?? null,
    planId: params.providerData.planId ?? '',
    mandateId: params.providerData.mandateId ?? null,
    raw: params.providerData.raw ?? {},
    lastSyncedAt: now,
  };

  const metadata: SubscriptionMetadata = {
    environment: params.environment,
    configId: params.configId,
    source: params.source ?? 'api',
    createdAt: now,
    updatedAt: now,
    tags: params.tags ?? [],
    custom: params.customMetadata ?? {},
  };

  // User-managed subscriptions need retry config
  const retryConfig = params.subscriptionType === 'USER_MANAGED' 
    ? createRetryConfig() 
    : null;

  return {
    id: params.id,
    merchantSubscriptionId: params.merchantSubscriptionId,
    userId: params.userId,
    appId: params.appId,
    subscriptionType: params.subscriptionType,
    provider: params.provider,
    planId: params.planId,
    pricing: params.pricing,
    status: 'CREATED',
    billingCycleCount: 0,
    nextBillingDate: null,
    lastBillingDate: null,
    createdAt: now,
    updatedAt: now,
    activatedAt: null,
    cancelledAt: null,
    expiredAt: null,
    providerData,
    retryConfig,
    paymentFailures: [],
    consecutiveFailures: 0,
    isPremium: false,
    metadata,
  };
}

// ============================================================================
// State Transitions
// ============================================================================

/**
 * Result of a subscription state transition
 */
export interface SubscriptionTransitionResult {
  readonly success: boolean;
  readonly subscription: Subscription;
  readonly previousStatus: SubscriptionStatus;
  readonly transitionError?: string;
}

/**
 * Transition subscription to a new status
 */
export function transitionSubscriptionStatus(
  subscription: Subscription,
  newStatus: SubscriptionStatus,
): SubscriptionTransitionResult {
  const result = attemptTransition(subscription.status, newStatus);

  if (!result.success) {
    return {
      success: false,
      subscription,
      previousStatus: subscription.status,
      transitionError: result.error?.message,
    };
  }

  const now = new Date();

  // Update timestamps based on status
  if (newStatus === 'ACTIVE') {
    return {
      success: true,
      subscription: {
        ...subscription,
        status: newStatus,
        activatedAt: subscription.activatedAt ?? now,
        isPremium: true,
        nextBillingDate: calculateNextBillingDate(subscription.pricing.frequency, now),
        consecutiveFailures: 0,
        metadata: {
          ...subscription.metadata,
          updatedAt: now,
        },
      },
      previousStatus: subscription.status,
    };
  }

  if (newStatus === 'CANCELLED') {
    return {
      success: true,
      subscription: {
        ...subscription,
        status: newStatus,
        cancelledAt: now,
        isPremium: false,
        metadata: {
          ...subscription.metadata,
          updatedAt: now,
        },
      },
      previousStatus: subscription.status,
    };
  }

  if (newStatus === 'EXPIRED' || newStatus === 'FAILED') {
    return {
      success: true,
      subscription: {
        ...subscription,
        status: newStatus,
        expiredAt: now,
        isPremium: false,
        metadata: {
          ...subscription.metadata,
          updatedAt: now,
        },
      },
      previousStatus: subscription.status,
    };
  }

  if (newStatus === 'RETRYING' && subscription.retryConfig) {
    const nextAttempt = subscription.retryConfig.currentAttempt + 1;
    const delayMinutes = subscription.retryConfig.baseDelayMinutes * 
      Math.pow(subscription.retryConfig.backoffMultiplier, nextAttempt);
    return {
      success: true,
      subscription: {
        ...subscription,
        status: newStatus,
        retryConfig: {
          ...subscription.retryConfig,
          currentAttempt: nextAttempt,
          nextRetryAt: new Date(now.getTime() + delayMinutes * 60 * 1000),
        },
        metadata: {
          ...subscription.metadata,
          updatedAt: now,
        },
      },
      previousStatus: subscription.status,
    };
  }

  return {
    success: true,
    subscription: {
      ...subscription,
      status: newStatus,
      metadata: {
        ...subscription.metadata,
        updatedAt: now,
      },
    },
    previousStatus: subscription.status,
  };
}

// ============================================================================
// Domain Operations
// ============================================================================

/**
 * Record a payment failure
 */
export function recordPaymentFailure(
  subscription: Subscription,
  failure: PaymentFailure,
): Subscription {
  const newFailures = [...subscription.paymentFailures, failure];
  const newConsecutiveFailures = subscription.consecutiveFailures + 1;

  return {
    ...subscription,
    paymentFailures: newFailures,
    consecutiveFailures: newConsecutiveFailures,
    metadata: {
      ...subscription.metadata,
      updatedAt: new Date(),
    },
  };
}

/**
 * Record a successful payment
 */
export function recordSuccessfulPayment(
  subscription: Subscription,
  orderId: string,
): Subscription {
  const now = new Date();
  const newCycleCount = subscription.billingCycleCount + 1;

  return {
    ...subscription,
    billingCycleCount: newCycleCount,
    lastBillingDate: now,
    nextBillingDate: calculateNextBillingDate(subscription.pricing.frequency, now),
    consecutiveFailures: 0,
    retryConfig: subscription.retryConfig
      ? { ...subscription.retryConfig, currentAttempt: 0, nextRetryAt: null }
      : null,
    metadata: {
      ...subscription.metadata,
      updatedAt: now,
    },
  };
}

/**
 * Update provider data
 */
export function updateProviderData(
  subscription: Subscription,
  updates: Partial<ProviderSubscriptionData>,
): Subscription {
  return {
    ...subscription,
    providerData: {
      ...subscription.providerData,
      ...updates,
      lastSyncedAt: new Date(),
    },
    metadata: {
      ...subscription.metadata,
      updatedAt: new Date(),
    },
  };
}

/**
 * Check if subscription can be charged
 */
export function canChargeSubscription(subscription: Subscription): boolean {
  return canCharge(subscription.status);
}

/**
 * Check if subscription provides premium access
 */
export function isPremiumSubscription(subscription: Subscription): boolean {
  return isPremiumStatus(subscription.status) && subscription.isPremium;
}

/**
 * Check if subscription has exhausted retries (user-managed)
 */
export function hasExhaustedRetries(subscription: Subscription): boolean {
  if (!subscription.retryConfig) return false;
  return subscription.retryConfig.currentAttempt >= subscription.retryConfig.maxAttempts;
}

/**
 * Get next retry time (user-managed)
 */
export function getNextRetryTime(subscription: Subscription): Date | null {
  return subscription.retryConfig?.nextRetryAt ?? null;
}

/**
 * Update premium status
 */
export function updatePremiumStatus(
  subscription: Subscription,
  isPremium: boolean,
): Subscription {
  return {
    ...subscription,
    isPremium,
    metadata: {
      ...subscription.metadata,
      updatedAt: new Date(),
    },
  };
}

/**
 * Reconstruct subscription from persistence
 */
export function reconstructSubscription(data: {
  readonly id: string;
  readonly merchantSubscriptionId: string;
  readonly userId: string;
  readonly appId: string;
  readonly subscriptionType: SubscriptionType;
  readonly provider: PaymentProvider;
  readonly planId: string;
  readonly pricing: SubscriptionPricing;
  readonly status: SubscriptionStatus;
  readonly billingCycleCount: number;
  readonly nextBillingDate: Date | null;
  readonly lastBillingDate: Date | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly activatedAt: Date | null;
  readonly cancelledAt: Date | null;
  readonly expiredAt: Date | null;
  readonly providerData: ProviderSubscriptionData;
  readonly retryConfig: RetryConfig | null;
  readonly paymentFailures: readonly PaymentFailure[];
  readonly consecutiveFailures: number;
  readonly isPremium: boolean;
  readonly metadata: SubscriptionMetadata;
}): Subscription {
  return data;
}
