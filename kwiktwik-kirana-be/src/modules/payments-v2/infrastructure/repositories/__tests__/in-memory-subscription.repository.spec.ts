/**
 * Unit tests for InMemorySubscriptionRepository
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { InMemorySubscriptionRepository } from '../in-memory-subscription.repository';
import {
  Subscription,
  createSubscription,
  transitionSubscriptionStatus,
  recordPaymentFailure,
} from '../../../domain/entities/subscription.entity';

describe('InMemorySubscriptionRepository', () => {
  let repository: InMemorySubscriptionRepository;

  const createTestSubscription = (
    overrides: Partial<{
      id: string;
      merchantSubscriptionId: string;
      userId: string;
      appId: string;
      provider: string;
      status: string;
      subscriptionType: string;
    }> = {},
  ): Subscription => {
    const id = overrides.id ?? 'sub_123';
    return createSubscription({
      id,
      merchantSubscriptionId: overrides.merchantSubscriptionId ?? `merchant_${id}`,
      userId: overrides.userId ?? 'user_123',
      appId: overrides.appId ?? 'app_123',
      subscriptionType: (overrides.subscriptionType as 'PROVIDER_MANAGED' | 'USER_MANAGED') ?? 'USER_MANAGED',
      provider: (overrides.provider as 'RAZORPAY' | 'PHONEPE') ?? 'RAZORPAY',
      planId: 'plan_123',
      pricing: {
        initialAmount: 10000,
        recurringAmount: 10000,
        currency: 'INR',
        frequency: 'MONTHLY',
        totalCycles: null,
      },
      providerData: {
        subscriptionId: `provider_${id}`,
      },
      environment: 'SANDBOX',
      configId: 'config_123',
    });
  };

  // Helper to transition to ACTIVE status through valid state machine
  const transitionToActive = (subscription: Subscription): Subscription => {
    // CREATED -> AUTHENTICATED -> ACTIVE
    const authResult = transitionSubscriptionStatus(subscription, 'AUTHENTICATED');
    if (!authResult.success) {
      throw new Error('Failed to transition to AUTHENTICATED');
    }
    const activeResult = transitionSubscriptionStatus(authResult.subscription, 'ACTIVE');
    if (!activeResult.success) {
      throw new Error('Failed to transition to ACTIVE');
    }
    return activeResult.subscription;
  };

  beforeEach(() => {
    repository = new InMemorySubscriptionRepository();
  });

  describe('save and findById', () => {
    it('should save and retrieve a subscription', async () => {
      const subscription = createTestSubscription();

      await repository.save(subscription);
      const found = await repository.findById('sub_123');

      expect(found).toEqual(subscription);
    });

    it('should return null for non-existent subscription', async () => {
      const found = await repository.findById('nonexistent');

      expect(found).toBeNull();
    });

    it('should update existing subscription on save', async () => {
      const subscription = createTestSubscription();
      await repository.save(subscription);

      const updated = transitionToActive(subscription);
      await repository.save(updated);

      const found = await repository.findById('sub_123');
      expect(found?.status).toBe('ACTIVE');
    });
  });

  describe('findByMerchantId', () => {
    it('should find subscription by merchant subscription ID', async () => {
      const subscription = createTestSubscription();
      await repository.save(subscription);

      const found = await repository.findByMerchantId('merchant_sub_123');

      expect(found).toEqual(subscription);
    });

    it('should return null for non-existent merchant ID', async () => {
      const found = await repository.findByMerchantId('nonexistent');

      expect(found).toBeNull();
    });
  });

  describe('findByProviderSubscriptionId', () => {
    it('should find subscription by provider subscription ID', async () => {
      const subscription = createTestSubscription();
      await repository.save(subscription);

      const found = await repository.findByProviderSubscriptionId(
        'RAZORPAY',
        'provider_sub_123',
      );

      expect(found).toEqual(subscription);
    });

    it('should return null for non-existent provider subscription ID', async () => {
      const found = await repository.findByProviderSubscriptionId(
        'RAZORPAY',
        'nonexistent',
      );

      expect(found).toBeNull();
    });

    it('should return null for wrong provider', async () => {
      const subscription = createTestSubscription();
      await repository.save(subscription);

      const found = await repository.findByProviderSubscriptionId(
        'PHONEPE',
        'provider_sub_123',
      );

      expect(found).toBeNull();
    });
  });

  describe('findByUserId', () => {
    it('should find all subscriptions for a user', async () => {
      const sub1 = createTestSubscription({ id: 'sub_1', userId: 'user_1' });
      const sub2 = createTestSubscription({ id: 'sub_2', userId: 'user_1' });
      const sub3 = createTestSubscription({ id: 'sub_3', userId: 'user_2' });

      await repository.save(sub1);
      await repository.save(sub2);
      await repository.save(sub3);

      const found = await repository.findByUserId('user_1');

      expect(found).toHaveLength(2);
      expect(found.map((s) => s.id)).toContain('sub_1');
      expect(found.map((s) => s.id)).toContain('sub_2');
    });

    it('should return empty array for user with no subscriptions', async () => {
      const found = await repository.findByUserId('nonexistent');

      expect(found).toHaveLength(0);
    });
  });

  describe('findActiveByUserId', () => {
    it('should find only active subscriptions for a user', async () => {
      const activeSub = createTestSubscription({ id: 'sub_active', userId: 'user_1' });
      const activeTransitioned = transitionToActive(activeSub);
      await repository.save(activeTransitioned);

      const createdSub = createTestSubscription({ id: 'sub_created', userId: 'user_1' });
      await repository.save(createdSub);

      const found = await repository.findActiveByUserId('user_1');

      expect(found).toHaveLength(1);
      expect(found[0].id).toBe('sub_active');
    });

    it('should return empty array if no active subscriptions', async () => {
      const createdSub = createTestSubscription({ userId: 'user_1' });
      await repository.save(createdSub);

      const found = await repository.findActiveByUserId('user_1');

      expect(found).toHaveLength(0);
    });
  });

  describe('findByAppId', () => {
    it('should find all subscriptions for an app', async () => {
      const sub1 = createTestSubscription({ id: 'sub_1', appId: 'app_1' });
      const sub2 = createTestSubscription({ id: 'sub_2', appId: 'app_1' });
      const sub3 = createTestSubscription({ id: 'sub_3', appId: 'app_2' });

      await repository.save(sub1);
      await repository.save(sub2);
      await repository.save(sub3);

      const found = await repository.findByAppId('app_1');

      expect(found).toHaveLength(2);
    });
  });

  describe('findNeedingBilling', () => {
    it('should find USER_MANAGED subscriptions with nextBillingDate in the past', async () => {
      const now = new Date();
      const pastDate = new Date(now.getTime() - 1000 * 60 * 60); // 1 hour ago

      const needingBilling = createTestSubscription({
        id: 'sub_needing',
        subscriptionType: 'USER_MANAGED',
      });

      // Make it active with past billing date
      const activeSubscription = transitionToActive(needingBilling);
      const subscriptionNeedingBilling = {
        ...activeSubscription,
        nextBillingDate: pastDate,
      };
      await repository.save(subscriptionNeedingBilling);

      const found = await repository.findNeedingBilling();

      expect(found).toHaveLength(1);
      expect(found[0].id).toBe('sub_needing');
    });

    it('should not find PROVIDER_MANAGED subscriptions', async () => {
      const now = new Date();
      const pastDate = new Date(now.getTime() - 1000 * 60 * 60);

      const sub = createTestSubscription({
        id: 'sub_provider',
        subscriptionType: 'PROVIDER_MANAGED',
      });
      const activeSubscription = transitionToActive(sub);
      await repository.save({
        ...activeSubscription,
        nextBillingDate: pastDate,
      });

      const found = await repository.findNeedingBilling();

      expect(found).toHaveLength(0);
    });

    it('should not find non-ACTIVE subscriptions', async () => {
      const now = new Date();
      const pastDate = new Date(now.getTime() - 1000 * 60 * 60);

      const sub = createTestSubscription({
        id: 'sub_created',
        subscriptionType: 'USER_MANAGED',
      });
      await repository.save({
        ...sub,
        nextBillingDate: pastDate,
      });

      const found = await repository.findNeedingBilling();

      expect(found).toHaveLength(0);
    });
  });

  describe('findInRetry', () => {
    it('should find subscriptions in RETRYING status', async () => {
      const sub = createTestSubscription({ id: 'sub_retry' });
      // First transition to ACTIVE, then to RETRYING
      const activeSub = transitionToActive(sub);
      const retryingResult = transitionSubscriptionStatus(activeSub, 'RETRYING');
      await repository.save(retryingResult.subscription);

      const found = await repository.findInRetry();

      expect(found).toHaveLength(1);
      expect(found[0].status).toBe('RETRYING');
    });

    it('should return empty array if no subscriptions in retry', async () => {
      const sub = createTestSubscription();
      await repository.save(sub);

      const found = await repository.findInRetry();

      expect(found).toHaveLength(0);
    });
  });

  describe('findByStatus', () => {
    it('should find subscriptions by single status', async () => {
      const sub1 = createTestSubscription({ id: 'sub_1' });
      const sub2 = createTestSubscription({ id: 'sub_2' });
      // Transition from CREATED to AUTHENTICATED (valid transition)
      const authResult = transitionSubscriptionStatus(sub2, 'AUTHENTICATED');

      await repository.save(sub1);
      await repository.save(authResult.subscription);

      const found = await repository.findByStatus('CREATED');

      expect(found).toHaveLength(1);
      expect(found[0].id).toBe('sub_1');
    });

    it('should find subscriptions by multiple statuses', async () => {
      const sub1 = createTestSubscription({ id: 'sub_1' });
      const sub2 = createTestSubscription({ id: 'sub_2' });
      const sub3 = createTestSubscription({ id: 'sub_3' });
      const authResult = transitionSubscriptionStatus(sub3, 'AUTHENTICATED');

      await repository.save(sub1);
      await repository.save(sub2);
      await repository.save(authResult.subscription);

      const found = await repository.findByStatus(['CREATED', 'AUTHENTICATED']);

      expect(found).toHaveLength(3);
    });

    it('should apply ordering', async () => {
      const sub1 = createTestSubscription({ id: 'sub_1' });
      await new Promise((r) => setTimeout(r, 10));
      const sub2 = createTestSubscription({ id: 'sub_2' });

      await repository.save(sub1);
      await repository.save(sub2);

      const foundAsc = await repository.findByStatus('CREATED', {
        orderBy: 'createdAt',
        orderDirection: 'asc',
      });
      const foundDesc = await repository.findByStatus('CREATED', {
        orderBy: 'createdAt',
        orderDirection: 'desc',
      });

      expect(foundAsc[0].id).toBe('sub_1');
      expect(foundDesc[0].id).toBe('sub_2');
    });

    it('should apply pagination', async () => {
      for (let i = 0; i < 10; i++) {
        const sub = createTestSubscription({ id: `sub_${i}` });
        await repository.save(sub);
      }

      const found = await repository.findByStatus('CREATED', {
        offset: 2,
        limit: 3,
      });

      expect(found).toHaveLength(3);
    });
  });

  describe('delete', () => {
    it('should delete a subscription', async () => {
      const subscription = createTestSubscription();
      await repository.save(subscription);

      const result = await repository.delete('sub_123');

      expect(result).toBe(true);
      expect(await repository.findById('sub_123')).toBeNull();
    });

    it('should return false for non-existent subscription', async () => {
      const result = await repository.delete('nonexistent');

      expect(result).toBe(false);
    });

    it('should remove from all indexes', async () => {
      const subscription = createTestSubscription();
      await repository.save(subscription);

      await repository.delete('sub_123');

      expect(await repository.findByMerchantId('merchant_sub_123')).toBeNull();
      expect(
        await repository.findByProviderSubscriptionId('RAZORPAY', 'provider_sub_123'),
      ).toBeNull();
    });
  });

  describe('exists', () => {
    it('should return true for existing subscription', async () => {
      const subscription = createTestSubscription();
      await repository.save(subscription);

      const result = await repository.exists('sub_123');

      expect(result).toBe(true);
    });

    it('should return false for non-existent subscription', async () => {
      const result = await repository.exists('nonexistent');

      expect(result).toBe(false);
    });
  });

  describe('clear and count', () => {
    it('should clear all subscriptions', async () => {
      await repository.save(createTestSubscription({ id: 'sub_1' }));
      await repository.save(createTestSubscription({ id: 'sub_2' }));

      expect(repository.count()).toBe(2);

      repository.clear();

      expect(repository.count()).toBe(0);
    });

    it('should return correct count', async () => {
      await repository.save(createTestSubscription({ id: 'sub_1' }));
      await repository.save(createTestSubscription({ id: 'sub_2' }));
      await repository.save(createTestSubscription({ id: 'sub_3' }));

      expect(repository.count()).toBe(3);
    });
  });
});
