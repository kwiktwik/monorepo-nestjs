/**
 * Provider Factory
 * 
 * Creates and manages payment provider instances based on configuration.
 * Supports both provider-managed and user-managed subscription types.
 */

import type { PaymentProvider } from '../../types/provider.enum';
import type { SubscriptionType } from '../../types/subscription-type.enum';
import type { SubscriptionProvider, AnyProviderConfig } from '../interfaces/subscription-provider.interface';
import { RazorpayProviderManagedProvider, RazorpayUserManagedProvider } from '../razorpay/razorpay.provider';
import { PhonePeProviderManagedProvider, PhonePeUserManagedProvider } from '../phonepe/phonepe.provider';

// ============================================================================
// Provider Registry
// ============================================================================

/**
 * Provider registry type
 */
type ProviderRegistry = Map<string, SubscriptionProvider>;

/**
 * Global provider registry
 * Key format: `{provider}_{subscriptionType}_{configId}`
 */
const providerRegistry: ProviderRegistry = new Map();

// ============================================================================
// Provider Factory
// ============================================================================

/**
 * Create a provider key for the registry
 */
function createProviderKey(
  provider: PaymentProvider,
  subscriptionType: SubscriptionType,
  configId: string,
): string {
  return `${provider}_${subscriptionType}_${configId}`;
}

/**
 * Create a new provider instance
 */
function createProviderInstance(
  provider: PaymentProvider,
  subscriptionType: SubscriptionType,
): SubscriptionProvider {
  switch (provider) {
    case 'RAZORPAY':
      return subscriptionType === 'PROVIDER_MANAGED'
        ? new RazorpayProviderManagedProvider()
        : new RazorpayUserManagedProvider();

    case 'PHONEPE':
      return subscriptionType === 'PROVIDER_MANAGED'
        ? new PhonePeProviderManagedProvider()
        : new PhonePeUserManagedProvider();

    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

/**
 * Get or create a provider instance
 */
export function getProvider(
  provider: PaymentProvider,
  subscriptionType: SubscriptionType,
  config: AnyProviderConfig,
): SubscriptionProvider {
  const key = createProviderKey(provider, subscriptionType, config.configId);
  
  let providerInstance = providerRegistry.get(key);
  
  if (!providerInstance) {
    providerInstance = createProviderInstance(provider, subscriptionType);
    providerInstance.initialize(config);
    providerRegistry.set(key, providerInstance);
  }
  
  return providerInstance;
}

/**
 * Get an existing provider without creating
 */
export function getExistingProvider(
  provider: PaymentProvider,
  subscriptionType: SubscriptionType,
  configId: string,
): SubscriptionProvider | undefined {
  const key = createProviderKey(provider, subscriptionType, configId);
  return providerRegistry.get(key);
}

/**
 * Clear all cached providers
 */
export function clearProviders(): void {
  providerRegistry.clear();
}

/**
 * Remove a specific provider from cache
 */
export function removeProvider(
  provider: PaymentProvider,
  subscriptionType: SubscriptionType,
  configId: string,
): boolean {
  const key = createProviderKey(provider, subscriptionType, configId);
  return providerRegistry.delete(key);
}

/**
 * Get all registered provider keys
 */
export function getRegisteredProviderKeys(): string[] {
  return Array.from(providerRegistry.keys());
}

/**
 * Check if a provider is registered
 */
export function hasProvider(
  provider: PaymentProvider,
  subscriptionType: SubscriptionType,
  configId: string,
): boolean {
  const key = createProviderKey(provider, subscriptionType, configId);
  return providerRegistry.has(key);
}

// ============================================================================
// Provider Factory Class (DI-friendly)
// ============================================================================

/**
 * Provider factory for dependency injection
 */
export class ProviderFactory {
  private readonly providers: ProviderRegistry = new Map();

  /**
   * Get or create a provider
   */
  getProvider(
    provider: PaymentProvider,
    subscriptionType: SubscriptionType,
    config: AnyProviderConfig,
  ): SubscriptionProvider {
    const key = createProviderKey(provider, subscriptionType, config.configId);
    
    let providerInstance = this.providers.get(key);
    
    if (!providerInstance) {
      providerInstance = createProviderInstance(provider, subscriptionType);
      providerInstance.initialize(config);
      this.providers.set(key, providerInstance);
    }
    
    return providerInstance;
  }

  /**
   * Get existing provider
   */
  getExistingProvider(
    provider: PaymentProvider,
    subscriptionType: SubscriptionType,
    configId: string,
  ): SubscriptionProvider | undefined {
    const key = createProviderKey(provider, subscriptionType, configId);
    return this.providers.get(key);
  }

  /**
   * Clear all providers
   */
  clear(): void {
    this.providers.clear();
  }

  /**
   * Remove a specific provider
   */
  remove(
    provider: PaymentProvider,
    subscriptionType: SubscriptionType,
    configId: string,
  ): boolean {
    const key = createProviderKey(provider, subscriptionType, configId);
    return this.providers.delete(key);
  }

  /**
   * Check if provider exists
   */
  has(
    provider: PaymentProvider,
    subscriptionType: SubscriptionType,
    configId: string,
  ): boolean {
    const key = createProviderKey(provider, subscriptionType, configId);
    return this.providers.has(key);
  }
}

// ============================================================================
// Singleton Factory Instance
// ============================================================================

/**
 * Default factory instance
 */
export const defaultProviderFactory = new ProviderFactory();
