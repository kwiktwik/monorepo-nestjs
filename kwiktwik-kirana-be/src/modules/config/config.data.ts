const SUBSCRIPTION_AMOUNT_INR = 199;

// ============================================================================
// PAYWALL PLANS
// ============================================================================

export const PAYWALL_PLANS = {
  STANDARD: {
    plan_id: 'plan_standard_199',
    pricing: {
      initialAmount: '₹199',
      recurringAmount: '₹199',
      period: 'month',
    },
    heading: 'Standard Plan',
    description: 'Get all premium features',
    buttonText: 'Subscribe Now',
    priority: 1,
  },
  NEW_USER_WELCOME: {
    plan_id: 'plan_new_user_welcome_99',
    pricing: {
      initialAmount: '₹99',
      recurringAmount: '₹199',
      period: 'month',
    },
    heading: 'Welcome Offer!',
    description: 'Special 50% off for your first month',
    buttonText: 'Claim Offer',
    priority: 2,
  },
  ABANDONED_CHECKOUT: {
    plan_id: 'plan_abandoned_checkout_49',
    pricing: {
      initialAmount: '₹49',
      recurringAmount: '₹199',
      period: 'month',
    },
    heading: 'Wait! We have a special gift',
    description: 'Get started for just ₹49 today',
    buttonText: "Don't Miss Out",
    priority: 3,
  },
  MARKETING_CAMPAIGN: {
    plan_id: 'plan_marketing_campaign_79',
    pricing: {
      initialAmount: '₹79',
      recurringAmount: '₹199',
      period: 'month',
    },
    heading: 'Exclusive Campaign Offer!',
    description: 'Limited time offer just for you',
    buttonText: 'Grab Now',
    priority: 4,
  },
  LOYAL_USER: {
    plan_id: 'plan_loyal_user_149',
    pricing: {
      initialAmount: '₹149',
      recurringAmount: '₹199',
      period: 'month',
    },
    heading: 'Loyalty Reward',
    description: 'Thank you for being with us!',
    buttonText: 'Claim Reward',
    priority: 5,
  },
  TRIAL_EXPIRED: {
    plan_id: 'plan_trial_expired_59',
    pricing: {
      initialAmount: '₹59',
      recurringAmount: '₹199',
      period: 'month',
    },
    heading: 'Continue Your Journey',
    description: 'Special price to welcome you back',
    buttonText: 'Continue Now',
    priority: 6,
  },
} as const;

export type PlanType = keyof typeof PAYWALL_PLANS;

// ============================================================================
// USER TYPES
// ============================================================================

export const USER_TYPES = {
  NEW: 'new',                    // Brand new user, never subscribed
  ACTIVE: 'active',              // Currently active subscription
  EXPIRED: 'expired',            // Subscription expired
  ABANDONED: 'abandoned',        // Started checkout but didn't complete
  TRIAL_EXPIRED: 'trial_expired', // Trial period ended
  CHURNED: 'churned',            // Previously subscribed, now cancelled
} as const;

export type UserType = (typeof USER_TYPES)[keyof typeof USER_TYPES];

// ============================================================================
// DEEPLINK CAMPAIGNS
// ============================================================================

export const DEEPLINK_CAMPAIGNS = {
  NONE: 'none',
  MARKETING_50_PERCENT: 'marketing_50_percent',
  MARKETING_TRIAL: 'marketing_trial',
  REFERRAL: 'referral',
  RETARGETING: 'retargeting',
  SEASONAL: 'seasonal',
} as const;

export type DeeplinkCampaign = (typeof DEEPLINK_CAMPAIGNS)[keyof typeof DEEPLINK_CAMPAIGNS];

// ============================================================================
// JSON RULES ENGINE - PAYWALL RULES
// ============================================================================

