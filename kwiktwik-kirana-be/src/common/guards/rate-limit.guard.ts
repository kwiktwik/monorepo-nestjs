import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Logger,
  Optional,
  Inject,
  OnModuleDestroy,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request, Response } from 'express';
import { RedisService } from '../redis/redis.service';

// ============================================================================
// Configuration Types and Constants
// ============================================================================

/**
 * Rate Limit Configuration
 */
export interface RateLimitConfig {
  /** Maximum requests allowed in the window */
  readonly limit: number;
  /** Window duration in milliseconds */
  readonly windowMs: number;
  /** Key prefix for tracking */
  readonly keyPrefix: string;
  /** Whether to skip rate limiting in mock mode */
  readonly skipInMock?: boolean;
  /** Custom error message when rate limit exceeded */
  readonly errorMessage?: string;
}

/**
 * Rate Limit Configuration Options
 * All values can be overridden via environment variables
 */
export interface RateLimitOptions {
  /** Cleanup interval for in-memory store (ms) */
  readonly cleanupIntervalMs: number;
  /** Default error message */
  readonly defaultErrorMessage: string;
  /** Auth IP error message */
  readonly authIpErrorMessage: string;
  /** Auth phone error message */
  readonly authPhoneErrorMessage: string;
}

/**
 * Default configuration options
 * Values read from environment variables with sensible defaults
 */
const RATE_LIMIT_OPTIONS: RateLimitOptions = {
  cleanupIntervalMs: parseInt(process.env.RATE_LIMIT_CLEANUP_INTERVAL_MS || '60000', 10),
  defaultErrorMessage: process.env.RATE_LIMIT_DEFAULT_MESSAGE || 'Too many requests. Please try again later.',
  authIpErrorMessage: process.env.RATE_LIMIT_AUTH_IP_MESSAGE || 'Too many authentication attempts from this IP. Please try again later.',
  authPhoneErrorMessage: process.env.RATE_LIMIT_AUTH_PHONE_MESSAGE || 'Too many authentication attempts for this phone number. Please try again later.',
};

/**
 * Default Rate Limit Configurations
 * Can be overridden via environment variables
 */
export const DEFAULT_RATE_LIMITS: Record<string, RateLimitConfig> = {
  OTP_SEND: {
    limit: parseInt(process.env.RATE_LIMIT_OTP_PER_MINUTE || '5', 10),
    windowMs: parseInt(process.env.RATE_LIMIT_OTP_WINDOW_MS || '60000', 10),
    keyPrefix: 'otp_send',
    skipInMock: true,
  },
  LOGIN: {
    limit: parseInt(process.env.RATE_LIMIT_LOGIN_PER_MINUTE || '10', 10),
    windowMs: parseInt(process.env.RATE_LIMIT_LOGIN_WINDOW_MS || '60000', 10),
    keyPrefix: 'login',
    skipInMock: true,
  },
  API: {
    limit: parseInt(process.env.RATE_LIMIT_API_PER_MINUTE || '100', 10),
    windowMs: parseInt(process.env.RATE_LIMIT_API_WINDOW_MS || '60000', 10),
    keyPrefix: 'api',
    skipInMock: true,
  },
  WEBHOOK: {
    limit: parseInt(process.env.RATE_LIMIT_WEBHOOK_PER_MINUTE || '500', 10),
    windowMs: parseInt(process.env.RATE_LIMIT_WEBHOOK_WINDOW_MS || '60000', 10),
    keyPrefix: 'webhook',
    skipInMock: false,
  },
  AUTH_IP: {
    limit: parseInt(process.env.RATE_LIMIT_AUTH_IP_PER_MINUTE || '20', 10),
    windowMs: parseInt(process.env.RATE_LIMIT_AUTH_WINDOW_MS || '60000', 10),
    keyPrefix: 'auth_ip',
    skipInMock: true,
    errorMessage: RATE_LIMIT_OPTIONS.authIpErrorMessage,
  },
  AUTH_PHONE: {
    limit: parseInt(process.env.RATE_LIMIT_AUTH_PHONE_PER_MINUTE || '10', 10),
    windowMs: parseInt(process.env.RATE_LIMIT_AUTH_WINDOW_MS || '60000', 10),
    keyPrefix: 'auth_phone',
    skipInMock: true,
    errorMessage: RATE_LIMIT_OPTIONS.authPhoneErrorMessage,
  },
};

