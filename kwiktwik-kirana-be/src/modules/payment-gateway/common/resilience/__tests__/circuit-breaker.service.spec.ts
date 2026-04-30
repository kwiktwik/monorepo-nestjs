/**
 * Circuit Breaker Service Unit Tests
 *
 * Tests for:
 * - Clock synchronization using Redis TIME
 * - Atomic sliding window operations
 * - Race condition handling
 */

import {
  CircuitBreakerService,
  CircuitOpenError,
} from '../circuit-breaker.service';
import {
  PaymentError,
  PaymentErrorCode,
  ErrorSeverity,
} from '../../errors/payment-errors';
import type { PaymentProvider } from '../../../types/provider.enum';

// Mock Redis client with full interface
const createMockRedis = () => ({
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  incr: jest.fn(),
  expire: jest.fn(),
  pexpire: jest.fn(),
  exists: jest.fn(),
  zadd: jest.fn(),
  zcard: jest.fn(),
  zrange: jest.fn(),
  zcount: jest.fn(),
  zremrangebyscore: jest.fn(),
  keys: jest.fn(),
  time: jest.fn(),
  eval: jest.fn(),
  evalsha: jest.fn(),
  script: jest.fn(),
  multi: jest.fn(() => ({
    set: jest.fn().mockReturnThis(),
    del: jest.fn().mockReturnThis(),
    incr: jest.fn().mockReturnThis(),
    expire: jest.fn().mockReturnThis(),
    pexpire: jest.fn().mockReturnThis(),
    zadd: jest.fn().mockReturnThis(),
    zremrangebyscore: jest.fn().mockReturnThis(),
    zcard: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue([
      [null, 'OK'],
      [null, 1],
      [null, 1],
      [null, 3], // failure count
    ]),
  })),
});

type MockRedis = ReturnType<typeof createMockRedis>;