export const PAYWALL_RULES = [
  // Rule 1: Marketing Campaign - 50% off (highest priority for deeplink)
  {
    name: 'marketing_campaign_50_percent',
    conditions: {
      all: [
        { fact: 'deeplink', operator: 'equal', value: DEEPLINK_CAMPAIGNS.MARKETING_50_PERCENT },
      ],
    },
    event: {
      type: 'marketing_campaign_50_percent',
      params: {
        plan: PAYWALL_PLANS.MARKETING_CAMPAIGN,
        reason: 'User came from 50% marketing campaign',
        priority: 100,
      },
    },
    priority: 100,
  },

  // Rule 2: Referral Campaign
  {
    name: 'referral_campaign',
    conditions: {
      all: [
        { fact: 'deeplink', operator: 'equal', value: DEEPLINK_CAMPAIGNS.REFERRAL },
      ],
    },
    event: {
      type: 'referral_campaign',
      params: {
        plan: PAYWALL_PLANS.NEW_USER_WELCOME,
        reason: 'User came from referral',
        priority: 90,
      },
    },
    priority: 90,
  },

  // Rule 3: Retargeting Campaign for churned users
  {
    name: 'retargeting_churned',
    conditions: {
      all: [
        { fact: 'userType', operator: 'equal', value: USER_TYPES.CHURNED },
        { fact: 'deeplink', operator: 'equal', value: DEEPLINK_CAMPAIGNS.RETARGETING },
      ],
    },
    event: {
      type: 'retargeting_churned',
      params: {
        plan: PAYWALL_PLANS.ABANDONED_CHECKOUT,
        reason: 'Churned user from retargeting campaign',
        priority: 95,
      },
    },
    priority: 95,
  },

  // Rule 4: Seasonal Campaign (any user type)
  {
    name: 'seasonal_campaign',
    conditions: {
      all: [
        { fact: 'deeplink', operator: 'equal', value: DEEPLINK_CAMPAIGNS.SEASONAL },
      ],
    },
    event: {
      type: 'seasonal_campaign',
      params: {
        plan: PAYWALL_PLANS.MARKETING_CAMPAIGN,
        reason: 'Seasonal promotional campaign',
        priority: 85,
      },
    },
    priority: 85,
  },

  // Rule 5: Marketing Trial Campaign
  {
    name: 'marketing_trial',
    conditions: {
      all: [
        { fact: 'deeplink', operator: 'equal', value: DEEPLINK_CAMPAIGNS.MARKETING_TRIAL },
        { fact: 'userType', operator: 'in', value: [USER_TYPES.NEW, USER_TYPES.TRIAL_EXPIRED] },
      ],
    },
    event: {
      type: 'marketing_trial',
      params: {
        plan: PAYWALL_PLANS.TRIAL_EXPIRED,
        reason: 'Marketing trial campaign for new/trial-expired users',
        priority: 80,
      },
    },
    priority: 80,
  },

  // Rule 6: Abandoned Checkout Users
  {
    name: 'abandoned_checkout',
    conditions: {
      all: [
        { fact: 'userType', operator: 'equal', value: USER_TYPES.ABANDONED },
      ],
    },
    event: {
      type: 'abandoned_checkout',
      params: {
        plan: PAYWALL_PLANS.ABANDONED_CHECKOUT,
        reason: 'User has abandoned checkout',
        priority: 70,
      },
    },
    priority: 70,
  },

  // Rule 7: Trial Expired Users
  {
    name: 'trial_expired',
    conditions: {
      all: [
        { fact: 'userType', operator: 'equal', value: USER_TYPES.TRIAL_EXPIRED },
      ],
    },
    event: {
      type: 'trial_expired',
      params: {
        plan: PAYWALL_PLANS.TRIAL_EXPIRED,
        reason: 'Trial period expired',
        priority: 60,
      },
    },
    priority: 60,
  },

  // Rule 8: Churned Users (came back)
  {
    name: 'churned_user',
    conditions: {
      all: [
        { fact: 'userType', operator: 'equal', value: USER_TYPES.CHURNED },
      ],
    },
    event: {
      type: 'churned_user',
      params: {
        plan: PAYWALL_PLANS.LOYAL_USER,
        reason: 'Welcome back offer for churned user',
        priority: 50,
      },
    },
    priority: 50,
  },

  // Rule 9: New Users
  {
    name: 'new_user',
    conditions: {
      all: [
        { fact: 'userType', operator: 'equal', value: USER_TYPES.NEW },
      ],
    },
    event: {
      type: 'new_user',
      params: {
        plan: PAYWALL_PLANS.NEW_USER_WELCOME,
        reason: 'Welcome offer for new user',
        priority: 40,
      },
    },
    priority: 40,
  },

  // Rule 10: Expired Subscription
  {
    name: 'expired_subscription',
    conditions: {
      all: [
        { fact: 'userType', operator: 'equal', value: USER_TYPES.EXPIRED },
      ],
    },
    event: {
      type: 'expired_subscription',
      params: {
        plan: PAYWALL_PLANS.LOYAL_USER,
        reason: 'Renewal offer for expired subscription',
        priority: 30,
      },
    },
    priority: 30,
  },

  // Rule 11: Active Users (should not see paywall normally, but fallback)
  {
    name: 'active_user',
    conditions: {
      all: [
        { fact: 'userType', operator: 'equal', value: USER_TYPES.ACTIVE },
      ],
    },
    event: {
      type: 'active_user',
      params: {
        plan: PAYWALL_PLANS.STANDARD,
        reason: 'Standard plan for active users',
        priority: 10,
      },
    },
    priority: 10,
  },

  // Rule 12: Default Fallback - This should ALWAYS match
  {
    name: 'default_fallback',
    conditions: {
      any: [
        { fact: 'userType', operator: 'equal', value: USER_TYPES.NEW },
        { fact: 'userType', operator: 'equal', value: USER_TYPES.ACTIVE },
        { fact: 'userType', operator: 'equal', value: USER_TYPES.EXPIRED },
        { fact: 'userType', operator: 'equal', value: USER_TYPES.ABANDONED },
        { fact: 'userType', operator: 'equal', value: USER_TYPES.TRIAL_EXPIRED },
        { fact: 'userType', operator: 'equal', value: USER_TYPES.CHURNED },
      ],
    },
    event: {
      type: 'default_fallback',
      params: {
        plan: PAYWALL_PLANS.STANDARD,
        reason: 'Default standard plan',
        priority: 1,
      },
    },
    priority: 1,
  },
];

