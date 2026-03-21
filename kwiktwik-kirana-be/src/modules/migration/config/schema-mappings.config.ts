/**
 * Schema Field Mappings
 *
 * Defines the mapping between kirana-fe (old) and kwiktwik-kirana-be (new) schemas
 * Handles field name conversions and data transformations
 */

export interface FieldMapping {
  newField: string;
  oldFields: string[]; // Priority order: first match wins
  transform?: (value: any) => any;
  defaultValue?: any;
  isDate?: boolean;
}

export interface TableMapping {
  tableName: string;
  fields: FieldMapping[];
  requiredFields: string[];
  idGenerator?: (oldId: string) => string;
}

/**
 * Subscriptions table mapping
 */
export const SUBSCRIPTIONS_MAPPING: TableMapping = {
  tableName: 'subscriptions',
  requiredFields: ['id', 'userId', 'razorpayPlanId', 'status'],
  fields: [
    { newField: 'id', oldFields: ['id'], defaultValue: null },
    {
      newField: 'userId',
      oldFields: ['userId', 'user_id'],
      defaultValue: null,
    },
    {
      newField: 'razorpaySubscriptionId',
      oldFields: ['razorpaySubscriptionId', 'razorpay_subscription_id'],
      defaultValue: null,
    },
    {
      newField: 'razorpayPlanId',
      oldFields: ['razorpayPlanId', 'razorpay_plan_id'],
      defaultValue: null,
    },
    {
      newField: 'appId',
      oldFields: ['appId', 'app_id'],
      defaultValue: 'com.kiranaapps.app',
    },
    {
      newField: 'customerId',
      oldFields: ['customerId', 'customer_id'],
      defaultValue: null,
    },
    {
      newField: 'razorpayCustomerId',
      oldFields: ['razorpayCustomerId', 'razorpay_customer_id'],
      defaultValue: null,
    },
    { newField: 'status', oldFields: ['status'], defaultValue: 'created' },
    {
      newField: 'quantity',
      oldFields: ['quantity'],
      defaultValue: 1,
      transform: (value) => {
        if (typeof value === 'string') return parseInt(value, 10) || 1;
        if (typeof value === 'number') return Math.floor(value);
        return 1;
      },
    },
    {
      newField: 'totalCount',
      oldFields: ['totalCount', 'total_count'],
      defaultValue: null,
      transform: (value) => {
        if (value === null || value === undefined) return null;
        if (typeof value === 'string') return parseInt(value, 10) || null;
        if (typeof value === 'number') return Math.floor(value);
        return null;
      },
    },
    {
      newField: 'paidCount',
      oldFields: ['paidCount', 'paid_count'],
      defaultValue: 0,
      transform: (value) => {
        if (typeof value === 'string') return parseInt(value, 10) || 0;
        if (typeof value === 'number') return Math.floor(value);
        return 0;
      },
    },
    {
      newField: 'remainingCount',
      oldFields: ['remainingCount', 'remaining_count'],
      defaultValue: null,
      transform: (value) => {
        if (value === null || value === undefined) return null;
        if (typeof value === 'string') return parseInt(value, 10) || null;
        if (typeof value === 'number') return Math.floor(value);
        return null;
      },
    },
    {
      newField: 'startAt',
      oldFields: ['startAt', 'start_at'],
      isDate: true,
      defaultValue: null,
    },
    {
      newField: 'endAt',
      oldFields: ['endAt', 'end_at'],
      isDate: true,
      defaultValue: null,
    },
    {
      newField: 'chargeAt',
      oldFields: ['chargeAt', 'charge_at'],
      isDate: true,
      defaultValue: null,
    },
    {
      newField: 'currentStart',
      oldFields: ['currentStart', 'current_start'],
      isDate: true,
      defaultValue: null,
    },
    {
      newField: 'currentEnd',
      oldFields: ['currentEnd', 'current_end'],
      isDate: true,
      defaultValue: null,
    },
    { newField: 'notes', oldFields: ['notes'], defaultValue: null },
    {
      newField: 'razorpayPaymentId',
      oldFields: ['razorpayPaymentId', 'razorpay_payment_id'],
      defaultValue: null,
    },
    {
      newField: 'fourHourEventSent',
      oldFields: ['fourHourEventSent', 'four_hour_event_sent'],
      defaultValue: false,
    },
    { newField: 'metadata', oldFields: ['metadata'], defaultValue: null },
    {
      newField: 'createdAt',
      oldFields: ['createdAt', 'created_at'],
      isDate: true,
      defaultValue: () => new Date(),
    },
    {
      newField: 'updatedAt',
      oldFields: ['updatedAt', 'updated_at'],
      isDate: true,
      defaultValue: () => new Date(),
    },
  ],
};

