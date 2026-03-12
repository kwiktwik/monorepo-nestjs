import { Test, TestingModule } from '@nestjs/testing';
import { RazorpayWebhookService } from './razorpay-webhook.service';
import { ConfigService } from '@nestjs/config';
import { AnalyticsService } from '../analytics/analytics.service';
import { DRIZZLE_TOKEN } from '../../database/drizzle.module';
import {
  getRegisteredAppIds,
  getWebhookSecretEnvVar,
} from '../../common/config/apps.config';

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
  });
});
