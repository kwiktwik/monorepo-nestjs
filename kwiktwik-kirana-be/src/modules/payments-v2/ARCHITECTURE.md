# Payment Module V2 - Architecture Design

## Overview

A unified, scalable payment module supporting multiple payment providers, multiple subscription types, and multi-tenant configuration.

## Core Requirements

| Requirement | Description |
|-------------|-------------|
| Multi-Provider | Support Razorpay, PhonePe, and future providers |
| Multi-Account | Multiple accounts per provider per app |
| Subscription Types | Provider-Managed and User-Managed |
| Multi-Tenant | Different apps can use different providers/accounts |
| Traceability | Every data point tracks subscription type and provider |
| Type Safety | Strict TypeScript, no `any` or `unknown` |
| Test Coverage | 80%+ coverage |

---

## 1. Core Types and Enums

### 1.1 Payment Provider Enum

```typescript
// types/provider.enum.ts

/**
 * Supported payment providers
 */
export const PaymentProvider = {
  RAZORPAY: 'RAZORPAY',
  PHONEPE: 'PHONEPE',
} as const;

export type PaymentProvider = typeof PaymentProvider[keyof typeof PaymentProvider];

/**
 * Payment provider display names for logging/UI
 */
export const PaymentProviderLabels: Record<PaymentProvider, string> = {
  RAZORPAY: 'Razorpay',
  PHONEPE: 'PhonePe',
} as const;
```

### 1.2 Subscription Type Enum

```typescript
// types/subscription-type.enum.ts

/**
 * Subscription management type
 * 
 * PROVIDER_MANAGED: Payment provider handles auto-deduction, retries, and billing cycles
 * USER_MANAGED: Application initiates charges and handles retries
 */
export const SubscriptionType = {
  PROVIDER_MANAGED: 'PROVIDER_MANAGED',
  USER_MANAGED: 'USER_MANAGED',
} as const;

export type SubscriptionType = typeof SubscriptionType[keyof typeof SubscriptionType];

/**
 * Description of each subscription type
 */
export const SubscriptionTypeDescriptions: Record<SubscriptionType, string> = {
  PROVIDER_MANAGED: 'Provider handles auto-deduction and retries',
  USER_MANAGED: 'Application initiates charges and handles retries',
} as const;
```

### 1.3 Subscription Status Enum

```typescript
// types/subscription-status.enum.ts

/**
 * Unified subscription status across all providers
 * 
 * State transitions:
 * CREATED -> PENDING_AUTH -> AUTHENTICATED -> ACTIVE -> PAUSED -> ACTIVE
 *                      |                  |-> CANCELLED
 *                      |                  |-> EXPIRED
 *                      |-> FAILED
 *                      |-> CANCELLED
 */
export const SubscriptionStatus = {
  // Initial states
  CREATED: 'CREATED',
  PENDING_AUTH: 'PENDING_AUTH',
  
  // Active states
  AUTHENTICATED: 'AUTHENTICATED',
  ACTIVE: 'ACTIVE',
  PAUSED: 'PAUSED',
  
  // Terminal states
  CANCELLED: 'CANCELLED',
  EXPIRED: 'EXPIRED',
  FAILED: 'FAILED',
  REVOKED: 'REVOKED',
  
  // Transition states
  CANCEL_IN_PROGRESS: 'CANCEL_IN_PROGRESS',
  ACTIVATION_IN_PROGRESS: 'ACTIVATION_IN_PROGRESS',
} as const;

export type SubscriptionStatus = typeof SubscriptionStatus[keyof typeof SubscriptionStatus];

/**
 * Valid state transitions map
 */
export const ValidStateTransitions: Record<SubscriptionStatus, SubscriptionStatus[]> = {
  CREATED: ['PENDING_AUTH', 'FAILED', 'CANCELLED'],
  PENDING_AUTH: ['AUTHENTICATED', 'ACTIVE', 'FAILED', 'CANCELLED'],
  AUTHENTICATED: ['ACTIVE', 'FAILED', 'CANCELLED'],
  ACTIVE: ['PAUSED', 'CANCELLED', 'EXPIRED', 'REVOKED'],
  PAUSED: ['ACTIVE', 'CANCELLED'],
  CANCELLED: [],
  EXPIRED: ['ACTIVE'], // Can be reactivated after payment
  FAILED: ['CREATED'], // Can retry
  REVOKED: [],
  CANCEL_IN_PROGRESS: ['CANCELLED', 'ACTIVE'],
  ACTIVATION_IN_PROGRESS: ['ACTIVE', 'FAILED'],
};
```

### 1.4 Order Status Enum

```typescript
// types/order-status.enum.ts

/**
 * Order status for one-time and subscription orders
 */
export const OrderStatus = {
  CREATED: 'CREATED',
  PENDING: 'PENDING',
  AUTHORIZED: 'AUTHORIZED',
  CAPTURED: 'CAPTURED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED',
} as const;

export type OrderStatus = typeof OrderStatus[keyof typeof OrderStatus];
```

### 1.5 Billing Frequency Enum

```typescript
// types/frequency.enum.ts

/**
 * Billing frequency for subscriptions
 */
export const BillingFrequency = {
  DAILY: 'DAILY',
  WEEKLY: 'WEEKLY',
  FORTNIGHTLY: 'FORTNIGHTLY',
  MONTHLY: 'MONTHLY',
  QUARTERLY: 'QUARTERLY',
  HALF_YEARLY: 'HALF_YEARLY',
  YEARLY: 'YEARLY',
  ON_DEMAND: 'ON_DEMAND',
} as const;

export type BillingFrequency = typeof BillingFrequency[keyof typeof BillingFrequency];

/**
 * Frequency to days mapping for calculations
 */
export const FrequencyToDays: Record<BillingFrequency, number> = {
  DAILY: 1,
  WEEKLY: 7,
  FORTNIGHTLY: 14,
  MONTHLY: 30,
  QUARTERLY: 90,
  HALF_YEARLY: 180,
  YEARLY: 365,
  ON_DEMAND: 0,
};
```

