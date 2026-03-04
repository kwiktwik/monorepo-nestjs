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
} from "drizzle-orm/pg-core";

export const transactionTypeEnum = pgEnum("transaction_type", [
  "RECEIVED",
  "SENT",
  "UNKNOWN",
]);

// Original notifications table - UNCHANGED
export const notifications = pgTable(
  "notifications",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    canReply: boolean("can_reply").notNull().default(false),
    packageName: text("package_name").notNull(),
    title: text("title").notNull(),
    content: text("content"),
    hasRemoved: boolean("has_removed").notNull().default(false),
    haveExtraPicture: boolean("have_extra_picture").notNull().default(false),
    onGoing: boolean("on_going").notNull().default(false),
    metadata: jsonb("metadata"), // stores { amount, from, isValid }
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    notificationsUserIdIdx: index("notifications_userId_idx").on(table.userId),
  })
);

/* =========================
   ENHANCED NOTIFICATIONS
   New table for enhanced notification processing
========================= */
export const enhancedNotifications = pgTable(
  "enhanced_notifications",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    notificationId: text("notification_id").notNull().unique(), // Unique identifier
    originalNotificationId: integer("original_notification_id").references(() => notifications.id), // Link to original
    packageName: text("package_name").notNull(),
    appName: text("app_name").notNull(), // Clean app name
    title: text("title").notNull(),
    content: text("content"),
    bigText: text("big_text"),
    timestamp: timestamp("timestamp", { withTimezone: true }).notNull(),

    // Transaction details
    hasTransaction: boolean("has_transaction").notNull().default(false),
    amount: text("amount"),
    payerName: text("payer_name"),
    transactionType: transactionTypeEnum("transaction_type"),

    // Processing metadata
    processingTimeMs: integer("processing_time_ms"),
    processingMetadata: jsonb("processing_metadata"),

    // Notification log reference
    notificationLogId: integer("notification_log_id"),

    // Flags
    ttsAnnounced: boolean("tts_announced").notNull().default(false),
    teamNotificationSent: boolean("team_notification_sent").notNull().default(false),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    enhancedNotificationsUserIdIdx: index("enhanced_notifications_userId_idx").on(table.userId),
    enhancedNotificationsNotificationIdIdx: index("enhanced_notifications_notificationId_idx").on(table.notificationId),
    enhancedNotificationsTimestampIdx: index("enhanced_notifications_timestamp_idx").on(table.timestamp),
    enhancedNotificationsTransactionTypeIdx: index("enhanced_notifications_transactionType_idx").on(table.transactionType),
    enhancedNotificationsLogIdIdx: index("enhanced_notifications_logId_idx").on(table.notificationLogId),
  })
);

export const orderStatusEnum = pgEnum("order_status", [
  "created",
  "authorized",
  "captured",
  "failed",
  "cancelled",
]);

export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "created",
  "authenticated",
  "active",
  "pending",
  "halted",
  "cancelled",
  "completed",
  "expired",
]);

export const paymentProviderEnum = pgEnum("payment_provider", [
  "razorpay",
  "phonepe",
]);

export const phonepeSubscriptionStateEnum = pgEnum(
  "phonepe_subscription_state",
  [
    "CREATED",
    "AUTHENTICATED",
    "ACTIVE",
    "PAUSED",
    "CANCELLED",
    "COMPLETED",
    "FAILED",
  ]
);

