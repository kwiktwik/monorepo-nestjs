/**
 * Unified Payment Schema for payments-v2
 * 
 * This schema provides a unified structure for managing payments across
 * multiple providers (Razorpay, PhonePe) while tracking subscription type
 * (PROVIDER_MANAGED, USER_MANAGED).
 * 
 * Design principles:
 * - Single source of truth for subscriptions and orders
 * - Provider-agnostic core fields
 * - Provider-specific data stored in JSONB
 * - Full audit trail via timestamps and metadata
 */

import {
  pgTable,
  text,
  boolean,
  timestamp,
  index,
  varchar,
  jsonb,
  pgEnum,
  unique,
  integer,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ============================================================================
// Enums
// ============================================================================

/**
 * Payment provider enum
 */
export const paymentProviderV2Enum = pgEnum('payment_provider_v2', [
  'RAZORPAY',
  'PHONEPE',
]);

/**
 * Subscription type enum
 */
export const subscriptionTypeEnum = pgEnum('subscription_type', [
  'PROVIDER_MANAGED',
  'USER_MANAGED',
]);

/**
 * Unified subscription status enum
 */
export const subscriptionStatusV2Enum = pgEnum('subscription_status_v2', [
  'CREATED',
  'PENDING_AUTH',
  'AUTHENTICATED',
  'ACTIVATION_IN_PROGRESS',
  'ACTIVE',
  'PAUSED',
  'RETRYING',
  'CANCEL_IN_PROGRESS',
  'CANCELLED',
  'REVOKED',
  'EXPIRED',
  'FAILED',
  'COMPLETED',
]);

/**
 * Unified order status enum
 */
export const orderStatusV2Enum = pgEnum('order_status_v2', [
  'CREATED',
  'PENDING',
  'AUTHORIZED',
  'CAPTURED',
  'FAILED',
  'CANCELLED',
  'REFUNDED',
  'PARTIALLY_REFUNDED',
  'REFUND_PENDING',
  'EXPIRED',
]);

/**
 * Order type enum
 */
export const orderTypeEnum = pgEnum('order_type', [
  'ONE_TIME',
  'SUBSCRIPTION_SETUP',
  'SUBSCRIPTION_RECURRING',
  'SUBSCRIPTION_RETRY',
]);

/**
 * Payment method type enum
 */
export const paymentMethodTypeEnum = pgEnum('payment_method_type', [
  'UPI_AUTOPAY',
  'UPI_MANDATE',
  'CARD_SUBSCRIPTION',
  'ENACH',
  'PAPER_NACH',
  'UPI_QR',
  'UPI_INTENT',
  'UPI_COLLECT',
  'CARD',
  'NETBANKING',
  'WALLET',
  'EMI',
  'EDC',
  'PAYMENT_LINK',
]);

/**
 * Billing frequency enum
 */
export const billingFrequencyEnum = pgEnum('billing_frequency', [
  'DAILY',
  'WEEKLY',
  'BIWEEKLY',
  'MONTHLY',
  'QUARTERLY',
  'SEMIANNUALLY',
  'YEARLY',
  'ONDEMAND',
]);

/**
 * Webhook event status enum
 */
export const webhookEventStatusEnum = pgEnum('webhook_event_status', [
  'PENDING',
  'PROCESSING',
  'PROCESSED',
  'FAILED',
  'DUPLICATE',
]);

/**
 * Idempotency key status enum
 */
export const idempotencyKeyStatusEnum = pgEnum('idempotency_key_status', [
  'IN_PROGRESS',
  'COMPLETED',
  'FAILED',
  'EXPIRED',
]);

/**
 * Provider configuration status enum
 */
export const providerConfigStatusEnum = pgEnum('provider_config_status', [
  'ACTIVE',
  'INACTIVE',
  'SUSPENDED',
]);

// ============================================================================
// Provider Configuration Table
// ============================================================================

/**
 * Provider configurations for each app
 * 
 * Stores credentials and settings for each payment provider per app.
 */
export const providerConfigs = pgTable(
  'provider_configs',
  {
    id: text('id').primaryKey(),
    provider: paymentProviderV2Enum('provider').notNull(),
    appId: text('app_id').notNull(),
    environment: varchar('environment', { length: 20 }).notNull(),
    isEnabled: boolean('is_enabled').notNull().default(true),
    isDefault: boolean('is_default').notNull().default(false),
    status: providerConfigStatusEnum('status').notNull().default('ACTIVE'),
    
    // Provider-specific credentials (encrypted)
    credentials: jsonb('credentials').$type<Record<string, unknown>>().notNull(),
    
    // Webhook configuration
    webhookSecret: text('webhook_secret'),
    webhookUrl: text('webhook_url'),
    
    // Feature flags
    supportedPaymentMethods: jsonb('supported_payment_methods')
      .$type<string[]>()
      .notNull()
      .default([]),
    
    // Metadata
    metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}),
    
    // Timestamps
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    lastUsedAt: timestamp('last_used_at', { withTimezone: true }),
  },
  (table) => ({
    providerAppIdx: index('provider_configs_provider_app_idx').on(
      table.provider,
      table.appId,
    ),
    appIdIdx: index('provider_configs_app_id_idx').on(table.appId),
    statusIdx: index('provider_configs_status_idx').on(table.status),
    defaultIdx: index('provider_configs_default_idx').on(table.isDefault),
    uniqueProviderAppEnv: unique('provider_configs_provider_app_env_unique').on(
      table.provider,
      table.appId,
      table.environment,
    ),
  }),
);

