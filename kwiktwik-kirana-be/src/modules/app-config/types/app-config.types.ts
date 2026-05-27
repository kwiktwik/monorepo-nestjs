/**
 * Types for App Config Module
 */

import type { AppSettingsOutput } from '../../../common/config/config.schemas';

// --------------------------------------------------------------------------
// Legacy AppSettings interface (used by paywall module etc.) — kept as-is
// so other APIs are not affected.
// --------------------------------------------------------------------------

export interface TranslationEntry {
  heading: string;
  description: string;
  buttonText: string;
  videoDescription: string;
}

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

// --------------------------------------------------------------------------
// v1/config response — derived from Zod-validated DB settings passthrough
// --------------------------------------------------------------------------

export type AppConfigResponse = {
  app: { name: string; id: string };
} & AppSettingsOutput;
