import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  fetchWithTimeout,
  FetchTiming,
  formatTimingLog,
  FetchTimeoutError,
} from '../utils/fetch-with-timeout.util';

interface BetterAuthSession {
  userId: string;
  phoneNumber: string;
  email: string;
  name: string;
  expiresAt: Date;
}

/**
 * Circuit Breaker State
 * Prevents cascade failures when kirana-fe is overloaded
 */
interface CircuitBreakerState {
  isOpen: boolean;
  failureCount: number;
  lastFailureTime: number;
  lastSuccessTime: number;
  nextRetryTime: number;
}

/**
 * Circuit Breaker Configuration
 * - Prevents repeated calls to a failing service
 * - Allows time for the service to recover
 * - Provides fast-fail behavior during outages
 */
const CIRCUIT_BREAKER_CONFIG = {
  // Number of failures before opening the circuit
  failureThreshold: 5,
  // Time to wait before trying again (ms)
  resetTimeout: 30000, // 30 seconds
  // Half-open state: allow one request through to test
  halfOpenMaxCalls: 1,
};

// Timeout configuration for session validation
// Increased from 5s to 10s to handle GC pauses in kirana-fe
const DEFAULT_SESSION_VALIDATION_TIMEOUT_MS = 10000;

export interface ValidationErrorDetails {
  tokenType: 'JWT' | 'BetterAuth' | 'Unknown';
  tokenPreview: string;
  tokenLength: number;
  kiranaFeUrl: string;
  timeoutMs: number;
  durationMs?: number;
  httpStatus?: number;
  responseBody?: string;
  errorType: string;
  errorMessage: string;
  extractedUserId?: string;
  suggestion?: string;
}

@Injectable()
export class BetterAuthValidator {
  private readonly logger = new Logger(BetterAuthValidator.name);
  private readonly kiranaFeBaseUrl: string;
  private readonly internalApiKey: string;
  private readonly sessionValidationTimeoutMs: number;

  /**
   * Circuit Breaker State
   * Prevents cascade failures when kirana-fe is overloaded
   */
  private circuitBreaker: CircuitBreakerState = {
    isOpen: false,
    failureCount: 0,
    lastFailureTime: 0,
    lastSuccessTime: Date.now(),
    nextRetryTime: 0,
  };

  constructor(private readonly configService: ConfigService) {
    this.kiranaFeBaseUrl = this.configService.get<string>(
      'KIRANA_FE_BASE_URL',
      'http://localhost:3000',
    );
    this.internalApiKey = this.configService.get<string>(
      'INTERNAL_API_KEY',
      '',
    );
    this.sessionValidationTimeoutMs = this.configService.get<number>(
      'SESSION_VALIDATION_TIMEOUT_MS',
      DEFAULT_SESSION_VALIDATION_TIMEOUT_MS,
    );
  }

  /**
   * Check if circuit breaker should allow the request
   * Returns true if request should proceed, false if circuit is open
   */
  private shouldAllowRequest(): { allowed: boolean; reason: string } {
    const now = Date.now();
    const cb = this.circuitBreaker;

    // Circuit is closed - allow request
    if (!cb.isOpen) {
      return { allowed: true, reason: 'circuit_closed' };
    }

    // Circuit is open - check if we should try again
    if (now >= cb.nextRetryTime) {
      // Half-open state - allow one request to test
      this.logger.log(
        'Circuit breaker entering half-open state, allowing test request',
      );
      return { allowed: true, reason: 'circuit_half_open' };
    }

    // Circuit is still open - reject fast
    const waitTime = Math.ceil((cb.nextRetryTime - now) / 1000);
    return {
      allowed: false,
      reason: `circuit_open_retry_in_${waitTime}s`,
    };
  }

  /**
   * Record a successful request - close circuit if it was open
   */
  private recordSuccess(): void {
    const cb = this.circuitBreaker;

    if (cb.isOpen) {
      this.logger.log('Circuit breaker closed after successful request');
    }

    cb.isOpen = false;
    cb.failureCount = 0;
    cb.lastSuccessTime = Date.now();
  }

