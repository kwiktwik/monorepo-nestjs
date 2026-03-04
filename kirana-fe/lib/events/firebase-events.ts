/**
 * Firebase Analytics Event Constants
 * 
 * Imports existing analytics event constants and extends with Firebase-specific events
 */

// Import existing analytics events
import { ANALYTICS_EVENTS, type AnalyticsEventName } from './constant';

// Re-export existing events for Firebase
export { ANALYTICS_EVENTS, type AnalyticsEventName };

// ============================================
// ADDITIONAL FIREBASE-SPECIFIC EVENTS
// ============================================

/**
 * Additional client-side events for Firebase Analytics
 * These complement the existing ANALYTICS_EVENTS for server-side tracking
 * Note: Reuse ANALYTICS_EVENTS constants where the same event exists
 */
export const FIREBASE_CLIENT_EVENTS = {
  // Authentication events (client-side only)
  SIGN_UP: 'sign_up',
  LOGIN: 'login',
  LOGOUT: 'logout',
  OTP_SENT: 'otp_sent',
  OTP_VERIFIED: 'otp_verified',
  OTP_FAILED: 'otp_failed',
  TRUECALLER_AUTH: 'truecaller_auth',
  
  // UI Interaction events (client-side only)
  APP_OPEN: 'app_open',
  SCREEN_VIEW: 'screen_view',
  PAGE_VIEW: 'page_view',
  BUTTON_CLICK: 'button_click',
  FORM_SUBMIT: 'form_submit',
  SEARCH: 'search',
  SHARE: 'share',
  
  // Payment flow events (Google Analytics recommended - client-side)
  BEGIN_CHECKOUT: 'begin_checkout',
  ADD_PAYMENT_INFO: 'add_payment_info',
  PURCHASE: 'purchase',
  REFUND: 'refund',
  
  // For server-tracked payment events, use ANALYTICS_EVENTS:
  // - ANALYTICS_EVENTS.PAYMENT_CAPTURED
  // - ANALYTICS_EVENTS.PAYMENT_FAILED
  // - ANALYTICS_EVENTS.PAYMENT_AUTHORIZED
  
  // Subscription flow events (client-side only)
  VIEW_SUBSCRIPTION_PLANS: 'view_subscription_plans',
  SELECT_SUBSCRIPTION_PLAN: 'select_subscription_plan',
  
  // For server-tracked subscription events, use ANALYTICS_EVENTS:
  // - ANALYTICS_EVENTS.SUBSCRIPTION_ACTIVATED
  // - ANALYTICS_EVENTS.SUBSCRIPTION_CHARGED
  // - ANALYTICS_EVENTS.SUBSCRIPTION_CANCELLED
  // - ANALYTICS_EVENTS.SUBSCRIPTION_PENDING
  // - ANALYTICS_EVENTS.SUBSCRIPTION_HALTED
  // - ANALYTICS_EVENTS.SUBSCRIPTION_PAUSED
  // - ANALYTICS_EVENTS.SUBSCRIPTION_RESUMED
  // - ANALYTICS_EVENTS.SUBSCRIPTION_COMPLETED
  
  // Media events (client-side only)
  VIDEO_UPLOADED: 'video_uploaded',
  VIDEO_PROCESSED: 'video_processed',
  IMAGE_UPLOADED: 'image_uploaded',
  MEDIA_SHARED: 'media_shared',
  
  // Error tracking (client-side only)
  APP_ERROR: 'app_error',
  API_ERROR: 'api_error',
  UPLOAD_ERROR: 'upload_error',
  
  // Engagement events (client-side only)
  VIEW_PROFILE: 'view_profile',
  UPDATE_PROFILE: 'update_profile',
  SETTINGS_CHANGE: 'settings_change',
  HELP_ACCESSED: 'help_accessed',
} as const;

// ============================================
// COMBINED EVENTS (existing + Firebase-specific)
// ============================================
export const ALL_EVENTS = {
  ...ANALYTICS_EVENTS,
  ...FIREBASE_CLIENT_EVENTS,
} as const;

export type FirebaseEventName = typeof ALL_EVENTS[keyof typeof ALL_EVENTS];

// ============================================
// EVENT PARAMETER INTERFACES
// ============================================

/**
 * Common parameters that can be attached to events
 */
export interface CommonEventParams {
  // User properties
  user_id?: string;
  user_role?: string;
  
  // App context
  app_version?: string;
  platform?: 'web' | 'android' | 'ios';
  
  // Payment properties
  currency?: string;
  value?: number;
  transaction_id?: string;
  payment_method?: string;
  
  // Content properties
  content_type?: string;
  content_id?: string;
  item_name?: string;
  
  // Error properties
  error_message?: string;
  error_code?: string;
  
  // Other - allow any type including arrays for complex data
  [key: string]: any;
}

export interface PurchaseEventParams extends CommonEventParams {
  transaction_id: string;
  value: number;
  currency: string;
  items?: Array<{
    item_id: string;
    item_name: string;
    price: number;
    quantity: number;
  }>;
}

export interface SubscriptionEventParams extends CommonEventParams {
  plan_name: string;
  plan_id: string;
  billing_period: 'monthly' | 'yearly' | 'weekly';
  price: number;
  currency: string;
}

export interface ScreenViewParams extends CommonEventParams {
  screen_name: string;
  screen_class?: string;
}

export interface ErrorEventParams extends CommonEventParams {
  error_message: string;
  error_code?: string;
  error_stack?: string;
  api_endpoint?: string;
}