---

## 2. Configuration Types

### 2.1 Provider Configuration

```typescript
// types/config.types.ts

import type { PaymentProvider } from './provider.enum';

/**
 * Base configuration for all payment providers
 */
export interface BaseProviderConfig {
  /** Unique identifier for this configuration */
  readonly configId: string;
  
  /** Payment provider */
  readonly provider: PaymentProvider;
  
  /** App ID this config belongs to */
  readonly appId: string;
  
  /** Environment */
  readonly environment: 'SANDBOX' | 'PRODUCTION';
  
  /** Whether this config is enabled */
  readonly enabled: boolean;
  
  /** Is this the default config for this app/provider combination */
  readonly isDefault: boolean;
  
  /** Webhook secret for signature verification */
  readonly webhookSecret?: string;
  
  /** Metadata for tracking */
  readonly metadata?: ProviderConfigMetadata;
}

/**
 * Metadata for provider configuration
 */
export interface ProviderConfigMetadata {
  readonly accountName?: string;
  readonly merchantName?: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly tags?: readonly string[];
}

/**
 * Razorpay-specific configuration
 */
export interface RazorpayConfig extends BaseProviderConfig {
  readonly provider: 'RAZORPAY';
  readonly keyId: string;
  readonly keySecret: string;
  readonly webhookSecret?: string;
  readonly accountId?: string;
}

/**
 * PhonePe-specific configuration
 */
export interface PhonePeConfig extends BaseProviderConfig {
  readonly provider: 'PHONEPE';
  readonly clientId: string;
  readonly clientSecret: string;
  readonly clientVersion: number;
  readonly merchantId: string;
  readonly saltKey?: string;
  readonly saltIndex?: string;
}

/**
 * Union type for all provider configs
 */
export type ProviderConfig = RazorpayConfig | PhonePeConfig;

/**
 * Configuration resolution options
 */
export interface ConfigResolutionOptions {
  /** Fallback to default config if specific config not found */
  readonly fallbackToDefault: boolean;
  
  /** Preferred environment */
  readonly preferredEnvironment?: 'SANDBOX' | 'PRODUCTION';
}
```

### 2.2 Plan Configuration

```typescript
// types/plan.types.ts

import type { PaymentProvider } from './provider.enum';
import type { BillingFrequency } from './frequency.enum';
import type { SubscriptionType } from './subscription-type.enum';

/**
 * Pricing information for a plan
 */
export interface PlanPricing {
  /** Initial/trial amount in smallest currency unit (paise) */
  readonly initialAmount: number;
  
  /** Recurring amount in smallest currency unit (paise) */
  readonly recurringAmount: number;
  
  /** Currency code (ISO 4217) */
  readonly currency: string;
  
  /** Billing frequency */
  readonly frequency: BillingFrequency;
  
  /** Number of billing cycles (null = unlimited) */
  readonly totalCycles?: number;
}

/**
 * Provider-specific plan configuration
 */
export interface ProviderPlanConfig {
  /** Provider this config belongs to */
  readonly provider: PaymentProvider;
  
  /** Provider's plan ID (e.g., Razorpay plan_id) */
  readonly providerPlanId: string;
  
  /** Subscription type for this plan */
  readonly subscriptionType: SubscriptionType;
  
  /** Provider-specific settings */
  readonly settings: RazorpayPlanSettings | PhonePePlanSettings;
}

/**
 * Razorpay-specific plan settings
 */
export interface RazorpayPlanSettings {
  readonly interval: number;
  readonly period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  readonly notes?: Record<string, string>;
}

/**
 * PhonePe-specific plan settings
 */
export interface PhonePePlanSettings {
  /** Maximum amount that can be charged (in paise) */
  readonly maxAmount: number;
  
  /** Amount type: FIXED or VARIABLE */
  readonly amountType: 'FIXED' | 'VARIABLE';
  
  /** Auth workflow: TRANSACTION or PENNY_DROP */
  readonly authWorkflowType: 'TRANSACTION' | 'PENNY_DROP';
  
  /** UPI payment mode */
  readonly upiPaymentMode: 'UPI_INTENT' | 'UPI_COLLECT';
  
  /** Product type */
  readonly productType: 'UPI_MANDATE';
}

/**
 * Unified plan definition
 */
export interface Plan {
  /** Internal plan ID */
  readonly planId: string;
  
  /** Plan name */
  readonly name: string;
  
  /** Plan description */
  readonly description: string;
  
  /** Pricing information */
  readonly pricing: PlanPricing;
  
  /** Provider configurations for this plan */
  readonly providerConfigs: readonly ProviderPlanConfig[];
  
  /** UI display configuration */
  readonly display: PlanDisplayConfig;
  
  /** Plan is active */
  readonly active: boolean;
  
  /** Plan priority for paywall rules */
  readonly priority: number;
}

/**
 * Plan display configuration for UI
 */
export interface PlanDisplayConfig {
  readonly heading: string;
  readonly description: string;
  readonly buttonText: string;
  readonly refundText: string;
  readonly videoDescription: string;
  readonly videoUrl?: string;
}
```

---

## 3. Domain Entities

### 3.1 Subscription Entity

