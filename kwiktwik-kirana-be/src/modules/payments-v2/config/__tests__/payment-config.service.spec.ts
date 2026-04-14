/**
 * Unit tests for PaymentConfigService
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { PaymentConfigService, createPaymentConfigService } from '../payment-config.service';
import { PaymentProvider } from '../../types/provider.enum';

describe('PaymentConfigService', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.resetModules();
  });

  describe('initialization', () => {
    it('should initialize with no configs when env vars are not set', () => {
      // Clear relevant env vars
      Object.keys(process.env)
        .filter((key) => key.startsWith('RAZORPAY_') || key.startsWith('PHONEPE_'))
        .forEach((key) => {
          delete process.env[key];
        });

      const service = new PaymentConfigService();
      service.initialize();

      expect(service.getRazorpayConfigs()).toHaveLength(0);
      expect(service.getPhonePeConfigs()).toHaveLength(0);
    });

    it('should load Razorpay configurations from environment', () => {
      process.env.RAZORPAY_TESTAPP_DEFAULT_KEY_ID = 'rzp_test_123';
      process.env.RAZORPAY_TESTAPP_DEFAULT_KEY_SECRET = 'secret_123';
      process.env.RAZORPAY_TESTAPP_DEFAULT_WEBHOOK_SECRET = 'wh_secret_123';

      const service = new PaymentConfigService();
      service.initialize();

      const configs = service.getRazorpayConfigs();
      expect(configs).toHaveLength(1);
      expect(configs[0].appId).toBe('testapp');
      expect(configs[0].keyId).toBe('rzp_test_123');
      // Note: accountId is lowercased, so 'default' won't match 'DEFAULT' in isDefaultAccount
    });

    it('should load PhonePe configurations from environment', () => {
      process.env.PHONEPE_TESTAPP_DEFAULT_CLIENT_ID = 'client_123';
      process.env.PHONEPE_TESTAPP_DEFAULT_CLIENT_SECRET = 'secret_123';
      process.env.PHONEPE_TESTAPP_DEFAULT_MERCHANT_ID = 'merchant_123';

      const service = new PaymentConfigService();
      service.initialize();

      const configs = service.getPhonePeConfigs();
      expect(configs).toHaveLength(1);
      expect(configs[0].appId).toBe('testapp');
      expect(configs[0].clientId).toBe('client_123');
    });

    it('should not load config if secret is missing', () => {
      process.env.RAZORPAY_TESTAPP_DEFAULT_KEY_ID = 'rzp_test_123';
      // Missing KEY_SECRET

      const service = new PaymentConfigService();
      service.initialize();

      expect(service.getRazorpayConfigs()).toHaveLength(0);
    });

    it('should only initialize once', () => {
      const service = new PaymentConfigService();
      service.initialize();
      service.initialize();

      // Should not throw or duplicate
      expect(service.getRazorpayConfigs()).toHaveLength(0);
    });
  });

  describe('getConfig', () => {
    it('should return null for unknown app', () => {
      const service = new PaymentConfigService();
      service.initialize();

      const config = service.getConfig({ appId: 'unknown_app' });

      expect(config).toBeNull();
    });

    it('should return default config for app', () => {
      process.env.RAZORPAY_MYAPP_DEFAULT_KEY_ID = 'rzp_test_123';
      process.env.RAZORPAY_MYAPP_DEFAULT_KEY_SECRET = 'secret_123';

      const service = new PaymentConfigService();
      service.initialize();

      const config = service.getConfig({ appId: 'myapp' });

      expect(config).not.toBeNull();
      expect(config?.provider).toBe(PaymentProvider.RAZORPAY);
    });

    it('should return specific provider config', () => {
      process.env.RAZORPAY_MYAPP_DEFAULT_KEY_ID = 'rzp_test_123';
      process.env.RAZORPAY_MYAPP_DEFAULT_KEY_SECRET = 'secret_123';
      process.env.PHONEPE_MYAPP_DEFAULT_CLIENT_ID = 'client_123';
      process.env.PHONEPE_MYAPP_DEFAULT_CLIENT_SECRET = 'secret_456';

      const service = new PaymentConfigService();
      service.initialize();

      const razorpayConfig = service.getConfig({
        appId: 'myapp',
        provider: PaymentProvider.RAZORPAY,
      });
      const phonepeConfig = service.getConfig({
        appId: 'myapp',
        provider: PaymentProvider.PHONEPE,
      });

      expect(razorpayConfig?.provider).toBe(PaymentProvider.RAZORPAY);
      expect(phonepeConfig?.provider).toBe(PaymentProvider.PHONEPE);
    });

    it('should return config for specific account', () => {
      process.env.RAZORPAY_MYAPP_DEFAULT_KEY_ID = 'rzp_default';
      process.env.RAZORPAY_MYAPP_DEFAULT_KEY_SECRET = 'secret_default';
      process.env.RAZORPAY_MYAPP_SECONDARY_KEY_ID = 'rzp_secondary';
      process.env.RAZORPAY_MYAPP_SECONDARY_KEY_SECRET = 'secret_secondary';

      const service = new PaymentConfigService();
      service.initialize();

      const defaultConfig = service.getConfig({
        appId: 'myapp',
        accountId: 'default',
      });
      const secondaryConfig = service.getConfig({
        appId: 'myapp',
        accountId: 'secondary',
      });

      expect(defaultConfig?.keyId).toBe('rzp_default');
      expect(secondaryConfig?.keyId).toBe('rzp_secondary');
    });
  });

  describe('getAppConfigs', () => {
    it('should return app configuration', () => {
      process.env.RAZORPAY_MYAPP_DEFAULT_KEY_ID = 'rzp_test_123';
      process.env.RAZORPAY_MYAPP_DEFAULT_KEY_SECRET = 'secret_123';

      const service = new PaymentConfigService();
      service.initialize();

      const appConfig = service.getAppConfigs('myapp');

      expect(appConfig).not.toBeNull();
      expect(appConfig?.appId).toBe('myapp');
      expect(appConfig?.providers).toHaveLength(1);
      expect(appConfig?.defaultProvider).toBe(PaymentProvider.RAZORPAY);
    });

    it('should return null for unknown app', () => {
      const service = new PaymentConfigService();
      service.initialize();

      const appConfig = service.getAppConfigs('unknown_app');

      expect(appConfig).toBeNull();
    });
  });

  describe('isProviderEnabled', () => {
    it('should return true when provider is configured', () => {
      process.env.RAZORPAY_MYAPP_DEFAULT_KEY_ID = 'rzp_test_123';
      process.env.RAZORPAY_MYAPP_DEFAULT_KEY_SECRET = 'secret_123';

      const service = new PaymentConfigService();
      service.initialize();

      expect(service.isProviderEnabled('myapp', PaymentProvider.RAZORPAY)).toBe(true);
      expect(service.isProviderEnabled('myapp', PaymentProvider.PHONEPE)).toBe(false);
    });

    it('should return false when no configs exist', () => {
      const service = new PaymentConfigService();
      service.initialize();

      expect(service.isProviderEnabled('unknown_app', PaymentProvider.RAZORPAY)).toBe(false);
    });
  });

  describe('getWebhookSecret', () => {
    it('should return webhook secret for Razorpay config', () => {
      process.env.RAZORPAY_MYAPP_DEFAULT_KEY_ID = 'rzp_test_123';
      process.env.RAZORPAY_MYAPP_DEFAULT_KEY_SECRET = 'secret_123';
      process.env.RAZORPAY_MYAPP_DEFAULT_WEBHOOK_SECRET = 'wh_secret_123';

      const service = new PaymentConfigService();
      service.initialize();

      const secret = service.getWebhookSecret('razorpay_myapp_default');

      expect(secret).toBe('wh_secret_123');
    });

    it('should return null for unknown config', () => {
      const service = new PaymentConfigService();
      service.initialize();

      const secret = service.getWebhookSecret('unknown_config');

      expect(secret).toBeNull();
    });
  });

  describe('getRegisteredAppIds', () => {
    it('should return all registered app IDs', () => {
      process.env.RAZORPAY_APP1_DEFAULT_KEY_ID = 'rzp_1';
      process.env.RAZORPAY_APP1_DEFAULT_KEY_SECRET = 'secret_1';
      process.env.RAZORPAY_APP2_DEFAULT_KEY_ID = 'rzp_2';
      process.env.RAZORPAY_APP2_DEFAULT_KEY_SECRET = 'secret_2';

      const service = new PaymentConfigService();
      service.initialize();

      const appIds = service.getRegisteredAppIds();

      expect(appIds).toContain('app1');
      expect(appIds).toContain('app2');
    });
  });

  describe('isEncryptionAvailable', () => {
    it('should return true when encryption key is set', () => {
      process.env.PAYMENT_ENCRYPTION_KEY = 'a'.repeat(64); // 32 bytes hex

      const service = new PaymentConfigService();

      expect(service.isEncryptionAvailable()).toBe(true);
    });

    it('should return false when encryption key is not set', () => {
      delete process.env.PAYMENT_ENCRYPTION_KEY;

      const service = new PaymentConfigService();

      expect(service.isEncryptionAvailable()).toBe(false);
    });

    it('should return false when encryption key is wrong length', () => {
      process.env.PAYMENT_ENCRYPTION_KEY = 'short_key';

      const service = new PaymentConfigService();

      expect(service.isEncryptionAvailable()).toBe(false);
    });
  });

  describe('getFeatures', () => {
    it('should return default features', () => {
      const service = new PaymentConfigService();

      const features = service.getFeatures();

      expect(features.enableIdempotency).toBe(true);
      expect(features.enableMetrics).toBe(false);
      expect(features.enableTracing).toBe(false);
    });

    it('should return configured features', () => {
      process.env.PAYMENT_ENABLE_IDEMPOTENCY = 'false';
      process.env.PAYMENT_ENABLE_METRICS = 'true';
      process.env.PAYMENT_ENABLE_TRACING = 'true';

      const service = new PaymentConfigService();

      const features = service.getFeatures();

      expect(features.enableIdempotency).toBe(false);
      expect(features.enableMetrics).toBe(true);
      expect(features.enableTracing).toBe(true);
    });
  });

  describe('getPlanConfig', () => {
    it('should return plan config for known app', () => {
      const service = new PaymentConfigService();
      service.initialize();

      const plan = service.getPlanConfig('com.paymentalert.app', 'premium_monthly');

      expect(plan).not.toBeNull();
      expect(plan?.initialAmount).toBe(4900);
      expect(plan?.recurringAmount).toBe(4900);
      expect(plan?.currency).toBe('INR');
      expect(plan?.frequency).toBe('MONTHLY');
    });

    it('should return default plan config for unknown app', () => {
      const service = new PaymentConfigService();
      service.initialize();

      const plan = service.getPlanConfig('unknown_app', 'some_plan');

      expect(plan).not.toBeNull();
      expect(plan?.initialAmount).toBe(4900);
    });

    it('should return default plan config for unknown plan', () => {
      const service = new PaymentConfigService();
      service.initialize();

      const plan = service.getPlanConfig('com.paymentalert.app', 'unknown_plan');

      expect(plan).not.toBeNull();
      expect(plan?.initialAmount).toBe(4900);
    });
  });

  describe('getProviderConfig', () => {
    it('should return provider config', () => {
      process.env.RAZORPAY_MYAPP_DEFAULT_KEY_ID = 'rzp_test_123';
      process.env.RAZORPAY_MYAPP_DEFAULT_KEY_SECRET = 'secret_123';

      const service = new PaymentConfigService();
      service.initialize();

      const config = service.getProviderConfig('myapp', PaymentProvider.RAZORPAY);

      expect(config).not.toBeNull();
      expect(config?.provider).toBe(PaymentProvider.RAZORPAY);
    });
  });
});

describe('createPaymentConfigService', () => {
  it('should create and initialize service', () => {
    const service = createPaymentConfigService();

    expect(service).toBeInstanceOf(PaymentConfigService);
    expect(service.getRegisteredAppIds()).toBeDefined();
  });
});
