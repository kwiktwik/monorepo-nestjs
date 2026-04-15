/**
 * Resilience Module Exports
 *
 * Provides circuit breaker and fallback strategies for payment providers.
 */

export {
  CircuitBreakerService,
  CircuitOpenError,
  type CircuitBreakerConfig,
  type CircuitState,
  type CircuitStats,
} from './circuit-breaker.service';

export {
  SetupSubscriptionFallback,
  ChargeSubscriptionFallback,
  GetSubscriptionStatusFallback,
  GetOrderStatusFallback,
  CancelSubscriptionFallback,
  FallbackStrategyFactory,
  type FallbackConfig,
  type FallbackContext,
  type FallbackStrategy,
  type OperationType,
  type QueuedOperation,
} from './payment-fallback.strategies';
