/**
 * Subscription Lifecycle Integration Tests
 *
 * Tests the full create → activate → charge → cancel flow
 * for both Razorpay and PhonePe providers against fake APIs.
 */
import nock from 'nock';
import {
  createTestApp,
  destroyTestApp,
  cleanupAfterEach,
  type TestContext,
} from './helpers/test-module';
import { fakeRazorpayApi, defaultSubscription, defaultOrder } from './helpers/fake-razorpay-api';
import { fakePhonePeApi } from './helpers/fake-phonepe-api';
import {
  createRazorpayWebhookPayload,
  createPhonePeWebhookPayload,
} from './helpers/webhook-payloads';
import { PaymentProvider } from '../types/provider.enum';
import { SubscriptionStatus } from '../types/subscription-status.enum';

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
// Razorpay  Subscription Lifecycle
// ════════════════════════════════════════════════════════════════

describe('Razorpay subscription lifecycle', () => {
  it('should create a subscription via the provider-managed flow', async () => {
    fakeRazorpayApi();

    const result = await ctx.subscriptionManager.createSubscription({
      userId: 'user_1',
      appId: 'testapp',
      planId: 'premium_monthly',
      provider: PaymentProvider.RAZORPAY,
      subscriptionType: 'PROVIDER_MANAGED',
      initialAmount: 4900,
      recurringAmount: 4900,
      frequency: 'MONTHLY',
    });

    expect(result.success).toBe(true);
    expect(result.subscription).not.toBeNull();
    expect(result.subscription!.provider).toBe('RAZORPAY');
    expect(result.subscription!.subscriptionType).toBe('PROVIDER_MANAGED');
    expect(result.providerSubscriptionId).toBeDefined();
  });

  it('should persist subscription in repository after creation', async () => {
    fakeRazorpayApi();

    const result = await ctx.subscriptionManager.createSubscription({
      userId: 'user_persist',
      appId: 'testapp',
      planId: 'premium_monthly',
      provider: PaymentProvider.RAZORPAY,
      subscriptionType: 'PROVIDER_MANAGED',
      initialAmount: 4900,
      recurringAmount: 4900,
      frequency: 'MONTHLY',
    });

    const found = await ctx.subscriptionRepo.findById(result.subscription!.id);
    expect(found).not.toBeNull();
    expect(found!.userId).toBe('user_persist');
  });

  it('should transition to ACTIVE on subscription.activated webhook', async () => {
    fakeRazorpayApi();

    const createResult = await ctx.subscriptionManager.createSubscription({
      userId: 'user_activate',
      appId: 'testapp',
      planId: 'premium_monthly',
      provider: PaymentProvider.RAZORPAY,
      subscriptionType: 'PROVIDER_MANAGED',
      initialAmount: 4900,
      recurringAmount: 4900,
      frequency: 'MONTHLY',
    });

    const subId = createResult.subscription!.merchantSubscriptionId;

    // Simulate Razorpay sending an activated webhook
    const webhook = createRazorpayWebhookPayload({
      event: 'subscription.activated',
      subscriptionId: subId,
      subscriptionStatus: 'active',
    });

    const whResult = await ctx.webhookHandler.processWebhook(
      PaymentProvider.RAZORPAY,
      webhook.rawBody,
      webhook.signature,
      {},
    );

    expect(whResult.success).toBe(true);

    // Verify status changed to ACTIVE
    const updated = await ctx.subscriptionRepo.findByMerchantId(subId);
    expect(updated!.status).toBe(SubscriptionStatus.ACTIVE);
  });

  it('should increment billing cycle on subscription.charged webhook', async () => {
    fakeRazorpayApi();

    // Create and activate
    const createResult = await ctx.subscriptionManager.createSubscription({
      userId: 'user_charge',
      appId: 'testapp',
      planId: 'premium_monthly',
      provider: PaymentProvider.RAZORPAY,
      subscriptionType: 'PROVIDER_MANAGED',
      initialAmount: 4900,
      recurringAmount: 4900,
      frequency: 'MONTHLY',
    });
    const subId = createResult.subscription!.merchantSubscriptionId;

    // Activate
    const activateWh = createRazorpayWebhookPayload({
      event: 'subscription.activated',
      subscriptionId: subId,
      subscriptionStatus: 'active',
    });
    await ctx.webhookHandler.processWebhook(
      PaymentProvider.RAZORPAY,
      activateWh.rawBody,
      activateWh.signature,
      {},
    );

    const beforeCharge = await ctx.subscriptionRepo.findByMerchantId(subId);
    const cyclesBefore = beforeCharge!.billingCycleCount;

    // Charge webhook
    const chargeWh = createRazorpayWebhookPayload({
      event: 'subscription.charged',
      subscriptionId: subId,
      subscriptionStatus: 'active',
      paymentId: 'pay_test_001',
    });
    const chargeResult = await ctx.webhookHandler.processWebhook(
      PaymentProvider.RAZORPAY,
      chargeWh.rawBody,
      chargeWh.signature,
      {},
    );

    expect(chargeResult.success).toBe(true);

    const afterCharge = await ctx.subscriptionRepo.findByMerchantId(subId);
    expect(afterCharge!.billingCycleCount).toBe(cyclesBefore + 1);
  });

  it('should cancel an active subscription', async () => {
    fakeRazorpayApi();

    const createResult = await ctx.subscriptionManager.createSubscription({
      userId: 'user_cancel',
      appId: 'testapp',
      planId: 'premium_monthly',
      provider: PaymentProvider.RAZORPAY,
      subscriptionType: 'PROVIDER_MANAGED',
      initialAmount: 4900,
      recurringAmount: 4900,
      frequency: 'MONTHLY',
    });

    const subId = createResult.subscription!.id;

    // Activate first
    const activateWh = createRazorpayWebhookPayload({
      event: 'subscription.activated',
      subscriptionId: createResult.subscription!.merchantSubscriptionId,
      subscriptionStatus: 'active',
    });
    await ctx.webhookHandler.processWebhook(
      PaymentProvider.RAZORPAY,
      activateWh.rawBody,
      activateWh.signature,
      {},
    );

    // Cancel
    const cancelResult = await ctx.subscriptionManager.cancelSubscription({
      subscriptionId: subId,
      reason: 'test',
    });

    expect(cancelResult.success).toBe(true);
    expect(cancelResult.subscription!.status).toBe(SubscriptionStatus.CANCELLED);
  });

  it('should create user-managed subscription via order flow', async () => {
    fakeRazorpayApi();

    const result = await ctx.subscriptionManager.createSubscription({
      userId: 'user_um',
      appId: 'testapp',
      planId: 'premium_monthly',
      provider: PaymentProvider.RAZORPAY,
      subscriptionType: 'USER_MANAGED',
      initialAmount: 4900,
      recurringAmount: 4900,
      frequency: 'MONTHLY',
    });

    expect(result.success).toBe(true);
    expect(result.subscription!.subscriptionType).toBe('USER_MANAGED');
    expect(result.order).not.toBeNull();
  });
});

