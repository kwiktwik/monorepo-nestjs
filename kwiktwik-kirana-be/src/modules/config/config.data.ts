const SUBSCRIPTION_AMOUNT_INR = 199;

// ============================================================================
// PAYWALL PLANS
// ============================================================================

export const PAYWALL_PLANS = {
  STANDARD: {
    plan_id: 'plan_S3FaBrk7sjPQEU',
    pricing: {
      initialAmount: '₹5',
      recurringAmount: '₹199',
      period: 'month',
    },
    heading: 'Never miss a payment',
    description: 'Start your free trial for <s>₹199</s>',
    buttonText: 'Start free trial',
    refundText: 'REFUNDED INSTANTLY',
    videoDescription: 'Autopay ₹199 every month, cancel anytime',
    priority: 1,
  },
  NEW_USER_WELCOME: {
    plan_id: 'plan_S3FaBrk7sjPQEU',
    pricing: {
      initialAmount: '₹5',
      recurringAmount: '₹199',
      period: 'month',
    },
    heading: 'Never miss a payment',
    description: 'Start your free trial for <s>₹199</s>',
    buttonText: 'Start free trial',
    refundText: 'REFUNDED INSTANTLY',
    videoDescription: 'Autopay ₹199 every month, cancel anytime',
    priority: 2,
  },
  ABANDONED_CHECKOUT: {
    plan_id: 'plan_S3FaBrk7sjPQEU',
    pricing: {
      initialAmount: '₹5',
      recurringAmount: '₹199',
      period: 'month',
    },
    heading: 'Never miss a payment',
    description: 'Start your free trial for <s>₹199</s>',
    buttonText: 'Start free trial',
    refundText: 'REFUNDED INSTANTLY',
    videoDescription: 'Autopay ₹199 every month, cancel anytime',
    priority: 3,
  },
  MARKETING_CAMPAIGN: {
    plan_id: 'plan_S3FaBrk7sjPQEU',
    pricing: {
      initialAmount: '₹5',
      recurringAmount: '₹199',
      period: 'month',
    },
    heading: 'Never miss a payment',
    description: 'Start your free trial for <s>₹199</s>',
    buttonText: 'Start free trial',
    refundText: 'REFUNDED INSTANTLY',
    videoDescription: 'Autopay ₹199 every month, cancel anytime',
    priority: 4,
  },
  LOYAL_USER: {
    plan_id: 'plan_S3FaBrk7sjPQEU',
    pricing: {
      initialAmount: '₹5',
      recurringAmount: '₹199',
      period: 'month',
    },
    heading: 'Never miss a payment',
    description: 'Start your free trial for <s>₹199</s>',
    buttonText: 'Start free trial',
    refundText: 'REFUNDED INSTANTLY',
    videoDescription: 'Autopay ₹199 every month, cancel anytime',
    priority: 5,
  },
  TRIAL_EXPIRED: {
    plan_id: 'plan_S3FaBrk7sjPQEU',
    pricing: {
      initialAmount: '₹5',
      recurringAmount: '₹199',
      period: 'month',
    },
    heading: 'Never miss a payment',
    description: 'Start your free trial for <s>₹199</s>',
    buttonText: 'Start free trial',
    refundText: 'REFUNDED INSTANTLY',
    videoDescription: 'Autopay ₹199 every month, cancel anytime',
    priority: 6,
  },
  PHONEPE_AUTOPAY: {
    plan_id: 'plan_PHONEPE_AUTOPAY_001',
    pricing: {
      initialAmount: '₹1',
      recurringAmount: '₹199',
      period: 'month',
    },
    heading: 'Setup Autopay with PhonePe',
    description: 'Secure your subscription with UPI Autopay. Just ₹1 to setup.',
    buttonText: 'Setup PhonePe Autopay',
    refundText: 'INSTANT REFUND',
    videoDescription:
      'Autopay ₹199 every month via PhonePe UPI, cancel anytime',
    priority: 7,
    phonepeConfig: {
      provider: 'PHONEPE',
      maxAmount: 19900, // in paise
      frequency: 'MONTHLY',
      amountType: 'VARIABLE',
      authWorkflowType: 'TRANSACTION',
      upiPaymentMode: 'UPI_INTENT',
      productType: 'UPI_MANDATE',
    },
  },
} as const;

