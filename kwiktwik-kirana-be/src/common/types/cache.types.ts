/**
 * Cache types for Redis operations
 * These types provide type safety for caching operations
 */

/**
 * Generic cache operations interface
 * Implement this for any cache provider (Redis, in-memory, etc.)
 */
export interface CacheProvider {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
  flush(): Promise<void>;
}

/**
 * Cache entry with metadata
 */
export interface CacheEntry<T> {
  data: T;
  createdAt: number;
  expiresAt?: number;
  tags?: string[];
}

/**
 * Cache options for set operations
 */
export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  tags?: string[]; // Cache tags for invalidation
  namespace?: string; // Key prefix
}

/**
 * Redis-specific cache configuration
 */
export interface RedisCacheConfig {
  host?: string;
  port?: number;
  url?: string;
  password?: string;
  db?: number;
  keyPrefix?: string;
  defaultTTL?: number;
}

/**
 * Cache statistics
 */
export interface CacheStats {
  hits: number;
  misses: number;
  keys: number;
  memoryUsage?: number;
}

/**
 * Typed cache wrapper for type-safe caching
 */
export interface TypedCache<T> {
  get(key: string): Promise<T | null>;
  set(key: string, value: T, options?: CacheOptions): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
}

/**
 * Queue message structure for Redis queues
 */
export interface QueueMessage<T = unknown> {
  id: string;
  payload: T;
  timestamp: number;
  attempts?: number;
  maxAttempts?: number;
}

/**
 * Rate limit entry
 */
export interface RateLimitEntry {
  count: number;
  windowStart: number;
  windowEnd: number;
}

/**
 * Session cache data structure
 */
export interface SessionCacheData {
  userId: string;
  sessionId: string;
  deviceInfo?: Record<string, unknown>;
  lastActivity: number;
  expiresAt: number;
}

/**
 * App cache data structure
 */
export interface AppCacheData {
  apiKey: string;
  config: Record<string, unknown>;
  updatedAt: number;
}
