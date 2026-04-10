/**
 * Subscription Type Types
 * 
 * Defines how the subscription lifecycle is managed.
 * This is a critical distinction that affects billing, retries, and state management.
 */

/**
 * Subscription management type
 * 
 * PROVIDER_MANAGED: 
 *   - Payment provider handles auto-deduction on billing cycles
 *   - Provider manages retries internally
 *   - Provider sends webhooks for status changes
 *   - Examples: Razorpay subscriptions, PhonePe Autopay with autoDebit=true
 * 
 * USER_MANAGED:
 *   - Application initiates each charge manually
 *   - Application handles retry logic
 *   - Application manages billing schedule
 *   - Examples: One-time orders, manual renewals, PhonePe with autoDebit=false
 */
export const SubscriptionType = {
  /** Provider handles auto-deduction and retries */
  PROVIDER_MANAGED: 'PROVIDER_MANAGED',
  /** Application initiates charges and handles retries */
  USER_MANAGED: 'USER_MANAGED',
} as const;

export type SubscriptionType = typeof SubscriptionType[keyof typeof SubscriptionType];

/**
 * All subscription types as a readonly array
 */
export const ALL_SUBSCRIPTION_TYPES: readonly SubscriptionType[] = [
  SubscriptionType.PROVIDER_MANAGED,
  SubscriptionType.USER_MANAGED,
] as const;

/**
 * Check if a value is a valid subscription type
 */
export function isSubscriptionType(value: string): value is SubscriptionType {
  return ALL_SUBSCRIPTION_TYPES.includes(value as SubscriptionType);
}

/**
 * Description of each subscription type
 */
export const SubscriptionTypeDescriptions: Readonly<Record<SubscriptionType, string>> = {
  [SubscriptionType.PROVIDER_MANAGED]: 'Provider handles auto-deduction and retries',
  [SubscriptionType.USER_MANAGED]: 'Application initiates charges and handles retries',
} as const;

/**
 * Get the description for a subscription type
 */
export function getSubscriptionTypeDescription(type: SubscriptionType): string {
  return SubscriptionTypeDescriptions[type];
}

/**
 * Determine if retries should be handled by the application
 */
export function isApplicationRetries(type: SubscriptionType): boolean {
  return type === SubscriptionType.USER_MANAGED;
}

/**
 * Determine if charges are automatic
 */
export function isAutomaticCharging(type: SubscriptionType): boolean {
  return type === SubscriptionType.PROVIDER_MANAGED;
}
