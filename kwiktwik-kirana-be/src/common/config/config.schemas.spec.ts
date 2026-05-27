import {
  AppConfigDataSchema,
  validateAppConfig,
  validateAllAppConfigs,
  AppConfigDataInput,
  AppSettingsSchema,
  validateAppSettings,
  AppSettingsInput,
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
            recurringAmount: '₹249',
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
        expect(result.data.features.otpLogin).toBe(true);
        expect(result.data.ui.theme).toBe('light');
        expect(result.data.api.timeout).toBe(30000);
      }
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
      const validConfig = APP_CONFIGS['com.jugnu.alertpe'];
      const result = validateAppConfig(validConfig, 'com.jugnu.alertpe');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.app.name).toBe('AlertPe');
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
        valid: APP_CONFIGS['com.jugnu.alertpe'],
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

  describe('AppSettingsSchema', () => {
    const validSettings: AppSettingsInput = {
      ui: {
        theme: 'light',
        paywall: {
          steps: [
            { title: 'Start for ₹5', subtitle: '₹5 needed to verify' },
            { title: '1-Day FREE', subtitle: 'Instant UPI alerts' },
            { title: 'Tomorrow - Member', subtitle: 'Autopay ₹199/month' },
          ],
          heading: 'Never miss a payment',
          pricing: {
            period: 'month',
            initialAmount: '₹5',
            recurringAmount: '₹199',
          },
          trialText: 'Start FREE trial ₹5 <s>₹199</s>',
          buttonText: 'START 1-DAY FREE TRIAL',
          ratingText: '4.5 (10 lakh+ install)',
          refundedText: 'REFUNDED INSTANTLY',
          supportsText: 'Supports all UPI apps',
          socialProofText: '{name} from {city} just activated alerts',
          videoDescription: 'Get instant payment alerts',
        },
        defaultLanguage: 'en',
        supportedLanguages: ['en', 'hi'],
      },
      api: { timeout: 30000, retryAttempts: 3 },
      limits: {
        maxOrdersPerDay: null,
        maxOrdersPerMonth: null,
        maxRecurringOrders: null,
      },
      videos: {
        en: {
          paywall_video: 'https://cdn.example.com/en.mp4',
          fallback_video: 'https://cdn.example.com/en_fallback.mp4',
        },
      },
      features: {
        otpLogin: true,
        googleLogin: true,
        subscription: { plan_id: 'alert_soundbox_standard_199' },
        truecallerLogin: true,
      },
      appUpdate: {
        enabled: false,
        updateUrl: 'https://play.google.com/store/apps/details?id=com.app',
        minVersion: '1.0.0',
        forceUpdate: false,
        updateTitle: 'Update Available',
        latestVersion: '1.0.0',
        updateMessage: 'Please update to continue.',
      },
      translations: {
        en: {
          steps: [
            { title: 'Start for ₹5', subtitle: '₹5 needed to verify' },
            { title: '1-Day FREE', subtitle: 'Instant UPI alerts' },
            { title: 'Tomorrow - Member', subtitle: 'Autopay ₹199/month' },
          ],
          heading: 'Never miss a payment',
          trialText: 'Start FREE trial ₹5 <s>₹199</s>',
          buttonText: 'Subscribe Now',
          ratingText: '4.5 (10 lakh+ install)',
          description: 'Instant voice alerts for every UPI payment.',
          refundedText: 'REFUNDED INSTANTLY',
          supportsText: 'Supports all UPI apps',
          socialProofText: '{name} from {city} just activated alerts',
          videoDescription: 'Get instant payment alerts',
        },
      },
    };

    it('should validate a correct settings object', () => {
      const result = AppSettingsSchema.safeParse(validSettings);
      expect(result.success).toBe(true);
    });

    it('should fail when paywall steps are missing', () => {
      const bad = {
        ...validSettings,
        ui: {
          ...validSettings.ui,
          paywall: { ...validSettings.ui.paywall, steps: [] },
        },
      };
      const result = AppSettingsSchema.safeParse(bad);
      expect(result.success).toBe(false);
    });

    it('should fail when a translation is missing required keys', () => {
      const bad = {
        ...validSettings,
        translations: {
          en: { heading: 'test' }, // missing most keys
        },
      };
      const result = AppSettingsSchema.safeParse(bad);
      expect(result.success).toBe(false);
    });

    it('should fail when subscription plan_id is empty', () => {
      const bad = {
        ...validSettings,
        features: {
          ...validSettings.features,
          subscription: { plan_id: '' },
        },
      };
      const result = AppSettingsSchema.safeParse(bad);
      expect(result.success).toBe(false);
    });

    it('should apply defaults for optional fields', () => {
      const result = AppSettingsSchema.safeParse(validSettings);
      if (result.success) {
        expect(result.data.ui.theme).toBe('light');
        expect(result.data.api.timeout).toBe(30000);
        expect(result.data.features.otpLogin).toBe(true);
      }
    });

    it('should allow optional description in paywall', () => {
      const withDesc = {
        ...validSettings,
        ui: {
          ...validSettings.ui,
          paywall: {
            ...validSettings.ui.paywall,
            description: 'Optional paywall description',
          },
        },
      };
      const result = AppSettingsSchema.safeParse(withDesc);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.ui.paywall.description).toBe(
          'Optional paywall description',
        );
      }
    });
  });

  describe('validateAppSettings', () => {
    it('should return success for valid settings', () => {
      const result = validateAppSettings({
        ui: {
          paywall: {
            steps: [{ title: 'T', subtitle: 'S' }],
            heading: 'H',
            pricing: {
              period: 'month',
              initialAmount: '₹5',
              recurringAmount: '₹199',
            },
            trialText: 'T',
            buttonText: 'B',
            ratingText: 'R',
            refundedText: 'RF',
            supportsText: 'S',
            socialProofText: 'SP',
            videoDescription: 'V',
          },
          supportedLanguages: ['en'],
        },
        api: {},
        limits: {},
        videos: {},
        features: { subscription: { plan_id: 'plan_1' } },
        appUpdate: { updateMessage: 'Update' },
        translations: {
          en: {
            steps: [{ title: 'T', subtitle: 'S' }],
            heading: 'H',
            trialText: 'T',
            buttonText: 'B',
            ratingText: 'R',
            description: 'D',
            refundedText: 'RF',
            supportsText: 'S',
            socialProofText: 'SP',
            videoDescription: 'V',
          },
        },
      });
      expect(result.success).toBe(true);
    });

    it('should return errors for invalid settings', () => {
      const result = validateAppSettings({ invalid: true });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors.length).toBeGreaterThan(0);
      }
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