  /**
   * Record a failed request - potentially open circuit
   */
  private recordFailure(error: string): void {
    const cb = this.circuitBreaker;
    const now = Date.now();

    cb.failureCount++;
    cb.lastFailureTime = now;

    // Check if we should open the circuit
    if (cb.failureCount >= CIRCUIT_BREAKER_CONFIG.failureThreshold) {
      cb.isOpen = true;
      cb.nextRetryTime = now + CIRCUIT_BREAKER_CONFIG.resetTimeout;

      this.logger.warn(
        `Circuit breaker OPENED after ${cb.failureCount} failures. ` +
          `Last error: ${error}. ` +
          `Next retry in ${CIRCUIT_BREAKER_CONFIG.resetTimeout / 1000}s`,
      );
    }
  }

  /**
   * Get circuit breaker status for health checks
   */
  getCircuitBreakerStatus(): {
    isOpen: boolean;
    failureCount: number;
    lastFailureTime: number | null;
  } {
    return {
      isOpen: this.circuitBreaker.isOpen,
      failureCount: this.circuitBreaker.failureCount,
      lastFailureTime:
        this.circuitBreaker.lastFailureTime > 0
          ? this.circuitBreaker.lastFailureTime
          : null,
    };
  }

  /**
   * Detect token type based on format
   */
  private detectTokenType(token: string): 'JWT' | 'BetterAuth' | 'Unknown' {
    if (!token || token.length === 0) {
      return 'Unknown';
    }
    // JWT tokens start with "eyJ" (base64 encoded JSON header)
    if (token.startsWith('eyJ')) {
      return 'JWT';
    }
    // Better-Auth tokens are typically shorter alphanumeric strings
    if (token.length < 100 && /^[a-zA-Z0-9_-]+$/.test(token)) {
      return 'BetterAuth';
    }
    return 'Unknown';
  }