/**
 * Orders table mapping
 */
export const ORDERS_MAPPING: TableMapping = {
  tableName: 'orders',
  requiredFields: ['id', 'userId', 'amount', 'currency'],
  fields: [
    { newField: 'id', oldFields: ['id'], defaultValue: null },
    {
      newField: 'userId',
      oldFields: ['userId', 'user_id'],
      defaultValue: null,
    },
    {
      newField: 'razorpayOrderId',
      oldFields: ['razorpayOrderId', 'razorpay_order_id'],
      defaultValue: null,
    },
    {
      newField: 'appId',
      oldFields: ['appId', 'app_id'],
      defaultValue: 'com.kiranaapps.app',
    },
    {
      newField: 'customerId',
      oldFields: ['customerId', 'customer_id'],
      defaultValue: null,
    },
    {
      newField: 'razorpayCustomerId',
      oldFields: ['razorpayCustomerId', 'razorpay_customer_id'],
      defaultValue: null,
    },
    {
      newField: 'amount',
      oldFields: ['amount'],
      defaultValue: 0,
      transform: (value) => {
        if (typeof value === 'string') {
          const parsed = parseInt(value, 10);
          return isNaN(parsed) ? 0 : parsed;
        }
        if (typeof value === 'number') {
          return Math.floor(value);
        }
        return 0;
      },
    },
    { newField: 'currency', oldFields: ['currency'], defaultValue: 'INR' },
    {
      newField: 'maxAmount',
      oldFields: ['maxAmount', 'max_amount'],
      defaultValue: null,
      transform: (value) => {
        if (value === null || value === undefined) return null;
        if (typeof value === 'string') {
          const parsed = parseInt(value, 10);
          return isNaN(parsed) ? null : parsed;
        }
        if (typeof value === 'number') return Math.floor(value);
        return null;
      },
    },
    { newField: 'frequency', oldFields: ['frequency'], defaultValue: null },
    { newField: 'status', oldFields: ['status'], defaultValue: 'created' },
    {
      newField: 'razorpayPaymentId',
      oldFields: ['razorpayPaymentId', 'razorpay_payment_id'],
      defaultValue: null,
    },
    {
      newField: 'tokenId',
      oldFields: ['tokenId', 'token_id'],
      defaultValue: null,
    },
    {
      newField: 'paymentMetadata',
      oldFields: ['paymentMetadata', 'payment_metadata'],
      defaultValue: null,
      transform: (value) => {
        // Ensure value is valid JSON object/array or null
        if (value === null || value === undefined) {
          return null;
        }
        if (typeof value === 'object') {
          return value; // Already an object, pass through
        }
        if (typeof value === 'string') {
          try {
            return JSON.parse(value); // Try to parse if it's a JSON string
          } catch {
            return null; // Invalid JSON string
          }
        }
        return null;
      },
    },
    {
      newField: 'notes',
      oldFields: ['notes'],
      defaultValue: null,
      transform: (value) => {
        // Convert arrays/objects to JSON string, or return as-is if already string/null
        if (value === null || value === undefined) {
          return null;
        }
        if (typeof value === 'string') {
          return value;
        }
        // Handle arrays and objects
        return JSON.stringify(value);
      },
    },
    {
      newField: 'expireAt',
      oldFields: ['expireAt', 'expire_at'],
      isDate: true,
      defaultValue: null,
    },
    {
      newField: 'createdAt',
      oldFields: ['createdAt', 'created_at'],
      isDate: true,
      defaultValue: () => new Date(),
    },
    {
      newField: 'updatedAt',
      oldFields: ['updatedAt', 'updated_at'],
      isDate: true,
      defaultValue: () => new Date(),
    },
  ],
};

