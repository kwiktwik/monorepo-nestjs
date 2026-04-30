/**
 * Payment Error Handling System
 * 
 * Unified error handling across all payment providers.
 * Each provider has its own error codes that are mapped to unified error codes.
 */

import type { PaymentProvider } from '../../types/provider.enum';

// ============================================================================
// Unified Error Codes
// ============================================================================

/**
 * Payment error codes - unified across all providers
 */
export const PaymentErrorCode = {
  // Generic errors
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  PROVIDER_UNAVAILABLE: 'PROVIDER_UNAVAILABLE',
  INVALID_REQUEST: 'INVALID_REQUEST',
  NOT_INITIALIZED: 'NOT_INITIALIZED',
  
  // Authentication errors
  AUTH_FAILED: 'AUTH_FAILED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  
  // Subscription errors
  SUBSCRIPTION_NOT_FOUND: 'SUBSCRIPTION_NOT_FOUND',
  SUBSCRIPTION_ALREADY_ACTIVE: 'SUBSCRIPTION_ALREADY_ACTIVE',
  SUBSCRIPTION_ALREADY_CANCELLED: 'SUBSCRIPTION_ALREADY_CANCELLED',
  SUBSCRIPTION_CANNOT_BE_CANCELLED: 'SUBSCRIPTION_CANNOT_BE_CANCELLED',
  SUBSCRIPTION_CANNOT_BE_PAUSED: 'SUBSCRIPTION_CANNOT_BE_PAUSED',
  SUBSCRIPTION_LIMIT_EXCEEDED: 'SUBSCRIPTION_LIMIT_EXCEEDED',
  SUBSCRIPTION_IN_INVALID_STATE: 'SUBSCRIPTION_IN_INVALID_STATE',
  
  // Payment errors
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  PAYMENT_TIMEOUT: 'PAYMENT_TIMEOUT',
  PAYMENT_CANCELLED_BY_USER: 'PAYMENT_CANCELLED_BY_USER',
  INSUFFICIENT_FUNDS: 'INSUFFICIENT_FUNDS',
  INVALID_PAYMENT_METHOD: 'INVALID_PAYMENT_METHOD',
  PAYMENT_METHOD_EXPIRED: 'PAYMENT_METHOD_EXPIRED',
  PAYMENT_DECLINED: 'PAYMENT_DECLINED',
  
  // Mandate errors
  MANDATE_REJECTED: 'MANDATE_REJECTED',
  MANDATE_EXPIRED: 'MANDATE_EXPIRED',
  MANDATE_ALREADY_EXISTS: 'MANDATE_ALREADY_EXISTS',
  MANDATE_AMOUNT_EXCEEDED: 'MANDATE_AMOUNT_EXCEEDED',
  MANDATE_NOT_FOUND: 'MANDATE_NOT_FOUND',
  
  // Order errors
  ORDER_NOT_FOUND: 'ORDER_NOT_FOUND',
  ORDER_ALREADY_PAID: 'ORDER_ALREADY_PAID',
  ORDER_EXPIRED: 'ORDER_EXPIRED',
  ORDER_AMOUNT_MISMATCH: 'ORDER_AMOUNT_MISMATCH',
  
  // Refund errors
  REFUND_FAILED: 'REFUND_FAILED',
  REFUND_NOT_ALLOWED: 'REFUND_NOT_ALLOWED',
  REFUND_AMOUNT_EXCEEDED: 'REFUND_AMOUNT_EXCEEDED',
  
  // Validation errors
  INVALID_AMOUNT: 'INVALID_AMOUNT',
  INVALID_CURRENCY: 'INVALID_CURRENCY',
  INVALID_CUSTOMER: 'INVALID_CUSTOMER',
  INVALID_PLAN: 'INVALID_PLAN',
  INVALID_FREQUENCY: 'INVALID_FREQUENCY',
  
  // Rate limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  TOO_MANY_REQUESTS: 'TOO_MANY_REQUESTS',
  
  // Configuration errors
  CONFIG_NOT_FOUND: 'CONFIG_NOT_FOUND',
  PROVIDER_NOT_CONFIGURED: 'PROVIDER_NOT_CONFIGURED',
  
  // Webhook errors
  WEBHOOK_SIGNATURE_INVALID: 'WEBHOOK_SIGNATURE_INVALID',
  WEBHOOK_PARSE_FAILED: 'WEBHOOK_PARSE_FAILED',
  WEBHOOK_EVENT_ALREADY_PROCESSED: 'WEBHOOK_EVENT_ALREADY_PROCESSED',
} as const;

