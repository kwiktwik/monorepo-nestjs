import {
  REGISTERED_APPS,
  getRegisteredAppIds,
  generateWebhookSecretEnvVar,
  getWebhookSecretEnvVar,
} from './apps.config';

describe('apps.config', () => {
  describe('REGISTERED_APPS', () => {
    it('should have all registered apps with valid configurations', () => {
      const appIds = Object.keys(REGISTERED_APPS);
      expect(appIds.length).toBeGreaterThan(0);

      for (const appId of appIds) {
        const app = REGISTERED_APPS[appId];
        expect(app.id).toBe(appId);
        expect(app.name).toBeTruthy();
        expect(typeof app.enabled).toBe('boolean');
      }
    });
  });

  describe('Webhook Secret Configuration', () => {
    it('should generate correct webhook secret env var names from app IDs', () => {
      // Test the pattern: com.example.app -> RAZORPAY_WEBHOOK_SECRET_COM_EXAMPLE_APP
      expect(generateWebhookSecretEnvVar('com.kiranaapps.app')).toBe(
        'RAZORPAY_WEBHOOK_SECRET_COM_KIRANAAPPS_APP',
      );
      expect(generateWebhookSecretEnvVar('com.sharestatus.app')).toBe(
        'RAZORPAY_WEBHOOK_SECRET_COM_SHARESTATUS_APP',
      );
      expect(generateWebhookSecretEnvVar('com.sharekaro.kirana')).toBe(
        'RAZORPAY_WEBHOOK_SECRET_COM_SHAREKARO_KIRANA',
      );
      expect(generateWebhookSecretEnvVar('com.paymentalert.app')).toBe(
        'RAZORPAY_WEBHOOK_SECRET_COM_PAYMENTALERT_APP',
      );
    });

    it('should have webhook secret env vars for all registered apps', () => {
      const registeredAppIds = getRegisteredAppIds();

      for (const appId of registeredAppIds) {
        const envVar = getWebhookSecretEnvVar(appId);
        expect(envVar).toBeTruthy();
        expect(envVar).toBe(generateWebhookSecretEnvVar(appId));
      }
    });

    it('should return null for unregistered apps', () => {
      expect(getWebhookSecretEnvVar('com.unknown.app')).toBeNull();
      expect(getWebhookSecretEnvVar('random.app.id')).toBeNull();
    });

    it('should follow the naming convention for all registered apps', () => {
      const registeredAppIds = getRegisteredAppIds();

      for (const appId of registeredAppIds) {
        const envVar = getWebhookSecretEnvVar(appId);
        expect(envVar).not.toBeNull();
        if (envVar) {
          // All env vars should start with RAZORPAY_WEBHOOK_SECRET_
          expect(envVar).toMatch(/^RAZORPAY_WEBHOOK_SECRET_/);
          // All env vars should be uppercase
          expect(envVar).toBe(envVar.toUpperCase());
        }
      }
    });
  });
});
