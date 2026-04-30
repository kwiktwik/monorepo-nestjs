/**
 * Razorpay Provider Tests
 * 
 * Comprehensive tests for Razorpay subscription providers.
 */

import {
  RazorpayProviderManagedProvider,
  RazorpayUserManagedProvider,
  createRazorpayClient,
  type RazorpayClient,
  type RazorpaySubscriptionCreateParams,
  type RazorpaySubscriptionUpdateParams,
} from '../razorpay.provider';
import {
  RazorpaySubscriptionStatus,
  RazorpayOrderStatus,
  RazorpayPaymentStatus,
  RazorpayWebhookEvent,
  mapRazorpaySubscriptionStatus,
} from '../../../types/razorpay.types';
import { SubscriptionStatus } from '../../../types/subscription-status.enum';
import type { RazorpayProviderConfig } from '../../interfaces/subscription-provider.interface';

// ============================================================================
// Mocks
// ============================================================================

// Mock Razorpay SDK
jest.mock('razorpay', () => {
  const mockSubscriptions = {
    create: jest.fn(),
    fetch: jest.fn(),
    cancel: jest.fn(),
    pause: jest.fn(),
    resume: jest.fn(),
    update: jest.fn(),
  };

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

  const mockCustomers = {
    create: jest.fn(),
  };

  const mockPlans = {
    create: jest.fn(),
  };

  // Create a mock constructor function
  const MockRazorpay = jest.fn().mockImplementation(() => ({
    subscriptions: mockSubscriptions,
    orders: mockOrders,
    payments: mockPayments,
    customers: mockCustomers,
    plans: mockPlans,
  }));

  // Attach mock methods for direct access in tests
  MockRazorpay.mockSubscriptions = mockSubscriptions;
  MockRazorpay.mockOrders = mockOrders;
  MockRazorpay.mockPayments = mockPayments;
  MockRazorpay.mockCustomers = mockCustomers;
  MockRazorpay.mockPlans = mockPlans;

  return MockRazorpay;
});

// Get reference to mock after jest.mock is processed
const getRazorpayMock = () => {
  const Razorpay = require('razorpay');
  return {
    subscriptions: Razorpay.mockSubscriptions,
    orders: Razorpay.mockOrders,
    payments: Razorpay.mockPayments,
    customers: Razorpay.mockCustomers,
    plans: Razorpay.mockPlans,
  };
};

const mockConfig: RazorpayProviderConfig = {
  configId: 'config_123',
  provider: 'RAZORPAY',
  appId: 'app_123',
  environment: 'SANDBOX',
  enabled: true,
  isDefault: true,
  webhookSecret: 'test_webhook_secret',
  keyId: 'test_key_id',
  keySecret: 'test_key_secret',
  accountId: 'acc_123',
};

const mockSubscriptionEntity = {
  id: 'sub_123456',
  entity: 'subscription' as const,
  plan_id: 'plan_123',
  customer_id: 'cust_123',
  status: RazorpaySubscriptionStatus.ACTIVE,
  current_start: Math.floor(Date.now() / 1000),
  current_end: Math.floor(Date.now() / 1000) + 2592000,
  ended_at: null,
  quantity: 1,
  notes: { test: 'note' },
  charge_at: Math.floor(Date.now() / 1000) + 2592000,
  start_at: Math.floor(Date.now() / 1000),
  end_at: Math.floor(Date.now() / 1000) + 31536000,
  auth_attempts: 0,
  total_count: 12,
  paid_count: 1,
  customer_notify: true,
  created_at: Math.floor(Date.now() / 1000),
  expire_by: Math.floor(Date.now() / 1000) + 31536000,
  short_url: 'https://rzp.io/i/test',
  has_scheduled_changes: false,
  change_scheduled_at: null,
  source: 'api',
  offer_id: null,
  remaining_count: 11,
};

const mockOrderEntity = {
  id: 'order_123',
  entity: 'order' as const,
  amount: 10000,
  amount_paid: 0,
  amount_due: 10000,
  currency: 'INR',
  receipt: 'receipt_123',
  offer_id: null,
  status: RazorpayOrderStatus.CREATED,
  attempts: 0,
  notes: {},
  created_at: Math.floor(Date.now() / 1000),
};

