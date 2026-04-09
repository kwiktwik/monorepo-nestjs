/**
 * Tests for RazorpayProvider
 *
 * Note: We mock the razorpay SDK to avoid real API calls.
 */
import { RazorpayProvider } from './razorpay.provider';
import { RazorpayConfig } from '../types';

// Mock the razorpay module
jest.mock('razorpay', () => {
  return jest.fn().mockImplementation(() => ({
    orders: {
      create: jest.fn().mockResolvedValue({
        id: 'order_123',
        amount: 10000,
        currency: 'INR',
        status: 'created',
        entity: 'order',
        attempts: 0,
        created_at: 1234567890,
      }),
      fetch: jest.fn().mockResolvedValue({
        id: 'order_123',
        amount: 10000,
        currency: 'INR',
        status: 'paid',
      }),
      fetchPayments: jest.fn().mockResolvedValue({
        items: [
          { id: 'pay_123', status: 'captured', amount: 10000, method: 'upi' },
        ],
      }),
    },
    subscriptions: {
      create: jest.fn().mockResolvedValue({
        id: 'sub_123',
        customer_id: 'cust_123',
        status: 'active',
        plan_id: 'plan_123',
        created_at: 1234567890,
      }),
    },
    payments: {
      refund: jest.fn().mockResolvedValue({
        id: 'ref_123',
        amount: 10000,
        status: 'processed',
      }),
    },
  }));
});

describe('RazorpayProvider', () => {
  const config: RazorpayConfig = {
    id: 'test-app',
    provider: 'razorpay',
    environment: 'sandbox',
    enabled: true,
    keyId: 'rzp_test_xxx',
    keySecret: 'secret',
  };

  let provider: RazorpayProvider;

  beforeEach(() => {
    provider = new RazorpayProvider(config);
  });

  describe('providerType', () => {
    it('should return razorpay', () => {
      expect(provider.providerType).toBe('razorpay');
    });
  });

  // Note: getCapabilities is part of the proposed interface but not yet implemented
  // describe('getCapabilities', () => { ... });

  describe('createOrder', () => {
    it('should create an order', async () => {
      const result = await provider.createOrder({
        appId: 'test-app',
        amount: 10000,
        currency: 'INR',
      });
      expect(result.orderId).toBe('order_123');
      expect(result.amount).toBe(10000);
      expect(result.provider).toBe('razorpay');
    });
  });

  describe('verifyPayment', () => {
    it('should verify a payment', async () => {
      const result = await provider.verifyPayment({
        appId: 'test-app',
        orderId: 'order_123',
      });
      expect(result.isValid).toBe(true);
      expect(result.paymentId).toBe('pay_123');
      expect(result.provider).toBe('razorpay');
    });
  });

  describe('createSubscription', () => {
    it('should create a subscription', async () => {
      const result = await provider.createSubscription({
        appId: 'test-app',
        planId: 'plan_123',
      });
      expect(result.subscriptionId).toBe('sub_123');
      expect(result.provider).toBe('razorpay');
    });
  });

  describe('getPublicConfig', () => {
    it('should return safe public config', () => {
      const pub = provider.getPublicConfig();
      expect(pub.provider).toBe('razorpay');
      expect(pub.keyId).toBe('rzp_test_xxx');
      expect(pub).not.toHaveProperty('keySecret');
    });
  });

  describe('healthCheck', () => {
    it('should return a health status object', async () => {
      const health = await provider.healthCheck();
      expect(health).toHaveProperty('healthy');
      expect(typeof health.healthy).toBe('boolean');
    });
  });
});