// ============================================================================
// Plans Table
// ============================================================================

/**
 * Subscription plans
 * 
 * Defines the available subscription plans with their pricing.
 */
export const plans = pgTable(
  'plans',
  {
    id: text('id').primaryKey(),
    appId: text('app_id').notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    
    // Pricing
    initialAmount: integer('initial_amount').notNull(), // in paise
    recurringAmount: integer('recurring_amount').notNull(), // in paise
    currency: varchar('currency', { length: 3 }).notNull().default('INR'),
    
    // Billing
    frequency: billingFrequencyEnum('frequency').notNull(),
    totalCycles: integer('total_cycles'), // null = unlimited
    
    // Provider mappings
    providerPlanIds: jsonb('provider_plan_ids')
      .$type<Record<string, string>>()
      .notNull()
      .default({}),
    
    // Status
    isActive: boolean('is_active').notNull().default(true),
    
    // Metadata
    metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}),
    
    // Timestamps
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    appIdIdx: index('plans_app_id_idx').on(table.appId),
    activeIdx: index('plans_active_idx').on(table.isActive),
  }),
);

// ============================================================================
// Unified Subscriptions Table
// ============================================================================

/**
 * Unified subscriptions table
 * 
 * Single source of truth for all subscriptions across providers.
 */
export const subscriptionsV2 = pgTable(
  'subscriptions_v2',
  {
    // === Identity ===
    id: text('id').primaryKey(),
    merchantSubscriptionId: varchar('merchant_subscription_id', { length: 100 })
      .notNull()
      .unique(),
    
    // === Ownership ===
    userId: text('user_id').notNull(),
    appId: text('app_id').notNull(),
    
    // === Type and Provider (CRITICAL) ===
    subscriptionType: subscriptionTypeEnum('subscription_type').notNull(),
    provider: paymentProviderV2Enum('provider').notNull(),
    
    // === Configuration ===
    configId: text('config_id').notNull(),
    environment: varchar('environment', { length: 20 }).notNull(),
    
    // === Plan Reference ===
    planId: text('plan_id').notNull(),
    
    // === Pricing ===
    initialAmount: integer('initial_amount').notNull(),
    recurringAmount: integer('recurring_amount').notNull(),
    currency: varchar('currency', { length: 3 }).notNull().default('INR'),
    frequency: billingFrequencyEnum('frequency').notNull(),
    maxAmount: integer('max_amount'), // for variable amount subscriptions
    totalCycles: integer('total_cycles'), // null = unlimited
    
    // === Status ===
    status: subscriptionStatusV2Enum('status').notNull().default('CREATED'),
    previousStatus: subscriptionStatusV2Enum('previous_status'),
    
    // === Billing ===
    billingCycleCount: integer('billing_cycle_count').notNull().default(0),
    nextBillingDate: timestamp('next_billing_date', { withTimezone: true }),
    lastBillingDate: timestamp('last_billing_date', { withTimezone: true }),
    
    // === Timestamps ===
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    activatedAt: timestamp('activated_at', { withTimezone: true }),
    cancelledAt: timestamp('cancelled_at', { withTimezone: true }),
    expiredAt: timestamp('expired_at', { withTimezone: true }),
    
    // === Provider Data ===
    providerData: jsonb('provider_data')
      .$type<{
        subscriptionId: string;
        orderId: string | null;
        customerId: string | null;
        planId: string;
        mandateId: string | null;
        raw: Record<string, unknown>;
        lastSyncedAt: string;
      }>()
      .notNull()
      .default({
        subscriptionId: '',
        orderId: null,
        customerId: null,
        planId: '',
        mandateId: null,
        raw: {},
        lastSyncedAt: new Date().toISOString(),
      }),
    
    // === Retry Configuration (for USER_MANAGED) ===
    retryConfig: jsonb('retry_config')
      .$type<{
        maxAttempts: number;
        baseDelayMinutes: number;
        backoffMultiplier: number;
        currentAttempt: number;
        nextRetryAt: string | null;
        gracePeriodEndAt: string | null;
      } | null>(),
    
    // === Payment Failure Tracking ===
    paymentFailures: jsonb('payment_failures')
      .$type<Array<{
        failedAt: string;
        reason: string;
        errorCode: string | null;
        errorMessage: string | null;
        orderId: string | null;
      }>>()
      .notNull()
      .default([]),
    consecutiveFailures: integer('consecutive_failures').notNull().default(0),
    
    // === Premium Status ===
    isPremium: boolean('is_premium').notNull().default(false),
    
    // === Metadata ===
    metadata: jsonb('metadata')
      .$type<{
        environment: string;
        configId: string;
        source: string;
        tags: string[];
        custom: Record<string, unknown>;
      }>()
      .notNull()
      .default({
        environment: 'SANDBOX',
        configId: '',
        source: 'api',
        tags: [],
        custom: {},
      }),
  },
  (table) => ({
    userIdIdx: index('subscriptions_v2_user_id_idx').on(table.userId),
    appIdIdx: index('subscriptions_v2_app_id_idx').on(table.appId),
    providerIdx: index('subscriptions_v2_provider_idx').on(table.provider),
    statusIdx: index('subscriptions_v2_status_idx').on(table.status),
    subscriptionTypeIdx: index('subscriptions_v2_type_idx').on(table.subscriptionType),
    nextBillingIdx: index('subscriptions_v2_next_billing_idx').on(table.nextBillingDate),
    premiumIdx: index('subscriptions_v2_premium_idx').on(table.userId, table.isPremium),
    userAppIdx: index('subscriptions_v2_user_app_idx').on(table.userId, table.appId),
    merchantIdIdx: index('subscriptions_v2_merchant_id_idx').on(table.merchantSubscriptionId),
  }),
);