```typescript
// domain/entities/subscription.entity.ts

import type { PaymentProvider } from '../types/provider.enum';
import type { SubscriptionType } from '../types/subscription-type.enum';
import type { SubscriptionStatus } from '../types/subscription-status.enum';
import type { BillingFrequency } from '../types/frequency.enum';
import type { PlanPricing } from '../types/plan.types';

/**
 * Provider-specific subscription data
 * Stored as JSONB in database
 */
export interface ProviderSubscriptionData {
  /** Provider's subscription ID */
  readonly subscriptionId: string;
  
  /** Provider's order ID (for setup) */
  readonly orderId?: string;
  
  /** Provider's customer ID */
  readonly customerId?: string;
  
  /** Provider's plan ID */
  readonly planId: string;
  
  /** Provider's raw subscription object */
  readonly raw?: Record<string, unknown>;
  
  /** Last sync timestamp */
  readonly lastSyncedAt: Date;
}

/**
 * Retry configuration for user-managed subscriptions
 */
export interface RetryConfig {
  /** Maximum retry attempts */
  readonly maxAttempts: number;
  
  /** Delay between retries in minutes */
  readonly retryDelayMinutes: number;
  
  /** Exponential backoff multiplier */
  readonly backoffMultiplier: number;
  
  /** Current retry count */
  readonly currentAttempt: number;
  
  /** Next retry at */
  readonly nextRetryAt?: Date;
}

/**
 * Payment failure tracking
 */
export interface PaymentFailure {
  readonly failedAt: Date;
  readonly reason: string;
  readonly errorCode?: string;
  readonly errorMessage?: string;
  readonly providerResponse?: Record<string, unknown>;
}

/**
 * Subscription aggregate root
 */
export interface Subscription {
  // Identity
  readonly id: string;
  readonly merchantSubscriptionId: string;
  
  // Ownership
  readonly userId: string;
  readonly appId: string;
  
  // Type and Provider tracking (CRITICAL)
  readonly subscriptionType: SubscriptionType;
  readonly provider: PaymentProvider;
  
  // Plan reference
  readonly planId: string;
  readonly pricing: PlanPricing;
  
  // Status
  readonly status: SubscriptionStatus;
  
  // Billing
  readonly billingCycleCount: number;
  readonly nextBillingDate: Date | null;
  readonly lastBillingDate: Date | null;
  
  // Timestamps
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly activatedAt: Date | null;
  readonly cancelledAt: Date | null;
  readonly expiredAt: Date | null;
  
  // Provider-specific data
  readonly providerData: ProviderSubscriptionData;
  
  // Retry configuration (for user-managed)
  readonly retryConfig: RetryConfig | null;
  
  // Payment failure tracking
  readonly paymentFailures: readonly PaymentFailure[];
  readonly consecutiveFailures: number;
  
  // Premium status
  readonly isPremium: boolean;
  
  // Metadata
  readonly metadata: SubscriptionMetadata;
}

/**
 * Subscription metadata
 */
export interface SubscriptionMetadata {
  readonly environment: 'SANDBOX' | 'PRODUCTION';
  readonly configId: string;
  readonly source: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly tags?: readonly string[];
}
```

### 3.2 Order Entity

```typescript
// domain/entities/order.entity.ts

import type { PaymentProvider } from '../types/provider.enum';
import type { SubscriptionType } from '../types/subscription-type.enum';
import type { OrderStatus } from '../types/order-status.enum';

/**
 * Provider-specific order data
 */
export interface ProviderOrderData {
  readonly orderId: string;
  readonly paymentId?: string;
  readonly refundId?: string;
  readonly tokenId?: string;
  readonly raw?: Record<string, unknown>;
}

/**
 * Order for tracking payments
 */
export interface Order {
  // Identity
  readonly id: string;
  readonly merchantOrderId: string;
  
  // Ownership
  readonly userId: string;
  readonly appId: string;
  
  // Type and Provider tracking (CRITICAL)
  readonly subscriptionType: SubscriptionType;
  readonly provider: PaymentProvider;
  
  // Subscription reference (if applicable)
  readonly subscriptionId?: string;
  
  // Order details
  readonly amount: number;
  readonly currency: string;
  readonly status: OrderStatus;
  
  // Timestamps
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly paidAt?: Date;
  readonly refundedAt?: Date;
  
  // Provider data
  readonly providerData: ProviderOrderData;
  
  // Metadata
  readonly metadata: OrderMetadata;
}

/**
 * Order metadata
 */
export interface OrderMetadata {
  readonly environment: 'SANDBOX' | 'PRODUCTION';
  readonly configId: string;
  readonly description?: string;
  readonly notes?: Record<string, string>;
}
```

---

## 4. Provider Interface

### 4.1 Core Provider Interface

