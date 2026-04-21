import {
  Injectable,
  NestMiddleware,
  HttpException,
  HttpStatus,
  Logger,
  Inject,
  Optional,
} from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';
import {
  RateLimitConfig,
  HybridRateLimitStore,
  extractClientIp,
  buildRateLimitResponse,
  DEFAULT_RATE_LIMITS,
  RATE_LIMIT_OPTIONS,
} from '../guards/rate-limit.guard';
import { RedisService } from '../redis/redis.service';

/**
 * Routes to skip from global rate limiting
 * These use their own specific rate limits via guards
 */
export const GLOBAL_RATE_LIMIT_SKIP_ROUTES = [
  '/health',
  '/api/health',
  '/api/razorpay/webhook',
  '/api/phonepe/webhook',
  '/api/admin/docs',
  '/api/admin/mock-docs',
  '/favicon.ico',
];

/**
 * Routes that have their own rate limiting (skip global but still rate limited)
 * These endpoints have higher limits applied via RateLimitGuard
 */
export const ROUTES_WITH_OWN_RATE_LIMITS = [
  '/api/notifications',
  '/api/event',
];

/**
 * Global Rate Limiting Middleware
 *
 * Acts as a safety net to protect against infinite API calls from buggy clients.
 * This middleware is applied globally and limits requests per IP address.
 *
 * Default: 300 requests per minute per IP (5 req/sec average)
 * Configurable via environment variables:
 * - RATE_LIMIT_GLOBAL_PER_MINUTE: Max requests per minute (default: 300)
 * - RATE_LIMIT_GLOBAL_WINDOW_MS: Window in milliseconds (default: 60000)
 */
@Injectable()
export class GlobalRateLimitMiddleware implements NestMiddleware {
  private readonly logger = new Logger(GlobalRateLimitMiddleware.name);
  private readonly store: HybridRateLimitStore;
  private readonly config: RateLimitConfig;

  constructor(@Optional() redisService?: RedisService) {
    this.store = new HybridRateLimitStore(redisService ?? null);
    this.config = DEFAULT_RATE_LIMITS.GLOBAL;

    this.logger.log(
      `Global rate limiting initialized: ${this.config.limit} requests per ${this.config.windowMs / 1000}s per IP`,
    );
  }

  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    // Skip rate limiting in mock mode if configured
    if (this.config.skipInMock && process.env.USE_MOCK_DB === 'true') {
      return next();
    }

    // Skip certain routes entirely (health checks, webhooks)
    const path = req.path || req.url?.split('?')[0] || '';
    if (GLOBAL_RATE_LIMIT_SKIP_ROUTES.some((route) => path.startsWith(route))) {
      return next();
    }

    // Skip routes that have their own rate limiting guards
    // These endpoints will use RateLimitGuard with specific higher limits
    if (ROUTES_WITH_OWN_RATE_LIMITS.some((route) => path.startsWith(route))) {
      return next();
    }

    const ip = extractClientIp(req);
    const key = `${this.config.keyPrefix}:${ip}`;

    try {
      const { count, ttl } = await this.store.increment(
        key,
        this.config.windowMs,
      );
      const remaining = Math.max(0, this.config.limit - count);

      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', this.config.limit);
      res.setHeader('X-RateLimit-Remaining', remaining);
      res.setHeader('X-RateLimit-Reset', Math.ceil((Date.now() + ttl) / 1000));

      if (count > this.config.limit) {
        this.logger.warn(
          `Global rate limit exceeded: IP=${ip}, path=${path}, count=${count}, limit=${this.config.limit}`,
        );
        res.setHeader('Retry-After', Math.ceil(ttl / 1000));

        const error = buildRateLimitResponse(
          ttl,
          this.config.errorMessage ||
            RATE_LIMIT_OPTIONS.defaultErrorMessage,
        );
        throw error;
      }

      next();
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      // Log error but don't block request if rate limiting fails
      this.logger.error(`Rate limiting error: ${(error as Error).message}`);
      next();
    }
  }
}
