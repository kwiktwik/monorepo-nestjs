import { Subscription } from './subscription.entity';
import {
  SubscriptionState,
  SubscriptionFrequency,
  AuthWorkflowType,
  AmountType,
} from '../enums/subscription.enum';

describe('Subscription Entity', () => {
  const defaultParams = {
    id: 'sub123',
    merchantSubscriptionId: 'merchant_sub_123',
    userId: 'user123',
    appId: 'app123',
    maxAmount: 100000, // 1000 INR in paise
    frequency: 'MONTHLY' as SubscriptionFrequency,
    authWorkflowType: 'TRANSACTION' as AuthWorkflowType,
    amountType: 'VARIABLE' as AmountType,
  };

  describe('create', () => {
    it('should create a subscription with default values', () => {
      const subscription = Subscription.create(defaultParams);

      expect(subscription.id).toBe(defaultParams.id);
      expect(subscription.merchantSubscriptionId).toBe(
        defaultParams.merchantSubscriptionId,
      );
      expect(subscription.userId).toBe(defaultParams.userId);
      expect(subscription.appId).toBe(defaultParams.appId);
      expect(subscription.state).toBe('CREATED');
      expect(subscription.maxAmount).toBe(defaultParams.maxAmount);
      expect(subscription.frequency).toBe(defaultParams.frequency);
      expect(subscription.authWorkflowType).toBe(
        defaultParams.authWorkflowType,
      );
      expect(subscription.amountType).toBe(defaultParams.amountType);
      expect(subscription.phonepeSubscriptionId).toBeNull();
      expect(subscription.activatedAt).toBeNull();
      expect(subscription.cancelledAt).toBeNull();
    });

    it('should create subscription with optional expireAt', () => {
      const expireAt = new Date('2025-12-31');
      const subscription = Subscription.create({
        ...defaultParams,
        expireAt,
      });

      expect(subscription.expireAt).toEqual(expireAt);
    });

    it('should create subscription with metadata', () => {
      const metadata = { plan: 'premium', source: 'mobile' };
      const subscription = Subscription.create({
        ...defaultParams,
        metadata,
      });

      expect(subscription.metadata).toEqual({
        ...metadata,
        environment: 'SANDBOX',
        gracePeriodDays: 3,
      });
    });
  });

  describe('state transitions', () => {
    it('should transition from CREATED to ACTIVATION_IN_PROGRESS', () => {
      const subscription = Subscription.create(defaultParams);

      subscription.markAsActivationInProgress();

      expect(subscription.state).toBe('ACTIVATION_IN_PROGRESS');
    });

    it('should transition from ACTIVATION_IN_PROGRESS to ACTIVE', () => {
      const subscription = Subscription.create(defaultParams);
      subscription.markAsActivationInProgress();

      subscription.activate('phonepe_sub_456');

      expect(subscription.state).toBe('ACTIVE');
      expect(subscription.phonepeSubscriptionId).toBe('phonepe_sub_456');
      expect(subscription.activatedAt).toBeInstanceOf(Date);
    });

    it('should transition from CREATED to FAILED', () => {
      const subscription = Subscription.create(defaultParams);

      subscription.markAsFailed();

      expect(subscription.state).toBe('FAILED');
    });

    it('should transition from ACTIVATION_IN_PROGRESS to FAILED', () => {
      const subscription = Subscription.create(defaultParams);
      subscription.markAsActivationInProgress();

      subscription.markAsFailed();

      expect(subscription.state).toBe('FAILED');
    });

    it('should transition from ACTIVE to PAUSED', () => {
      const subscription = Subscription.create(defaultParams);
      subscription.markAsActivationInProgress();
      subscription.activate('phonepe_sub_456');

      subscription.pause();

      expect(subscription.state).toBe('PAUSED');
    });

    it('should transition from PAUSED to ACTIVE', () => {
      const subscription = Subscription.create(defaultParams);
      subscription.markAsActivationInProgress();
      subscription.activate('phonepe_sub_456');
      subscription.pause();

      subscription.unpause();

      expect(subscription.state).toBe('ACTIVE');
    });

    it('should transition from ACTIVE to CANCELLED', () => {
      const subscription = Subscription.create(defaultParams);
      subscription.markAsActivationInProgress();
      subscription.activate('phonepe_sub_456');

      subscription.initiateCancellation();
      subscription.confirmCancellation();

      expect(subscription.state).toBe('CANCELLED');
      expect(subscription.cancelledAt).toBeInstanceOf(Date);
    });

    it('should transition from ACTIVE to REVOKED', () => {
      const subscription = Subscription.create(defaultParams);
      subscription.markAsActivationInProgress();
      subscription.activate('phonepe_sub_456');

      subscription.revoke();

      expect(subscription.state).toBe('REVOKED');
      expect(subscription.cancelledAt).toBeInstanceOf(Date);
    });

    it('should transition from ACTIVE to EXPIRED', () => {
      const subscription = Subscription.create(defaultParams);
      subscription.markAsActivationInProgress();
      subscription.activate('phonepe_sub_456');

      subscription.expire();

      expect(subscription.state).toBe('EXPIRED');
    });
  });

  describe('invalid state transitions', () => {
    it('should throw error when activating from CREATED', () => {
      const subscription = Subscription.create(defaultParams);

      expect(() => subscription.activate('phonepe_sub_456')).toThrow(
        'Invalid state transition: CREATED → ACTIVE. Expected: ACTIVATION_IN_PROGRESS → ACTIVE',
      );
    });

    it('should throw error when pausing from CREATED', () => {
      const subscription = Subscription.create(defaultParams);

      expect(() => subscription.pause()).toThrow(
        'Invalid state transition: CREATED → PAUSED. Expected: ACTIVE → PAUSED',
      );
    });

    it('should throw error when revoking from PAUSED', () => {
      const subscription = Subscription.create(defaultParams);
      subscription.markAsActivationInProgress();
      subscription.activate('phonepe_sub_456');
      subscription.pause();

      expect(() => subscription.revoke()).toThrow(
        'Invalid state transition: PAUSED → REVOKED. Expected: ACTIVE → REVOKED',
      );
    });

    it('should throw error when confirming cancellation without initiating', () => {
      const subscription = Subscription.create(defaultParams);
      subscription.markAsActivationInProgress();
      subscription.activate('phonepe_sub_456');

      expect(() => subscription.confirmCancellation()).toThrow(
        'Cannot confirm cancellation from state: ACTIVE',
      );
    });

    it('should throw error when expiring from PAUSED', () => {
      const subscription = Subscription.create(defaultParams);
      subscription.markAsActivationInProgress();
      subscription.activate('phonepe_sub_456');
      subscription.pause();

      expect(() => subscription.expire()).toThrow(
        'Cannot expire from state: PAUSED',
      );
    });
  });

  describe('helper methods', () => {
    it('should return true for canRedeem when ACTIVE', () => {
      const subscription = Subscription.create(defaultParams);
      subscription.markAsActivationInProgress();
      subscription.activate('phonepe_sub_456');

      expect(subscription.canRedeem()).toBe(true);
    });

    it('should return false for canRedeem when not ACTIVE', () => {
      const subscription = Subscription.create(defaultParams);

      expect(subscription.canRedeem()).toBe(false);
    });

    it('should return true for isTerminal when CANCELLED', () => {
      const subscription = Subscription.create(defaultParams);
      subscription.markAsActivationInProgress();
      subscription.activate('phonepe_sub_456');
      subscription.initiateCancellation();
      subscription.confirmCancellation();

      expect(subscription.isTerminal()).toBe(true);
    });

    it('should return true for isTerminal when REVOKED', () => {
      const subscription = Subscription.create(defaultParams);
      subscription.markAsActivationInProgress();
      subscription.activate('phonepe_sub_456');
      subscription.revoke();

      expect(subscription.isTerminal()).toBe(true);
    });

    it('should return true for isTerminal when EXPIRED', () => {
      const subscription = Subscription.create(defaultParams);
      subscription.markAsActivationInProgress();
      subscription.activate('phonepe_sub_456');
      subscription.expire();

      expect(subscription.isTerminal()).toBe(true);
    });

    it('should return true for isTerminal when FAILED', () => {
      const subscription = Subscription.create(defaultParams);
      subscription.markAsFailed();

      expect(subscription.isTerminal()).toBe(true);
    });

    it('should return false for isTerminal when ACTIVE', () => {
      const subscription = Subscription.create(defaultParams);
      subscription.markAsActivationInProgress();
      subscription.activate('phonepe_sub_456');

      expect(subscription.isTerminal()).toBe(false);
    });
  });

  describe('reconstruct', () => {
    it('should reconstruct subscription from data', () => {
      const data = {
        id: 'sub123',
        merchantSubscriptionId: 'merchant_sub_123',
        userId: 'user123',
        appId: 'app123',
        state: 'ACTIVE' as SubscriptionState,
        maxAmount: 100000,
        frequency: 'MONTHLY' as SubscriptionFrequency,
        authWorkflowType: 'TRANSACTION' as AuthWorkflowType,
        amountType: 'VARIABLE' as AmountType,
        productType: 'UPI_MANDATE' as const,
        expireAt: null as Date | null,
        metadata: {},
        phonepeSubscriptionId: 'phonepe_sub_456',
        activatedAt: new Date(),
        cancelledAt: null as Date | null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const subscription = Subscription.reconstruct(data);

      expect(subscription.id).toBe(data.id);
      expect(subscription.state).toBe('ACTIVE');
      expect(subscription.phonepeSubscriptionId).toBe('phonepe_sub_456');
    });
  });
});
