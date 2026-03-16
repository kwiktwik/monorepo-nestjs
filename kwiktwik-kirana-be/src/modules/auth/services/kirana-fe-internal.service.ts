import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface KiranaFeCheckResponse {
  exists: boolean;
  userId?: string;
  phoneNumber?: string;
}

@Injectable()
export class KiranaFeInternalService {
  private readonly logger = new Logger(KiranaFeInternalService.name);
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
   * Check if user exists in kirana-fe (Flutter app backend)
   * Uses internal API endpoint that requires API key authentication
   */
  async checkUserExists(phoneNumber: string): Promise<boolean> {
    try {
      this.logger.log(`[KiranaFe Check] Checking user: ${phoneNumber}`);
      this.logger.log(`[KiranaFe Check] API URL: ${this.kiranaFeBaseUrl}/api/internal/user/check`);
      this.logger.log(`[KiranaFe Check] API Key configured: ${this.internalApiKey ? 'Yes' : 'No'}`);

      const response = await fetch(
        `${this.kiranaFeBaseUrl}/api/internal/user/check`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Internal-Key': this.internalApiKey,
            'X-App-ID': 'com.kiranaapps.app',
          },
          body: JSON.stringify({ phoneNumber }),
        },
      );

      this.logger.log(`[KiranaFe Check] Response status: ${response.status}`);

      if (!response.ok) {
        if (response.status === 404) {
          // User not found
          this.logger.log(`[KiranaFe Check] User ${phoneNumber} not found (404)`);
          return false;
        }
        if (response.status === 401) {
          this.logger.error(
            '[KiranaFe Check] Unauthorized - invalid internal API key',
          );
          throw new Error('Kirana-fe internal API authentication failed');
        }
        throw new Error(`Kirana-fe API error: ${response.status}`);
      }

      const data = (await response.json()) as KiranaFeCheckResponse;
      this.logger.log(
        `[KiranaFe Check] User ${phoneNumber} exists: ${data.exists}`,
      );

      return data.exists;
    } catch (error) {
      this.logger.error(
        `[KiranaFe Check] Error checking user ${phoneNumber}:",
        error instanceof Error ? error.message : 'Unknown error',
      );
      // Fail-safe: assume user doesn't exist if API call fails
      // This allows new users to sign up even if kirana-fe is down
      return false;
    }
  }
        if (response.status === 401) {
          this.logger.error(
            '[KiranaFe Check] Unauthorized - invalid internal API key',
          );
          throw new Error('Kirana-fe internal API authentication failed');
        }
        throw new Error(`Kirana-fe API error: ${response.status}`);
      }

      const data = (await response.json()) as KiranaFeCheckResponse;
      this.logger.log(
        `[KiranaFe Check] User ${phoneNumber} exists: ${data.exists}`,
      );

      return data.exists;
    } catch (error) {
      this.logger.error(
        `[KiranaFe Check] Error checking user ${phoneNumber}:`,
        error instanceof Error ? error.message : 'Unknown error',
      );
      // Fail-safe: assume user doesn't exist if API call fails
      // This allows new users to sign up even if kirana-fe is down
      return false;
    }
  }
}
