/**
 * Payment Provider Configuration Service
 * 
 * Manages payment provider configurations for multiple apps and accounts.
 * Configuration is loaded from environment variables with the pattern:
 * - RAZORPAY_{APP_ID}_{ACCOUNT_ID}_KEY_ID
 * - RAZORPAY_{APP_ID}_{ACCOUNT_ID}_KEY_SECRET
 * - PHONEPE_{APP_ID}_{ACCOUNT_ID}_CLIENT_ID
 * - PHONEPE_{APP_ID}_{ACCOUNT_ID}_CLIENT_SECRET
 */

import { Injectable, Logger } from '@nestjs/common';
import type { 
  ProviderConfig, 
  RazorpayProviderConfig, 
  PhonePeProviderConfig,
  AnyProviderConfig,
} from '../providers/interfaces/subscription-provider.interface';
import { PaymentProvider } from '../types/provider.enum';

// ============================================================================
// Types
// ============================================================================

/**
 * Configuration for an app's payment settings
 */
export interface AppPaymentConfig {
  /** App ID */
  readonly appId: string;
  /** Default provider for this app */
  readonly defaultProvider: PaymentProvider;
  /** Default subscription type for this app */
  readonly defaultSubscriptionType: 'PROVIDER_MANAGED' | 'USER_MANAGED';
  /** Available provider configurations */
  readonly providers: readonly AnyProviderConfig[];
  /** Default configuration ID */
  readonly defaultConfigId: string;
}

/**
 * Configuration lookup parameters
 */
export interface ConfigLookupParams {
  /** App ID */
  readonly appId: string;
  /** Provider type (optional, uses default if not specified) */
  readonly provider?: PaymentProvider;
  /** Account ID (optional, uses default if not specified) */
  readonly accountId?: string;
}

/**
 * Environment variable configuration
 */
interface EnvConfig {
  readonly razorpay: Map<string, RazorpayProviderConfig>;
  readonly phonepe: Map<string, PhonePeProviderConfig>;
}

// ============================================================================
// Service
// ============================================================================

/**
 * Payment Configuration Service
 * 
 * Loads and manages payment provider configurations from environment variables.
 */
@Injectable()
export class PaymentConfigService {
  private readonly logger = new Logger(PaymentConfigService.name);
  private readonly razorpayConfigs: Map<string, RazorpayProviderConfig> = new Map();
  private readonly phonepeConfigs: Map<string, PhonePeProviderConfig> = new Map();
  private readonly appConfigs: Map<string, AppPaymentConfig> = new Map();
  private initialized = false;

  /**
   * Initialize the configuration service
   * Loads all configurations from environment variables
   */
  initialize(): void {
    if (this.initialized) {
      return;
    }

    this.loadRazorpayConfigs();
    this.loadPhonePeConfigs();
    this.loadAppConfigs();
    this.initialized = true;

    this.logger.log(`Initialized with ${this.razorpayConfigs.size} Razorpay configs, ${this.phonepeConfigs.size} PhonePe configs`);
  }

  /**
   * Get configuration for a specific app/provider/account
   */
  getConfig(params: ConfigLookupParams): AnyProviderConfig | null {
    this.ensureInitialized();

    const appConfig = this.appConfigs.get(params.appId);
    if (!appConfig) {
      this.logger.warn(`No configuration found for app: ${params.appId}`);
      return null;
    }

    // If provider not specified, use default
    const provider = params.provider ?? appConfig.defaultProvider;

    // Find matching config
    const configs = provider === PaymentProvider.RAZORPAY 
      ? Array.from(this.razorpayConfigs.values()).filter(c => c.appId === params.appId)
      : Array.from(this.phonepeConfigs.values()).filter(c => c.appId === params.appId);

    if (configs.length === 0) {
      this.logger.warn(`No ${provider} configuration found for app: ${params.appId}`);
      return null;
    }

    // If accountId specified, find matching config
    if (params.accountId) {
      const config = configs.find(c => c.configId.includes(params.accountId!));
      return config ?? null;
    }

    // Return default config (isDefault = true or first one)
    const defaultConfig = configs.find(c => c.isDefault) ?? configs[0];
    return defaultConfig;
  }

  /**
   * Get all configurations for an app
   */
  getAppConfigs(appId: string): AppPaymentConfig | null {
    this.ensureInitialized();
    return this.appConfigs.get(appId) ?? null;
  }

  /**
   * Get all Razorpay configurations
   */
  getRazorpayConfigs(): readonly RazorpayProviderConfig[] {
    this.ensureInitialized();
    return Array.from(this.razorpayConfigs.values());
  }

