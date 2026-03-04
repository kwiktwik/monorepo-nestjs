/**
 * Secure PhonePe Environment Toggle
 * 
 * Only authenticated users from your team can switch environments
 */

// Standardized environment keys matching PhonePe SDK
export const PHONEPE_ENV = {
  SANDBOX: 'SANDBOX',
  PRODUCTION: 'PRODUCTION',
} as const;

export type PhonePeEnv = typeof PHONEPE_ENV[keyof typeof PHONEPE_ENV];

/**
 * Validates that required PhonePe environment variables are set
 * Should be called on application startup
 */
export function validatePhonePeEnv(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const env = process.env.NODE_ENV;

  // Always validate sandbox credentials
  if (!process.env.PHONEPE_CLIENT_ID_DEV) {
    errors.push('Missing PHONEPE_CLIENT_ID_DEV');
  }
  if (!process.env.PHONEPE_CLIENT_SECRET_DEV) {
    errors.push('Missing PHONEPE_CLIENT_SECRET_DEV');
  }

  // In production, validate production credentials
  if (env === 'production') {
    if (!process.env.PHONEPE_MERCHANT_ID_PROD) {
      errors.push('Missing PHONEPE_MERCHANT_ID_PROD');
    }
    if (!process.env.PHONEPE_SALT_KEY_PROD) {
      errors.push('Missing PHONEPE_SALT_KEY_PROD');
    }
    if (!process.env.PHONEPE_CLIENT_ID_PROD) {
      errors.push('Missing PHONEPE_CLIENT_ID_PROD');
    }
    if (!process.env.PHONEPE_CLIENT_SECRET_PROD) {
      errors.push('Missing PHONEPE_CLIENT_SECRET_PROD');
    }
  }

  if (errors.length > 0) {
    console.error('[PhonePe Env] Validation failed:', errors);
  }

  return { valid: errors.length === 0, errors };
}

// Get PhonePe configuration based on environment
export function getPhonePeConfig(env: PhonePeEnv = PHONEPE_ENV.SANDBOX) {
  return {
    [PHONEPE_ENV.SANDBOX]: {
      merchantId: process.env.PHONEPE_MERCHANT_ID_DEV || 'PGTESTPAYUAT',
      saltKey: process.env.PHONEPE_SALT_KEY_DEV || '099eb0cd-02cf-4e2a-8aca-3e6c6aff03db',
      saltIndex: process.env.PHONEPE_SALT_INDEX_DEV || '1',
      baseUrl: process.env.PHONEPE_BASE_URL_DEV || 'https://api.phonepe.com/v3',
      isSandbox: true,
    },
    [PHONEPE_ENV.PRODUCTION]: {
      merchantId: process.env.PHONEPE_MERCHANT_ID_PROD || '',
      saltKey: process.env.PHONEPE_SALT_KEY_PROD || '',
      saltIndex: process.env.PHONEPE_SALT_INDEX_PROD || '1',
      baseUrl: process.env.PHONEPE_BASE_URL_PROD || 'https://api.phonepe.com/v3',
      isSandbox: false,
    },
  }[env];
}

// Check if user is allowed to switch environments (team member)
export function canSwitchEnvironment(userId?: string): boolean {
  if (!userId) {
    console.log("[PhonePe Env] canSwitchEnvironment: No userId provided");
    return false;
  }

  // Add your team member IDs here
  const TEAM_MEMBER_IDS = ["QECitrvk5oeTJu-JtQCnF", "6h-mRlReKwwiSriUtByVt",
    "bpOYs4lsVGWEyweMpvQNmILpkBroar1F",
    "WoIHGy328w69P33Tw3HfRngLRpemvUyP"]

  const isAllowed = TEAM_MEMBER_IDS.includes(userId);
  console.log(`[PhonePe Env] canSwitchEnvironment: userId=${userId}, isAllowed=${isAllowed}`);
  return isAllowed;
}

// Get current environment - simplified to use only env variables
export async function getCurrentEnvironment(request?: Request, userId?: string): Promise<PhonePeEnv> {
  console.log(`[PhonePe Env] Detection - PHONEPE_ENV: ${process.env.PHONEPE_ENV}, NODE_ENV: ${process.env.NODE_ENV}`);

  // PRIORITY 1: Use PHONEPE_ENV if explicitly set
  const phonePeEnv = process.env.PHONEPE_ENV?.toUpperCase();
  if (phonePeEnv === 'SANDBOX' || phonePeEnv === 'DEV') {
    console.info(`[PhonePe Env] Using SANDBOX environment (PHONEPE_ENV=${process.env.PHONEPE_ENV})`);
    return PHONEPE_ENV.SANDBOX;
  }
  if (phonePeEnv === 'PRODUCTION' || phonePeEnv === 'PROD') {
    console.info(`[PhonePe Env] Using PRODUCTION environment (PHONEPE_ENV=${process.env.PHONEPE_ENV})`);
    return PHONEPE_ENV.PRODUCTION;
  }

  // PRIORITY 2: Fall back to NODE_ENV
  if (process.env.NODE_ENV !== 'production') {
    console.info(`[PhonePe Env] Using SANDBOX environment (NODE_ENV is ${process.env.NODE_ENV})`);
    return PHONEPE_ENV.SANDBOX;
  }

  // Default for production environment
  console.info(`[PhonePe Env] Defaulting to PRODUCTION environment (production mode)`);
  return PHONEPE_ENV.PRODUCTION;
}

// Helper to check if current request can access production
export function canAccessProduction(request?: Request, userId?: string): boolean {
  let env = request ?
    request.headers.get('X-PhonePe-Env')?.toUpperCase() ||
    new URL(request.url).searchParams.get('env')?.toUpperCase()
    : undefined;

  // Normalize environment key
  if (env === 'PROD') env = 'PRODUCTION';
  if (env === 'DEV') env = 'SANDBOX';

  // Only allow production access to team members or in production mode
  return process.env.NODE_ENV === 'production' ||
    env !== PHONEPE_ENV.PRODUCTION ||
    canSwitchEnvironment(userId);
}