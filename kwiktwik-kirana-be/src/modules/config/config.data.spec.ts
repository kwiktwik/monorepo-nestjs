import { getConfigForAppId, APP_CONFIGS } from './config.data';

describe('Config Data - APP_CONFIGS', () => {
  const supportedAppIds = [
    'com.paymentalert.app',
    'com.sharekaro.kirana',
    'com.kiranaapps.app',
  ];

  const unsupportedAppIds = [
    'com.unknown.app',
    'com.nonexistent.app',
    'invalid.app.id',
  ];

  describe('getConfigForAppId', () => {
    it('should return configuration for all supported apps', () => {
      supportedAppIds.forEach((appId) => {
        const config = getConfigForAppId(appId);
        expect(config).toBeDefined();
        expect(config).not.toBeNull();
        expect(config?.app?.id).toBe(appId);
        expect(config?.app?.name).toBeDefined();
      });
    });

    it('should return null for unsupported apps', () => {
      unsupportedAppIds.forEach((appId) => {
        const config = getConfigForAppId(appId);
        expect(config).toBeNull();
      });
    });

    describe('com.kiranaapps.app configuration', () => {
      const appId = 'com.kiranaapps.app';
      let config: ReturnType<typeof getConfigForAppId>;

      beforeEach(() => {
        config = getConfigForAppId(appId);
      });

      it('should have correct app metadata', () => {
        expect(config?.app?.id).toBe(appId);
        expect(config?.app?.name).toBe('Kirana Apps');
        expect(config?.app?.version).toBeDefined();
        expect(config?.app?.environment).toBeDefined();
      });

      it('should have subscription configuration', () => {
        expect(config?.features?.subscription).toBeDefined();
        expect(config?.features?.subscription?.plan_id).toBeDefined();
        expect(config?.features?.subscription?.plan_id).toBe(
          'plan_S3FaBrk7sjPQEU',
        );
      });

      it('should have all required features', () => {
        expect(config?.features?.otpLogin).toBe(true);
        expect(config?.features?.truecallerLogin).toBe(true);
        expect(config?.features?.googleLogin).toBe(true);
        expect(config?.features?.gateway).toBe('RAZORPAY');
      });

      it('should have video configurations for all supported languages', () => {
        const supportedLanguages = [
          'en',
          'hi',
          'bn',
          'mr',
          'te',
          'ta',
          'gu',
          'ur',
          'kn',
          'or',
          'ml',
        ];
        expect(config?.videos).toBeDefined();

        supportedLanguages.forEach((lang) => {
          expect(config?.videos?.[lang]).toBeDefined();
          expect(config?.videos?.[lang]?.fallback_video).toBeDefined();
          expect(config?.videos?.[lang]?.paywall_video).toBeDefined();
        });
      });

      it('should have app update configuration', () => {
        expect(config?.appUpdate).toBeDefined();
        expect(config?.appUpdate?.updateUrl).toContain('com.kiranaapps.app');
      });

      it('should have UI configuration', () => {
        expect(config?.ui).toBeDefined();
        expect(config?.ui?.theme).toBeDefined();
        expect(config?.ui?.supportedLanguages).toContain('en');
        expect(config?.ui?.defaultLanguage).toBe('en');
        expect(config?.ui?.paywall).toBeDefined();
      });

      it('should have API configuration', () => {
        expect(config?.api).toBeDefined();
        expect(config?.api?.timeout).toBeDefined();
        expect(config?.api?.retryAttempts).toBeDefined();
      });

      it('should have limits configuration', () => {
        expect(config?.limits).toBeDefined();
      });
    });

    describe('com.paymentalert.app configuration', () => {
      const appId = 'com.paymentalert.app';

      it('should return valid configuration', () => {
        const config = getConfigForAppId(appId);
        expect(config).toBeDefined();
        expect(config?.app?.id).toBe(appId);
        expect(config?.app?.name).toBe('Payment Alert');
      });
    });

    describe('com.sharekaro.kirana configuration', () => {
      const appId = 'com.sharekaro.kirana';

      it('should return valid configuration', () => {
        const config = getConfigForAppId(appId);
        expect(config).toBeDefined();
        expect(config?.app?.id).toBe(appId);
        expect(config?.app?.name).toBe('ShareKaro Kirana');
      });
    });
  });

  describe('APP_CONFIGS structure validation', () => {
    it('should have all required configuration keys', () => {
      Object.entries(APP_CONFIGS).forEach(([appId, config]) => {
        expect(config).toHaveProperty('app');
        expect(config).toHaveProperty('features');
        expect(config).toHaveProperty('limits');
        expect(config).toHaveProperty('ui');
        expect(config).toHaveProperty('api');
        expect(config).toHaveProperty('appUpdate');
        expect(config).toHaveProperty('videos');

        // Validate app section
        expect(config.app).toHaveProperty('name');
        expect(config.app).toHaveProperty('version');
        expect(config.app).toHaveProperty('environment');
        expect(config.app).toHaveProperty('id');

        // Validate features section
        expect(config.features).toHaveProperty('subscription');
        expect(config.features).toHaveProperty('gateway');
        expect(config.features).toHaveProperty('otpLogin');
        expect(config.features).toHaveProperty('truecallerLogin');
        expect(config.features).toHaveProperty('googleLogin');

        // Validate ui section
        expect(config.ui).toHaveProperty('theme');
        expect(config.ui).toHaveProperty('supportedLanguages');
        expect(config.ui).toHaveProperty('defaultLanguage');
        expect(config.ui).toHaveProperty('paywall');
      });
    });
  });
});