// ============================================================================
// Rate Limit Decorator
// ============================================================================

export const RATE_LIMIT_KEY = 'rate_limit';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function RateLimit(config: RateLimitConfig): <T>(target: object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<T>) => TypedPropertyDescriptor<T> | void {
  return <T>(target: object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<T>) => {
    if (descriptor.value) {
      Reflect.defineMetadata(RATE_LIMIT_KEY, config, descriptor.value);
    }
    return descriptor;
  };
}

// ============================================================================
// Rate Limit Store Interface and Implementations
// ============================================================================

/**
 * Result of a rate limit check
 */
export interface RateLimitResult {
  readonly allowed: boolean;
  readonly count: number;
  readonly ttl: number;
  readonly limit: number;
}

/**
 * Rate limit store interface
 * Allows swapping between Redis and in-memory implementations
 */
export interface RateLimitStore {
  increment(key: string, windowMs: number): Promise<{ count: number; ttl: number }>;
  reset(key: string): Promise<void>;
  destroy?(): void;
}

/**
 * In-memory rate limit store
 * Used for single-instance deployments or when Redis is unavailable
 */
export class MemoryRateLimitStore implements RateLimitStore, OnModuleDestroy {
  private readonly store = new Map<string, { count: number; resetTime: number }>();
  private readonly cleanupInterval: NodeJS.Timeout;
  private readonly logger = new Logger(MemoryRateLimitStore.name);

  constructor(cleanupIntervalMs: number = RATE_LIMIT_OPTIONS.cleanupIntervalMs) {
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      let cleaned = 0;
      for (const [key, entry] of this.store.entries()) {
        if (now > entry.resetTime) {
          this.store.delete(key);
          cleaned++;
        }
      }
      if (cleaned > 0) {
        this.logger.debug(`Cleaned ${cleaned} expired rate limit entries`);
      }
    }, cleanupIntervalMs);
  }

  async increment(key: string, windowMs: number): Promise<{ count: number; ttl: number }> {
    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry || now > entry.resetTime) {
      this.store.set(key, {
        count: 1,
        resetTime: now + windowMs,
      });
      return { count: 1, ttl: windowMs };
    }

    entry.count++;
    return { count: entry.count, ttl: entry.resetTime - now };
  }

  async reset(key: string): Promise<void> {
    this.store.delete(key);
  }

  onModuleDestroy(): void {
    clearInterval(this.cleanupInterval);
    this.store.clear();
  }
}

/**
 * Redis-backed rate limit store
 * Used for multi-instance deployments with Redis
 */
export class RedisRateLimitStore implements RateLimitStore {
  private readonly logger = new Logger(RedisRateLimitStore.name);

  constructor(private readonly redisService: RedisService) {}

  async increment(key: string, windowMs: number): Promise<{ count: number; ttl: number }> {
    const redisClient = this.redisService.getClient();
    if (!redisClient) {
      this.logger.debug('Redis not available, using fallback');
      throw new Error('Redis client not available');
    }

    const windowSeconds = Math.ceil(windowMs / 1000);
    const result = await this.redisService.checkRateLimit(key, 10000, windowSeconds);
    
    // Re-fetch count for accurate tracking
    const count = await redisClient.incr(key);
    if (count === 1) {
      await redisClient.expire(key, windowSeconds);
    }
    const ttl = await redisClient.ttl(key);
    
    return { count, ttl: ttl > 0 ? ttl * 1000 : windowMs };
  }