const mockPaymentEntity = {
  id: 'pay_123',
  entity: 'payment' as const,
  order_id: 'order_123',
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
  customer_id: 'cust_123',
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

// ============================================================================
// Razorpay Client Tests
// ============================================================================

describe('createRazorpayClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('subscriptions', () => {
    it('should create subscription', async () => {
      const mock = getRazorpayMock();
      mock.subscriptions.create.mockResolvedValueOnce(mockSubscriptionEntity);

      const client = createRazorpayClient(mockConfig);
      const result = await client.subscriptions.create({
        plan_id: 'plan_123',
        total_count: 12,
        customer_notify: true,
      });

      expect(result.id).toBe('sub_123456');
      expect(mock.subscriptions.create).toHaveBeenCalled();
    });

    it('should fetch subscription', async () => {
      const mock = getRazorpayMock();
      mock.subscriptions.fetch.mockResolvedValueOnce(mockSubscriptionEntity);

      const client = createRazorpayClient(mockConfig);
      const result = await client.subscriptions.fetch('sub_123456');

      expect(result.id).toBe('sub_123456');
    });

    it('should cancel subscription with options', async () => {
      const mock = getRazorpayMock();
      mock.subscriptions.cancel.mockResolvedValueOnce({
        ...mockSubscriptionEntity,
        status: RazorpaySubscriptionStatus.CANCELLED,
      });

      const client = createRazorpayClient(mockConfig);
      const result = await client.subscriptions.cancel('sub_123456', {
        cancel_at_cycle_end: true,
      });

      expect(mock.subscriptions.cancel).toHaveBeenCalledWith('sub_123456', {
        cancel_at_cycle_end: true,
      });
    });

    it('should pause subscription', async () => {
      const mock = getRazorpayMock();
      mock.subscriptions.pause.mockResolvedValueOnce({
        ...mockSubscriptionEntity,
        status: RazorpaySubscriptionStatus.PAUSED,
      });

      const client = createRazorpayClient(mockConfig);
      const result = await client.subscriptions.pause('sub_123456');

      expect(result.status).toBe(RazorpaySubscriptionStatus.PAUSED);
    });

    it('should resume subscription', async () => {
      const mock = getRazorpayMock();
      mock.subscriptions.resume.mockResolvedValueOnce(mockSubscriptionEntity);

      const client = createRazorpayClient(mockConfig);
      const result = await client.subscriptions.resume('sub_123456');

      expect(result.status).toBe(RazorpaySubscriptionStatus.ACTIVE);
    });

    it('should update subscription', async () => {
      const mock = getRazorpayMock();
      mock.subscriptions.update.mockResolvedValueOnce(mockSubscriptionEntity);

      const client = createRazorpayClient(mockConfig);
      const result = await client.subscriptions.update('sub_123456', {
        notes: { updated: 'true' },
      });

      expect(mock.subscriptions.update).toHaveBeenCalledWith('sub_123456', {
        notes: { updated: 'true' },
      });
    });
  });

  describe('orders', () => {
    it('should create order', async () => {
      const mock = getRazorpayMock();
      mock.orders.create.mockResolvedValueOnce(mockOrderEntity);

      const client = createRazorpayClient(mockConfig);
      const result = await client.orders.create({
        amount: 10000,
        currency: 'INR',
        receipt: 'receipt_123',
      });

      expect(result.id).toBe('order_123');
    });

    it('should fetch order payments', async () => {
      const mock = getRazorpayMock();
      mock.orders.fetchPayments.mockResolvedValueOnce([mockPaymentEntity]);

      const client = createRazorpayClient(mockConfig);
      const result = await client.orders.fetchPayments('order_123');

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('pay_123');
    });
  });

  describe('payments', () => {
    it('should fetch payment', async () => {
      const mock = getRazorpayMock();
      mock.payments.fetch.mockResolvedValueOnce(mockPaymentEntity);

      const client = createRazorpayClient(mockConfig);
      const result = await client.payments.fetch('pay_123');

      expect(result.id).toBe('pay_123');
    });

    it('should capture payment', async () => {
      const mock = getRazorpayMock();
      mock.payments.capture.mockResolvedValueOnce(mockPaymentEntity);

      const client = createRazorpayClient(mockConfig);
      const result = await client.payments.capture('pay_123', 10000, 'INR');

      expect(mock.payments.capture).toHaveBeenCalledWith('pay_123', 10000, 'INR');
    });

    it('should refund payment', async () => {
      const mock = getRazorpayMock();
      mock.payments.refund.mockResolvedValueOnce({ id: 'rfn_123' });

      const client = createRazorpayClient(mockConfig);
      const result = await client.payments.refund('pay_123', {
        amount: 5000,
      });

      expect(result.id).toBe('rfn_123');
    });
  });

  describe('customers', () => {
    it('should create customer', async () => {
      const mock = getRazorpayMock();
      mock.customers.create.mockResolvedValueOnce({ id: 'cust_123' });

      const client = createRazorpayClient(mockConfig);
      const result = await client.customers.create({
        name: 'Test User',
        email: 'test@test.com',
        contact: '9999999999',
      });

      expect(result.id).toBe('cust_123');
    });
  });

  describe('plans', () => {
    it('should create plan', async () => {
      const mock = getRazorpayMock();
      mock.plans.create.mockResolvedValueOnce({ id: 'plan_123' });

      const client = createRazorpayClient(mockConfig);
      const result = await client.plans.create({
        period: 'monthly',
        interval: 1,
        item: {
          name: 'Test Plan',
          amount: 10000,
          currency: 'INR',
        },
      });

      expect(result.id).toBe('plan_123');
    });
  });
});

