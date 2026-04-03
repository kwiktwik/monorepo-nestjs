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

// Timeout configuration for session validation
const SESSION_VALIDATION_TIMEOUT_MS = 5000; // 5 seconds

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

  constructor(private readonly configService: ConfigService) {
    this.kiranaFeBaseUrl = this.configService.get<string>(
      'KIRANA_FE_BASE_URL',
      'http://localhost:3000',
    );
    this.internalApiKey = this.configService.get<string>(
      'INTERNAL_API_KEY',
      '',
    );
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
   */
  async validateSession(
    token: string,
  ): Promise<BetterAuthSession & { timing: FetchTiming; validationDetails: ValidationErrorDetails | null }> {
    const tokenType = this.detectTokenType(token);
    this.logger.log(
      `Validating session: type=${tokenType}, preview=${token.substring(0, 20)}...`,
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
        SESSION_VALIDATION_TIMEOUT_MS,
        'session_validation',
      );

      this.logger.log(`Session validation timing: ${formatTimingLog(fetchTiming)}`);

      if (!response.ok) {
        const errorBody = await response.text();
        const details: ValidationErrorDetails = {
          tokenType,
          tokenPreview: token.substring(0, 30),
          tokenLength: token.length,
          kiranaFeUrl: url,
          timeoutMs: SESSION_VALIDATION_TIMEOUT_MS,
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
        details = {
          tokenType,
          tokenPreview: token.substring(0, 30),
          tokenLength: token.length,
          kiranaFeUrl: url,
          timeoutMs: SESSION_VALIDATION_TIMEOUT_MS,
          errorType: 'FetchTimeoutError',
          errorMessage: `kirana-fe did not respond within ${SESSION_VALIDATION_TIMEOUT_MS}ms. The service may be down, cold-starting, or overloaded.`,
          extractedUserId:
            tokenType === 'JWT'
              ? this.tryExtractUserIdFromJwt(token)
              : undefined,
          suggestion:
            'Check kirana-fe service health. If this happens repeatedly, increase SESSION_VALIDATION_TIMEOUT_MS or check network connectivity between services.',
        };
      } else {
        // Non-timeout network/parse errors — unwrap { error, timing } from fetchWithTimeout
        const innerError =
          error instanceof Error
            ? error
            : error && typeof error === 'object' && 'error' in error
              ? ((error as any).error instanceof Error
                  ? (error as any).error
                  : new Error(String((error as any).error)))
              : new Error('Unknown fetch error');

        const innerTiming: FetchTiming | undefined =
          error && typeof error === 'object' && 'timing' in error
            ? (error as any).timing
            : undefined;

        details = {
          tokenType,
          tokenPreview: token.substring(0, 30),
          tokenLength: token.length,
          kiranaFeUrl: url,
          timeoutMs: SESSION_VALIDATION_TIMEOUT_MS,
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
      const { timing, validationDetails: _vd, ...sessionData } = await this.validateSession(token);
      return { success: true, session: sessionData, timing };
    } catch (thrown) {
      // If validateSession attached structured details, use them directly.
      // This avoids re-processing the already-formatted UnauthorizedException message.
      if (
        thrown &&
        typeof thrown === 'object' &&
        'validationDetails' in thrown &&
        (thrown as any).validationDetails
      ) {
        const details: ValidationErrorDetails = (thrown as any).validationDetails;
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
        timeoutMs: SESSION_VALIDATION_TIMEOUT_MS,
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
