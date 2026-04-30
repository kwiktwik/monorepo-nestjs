/**
 * Fake Razorpay API (nock interceptors)
 *
 * Intercepts HTTP calls made by the `razorpay` SDK to
 * https://api.razorpay.com so integration tests stay offline.
 */
import nock from 'nock';

const RAZORPAY_BASE = 'https://api.razorpay.com';

// ─── Default response payloads ──────────────────────────────────

let subCounter = 0;
let orderCounter = 0;

const ts = () => Math.floor(Date.now() / 1000);

export const defaultSubscription = (overrides: Record<string, unknown> = {}) => ({
  id: `sub_fake_${++subCounter}`,
  plan_id: 'plan_fake_1',
  status: 'created',
  total_count: 12,
  paid_count: 0,
  remaining_count: 12,
  charge_at: ts() + 86400,
  short_url: 'https://rzp.io/i/fake',
  created_at: ts(),
  ...overrides,
});

export const defaultOrder = (overrides: Record<string, unknown> = {}) => ({
  id: `order_fake_${++orderCounter}`,
  amount: 4900,
  currency: 'INR',
  status: 'created',
  receipt: null,
  created_at: ts(),
  ...overrides,
});

const defaultPlan = () => ({
  id: 'plan_fake_1',
  period: 'monthly',
  interval: 1,
});

const defaultCustomer = () => ({
  id: 'cust_fake_1',
  name: 'Test User',
  email: 'test@example.com',
  contact: '9999999999',
});

// ─── Setup helpers ──────────────────────────────────────────────

export interface FakeRazorpayOptions {
  subscriptionResponse?: Record<string, unknown> | null;
  subscriptionCreateStatus?: number;
  subscriptionFetchOverrides?: Record<string, unknown>;
  subscriptionCancelOverrides?: Record<string, unknown>;
  orderResponse?: Record<string, unknown> | null;
  orderCreateStatus?: number;
  planResponse?: Record<string, unknown> | null;
  customerResponse?: Record<string, unknown> | null;
  paymentsForOrder?: Record<string, unknown>[];
}

/**
 * Install nock interceptors for all Razorpay API endpoints.
 */
export function fakeRazorpayApi(opts: FakeRazorpayOptions = {}): nock.Scope {
  const scope = nock(RAZORPAY_BASE)
    .persist();

  // ── Subscriptions ──
  scope
    .post('/v1/subscriptions')
    .reply(
      opts.subscriptionCreateStatus ?? 200,
      opts.subscriptionResponse ?? defaultSubscription(),
    );

  scope
    .get(/\/v1\/subscriptions\/sub_[^/]+$/)
    .reply(200, opts.subscriptionFetchOverrides
      ? defaultSubscription(opts.subscriptionFetchOverrides)
      : defaultSubscription({ status: 'active' }));

  // Cancel subscription (Razorpay uses POST not DELETE)
  scope
    .post(/\/v1\/subscriptions\/sub_[^/]+\/cancel$/)
    .reply(200, opts.subscriptionCancelOverrides
      ? defaultSubscription(opts.subscriptionCancelOverrides)
      : defaultSubscription({ status: 'cancelled' }));

  // Pause
  scope
    .post(/\/v1\/subscriptions\/sub_[^/]+\/pause$/)
    .reply(200, defaultSubscription({ status: 'paused' }));

  // Resume
  scope
    .post(/\/v1\/subscriptions\/sub_[^/]+\/resume$/)
    .reply(200, defaultSubscription({ status: 'active' }));

  // Update
  scope
    .patch(/\/v1\/subscriptions\/sub_[^/]+$/)
    .reply(200, defaultSubscription({ status: 'active' }));

  // ── Orders ──
  scope
    .post('/v1/orders')
    .reply(
      opts.orderCreateStatus ?? 200,
      opts.orderResponse ?? defaultOrder(),
    );

  scope
    .get(/\/v1\/orders\/order_[^/]+$/)
    .reply(200, opts.orderResponse ?? defaultOrder({ status: 'paid' }));

  scope
    .get(/\/v1\/orders\/order_[^/]+\/payments$/)
    .reply(200, { items: opts.paymentsForOrder ?? [] });

  // ── Plans ──
  scope
    .post('/v1/plans')
    .reply(200, opts.planResponse ?? defaultPlan());

  // ── Customers ──
  scope
    .post('/v1/customers')
    .reply(200, opts.customerResponse ?? defaultCustomer());

  // ── Payments ──
  scope
    .get(/\/v1\/payments\/pay_[^/]+$/)
    .reply(200, {
      id: 'pay_fake_1',
      amount: 4900,
      currency: 'INR',
      status: 'captured',
      method: 'upi',
      created_at: ts(),
    });

  return scope;
}

/**
 * Install interceptors where subscription create fails.
 */
export function fakeRazorpayCreateFails(): nock.Scope {
  return fakeRazorpayApi({
    subscriptionCreateStatus: 400,
    subscriptionResponse: {
      error: {
        code: 'BAD_REQUEST_ERROR',
        description: 'Invalid plan_id provided',
      },
    },
  });
}

/**
 * Reset the internal counters (call in afterEach for deterministic IDs).
 */
export function resetRazorpayCounters(): void {
  subCounter = 0;
  orderCounter = 0;
}
