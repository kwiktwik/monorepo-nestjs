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
    plan_id: "plan_S3FaBrk7sjPQEU",
    pricing: {
      initialAmount: "₹5",
      recurringAmount: "₹199",
      period: "month",
    },
    heading: "Never miss a payment",
    description: "Start your free trial for <s>₹199</s>",
    buttonText: "Start free trial",
    videoDescription: "Autopay ₹199 every month, cancel anytime",
    priority: 1,
  },
  NEW_USER_WELCOME: {
    plan_id: "plan_S3FaBrk7sjPQEU",
    pricing: {
      initialAmount: "₹5",
      recurringAmount: "₹199",
      period: "month",
    },
    heading: "Never miss a payment",
    description: "Start your free trial for <s>₹199</s>",
    buttonText: "Start free trial",
    videoDescription: "Autopay ₹199 every month, cancel anytime",
    priority: 2,
  },
  ABANDONED_CHECKOUT: {
    plan_id: "plan_S3FaBrk7sjPQEU",
    pricing: {
      initialAmount: "₹5",
      recurringAmount: "₹199",
      period: "month",
    },
    heading: "Never miss a payment",
    description: "Start your free trial for <s>₹199</s>",
    buttonText: "Start free trial",
    videoDescription: "Autopay ₹199 every month, cancel anytime",
    priority: 3,
  },
  MARKETING_CAMPAIGN: {
    plan_id: "plan_S3FaBrk7sjPQEU",
    pricing: {
      initialAmount: "₹5",
      recurringAmount: "₹199",
      period: "month",
    },
    heading: "Never miss a payment",
    description: "Start your free trial for <s>₹199</s>",
    buttonText: "Start free trial",
    videoDescription: "Autopay ₹199 every month, cancel anytime",
    priority: 4,
  },
  LOYAL_USER: {
    plan_id: "plan_S3FaBrk7sjPQEU",
    pricing: {
      initialAmount: "₹5",
      recurringAmount: "₹199",
      period: "month",
    },
    heading: "Never miss a payment",
    description: "Start your free trial for <s>₹199</s>",
    buttonText: "Start free trial",
    videoDescription: "Autopay ₹199 every month, cancel anytime",
    priority: 5,
  },
  TRIAL_EXPIRED: {
    plan_id: "plan_S3FaBrk7sjPQEU",
    pricing: {
      initialAmount: "₹5",
      recurringAmount: "₹199",
      period: "month",
    },
    heading: "Never miss a payment",
    description: "Start your free trial for <s>₹199</s>",
    buttonText: "Start free trial",
    videoDescription: "Autopay ₹199 every month, cancel anytime",
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
  language?: string;
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

  // Rule 6: Abandoned Checkout Users (DISABLED for now)
  // if (userType === USER_TYPES.ABANDONED) {
  //   return {
  //     plan: PAYWALL_PLANS.ABANDONED_CHECKOUT,
  //     reason: "User has abandoned checkout",
  //     ruleName: "abandoned_checkout",
  //   };
  // }

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
// TRANSLATIONS
// ============================================================================

export const PAYWALL_TRANSLATIONS: Record<
  string,
  {
    heading: string;
    description: string;
    buttonText: string;
    videoDescription: string;
  }
> = {
  en: {
    heading: "Never miss a payment",
    description: "Start your free trial for <s>₹199</s>",
    buttonText: "Start free trial",
    videoDescription: "Autopay ₹199 every month, cancel anytime",
  },
  hi: {
    heading: "कभी भुगतान न चूकें",
    description: "अपना निःशुल्क परीक्षण <s>₹199</s> में शुरू करें",
    buttonText: "निःशुल्क परीक्षण शुरू करें",
    videoDescription: "हर महीने ₹199 का ऑटोपे करें, कभी भी रद्द करें",
  },
  bn: {
    heading: "কখনও পেমেন্ট মিস করবেন না",
    description: "আপনার বিনামূল্যে ট্রায়াল <s>₹199</s> টাকায় শুরু করুন",
    buttonText: "বিনামূল্যে ট্রায়াল শুরু করুন",
    videoDescription: "প্রতি মাসে ₹199 অটো-পে করুন, যেকোনো সময় বাতিল করুন",
  },
  mr: {
    heading: "कधीही पेमेंट चुकवू नका",
    description: "तुमची <s>₹199</s> मध्ये मोफत चाचणी सुरू करा",
    buttonText: "मोफत चाचणी सुरू करा",
    videoDescription: "दरमहा ₹199 ऑटोपे करा, कधीही रद्द करा",
  },
  te: {
    heading: "ఎప్పుడూ చెల్లింపును మిస్ చేయవద్దు",
    description: "మీ ఉచిత ట్రయల్ <s>₹199</s>కి ప్రారంభించండి",
    buttonText: "ఉచిత ట్రయల్ ప్రారంభించండి",
    videoDescription: "ప్రతి నెలా ₹199 ఆటోపే చేయండి, ఎప్పుడైనా రద్దు చేయండి",
  },
  ta: {
    heading: "ஒருபோதும் பணம் செலுத்த தவறாதீர்கள்",
    description: "உங்கள் இலவச சோதனையை <s>₹199</s>க்கு தொடங்குங்கள்",
    buttonText: "இலவச சோதனையைத் தொடங்குங்கள்",
    videoDescription:
      "ஒவ்வொரு மாதமும் ₹199 தானியங்கு செலுத்துங்கள், எப்போது வேண்டுமானாலும் ரத்து செய்யுங்கள்",
  },
  gu: {
    heading: "ક્યારેય ચુકવણી ચૂકશો નહીં",
    description: "તમારી મફત અજમાયશ <s>₹199</s> માં શરૂ કરો",
    buttonText: "મફત અજમાયશ શરૂ કરો",
    videoDescription: "દર મહિને ₹199 સ્વતઃ ચુકવો, ગમે ત્યારે રદ કરો",
  },
  ur: {
    heading: "کبھی ادائیگی سے محروم نہ ہوں",
    description: "اپنی مفت آزمائش <s>₹199</s> میں شروع کریں",
    buttonText: "مفت آزمائش شروع کریں",
    videoDescription: "ہر ماہ ₹199 کا آٹو پے کریں، کسی بھی وقت منسوخ کریں",
  },
  kn: {
    heading: "ಯಾವುದೇ ಪಾವತಿಯನ್ನು ತಪ್ಪಿಸಿಕೊಳ್ಳಬೇಡಿ",
    description: "ನಿಮ್ಮ ಉಚಿತ ಪ್ರಯೋಗವನ್ನು <s>₹199</s> ಕ್ಕ್ಕೆ ಪ್ರಾರಂಭಿಸಿ",
    buttonText: "ಉಚಿತ ಪ್ರಯೋಗವನ್ನು ಪ್ರಾರಂಭಿಸಿ",
    videoDescription: "ಪ್ರತಿ ತಿಂಗಳು ₹199 ಸ್ವಯಂ ಪಾವತಿಸಿ, ಯಾವುದೇ ಸಮಯದಲ್ಲಿ ರದ್ದುಗೊಳಿಸಿ",
  },
  or: {
    heading: "କୌଣସି ପେମେଣ୍ଟ୍ ହରାନ୍ତୁ ନାହିଁ",
    description: "ଆପଣଙ୍କ ମାଗଣା ପରୀକ୍ଷଣ <s>₹199</s> ରେ ଆରମ୍ଭ କରନ୍ତୁ",
    buttonText: "ମାଗଣା ପରୀକ୍ଷଣ ଆରମ୍ଭ କରନ୍ତୁ",
    videoDescription: "ପ୍ରତି ମାସରେ ₹199 ଅଟୋପେ କରନ୍ତୁ, ଯେକୌଣସି ସମୟରେ ବାତିଲ୍ କରନ୍ତୁ",
  },
  ml: {
    heading: "ഒരൊറ്റ പേയ്‌മെന്റും നഷ്‌ടപ്പെടുത്തരുത്",
    description: "നിങ്ങളുടെ സൗജന്യ ട്രയൽ <s>₹199</s>-ന് ആരംഭിക്കുക",
    buttonText: "സൗജന്യ ട്രയൽ ആരംഭിക്കുക",
    videoDescription: "എല്ലാ മാസവും ₹199 ഓട്ടോപേ ചെയ്യുക, എപ്പോൾ വേണമെങ്കിലും റദ്ദാക്കുക",
  },
};

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
      description: "Start your free trial for <s>₹199</s>",
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

export function getConfigForAppId(
  appId: string,
): Record<string, unknown> | null {
  const config = APP_CONFIGS[appId];
  return config ?? null;
}

export function getDynamicConfig(
  appId: string,
  context: PaywallContext,
): Record<string, unknown> | null {
  const config = getConfigForAppId(appId);
  if (!config) return null;

  // Deep clone the config to avoid mutating the original
  const dynamicConfig = JSON.parse(JSON.stringify(config));

  // Determine the appropriate plan based on context
  const paywallResult = determinePlan(context);

  // Get translations for the requested language
  const language = context.language || "en";
  const translations =
    PAYWALL_TRANSLATIONS[language] || PAYWALL_TRANSLATIONS.en;

  // Update the config with the selected plan
  dynamicConfig.features.subscription.plan_id = paywallResult.plan.plan_id;
  dynamicConfig.ui.paywall.pricing = paywallResult.plan.pricing;

  // Use localized strings
  dynamicConfig.ui.paywall.heading = translations.heading;
  dynamicConfig.ui.paywall.description = translations.description;
  dynamicConfig.ui.paywall.buttonText = translations.buttonText;

  // Include video description if needed by the frontend
  dynamicConfig.ui.paywall.videoDescription = translations.videoDescription;

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
