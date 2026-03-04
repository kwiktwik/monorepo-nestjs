/**
 * Unified Analytics Client
 * 
 * This file provides a unified interface for tracking events across:
 * - Firebase Analytics (client-side)
 * - Server-side analytics (Mixpanel, Facebook via API)
 * 
 * Usage:
 * import { trackEvent, trackPageView, setUser } from '@/lib/events/client';
 * 
 * trackEvent(FIREBASE_CLIENT_EVENTS.PURCHASE, { value: 100, currency: 'USD' });
 */

import { logEvent, setAnalyticsUserId, setAnalyticsUserProperties } from '../firebase/client';
import {
  ANALYTICS_EVENTS,
  FIREBASE_CLIENT_EVENTS,
  ALL_EVENTS,
  type FirebaseEventName,
  type CommonEventParams
} from './firebase-events';

// Re-export constants for convenience
export { ANALYTICS_EVENTS, FIREBASE_CLIENT_EVENTS, ALL_EVENTS };

/**
 * Track an analytics event
 * Sends to Firebase Analytics on client-side
 * 
 * @param eventName - Name of the event
 * @param params - Event parameters
 */
export function trackEvent(
  eventName: FirebaseEventName | string,
  params?: CommonEventParams
) {
  try {
    // Send to Firebase Analytics
    logEvent(eventName, params);
  } catch (error) {
    console.error('[Analytics] Failed to track event:', eventName, error);
  }
}

/**
 * Track a page view
 * 
 * @param pagePath - Path of the page
 * @param pageTitle - Title of the page
 */
export function trackPageView(pagePath: string, pageTitle?: string) {
  try {
    logEvent(FIREBASE_CLIENT_EVENTS.PAGE_VIEW, {
      page_path: pagePath,
      page_title: pageTitle || (typeof document !== 'undefined' ? document.title : ''),
      page_location: typeof window !== 'undefined' ? window.location.href : '',
    });
  } catch (error) {
    console.error('[Analytics] Failed to track page view:', error);
  }
}

/**
 * Set the current user for analytics
 * 
 * @param userId - Unique identifier for the user
 * @param properties - Additional user properties
 */
export function setUser(userId: string | null, properties?: Record<string, any>) {
  try {
    // Set user ID in Firebase
    setAnalyticsUserId(userId);

    // Set user properties if provided
    if (properties) {
      setAnalyticsUserProperties(properties);
    }

    console.log('[Analytics] User set:', userId, properties);
  } catch (error) {
    console.error('[Analytics] Failed to set user:', error);
  }
}

/**
 * Track a form submission
 * 
 * @param formName - Name of the form
 * @param formData - Additional form data
 */
export function trackFormSubmit(formName: string, formData?: Record<string, any>) {
  trackEvent(FIREBASE_CLIENT_EVENTS.FORM_SUBMIT, {
    form_name: formName,
    ...formData,
  });
}

/**
 * Track a button click
 * 
 * @param buttonName - Name/ID of the button
 * @param additionalData - Additional data about the click
 */
export function trackButtonClick(buttonName: string, additionalData?: Record<string, any>) {
  trackEvent(FIREBASE_CLIENT_EVENTS.BUTTON_CLICK, {
    button_name: buttonName,
    ...additionalData,
  });
}

/**
 * Track an error
 * 
 * @param errorMessage - Error message
 * @param errorCode - Error code
 * @param additionalData - Additional error context
 */
export function trackError(
  errorMessage: string,
  errorCode?: string,
  additionalData?: Record<string, any>
) {
  trackEvent(FIREBASE_CLIENT_EVENTS.APP_ERROR, {
    error_message: errorMessage,
    error_code: errorCode,
    ...additionalData,
  });
}

/**
 * Track a search
 * 
 * @param searchTerm - The search query
 * @param resultCount - Number of results (optional)
 */
export function trackSearch(searchTerm: string, resultCount?: number) {
  trackEvent(FIREBASE_CLIENT_EVENTS.SEARCH, {
    search_term: searchTerm,
    result_count: resultCount,
  });
}

/**
 * Track a share action
 * 
 * @param contentType - Type of content shared
 * @param method - Share method (e.g., 'whatsapp', 'email')
 * @param contentId - ID of the shared content
 */
export function trackShare(
  contentType: string,
  method: string,
  contentId?: string
) {
  trackEvent(FIREBASE_CLIENT_EVENTS.SHARE, {
    content_type: contentType,
    method: method,
    content_id: contentId,
  });
}

/**
 * Track authentication events
 */