/**
 * Accounts table mapping
 */
export const ACCOUNTS_MAPPING: TableMapping = {
  tableName: 'account',
  requiredFields: ['id', 'accountId', 'providerId', 'userId'],
  fields: [
    { newField: 'id', oldFields: ['id'], defaultValue: null },
    {
      newField: 'accountId',
      oldFields: ['accountId', 'account_id'],
      defaultValue: null,
    },
    {
      newField: 'providerId',
      oldFields: ['providerId', 'provider_id'],
      defaultValue: null,
    },
    {
      newField: 'userId',
      oldFields: ['userId', 'user_id'],
      defaultValue: null,
    },
    { newField: 'appId', oldFields: ['appId', 'app_id'], defaultValue: null },
    {
      newField: 'accessToken',
      oldFields: ['accessToken', 'access_token'],
      defaultValue: null,
    },
    {
      newField: 'refreshToken',
      oldFields: ['refreshToken', 'refresh_token'],
      defaultValue: null,
    },
    {
      newField: 'idToken',
      oldFields: ['idToken', 'id_token'],
      defaultValue: null,
    },
    {
      newField: 'accessTokenExpiresAt',
      oldFields: [
        'accessTokenExpiresAt',
        'accessTokenExpires_at',
        'access_token_expires_at',
      ],
      isDate: true,
      defaultValue: null,
    },
    {
      newField: 'refreshTokenExpiresAt',
      oldFields: [
        'refreshTokenExpiresAt',
        'refreshTokenExpires_at',
        'refresh_token_expires_at',
      ],
      isDate: true,
      defaultValue: null,
    },
    { newField: 'scope', oldFields: ['scope'], defaultValue: null },
    { newField: 'password', oldFields: ['password'], defaultValue: null },
    {
      newField: 'createdAt',
      oldFields: ['createdAt', 'created_at'],
      isDate: true,
      defaultValue: () => new Date(),
    },
    {
      newField: 'updatedAt',
      oldFields: ['updatedAt', 'updated_at'],
      isDate: true,
      defaultValue: () => new Date(),
    },
  ],
};

/**
 * User metadata mapping
 */
export const USER_METADATA_MAPPING: TableMapping = {
  tableName: 'user_metadata',
  requiredFields: ['userId'],
  fields: [
    {
      newField: 'userId',
      oldFields: ['userId', 'user_id'],
      defaultValue: null,
    },
    {
      newField: 'appId',
      oldFields: ['appId', 'app_id'],
      defaultValue: 'com.kiranaapps.app',
    },
    {
      newField: 'upiVpa',
      oldFields: ['upiVpa', 'upi_vpa'],
      defaultValue: null,
    },
    {
      newField: 'audioLanguage',
      oldFields: ['audioLanguage', 'audio_language'],
      defaultValue: null,
    },
    {
      newField: 'createdAt',
      oldFields: ['createdAt', 'created_at'],
      isDate: true,
      defaultValue: () => new Date(),
    },
    {
      newField: 'updatedAt',
      oldFields: ['updatedAt', 'updated_at'],
      isDate: true,
      defaultValue: () => new Date(),
    },
  ],
};

/**
 * Push tokens mapping
 */
