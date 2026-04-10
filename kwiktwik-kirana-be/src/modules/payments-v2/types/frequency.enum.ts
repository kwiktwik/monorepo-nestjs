/**
 * Billing Frequency Types
 * 
 * Defines the frequency of recurring charges for subscriptions.
 * Aligned with both Razorpay and PhonePe frequency options.
 */

/**
 * Billing frequency values
 */
export const BillingFrequency = {
  /** Daily billing */
  DAILY: 'DAILY',
  /** Weekly billing */
  WEEKLY: 'WEEKLY',
  /** Every two weeks (fortnightly) */
  FORTNIGHTLY: 'FORTNIGHTLY',
  /** Monthly billing */
  MONTHLY: 'MONTHLY',
  /** Twice a month (bimonthly) */
  BIMONTHLY: 'BIMONTHLY',
  /** Every three months */
  QUARTERLY: 'QUARTERLY',
  /** Every six months */
  HALF_YEARLY: 'HALF_YEARLY',
  /** Yearly billing */
  YEARLY: 'YEARLY',
  /** On-demand (manual trigger) */
  ON_DEMAND: 'ON_DEMAND',
} as const;

export type BillingFrequency = typeof BillingFrequency[keyof typeof BillingFrequency];

/**
 * All billing frequencies as a readonly array
 */
export const ALL_BILLING_FREQUENCIES: readonly BillingFrequency[] = [
  BillingFrequency.DAILY,
  BillingFrequency.WEEKLY,
  BillingFrequency.FORTNIGHTLY,
  BillingFrequency.MONTHLY,
  BillingFrequency.BIMONTHLY,
  BillingFrequency.QUARTERLY,
  BillingFrequency.HALF_YEARLY,
  BillingFrequency.YEARLY,
  BillingFrequency.ON_DEMAND,
] as const;

/**
 * Check if a value is a valid billing frequency
 */
export function isBillingFrequency(value: string): value is BillingFrequency {
  return ALL_BILLING_FREQUENCIES.includes(value as BillingFrequency);
}

/**
 * Approximate number of days for each frequency
 * Used for calculating next billing dates
 */
export const FrequencyToDays: Readonly<Record<BillingFrequency, number>> = {
  [BillingFrequency.DAILY]: 1,
  [BillingFrequency.WEEKLY]: 7,
  [BillingFrequency.FORTNIGHTLY]: 14,
  [BillingFrequency.MONTHLY]: 30,
  [BillingFrequency.BIMONTHLY]: 15,
  [BillingFrequency.QUARTERLY]: 90,
  [BillingFrequency.HALF_YEARLY]: 180,
  [BillingFrequency.YEARLY]: 365,
  [BillingFrequency.ON_DEMAND]: 0, // Manual trigger
} as const;

/**
 * Get the approximate number of days for a frequency
 */
export function getFrequencyDays(frequency: BillingFrequency): number {
  return FrequencyToDays[frequency];
}

/**
 * Calculate next billing date from a given date
 */
export function calculateNextBillingDate(
  frequency: BillingFrequency,
  fromDate: Date = new Date(),
): Date | null {
  const days = FrequencyToDays[frequency];
  if (days === 0) {
    return null; // ON_DEMAND has no automatic next billing
  }
  return new Date(fromDate.getTime() + days * 24 * 60 * 60 * 1000);
}

/**
 * Number of billing cycles per year for each frequency
 */
export const FrequencyCyclesPerYear: Readonly<Record<BillingFrequency, number>> = {
  [BillingFrequency.DAILY]: 365,
  [BillingFrequency.WEEKLY]: 52,
  [BillingFrequency.FORTNIGHTLY]: 26,
  [BillingFrequency.MONTHLY]: 12,
  [BillingFrequency.BIMONTHLY]: 24,
  [BillingFrequency.QUARTERLY]: 4,
  [BillingFrequency.HALF_YEARLY]: 2,
  [BillingFrequency.YEARLY]: 1,
  [BillingFrequency.ON_DEMAND]: 0, // Unlimited
} as const;

/**
 * Get the number of billing cycles per year
 */
export function getCyclesPerYear(frequency: BillingFrequency): number {
  return FrequencyCyclesPerYear[frequency];
}

/**
 * PhonePe frequency mapping
 * PhonePe uses specific frequency values
 */
export const PhonePeFrequencyMap: Readonly<Record<BillingFrequency, string>> = {
  [BillingFrequency.DAILY]: 'DAILY',
  [BillingFrequency.WEEKLY]: 'WEEKLY',
  [BillingFrequency.FORTNIGHTLY]: 'FORTNIGHTLY',
  [BillingFrequency.MONTHLY]: 'MONTHLY',
  [BillingFrequency.BIMONTHLY]: 'BIMONTHLY',
  [BillingFrequency.QUARTERLY]: 'QUARTERLY',
  [BillingFrequency.HALF_YEARLY]: 'HALFYEARLY',
  [BillingFrequency.YEARLY]: 'YEARLY',
  [BillingFrequency.ON_DEMAND]: 'ONDEMAND',
} as const;

/**
 * Get PhonePe frequency string
 */
export function toPhonePeFrequency(frequency: BillingFrequency): string {
  return PhonePeFrequencyMap[frequency];
}

/**
 * Parse PhonePe frequency to our enum
 */
export function fromPhonePeFrequency(phonePeFrequency: string): BillingFrequency | null {
  for (const [freq, phonePeValue] of Object.entries(PhonePeFrequencyMap)) {
    if (phonePeValue === phonePeFrequency) {
      return freq as BillingFrequency;
    }
  }
  return null;
}

/**
 * Alias for fromPhonePeFrequency
 */
export const mapPhonePeFrequency = fromPhonePeFrequency;

/**
 * Razorpay period mapping
 * Razorpay uses 'period' (daily/weekly/monthly/yearly) + 'interval' (number)
 */
export const RazorpayPeriodMap: Readonly<Record<BillingFrequency, { readonly period: string; readonly interval: number }>> = {
  [BillingFrequency.DAILY]: { period: 'daily', interval: 1 },
  [BillingFrequency.WEEKLY]: { period: 'weekly', interval: 1 },
  [BillingFrequency.FORTNIGHTLY]: { period: 'weekly', interval: 2 },
  [BillingFrequency.MONTHLY]: { period: 'monthly', interval: 1 },
  [BillingFrequency.BIMONTHLY]: { period: 'monthly', interval: 1 }, // Special handling needed
  [BillingFrequency.QUARTERLY]: { period: 'monthly', interval: 3 },
  [BillingFrequency.HALF_YEARLY]: { period: 'monthly', interval: 6 },
  [BillingFrequency.YEARLY]: { period: 'yearly', interval: 1 },
  [BillingFrequency.ON_DEMAND]: { period: 'monthly', interval: 1 }, // Special handling needed
} as const;

/**
 * Get Razorpay period and interval
 */
export function toRazorpayPeriod(frequency: BillingFrequency): { readonly period: string; readonly interval: number } {
  return RazorpayPeriodMap[frequency];
}
