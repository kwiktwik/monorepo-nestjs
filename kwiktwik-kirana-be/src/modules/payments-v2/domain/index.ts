/**
 * Domain Layer Exports
 */

// Entities
export {
  // Value Objects
  createMoney,
  createEmptyProviderData,
  DEFAULT_RETRY_CONFIG,
  createRetryConfig,
  createPaymentFailure,
  createDefaultMetadata,
  
  // Subscription Entity
  createSubscription,
  transitionSubscriptionStatus,
  recordPaymentFailure,
  recordSuccessfulPayment,
  updateProviderData,
  canChargeSubscription,
  isPremiumSubscription,
  hasExhaustedRetries,
  getNextRetryTime,
  updatePremiumStatus,
  reconstructSubscription,
} from './entities/subscription.entity';

export type {
  Money,
  SubscriptionPricing,
  ProviderSubscriptionData,
  RetryConfig,
  PaymentFailure,
  SubscriptionMetadata,
  Subscription,
  CreateSubscriptionParams,
  SubscriptionTransitionResult,
} from './entities/subscription.entity';

export {
  // Value Objects
  createEmptyProviderOrderData,
  createDefaultOrderMetadata,
  OrderType,
  
  // Order Entity
  createOrder,
  isValidOrderTransition,
  transitionOrderStatus,
  updateOrderProviderData,
  markOrderAsPaid,
  markOrderAsFailed,
  markOrderAsRefunded,
  isTerminalOrder,
  isSuccessfulOrder,
  canRefundOrder,
  reconstructOrder,
} from './entities/order.entity';

export type {
  ProviderOrderData,
  OrderMetadata,
  Order,
  CreateOrderParams,
} from './entities/order.entity';

// Value Objects
export {
  // Razorpay
  RazorpaySubscriptionCycle,
  createRazorpayCycle,
  createRazorpayCycleFromPeriod,
} from './value-objects/razorpay-subscription-cycle.vo';

export type {
  RazorpayPlanPeriod,
  SubscriptionCycleInfo as RazorpayCycleInfo,
  RazorpayCycleConfig,
} from './value-objects/razorpay-subscription-cycle.vo';

export {
  // PhonePe
  PhonePeSubscriptionCycle,
  createPhonePeCycle,
  createPhonePeCycleFromFrequency,
} from './value-objects/phonepe-subscription-cycle.vo';

export type {
  PhonePeAuthWorkflow,
  SubscriptionCycleInfo as PhonePeCycleInfo,
  PhonePeCycleConfig,
  RedemptionTiming,
} from './value-objects/phonepe-subscription-cycle.vo';
