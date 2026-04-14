/**
 * Payment Module V2 - Types Index
 * 
 * Exports all types, enums, and utility functions.
 */

// ============================================================================
// Core Enums
// ============================================================================

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

// ============================================================================
// Payment Method Types
// ============================================================================

export {
  PaymentMethodType,
  ALL_PAYMENT_METHOD_TYPES,
  PaymentMethodCategory,
  PaymentMethodCapabilitiesMap,
  ProviderPaymentMethodSupport,
  getPaymentMethodCategory,
  isSubscriptionMethod,
  supportsAutoDebit,
  getPaymentMethodCapabilities,
  providerSupportsMethod,
  getProviderPaymentMethods,
  createPaymentMethodConfig,
  type PaymentMethodCapabilities,
  type PaymentMethodConfig,
  type PaymentIntent,
  type CreatePaymentIntentParams,
} from './payment-method.types';

// ============================================================================
// Provider-Specific Types (from original files)
// ============================================================================

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
  mapPhonePeFrequency,
} from './phonepe.types';

// ============================================================================
// Error Handling
// ============================================================================

export {
  PaymentErrorCode,
  ErrorSeverity,
  PaymentError,
  SubscriptionNotFoundError,
  PaymentFailedError,
  MandateRejectedError,
  ProviderUnavailableError,
  InvalidStateTransitionError,
  WebhookSignatureInvalidError,
  OrderNotFoundError,
  ConfigurationNotFoundError,
  mapRazorpayError,
  mapPhonePeError,
  mapProviderError,
  isRetryableError,
  getErrorSeverity,
  type PaymentErrorJSON,
} from '../common/errors/payment-errors';

// ============================================================================
// State Mappers (these override some exports from phonepe.types)
// ============================================================================

export {
  RazorpaySubscriptionState,
  RazorpayOrderState,
  RazorpayPaymentState,
  RazorpayStateMapper,
  mapRazorpayOrderState as mapRazorpayOrderStateV2,
  mapRazorpayPaymentState,
  PhonePeSubscriptionState,
  PhonePeOrderState,
  PhonePeTransactionState,
  PhonePeStateMapper,
  mapPhonePeOrderState as mapPhonePeOrderStateV2,
  mapPhonePeTransactionState,
  StateMapperRegistry,
  stateMapperRegistry,
  type ProviderStateMapper,
} from '../providers/mappers/state-mappers';

// ============================================================================
// Webhook Types
// ============================================================================

export {
  NormalizedWebhookEventType,
  WebhookEventCategory,
  RazorpayEventMapping,
  PhonePeEventMapping,
  getEventCategory,
  normalizeRazorpayEventType,
  normalizePhonePeEventType,
  normalizeEventType,
  type NormalizedWebhookEvent,
  type WebhookHeaders,
  type WebhookParseResult,
  type WebhookHandler,
  type WebhookHandlerResult,
  type WebhookAction,
  type PaymentInstrument,
  type PaymentRail,
  type WebhookPaymentDetail,
} from '../webhooks/webhook-types';

// ============================================================================
// Webhook Parsers
// ============================================================================

export type { WebhookParser } from '../webhooks/webhook-parsers';
export {
  RazorpayWebhookParser,
  PhonePeWebhookParser,
  WebhookParserRegistry,
  webhookParserRegistry,
} from '../webhooks/webhook-parsers';

// ============================================================================
// Webhook Processor
// ============================================================================

export {
  WebhookProcessorService,
  InMemoryIdempotencyStore,
  createLoggingHandler,
  createSubscriptionStatusHandler,
  createOrderStatusHandler,
  createPaymentRecordHandler,
  type ProcessWebhookParams,
  type ProcessWebhookResult,
  type WebhookSecretProvider,
  type IdempotencyStore as WebhookIdempotencyStore,
} from '../webhooks/webhook-processor.service';

// ============================================================================
// Idempotency
// ============================================================================

export {
  IdempotencyService,
  InMemoryIdempotencyStore as InMemoryIdempotencyStoreV2,
  IdempotencyKeyExistsError,
  IdempotencyKeyNotFoundError,
  IdempotencyRequestMismatchError,
  IdempotencyOperationInProgressError,
  IdempotencyOperationType,
  IdempotencyStatus,
  type IdempotencyKey,
  type IdempotencyStore,
  type CreateIdempotencyKeyParams,
  type UpdateIdempotencyKeyParams,
  type IdempotentResult,
  type IdempotentOptions,
} from '../common/idempotency/idempotency.service';
