import { Redemption } from './redemption.entity';
import { RedemptionState } from '../enums/subscription.enum';

describe('Redemption Entity', () => {
  const defaultParams = {
    id: 'red123',
    merchantOrderId: 'order_123',
    merchantSubscriptionId: 'sub_123',
    userId: 'user123',
    appId: 'app123',
    amount: 10000, // 100 INR in paise
  };

  describe('create', () => {
    it('should create a redemption with default values', () => {
      const redemption = Redemption.create(defaultParams);

      expect(redemption.id).toBe(defaultParams.id);
      expect(redemption.merchantOrderId).toBe(defaultParams.merchantOrderId);
      expect(redemption.merchantSubscriptionId).toBe(
        defaultParams.merchantSubscriptionId,
      );
      expect(redemption.userId).toBe(defaultParams.userId);
      expect(redemption.appId).toBe(defaultParams.appId);
      expect(redemption.amount).toBe(defaultParams.amount);
      expect(redemption.state).toBe('NOTIFICATION_IN_PROGRESS');
      expect(redemption.autoDebit).toBe(true);
      expect(redemption.phonepeOrderId).toBeNull();
      expect(redemption.transactionId).toBeNull();
      expect(redemption.notifiedAt).toBeNull();
      expect(redemption.validAfter).toBeNull();
      expect(redemption.validUpto).toBeNull();
    });

    it('should create redemption with autoDebit set to false', () => {
      const redemption = Redemption.create({
        ...defaultParams,
        autoDebit: false,
      });

      expect(redemption.autoDebit).toBe(false);
    });

    it('should create redemption with metadata', () => {
      const metadata = { invoiceId: 'inv_123', product: 'premium' };
      const redemption = Redemption.create({
        ...defaultParams,
        metadata,
      });

      expect(redemption.metadata).toEqual(metadata);
    });
  });

  describe('state transitions', () => {
    it('should transition from NOTIFICATION_IN_PROGRESS to NOTIFIED', () => {
      const redemption = Redemption.create(defaultParams);
      const validAfter = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const validUpto = new Date(Date.now() + 48 * 60 * 60 * 1000);

      redemption.markAsNotified('phonepe_order_456', validAfter, validUpto);

      expect(redemption.state).toBe('NOTIFIED');
      expect(redemption.phonepeOrderId).toBe('phonepe_order_456');
      expect(redemption.notifiedAt).toBeInstanceOf(Date);
      expect(redemption.validAfter).toEqual(validAfter);
      expect(redemption.validUpto).toEqual(validUpto);
    });

    it('should transition from NOTIFICATION_IN_PROGRESS to FAILED on notification failure', () => {
      const redemption = Redemption.create(defaultParams);

      redemption.markNotificationFailed(
        'NOTIFICATION_ERROR',
        'User not reachable',
      );

      expect(redemption.state).toBe('FAILED');
      expect(redemption.errorCode).toBe('NOTIFICATION_ERROR');
      expect(redemption.detailedErrorCode).toBe('User not reachable');
    });

    it('should transition from NOTIFIED to PENDING', () => {
      const redemption = Redemption.create(defaultParams);
      const validAfter = new Date();
      const validUpto = new Date();
      redemption.markAsNotified('phonepe_order_456', validAfter, validUpto);

      redemption.markAsPending();

      expect(redemption.state).toBe('PENDING');
    });

    it('should transition from NOTIFIED to COMPLETED', () => {
      const redemption = Redemption.create(defaultParams);
      const validAfter = new Date();
      const validUpto = new Date();
      redemption.markAsNotified('phonepe_order_456', validAfter, validUpto);

      redemption.complete('txn_789');

      expect(redemption.state).toBe('COMPLETED');
      expect(redemption.transactionId).toBe('txn_789');
    });

    it('should transition from PENDING to COMPLETED', () => {
      const redemption = Redemption.create(defaultParams);
      const validAfter = new Date();
      const validUpto = new Date();
      redemption.markAsNotified('phonepe_order_456', validAfter, validUpto);
      redemption.markAsPending();

      redemption.complete('txn_789');

      expect(redemption.state).toBe('COMPLETED');
      expect(redemption.transactionId).toBe('txn_789');
    });

    it('should transition from NOTIFIED to FAILED', () => {
      const redemption = Redemption.create(defaultParams);
      const validAfter = new Date();
      const validUpto = new Date();
      redemption.markAsNotified('phonepe_order_456', validAfter, validUpto);

      redemption.fail('INSUFFICIENT_FUNDS', 'User has insufficient balance');

      expect(redemption.state).toBe('FAILED');
      expect(redemption.errorCode).toBe('INSUFFICIENT_FUNDS');
      expect(redemption.detailedErrorCode).toBe(
        'User has insufficient balance',
      );
    });

    it('should transition from PENDING to FAILED', () => {
      const redemption = Redemption.create(defaultParams);
      const validAfter = new Date();
      const validUpto = new Date();
      redemption.markAsNotified('phonepe_order_456', validAfter, validUpto);
      redemption.markAsPending();

      redemption.fail('BANK_ERROR', 'Bank declined the transaction');

      expect(redemption.state).toBe('FAILED');
      expect(redemption.errorCode).toBe('BANK_ERROR');
    });
  });

  describe('invalid state transitions', () => {
    it('should throw error when marking as notified from COMPLETED', () => {
      const redemption = Redemption.create(defaultParams);
      const validAfter = new Date();
      const validUpto = new Date();
      redemption.markAsNotified('phonepe_order_456', validAfter, validUpto);
      redemption.complete('txn_789');

      expect(() =>
        redemption.markAsNotified('phonepe_order_789', validAfter, validUpto),
      ).toThrow('Cannot mark as notified from state: COMPLETED');
    });

    it('should throw error when marking notification failed from NOTIFIED', () => {
      const redemption = Redemption.create(defaultParams);
      const validAfter = new Date();
      const validUpto = new Date();
      redemption.markAsNotified('phonepe_order_456', validAfter, validUpto);

      expect(() =>
        redemption.markNotificationFailed('ERROR', 'Details'),
      ).toThrow('Cannot mark notification as failed from state: NOTIFIED');
    });

    it('should throw error when marking as pending from NOTIFICATION_IN_PROGRESS', () => {
      const redemption = Redemption.create(defaultParams);

      expect(() => redemption.markAsPending()).toThrow(
        'Cannot mark as pending from state: NOTIFICATION_IN_PROGRESS',
      );
    });

    it('should throw error when completing from NOTIFICATION_IN_PROGRESS', () => {
      const redemption = Redemption.create(defaultParams);

      expect(() => redemption.complete('txn_789')).toThrow(
        'Cannot complete from state: NOTIFICATION_IN_PROGRESS',
      );
    });

    it('should throw error when failing from NOTIFICATION_IN_PROGRESS', () => {
      const redemption = Redemption.create(defaultParams);

      expect(() => redemption.fail('ERROR', 'Details')).toThrow(
        'Cannot fail from state: NOTIFICATION_IN_PROGRESS',
      );
    });
  });

  describe('helper methods', () => {
    it('should return true for isTerminal when COMPLETED', () => {
      const redemption = Redemption.create(defaultParams);
      const validAfter = new Date();
      const validUpto = new Date();
      redemption.markAsNotified('phonepe_order_456', validAfter, validUpto);
      redemption.complete('txn_789');

      expect(redemption.isTerminal()).toBe(true);
    });

    it('should return true for isTerminal when FAILED', () => {
      const redemption = Redemption.create(defaultParams);
      const validAfter = new Date();
      const validUpto = new Date();
      redemption.markAsNotified('phonepe_order_456', validAfter, validUpto);
      redemption.fail('ERROR', 'Details');

      expect(redemption.isTerminal()).toBe(true);
    });

    it('should return false for isTerminal when NOTIFICATION_IN_PROGRESS', () => {
      const redemption = Redemption.create(defaultParams);

      expect(redemption.isTerminal()).toBe(false);
    });

    it('should return false for isTerminal when NOTIFIED', () => {
      const redemption = Redemption.create(defaultParams);
      const validAfter = new Date();
      const validUpto = new Date();
      redemption.markAsNotified('phonepe_order_456', validAfter, validUpto);

      expect(redemption.isTerminal()).toBe(false);
    });

    it('should return false for isTerminal when PENDING', () => {
      const redemption = Redemption.create(defaultParams);
      const validAfter = new Date();
      const validUpto = new Date();
      redemption.markAsNotified('phonepe_order_456', validAfter, validUpto);
      redemption.markAsPending();

      expect(redemption.isTerminal()).toBe(false);
    });

    it('should return true for isActive when NOTIFICATION_IN_PROGRESS', () => {
      const redemption = Redemption.create(defaultParams);

      expect(redemption.isActive()).toBe(true);
    });

    it('should return true for isActive when NOTIFIED', () => {
      const redemption = Redemption.create(defaultParams);
      const validAfter = new Date();
      const validUpto = new Date();
      redemption.markAsNotified('phonepe_order_456', validAfter, validUpto);

      expect(redemption.isActive()).toBe(true);
    });

    it('should return true for isActive when PENDING', () => {
      const redemption = Redemption.create(defaultParams);
      const validAfter = new Date();
      const validUpto = new Date();
      redemption.markAsNotified('phonepe_order_456', validAfter, validUpto);
      redemption.markAsPending();

      expect(redemption.isActive()).toBe(true);
    });

    it('should return false for isActive when COMPLETED', () => {
      const redemption = Redemption.create(defaultParams);
      const validAfter = new Date();
      const validUpto = new Date();
      redemption.markAsNotified('phonepe_order_456', validAfter, validUpto);
      redemption.complete('txn_789');

      expect(redemption.isActive()).toBe(false);
    });

    it('should return false for isActive when FAILED', () => {
      const redemption = Redemption.create(defaultParams);
      const validAfter = new Date();
      const validUpto = new Date();
      redemption.markAsNotified('phonepe_order_456', validAfter, validUpto);
      redemption.fail('ERROR', 'Details');

      expect(redemption.isActive()).toBe(false);
    });
  });

  describe('reconstruct', () => {
    it('should reconstruct redemption from data', () => {
      const data = {
        id: 'red123',
        merchantOrderId: 'order_123',
        merchantSubscriptionId: 'sub_123',
        userId: 'user123',
        appId: 'app123',
        amount: 10000,
        state: 'COMPLETED' as RedemptionState,
        phonepeOrderId: 'phonepe_order_456',
        transactionId: 'txn_789',
        notifiedAt: new Date(),
        validAfter: new Date(),
        validUpto: new Date(),
        errorCode: null as string | null,
        detailedErrorCode: null as string | null,
        autoDebit: true,
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const redemption = Redemption.reconstruct(data);

      expect(redemption.id).toBe(data.id);
      expect(redemption.state).toBe('COMPLETED');
      expect(redemption.transactionId).toBe('txn_789');
    });
  });
});
