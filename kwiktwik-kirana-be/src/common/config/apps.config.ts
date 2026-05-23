export interface AppConfig {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  rateLimit?: {
    maxRequests: number;
    windowMs: number;
  };
  features?: {
    otpLogin?: boolean;
    truecallerLogin?: boolean;
    googleLogin?: boolean;
  };
}

/**
 * Registered applications
 * Only apps defined here can authenticate via the API
 */
export const REGISTERED_APPS: Record<string, AppConfig> = {
  'com.jugnu.alertpe': {
    id: 'com.jugnu.alertpe',
    name: 'Kirana Apps (Legacy Flutter)',
    description:
      'Legacy Flutter app - users should be redirected to api.kiranaapps.com',
    enabled: true,
    rateLimit: {
      maxRequests: 100,
      windowMs: 15 * 60 * 1000,
    },
    features: {
      otpLogin: true,
      truecallerLogin: true,
      googleLogin: true,
    },
  },
  'com.dailyattendance.staffbook': {
    id: 'com.dailyattendance.staffbook',
    name: 'StaffBook',
    description: 'StaffBook mobile application',
    enabled: true,
    rateLimit: {
      maxRequests: 100,
      windowMs: 15 * 60 * 1000,
    },
    features: {
      otpLogin: true,
      truecallerLogin: true,
      googleLogin: true,
    },
  },
  'com.slydee.app': {
    id: 'com.slydee.app',
    name: 'Slydee',
    description: 'Slydee companion app',
    enabled: true,
    rateLimit: {
      maxRequests: 100,
      windowMs: 15 * 60 * 1000,
    },
    features: {
      otpLogin: true,
      truecallerLogin: true,
      googleLogin: true,
    },
  },
};

/**
 * Get app configuration by ID
 */
export function getAppConfig(appId: string): AppConfig | null {
  return REGISTERED_APPS[appId] || null;
}

/**
 * Check if an app is registered and enabled
 */
export function isValidApp(appId: string): boolean {
  const app = getAppConfig(appId);
  return app !== null && app.enabled;
}

/**
 * Get all registered app IDs
 */
export function getRegisteredAppIds(): string[] {
  return Object.keys(REGISTERED_APPS);
}

/**
 * Get all enabled apps
 */
export function getEnabledApps(): AppConfig[] {
  return Object.values(REGISTERED_APPS).filter((app) => app.enabled);
}

/**
 * Generate webhook secret environment variable name from app ID
 * Pattern: com.example.app -> RAZORPAY_WEBHOOK_SECRET_COM_EXAMPLE_APP
 */
export function generateWebhookSecretEnvVar(appId: string): string {
  return `RAZORPAY_WEBHOOK_SECRET_${appId.replace(/\./g, '_').toUpperCase()}`;
}

/**
 * Get webhook secret environment variable name for a registered app
 * Returns null if app is not registered
 */
export function getWebhookSecretEnvVar(appId: string): string | null {
  if (!REGISTERED_APPS[appId]) {
    return null;
  }
  return generateWebhookSecretEnvVar(appId);
}

/**
 * Get all registered app IDs that have webhook secrets configured
 * (All registered apps should have webhook secrets)
 */
export function getRegisteredAppIdsWithWebhooks(): string[] {
  return getRegisteredAppIds();
}

/**
 * Derive a temp-email domain from an app's package name.
 * e.g. "com.jugnu.alertpe"  -> "jugnu.local"
 *      "com.dailyattendance.staffbook" -> "dailyattendance.local"
 */
export function getTempEmailDomain(appId: string): string {
  const parts = appId.split('.');
  const brand = parts.length >= 2 ? parts[1] : appId;
  return `${brand}.local`;
}

/**
 * Validate that all registered apps have proper webhook configuration
 * Throws error if any app is missing webhook secret env var (at runtime)
 */
export function validateWebhookConfiguration(): {
  valid: boolean;
  missing: string[];
  configured: string[];
} {
  const registeredAppIds = getRegisteredAppIds();
  const missing: string[] = [];
  const configured: string[] = [];

  for (const appId of registeredAppIds) {
    const envVar = getWebhookSecretEnvVar(appId);
    if (!envVar) {
      missing.push(appId);
    } else if (process.env[envVar]) {
      configured.push(appId);
    } else {
      missing.push(`${appId} (env: ${envVar})`);
    }
  }

  return {
    valid: missing.length === 0,
    missing,
    configured,
  };
}