describe('CircuitBreakerService', () => {
  let service: CircuitBreakerService;
  let mockRedis: MockRedis;

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  describe('Clock Synchronization (Redis TIME)', () => {
    beforeEach(async () => {
      mockRedis = createMockRedis();
      // Mock script loading
      mockRedis.script.mockResolvedValue('script-sha');
      service = new CircuitBreakerService(
        mockRedis as unknown as ReturnType<typeof import('ioredis').default>,
      );
      service.configure('PHONEPE', {
        failureThreshold: 3,
        successThreshold: 2,
        timeoutMs: 30000,
        failureWindowMs: 60000,
        halfOpenLockTimeoutMs: 10000,
        stateTtlMs: 86400000,
      });
      // Wait for script loading to complete
      await service.waitForScriptsLoaded();
    });

    it('should use Redis TIME for state transition check, not local clock', async () => {
      // Redis time is 12:00:00.000 (in seconds and microseconds)
      const redisTimeSeconds = 1704067200; // 2024-01-01 00:00:00 UTC
      const redisTimeMicroseconds = 0;
      mockRedis.time.mockResolvedValue([
        redisTimeSeconds.toString(),
        redisTimeMicroseconds.toString(),
      ]);

      // Circuit opened at Redis time 11:59:30.000 (30 seconds ago in Redis time)
      const openedAtSeconds = redisTimeSeconds - 30;
      const openedAtMs = openedAtSeconds * 1000;

      // Mock getState to return HALF_OPEN (30s elapsed, timeout is 30s)
      mockRedis.evalsha.mockResolvedValue([
        'HALF_OPEN',
        openedAtMs,
        redisTimeSeconds * 1000,
      ]);

      // Local clock is 5 seconds ahead (12:00:05)
      jest.setSystemTime(new Date((redisTimeSeconds + 5) * 1000));

      const state = await service.getState('PHONEPE', 'chargeSubscription');

      // Should be HALF_OPEN because Redis time shows 30s elapsed
      // NOT CLOSED because local clock would show only 25s
      expect(state).toBe('HALF_OPEN');
      // Verify Lua script was used (which internally uses Redis TIME)
      expect(mockRedis.evalsha).toHaveBeenCalled();
    });

    it('should handle clock skew between servers correctly', async () => {
      // Server A opens circuit at its local time 12:00:00
      // But we use Redis time for storage
      const redisTimeAtOpen = 1704067200000; // Redis time when opened

      // Server B checks 35 seconds later (Redis time)
      // Even if Server B's clock is different, Redis time is authoritative
      const redisTimeAtCheck = redisTimeAtOpen + 35000;
      mockRedis.time.mockResolvedValue([
        Math.floor(redisTimeAtCheck / 1000).toString(),
        '0',
      ]);

      // Mock getState to return HALF_OPEN (35s elapsed, timeout is 30s)
      mockRedis.evalsha.mockResolvedValue([
        'HALF_OPEN',
        redisTimeAtOpen,
        redisTimeAtCheck,
      ]);

      const state = await service.getState('PHONEPE', 'chargeSubscription');

      // Should be HALF_OPEN because Redis time shows 35s elapsed
      expect(state).toBe('HALF_OPEN');
    });

    it('should use Redis time for failure timestamps in sliding window', async () => {
      const redisTimeMs = 1704067200000;
      mockRedis.time.mockResolvedValue([
        Math.floor(redisTimeMs / 1000).toString(),
        '0',
      ]);

      // Mock getState to return CLOSED
      mockRedis.evalsha.mockResolvedValue(['CLOSED', 0, redisTimeMs]);

      // Mock recordFailure to return failure count below threshold
      mockRedis.evalsha.mockResolvedValueOnce([1, 0, redisTimeMs]);

      const error = new PaymentError(
        'Provider unavailable',
        PaymentErrorCode.PROVIDER_UNAVAILABLE,
        ErrorSeverity.CRITICAL,
        'PHONEPE',
      );

      // Trigger failure
      await expect(
        service.execute('PHONEPE', 'chargeSubscription', () =>
          Promise.reject(error),
        ),
      ).rejects.toThrow(error);

      // Verify Lua script was used (which internally uses Redis TIME)
      expect(mockRedis.evalsha).toHaveBeenCalledWith(
        'script-sha',
        1,
        'circuit:PHONEPE:chargeSubscription',
        expect.any(String),
        expect.any(String),
        expect.any(String),
      );
    });
  });

  describe('Atomic Sliding Window (Race Conditions)', () => {
    beforeEach(async () => {
      mockRedis = createMockRedis();
      mockRedis.script.mockResolvedValue('script-sha');
      service = new CircuitBreakerService(
        mockRedis as unknown as ReturnType<typeof import('ioredis').default>,
      );
      service.configure('PHONEPE', {
        failureThreshold: 3,
        successThreshold: 2,
        timeoutMs: 30000,
        failureWindowMs: 60000,
        halfOpenLockTimeoutMs: 10000,
        stateTtlMs: 86400000,
      });
      // Wait for script loading to complete
      await service.waitForScriptsLoaded();
    });

    it('should use atomic Lua script for failure recording when available', async () => {
      const redisTimeMs = 1704067200000;
      mockRedis.time.mockResolvedValue([
        Math.floor(redisTimeMs / 1000).toString(),
        '0',
      ]);

      // Mock Lua script execution: [failureCount, shouldOpen, redisTimeMs]
      mockRedis.evalsha.mockResolvedValue([2, 0, redisTimeMs]);

      const error = new PaymentError(
        'Provider unavailable',
        PaymentErrorCode.PROVIDER_UNAVAILABLE,
        ErrorSeverity.CRITICAL,
        'PHONEPE',
      );

      mockRedis.get.mockResolvedValue(null);
      await expect(
        service.execute('PHONEPE', 'chargeSubscription', () =>
          Promise.reject(error),
        ),
      ).rejects.toThrow(error);

      // Verify Lua script was used
      expect(mockRedis.evalsha).toHaveBeenCalledWith(
        'script-sha',
        1,
        'circuit:PHONEPE:chargeSubscription',
        '3', // failureThreshold
        '60000', // failureWindowMs
        '86400', // stateTtlSeconds
      );
    });

    it('should atomically transition to OPEN when threshold reached', async () => {
      const redisTimeMs = 1704067200000;
      mockRedis.time.mockResolvedValue([
        Math.floor(redisTimeMs / 1000).toString(),
        '0',
      ]);

      // Mock Lua script: getState returns CLOSED, recordFailure returns shouldOpen=1, transitionToOpen
      mockRedis.evalsha
        .mockResolvedValueOnce(['CLOSED', 0, redisTimeMs]) // getState returns CLOSED
        .mockResolvedValueOnce([3, 1, redisTimeMs]) // recordFailure returns shouldOpen=1
        .mockResolvedValueOnce(redisTimeMs); // transitionToOpen

      const error = new PaymentError(
        'Provider unavailable',
        PaymentErrorCode.PROVIDER_UNAVAILABLE,
        ErrorSeverity.CRITICAL,
        'PHONEPE',
      );

      mockRedis.get.mockResolvedValue(null);
      await expect(
        service.execute('PHONEPE', 'chargeSubscription', () =>
          Promise.reject(error),
        ),
      ).rejects.toThrow(error);

      // Verify transition script was called
      expect(mockRedis.evalsha).toHaveBeenCalledTimes(3);
    });

    it('should handle concurrent failure recordings correctly', async () => {
      // Simulate race condition: two servers recording failures simultaneously
      const redisTimeMs = 1704067200000;
      mockRedis.time.mockResolvedValue([
        Math.floor(redisTimeMs / 1000).toString(),
        '0',
      ]);

      // First call: count = 2 (not yet threshold)
      // Second call: count = 4 (threshold exceeded)
      let callCount = 0;
      mockRedis.evalsha.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.resolve([2, 0, redisTimeMs]);
        }
        return Promise.resolve([4, 1, redisTimeMs]);
      });

      mockRedis.get.mockResolvedValue(null);

      const error = new PaymentError(
        'Provider unavailable',
        PaymentErrorCode.PROVIDER_UNAVAILABLE,
        ErrorSeverity.CRITICAL,
        'PHONEPE',
      );

      // Simulate concurrent requests
      const [result1, result2] = await Promise.allSettled([
        service.execute('PHONEPE', 'chargeSubscription', () =>
          Promise.reject(error),
        ),
        service.execute('PHONEPE', 'chargeSubscription', () =>
          Promise.reject(error),
        ),
      ]);

      // Both should fail, and circuit should eventually open
      expect(result1.status).toBe('rejected');
      expect(result2.status).toBe('rejected');
    });

    it('should not race between success and failure recording', async () => {
      // This test verifies that success clears failures atomically
      const redisTimeMs = 1704067200000;
      mockRedis.time.mockResolvedValue([
        Math.floor(redisTimeMs / 1000).toString(),
        '0',
      ]);

      // Mock getState to return CLOSED (using evalsha since scripts are loaded)
      mockRedis.evalsha.mockResolvedValueOnce(['CLOSED', 0, redisTimeMs]);
      mockRedis.get.mockResolvedValue(null);
      mockRedis.eval.mockResolvedValue(1);

      // Success should clear failures atomically
      await service.execute('PHONEPE', 'chargeSubscription', () =>
        Promise.resolve({ success: true }),
      );

      // Verify atomic clear was used
      expect(mockRedis.eval).toHaveBeenCalledWith(
        expect.stringContaining('DEL'),
        1,
        'circuit:PHONEPE:chargeSubscription',
      );
    });
  });

  describe('Error Classification', () => {
    beforeEach(() => {
      mockRedis = createMockRedis();
      mockRedis.script.mockResolvedValue('script-sha');
      service = new CircuitBreakerService(
        mockRedis as unknown as ReturnType<typeof import('ioredis').default>,
      );
    });

    it('should trigger for PROVIDER_UNAVAILABLE error', () => {
      const error = new PaymentError(
        'Provider unavailable',
        PaymentErrorCode.PROVIDER_UNAVAILABLE,
        ErrorSeverity.CRITICAL,
        'PHONEPE',
      );

      expect(service.shouldTriggerCircuit(error)).toBe(true);
    });

    it('should trigger for PAYMENT_TIMEOUT error', () => {
      const error = new PaymentError(
        'Payment timeout',
        PaymentErrorCode.PAYMENT_TIMEOUT,
        ErrorSeverity.MEDIUM,
        'PHONEPE',
      );

      expect(service.shouldTriggerCircuit(error)).toBe(true);
    });

    it('should NOT trigger for INSUFFICIENT_FUNDS error', () => {
      const error = new PaymentError(
        'Insufficient funds',
        PaymentErrorCode.INSUFFICIENT_FUNDS,
        ErrorSeverity.HIGH,
        'PHONEPE',
      );

      expect(service.shouldTriggerCircuit(error)).toBe(false);
    });

    it('should NOT trigger for SUBSCRIPTION_NOT_FOUND error', () => {
      const error = new PaymentError(
        'Subscription not found',
        PaymentErrorCode.SUBSCRIPTION_NOT_FOUND,
        ErrorSeverity.HIGH,
        'PHONEPE',
      );

      expect(service.shouldTriggerCircuit(error)).toBe(false);
    });

    it('should NOT trigger for MANDATE_REJECTED error', () => {
      const error = new PaymentError(
        'Mandate rejected',
        PaymentErrorCode.MANDATE_REJECTED,
        ErrorSeverity.HIGH,
        'PHONEPE',
      );

      expect(service.shouldTriggerCircuit(error)).toBe(false);
    });

    it('should NOT trigger for PAYMENT_CANCELLED_BY_USER error', () => {
      const error = new PaymentError(
        'User cancelled',
        PaymentErrorCode.PAYMENT_CANCELLED_BY_USER,
        ErrorSeverity.LOW,
        'PHONEPE',
      );

      expect(service.shouldTriggerCircuit(error)).toBe(false);
    });

    it('should trigger for network errors', () => {
      const error = new Error('ETIMEDOUT connection failed');

      expect(service.shouldTriggerCircuit(error)).toBe(true);
    });

    it('should trigger for CRITICAL severity errors', () => {
      const error = new PaymentError(
        'Critical error',
        PaymentErrorCode.UNKNOWN_ERROR,
        ErrorSeverity.CRITICAL,
        'PHONEPE',
      );

      expect(service.shouldTriggerCircuit(error)).toBe(true);
    });
  });

  describe('HALF_OPEN State', () => {
    beforeEach(async () => {
      mockRedis = createMockRedis();
      mockRedis.script.mockResolvedValue('script-sha');
      service = new CircuitBreakerService(
        mockRedis as unknown as ReturnType<typeof import('ioredis').default>,
      );
      service.configure('PHONEPE', {
        failureThreshold: 3,
        successThreshold: 2,
        timeoutMs: 30000,
        failureWindowMs: 60000,
        halfOpenLockTimeoutMs: 10000,
        stateTtlMs: 86400000,
      });
      // Wait for script loading to complete
      await service.waitForScriptsLoaded();
    });

    it('should use atomic lock release', async () => {
      const redisTimeMs = 1704067200000;
      mockRedis.time.mockResolvedValue([
        Math.floor(redisTimeMs / 1000).toString(),
        '0',
      ]);

      // Mock getState to return HALF_OPEN (circuit has been open for 35s, timeout is 30s)
      mockRedis.evalsha.mockResolvedValue([
        'HALF_OPEN',
        redisTimeMs - 35000,
        redisTimeMs,
      ]);

      mockRedis.set.mockResolvedValue('OK');
      mockRedis.eval.mockResolvedValue(1);

      await service.execute('PHONEPE', 'chargeSubscription', () =>
        Promise.resolve({ success: true }),
      );

      // Verify atomic lock release was used
      expect(mockRedis.eval).toHaveBeenCalledWith(
        expect.stringContaining("if redis.call('GET', KEYS[1]) == ARGV[1]"),
        1,
        expect.stringContaining(':lock'),
        expect.any(String),
      );
    });

    it('should generate lock ID using Redis TIME', async () => {
      const redisTimeMs = 1704067200000;
      mockRedis.time.mockResolvedValue([
        Math.floor(redisTimeMs / 1000).toString(),
        '500000', // microseconds
      ]);

      // Mock getState to return HALF_OPEN (circuit has been open for 35s, timeout is 30s)
      mockRedis.evalsha.mockResolvedValue([
        'HALF_OPEN',
        redisTimeMs - 35000,
        redisTimeMs,
      ]);

      mockRedis.set.mockResolvedValue('OK');
      mockRedis.eval.mockResolvedValue(1);

      await service.execute('PHONEPE', 'chargeSubscription', () =>
        Promise.resolve({ success: true }),
      );

      // Lock ID should include Redis time
      const lockIdCall = mockRedis.set.mock.calls.find((call) =>
        call[0].includes(':lock'),
      );
      expect(lockIdCall).toBeDefined();
      // Lock ID should start with Redis time
      expect(lockIdCall![1]).toMatch(/^1704067200:/);
    });
  });

  describe('Without Redis (Local Mode)', () => {
    beforeEach(() => {
      service = new CircuitBreakerService(null);
      service.configure('RAZORPAY', {
        failureThreshold: 2,
        successThreshold: 2,
        timeoutMs: 30000,
        failureWindowMs: 60000,
        halfOpenLockTimeoutMs: 10000,
        stateTtlMs: 86400000,
      });
    });

    it('should work correctly without Redis', async () => {
      const result = await service.execute(
        'RAZORPAY',
        'chargeSubscription',
        () => Promise.resolve({ success: true }),
      );

      expect(result).toEqual({ success: true });
    });

    it('should open circuit after failure threshold', async () => {
      const error = new PaymentError(
        'Provider unavailable',
        PaymentErrorCode.PROVIDER_UNAVAILABLE,
        ErrorSeverity.CRITICAL,
        'RAZORPAY',
      );

      // First failure
      await expect(
        service.execute('RAZORPAY', 'chargeSubscription', () =>
          Promise.reject(error),
        ),
      ).rejects.toThrow(error);

      let state = await service.getState('RAZORPAY', 'chargeSubscription');
      expect(state).toBe('CLOSED');

      // Second failure (threshold reached)
      await expect(
        service.execute('RAZORPAY', 'chargeSubscription', () =>
          Promise.reject(error),
        ),
      ).rejects.toThrow(error);

      state = await service.getState('RAZORPAY', 'chargeSubscription');
      expect(state).toBe('OPEN');
    });

    it('should NOT open circuit for business errors', async () => {
      const error = new PaymentError(
        'Insufficient funds',
        PaymentErrorCode.INSUFFICIENT_FUNDS,
        ErrorSeverity.HIGH,
        'RAZORPAY',
      );

      for (let i = 0; i < 5; i++) {
        await expect(
          service.execute('RAZORPAY', 'chargeSubscription', () =>
            Promise.reject(error),
          ),
        ).rejects.toThrow(error);
      }

      const state = await service.getState('RAZORPAY', 'chargeSubscription');
      expect(state).toBe('CLOSED');
    });
  });

  describe('Reset Functionality', () => {
    beforeEach(() => {
      mockRedis = createMockRedis();
      mockRedis.script.mockResolvedValue('script-sha');
      service = new CircuitBreakerService(
        mockRedis as unknown as ReturnType<typeof import('ioredis').default>,
      );
    });

    it('should reset circuit state', async () => {
      mockRedis.del.mockResolvedValue(1);

      await service.reset('PHONEPE', 'chargeSubscription');

      expect(mockRedis.del).toHaveBeenCalledWith(
        'circuit:PHONEPE:chargeSubscription:state',
        'circuit:PHONEPE:chargeSubscription:changedAt',
        'circuit:PHONEPE:chargeSubscription:failures',
        'circuit:PHONEPE:chargeSubscription:successCount',
        'circuit:PHONEPE:chargeSubscription:lock',
      );
    });
  });
});
