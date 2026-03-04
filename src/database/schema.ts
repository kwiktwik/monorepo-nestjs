import {
  pgTable,
  text,
  boolean,
  timestamp,
  index,
  serial,
  integer,
  varchar,
  jsonb,
  pgEnum,
  unique,
  bigserial,
} from 'drizzle-orm/pg-core';

// Enums
export const transactionTypeEnum = pgEnum('transaction_type', [
  'RECEIVED',
  'SENT',
  'UNKNOWN',
]);

export const orderStatusEnum = pgEnum('order_status', [
  'created',
  'authorized',
  'captured',
  'failed',
  'cancelled',
]);

export const subscriptionStatusEnum = pgEnum('subscription_status', [
  'created',
  'authenticated',
  'active',
  'pending',
  'halted',
  'cancelled',
  'completed',
  'expired',
]);

export const paymentProviderEnum = pgEnum('payment_provider', [
  'razorpay',
  'phonepe',
]);

export const notificationEventStatusEnum = pgEnum('notification_event_status', [
  'PENDING',
  'PROCESSING',
  'COMPLETED',
  'FAILED',
]);

export const phonepeSubscriptionStateEnum = pgEnum(
  'phonepe_subscription_state',
  [
    'CREATED',
    'AUTHENTICATED',
    'ACTIVE',
    'PAUSED',
    'CANCELLED',
    'COMPLETED',
    'FAILED',
  ],
);