export const PUSH_TOKENS_MAPPING: TableMapping = {
  tableName: 'push_tokens',
  requiredFields: ['userId', 'token'],
  fields: [
    {
      newField: 'userId',
      oldFields: ['userId', 'user_id'],
      defaultValue: null,
    },
    {
      newField: 'appId',
      oldFields: ['appId', 'app_id'],
      defaultValue: 'com.kiranaapps.app',
    },
    { newField: 'token', oldFields: ['token'], defaultValue: null },
    {
      newField: 'deviceModel',
      oldFields: ['deviceModel', 'device_model'],
      defaultValue: null,
    },
    {
      newField: 'osVersion',
      oldFields: ['osVersion', 'os_version'],
      defaultValue: null,
    },
    {
      newField: 'isActive',
      oldFields: ['isActive', 'is_active'],
      defaultValue: true,
    },
    {
      newField: 'createdAt',
      oldFields: ['createdAt', 'created_at'],
      isDate: true,
      defaultValue: () => new Date(),
    },
    {
      newField: 'updatedAt',
      oldFields: ['updatedAt', 'updated_at'],
      isDate: true,
      defaultValue: () => new Date(),
    },
  ],
};

/**
 * Device sessions mapping
 */
export const DEVICE_SESSIONS_MAPPING: TableMapping = {
  tableName: 'device_sessions',
  requiredFields: ['userId', 'deviceModel', 'appVersion', 'buildNumber'],
  fields: [
    {
      newField: 'userId',
      oldFields: ['userId', 'user_id'],
      defaultValue: null,
    },
    {
      newField: 'appId',
      oldFields: ['appId', 'app_id'],
      defaultValue: 'com.kiranaapps.app',
    },
    {
      newField: 'deviceModel',
      oldFields: ['deviceModel', 'device_model'],
      defaultValue: null,
    },
    {
      newField: 'osVersion',
      oldFields: ['osVersion', 'os_version'],
      defaultValue: null,
    },
    {
      newField: 'appVersion',
      oldFields: ['appVersion', 'app_version'],
      defaultValue: null,
    },
    {
      newField: 'buildNumber',
      oldFields: ['buildNumber', 'build_number'],
      defaultValue: null,
    },
    { newField: 'platform', oldFields: ['platform'], defaultValue: null },
    {
      newField: 'manufacturer',
      oldFields: ['manufacturer'],
      defaultValue: null,
    },
    { newField: 'brand', oldFields: ['brand'], defaultValue: null },
    { newField: 'locale', oldFields: ['locale'], defaultValue: null },
    { newField: 'timezone', oldFields: ['timezone'], defaultValue: null },
    {
      newField: 'createdAt',
      oldFields: ['createdAt', 'created_at'],
      isDate: true,
      defaultValue: () => new Date(),
    },
  ],
};

/**
 * User images mapping
 */
export const USER_IMAGES_MAPPING: TableMapping = {
  tableName: 'user_images',
  requiredFields: ['userId', 'imageUrl'],
  fields: [
    {
      newField: 'userId',
      oldFields: ['userId', 'user_id'],
      defaultValue: null,
    },
    {
      newField: 'appId',
      oldFields: ['appId', 'app_id'],
      defaultValue: 'com.kiranaapps.app',
    },
    {
      newField: 'imageUrl',
      oldFields: ['imageUrl', 'image_url'],
      defaultValue: null,
    },
    {
      newField: 'removedBgImageUrl',
      oldFields: ['removedBgImageUrl', 'removed_bg_image_url'],
      defaultValue: null,
    },
    {
      newField: 'createdAt',
      oldFields: ['createdAt', 'created_at'],
      isDate: true,
      defaultValue: () => new Date(),
    },
  ],
};

/**
 * Play store ratings mapping
 */