export type PlanType = keyof typeof PAYWALL_PLANS;

// ============================================================================
// UNIFIED PLANS (v4) - Supports both local and provider-fetched plans
// ============================================================================

export type PaymentProvider = 'PHONEPE' | 'RAZORPAY';

export interface UnifiedPlan {
  plan_id: string;
  provider: PaymentProvider;
  // For PhonePe: full config is local
  // For Razorpay: basic info local, details fetched from provider
  localConfig?: {
    pricing: {
      initialAmount: string;
      recurringAmount: string;
      period: string;
    };
    heading: string;
    description: string;
    buttonText: string;
    refundText: string;
    videoDescription: string;
  };
  // Provider-specific config
  providerConfig?: {
    // PhonePe specific
    maxAmount?: number; // in paise
    frequency?: string;
    amountType?: string;
    authWorkflowType?: string;
    upiPaymentMode?: string;
    productType?: string;
    // Razorpay specific - these reference the actual Razorpay plan
    razorpayPlanId?: string;
    interval?: number;
    period?: string;
  };
}

// Unified plan registry - works for both PhonePe and Razorpay
export const UNIFIED_PLANS: Record<string, UnifiedPlan> = {
  // PhonePe Plans - fully local
  plan_PHONEPE_AUTOPAY_001: {
    plan_id: 'plan_PHONEPE_AUTOPAY_001',
    provider: 'PHONEPE',
    localConfig: {
      pricing: {
        initialAmount: '₹1',
        recurringAmount: '₹199',
        period: 'month',
      },
      heading: 'Setup Autopay with PhonePe',
      description:
        'Secure your subscription with UPI Autopay. Just ₹1 to setup.',
      buttonText: 'Setup PhonePe Autopay',
      refundText: 'INSTANT REFUND',
      videoDescription:
        'Autopay ₹199 every month via PhonePe UPI, cancel anytime',
    },
    providerConfig: {
      maxAmount: 19900,
      frequency: 'MONTHLY',
      amountType: 'VARIABLE',
      authWorkflowType: 'TRANSACTION',
      upiPaymentMode: 'UPI_INTENT',
      productType: 'UPI_MANDATE',
    },
  },
  // Razorpay Plans - reference external plans
  plan_S3FaBrk7sjPQEU: {
    plan_id: 'plan_S3FaBrk7sjPQEU',
    provider: 'RAZORPAY',
    localConfig: {
      pricing: {
        initialAmount: '₹5',
        recurringAmount: '₹199',
        period: 'month',
      },
      heading: 'Never miss a payment',
      description: 'Start your free trial for <s>₹199</s>',
      buttonText: 'Start free trial',
      refundText: 'REFUNDED INSTANTLY',
      videoDescription: 'Autopay ₹199 every month, cancel anytime',
    },
    providerConfig: {
      razorpayPlanId: 'plan_S3FaBrk7sjPQEU',
      interval: 1,
      period: 'monthly',
    },
  },
};

// Helper to get plan by ID
export const getUnifiedPlan = (planId: string): UnifiedPlan | undefined => {
  return UNIFIED_PLANS[planId];
};

// Helper to get all plans for a provider
export const getPlansByProvider = (
  provider: PaymentProvider,
): UnifiedPlan[] => {
  return Object.values(UNIFIED_PLANS).filter(
    (plan) => plan.provider === provider,
  );
};

// ============================================================================
// USER TYPES
// ============================================================================