export type PaymentErrorCode = typeof PaymentErrorCode[keyof typeof PaymentErrorCode];

// ============================================================================
// Error Severity
// ============================================================================

/**
 * Payment error severity levels
 */
export const ErrorSeverity = {
  /** Low - Retryable, user can continue */
  LOW: 'LOW',
  /** Medium - Requires user action */
  MEDIUM: 'MEDIUM',
  /** High - Blocks subscription */
  HIGH: 'HIGH',
  /** Critical - System issue, needs investigation */
  CRITICAL: 'CRITICAL',
} as const;

export type ErrorSeverity = typeof ErrorSeverity[keyof typeof ErrorSeverity];

// ============================================================================
// Payment Error Class
// ============================================================================

/**
 * Payment error - base class for all payment errors
 */
export class PaymentError extends Error {
  constructor(
    message: string,
    public readonly code: PaymentErrorCode,
    public readonly severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    public readonly provider?: PaymentProvider,
    public readonly providerCode?: string,
    public readonly providerMessage?: string,
    public readonly retryable: boolean = false,
    public readonly metadata?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'PaymentError';
  }

  /**
   * Check if error is retryable
   */
  isRetryable(): boolean {
    return this.retryable || this.severity === ErrorSeverity.LOW;
  }

  /**
   * Convert to JSON for logging/response
   */
  toJSON(): PaymentErrorJSON {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      severity: this.severity,
      provider: this.provider,
      providerCode: this.providerCode,
      providerMessage: this.providerMessage,
      retryable: this.retryable,
      metadata: this.metadata,
    };
  }

  /**
   * Create from provider error
   */
  static fromProviderError(
    provider: PaymentProvider,
    error: unknown,
    defaultMessage: string = 'Payment operation failed',
  ): PaymentError {
    if (error instanceof PaymentError) {
      return error;
    }
    return new PaymentError(
      defaultMessage,
      PaymentErrorCode.UNKNOWN_ERROR,
      ErrorSeverity.MEDIUM,
      provider,
      undefined,
      error instanceof Error ? error.message : undefined,
    );
  }
}

export interface PaymentErrorJSON {
  readonly name: string;
  readonly message: string;
  readonly code: PaymentErrorCode;
  readonly severity: ErrorSeverity;
  readonly provider?: PaymentProvider;
  readonly providerCode?: string;
  readonly providerMessage?: string;
  readonly retryable: boolean;
  readonly metadata?: Record<string, unknown>;
}

// ============================================================================
// Specialized Error Classes
// ============================================================================

/**
 * Subscription not found error
 */
export class SubscriptionNotFoundError extends PaymentError {
  constructor(subscriptionId: string, provider?: PaymentProvider) {
    super(
      `Subscription not found: ${subscriptionId}`,
      PaymentErrorCode.SUBSCRIPTION_NOT_FOUND,
      ErrorSeverity.HIGH,
      provider,
    );
    this.name = 'SubscriptionNotFoundError';
  }
}

/**
 * Payment failed error
 */
