/**
 * Payment Module V2 - Types Index
 * 
 * Exports all types, enums, and utility functions.
 */

// Core Enums
export {
  PaymentProvider,
  ALL_PAYMENT_PROVIDERS,
  PaymentProviderLabels,
  isPaymentProvider,
  getProviderLabel,
  type PaymentProvider as PaymentProviderType,
} from './provider.enum';

export {
  SubscriptionType,
  ALL_SUBSCRIPTION_TYPES,
  SubscriptionTypeDescriptions,
  isSubscriptionType,
  getSubscriptionTypeDescription,
  isApplicationRetries,
  isAutomaticCharging,
  type SubscriptionType as SubscriptionTypeEnum,
} from './subscription-type.enum';

export {
  SubscriptionStatus,
  ALL_SUBSCRIPTION_STATUSES,
  StatusCategory,
  ValidStateTransitions,
  StateMachineEvent,
  EventTransitionMap,
  isSubscriptionStatus,
  getStatusCategory,
  isTerminalStatus,
  isPremiumStatus,
  canCharge,
  isValidTransition,
  getValidTargetStatuses,
  attemptTransition,
  getTransitionEvent,
  type StateTransitionResult,
  type StateTransitionError,
  type StateTransitionErrorType,
  type StatusCategory as StatusCategoryType,
} from './subscription-status.enum';

export {
  OrderStatus,
  ALL_ORDER_STATUSES,
  isOrderStatus,
  isSuccessfulOrderStatus,
  isTerminalOrderStatus,
  canRefundOrderStatus,
} from './order-status.enum';

export {
  BillingFrequency,
  ALL_BILLING_FREQUENCIES,
  FrequencyToDays,
  FrequencyCyclesPerYear,
  PhonePeFrequencyMap,
  RazorpayPeriodMap,
  isBillingFrequency,
  getFrequencyDays,
  calculateNextBillingDate,
  getCyclesPerYear,
  toPhonePeFrequency,
  fromPhonePeFrequency,
  toRazorpayPeriod,
} from './frequency.enum';

// Provider-Specific Types
export {
  RazorpaySubscriptionStatus,
  ALL_RAZORPAY_SUBSCRIPTION_STATUSES,
  RazorpayOrderStatus,
  RazorpayPaymentStatus,
  RazorpayPaymentMethod,
  RazorpayWebhookEvent,
  type RazorpaySubscriptionEntity,
  type RazorpayOrderEntity,
  type RazorpayPaymentEntity,
  type RazorpayTokenEntity,
  type RazorpayCustomerEntity,
  type RazorpayPlanEntity,
  type RazorpayRefundEntity,
  type RazorpayCardDetails,
  type RazorpayWebhookPayload,
  type RazorpayCreateSubscriptionRequest,
  type RazorpayCreateOrderRequest,
  type RazorpayCreateCustomerRequest,
  mapRazorpaySubscriptionStatus,
  toRazorpaySubscriptionStatus,
  mapRazorpayOrderStatus,
  mapRazorpayPaymentStatus,
} from './razorpay.types';

export {
  PhonePeSubscriptionState,
  ALL_PHONEPE_SUBSCRIPTION_STATES,
  PhonePeOrderState,
  ALL_PHONEPE_ORDER_STATES,
  PhonePePaymentFlowType,
  PhonePeAuthWorkflowType,
  PhonePeAmountType,
  PhonePeProductType,
  PhonePeSubscriptionType,
  PhonePeRedemptionRetryStrategy,
  PhonePeFrequency,
  PhonePePaymentMode,
  PhonePeWebhookEvent,
  type PhonePeSubscriptionStatusResponse,
  type PhonePeSetupSubscriptionResponse,
  type PhonePeSubscriptionDetails,
  type PhonePeSetupSubscriptionRequest,
  type PhonePeNotifyRedemptionRequest,
  type PhonePeNotifyRedemptionResponse,
  type PhonePeExecuteRedemptionRequest,
  type PhonePeExecuteRedemptionResponse,
  type PhonePeRedemptionOrderStatusNotified,
  type PhonePeRedemptionOrderStatusCompleted,
  type PhonePeRedemptionOrderStatusResponse,
  type PhonePePaymentDetail,
  type PhonePeMetaInfo,
  type PhonePeWebhookPayload,
  type PhonePeDecodedWebhookPayload,
  type PhonePeCancelSubscriptionResponse,
  mapPhonePeSubscriptionState,
  toPhonePeSubscriptionState,
  mapPhonePeOrderState,
  mapPhonePeFrequency,
} from './phonepe.types';
