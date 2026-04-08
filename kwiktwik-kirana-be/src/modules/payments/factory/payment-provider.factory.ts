/**
 * Payment Provider Factory
 *
 * Creates PaymentProvider instances based on provider type and config.
 * Loosely coupled: No NestJS deps.
 */

import type { PaymentProvider } from '../types/payment-provider.interface';
import type { PaymentProviderConfig, PaymentProviderType } from '../types/payment-config.types';
import { RazorpayProvider } from '../providers/razorpay.provider';
import { PhonePeProvider } from '../providers/phonepe.provider';
import { ConfigError } from '../types/payment-provider.interface';

export class PaymentProviderFactory {
  static createProvider(config: PaymentProviderConfig): PaymentProvider {
    switch (config.provider) {
      case 'razorpay':
        return new RazorpayProvider(config);
      case 'phonepe':
        return new PhonePeProvider(config);
      default:
        // This should never happen due to exhaustive switch, but keep for safety
        const unknownConfig = config as { provider: string; id: string };
        throw new ConfigError(`Unknown payment provider: ${unknownConfig.provider}`, unknownConfig.id, unknownConfig.provider);
    }
  }

  static createFromRegistry(
    provider: PaymentProviderType,
    configId: string,
    registry: import('../config/config-registry').PaymentConfigRegistry,
  ): PaymentProvider {
    const config = registry.get(provider, configId);
    if (!config) throw new ConfigError(`Config not found for provider ${provider} and id ${configId}`, configId, provider);
    return this.createProvider(config);
  }

  static createWithFallback(
    provider: PaymentProviderType,
    configId: string,
    registry: import('../config/config-registry').PaymentConfigRegistry,
    fallbackConfigId?: string,
  ): PaymentProvider {
    let config = registry.get(provider, configId);
    if (!config && fallbackConfigId) config = registry.get(provider, fallbackConfigId);
    if (!config) config = registry.get(provider, 'default');
    if (!config) throw new ConfigError(`No config found for provider ${provider} (id: ${configId})`, configId, provider);
    return this.createProvider(config);
  }
}
