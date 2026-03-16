import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from './config.service';
import { PAYWALL_PLANS, USER_TYPES, DEEPLINK_CAMPAIGNS } from './config.data';
import { PaywallEngineService } from './paywall-engine.service';
import { NotFoundException } from '@nestjs/common';

jest.mock('json-rules-engine', () => ({
  Engine: jest.fn().mockImplementation(() => ({
    addRule: jest.fn(),
    run: jest.fn().mockResolvedValue({ events: [] }),
  })),
  Rule: jest.fn(),
}));

describe('ConfigService', () => {
  let service: ConfigService;
  let paywallEngine: PaywallEngineService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConfigService,
        {
          provide: PaywallEngineService,
          useValue: {
            determinePlan: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ConfigService>(ConfigService);
    paywallEngine = module.get<PaywallEngineService>(PaywallEngineService);
  });

  const appId = 'com.paymentalert.app';

  describe('v2 Restoration (getConfigSimple)', () => {
    it('should return static configuration for a valid app', () => {
      const config = service.getConfigSimple(appId);
      expect(config.app.id).toBe(appId);
      expect(config.features.subscription.plan_id).toBeDefined();
    });

    it('should throw NotFoundException for unknown app', () => {
      expect(() => service.getConfigSimple('unknown.app')).toThrow(
        NotFoundException,
      );
    });
  });

  describe('v3 Dynamic Logic (getConfig)', () => {
    it('should return dynamic configuration based on engine result', async () => {
      const mockResult = {
        plan: PAYWALL_PLANS.MARKETING_CAMPAIGN,
        ruleName: 'marketing_rule',
        reason: 'Test marketing',
      };
      (paywallEngine.determinePlan as jest.Mock).mockResolvedValue(mockResult);

      const context = {
        appId,
        userType: USER_TYPES.NEW,
        deeplink: DEEPLINK_CAMPAIGNS.NONE,
      };

      const config = await service.getConfig(appId, context);

      expect(config.features.subscription.plan_id).toBe(
        PAYWALL_PLANS.MARKETING_CAMPAIGN.plan_id,
      );
      expect(config.ui.paywall.heading).toBe(
        PAYWALL_PLANS.MARKETING_CAMPAIGN.heading,
      );
      expect(config._paywallMeta.ruleName).toBe('marketing_rule');
    });
  });

  describe('Legacy Support (getConfigLegacy)', () => {
    it('should return NEW_USER_WELCOME for new users', () => {
      const user = { userType: USER_TYPES.NEW };
      const config = service.getConfigLegacy(appId, user);
      expect(config.features.subscription.plan_id).toBe(
        PAYWALL_PLANS.NEW_USER_WELCOME.plan_id,
      );
    });

    it('should return ABANDONED_CHECKOUT for abandoned users', () => {
      const user = { userType: USER_TYPES.ABANDONED };
      const config = service.getConfigLegacy(appId, user);
      expect(config.features.subscription.plan_id).toBe(
        PAYWALL_PLANS.ABANDONED_CHECKOUT.plan_id,
      );
    });

    it('should return standard plan for active users', () => {
      const user = { userType: USER_TYPES.ACTIVE };
      const config = service.getConfigLegacy(appId, user);
      // getLegacyPlan defaults to STANDARD for ACTIVE
      expect(config.features.subscription.plan_id).toBe(
        PAYWALL_PLANS.STANDARD.plan_id,
      );
    });
  });
});
