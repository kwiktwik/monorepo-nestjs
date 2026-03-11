import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface BetterAuthSession {
  userId: string;
  phoneNumber: string;
  email: string;
  name: string;
  expiresAt: Date;
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
   * Validate Better-Auth session token
   * Calls kirana-fe internal API to validate session
   */
  async validateSession(token: string): Promise<BetterAuthSession> {
    this.logger.log(
      `Validating Better-Auth session: ${token.substring(0, 10)}...`,
    );

    try {
      const response = await fetch(
        `${this.kiranaFeBaseUrl}/api/internal/session/validate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Internal-Key': this.internalApiKey,
            'X-App-ID': 'com.kiranaapps.app',
          },
          body: JSON.stringify({ token }),
        },
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new UnauthorizedException(
            'Invalid or expired Better-Auth session',
          );
        }
        throw new Error(`Session validation failed: ${response.status}`);
      }

      const data = await response.json();

      return {
        userId: data.userId,
        phoneNumber: data.phoneNumber,
        email: data.email,
        name: data.name,
        expiresAt: new Date(data.expiresAt),
      };
    } catch (error) {
      this.logger.error(
        'Better-Auth session validation failed:',
        error instanceof Error ? error.message : 'Unknown error',
      );
      throw new UnauthorizedException('Failed to validate session');
    }
  }
}