// User table
export const user = pgTable('user', {
  id: text('id').primaryKey().notNull(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull(),
  phoneNumber: text('phoneNumber'),
  phoneNumberVerified: boolean('phoneNumberVerified'),
  image: text('image'),
  createdAt: timestamp('createdAt', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updatedAt', { withTimezone: true })
    .defaultNow()
    .notNull(),
}).enableRLS();

// Session table
export const session = pgTable(
  'session',
  {
    id: text('id').primaryKey().notNull(),
    expiresAt: timestamp('expiresAt', { withTimezone: true }).notNull(),
    token: text('token').notNull().unique(),
    createdAt: timestamp('createdAt', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull(),
    ipAddress: text('ipAddress'),
    userAgent: text('userAgent'),
    userId: text('userId')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    appId: text('appId'),
  },
  (table) => ({
    sessionUserIdIdx: index('session_userId_idx').on(table.userId),
    sessionAppIdIdx: index('session_appId_idx').on(table.appId),
  }),
).enableRLS();

// Account table
export const account = pgTable(
  'account',
  {
    id: text('id').primaryKey().notNull(),
    accountId: text('accountId').notNull(),
    providerId: text('providerId').notNull(),
    userId: text('userId')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    accessToken: text('accessToken'),
    refreshToken: text('refreshToken'),
    idToken: text('idToken'),
    accessTokenExpiresAt: timestamp('accessTokenExpiresAt', {
      withTimezone: true,
    }),
    refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt', {
      withTimezone: true,
    }),
    scope: text('scope'),
    password: text('password'),
    createdAt: timestamp('createdAt', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updatedAt', { withTimezone: true }).notNull(),
  },
  (table) => ({
    accountUserIdIdx: index('account_userId_idx').on(table.userId),
  }),
).enableRLS();

// Verification table (for OTP)
export const verification = pgTable(
  'verification',
  {
    id: text('id').primaryKey().notNull(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expiresAt', { withTimezone: true }).notNull(),
    createdAt: timestamp('createdAt', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updatedAt', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    verificationIdentifierIdx: index('verification_identifier_idx').on(
      table.identifier,
    ),
  }),
).enableRLS();

// OTP Codes table (new for this rewrite)
export const otpCodes = pgTable(
  'otp_codes',
  {
    id: serial('id').primaryKey(),
    phoneNumber: text('phone_number').notNull(),
    codeHash: text('code_hash').notNull(),
    ipAddress: text('ip_address'),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    attempts: integer('attempts').notNull().default(0),
    verified: boolean('verified').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    otpCodesPhoneCreatedIdx: index('otp_codes_phone_created_idx').on(
      table.phoneNumber,
      table.createdAt,
    ),
    otpCodesIpCreatedIdx: index('otp_codes_ip_created_idx').on(
      table.ipAddress,
      table.createdAt,
    ),
  }),
).enableRLS();

// User Metadata table
export const userMetadata = pgTable(
  'user_metadata',
  {
    id: serial('id').primaryKey(),
    userId: text('userId')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    appId: text('app_id').notNull().default('alertpay-default'),
    upiVpa: text('upi_vpa'),
    audioLanguage: text('audio_language'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    userMetadataUserIdIdx: index('user_metadata_userId_idx').on(table.userId),
    userMetadataAppIdIdx: index('user_metadata_appId_idx').on(table.appId),
    userMetadataUserIdAppIdIdx: index('user_metadata_userId_appId_idx').on(
      table.userId,
      table.appId,
    ),
    userMetadataUserIdAppIdUnique: unique(
      'user_metadata_userId_appId_unique',
    ).on(table.userId, table.appId),
  }),
).enableRLS();

// Orders table
export const orders = pgTable(
  'orders',
  {
    id: varchar('id', { length: 10 }).primaryKey(),
    razorpayOrderId: text('razorpay_order_id'),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    appId: text('app_id').notNull().default('alertpay-default'),
    customerId: text('customer_id').notNull(),
    razorpayCustomerId: text('razorpay_customer_id'),
    amount: integer('amount').notNull(),
    currency: varchar('currency', { length: 3 }).notNull().default('INR'),
    maxAmount: integer('max_amount'),
    frequency: varchar('frequency', { length: 20 }),
    status: orderStatusEnum('status').notNull().default('created'),
    razorpayPaymentId: text('razorpay_payment_id'),
    tokenId: text('token_id'),
    paymentMetadata: jsonb('payment_metadata'),
    notes: text('notes'),
    expireAt: timestamp('expire_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    ordersUserIdIdx: index('orders_userId_idx').on(table.userId),
    ordersAppIdIdx: index('orders_appId_idx').on(table.appId),
    ordersUserIdAppIdIdx: index('orders_userId_appId_idx').on(
      table.userId,
      table.appId,
    ),
  }),
).enableRLS();

// Subscriptions table
export const subscriptions = pgTable(
  'subscriptions',
  {
    id: varchar('id', { length: 10 }).primaryKey(),
    razorpaySubscriptionId: text('razorpay_subscription_id').unique(),
    razorpayPlanId: text('razorpay_plan_id').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    appId: text('app_id').notNull().default('alertpay-default'),
    customerId: text('customer_id').notNull(),
    razorpayCustomerId: text('razorpay_customer_id'),
    status: subscriptionStatusEnum('status').notNull().default('created'),
    quantity: integer('quantity').notNull().default(1),
    totalCount: integer('total_count'),
    paidCount: integer('paid_count').notNull().default(0),
    remainingCount: integer('remaining_count'),
    startAt: timestamp('start_at'),
    endAt: timestamp('end_at'),
    chargeAt: timestamp('charge_at'),
    currentStart: timestamp('current_start'),
    currentEnd: timestamp('current_end'),
    notes: jsonb('notes'),
    razorpayPaymentId: text('razorpay_payment_id'),
    fourHourEventSent: boolean('four_hour_event_sent').notNull().default(false),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    subscriptionsUserIdIdx: index('subscriptions_userId_idx').on(table.userId),
    subscriptionsAppIdIdx: index('subscriptions_appId_idx').on(table.appId),
    subscriptionsUserIdAppIdIdx: index('subscriptions_userId_appId_idx').on(
      table.userId,
      table.appId,
    ),
    subscriptionsRazorpayIdIdx: index('subscriptions_razorpay_id_idx').on(
      table.razorpaySubscriptionId,
    ),
    subscriptionsCustomerDateIdx: index('subscriptions_customer_date_idx').on(
      table.customerId,
    ),
  }),
).enableRLS();

