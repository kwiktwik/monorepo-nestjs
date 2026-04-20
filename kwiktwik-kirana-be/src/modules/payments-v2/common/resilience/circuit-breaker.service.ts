/**
 * Circuit Breaker Service
 *
 * Provides distributed circuit breaker functionality for payment providers.
 * Uses Redis for multi-server coordination with local fallback.
 *
 * Features:
 * - Redis-backed distributed state for multi-server environments
 * - Redis TIME-based timestamps for clock synchronization
 * - Atomic Lua scripts for sliding window (no race conditions)
 * - HALF_OPEN race condition handling with distributed locking
 * - Error classification (only infrastructure errors trigger circuit)
 * - Payment-specific fallback strategies
 */

import { Injectable, Logger, Optional } from '@nestjs/common';
import Redis from 'ioredis';
import type { PaymentProvider } from '../../types/provider.enum';
import {
  PaymentError,
  PaymentErrorCode,
  ErrorSeverity,
} from '../errors/payment-errors';

// ============================================================================
// Types and Constants
// ============================================================================

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

/**
 * Helper to extract Redis TIME result as milliseconds
 * Handles both string[] and number[] return types from different ioredis versions
 */
function parseRedisTime(timeResult: string[] | number[] | [string, string]): number {
  const seconds = typeof timeResult[0] === 'string' ? parseInt(timeResult[0], 10) : timeResult[0];
  const microseconds = typeof timeResult[1] === 'string' ? parseInt(timeResult[1], 10) : timeResult[1];
  return seconds * 1000 + Math.floor(microseconds / 1000);
}

export interface CircuitBreakerConfig {
  /** Number of failures before opening circuit */
  readonly failureThreshold: number;
  /** Number of successes in HALF_OPEN to close circuit */
  readonly successThreshold: number;
  /** Time in ms before attempting recovery (OPEN -> HALF_OPEN) */
  readonly timeoutMs: number;
  /** Sliding window in ms for counting failures */
  readonly failureWindowMs: number;
  /** Time to wait for lock acquisition in HALF_OPEN */
  readonly halfOpenLockTimeoutMs: number;
  /** TTL for circuit state in Redis (prevents stale data) */
  readonly stateTtlMs: number;
  /** Maximum acceptable clock skew between servers (ms) */
  readonly maxClockSkewMs: number;
}

const DEFAULT_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 5,
  successThreshold: 3,
  timeoutMs: 30000,
  failureWindowMs: 60000,
  halfOpenLockTimeoutMs: 10000,
  stateTtlMs: 86400000, // 24 hours
  maxClockSkewMs: 5000, // 5 seconds tolerance
};

/**
 * Error codes that should trigger the circuit breaker
 * These are infrastructure/system errors, not business logic errors
 */
const CIRCUIT_BREAKER_ERROR_CODES: ReadonlySet<PaymentErrorCode> = new Set([
  // Infrastructure errors
  PaymentErrorCode.PROVIDER_UNAVAILABLE,
  PaymentErrorCode.UNKNOWN_ERROR,
  PaymentErrorCode.AUTH_FAILED,
  PaymentErrorCode.TOKEN_EXPIRED,
  PaymentErrorCode.RATE_LIMIT_EXCEEDED,
  PaymentErrorCode.TOO_MANY_REQUESTS,
  PaymentErrorCode.PAYMENT_TIMEOUT,
]);

/**
 * Error codes that should NOT trigger the circuit breaker
 * These are business logic errors that indicate normal operation
 */
const EXCLUDED_ERROR_CODES: ReadonlySet<PaymentErrorCode> = new Set([
  // User/Business errors - provider is working correctly
  PaymentErrorCode.INSUFFICIENT_FUNDS,
  PaymentErrorCode.INVALID_PAYMENT_METHOD,
  PaymentErrorCode.PAYMENT_METHOD_EXPIRED,
  PaymentErrorCode.PAYMENT_DECLINED,
  PaymentErrorCode.PAYMENT_CANCELLED_BY_USER,
  PaymentErrorCode.MANDATE_REJECTED,
  PaymentErrorCode.MANDATE_EXPIRED,
  PaymentErrorCode.MANDATE_AMOUNT_EXCEEDED,
  PaymentErrorCode.SUBSCRIPTION_NOT_FOUND,
  PaymentErrorCode.SUBSCRIPTION_ALREADY_CANCELLED,
  PaymentErrorCode.SUBSCRIPTION_CANNOT_BE_CANCELLED,
  PaymentErrorCode.SUBSCRIPTION_CANNOT_BE_PAUSED,
  PaymentErrorCode.ORDER_NOT_FOUND,
  PaymentErrorCode.ORDER_EXPIRED,
  PaymentErrorCode.ORDER_ALREADY_PAID,
  PaymentErrorCode.INVALID_AMOUNT,
  PaymentErrorCode.INVALID_CURRENCY,
  PaymentErrorCode.INVALID_CUSTOMER,
  PaymentErrorCode.INVALID_PLAN,
  PaymentErrorCode.INVALID_FREQUENCY,
  PaymentErrorCode.INVALID_REQUEST,
  PaymentErrorCode.NOT_INITIALIZED,
  PaymentErrorCode.CONFIG_NOT_FOUND,
  PaymentErrorCode.WEBHOOK_SIGNATURE_INVALID,
]);

