/**
 * Payment Config Registry
 *
 * Manages multiple payment provider configurations.
 * Loosely coupled: Pure TypeScript, no NestJS deps.
 */

import type {
  PaymentProviderConfig,
  PaymentProviderType,
  ConfigResolutionOptions,
} from '../types';

export class PaymentConfigRegistry {
  private configs: Map<string, PaymentProviderConfig> = new Map();
  private defaultConfigs: Map<PaymentProviderType, string> = new Map();

  register(config: PaymentProviderConfig): void {
    const key = this.getConfigKey(config.provider, config.id);
    this.configs.set(key, config);
  }

  registerMany(configs: PaymentProviderConfig[]): void {
    for (const config of configs) this.register(config);
  }

  setDefault(provider: PaymentProviderType, configId: string): void {
    this.defaultConfigs.set(provider, configId);
  }

  get(
    provider: PaymentProviderType,
    configId: string,
    options?: ConfigResolutionOptions,
  ): PaymentProviderConfig | undefined {
    const key = this.getConfigKey(provider, configId);
    let config = this.configs.get(key);

    if (!config && options?.fallbackToDefault) {
      const defaultId =
        options.defaultConfigId ?? this.defaultConfigs.get(provider);
      if (defaultId) {
        const defaultKey = this.getConfigKey(provider, defaultId);
        config = this.configs.get(defaultKey) ?? undefined;
      }
    }
    return config ?? undefined;
  }

  getAllForProvider(provider: PaymentProviderType): PaymentProviderConfig[] {
    const result: PaymentProviderConfig[] = [];
    for (const config of this.configs.values()) {
      if (config.provider === provider) result.push(config);
    }
    return result;
  }

  has(provider: PaymentProviderType, configId: string): boolean {
    return this.configs.has(this.getConfigKey(provider, configId));
  }

  remove(provider: PaymentProviderType, configId: string): boolean {
    return this.configs.delete(this.getConfigKey(provider, configId));
  }

  clear(): void {
    this.configs.clear();
    this.defaultConfigs.clear();
  }

  size(): number {
    return this.configs.size;
  }

  private getConfigKey(
    provider: PaymentProviderType,
    configId: string,
  ): string {
    return `${provider}:${configId}`;
  }
}

export const paymentConfigRegistry = new PaymentConfigRegistry();
