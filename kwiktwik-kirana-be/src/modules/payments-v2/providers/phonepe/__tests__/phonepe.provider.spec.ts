/**
 * PhonePe Provider Tests
 * 
 * Comprehensive tests for PhonePe subscription providers.
 */

import {
  PhonePeProviderManagedProvider,
  PhonePeUserManagedProvider,
  createPhonePeClient,
  PHONEPE_ENDPOINTS,
} from '../phonepe.provider';
import { PhonePeSubscriptionState, PhonePeOrderState, PhonePeWebhookEvent, mapPhonePeSubscriptionState } from '../../../types/phonepe.types';
import { SubscriptionStatus } from '../../../types/subscription-status.enum';
import type { PhonePeProviderConfig } from '../../interfaces/subscription-provider.interface';

// ============================================================================
// Mocks
// ============================================================================

// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

const mockConfig: PhonePeProviderConfig = {
  configId: 'config_123',
  provider: 'PHONEPE',
  appId: 'app_123',
  environment: 'SANDBOX',
  enabled: true,
  isDefault: true,
  webhookSecret: 'test_webhook_secret',
  clientId: 'test_client_id',
  clientSecret: 'test_client_secret',
  clientVersion: 1,
  merchantId: 'test_merchant',
  saltKey: 'test_salt_key',
  saltIndex: '1',
};

const mockAccessTokenResponse = {
  access_token: 'test_access_token',
  expires_in: 3600,
  issued_at: Date.now(),
  expires_at: Date.now() + 3600000,
  token_type: 'O-Bearer',
};

const mockSetupSubscriptionResponse = {
  orderId: 'OMO123456',
  state: 'PENDING',
  expireAt: Date.now() + 900000,
  redirectUrl: 'https://test.redirect.url',
};

const mockSubscriptionStatusResponse = {
  merchantSubscriptionId: 'MSUB123',
  subscriptionId: 'OMS123',
  state: PhonePeSubscriptionState.ACTIVE,
  productType: 'UPI_MANDATE',
  authInstrumentType: 'UPI',
  authWorkflowType: 'TRANSACTION',
  amountType: 'FIXED',
  currency: 'INR',
  maxAmount: 10000,
  frequency: 'MONTHLY',
  expireAt: Date.now() + 31536000000,
  pauseStartDate: null,
  pauseEndDate: null,
};

// ============================================================================
// PhonePe Client Tests
// ============================================================================