export const orders = pgTable(
  "orders",
  {
    id: varchar("id", { length: 10 }).primaryKey(), // 8-char nanoid
    razorpayOrderId: text("razorpay_order_id"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    appId: text("app_id").notNull().default("alertpay-default"), // App identifier for multi-app support
    customerId: text("customer_id").notNull(),
    razorpayCustomerId: text("razorpay_customer_id"),
    amount: integer("amount").notNull(), // in paise
    currency: varchar("currency", { length: 3 }).notNull().default("INR"),
    maxAmount: integer("max_amount"),
    frequency: varchar("frequency", { length: 20 }),
    status: orderStatusEnum("status").notNull().default("created"),
    razorpayPaymentId: text("razorpay_payment_id"),
    tokenId: text("token_id"),
    paymentMetadata: jsonb("payment_metadata"),
    notes: text("notes"),
    expireAt: timestamp("expire_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    ordersUserIdIdx: index("orders_userId_idx").on(table.userId),
    ordersAppIdIdx: index("orders_appId_idx").on(table.appId),
    ordersUserIdAppIdIdx: index("orders_userId_appId_idx").on(table.userId, table.appId),
  })
);

export const phonepeOrders = pgTable(
  "phonepe_orders",
  {
    id: serial("id").primaryKey(),
    orderId: varchar("order_id", { length: 10 })
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    phonepeOrderId: text("phonepe_order_id").notNull().unique(), // ID returned by PhonePe (if any) or same as merchantOrderId
    state: text("state"), // PhonePe specific state
    responseCode: text("response_code"),
    paymentInstrument: jsonb("payment_instrument"),
    redirectUrl: text("redirect_url"), // URL to redirect user to
    merchantUserId: text("merchant_user_id"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    phonepeOrdersOrderIdIdx: index("phonepe_orders_order_id_idx").on(table.orderId),
    phonepeOrdersPhonepeOrderIdIdx: index("phonepe_orders_phonepe_order_id_idx").on(table.phonepeOrderId),
  })
);

export const subscriptions = pgTable(
  "subscriptions",
  {
    id: varchar("id", { length: 10 }).primaryKey(), // 8-char nanoid
    razorpaySubscriptionId: text("razorpay_subscription_id").unique(),
    razorpayPlanId: text("razorpay_plan_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    appId: text("app_id").notNull().default("alertpay-default"), // App identifier for multi-app support
    customerId: text("customer_id").notNull(),
    razorpayCustomerId: text("razorpay_customer_id"),
    status: subscriptionStatusEnum("status").notNull().default("created"),
    quantity: integer("quantity").notNull().default(1),
    totalCount: integer("total_count"), // total billing cycles
    paidCount: integer("paid_count").notNull().default(0), // completed billing cycles
    remainingCount: integer("remaining_count"), // remaining cycles
    startAt: timestamp("start_at"),
    endAt: timestamp("end_at"),
    chargeAt: timestamp("charge_at"), // next charge timestamp
    currentStart: timestamp("current_start"), // current period start
    currentEnd: timestamp("current_end"), // current period end
    notes: jsonb("notes"), // additional metadata
    fourHourEventSent: boolean("four_hour_event_sent").notNull().default(false), // tracks if app_not_cancel_in_4_hour event was sent
    metadata: jsonb("metadata"), // additional metadata
    createdAt: timestamp("created_at").defaultNow().notNull(),
    razorpayPaymentId: text("razorpay_payment_id"),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    subscriptionsUserIdIdx: index("subscriptions_userId_idx").on(table.userId),
    subscriptionsAppIdIdx: index("subscriptions_appId_idx").on(table.appId),
    subscriptionsUserIdAppIdIdx: index("subscriptions_userId_appId_idx").on(table.userId, table.appId),
    subscriptionsRazorpayIdIdx: index("subscriptions_razorpay_id_idx").on(
      table.razorpaySubscriptionId
    ),
    subscriptionsCustomerDateIdx: index("subscriptions_customer_date_idx").on(
      table.customerId
    ),
  })
);

export const phonepeSubscriptions = pgTable(
  "phonepe_subscriptions",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    appId: text("app_id").notNull(), // App identifier for multi-app support
    phonepeSubscriptionId: text("phonepe_subscription_id").unique(),
    merchantSubscriptionId: text("merchant_subscription_id").unique().notNull(), // Our unique ID for the sub
    state: phonepeSubscriptionStateEnum("state"),
    authRequestId: text("auth_request_id"),
    amountType: text("amount_type"), // FIXED / VARIABLE
    amount: integer("amount"), // Amount in paise
    frequency: text("frequency"), // DAILY, WEEKLY, MONTHLY, ON_DEMAND
    recurringCount: integer("recurring_count"),
    mobileNumber: text("mobile_number"),

    // Billing Cycle / Validity
    startDate: timestamp("start_date"),
    endDate: timestamp("end_date"),
    nextChargeDate: timestamp("next_charge_date"),
    metadata: jsonb("metadata"), // additional metadata

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    phonepeSubscriptionsUserIdIdx: index("phonepe_subscriptions_userId_idx").on(table.userId),
    phonepeSubscriptionsPhonepeIdIdx: index("phonepe_subscriptions_phonepe_id_idx").on(table.phonepeSubscriptionId),
    phonepeSubscriptionsMerchantIdIdx: index("phonepe_subscriptions_merchant_id_idx").on(table.merchantSubscriptionId),
  })
);

