/**
 * Fake PhonePe API (nock interceptors)
 *
 * Intercepts HTTP calls to PhonePe sandbox endpoints so integration
 * tests never hit a real server.
 */
import nock from 'nock';

const SANDBOX_BASE = 'https://api-preprod.phonepe.com';

// ─── Default response payloads ──────────────────────────────────

const defaultToken = {
  access_token: 'fake_phonepe_token_abc123',
  expires_in: 3600,
  issued_at: Math.floor(Date.now() / 1000),
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  token_type: 'O-Bearer',
};

const defaultSetup = (merchantOrderId: string) => ({
  orderId: `PPO_${Date.now()}`,
  state: 'PENDING',
  redirectUrl: 'https://phonepe.com/pay/fake',
  expireAt: Math.floor(Date.now() / 1000) + 900,
});

const defaultSubscriptionStatus = (state = 'ACTIVE') => ({
  subscriptionId: `PPSUB_${Date.now()}`,
  merchantSubscriptionId: '', // caller should fill
  state,
  maxAmount: 4900,
  frequency: 'MONTHLY',
});

const defaultNotifyResponse = () => ({
  orderId: `PPO_N_${Date.now()}`,
  state: 'NOTIFIED',
});

const defaultExecuteResponse = () => ({
  state: 'COMPLETED',
  transactionId: `PPTXN_${Date.now()}`,
});

// ─── Setup helpers ──────────────────────────────────────────────

export interface FakePhonePeOptions {
  tokenResponse?: Record<string, unknown> | null;
  tokenStatus?: number;
  setupResponse?: Record<string, unknown> | null;
  setupStatus?: number;
  statusResponse?: Record<string, unknown> | null;
  statusStatus?: number;
  notifyResponse?: Record<string, unknown> | null;
  executeResponse?: Record<string, unknown> | null;
  cancelState?: string;
  cancelStatus?: number;
}

/**
 * Install nock interceptors for all PhonePe sandbox endpoints.
 * Returns the nock scope so callers can assert pending mocks.
 */
export function fakePhonePeApi(opts: FakePhonePeOptions = {}): nock.Scope {
  const scope = nock(SANDBOX_BASE)
    .persist();

  // Auth token
  if (opts.tokenResponse !== null) {
    scope
      .post('/apis/pg-sandbox/v1/oauth/token')
      .reply(opts.tokenStatus ?? 200, opts.tokenResponse ?? defaultToken);
  }

  // Subscription setup (Standard Checkout)
  if (opts.setupResponse !== null) {
    scope
      .post('/apis/pg-sandbox/checkout/v2/pay')
      .reply(opts.setupStatus ?? 200, (uri, body) => {
        const parsed = typeof body === 'string' ? JSON.parse(body) : body;
        return opts.setupResponse ?? defaultSetup(parsed.merchantOrderId);
      });
  }

  // Also handle API Integration flow
  if (opts.setupResponse !== null) {
    scope
      .post('/apis/pg-sandbox/subscriptions/v2/setup')
      .reply(opts.setupStatus ?? 200, (uri, body) => {
        const parsed = typeof body === 'string' ? JSON.parse(body) : body;
        return opts.setupResponse ?? defaultSetup(parsed.merchantOrderId);
      });
  }

  // Subscription status
  scope
    .get(/\/apis\/pg-sandbox\/(checkout\/v2\/subscriptions|subscriptions\/v2)\/[^/]+\/status/)
    .reply(opts.statusStatus ?? 200, opts.statusResponse ?? defaultSubscriptionStatus());

  // Notify redemption
  scope
    .post(/\/apis\/pg-sandbox\/(checkout\/v2\/subscriptions|subscriptions\/v2)\/notify/)
    .reply(200, opts.notifyResponse ?? defaultNotifyResponse());

  // Execute redemption
  scope
    .post(/\/apis\/pg-sandbox\/(checkout\/v2\/subscriptions|subscriptions\/v2)\/redeem/)
    .reply(200, opts.executeResponse ?? defaultExecuteResponse());

  // Cancel
  scope
    .post(/\/apis\/pg-sandbox\/(checkout\/v2\/subscriptions|subscriptions\/v2)\/[^/]+\/cancel/)
    .reply(opts.cancelStatus ?? 200, { state: opts.cancelState ?? 'CANCELLED' });

  // Pause
  scope
    .post(/\/apis\/pg-sandbox\/(checkout\/v2\/subscriptions|subscriptions\/v2)\/[^/]+\/pause/)
    .reply(200, { state: 'PAUSED' });

  // Unpause
  scope
    .post(/\/apis\/pg-sandbox\/(checkout\/v2\/subscriptions|subscriptions\/v2)\/[^/]+\/unpause/)
    .reply(200, { state: 'ACTIVE' });

  return scope;
}

/**
 * Install interceptors that always fail (500) for error testing.
 */
export function fakePhonePeApiDown(): nock.Scope {
  return fakePhonePeApi({
    tokenStatus: 500,
    tokenResponse: { error: 'Internal Server Error' },
  });
}

/**
 * Install interceptors where auth works but setup fails.
 */
export function fakePhonePeSetupFails(): nock.Scope {
  return fakePhonePeApi({
    setupStatus: 400,
    setupResponse: { error: 'BAD_REQUEST', message: 'Invalid subscription' },
  });
}