describe('createPhonePeClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAccessToken', () => {
    it('should fetch and cache access token', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockAccessTokenResponse,
      });

      const client = createPhonePeClient(mockConfig);
      const token = await client.getAccessToken();

      expect(token).toBe('test_access_token');
      expect(mockFetch).toHaveBeenCalledWith(
        PHONEPE_ENDPOINTS.SANDBOX.AUTH,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/x-www-form-urlencoded',
          }),
        }),
      );
    });

    it('should return cached token if still valid', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockAccessTokenResponse,
      });

      const client = createPhonePeClient(mockConfig);
      
      await client.getAccessToken();
      await client.getAccessToken();

      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should throw error on auth failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: async () => 'Unauthorized',
      });

      const client = createPhonePeClient(mockConfig);

      await expect(client.getAccessToken()).rejects.toThrow();
    });
  });

  describe('setupSubscription', () => {
    it('should call setup endpoint with correct parameters', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockAccessTokenResponse,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockSetupSubscriptionResponse,
        });

      const client = createPhonePeClient(mockConfig);
      
      const result = await client.setupSubscription({
        merchantOrderId: 'MO123',
        amount: 10000,
        paymentFlow: {
          type: 'SUBSCRIPTION_CHECKOUT_SETUP',
          merchantUrls: {
            redirectUrl: 'https://test.com/callback',
          },
          subscriptionDetails: {
            subscriptionType: 'RECURRING',
            merchantSubscriptionId: 'MSUB123',
            authWorkflowType: 'TRANSACTION',
            amountType: 'FIXED',
            maxAmount: 10000,
            frequency: 'MONTHLY',
            productType: 'UPI_MANDATE',
          },
        },
      });

      expect(result.orderId).toBe('OMO123456');
      expect(result.state).toBe('PENDING');
    });
  });

  describe('getSubscriptionStatus', () => {
    it('should fetch subscription status', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockAccessTokenResponse,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockSubscriptionStatusResponse,
        });

      const client = createPhonePeClient(mockConfig);
      const result = await client.getSubscriptionStatus('MSUB123');

      expect(result.state).toBe(PhonePeSubscriptionState.ACTIVE);
      expect(result.subscriptionId).toBe('OMS123');
    });
  });

  describe('cancelSubscription', () => {
    it('should cancel subscription', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockAccessTokenResponse,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ state: PhonePeSubscriptionState.CANCELLED }),
        });

      const client = createPhonePeClient(mockConfig);
      const result = await client.cancelSubscription('MSUB123');

      expect(result.state).toBe(PhonePeSubscriptionState.CANCELLED);
    });
  });

  describe('pauseSubscription', () => {
    it('should pause subscription', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockAccessTokenResponse,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ state: PhonePeSubscriptionState.PAUSED }),
        });

      const client = createPhonePeClient(mockConfig);
      const result = await client.pauseSubscription('MSUB123');

      expect(result.state).toBe(PhonePeSubscriptionState.PAUSED);
    });
  });

  describe('unpauseSubscription', () => {
    it('should unpause subscription', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockAccessTokenResponse,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ state: PhonePeSubscriptionState.ACTIVE }),
        });

      const client = createPhonePeClient(mockConfig);
      const result = await client.unpauseSubscription('MSUB123');

      expect(result.state).toBe(PhonePeSubscriptionState.ACTIVE);
    });
  });
});

// ============================================================================
// PhonePe Provider Managed Provider Tests
// ============================================================================