```typescript
// providers/interfaces/subscription-provider.interface.ts

import type { PaymentProvider } from '../types/provider.enum';
import type { SubscriptionType } from '../types/subscription-type.enum';
import type {
  Subscription,
  ProviderSubscriptionData,
  SubscriptionMetadata,
} from '../domain/entities/subscription.entity';
import type { Order } from '../domain/entities/order.entity';
import type { ProviderConfig } from '../types/config.types';
import type { Plan } from '../types/plan.types';

/**
 * Result of subscription setup
 */
export interface SetupSubscriptionResult {
  readonly success: boolean;
  readonly merchantSubscriptionId: string;
  readonly merchantOrderId: string;
  readonly providerSubscriptionId?: string;
  readonly providerOrderId: string;
  readonly intentUrl?: string;
  readonly state: string;
  readonly expiresAt?: Date;
  readonly providerData: ProviderSubscriptionData;
}

/**
 * Result of subscription charge
 */
export interface ChargeSubscriptionResult {
  readonly success: boolean;
  readonly orderId: string;
  readonly providerOrderId: string;
  readonly amount: number;
  readonly currency: string;
  readonly state: string;
  readonly paidAt?: Date;
  readonly providerData: Record<string, unknown>;
}

/**
 * Result of subscription status check
 */
export interface SubscriptionStatusResult {
  readonly providerSubscriptionId: string;
  readonly status: string;
  readonly state: string;
  readonly amount?: number;
  readonly currency?: string;
  readonly nextBillingDate?: Date;
  readonly paidCount: number;
  readonly remainingCount?: number;
  readonly canCharge: boolean;
  readonly providerData: Record<string, unknown>;
}

/**
 * Webhook event parsed from provider
 */
export interface WebhookEvent {
  readonly eventId: string;
  readonly eventType: string;
  readonly provider: PaymentProvider;
  readonly subscriptionType: SubscriptionType;
  
  // Entity references
  readonly subscriptionId?: string;
  readonly orderId?: string;
  readonly paymentId?: string;
  
  // Event data
  readonly status?: string;
  readonly amount?: number;
  readonly currency?: string;
  readonly timestamp: Date;
  
  // Raw payload
  readonly rawPayload: Record<string, unknown>;
  
  // Signature verification
  readonly signatureValid: boolean;
}

/**
 * Core subscription provider interface
 * 
 * All providers must implement this interface regardless of
 * whether they support provider-managed or user-managed subscriptions.
 */
export interface SubscriptionProvider {
  // Identity
  readonly provider: PaymentProvider;
  readonly subscriptionType: SubscriptionType;
  
  // Configuration
  initialize(config: ProviderConfig): void;
  getPublicConfig(): Record<string, unknown>;
  
  // Subscription lifecycle
  setupSubscription(params: SetupSubscriptionParams): Promise<SetupSubscriptionResult>;
  activateSubscription(merchantSubscriptionId: string): Promise<SubscriptionStatusResult>;
  cancelSubscription(merchantSubscriptionId: string): Promise<void>;
  pauseSubscription(merchantSubscriptionId: string): Promise<void>;
  resumeSubscription(merchantSubscriptionId: string): Promise<void>;
  getSubscriptionStatus(merchantSubscriptionId: string): Promise<SubscriptionStatusResult>;
  
  // Charging (behavior differs by subscription type)
  chargeSubscription(params: ChargeSubscriptionParams): Promise<ChargeSubscriptionResult>;
  
  // Order management
  getOrderStatus(merchantOrderId: string): Promise<OrderStatusResult>;
  
  // Webhook handling
  parseWebhookEvent(payload: unknown, signature?: string, headers?: Record<string, string>): Promise<WebhookEvent>;
  verifyWebhookSignature(payload: unknown, signature: string): boolean;
  
  // Health check
  healthCheck(): Promise<{ healthy: boolean; message?: string }>;
}

/**
 * Parameters for setting up a subscription
 */
export interface SetupSubscriptionParams {
  readonly userId: string;
  readonly appId: string;
  readonly plan: Plan;
  readonly merchantSubscriptionId: string;
  readonly merchantOrderId: string;
  readonly customerId?: string;
  readonly customerEmail?: string;
  readonly customerPhone?: string;
  readonly metadata?: Record<string, unknown>;
  
  // Provider-specific options
  readonly providerOptions?: Record<string, unknown>;
}

/**
 * Parameters for charging a subscription
 */
export interface ChargeSubscriptionParams {
  readonly merchantSubscriptionId: string;
  readonly amount: number;
  readonly currency: string;
  readonly merchantOrderId: string;
  readonly metadata?: Record<string, unknown>;
}

/**
 * Result of order status check
 */
export interface OrderStatusResult {
  readonly merchantOrderId: string;
  readonly providerOrderId: string;
  readonly status: string;
  readonly state: string;
  readonly amount: number;
  readonly currency: string;
  readonly paidAt?: Date;
  readonly providerData: Record<string, unknown>;
}
```

### 4.2 Provider-Managed Subscription Interface

```typescript
// providers/interfaces/provider-managed.interface.ts

import type { SubscriptionProvider } from './subscription-provider.interface';

/**
 * Interface for provider-managed subscriptions
 * 
 * Provider handles:
 * - Auto-deduction on billing cycle
 * - Retry logic
 * - Failure notifications via webhooks
 */
export interface ProviderManagedSubscriptionProvider extends SubscriptionProvider {
  readonly subscriptionType: 'PROVIDER_MANAGED';
  
  /**
   * Notify provider about upcoming charge
   * (PhonePe requires this before auto-debit)
   */
  notifyCharge?(params: NotifyChargeParams): Promise<NotifyChargeResult>;
  
  /**
   * Execute charge immediately
   * (For providers that support manual trigger)
   */
  executeCharge?(params: ExecuteChargeParams): Promise<ExecuteChargeResult>;
}

/**
 * Parameters for notifying about charge
 */
export interface NotifyChargeParams {
  readonly merchantSubscriptionId: string;
  readonly amount: number;
  readonly merchantOrderId: string;
  readonly autoDebit: boolean;
  readonly metadata?: Record<string, unknown>;
}

/**
 * Result of charge notification
 */
export interface NotifyChargeResult {
  readonly success: boolean;
  readonly merchantOrderId: string;
  readonly providerOrderId: string;
  readonly state: string;
  readonly expireAt: Date;
}

/**
 * Parameters for executing charge
 */
export interface ExecuteChargeParams {
  readonly merchantSubscriptionId: string;
  readonly amount: number;
  readonly merchantOrderId: string;
  readonly metadata?: Record<string, unknown>;
}

/**
 * Result of charge execution
 */
export interface ExecuteChargeResult {
  readonly success: boolean;
  readonly merchantOrderId: string;
  readonly providerOrderId: string;
  readonly state: string;
}
```