// ============================================================================
// Razorpay Provider Managed Provider Tests
// ============================================================================

describe('RazorpayProviderManagedProvider', () => {
  let provider: RazorpayProviderManagedProvider;

  beforeEach(async () => {
    jest.clearAllMocks();
    provider = new RazorpayProviderManagedProvider();
    provider.initialize(mockConfig);
  });

  describe('initialization', () => {
    it('should initialize with config', () => {
      expect(provider.provider).toBe('RAZORPAY');
      expect(provider.subscriptionType).toBe('PROVIDER_MANAGED');
    });

    it('should return public config', () => {
      const publicConfig = provider.getPublicConfig();
      
      expect(publicConfig).toEqual({
        keyId: 'test_key_id',
        provider: 'RAZORPAY',
      });
    });

    it('should throw if not initialized', () => {
      const uninitializedProvider = new RazorpayProviderManagedProvider();
      
      expect(() => uninitializedProvider.getPublicConfig()).toThrow();
    });
  });

  describe('healthCheck', () => {
    it('should return healthy', async () => {
      const result = await provider.healthCheck();

      expect(result.healthy).toBe(true);
      expect(result.message).toBeNull();
    });
  });

  describe('setupSubscription', () => {
    it('should setup subscription successfully', async () => {
      const mock = getRazorpayMock();
      mock.plans.create.mockResolvedValueOnce({ id: 'plan_123' });
      mock.customers.create.mockResolvedValueOnce({ id: 'cust_123' });
      mock.subscriptions.create.mockResolvedValueOnce(mockSubscriptionEntity);

      const result = await provider.setupSubscription({
        merchantSubscriptionId: 'MSUB123',
        merchantOrderId: 'MO123',
        userId: 'user_123',
        appId: 'app_123',
        planId: 'plan_123',
        providerPlanId: '',
        pricing: {
          initialAmount: 10000,
          recurringAmount: 10000,
          currency: 'INR',
          frequency: 'MONTHLY',
          totalCycles: 12,
        },
        customerEmail: 'test@test.com',
        customerPhone: '9999999999',
        redirectUrl: 'https://test.com/callback',
        metadata: { customerName: 'Test User' },
      });

      expect(result.success).toBe(true);
      expect(result.providerSubscriptionId).toBe('sub_123456');
      expect(result.intentUrl).toBe('https://rzp.io/i/test');
    });

    it('should use existing plan if providerPlanId provided', async () => {
      const mock = getRazorpayMock();
      mock.subscriptions.create.mockResolvedValueOnce(mockSubscriptionEntity);

      const result = await provider.setupSubscription({
        merchantSubscriptionId: 'MSUB123',
        merchantOrderId: 'MO123',
        userId: 'user_123',
        appId: 'app_123',
        planId: 'plan_123',
        providerPlanId: 'existing_plan_123',
        pricing: {
          initialAmount: 10000,
          recurringAmount: 10000,
          currency: 'INR',
          frequency: 'MONTHLY',
          totalCycles: 12,
        },
        customerEmail: null,
        customerPhone: null,
        redirectUrl: null,
        metadata: {},
      });

      expect(result.success).toBe(true);
      expect(mock.plans.create).not.toHaveBeenCalled();
    });

    it('should return failure result on error', async () => {
      const mock = getRazorpayMock();
      mock.plans.create.mockRejectedValueOnce({
        error: { description: 'Plan creation failed', code: 'PLAN_ERROR' },
      });

      const result = await provider.setupSubscription({
        merchantSubscriptionId: 'MSUB123',
        merchantOrderId: 'MO123',
        userId: 'user_123',
        appId: 'app_123',
        planId: 'plan_123',
        providerPlanId: '',
        pricing: {
          initialAmount: 10000,
          recurringAmount: 10000,
          currency: 'INR',
          frequency: 'MONTHLY',
          totalCycles: 12,
        },
        customerEmail: null,
        customerPhone: null,
        redirectUrl: null,
        metadata: {},
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Plan creation failed');
    });
  });

  describe('chargeSubscription', () => {
    it('should return status for provider-managed subscription', async () => {
      const mock = getRazorpayMock();
      mock.subscriptions.fetch.mockResolvedValueOnce(mockSubscriptionEntity);

      const result = await provider.chargeSubscription({
        merchantSubscriptionId: 'MSUB123',
        providerSubscriptionId: 'sub_123456',
        merchantOrderId: 'MO456',
        amount: 10000,
        currency: 'INR',
        metadata: {},
      });

      expect(result.success).toBe(true);
    });
  });

  describe('getSubscriptionStatus', () => {
    it('should return subscription status', async () => {
      const mock = getRazorpayMock();
      mock.subscriptions.fetch.mockResolvedValueOnce(mockSubscriptionEntity);

      const result = await provider.getSubscriptionStatus({
        merchantSubscriptionId: 'MSUB123',
        providerSubscriptionId: 'sub_123456',
      });

      expect(result.providerState).toBe(RazorpaySubscriptionStatus.ACTIVE);
      expect(result.canCharge).toBe(true);
    });
  });

  describe('cancelSubscription', () => {
    it('should cancel subscription immediately by default', async () => {
      const mock = getRazorpayMock();
      mock.subscriptions.cancel.mockResolvedValueOnce({
        ...mockSubscriptionEntity,
        status: RazorpaySubscriptionStatus.CANCELLED,
      });

      const result = await provider.cancelSubscription({
        merchantSubscriptionId: 'MSUB123',
        providerSubscriptionId: 'sub_123456',
        reason: null,
      });

      expect(result.success).toBe(true);
      expect(mock.subscriptions.cancel).toHaveBeenCalledWith(
        'sub_123456',
        { cancel_at_cycle_end: false },
      );
    });

    it('should cancel at cycle end when specified', async () => {
      const mock = getRazorpayMock();
      mock.subscriptions.cancel.mockResolvedValueOnce({
        ...mockSubscriptionEntity,
        status: RazorpaySubscriptionStatus.ACTIVE,
      });

      const result = await provider.cancelSubscription({
        merchantSubscriptionId: 'MSUB123',
        providerSubscriptionId: 'sub_123456',
        reason: null,
        cancelAtCycleEnd: true,
      });

      expect(mock.subscriptions.cancel).toHaveBeenCalledWith(
        'sub_123456',
        { cancel_at_cycle_end: true },
      );
    });
  });

  describe('pauseSubscription', () => {
    it('should pause subscription', async () => {
      const mock = getRazorpayMock();
      mock.subscriptions.pause.mockResolvedValueOnce({
        ...mockSubscriptionEntity,
        status: RazorpaySubscriptionStatus.PAUSED,
      });

      const result = await provider.pauseSubscription('MSUB123', 'sub_123456');

      expect(result.providerState).toBe(RazorpaySubscriptionStatus.PAUSED);
      expect(result.canCharge).toBe(false);
    });
  });

  describe('resumeSubscription', () => {
    it('should resume subscription', async () => {
      const mock = getRazorpayMock();
      mock.subscriptions.resume.mockResolvedValueOnce(mockSubscriptionEntity);

      const result = await provider.resumeSubscription('MSUB123', 'sub_123456');

      expect(result.providerState).toBe(RazorpaySubscriptionStatus.ACTIVE);
      expect(result.canCharge).toBe(true);
    });
  });

  describe('updateSubscription', () => {
    it('should update subscription notes', async () => {
      const mock = getRazorpayMock();
      mock.subscriptions.update.mockResolvedValueOnce(mockSubscriptionEntity);

      const result = await provider.updateSubscription('sub_123456', {
        notes: { updated: 'true' },
      });

      expect(result.providerSubscriptionId).toBe('sub_123456');
    });
  });

  describe('parseWebhookEvent', () => {
    it('should parse webhook event correctly', async () => {
      const webhookPayload = {
        entity: 'event',
        account_id: 'acc_123',
        event: RazorpayWebhookEvent.SUBSCRIPTION_ACTIVATED,
        contains: ['subscription'],
        payload: {
          subscription: {
            entity: mockSubscriptionEntity,
          },
        },
        created_at: Math.floor(Date.now() / 1000),
      };

      const result = await provider.parseWebhookEvent({
        payload: JSON.stringify(webhookPayload),
        signature: null,
        headers: {},
      });

      expect(result.eventType).toBe(RazorpayWebhookEvent.SUBSCRIPTION_ACTIVATED);
      expect(result.mappedEventType).toBe('subscription.activated');
      expect(result.provider).toBe('RAZORPAY');
      expect(result.subscriptionType).toBe('PROVIDER_MANAGED');
    });

    it('should parse payment webhook event', async () => {
      const webhookPayload = {
        entity: 'event',
        account_id: 'acc_123',
        event: RazorpayWebhookEvent.PAYMENT_CAPTURED,
        contains: ['payment', 'order'],
        payload: {
          payment: {
            entity: mockPaymentEntity,
          },
          order: {
            entity: mockOrderEntity,
          },
        },
        created_at: Math.floor(Date.now() / 1000),
      };

      const result = await provider.parseWebhookEvent({
        payload: JSON.stringify(webhookPayload),
        signature: null,
        headers: {},
      });

      expect(result.eventType).toBe(RazorpayWebhookEvent.PAYMENT_CAPTURED);
      expect(result.paymentId).toBe('pay_123');
    });
  });
});

// ============================================================================
// Razorpay User Managed Provider Tests
// ============================================================================

describe('RazorpayUserManagedProvider', () => {
  let provider: RazorpayUserManagedProvider;

  beforeEach(async () => {
    jest.clearAllMocks();
    provider = new RazorpayUserManagedProvider();
    provider.initialize(mockConfig);
  });

  describe('initialization', () => {
    it('should have USER_MANAGED subscription type', () => {
      expect(provider.subscriptionType).toBe('USER_MANAGED');
    });
  });

  describe('setupSubscription', () => {
    it('should create order for user-managed subscription', async () => {
      const mock = getRazorpayMock();
      mock.orders.create.mockResolvedValueOnce(mockOrderEntity);

      const result = await provider.setupSubscription({
        merchantSubscriptionId: 'MSUB123',
        merchantOrderId: 'MO123',
        userId: 'user_123',
        appId: 'app_123',
        planId: 'plan_123',
        providerPlanId: '',
        pricing: {
          initialAmount: 10000,
          recurringAmount: 10000,
          currency: 'INR',
          frequency: 'MONTHLY',
          totalCycles: 12,
        },
        customerEmail: null,
        customerPhone: null,
        redirectUrl: 'https://test.com/callback',
        metadata: {},
      });

      expect(result.success).toBe(true);
      expect(result.providerSubscriptionId).toBeNull();
      expect(result.providerOrderId).toBe('order_123');
    });
  });

  describe('chargeSubscription', () => {
    it('should create order for each charge', async () => {
      const mock = getRazorpayMock();
      mock.orders.create.mockResolvedValueOnce(mockOrderEntity);

      const result = await provider.chargeSubscription({
        merchantSubscriptionId: 'MSUB123',
        providerSubscriptionId: 'sub_123456',
        merchantOrderId: 'MO456',
        amount: 10000,
        currency: 'INR',
        metadata: {},
      });

      expect(result.success).toBe(true);
      expect(result.providerOrderId).toBe('order_123');
    });
  });

  describe('getSubscriptionStatus', () => {
    it('should return user_managed status', async () => {
      const result = await provider.getSubscriptionStatus({
        merchantSubscriptionId: 'MSUB123',
        providerSubscriptionId: 'sub_123456',
      });

      expect(result.providerState).toBe('user_managed');
      expect(result.canCharge).toBe(true);
    });
  });

  describe('cancelSubscription', () => {
    it('should cancel locally for user-managed', async () => {
      const result = await provider.cancelSubscription({
        merchantSubscriptionId: 'MSUB123',
        providerSubscriptionId: 'sub_123456',
        reason: null,
      });

      expect(result.success).toBe(true);
      expect(result.state).toBe('cancelled');
    });
  });

  describe('parseWebhookEvent', () => {
    it('should parse webhook with USER_MANAGED type', async () => {
      const webhookPayload = {
        entity: 'event',
        account_id: 'acc_123',
        event: RazorpayWebhookEvent.ORDER_PAID,
        contains: ['order', 'payment'],
        payload: {
          order: {
            entity: {
              ...mockOrderEntity,
              notes: { subscription_id: 'MSUB123' },
            },
          },
          payment: {
            entity: mockPaymentEntity,
          },
        },
        created_at: Math.floor(Date.now() / 1000),
      };

      const result = await provider.parseWebhookEvent({
        payload: JSON.stringify(webhookPayload),
        signature: null,
        headers: {},
      });

      expect(result.subscriptionType).toBe('USER_MANAGED');
      expect(result.eventType).toBe(RazorpayWebhookEvent.ORDER_PAID);
    });
  });
});

// ============================================================================
// State Mapping Tests
// ============================================================================

describe('Razorpay State Mapping', () => {
  it('should map all Razorpay statuses to unified status', () => {
    const statusMappings: Array<{ razorpay: RazorpaySubscriptionStatus; expected: SubscriptionStatus }> = [
      { razorpay: RazorpaySubscriptionStatus.CREATED, expected: SubscriptionStatus.CREATED },
      { razorpay: RazorpaySubscriptionStatus.AUTHENTICATED, expected: SubscriptionStatus.AUTHENTICATED },
      { razorpay: RazorpaySubscriptionStatus.ACTIVE, expected: SubscriptionStatus.ACTIVE },
      { razorpay: RazorpaySubscriptionStatus.PENDING, expected: SubscriptionStatus.PENDING_AUTH },
      { razorpay: RazorpaySubscriptionStatus.HALTED, expected: SubscriptionStatus.EXPIRED },
      { razorpay: RazorpaySubscriptionStatus.PAUSED, expected: SubscriptionStatus.PAUSED },
      { razorpay: RazorpaySubscriptionStatus.CANCELLED, expected: SubscriptionStatus.CANCELLED },
      { razorpay: RazorpaySubscriptionStatus.COMPLETED, expected: SubscriptionStatus.COMPLETED },
      { razorpay: RazorpaySubscriptionStatus.EXPIRED, expected: SubscriptionStatus.EXPIRED },
    ];

    for (const { razorpay, expected } of statusMappings) {
      expect(mapRazorpaySubscriptionStatus(razorpay)).toBe(expected);
    }
  });
});

// ============================================================================
// Webhook Signature Verification Tests
// ============================================================================

describe('Webhook Signature Verification', () => {
  let provider: RazorpayProviderManagedProvider;

  beforeEach(async () => {
    jest.clearAllMocks();
    provider = new RazorpayProviderManagedProvider();
    provider.initialize(mockConfig);
  });

  it('should verify valid signature', () => {
    const payload = JSON.stringify({ test: 'data' });
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', 'test_webhook_secret')
      .update(payload)
      .digest('hex');

    const result = provider.verifyWebhookSignature(payload, expectedSignature);

    expect(result).toBe(true);
  });

  it('should reject invalid signature', () => {
    const payload = JSON.stringify({ test: 'data' });
    const invalidSignature = 'invalid_signature';

    const result = provider.verifyWebhookSignature(payload, invalidSignature);

    expect(result).toBe(false);
  });
});
