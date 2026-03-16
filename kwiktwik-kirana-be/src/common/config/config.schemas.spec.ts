import {
  AppConfigDataSchema,
  validateAppConfig,
  validateAllAppConfigs,
  AppConfigDataInput,
} from './config.schemas';
import { APP_CONFIGS } from '../../modules/config/config.data';

describe('Config Schemas', () => {
  describe('AppConfigDataSchema', () => {
    const validConfig: AppConfigDataInput = {
      app: {
        name: 'Test App',
        version: '1.0.0',
        environment: 'development',
        id: 'com.test.app',
      },
      features: {
        subscription: {
          plan_id: 'plan_test',
        },
        gateway: 'RAZORPAY',
        order: {
          amount: 500,
          currency: 'INR',
          payment_method: 'upi',
          isRecurring: true,
          token: {
            frequency: 'monthly',
            max_amount: 19900,
            expire_at: 1735689600,
          },
        },
        otpLogin: true,
        truecallerLogin: true,
        googleLogin: true,
      },
      limits: {
        maxOrdersPerDay: null,
        maxOrdersPerMonth: null,
        maxRecurringOrders: null,
      },
      ui: {
        theme: 'light',
        supportedLanguages: ['en', 'hi'],
        defaultLanguage: 'en',
        paywall: {
          pricing: {
            initialAmount: '₹5',
            recurringAmount: '₹199',
            period: 'month',
          },
          heading: 'Test Heading',
          description: 'Test Description',
          buttonText: 'Buy Now',
        },
      },
      api: {
        timeout: 30000,
        retryAttempts: 3,
      },
      appUpdate: {
        enabled: false,
        forceUpdate: false,
        minVersion: '1.0.0',
        latestVersion: '1.0.0',
        updateUrl: '',
        updateTitle: 'Update Available',
        updateMessage: 'A new version is available',
      },
      videos: {
        en: {
          fallback_video: 'https://example.com/fallback.mp4',
          paywall_video: 'https://example.com/paywall.mp4',
        },
      },
    };

    it('should validate a correct config', () => {
      const result = AppConfigDataSchema.safeParse(validConfig);
      expect(result.success).toBe(true);
    });

    it('should fail validation for missing required fields', () => {
      const invalidConfig = {
        ...validConfig,
        app: {
          ...validConfig.app,
          name: '', // Empty name should fail
        },
      };

      const result = AppConfigDataSchema.safeParse(invalidConfig);
      expect(result.success).toBe(false);
    });

    it('should apply default values', () => {
      const minimalConfig: any = {
        app: {
          name: 'Minimal App',
          id: 'com.minimal.app',
        },
        features: {
          subscription: { plan_id: 'plan_123' },
          order: {
            amount: 100,
            token: {
              frequency: 'monthly',
              max_amount: 10000,
              expire_at: 1735689600,
            },
          },
        },
        limits: {},
        ui: {
          supportedLanguages: ['en'],
          paywall: {
            pricing: {
              initialAmount: '₹10',
              recurringAmount: '₹100',
              period: 'month',
            },
            heading: 'Test',
            description: 'Test',
            buttonText: 'Buy',
          },
        },
        api: {},
        appUpdate: {
          updateMessage: 'Update available',
        },
        videos: {},
      };

      const result = AppConfigDataSchema.safeParse(minimalConfig);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.app.version).toBe('1.0.0');
        expect(result.data.app.environment).toBe('development');
        expect(result.data.features.gateway).toBe('RAZORPAY');
        expect(result.data.features.otpLogin).toBe(true);
        expect(result.data.ui.theme).toBe('light');
        expect(result.data.api.timeout).toBe(30000);
      }
    });

    it('should validate gateway enum values', () => {
      const invalidGateway = {
        ...validConfig,
        features: {
          ...validConfig.features,
          gateway: 'INVALID_GATEWAY',
        },
      };

      const result = AppConfigDataSchema.safeParse(invalidGateway);
      expect(result.success).toBe(false);
    });

    it('should validate theme enum values', () => {
      const invalidTheme = {
        ...validConfig,
        ui: {
          ...validConfig.ui,
          theme: 'invalid_theme',
        },
      };

      const result = AppConfigDataSchema.safeParse(invalidTheme);
      expect(result.success).toBe(false);
    });
  });

  describe('validateAppConfig', () => {
    it('should return success for valid config', () => {
      const validConfig = APP_CONFIGS['com.paymentalert.app'];
      const result = validateAppConfig(validConfig, 'com.paymentalert.app');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.app.name).toBe('Payment Alert');
      }
    });

    it('should return errors for invalid config', () => {
      const invalidConfig = { invalid: true };
      const result = validateAppConfig(invalidConfig, 'test.app');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors.length).toBeGreaterThan(0);
      }
    });
  });

  describe('validateAllAppConfigs', () => {
    it('should validate all current app configs', () => {
      const result = validateAllAppConfigs(
        APP_CONFIGS as Record<string, unknown>,
      );

      expect(result.valid).toBe(true);
      expect(result.validApps.length).toBeGreaterThan(0);
      expect(result.invalidApps).toHaveLength(0);
    });

    it('should detect invalid configs', () => {
      const configsWithInvalid = {
        valid: APP_CONFIGS['com.paymentalert.app'],
        invalid: { notAConfig: true },
      };

      const result = validateAllAppConfigs(
        configsWithInvalid as Record<string, unknown>,
      );

      expect(result.valid).toBe(false);
      expect(result.validApps).toContain('valid');
      expect(result.invalidApps.some((inv) => inv.appId === 'invalid')).toBe(
        true,
      );
    });
  });

  describe('Real config validation', () => {
    it('all existing app configs should pass schema validation', () => {
      Object.entries(APP_CONFIGS).forEach(([appId, config]) => {
        const result = validateAppConfig(config, appId);
        expect(result.success).toBe(true);
      });
    });

    it('should preserve all config data after validation', () => {
      Object.entries(APP_CONFIGS).forEach(([appId, originalConfig]) => {
        const result = validateAppConfig(originalConfig, appId);
        if (result.success) {
          // Check key fields are preserved
          expect(result.data.app.id).toBe(originalConfig.app.id);
          expect(result.data.app.name).toBe(originalConfig.app.name);
          expect(result.data.features.subscription.plan_id).toBe(
            originalConfig.features.subscription.plan_id,
          );
        }
      });
    });
  });
});
