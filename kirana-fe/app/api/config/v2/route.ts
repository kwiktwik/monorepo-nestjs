import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/better-auth/auth";
import { validateAppId, AppValidationError } from "@/lib/utils/app-validator";
import { REGISTERED_APPS } from "@/lib/config/apps";
import { Gateway } from "@/lib/constants/gateway";

const SUBSCRIPTION_AMOUNT_INR = 199;

// Type definitions for config structure
interface ConfigFeatures {
  subscription?: {
    plan_id?: string;
  };
  order?: {
    amount?: number;
    currency?: string;
    payment_method?: string;
    isRecurring?: boolean;
    token?: {
      frequency?: string;
      max_amount?: number;
      expire_at?: number;
    };
  };
}

interface ConfigUI {
  paywall?: {
    pricing?: {
      initialAmount?: string;
      recurringAmount?: string;
      period?: string;
    };
  };
}

interface AppConfig {
  features?: ConfigFeatures;
  ui?: ConfigUI;
  [key: string]: unknown;
}

/**
 * Global Base Configuration (Defaults for all apps)
 */
const BASE_CONFIG = {
  app: {
    name: "AlertPay",
    version: "1.0.0",
    environment: process.env.NODE_ENV as "development" | "production" | "test" || "development",
  },
  features: {
    subscription: {
      plan_id: "plan_S3FaBrk7sjPQEU",
    },
    gateway: Gateway.RAZORPAY,
    order: {
      amount: 500,
      currency: "INR",
      payment_method: "upi",
      isRecurring: true,
      token: {
        frequency: "monthly",
        max_amount: SUBSCRIPTION_AMOUNT_INR * 100, // in paise
        expire_at: 1735689600,
      },
    },
  },
  limits: {
    maxOrdersPerDay: 100,
    maxOrdersPerMonth: 1000,
    maxRecurringOrders: 10,
  },
  ui: {
    theme: "light",
    supportedLanguages: ["en", "hi"],
    defaultLanguage: "en",
    paywall: {
      pricing: {
        initialAmount: "₹5",
        recurringAmount: `₹${SUBSCRIPTION_AMOUNT_INR}`,
        period: "month",
      },
      heading: "Never miss a payment",
      description: "Trusted by businesses across India",
    },
  },
  api: {
    timeout: 30000,
    retryAttempts: 3,
  },
  appUpdate: {
    enabled: false,
    forceUpdate: false,
    minVersion: "1.0.0",
    latestVersion: "1.0.0",
    updateUrl: "",
    updateTitle: "Update Available",
    updateMessage: "A new version of the app is available. Please update to continue using the app.",
  },
};

const alertpayOverrides = {
  videos: {
    en: {
      fallback_video: "https://cnd.storyowl.app/assets/alertpay/Fallback%20video/English%20Fallback%20screen%20video%205%20mb.mp4",
      paywall_video: "https://cnd.storyowl.app/assets/alertpay/Free%20Trial/English%20Free%20Trial%20Video%209%20mb.mp4",
    },
    hi: {
      fallback_video: "https://cnd.storyowl.app/assets/alertpay/Fallback%20video/Hindi%20Fallback%20screen%20video%205%20mb.mp4",
      paywall_video: "https://cnd.storyowl.app/assets/alertpay/Free%20Trial/Hindi%20Free%20Trial%20Video%209%20mb.mp4",
    },
    bn: {
      fallback_video: "https://cnd.storyowl.app/assets/alertpay/Fallback%20video/Bengali%20Fallback%20screen.mp4",
      paywall_video: "https://cnd.storyowl.app/assets/alertpay/Free%20Trial/Bengali%20Trial%20Video.mp4",
    },
    mr: {
      fallback_video: "https://cnd.storyowl.app/assets/alertpay/Fallback%20video/Marathi%20Fallback%20screen.mp4",
      paywall_video: "https://cnd.storyowl.app/assets/alertpay/Free%20Trial/Marathi%20Trial%20Video.mp4",
    },
    te: {
      fallback_video: "https://cnd.storyowl.app/assets/alertpay/Fallback%20video/Telgu%20Fallback%20screen.mp4",
      paywall_video: "https://cnd.storyowl.app/assets/alertpay/Free%20Trial/Telgu%20Trial%20Video.mp4",
    },
    ta: {
      fallback_video: "https://cnd.storyowl.app/assets/alertpay/Fallback%20video/Tamil%20Fallback%20screen.mp4",
      paywall_video: "https://cnd.storyowl.app/assets/alertpay/Free%20Trial/Tamil%20Trial%20Video.mp4",
    },
    gu: {
      fallback_video: "https://cnd.storyowl.app/assets/alertpay/Fallback%20video/Gujrati%20Fallback%20screen.mp4",
      paywall_video: "https://cnd.storyowl.app/assets/alertpay/Free%20Trial/Gujrati%20Trial%20Video.mp4",
    },
    ur: {
      fallback_video: "https://cnd.storyowl.app/assets/alertpay/Fallback%20video/Punjabi%20Fallback%20screen.mp4",
      paywall_video: "https://cnd.storyowl.app/assets/alertpay/Free%20Trial/Punjabi%20Trial%20Video.mp4",
    },
    kn: {
      fallback_video: "https://cnd.storyowl.app/assets/alertpay/Fallback%20video/Kannada%20Fallback%20screen.mp4",
      paywall_video: "https://cnd.storyowl.app/assets/alertpay/Free%20Trial/Kannada%20Trial%20Video.mp4",
    },
    or: {
      fallback_video: "https://cnd.storyowl.app/assets/alertpay/Fallback%20video/English%20Fallback%20screen%20video%205%20mb.mp4",
      paywall_video: "https://cnd.storyowl.app/assets/alertpay/Free%20Trial/English%20Free%20Trial%20Video%209%20mb.mp4",
    },
    ml: {
      fallback_video: "https://cnd.storyowl.app/assets/alertpay/Fallback%20video/Malyalam%20Fallback%20screen.mp4",
      paywall_video: "https://cnd.storyowl.app/assets/alertpay/Free%20Trial/Malyalam%20Trial%20Video.mp4",
    },
  },
  ui: {
    paywall: {
      videoUrl: "https://cnd.storyowl.app/assets/alertpay/free-trail.mp4",
      fallbackVideoUrl: "https://cnd.storyowl.app/assets/alertpay/Labour%20b%20.mp4",
    },
  },
};