export const PLAY_STORE_RATINGS_MAPPING: TableMapping = {
  tableName: 'play_store_ratings',
  requiredFields: ['userId', 'rating'],
  fields: [
    {
      newField: 'userId',
      oldFields: ['userId', 'user_id'],
      defaultValue: null,
    },
    {
      newField: 'appId',
      oldFields: ['appId', 'app_id'],
      defaultValue: 'com.kiranaapps.app',
    },
    { newField: 'rating', oldFields: ['rating'], defaultValue: 0 },
    { newField: 'review', oldFields: ['review'], defaultValue: null },
    {
      newField: 'reviewTitle',
      oldFields: ['reviewTitle', 'review_title'],
      defaultValue: null,
    },
    {
      newField: 'packageName',
      oldFields: ['packageName', 'package_name'],
      defaultValue: null,
    },
    {
      newField: 'appVersion',
      oldFields: ['appVersion', 'app_version'],
      defaultValue: null,
    },
    {
      newField: 'deviceModel',
      oldFields: ['deviceModel', 'device_model'],
      defaultValue: null,
    },
    {
      newField: 'osVersion',
      oldFields: ['osVersion', 'os_version'],
      defaultValue: null,
    },
    { newField: 'language', oldFields: ['language'], defaultValue: null },
    {
      newField: 'submittedToPlayStoreAt',
      oldFields: ['submittedToPlayStoreAt', 'submitted_to_play_store_at'],
      isDate: true,
      defaultValue: null,
    },
    {
      newField: 'createdAt',
      oldFields: ['createdAt', 'created_at'],
      isDate: true,
      defaultValue: () => new Date(),
    },
    {
      newField: 'updatedAt',
      oldFields: ['updatedAt', 'updated_at'],
      isDate: true,
      defaultValue: () => new Date(),
    },
  ],
};

/**
 * Abandoned checkouts mapping
 */
export const ABANDONED_CHECKOUTS_MAPPING: TableMapping = {
  tableName: 'abandoned_checkouts',
  requiredFields: ['userId'],
  fields: [
    {
      newField: 'userId',
      oldFields: ['userId', 'user_id'],
      defaultValue: null,
    },
    {
      newField: 'appId',
      oldFields: ['appId', 'app_id'],
      defaultValue: 'com.kiranaapps.app',
    },
    {
      newField: 'checkoutStartedAt',
      oldFields: ['checkoutStartedAt', 'checkout_started_at'],
      isDate: true,
      defaultValue: () => new Date(),
    },
    {
      newField: 'offerExpiresAt',
      oldFields: ['offerExpiresAt', 'offer_expires_at'],
      isDate: true,
      defaultValue: null,
    },
    {
      newField: 'discountNotificationSent',
      oldFields: ['discountNotificationSent', 'discount_notification_sent'],
      defaultValue: false,
    },
    {
      newField: 'discountNotificationSentAt',
      oldFields: [
        'discountNotificationSentAt',
        'discount_notification_sent_at',
      ],
      isDate: true,
      defaultValue: null,
    },
    {
      newField: 'notificationsSent',
      oldFields: ['notificationsSent', 'notifications_sent'],
      defaultValue: 0,
    },
    {
      newField: 'lastNotificationSentAt',
      oldFields: ['lastNotificationSentAt', 'last_notification_sent_at'],
      isDate: true,
      defaultValue: null,
    },
    {
      newField: 'nextNotificationScheduledAt',
      oldFields: [
        'nextNotificationScheduledAt',
        'next_notification_scheduled_at',
      ],
      isDate: true,
      defaultValue: null,
    },
    {
      newField: 'createdAt',
      oldFields: ['createdAt', 'created_at'],
      isDate: true,
      defaultValue: () => new Date(),
    },
  ],
};

/**
 * PhonePe orders mapping
 */
export const PHONEPE_ORDERS_MAPPING: TableMapping = {
  tableName: 'phonepe_orders',
  requiredFields: ['id', 'orderId', 'phonepeOrderId', 'userId'],
  fields: [
    { newField: 'id', oldFields: ['id'], defaultValue: null },
    {
      newField: 'orderId',
      oldFields: ['orderId', 'order_id'],
      defaultValue: null,
    },
    {
      newField: 'phonepeOrderId',
      oldFields: ['phonepeOrderId', 'phonepe_order_id'],
      defaultValue: null,
    },
    {
      newField: 'userId',
      oldFields: ['userId', 'user_id'],
      defaultValue: null,
    },
    {
      newField: 'appId',
      oldFields: ['appId', 'app_id'],
      defaultValue: 'com.kiranaapps.app',
    },
    { newField: 'state', oldFields: ['state'], defaultValue: null },
    { newField: 'amount', oldFields: ['amount'], defaultValue: 0 },
    { newField: 'currency', oldFields: ['currency'], defaultValue: 'INR' },
    {
      newField: 'expireAt',
      oldFields: ['expireAt', 'expire_at'],
      isDate: true,
      defaultValue: null,
    },
    {
      newField: 'createdAt',
      oldFields: ['createdAt', 'created_at'],
      isDate: true,
      defaultValue: () => new Date(),
    },
    {
      newField: 'updatedAt',
      oldFields: ['updatedAt', 'updated_at'],
      isDate: true,
      defaultValue: () => new Date(),
    },
  ],
};

