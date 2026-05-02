/**
 * PhonePe One-Time Order Provider Tests
 */

import nock from 'nock';
import { PhonePeOneTimeOrderProvider } from '../phonepe.provider';
import type { PhonePeProviderConfig } from '../../interfaces/subscription-provider.interface';

const SANDBOX_BASE = 'https://api-preprod.phonepe.com';

const mockConfig: PhonePeProviderConfig = {
  configId: 'config_pp_test',
  provider: 'PHONEPE',
  appId: 'app_test',
  environment: 'SANDBOX',
  enabled: true,
  isDefault: true,
  webhookSecret: null,
  clientId: 'pp_client_id',
  clientSecret: 'pp_client_secret',
  clientVersion: 1,
  merchantId: 'pp_merchant_id',
  saltKey: 'pp_salt_key',
  saltIndex: '1',
  checkoutMode: 'STANDARD_CHECKOUT',
};

function setupTokenMock(scope: nock.Scope): void {
  scope
    .post('/apis/pg-sandbox/v1/oauth/token')
    .reply(200, {
      access_token: 'fake_token',
      expires_at: Math.floor(Date.now() / 1000) + 3600,
    });
}

describe('PhonePeOneTimeOrderProvider', () => {
  let provider: PhonePeOneTimeOrderProvider;

  beforeEach(() => {
    nock.cleanAll();
    provider = new PhonePeOneTimeOrderProvider();
    provider.initialize(mockConfig);
  });

  afterEach(() => {
    nock.cleanAll();
    nock.enableNetConnect();
  });

  describe('initialization', () => {
    it('should have PHONEPE as provider', () => {
      expect(provider.provider).toBe('PHONEPE');
    });

    it('should return public config with merchantId', () => {
      const config = provider.getPublicConfig();
      expect(config).toEqual({ merchantId: 'pp_merchant_id', provider: 'PHONEPE' });
    });

    it('should throw if not initialized', () => {
      const uninit = new PhonePeOneTimeOrderProvider();
      expect(() => uninit.getPublicConfig()).toThrow();
    });
  });

  describe('createOrder', () => {
    it('should create payment via PG Checkout successfully', async () => {
      const scope = nock(SANDBOX_BASE).persist();
      setupTokenMock(scope);

      scope
        .post('/apis/pg-sandbox/checkout/v2/pay')
        .reply(200, {
          orderId: 'PPO_123',
          state: 'PENDING',
          expireAt: Math.floor(Date.now() / 1000) + 900,
          redirectUrl: 'https://phonepe.com/pay/session123',
        });

      const result = await provider.createOrder({
        merchantOrderId: 'MORD_pp_test',
        amount: 10000,
        currency: 'INR',
        redirectUrl: 'https://myapp.com/callback',
      });

      expect(result.success).toBe(true);
      expect(result.providerOrderId).toBe('PPO_123');
      expect(result.redirectUrl).toBe('https://phonepe.com/pay/session123');
      expect(result.state).toBe('PENDING');
      expect(result.checkoutConfig).toEqual(expect.objectContaining({
        merchantId: 'pp_merchant_id',
        orderId: 'PPO_123',
      }));
    });

    it('should return failure on API error', async () => {
      const scope = nock(SANDBOX_BASE).persist();
      setupTokenMock(scope);

      scope
        .post('/apis/pg-sandbox/checkout/v2/pay')
        .reply(400, { code: 'BAD_REQUEST', message: 'Invalid amount' });

      const result = await provider.createOrder({
        merchantOrderId: 'MORD_pp_fail',
        amount: 50,
        currency: 'INR',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
      expect(result.providerOrderId).toBe('');
    });
  });

  describe('getOrderStatus', () => {
    it('should return COMPLETED order status', async () => {
      const scope = nock(SANDBOX_BASE).persist();
      setupTokenMock(scope);

      scope
        .get('/apis/pg-sandbox/checkout/v2/order/MORD_pp_test/status')
        .reply(200, {
          orderId: 'PPO_123',
          merchantOrderId: 'MORD_pp_test',
          state: 'COMPLETED',
          amount: 10000,
          paymentDetails: [{
            paymentMode: 'UPI_QR',
            transactionId: 'PPTXN_123',
            timestamp: Math.floor(Date.now() / 1000),
            amount: 10000,
            state: 'COMPLETED',
          }],
        });

      const result = await provider.getOrderStatus({
        merchantOrderId: 'MORD_pp_test',
        providerOrderId: 'PPO_123',
      });

      expect(result.mappedStatus).toBe('CAPTURED');
      expect(result.providerState).toBe('COMPLETED');
      expect(result.paymentDetails).toHaveLength(1);
      expect(result.paymentDetails[0].transactionId).toBe('PPTXN_123');
    });

    it('should return FAILED order status', async () => {
      const scope = nock(SANDBOX_BASE).persist();
      setupTokenMock(scope);

      scope
        .get('/apis/pg-sandbox/checkout/v2/order/MORD_pp_fail/status')
        .reply(200, {
          orderId: 'PPO_fail',
          merchantOrderId: 'MORD_pp_fail',
          state: 'FAILED',
          amount: 10000,
          errorCode: 'AUTHORIZATION_ERROR',
          paymentDetails: [],
        });

      const result = await provider.getOrderStatus({
        merchantOrderId: 'MORD_pp_fail',
        providerOrderId: 'PPO_fail',
      });

      expect(result.mappedStatus).toBe('FAILED');
    });
  });

  describe('verifyPayment', () => {
    it('should verify payment by checking order status (COMPLETED)', async () => {
      const scope = nock(SANDBOX_BASE).persist();
      setupTokenMock(scope);

      scope
        .get('/apis/pg-sandbox/checkout/v2/order/MORD_pp_verify/status')
        .reply(200, {
          orderId: 'PPO_verify',
          merchantOrderId: 'MORD_pp_verify',
          state: 'COMPLETED',
          amount: 10000,
          paymentDetails: [{
            transactionId: 'PPTXN_verify',
            paymentMode: 'UPI_INTENT',
            timestamp: Math.floor(Date.now() / 1000),
            amount: 10000,
            state: 'COMPLETED',
          }],
        });

      const result = await provider.verifyPayment({
        merchantOrderId: 'MORD_pp_verify',
        providerOrderId: 'PPO_verify',
        providerPaymentId: 'PPTXN_verify',
        signature: 'not_used_for_phonepe',
      });

      expect(result.verified).toBe(true);
      expect(result.paymentId).toBe('PPTXN_verify');
    });

    it('should reject payment with non-COMPLETED status', async () => {
      const scope = nock(SANDBOX_BASE).persist();
      setupTokenMock(scope);

      scope
        .get('/apis/pg-sandbox/checkout/v2/order/MORD_pp_pending/status')
        .reply(200, {
          orderId: 'PPO_pending',
          merchantOrderId: 'MORD_pp_pending',
          state: 'PENDING',
          amount: 10000,
        });

      const result = await provider.verifyPayment({
        merchantOrderId: 'MORD_pp_pending',
        providerOrderId: 'PPO_pending',
        providerPaymentId: 'PPTXN_pending',
        signature: 'not_used',
      });

      expect(result.verified).toBe(false);
      expect(result.error).toContain('PENDING');
    });
  });

  describe('refundPayment', () => {
    it('should initiate refund successfully', async () => {
      const scope = nock(SANDBOX_BASE).persist();
      setupTokenMock(scope);

      scope
        .post('/apis/pg-sandbox/payments/v2/refund')
        .reply(200, {
          refundId: 'PPREF_123',
          state: 'PENDING',
        });

      const result = await provider.refundPayment({
        providerPaymentId: 'MORD_pp_test',
        amount: 5000,
        reason: 'Test refund',
        merchantRefundId: 'MREF_pp_test',
      });

      expect(result.success).toBe(true);
      expect(result.refundId).toBe('PPREF_123');
      expect(result.status).toBe('PENDING');
    });

    it('should handle refund failure', async () => {
      const scope = nock(SANDBOX_BASE).persist();
      setupTokenMock(scope);

      scope
        .post('/apis/pg-sandbox/payments/v2/refund')
        .reply(400, { code: 'BAD_REQUEST', message: 'Invalid refund' });

      const result = await provider.refundPayment({
        providerPaymentId: 'MORD_bad',
        amount: 99999,
        reason: null,
        merchantRefundId: 'MREF_bad',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });
  });
});