const jamunOverrides = {
  limits: { maxOrdersPerDay: null, maxOrdersPerMonth: null, maxRecurringOrders: null },
  ui: { paywall: { videoUrl: "https://cnd.storyowl.app/assets/alertpay/alertpay.mp4" } },
};

const kiranaappsOverrides = {
  ...alertpayOverrides,
  appUpdate: {
    enabled: true,
    forceUpdate: false,
    minVersion: "1.0.0",
    latestVersion: "1.0.13",
    updateTitle: "Update Available",
    updateMessage: "A new version of the app is available with the latest improvements.",
  },
};

const PACKAGE_OVERRIDES: Record<string, Record<string, any>> = {
  "com.paymentalert.app": alertpayOverrides,
  "com.kiranaapps.app": kiranaappsOverrides,
  "com.sharestatus.app": jamunOverrides,
  "com.sharekaro.kirana": jamunOverrides,
};

function getConfigForAppId(appId: string | null): Record<string, unknown> | null {
  if (!appId) return null;

  const appMeta = REGISTERED_APPS[appId];
  const overrides = PACKAGE_OVERRIDES[appId];
  if (!overrides && !appMeta) return null;

  return {
    ...BASE_CONFIG,
    ...overrides,
    app: {
      ...BASE_CONFIG.app,
      ...(overrides?.app || {}),
      name: appMeta?.name || (overrides?.app as any)?.name || BASE_CONFIG.app.name,
      id: appId,
    },
    features: {
      ...BASE_CONFIG.features,
      ...(overrides?.features || {}),
      ...(appMeta?.features || {}),
    },
    ui: {
      ...BASE_CONFIG.ui,
      ...(overrides?.ui || {}),
      paywall: {
        ...BASE_CONFIG.ui.paywall,
        ...(overrides?.ui?.paywall || {}),
      },
    },
    limits: {
      ...BASE_CONFIG.limits,
      ...(overrides?.limits || {}),
    },
    videos: overrides?.videos || (BASE_CONFIG as any).videos || {},
    appUpdate: {
      ...BASE_CONFIG.appUpdate,
      ...(overrides?.appUpdate || {}),
      updateUrl:
        (overrides?.appUpdate as { updateUrl?: string } | undefined)?.updateUrl ??
        (appId.includes(".")
          ? `https://play.google.com/store/apps/details?id=${appId}`
          : ""),
    },
  } as Record<string, unknown>;
}

/**
 * GET /api/config/v2
 *
 * Fetch application configuration for the requesting app only.
 * Filters config by x-app-id (or x-app-identifier) header.
 *
 * - If x-app-id is present and matches a known app → returns that app's config.
 * - If x-app-id is missing or unknown → returns 401 Unauthorized.
 *
 * Requires authentication via Better Auth session.
 *
 * Response:
 * - 200: Configuration data for the app
 * - 401: Unauthorized - no valid session or invalid/missing app ID
 * - 500: Internal server error
 */
export async function GET(req: NextRequest) {
  try {
    // Validate app ID from headers
    let appId: string;
    try {
      appId = validateAppId(req);
    } catch (error) {
      if (error instanceof AppValidationError) {
        return NextResponse.json(
          { error: error.message },
          { status: error.statusCode || 401 },
        );
      }
      throw error;
    }

    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized - no valid session" },
        { status: 401 },
      );
    }

    const config = getConfigForAppId(appId) as AppConfig;

    if (!config) {
      return NextResponse.json(
        { error: `Configuration not found for app ID: ${appId}` },
        { status: 401 },
      );
    }

    return NextResponse.json(
      { success: true, appId, config },
      { status: 200 },
    );
  } catch (error) {
    console.error("[GET /api/config/v2] Error:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message || "Failed to fetch config" },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