  async reset(key: string): Promise<void> {
    const redisClient = this.redisService.getClient();
    if (redisClient) {
      await redisClient.del(key);
    }
  }
}

/**
 * Hybrid rate limit store
 * Uses Redis when available, falls back to in-memory
 */
export class HybridRateLimitStore implements RateLimitStore {
  private readonly memoryStore: MemoryRateLimitStore;
  private readonly redisStore: RedisRateLimitStore | null;
  private readonly logger = new Logger(HybridRateLimitStore.name);

  constructor(redisService: RedisService | null) {
    this.memoryStore = new MemoryRateLimitStore();
    this.redisStore = redisService?.isRedisEnabled() ? new RedisRateLimitStore(redisService) : null;
    
    if (this.redisStore) {
      this.logger.log('Using Redis for distributed rate limiting');
    } else {
      this.logger.log('Using in-memory rate limiting (Redis not available)');
    }
  }

  async increment(key: string, windowMs: number): Promise<{ count: number; ttl: number }> {
    if (this.redisStore) {
      try {
        return await this.redisStore.increment(key, windowMs);
      } catch (error) {
        this.logger.warn(`Redis rate limit failed, falling back to memory: ${(error as Error).message}`);
      }
    }
    return this.memoryStore.increment(key, windowMs);
  }

  async reset(key: string): Promise<void> {
    await Promise.all([
      this.memoryStore.reset(key),
      this.redisStore?.reset(key).catch(() => {}),
    ]);
  }