export class PaymentFailedError extends PaymentError {
  constructor(
    message: string,
    provider: PaymentProvider,
    providerCode?: string,
    metadata?: Record<string, unknown>,
  ) {
    super(
      message,
      PaymentErrorCode.PAYMENT_FAILED,
      ErrorSeverity.HIGH,
      provider,
      providerCode,
      message,
      true,
      metadata,
    );
    this.name = 'PaymentFailedError';
  }
}

/**
 * Mandate rejected error
 */
export class MandateRejectedError extends PaymentError {
  constructor(provider: PaymentProvider, reason?: string) {
    super(
      `Mandate rejected: ${reason ?? 'Unknown reason'}`,
      PaymentErrorCode.MANDATE_REJECTED,
      ErrorSeverity.HIGH,
      provider,
      undefined,
      reason,
      false,
    );
    this.name = 'MandateRejectedError';
  }
}

/**
 * Provider unavailable error
 */
export class ProviderUnavailableError extends PaymentError {
  constructor(provider: PaymentProvider, originalError?: Error) {
    super(
      `Payment provider unavailable: ${provider}`,
      PaymentErrorCode.PROVIDER_UNAVAILABLE,
      ErrorSeverity.CRITICAL,
      provider,
      undefined,
      originalError?.message,
      true,
      { originalError: originalError?.stack },
    );
    this.name = 'ProviderUnavailableError';
  }
}

/**
 * Invalid state transition error
 */
export class InvalidStateTransitionError extends PaymentError {
  constructor(
    currentStatus: string,
    targetStatus: string,
    provider?: PaymentProvider,
  ) {
    super(
      `Invalid state transition from ${currentStatus} to ${targetStatus}`,
      PaymentErrorCode.SUBSCRIPTION_IN_INVALID_STATE,
      ErrorSeverity.MEDIUM,
      provider,
    );
    this.name = 'InvalidStateTransitionError';
  }
}

/**
 * Webhook signature invalid error
 */
export class WebhookSignatureInvalidError extends PaymentError {
  constructor(provider: PaymentProvider) {
    super(
      'Webhook signature verification failed',
      PaymentErrorCode.WEBHOOK_SIGNATURE_INVALID,
      ErrorSeverity.HIGH,
      provider,
    );
    this.name = 'WebhookSignatureInvalidError';
  }
}

/**
 * Order not found error
 */
export class OrderNotFoundError extends PaymentError {
  constructor(orderId: string, provider?: PaymentProvider) {
    super(
      `Order not found: ${orderId}`,
      PaymentErrorCode.ORDER_NOT_FOUND,
      ErrorSeverity.HIGH,
      provider,
    );
    this.name = 'OrderNotFoundError';
  }
}

/**
 * Configuration not found error
 */
export class ConfigurationNotFoundError extends PaymentError {
  constructor(provider: PaymentProvider, appId: string) {
    super(
      `Configuration not found for provider ${provider} and app ${appId}`,
      PaymentErrorCode.CONFIG_NOT_FOUND,
      ErrorSeverity.CRITICAL,
      provider,
    );
    this.name = 'ConfigurationNotFoundError';
  }
}

// ============================================================================
// Provider Error Mappers
// ============================================================================

/**
 * Razorpay error response type
 */
interface RazorpayErrorResponse {
  error?: {
    code?: string;
    description?: string;
    field?: string;
  };
  statusCode?: number;
}

/**
 * PhonePe error response type
 */
interface PhonePeErrorResponse {
  code?: string;
  message?: string;
  errorCode?: string;
  detailedErrorCode?: string;
}

/**
 * Map Razorpay error to unified error
 */
