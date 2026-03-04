import crypto from "crypto";
import Mixpanel from "mixpanel";
import { headers } from "next/headers";
import { db } from "@/db";
import { deviceSessions } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

const FACEBOOK_ACCESS_TOKEN = process.env.VED_FACEBOOK_CONVERSION_AP_TOKEN || "";
const FACEBOOK_PIXEL_ID = process.env.FACEBOOK_PIXEL_ID || "";

const SHARE_STATUS_PIXEL_ID = process.env.SHARE_STATUS_PIXEL_ID || "";
const SHARE_STATUS_FACEBOOK_CONVERSION_AP_TOKEN = process.env.SHARE_STATUS_FACEBOOK_CONVERSION_AP_TOKEN || "";

const ALERTSOUNDBOX_FACEBOOK_PIXEL_ID = process.env.ALERTSOUNDBOX_FACEBOOK_PIXEL_ID || "";
const ALERTSOUNDBOX_FACEBOOK_CONVERSION_AP_TOKEN = process.env.ALERTSOUNDBOX_FACEBOOK_CONVERSION_AP_TOKEN || "";
const ALERTSOUNDBOX_FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID_ALERT_SOUND_BOX_2 || "";

const SHARE_STATUS_FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID_SHARE_STATUS || "";

const MIXPANEL_TOKEN = process.env.VED_MIXPANEL_TOKEN_ALERTPAY || "";
const FIREBASE_MEASUREMENT_ID = process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-4DV4KMPWZE";
const FIREBASE_API_SECRET = process.env.FIREBASE_API_SECRET || "";

// Initialize Mixpanel client
let mixpanel: Mixpanel.Mixpanel | null = null;
if (MIXPANEL_TOKEN) {
  try {
    mixpanel = Mixpanel.init(MIXPANEL_TOKEN);
  } catch (error) {
    console.error("[Mixpanel] Failed to initialize:", error);
  }
}

export interface UserData {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  userId?: string;
  ip?: string;
  userAgent?: string;
}

export interface EventProperties {
  [key: string]: string | number | boolean | undefined;
}

/**
 * Hash user data for privacy (used for Facebook)
 */
function hashData(data: string | undefined): string | undefined {
  if (!data) return undefined;
  return crypto.createHash("sha256").update(data.toLowerCase().trim()).digest("hex");
}

/**
 * Get latest device session data for a user
 * Used for Facebook Conversions API extinfo
 */
async function getLatestDeviceData(userId: string) {
  try {
    const deviceData = await db
      .select({
        deviceModel: deviceSessions.deviceModel,
        osVersion: deviceSessions.osVersion,
        appVersion: deviceSessions.appVersion,
        locale: deviceSessions.locale,
        timezone: deviceSessions.timezone,
      })
      .from(deviceSessions)
      .where(eq(deviceSessions.userId, userId))
      .orderBy(desc(deviceSessions.createdAt))
      .limit(1);
    
    return deviceData[0] || null;
  } catch (error) {
    console.error("[Facebook API] Failed to get device data:", error);
    return null;
  }
}

const BLOCKED_FACEBOOK_KEYS = [
  "status",
  "event",
  "password",
  "passwd",
  "secret",
  "token",
  "credit_card",
  "cc_number",
  "card_number",
  "cvv",
  "ssn",
  "health",
  "medical",
  "dob",
  "date_of_birth",
  "pan",
  "aadhaar",
];

/**
 * Filter out blocked keys from custom data
 */
function sanitizeFacebookData(data: EventProperties | undefined): EventProperties | undefined {
  if (!data) return undefined;

  const sanitized: EventProperties = {};
  for (const [key, value] of Object.entries(data)) {
    if (!BLOCKED_FACEBOOK_KEYS.includes(key.toLowerCase())) {
      sanitized[key] = value;
    } else {
      console.warn(`[Facebook API] ⚠️  Blocked parameter removed: ${key}`);
    }
  }
  return sanitized;
}

/**
 * Send event to Facebook Conversion API
 * Completely isolated error handling - this function will NEVER throw
 */