// User Images table (for profile photos, etc.)
export const userImages = pgTable(
  'user_images',
  {
    id: serial('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    appId: text('app_id').notNull().default('alertpay-default'),
    imageUrl: text('image_url').notNull(),
    removedBgImageUrl: text('removed_bg_image_url'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    userImagesUserIdIdx: index('user_images_userId_idx').on(table.userId),
    userImagesUserIdAppIdIdx: index('user_images_userId_appId_idx').on(
      table.userId,
      table.appId,
    ),
  }),
).enableRLS();

// Quotes table (home feed content)
export const quotes = pgTable(
  'quotes',
  {
    id: bigserial({ mode: 'bigint' }).primaryKey().notNull(),
    text: text(),
    contentType: text('content_type'),
    categoryType: text('category_type'),
    slot: text(),
    url: text(),
    videoUrl: text('video_url'),
    previewImageUrl: text('preview_image_url'),
    stickerUrl: text('sticker_url'),
    nameColor: text('name_color'),
    nameOutlineColor: text('name_outline_color'),
    variantType: text('variant_type'),
    frame: integer(),
    slotRaw: text('slot_raw'),
    sourceCategory: text('source_category'),
    createdBy: text('created_by'),
    quoteCreatorId: text('quote_creator_id'),
    quoteCreatorType: text('quote_creator_type'),
    rawJson: jsonb('raw_json'),
    createdAt: timestamp('created_at', { mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  (table) => [index('idx_quotes_created_at').on(table.createdAt)],
).enableRLS();

// Play Store Ratings table
export const playStoreRatings = pgTable(
  'play_store_ratings',
  {
    id: serial('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    appId: text('app_id').notNull().default('alertpay-default'),
    rating: integer('rating').notNull(),
    review: text('review'),
    reviewTitle: text('review_title'),
    packageName: text('package_name'),
    appVersion: text('app_version'),
    deviceModel: text('device_model'),
    osVersion: text('os_version'),
    language: text('language'),
    submittedToPlayStoreAt: timestamp('submitted_to_play_store_at', {
      withTimezone: true,
    }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    playStoreRatingsUserIdIdx: index('play_store_ratings_userId_idx').on(
      table.userId,
    ),
    playStoreRatingsAppIdIdx: index('play_store_ratings_appId_idx').on(
      table.appId,
    ),
    playStoreRatingsUserIdAppIdIdx: index(
      'play_store_ratings_userId_appId_idx',
    ).on(table.userId, table.appId),
    playStoreRatingsSubmittedAtIdx: index(
      'play_store_ratings_submittedAt_idx',
    ).on(table.submittedToPlayStoreAt),
  }),
).enableRLS();

// Notification logs table
export const notificationLogs = pgTable(
  'notification_logs',
  {
    id: serial('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    notificationId: text('notification_id').notNull(),
    packageName: text('package_name').notNull(),
    appName: text('app_name'),
    timestamp: timestamp('timestamp', { withTimezone: true }).notNull(),
    title: text('title'),
    text: text('text'),
    bigText: text('big_text'),
    hasTransaction: boolean('has_transaction').notNull().default(false),
    amount: text('amount'),
    payerName: text('payer_name'),
    transactionType: transactionTypeEnum('transaction_type'),
    processingTimeMs: integer('processing_time_ms'),
    ttsAnnounced: boolean('tts_announced').default(false),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    notificationLogsUserIdIdx: index('notification_logs_userId_idx').on(
      table.userId,
    ),
    notificationLogsNotificationIdIdx: index(
      'notification_logs_notificationId_idx',
    ).on(table.notificationId),
    notificationLogsTimestampIdx: index('notification_logs_timestamp_idx').on(
      table.timestamp,
    ),
    notificationLogsTransactionTypeIdx: index(
      'notification_logs_transactionType_idx',
    ).on(table.transactionType),
  }),
).enableRLS();

// Enhanced notifications table
export const enhancedNotifications = pgTable(
  'enhanced_notifications',
  {
    id: serial('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    notificationId: text('notification_id').notNull().unique(),
    originalNotificationId: integer('original_notification_id'),
    packageName: text('package_name').notNull(),
    appName: text('app_name'),
    title: text('title'),
    content: text('content'),
    bigText: text('big_text'),
    timestamp: timestamp('timestamp', { withTimezone: true }).notNull(),
    hasTransaction: boolean('has_transaction').notNull().default(false),
    amount: text('amount'),
    payerName: text('payer_name'),
    transactionType: transactionTypeEnum('transaction_type'),
    processingTimeMs: integer('processing_time_ms'),
    processingMetadata: jsonb('processing_metadata'),
    notificationLogId: integer('notification_log_id').references(
      () => notificationLogs.id,
      { onDelete: 'set null' },
    ),
    ttsAnnounced: boolean('tts_announced').default(false),
    teamNotificationSent: boolean('team_notification_sent')
      .notNull()
      .default(false),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    enhancedNotificationsUserIdIdx: index(
      'enhanced_notifications_userId_idx',
    ).on(table.userId),
    enhancedNotificationsNotificationIdIdx: index(
      'enhanced_notifications_notificationId_idx',
    ).on(table.notificationId),
    enhancedNotificationsTimestampIdx: index(
      'enhanced_notifications_timestamp_idx',
    ).on(table.timestamp),
    enhancedNotificationsTransactionTypeIdx: index(
      'enhanced_notifications_transactionType_idx',
    ).on(table.transactionType),
    enhancedNotificationsLogIdIdx: index('enhanced_notifications_logId_idx').on(
      table.notificationLogId,
    ),
  }),
).enableRLS();

// Temp test notifications table (for E2E testing)
export const tempTestNotifications = pgTable(
  'temp_test_notifications',
  {
    id: serial('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    payload: jsonb('payload'),
    isProcessed: boolean('is_processed').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    tempTestNotificationsUserIdIdx: index(
      'temp_test_notifications_userId_idx',
    ).on(table.userId),
    tempTestNotificationsIsProcessedIdx: index(
      'temp_test_notifications_isProcessed_idx',
    ).on(table.isProcessed),
  }),
).enableRLS();

// Notification Events table (durable event bus)
export const notificationEvents = pgTable(
  'notification_events',
  {
    id: text('id').primaryKey().notNull(),
    appId: text('app_id').notNull(),
    eventName: text('event_name').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    payload: jsonb('payload').notNull(),
    status: notificationEventStatusEnum('status')
      .notNull()
      .default('PENDING'),
    retryCount: integer('retry_count').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    processedAt: timestamp('processed_at', { withTimezone: true }),
  },
  (table) => ({
    notificationEventsUserIdIdx: index('notification_events_userId_idx').on(
      table.userId,
    ),
    notificationEventsAppIdIdx: index('notification_events_appId_idx').on(
      table.appId,
    ),
    notificationEventsStatusIdx: index('notification_events_status_idx').on(
      table.status,
    ),
    notificationEventsCreatedAtIdx: index(
      'notification_events_createdAt_idx',
    ).on(table.createdAt),
  }),
).enableRLS();

// Push Tokens table for FCM push notifications
export const pushTokens = pgTable(
  'push_tokens',
  {
    id: serial('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    appId: text('app_id').notNull(),
    token: text('token').notNull(),
    deviceModel: text('device_model'),
    osVersion: text('os_version'),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    pushTokensUserIdIdx: index('push_tokens_userId_idx').on(table.userId),
    pushTokensAppIdIdx: index('push_tokens_appId_idx').on(table.appId),
    pushTokensTokenUnique: unique('push_tokens_token_unique').on(table.token),
  }),
).enableRLS();

export const phonepeOrders = pgTable(
  'phonepe_orders',
  {
    id: varchar('id', { length: 10 }).primaryKey(),
    orderId: text('order_id').notNull(),
    phonepeOrderId: text('phonepe_order_id').notNull().unique(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    appId: text('app_id').notNull().default('alertpay-default'),
    state: text('state'),
    amount: integer('amount').notNull(),
    currency: varchar('currency', { length: 3 }).notNull().default('INR'),
    expireAt: timestamp('expire_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    phonepeOrdersOrderIdIdx: index('phonepe_orders_order_id_idx').on(
      table.orderId,
    ),
    phonepeOrdersPhonepeOrderIdIdx: index(
      'phonepe_orders_phonepe_order_id_idx',
    ).on(table.phonepeOrderId),
  }),
).enableRLS();

export const phonepeSubscriptions = pgTable(
  'phonepe_subscriptions',
  {
    id: varchar('id', { length: 10 }).primaryKey(),
    merchantSubscriptionId: text('merchant_subscription_id').notNull().unique(),
    phonepeSubscriptionId: text('phonepe_subscription_id').unique(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    appId: text('app_id').notNull().default('alertpay-default'),
    amount: integer('amount'),
    amountType: varchar('amount_type', { length: 20 }),
    frequency: varchar('frequency', { length: 20 }),
    state: phonepeSubscriptionStateEnum('state'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    phonepeSubscriptionsUserIdIdx: index('phonepe_subscriptions_userId_idx').on(
      table.userId,
    ),
    phonepeSubscriptionsPhonepeIdIdx: index(
      'phonepe_subscriptions_phonepe_id_idx',
    ).on(table.phonepeSubscriptionId),
    phonepeSubscriptionsMerchantIdIdx: index(
      'phonepe_subscriptions_merchant_id_idx',
    ).on(table.merchantSubscriptionId),
  }),
).enableRLS();

export const subscriptionLogs = pgTable(
  'subscription_logs',
  {
    id: serial('id').primaryKey(),
    userId: text('user_id').references(() => user.id, {
      onDelete: 'cascade',
    }),
    appId: text('app_id').notNull().default('alertpay-default'),
    subscriptionId: text('subscription_id'),
    provider: paymentProviderEnum('provider'),
    action: text('action').notNull(),
    status: text('status'),
    metadata: jsonb('metadata'),
    errorMessage: text('error_message'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    subscriptionLogsUserIdIdx: index('subscription_logs_userId_idx').on(
      table.userId,
    ),
    subscriptionLogsAppIdIdx: index('subscription_logs_appId_idx').on(
      table.appId,
    ),
    subscriptionLogsSubIdIdx: index('subscription_logs_sub_id_idx').on(
      table.subscriptionId,
    ),
    subscriptionLogsActionIdx: index('subscription_logs_action_idx').on(
      table.action,
    ),
  }),
).enableRLS();

// Device Sessions - for Facebook Conversions API
export const deviceSessions = pgTable(
  'device_sessions',
  {
    id: serial('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    appId: text('app_id').notNull(),
    deviceModel: text('device_model'),
    osVersion: text('os_version'),
    appVersion: text('app_version'),
    platform: text('platform'),
    manufacturer: text('manufacturer'),
    brand: text('brand'),
    locale: text('locale'),
    timezone: text('timezone'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    deviceSessionsUserIdIdx: index('device_sessions_user_id_idx').on(table.userId),
    deviceSessionsAppIdIdx: index('device_sessions_app_id_idx').on(table.appId),
    deviceSessionsCreatedAtIdx: index('device_sessions_created_at_idx').on(table.createdAt),
  }),
).enableRLS();