// ============================================================================
// Unified Orders Table
// ============================================================================

/**
 * Unified orders table
 * 
 * Single source of truth for all payment orders across providers.
 */
export const ordersV2 = pgTable(
  'orders_v2',
  {
    // === Identity ===
    id: text('id').primaryKey(),
    merchantOrderId: varchar('merchant_order_id', { length: 100 }).notNull().unique(),
    
    // === Ownership ===
    userId: text('user_id').notNull(),
    appId: text('app_id').notNull(),
    
    // === Type and Provider (CRITICAL) ===
    orderType: orderTypeEnum('order_type').notNull(),
    subscriptionType: subscriptionTypeEnum('subscription_type').notNull(),
    provider: paymentProviderV2Enum('provider').notNull(),
    
    // === Configuration ===
    configId: text('config_id').notNull(),
    environment: varchar('environment', { length: 20 }).notNull(),
    
    // === Subscription Reference ===
    subscriptionId: text('subscription_id'),
    
    // === Order Details ===
    amount: integer('amount').notNull(), // in paise
    currency: varchar('currency', { length: 3 }).notNull().default('INR'),
    status: orderStatusV2Enum('status').notNull().default('CREATED'),
    
    // === Payment Method ===
    paymentMethodType: paymentMethodTypeEnum('payment_method_type'),
    
    // === Timestamps ===
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    paidAt: timestamp('paid_at', { withTimezone: true }),
    refundedAt: timestamp('refunded_at', { withTimezone: true }),
    expiresAt: timestamp('expires_at', { withTimezone: true }),
    
    // === Provider Data ===
    providerData: jsonb('provider_data')
      .$type<{
        orderId: string;
        paymentId: string | null;
        refundId: string | null;
        tokenId: string | null;
        transactionId: string | null;
        raw: Record<string, unknown>;
        intentUrl: string | null;
      }>()
      .notNull()
      .default({
        orderId: '',
        paymentId: null,
        refundId: null,
        tokenId: null,
        transactionId: null,
        raw: {},
        intentUrl: null,
      }),
    
    // === Metadata ===
    metadata: jsonb('metadata')
      .$type<{
        environment: string;
        configId: string;
        description: string | null;
        notes: Record<string, string>;
      }>()
      .notNull()
      .default({
        environment: 'SANDBOX',
        configId: '',
        description: null,
        notes: {},
      }),
  },
  (table) => ({
    userIdIdx: index('orders_v2_user_id_idx').on(table.userId),
    appIdIdx: index('orders_v2_app_id_idx').on(table.appId),
    providerIdx: index('orders_v2_provider_idx').on(table.provider),
    statusIdx: index('orders_v2_status_idx').on(table.status),
    subscriptionIdx: index('orders_v2_subscription_idx').on(table.subscriptionId),
    orderTypeIdx: index('orders_v2_type_idx').on(table.orderType),
    userAppIdx: index('orders_v2_user_app_idx').on(table.userId, table.appId),
    merchantIdIdx: index('orders_v2_merchant_id_idx').on(table.merchantOrderId),
    createdAtIdx: index('orders_v2_created_at_idx').on(table.createdAt),
  }),
);

