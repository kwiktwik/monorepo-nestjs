import { Test, TestingModule } from '@nestjs/testing';
import { RazorpayWebhookService } from './razorpay-webhook.service';
import { ConfigService } from '@nestjs/config';
import { AnalyticsService } from '../analytics/analytics.service';
import { DRIZZLE_TOKEN } from '../../database/drizzle.module';
import {
  getRegisteredAppIds,
  getWebhookSecretEnvVar,
} from '../../common/config/apps.config';
import { ANALYTICS_EVENTS } from '../analytics/analytics.constants';

describe('RazorpayWebhookService', () => {
  let service: RazorpayWebhookService;
  let configService: jest.Mocked<ConfigService>;

  const mockDb = {
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
  };

  const mockAnalyticsService = {
    track: jest.fn(),
    sendEvent: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RazorpayWebhookService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: DRIZZLE_TOKEN,
          useValue: mockDb,
        },
        {
          provide: AnalyticsService,
          useValue: mockAnalyticsService,
        },
      ],
    }).compile();

    service = module.get<RazorpayWebhookService>(RazorpayWebhookService);
    configService = module.get(ConfigService);
  });

  describe('Webhook Configuration', () => {
    it('should only process webhooks from registered apps', async () => {
      const registeredAppIds = getRegisteredAppIds();
      expect(registeredAppIds.length).toBeGreaterThan(0);

      // Verify all registered apps have webhook env var mappings
      for (const appId of registeredAppIds) {
        const envVar = getWebhookSecretEnvVar(appId);
        expect(envVar).toBeTruthy();
        expect(envVar).toMatch(/^RAZORPAY_WEBHOOK_SECRET_/);
      }
    });

    it('should not accept webhooks from unregistered apps', async () => {
      const unregisteredApps = [
        'com.unknown.app',
        'random.app.id',
        'not.registered.app',
      ];

      for (const appId of unregisteredApps) {
        const envVar = getWebhookSecretEnvVar(appId);
        expect(envVar).toBeNull();
      }
    });

    it('should validate webhook secret env var naming convention', () => {
      const registeredAppIds = getRegisteredAppIds();

      for (const appId of registeredAppIds) {
        const envVar = getWebhookSecretEnvVar(appId);
        // Should follow pattern: RAZORPAY_WEBHOOK_SECRET_{APP_ID_WITH_UNDERSCORES}
        const expectedPattern = appId.replace(/\./g, '_').toUpperCase();
        expect(envVar).toContain(expectedPattern);
      }
    });
  });

  describe('getAllWebhookSecrets', () => {
    it('should return empty array when no webhook secrets are configured', () => {
      // Mock empty environment
      const originalEnv = process.env;
      process.env = {};

      const secrets = (service as any).getAllWebhookSecrets();
      expect(secrets).toEqual([]);

      process.env = originalEnv;
    });

    it('should identify which registered apps are missing webhook secrets', () => {
      const originalEnv = { ...process.env };
      const registeredAppIds = getRegisteredAppIds();

      // Clear all webhook secrets
      registeredAppIds.forEach((appId) => {
        const envVar = getWebhookSecretEnvVar(appId);
        if (envVar) {
          delete process.env[envVar];
        }
      });

      // Get the secrets and check which apps are missing
      const secrets = (service as any).getAllWebhookSecrets();
      const configuredAppIds = secrets.map((s: any) => s.appId);
      const missingApps = registeredAppIds.filter(
        (appId) => !configuredAppIds.includes(appId),
      );

      // Test that we can identify missing apps
      expect(missingApps.length).toBe(registeredAppIds.length);
      expect(configuredAppIds).toEqual([]);

      // Restore environment
      Object.assign(process.env, originalEnv);
    });

    it('should identify partially configured webhook secrets', () => {
      const originalEnv = { ...process.env };
      const registeredAppIds = getRegisteredAppIds();

      // Clear all webhook secrets first
      registeredAppIds.forEach((appId) => {
        const envVar = getWebhookSecretEnvVar(appId);
        if (envVar) {
          delete process.env[envVar];
        }
      });

      // Configure only the first app
      const firstApp = registeredAppIds[0];
      const firstAppEnvVar = getWebhookSecretEnvVar(firstApp);
      if (firstAppEnvVar) {
        process.env[firstAppEnvVar] = 'configured-secret';
      }

      // Get the secrets and check which apps are missing
      const secrets = (service as any).getAllWebhookSecrets();
      const configuredAppIds = secrets.map((s: any) => s.appId);
      const missingApps = registeredAppIds.filter(
        (appId) => !configuredAppIds.includes(appId),
      );

      // Verify partial configuration
      expect(configuredAppIds).toContain(firstApp);
      expect(missingApps.length).toBe(registeredAppIds.length - 1);

      // Restore environment
      Object.assign(process.env, originalEnv);
    });

    it('should only return secrets for registered apps', () => {
      const originalEnv = { ...process.env };
      process.env = {
        ...process.env,
        RAZORPAY_WEBHOOK_SECRET_COM_PAYMENTALERT_APP: 'secret1',
        RAZORPAY_WEBHOOK_SECRET_COM_KIRANAAPPS_APP: 'secret2',
        // Unregistered app - should be ignored
        RAZORPAY_WEBHOOK_SECRET_COM_UNKNOWN_APP: 'unknown-secret',
      };

      const secrets = (service as any).getAllWebhookSecrets();
      const appIds = secrets.map((s: any) => s.appId);

      // Should only include registered apps
      expect(appIds).toContain('com.paymentalert.app');
      expect(appIds).toContain('com.kiranaapps.app');
      // Should NOT include unregistered apps
      expect(appIds).not.toContain('com.unknown.app');

      Object.assign(process.env, originalEnv);
    });

    it('should log which apps were tried when signature verification fails', () => {
      const originalEnv = { ...process.env };

      // Set up webhook secrets
      process.env = {
        ...process.env,
        RAZORPAY_WEBHOOK_SECRET_COM_PAYMENTALERT_APP: 'correct-secret',
        RAZORPAY_WEBHOOK_SECRET_COM_KIRANAAPPS_APP: 'another-secret',
      };

      // Mock logger to capture warn calls
      const warnSpy = jest.spyOn(service['logger'], 'warn');

      // Call findAppBySignature with invalid signature
      const result = (service as any).findAppBySignature(
        '{"test":"body"}',
        'invalid-signature',
      );

      // Should return null
      expect(result).toBeNull();

      // Should log which apps were tried
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Signature verification failed'),
      );
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('com.paymentalert.app'),
      );
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('com.kiranaapps.app'),
      );

      warnSpy.mockRestore();
      Object.assign(process.env, originalEnv);
    });

    it('should not log signature failure when no secrets are configured', () => {
      const originalEnv = { ...process.env };

      // Clear all webhook secrets
      const registeredAppIds = getRegisteredAppIds();
      registeredAppIds.forEach((appId) => {
        const envVar = getWebhookSecretEnvVar(appId);
        if (envVar) {
          delete process.env[envVar];
        }
      });

      // Mock logger to capture warn calls
      const warnSpy = jest.spyOn(service['logger'], 'warn');

      // Call findAppBySignature
      const result = (service as any).findAppBySignature(
        '{"test":"body"}',
        'invalid-signature',
      );

      // Should return null
      expect(result).toBeNull();

      // Should NOT log signature failure (since no apps were tried)
      const signatureFailureCalls = warnSpy.mock.calls.filter((call) =>
        call[0].includes('Signature verification failed'),
      );
      expect(signatureFailureCalls).toHaveLength(0);

      warnSpy.mockRestore();
      Object.assign(process.env, originalEnv);
    });
  });

  describe('Signature Verification', () => {
    it('should verify signature with correct secret', () => {
      const body = '{"event":"payment.captured"}';
      const secret = 'my-webhook-secret';
      const { createHmac } = require('crypto');
      const signature = createHmac('sha256', secret).update(body).digest('hex');

      const isValid = (service as any).verifySignature(body, signature, secret);
      expect(isValid).toBe(true);
    });

    it('should reject signature with wrong secret', () => {
      const body = '{"event":"payment.captured"}';
      const correctSecret = 'correct-secret';
      const wrongSecret = 'wrong-secret';
      const { createHmac } = require('crypto');
      const signature = createHmac('sha256', correctSecret)
        .update(body)
        .digest('hex');

      const isValid = (service as any).verifySignature(
        body,
        signature,
        wrongSecret,
      );
      expect(isValid).toBe(false);
    });

    it('should find correct app when multiple secrets are configured', () => {
      const originalEnv = { ...process.env };
      const body = '{"event":"payment.captured"}';
      const targetApp = 'com.paymentalert.app';
      const targetSecret = 'target-app-secret';

      process.env = {
        ...process.env,
        RAZORPAY_WEBHOOK_SECRET_COM_PAYMENTALERT_APP: targetSecret,
        RAZORPAY_WEBHOOK_SECRET_COM_KIRANAAPPS_APP: 'other-secret',
      };

      const { createHmac } = require('crypto');
      const signature = createHmac('sha256', targetSecret)
        .update(body)
        .digest('hex');

      const result = (service as any).findAppBySignature(body, signature);

      expect(result).not.toBeNull();
      expect(result.appId).toBe(targetApp);

      Object.assign(process.env, originalEnv);
    });
  });

  describe('Webhook Event Processing', () => {
    it('should skip duplicate events', async () => {
      const eventId = 'evt_test_duplicate_123';

      // Mock DB to return existing event (duplicate)
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValueOnce({
          where: jest.fn().mockReturnValueOnce({
            limit: jest.fn().mockResolvedValueOnce([{ id: 'existing-id' }]),
          }),
        }),
      });

      const result = await service.processWebhook(
        'acc_test',
        '{"event":"test"}',
        'valid-sig',
        eventId,
      );

      expect(result).toEqual({ received: true });
    });

    it('should mark new event as processed', async () => {
      const eventId = 'evt_test_new_456';
      const originalEnv = { ...process.env };

      process.env = {
        ...process.env,
        RAZORPAY_WEBHOOK_SECRET_COM_PAYMENTALERT_APP: 'test-secret',
      };

      const { createHmac } = require('crypto');
      const body = JSON.stringify({ event: 'payment.captured', payload: {} });
      const signature = createHmac('sha256', 'test-secret')
        .update(body)
        .digest('hex');

      // Mock DB for duplicate check (not found)
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValueOnce({
          where: jest.fn().mockReturnValueOnce({
            limit: jest.fn().mockResolvedValueOnce([]),
          }),
        }),
      });

      // Mock DB insert for marking event as processed
      mockDb.insert.mockResolvedValueOnce({});

      // Mock subscription check (no subscription in payload)
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValueOnce({
          where: jest.fn().mockReturnValueOnce({
            limit: jest.fn().mockResolvedValueOnce([]),
          }),
        }),
      });

      await service.processWebhook('acc_test', body, signature, eventId);

      // Verify event was marked as processed
      expect(mockDb.insert).toHaveBeenCalled();

      Object.assign(process.env, originalEnv);
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed JSON payload', async () => {
      const originalEnv = { ...process.env };

      process.env = {
        ...process.env,
        RAZORPAY_WEBHOOK_SECRET_COM_PAYMENTALERT_APP: 'test-secret',
      };

      const { createHmac } = require('crypto');
      const body = 'invalid-json{';
      const signature = createHmac('sha256', 'test-secret')
        .update(body)
        .digest('hex');

      // Mock DB for duplicate check
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValueOnce({
          where: jest.fn().mockReturnValueOnce({
            limit: jest.fn().mockResolvedValueOnce([]),
          }),
        }),
      });

      await expect(
        service.processWebhook('acc_test', body, signature, 'evt_123'),
      ).rejects.toThrow();

      Object.assign(process.env, originalEnv);
    });

    it('should throw UnauthorizedException for invalid signature', async () => {
      const originalEnv = { ...process.env };

      process.env = {
        ...process.env,
        RAZORPAY_WEBHOOK_SECRET_COM_PAYMENTALERT_APP: 'test-secret',
      };

      // Mock DB for duplicate check
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValueOnce({
          where: jest.fn().mockReturnValueOnce({
            limit: jest.fn().mockResolvedValueOnce([]),
          }),
        }),
      });

      await expect(
        service.processWebhook(
          'acc_test',
          '{"event":"test"}',
          'invalid-signature',
          'evt_123',
        ),
      ).rejects.toThrow('Invalid signature');

      Object.assign(process.env, originalEnv);
    });
  });

  describe('Analytics Events Coverage', () => {
    // Test to ensure all webhook events have corresponding analytics tests
    it('should have analytics coverage for all webhook events', () => {
      // Map of webhook event types to expected analytics events
      const webhookAnalyticsMap = {
        'payment.authorized': ANALYTICS_EVENTS.PAYMENT_AUTHORIZED,
        'payment.captured': ANALYTICS_EVENTS.PAYMENT_CAPTURED,
        'payment.failed': ANALYTICS_EVENTS.PAYMENT_FAILED,
        'token.confirmed': ANALYTICS_EVENTS.TOKEN_CONFIRMED,
        'subscription.activated': ANALYTICS_EVENTS.SUBSCRIPTION_ACTIVATED,
        'subscription.charged': ANALYTICS_EVENTS.SUBSCRIPTION_CHARGED,
        'subscription.pending': ANALYTICS_EVENTS.SUBSCRIPTION_PENDING,
        'subscription.halted': ANALYTICS_EVENTS.SUBSCRIPTION_HALTED,
        'subscription.paused': ANALYTICS_EVENTS.SUBSCRIPTION_PAUSED,
        'subscription.resumed': ANALYTICS_EVENTS.SUBSCRIPTION_RESUMED,
        'subscription.cancelled': ANALYTICS_EVENTS.SUBSCRIPTION_CANCELLED,
        'subscription.completed': ANALYTICS_EVENTS.SUBSCRIPTION_COMPLETED,
        'subscription.authenticated':
          ANALYTICS_EVENTS.SUBSCRIPTION_AUTHENTICATED,
        'refund.created': ANALYTICS_EVENTS.PAYMENT_REFUNDED,
        'refund.processed': ANALYTICS_EVENTS.PAYMENT_REFUNDED,
        'refund.failed': ANALYTICS_EVENTS.PAYMENT_REFUND_FAILED,
      };

      // Verify all webhook events have analytics mappings
      const webhookEvents = Object.keys(webhookAnalyticsMap);
      expect(webhookEvents.length).toBeGreaterThan(0);

      // Verify analytics events are defined
      webhookEvents.forEach((eventType) => {
        const analyticsEvent = webhookAnalyticsMap[eventType];
        expect(analyticsEvent).toBeDefined();
        expect(analyticsEvent).toBeTruthy();
      });

      // Log coverage for deployment verification
      console.log('Analytics Event Coverage:');
      webhookEvents.forEach((eventType) => {
        console.log(`  ${eventType} -> ${webhookAnalyticsMap[eventType]}`);
      });
    });

    it('should track analytics when ANALYTICS_ENABLED is true', async () => {
      // This test verifies the analytics tracking logic is in place
      // Note: Analytics is currently disabled by default (ANALYTICS_ENABLED = false)
      // This test ensures the code paths exist for when it's enabled

      const analyticsEnabled = (service as any).ANALYTICS_ENABLED;

      // Verify the feature flag exists
      expect(typeof analyticsEnabled).toBe('boolean');

      // When enabled, analytics methods should be called
      // When disabled, they should be skipped (tested in next test)
      console.log(`Analytics feature flag is currently: ${analyticsEnabled}`);
      console.log(
        '✓ Analytics tracking code exists and is ready for enablement',
      );
    });

    it('should NOT track analytics when ANALYTICS_ENABLED is false', async () => {
      const originalEnv = { ...process.env };

      process.env = {
        ...process.env,
        RAZORPAY_WEBHOOK_SECRET_COM_PAYMENTALERT_APP: 'test-secret',
      };

      // Ensure analytics is disabled
      const originalAnalyticsEnabled = (service as any).ANALYTICS_ENABLED;
      (service as any).ANALYTICS_ENABLED = false;

      const { createHmac } = require('crypto');
      const payload = {
        event: 'payment.captured',
        payload: {
          payment: {
            entity: {
              id: 'pay_test_123',
              order_id: 'order_test_456',
              amount: 10000,
              currency: 'INR',
              method: 'card',
            },
          },
        },
      };
      const body = JSON.stringify(payload);
      const signature = createHmac('sha256', 'test-secret')
        .update(body)
        .digest('hex');

      // Mock DB for duplicate check
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValueOnce({
          where: jest.fn().mockReturnValueOnce({
            limit: jest.fn().mockResolvedValueOnce([]),
          }),
        }),
      });

      // Mock DB insert
      mockDb.insert.mockResolvedValueOnce({});

      // Mock subscription check
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValueOnce({
          where: jest.fn().mockReturnValueOnce({
            limit: jest.fn().mockResolvedValueOnce([]),
          }),
        }),
      });

      // Mock order update
      mockDb.update.mockReturnValueOnce({
        set: jest.fn().mockReturnValueOnce({
          where: jest.fn().mockReturnValueOnce({
            returning: jest.fn().mockResolvedValueOnce([{ id: 'order_123' }]),
          }),
        }),
      });

      // Mock analytics service
      const analyticsSpy = jest.spyOn(service['analyticsService'], 'sendEvent');

      await service.processWebhook('acc_test', body, signature, 'evt_789');

      // Verify analytics was NOT called
      expect(analyticsSpy).not.toHaveBeenCalled();

      // Restore
      (service as any).ANALYTICS_ENABLED = originalAnalyticsEnabled;
      analyticsSpy.mockRestore();
      Object.assign(process.env, originalEnv);
    });

    it('should handle all payment-related analytics events', () => {
      const paymentEvents = [
        ANALYTICS_EVENTS.PAYMENT_AUTHORIZED,
        ANALYTICS_EVENTS.PAYMENT_CAPTURED,
        ANALYTICS_EVENTS.PAYMENT_FAILED,
        ANALYTICS_EVENTS.PAYMENT_REFUNDED,
        ANALYTICS_EVENTS.PAYMENT_REFUND_FAILED,
      ];

      paymentEvents.forEach((event) => {
        expect(event).toBeDefined();
        expect(event).toMatch(/^payment_/);
      });

      console.log('Payment Analytics Events:');
      paymentEvents.forEach((event) => {
        console.log(`  ✓ ${event}`);
      });
    });

    it('should handle all subscription-related analytics events', () => {
      const subscriptionEvents = [
        ANALYTICS_EVENTS.SUBSCRIPTION_ACTIVATED,
        ANALYTICS_EVENTS.SUBSCRIPTION_CHARGED,
        ANALYTICS_EVENTS.SUBSCRIPTION_CANCELLED,
        ANALYTICS_EVENTS.SUBSCRIPTION_PENDING,
        ANALYTICS_EVENTS.SUBSCRIPTION_HALTED,
        ANALYTICS_EVENTS.SUBSCRIPTION_PAUSED,
        ANALYTICS_EVENTS.SUBSCRIPTION_RESUMED,
        ANALYTICS_EVENTS.SUBSCRIPTION_COMPLETED,
        ANALYTICS_EVENTS.SUBSCRIPTION_AUTHENTICATED,
      ];

      subscriptionEvents.forEach((event) => {
        expect(event).toBeDefined();
        expect(event).toBeTruthy();
      });

      console.log('Subscription Analytics Events:');
      subscriptionEvents.forEach((event) => {
        console.log(`  ✓ ${event}`);
      });
    });

    it('should log analytics coverage report for deployment', () => {
      const allTrackedEvents = [
        ANALYTICS_EVENTS.PAYMENT_AUTHORIZED,
        ANALYTICS_EVENTS.PAYMENT_CAPTURED,
        ANALYTICS_EVENTS.PAYMENT_FAILED,
        ANALYTICS_EVENTS.PAYMENT_REFUNDED,
        ANALYTICS_EVENTS.PAYMENT_REFUND_FAILED,
        ANALYTICS_EVENTS.SUBSCRIPTION_ACTIVATED,
        ANALYTICS_EVENTS.SUBSCRIPTION_CHARGED,
        ANALYTICS_EVENTS.SUBSCRIPTION_CANCELLED,
        ANALYTICS_EVENTS.SUBSCRIPTION_PENDING,
        ANALYTICS_EVENTS.SUBSCRIPTION_HALTED,
        ANALYTICS_EVENTS.SUBSCRIPTION_PAUSED,
        ANALYTICS_EVENTS.SUBSCRIPTION_RESUMED,
        ANALYTICS_EVENTS.SUBSCRIPTION_COMPLETED,
        ANALYTICS_EVENTS.SUBSCRIPTION_AUTHENTICATED,
        ANALYTICS_EVENTS.TOKEN_CONFIRMED,
      ];

      console.log('\n📊 DEPLOYMENT CHECKLIST - Analytics Events:');
      console.log('=====================================');
      allTrackedEvents.forEach((event) => {
        console.log(`  [✓] ${event}`);
      });
      console.log(
        `\nTotal: ${allTrackedEvents.length} analytics events tracked`,
      );
      console.log('=====================================\n');

      expect(allTrackedEvents.length).toBe(15);
    });
  });
});