### 4.3 User-Managed Subscription Interface

```typescript
// providers/interfaces/user-managed.interface.ts

import type { SubscriptionProvider } from './subscription-provider.interface';

/**
 * Interface for user-managed subscriptions
 * 
 * Application handles:
 * - Initiating charges on billing cycle
 * - Retry logic
 * - Grace periods
 */
export interface UserManagedSubscriptionProvider extends SubscriptionProvider {
  readonly subscriptionType: 'USER_MANAGED';
  
  /**
   * Create a charge order for the subscription
   * This is called by the application on each billing cycle
   */
  createChargeOrder(params: CreateChargeOrderParams): Promise<CreateChargeOrderResult>;
  
  /**
   * Verify payment for a charge order
   */
  verifyChargePayment(params: VerifyChargePaymentParams): Promise<VerifyChargePaymentResult>;
  
  /**
   * Refund a payment
   */
  refundPayment(params: RefundPaymentParams): Promise<RefundPaymentResult>;
}

/**
 * Parameters for creating charge order
 */
export interface CreateChargeOrderParams {
  readonly merchantOrderId: string;
  readonly amount: number;
  readonly currency: string;
  readonly customerId?: string;
  readonly customerEmail?: string;
  readonly customerPhone?: string;
  readonly callbackUrl?: string;
  readonly metadata?: Record<string, unknown>;
}

/**
 * Result of creating charge order
 */
export interface CreateChargeOrderResult {
  readonly success: boolean;
  readonly merchantOrderId: string;
  readonly providerOrderId: string;
  readonly amount: number;
  readonly currency: string;
  readonly status: string;
  readonly paymentUrl?: string;
  readonly intentUrl?: string;
  readonly expiresAt?: Date;
}

/**
 * Parameters for verifying charge payment
 */
export interface VerifyChargePaymentParams {
  readonly merchantOrderId: string;
  readonly providerPaymentId: string;
  readonly signature?: string;
}

/**
 * Result of verifying charge payment
 */
export interface VerifyChargePaymentResult {
  readonly success: boolean;
  readonly verified: boolean;
  readonly merchantOrderId: string;
  readonly providerPaymentId: string;
  readonly amount: number;
  readonly currency: string;
  readonly status: string;
  readonly paidAt?: Date;
}

/**
 * Parameters for refunding payment
 */
export interface RefundPaymentParams {
  readonly merchantOrderId: string;
  readonly providerPaymentId: string;
  readonly amount?: number; // Full refund if not specified
  readonly reason?: string;
}

/**
 * Result of refunding payment
 */
export interface RefundPaymentResult {
  readonly success: boolean;
  readonly refundId: string;
  readonly amount: number;
  readonly status: string;
}
```

---

## 5. Subscription Manager Service

### 5.1 Service Interface

```typescript
// services/interfaces/subscription-manager.interface.ts

import type { PaymentProvider } from '../../types/provider.enum';
import type { SubscriptionType } from '../../types/subscription-type.enum';
import type { Subscription, SubscriptionMetadata } from '../../domain/entities/subscription.entity';
import type { Order } from '../../domain/entities/order.entity';
import type { Plan } from '../../types/config.types';

/**
 * Parameters for creating a subscription
 */
export interface CreateSubscriptionParams {
  readonly userId: string;
  readonly appId: string;
  readonly planId: string;
  readonly subscriptionType: SubscriptionType;
  readonly provider: PaymentProvider;
  readonly configId?: string;
  readonly metadata?: Record<string, unknown>;
}

/**
 * Result of creating a subscription
 */
export interface CreateSubscriptionResult {
  readonly subscription: Subscription;
  readonly order: Order;
  readonly paymentIntent?: {
    readonly intentUrl?: string;
    readonly expiresAt?: Date;
  };
}

/**
 * Subscription manager service interface
 */
export interface SubscriptionManagerService {
  // Subscription lifecycle
  createSubscription(params: CreateSubscriptionParams): Promise<CreateSubscriptionResult>;
  cancelSubscription(subscriptionId: string, reason?: string): Promise<Subscription>;
  pauseSubscription(subscriptionId: string): Promise<Subscription>;
  resumeSubscription(subscriptionId: string): Promise<Subscription>;
  
  // Subscription queries
  getSubscription(subscriptionId: string): Promise<Subscription | null>;
  getSubscriptionByMerchantId(merchantSubscriptionId: string): Promise<Subscription | null>;
  getUserActiveSubscription(userId: string, appId: string): Promise<Subscription | null>;
  getUserSubscriptions(userId: string, appId: string): Promise<readonly Subscription[]>;
  
  // Status management
  syncSubscriptionStatus(subscriptionId: string): Promise<Subscription>;
  
  // Charging (for user-managed)
  chargeSubscription(subscriptionId: string, amount: number): Promise<Order>;
  
  // Premium status
  isUserPremium(userId: string, appId: string): Promise<boolean>;
  
  // Webhook handling
  handleWebhookEvent(event: WebhookEvent): Promise<void>;
}
```

### 5.2 Retry Strategy for User-Managed

