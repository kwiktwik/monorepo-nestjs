/**
 * Webhook Processing Integration Tests
 *
 * Verifies signature checking, event routing, state transitions,
 * and edge-case handling for both Razorpay and PhonePe webhooks.
 */
import nock from 'nock';
import {
  createTestApp,
  destroyTestApp,
  cleanupAfterEach,
  type TestContext,
} from './helpers/test-module';
import { fakeRazorpayApi } from './helpers/fake-razorpay-api';
import { fakePhonePeApi } from './helpers/fake-phonepe-api';
import {
  createRazorpayWebhookPayload,
  createPhonePeWebhookPayload,
  TEST_RAZORPAY_WEBHOOK_SECRET,
  TEST_PHONEPE_SALT_KEY,
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

/** Helper: create and activate a Razorpay subscription, return its merchantSubscriptionId */
async function seedRazorpaySub(userId: string): Promise<string> {
  fakeRazorpayApi();
  const r = await ctx.subscriptionManager.createSubscription({
    userId,
    appId: 'testapp',
    planId: 'premium_monthly',
    provider: PaymentProvider.RAZORPAY,
    subscriptionType: 'PROVIDER_MANAGED',
    initialAmount: 4900,
    recurringAmount: 4900,
    frequency: 'MONTHLY',
  });
  const id = r.subscription!.merchantSubscriptionId;
  // Activate
  const wh = createRazorpayWebhookPayload({ event: 'subscription.activated', subscriptionId: id });
  await ctx.webhookHandler.processWebhook(PaymentProvider.RAZORPAY, wh.rawBody, wh.signature, {});
  return id;
}

/** Helper: create and activate a PhonePe subscription */
async function seedPhonePeSub(userId: string): Promise<string> {
  fakePhonePeApi();
  const r = await ctx.subscriptionManager.createSubscription({
    userId,
    appId: 'testapp',
    planId: 'premium_monthly',
    provider: PaymentProvider.PHONEPE,
    subscriptionType: 'PROVIDER_MANAGED',
    initialAmount: 4900,
    recurringAmount: 4900,
    frequency: 'MONTHLY',
  });
  const id = r.subscription!.merchantSubscriptionId;
  const wh = createPhonePeWebhookPayload({ event: 'subscription.setup.order.completed', merchantSubscriptionId: id });
  await ctx.webhookHandler.processWebhook(PaymentProvider.PHONEPE, wh.body as unknown as Record<string, unknown>, wh.signature, {});
  return id;
}

// ════════════════════════════════════════════════════════════════
// Razorpay Webhook Signature Verification
// ════════════════════════════════════════════════════════════════

describe('Razorpay webhook signature', () => {
  it('should accept webhook with valid HMAC signature', async () => {
    const subId = await seedRazorpaySub('wh_sig_1');
    const wh = createRazorpayWebhookPayload({ event: 'subscription.charged', subscriptionId: subId, paymentId: 'pay_1' });

    const result = await ctx.webhookHandler.processWebhook(
      PaymentProvider.RAZORPAY,
      wh.rawBody,
      wh.signature,
      {},
    );

    expect(result.success).toBe(true);
  });

  it('should reject webhook with invalid signature', async () => {
    const wh = createRazorpayWebhookPayload({ event: 'subscription.activated' });

    const result = await ctx.webhookHandler.processWebhook(
      PaymentProvider.RAZORPAY,
      wh.rawBody,
      'invalid_signature_abc',
      {},
    );

    expect(result.success).toBe(false);
    expect(result.error).toContain('signature');
  });
});

// ════════════════════════════════════════════════════════════════
// PhonePe Webhook Signature Verification
// ════════════════════════════════════════════════════════════════

describe('PhonePe webhook signature', () => {
  it('should accept webhook with valid Authorization header', async () => {
    const subId = await seedPhonePeSub('pp_wh_sig_1');
    const wh = createPhonePeWebhookPayload({
      event: 'subscription.redemption.order.completed',
      merchantSubscriptionId: subId,
      state: 'COMPLETED',
    });

    const result = await ctx.webhookHandler.processWebhook(
      PaymentProvider.PHONEPE,
      wh.body as unknown as Record<string, unknown>,
      wh.signature,
      {},
    );

    expect(result.success).toBe(true);
  });

  it('should reject webhook with wrong Authorization header', async () => {
    const wh = createPhonePeWebhookPayload({
      event: 'subscription.setup.order.completed',
    });

    const result = await ctx.webhookHandler.processWebhook(
      PaymentProvider.PHONEPE,
      wh.body as unknown as Record<string, unknown>,
      'wrong_salt_key',
      {},
    );

    expect(result.success).toBe(false);
  });
});

// ════════════════════════════════════════════════════════════════
// Razorpay Event Routing
// ════════════════════════════════════════════════════════════════

describe('Razorpay event routing', () => {
  it('subscription.authenticated → AUTHENTICATED', async () => {
    fakeRazorpayApi();
    const r = await ctx.subscriptionManager.createSubscription({
      userId: 'wh_auth',
      appId: 'testapp',
      planId: 'premium_monthly',
      provider: PaymentProvider.RAZORPAY,
      subscriptionType: 'PROVIDER_MANAGED',
      initialAmount: 4900,
      recurringAmount: 4900,
      frequency: 'MONTHLY',
    });
    const subId = r.subscription!.merchantSubscriptionId;

    const wh = createRazorpayWebhookPayload({ event: 'subscription.authenticated', subscriptionId: subId });
    const result = await ctx.webhookHandler.processWebhook(PaymentProvider.RAZORPAY, wh.rawBody, wh.signature, {});
    expect(result.success).toBe(true);

    const sub = await ctx.subscriptionRepo.findByMerchantId(subId);
    expect(sub!.status).toBe(SubscriptionStatus.AUTHENTICATED);
  });

  it('subscription.cancelled → CANCELLED', async () => {
    const subId = await seedRazorpaySub('wh_cancel');

    const wh = createRazorpayWebhookPayload({ event: 'subscription.cancelled', subscriptionId: subId, subscriptionStatus: 'cancelled' });
    const result = await ctx.webhookHandler.processWebhook(PaymentProvider.RAZORPAY, wh.rawBody, wh.signature, {});
    expect(result.success).toBe(true);

    const sub = await ctx.subscriptionRepo.findByMerchantId(subId);
    expect(sub!.status).toBe(SubscriptionStatus.CANCELLED);
  });

  it('subscription.halted → EXPIRED', async () => {
    const subId = await seedRazorpaySub('wh_halt');

    const wh = createRazorpayWebhookPayload({ event: 'subscription.halted', subscriptionId: subId });
    const result = await ctx.webhookHandler.processWebhook(PaymentProvider.RAZORPAY, wh.rawBody, wh.signature, {});
    expect(result.success).toBe(true);

    const sub = await ctx.subscriptionRepo.findByMerchantId(subId);
    expect(sub!.status).toBe(SubscriptionStatus.EXPIRED);
  });

  it('subscription.paused → PAUSED', async () => {
    const subId = await seedRazorpaySub('wh_pause');

    const wh = createRazorpayWebhookPayload({ event: 'subscription.paused', subscriptionId: subId, subscriptionStatus: 'paused' });
    const result = await ctx.webhookHandler.processWebhook(PaymentProvider.RAZORPAY, wh.rawBody, wh.signature, {});
    expect(result.success).toBe(true);

    const sub = await ctx.subscriptionRepo.findByMerchantId(subId);
    expect(sub!.status).toBe(SubscriptionStatus.PAUSED);
  });

  it('subscription.resumed → ACTIVE', async () => {
    const subId = await seedRazorpaySub('wh_resume');

    // Pause first
    const pauseWh = createRazorpayWebhookPayload({ event: 'subscription.paused', subscriptionId: subId });
    await ctx.webhookHandler.processWebhook(PaymentProvider.RAZORPAY, pauseWh.rawBody, pauseWh.signature, {});

    // Resume
    const resumeWh = createRazorpayWebhookPayload({ event: 'subscription.resumed', subscriptionId: subId });
    const result = await ctx.webhookHandler.processWebhook(PaymentProvider.RAZORPAY, resumeWh.rawBody, resumeWh.signature, {});
    expect(result.success).toBe(true);

    const sub = await ctx.subscriptionRepo.findByMerchantId(subId);
    expect(sub!.status).toBe(SubscriptionStatus.ACTIVE);
  });

  it('subscription.completed → COMPLETED', async () => {
    const subId = await seedRazorpaySub('wh_complete');

    const wh = createRazorpayWebhookPayload({ event: 'subscription.completed', subscriptionId: subId });
    const result = await ctx.webhookHandler.processWebhook(PaymentProvider.RAZORPAY, wh.rawBody, wh.signature, {});
    expect(result.success).toBe(true);

    const sub = await ctx.subscriptionRepo.findByMerchantId(subId);
    expect(sub!.status).toBe(SubscriptionStatus.COMPLETED);
  });
});

// ════════════════════════════════════════════════════════════════
// PhonePe Event Routing
// ════════════════════════════════════════════════════════════════

describe('PhonePe event routing', () => {
  it('SUBSCRIPTION_PAUSED → PAUSED', async () => {
    const subId = await seedPhonePeSub('pp_pause');

    const wh = createPhonePeWebhookPayload({ event: 'subscription.paused', merchantSubscriptionId: subId });
    const result = await ctx.webhookHandler.processWebhook(PaymentProvider.PHONEPE, wh.body as unknown as Record<string, unknown>, wh.signature, {});
    expect(result.success).toBe(true);

    const sub = await ctx.subscriptionRepo.findByMerchantId(subId);
    expect(sub!.status).toBe(SubscriptionStatus.PAUSED);
  });

  it('SUBSCRIPTION_UNPAUSED → ACTIVE', async () => {
    const subId = await seedPhonePeSub('pp_unpause');

    // Pause then unpause
    const pauseWh = createPhonePeWebhookPayload({ event: 'subscription.paused', merchantSubscriptionId: subId });
    await ctx.webhookHandler.processWebhook(PaymentProvider.PHONEPE, pauseWh.body as unknown as Record<string, unknown>, pauseWh.signature, {});

    const unpauseWh = createPhonePeWebhookPayload({ event: 'subscription.unpaused', merchantSubscriptionId: subId });
    const result = await ctx.webhookHandler.processWebhook(PaymentProvider.PHONEPE, unpauseWh.body as unknown as Record<string, unknown>, unpauseWh.signature, {});
    expect(result.success).toBe(true);

    const sub = await ctx.subscriptionRepo.findByMerchantId(subId);
    expect(sub!.status).toBe(SubscriptionStatus.ACTIVE);
  });

  it('SUBSCRIPTION_CANCELLED → CANCELLED', async () => {
    const subId = await seedPhonePeSub('pp_cancel');

    const wh = createPhonePeWebhookPayload({ event: 'subscription.cancelled', merchantSubscriptionId: subId });
    const result = await ctx.webhookHandler.processWebhook(PaymentProvider.PHONEPE, wh.body as unknown as Record<string, unknown>, wh.signature, {});
    expect(result.success).toBe(true);

    const sub = await ctx.subscriptionRepo.findByMerchantId(subId);
    expect(sub!.status).toBe(SubscriptionStatus.CANCELLED);
  });

  it('SUBSCRIPTION_REVOKED → REVOKED', async () => {
    const subId = await seedPhonePeSub('pp_revoke');

    const wh = createPhonePeWebhookPayload({ event: 'subscription.revoked', merchantSubscriptionId: subId });
    const result = await ctx.webhookHandler.processWebhook(PaymentProvider.PHONEPE, wh.body as unknown as Record<string, unknown>, wh.signature, {});
    expect(result.success).toBe(true);

    const sub = await ctx.subscriptionRepo.findByMerchantId(subId);
    expect(sub!.status).toBe(SubscriptionStatus.REVOKED);
  });
});

// ════════════════════════════════════════════════════════════════
// Edge Cases
// ════════════════════════════════════════════════════════════════

describe('webhook edge cases', () => {
  it('should handle unknown event type gracefully', async () => {
    const subId = await seedRazorpaySub('wh_unknown');

    const wh = createRazorpayWebhookPayload({
      event: 'subscription.some_future_event',
      subscriptionId: subId,
    });

    const result = await ctx.webhookHandler.processWebhook(
      PaymentProvider.RAZORPAY,
      wh.rawBody,
      wh.signature,
      {},
    );

    // Unknown events should be accepted (not crash)
    expect(result.success).toBe(true);
  });

  it('should handle webhook for non-existent subscription without crashing', async () => {
    const wh = createRazorpayWebhookPayload({
      event: 'subscription.activated',
      subscriptionId: 'MSUB_does_not_exist',
    });

    const result = await ctx.webhookHandler.processWebhook(
      PaymentProvider.RAZORPAY,
      wh.rawBody,
      wh.signature,
      {},
    );

    // Should succeed (just logs a warning, doesn't crash)
    expect(result.success).toBe(true);
  });

  it('should record payment failure on payment.failed webhook', async () => {
    const subId = await seedRazorpaySub('wh_pay_fail');

    const wh = createRazorpayWebhookPayload({
      event: 'payment.failed',
      subscriptionId: subId,
      paymentId: 'pay_fail_1',
      paymentStatus: 'failed',
      errorCode: 'BAD_REQUEST_ERROR',
      errorDescription: 'Card declined',
    });

    const result = await ctx.webhookHandler.processWebhook(
      PaymentProvider.RAZORPAY,
      wh.rawBody,
      wh.signature,
      {},
    );

    expect(result.success).toBe(true);

    const sub = await ctx.subscriptionRepo.findByMerchantId(subId);
    expect(sub!.paymentFailures.length).toBeGreaterThan(0);
  });
});