  /**
   * Try to extract userId from JWT without validation
   */
  private tryExtractUserIdFromJwt(token: string): string | undefined {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return undefined;
      const payload = Buffer.from(parts[1], 'base64').toString('utf-8');
      const payloadObj = JSON.parse(payload);
      return (
        payloadObj.sub ||
        payloadObj.userId ||
        payloadObj.user_id ||
        payloadObj.id
      );
    } catch {
      return undefined;
    }
  }

  private getSuggestion(
    tokenType: ValidationErrorDetails['tokenType'],
    httpStatus?: number,
  ): string | undefined {
    if (tokenType === 'JWT') {
      return 'Frontend is sending a JWT token from the NEW backend. Migration requires a Better-Auth session token from kirana-fe (OLD backend).';
    }
    if (httpStatus === 401 || httpStatus === 403) {
      return 'Better-Auth session is expired or invalid in kirana-fe. User should re-login on the old app first.';
    }
    if (httpStatus === 404) {
      return 'Session not found in kirana-fe. Token may belong to a different environment (staging vs prod).';
    }
    if (httpStatus && httpStatus >= 500) {
      return 'kirana-fe is returning a server error. Check kirana-fe deployment health.';
    }
    if (tokenType === 'BetterAuth') {
      return 'Better-Auth session may be expired or invalid in kirana-fe.';
    }
    return undefined;
  }

  /**
   * Format error details as a string for database storage.
   * Each key=value pair is pipe-separated for easy reading and parsing.
   */
  formatErrorDetails(details: ValidationErrorDetails): string {
    const parts = [
      `tokenType=${details.tokenType}`,
      `tokenLength=${details.tokenLength}`,
      `tokenPreview=${details.tokenPreview}`,
      `kiranaFeUrl=${details.kiranaFeUrl}`,
      `timeoutMs=${details.timeoutMs}`,
    ];

    if (details.durationMs !== undefined) {
      parts.push(`durationMs=${details.durationMs}`);
    }
    if (details.extractedUserId) {
      parts.push(`extractedUserId=${details.extractedUserId}`);
    }
    if (details.httpStatus) {
      parts.push(`httpStatus=${details.httpStatus}`);
    }
    if (details.responseBody) {
      // Store up to 2000 chars of the response body for debugging
      parts.push(`responseBody=${details.responseBody.substring(0, 2000)}`);
    }
    parts.push(`errorType=${details.errorType}`);
    parts.push(`error=${details.errorMessage}`);
    if (details.suggestion) {
      parts.push(`suggestion=${details.suggestion}`);
    }

    return parts.join(' | ');
  }

  /**
   * Validate Better-Auth session token.
   * Returns enriched session or throws with structured ValidationErrorDetails attached.
   *
   * IMPORTANT: throws are ALL UnauthorizedException with a `.details` property
   * that callers can use to skip re-building error info (avoids duplicate formatting).
   *
   * CIRCUIT BREAKER: Prevents cascade failures when kirana-fe is overloaded.
   * After 5 consecutive failures, circuit opens for 30 seconds.
   */
  async validateSession(token: string): Promise<
    BetterAuthSession & {
      timing: FetchTiming;
      validationDetails: ValidationErrorDetails | null;
    }
  > {
    const tokenType = this.detectTokenType(token);

    // Check circuit breaker before attempting request
    const { allowed, reason } = this.shouldAllowRequest();
    if (!allowed) {
      this.logger.warn(
        `Session validation blocked by circuit breaker: ${reason}`,
      );
      const details: ValidationErrorDetails = {
        tokenType,
        tokenPreview: token.substring(0, 30),
        tokenLength: token.length,
        kiranaFeUrl: `${this.kiranaFeBaseUrl}/api/internal/session/validate`,
        timeoutMs: this.sessionValidationTimeoutMs,
        errorType: 'CircuitBreakerOpen',
        errorMessage: `Session validation temporarily unavailable. kirana-fe service is recovering. ${reason}`,
        extractedUserId:
          tokenType === 'JWT'
            ? this.tryExtractUserIdFromJwt(token)
            : undefined,
        suggestion:
          'Wait a few seconds and retry. The kirana-fe service is recovering from high load.',
      };

      const formatted = this.formatErrorDetails(details);
      const exc = new UnauthorizedException(formatted) as any;
      exc.validationDetails = details;
      throw exc;
    }

    this.logger.log(
      `Validating session: type=${tokenType}, preview=${token.substring(0, 20)}... (${reason})`,
    );

    if (tokenType === 'JWT') {
      const extractedUserId = this.tryExtractUserIdFromJwt(token);
      this.logger.warn(
        `Token appears to be JWT (not Better-Auth). Extracted userId: ${extractedUserId || 'none'}. ` +
          'Frontend should send Better-Auth session token from kirana-fe.',
      );
    }

    const url = `${this.kiranaFeBaseUrl}/api/internal/session/validate`;

    try {
      const { response, timing: fetchTiming } = await fetchWithTimeout(
        url,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Internal-Key': this.internalApiKey,
            'X-App-ID': 'com.kiranaapps.app',
          },
          body: JSON.stringify({ token }),
        },
        this.sessionValidationTimeoutMs,
        'session_validation',
      );

      // Record success - close circuit if it was open
      this.recordSuccess();

      this.logger.log(
        `Session validation timing: ${formatTimingLog(fetchTiming)}`,
      );

      if (!response.ok) {
        const errorBody = await response.text();

        // Record failure for circuit breaker (only for 5xx errors - service issues)
        if (response.status >= 500) {
          this.recordFailure(`HTTP ${response.status}`);
        }

        const details: ValidationErrorDetails = {
          tokenType,
          tokenPreview: token.substring(0, 30),
          tokenLength: token.length,
          kiranaFeUrl: url,
          timeoutMs: this.sessionValidationTimeoutMs,
          durationMs: fetchTiming.durationMs,
          httpStatus: response.status,
          responseBody: errorBody,
          errorType: 'HttpError',
          errorMessage: `kirana-fe returned HTTP ${response.status}`,
          extractedUserId:
            tokenType === 'JWT'
              ? this.tryExtractUserIdFromJwt(token)
              : undefined,
          suggestion: this.getSuggestion(tokenType, response.status),
        };

        const formatted = this.formatErrorDetails(details);
        this.logger.error(`Session validation failed: ${formatted}`);

        const exc = new UnauthorizedException(formatted) as any;
        exc.validationDetails = details;
        throw exc;
      }

      const data = await response.json();

      return {
        userId: data.userId,
        phoneNumber: data.phoneNumber,
        email: data.email,
        name: data.name,
        expiresAt: new Date(data.expiresAt),
        timing: fetchTiming,
        validationDetails: null,
      };
    } catch (error) {
      // Re-throw errors we already enriched
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      let details: ValidationErrorDetails;

      if (error instanceof FetchTimeoutError) {
        // Record failure for circuit breaker
        this.recordFailure('Timeout');

        details = {
          tokenType,
          tokenPreview: token.substring(0, 30),
          tokenLength: token.length,
          kiranaFeUrl: url,
          timeoutMs: this.sessionValidationTimeoutMs,
          errorType: 'FetchTimeoutError',
          errorMessage: `kirana-fe did not respond within ${this.sessionValidationTimeoutMs}ms. The service may be down, cold-starting, or overloaded.`,
          extractedUserId:
            tokenType === 'JWT'
              ? this.tryExtractUserIdFromJwt(token)
              : undefined,
          suggestion:
            'Check kirana-fe service health. If this happens repeatedly, the circuit breaker will temporarily block requests to allow recovery.',
        };
      } else {
        // Non-timeout network/parse errors — unwrap { error, timing } from fetchWithTimeout
        const innerError =
          error instanceof Error
            ? error
            : error && typeof error === 'object' && 'error' in error
              ? error.error instanceof Error
                ? error.error
                : new Error(String(error.error))
              : new Error('Unknown fetch error');

        const innerTiming: FetchTiming | undefined =
          error && typeof error === 'object' && 'timing' in error
            ? error.timing
            : undefined;

        // Record failure for circuit breaker
        this.recordFailure(innerError.message);

        details = {
          tokenType,
          tokenPreview: token.substring(0, 30),
          tokenLength: token.length,
          kiranaFeUrl: url,
          timeoutMs: this.sessionValidationTimeoutMs,
          durationMs: innerTiming?.durationMs,
          errorType: innerError.constructor.name,
          errorMessage: innerError.message,
          extractedUserId:
            tokenType === 'JWT'
              ? this.tryExtractUserIdFromJwt(token)
              : undefined,
          suggestion: this.getSuggestion(tokenType),
        };
      }

      const formatted = this.formatErrorDetails(details);
      this.logger.error(
        `Session validation failed: ${formatted}`,
        error instanceof Error ? error.stack : undefined,
      );

      const exc = new UnauthorizedException(formatted) as any;
      exc.validationDetails = details;
      throw exc;
    }
  }

  /**
   * Validate session and return structured result without throwing.
   * The validationDetails object contains all raw error fields for DB storage.
   */
  async validateSessionWithDetails(token: string): Promise<
    | { success: true; session: BetterAuthSession; timing: FetchTiming }
    | {
        success: false;
        errorDetails: ValidationErrorDetails;
        errorMessage: string;
        timing?: FetchTiming;
      }
  > {
    try {
      const {
        timing,
        validationDetails: _vd,
        ...sessionData
      } = await this.validateSession(token);
      return { success: true, session: sessionData, timing };
    } catch (thrown) {
      // If validateSession attached structured details, use them directly.
      // This avoids re-processing the already-formatted UnauthorizedException message.
      if (
        thrown &&
        typeof thrown === 'object' &&
        'validationDetails' in thrown &&
        thrown.validationDetails
      ) {
        const details: ValidationErrorDetails = thrown.validationDetails;
        return {
          success: false,
          errorDetails: details,
          errorMessage: this.formatErrorDetails(details),
        };
      }

      // Fallback for unexpected throws — build minimal details
      const error =
        thrown instanceof Error ? thrown : new Error(String(thrown));

      const tokenType = this.detectTokenType(token);
      const details: ValidationErrorDetails = {
        tokenType,
        tokenPreview: token.substring(0, 30),
        tokenLength: token.length,
        kiranaFeUrl: `${this.kiranaFeBaseUrl}/api/internal/session/validate`,
        timeoutMs: this.sessionValidationTimeoutMs,
        errorType: error.constructor.name,
        errorMessage: error.message,
        extractedUserId:
          tokenType === 'JWT' ? this.tryExtractUserIdFromJwt(token) : undefined,
        suggestion: this.getSuggestion(tokenType),
      };

      return {
        success: false,
        errorDetails: details,
        errorMessage: this.formatErrorDetails(details),
      };
    }
  }
}
