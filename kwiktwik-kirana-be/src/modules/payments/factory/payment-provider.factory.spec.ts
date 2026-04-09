/**
 * Tests for PaymentProviderFactory
 */
import { PaymentProviderFactory } from './payment-provider.factory';
import { PaymentConfigRegistry } from '../config/config-registry';
import { RazorpayConfig, PhonePeConfig } from '../types';

describe('PaymentProviderFactory', () => {
  describe('createProvider', () => {
    it('should create RazorpayProvider for razorpay config', () => {
      const config: RazorpayConfig = {
        id: 'test',
        provider: 'razorpay',
        environment: 'sandbox',
        enabled: true,
        keyId: 'k',
        keySecret: 's',
      };
      const provider = PaymentProviderFactory.createProvider(config);
      expect(provider.providerType).toBe('razorpay');
    });

    it('should create PhonePeProvider for phonepe config', () => {
      const config: PhonePeConfig = {
        id: 'test',
        provider: 'phonepe',
        environment: 'sandbox',
        enabled: true,
        merchantId: 'm',
        clientId: 'c',
        clientSecret: 's',
      };
      const provider = PaymentProviderFactory.createProvider(config);
      expect(provider.providerType).toBe('phonepe');
    });

    it('should throw for unknown provider', () => {
      const config = {
        id: 'x',
        provider: 'unknown',
        environment: 'sandbox',
        enabled: true,
      } as any;
      expect(() => PaymentProviderFactory.createProvider(config)).toThrow(
        'Unknown payment provider',
      );
    });
  });

  describe('createFromRegistry', () => {
    it('should create provider from registry', () => {
      const registry = new PaymentConfigRegistry();
      registry.register({
        id: 'app1',
        provider: 'razorpay',
        environment: 'sandbox',
        enabled: true,
        keyId: 'k',
        keySecret: 's',
      } as RazorpayConfig);

      const provider = PaymentProviderFactory.createFromRegistry(
        'razorpay',
        'app1',
        registry,
      );
      expect(provider.providerType).toBe('razorpay');
    });

    it('should throw if config not found', () => {
      const registry = new PaymentConfigRegistry();
      expect(() =>
        PaymentProviderFactory.createFromRegistry(
          'razorpay',
          'missing',
          registry,
        ),
      ).toThrow('Config not found');
    });
  });
});