/**
 * Enhanced notifications mapping
 */
export const ENHANCED_NOTIFICATIONS_MAPPING: TableMapping = {
  tableName: 'enhanced_notifications',
  requiredFields: [
    'id',
    'userId',
    'notificationId',
    'packageName',
    'appName',
    'title',
    'content',
    'timestamp',
  ],
  fields: [
    { newField: 'id', oldFields: ['id'], defaultValue: null },
    {
      newField: 'userId',
      oldFields: ['userId', 'user_id'],
      defaultValue: null,
    },
    {
      newField: 'notificationId',
      oldFields: ['notificationId', 'notification_id'],
      defaultValue: null,
    },
    {
      newField: 'originalNotificationId',
      oldFields: ['originalNotificationId', 'original_notification_id'],
      defaultValue: null,
      transform: (value) => {
        if (value === null || value === undefined || value === '') {
          return null;
        }
        // Convert to integer if it's a valid number
        const parsed = parseInt(value, 10);
        return isNaN(parsed) ? null : parsed;
      },
    },
    {
      newField: 'packageName',
      oldFields: ['packageName', 'package_name'],
      defaultValue: null,
    },
    {
      newField: 'appName',
      oldFields: ['appName', 'app_name'],
      defaultValue: null,
    },
    { newField: 'title', oldFields: ['title'], defaultValue: null },
    { newField: 'content', oldFields: ['content'], defaultValue: null },
    {
      newField: 'bigText',
      oldFields: ['bigText', 'big_text'],
      defaultValue: '',
    },
    {
      newField: 'timestamp',
      oldFields: ['timestamp'],
      isDate: true,
      defaultValue: null,
    },
    {
      newField: 'hasTransaction',
      oldFields: ['hasTransaction', 'has_transaction'],
      defaultValue: false,
    },
    {
      newField: 'amount',
      oldFields: ['amount'],
      defaultValue: null,
      transform: (value) => {
        if (value === null || value === undefined) return null;
        if (typeof value === 'string') {
          const parsed = parseInt(value, 10);
          return isNaN(parsed) ? null : parsed;
        }
        if (typeof value === 'number') return Math.floor(value);
        return null;
      },
    },
    {
      newField: 'payerName',
      oldFields: ['payerName', 'payer_name'],
      defaultValue: null,
    },
    {
      newField: 'transactionType',
      oldFields: ['transactionType', 'transaction_type'],
      defaultValue: null,
    },
    {
      newField: 'processingTimeMs',
      oldFields: ['processingTimeMs', 'processing_time_ms'],
      defaultValue: null,
      transform: (value) => {
        if (value === null || value === undefined) return null;
        if (typeof value === 'string') {
          const parsed = parseInt(value, 10);
          return isNaN(parsed) ? null : parsed;
        }
        if (typeof value === 'number') return Math.floor(value);
        return null;
      },
    },
    {
      newField: 'processingMetadata',
      oldFields: ['processingMetadata', 'processing_metadata'],
      defaultValue: {},
      transform: (value) => {
        if (value === null || value === undefined) {
          return {};
        }
        if (typeof value === 'object') {
          return value;
        }
        if (typeof value === 'string') {
          try {
            return JSON.parse(value);
          } catch {
            return {};
          }
        }
        return {};
      },
    },
    {
      newField: 'notificationLogId',
      oldFields: ['notificationLogId', 'notification_log_id'],
      defaultValue: null,
    },
    {
      newField: 'ttsAnnounced',
      oldFields: ['ttsAnnounced', 'tts_announced'],
      defaultValue: false,
    },
    {
      newField: 'teamNotificationSent',
      oldFields: ['teamNotificationSent', 'team_notification_sent'],
      defaultValue: false,
    },
    {
      newField: 'createdAt',
      oldFields: ['createdAt', 'created_at'],
      isDate: true,
      defaultValue: () => new Date(),
    },
    {
      newField: 'updatedAt',
      oldFields: ['updatedAt', 'updated_at'],
      isDate: true,
      defaultValue: () => new Date(),
    },
  ],
};

