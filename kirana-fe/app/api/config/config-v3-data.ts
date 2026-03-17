/**
 * Config data for v3 Config API with dynamic paywall.
 * Supports user type and deeplink campaign based plan selection.
 */
import { Gateway } from "@/lib/constants/gateway";

const SUBSCRIPTION_AMOUNT_INR = 199;

// ============================================================================
// PAYWALL PLANS
// ============================================================================

export const PAYWALL_PLANS = {
  STANDARD: {
    plan_id: "plan_standard_199",
    pricing: {
      initialAmount: "₹199",
      recurringAmount: "₹199",
      period: "month",
    },
    heading: "Standard Plan",
    description: "Get all premium features",
    buttonText: "Subscribe Now",
    priority: 1,
  },
  NEW_USER_WELCOME: {
    plan_id: "plan_new_user_welcome_99",
    pricing: {
      initialAmount: "₹99",
      recurringAmount: "₹199",
      period: "month",
    },
    heading: "Welcome Offer!",
    description: "Special 50% off for your first month",
    buttonText: "Claim Offer",
    priority: 2,
  },
  ABANDONED_CHECKOUT: {
    plan_id: "plan_abandoned_checkout_49",
    pricing: {
      initialAmount: "₹49",
      recurringAmount: "₹199",
      period: "month",
    },
    heading: "Wait! We have a special gift",
    description: "Get started for just ₹49 today",
    buttonText: "Don't Miss Out",
    priority: 3,
  },
  MARKETING_CAMPAIGN: {
    plan_id: "plan_marketing_campaign_79",
    pricing: {
      initialAmount: "₹79",
      recurringAmount: "₹199",
      period: "month",
    },
    heading: "Exclusive Campaign Offer!",
    description: "Limited time offer just for you",
    buttonText: "Grab Now",
    priority: 4,
  },
  LOYAL_USER: {
    plan_id: "plan_loyal_user_149",
    pricing: {
      initialAmount: "₹149",
      recurringAmount: "₹199",
      period: "month",
    },
    heading: "Loyalty Reward",
    description: "Thank you for being with us!",
    buttonText: "Claim Reward",
    priority: 5,
  },
  TRIAL_EXPIRED: {
    plan_id: "plan_trial_expired_59",
    pricing: {
      initialAmount: "₹59",
      recurringAmount: "₹199",
      period: "month",
    },
    heading: "Continue Your Journey",
    description: "Special price to welcome you back",
    buttonText: "Continue Now",
    priority: 6,
  },
} as const;

export type PlanType = keyof typeof PAYWALL_PLANS;

// ============================================================================
// USER TYPES
// ============================================================================

export const USER_TYPES = {
  NEW: "new",
  ACTIVE: "active",
  EXPIRED: "expired",
  ABANDONED: "abandoned",
  TRIAL_EXPIRED: "trial_expired",
  CHURNED: "churned",
} as const;

export type UserType = (typeof USER_TYPES)[keyof typeof USER_TYPES];

// ============================================================================
// DEEPLINK CAMPAIGNS
// ============================================================================

export const DEEPLINK_CAMPAIGNS = {
  NONE: "none",
  MARKETING_50_PERCENT: "marketing_50_percent",
  MARKETING_TRIAL: "marketing_trial",
  REFERRAL: "referral",
  RETARGETING: "retargeting",
  SEASONAL: "seasonal",
} as const;

export type DeeplinkCampaign =
  (typeof DEEPLINK_CAMPAIGNS)[keyof typeof DEEPLINK_CAMPAIGNS];

// ============================================================================
// PAYWALL RULES ENGINE
// ============================================================================

export interface PaywallContext {
  appId: string;
  userType: UserType;
  deeplink: DeeplinkCampaign;
}

export interface PaywallResult {
  plan: (typeof PAYWALL_PLANS)[PlanType];
  reason: string;
  ruleName: string;
}

/**
 * Simple rules engine for paywall plan selection
 * Evaluates rules by priority and returns the best matching plan
 */
