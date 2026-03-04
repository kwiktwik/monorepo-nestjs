/**
 * Shared config data for /api/config and /api/config/v1.
 * v1 filters by x-app-id; base route returns full map.
 */

const SUBSCRIPTION_AMOUNT_INR = 199;
const DISCOUNT_AMOUNT_INR = 99;

const alertpayConfig = {
  videos: {
    en: {
      fallback_video:
        "https://cnd.storyowl.app/assets/alertpay/Fallback%20video/English%20Fallback%20screen%20video%205%20mb.mp4",
      paywall_video:
        "https://cnd.storyowl.app/assets/alertpay/Free%20Trial/English%20Free%20Trial%20Video%209%20mb.mp4",
    },
    hi: {
      fallback_video:
        "https://cnd.storyowl.app/assets/alertpay/Fallback%20video/Hindi%20Fallback%20screen%20video%205%20mb.mp4",
      paywall_video:
        "https://cnd.storyowl.app/assets/alertpay/Free%20Trial/Hindi%20Free%20Trial%20Video%209%20mb.mp4",
    },
    bn: {
      fallback_video:
        "https://cnd.storyowl.app/assets/alertpay/Fallback%20video/Bengali%20Fallback%20screen.mp4",
      paywall_video:
        "https://cnd.storyowl.app/assets/alertpay/Free%20Trial/Bengali%20Trial%20Video.mp4",
    },
    mr: {
      fallback_video:
        "https://cnd.storyowl.app/assets/alertpay/Fallback%20video/Marathi%20Fallback%20screen.mp4",
      paywall_video:
        "https://cnd.storyowl.app/assets/alertpay/Free%20Trial/Marathi%20Trial%20Video.mp4",
    },
    te: {
      fallback_video:
        "https://cnd.storyowl.app/assets/alertpay/Fallback%20video/Telgu%20Fallback%20screen.mp4",
      paywall_video:
        "https://cnd.storyowl.app/assets/alertpay/Free%20Trial/Telgu%20Trial%20Video.mp4",
    },
    ta: {
      fallback_video:
        "https://cnd.storyowl.app/assets/alertpay/Fallback%20video/Tamil%20Fallback%20screen.mp4",
      paywall_video:
        "https://cnd.storyowl.app/assets/alertpay/Free%20Trial/Tamil%20Trial%20Video.mp4",
    },
    gu: {
      fallback_video:
        "https://cnd.storyowl.app/assets/alertpay/Fallback%20video/Gujrati%20Fallback%20screen.mp4",
      paywall_video:
        "https://cnd.storyowl.app/assets/alertpay/Free%20Trial/Gujrati%20Trial%20Video.mp4",
    },
    ur: {
      fallback_video:
        "https://cnd.storyowl.app/assets/alertpay/Fallback%20video/Punjabi%20Fallback%20screen.mp4",
      paywall_video:
        "https://cnd.storyowl.app/assets/alertpay/Free%20Trial/Punjabi%20Trial%20Video.mp4",
    },
    kn: {
      fallback_video:
        "https://cnd.storyowl.app/assets/alertpay/Fallback%20video/Kannada%20Fallback%20screen.mp4",
      paywall_video:
        "https://cnd.storyowl.app/assets/alertpay/Free%20Trial/Kannada%20Trial%20Video.mp4",
    },
    or: {
      fallback_video:
        "https://cnd.storyowl.app/assets/alertpay/Fallback%20video/English%20Fallback%20screen%20video%205%20mb.mp4",
      paywall_video:
        "https://cnd.storyowl.app/assets/alertpay/Free%20Trial/English%20Free%20Trial%20Video%209%20mb.mp4",
    },
    ml: {
      fallback_video:
        "https://cnd.storyowl.app/assets/alertpay/Fallback%20video/Malyalam%20Fallback%20screen.mp4",
      paywall_video:
        "https://cnd.storyowl.app/assets/alertpay/Free%20Trial/Malyalam%20Trial%20Video.mp4",
    },
  },
  app: {
    name: "AlertPay",
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
  },
  features: {
    subscription: {
      plan_id: "plan_S3FaBrk7sjPQEU",
      discount_plan_id: "plan_SL3uNUOHS4ouiR",
      discount_amount: DISCOUNT_AMOUNT_INR,
    },
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
    paywall: {
      pricing: {
        initialAmount: "₹5",
        recurringAmount: `₹${SUBSCRIPTION_AMOUNT_INR}`,
        period: "month",
      },
      heading: "Never miss a payment",
      description: "Trusted by businesses across India",
      videoUrl: "https://cnd.storyowl.app/assets/alertpay/free-trail.mp4",
      fallbackVideoUrl:
        "https://cnd.storyowl.app/assets/alertpay/Labour%20b%20.mp4",
    },
    theme: "light",
    supportedLanguages: ["en", "hi"],
    defaultLanguage: "en",
  },
  api: {
    timeout: 30000,
    retryAttempts: 3,
  },
};

