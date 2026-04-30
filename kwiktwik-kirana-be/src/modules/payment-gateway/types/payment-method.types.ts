/**
 * Payment Method Types and Enums
 * 
 * Unified payment method types across all providers.
 * Each provider may support multiple payment methods with different capabilities.
 */

import type { PaymentProvider } from './provider.enum';

// ============================================================================
// Payment Method Types
// ============================================================================

/**
 * Payment method types
 * 
 * Each provider may support multiple payment methods.
 * These are unified types that map to provider-specific methods.
 */
export const PaymentMethodType = {
  // === Recurring/Subscriptions ===
  /** UPI Mandate with auto-debit (automatic charging) */
  UPI_AUTOPAY: 'UPI_AUTOPAY',
  /** UPI Mandate (manual trigger for each charge) */
  UPI_MANDATE: 'UPI_MANDATE',
  /** Card-based recurring payment */
  CARD_SUBSCRIPTION: 'CARD_SUBSCRIPTION',
  /** eNACH mandate */
  ENACH: 'ENACH',
  /** Paper NACH mandate */
  PAPER_NACH: 'PAPER_NACH',

  // === One-time Payments ===
  /** Dynamic QR code payment */
  UPI_QR: 'UPI_QR',
  /** UPI Intent flow (app redirection) */
  UPI_INTENT: 'UPI_INTENT',
  /** UPI Collect (request payment from VPA) */
  UPI_COLLECT: 'UPI_COLLECT',
  /** Card payment */
  CARD: 'CARD',
  /** Netbanking payment */
  NETBANKING: 'NETBANKING',
  /** Wallet payment */
  WALLET: 'WALLET',
  /** EMI payment */
  EMI: 'EMI',

  // === Offline Payments ===
  /** EDC machine payment */
  EDC: 'EDC',
  /** Payment link */
  PAYMENT_LINK: 'PAYMENT_LINK',
} as const;

export type PaymentMethodType = typeof PaymentMethodType[keyof typeof PaymentMethodType];

/**
 * All payment method types as a readonly array
 */
export const ALL_PAYMENT_METHOD_TYPES: readonly PaymentMethodType[] = [
  PaymentMethodType.UPI_AUTOPAY,
  PaymentMethodType.UPI_MANDATE,
  PaymentMethodType.CARD_SUBSCRIPTION,
  PaymentMethodType.ENACH,
  PaymentMethodType.PAPER_NACH,
  PaymentMethodType.UPI_QR,
  PaymentMethodType.UPI_INTENT,
  PaymentMethodType.UPI_COLLECT,
  PaymentMethodType.CARD,
  PaymentMethodType.NETBANKING,
  PaymentMethodType.WALLET,
  PaymentMethodType.EMI,
  PaymentMethodType.EDC,
  PaymentMethodType.PAYMENT_LINK,
] as const;

// ============================================================================
// Payment Method Categories
// ============================================================================

/**
 * Payment method category
 */
export const PaymentMethodCategory = {
  /** Recurring payment methods (subscriptions) */
  SUBSCRIPTION: 'SUBSCRIPTION',
  /** One-time payment methods */
  ONE_TIME: 'ONE_TIME',
  /** In-store/offline payment methods */
  OFFLINE: 'OFFLINE',
} as const;

export type PaymentMethodCategory = typeof PaymentMethodCategory[keyof typeof PaymentMethodCategory];

/**
 * Get category for a payment method type
 */
export function getPaymentMethodCategory(method: PaymentMethodType): PaymentMethodCategory {
  switch (method) {
    case PaymentMethodType.UPI_AUTOPAY:
    case PaymentMethodType.UPI_MANDATE:
    case PaymentMethodType.CARD_SUBSCRIPTION:
    case PaymentMethodType.ENACH:
    case PaymentMethodType.PAPER_NACH:
      return PaymentMethodCategory.SUBSCRIPTION;

    case PaymentMethodType.UPI_QR:
    case PaymentMethodType.UPI_INTENT:
    case PaymentMethodType.UPI_COLLECT:
    case PaymentMethodType.CARD:
    case PaymentMethodType.NETBANKING:
    case PaymentMethodType.WALLET:
    case PaymentMethodType.EMI:
      return PaymentMethodCategory.ONE_TIME;

    case PaymentMethodType.EDC:
    case PaymentMethodType.PAYMENT_LINK:
      return PaymentMethodCategory.OFFLINE;

    default:
      return PaymentMethodCategory.ONE_TIME;
  }
}

