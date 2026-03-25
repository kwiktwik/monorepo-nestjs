import { z } from 'zod';

// Enums
export const FrequencyEnum = z.enum([
  'DAILY',
  'WEEKLY',
  'FORTNIGHTLY',
  'MONTHLY',
  'BIMONTHLY',
  'QUARTERLY',
  'HALFYEARLY',
  'YEARLY',
  'ONDEMAND',
]);

export const AuthWorkflowTypeEnum = z.enum(['TRANSACTION', 'PENNY_DROP']);
export const AmountTypeEnum = z.enum(['FIXED', 'VARIABLE']);
export const UpiPaymentModeEnum = z.enum([
  'UPI_INTENT',
  'UPI_COLLECT',
  'UPI_QR',
]);

// Helper schemas
const MetadataSchema = z.any().optional();

// Setup Subscription Schema (Custom Checkout)
export const SetupSubscriptionSchema = z.object({
  planId: z.string().min(1, 'Plan ID is required'),
  merchantSubscriptionId: z.string().optional(),
  deviceOS: z.enum(['ANDROID', 'IOS']).optional(),
  targetApp: z.string().optional(),
  metadata: z.any().optional(),
});

export type SetupSubscriptionInput = z.infer<typeof SetupSubscriptionSchema>;

// Notify Redemption Schema
export const NotifyRedemptionSchema = z.object({
  merchantSubscriptionId: z
    .string()
    .min(1, 'Merchant subscription ID is required')
    .max(100, 'Merchant subscription ID too long'),
  amount: z
    .number()
    .min(1, 'Amount must be at least 1')
    .max(1000000, 'Amount cannot exceed 10,00,000'),
  metadata: MetadataSchema,
});

export type NotifyRedemptionInput = z.infer<typeof NotifyRedemptionSchema>;

// Query Parameters Schemas
export const GetSubscriptionStatusSchema = z.object({
  merchantSubscriptionId: z
    .string()
    .min(1, 'Merchant subscription ID is required'),
});

export const GetOrderStatusSchema = z.object({
  merchantOrderId: z.string().min(1, 'Merchant order ID is required'),
  details: z
    .string()
    .optional()
    .transform((val) => val === 'true'),
});

// Webhook Schemas
export const PhonePeWebhookEventEnum = z.enum([
  'subscription.setup.order.completed',
  'subscription.setup.order.failed',
  'subscription.paused',
  'subscription.unpaused',
  'subscription.revoked',
  'subscription.cancelled',
  'subscription.notification.completed',
  'subscription.notification.failed',
  'subscription.redemption.order.completed',
  'subscription.redemption.order.failed',
  'subscription.redemption.transaction.completed',
  'subscription.redemption.transaction.failed',
  'pg.refund.accepted',
  'pg.refund.completed',
  'pg.refund.failed',
]);

export const WebhookPayloadSchema = z.object({
  event: PhonePeWebhookEventEnum,
  payload: z.any(),
});

export type WebhookPayloadInput = z.infer<typeof WebhookPayloadSchema>;

// Service Layer Validation Schemas (Custom Checkout)
export const SetupSubscriptionServiceSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  appId: z.string().min(1, 'App ID is required'),
  planId: z.string().min(1, 'Plan ID is required'),
  merchantSubscriptionId: z.string().optional(),
  deviceOS: z.enum(['ANDROID', 'IOS']).optional(),
  targetApp: z.string().optional(),
  metadata: z.any().optional(),
});

export const NotifyRedemptionServiceSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  appId: z.string().min(1, 'App ID is required'),
  merchantSubscriptionId: z.string().min(1),
  amount: z.number().min(1),
  metadata: z.any().optional(),
});

// Response Validation Schemas (Custom Checkout)
export const PhonePeSetupResponseSchema = z.object({
  orderId: z.string(),
  state: z.literal('PENDING'),
  intentUrl: z.string(),
});

export const PhonePeNotifyResponseSchema = z.object({
  orderId: z.string(),
  state: z.literal('NOTIFICATION_IN_PROGRESS'),
  expireAt: z.number(),
});

export const PhonePeSubscriptionStatusSchema = z.object({
  merchantSubscriptionId: z.string(),
  subscriptionId: z.string(),
  state: z.string(),
  productType: z.string().nullable(),
  authInstrumentType: z.string().nullable(),
  authWorkflowType: AuthWorkflowTypeEnum,
  amountType: AmountTypeEnum,
  currency: z.string(),
  maxAmount: z.number(),
  frequency: FrequencyEnum,
  expireAt: z.number(),
  pauseStartDate: z.number().nullable(),
  pauseEndDate: z.number().nullable(),
});

export const PhonePeOrderStatusSchema = z.object({
  merchantId: z.string(),
  merchantOrderId: z.string(),
  orderId: z.string(),
  state: z.string(),
  amount: z.number(),
  expireAt: z.number(),
  paymentDetails: z
    .array(
      z.object({
        transactionId: z.string(),
        paymentMode: z.string().nullable(),
        timestamp: z.number(),
        amount: z.number(),
        state: z.string(),
        errorCode: z.string().optional(),
        detailedErrorCode: z.string().optional(),
      }),
    )
    .optional(),
});