// ============================================================================
// Webhook Events Table
// ============================================================================

/**
 * Payment webhook events table (V2)
 * 
 * Stores all webhook events from payment providers for processing and auditing.
 * This is separate from the main webhook_events table to avoid conflicts.
 */
export const paymentWebhookEvents = pgTable(
  'payment_webhook_events',
  {
    id: text('id').primaryKey(),
    
    // === Provider ===
    provider: paymentProviderV2Enum('provider').notNull(),
    appId: text('app_id'),
    
    // === Event Identity ===
    eventId: varchar('event_id', { length: 255 }).notNull(),
    eventType: varchar('event_type', { length: 100 }).notNull(),
    normalizedEventType: varchar('normalized_event_type', { length: 100 }),
    
    // === Status ===
    status: webhookEventStatusEnum('status').notNull().default('PENDING'),
    
    // === Entity References ===
    merchantSubscriptionId: varchar('merchant_subscription_id', { length: 100 }),
    providerSubscriptionId: varchar('provider_subscription_id', { length: 100 }),
    merchantOrderId: varchar('merchant_order_id', { length: 100 }),
    providerOrderId: varchar('provider_order_id', { length: 100 }),
    paymentId: varchar('payment_id', { length: 100 }),
    
    // === Parsed Data ===
    parsedData: jsonb('parsed_data').$type<Record<string, unknown>>(),
    
    // === Raw Data ===
    rawPayload: jsonb('raw_payload').notNull(),
    rawHeaders: jsonb('raw_headers'),
    
    // === Verification ===
    signatureValid: boolean('signature_valid').notNull().default(false),
    
    // === Processing ===
    processingAttempts: integer('processing_attempts').notNull().default(0),
    lastProcessingAttemptAt: timestamp('last_processing_attempt_at', { withTimezone: true }),
    processingError: text('processing_error'),
    
    // === Timestamps ===
    eventTimestamp: timestamp('event_timestamp', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    processedAt: timestamp('processed_at', { withTimezone: true }),
  },
  (table) => ({
    providerIdx: index('payment_webhook_events_provider_idx').on(table.provider),
    appIdIdx: index('payment_webhook_events_app_id_idx').on(table.appId),
    eventIdIdx: index('payment_webhook_events_event_id_idx').on(table.eventId),
    eventTypeIdx: index('payment_webhook_events_event_type_idx').on(table.eventType),
    statusIdx: index('payment_webhook_events_status_idx').on(table.status),
    merchantSubIdx: index('payment_webhook_events_merchant_sub_idx').on(table.merchantSubscriptionId),
    merchantOrderIdx: index('payment_webhook_events_merchant_order_idx').on(table.merchantOrderId),
    createdAtIdx: index('payment_webhook_events_created_at_idx').on(table.createdAt),
    uniqueEventId: unique('payment_webhook_events_event_id_unique').on(table.provider, table.eventId),
  }),
);

// ============================================================================
// Idempotency Keys Table
// ============================================================================

/**
 * Idempotency keys table
 * 
 * Ensures exactly-once processing for operations.
 */
export const idempotencyKeys = pgTable(
  'idempotency_keys',
  {
    key: varchar('key', { length: 255 }).primaryKey(),
    
    // === Operation Info ===
    operationType: varchar('operation_type', { length: 50 }).notNull(),
    provider: paymentProviderV2Enum('provider'),
    appId: text('app_id'),
    
    // === Request Validation ===
    requestHash: varchar('request_hash', { length: 64 }).notNull(),
    
    // === Status ===
    status: idempotencyKeyStatusEnum('status').notNull().default('IN_PROGRESS'),
    
    // === Result ===
    result: jsonb('result').$type<unknown>(),
    
    // === Timestamps ===
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  },
  (table) => ({
    statusIdx: index('idempotency_keys_status_idx').on(table.status),
    expiresAtIdx: index('idempotency_keys_expires_at_idx').on(table.expiresAt),
    operationIdx: index('idempotency_keys_operation_idx').on(table.operationType),
  }),
);

// ============================================================================
// Payment Transactions Table
// ============================================================================

/**
 * Payment transactions table
 * 
 * Detailed record of each payment transaction.
 */
export const paymentTransactions = pgTable(
  'payment_transactions',
  {
    id: text('id').primaryKey(),
    
    // === References ===
    orderId: text('order_id').notNull(),
    subscriptionId: text('subscription_id'),
    
    // === Provider ===
    provider: paymentProviderV2Enum('provider').notNull(),
    
    // === Transaction Details ===
    providerTransactionId: varchar('provider_transaction_id', { length: 100 }).notNull(),
    amount: integer('amount').notNull(),
    currency: varchar('currency', { length: 3 }).notNull().default('INR'),
    
    // === Status ===
    status: varchar('status', { length: 50 }).notNull(),
    
    // === Payment Method ===
    paymentMethod: varchar('payment_method', { length: 50 }),
    paymentInstrument: jsonb('payment_instrument').$type<{
      type: 'ACCOUNT' | 'CARD' | 'WALLET' | 'UPI';
      maskedAccountNumber?: string;
      ifsc?: string;
      last4?: string;
      network?: string;
      vpa?: string;
    }>(),
    
    // === Refunds ===
    refundAmount: integer('refund_amount').default(0),
    refundId: varchar('refund_id', { length: 100 }),
    
    // === Error Info ===
    errorCode: varchar('error_code', { length: 50 }),
    errorMessage: text('error_message'),
    
    // === Provider Data ===
    providerData: jsonb('provider_data').$type<Record<string, unknown>>(),
    
    // === Timestamps ===
    transactionAt: timestamp('transaction_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    orderIdIdx: index('payment_transactions_order_id_idx').on(table.orderId),
    subscriptionIdx: index('payment_transactions_subscription_idx').on(table.subscriptionId),
    providerIdx: index('payment_transactions_provider_idx').on(table.provider),
    statusIdx: index('payment_transactions_status_idx').on(table.status),
    transactionAtIdx: index('payment_transactions_transaction_at_idx').on(table.transactionAt),
    providerTxIdIdx: index('payment_transactions_provider_tx_id_idx').on(table.providerTransactionId),
  }),
);

// ============================================================================
// Relations
// ============================================================================

/**
 * Subscription relations
 */
export const subscriptionsV2Relations = relations(subscriptionsV2, ({ many, one }) => ({
  orders: many(ordersV2),
  transactions: many(paymentTransactions),
  plan: one(plans, {
    fields: [subscriptionsV2.planId],
    references: [plans.id],
  }),
  config: one(providerConfigs, {
    fields: [subscriptionsV2.configId],
    references: [providerConfigs.id],
  }),
}));

/**
 * Order relations
 */
export const ordersV2Relations = relations(ordersV2, ({ one, many }) => ({
  subscription: one(subscriptionsV2, {
    fields: [ordersV2.subscriptionId],
    references: [subscriptionsV2.id],
  }),
  transactions: many(paymentTransactions),
  config: one(providerConfigs, {
    fields: [ordersV2.configId],
    references: [providerConfigs.id],
  }),
}));

/**
 * Plan relations
 */
export const plansRelations = relations(plans, ({ many }) => ({
  subscriptions: many(subscriptionsV2),
}));

/**
 * Transaction relations
 */
export const paymentTransactionsRelations = relations(paymentTransactions, ({ one }) => ({
  order: one(ordersV2, {
    fields: [paymentTransactions.orderId],
    references: [ordersV2.id],
  }),
  subscription: one(subscriptionsV2, {
    fields: [paymentTransactions.subscriptionId],
    references: [subscriptionsV2.id],
  }),
}));

/**
 * Provider config relations
 */
export const providerConfigsRelations = relations(providerConfigs, ({ many }) => ({
  subscriptions: many(subscriptionsV2),
  orders: many(ordersV2),
}));

// ============================================================================
// Type Exports
// ============================================================================

export type ProviderConfig = typeof providerConfigs.$inferSelect;
export type NewProviderConfig = typeof providerConfigs.$inferInsert;

export type Plan = typeof plans.$inferSelect;
export type NewPlan = typeof plans.$inferInsert;

export type SubscriptionV2 = typeof subscriptionsV2.$inferSelect;
export type NewSubscriptionV2 = typeof subscriptionsV2.$inferInsert;

export type OrderV2 = typeof ordersV2.$inferSelect;
export type NewOrderV2 = typeof ordersV2.$inferInsert;

export type PaymentWebhookEvent = typeof paymentWebhookEvents.$inferSelect;
export type NewPaymentWebhookEvent = typeof paymentWebhookEvents.$inferInsert;

export type IdempotencyKey = typeof idempotencyKeys.$inferSelect;
export type NewIdempotencyKey = typeof idempotencyKeys.$inferInsert;

export type PaymentTransaction = typeof paymentTransactions.$inferSelect;
export type NewPaymentTransaction = typeof paymentTransactions.$inferInsert;
