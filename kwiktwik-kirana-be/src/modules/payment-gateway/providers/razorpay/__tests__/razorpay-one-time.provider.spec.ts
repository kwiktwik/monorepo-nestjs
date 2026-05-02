/**
 * Razorpay One-Time Order Provider Tests
 */

import { RazorpayOneTimeOrderProvider } from '../razorpay.provider';
import {
  RazorpayOrderStatus,
  RazorpayPaymentStatus,
} from '../../../types/razorpay.types';
import type { RazorpayProviderConfig } from '../../interfaces/subscription-provider.interface';

// Mock Razorpay SDK
jest.mock('razorpay', () => {
  const mockOrders = {
    create: jest.fn(),
    fetch: jest.fn(),
    fetchPayments: jest.fn(),
  };

  const mockPayments = {
    fetch: jest.fn(),
    capture: jest.fn(),
    refund: jest.fn(),
  };

  const MockRazorpay = jest.fn().mockImplementation(() => ({
    subscriptions: { create: jest.fn(), fetch: jest.fn(), cancel: jest.fn(), pause: jest.fn(), resume: jest.fn(), update: jest.fn() },
    orders: mockOrders,
    payments: mockPayments,
    customers: { create: jest.fn() },
    plans: { create: jest.fn() },
  }));

  (MockRazorpay as any).mockOrders = mockOrders;
  (MockRazorpay as any).mockPayments = mockPayments;

  return MockRazorpay;
});

const getRazorpayMock = () => {
  const Razorpay = require('razorpay');
  return {
    orders: (Razorpay as any).mockOrders,
    payments: (Razorpay as any).mockPayments,
  };
};

const mockConfig: RazorpayProviderConfig = {
  configId: 'config_test',
  provider: 'RAZORPAY',
  appId: 'app_test',
  environment: 'SANDBOX',
  enabled: true,
  isDefault: true,
  webhookSecret: 'test_webhook_secret',
  keyId: 'rzp_test_key',
  keySecret: 'rzp_test_secret',
  accountId: null,
};

const mockOrder = {
  id: 'order_test_123',
  entity: 'order' as const,
  amount: 10000,
  amount_paid: 0,
  amount_due: 10000,
  currency: 'INR',
  receipt: 'MORD_test',
  offer_id: null,
  status: RazorpayOrderStatus.CREATED,
  attempts: 0,
  notes: {},
  created_at: Math.floor(Date.now() / 1000),
};

const mockPayment = {
  id: 'pay_test_123',
  entity: 'payment' as const,
  order_id: 'order_test_123',
  invoice_id: null,
  amount: 10000,
  currency: 'INR',
  status: RazorpayPaymentStatus.CAPTURED,
  method: 'upi',
  amount_refunded: 0,
  refund_status: null,
  captured: true,
  description: null,
  card_id: null,
  card: null,
  bank: null,
  wallet: null,
  vpa: 'test@upi',
  email: 'test@test.com',
  contact: '9999999999',
  customer_id: null,
  token_id: null,
  notes: {},
  fee: 200,
  tax: 36,
  error_code: null,
  error_description: null,
  error_reason: null,
  error_source: null,
  error_step: null,
  created_at: Math.floor(Date.now() / 1000),
};