export interface CircuitStats {
  readonly state: CircuitState;
  readonly failureCount: number;
  readonly successCount: number;
  readonly lastFailureTime: Date | null;
  readonly lastStateChange: Date | null;
}

// ============================================================================
// Lua Scripts for Atomic Operations
// ============================================================================

/**
 * Lua script for recording failure atomically with sliding window
 * Uses Redis TIME for consistent timestamps
 *
 * Returns: [failureCount, shouldOpen]
 */
const RECORD_FAILURE_SCRIPT = `
local key = KEYS[1]
local failureThreshold = tonumber(ARGV[1])
local failureWindowMs = tonumber(ARGV[2])
local stateTtlSeconds = tonumber(ARGV[3])

-- Get Redis server time (seconds, microseconds)
local time = redis.call('TIME')
local nowMs = time[1] * 1000 + math.floor(time[2] / 1000)
local windowStartMs = nowMs - failureWindowMs

-- Add failure with current Redis timestamp
local member = nowMs .. ':' .. math.random()
redis.call('ZADD', key .. ':failures', nowMs, member)

-- Remove failures outside the window
redis.call('ZREMRANGEBYSCORE', key .. ':failures', '-inf', windowStartMs)

-- Set TTL on failures set
redis.call('PEXPIRE', key .. ':failures', failureWindowMs)

-- Count failures in window
local failureCount = redis.call('ZCARD', key .. ':failures')

-- Check if we should open circuit
local shouldOpen = 0
if failureCount >= failureThreshold then
  shouldOpen = 1
end

return {failureCount, shouldOpen, nowMs}
`;

/**
 * Lua script for getting circuit state with Redis TIME
 * Handles the OPEN -> HALF_OPEN transition based on Redis time
 *
 * Returns: [state, changedAtMs, currentRedisTimeMs]
 */
const GET_STATE_SCRIPT = `
local key = KEYS[1]
local timeoutMs = tonumber(ARGV[1])

-- Get Redis server time
local time = redis.call('TIME')
local nowMs = time[1] * 1000 + math.floor(time[2] / 1000)

-- Get current state
local state = redis.call('GET', key .. ':state')

if not state then
  return {'CLOSED', 0, nowMs}
end

if state == 'OPEN' then
  local changedAt = redis.call('GET', key .. ':changedAt')
  if changedAt then
    local changedAtMs = tonumber(changedAt)
    local elapsed = nowMs - changedAtMs
    if elapsed >= timeoutMs then
      return {'HALF_OPEN', changedAtMs, nowMs}
    end
  end
  return {'OPEN', tonumber(changedAt or 0), nowMs}
end

local changedAt = redis.call('GET', key .. ':changedAt')
return {state, tonumber(changedAt or 0), nowMs}
`;

/**
 * Lua script for transitioning to OPEN state atomically
 * Uses Redis TIME for timestamp
 */
const TRANSITION_TO_OPEN_SCRIPT = `
local key = KEYS[1]
local stateTtlSeconds = tonumber(ARGV[1])

-- Get Redis server time
local time = redis.call('TIME')
local nowMs = time[1] * 1000 + math.floor(time[2] / 1000)

-- Set state to OPEN
redis.call('SET', key .. ':state', 'OPEN', 'EX', stateTtlSeconds)
redis.call('SET', key .. ':changedAt', nowMs, 'EX', stateTtlSeconds)
redis.call('SET', key .. ':successCount', '0', 'EX', stateTtlSeconds)

return nowMs
`;

/**
 * Lua script for transitioning to CLOSED state atomically
 */