// ============================================================================
// LEGACY MOCK PLANS (keeping for backward compatibility)
// ============================================================================

export const MOCK_PLANS = {
  STANDARD: PAYWALL_PLANS.STANDARD,
  NEW_USER_OFFER: PAYWALL_PLANS.NEW_USER_WELCOME,
  RECOVERY_OFFER: PAYWALL_PLANS.ABANDONED_CHECKOUT,
};

type SubscriptionConfig = {
  plan_id: string;
  trial_plan_id?: string;
  segment_plans?: Record<string, string>;
};

const baseConfig = {
  app: {
    name: '',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    id: '',
  },
  features: {
    subscription: { plan_id: '' } as SubscriptionConfig,
    gateway: 'RAZORPAY',
    order: {
      amount: 500,
      currency: 'INR',
      payment_method: 'upi',
      isRecurring: true,
      token: {
        frequency: 'monthly',
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
    theme: 'light',
    supportedLanguages: ['en', 'hi'],
    defaultLanguage: 'en',
    paywall: {
      pricing: {
        initialAmount: '₹5',
        recurringAmount: `₹${SUBSCRIPTION_AMOUNT_INR}`,
        period: 'month',
      },
      heading: 'Never miss a payment',
      description: 'Trusted by businesses across India',
      videoUrl: 'https://cnd.storyowl.app/assets/alertpay/alertpay.mp4',
      buttonText: 'Buy Now',
    },
  },
  api: {
    timeout: 30000,
    retryAttempts: 3,
  },
  appUpdate: {
    enabled: false,
    forceUpdate: false,
    minVersion: '1.0.0',
    latestVersion: '1.0.0',
    updateUrl: '',
    updateTitle: 'Update Available',
    updateMessage:
      'A new version of the app is available. Please update to continue using the app.',
  },
};

export const APP_CONFIGS = {
  'com.paymentalert.app': {
    ...baseConfig,
    app: {
      ...baseConfig.app,
      name: 'Payment Alert',
      id: 'com.paymentalert.app',
    },
    features: {
      ...baseConfig.features,
      subscription: { plan_id: 'plan_S3FaBrk7sjPQEU' } as SubscriptionConfig,
    },
    videos: {
      en: {
        fallback_video:
          'https://cnd.storyowl.app/assets/alertpay/Fallback%20video/English%20Fallback%20screen%20video%205%20mb.mp4',
        paywall_video:
          'https://cnd.storyowl.app/assets/alertpay/Free%20Trial/English%20Free%20Trial%20Video%209%20mb.mp4',
      },
      hi: {
        fallback_video:
          'https://cnd.storyowl.app/assets/alertpay/Fallback%20video/Hindi%20Fallback%20screen%20video%205%20mb.mp4',
        paywall_video:
          'https://cnd.storyowl.app/assets/alertpay/Free%20Trial/Hindi%20Free%20Trial%20Video%209%20mb.mp4',
      },
      bn: {
        fallback_video:
          'https://cnd.storyowl.app/assets/alertpay/Fallback%20video/Bengali%20Fallback%20screen.mp4',
        paywall_video:
          'https://cnd.storyowl.app/assets/alertpay/Free%20Trial/Bengali%20Trial%20Video.mp4',
      },
      mr: {
        fallback_video:
          'https://cnd.storyowl.app/assets/alertpay/Fallback%20video/Marathi%20Fallback%20screen.mp4',
        paywall_video:
          'https://cnd.storyowl.app/assets/alertpay/Free%20Trial/Marathi%20Trial%20Video.mp4',
      },
      te: {
        fallback_video:
          'https://cnd.storyowl.app/assets/alertpay/Fallback%20video/Telgu%20Fallback%20screen.mp4',
        paywall_video:
          'https://cnd.storyowl.app/assets/alertpay/Free%20Trial/Telgu%20Trial%20Video.mp4',
      },
      ta: {
        fallback_video:
          'https://cnd.storyowl.app/assets/alertpay/Fallback%20video/Tamil%20Fallback%20screen.mp4',
        paywall_video:
          'https://cnd.storyowl.app/assets/alertpay/Free%20Trial/Tamil%20Trial%20Video.mp4',
      },
      gu: {
        fallback_video:
          'https://cnd.storyowl.app/assets/alertpay/Fallback%20video/Gujrati%20Fallback%20screen.mp4',
        paywall_video:
          'https://cnd.storyowl.app/assets/alertpay/Free%20Trial/Gujrati%20Trial%20Video.mp4',
      },
      ur: {
        fallback_video:
          'https://cnd.storyowl.app/assets/alertpay/Fallback%20video/Punjabi%20Fallback%20screen.mp4',
        paywall_video:
          'https://cnd.storyowl.app/assets/alertpay/Free%20Trial/Punjabi%20Trial%20Video.mp4',
      },
      kn: {
        fallback_video:
          'https://cnd.storyowl.app/assets/alertpay/Fallback%20video/Kannada%20Fallback%20screen.mp4',
        paywall_video:
          'https://cnd.storyowl.app/assets/alertpay/Free%20Trial/Kannada%20Trial%20Video.mp4',
      },
      or: {
        fallback_video:
          'https://cnd.storyowl.app/assets/alertpay/Fallback%20video/English%20Fallback%20screen%20video%205%20mb.mp4',
        paywall_video:
          'https://cnd.storyowl.app/assets/alertpay/Free%20Trial/English%20Free%20Trial%20Video%209%20mb.mp4',
      },
      ml: {
        fallback_video:
          'https://cnd.storyowl.app/assets/alertpay/Fallback%20video/Malyalam%20Fallback%20screen.mp4',
        paywall_video:
          'https://cnd.storyowl.app/assets/alertpay/Free%20Trial/Malyalam%20Trial%20Video.mp4',
      },
    },
    appUpdate: {
      ...baseConfig.appUpdate,
      updateUrl:
        'https://play.google.com/store/apps/details?id=com.paymentalert.app',
    },
  },
  'com.sharekaro.kirana': {
    ...baseConfig,
    app: {
      ...baseConfig.app,
      name: 'ShareKaro Kirana',
      id: 'com.sharekaro.kirana',
    },
    features: {
      ...baseConfig.features,
      subscription: { plan_id: 'plan_S3FaBrk7sjPQEU' } as SubscriptionConfig,
    },
    videos: {
      en: {
        fallback_video:
          'https://cnd.storyowl.app/assets/alertpay/Fallback%20video/English%20Fallback%20screen%20video%205%20mb.mp4',
        paywall_video:
          'https://cnd.storyowl.app/assets/alertpay/Free%20Trial/English%20Free%20Trial%20Video%209%20mb.mp4',
      },
      hi: {
        fallback_video:
          'https://cnd.storyowl.app/assets/alertpay/Fallback%20video/Hindi%20Fallback%20screen%20video%205%20mb.mp4',
        paywall_video:
          'https://cnd.storyowl.app/assets/alertpay/Free%20Trial/Hindi%20Free%20Trial%20Video%209%20mb.mp4',
      },
      bn: {
        fallback_video:
          'https://cnd.storyowl.app/assets/alertpay/Fallback%20video/Bengali%20Fallback%20screen.mp4',
        paywall_video:
          'https://cnd.storyowl.app/assets/alertpay/Free%20Trial/Bengali%20Trial%20Video.mp4',
      },
      mr: {
        fallback_video:
          'https://cnd.storyowl.app/assets/alertpay/Fallback%20video/Marathi%20Fallback%20screen.mp4',
        paywall_video:
          'https://cnd.storyowl.app/assets/alertpay/Free%20Trial/Marathi%20Trial%20Video.mp4',
      },
      te: {
        fallback_video:
          'https://cnd.storyowl.app/assets/alertpay/Fallback%20video/Telgu%20Fallback%20screen.mp4',
        paywall_video:
          'https://cnd.storyowl.app/assets/alertpay/Free%20Trial/Telgu%20Trial%20Video.mp4',
      },
      ta: {
        fallback_video:
          'https://cnd.storyowl.app/assets/alertpay/Fallback%20video/Tamil%20Fallback%20screen.mp4',
        paywall_video:
          'https://cnd.storyowl.app/assets/alertpay/Free%20Trial/Tamil%20Trial%20Video.mp4',
      },
      gu: {
        fallback_video:
          'https://cnd.storyowl.app/assets/alertpay/Fallback%20video/Gujrati%20Fallback%20screen.mp4',
        paywall_video:
          'https://cnd.storyowl.app/assets/alertpay/Free%20Trial/Gujrati%20Trial%20Video.mp4',
      },
      ur: {
        fallback_video:
          'https://cnd.storyowl.app/assets/alertpay/Fallback%20video/Punjabi%20Fallback%20screen.mp4',
        paywall_video:
          'https://cnd.storyowl.app/assets/alertpay/Free%20Trial/Punjabi%20Trial%20Video.mp4',
      },
      kn: {
        fallback_video:
          'https://cnd.storyowl.app/assets/alertpay/Fallback%20video/Kannada%20Fallback%20screen.mp4',
        paywall_video:
          'https://cnd.storyowl.app/assets/alertpay/Free%20Trial/Kannada%20Trial%20Video.mp4',
      },
      or: {
        fallback_video:
          'https://cnd.storyowl.app/assets/alertpay/Fallback%20video/English%20Fallback%20screen%20video%205%20mb.mp4',
        paywall_video:
          'https://cnd.storyowl.app/assets/alertpay/Free%20Trial/English%20Free%20Trial%20Video%209%20mb.mp4',
      },
      ml: {
        fallback_video:
          'https://cnd.storyowl.app/assets/alertpay/Fallback%20video/Malyalam%20Fallback%20screen.mp4',
        paywall_video:
          'https://cnd.storyowl.app/assets/alertpay/Free%20Trial/Malyalam%20Trial%20Video.mp4',
      },
    },
    appUpdate: {
      ...baseConfig.appUpdate,
      updateUrl:
        'https://play.google.com/store/apps/details?id=com.sharekaro.kirana',
    },
  },
};

export type AppConfigData = (typeof APP_CONFIGS)[keyof typeof APP_CONFIGS];

export function getConfigForAppId(appId: string): AppConfigData | null {
  const config = APP_CONFIGS[appId as keyof typeof APP_CONFIGS];
  return config ?? null;
}