describe('RazorpayOneTimeOrderProvider', () => {
  let provider: RazorpayOneTimeOrderProvider;

  beforeEach(() => {
    jest.clearAllMocks();
    provider = new RazorpayOneTimeOrderProvider();
    provider.initialize(mockConfig);
  });

  describe('initialization', () => {
    it('should have RAZORPAY as provider', () => {
      expect(provider.provider).toBe('RAZORPAY');
    });

    it('should return public config with keyId', () => {
      const config = provider.getPublicConfig();
      expect(config).toEqual({ keyId: 'rzp_test_key', provider: 'RAZORPAY' });
    });

    it('should throw if not initialized', () => {
      const uninit = new RazorpayOneTimeOrderProvider();
      expect(() => uninit.getPublicConfig()).toThrow();
    });
  });

  describe('createOrder', () => {
    it('should create order successfully', async () => {
      const mock = getRazorpayMock();
      mock.orders.create.mockResolvedValueOnce(mockOrder);

      const result = await provider.createOrder({
        merchantOrderId: 'MORD_test',
        amount: 10000,
        currency: 'INR',
        receipt: 'receipt_001',
        notes: { product: 'test' },
      });

      expect(result.success).toBe(true);
      expect(result.providerOrderId).toBe('order_test_123');
      expect(result.checkoutConfig).toEqual({
        keyId: 'rzp_test_key',
        orderId: 'order_test_123',
        amount: 10000,
        currency: 'INR',
      });
      expect(result.redirectUrl).toBeNull();
      expect(mock.orders.create).toHaveBeenCalledWith({
        amount: 10000,
        currency: 'INR',
        receipt: 'receipt_001',
        notes: { product: 'test' },
        payment_capture: true,
      });
    });

    it('should use merchantOrderId as receipt fallback', async () => {
      const mock = getRazorpayMock();
      mock.orders.create.mockResolvedValueOnce(mockOrder);

      await provider.createOrder({
        merchantOrderId: 'MORD_fallback',
        amount: 5000,
        currency: 'INR',
      });

      expect(mock.orders.create).toHaveBeenCalledWith(
        expect.objectContaining({ receipt: 'MORD_fallback' }),
      );
    });

    it('should return failure on provider error', async () => {
      const mock = getRazorpayMock();
      mock.orders.create.mockRejectedValueOnce({
        error: { description: 'Amount too low', code: 'BAD_REQUEST' },
      });

      const result = await provider.createOrder({
        merchantOrderId: 'MORD_fail',
        amount: 50,
        currency: 'INR',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Amount too low');
      expect(result.errorCode).toBe('BAD_REQUEST');
      expect(result.providerOrderId).toBe('');
    });
  });

  describe('getOrderStatus', () => {
    it('should return order status with payment details', async () => {
      const mock = getRazorpayMock();
      mock.orders.fetch.mockResolvedValueOnce({
        ...mockOrder,
        status: RazorpayOrderStatus.PAID,
      });
      mock.orders.fetchPayments.mockResolvedValueOnce([mockPayment]);

      const result = await provider.getOrderStatus({
        merchantOrderId: 'MORD_test',
        providerOrderId: 'order_test_123',
      });

      expect(result.merchantOrderId).toBe('MORD_test');
      expect(result.providerOrderId).toBe('order_test_123');
      expect(result.mappedStatus).toBe('CAPTURED');
      expect(result.paymentDetails).toHaveLength(1);
      expect(result.paymentDetails[0].transactionId).toBe('pay_test_123');
      expect(result.paymentDetails[0].paymentMode).toBe('upi');
    });

    it('should throw on fetch failure', async () => {
      const mock = getRazorpayMock();
      mock.orders.fetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(provider.getOrderStatus({
        merchantOrderId: 'MORD_test',
        providerOrderId: 'order_bad',
      })).rejects.toThrow('Failed to get order status');
    });
  });

  describe('verifyPayment', () => {
    it('should verify valid HMAC signature', async () => {
      const crypto = require('crypto');
      const payload = 'order_test_123|pay_test_123';
      const signature = crypto
        .createHmac('sha256', 'rzp_test_secret')
        .update(payload)
        .digest('hex');

      const result = await provider.verifyPayment({
        merchantOrderId: 'MORD_test',
        providerOrderId: 'order_test_123',
        providerPaymentId: 'pay_test_123',
        signature,
      });

      expect(result.verified).toBe(true);
      expect(result.orderId).toBe('order_test_123');
      expect(result.paymentId).toBe('pay_test_123');
      expect(result.error).toBeNull();
    });

    it('should reject invalid signature', async () => {
      const result = await provider.verifyPayment({
        merchantOrderId: 'MORD_test',
        providerOrderId: 'order_test_123',
        providerPaymentId: 'pay_test_123',
        signature: 'invalid_signature_here',
      });

      expect(result.verified).toBe(false);
      expect(result.error).toBe('Invalid payment signature');
    });
  });

  describe('refundPayment', () => {
    it('should refund successfully', async () => {
      const mock = getRazorpayMock();
      mock.payments.refund.mockResolvedValueOnce({ id: 'rfnd_test_123' });

      const result = await provider.refundPayment({
        providerPaymentId: 'pay_test_123',
        amount: 5000,
        reason: 'Customer request',
        merchantRefundId: 'MREF_test',
      });

      expect(result.success).toBe(true);
      expect(result.refundId).toBe('rfnd_test_123');
      expect(result.status).toBe('PENDING');
      expect(mock.payments.refund).toHaveBeenCalledWith('pay_test_123', {
        amount: 5000,
        notes: { reason: 'Customer request' },
      });
    });

    it('should handle full refund (no amount)', async () => {
      const mock = getRazorpayMock();
      mock.payments.refund.mockResolvedValueOnce({ id: 'rfnd_full' });

      const result = await provider.refundPayment({
        providerPaymentId: 'pay_test_123',
        amount: null,
        reason: null,
        merchantRefundId: 'MREF_full',
      });

      expect(result.success).toBe(true);
      expect(mock.payments.refund).toHaveBeenCalledWith('pay_test_123', {
        amount: undefined,
        notes: undefined,
      });
    });

    it('should return failure on refund error', async () => {
      const mock = getRazorpayMock();
      mock.payments.refund.mockRejectedValueOnce({
        error: { description: 'Already refunded' },
      });

      const result = await provider.refundPayment({
        providerPaymentId: 'pay_test_123',
        amount: 10000,
        reason: null,
        merchantRefundId: 'MREF_fail',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Already refunded');
    });
  });
});