describe('PhonePeProviderManagedProvider', () => {
  let provider: PhonePeProviderManagedProvider;

  beforeEach(() => {
    jest.clearAllMocks();
    provider = new PhonePeProviderManagedProvider();
    provider.initialize(mockConfig);
  });

  describe('initialization', () => {
    it('should initialize with config', () => {
      expect(provider.provider).toBe('PHONEPE');
      expect(provider.subscriptionType).toBe('PROVIDER_MANAGED');
    });

    it('should return public config', () => {
      const publicConfig = provider.getPublicConfig();
      
      expect(publicConfig).toEqual({
        merchantId: 'test_merchant',
        clientId: 'test_client_id',
        provider: 'PHONEPE',
      });
    });

    it('should throw if not initialized', () => {
      const uninitializedProvider = new PhonePeProviderManagedProvider();
      
      expect(() => uninitializedProvider.getPublicConfig()).toThrow();
    });
  });

  describe('healthCheck', () => {
    it('should return healthy on successful token fetch', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockAccessTokenResponse,
      });

      const result = await provider.healthCheck();

      expect(result.healthy).toBe(true);
      expect(result.message).toBeNull();
    });

    it('should return unhealthy on auth failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      const result = await provider.healthCheck();

      expect(result.healthy).toBe(false);
      expect(result.message).toBeDefined();
    });
  });

  describe('setupSubscription', () => {
    it('should setup subscription successfully', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockAccessTokenResponse,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockSetupSubscriptionResponse,
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
        customerEmail: 'test@test.com',
        customerPhone: '9999999999',
        redirectUrl: 'https://test.com/callback',
        metadata: { customerName: 'Test User' },
      });

      expect(result.success).toBe(true);
      expect(result.providerOrderId).toBe('OMO123456');
      expect(result.state).toBe('PENDING');
    });

    it('should return failure result on error', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockAccessTokenResponse,
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 400,
          text: async () => 'Bad Request',
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
      expect(result.error).toBeDefined();
    });
  });

  describe('chargeSubscription', () => {
    it('should charge subscription with autoDebit for provider-managed', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockAccessTokenResponse,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            orderId: 'OMO789',
            state: PhonePeOrderState.NOTIFIED,
            expireAt: Date.now() + 86400000,
          }),
        });

      const result = await provider.chargeSubscription({
        merchantSubscriptionId: 'MSUB123',
        providerSubscriptionId: 'OMS123',
        merchantOrderId: 'MO456',
        amount: 10000,
        currency: 'INR',
        metadata: { planId: 'plan_123' },
      });

      expect(result.success).toBe(true);
      expect(result.providerOrderId).toBe('OMO789');
    });
  });

  describe('getSubscriptionStatus', () => {
    it('should return subscription status', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockAccessTokenResponse,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockSubscriptionStatusResponse,
        });

      const result = await provider.getSubscriptionStatus({
        merchantSubscriptionId: 'MSUB123',
        providerSubscriptionId: 'OMS123',
      });

      expect(result.providerState).toBe(PhonePeSubscriptionState.ACTIVE);
      expect(result.canCharge).toBe(true);
    });
  });

  describe('cancelSubscription', () => {
    it('should cancel subscription successfully', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockAccessTokenResponse,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ state: PhonePeSubscriptionState.CANCELLED }),
        });

      const result = await provider.cancelSubscription({
        merchantSubscriptionId: 'MSUB123',
        providerSubscriptionId: 'OMS123',
        reason: 'User requested',
      });

      expect(result.success).toBe(true);
      expect(result.state).toBe(PhonePeSubscriptionState.CANCELLED);
    });
  });

  describe('pauseSubscription', () => {
    it('should pause subscription', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockAccessTokenResponse,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ state: PhonePeSubscriptionState.PAUSED }),
        });

      const result = await provider.pauseSubscription('MSUB123', 'OMS123');

      expect(result.providerState).toBe(PhonePeSubscriptionState.PAUSED);
      expect(result.canCharge).toBe(false);
    });
  });

  describe('resumeSubscription', () => {
    it('should resume subscription', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockAccessTokenResponse,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ state: PhonePeSubscriptionState.ACTIVE }),
        });

      const result = await provider.resumeSubscription('MSUB123', 'OMS123');

      expect(result.providerState).toBe(PhonePeSubscriptionState.ACTIVE);
      expect(result.canCharge).toBe(true);
    });
  });

  describe('parseWebhookEvent', () => {
    it('should parse webhook event correctly', async () => {
      const webhookPayload = {
        type: PhonePeWebhookEvent.SUBSCRIPTION_SETUP_ORDER_COMPLETED,
        data: {
          merchantSubscriptionId: 'MSUB123',
          subscriptionId: 'OMS123',
          merchantOrderId: 'MO123',
          orderId: 'OMO123',
          state: PhonePeSubscriptionState.ACTIVE,
          amount: 10000,
        },
      };

      const result = await provider.parseWebhookEvent({
        payload: JSON.stringify(webhookPayload),
        signature: null,
        headers: {},
      });

      expect(result.eventType).toBe(PhonePeWebhookEvent.SUBSCRIPTION_SETUP_ORDER_COMPLETED);
      expect(result.merchantSubscriptionId).toBe('MSUB123');
      expect(result.provider).toBe('PHONEPE');
      expect(result.subscriptionType).toBe('PROVIDER_MANAGED');
    });
  });
});

// ============================================================================
// PhonePe User Managed Provider Tests
// ============================================================================