  /**
   * Get all PhonePe configurations
   */
  getPhonePeConfigs(): readonly PhonePeProviderConfig[] {
    this.ensureInitialized();
    return Array.from(this.phonepeConfigs.values());
  }

  /**
   * Check if a provider is enabled for an app
   */
  isProviderEnabled(appId: string, provider: PaymentProvider): boolean {
    this.ensureInitialized();
    
    if (provider === PaymentProvider.RAZORPAY) {
      return Array.from(this.razorpayConfigs.values()).some(c => c.appId === appId && c.enabled);
    }
    
    return Array.from(this.phonepeConfigs.values()).some(c => c.appId === appId && c.enabled);
  }

  /**
   * Get webhook secret for a configuration
   */
  getWebhookSecret(configId: string): string | null {
    this.ensureInitialized();

    const razorpayConfig = this.razorpayConfigs.get(configId);
    if (razorpayConfig) {
      return razorpayConfig.webhookSecret;
    }

    const phonepeConfig = this.phonepeConfigs.get(configId);
    if (phonepeConfig) {
      return phonepeConfig.webhookSecret;
    }

    return null;
  }

  /**
   * Get provider configuration for an app (simplified API)
   */
  getProviderConfig(
    appId: string,
    provider: PaymentProvider,
  ): AnyProviderConfig | null {
    return this.getConfig({ appId, provider });
  }

  /**
   * Get all registered app IDs
   */
  getRegisteredAppIds(): string[] {
    this.ensureInitialized();
    return Array.from(this.appConfigs.keys());
  }

  /**
   * Check if encryption is available
   */
  isEncryptionAvailable(): boolean {
    const key = process.env.PAYMENT_ENCRYPTION_KEY;
    return !!key && key.length === 64; // 32 bytes hex = 64 chars
  }

  /**
   * Get feature flags
   */
  getFeatures(): {
    enableIdempotency: boolean;
    enableMetrics: boolean;
    enableTracing: boolean;
  } {
    return {
      enableIdempotency: process.env.PAYMENT_ENABLE_IDEMPOTENCY !== 'false',
      enableMetrics: process.env.PAYMENT_ENABLE_METRICS === 'true',
      enableTracing: process.env.PAYMENT_ENABLE_TRACING === 'true',
    };
  }