/**
 * Check if payment method is for subscriptions
 */
export function isSubscriptionMethod(method: PaymentMethodType): boolean {
  return getPaymentMethodCategory(method) === PaymentMethodCategory.SUBSCRIPTION;
}

/**
 * Check if payment method supports auto-debit
 */
export function supportsAutoDebit(method: PaymentMethodType): boolean {
  return method === PaymentMethodType.UPI_AUTOPAY;
}

// ============================================================================
// Payment Method Capabilities
// ============================================================================

/**
 * Payment method capabilities
 */
export interface PaymentMethodCapabilities {
  /** Supports automatic deduction */
  readonly supportsAutoDebit: boolean;
  /** Supports manual trigger of charges */
  readonly supportsManualTrigger: boolean;
  /** Supports refunds */
  readonly supportsRefund: boolean;
  /** Supports partial refunds */
  readonly supportsPartialRefund: boolean;
  /** Supports cancellation */
  readonly supportsCancellation: boolean;
  /** Supports pause/resume */
  readonly supportsPause: boolean;
  /** Maximum amount per transaction in paise (null = unlimited) */
  readonly maxAmount: number | null;
  /** Minimum amount per transaction in paise */
  readonly minAmount: number;
  /** Requires customer presence for payment */
  readonly requiresCustomerPresence: boolean;
  /** Supports variable amount */
  readonly supportsVariableAmount: boolean;
}

/**
 * Default capabilities by payment method type
 */
export const PaymentMethodCapabilitiesMap: Readonly<Record<PaymentMethodType, PaymentMethodCapabilities>> = {
  [PaymentMethodType.UPI_AUTOPAY]: {
    supportsAutoDebit: true,
    supportsManualTrigger: false,
    supportsRefund: true,
    supportsPartialRefund: true,
    supportsCancellation: true,
    supportsPause: true,
    maxAmount: 100000000, // 1 lakh in paise
    minAmount: 100,
    requiresCustomerPresence: false,
    supportsVariableAmount: true,
  },
  [PaymentMethodType.UPI_MANDATE]: {
    supportsAutoDebit: false,
    supportsManualTrigger: true,
    supportsRefund: true,
    supportsPartialRefund: true,
    supportsCancellation: true,
    supportsPause: true,
    maxAmount: 100000000,
    minAmount: 100,
    requiresCustomerPresence: false,
    supportsVariableAmount: true,
  },
  [PaymentMethodType.CARD_SUBSCRIPTION]: {
    supportsAutoDebit: true,
    supportsManualTrigger: false,
    supportsRefund: true,
    supportsPartialRefund: true,
    supportsCancellation: true,
    supportsPause: false,
    maxAmount: null,
    minAmount: 100,
    requiresCustomerPresence: false,
    supportsVariableAmount: false,
  },
  [PaymentMethodType.ENACH]: {
    supportsAutoDebit: true,
    supportsManualTrigger: false,
    supportsRefund: false,
    supportsPartialRefund: false,
    supportsCancellation: true,
    supportsPause: false,
    maxAmount: null,
    minAmount: 100,
    requiresCustomerPresence: false,
    supportsVariableAmount: false,
  },
  [PaymentMethodType.PAPER_NACH]: {
    supportsAutoDebit: true,
    supportsManualTrigger: false,
    supportsRefund: false,
    supportsPartialRefund: false,
    supportsCancellation: true,
    supportsPause: false,
    maxAmount: null,
    minAmount: 100,
    requiresCustomerPresence: false,
    supportsVariableAmount: false,
  },
  [PaymentMethodType.UPI_QR]: {
    supportsAutoDebit: false,
    supportsManualTrigger: false,
    supportsRefund: true,
    supportsPartialRefund: true,
    supportsCancellation: false,
    supportsPause: false,
    maxAmount: 100000000,
    minAmount: 100,
    requiresCustomerPresence: true,
    supportsVariableAmount: false,
  },
  [PaymentMethodType.UPI_INTENT]: {
    supportsAutoDebit: false,
    supportsManualTrigger: false,
    supportsRefund: true,
    supportsPartialRefund: true,
    supportsCancellation: false,
    supportsPause: false,
    maxAmount: 100000000,
    minAmount: 100,
    requiresCustomerPresence: true,
    supportsVariableAmount: false,
  },
  [PaymentMethodType.UPI_COLLECT]: {
    supportsAutoDebit: false,
    supportsManualTrigger: false,
    supportsRefund: true,
    supportsPartialRefund: true,
    supportsCancellation: true,
    supportsPause: false,
    maxAmount: 100000000,
    minAmount: 100,
    requiresCustomerPresence: false,
    supportsVariableAmount: false,
  },
  [PaymentMethodType.CARD]: {
    supportsAutoDebit: false,
    supportsManualTrigger: false,
    supportsRefund: true,
    supportsPartialRefund: true,
    supportsCancellation: false,
    supportsPause: false,
    maxAmount: null,
    minAmount: 100,
    requiresCustomerPresence: true,
    supportsVariableAmount: false,
  },
  [PaymentMethodType.NETBANKING]: {
    supportsAutoDebit: false,
    supportsManualTrigger: false,
    supportsRefund: true,
    supportsPartialRefund: true,
    supportsCancellation: false,
    supportsPause: false,
    maxAmount: null,
    minAmount: 100,
    requiresCustomerPresence: true,
    supportsVariableAmount: false,
  },
  [PaymentMethodType.WALLET]: {
    supportsAutoDebit: false,
    supportsManualTrigger: false,
    supportsRefund: true,
    supportsPartialRefund: true,
    supportsCancellation: false,
    supportsPause: false,
    maxAmount: 10000000, // 1 lakh
    minAmount: 100,
    requiresCustomerPresence: true,
    supportsVariableAmount: false,
  },
  [PaymentMethodType.EMI]: {
    supportsAutoDebit: false,
    supportsManualTrigger: false,
    supportsRefund: true,
    supportsPartialRefund: false,
    supportsCancellation: false,
    supportsPause: false,
    maxAmount: null,
    minAmount: 100000, // 1000 rupees minimum for EMI
    requiresCustomerPresence: true,
    supportsVariableAmount: false,
  },
  [PaymentMethodType.EDC]: {
    supportsAutoDebit: false,
    supportsManualTrigger: false,
    supportsRefund: true,
    supportsPartialRefund: true,
    supportsCancellation: false,
    supportsPause: false,
    maxAmount: null,
    minAmount: 100,
    requiresCustomerPresence: true,
    supportsVariableAmount: false,
  },
  [PaymentMethodType.PAYMENT_LINK]: {
    supportsAutoDebit: false,
    supportsManualTrigger: false,
    supportsRefund: true,
    supportsPartialRefund: true,
    supportsCancellation: true,
    supportsPause: false,
    maxAmount: null,
    minAmount: 100,
    requiresCustomerPresence: false,
    supportsVariableAmount: false,
  },
};