const TRANSITION_TO_CLOSED_SCRIPT = `
local key = KEYS[1]
local stateTtlSeconds = tonumber(ARGV[1])

-- Get Redis server time
local time = redis.call('TIME')
local nowMs = time[1] * 1000 + math.floor(time[2] / 1000)

-- Set state to CLOSED
redis.call('SET', key .. ':state', 'CLOSED', 'EX', stateTtlSeconds)
redis.call('SET', key .. ':changedAt', nowMs, 'EX', stateTtlSeconds)
redis.call('DEL', key .. ':failures')
redis.call('SET', key .. ':successCount', '0', 'EX', stateTtlSeconds)

return nowMs
`;

/**
 * Lua script for recording HALF_OPEN success atomically
 * Returns: [successCount, shouldClose]
 */
const RECORD_HALF_OPEN_SUCCESS_SCRIPT = `
local key = KEYS[1]
local successThreshold = tonumber(ARGV[1])
local stateTtlSeconds = tonumber(ARGV[2])

local successCount = redis.call('INCR', key .. ':successCount')
redis.call('EXPIRE', key .. ':successCount', stateTtlSeconds)

local shouldClose = 0
if successCount >= successThreshold then
  shouldClose = 1
end

return {successCount, shouldClose}
`;

// ============================================================================
// Circuit Breaker Error
// ============================================================================

export class CircuitOpenError extends Error {
  constructor(
    public readonly provider: PaymentProvider,
    public readonly operation: string,
    public readonly stats: CircuitStats,
  ) {
    super(`Circuit breaker is OPEN for ${provider}:${operation}`);
    this.name = 'CircuitOpenError';
  }
}

// ============================================================================
// Circuit Breaker Service
// ============================================================================

@Injectable()
export class CircuitBreakerService {
  private readonly logger = new Logger(CircuitBreakerService.name);
  private readonly configs = new Map<PaymentProvider, CircuitBreakerConfig>();

  // Cached Lua script SHA hashes
  private scriptShas: {
    recordFailure?: string;
    getState?: string;
    transitionToOpen?: string;
    transitionToClosed?: string;
    recordHalfOpenSuccess?: string;
  } = {};

  // Promise for script loading (for testing)
  private scriptsLoadedPromise: Promise<void> | null = null;

  // Local fallback state when Redis is unavailable
  private readonly localState = new Map<
    string,
    { state: CircuitState; changedAt: number }
  >();
  private readonly localFailureTimestamps = new Map<string, number[]>();
  private readonly localSuccessCounts = new Map<string, number>();
  private readonly localLocks = new Map<
    string,
    { acquiredAt: number; holder: string }
  >();

  constructor(@Optional() private readonly redisClient: Redis | null) {
    if (this.redisClient) {
      this.scriptsLoadedPromise = this.loadScripts().catch((err) => {
        this.logger.error(
          'Failed to load Lua scripts, falling back to non-atomic operations',
          err,
        );
      });
    }
  }

  /**
   * Wait for Lua scripts to be loaded (useful for testing)
   */
  async waitForScriptsLoaded(): Promise<void> {
    if (this.scriptsLoadedPromise) {
      await this.scriptsLoadedPromise;
    }
  }

  /**
   * Load Lua scripts into Redis and cache their SHA hashes
   */
  private async loadScripts(): Promise<void> {
    const redis = this.redisClient!;

    const [
      recordFailure,
      getState,
      transitionToOpen,
      transitionToClosed,
      recordHalfOpenSuccess,
    ] = await Promise.all([
      redis.script('LOAD', RECORD_FAILURE_SCRIPT),
      redis.script('LOAD', GET_STATE_SCRIPT),
      redis.script('LOAD', TRANSITION_TO_OPEN_SCRIPT),
      redis.script('LOAD', TRANSITION_TO_CLOSED_SCRIPT),
      redis.script('LOAD', RECORD_HALF_OPEN_SUCCESS_SCRIPT),
    ]);

    this.scriptShas = {
      recordFailure: recordFailure as string,
      getState: getState as string,
      transitionToOpen: transitionToOpen as string,
      transitionToClosed: transitionToClosed as string,
      recordHalfOpenSuccess: recordHalfOpenSuccess as string,
    };

    this.logger.log('Circuit breaker Lua scripts loaded successfully');
  }

  /**
   * Configure circuit breaker for a specific provider
   */
  configure(
    provider: PaymentProvider,
    config: Partial<CircuitBreakerConfig>,
  ): void {
    this.configs.set(provider, { ...DEFAULT_CONFIG, ...config });
    this.logger.log(
      `Configured circuit breaker for ${provider}: ${JSON.stringify(this.configs.get(provider))}`,
    );
  }