export function determinePlan(context: PaywallContext): PaywallResult {
  const { userType, deeplink } = context;

  // Rule 1: Marketing Campaign - 50% off (highest priority for deeplink)
  if (deeplink === DEEPLINK_CAMPAIGNS.MARKETING_50_PERCENT) {
    return {
      plan: PAYWALL_PLANS.MARKETING_CAMPAIGN,
      reason: "User came from 50% marketing campaign",
      ruleName: "marketing_campaign_50_percent",
    };
  }

  // Rule 2: Referral Campaign
  if (deeplink === DEEPLINK_CAMPAIGNS.REFERRAL) {
    return {
      plan: PAYWALL_PLANS.NEW_USER_WELCOME,
      reason: "User came from referral",
      ruleName: "referral_campaign",
    };
  }

  // Rule 3: Retargeting Campaign for churned users
  if (
    deeplink === DEEPLINK_CAMPAIGNS.RETARGETING &&
    userType === USER_TYPES.CHURNED
  ) {
    return {
      plan: PAYWALL_PLANS.ABANDONED_CHECKOUT,
      reason: "Churned user from retargeting campaign",
      ruleName: "retargeting_churned",
    };
  }

  // Rule 4: Seasonal Campaign (any user type)
  if (deeplink === DEEPLINK_CAMPAIGNS.SEASONAL) {
    return {
      plan: PAYWALL_PLANS.MARKETING_CAMPAIGN,
      reason: "Seasonal promotional campaign",
      ruleName: "seasonal_campaign",
    };
  }

  // Rule 5: Marketing Trial Campaign
  if (
    deeplink === DEEPLINK_CAMPAIGNS.MARKETING_TRIAL &&
    (userType === USER_TYPES.NEW || userType === USER_TYPES.TRIAL_EXPIRED)
  ) {
    return {
      plan: PAYWALL_PLANS.TRIAL_EXPIRED,
      reason: "Marketing trial campaign for new/trial-expired users",
      ruleName: "marketing_trial",
    };
  }

  // Rule 6: Abandoned Checkout Users
  if (userType === USER_TYPES.ABANDONED) {
    return {
      plan: PAYWALL_PLANS.ABANDONED_CHECKOUT,
      reason: "User has abandoned checkout",
      ruleName: "abandoned_checkout",
    };
  }

  // Rule 7: Trial Expired Users
  if (userType === USER_TYPES.TRIAL_EXPIRED) {
    return {
      plan: PAYWALL_PLANS.TRIAL_EXPIRED,
      reason: "Trial period expired",
      ruleName: "trial_expired",
    };
  }

  // Rule 8: Churned Users (came back)
  if (userType === USER_TYPES.CHURNED) {
    return {
      plan: PAYWALL_PLANS.LOYAL_USER,
      reason: "Welcome back offer for churned user",
      ruleName: "churned_user",
    };
  }

  // Rule 9: New Users
  if (userType === USER_TYPES.NEW) {
    return {
      plan: PAYWALL_PLANS.NEW_USER_WELCOME,
      reason: "Welcome offer for new user",
      ruleName: "new_user",
    };
  }

  // Rule 10: Expired Subscription
  if (userType === USER_TYPES.EXPIRED) {
    return {
      plan: PAYWALL_PLANS.LOYAL_USER,
      reason: "Renewal offer for expired subscription",
      ruleName: "expired_subscription",
    };
  }

  // Rule 11: Active Users (should not see paywall normally, but fallback)
  if (userType === USER_TYPES.ACTIVE) {
    return {
      plan: PAYWALL_PLANS.STANDARD,
      reason: "Standard plan for active users",
      ruleName: "active_user",
    };
  }

  // Rule 12: Default Fallback
  return {
    plan: PAYWALL_PLANS.STANDARD,
    reason: "Default standard plan",
    ruleName: "default_fallback",
  };
}

// ============================================================================
// BASE CONFIGURATION
// ============================================================================

