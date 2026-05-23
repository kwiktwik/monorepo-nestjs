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
    it('should initialize with no configs when env vars are not set', async () => {
      // Clear relevant env vars
      Object.keys(process.env)
        .filter((key) => key.startsWith('RAZORPAY_') || key.startsWith('PHONEPE_'))
        .forEach((key) => {
          delete process.env[key];
        });

      const service = new PaymentConfigService();
      await service.initialize();

      expect(service.getRazorpayConfigs()).toHaveLength(0);
      expect(service.getPhonePeConfigs()).toHaveLength(0);
    });

    it('should load Razorpay configurations from environment', async () => {
      process.env.RAZORPAY_TESTAPP_DEFAULT_KEY_ID = 'rzp_test_123';
      process.env.RAZORPAY_TESTAPP_DEFAULT_KEY_SECRET = 'secret_123';
      process.env.RAZORPAY_TESTAPP_DEFAULT_WEBHOOK_SECRET = 'wh_secret_123';

      const service = new PaymentConfigService();
      await service.initialize();

      const configs = service.getRazorpayConfigs();
      expect(configs).toHaveLength(1);
      expect(configs[0].appId).toBe('testapp');
      expect(configs[0].keyId).toBe('rzp_test_123');
    });

    it('should load PhonePe configurations from environment', async () => {
      process.env.PHONEPE_TESTAPP_DEFAULT_CLIENT_ID = 'client_123';
      process.env.PHONEPE_TESTAPP_DEFAULT_CLIENT_SECRET = 'secret_123';
      process.env.PHONEPE_TESTAPP_DEFAULT_MERCHANT_ID = 'merchant_123';

      const service = new PaymentConfigService();
      await service.initialize();

      const configs = service.getPhonePeConfigs();
      expect(configs).toHaveLength(1);
      expect(configs[0].appId).toBe('testapp');
      expect(configs[0].clientId).toBe('client_123');
    });

    it('should not load config if secret is missing', async () => {
      process.env.RAZORPAY_TESTAPP_DEFAULT_KEY_ID = 'rzp_test_123';
      // Missing KEY_SECRET

      const service = new PaymentConfigService();
      await service.initialize();

      expect(service.getRazorpayConfigs()).toHaveLength(0);
    });

    it('should only initialize once', async () => {
      const service = new PaymentConfigService();
      await service.initialize();
      await service.initialize();

      // Should not throw or duplicate
      expect(service.getRazorpayConfigs()).toHaveLength(0);
    });

    it('should load Razorpay config with dotted app ID from env', async () => {
      process.env.RAZORPAY_COM_KWIKTWIK_DATINGAI_DEFAULT_KEY_ID = 'rzp_live_123';
      process.env.RAZORPAY_COM_KWIKTWIK_DATINGAI_DEFAULT_KEY_SECRET = 'secret_123';
      process.env.RAZORPAY_COM_KWIKTWIK_DATINGAI_DEFAULT_WEBHOOK_SECRET = 'wh_secret_123';

      const service = new PaymentConfigService();
      await service.initialize();

      const configs = service.getRazorpayConfigs();
      expect(configs).toHaveLength(1);
      expect(configs[0].appId).toBe('com.kwiktwik.datingai');
      expect(configs[0].keyId).toBe('rzp_live_123');
      expect(configs[0].keySecret).toBe('secret_123');
      expect(configs[0].webhookSecret).toBe('wh_secret_123');
      expect(configs[0].isDefault).toBe(true);

      const appConfig = service.getAppConfigs('com.kwiktwik.datingai');
      expect(appConfig).not.toBeNull();
    });

    it('should load PhonePe config with dotted app ID from env', async () => {
      process.env.PHONEPE_COM_KWIKTWIK_DATINGAI_DEFAULT_CLIENT_ID = 'pp_client_123';
      process.env.PHONEPE_COM_KWIKTWIK_DATINGAI_DEFAULT_CLIENT_SECRET = 'pp_secret_123';
      process.env.PHONEPE_COM_KWIKTWIK_DATINGAI_DEFAULT_MERCHANT_ID = 'M_123';
      process.env.PHONEPE_COM_KWIKTWIK_DATINGAI_DEFAULT_CLIENT_VERSION = '2';
      process.env.PHONEPE_COM_KWIKTWIK_DATINGAI_DEFAULT_SALT_INDEX = '1';
      process.env.PHONEPE_COM_KWIKTWIK_DATINGAI_DEFAULT_CHECKOUT_MODE = 'STANDARD_CHECKOUT';

      const service = new PaymentConfigService();
      await service.initialize();

      const configs = service.getPhonePeConfigs();
      expect(configs).toHaveLength(1);
      expect(configs[0].appId).toBe('com.kwiktwik.datingai');
      expect(configs[0].clientId).toBe('pp_client_123');
      expect(configs[0].clientSecret).toBe('pp_secret_123');
      expect(configs[0].merchantId).toBe('M_123');
      expect(configs[0].clientVersion).toBe(2);
      expect(configs[0].checkoutMode).toBe('STANDARD_CHECKOUT');
    });
  });

  describe('getConfig', () => {
    it('should return null for unknown app', async () => {
      const service = new PaymentConfigService();
      await service.initialize();

      const config = service.getConfig({ appId: 'unknown_app' });

      expect(config).toBeNull();
    });

    it('should return default config for app', async () => {
      process.env.RAZORPAY_MYAPP_DEFAULT_KEY_ID = 'rzp_test_123';
      process.env.RAZORPAY_MYAPP_DEFAULT_KEY_SECRET = 'secret_123';

      const service = new PaymentConfigService();
      await service.initialize();

      const config = service.getConfig({ appId: 'myapp' });

      expect(config).not.toBeNull();
      expect(config?.provider).toBe(PaymentProvider.RAZORPAY);
    });

    it('should return specific provider config', async () => {
      process.env.RAZORPAY_MYAPP_DEFAULT_KEY_ID = 'rzp_test_123';
      process.env.RAZORPAY_MYAPP_DEFAULT_KEY_SECRET = 'secret_123';
      process.env.PHONEPE_MYAPP_DEFAULT_CLIENT_ID = 'client_123';
      process.env.PHONEPE_MYAPP_DEFAULT_CLIENT_SECRET = 'secret_456';

      const service = new PaymentConfigService();
      await service.initialize();

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

    it('should return config for specific account', async () => {
      process.env.RAZORPAY_MYAPP_DEFAULT_KEY_ID = 'rzp_default';
      process.env.RAZORPAY_MYAPP_DEFAULT_KEY_SECRET = 'secret_default';
      process.env.RAZORPAY_MYAPP_SECONDARY_KEY_ID = 'rzp_secondary';
      process.env.RAZORPAY_MYAPP_SECONDARY_KEY_SECRET = 'secret_secondary';

      const service = new PaymentConfigService();
      await service.initialize();

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
    it('should return app configuration', async () => {
      process.env.RAZORPAY_MYAPP_DEFAULT_KEY_ID = 'rzp_test_123';
      process.env.RAZORPAY_MYAPP_DEFAULT_KEY_SECRET = 'secret_123';

      const service = new PaymentConfigService();
      await service.initialize();

      const appConfig = service.getAppConfigs('myapp');

      expect(appConfig).not.toBeNull();
      expect(appConfig?.appId).toBe('myapp');
      expect(appConfig?.providers).toHaveLength(1);
      expect(appConfig?.defaultProvider).toBe(PaymentProvider.RAZORPAY);
    });

    it('should return null for unknown app', async () => {
      const service = new PaymentConfigService();
      await service.initialize();

      const appConfig = service.getAppConfigs('unknown_app');

      expect(appConfig).toBeNull();
    });
  });

  describe('isProviderEnabled', () => {
    it('should return true when provider is configured', async () => {
      process.env.RAZORPAY_MYAPP_DEFAULT_KEY_ID = 'rzp_test_123';
      process.env.RAZORPAY_MYAPP_DEFAULT_KEY_SECRET = 'secret_123';

      const service = new PaymentConfigService();
      await service.initialize();

      expect(service.isProviderEnabled('myapp', PaymentProvider.RAZORPAY)).toBe(true);
      expect(service.isProviderEnabled('myapp', PaymentProvider.PHONEPE)).toBe(false);
    });

    it('should return false when no configs exist', async () => {
      const service = new PaymentConfigService();
      await service.initialize();

      expect(service.isProviderEnabled('unknown_app', PaymentProvider.RAZORPAY)).toBe(false);
    });
  });

  describe('getWebhookSecret', () => {
    it('should return webhook secret for Razorpay config', async () => {
      process.env.RAZORPAY_MYAPP_DEFAULT_KEY_ID = 'rzp_test_123';
      process.env.RAZORPAY_MYAPP_DEFAULT_KEY_SECRET = 'secret_123';
      process.env.RAZORPAY_MYAPP_DEFAULT_WEBHOOK_SECRET = 'wh_secret_123';

      const service = new PaymentConfigService();
      await service.initialize();

      const secret = service.getWebhookSecret('razorpay_myapp_default');

      expect(secret).toBe('wh_secret_123');
    });

    it('should return null for unknown config', async () => {
      const service = new PaymentConfigService();
      await service.initialize();

      const secret = service.getWebhookSecret('unknown_config');

      expect(secret).toBeNull();
    });
  });

  describe('getRegisteredAppIds', () => {
    it('should return all registered app IDs', async () => {
      process.env.RAZORPAY_APP1_DEFAULT_KEY_ID = 'rzp_1';
      process.env.RAZORPAY_APP1_DEFAULT_KEY_SECRET = 'secret_1';
      process.env.RAZORPAY_APP2_DEFAULT_KEY_ID = 'rzp_2';
      process.env.RAZORPAY_APP2_DEFAULT_KEY_SECRET = 'secret_2';

      const service = new PaymentConfigService();
      await service.initialize();

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
    it('should return null when database is not available', async () => {
      const service = new PaymentConfigService(null);
      await service.initialize();

      const plan = await service.getPlanConfig('com.jugnu.alertpe', 'premium_monthly');

      expect(plan).toBeNull();
    });

    it('should return plan from database when available', async () => {
      const planResult = [{
        id: 'premium_monthly',
        appId: 'com.jugnu.alertpe',
        name: 'Premium Monthly',
        initialAmount: 4900,
        recurringAmount: 4900,
        currency: 'INR',
        frequency: 'MONTHLY',
        isActive: true,
      }];
      // where() must be thenable for the init call (resolves to [])
      // and must have .limit() for the plan query
      const whereResult = {
        then: (resolve: (v: unknown[]) => void) => Promise.resolve(resolve([])),
        limit: jest.fn().mockResolvedValue(planResult),
      };
      const mockDb = {
        select: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnValue(whereResult),
      } as any;

      const service = new PaymentConfigService(mockDb);
      await service.initialize();

      const plan = await service.getPlanConfig('com.jugnu.alertpe', 'premium_monthly');

      expect(plan).not.toBeNull();
      expect(plan?.initialAmount).toBe(4900);
      expect(plan?.recurringAmount).toBe(4900);
      expect(plan?.currency).toBe('INR');
      expect(plan?.frequency).toBe('MONTHLY');
    });

    it('should return null when plan not found in database', async () => {
      const whereResult = {
        then: (resolve: (v: unknown[]) => void) => Promise.resolve(resolve([])),
        limit: jest.fn().mockResolvedValue([]),
      };
      const mockDb = {
        select: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnValue(whereResult),
      } as any;

      const service = new PaymentConfigService(mockDb);
      await service.initialize();

      const plan = await service.getPlanConfig('com.jugnu.alertpe', 'unknown_plan');

      expect(plan).toBeNull();
    });
  });

  describe('getProviderConfig', () => {
    it('should return provider config', async () => {
      process.env.RAZORPAY_MYAPP_DEFAULT_KEY_ID = 'rzp_test_123';
      process.env.RAZORPAY_MYAPP_DEFAULT_KEY_SECRET = 'secret_123';

      const service = new PaymentConfigService();
      await service.initialize();

      const config = service.getProviderConfig('myapp', PaymentProvider.RAZORPAY);

      expect(config).not.toBeNull();
      expect(config?.provider).toBe(PaymentProvider.RAZORPAY);
    });
  });
});

describe('createPaymentConfigService', () => {
  it('should create and initialize service', async () => {
    const service = await createPaymentConfigService();

    expect(service).toBeInstanceOf(PaymentConfigService);
    expect(service.getRegisteredAppIds()).toBeDefined();
  });
});