  private getConfig(provider: PaymentProvider): CircuitBreakerConfig {
    return this.configs.get(provider) ?? DEFAULT_CONFIG;
  }

  private getKey(provider: PaymentProvider, operation: string): string {
    return `circuit:${provider}:${operation}`;
  }

  /**
   * Check if an error should trigger the circuit breaker
   * Only infrastructure/system errors should trigger, not business errors
   */
  shouldTriggerCircuit(error: unknown): boolean {
    // PaymentError with known code
    if (error instanceof PaymentError) {
      // Explicitly excluded - business logic errors
      if (EXCLUDED_ERROR_CODES.has(error.code)) {
        return false;
      }
      // Explicitly included - infrastructure errors
      if (CIRCUIT_BREAKER_ERROR_CODES.has(error.code)) {
        return true;
      }
      // Critical severity usually indicates infrastructure issues
      if (error.severity === ErrorSeverity.CRITICAL) {
        return true;
      }
      // Retryable errors might be transient infrastructure issues
      if (error.retryable) {
        return true;
      }
      return false;
    }

    // Network/timeout errors (not PaymentError)
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      if (
        message.includes('etimedout') ||
        message.includes('econnrefused') ||
        message.includes('econnreset') ||
        message.includes('enotfound') ||
        message.includes('network') ||
        message.includes('timeout') ||
        message.includes('socket hang up')
      ) {
        return true;
      }
    }