```typescript
// services/retry-strategy.service.ts

/**
 * Retry strategy for user-managed subscription charges
 */
export interface RetryStrategy {
  /**
   * Calculate next retry time based on attempt number
   */
  calculateNextRetry(attempt: number, baseDelayMinutes: number): Date;
  
  /**
   * Determine if retry should be attempted
   */
  shouldRetry(failureCount: number, maxAttempts: number): boolean;
  
  /**
   * Get retry delay with exponential backoff
   */
  getRetryDelay(attempt: number, baseDelayMinutes: number, multiplier: number): number;
}

/**
 * Default retry strategy implementation
 */
export class DefaultRetryStrategy implements RetryStrategy {
  calculateNextRetry(attempt: number, baseDelayMinutes: number): Date {
    const delayMinutes = this.getRetryDelay(attempt, baseDelayMinutes, 2);
    return new Date(Date.now() + delayMinutes * 60 * 1000);
  }
  
  shouldRetry(failureCount: number, maxAttempts: number): boolean {
    return failureCount < maxAttempts;
  }
  
  getRetryDelay(attempt: number, baseDelayMinutes: number, multiplier: number): number {
    // Exponential backoff: baseDelay * (multiplier ^ attempt)
    return Math.min(
      baseDelayMinutes * Math.pow(multiplier, attempt),
      24 * 60 // Max 24 hours
    );
  }
}
```

---

## 6. Webhook Handling

### 6.1 Webhook Event Types

```typescript
// webhooks/event-types.ts

import type { PaymentProvider } from '../types/provider.enum';
import type { SubscriptionType } from '../types/subscription-type.enum';

/**
 * Webhook event type categories
 */
export const WebhookEventCategory = {
  SUBSCRIPTION: 'SUBSCRIPTION',
  PAYMENT: 'PAYMENT',
  ORDER: 'ORDER',
  REFUND: 'REFUND',
  TOKEN: 'TOKEN',
} as const;

export type WebhookEventCategory = typeof WebhookEventCategory[keyof typeof WebhookEventCategory];

/**
 * Standardized webhook event types
 */
export const StandardWebhookEventType = {
  // Subscription events
  SUBSCRIPTION_CREATED: 'SUBSCRIPTION_CREATED',
  SUBSCRIPTION_AUTHENTICATED: 'SUBSCRIPTION_AUTHENTICATED',
  SUBSCRIPTION_ACTIVATED: 'SUBSCRIPTION_ACTIVATED',
  SUBSCRIPTION_CHARGED: 'SUBSCRIPTION_CHARGED',
  SUBSCRIPTION_PENDING: 'SUBSCRIPTION_PENDING',
  SUBSCRIPTION_PAUSED: 'SUBSCRIPTION_PAUSED',
  SUBSCRIPTION_CANCELLED: 'SUBSCRIPTION_CANCELLED',
  SUBSCRIPTION_EXPIRED: 'SUBSCRIPTION_EXPIRED',
  SUBSCRIPTION_FAILED: 'SUBSCRIPTION_FAILED',
  SUBSCRIPTION_HALTED: 'SUBSCRIPTION_HALTED',
  
  // Payment events
  PAYMENT_AUTHORIZED: 'PAYMENT_AUTHORIZED',
  PAYMENT_CAPTURED: 'PAYMENT_CAPTURED',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  PAYMENT_REFUNDED: 'PAYMENT_REFUNDED',
  
  // Order events
  ORDER_CREATED: 'ORDER_CREATED',
  ORDER_PAID: 'ORDER_PAID',
  
  // Token events
  TOKEN_CONFIRMED: 'TOKEN_CONFIRMED',
  TOKEN_REJECTED: 'TOKEN_REJECTED',
  TOKEN_CANCELLED: 'TOKEN_CANCELLED',
  
  // Refund events
  REFUND_CREATED: 'REFUND_CREATED',
  REFUND_PROCESSED: 'REFUND_PROCESSED',
  REFUND_FAILED: 'REFUND_FAILED',
} as const;

export type StandardWebhookEventType = typeof StandardWebhookEventType[keyof typeof StandardWebhookEventType];

/**
 * Provider event type mapping
 */
export interface ProviderEventMapping {
  readonly provider: PaymentProvider;
  readonly providerEvent: string;
  readonly standardEvent: StandardWebhookEventType;
  readonly category: WebhookEventCategory;
}
```

### 6.2 Webhook Handler Interface

```typescript
// webhooks/interfaces/webhook-handler.interface.ts

import type { WebhookEvent } from '../../providers/interfaces/subscription-provider.interface';
import type { Subscription } from '../../domain/entities/subscription.entity';
import type { Order } from '../../domain/entities/order.entity';

/**
 * Result of handling a webhook event
 */
export interface WebhookHandlerResult {
  readonly handled: boolean;
  readonly subscription?: Subscription;
  readonly order?: Order;
  readonly actions: readonly WebhookAction[];
}

/**
 * Action taken by webhook handler
 */
export interface WebhookAction {
  readonly type: string;
  readonly description: string;
  readonly timestamp: Date;
  readonly data?: Record<string, unknown>;
}

/**
 * Webhook event handler interface
 */
export interface WebhookEventHandler {
  /**
   * Event types this handler can process
   */
  readonly supportedEvents: readonly string[];
  
  /**
   * Handle the webhook event
   */
  handle(event: WebhookEvent): Promise<WebhookHandlerResult>;
  
  /**
   * Check if this handler can handle the event
   */
  canHandle(event: WebhookEvent): boolean;
}

/**
 * Webhook handler registry interface
 */
export interface WebhookHandlerRegistry {
  /**
   * Register a handler for specific event types
   */
  registerHandler(handler: WebhookEventHandler): void;
  
  /**
   * Get handler for an event
   */
  getHandler(event: WebhookEvent): WebhookEventHandler | null;
  
  /**
   * Get all handlers
   */
  getAllHandlers(): readonly WebhookEventHandler[];
}
```

---

## 7. Database Schema

### 7.1 Unified Subscriptions Table

