/**
 * Base Provider Utilities
 * 
 * Shared utilities used by all provider implementations.
 */

import type { PaymentProvider } from '../../types/provider.enum';
import type { SubscriptionType } from '../../types/subscription-type.enum';
import type { BillingFrequency } from '../../types/frequency.enum';
import { toPhonePeFrequency, toRazorpayPeriod } from '../../types/frequency.enum';

// ============================================================================
// ID Generation
// ============================================================================

/**
 * Generate a unique ID with prefix
 */
export function generateId(prefix: string, length: number = 10): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}_${result}`;
}

/**
 * Generate merchant subscription ID
 */
export function generateMerchantSubscriptionId(): string {
  return generateId('MSUB', 12);
}

/**
 * Generate merchant order ID
 */
export function generateMerchantOrderId(): string {
  return generateId('MORD', 12);
}

/**
 * Generate merchant refund ID
 */
export function generateMerchantRefundId(): string {
  return generateId('MREF', 12);
}

// ============================================================================
// Timestamp Utilities
// ============================================================================

/**
 * Convert Unix timestamp (seconds) to Date
 */
export function unixToDate(timestamp: number): Date {
  // Handle both seconds and milliseconds
  const ms = timestamp > 1e12 ? timestamp : timestamp * 1000;
  return new Date(ms);
}

/**
 * Convert Date to Unix timestamp (seconds)
 */
export function dateToUnix(date: Date): number {
  return Math.floor(date.getTime() / 1000);
}

/**
 * Convert Date to Unix timestamp (milliseconds)
 */
export function dateToUnixMs(date: Date): number {
  return date.getTime();
}

/**
 * Get current Unix timestamp in seconds
 */
export function nowUnix(): number {
  return Math.floor(Date.now() / 1000);
}

/**
 * Get current Unix timestamp in milliseconds
 */
export function nowUnixMs(): number {
  return Date.now();
}

// ============================================================================
// Amount Utilities
// ============================================================================

/**
 * Convert rupees to paise
 */
export function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

/**
 * Convert paise to rupees
 */
export function paiseToRupees(paise: number): number {
  return paise / 100;
}

/**
 * Format amount for display
 */
export function formatAmount(paise: number, currency: string = 'INR'): string {
  const rupees = paiseToRupees(paise);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
  }).format(rupees);
}

// ============================================================================
// Signature Verification
// ============================================================================

import { createHmac, timingSafeEqual } from 'crypto';

/**
 * Verify HMAC SHA256 signature
 */
export function verifyHmacSha256(
  payload: string,
  signature: string,
  secret: string,
): boolean {
  const expected = createHmac('sha256', secret).update(payload).digest('hex');
  
  try {
    return timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expected),
    );
  } catch {
    return false;
  }
}

/**
 * Create HMAC SHA256 signature
 */
export function createHmacSha256(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('hex');
}

// ============================================================================
// Error Handling
// ============================================================================

/**
 * Provider error class
 */
export class ProviderError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly provider: PaymentProvider,
    public readonly originalError: Error | null = null,
    public readonly providerResponse: Record<string, unknown> | null = null,
  ) {
    super(message);
    this.name = 'ProviderError';
  }
}

/**
 * Create a provider error
 */
export function createProviderError(
  message: string,
  code: string,
  provider: PaymentProvider,
  originalError: Error | null = null,
  providerResponse: Record<string, unknown> | null = null,
): ProviderError {
  return new ProviderError(message, code, provider, originalError, providerResponse);
}

/**
 * Check if error is a provider error
 */
export function isProviderError(error: unknown): error is ProviderError {
  return error instanceof ProviderError;
}

// ============================================================================
// Validation
// ============================================================================

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number (Indian format)
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone.replace(/\D/g, ''));
}

/**
 * Validate amount (in paise)
 */
export function isValidAmount(amount: number): boolean {
  return Number.isInteger(amount) && amount >= 100; // Minimum 1 rupee
}

// ============================================================================
// Provider-Specific Helpers
// ============================================================================

/**
 * Get Razorpay plan period and interval from frequency
 */
export function getRazorpayPlanPeriod(frequency: BillingFrequency): {
  readonly period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  readonly interval: number;
} {
  const mapping = toRazorpayPeriod(frequency);
  return {
    period: mapping.period as 'daily' | 'weekly' | 'monthly' | 'yearly',
    interval: mapping.interval,
  };
}

/**
 * Get PhonePe frequency string
 */
export function getPhonePeFrequencyString(frequency: BillingFrequency): string {
  return toPhonePeFrequency(frequency);
}

// ============================================================================
// Webhook Utilities
// ============================================================================

/**
 * Extract event ID from webhook payload
 */
export function extractWebhookEventId(
  provider: PaymentProvider,
  payload: Record<string, unknown>,
): string {
  switch (provider) {
    case 'RAZORPAY':
      return String(payload['id'] ?? payload['entity'] ?? Date.now());
    case 'PHONEPE':
      return String(
        (payload['data'] as Record<string, unknown>)?.['orderId'] ??
        payload['type'] ??
        Date.now(),
      );
    default:
      return String(Date.now());
  }
}

/**
 * Extract timestamp from webhook payload
 */
export function extractWebhookTimestamp(
  provider: PaymentProvider,
  payload: Record<string, unknown>,
): Date {
  switch (provider) {
    case 'RAZORPAY':
      const createdAt = payload['created_at'];
      return createdAt ? unixToDate(createdAt as number) : new Date();
    case 'PHONEPE':
      return new Date();
    default:
      return new Date();
  }
}