export function mapRazorpayError(error: RazorpayErrorResponse): PaymentError {
  const code = error.error?.code ?? 'UNKNOWN';
  const description = error.error?.description ?? 'Unknown error';

  const errorMapping: Record<string, { code: PaymentErrorCode; severity: ErrorSeverity; retryable: boolean }> = {
    // API errors
    'BAD_REQUEST_ERROR': { code: PaymentErrorCode.INVALID_REQUEST, severity: ErrorSeverity.LOW, retryable: false },
    'SERVER_ERROR': { code: PaymentErrorCode.PROVIDER_UNAVAILABLE, severity: ErrorSeverity.CRITICAL, retryable: true },
    'GATEWAY_ERROR': { code: PaymentErrorCode.PAYMENT_FAILED, severity: ErrorSeverity.HIGH, retryable: true },

    // Subscription errors
    'invalid_subscription_id': { code: PaymentErrorCode.SUBSCRIPTION_NOT_FOUND, severity: ErrorSeverity.HIGH, retryable: false },
    'subscription_already_cancelled': { code: PaymentErrorCode.SUBSCRIPTION_ALREADY_CANCELLED, severity: ErrorSeverity.LOW, retryable: false },
    'subscription_cannot_be_cancelled': { code: PaymentErrorCode.SUBSCRIPTION_CANNOT_BE_CANCELLED, severity: ErrorSeverity.MEDIUM, retryable: false },
    'invalid_plan_id': { code: PaymentErrorCode.INVALID_PLAN, severity: ErrorSeverity.HIGH, retryable: false },

    // Payment errors
    'payment_authorization_failed': { code: PaymentErrorCode.PAYMENT_DECLINED, severity: ErrorSeverity.HIGH, retryable: true },
    'payment_capture_failed': { code: PaymentErrorCode.PAYMENT_FAILED, severity: ErrorSeverity.HIGH, retryable: true },
    'payment_not_found': { code: PaymentErrorCode.ORDER_NOT_FOUND, severity: ErrorSeverity.HIGH, retryable: false },

    // Order errors
    'invalid_order_id': { code: PaymentErrorCode.ORDER_NOT_FOUND, severity: ErrorSeverity.HIGH, retryable: false },

    // Customer errors
    'invalid_customer_id': { code: PaymentErrorCode.INVALID_CUSTOMER, severity: ErrorSeverity.HIGH, retryable: false },

    // Rate limiting
    'rate_limit_exceeded': { code: PaymentErrorCode.RATE_LIMIT_EXCEEDED, severity: ErrorSeverity.MEDIUM, retryable: true },
  };

  const mapped = errorMapping[code] ?? {
    code: PaymentErrorCode.UNKNOWN_ERROR,
    severity: ErrorSeverity.MEDIUM,
    retryable: false,
  };

  return new PaymentError(
    description,
    mapped.code,
    mapped.severity,
    'RAZORPAY',
    code,
    description,
    mapped.retryable,
    { rawError: error },
  );
}

/**
 * Map PhonePe error to unified error
 */
