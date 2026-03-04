/**
 * Multi-App Configuration System
 *
 * Defines registered applications and their configurations.
 * Only apps defined here can authenticate users via the API.
 */

import { Gateway } from "../constants/gateway";

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
    gateway?: Gateway;
  };
}

/**
 * Registered applications
 * Add new apps here to enable them for authentication
 */
export const REGISTERED_APPS: Record<string, AppConfig> = {
  "com.sharestatus.app": {
    id: "com.sharestatus.app",
    name: "ShareStatus",
    description: "ShareStatus mobile application",
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
  "com.sharekaro.kirana": {
    id: "com.sharekaro.kirana",
    name: "ShareStatus Kirana",
    description: "ShareStatus Kirana mobile application",
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
  "alertpay-android": {
    id: "alertpay-android",
    name: "AlertPay Android",
    description: "AlertPay Android mobile application",
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
  "com.paymentalert.app": {
    id: "com.paymentalert.app",
    name: "AlertPay (com.paymentalert.app)",
    description: "AlertPay Android mobile application (New Package Name)",
    enabled: true,
    rateLimit: {
      maxRequests: 99999,
      windowMs: 15 * 60 * 1000, // 15 minutes
    },
    features: {
      otpLogin: true,
      truecallerLogin: true,
      googleLogin: true,
    },
  },
  "alertpay-ios": {
    id: "alertpay-ios",
    name: "AlertPay iOS",
    description: "AlertPay iOS mobile application",
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
  "alertpay-web": {
    id: "alertpay-web",
    name: "AlertPay Web",
    description: "AlertPay web application",
    enabled: true,
    rateLimit: {
      maxRequests: 100,
      windowMs: 15 * 60 * 1000,
    },
    features: {
      otpLogin: true,
      truecallerLogin: false, // Truecaller typically not available on web
      googleLogin: true,
    },
  },
  "alertpay-default": {
    id: "alertpay-default",
    name: "AlertPay Default",
    description: "Default app for backward compatibility with existing users",
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
  "kwiktwik-sanatan": {
    id: "kwiktwik-sanatan",
    name: "KwikTwik Sanatan",
    description: "KwikTwik Sanatan mobile application",
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
  "com.kiranaapps.app": {
    id: "com.kiranaapps.app",
    name: "Kirana Apps",
    description: "Kirana Apps mobile application",
    enabled: true,
    rateLimit: {
      maxRequests: 999999,
      windowMs: 15 * 60 * 1000, // 15 minutes
    },
    features: {
      otpLogin: true,
      truecallerLogin: true,
      googleLogin: true,
    },
  },
};

/**
 * Default app ID for backward compatibility
 */
export const DEFAULT_APP_ID = "alertpay-default";

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
