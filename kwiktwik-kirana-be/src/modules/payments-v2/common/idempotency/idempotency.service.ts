/**
 * Idempotency Service
 * 
 * Ensures that operations can be safely retried without causing duplicate effects.
 * Supports both in-memory (development) and database-backed (production) storage.
 */

import { Injectable, Logger, Inject, Optional } from '@nestjs/common';

// ============================================================================
// Idempotency Key Types
// ============================================================================

/**
 * Idempotency key with metadata
 */
export interface IdempotencyKey {
  /** Unique key identifier */
  readonly key: string;
  /** Type of operation */
  readonly operationType: IdempotencyOperationType;
  /** Provider (if applicable) */
  readonly provider?: string;
  /** App ID (if applicable) */
  readonly appId?: string;
  /** Original request hash for validation */
  readonly requestHash: string;
  /** Current status */
  readonly status: IdempotencyStatus;
  /** Stored result (if completed) */
  readonly result?: unknown;
  /** Created timestamp */
  readonly createdAt: Date;
  /** Expiration timestamp */
  readonly expiresAt: Date;
}

/**
 * Types of operations that support idempotency
 */
export const IdempotencyOperationType = {
  /** Subscription setup */
  SUBSCRIPTION_SETUP: 'SUBSCRIPTION_SETUP',
  /** Subscription charge */
  SUBSCRIPTION_CHARGE: 'SUBSCRIPTION_CHARGE',
  /** Subscription cancellation */
  SUBSCRIPTION_CANCEL: 'SUBSCRIPTION_CANCEL',
  /** Subscription pause */
  SUBSCRIPTION_PAUSE: 'SUBSCRIPTION_PAUSE',
  /** Subscription resume */
  SUBSCRIPTION_RESUME: 'SUBSCRIPTION_RESUME',
  /** Payment refund */
  PAYMENT_REFUND: 'PAYMENT_REFUND',
  /** Webhook processing */
  WEBHOOK_PROCESS: 'WEBHOOK_PROCESS',
  /** Order creation */
  ORDER_CREATE: 'ORDER_CREATE',
} as const;

export type IdempotencyOperationType = typeof IdempotencyOperationType[keyof typeof IdempotencyOperationType];

/**
 * Status of an idempotency key
 */
export const IdempotencyStatus = {
  /** Operation is in progress */
  IN_PROGRESS: 'IN_PROGRESS',
  /** Operation completed successfully */
  COMPLETED: 'COMPLETED',
  /** Operation failed */
  FAILED: 'FAILED',
  /** Key expired without completion */
  EXPIRED: 'EXPIRED',
} as const;

export type IdempotencyStatus = typeof IdempotencyStatus[keyof typeof IdempotencyStatus];

// ============================================================================
// Idempotency Store Interface
// ============================================================================

/**
 * Interface for idempotency key storage
 */
export interface IdempotencyStore {
  /**
   * Get an existing idempotency key
   */
  get(key: string): Promise<IdempotencyKey | null>;

  /**
   * Create a new idempotency key (fails if exists)
   */
  create(params: CreateIdempotencyKeyParams): Promise<IdempotencyKey>;

  /**
   * Update an existing idempotency key
   */
  update(key: string, updates: UpdateIdempotencyKeyParams): Promise<IdempotencyKey>;

  /**
   * Delete an idempotency key
   */
  delete(key: string): Promise<void>;

  /**
   * Check if a key exists
   */
  exists(key: string): Promise<boolean>;

  /**
   * Acquire a lock for the key (for distributed systems)
   */
  acquireLock?(key: string, ttlMs: number): Promise<boolean>;

  /**
   * Release a lock for the key
   */
  releaseLock?(key: string): Promise<void>;

  /**
   * Clean up expired keys
   */
  cleanupExpired?(): Promise<number>;
}

/**
 * Parameters for creating an idempotency key
 */
export interface CreateIdempotencyKeyParams {
  readonly key: string;
  readonly operationType: IdempotencyOperationType;
  readonly provider?: string;
  readonly appId?: string;
  readonly requestHash: string;
  readonly ttlMs?: number;
}

/**
 * Parameters for updating an idempotency key
 */
export interface UpdateIdempotencyKeyParams {
  readonly status: IdempotencyStatus;
  readonly result?: unknown;
}

// ============================================================================
// In-Memory Idempotency Store
// ============================================================================

/**
 * In-memory idempotency store for development/testing
 */
@Injectable()
export class InMemoryIdempotencyStore implements IdempotencyStore {
  private readonly store = new Map<string, IdempotencyKey>();
  private readonly locks = new Map<string, NodeJS.Timeout>();