```sql
-- Unified subscriptions table
CREATE TABLE unified_subscriptions (
  -- Identity
  id VARCHAR(20) PRIMARY KEY,
  merchant_subscription_id VARCHAR(50) UNIQUE NOT NULL,
  
  -- Ownership
  user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  app_id TEXT NOT NULL,
  
  -- Type and Provider tracking (CRITICAL)
  subscription_type VARCHAR(20) NOT NULL, -- PROVIDER_MANAGED | USER_MANAGED
  provider VARCHAR(20) NOT NULL, -- RAZORPAY | PHONEPE
  
  -- Configuration reference
  config_id VARCHAR(50) NOT NULL,
  environment VARCHAR(20) NOT NULL, -- SANDBOX | PRODUCTION
  
  -- Plan reference
  plan_id VARCHAR(50) NOT NULL,
  pricing JSONB NOT NULL, -- { initialAmount, recurringAmount, currency, frequency }
  
  -- Status
  status VARCHAR(30) NOT NULL DEFAULT 'CREATED',
  
  -- Billing
  billing_cycle_count INTEGER DEFAULT 0,
  next_billing_date TIMESTAMP,
  last_billing_date TIMESTAMP,
  
  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  activated_at TIMESTAMP,
  cancelled_at TIMESTAMP,
  expired_at TIMESTAMP,
  
  -- Provider-specific data (JSONB for flexibility)
  provider_data JSONB NOT NULL,
  
  -- Retry configuration (for user-managed)
  retry_config JSONB, -- { maxAttempts, retryDelayMinutes, currentAttempt, nextRetryAt }
  
  -- Payment failure tracking
  payment_failures JSONB DEFAULT '[]',
  consecutive_failures INTEGER DEFAULT 0,
  
  -- Premium status
  is_premium BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'
);

-- Indexes
CREATE INDEX idx_subscriptions_user_app ON unified_subscriptions(user_id, app_id);
CREATE INDEX idx_subscriptions_merchant_id ON unified_subscriptions(merchant_subscription_id);
CREATE INDEX idx_subscriptions_status ON unified_subscriptions(status);
CREATE INDEX idx_subscriptions_provider_type ON unified_subscriptions(provider, subscription_type);
CREATE INDEX idx_subscriptions_next_billing ON unified_subscriptions(next_billing_date) WHERE status = 'ACTIVE';
CREATE INDEX idx_subscriptions_premium ON unified_subscriptions(user_id, app_id, is_premium);
CREATE INDEX idx_subscriptions_retry ON unified_subscriptions(next_billing_date, status) 
  WHERE subscription_type = 'USER_MANAGED' AND status IN ('ACTIVE', 'EXPIRED');
```

### 7.2 Unified Orders Table

```sql
-- Unified orders table
CREATE TABLE unified_orders (
  -- Identity
  id VARCHAR(20) PRIMARY KEY,
  merchant_order_id VARCHAR(50) UNIQUE NOT NULL,
  
  -- Ownership
  user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  app_id TEXT NOT NULL,
  
  -- Type and Provider tracking (CRITICAL)
  subscription_type VARCHAR(20) NOT NULL,
  provider VARCHAR(20) NOT NULL,
  
  -- Configuration reference
  config_id VARCHAR(50) NOT NULL,
  environment VARCHAR(20) NOT NULL,
  
  -- Subscription reference
  subscription_id VARCHAR(20) REFERENCES unified_subscriptions(id) ON DELETE SET NULL,
  
  -- Order details
  amount INTEGER NOT NULL, -- in paise
  currency VARCHAR(3) NOT NULL DEFAULT 'INR',
  status VARCHAR(20) NOT NULL DEFAULT 'CREATED',
  
  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  paid_at TIMESTAMP,
  refunded_at TIMESTAMP,
  
  -- Provider-specific data
  provider_data JSONB NOT NULL,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'
);

-- Indexes
CREATE INDEX idx_orders_user_app ON unified_orders(user_id, app_id);
CREATE INDEX idx_orders_merchant_id ON unified_orders(merchant_order_id);
CREATE INDEX idx_orders_subscription ON unified_orders(subscription_id);
CREATE INDEX idx_orders_status ON unified_orders(status);
CREATE INDEX idx_orders_provider_type ON unified_orders(provider, subscription_type);
```

### 7.3 Webhook Events Table

```sql
-- Webhook events for idempotency and audit
CREATE TABLE webhook_events (
  id SERIAL PRIMARY KEY,
  event_id VARCHAR(100) UNIQUE NOT NULL,
  provider VARCHAR(20) NOT NULL,
  event_type VARCHAR(50) NOT NULL,
  app_id TEXT,
  
  -- Entity references
  subscription_id VARCHAR(20),
  order_id VARCHAR(20),
  payment_id TEXT,
  
  -- Processing status
  processed BOOLEAN DEFAULT FALSE,
  processed_at TIMESTAMP,
  
  -- Raw payload
  raw_payload JSONB NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_webhook_events_event_id ON webhook_events(event_id);
CREATE INDEX idx_webhook_events_processed ON webhook_events(processed, created_at);
CREATE INDEX idx_webhook_events_subscription ON webhook_events(subscription_id);
```

---

## 8. File Structure

