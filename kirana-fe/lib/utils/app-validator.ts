import { NextRequest } from "next/server";
import { isValidApp, getAppConfig, DEFAULT_APP_ID, REGISTERED_APPS } from "@/lib/config/apps";

/**
 * App validation error types
 */
export class AppValidationError extends Error {
  constructor(
    message: string,
    public statusCode: number = 401
  ) {
    super(message);
    this.name = "AppValidationError";
  }
}

/**
 * Extract app ID from request headers
 * Supports multiple header formats for flexibility
 */
export function extractAppId(req: NextRequest | Request): string | null {
  const headers = req.headers;
  
  // Try different header variations
  const appId =
    headers.get("x-app-id") ||
    headers.get("X-App-ID") ||
    headers.get("x-app-identifier") ||
    headers.get("X-App-Identifier");

  return appId;
}

/**
 * Validate app ID from request headers
 * Returns default app ID if header is missing (backward compatibility)
 * Throws AppValidationError only if app ID is invalid
 */
export function validateAppId(req: NextRequest | Request): string {
  const appId = extractAppId(req);

  // If no app ID provided, use default for backward compatibility
  if (!appId) {
    console.log("[App Validator] No X-App-ID header found, using default app");
    return DEFAULT_APP_ID;
  }
  // Debug: Log the received app ID
  console.log(`[App Validator] Received app ID: "${appId}"`);
  // Check if app ID is valid and enabled
  if (!isValidApp(appId)) {
    // Debug: Log all registered apps
    console.log(`[App Validator] Available app IDs:`, Object.keys(REGISTERED_APPS));
    throw new AppValidationError(
      `Invalid or disabled app identifier: ${appId}`,
      401
    );
  }

  return appId;
}

/**
 * Get app ID from request with fallback to default
 * Use this for backward compatibility scenarios
 */
export function getAppIdOrDefault(req: NextRequest | Request): string {
  try {
    return validateAppId(req);
  } catch (error) {
    // If validation fails, return default app ID for backward compatibility
    return DEFAULT_APP_ID;
  }
}

/**
 * Check if a specific feature is enabled for an app
 */
export function isFeatureEnabled(
  appId: string,
  feature: "otpLogin" | "truecallerLogin" | "googleLogin"
): boolean {
  const config = getAppConfig(appId);
  if (!config) return false;

  return config.features?.[feature] ?? true; // Default to true if not specified
}

/**
 * Validate app ID and feature support
 * Returns default app ID if header is missing (backward compatibility)
 * Throws AppValidationError if app doesn't support the feature
 */
export function validateAppFeature(
  req: NextRequest | Request,
  feature: "otpLogin" | "truecallerLogin" | "googleLogin"
): string {
  const appId = validateAppId(req); // This now returns default if missing

  if (!isFeatureEnabled(appId, feature)) {
    throw new AppValidationError(
      `Feature '${feature}' is not enabled for app: ${appId}`,
      403
    );
  }

  return appId;
}

/**
 * Get equivalent app IDs for payment-related queries
 * Treats "alertpay-default" and "alertpay-android" as the same app
 * Returns an array of app IDs that should be considered equivalent
 */
export function getEquivalentAppIds(appId: string): string[] {
  // Treat alertpay-default and alertpay-android as the same app
  if (appId === "alertpay-default" || appId === "alertpay-android") {
    return ["alertpay-default", "alertpay-android"];
  }
  // For all other apps, return just the app ID itself
  return [appId];
}
