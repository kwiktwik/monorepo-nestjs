import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/better-auth/auth";
import { validateAppId, AppValidationError } from "@/lib/utils/app-validator";
import {
  getDynamicConfig,
  USER_TYPES,
  DEEPLINK_CAMPAIGNS,
  type UserType,
  type DeeplinkCampaign,
} from "../config-v3-data";

// Extended user type that may include userType and deeplink from custom session data
interface ExtendedUser {
  id: string;
  userType?: string;
  deeplink?: string;
  [key: string]: unknown;
}

/**
 * GET /api/config/v3
 *
 * Fetch application configuration with dynamic paywall based on user type and deeplink.
 * Supports query parameters for userType and deeplink campaign.
 *
 * Query Parameters:
 * - userType: User type for paywall selection (new, active, expired, abandoned, trial_expired, churned)
 * - deeplink: Deeplink campaign source (marketing_50_percent, marketing_trial, referral, retargeting, seasonal)
 *
 * - If x-app-id is present and matches a known app → returns that app's config with dynamic paywall.
 * - If x-app-id is missing or unknown → returns 401 Unauthorized.
 *
 * Requires authentication via Better Auth session.
 *
 * Response:
 * - 200: Configuration data for the app with dynamic paywall
 * - 401: Unauthorized - no valid session or invalid/missing app ID
 * - 500: Internal server error
 */
export async function GET(req: NextRequest) {
  try {
    // Validate app ID from headers
    let appId: string;
    try {
      appId = validateAppId(req);
    } catch (error) {
      if (error instanceof AppValidationError) {
        return NextResponse.json(
          { error: error.message },
          { status: error.statusCode || 401 }
        );
      }
      throw error;
    }

    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized - no valid session" },
        { status: 401 }
      );
    }

    // Cast user to extended type to check for custom properties
    const user = session.user as ExtendedUser;

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const userTypeParam = searchParams.get("userType");
    const deeplinkParam = searchParams.get("deeplink");

    // Resolve user type from query param, user object, or default to NEW
    let userType: UserType = USER_TYPES.NEW;
    if (userTypeParam && Object.values(USER_TYPES).includes(userTypeParam as UserType)) {
      userType = userTypeParam as UserType;
    } else if (user.userType && Object.values(USER_TYPES).includes(user.userType as UserType)) {
      userType = user.userType as UserType;
    }

    // Resolve deeplink from query param, user object, or default to NONE
    let deeplink: DeeplinkCampaign = DEEPLINK_CAMPAIGNS.NONE;
    if (deeplinkParam && Object.values(DEEPLINK_CAMPAIGNS).includes(deeplinkParam as DeeplinkCampaign)) {
      deeplink = deeplinkParam as DeeplinkCampaign;
    } else if (user.deeplink && Object.values(DEEPLINK_CAMPAIGNS).includes(user.deeplink as DeeplinkCampaign)) {
      deeplink = user.deeplink as DeeplinkCampaign;
    }

    const context = {
      appId,
      userType,
      deeplink,
    };

    const config = getDynamicConfig(appId, context);

    if (!config) {
      return NextResponse.json(
        { error: `Configuration not found for app ID: ${appId}` },
        { status: 401 }
      );
    }

    // Safely access _paywallMeta
    const paywallMeta = (config as { _paywallMeta?: { ruleName?: string } })._paywallMeta;

    console.log(
      `[GET /api/config/v3] App: ${appId}, User: ${user.id}, UserType: ${userType}, Deeplink: ${deeplink} -> Plan: ${paywallMeta?.ruleName ?? 'unknown'}`
    );

    return NextResponse.json(
      { success: true, appId, config },
      { status: 200 }
    );
  } catch (error) {
    console.error("[GET /api/config/v3] Error:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message || "Failed to fetch config" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
