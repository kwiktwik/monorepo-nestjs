
export interface PhonePeAuthResponse {
  access_token: string;
  encrypted_access_token: string;
  expires_in: number;
  issued_at: number;
  expires_at: number;
  session_expires_at: number;
  token_type: string;
}

interface CachedToken {
  token: PhonePeAuthResponse;
  expiresAt: number;
}

// Module-level cache for auth tokens
const tokenCache: Record<string, CachedToken> = {};

/**
 * Get PhonePe OAuth access token with caching
 * Tokens are cached and reused until they expire (with 5min buffer)
 * 
 * @param envKey - Environment: 'SANDBOX' or 'PRODUCTION'
 * @returns PhonePe auth response with access token
 */
export async function getAuthToken(envKey: string = (process.env.PHONEPE_ENV || "SANDBOX")): Promise<PhonePeAuthResponse> {
  // Use PHONEPE_ENV to determine environment, NOT NODE_ENV
  const env = envKey.toUpperCase();
  const isProd = env === "PRODUCTION" || env === "PROD";
  const cacheKey = isProd ? 'PRODUCTION' : 'SANDBOX';
  const now = Date.now();

  console.log(`[PhonePe Auth] Environment: ${cacheKey} (PHONEPE_ENV=${process.env.PHONEPE_ENV}, NODE_ENV=${process.env.NODE_ENV})`);

  // Return cached token if still valid (with 5min buffer)
  if (tokenCache[cacheKey] && tokenCache[cacheKey].expiresAt > now + 300000) {
    console.log(`[PhonePe Auth] Using cached token for ${cacheKey} (expires in ${Math.round((tokenCache[cacheKey].expiresAt - now) / 1000)}s)`);
    return tokenCache[cacheKey].token;
  }

  // Improved fallback chain: _PROD/_DEV -> non-suffixed -> error
  const clientId = isProd
    ? (process.env.PHONEPE_CLIENT_ID_PROD || process.env.PHONEPE_CLIENT_ID)
    : (process.env.PHONEPE_CLIENT_ID_DEV || process.env.PHONEPE_CLIENT_ID);
  const clientSecret = isProd
    ? (process.env.PHONEPE_CLIENT_SECRET_PROD || process.env.PHONEPE_CLIENT_SECRET)
    : (process.env.PHONEPE_CLIENT_SECRET_DEV || process.env.PHONEPE_CLIENT_SECRET);
  const clientVersion = process.env.PHONEPE_CLIENT_VERSION || "1";

  if (!clientId || !clientSecret) {
    throw new Error(
      `Missing PhonePe credentials for ${cacheKey}: PHONEPE_CLIENT_ID${isProd ? '_PROD' : '_DEV'} and PHONEPE_CLIENT_SECRET${isProd ? '_PROD' : '_DEV'} are required.`
    );
  }

  // Determine URL based on environment
  const url = isProd
    ? "https://api.phonepe.com/apis/hermes/v1/oauth/token"
    : "https://api-preprod.phonepe.com/apis/pg-sandbox/v1/oauth/token";

  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("client_version", clientVersion);
  params.append("client_secret", clientSecret);
  params.append("grant_type", "client_credentials");

  try {
    console.log(`[PhonePe Auth] Fetching new token for ${cacheKey}`);
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        accept: "application/json",
      },
      body: params,
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `PhonePe Auth Failed (${cacheKey}): ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    const data = (await response.json()) as PhonePeAuthResponse;

    // Cache the token
    tokenCache[cacheKey] = {
      token: data,
      expiresAt: data.expires_at,
    };

    console.log(`[PhonePe Auth] Token cached for ${cacheKey} (valid for ${data.expires_in}s)`);
    return data;
  } catch (error) {
    if (error instanceof Error && error.name === 'TimeoutError') {
      console.error(`[PhonePe Auth] Request timeout for ${cacheKey}`);
      throw new Error(`PhonePe authentication timed out for ${cacheKey}`);
    }
    console.error(`[PhonePe Auth] Error for ${cacheKey}:`, error);
    throw error;
  }
}

