import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from './config.service';
import { MOCK_PLANS } from './config.data';

describe('ConfigService Dynamic Plans', () => {
  let service: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConfigService],
    }).compile();

    service = module.get<ConfigService>(ConfigService);
  });

  const appId = 'com.paymentalert.app';

  it('should return STANDARD plan for old users with no abandoned checkout', () => {
    const oldUser = {
      createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      metadata: {},
    };
    const config = service.getConfig(appId, oldUser);
    expect(config.features.subscription.plan_id).toBe(MOCK_PLANS.STANDARD.plan_id);
    expect(config.ui.paywall.heading).toBe(MOCK_PLANS.STANDARD.heading);
  });

  it('should return NEW_USER_OFFER plan for users created within 24 hours', () => {
    const newUser = {
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      metadata: {},
    };
    const config = service.getConfig(appId, newUser);
    expect(config.features.subscription.plan_id).toBe(MOCK_PLANS.NEW_USER_OFFER.plan_id);
    expect(config.ui.paywall.heading).toBe(MOCK_PLANS.NEW_USER_OFFER.heading);
  });

  it('should return RECOVERY_OFFER plan for users with abandoned checkout', () => {
    const userWithAbandonedCheckout = {
      createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      metadata: { hasAbandonedCheckout: true },
    };
    const config = service.getConfig(appId, userWithAbandonedCheckout);
    expect(config.features.subscription.plan_id).toBe(MOCK_PLANS.RECOVERY_OFFER.plan_id);
    expect(config.ui.paywall.heading).toBe(MOCK_PLANS.RECOVERY_OFFER.heading);
  });

  it('should prioritize RECOVERY_OFFER over NEW_USER_OFFER', () => {
    const newUserWithAbandonedCheckout = {
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      metadata: { hasAbandonedCheckout: true },
    };
    const config = service.getConfig(appId, newUserWithAbandonedCheckout);
    expect(config.features.subscription.plan_id).toBe(MOCK_PLANS.RECOVERY_OFFER.plan_id);
  });
});