const defaultConfig = {
  app: {
    name: "AlertPay",
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
  },
  features: {
    subscription: {
      plan_id: "plan_S3FaBrk7sjPQEU",
      discount_plan_id: "plan_SL3uNUOHS4ouiR",
      discount_amount: DISCOUNT_AMOUNT_INR,
    },
    order: {
      amount: 500,
      currency: "INR",
      payment_method: "upi",
      isRecurring: true,
      token: {
        frequency: "monthly",
        max_amount: SUBSCRIPTION_AMOUNT_INR * 100,
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
    paywall: {
      pricing: {
        initialAmount: "₹5",
        recurringAmount: `₹${SUBSCRIPTION_AMOUNT_INR}`,
        period: "month",
      },
      heading: "Never miss a payment",
      description: "Trusted by businesses across India",
      videoUrl: "https://cnd.storyowl.app/assets/alertpay/free-trail.mp4",
    },
    theme: "light",
    supportedLanguages: ["en", "hi"],
    defaultLanguage: "en",
  },
  api: {
    timeout: 30000,
    retryAttempts: 3,
  },
};

const jamunConfig = {
  app: {
    name: "Jamun",
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
  },
  features: {
    subscription: {
      plan_id: "plan_S3FaBrk7sjPQEU",
      discount_plan_id: "plan_SL3uNUOHS4ouiR",
      discount_amount: DISCOUNT_AMOUNT_INR,
    },
    order: {
      amount: 500,
      currency: "INR",
      payment_method: "upi",
      isRecurring: true,
      token: {
        frequency: "monthly",
        max_amount: SUBSCRIPTION_AMOUNT_INR * 100,
        expire_at: 1735689600,
      },
    },
  },
  limits: {
    maxOrdersPerDay: null,
    maxOrdersPerMonth: null,
    maxRecurringOrders: null,
  },
  ui: {
    paywall: {
      pricing: {
        initialAmount: "₹5",
        recurringAmount: `₹${SUBSCRIPTION_AMOUNT_INR}`,
        period: "month",
      },
      heading: "Never miss a payment",
      description: "Trusted by businesses across India",
      videoUrl: "https://cnd.storyowl.app/assets/alertpay/alertpay.mp4",
    },
    theme: "light",
    supportedLanguages: ["en", "hi"],
    defaultLanguage: "en",
  },
  api: { timeout: 30000, retryAttempts: 3 },
};

const kwiktwikConfig = {
  app: {
    name: "KwikTwik Sanatan",
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
  },
  features: {
    subscription: {
      plan_id: "plan_S3FaBrk7sjPQEU",
      discount_plan_id: "plan_SL3uNUOHS4ouiR",
      discount_amount: DISCOUNT_AMOUNT_INR,
    },
    order: {
      amount: 500,
      currency: "INR",
      payment_method: "upi",
      isRecurring: true,
      token: {
        frequency: "monthly",
        max_amount: SUBSCRIPTION_AMOUNT_INR * 100,
        expire_at: 1735689600,
      },
    },
  },
  limits: {
    maxOrdersPerDay: null,
    maxOrdersPerMonth: null,
    maxRecurringOrders: null,
  },
  ui: {
    paywall: {
      pricing: {
        initialAmount: "₹5",
        recurringAmount: `₹${SUBSCRIPTION_AMOUNT_INR}`,
        period: "month",
      },
      heading: "Never miss a payment",
      description: "Trusted by businesses across India",
      videoUrl:
        "https://cnd.storyowl.app/assets/kwiktwik/kwiktwik-sanatan.mp4",
    },
    theme: "light",
    supportedLanguages: ["en", "hi"],
    defaultLanguage: "en",
  },
  api: { timeout: 30000, retryAttempts: 3 },
};

/** com.paymentalert.app: same as alertpayConfig but with plan_SHgypikeI443LO */
const paymentalertAppConfig = {
  ...alertpayConfig,
  features: {
    ...alertpayConfig.features,
    subscription: {
      plan_id: "plan_SHgypikeI443LO",
      discount_plan_id: "plan_SL3uNUOHS4ouiR",
      discount_amount: DISCOUNT_AMOUNT_INR,
    },
  },
};

/**
 * App-id → config. Used by GET /api/config (full map).
 * Contract: Existing clients (e.g. Android) expect response.data to contain
 * these keys; e.g. data["alertpay-android"]. Do not remove or rename keys.
 */
const APP_CONFIG_MAP: Record<string, Record<string, unknown>> = {
  "com.sharestatus.app": jamunConfig,
  "com.sharekaro.kirana": jamunConfig,
  "kwiktwik-sanatan": kwiktwikConfig,
  "com.paymentalert.app": paymentalertAppConfig,
  "com.kiranaapps.app": alertpayConfig,
  "alertpay-android": alertpayConfig,
};

/**
 * Full config map for GET /api/config. Preserves existing response shape:
 * { success, data: { [appId]: config, ..., app, features, limits, ui, api } }
 */
export function getFullConfig(): Record<string, unknown> {
  return {
    ...APP_CONFIG_MAP,
    app: defaultConfig.app,
    features: defaultConfig.features,
    limits: defaultConfig.limits,
    ui: defaultConfig.ui,
    api: defaultConfig.api,
  };
}

/**
 * Get config for a single app. Use in GET /api/config/v1 with x-app-id.
 * Returns app-specific config if found, otherwise default config.
 */
export function getConfigForAppId(appId: string | null): Record<string, unknown> {
  if (appId && APP_CONFIG_MAP[appId]) {
    return APP_CONFIG_MAP[appId] as Record<string, unknown>;
  }
  return defaultConfig as Record<string, unknown>;
}
