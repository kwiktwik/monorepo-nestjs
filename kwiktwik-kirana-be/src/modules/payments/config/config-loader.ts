/**
 * Payment Config Loader
 *
 * Loads payment provider configurations.
 * Loosely coupled: Can work with process.env directly OR NestJS ConfigService.
 */

import type {
  PaymentProviderConfig,
  PhonePeConfig,
  RazorpayConfig,
} from '../types';
import { normalizeAppIdForEnv } from '../types';

export interface ConfigSource {
  get(key: string): string | undefined;
}

/**
 * Load configs from any source (process.env or NestJS ConfigService)
 */
export function loadPaymentConfigs(
  source: ConfigSource,
): PaymentProviderConfig[] {
  const configs: PaymentProviderConfig[] = [];
  configs.push(...loadRazorpayConfigs(source));
  configs.push(...loadPhonePeConfigs(source));
  return configs;
}

function loadRazorpayConfigs(source: ConfigSource): RazorpayConfig[] {
  const configs: RazorpayConfig[] = [];
  const env =
    source.get('NODE_ENV') === 'production' ? 'production' : 'sandbox';

  // Default config
  const defaultKeyId = source.get('NEXT_PUBLIC_RAZORPAY_KEY_ID');
  const defaultKeySecret = source.get('RAZORPAY_KEY_SECRET');
  if (defaultKeyId && defaultKeySecret) {
    configs.push({
      id: 'default',
      provider: 'razorpay',
      environment: env,
      enabled: true,
      keyId: defaultKeyId,
      keySecret: defaultKeySecret,
      webhookSecret: source.get('RAZORPAY_WEBHOOK_SECRET'),
    });
  }

  // Per-app configs: RAZORPAY_KEY_ID_{APP_ID}
  for (const [key, value] of Object.entries(process.env)) {
    if (key.startsWith('RAZORPAY_KEY_ID_') && key !== 'RAZORPAY_KEY_ID') {
      const suffix = key.replace('RAZORPAY_KEY_ID_', '');
      const appId = suffix.toLowerCase().replace(/_/g, '.');
      const secretKey = `RAZORPAY_KEY_SECRET_${suffix}`;
      const webhookKey = `RAZORPAY_WEBHOOK_SECRET_${suffix}`;

      if (value && process.env[secretKey]) {
        configs.push({
          id: appId,
          provider: 'razorpay',
          environment: env,
          enabled: true,
          keyId: value,
          keySecret: process.env[secretKey],
          webhookSecret: process.env[webhookKey],
        });
      }
    }
  }
  return configs;
}

function loadPhonePeConfigs(source: ConfigSource): PhonePeConfig[] {
  const configs: PhonePeConfig[] = [];
  const env =
    (source.get('PHONEPE_ENV') || 'SANDBOX').toLowerCase() === 'production'
      ? 'production'
      : 'sandbox';

  for (const [key, value] of Object.entries(process.env)) {
    if (key.startsWith('PHONEPE_CLIENT_ID_')) {
      const suffix = key.replace('PHONEPE_CLIENT_ID_', '');
      const appId =
        suffix === 'DEV' || suffix === 'PROD'
          ? 'default'
          : suffix.toLowerCase().replace(/_/g, '.');
      const secretKey = `PHONEPE_CLIENT_SECRET_${suffix}`;

      if (value && process.env[secretKey]) {
        configs.push({
          id: appId,
          provider: 'phonepe',
          environment: env,
          enabled: true,
          merchantId:
            process.env[`PHONEPE_MERCHANT_ID_${suffix}`] ||
            (env === 'sandbox' ? 'PGTESTPAYUAT' : ''),
          clientId: value,
          clientSecret: process.env[secretKey],
          clientVersion: parseInt(
            process.env[`PHONEPE_CLIENT_VERSION_${suffix}`] || '1',
            10,
          ),
          saltKey: process.env[`PHONEPE_SALT_KEY_${suffix}`],
          saltIndex: process.env[`PHONEPE_SALT_INDEX_${suffix}`] || '1',
          baseUrl: process.env[`PHONEPE_BASE_URL_${suffix}`],
        });
      }
    }
  }
  return configs;
}

/**
 * Load single config by provider + appId
 */
export function loadConfigFromEnv(
  source: ConfigSource,
  provider: 'phonepe' | 'razorpay',
  appId: string,
): PaymentProviderConfig | null {
  const normalized = normalizeAppIdForEnv(appId);

  if (provider === 'razorpay') {
    const keyId =
      source.get(`RAZORPAY_KEY_ID_${normalized}`) ||
      source.get('NEXT_PUBLIC_RAZORPAY_KEY_ID');
    const keySecret =
      source.get(`RAZORPAY_KEY_SECRET_${normalized}`) ||
      source.get('RAZORPAY_KEY_SECRET');
    if (keyId && keySecret) {
      return {
        id: appId,
        provider: 'razorpay',
        environment:
          source.get('NODE_ENV') === 'production' ? 'production' : 'sandbox',
        enabled: true,
        keyId,
        keySecret,
        webhookSecret: source.get(`RAZORPAY_WEBHOOK_SECRET_${normalized}`),
      };
    }
    return null;
  }

  if (provider === 'phonepe') {
    const clientId =
      source.get(`PHONEPE_CLIENT_ID_${normalized}`) ||
      source.get('PHONEPE_CLIENT_ID');
    const clientSecret =
      source.get(`PHONEPE_CLIENT_SECRET_${normalized}`) ||
      source.get('PHONEPE_CLIENT_SECRET');
    if (clientId && clientSecret) {
      return {
        id: appId,
        provider: 'phonepe',
        environment:
          (source.get('PHONEPE_ENV') || 'SANDBOX').toLowerCase() ===
          'production'
            ? 'production'
            : 'sandbox',
        enabled: true,
        merchantId:
          source.get(`PHONEPE_MERCHANT_ID_${normalized}`) ||
          (source.get('PHONEPE_ENV') === 'PRODUCTION' ? '' : 'PGTESTPAYUAT'),
        clientId,
        clientSecret,
        clientVersion: parseInt(
          source.get(`PHONEPE_CLIENT_VERSION_${normalized}`) || '1',
          10,
        ),
        saltKey: source.get(`PHONEPE_SALT_KEY_${normalized}`),
        saltIndex: source.get(`PHONEPE_SALT_INDEX_${normalized}`) || '1',
      };
    }
    return null;
  }
  return null;
}