export function mapPhonePeError(error: PhonePeErrorResponse): PaymentError {
  const code = error.code ?? error.errorCode ?? 'UNKNOWN';
  const message = error.message ?? 'Unknown error';
  const detailedCode = error.detailedErrorCode;

  const errorMapping: Record<string, { code: PaymentErrorCode; severity: ErrorSeverity; retryable: boolean }> = {
    // API errors
    'INVALID_REQUEST': { code: PaymentErrorCode.INVALID_REQUEST, severity: ErrorSeverity.LOW, retryable: false },
    'UNAUTHORIZED': { code: PaymentErrorCode.AUTH_FAILED, severity: ErrorSeverity.HIGH, retryable: false },
    'TOKEN_EXPIRED': { code: PaymentErrorCode.TOKEN_EXPIRED, severity: ErrorSeverity.MEDIUM, retryable: true },
    'INTERNAL_SERVER_ERROR': { code: PaymentErrorCode.PROVIDER_UNAVAILABLE, severity: ErrorSeverity.CRITICAL, retryable: true },

    // Subscription errors
    'SUBSCRIPTION_NOT_FOUND': { code: PaymentErrorCode.SUBSCRIPTION_NOT_FOUND, severity: ErrorSeverity.HIGH, retryable: false },
    'SUBSCRIPTION_ALREADY_CANCELLED': { code: PaymentErrorCode.SUBSCRIPTION_ALREADY_CANCELLED, severity: ErrorSeverity.LOW, retryable: false },
    'SUBSCRIPTION_IN_INVALID_STATE': { code: PaymentErrorCode.SUBSCRIPTION_IN_INVALID_STATE, severity: ErrorSeverity.MEDIUM, retryable: false },

    // Payment errors
    'PAYMENT_FAILED': { code: PaymentErrorCode.PAYMENT_FAILED, severity: ErrorSeverity.HIGH, retryable: true },
    'PAYMENT_DECLINED': { code: PaymentErrorCode.PAYMENT_DECLINED, severity: ErrorSeverity.HIGH, retryable: true },
    'INSUFFICIENT_FUNDS': { code: PaymentErrorCode.INSUFFICIENT_FUNDS, severity: ErrorSeverity.HIGH, retryable: false },

    // Mandate errors
    'MANDATE_REJECTED': { code: PaymentErrorCode.MANDATE_REJECTED, severity: ErrorSeverity.HIGH, retryable: false },
    'MANDATE_EXPIRED': { code: PaymentErrorCode.MANDATE_EXPIRED, severity: ErrorSeverity.HIGH, retryable: false },
    'MANDATE_AMOUNT_EXCEEDED': { code: PaymentErrorCode.MANDATE_AMOUNT_EXCEEDED, severity: ErrorSeverity.HIGH, retryable: false },

    // Order errors
    'ORDER_NOT_FOUND': { code: PaymentErrorCode.ORDER_NOT_FOUND, severity: ErrorSeverity.HIGH, retryable: false },
    'ORDER_EXPIRED': { code: PaymentErrorCode.ORDER_EXPIRED, severity: ErrorSeverity.MEDIUM, retryable: false },

    // Rate limiting
    'RATE_LIMIT_EXCEEDED': { code: PaymentErrorCode.RATE_LIMIT_EXCEEDED, severity: ErrorSeverity.MEDIUM, retryable: true },
    'TOO_MANY_REQUESTS': { code: PaymentErrorCode.TOO_MANY_REQUESTS, severity: ErrorSeverity.MEDIUM, retryable: true },

    // Intent errors (PhonePe specific)
    'INTENT_EXPIRED': { code: PaymentErrorCode.PAYMENT_TIMEOUT, severity: ErrorSeverity.MEDIUM, retryable: true },
    'USER_CANCELLED': { code: PaymentErrorCode.PAYMENT_CANCELLED_BY_USER, severity: ErrorSeverity.LOW, retryable: false },
  };

  const mapped = errorMapping[code] ?? errorMapping[detailedCode ?? ''] ?? {
    code: PaymentErrorCode.UNKNOWN_ERROR,
    severity: ErrorSeverity.MEDIUM,
    retryable: false,
  };

  return new PaymentError(
    message,
    mapped.code,
    mapped.severity,
    'PHONEPE',
    code,
    message,
    mapped.retryable,
    { rawError: error, detailedErrorCode: detailedCode },
  );
}

/**
 * Map provider error to unified error
 */
export function mapProviderError(
  provider: PaymentProvider,
  error: unknown,
): PaymentError {
  if (error instanceof PaymentError) {
    return error;
  }

  if (provider === 'RAZORPAY') {
    return mapRazorpayError(error as RazorpayErrorResponse);
  }

  if (provider === 'PHONEPE') {
    return mapPhonePeError(error as PhonePeErrorResponse);
  }

  return PaymentError.fromProviderError(provider, error);
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  if (error instanceof PaymentError) {
    return error.isRetryable();
  }
  return false;
}

/**
 * Get error severity
 */
export function getErrorSeverity(error: unknown): ErrorSeverity {
  if (error instanceof PaymentError) {
    return error.severity;
  }
  return ErrorSeverity.MEDIUM;
}
