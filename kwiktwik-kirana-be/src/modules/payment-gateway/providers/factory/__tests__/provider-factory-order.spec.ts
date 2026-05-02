/**
 * ProviderFactory — One-Time Order Provider Tests
 */

import { ProviderFactory } from '../provider.factory';
import { RazorpayOneTimeOrderProvider } from '../../razorpay/razorpay.provider';
import { PhonePeOneTimeOrderProvider } from '../../phonepe/phonepe.provider';
import type { AnyProviderConfig } from '../../interfaces/subscription-provider.interface';

jest.mock('razorpay', () => {
  return jest.fn().mockImplementation(() => ({
    subscriptions: { create: jest.fn(), fetch: jest.fn(), cancel: jest.fn(), pause: jest.fn(), resume: jest.fn(), update: jest.fn() },
    orders: { create: jest.fn(), fetch: jest.fn(), fetchPayments: jest.fn() },
    payments: { fetch: jest.fn(), capture: jest.fn(), refund: jest.fn() },
    customers: { create: jest.fn() },
    plans: { create: jest.fn() },
  }));
});

const razorpayConfig: AnyProviderConfig = {
  configId: 'cfg_rzp',
  provider: 'RAZORPAY',
  appId: 'app_test',
  environment: 'SANDBOX',
  enabled: true,
  isDefault: true,
  webhookSecret: 'secret',
  keyId: 'rzp_key',
  keySecret: 'rzp_secret',
  accountId: null,
} as AnyProviderConfig;

const phonePeConfig: AnyProviderConfig = {
  configId: 'cfg_pp',
  provider: 'PHONEPE',
  appId: 'app_test',
  environment: 'SANDBOX',
  enabled: true,
  isDefault: true,
  webhookSecret: null,
  clientId: 'pp_cid',
  clientSecret: 'pp_csec',
  clientVersion: 1,
  merchantId: 'pp_mid',
  saltKey: 'pp_salt',
  saltIndex: '1',
  checkoutMode: 'STANDARD_CHECKOUT',
} as AnyProviderConfig;

describe('ProviderFactory — getOneTimeOrderProvider', () => {
  let factory: ProviderFactory;

  beforeEach(() => {
    factory = new ProviderFactory(undefined, { enableRetryQueue: false });
  });

  it('should create a Razorpay one-time order provider', () => {
    const provider = factory.getOneTimeOrderProvider('RAZORPAY', razorpayConfig);

    expect(provider).toBeInstanceOf(RazorpayOneTimeOrderProvider);
    expect(provider.provider).toBe('RAZORPAY');
  });

  it('should create a PhonePe one-time order provider', () => {
    const provider = factory.getOneTimeOrderProvider('PHONEPE', phonePeConfig);

    expect(provider).toBeInstanceOf(PhonePeOneTimeOrderProvider);
    expect(provider.provider).toBe('PHONEPE');
  });

  it('should cache and return the same provider instance', () => {
    const first = factory.getOneTimeOrderProvider('RAZORPAY', razorpayConfig);
    const second = factory.getOneTimeOrderProvider('RAZORPAY', razorpayConfig);

    expect(first).toBe(second);
  });

  it('should return different instances for different providers', () => {
    const rzp = factory.getOneTimeOrderProvider('RAZORPAY', razorpayConfig);
    const pp = factory.getOneTimeOrderProvider('PHONEPE', phonePeConfig);

    expect(rzp).not.toBe(pp);
    expect(rzp.provider).toBe('RAZORPAY');
    expect(pp.provider).toBe('PHONEPE');
  });

  it('should return different instances for different config IDs', () => {
    const first = factory.getOneTimeOrderProvider('RAZORPAY', razorpayConfig);
    const second = factory.getOneTimeOrderProvider('RAZORPAY', {
      ...razorpayConfig,
      configId: 'cfg_rzp_2',
    } as AnyProviderConfig);

    expect(first).not.toBe(second);
  });

  it('should throw for unsupported provider', () => {
    expect(() =>
      factory.getOneTimeOrderProvider('STRIPE' as any, razorpayConfig),
    ).toThrow('Unsupported provider for one-time orders: STRIPE');
  });
});