/* =========================
   SUBSCRIPTION LOGS
   Detailed tracking of subscription events and webhooks
========================= */
export const subscriptionLogs = pgTable(
  "subscription_logs",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id")
      .references(() => user.id, { onDelete: "cascade" }),
    appId: text("app_id").notNull().default("alertpay-default"), // App identifier
    subscriptionId: text("subscription_id"), // The ID from subscriptions or phonepeSubscriptions
    provider: paymentProviderEnum("provider"), // "razorpay" or "phonepe"
    action: text("action").notNull(), // e.g., "created", "webhook_received", "charged", "failed"
    status: text("status"), // Status at the time of log
    metadata: jsonb("metadata"), // Full payload (webhook body or internal data)
    errorMessage: text("error_message"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    subscriptionLogsUserIdIdx: index("subscription_logs_userId_idx").on(table.userId),
    subscriptionLogsAppIdIdx: index("subscription_logs_appId_idx").on(table.appId),
    subscriptionLogsSubIdIdx: index("subscription_logs_sub_id_idx").on(table.subscriptionId),
    subscriptionLogsActionIdx: index("subscription_logs_action_idx").on(table.action),
  })
);

export const user = pgTable("user", {
  id: text("id").primaryKey().notNull(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull(),
  phoneNumber: text("phoneNumber"),
  phoneNumberVerified: boolean("phoneNumberVerified"),
  image: text("image"),
  createdAt: timestamp("createdAt", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/* =========================
   SESSION
========================= */
export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey().notNull(),
    expiresAt: timestamp("expiresAt", { withTimezone: true }).notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("createdAt", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updatedAt", { withTimezone: true }).notNull(),
    ipAddress: text("ipAddress"),
    userAgent: text("userAgent"),
    userId: text("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    appId: text("appId"), // App identifier for multi-app support
  },
  (table) => [{
    sessionUserIdIdx: index("session_userId_idx").on(table.userId),
    sessionAppIdIdx: index("session_appId_idx").on(table.appId),
  }]
);

/* =========================
   ACCOUNT
========================= */
export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey().notNull(),
    accountId: text("accountId").notNull(),
    providerId: text("providerId").notNull(),
    userId: text("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("accessToken"),
    refreshToken: text("refreshToken"),
    idToken: text("idToken"),
    accessTokenExpiresAt: timestamp("accessTokenExpiresAt", {
      withTimezone: true,
    }),
    refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt", {
      withTimezone: true,
    }),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("createdAt", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updatedAt", { withTimezone: true }).notNull(),
  },
  (table) => [{
    accountUserIdIdx: index("account_userId_idx").on(table.userId),
  }]
);

/* =========================
   VERIFICATION
========================= */
export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey().notNull(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expiresAt", { withTimezone: true }).notNull(),
    createdAt: timestamp("createdAt", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updatedAt", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [{
    verificationIdentifierIdx: index("verification_identifier_idx").on(
      table.identifier
    ),
  }]
);

/* =========================
   JWKS (JSON Web Key Set)
   Required by Better Auth JWT plugin
========================= */
export const jwks = pgTable("jwks", {
  id: text("id").primaryKey().notNull(),
  publicKey: text("publicKey").notNull(),
  privateKey: text("privateKey").notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true })
    .defaultNow()
    .notNull(),
  expiresAt: timestamp("expiresAt", { withTimezone: true }),
});

/* =========================
   USER METADATA
   Stores user metadata like UPI VPA, audio language, etc.
   One record per user per app - can be extended with more columns as needed
========================= */
export const userMetadata = pgTable(
  "user_metadata",
  {
    id: serial("id").primaryKey(),
    userId: text("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    appId: text("app_id").notNull().default("alertpay-default"), // App identifier for multi-app support
    upiVpa: text("upi_vpa"), // UPI Virtual Payment Address (e.g., "user@paytm")
    audioLanguage: text("audio_language"), // Audio language preference (e.g., "en", "hi")
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    userMetadataUserIdIdx: index("user_metadata_userId_idx").on(table.userId),
    userMetadataAppIdIdx: index("user_metadata_appId_idx").on(table.appId),
    userMetadataUserIdAppIdIdx: index("user_metadata_userId_appId_idx").on(table.userId, table.appId),
    // Unique constraint: one metadata record per user per app
    userMetadataUserIdAppIdUnique: unique("user_metadata_userId_appId_unique").on(table.userId, table.appId),
  })
);