  destroy(): void {
    this.memoryStore.onModuleDestroy();
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Request type with standard properties for IP extraction
 */
interface RequestWithIp {
  headers: Record<string, string | string[] | undefined>;
  connection?: { remoteAddress?: string };
  socket?: { remoteAddress?: string };
  ip?: string;
}

/**
 * Extract client IP from request
 * Handles various proxy configurations
 */
export function extractClientIp(request: RequestWithIp): string {
  // Check Express trust proxy setting first
  if (request.ip) {
    return request.ip;
  }

  const forwardedFor = request.headers['x-forwarded-for'];
  const realIp = request.headers['x-real-ip'];

  if (typeof forwardedFor === 'string') {
    const firstIp = forwardedFor.split(',')[0]?.trim();
    if (firstIp) return firstIp;
  }
  if (Array.isArray(forwardedFor) && forwardedFor[0]) {
    return forwardedFor[0].trim();
  }
  if (typeof realIp === 'string') {
    return realIp;
  }

  return request.connection?.remoteAddress || request.socket?.remoteAddress || 'unknown';
}

/**
 * Build rate limit exceeded response
 */
export function buildRateLimitResponse(ttl: number, message: string): HttpException {
  return new HttpException(
    {
      statusCode: HttpStatus.TOO_MANY_REQUESTS,
      message,
      error: 'Too Many Requests',
      retryAfter: Math.ceil(ttl / 1000),
    },
    HttpStatus.TOO_MANY_REQUESTS,
  );
}

/**
 * Set rate limit headers on response
 */
function setRateLimitHeaders(
  response: Response,
  limit: number,
  remaining: number,
  resetTime: number,
): void {
  response.setHeader('X-RateLimit-Limit', limit);
  response.setHeader('X-RateLimit-Remaining', Math.max(0, remaining));
  response.setHeader('X-RateLimit-Reset', resetTime);
}

// ============================================================================
// Rate Limit Guard
// ============================================================================

/**
 * Rate Limit Guard
 * 
 * Protects endpoints from abuse by limiting requests per IP address.
 * Uses Redis when available, falls back to in-memory store.
 * 
 * Usage:
 * ```typescript
 * @UseGuards(RateLimitGuard)
 * @RateLimit({ limit: 10, windowMs: 60000, keyPrefix: 'custom' })
 * async myEndpoint() {}
 * ```
 */
@Injectable()
export class RateLimitGuard implements CanActivate, OnModuleDestroy {
  protected readonly logger = new Logger(RateLimitGuard.name);
  protected readonly store: HybridRateLimitStore;

  constructor(
    private readonly reflector: Reflector,
    @Optional() redisService?: RedisService,
  ) {
    this.store = new HybridRateLimitStore(redisService ?? null);
  }

  onModuleDestroy(): void {
    this.store.destroy?.();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    const config = this.getConfig(context);

    // Skip in mock mode if configured
    if (config.skipInMock && process.env.USE_MOCK_DB === 'true') {
      return true;
    }

    const ip = extractClientIp(request);
    const result = await this.checkRateLimit(config, ip);

    setRateLimitHeaders(response, result.limit, result.limit - result.count, Math.ceil((Date.now() + result.ttl) / 1000));

    if (!result.allowed) {
      this.logger.warn(`Rate limit exceeded for ${config.keyPrefix}: IP=${ip}, count=${result.count}, limit=${result.limit}`);
      response.setHeader('Retry-After', Math.ceil(result.ttl / 1000));
      throw buildRateLimitResponse(result.ttl, config.errorMessage || RATE_LIMIT_OPTIONS.defaultErrorMessage);
    }

    return true;
  }

  protected getConfig(context: ExecutionContext): RateLimitConfig {
    return this.reflector.getAllAndOverride<RateLimitConfig>(RATE_LIMIT_KEY, [
      context.getHandler(),
      context.getClass(),
    ]) ?? DEFAULT_RATE_LIMITS.API;
  }

  protected async checkRateLimit(config: RateLimitConfig, identifier: string): Promise<RateLimitResult> {
    const key = `${config.keyPrefix}:${identifier}`;
    const { count, ttl } = await this.store.increment(key, config.windowMs);

    return {
      allowed: count <= config.limit,
      count,
      ttl,
      limit: config.limit,
    };
  }
}

// ============================================================================
// Auth Rate Limit Guard
// ============================================================================

/**
 * Request body type for auth endpoints
 */
interface AuthRequestBody {
  phoneNumber?: string;
  email?: string;
}

/**
 * Stricter rate limit guard for authentication endpoints
 * 
 * Applies both IP-based and phone-based rate limiting:
 * - IP-based: Limits total auth attempts from a single IP
 * - Phone-based: Limits attempts for a specific phone number
 */
@Injectable()
export class AuthRateLimitGuard extends RateLimitGuard {
  constructor(reflector: Reflector, @Optional() redisService?: RedisService) {
    super(reflector, redisService);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (process.env.USE_MOCK_DB === 'true') {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const body = request.body as AuthRequestBody | undefined;

    const ip = extractClientIp(request);
    const phoneNumber = body?.phoneNumber;

    // Check IP-based rate limit first
    const ipConfig = DEFAULT_RATE_LIMITS.AUTH_IP;
    const ipResult = await this.checkRateLimit(ipConfig, ip);

    if (!ipResult.allowed) {
      this.logger.warn(`Auth rate limit exceeded for IP: ${ip}`);
      throw buildRateLimitResponse(ipResult.ttl, ipConfig.errorMessage || RATE_LIMIT_OPTIONS.authIpErrorMessage);
    }

    // If phone number provided, check phone-specific rate limit
    if (phoneNumber) {
      const phoneConfig = DEFAULT_RATE_LIMITS.AUTH_PHONE;
      const phoneResult = await this.checkRateLimit(phoneConfig, phoneNumber);

      if (!phoneResult.allowed) {
        this.logger.warn(`Auth rate limit exceeded for phone: ${phoneNumber}`);
        throw buildRateLimitResponse(phoneResult.ttl, phoneConfig.errorMessage || RATE_LIMIT_OPTIONS.authPhoneErrorMessage);
      }
    }

    return true;
  }
}
