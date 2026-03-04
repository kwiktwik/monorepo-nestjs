import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAnalytics, Analytics, logEvent as firebaseLogEvent, setUserId, setUserProperties } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB5gPfL2W2mHCCfule42HajKh1IXQB7Log",
  authDomain: "kiranaapps-alertpay.firebaseapp.com",
  projectId: "kiranaapps-alertpay",
  storageBucket: "kiranaapps-alertpay.firebasestorage.app",
  messagingSenderId: "1020043794796",
  appId: "1:1020043794796:web:72ba34745cc320e06e7b49",
  measurementId: "G-4DV4KMPWZE"
};

// Initialize Firebase
let app: FirebaseApp;
let analytics: Analytics | null = null;

// Initialize Firebase app (safe for SSR)
if (typeof window !== 'undefined') {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
    console.log('[Firebase] Initialized Firebase app');
  } else {
    app = getApps()[0];
  }

  // Initialize Analytics
  try {
    analytics = getAnalytics(app);
    console.log('[Firebase Analytics] Analytics initialized');
  } catch (error) {
    console.error('[Firebase Analytics] Failed to initialize:', error);
  }
}

/**
 * Log a custom event to Firebase Analytics
 * @param eventName - Name of the event (e.g., "sign_up", "purchase")
 * @param eventParams - Optional parameters for the event
 */
export function logEvent(eventName: string, eventParams?: Record<string, any>) {
  if (!analytics) {
    console.warn('[Firebase Analytics] Analytics not initialized - event not logged:', eventName);
    return;
  }

  try {
    firebaseLogEvent(analytics, eventName, eventParams);
    console.log('[Firebase Analytics] Event logged:', eventName, eventParams);
  } catch (error) {
    console.error('[Firebase Analytics] Failed to log event:', eventName, error);
  }
}

/**
 * Set the user ID for tracking
 * @param userId - Unique identifier for the user
 */
export function setAnalyticsUserId(userId: string | null) {
  if (!analytics) {
    console.warn('[Firebase Analytics] Analytics not initialized - user ID not set');
    return;
  }

  try {
    setUserId(analytics, userId);
    console.log('[Firebase Analytics] User ID set:', userId);
  } catch (error) {
    console.error('[Firebase Analytics] Failed to set user ID:', error);
  }
}

/**
 * Set user properties for analytics
 * @param properties - Object containing user properties
 */
export function setAnalyticsUserProperties(properties: Record<string, any>) {
  if (!analytics) {
    console.warn('[Firebase Analytics] Analytics not initialized - user properties not set');
    return;
  }

  try {
    setUserProperties(analytics, properties);
    console.log('[Firebase Analytics] User properties set:', properties);
  } catch (error) {
    console.error('[Firebase Analytics] Failed to set user properties:', error);
  }
}

export { analytics };
