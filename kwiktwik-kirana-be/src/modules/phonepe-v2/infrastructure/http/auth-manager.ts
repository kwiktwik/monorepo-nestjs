import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface PhonePeCredentials {
  clientId: string;
  clientSecret: string;
  clientVersion: number;
  merchantId: string;
  env: 'SANDBOX' | 'PRODUCTION';
}

interface CachedToken {
  access_token: string;
  expires_at: number; // Unix seconds (as returned by PhonePe — NOT milliseconds)
}

/**
 * Manages OAuth2 tokens for PhonePe API.
 * Caches per PhonePe docs recommendation — tokens last ~7 days.
 * IMPORTANT: expires_at from PhonePe is Unix seconds, not milliseconds.
 */
@Injectable()
export class PhonePeAuthManager {
  private readonly logger = new Logger(PhonePeAuthManager.name);
  private tokenCache = new Map<string, CachedToken>();

  constructor(private readonly config: ConfigService) {}

  async getToken(appId: string): Promise<string> {
    const credentials = this.getCredentials(appId);
    const cacheKey = `${appId}_${credentials.env}`;
    const nowSeconds = Math.floor(Date.now() / 1000);
    const TEN_MINUTES = 10 * 60;

    const cached = this.tokenCache.get(cacheKey);
    // expires_at is Unix seconds — compare directly without * 1000
    if (cached && cached.expires_at > nowSeconds + TEN_MINUTES) {
      this.logger.debug(`Using cached token for ${appId} (expires in ${cached.expires_at - nowSeconds}s)`);
      return cached.access_token;
    }

    this.logger.log(`Fetching new token for ${appId} (${credentials.env})`);
    const token = await this.fetchToken(credentials);
    this.tokenCache.set(cacheKey, token);
    return token.access_token;
  }

  private async fetchToken(credentials: PhonePeCredentials): Promise<CachedToken> {
    const url =
      credentials.env === 'PRODUCTION'
        ? 'https://api.phonepe.com/apis/identity-manager/v1/oauth/token'
        : 'https://api-preprod.phonepe.com/apis/pg-sandbox/v1/oauth/token';

    const params = new URLSearchParams({
      client_id: credentials.clientId,
      client_version: String(credentials.clientVersion),
      client_secret: credentials.clientSecret,
      grant_type: 'client_credentials',
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body: params,
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`PhonePe auth failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    // expires_at from PhonePe is Unix seconds — store as-is
    return { access_token: data.access_token, expires_at: data.expires_at };
  }

  getCredentials(appId: string): PhonePeCredentials {
    const normalizedAppId = appId.replace(/\./g, '_').toUpperCase();
    const env = (this.config.get<string>(`PHONEPE_ENV_${normalizedAppId}`) ||
      this.config.get<string>('PHONEPE_ENV') ||
      'SANDBOX') as 'SANDBOX' | 'PRODUCTION';

    const isProd = env === 'PRODUCTION';

    const clientId = this.config.get<string>(`PHONEPE_CLIENT_ID_${normalizedAppId}`);
    const clientSecret = this.config.get<string>(`PHONEPE_CLIENT_SECRET_${normalizedAppId}`);
    const merchantId =
      this.config.get<string>(`PHONEPE_MERCHANT_ID_${normalizedAppId}`) ||
      (isProd ? '' : 'PGTESTPAYUAT');
    const clientVersion = parseInt(
      this.config.get<string>(`PHONEPE_CLIENT_VERSION_${normalizedAppId}`) || '1',
      10,
    );

    if (!clientId || !clientSecret) {
      throw new Error(
        `PhonePe credentials not found for app: ${appId}. ` +
          `Set PHONEPE_CLIENT_ID_${normalizedAppId} and PHONEPE_CLIENT_SECRET_${normalizedAppId}`,
      );
    }

    return { clientId, clientSecret, clientVersion, merchantId, env };
  }

  getBaseUrl(appId: string): string {
    const credentials = this.getCredentials(appId);
    return credentials.env === 'PRODUCTION'
      ? 'https://api.phonepe.com/apis/pg'
      : 'https://api-preprod.phonepe.com/apis/pg-sandbox';
  }
}