describe('PhonePeUserManagedProvider', () => {
  let provider: PhonePeUserManagedProvider;

  beforeEach(() => {
    jest.clearAllMocks();
    provider = new PhonePeUserManagedProvider();
    provider.initialize(mockConfig);
  });

  describe('initialization', () => {
    it('should have USER_MANAGED subscription type', () => {
      expect(provider.subscriptionType).toBe('USER_MANAGED');
    });
  });

  describe('chargeSubscription', () => {
    it('should use notify and execute flow for user-managed', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockAccessTokenResponse,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            orderId: 'OMO789',
            state: PhonePeOrderState.NOTIFIED,
            expireAt: Date.now() + 86400000,
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            transactionId: 'TXN123',
            state: 'PENDING',
          }),
        });

      const result = await provider.chargeSubscription({
        merchantSubscriptionId: 'MSUB123',
        providerSubscriptionId: 'OMS123',
        merchantOrderId: 'MO456',
        amount: 10000,
        currency: 'INR',
        metadata: { planId: 'plan_123' },
      });

      expect(result.success).toBe(true);
      expect(result.transactionId).toBe('TXN123');
    });
  });

  describe('cancelSubscription', () => {
    it('should cancel subscription in user-managed mode', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockAccessTokenResponse,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ state: PhonePeSubscriptionState.CANCELLED }),
        });

      const result = await provider.cancelSubscription({
        merchantSubscriptionId: 'MSUB123',
        providerSubscriptionId: 'OMS123',
        reason: null,
      });

      expect(result.success).toBe(true);
    });
  });
});

// ============================================================================
// State Mapping Tests
// ============================================================================

describe('PhonePe State Mapping', () => {
  it('should map all PhonePe states to unified status', () => {
    const stateMappings: Array<{ phonePe: PhonePeSubscriptionState; expected: SubscriptionStatus }> = [
      { phonePe: PhonePeSubscriptionState.CREATED, expected: SubscriptionStatus.CREATED },
      { phonePe: PhonePeSubscriptionState.ACTIVATION_IN_PROGRESS, expected: SubscriptionStatus.ACTIVATION_IN_PROGRESS },
      { phonePe: PhonePeSubscriptionState.ACTIVE, expected: SubscriptionStatus.ACTIVE },
      { phonePe: PhonePeSubscriptionState.PAUSED, expected: SubscriptionStatus.PAUSED },
      { phonePe: PhonePeSubscriptionState.CANCEL_IN_PROGRESS, expected: SubscriptionStatus.CANCEL_IN_PROGRESS },
      { phonePe: PhonePeSubscriptionState.CANCELLED, expected: SubscriptionStatus.CANCELLED },
      { phonePe: PhonePeSubscriptionState.REVOKED, expected: SubscriptionStatus.REVOKED },
      { phonePe: PhonePeSubscriptionState.EXPIRED, expected: SubscriptionStatus.EXPIRED },
      { phonePe: PhonePeSubscriptionState.FAILED, expected: SubscriptionStatus.FAILED },
      { phonePe: PhonePeSubscriptionState.COMPLETED, expected: SubscriptionStatus.COMPLETED },
    ];

    for (const { phonePe, expected } of stateMappings) {
      expect(mapPhonePeSubscriptionState(phonePe)).toBe(expected);
    }
  });
});

// ============================================================================
// Endpoint Tests
// ============================================================================

describe('PhonePe Endpoints', () => {
  it('should have correct sandbox endpoints', () => {
    expect(PHONEPE_ENDPOINTS.SANDBOX.AUTH).toBe(
      'https://api-preprod.phonepe.com/apis/pg-sandbox/v1/oauth/token',
    );
    expect(PHONEPE_ENDPOINTS.SANDBOX.BASE).toBe(
      'https://api-preprod.phonepe.com/apis/pg-sandbox',
    );
  });

  it('should have correct production endpoints', () => {
    expect(PHONEPE_ENDPOINTS.PRODUCTION.AUTH).toBe(
      'https://api.phonepe.com/apis/identity-manager/v1/oauth/token',
    );
    expect(PHONEPE_ENDPOINTS.PRODUCTION.BASE).toBe(
      'https://api.phonepe.com/apis/pg',
    );
  });
});
