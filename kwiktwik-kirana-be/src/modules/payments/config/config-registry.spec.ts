/**
 * Tests for PaymentConfigRegistry
 */
import { PaymentConfigRegistry } from './config-registry';
import { RazorpayConfig, PhonePeConfig } from '../types';

describe('PaymentConfigRegistry', () => {
  let registry: PaymentConfigRegistry;

  beforeEach(() => {
    registry = new PaymentConfigRegistry();
  });

  describe('register', () => {
    it('should register a config', () => {
      const config: RazorpayConfig = {
        id: 'test-app',
        provider: 'razorpay',
        environment: 'sandbox',
        enabled: true,
        keyId: 'rzp_test_xxx',
        keySecret: 'secret',
      };
      registry.register(config);
      expect(registry.has('razorpay', 'test-app')).toBe(true);
    });

    it('should allow registering multiple configs', () => {
      registry.registerMany([
        { id: 'app1', provider: 'razorpay', environment: 'sandbox', enabled: true, keyId: 'k1', keySecret: 's1' } as RazorpayConfig,
        { id: 'app2', provider: 'phonepe', environment: 'sandbox', enabled: true, merchantId: 'm1', clientId: 'c1', clientSecret: 's1' } as PhonePeConfig,
      ]);
      expect(registry.size()).toBe(2);
    });
  });

  describe('get', () => {
    it('should return config by provider and id', () => {
      const config: RazorpayConfig = {
        id: 'myapp', provider: 'razorpay', environment: 'sandbox', enabled: true, keyId: 'k', keySecret: 's',
      };
      registry.register(config);
      const found = registry.get('razorpay', 'myapp');
      expect(found).toEqual(config);
    });

    it('should return undefined for missing config', () => {
      expect(registry.get('razorpay', 'nonexistent')).toBeUndefined();
    });

    it('should fallback to default when enabled', () => {
      const defaultConfig: RazorpayConfig = {
        id: 'default', provider: 'razorpay', environment: 'sandbox', enabled: true, keyId: 'def', keySecret: 'def',
      };
      registry.register(defaultConfig);
      registry.setDefault('razorpay', 'default');

      const found = registry.get('razorpay', 'someapp', { fallbackToDefault: true });
      expect(found?.id).toBe('default');
    });
  });

  describe('getAllForProvider', () => {
    it('should return all configs for a provider type', () => {
      registry.registerMany([
        { id: 'a1', provider: 'razorpay', environment: 'sandbox', enabled: true, keyId: 'k', keySecret: 's' } as RazorpayConfig,
        { id: 'a2', provider: 'razorpay', environment: 'sandbox', enabled: true, keyId: 'k2', keySecret: 's2' } as RazorpayConfig,
        { id: 'b1', provider: 'phonepe', environment: 'sandbox', enabled: true, merchantId: 'm', clientId: 'c', clientSecret: 's' } as PhonePeConfig,
      ]);
      const razorpayConfigs = registry.getAllForProvider('razorpay');
      expect(razorpayConfigs.length).toBe(2);
    });
  });

  describe('remove', () => {
    it('should remove a config', () => {
      registry.register({ id: 'x', provider: 'razorpay', environment: 'sandbox', enabled: true, keyId: 'k', keySecret: 's' } as RazorpayConfig);
      const removed = registry.remove('razorpay', 'x');
      expect(removed).toBe(true);
      expect(registry.has('razorpay', 'x')).toBe(false);
    });
  });

  describe('clear', () => {
    it('should clear all configs', () => {
      registry.register({ id: 'a', provider: 'razorpay', environment: 'sandbox', enabled: true, keyId: 'k', keySecret: 's' } as RazorpayConfig);
      registry.clear();
      expect(registry.size()).toBe(0);
    });
  });
});
