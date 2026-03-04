const SUBSCRIPTION_AMOUNT_INR = 199;

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
      subscription: { plan_id: 'plan_SHgypikeI443LO' } as SubscriptionConfig,
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
