/**
 * Provider Error Handling Integration Tests
 *
 * Verifies that API failures from Razorpay and PhonePe are
 * propagated correctly through the service layer.
 */
import nock from 'nock';
import {
  createTestApp,
  destroyTestApp,
  cleanupAfterEach,
  type TestContext,
} from './helpers/test-module';
import { fakeRazorpayApi, fakeRazorpayCreateFails } from './helpers/fake-razorpay-api';
import { fakePhonePeApi, fakePhonePeApiDown, fakePhonePeSetupFails } from './helpers/fake-phonepe-api';
import { createPhonePeWebhookPayload } from './helpers/webhook-payloads';
import { PaymentProvider } from '../types/provider.enum';

// ─── Suite setup ────────────────────────────────────────────────

let ctx: TestContext;

beforeAll(async () => {
  ctx = await createTestApp();
}, 30_000);

afterAll(async () => {
  await destroyTestApp(ctx);
});

afterEach(() => {
  cleanupAfterEach();
});

// ════════════════════════════════════════════════════════════════
// Razorpay Error Scenarios
// ════════════════════════════════════════════════════════════════

describe('Razorpay error handling', () => {
  it('should return failure when Razorpay subscription create returns 400', async () => {
    fakeRazorpayCreateFails();

    const result = await ctx.subscriptionManager.createSubscription({
      userId: 'err_rzp_1',
      appId: 'testapp',
      planId: 'premium_monthly',
      provider: PaymentProvider.RAZORPAY,
      subscriptionType: 'PROVIDER_MANAGED',
      initialAmount: 4900,
      recurringAmount: 4900,
      frequency: 'MONTHLY',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('should return failure when Razorpay API is completely down (nock rejects)', async () => {
    // Install nock that returns 500 for everything
    nock('https://api.razorpay.com')
      .persist()
      .post(/.*/)
      .reply(500, { error: { description: 'Internal Server Error' } })
      .get(/.*/)
      .reply(500, { error: { description: 'Internal Server Error' } });

    const result = await ctx.subscriptionManager.createSubscription({
      userId: 'err_rzp_down',
      appId: 'testapp',
      planId: 'premium_monthly',
      provider: PaymentProvider.RAZORPAY,
      subscriptionType: 'PROVIDER_MANAGED',
      initialAmount: 4900,
      recurringAmount: 4900,
      frequency: 'MONTHLY',
    });

    expect(result.success).toBe(false);
  });

  it('should return failure when cancelling non-existent subscription at Razorpay', async () => {
    fakeRazorpayApi();

    const result = await ctx.subscriptionManager.cancelSubscription({
      subscriptionId: 'does_not_exist',
      reason: 'test',
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('not found');
  });
});

// ════════════════════════════════════════════════════════════════
// PhonePe Error Scenarios
// ════════════════════════════════════════════════════════════════

describe('PhonePe error handling', () => {
  it('should return failure when PhonePe auth endpoint is down', async () => {
    fakePhonePeApiDown();

    const result = await ctx.subscriptionManager.createSubscription({
      userId: 'err_pp_auth',
      appId: 'testapp',
      planId: 'premium_monthly',
      provider: PaymentProvider.PHONEPE,
      subscriptionType: 'PROVIDER_MANAGED',
      initialAmount: 4900,
      recurringAmount: 4900,
      frequency: 'MONTHLY',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('should return failure when PhonePe setup returns 400', async () => {
    fakePhonePeSetupFails();

    const result = await ctx.subscriptionManager.createSubscription({
      userId: 'err_pp_setup',
      appId: 'testapp',
      planId: 'premium_monthly',
      provider: PaymentProvider.PHONEPE,
      subscriptionType: 'PROVIDER_MANAGED',
      initialAmount: 4900,
      recurringAmount: 4900,
      frequency: 'MONTHLY',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('should return failure when charging fails at PhonePe', async () => {
    // Setup succeeds but charge fails
    fakePhonePeApi({
      notifyResponse: null, // use default
    });

    // Override execute to fail
    nock.cleanAll();
    const scope = nock('https://api-preprod.phonepe.com').persist();

    // Auth works
    scope.post('/apis/pg-sandbox/v1/oauth/token').reply(200, {
      access_token: 'fake_token',
      expires_in: 3600,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
    });

    // Setup works
    scope.post('/apis/pg-sandbox/checkout/v2/pay').reply(200, {
      orderId: 'PPO_setup',
      state: 'PENDING',
      redirectUrl: 'https://phonepe.com/pay/fake',
      expireAt: Math.floor(Date.now() / 1000) + 900,
    });
    scope.post('/apis/pg-sandbox/subscriptions/v2/setup').reply(200, {
      orderId: 'PPO_setup',
      state: 'PENDING',
      redirectUrl: 'https://phonepe.com/pay/fake',
      expireAt: Math.floor(Date.now() / 1000) + 900,
    });

    // Status works
    scope
      .get(/\/apis\/pg-sandbox\/(checkout\/v2\/subscriptions|subscriptions\/v2)\/[^/]+\/status/)
      .reply(200, {
        subscriptionId: 'PPSUB_x',
        state: 'ACTIVE',
        maxAmount: 4900,
        frequency: 'MONTHLY',
      });

    // Notify works
    scope
      .post(/\/apis\/pg-sandbox\/(checkout\/v2\/subscriptions|subscriptions\/v2)\/notify/)
      .reply(200, { orderId: 'PPO_notify', state: 'NOTIFIED' });

    // Execute FAILS
    scope
      .post(/\/apis\/pg-sandbox\/(checkout\/v2\/subscriptions|subscriptions\/v2)\/redeem/)
      .reply(500, { error: 'INTERNAL_ERROR' });

    const createResult = await ctx.subscriptionManager.createSubscription({
      userId: 'err_pp_charge',
      appId: 'testapp',
      planId: 'premium_monthly',
      provider: PaymentProvider.PHONEPE,
      subscriptionType: 'USER_MANAGED',
      initialAmount: 4900,
      recurringAmount: 4900,
      frequency: 'MONTHLY',
    });

    // Activate via webhook
    const activateWh = createPhonePeWebhookPayload({
      event: 'subscription.setup.order.completed',
      merchantSubscriptionId: createResult.subscription!.merchantSubscriptionId,
    });
    await ctx.webhookHandler.processWebhook(
      PaymentProvider.PHONEPE,
      activateWh.body as unknown as Record<string, unknown>,
      activateWh.signature,
      {},
    );

    // Charge should fail because execute returns 500
    const chargeResult = await ctx.subscriptionManager.chargeSubscription({
      subscriptionId: createResult.subscription!.id,
    });

    expect(chargeResult.success).toBe(false);
    expect(chargeResult.error).toBeDefined();
  });
});

// ════════════════════════════════════════════════════════════════
// Cross-provider Edge Cases
// ════════════════════════════════════════════════════════════════

describe('cross-provider edge cases', () => {
  it('should not allow charging a subscription that is not ACTIVE', async () => {
    fakeRazorpayApi();

    const result = await ctx.subscriptionManager.createSubscription({
      userId: 'err_not_active',
      appId: 'testapp',
      planId: 'premium_monthly',
      provider: PaymentProvider.RAZORPAY,
      subscriptionType: 'USER_MANAGED',
      initialAmount: 4900,
      recurringAmount: 4900,
      frequency: 'MONTHLY',
    });

    // Subscription is CREATED, not ACTIVE — should fail to charge
    const chargeResult = await ctx.subscriptionManager.chargeSubscription({
      subscriptionId: result.subscription!.id,
    });

    expect(chargeResult.success).toBe(false);
    expect(chargeResult.error).toContain('cannot be charged');
  });

  it('should return subscription-not-found when charging non-existent ID', async () => {
    const chargeResult = await ctx.subscriptionManager.chargeSubscription({
      subscriptionId: 'nonexistent_sub_id',
    });

    expect(chargeResult.success).toBe(false);
    expect(chargeResult.error).toContain('not found');
  });
});