  async get(key: string): Promise<IdempotencyKey | null> {
    const entry = this.store.get(key);
    if (!entry) return null;

    // Check if expired
    if (entry.expiresAt < new Date()) {
      this.store.delete(key);
      return null;
    }

    return entry;
  }

  async create(params: CreateIdempotencyKeyParams): Promise<IdempotencyKey> {
    const existing = await this.get(params.key);
    if (existing) {
      throw new IdempotencyKeyExistsError(params.key);
    }

    const now = new Date();
    const ttlMs = params.ttlMs ?? 24 * 60 * 60 * 1000; // Default 24 hours

    const entry: IdempotencyKey = {
      key: params.key,
      operationType: params.operationType,
      provider: params.provider,
      appId: params.appId,
      requestHash: params.requestHash,
      status: IdempotencyStatus.IN_PROGRESS,
      createdAt: now,
      expiresAt: new Date(now.getTime() + ttlMs),
    };

    this.store.set(params.key, entry);
    return entry;
  }

  async update(key: string, updates: UpdateIdempotencyKeyParams): Promise<IdempotencyKey> {
    const existing = await this.get(key);
    if (!existing) {
      throw new IdempotencyKeyNotFoundError(key);
    }

    const updated: IdempotencyKey = {
      ...existing,
      status: updates.status,
      result: updates.result,
    };

    this.store.set(key, updated);
    return updated;
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
    this.locks.delete(key);
  }

  async exists(key: string): Promise<boolean> {
    const entry = await this.get(key);
    return entry !== null;
  }

  async acquireLock(key: string, ttlMs: number): Promise<boolean> {
    const existing = this.locks.get(key);
    if (existing) {
      return false;
    }

    const timeout = setTimeout(() => {
      this.locks.delete(key);
    }, ttlMs);

    this.locks.set(key, timeout);
    return true;
  }

  async releaseLock(key: string): Promise<void> {
    const timeout = this.locks.get(key);
    if (timeout) {
      clearTimeout(timeout);
      this.locks.delete(key);
    }
  }

  async cleanupExpired(): Promise<number> {
    const now = new Date();
    let cleaned = 0;

    for (const [key, entry] of this.store.entries()) {
      if (entry.expiresAt < now) {
        this.store.delete(key);
        cleaned++;
      }
    }

    return cleaned;
  }
}

// ============================================================================
// Idempotency Service
// ============================================================================

/**
 * Result of executing an idempotent operation
 */
export interface IdempotentResult<T> {
  /** Whether this was a cached result */
  readonly cached: boolean;
  /** The operation result */
  readonly result: T;
  /** Idempotency key used */
  readonly key: string;
  /** Status of the key */
  readonly status: IdempotencyStatus;
}

/**
 * Options for idempotent execution
 */
export interface IdempotentOptions {
  /** Time-to-live in milliseconds */
  readonly ttlMs?: number;
  /** Whether to return cached results on failure */
  readonly returnCachedOnFailure?: boolean;
  /** Maximum time to wait for in-progress operations */
  readonly waitForInProgressMs?: number;
  /** Custom key generator */
  readonly keyGenerator?: () => string;
}

/**
 * Idempotency service for ensuring exactly-once execution
 */
@Injectable()
export class IdempotencyService {
  private readonly logger = new Logger(IdempotencyService.name);
  private store: IdempotencyStore;

  constructor(
    @Optional()
    @Inject('IdempotencyStore')
    store?: IdempotencyStore,
  ) {
    this.store = store ?? new InMemoryIdempotencyStore();
  }

  /**
   * Set the idempotency store
   */
  setStore(store: IdempotencyStore): void {
    this.store = store;
  }