export const USER_TYPES = {
  NEW: 'new', // Brand new user, never subscribed
  ACTIVE: 'active', // Currently active subscription
  EXPIRED: 'expired', // Subscription expired
  ABANDONED: 'abandoned', // Started checkout but didn't complete
  TRIAL_EXPIRED: 'trial_expired', // Trial period ended
  CHURNED: 'churned', // Previously subscribed, now cancelled
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

export type DeeplinkCampaign =
  (typeof DEEPLINK_CAMPAIGNS)[keyof typeof DEEPLINK_CAMPAIGNS];

// ============================================================================
// SUPPORTED LANGUAGES
// ============================================================================

export const SUPPORTED_LANGUAGES = {
  EN: 'en',
  HI: 'hi',
  BN: 'bn',
  MR: 'mr',
  TE: 'te',
  TA: 'ta',
  GU: 'gu',
  UR: 'ur',
  KN: 'kn',
  OR: 'or',
  ML: 'ml',
} as const;

export type SupportedLanguage =
  (typeof SUPPORTED_LANGUAGES)[keyof typeof SUPPORTED_LANGUAGES];

// ============================================================================
// JSON RULES ENGINE - PAYWALL RULES
// ============================================================================

export const PAYWALL_RULES = [
  // Rule 1: Marketing Campaign - 50% off (highest priority for deeplink)
  {
    name: 'marketing_campaign_50_percent',
    conditions: {
      all: [
        {
          fact: 'deeplink',
          operator: 'equal',
          value: DEEPLINK_CAMPAIGNS.MARKETING_50_PERCENT,
        },
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
        {
          fact: 'deeplink',
          operator: 'equal',
          value: DEEPLINK_CAMPAIGNS.REFERRAL,
        },
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
        {
          fact: 'deeplink',
          operator: 'equal',
          value: DEEPLINK_CAMPAIGNS.RETARGETING,
        },
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
        {
          fact: 'deeplink',
          operator: 'equal',
          value: DEEPLINK_CAMPAIGNS.SEASONAL,
        },
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
        {
          fact: 'deeplink',
          operator: 'equal',
          value: DEEPLINK_CAMPAIGNS.MARKETING_TRIAL,
        },
        {
          fact: 'userType',
          operator: 'in',
          value: [USER_TYPES.NEW, USER_TYPES.TRIAL_EXPIRED],
        },
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
        {
          fact: 'userType',
          operator: 'equal',
          value: USER_TYPES.TRIAL_EXPIRED,
        },
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
      all: [{ fact: 'userType', operator: 'equal', value: USER_TYPES.CHURNED }],
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
      all: [{ fact: 'userType', operator: 'equal', value: USER_TYPES.NEW }],
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
      all: [{ fact: 'userType', operator: 'equal', value: USER_TYPES.EXPIRED }],
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
      all: [{ fact: 'userType', operator: 'equal', value: USER_TYPES.ACTIVE }],
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
        {
          fact: 'userType',
          operator: 'equal',
          value: USER_TYPES.TRIAL_EXPIRED,
        },
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
  'com.kiranaapps.app': {
    ...baseConfig,
    app: {
      ...baseConfig.app,
      name: 'Kirana Apps',
      id: 'com.kiranaapps.app',
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
        'https://play.google.com/store/apps/details?id=com.kiranaapps.app',
    },
  },
  'com.sharestatus.app': {
    ...baseConfig,
    app: {
      ...baseConfig.app,
      name: 'ShareStatus',
      id: 'com.sharestatus.app',
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
        'https://play.google.com/store/apps/details?id=com.sharestatus.app',
    },
  },
  'com.dailyattendance.staffbook': {
    ...baseConfig,
    app: {
      ...baseConfig.app,
      name: 'StaffBook',
      id: 'com.dailyattendance.staffbook',
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
    },
    appUpdate: {
      ...baseConfig.appUpdate,
      updateUrl:
        'https://play.google.com/store/apps/details?id=com.dailyattendance.staffbook',
    },
  },
};

export const PAYWALL_TRANSLATIONS = {
  en: {
    heading: 'Never miss a payment',
    description: 'Start your free trial for <s>₹199</s>',
    buttonText: 'Start free trial',
    videoDescription: 'Autopay ₹199 every month, cancel anytime',
  },
  hi: {
    heading: 'भुगतान कभी मिस न करें',
    description: 'अपना फ्री ट्रायल शुरू करें <s>₹199</s> में',
    buttonText: 'निःशुल्क ट्रायल शुरू करें',
    videoDescription: 'हर महीने ₹199 का ऑटोपे, कभी भी रद्द करें',
  },
  bn: {
    heading: 'কোনো পেমেন্ট মিস করবেন না',
    description: '<s>₹199</s> এর জন্য আপনার ফ্রি ট্রায়াল শুরু করুন',
    buttonText: 'ফ্রি ট্রায়াল শুরু করুন',
    videoDescription: 'প্রতি মাসে ₹199 অটোপে, যেকোনো সময় বাতিল করুন',
  },
  mr: {
    heading: 'पेमेंट कधीच मिस करू नका',
    description: '<s>₹199</s> साठी तुमचा विनामूल्य ट्रायल सुरू करा',
    buttonText: 'विनामूल्य ट्रायल सुरू करा',
    videoDescription: 'दरमहा ₹199 ऑटोपे, कधीही रद्द करा',
  },
  te: {
    heading: 'ఎప్పుడూ పేమెంట్ మిస్ చేయకండి',
    description: '<s>₹199</s> కి మీ ఉచిత ట్రయల్ ప్రారంభించండి',
    buttonText: 'ఉచిత ట్రయల్ ప్రారంభించండి',
    videoDescription: 'ప్రతి నెల ₹199 ఆటోపే, ఎప్పుడైనా రద్దు చేయండి',
  },
  ta: {
    heading: 'பணம் செலுத்துவதை ஒருபோதும் தவறவிடாதீர்கள்',
    description: '<s>₹199</s> க்கு உங்கள் இலவச சோதனையைத் தொடங்கவும்',
    buttonText: 'இலவச சோதனையைத் தொடங்கவும்',
    videoDescription: 'மாதம் ₹199 ஆட்டோபே, எந்நேரத்திலும் ரத்து செய்யவும்',
  },
  gu: {
    heading: 'ક્યારેય પેમેંટ મિસ ન કરો',
    description: '<s>₹199</s> માટે તમારો મફત ટ્રાયલ શરૂ કરો',
    buttonText: 'મફત ટ્રાયલ શરૂ કરો',
    videoDescription: 'દર મહિને ₹199 ઓટોપે, ક્યારેય પણ રદ કરો',
  },
  ur: {
    heading: 'کبھی بھی ادائیگی مس نہ کریں',
    description: '<s>₹199</s> کے لیے اپنا مفت ٹرائل شروع کریں',
    buttonText: 'مفت ٹرائل شروع کریں',
    videoDescription: 'ہر مہینے ₹199 آٹوپے، کبھی بھی منسوخ کریں',
  },
  kn: {
    heading: 'ಯಾವಾಗಲೂ ಪಾವತಿ ಮಿಸ್ ಮಾಡಬೇಡಿ',
    description: '<s>₹199</s> ಗಾಗಿ ನಿಮ್ಮ ಉಚಿತ ಟ್ರಯಲ್ ಅನ್ನು ಪ್ರಾರಂಭಿಸಿ',
    buttonText: 'ಉಚಿತ ಟ್ರಯಲ್ ಪ್ರಾರಂಭಿಸಿ',
    videoDescription: 'ಪ್ರತಿ ತಿಂಗಳು ₹199 ಆಟೋಪೇ, ಯಾವುದೇ ಸಮಯದಲ್ಲಿ ರದ್ದು ಮಾಡಿ',
  },
  or: {
    heading: 'କେବେବି ପେମେଣ୍ଟ ମିସ୍ କରନ୍ତୁ ନାହିଁ',
    description: '<s>₹199</s> ପାଇଁ ଆପଣଙ୍କର ମାଗଣା ଟ୍ରାଏଲ୍ ଆରମ୍ଭ କରନ୍ତୁ',
    buttonText: 'ମାଗଣା ଟ୍ରାଏଲ୍ ଆରମ୍ଭ କରନ୍ତୁ',
    videoDescription: 'ପ୍ରତି ମାସରେ ₹199 ଅଟୋପେ, ଯେକୌଣସି ସମୟରେ ବାତିଲ୍ କରନ୍ତୁ',
  },
  ml: {
    heading: 'ഒരിക്കലും പേയ്‌മെന്റ് മിസ്സ് ചെയ്യരുത്',
    description: '<s>₹199</s> ന് നിങ്ങളുടെ സൗജന്യ ട്രയൽ ആരംഭിക്കുക',
    buttonText: 'സൗജന്യ ട്രയൽ ആരംഭിക്കുക',
    videoDescription:
      'എല്ലാ മാസവും ₹199 ഓട്ടോപേ, എപ്പോൾ വേണമെങ്കിലും റദ്ദാക്കുക',
  },
};

export type AppConfigData = (typeof APP_CONFIGS)[keyof typeof APP_CONFIGS];

export function getConfigForAppId(appId: string): AppConfigData | null {
  const config = APP_CONFIGS[appId as keyof typeof APP_CONFIGS];
  return config ?? null;
}
