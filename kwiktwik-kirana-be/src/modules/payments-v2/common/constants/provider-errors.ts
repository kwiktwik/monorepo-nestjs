/**
 * Provider Error Constants
 * 
 * Centralized error codes and messages for payment providers.
 * Eliminates hardcoded strings throughout the codebase.
 */

// ============================================================================
// Error Codes
// ============================================================================

/**
 * Common error codes shared across all providers
 */
export const ProviderErrorCode = {
  // Initialization errors
  NOT_INITIALIZED: 'NOT_INITIALIZED',
  INVALID_CONFIG: 'INVALID_CONFIG',

  // Authentication errors
  AUTH_FAILED: 'AUTH_FAILED',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',

  // Subscription errors
  SETUP_FAILED: 'SETUP_FAILED',
  SUBSCRIPTION_NOT_FOUND: 'SUBSCRIPTION_NOT_FOUND',
  CANCEL_FAILED: 'CANCEL_FAILED',
  PAUSE_FAILED: 'PAUSE_FAILED',
  RESUME_FAILED: 'RESUME_FAILED',
  UPDATE_FAILED: 'UPDATE_FAILED',

  // Charge errors
  CHARGE_FAILED: 'CHARGE_FAILED',
  CANNOT_CHARGE: 'CANNOT_CHARGE',

  // Order errors
  ORDER_STATUS_FAILED: 'ORDER_STATUS_FAILED',
  ORDER_NOT_FOUND: 'ORDER_NOT_FOUND',

  // Status check errors
  STATUS_CHECK_FAILED: 'STATUS_CHECK_FAILED',

  // API errors
  API_ERROR: 'API_ERROR',
  RATE_LIMITED: 'RATE_LIMITED',
  TIMEOUT: 'TIMEOUT',

  // Webhook errors
  WEBHOOK_SIGNATURE_INVALID: 'WEBHOOK_SIGNATURE_INVALID',
  WEBHOOK_PARSE_FAILED: 'WEBHOOK_PARSE_FAILED',

  // Refund errors
  REFUND_FAILED: 'REFUND_FAILED',
} as const;

export type ProviderErrorCode = typeof ProviderErrorCode[keyof typeof ProviderErrorCode];

// ============================================================================
// Error Messages
// ============================================================================

/**
 * Error messages mapped to error codes
 */
export const ProviderErrorMessage: Readonly<Record<ProviderErrorCode, string>> = {
  [ProviderErrorCode.NOT_INITIALIZED]: 'Provider not initialized',
  [ProviderErrorCode.INVALID_CONFIG]: 'Invalid provider configuration',
  [ProviderErrorCode.AUTH_FAILED]: 'Failed to authenticate with provider',
  [ProviderErrorCode.TOKEN_EXPIRED]: 'Authentication token has expired',
  [ProviderErrorCode.SETUP_FAILED]: 'Failed to setup subscription',
  [ProviderErrorCode.SUBSCRIPTION_NOT_FOUND]: 'Subscription not found',
  [ProviderErrorCode.CANCEL_FAILED]: 'Failed to cancel subscription',
  [ProviderErrorCode.PAUSE_FAILED]: 'Failed to pause subscription',
  [ProviderErrorCode.RESUME_FAILED]: 'Failed to resume subscription',
  [ProviderErrorCode.UPDATE_FAILED]: 'Failed to update subscription',
  [ProviderErrorCode.CHARGE_FAILED]: 'Failed to charge subscription',
  [ProviderErrorCode.CANNOT_CHARGE]: 'Subscription cannot be charged',
  [ProviderErrorCode.ORDER_STATUS_FAILED]: 'Failed to get order status',
  [ProviderErrorCode.ORDER_NOT_FOUND]: 'Order not found',
  [ProviderErrorCode.STATUS_CHECK_FAILED]: 'Failed to get subscription status',
  [ProviderErrorCode.API_ERROR]: 'Provider API error',
  [ProviderErrorCode.RATE_LIMITED]: 'Rate limited by provider',
  [ProviderErrorCode.TIMEOUT]: 'Request timed out',
  [ProviderErrorCode.WEBHOOK_SIGNATURE_INVALID]: 'Invalid webhook signature',
  [ProviderErrorCode.WEBHOOK_PARSE_FAILED]: 'Failed to parse webhook payload',
  [ProviderErrorCode.REFUND_FAILED]: 'Failed to process refund',
} as const;

// ============================================================================
// Provider-Specific Error Codes
// ============================================================================

/**
 * PhonePe-specific error codes
 */
export const PhonePeErrorCode = {
  ...ProviderErrorCode,
  INVALID_MPIN: 'INVALID_MPIN',
  MANDATE_NOT_FOUND: 'MANDATE_NOT_FOUND',
  SUBSCRIPTION_INACTIVE: 'SUBSCRIPTION_INACTIVE',
  REDEMPTION_FAILED: 'REDEMPTION_FAILED',
} as const;

/**
 * Razorpay-specific error codes
 */
export const RazorpayErrorCode = {
  ...ProviderErrorCode,
  PLAN_NOT_FOUND: 'PLAN_NOT_FOUND',
  OFFER_NOT_FOUND: 'OFFER_NOT_FOUND',
  OFFER_NOT_APPLICABLE: 'OFFER_NOT_APPLICABLE',
  SUBSCRIPTION_NOT_CANCELLABLE: 'SUBSCRIPTION_NOT_CANCELLABLE',
} as const;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get error message for an error code
 */
export function getErrorMessage(code: ProviderErrorCode): string {
  return ProviderErrorMessage[code];
}

/**
 * Create a provider error object
 */
export interface ProviderErrorData {
  readonly code: string;
  readonly message: string;
  readonly provider: 'RAZORPAY' | 'PHONEPE';
  readonly cause?: Error | null;
}

/**
 * Create a provider error data object
 */
export function createProviderErrorData(
  code: string,
  provider: 'RAZORPAY' | 'PHONEPE',
  cause?: Error | null,
): ProviderErrorData {
  return {
    code,
    message: ProviderErrorMessage[code as ProviderErrorCode] ?? 'Unknown error',
    provider,
    cause,
  };
}