export const authTracking = {
  signUp: (method: string, userId?: string) => {
    trackEvent(FIREBASE_CLIENT_EVENTS.SIGN_UP, {
      method: method,
      user_id: userId,
    });
  },

  login: (method: string, userId?: string) => {
    trackEvent(FIREBASE_CLIENT_EVENTS.LOGIN, {
      method: method,
      user_id: userId,
    });
  },

  logout: () => {
    trackEvent(FIREBASE_CLIENT_EVENTS.LOGOUT);
  },

  otpSent: (phone: string) => {
    trackEvent(FIREBASE_CLIENT_EVENTS.OTP_SENT, {
      phone_number_length: phone.length,
    });
  },

  otpVerified: () => {
    trackEvent(FIREBASE_CLIENT_EVENTS.OTP_VERIFIED);
  },

  otpFailed: (reason: string) => {
    trackEvent(FIREBASE_CLIENT_EVENTS.OTP_FAILED, {
      failure_reason: reason,
    });
  },
};

/**
 * Track payment events
 */
export const paymentTracking = {
  beginCheckout: (value: number, currency: string, items?: any[]) => {
    trackEvent(FIREBASE_CLIENT_EVENTS.BEGIN_CHECKOUT, {
      value,
      currency,
      items,
    });
  },

  addPaymentInfo: (paymentMethod: string) => {
    trackEvent(FIREBASE_CLIENT_EVENTS.ADD_PAYMENT_INFO, {
      payment_method: paymentMethod,
    });
  },

  purchase: (transactionId: string, value: number, currency: string, items?: any[]) => {
    trackEvent(FIREBASE_CLIENT_EVENTS.PURCHASE, {
      transaction_id: transactionId,
      value,
      currency,
      items,
    });
  },

  paymentFailed: (reason: string, value?: number) => {
    trackEvent(ANALYTICS_EVENTS.PAYMENT_FAILED, {
      failure_reason: reason,
      value,
    });
  },

  paymentCaptured: (transactionId: string, value: number, currency: string) => {
    trackEvent(ANALYTICS_EVENTS.PAYMENT_CAPTURED, {
      transaction_id: transactionId,
      value,
      currency,
    });
  },
};

/**
 * Track subscription events
 */
export const subscriptionTracking = {
  viewPlans: () => {
    trackEvent(FIREBASE_CLIENT_EVENTS.VIEW_SUBSCRIPTION_PLANS);
  },

  selectPlan: (planName: string, planId: string, price: number, billingPeriod: string) => {
    trackEvent(FIREBASE_CLIENT_EVENTS.SELECT_SUBSCRIPTION_PLAN, {
      plan_name: planName,
      plan_id: planId,
      price,
      billing_period: billingPeriod,
    });
  },

  activated: (planName: string, planId: string, price: number) => {
    trackEvent(ANALYTICS_EVENTS.SUBSCRIPTION_ACTIVATED, {
      plan_name: planName,
      plan_id: planId,
      value: price,
    });
  },

  cancelled: (planName: string, reason?: string) => {
    trackEvent(ANALYTICS_EVENTS.SUBSCRIPTION_CANCELLED, {
      plan_name: planName,
      cancellation_reason: reason,
    });
  },

  charged: (planName: string, amount: number) => {
    trackEvent(ANALYTICS_EVENTS.SUBSCRIPTION_CHARGED, {
      plan_name: planName,
      value: amount,
    });
  },

  paused: (planName: string) => {
    trackEvent(ANALYTICS_EVENTS.SUBSCRIPTION_PAUSED, {
      plan_name: planName,
    });
  },

  resumed: (planName: string) => {
    trackEvent(ANALYTICS_EVENTS.SUBSCRIPTION_RESUMED, {
      plan_name: planName,
    });
  },
};

/**
 * Track media events
 */
export const mediaTracking = {
  videoUploaded: (videoId: string, fileSize: number, duration?: number) => {
    trackEvent(FIREBASE_CLIENT_EVENTS.VIDEO_UPLOADED, {
      content_id: videoId,
      file_size: fileSize,
      duration,
    });
  },

  videoProcessed: (videoId: string, processingTime: number) => {
    trackEvent(FIREBASE_CLIENT_EVENTS.VIDEO_PROCESSED, {
      content_id: videoId,
      processing_time: processingTime,
    });
  },

  imageUploaded: (imageId: string, fileSize: number) => {
    trackEvent(FIREBASE_CLIENT_EVENTS.IMAGE_UPLOADED, {
      content_id: imageId,
      file_size: fileSize,
    });
  },

  mediaShared: (mediaType: string, mediaId: string, shareMethod: string) => {
    trackEvent(FIREBASE_CLIENT_EVENTS.MEDIA_SHARED, {
      content_type: mediaType,
      content_id: mediaId,
      method: shareMethod,
    });
  },
};