const baseConfig = {
  app: {
    name: "",
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
    id: "",
  },
  features: {
    subscription: { plan_id: "" },
    gateway: Gateway.RAZORPAY,
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
    otpLogin: true,
    truecallerLogin: true,
    googleLogin: true,
  },
  limits: {
    maxOrdersPerDay: null,
    maxOrdersPerMonth: null,
    maxRecurringOrders: null,
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
      videoUrl: "https://cnd.storyowl.app/assets/alertpay/alertpay.mp4",
      buttonText: "Buy Now",
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
    updateMessage:
      "A new version of the app is available. Please update to continue using the app.",
  },
};

// ============================================================================
// APP CONFIGURATIONS
// ============================================================================

export const APP_CONFIGS: Record<string, Record<string, unknown>> = {
  "com.paymentalert.app": {
    ...baseConfig,
    app: {
      ...baseConfig.app,
      name: "Payment Alert",
      id: "com.paymentalert.app",
    },
    features: {
      ...baseConfig.features,
      subscription: { plan_id: "plan_S3FaBrk7sjPQEU" },
    },
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
    appUpdate: {
      ...baseConfig.appUpdate,
      updateUrl:
        "https://play.google.com/store/apps/details?id=com.paymentalert.app",
    },
  },
  "com.sharekaro.kirana": {
    ...baseConfig,
    app: {
      ...baseConfig.app,
      name: "ShareKaro Kirana",
      id: "com.sharekaro.kirana",
    },
    features: {
      ...baseConfig.features,
      subscription: { plan_id: "plan_S3FaBrk7sjPQEU" },
    },
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
    appUpdate: {
      ...baseConfig.appUpdate,
      updateUrl:
        "https://play.google.com/store/apps/details?id=com.sharekaro.kirana",
    },
  },
  "com.kiranaapps.app": {
    ...baseConfig,
    app: {
      ...baseConfig.app,
      name: "Kirana Apps",
      id: "com.kiranaapps.app",
    },
    features: {
      ...baseConfig.features,
      subscription: { plan_id: "plan_S3FaBrk7sjPQEU" },
    },
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
    appUpdate: {
      ...baseConfig.appUpdate,
      updateUrl:
        "https://play.google.com/store/apps/details?id=com.kiranaapps.app",
    },
  },
  "com.sharestatus.app": {
    ...baseConfig,
    app: {
      ...baseConfig.app,
      name: "ShareStatus",
      id: "com.sharestatus.app",
    },
    features: {
      ...baseConfig.features,
      subscription: { plan_id: "plan_S3FaBrk7sjPQEU" },
    },
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
    appUpdate: {
      ...baseConfig.appUpdate,
      updateUrl:
        "https://play.google.com/store/apps/details?id=com.sharestatus.app",
    },
  },
};

export function getConfigForAppId(appId: string): Record<string, unknown> | null {
  const config = APP_CONFIGS[appId];
  return config ?? null;
}

export function getDynamicConfig(
  appId: string,
  context: PaywallContext
): Record<string, unknown> | null {
  const config = getConfigForAppId(appId);
  if (!config) return null;

  // Deep clone the config to avoid mutating the original
  const dynamicConfig = JSON.parse(JSON.stringify(config));

  // Determine the appropriate plan based on context
  const paywallResult = determinePlan(context);

  // Update the config with the selected plan
  dynamicConfig.features.subscription.plan_id = paywallResult.plan.plan_id;
  dynamicConfig.ui.paywall.pricing = paywallResult.plan.pricing;
  dynamicConfig.ui.paywall.heading = paywallResult.plan.heading;
  dynamicConfig.ui.paywall.description = paywallResult.plan.description;
  dynamicConfig.ui.paywall.buttonText = paywallResult.plan.buttonText;

  // Add metadata about why this plan was selected
  dynamicConfig._paywallMeta = {
    ruleName: paywallResult.ruleName,
    reason: paywallResult.reason,
    context: {
      appId: context.appId,
      userType: context.userType,
      deeplink: context.deeplink,
    },
  };

  return dynamicConfig;
}
