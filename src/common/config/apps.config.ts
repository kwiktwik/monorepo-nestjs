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
  'com.sharestatus.app': {
    id: 'com.sharestatus.app',
    name: 'ShareStatus',
    description: 'ShareStatus mobile application',
    enabled: true,
    rateLimit: {
      maxRequests: 100,
      windowMs: 15 * 60 * 1000, // 15 minutes
    },
    features: {
      otpLogin: true,
      truecallerLogin: true,
      googleLogin: true,
    },
  },
  'com.sharekaro.kirana': {
    id: 'com.sharekaro.kirana',
    name: 'ShareStatus Kirana',
    description: 'ShareStatus Kirana mobile application',
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
  'com.paymentalert.app': {
    id: 'com.paymentalert.app',
    name: 'Payment Alert',
    description: 'Payment Alert mobile application',
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
