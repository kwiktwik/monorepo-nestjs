import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface LegacyFeCheckResponse {
  exists: boolean;
  userId?: string;
  phoneNumber?: string;
}

@Injectable()
export class LegacyFeInternalService {
  private readonly logger = new Logger(LegacyFeInternalService.name);
  private readonly legacyFeBaseUrl: string;
  private readonly internalApiKey: string;

  constructor(private readonly configService: ConfigService) {
    this.legacyFeBaseUrl = this.configService.get<string>(
      'LEGACY_FE_BASE_URL',
      'http://localhost:3000',
    );
    this.internalApiKey = this.configService.get<string>(
      'INTERNAL_API_KEY',
      '',
    );
  }

  /**
   * Check if user exists in the legacy Flutter app backend
   * Uses internal API endpoint that requires API key authentication
   */
  async checkUserExists(phoneNumber: string): Promise<boolean> {
    try {
      this.logger.log(`[LegacyFe Check] Checking user: ${phoneNumber}`);
      this.logger.log(
        `[LegacyFe Check] API URL: ${this.legacyFeBaseUrl}/api/internal/user/check`,
      );
      this.logger.log(
        `[LegacyFe Check] API Key configured: ${this.internalApiKey ? 'Yes' : 'No'}`,
      );

      const response = await fetch(
        `${this.legacyFeBaseUrl}/api/internal/user/check`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Internal-Key': this.internalApiKey,
            'X-App-ID': 'com.jugnu.alertpe',
          },
          body: JSON.stringify({ phoneNumber }),
        },
      );

      this.logger.log(`[LegacyFe Check] Response status: ${response.status}`);

      if (!response.ok) {
        if (response.status === 404) {
          // User not found
          this.logger.log(
            `[LegacyFe Check] User ${phoneNumber} not found (404)`,
          );
          return false;
        }
        if (response.status === 401) {
          this.logger.error(
            '[LegacyFe Check] Unauthorized - invalid internal API key',
          );
          throw new Error('Legacy FE internal API authentication failed');
        }
        throw new Error(`Legacy FE API error: ${response.status}`);
      }

      const data = (await response.json()) as LegacyFeCheckResponse;
      this.logger.log(
        `[LegacyFe Check] User ${phoneNumber} exists: ${data.exists}`,
      );

      return data.exists;
    } catch (error) {
      this.logger.error(
        `[LegacyFe Check] Error checking user ${phoneNumber}:`,
        error instanceof Error ? error.message : 'Unknown error',
      );
      // Fail-safe: assume user doesn't exist if API call fails
      // This allows new users to sign up even if the legacy FE is down
      return false;
    }
  }
}