/**
 * Get capabilities for a payment method type
 */
export function getPaymentMethodCapabilities(method: PaymentMethodType): PaymentMethodCapabilities {
  return PaymentMethodCapabilitiesMap[method];
}

// ============================================================================
// Provider Payment Method Support
// ============================================================================

/**
 * Payment methods supported by each provider
 */
export const ProviderPaymentMethodSupport: Readonly<Record<PaymentProvider, readonly PaymentMethodType[]>> = {
  RAZORPAY: [
    PaymentMethodType.UPI_AUTOPAY,
    PaymentMethodType.UPI_MANDATE,
    PaymentMethodType.CARD_SUBSCRIPTION,
    PaymentMethodType.ENACH,
    PaymentMethodType.PAPER_NACH,
    PaymentMethodType.UPI_QR,
    PaymentMethodType.UPI_INTENT,
    PaymentMethodType.UPI_COLLECT,
    PaymentMethodType.CARD,
    PaymentMethodType.NETBANKING,
    PaymentMethodType.WALLET,
    PaymentMethodType.EMI,
    PaymentMethodType.PAYMENT_LINK,
  ] as const,
  PHONEPE: [
    PaymentMethodType.UPI_AUTOPAY,
    PaymentMethodType.UPI_MANDATE,
    PaymentMethodType.UPI_QR,
    PaymentMethodType.UPI_INTENT,
    PaymentMethodType.UPI_COLLECT,
    PaymentMethodType.CARD,
    PaymentMethodType.NETBANKING,
    PaymentMethodType.WALLET,
    PaymentMethodType.PAYMENT_LINK,
  ] as const,
};

/**
 * Check if provider supports a payment method
 */
export function providerSupportsMethod(provider: PaymentProvider, method: PaymentMethodType): boolean {
  return ProviderPaymentMethodSupport[provider].includes(method);
}

/**
 * Get supported payment methods for a provider
 */
