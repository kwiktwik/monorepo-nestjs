/**
 * Provider Factory
 *
 * Creates and manages payment provider instances based on configuration.
 * Supports both provider-managed and user-managed subscription types.
 *
 * Features:
 * - Provider instance caching
 * - Circuit breaker integration
 * - Fallback strategy support
 */

import { Logger } from '@nestjs/common';
import type { PaymentProvider } from '../../types/provider.enum';
import type { SubscriptionType } from '../../types/subscription-type.enum';
import type {
  SubscriptionProvider,
  AnyProviderConfig,
  SetupSubscriptionParams,
  SetupSubscriptionResult,
  ChargeSubscriptionParams,
  ChargeSubscriptionResult,
  GetSubscriptionStatusParams,
  SubscriptionStatusResult,
  GetOrderStatusParams,
  OrderStatusResult,
  CancelSubscriptionParams,
  CancelSubscriptionResult,
  ParseWebhookParams,
  WebhookEvent,
} from '../interfaces/subscription-provider.interface';
import { RazorpayProviderManagedProvider, RazorpayUserManagedProvider } from '../razorpay/razorpay.provider';
import { PhonePeProviderManagedProvider, PhonePeUserManagedProvider } from '../phonepe/phonepe.provider';
import {
  CircuitBreakerService,
  CircuitOpenError,
  FallbackStrategyFactory,
  type PaymentFallbackConfig,
} from '../../common/resilience';

// ============================================================================
// Types
// ============================================================================

/**
 * Provider registry type
 */
type ProviderRegistry = Map<string, SubscriptionProvider>;

/**
 * Operations that should be wrapped with circuit breaker
 */
const CIRCUIT_PROTECTED_OPERATIONS = [
  'setupSubscription',
  'chargeSubscription',
  'getSubscriptionStatus',
  'getOrderStatus',
  'cancelSubscription',
  'pauseSubscription',
  'resumeSubscription',
  'refundPayment',
] as const;

type CircuitProtectedOperation = (typeof CIRCUIT_PROTECTED_OPERATIONS)[number];

// ============================================================================
// Provider Registry (Global)
// ============================================================================

/**
 * Global provider registry
 * Key format: `{provider}_{subscriptionType}_{configId}`
 */
const providerRegistry: ProviderRegistry = new Map();

// ============================================================================
// Provider Factory Functions
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
 * Get or create a provider instance (without circuit breaker)
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
 * Provider factory for dependency injection with circuit breaker support
 */
export class ProviderFactory {
  private readonly logger = new Logger(ProviderFactory.name);
  private readonly providers: ProviderRegistry = new Map();
  private readonly fallbackFactory: FallbackStrategyFactory;

  constructor(
    private readonly circuitBreaker?: CircuitBreakerService,
    fallbackConfig: Partial<PaymentFallbackConfig> = {},
  ) {
    this.fallbackFactory = new FallbackStrategyFactory(fallbackConfig);
  }

  /**
   * Get or create a provider (wrapped with circuit breaker if available)
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

      // Wrap with circuit breaker if available
      if (this.circuitBreaker) {
        providerInstance = this.wrapWithCircuitBreaker(providerInstance, provider);
        this.logger.debug(`Wrapped provider ${provider}:${subscriptionType} with circuit breaker`);
      }

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

  /**
   * Get fallback strategy factory
   */
  getFallbackFactory(): FallbackStrategyFactory {
    return this.fallbackFactory;
  }

  /**
   * Wrap provider with circuit breaker using Proxy
   */
  private wrapWithCircuitBreaker(
    provider: SubscriptionProvider,
    providerType: PaymentProvider,
  ): SubscriptionProvider {
    const circuitBreaker = this.circuitBreaker!;
    const fallbackFactory = this.fallbackFactory;

    return new Proxy(provider, {
      get(target, prop: string) {
        const original = (target as Record<string, unknown>)[prop];

        // Only wrap async methods that make API calls
        if (
          typeof original === 'function' &&
          CIRCUIT_PROTECTED_OPERATIONS.includes(prop as CircuitProtectedOperation)
        ) {
          return async (...args: unknown[]) => {
            return circuitBreaker.execute(
              providerType,
              prop,
              () => (original as (...args: unknown[]) => Promise<unknown>).apply(target, args),
              () => createFallback(prop, args, providerType, fallbackFactory),
            );
          };
        }

        // Pass through other properties/methods
        return original;
      },
    });
  }
}

/**
 * Create fallback function based on operation type
 */
function createFallback(
  operation: string,
  args: unknown[],
  provider: PaymentProvider,
  fallbackFactory: FallbackStrategyFactory,
): Promise<unknown> {
  const context = {
    provider,
    operation: operation as CircuitProtectedOperation,
    originalError: new CircuitOpenError(provider, operation, {
      state: 'OPEN',
      failureCount: 0,
      successCount: 0,
      lastFailureTime: null,
      lastStateChange: null,
    }),
  };

  switch (operation) {
    case 'setupSubscription':
      return fallbackFactory.getSetupFallback().execute(args[0] as SetupSubscriptionParams, context);

    case 'chargeSubscription':
      return fallbackFactory.getChargeFallback().execute(args[0] as ChargeSubscriptionParams, context);

    case 'getSubscriptionStatus':
      return fallbackFactory.getStatusFallback().execute(args[0] as GetSubscriptionStatusParams, context);

    case 'getOrderStatus':
      return fallbackFactory.getOrderStatusFallback().execute(args[0] as GetOrderStatusParams, context);

    case 'cancelSubscription':
      return fallbackFactory.getCancelFallback().execute(args[0] as CancelSubscriptionParams, context);

    default:
      // For operations without specific fallbacks, throw the circuit open error
      return Promise.reject(new CircuitOpenError(provider, operation, {
        state: 'OPEN',
        failureCount: 0,
        successCount: 0,
        lastFailureTime: null,
        lastStateChange: null,
      }));
  }
}

// ============================================================================
// Singleton Factory Instance
// ============================================================================

/**
 * Default factory instance (without circuit breaker)
 */
export const defaultProviderFactory = new ProviderFactory();