/* =========================
   USER IMAGES
   Stores user images with app-specific support
========================= */
export const userImages = pgTable(
  "user_images",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    appId: text("app_id").notNull().default("alertpay-default"),
    imageUrl: text("image_url").notNull(), // Full URL to the image
    removedBgImageUrl: text("removed_bg_image_url"), // URL to the background removed image
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [{
    userImagesUserIdIdx: index("user_images_userId_idx").on(table.userId),
    userImagesUserIdAppIdIdx: index("user_images_userId_appId_idx").on(table.userId, table.appId),
  }]
);

/* =========================
   PLAY STORE RATINGS
   Stores user ratings and reviews from Play Store
========================= */
export const playStoreRatings = pgTable(
  "play_store_ratings",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    appId: text("app_id").notNull().default("alertpay-default"), // App identifier for multi-app support
    rating: integer("rating").notNull(), // Rating from 1 to 5
    review: text("review"), // Optional review text
    reviewTitle: text("review_title"), // Optional review title
    packageName: text("package_name"), // Optional package name (e.g., com.example.app)
    appVersion: text("app_version"), // App version when rating was submitted (e.g., 1.2.3)
    deviceModel: text("device_model"), // Device model (e.g., Pixel 7, SM-G998B)
    osVersion: text("os_version"), // Android OS version (e.g., 14, 13)
    language: text("language"), // Review language/locale (e.g., en-US)
    submittedToPlayStoreAt: timestamp("submitted_to_play_store_at", {
      withTimezone: true,
    }), // When this rating was submitted to Play Store; null = not submitted
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    playStoreRatingsUserIdIdx: index("play_store_ratings_userId_idx").on(table.userId),
    playStoreRatingsAppIdIdx: index("play_store_ratings_appId_idx").on(table.appId),
    playStoreRatingsUserIdAppIdIdx: index("play_store_ratings_userId_appId_idx").on(table.userId, table.appId),
    playStoreRatingsSubmittedAtIdx: index("play_store_ratings_submittedAt_idx").on(table.submittedToPlayStoreAt),
  })
);

/* =========================
   NOTIFICATION LOGS
   Detailed tracking of all processed notifications
========================= */
export const notificationLogs = pgTable(
  "notification_logs",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    notificationId: text("notification_id").notNull(), // Unique identifier from client
    packageName: text("package_name").notNull(),
    appName: text("app_name").notNull(), // Clean, user-friendly app name
    timestamp: timestamp("timestamp", { withTimezone: true }).notNull(), // Original notification timestamp
    title: text("title").notNull(),
    text: text("text"),
    bigText: text("big_text"),
    hasTransaction: boolean("has_transaction").notNull().default(false),
    amount: text("amount"), // Transaction amount as string
    payerName: text("payer_name"), // Extracted payer name
    transactionType: transactionTypeEnum("transaction_type"), // RECEIVED/SENT/UNKNOWN
    processingTimeMs: integer("processing_time_ms"), // Time taken to process
    ttsAnnounced: boolean("tts_announced").notNull().default(false), // Whether TTS was triggered
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    notificationLogsUserIdIdx: index("notification_logs_userId_idx").on(table.userId),
    notificationLogsNotificationIdIdx: index("notification_logs_notificationId_idx").on(table.notificationId),
    notificationLogsTimestampIdx: index("notification_logs_timestamp_idx").on(table.timestamp),
    notificationLogsTransactionTypeIdx: index("notification_logs_transactionType_idx").on(table.transactionType),
  })
);

/* =========================
   TEAM NOTIFICATIONS
   Tracking of notifications sent to team members
========================= */
export const teamNotificationStatusEnum = pgEnum("team_notification_status", [
  "SUCCESS",
  "FAILED",
]);

export const teamNotifications = pgTable(
  "team_notifications",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    notificationLogId: integer("notification_log_id")
      .notNull()
      .references(() => notificationLogs.id, { onDelete: "cascade" }),
    transactionKey: text("transaction_key").notNull(), // Unique key to prevent duplicates
    sentAt: timestamp("sent_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    recipientCount: integer("recipient_count").notNull().default(0),
    status: teamNotificationStatusEnum("status").notNull().default("SUCCESS"),
    errorMessage: text("error_message"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    teamNotificationsUserIdIdx: index("team_notifications_userId_idx").on(table.userId),
    teamNotificationsLogIdIdx: index("team_notifications_logId_idx").on(table.notificationLogId),
    teamNotificationsTransactionKeyIdx: index("team_notifications_transactionKey_idx").on(table.transactionKey),
    teamNotificationsTransactionKeyUnique: unique("team_notifications_transactionKey_unique").on(table.transactionKey),
  })
);

