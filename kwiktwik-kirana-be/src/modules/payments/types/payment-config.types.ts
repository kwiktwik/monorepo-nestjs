/**
 * Payment Provider Configuration Types
 *
 * These types define the configuration structure for payment providers.
 * Designed to support multiple configs per provider (e.g., per-app configs).
 *
 * Loosely coupled: No framework dependencies. Pure TypeScript.
 */

export interface BasePaymentConfig {
  /** Unique identifier for this config (e.g., appId) */
  id: string;
  /** Provider type */
  provider: PaymentProviderType;
  /** Environment: sandbox or production */
  environment: 'sandbox' | 'production';
  /** Whether this config is enabled */
  enabled: boolean;
  /** Optional metadata */
  metadata?: Record<string, unknown>;
}

export type PaymentProviderType = 'phonepe' | 'razorpay' | string;

export interface PhonePeConfig extends BasePaymentConfig {
  provider: 'phonepe';
  merchantId: string;
  clientId: string;
  clientSecret: string;
  clientVersion?: number;
  saltKey?: string;
  saltIndex?: string;
  baseUrl?: string;
  redirectUrl?: string;
  callbackUrl?: string;
}

export interface RazorpayConfig extends BasePaymentConfig {
  provider: 'razorpay';
  keyId: string;
  keySecret: string;
  webhookSecret?: string;
  accountEmail?: string;
}

export type PaymentProviderConfig = PhonePeConfig | RazorpayConfig;

export interface ConfigResolutionOptions {
  fallbackToDefault?: boolean;
  defaultConfigId?: string;
}

export function normalizeAppIdForEnv(appId: string): string {
  return appId.replace(/\./g, '_').toUpperCase();
}
