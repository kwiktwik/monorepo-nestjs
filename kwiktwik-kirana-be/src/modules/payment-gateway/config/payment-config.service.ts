/**
 * Payment Provider Configuration Service
 * 
 * Manages payment provider configurations for multiple apps and accounts.
 * 
 * Configuration is loaded from environment variables by scanning for patterns:
 * - RAZORPAY_{APP_ID}_{ACCOUNT_ID}_KEY_ID / _KEY_SECRET / _WEBHOOK_SECRET
 * - PHONEPE_{APP_ID}_{ACCOUNT_ID}_CLIENT_ID / _CLIENT_SECRET / ...
 * 
 * APP_ID uses dots-to-underscores uppercase (e.g. com.kwiktwik.datingai -> COM_KWIKTWIK_DATINGAI).
 * ACCOUNT_ID of DEFAULT, MAIN, or PRIMARY marks the config as the default for that app.
 */

import { Injectable, Inject, Logger, Optional } from '@nestjs/common';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and } from 'drizzle-orm';
import type { 
  RazorpayProviderConfig, 
  PhonePeProviderConfig,
  AnyProviderConfig,
} from '../providers/interfaces/subscription-provider.interface';
import { PaymentProvider } from '../types/provider.enum';
import { plans } from '../database/schema';
import { DRIZZLE_TOKEN } from '../../../database/drizzle.module';

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

  constructor(
    @Inject(DRIZZLE_TOKEN) @Optional() private readonly db: NodePgDatabase<any> | null = null,
  ) {}

  /**
   * Initialize the configuration service.
   * Loads provider configurations from the database first, then falls back
   * to environment variable scanning if the database is unavailable.
   * Secrets are always read from environment variables.
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    this.loadRazorpayConfigs();
    this.loadPhonePeConfigs();
    this.loadAppConfigs();
    this.initialized = true;

    this.logger.log(
      `Initialized with ${this.razorpayConfigs.size} Razorpay configs, ${this.phonepeConfigs.size} PhonePe configs`,
    );
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
   * Get provider config by its configId (e.g. "razorpay_testapp_default")
   */
  getConfigById(configId: string): AnyProviderConfig | null {
    this.ensureInitialized();
    return this.razorpayConfigs.get(configId)
      ?? this.phonepeConfigs.get(configId)
      ?? null;
  }

  /**
   * Get the first available config for a provider (any app)
   */
  getFirstConfigForProvider(provider: PaymentProvider): AnyProviderConfig | null {
    this.ensureInitialized();
    const configs = provider === PaymentProvider.RAZORPAY
      ? this.razorpayConfigs
      : this.phonepeConfigs;
    const first = configs.values().next();
    return first.done ? null : first.value;
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
   * Get plan configuration for an app from the database
   */
  async getPlanConfig(appId: string, planId: string): Promise<{
    planId: string;
    initialAmount: number;
    recurringAmount: number | null;
    currency: string;
    frequency: string;
  } | null> {
    this.ensureInitialized();

    if (!this.db) {
      this.logger.warn('Database not available, cannot load plan config');
      return null;
    }

    const rows = await this.db
      .select()
      .from(plans)
      .where(and(eq(plans.id, planId), eq(plans.appId, appId), eq(plans.isActive, true)))
      .limit(1);

    if (rows.length === 0) {
      this.logger.warn(`Plan ${planId} not found for app ${appId}`);
      return null;
    }

    const plan = rows[0];
    return {
      planId: plan.id,
      initialAmount: plan.initialAmount,
      recurringAmount: plan.recurringAmount,
      currency: plan.currency,
      frequency: plan.frequency,
    };
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  private ensureInitialized(): void {
    if (!this.initialized) {
      // Synchronous fallback — loads from env vars only.
      // Async callers should await initialize() before using the service.
      this.loadRazorpayConfigs();
      this.loadPhonePeConfigs();
      this.loadAppConfigs();
      this.initialized = true;
      this.logger.warn('Sync fallback initialization used (env vars only)');
    }
  }

  /**
   * Normalize an app ID to an env-var-friendly prefix segment.
   * e.g. "com.kwiktwik.datingai" → "COM_KWIKTWIK_DATINGAI"
   */
  private normalizeAppIdForEnv(appId: string): string {
    return appId.replace(/\./g, '_').toUpperCase();
  }

  /**
   * Reverse of normalizeAppIdForEnv.
   * e.g. "COM_KWIKTWIK_DATINGAI" → "com.kwiktwik.datingai"
   */
  private envSegmentToAppId(segment: string): string {
    return segment.toLowerCase().replace(/_/g, '.');
  }

  private loadRazorpayConfigs(): void {
    const env = process.env;
    const pattern = /^RAZORPAY_(.+)_(.+)_KEY_ID$/;

    for (const [key, value] of Object.entries(env)) {
      const match = key.match(pattern);
      if (!match || !value) continue;

      const appId = this.envSegmentToAppId(match[1]);
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
      this.logger.debug(`Loaded Razorpay config from env: ${configId}`);
    }
  }

  private loadPhonePeConfigs(): void {
    const env = process.env;
    const pattern = /^PHONEPE_(.+)_(.+)_CLIENT_ID$/;

    for (const [key, value] of Object.entries(env)) {
      const match = key.match(pattern);
      if (!match || !value) continue;

      const appId = this.envSegmentToAppId(match[1]);
      const accountId = match[2].toLowerCase();

      const clientSecret = env[`PHONEPE_${match[1]}_${match[2]}_CLIENT_SECRET`];
      const merchantId = env[`PHONEPE_${match[1]}_${match[2]}_MERCHANT_ID`];
      const clientVersion = env[`PHONEPE_${match[1]}_${match[2]}_CLIENT_VERSION`];
      const saltKey = env[`PHONEPE_${match[1]}_${match[2]}_SALT_KEY`];
      const saltIndex = env[`PHONEPE_${match[1]}_${match[2]}_SALT_INDEX`];
      const webhookSecret = env[`PHONEPE_${match[1]}_${match[2]}_WEBHOOK_SECRET`];
      const checkoutMode = env[`PHONEPE_${match[1]}_${match[2]}_CHECKOUT_MODE`];

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
        checkoutMode: checkoutMode === 'STANDARD_CHECKOUT' ? 'STANDARD_CHECKOUT' : 'API_INTEGRATION',
      };

      this.phonepeConfigs.set(configId, config);
      this.logger.debug(`Loaded PhonePe config from env: ${configId}`);
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
      const normalizedAppId = this.normalizeAppIdForEnv(appId);
      const defaultSubType = process.env[`${normalizedAppId}_DEFAULT_SUBSCRIPTION_TYPE`];

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
    const id = accountId.toUpperCase();
    return id === 'DEFAULT' || id === 'MAIN' || id === 'PRIMARY';
  }
}

// ============================================================================
// Static Helper for Non-DI Usage
// ============================================================================

/**
 * Create a configuration service instance (env-only, no DB)
 */
export async function createPaymentConfigService(): Promise<PaymentConfigService> {
  const service = new PaymentConfigService(null);
  await service.initialize();
  return service;
}