export function getProviderPaymentMethods(provider: PaymentProvider): readonly PaymentMethodType[] {
  return ProviderPaymentMethodSupport[provider];
}

// ============================================================================
// Payment Method Configuration
// ============================================================================

/**
 * Payment method configuration for an app/provider
 */
export interface PaymentMethodConfig {
  /** Payment method type */
  readonly methodType: PaymentMethodType;
  /** Payment method category */
  readonly category: PaymentMethodCategory;
  /** Whether this method is enabled */
  readonly enabled: boolean;
  /** Capabilities of this method */
  readonly capabilities: PaymentMethodCapabilities;
  /** Provider-specific configuration */
  readonly providerConfig?: Record<string, unknown>;
  /** Display name for UI */
  readonly displayName: string;
  /** Description for UI */
  readonly description: string;
  /** Icon URL for UI */
  readonly iconUrl?: string;
  /** Priority for display ordering */
  readonly priority: number;
}

/**
 * Create a payment method configuration
 */
export function createPaymentMethodConfig(
  methodType: PaymentMethodType,
  options?: Partial<Omit<PaymentMethodConfig, 'methodType' | 'category' | 'capabilities'>>,
): PaymentMethodConfig {
  const capabilities = getPaymentMethodCapabilities(methodType);
  const category = getPaymentMethodCategory(methodType);

  return {
    methodType,
    category,
    enabled: options?.enabled ?? true,
    capabilities,
    providerConfig: options?.providerConfig,
    displayName: options?.displayName ?? getDefaultDisplayName(methodType),
    description: options?.description ?? '',
    iconUrl: options?.iconUrl,
    priority: options?.priority ?? 0,
  };
}

/**
 * Get default display name for a payment method
 */
function getDefaultDisplayName(method: PaymentMethodType): string {
  const displayNames: Record<PaymentMethodType, string> = {
    [PaymentMethodType.UPI_AUTOPAY]: 'UPI Autopay',
    [PaymentMethodType.UPI_MANDATE]: 'UPI Mandate',
    [PaymentMethodType.CARD_SUBSCRIPTION]: 'Card Subscription',
    [PaymentMethodType.ENACH]: 'eNACH',
    [PaymentMethodType.PAPER_NACH]: 'Paper NACH',
    [PaymentMethodType.UPI_QR]: 'UPI QR Code',
    [PaymentMethodType.UPI_INTENT]: 'UPI App',
    [PaymentMethodType.UPI_COLLECT]: 'UPI Collect',
    [PaymentMethodType.CARD]: 'Card',
    [PaymentMethodType.NETBANKING]: 'Netbanking',
    [PaymentMethodType.WALLET]: 'Wallet',
    [PaymentMethodType.EMI]: 'EMI',
    [PaymentMethodType.EDC]: 'EDC Machine',
    [PaymentMethodType.PAYMENT_LINK]: 'Payment Link',
  };
  return displayNames[method] ?? method;
}

// ============================================================================
// Payment Intent Types
// ============================================================================

/**
 * Payment intent for client-side payment initiation
 */
export interface PaymentIntent {
  /** Merchant order ID */
  readonly merchantOrderId: string;
  /** Provider order ID */
  readonly providerOrderId: string;
  /** Payment method type */
  readonly paymentMethodType: PaymentMethodType;
  /** Amount in paise */
  readonly amount: number;
  /** Currency code */
  readonly currency: string;
  /** Intent URL for client-side (UPI intent, etc.) */
  readonly intentUrl?: string;
  /** QR code data (for QR payments) */
  readonly qrCode?: string;
  /** Deep link for mobile apps */
  readonly deepLink?: string;
  /** Redirect URL for web */
  readonly redirectUrl?: string;
  /** Expiration timestamp */
  readonly expiresAt?: Date;
  /** Provider-specific data */
  readonly providerData?: Record<string, unknown>;
}

/**
 * Create payment intent parameters
 */
export interface CreatePaymentIntentParams {
  readonly methodType: PaymentMethodType;
  readonly merchantOrderId: string;
  readonly amount: number;
  readonly currency?: string;
  readonly customerEmail?: string;
  readonly customerPhone?: string;
  readonly customerVpa?: string;
  readonly redirectUrl?: string;
  readonly metadata?: Record<string, string>;
  readonly subscriptionDetails?: {
    readonly subscriptionType: 'PROVIDER_MANAGED' | 'USER_MANAGED';
    readonly frequency: string;
    readonly recurringAmount: number;
    readonly maxAmount?: number;
    readonly startDate?: Date;
  };
}
