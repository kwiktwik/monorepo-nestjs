/**
 * Payment Provider Types
 * 
 * Supported payment providers in the system.
 * Each provider has different subscription lifecycle management.
 */

/**
 * Supported payment providers
 */
export const PaymentProvider = {
  /** Razorpay - supports both provider-managed and user-managed subscriptions */
  RAZORPAY: 'RAZORPAY',
  /** PhonePe - supports autopay with notify/execute flow */
  PHONEPE: 'PHONEPE',
} as const;

export type PaymentProvider = typeof PaymentProvider[keyof typeof PaymentProvider];

/**
 * All supported payment providers as a readonly array
 */
export const ALL_PAYMENT_PROVIDERS: readonly PaymentProvider[] = [
  PaymentProvider.RAZORPAY,
  PaymentProvider.PHONEPE,
] as const;

/**
 * Check if a value is a valid payment provider
 */
export function isPaymentProvider(value: string): value is PaymentProvider {
  return ALL_PAYMENT_PROVIDERS.includes(value as PaymentProvider);
}

/**
 * Payment provider display names for logging and UI
 */
export const PaymentProviderLabels: Readonly<Record<PaymentProvider, string>> = {
  [PaymentProvider.RAZORPAY]: 'Razorpay',
  [PaymentProvider.PHONEPE]: 'PhonePe',
} as const;

/**
 * Get the display label for a payment provider
 */
export function getProviderLabel(provider: PaymentProvider): string {
  return PaymentProviderLabels[provider];
}
