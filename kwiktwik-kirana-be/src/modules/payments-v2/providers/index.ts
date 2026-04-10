/**
 * Providers Layer Exports
 */

// Base Classes
export { BaseSubscriptionProvider } from './base/base-subscription-provider';

// Interfaces - export specific types to avoid conflicts
export type {
  ProviderConfig,
  RazorpayProviderConfig,
  PhonePeProviderConfig,
  AnyProviderConfig,
  SetupSubscriptionParams,
  SetupSubscriptionResult,
  ChargeSubscriptionParams,
  ChargeSubscriptionResult as ProviderChargeResult,
  GetSubscriptionStatusParams,
  SubscriptionStatusResult,
  GetOrderStatusParams,
  OrderStatusResult,
  ParseWebhookParams,
  CancelSubscriptionParams,
  CancelSubscriptionResult as ProviderCancelResult,
  RefundPaymentParams,
  RefundPaymentResult,
  PaymentDetail,
  WebhookEvent,
  SubscriptionProvider,
} from './interfaces/subscription-provider.interface';

// Provider Implementations
export {
  // Razorpay
  RazorpayProviderManagedProvider,
  RazorpayUserManagedProvider,
  BaseRazorpayProvider,
  createRazorpayClient,
  type RazorpayClient,
  type RazorpaySubscriptionCreateParams,
  type RazorpayOrderCreateParams,
  type RazorpayPlanCreateParams,
} from './razorpay/razorpay.provider';

export {
  // PhonePe
  PhonePeProviderManagedProvider,
  PhonePeUserManagedProvider,
  BasePhonePeProvider,
  createPhonePeClient,
  type PhonePeClient,
  type RefundParams,
  type RefundResponse,
  PHONEPE_ENDPOINTS,
} from './phonepe/phonepe.provider';

// Factory
export {
  getProvider,
  getExistingProvider,
  clearProviders,
  removeProvider,
  getRegisteredProviderKeys,
  hasProvider,
  ProviderFactory,
  defaultProviderFactory,
} from './factory/provider.factory';

// Utilities
export {
  generateId,
  generateMerchantSubscriptionId,
  generateMerchantOrderId,
  generateMerchantRefundId,
  unixToDate,
  dateToUnix,
  dateToUnixMs,
  nowUnix,
  nowUnixMs,
  rupeesToPaise,
  paiseToRupees,
  formatAmount,
  verifyHmacSha256,
  createHmacSha256,
  ProviderError,
  createProviderError,
  isProviderError,
  isValidEmail,
  isValidPhone,
  isValidAmount,
  getRazorpayPlanPeriod,
  getPhonePeFrequencyString,
  extractWebhookEventId,
  extractWebhookTimestamp,
} from './base/provider-utils';