export async function sendFacebookConversionEvent(
  eventName: string,
  userData: UserData,
  customData?: EventProperties,
  appId?: string,
  eventId?: string
): Promise<boolean> {
  try {
    console.log(`[Facebook API] Starting ${eventName} event send... AppID: ${appId || "default"}`);

    // Determine credentials based on appId (package name)
    let pixelId = FACEBOOK_PIXEL_ID;
    let fbAppId: string | undefined = ALERTSOUNDBOX_FACEBOOK_APP_ID;
    let accessToken = FACEBOOK_ACCESS_TOKEN;

    // Mapping of package names to specific credentials
    const credentialMapping: Record<string, { pixelId: string; appId?: string; accessToken: string }> = {
      "com.sharestatus.app": {
        pixelId: SHARE_STATUS_PIXEL_ID,
        appId: SHARE_STATUS_FACEBOOK_APP_ID,
        accessToken: SHARE_STATUS_FACEBOOK_CONVERSION_AP_TOKEN,
      },
      "com.sharekaro.kirana": {
        pixelId: SHARE_STATUS_PIXEL_ID, // Assuming same for now, but can be changed easily
        appId: SHARE_STATUS_FACEBOOK_APP_ID,
        accessToken: SHARE_STATUS_FACEBOOK_CONVERSION_AP_TOKEN,
      },
      "com.alertsoundbox.app": {
        pixelId: ALERTSOUNDBOX_FACEBOOK_PIXEL_ID,
        appId: ALERTSOUNDBOX_FACEBOOK_APP_ID,
        accessToken: ALERTSOUNDBOX_FACEBOOK_CONVERSION_AP_TOKEN,
      },
      "com.kiranaapps.app": {
        pixelId: FACEBOOK_PIXEL_ID,
        appId: ALERTSOUNDBOX_FACEBOOK_APP_ID,
        accessToken: FACEBOOK_ACCESS_TOKEN,
      },
    };

    if (appId && credentialMapping[appId]) {
      const { pixelId: mappedPixelId, appId: mappedAppId, accessToken: mappedAccessToken } = credentialMapping[appId];
      if (mappedPixelId && mappedAccessToken) {
        pixelId = mappedPixelId;
        fbAppId = mappedAppId;
        accessToken = mappedAccessToken;
      } else {
        console.warn(`[Facebook API] Specific credentials missing for package: ${appId}, falling back to default`);
      }
    }

    if (!accessToken || (!pixelId && !fbAppId)) {
      console.warn("[Facebook API] Not configured - skipping event. Missing:", {
        hasToken: !!accessToken,
        hasPixelId: !!pixelId,
      });
      return false;
    }

    const eventTime = Math.floor(Date.now() / 1000);

    // Hash user data for privacy
    const userData_hashed: Record<string, string> = {};
    if (userData.email) {
      userData_hashed.em = hashData(userData.email)!;
    }
    if (userData.phone) {
      userData_hashed.ph = hashData(userData.phone)!;
    }
    if (userData.firstName) {
      userData_hashed.fn = hashData(userData.firstName)!;
    }
    if (userData.lastName) {
      userData_hashed.ln = hashData(userData.lastName)!;
    }
    if (userData.ip) {
      userData_hashed.client_ip_address = userData.ip;
    }
    if (userData.userAgent) {
      userData_hashed.client_user_agent = userData.userAgent;
    }
    // Sanitize custom data
    const sanitizedCustomData = sanitizeFacebookData(customData);

    // Meta Conversions API expects 'value' and 'currency' in custom_data
    // - value: numeric > 0 (we receive 'amount' from our events, map to value)
    // - currency: ISO 4217 code (e.g. INR) - required for purchase events
    const customDataForFacebook = { ...(sanitizedCustomData || {}) };
    if (customDataForFacebook.amount !== undefined && customDataForFacebook.value === undefined) {
      const numValue = Number(customDataForFacebook.amount);
      if (numValue > 0) {
        customDataForFacebook.value = numValue;
      }
    }
    // Ensure currency is set when we have value (Meta recommends it for purchase events)
    if (
      customDataForFacebook.value !== undefined &&
      (customDataForFacebook.currency === undefined || customDataForFacebook.currency === "")
    ) {
      customDataForFacebook.currency = "INR";
    }

    let url = "";
    let payload: any = {};

    // Conversions API - unified endpoint for both web and app events
    // Use Pixel ID (dataset_id) as the endpoint
    const datasetId = pixelId;
    if (!datasetId) {
      console.warn("[Facebook API] No Pixel ID configured - skipping event");
      return false;
    }

    url = `https://graph.facebook.com/v25.0/${datasetId}/events?access_token=${accessToken}`;

    // Get device data if userId is available for app events
    let deviceData = null;
    if (fbAppId && userData.userId) {
      try {
        deviceData = await getLatestDeviceData(userData.userId);
      } catch (e) {
        console.warn(`[Facebook API] Failed to get device data for user ${userData.userId}`);
      }
    }

    const eventPayload: any = {
      event_name: eventName,
      event_time: eventTime,
      event_id: eventId,
      action_source: fbAppId ? "app" : "website",
      user_data: userData_hashed,
      custom_data: customDataForFacebook,
    };

    // For app events, add app_data with required fields
    // Use device data if available, otherwise use defaults
    if (fbAppId) {
      eventPayload.app_data = {
        advertiser_tracking_enabled: 1,
        application_tracking_enabled: 1,
        extinfo: [
          "a2",                           // 0: version (a2=Android, i2=iOS)
          appId || "com.kiranaapps.app",  // 1: package name
          deviceData?.appVersion || "1.0",  // 2: short version
          deviceData?.appVersion || "1.0.0", // 3: long version
          deviceData?.osVersion || "14.0",  // 4: OS version
          deviceData?.deviceModel || "Unknown", // 5: device model
          deviceData?.locale || "en_IN",   // 6: locale
          "IST",                           // 7: timezone abbreviation
          "Unknown",                       // 8: carrier
          "Unknown",                       // 9: screen width
          "Unknown",                       // 10: screen height
          "Unknown",                       // 11: screen density
          "Unknown",                       // 12: CPU cores
          "Unknown",                       // 13: total disk space
          "Unknown",                       // 14: free disk space
          deviceData?.timezone || "Asia/Kolkata", // 15: device timezone
        ],
      };
    }

    payload = {
      data: [eventPayload],
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error(`[Facebook API] ❌ Event failed - Status: ${response.status}`, {
        eventName,
        error: result,
      });
      return false;
    } else {
      console.log(`[Facebook API] ✅ Event sent successfully:`, {
        eventName,
        eventsReceived: result.events_received || 0,
        messagesReceived: result.messages || [],
      });
      return true;
    }
  } catch (error) {
    // This catch ensures Facebook API errors NEVER propagate
    console.error(`[Facebook API] ❌ Critical error (isolated):`, {
      eventName,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return false;
  }
}

/**
 * Send event to Mixpanel
 * Completely isolated error handling - this function will NEVER throw
 * 
 * Following Mixpanel server-side best practices:
 * - Requires distinct_id (user identifier)
 * - Supports user properties via $set
 * - Includes IP address for geolocation
 * - Includes event properties
 */
export async function sendMixpanelEvent(
  eventName: string,
  distinctId: string,
  properties?: EventProperties,
  userProperties?: EventProperties,
  insertId?: string
): Promise<boolean> {
  try {
    if (!mixpanel) {
      if (!MIXPANEL_TOKEN) {
        console.warn("[Mixpanel] Not configured - skipping event. Missing token.");
      }
      return false;
    }
    // Prepare event properties
    // Mixpanel Node.js SDK signature: track(event_name: string, properties?: PropertyDict)
    // distinct_id should be included in the properties object
    // Filter out undefined values as Mixpanel PropertyDict doesn't allow them
    const eventProperties: Record<string, string | number | boolean> = {
      distinct_id: distinctId,
    };

    if (insertId) {
      eventProperties.$insert_id = insertId;
    }

    if (properties) {
      for (const [key, value] of Object.entries(properties)) {
        // Keep these reserved Mixpanel identity fields controlled server-side.
        if (key === "distinct_id" || key === "$insert_id") {
          continue;
        }
        if (value !== undefined) {
          eventProperties[key] = value as string | number | boolean;
        }
      }
    }

    // Track the event
    mixpanel.track(eventName, eventProperties);

    // Update user properties if provided
    // Note: people.set requires Mixpanel People feature to be enabled
    if (userProperties && Object.keys(userProperties).length > 0) {
      try {
        mixpanel.people.set(distinctId, userProperties);
      } catch (peopleError) {
        // People API might not be available, log but don't fail
        console.warn("[Mixpanel] Failed to set user properties (People API may not be enabled):", peopleError);
      }
    }
    return true;
  } catch (error) {
    // This catch ensures Mixpanel API errors NEVER propagate
    console.error(`[Mixpanel] ❌ Critical error (isolated):`, {
      eventName,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return false;
  }
}

/**
 * Send event to Firebase Analytics using Measurement Protocol
 * Completely isolated error handling - this function will NEVER throw
 * 
 * Firebase Analytics Measurement Protocol documentation:
 * https://developers.google.com/analytics/devguides/collection/protocol/ga4
 */
export async function sendFirebaseAnalyticsEvent(
  eventName: string,
  userData: UserData,
  eventParameters?: EventProperties
): Promise<boolean> {
  try {
    if (!FIREBASE_API_SECRET || !FIREBASE_MEASUREMENT_ID) {
      console.warn("[Firebase Analytics] Not configured - skipping event. Missing:", {
        hasApiSecret: !!FIREBASE_API_SECRET,
        hasMeasurementId: !!FIREBASE_MEASUREMENT_ID,
      });
      return false;
    }

    console.log(`[Firebase Analytics] Starting ${eventName} event send...`);

    // Use userId or email as client_id (required by Firebase)
    const clientId = userData.userId || userData.email || userData.phone || crypto.randomUUID();

    // Prepare event parameters
    const params: Record<string, string | number | boolean> = {};
    if (eventParameters) {
      for (const [key, value] of Object.entries(eventParameters)) {
        if (value !== undefined) {
          params[key] = value as string | number | boolean;
        }
      }
    }

    // Add user properties to event parameters
    if (userData.email) params.user_email = userData.email;
    if (userData.phone) params.user_phone = userData.phone;
    if (userData.firstName) params.user_first_name = userData.firstName;
    if (userData.lastName) params.user_last_name = userData.lastName;

    const payload = {
      client_id: clientId,
      user_id: userData.userId,
      events: [
        {
          name: eventName,
          params,
        },
      ],
    };

    // Send to Firebase Analytics Measurement Protocol
    // https://developers.google.com/analytics/devguides/collection/protocol/ga4/reference?client_type=gtag
    const response = await fetch(
      `https://www.google-analytics.com/mp/collect?measurement_id=${FIREBASE_MEASUREMENT_ID}&api_secret=${FIREBASE_API_SECRET}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    // Firebase Measurement Protocol returns 204 No Content on success
    if (response.status === 204) {
      console.log(`[Firebase Analytics] ✅ Event sent successfully:`, {
        eventName,
        status: response.status,
      });
      return true;
    } else {
      const result = await response.text();
      console.error(`[Firebase Analytics] ⚠️  Unexpected response - Status: ${response.status}`, {
        eventName,
        response: result,
      });
      return false;
    }
  } catch (error) {
    // This catch ensures Firebase Analytics errors NEVER propagate
    console.error(`[Firebase Analytics] ❌ Critical error (isolated):`, {
      eventName,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return false;
  }
}

/**
 * Send event to Firebase, Facebook, and Mixpanel
 * Convenience function for tracking events to all platforms
 * Completely isolated error handling - this function will NEVER throw
 */
export async function sendAnalyticsEvent(
  eventName: string,
  userData: UserData,
  eventProperties?: EventProperties,
  facebookCustomData?: EventProperties,
  appId?: string,
  deduplicationId?: string
): Promise<boolean> {
  try {
    // Automatically populate IP and User Agent from request headers if missing
    try {
      const headersList = await headers();
      if (!userData.ip) {
        const forwardedFor = headersList.get("x-forwarded-for");
        const realIp = headersList.get("x-real-ip");
        userData.ip = forwardedFor ? forwardedFor.split(",")[0].trim() : (realIp || undefined);
      }
      if (!userData.userAgent) {
        userData.userAgent = headersList.get("user-agent") || undefined;
      }
    } catch (headerError) {
      // Ignore errors if headers() is not available (e.g. non-request context)
    }

    // Send to Firebase Analytics (isolated - won't throw)
    const firebaseSuccess = await sendFirebaseAnalyticsEvent(eventName, userData, eventProperties);

    // Send to Facebook (isolated - won't throw)
    let facebookSuccess = false;
    if (facebookCustomData || eventProperties) {
      facebookSuccess = await sendFacebookConversionEvent(
        eventName,
        userData,
        facebookCustomData || eventProperties,
        appId,
        deduplicationId
      );
    }

    // Send to Mixpanel (isolated - won't throw)
    // Prioritize app userId so webhook/server events map to the same user profile.
    const eventUserId =
      (typeof eventProperties?.user_id === "string" && eventProperties.user_id) ||
      (typeof eventProperties?.userId === "string" && eventProperties.userId) ||
      undefined;
    const distinctId = userData.userId || eventUserId || userData.email || userData.phone || "anonymous";

    // Prepare Mixpanel user properties
    const mixpanelUserProperties: EventProperties = {};
    if (userData.userId || eventUserId) {
      mixpanelUserProperties.$user_id = userData.userId || eventUserId;
    }
    if (userData.email) mixpanelUserProperties.$email = userData.email;
    if (userData.phone) mixpanelUserProperties.$phone = userData.phone;
    if (userData.firstName) mixpanelUserProperties.$first_name = userData.firstName;
    if (userData.lastName) mixpanelUserProperties.$last_name = userData.lastName;

    const mixpanelSuccess = await sendMixpanelEvent(
      eventName,
      distinctId,
      eventProperties,
      mixpanelUserProperties,
      deduplicationId // Pass as $insert_id
    );

    // Return true if Mixpanel succeeded (primary concern)
    // OR if we sent to at least one provider if Mixpanel wasn't the target
    return mixpanelSuccess;
  } catch (error) {
    // This catch ensures analytics errors NEVER propagate to webhook processing
    console.error(`[Analytics] ❌ Critical error (isolated):`, {
      eventName,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return false;
  }
}