```
src/modules/payments-v2/
├── index.ts                          # Module exports
├── payments.module.ts                # NestJS module definition
├── ARCHITECTURE.md                   # This document
│
├── types/
│   ├── index.ts                      # Type exports
│   ├── provider.enum.ts              # Payment provider enum
│   ├── subscription-type.enum.ts     # Subscription type enum
│   ├── subscription-status.enum.ts   # Subscription status enum
│   ├── order-status.enum.ts          # Order status enum
│   ├── frequency.enum.ts             # Billing frequency enum
│   ├── config.types.ts               # Configuration types
│   ├── plan.types.ts                 # Plan types
│   └── webhook.types.ts              # Webhook types
│
├── domain/
│   ├── entities/
│   │   ├── subscription.entity.ts    # Subscription entity
│   │   └── order.entity.ts           # Order entity
│   ├── repositories/
│   │   ├── subscription.repository.interface.ts
│   │   ├── order.repository.interface.ts
│   │   └── index.ts
│   └── value-objects/
│       ├── money.vo.ts               # Money value object
│       └── billing-cycle.vo.ts       # Billing cycle value object
│
├── config/
│   ├── index.ts
│   ├── config-registry.ts            # Provider config registry
│   ├── config-loader.ts              # Load configs from env
│   ├── plan-registry.ts              # Plan definitions
│   └── app-payment-config.ts         # App-specific payment config
│
├── providers/
│   ├── index.ts
│   ├── interfaces/
│   │   ├── subscription-provider.interface.ts
│   │   ├── provider-managed.interface.ts
│   │   ├── user-managed.interface.ts
│   │   └── index.ts
│   ├── base/
│   │   ├── base-provider.ts          # Base provider implementation
│   │   └── provider-utils.ts         # Shared utilities
│   ├── razorpay/
│   │   ├── index.ts
│   │   ├── razorpay-provider-managed.ts
│   │   ├── razorpay-user-managed.ts
│   │   ├── razorpay-mapper.ts        # Map Razorpay types to our types
│   │   └── razorpay.types.ts         # Razorpay-specific types
│   ├── phonepe/
│   │   ├── index.ts
│   │   ├── phonepe-provider-managed.ts
│   │   ├── phonepe-user-managed.ts
│   │   ├── phonepe-mapper.ts
│   │   └── phonepe.types.ts
│   └── factory/
│       ├── provider-factory.ts       # Create provider instances
│       └── index.ts
│
├── services/
│   ├── index.ts
│   ├── interfaces/
│   │   ├── subscription-manager.interface.ts
│   │   └── index.ts
│   ├── subscription-manager.service.ts
│   ├── order-manager.service.ts
│   ├── retry-strategy.service.ts
│   ├── billing-scheduler.service.ts  # For user-managed billing
│   └── premium-status.service.ts
│
├── webhooks/
│   ├── index.ts
│   ├── webhook.controller.ts         # HTTP endpoint
│   ├── webhook.service.ts            # Webhook processing
│   ├── event-types.ts                # Event type definitions
│   ├── handlers/
│   │   ├── index.ts
│   │   ├── handler.registry.ts
│   │   ├── subscription-activated.handler.ts
│   │   ├── subscription-charged.handler.ts
│   │   ├── subscription-failed.handler.ts
│   │   ├── payment-authorized.handler.ts
│   │   ├── payment-captured.handler.ts
│   │   ├── payment-failed.handler.ts
│   │   └── base.handler.ts
│   └── mappers/
│       ├── razorpay-event.mapper.ts
│       └── phonepe-event.mapper.ts
│
├── controllers/
│   ├── index.ts
│   ├── subscription.controller.ts
│   ├── order.controller.ts
│   └── plan.controller.ts
│
├── infrastructure/
│   ├── persistence/
│   │   ├── drizzle-subscription.repository.ts
│   │   └── drizzle-order.repository.ts
│   └── queue/
│       ├── billing.queue.ts          # Queue for user-managed billing
│       └── retry.queue.ts            # Queue for retry logic
│
├── __tests__/
│   ├── unit/
│   │   ├── providers/
│   │   ├── services/
│   │   ├── webhooks/
│   │   └── config/
│   ├── integration/
│   │   ├── subscription.flow.spec.ts
│   │   └── webhook.flow.spec.ts
│   └── mocks/
│       ├── mock-razorpay-provider.ts
│       ├── mock-phonepe-provider.ts
│       └── test-data.ts
│
└── utils/
    ├── id-generator.ts
    ├── date-utils.ts
    └── validation.ts
```

---

## 9. Implementation Phases

### Phase 1: Core Types and Configuration
1. Define all enums and types
2. Implement config registry
3. Implement plan registry
4. Write unit tests for types

### Phase 2: Domain Layer
1. Define subscription and order entities
2. Define repository interfaces
3. Implement value objects
4. Write unit tests for domain

### Phase 3: Provider Layer
1. Implement base provider
2. Implement Razorpay provider-managed
3. Implement Razorpay user-managed
4. Implement PhonePe provider-managed
5. Implement PhonePe user-managed
6. Implement provider factory
7. Write unit tests for providers

### Phase 4: Service Layer
1. Implement subscription manager
2. Implement order manager
3. Implement retry strategy
4. Implement billing scheduler
5. Write unit tests for services

### Phase 5: Webhook Layer
1. Implement webhook controller
2. Implement event mappers
3. Implement event handlers
4. Write unit tests for webhooks

### Phase 6: Infrastructure
1. Implement database schema
2. Implement repositories
3. Implement queues
4. Write integration tests

### Phase 7: Integration
1. Wire up NestJS module
2. Implement controllers
3. End-to-end testing
4. Documentation

---

## 10. Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| Single unified subscriptions table | Easier querying, reporting, and migration. Provider-specific data in JSONB |
| Separate provider implementations per subscription type | Clean separation of concerns, easier testing |
| Config registry pattern | Flexible configuration, supports multiple accounts per provider per app |
| Event-driven webhook handling | Decoupled, extensible, easy to add new handlers |
| Retry strategy as separate service | Configurable, testable, can be swapped |
| Strict TypeScript typing | Type safety, better IDE support, catches errors at compile time |
| Provider mappers | Isolate provider-specific logic, easy to adapt to provider API changes |