  /**
   * Get plan configuration for an app
   * Returns plan details including pricing
   */
  getPlanConfig(appId: string, planId: string): {
    planId: string;
    initialAmount: number;
    recurringAmount: number;
    currency: string;
    frequency: string;
  } | null {
    this.ensureInitialized();

    // Default plan configurations
    // In production, this would be loaded from database or external config
    const planConfigs: Record<string, Record<string, {
      initialAmount: number;
      recurringAmount: number;
      currency: string;
      frequency: string;
    }>> = {
      'com.paymentalert.app': {
        'premium_monthly': {
          initialAmount: 4900, // ₹49
          recurringAmount: 4900,
          currency: 'INR',
          frequency: 'MONTHLY',
        },
        'premium_yearly': {
          initialAmount: 49900, // ₹499
          recurringAmount: 49900,
          currency: 'INR',
          frequency: 'YEARLY',
        },
      },
    };

    const appPlans = planConfigs[appId];
    if (!appPlans) {
      // Return default plan config
      return {
        planId,
        initialAmount: 4900,
        recurringAmount: 4900,
        currency: 'INR',
        frequency: 'MONTHLY',
      };
    }

    const plan = appPlans[planId];
    if (!plan) {
      // Return default plan config
      return {
        planId,
        initialAmount: 4900,
        recurringAmount: 4900,
        currency: 'INR',
        frequency: 'MONTHLY',
      };
    }

    return {
      planId,
      ...plan,
    };
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  private ensureInitialized(): void {
    if (!this.initialized) {
      this.initialize();
    }
  }

  private loadRazorpayConfigs(): void {
    const env = process.env;
    const pattern = /^RAZORPAY_(.+)_(.+)_KEY_ID$/;

    for (const [key, value] of Object.entries(env)) {
      const match = key.match(pattern);
      if (!match || !value) continue;

      const appId = match[1].toLowerCase();
      const accountId = match[2].toLowerCase();

      const keySecret = env[`RAZORPAY_${match[1]}_${match[2]}_KEY_SECRET`];
      const webhookSecret = env[`RAZORPAY_${match[1]}_${match[2]}_WEBHOOK_SECRET`];

      if (!keySecret) {
        this.logger.warn(`Missing KEY_SECRET for Razorpay config: ${key}`);
        continue;
      }

      const configId = `razorpay_${appId}_${accountId}`;
      const config: RazorpayProviderConfig = {
        configId,
        provider: PaymentProvider.RAZORPAY,
        appId,
        environment: this.getEnvironment(),
        enabled: true,
        isDefault: this.isDefaultAccount(accountId),
        webhookSecret: webhookSecret ?? null,
        keyId: value,
        keySecret,
        accountId,
      };

      this.razorpayConfigs.set(configId, config);
      this.logger.debug(`Loaded Razorpay config: ${configId}`);
    }
  }

  private loadPhonePeConfigs(): void {
    const env = process.env;
    const pattern = /^PHONEPE_(.+)_(.+)_CLIENT_ID$/;

    for (const [key, value] of Object.entries(env)) {
      const match = key.match(pattern);
      if (!match || !value) continue;

      const appId = match[1].toLowerCase();
      const accountId = match[2].toLowerCase();

      const clientSecret = env[`PHONEPE_${match[1]}_${match[2]}_CLIENT_SECRET`];
      const merchantId = env[`PHONEPE_${match[1]}_${match[2]}_MERCHANT_ID`];
      const clientVersion = env[`PHONEPE_${match[1]}_${match[2]}_CLIENT_VERSION`];
      const saltKey = env[`PHONEPE_${match[1]}_${match[2]}_SALT_KEY`];
      const saltIndex = env[`PHONEPE_${match[1]}_${match[2]}_SALT_INDEX`];
      const webhookSecret = env[`PHONEPE_${match[1]}_${match[2]}_WEBHOOK_SECRET`];

      if (!clientSecret) {
        this.logger.warn(`Missing CLIENT_SECRET for PhonePe config: ${key}`);
        continue;
      }

      const configId = `phonepe_${appId}_${accountId}`;
      const config: PhonePeProviderConfig = {
        configId,
        provider: PaymentProvider.PHONEPE,
        appId,
        environment: this.getEnvironment(),
        enabled: true,
        isDefault: this.isDefaultAccount(accountId),
        webhookSecret: webhookSecret ?? null,
        clientId: value,
        clientSecret,
        clientVersion: clientVersion ? parseInt(clientVersion, 10) : 1,
        merchantId: merchantId ?? '',
        saltKey: saltKey ?? null,
        saltIndex: saltIndex ?? null,
      };

      this.phonepeConfigs.set(configId, config);
      this.logger.debug(`Loaded PhonePe config: ${configId}`);
    }
  }

  private loadAppConfigs(): void {
    // Group configs by app
    const apps = new Set<string>();

    for (const config of this.razorpayConfigs.values()) {
      apps.add(config.appId);
    }

    for (const config of this.phonepeConfigs.values()) {
      apps.add(config.appId);
    }

    // Create app configs
    for (const appId of apps) {
      const razorpayConfigs = Array.from(this.razorpayConfigs.values())
        .filter(c => c.appId === appId);
      const phonepeConfigs = Array.from(this.phonepeConfigs.values())
        .filter(c => c.appId === appId);

      const providers: AnyProviderConfig[] = [
        ...razorpayConfigs,
        ...phonepeConfigs,
      ];

      // Determine default provider (prefer Razorpay if available)
      let defaultProvider: PaymentProvider = PaymentProvider.RAZORPAY;
      if (razorpayConfigs.length === 0 && phonepeConfigs.length > 0) {
        defaultProvider = PaymentProvider.PHONEPE;
      }

      // Find default config
      const defaultConfig = providers.find(c => c.isDefault) ?? providers[0];

      // Get default subscription type from env
      const defaultSubType = process.env[`${appId.toUpperCase()}_DEFAULT_SUBSCRIPTION_TYPE`];

      const appConfig: AppPaymentConfig = {
        appId,
        defaultProvider,
        defaultSubscriptionType: defaultSubType === 'USER_MANAGED' ? 'USER_MANAGED' : 'PROVIDER_MANAGED',
        providers,
        defaultConfigId: defaultConfig?.configId ?? '',
      };

      this.appConfigs.set(appId, appConfig);
    }
  }

  private getEnvironment(): 'SANDBOX' | 'PRODUCTION' {
    const env = process.env.NODE_ENV ?? process.env.APP_ENV;
    return env === 'production' ? 'PRODUCTION' : 'SANDBOX';
  }

  private isDefaultAccount(accountId: string): boolean {
    return accountId === 'DEFAULT' || accountId === 'MAIN' || accountId === 'PRIMARY';
  }
}

// ============================================================================
// Static Helper for Non-DI Usage
// ============================================================================

/**
 * Create a configuration service instance
 */
export function createPaymentConfigService(): PaymentConfigService {
  const service = new PaymentConfigService();
  service.initialize();
  return service;
}
