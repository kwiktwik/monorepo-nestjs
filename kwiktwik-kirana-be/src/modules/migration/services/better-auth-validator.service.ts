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

interface ValidationErrorDetails {
  tokenType: 'JWT' | 'BetterAuth' | 'Unknown';
  tokenPreview: string;
  tokenLength: number;
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
      // JWT format: header.payload.signature
      const parts = token.split('.');
      if (parts.length !== 3) {
        return undefined;
      }
      // Decode payload (base64)
      const payload = Buffer.from(parts[1], 'base64').toString('utf-8');
      const payloadObj = JSON.parse(payload);
      // Look for common user ID fields
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

  /**
   * Build detailed error information
   */
  private buildErrorDetails(
    token: string,
    error: Error,
    httpStatus?: number,
    responseBody?: string,
  ): ValidationErrorDetails {
    const tokenType = this.detectTokenType(token);
    const tokenPreview = token.substring(0, 30);
    const extractedUserId =
      tokenType === 'JWT' ? this.tryExtractUserIdFromJwt(token) : undefined;

    let suggestion: string | undefined;
    if (tokenType === 'JWT') {
      suggestion =
        'Frontend is sending JWT token from new backend. Should send Better-Auth session token from kirana-fe (old backend).';
    } else if (tokenType === 'BetterAuth') {
      suggestion =
        'Better-Auth session may be expired or invalid in kirana-fe.';
    }

    return {
      tokenType,
      tokenPreview,
      tokenLength: token.length,
      httpStatus,
      responseBody: responseBody?.substring(0, 200),
      errorType: error.constructor.name,
      errorMessage: error.message,
      extractedUserId,
      suggestion,
    };
  }

  /**
   * Format error details as a string for database storage
   */
  formatErrorDetails(details: ValidationErrorDetails): string {
    const parts = [
      `Token Type: ${details.tokenType}`,
      `Token Preview: ${details.tokenPreview}...`,
      `Token Length: ${details.tokenLength}`,
    ];

    if (details.extractedUserId) {
      parts.push(`Extracted UserId (from JWT): ${details.extractedUserId}`);
    }

    if (details.httpStatus) {
      parts.push(`HTTP Status: ${details.httpStatus}`);
    }

    if (details.responseBody) {
      parts.push(`Response: ${details.responseBody}`);
    }

    parts.push(`Error Type: ${details.errorType}`);
    parts.push(`Error: ${details.errorMessage}`);

    if (details.suggestion) {
      parts.push(`Suggestion: ${details.suggestion}`);
    }

    return parts.join(' | ');
  }

  /**
   * Validate Better-Auth session token with detailed error information
   * Calls kirana-fe internal API to validate session
   * Returns session data or throws UnauthorizedException with detailed error info
   */
  async validateSession(
    token: string,
  ): Promise<BetterAuthSession & { timing: FetchTiming }> {
    const tokenType = this.detectTokenType(token);
    this.logger.log(
      `Validating session: type=${tokenType}, preview=${token.substring(0, 20)}...`,
    );

    // Log warning if JWT is detected
    if (tokenType === 'JWT') {
      const extractedUserId = this.tryExtractUserIdFromJwt(token);
      this.logger.warn(
        `Token appears to be JWT (not Better-Auth). Extracted userId: ${extractedUserId || 'none'}. ` +
          'Frontend should send Better-Auth session token from kirana-fe.',
      );
    }

    const url = `${this.kiranaFeBaseUrl}/api/internal/session/validate`;
    let timing: FetchTiming;

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

      timing = fetchTiming;
      this.logger.log(`Session validation timing: ${formatTimingLog(timing)}`);

      if (!response.ok) {
        const errorBody = await response.text();
        const error = new Error(
          `Session validation failed: HTTP ${response.status}`,
        );
        const errorDetails = this.buildErrorDetails(
          token,
          error,
          response.status,
          errorBody,
        );
        const formattedError = this.formatErrorDetails(errorDetails);

        this.logger.error(`Session validation failed: ${formattedError}`);

        if (response.status === 401) {
          throw new UnauthorizedException(formattedError);
        }
        throw new Error(formattedError);
      }

      const data = await response.json();

      return {
        userId: data.userId,
        phoneNumber: data.phoneNumber,
        email: data.email,
        name: data.name,
        expiresAt: new Date(data.expiresAt),
        timing,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      // Handle timeout errors specifically
      if (error instanceof FetchTimeoutError) {
        const timeoutError = new Error(
          `Session validation timeout after ${SESSION_VALIDATION_TIMEOUT_MS}ms. ` +
            `kirana-fe may be slow or unresponsive.`,
        );
        const errorDetails = this.buildErrorDetails(token, timeoutError);
        const formattedError = this.formatErrorDetails(errorDetails);

        this.logger.error(`Session validation timeout: ${formattedError}`);
        throw new UnauthorizedException(formattedError);
      }

      // Handle other errors
      const errorDetails = this.buildErrorDetails(
        token,
        error instanceof Error ? error : new Error('Unknown error'),
      );
      const formattedError = this.formatErrorDetails(errorDetails);

      this.logger.error(
        `Session validation failed: ${formattedError}`,
        error instanceof Error ? error.stack : undefined,
      );

      throw new UnauthorizedException(formattedError);
    }
  }

  /**
   * Validate session and return detailed error info without throwing
   * Use this when you need to capture error details for logging
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
      const session = await this.validateSession(token);
      const { timing, ...sessionData } = session;
      return { success: true, session: sessionData, timing };
    } catch (error) {
      const errorDetails = this.buildErrorDetails(
        token,
        error instanceof Error ? error : new Error('Unknown error'),
      );
      const errorMessage = this.formatErrorDetails(errorDetails);
      return { success: false, errorDetails, errorMessage };
    }
  }
}