/**
 * PhonePe subscriptions mapping
 */
export const PHONEPE_SUBSCRIPTIONS_MAPPING: TableMapping = {
  tableName: 'phonepe_subscriptions',
  requiredFields: ['id', 'merchantSubscriptionId', 'userId'],
  fields: [
    { newField: 'id', oldFields: ['id'], defaultValue: null },
    {
      newField: 'merchantSubscriptionId',
      oldFields: ['merchantSubscriptionId', 'merchant_subscription_id'],
      defaultValue: null,
    },
    {
      newField: 'phonepeSubscriptionId',
      oldFields: ['phonepeSubscriptionId', 'phonepe_subscription_id'],
      defaultValue: null,
    },
    {
      newField: 'userId',
      oldFields: ['userId', 'user_id'],
      defaultValue: null,
    },
    {
      newField: 'appId',
      oldFields: ['appId', 'app_id'],
      defaultValue: 'com.kiranaapps.app',
    },
    { newField: 'amount', oldFields: ['amount'], defaultValue: null },
    {
      newField: 'maxAmount',
      oldFields: ['maxAmount', 'max_amount'],
      defaultValue: null,
    },
    {
      newField: 'amountType',
      oldFields: ['amountType', 'amount_type'],
      defaultValue: null,
    },
    { newField: 'frequency', oldFields: ['frequency'], defaultValue: null },
    {
      newField: 'authWorkflowType',
      oldFields: ['authWorkflowType', 'auth_workflow_type'],
      defaultValue: null,
    },
    {
      newField: 'productType',
      oldFields: ['productType', 'product_type'],
      defaultValue: null,
    },
    { newField: 'state', oldFields: ['state'], defaultValue: null },
    {
      newField: 'expireAt',
      oldFields: ['expireAt', 'expire_at'],
      isDate: true,
      defaultValue: null,
    },
    {
      newField: 'activatedAt',
      oldFields: ['activatedAt', 'activated_at'],
      isDate: true,
      defaultValue: null,
    },
    {
      newField: 'cancelledAt',
      oldFields: ['cancelledAt', 'cancelled_at'],
      isDate: true,
      defaultValue: null,
    },
    { newField: 'metadata', oldFields: ['metadata'], defaultValue: null },
    {
      newField: 'createdAt',
      oldFields: ['createdAt', 'created_at'],
      isDate: true,
      defaultValue: () => new Date(),
    },
    {
      newField: 'updatedAt',
      oldFields: ['updatedAt', 'updated_at'],
      isDate: true,
      defaultValue: () => new Date(),
    },
  ],
};

/**
 * All table mappings
 */
export const ALL_TABLE_MAPPINGS: Record<string, TableMapping> = {
  subscriptions: SUBSCRIPTIONS_MAPPING,
  orders: ORDERS_MAPPING,
  accounts: ACCOUNTS_MAPPING,
  user_metadata: USER_METADATA_MAPPING,
  pushTokens: PUSH_TOKENS_MAPPING,
  deviceSessions: DEVICE_SESSIONS_MAPPING,
  userImages: USER_IMAGES_MAPPING,
  playStoreRatings: PLAY_STORE_RATINGS_MAPPING,
  abandonedCheckouts: ABANDONED_CHECKOUTS_MAPPING,
  phonepeOrders: PHONEPE_ORDERS_MAPPING,
  phonepeSubscriptions: PHONEPE_SUBSCRIPTIONS_MAPPING,
  enhancedNotifications: ENHANCED_NOTIFICATIONS_MAPPING,
};