// ════════════════════════════════════════════════════════════════
// PhonePe Subscription Lifecycle
// ════════════════════════════════════════════════════════════════

describe('PhonePe subscription lifecycle', () => {
  it('should create a subscription via PhonePe setup', async () => {
    fakePhonePeApi();

    const result = await ctx.subscriptionManager.createSubscription({
      userId: 'user_pp_1',
      appId: 'testapp',
      planId: 'premium_monthly',
      provider: PaymentProvider.PHONEPE,
      subscriptionType: 'PROVIDER_MANAGED',
      initialAmount: 4900,
      recurringAmount: 4900,
      frequency: 'MONTHLY',
    });

    expect(result.success).toBe(true);
    expect(result.subscription).not.toBeNull();
    expect(result.subscription!.provider).toBe('PHONEPE');
  });

  it('should transition to ACTIVE on setup completed webhook', async () => {
    fakePhonePeApi();

    const createResult = await ctx.subscriptionManager.createSubscription({
      userId: 'user_pp_activate',
      appId: 'testapp',
      planId: 'premium_monthly',
      provider: PaymentProvider.PHONEPE,
      subscriptionType: 'PROVIDER_MANAGED',
      initialAmount: 4900,
      recurringAmount: 4900,
      frequency: 'MONTHLY',
    });

    const merchantSubId = createResult.subscription!.merchantSubscriptionId;

    const webhook = createPhonePeWebhookPayload({
      event: 'subscription.setup.order.completed',
      merchantSubscriptionId: merchantSubId,
      state: 'COMPLETED',
    });

    const whResult = await ctx.webhookHandler.processWebhook(
      PaymentProvider.PHONEPE,
      webhook.body as unknown as Record<string, unknown>,
      webhook.signature,
      {},
    );

    expect(whResult.success).toBe(true);

    const updated = await ctx.subscriptionRepo.findByMerchantId(merchantSubId);
    expect(updated!.status).toBe(SubscriptionStatus.ACTIVE);
  });

  it('should charge a PhonePe provider-managed subscription', async () => {
    fakePhonePeApi();

    const createResult = await ctx.subscriptionManager.createSubscription({
      userId: 'user_pp_charge',
      appId: 'testapp',
      planId: 'premium_monthly',
      provider: PaymentProvider.PHONEPE,
      subscriptionType: 'PROVIDER_MANAGED',
      initialAmount: 4900,
      recurringAmount: 4900,
      frequency: 'MONTHLY',
    });

    // Activate
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

    // Charge
    const chargeResult = await ctx.subscriptionManager.chargeSubscription({
      subscriptionId: createResult.subscription!.id,
    });

    expect(chargeResult.success).toBe(true);
    expect(chargeResult.order).not.toBeNull();
  });

  it('should cancel a PhonePe subscription', async () => {
    fakePhonePeApi();

    const createResult = await ctx.subscriptionManager.createSubscription({
      userId: 'user_pp_cancel',
      appId: 'testapp',
      planId: 'premium_monthly',
      provider: PaymentProvider.PHONEPE,
      subscriptionType: 'PROVIDER_MANAGED',
      initialAmount: 4900,
      recurringAmount: 4900,
      frequency: 'MONTHLY',
    });

    // Activate
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

    // Cancel
    const cancelResult = await ctx.subscriptionManager.cancelSubscription({
      subscriptionId: createResult.subscription!.id,
      reason: 'test',
    });

    expect(cancelResult.success).toBe(true);
    expect(cancelResult.subscription!.status).toBe(SubscriptionStatus.CANCELLED);
  });

  it('should create user-managed PhonePe subscription', async () => {
    fakePhonePeApi();

    const result = await ctx.subscriptionManager.createSubscription({
      userId: 'user_pp_um',
      appId: 'testapp',
      planId: 'premium_monthly',
      provider: PaymentProvider.PHONEPE,
      subscriptionType: 'USER_MANAGED',
      initialAmount: 4900,
      recurringAmount: 4900,
      frequency: 'MONTHLY',
    });

    expect(result.success).toBe(true);
    expect(result.subscription!.subscriptionType).toBe('USER_MANAGED');
  });
});