    // Unknown errors - be conservative and trigger circuit
    return true;
  }

  /**
   * Get current circuit state using Redis TIME for consistency
   */
  async getState(
    provider: PaymentProvider,
    operation: string,
  ): Promise<CircuitState> {
    const key = this.getKey(provider, operation);
    const config = this.getConfig(provider);

    if (this.redisClient && this.scriptShas.getState) {
      return this.getRedisStateWithScript(key, config);
    }
    if (this.redisClient) {
      return this.getRedisStateFallback(key, config);
    }
    return this.getLocalState(key, config);
  }

  /**
   * Get state using Lua script (atomic, uses Redis TIME)
   */
  private async getRedisStateWithScript(
    key: string,
    config: CircuitBreakerConfig,
  ): Promise<CircuitState> {
    const result = (await this.redisClient!.evalsha(
      this.scriptShas.getState!,
      1,
      key,
      config.timeoutMs.toString(),
    )) as [string, number, number];

    return result[0] as CircuitState;
  }

  /**
   * Fallback state check without Lua script
   * Uses Redis TIME command for timestamp consistency
   */
  private async getRedisStateFallback(
    key: string,
    config: CircuitBreakerConfig,
  ): Promise<CircuitState> {
    // Get Redis server time for consistent comparison
    const timeResult = await this.redisClient!.time();
    const redisNowMs = parseRedisTime(timeResult);

    const state = await this.redisClient!.get(`${key}:state`);
    if (!state) return 'CLOSED';

    if (state === 'OPEN') {
      const changedAt = await this.redisClient!.get(`${key}:changedAt`);
      if (changedAt) {
        const changedAtMs = parseInt(changedAt, 10);
        const elapsed = redisNowMs - changedAtMs;
        if (elapsed >= config.timeoutMs) {
          return 'HALF_OPEN';
        }
      }
    }

    return state as CircuitState;
  }

  private getLocalState(
    key: string,
    config: CircuitBreakerConfig,
  ): CircuitState {
    const entry = this.localState.get(key);
    if (!entry) return 'CLOSED';

    if (entry.state === 'OPEN') {
      const elapsed = Date.now() - entry.changedAt;
      if (elapsed >= config.timeoutMs) {
        return 'HALF_OPEN';
      }
    }

    return entry.state;
  }

  /**
   * Get circuit statistics
   */
  async getStats(
    provider: PaymentProvider,
    operation: string,
  ): Promise<CircuitStats> {
    const key = this.getKey(provider, operation);
    const config = this.getConfig(provider);

    if (this.redisClient) {
      return this.getRedisStats(key, config);
    }
    return this.getLocalStats(key, config);
  }

  private async getRedisStats(
    key: string,
    config: CircuitBreakerConfig,
  ): Promise<CircuitStats> {
    // Use Redis TIME for consistent timestamp
    const timeResult = await this.redisClient!.time();
    const redisNowMs = parseRedisTime(timeResult);
    const windowStartMs = redisNowMs - config.failureWindowMs;

    const [state, changedAt, successCount] = await Promise.all([
      this.redisClient!.get(`${key}:state`),
      this.redisClient!.get(`${key}:changedAt`),
      this.redisClient!.get(`${key}:successCount`),
    ]);

    // Count failures in window using Redis time
    const failures = await this.redisClient!.zcount(
      `${key}:failures`,
      windowStartMs,
      '+inf',
    );

    // Get last failure time
    const lastFailures = await this.redisClient!.zrange(
      `${key}:failures`,
      -1,
      -1,
      'WITHSCORES',
    );
    const lastFailureTime =
      lastFailures.length >= 2 ? new Date(parseInt(lastFailures[1], 10)) : null;

    return {
      state: (state as CircuitState) ?? 'CLOSED',
      failureCount: failures,
      successCount: successCount ? parseInt(successCount, 10) : 0,
      lastFailureTime,
      lastStateChange: changedAt ? new Date(parseInt(changedAt, 10)) : null,
    };
  }

  private getLocalStats(
    key: string,
    config: CircuitBreakerConfig,
  ): Promise<CircuitStats> {
    const entry = this.localState.get(key);
    const timestamps = this.localFailureTimestamps.get(key) ?? [];
    const now = Date.now();
    const windowStart = now - config.failureWindowMs;

    // Count failures in window
    const failuresInWindow = timestamps.filter((t) => t >= windowStart);
    const lastFailureTime =
      timestamps.length > 0
        ? new Date(timestamps[timestamps.length - 1])
        : null;

    return Promise.resolve({
      state: entry?.state ?? 'CLOSED',
      failureCount: failuresInWindow.length,
      successCount: this.localSuccessCounts.get(key) ?? 0,
      lastFailureTime,
      lastStateChange: entry ? new Date(entry.changedAt) : null,
    });
  }

  /**
   * Execute operation with circuit breaker protection
   */
  async execute<T>(
    provider: PaymentProvider,
    operation: string,
    fn: () => Promise<T>,
    fallback?: () => Promise<T>,
  ): Promise<T> {
    const key = this.getKey(provider, operation);
    const config = this.getConfig(provider);
    const state = await this.getState(provider, operation);

    // If OPEN, reject or use fallback
    if (state === 'OPEN') {
      this.logger.warn(`Circuit OPEN for ${provider}:${operation}`);
      return this.handleOpenState(provider, operation, fallback, config);
    }

    // If HALF_OPEN, acquire lock before testing
    if (state === 'HALF_OPEN') {
      return this.handleHalfOpenState(
        provider,
        operation,
        fn,
        fallback,
        config,
      );
    }

    // CLOSED - normal execution
    return this.executeInClosedState(provider, operation, fn, fallback, config);
  }

  private async handleOpenState<T>(
    provider: PaymentProvider,
    operation: string,
    fallback: (() => Promise<T>) | undefined,
    config: CircuitBreakerConfig,
  ): Promise<T> {
    const stats = await this.getStats(provider, operation);

    if (fallback) {
      this.logger.log(
        `Using fallback for ${provider}:${operation} (circuit OPEN)`,
      );
      const result = await fallback();
      return result;
    }

    throw new CircuitOpenError(provider, operation, stats);
  }

  private async handleHalfOpenState<T>(
    provider: PaymentProvider,
    operation: string,
    fn: () => Promise<T>,
    fallback: (() => Promise<T>) | undefined,
    config: CircuitBreakerConfig,
  ): Promise<T> {
    const key = this.getKey(provider, operation);

    // Generate unique lock ID
    const lockId = await this.generateLockId();

    // Try to acquire lock for testing
    const acquired = this.redisClient
      ? await this.acquireRedisLock(key, lockId, config)
      : this.acquireLocalLock(key, lockId, config);

    if (!acquired) {
      // Another request is testing - wait or use fallback
      this.logger.debug(
        `Another request is testing circuit for ${provider}:${operation}`,
      );
      if (fallback) {
        return fallback();
      }
      // Wait for test result
      return this.waitForTestResult(provider, operation, fn, config);
    }

    try {
      this.logger.log(
        `Testing circuit for ${provider}:${operation} (HALF_OPEN)`,
      );
      const result = await fn();

      // Success in HALF_OPEN
      await this.recordHalfOpenSuccess(provider, operation, config);

      return result;
    } catch (error) {
      // Failure in HALF_OPEN
      if (this.shouldTriggerCircuit(error)) {
        await this.recordHalfOpenFailure(provider, operation, config);
      }

      throw error;
    } finally {
      // Release lock
      await this.releaseLock(key, lockId);
    }
  }

  /**
   * Generate unique lock ID using Redis TIME if available
   */
  private async generateLockId(): Promise<string> {
    if (this.redisClient) {
      const timeResult = await this.redisClient.time();
      const seconds = typeof timeResult[0] === 'string' ? timeResult[0] : String(timeResult[0]);
      const ms = Math.floor((typeof timeResult[1] === 'string' ? parseInt(timeResult[1], 10) : timeResult[1]) / 1000);
      return `${seconds}:${ms}:${Math.random().toString(36).slice(2)}`;
    }
    return `${Date.now()}:${Math.random().toString(36).slice(2)}`;
  }

  private async acquireRedisLock(
    key: string,
    lockId: string,
    config: CircuitBreakerConfig,
  ): Promise<boolean> {
    const lockKey = `${key}:lock`;
    const result = await this.redisClient!.set(
      lockKey,
      lockId,
      'PX',
      config.halfOpenLockTimeoutMs,
      'NX',
    );
    return result === 'OK';
  }

  private acquireLocalLock(
    key: string,
    lockId: string,
    config: CircuitBreakerConfig,
  ): boolean {
    const existing = this.localLocks.get(key);
    const now = Date.now();

    if (existing && now - existing.acquiredAt < config.halfOpenLockTimeoutMs) {
      return false;
    }

    this.localLocks.set(key, { acquiredAt: now, holder: lockId });
    return true;
  }

  private async releaseLock(key: string, lockId: string): Promise<void> {
    if (this.redisClient) {
      // Use Lua script for atomic check-and-delete
      const script = `
        if redis.call('GET', KEYS[1]) == ARGV[1] then
          return redis.call('DEL', KEYS[1])
        else
          return 0
        end
      `;
      await this.redisClient.eval(script, 1, `${key}:lock`, lockId);
    } else {
      const existing = this.localLocks.get(key);
      if (existing?.holder === lockId) {
        this.localLocks.delete(key);
      }
    }
  }

  private async waitForTestResult<T>(
    provider: PaymentProvider,
    operation: string,
    fn: () => Promise<T>,
    config: CircuitBreakerConfig,
  ): Promise<T> {
    const key = this.getKey(provider, operation);
    const startTime = Date.now();
    const pollInterval = 100;

    while (Date.now() - startTime < config.halfOpenLockTimeoutMs) {
      await this.sleep(pollInterval);
      const state = await this.getState(provider, operation);

      if (state === 'CLOSED') {
        // Circuit closed, proceed with operation
        return fn();
      }

      if (state === 'OPEN') {
        // Circuit opened again, fail
        const stats = await this.getStats(provider, operation);
        throw new CircuitOpenError(provider, operation, stats);
      }

      // Still HALF_OPEN - check if lock is released
      const lockHeld = this.redisClient
        ? await this.redisClient.exists(`${key}:lock`)
        : this.localLocks.has(key);

      if (!lockHeld) {
        // Lock released, try to acquire and test
        return this.handleHalfOpenState(
          provider,
          operation,
          fn,
          undefined,
          config,
        );
      }
    }

    // Timeout waiting for test result
    throw new CircuitOpenError(
      provider,
      operation,
      await this.getStats(provider, operation),
    );
  }

  private async executeInClosedState<T>(
    provider: PaymentProvider,
    operation: string,
    fn: () => Promise<T>,
    fallback: (() => Promise<T>) | undefined,
    config: CircuitBreakerConfig,
  ): Promise<T> {
    try {
      const result = await fn();

      // Success - reset failure count
      await this.recordSuccess(provider, operation, config);

      return result;
    } catch (error) {
      // Only record failure if it should trigger circuit
      if (this.shouldTriggerCircuit(error)) {
        await this.recordFailure(provider, operation, config);
      } else {
        this.logger.debug(
          `Error ${error instanceof PaymentError ? error.code : 'unknown'} not triggering circuit for ${provider}:${operation}`,
        );
      }

      throw error;
    }
  }

  private async recordSuccess(
    provider: PaymentProvider,
    operation: string,
    config: CircuitBreakerConfig,
  ): Promise<void> {
    const key = this.getKey(provider, operation);

    if (this.redisClient) {
      // Clear failure window on success (atomic with Lua)
      const script = `
        redis.call('DEL', KEYS[1] .. ':failures')
        return 1
      `;
      await this.redisClient.eval(script, 1, key);
    } else {
      this.localFailureTimestamps.delete(key);
    }
  }

  /**
   * Record failure using atomic Lua script with Redis TIME
   */
  private async recordFailure(
    provider: PaymentProvider,
    operation: string,
    config: CircuitBreakerConfig,
  ): Promise<void> {
    const key = this.getKey(provider, operation);

    if (this.redisClient && this.scriptShas.recordFailure) {
      // Use atomic Lua script
      const result = (await this.redisClient.evalsha(
        this.scriptShas.recordFailure,
        1,
        key,
        config.failureThreshold.toString(),
        config.failureWindowMs.toString(),
        Math.ceil(config.stateTtlMs / 1000).toString(),
      )) as [number, number, number];

      const [failureCount, shouldOpen, redisTimeMs] = result;

      if (shouldOpen === 1) {
        await this.transitionToOpenWithScript(key, config);
        this.logger.warn(
          `Circuit OPEN for ${provider}:${operation} after ${failureCount} failures (Redis time: ${redisTimeMs})`,
        );
      }
    } else if (this.redisClient) {
      // Fallback without Lua script - still use Redis TIME
      await this.recordFailureFallback(key, provider, operation, config);
    } else {
      // Local implementation
      this.recordFailureLocal(key, provider, operation, config);
    }
  }

  /**
   * Fallback failure recording without Lua script
   * Uses Redis TIME for consistency
   */
  private async recordFailureFallback(
    key: string,
    provider: PaymentProvider,
    operation: string,
    config: CircuitBreakerConfig,
  ): Promise<void> {
    // Get Redis time
    const timeResult = await this.redisClient!.time();
    const nowMs = parseRedisTime(timeResult);
    const windowStartMs = nowMs - config.failureWindowMs;

    // Use transaction for atomicity
    const multi = this.redisClient!.multi();
    multi.zadd(
      `${key}:failures`,
      nowMs,
      `${nowMs}:${Math.random().toString(36).slice(2)}`,
    );
    multi.zremrangebyscore(`${key}:failures`, '-inf', windowStartMs);
    multi.pexpire(`${key}:failures`, config.failureWindowMs);
    multi.zcard(`${key}:failures`);

    const results = (await multi.exec()) as [Error | null, unknown][];
    const failureCount = results[3][1] as number;

    if (failureCount >= config.failureThreshold) {
      await this.transitionToOpenFallback(key, config, nowMs);
      this.logger.warn(
        `Circuit OPEN for ${provider}:${operation} after ${failureCount} failures`,
      );
    }
  }

  private recordFailureLocal(
    key: string,
    provider: PaymentProvider,
    operation: string,
    config: CircuitBreakerConfig,
  ): void {
    const now = Date.now();
    const timestamps = this.localFailureTimestamps.get(key) ?? [];
    const windowStart = now - config.failureWindowMs;

    // Add new failure and filter old ones
    timestamps.push(now);
    const filtered = timestamps.filter((t) => t >= windowStart);
    this.localFailureTimestamps.set(key, filtered);

    if (filtered.length >= config.failureThreshold) {
      this.localState.set(key, { state: 'OPEN', changedAt: now });
      this.logger.warn(
        `Circuit OPEN for ${provider}:${operation} after ${filtered.length} failures`,
      );
    }
  }

  private async recordHalfOpenSuccess(
    provider: PaymentProvider,
    operation: string,
    config: CircuitBreakerConfig,
  ): Promise<void> {
    const key = this.getKey(provider, operation);

    if (this.redisClient && this.scriptShas.recordHalfOpenSuccess) {
      const result = (await this.redisClient.evalsha(
        this.scriptShas.recordHalfOpenSuccess,
        1,
        key,
        config.successThreshold.toString(),
        Math.ceil(config.stateTtlMs / 1000).toString(),
      )) as [number, number];

      const [successCount, shouldClose] = result;

      if (shouldClose === 1) {
        await this.transitionToClosedWithScript(key, config);
        this.logger.log(
          `Circuit CLOSED for ${provider}:${operation} after ${successCount} successes`,
        );
      } else {
        this.logger.debug(
          `Half-open success ${successCount}/${config.successThreshold} for ${provider}:${operation}`,
        );
      }
    } else if (this.redisClient) {
      const successCount = await this.redisClient.incr(`${key}:successCount`);

      if (successCount >= config.successThreshold) {
        await this.transitionToClosedFallback(key, config);
        this.logger.log(
          `Circuit CLOSED for ${provider}:${operation} after ${successCount} successes`,
        );
      }
    } else {
      const count = (this.localSuccessCounts.get(key) ?? 0) + 1;
      this.localSuccessCounts.set(key, count);

      if (count >= config.successThreshold) {
        this.localState.set(key, { state: 'CLOSED', changedAt: Date.now() });
        this.localFailureTimestamps.delete(key);
        this.localSuccessCounts.delete(key);
        this.logger.log(
          `Circuit CLOSED for ${provider}:${operation} after ${count} successes`,
        );
      }
    }
  }

  private async recordHalfOpenFailure(
    provider: PaymentProvider,
    operation: string,
    config: CircuitBreakerConfig,
  ): Promise<void> {
    const key = this.getKey(provider, operation);

    if (this.redisClient && this.scriptShas.transitionToOpen) {
      await this.transitionToOpenWithScript(key, config);
    } else if (this.redisClient) {
      await this.transitionToOpenFallback(key, config);
    } else {
      this.localState.set(key, { state: 'OPEN', changedAt: Date.now() });
    }
    this.logger.warn(
      `Circuit back to OPEN for ${provider}:${operation} after HALF_OPEN failure`,
    );
  }

  private async transitionToOpenWithScript(
    key: string,
    config: CircuitBreakerConfig,
  ): Promise<void> {
    await this.redisClient!.evalsha(
      this.scriptShas.transitionToOpen!,
      1,
      key,
      Math.ceil(config.stateTtlMs / 1000).toString(),
    );
  }

  private async transitionToOpenFallback(
    key: string,
    config: CircuitBreakerConfig,
    nowMs?: number,
  ): Promise<void> {
    // Get Redis time if not provided
    let timestamp = nowMs;
    if (!timestamp) {
      const timeResult = await this.redisClient!.time();
      timestamp = parseRedisTime(timeResult);
    }

    await this.redisClient!.multi()
      .set(`${key}:state`, 'OPEN', 'EX', Math.ceil(config.stateTtlMs / 1000))
      .set(
        `${key}:changedAt`,
        timestamp.toString(),
        'EX',
        Math.ceil(config.stateTtlMs / 1000),
      )
      .set(
        `${key}:successCount`,
        '0',
        'EX',
        Math.ceil(config.stateTtlMs / 1000),
      )
      .exec();
  }

  private async transitionToClosedWithScript(
    key: string,
    config: CircuitBreakerConfig,
  ): Promise<void> {
    await this.redisClient!.evalsha(
      this.scriptShas.transitionToClosed!,
      1,
      key,
      Math.ceil(config.stateTtlMs / 1000).toString(),
    );
  }

  private async transitionToClosedFallback(
    key: string,
    config: CircuitBreakerConfig,
  ): Promise<void> {
    // Get Redis time
    const timeResult = await this.redisClient!.time();
    const nowMs = parseRedisTime(timeResult);

    await this.redisClient!.multi()
      .set(`${key}:state`, 'CLOSED', 'EX', Math.ceil(config.stateTtlMs / 1000))
      .set(
        `${key}:changedAt`,
        nowMs.toString(),
        'EX',
        Math.ceil(config.stateTtlMs / 1000),
      )
      .del(`${key}:failures`)
      .set(
        `${key}:successCount`,
        '0',
        'EX',
        Math.ceil(config.stateTtlMs / 1000),
      )
      .exec();
  }

  /**
   * Reset circuit breaker state
   */
  async reset(provider: PaymentProvider, operation?: string): Promise<void> {
    const resetKey = async (key: string) => {
      if (this.redisClient) {
        await this.redisClient.del(
          `${key}:state`,
          `${key}:changedAt`,
          `${key}:failures`,
          `${key}:successCount`,
          `${key}:lock`,
        );
      }
      this.localState.delete(key);
      this.localFailureTimestamps.delete(key);
      this.localSuccessCounts.delete(key);
      this.localLocks.delete(key);
    };

    if (operation) {
      await resetKey(this.getKey(provider, operation));
      this.logger.log(`Circuit reset for ${provider}:${operation}`);
    } else {
      // Reset all operations for this provider
      if (this.redisClient) {
        const pattern = `circuit:${provider}:*`;
        const keys = await this.redisClient.keys(pattern);
        for (const key of keys) {
          const baseKey = key.replace(
            /:(state|changedAt|failures|successCount|lock)$/,
            '',
          );
          await resetKey(baseKey);
        }
      } else {
        for (const key of this.localState.keys()) {
          if (key.startsWith(`circuit:${provider}:`)) {
            await resetKey(key);
          }
        }
      }
      this.logger.log(`All circuits reset for ${provider}`);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