/* =========================
   TEMP TEST NOTIFICATIONS
   For E2E testing via Polling
========================= */
export const tempTestNotifications = pgTable(
  "temp_test_notifications",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(), // Loose reference to allow flexibility in testing
    payload: jsonb("payload").notNull(), // Stores the notification data
    isProcessed: boolean("is_processed").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    tempTestUserIdIdx: index("temp_test_notifications_userId_idx").on(table.userId),
    tempTestProcessedIdx: index("temp_test_notifications_processed_idx").on(table.isProcessed),
  })
);

/* =========================
   PUSH TOKENS
   Stores device tokens for FMC push notifications
   Supports multiple apps per user
========================= */
export const pushTokens = pgTable(
  "push_tokens",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    appId: text("app_id").notNull(), // App identifier
    token: text("token").notNull(), // FCM Device Token
    deviceModel: text("device_model"),
    osVersion: text("os_version"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    pushTokensUserIdIdx: index("push_tokens_userId_idx").on(table.userId),
    pushTokensAppIdIdx: index("push_tokens_appId_idx").on(table.appId),
    pushTokensTokenUnique: unique("push_tokens_token_unique").on(table.token),
  })
);

/* =========================
   DEVICE SESSIONS
   Stores device information for Facebook Conversions API
   Tracks device changes per user for accurate ad attribution
   Keeps history forever, only creates new record when device changes
========================= */
export const deviceSessions = pgTable(
  "device_sessions",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    appId: text("app_id").notNull(),
    deviceModel: text("device_model"), // e.g., "SM-G991B"
    osVersion: text("os_version"), // e.g., "13"
    appVersion: text("app_version"), // e.g., "1.0.0"
    platform: text("platform"), // "android" or "ios"
    manufacturer: text("manufacturer"), // e.g., "samsung"
    brand: text("brand"), // e.g., "samsung"
    locale: text("locale"), // e.g., "en_IN"
    timezone: text("timezone"), // e.g., "Asia/Kolkata"
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    deviceSessionsUserIdIdx: index("device_sessions_userId_idx").on(table.userId),
    deviceSessionsAppIdIdx: index("device_sessions_appId_idx").on(table.appId),
    deviceSessionsCreatedAtIdx: index("device_sessions_created_at_idx").on(table.createdAt),
  })
);

/* =========================
   ABANDONED CHECKOUTS
   Tracks subscription checkout attempts to determine discount eligibility
   Users get discount plan if they abandoned checkout 30+ mins ago
   Discount offer expires after 24 hours (regardless of purchase)
   Supports up to 3 discount notifications at scheduled times
========================= */
export const abandonedCheckouts = pgTable(
  "abandoned_checkouts",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    appId: text("app_id").notNull(), // App identifier for multi-app support
    checkoutStartedAt: timestamp("checkout_started_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    offerExpiresAt: timestamp("offer_expires_at", { withTimezone: true }), // When discount offer expires (24hrs from eligibility)
    discountNotificationSent: boolean("discount_notification_sent").notNull().default(false), // Legacy - for backward compatibility
    discountNotificationSentAt: timestamp("discount_notification_sent_at", { withTimezone: true }), // Legacy - when notification was sent
    notificationsSent: integer("notifications_sent").notNull().default(0), // Count: 0, 1, 2, 3
    lastNotificationSentAt: timestamp("last_notification_sent_at", { withTimezone: true }), // When was last notification sent
    nextNotificationScheduledAt: timestamp("next_notification_scheduled_at", { withTimezone: true }), // When to send next notification
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    abandonedCheckoutsUserIdIdx: index("abandoned_checkouts_userId_idx").on(table.userId),
    abandonedCheckoutsAppIdIdx: index("abandoned_checkouts_appId_idx").on(table.appId),
    abandonedCheckoutsUserAppIdx: index("abandoned_checkouts_user_app_idx").on(table.userId, table.appId),
    abandonedCheckoutsTimeIdx: index("abandoned_checkouts_time_idx").on(table.checkoutStartedAt),
    abandonedCheckoutsExpiryIdx: index("abandoned_checkouts_expiry_idx").on(table.offerExpiresAt),
    abandonedCheckoutsNextNotifIdx: index("abandoned_checkouts_next_notif_idx").on(table.nextNotificationScheduledAt),
  })
);