  /**
   * Execute an operation idempotently
   * 
   * If the operation has already been executed with the same key,
   * returns the cached result instead of re-executing.
   */
  async execute<T>(
    key: string,
    operationType: IdempotencyOperationType,
    operation: () => Promise<T>,
    requestHash: string,
    options?: IdempotentOptions & {
      readonly provider?: string;
      readonly appId?: string;
    },
  ): Promise<IdempotentResult<T>> {
    // Check for existing key
    const existing = await this.store.get(key);

    if (existing) {
      // Validate request hash matches
      if (existing.requestHash !== requestHash) {
        throw new IdempotencyRequestMismatchError(key, existing.requestHash, requestHash);
      }

      // If completed, return cached result
      if (existing.status === IdempotencyStatus.COMPLETED) {
        this.logger.debug(`Returning cached result for key: ${key}`);
        return {
          cached: true,
          result: existing.result as T,
          key,
          status: existing.status,
        };
      }

      // If failed, check if we should retry
      if (existing.status === IdempotencyStatus.FAILED) {
        if (options?.returnCachedOnFailure) {
          return {
            cached: true,
            result: existing.result as T,
            key,
            status: existing.status,
          };
        }
        // Allow retry by continuing
      }

      // If in progress, wait or throw
      if (existing.status === IdempotencyStatus.IN_PROGRESS) {
        const waitMs = options?.waitForInProgressMs ?? 5000;
        const waited = await this.waitForCompletion(key, waitMs);
        if (waited) {
          const completed = await this.store.get(key);
          if (completed && completed.status === IdempotencyStatus.COMPLETED) {
            return {
              cached: true,
              result: completed.result as T,
              key,
              status: completed.status,
            };
          }
        }
        throw new IdempotencyOperationInProgressError(key);
      }
    }

    // Create new key
    try {
      await this.store.create({
        key,
        operationType,
        provider: options?.provider,
        appId: options?.appId,
        requestHash,
        ttlMs: options?.ttlMs,
      });
    } catch (error) {
      if (error instanceof IdempotencyKeyExistsError) {
        // Race condition - another process created the key
        // Wait and return their result
        const waited = await this.waitForCompletion(key, options?.waitForInProgressMs ?? 5000);
        if (waited) {
          const completed = await this.store.get(key);
          if (completed) {
            return {
              cached: true,
              result: completed.result as T,
              key,
              status: completed.status,
            };
          }
        }
      }
      throw error;
    }

    // Execute the operation
    try {
      const result = await operation();

      // Update key with success
      await this.store.update(key, {
        status: IdempotencyStatus.COMPLETED,
        result,
      });

      return {
        cached: false,
        result,
        key,
        status: IdempotencyStatus.COMPLETED,
      };
    } catch (error) {
      // Update key with failure
      await this.store.update(key, {
        status: IdempotencyStatus.FAILED,
        result: error instanceof Error ? error.message : String(error),
      });

      throw error;
    }
  }

  /**
   * Check if a key exists and is completed
   */
  async isCompleted(key: string): Promise<boolean> {
    const entry = await this.store.get(key);
    return entry?.status === IdempotencyStatus.COMPLETED;
  }

  /**
   * Get the result for a completed key
   */
  async getResult<T>(key: string): Promise<T | null> {
    const entry = await this.store.get(key);
    if (entry?.status === IdempotencyStatus.COMPLETED) {
      return entry.result as T;
    }
    return null;
  }

  /**
   * Invalidate a key (for retry after failure)
   */
  async invalidate(key: string): Promise<void> {
    await this.store.delete(key);
  }

  /**
   * Generate a unique idempotency key
   */
  generateKey(operationType: IdempotencyOperationType, identifier: string): string {
    return `${operationType}:${identifier}`;
  }

  /**
   * Generate a request hash from parameters
   */
  generateRequestHash(params: Record<string, unknown>): string {
    const sorted = JSON.stringify(params, Object.keys(params).sort());
    return this.simpleHash(sorted);
  }

  /**
   * Wait for an in-progress operation to complete
   */
  private async waitForCompletion(key: string, timeoutMs: number): Promise<boolean> {
    const startTime = Date.now();
    const pollInterval = 100;

    while (Date.now() - startTime < timeoutMs) {
      const entry = await this.store.get(key);
      if (entry && entry.status !== IdempotencyStatus.IN_PROGRESS) {
        return true;
      }
      await this.sleep(pollInterval);
    }

    return false;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }
}

// ============================================================================
// Errors
// ============================================================================

/**
 * Error when idempotency key already exists
 */
export class IdempotencyKeyExistsError extends Error {
  constructor(key: string) {
    super(`Idempotency key already exists: ${key}`);
    this.name = 'IdempotencyKeyExistsError';
  }
}

/**
 * Error when idempotency key not found
 */
export class IdempotencyKeyNotFoundError extends Error {
  constructor(key: string) {
    super(`Idempotency key not found: ${key}`);
    this.name = 'IdempotencyKeyNotFoundError';
  }
}

/**
 * Error when request hash doesn't match existing key
 */
export class IdempotencyRequestMismatchError extends Error {
  constructor(key: string, expected: string, actual: string) {
    super(
      `Request hash mismatch for key ${key}: expected ${expected}, got ${actual}`,
    );
    this.name = 'IdempotencyRequestMismatchError';
  }
}

/**
 * Error when operation is in progress
 */
export class IdempotencyOperationInProgressError extends Error {
  constructor(key: string) {
    super(`Operation is in progress for key: ${key}`);
    this.name = 'IdempotencyOperationInProgressError';
  }
}
