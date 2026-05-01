/**
 * Types for App Config Module
 */

// Plan display content stored in plans.metadata
export interface PlanDisplayContent {
  heading: string;
  description: string;
  buttonText: string;
  refundText: string;
  videoDescription: string;
}

// Translation entry stored in apps.settings.translations
export interface TranslationEntry {
  heading: string;
  description: string;
  buttonText: string;
  videoDescription: string;
}

// App settings stored in apps.settings JSONB
export interface AppSettings {
  features?: {
    subscription?: {
      plan_id?: string;
      trial_plan_id?: string;
      segment_plans?: Record<string, string>;
    };
    otpLogin?: boolean;
    truecallerLogin?: boolean;
    googleLogin?: boolean;
  };
  limits?: {
    maxOrdersPerDay?: number | null;
    maxOrdersPerMonth?: number | null;
    maxRecurringOrders?: number | null;
  };
  ui?: {
    theme?: string;
    supportedLanguages?: string[];
    defaultLanguage?: string;
  };
  videos?: Record<string, {
    fallback_video?: string;
    paywall_video?: string;
  }>;
  translations?: Record<string, TranslationEntry>;
  appUpdate?: {
    enabled?: boolean;
    forceUpdate?: boolean;
    minVersion?: string;
    latestVersion?: string;
    updateUrl?: string;
    updateTitle?: string;
    updateMessage?: string;
  };
  api?: {
    timeout?: number;
    retryAttempts?: number;
  };
}

// Unified plan from database (combines plans table + metadata)
export interface UnifiedPlanFromDb {
  plan_id: string;
  provider: 'RAZORPAY' | 'PHONEPE';
  pricing: {
    initialAmount: string;
    recurringAmount: string;
    period: string;
  };
  displayContent: PlanDisplayContent;
  providerConfig?: Record<string, unknown>;
}

// Config response structure (similar to v4)
export interface AppConfigResponse {
  app: {
    name: string;
    version: string;
    environment: string;
    id: string;
  };
  features: {
    subscription: {
      plan_id: string;
      provider: string;
      planDetails?: {
        plan_id: string;
        provider: string;
        pricing: {
          initialAmount: string;
          recurringAmount: string;
          period: string;
        };
        providerConfig?: Record<string, unknown>;
      };
    };
    otpLogin: boolean;
    truecallerLogin: boolean;
    googleLogin: boolean;
  };
  limits: {
    maxOrdersPerDay: number | null;
    maxOrdersPerMonth: number | null;
    maxRecurringOrders: number | null;
  };
  ui: {
    theme: string;
    supportedLanguages: string[];
    defaultLanguage: string;
    paywall: {
      pricing: {
        initialAmount: string;
        recurringAmount: string;
        period: string;
      };
      heading: string;
      description: string;
      videoUrl?: string;
      buttonText: string;
      videoDescription: string;
    };
  };
  videos?: Record<string, {
    fallback_video?: string;
    paywall_video?: string;
  }>;
  api: {
    timeout: number;
    retryAttempts: number;
  };
  appUpdate: {
    enabled: boolean;
    forceUpdate: boolean;
    minVersion: string;
    latestVersion: string;
    updateUrl: string;
    updateTitle: string;
    updateMessage: string;
  };
  _paywallMeta?: {
    version: string;
    plan_id: string;
    provider: string;
    language: string;
    selectionSource: string;
  };
}
