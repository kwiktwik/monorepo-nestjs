import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/better-auth/auth";
import { validateAppId, AppValidationError } from "@/lib/utils/app-validator";
import { getConfigForAppId } from "../config-v2-data";
import { db } from "@/db";
import { abandonedCheckouts } from "@/db/schema";
import { and, eq, desc } from "drizzle-orm";

const DISCOUNT_ELIGIBILITY_MINUTES = 30;
const DISCOUNT_OFFER_HOURS = 24;

// Type definitions for config structure
interface ConfigFeatures {
  subscription?: {
    plan_id?: string;
    discount_plan_id?: string;
    discount_amount?: number;
    is_discount_eligible?: boolean;
  };
  order?: {
    amount?: number;
    currency?: string;
    payment_method?: string;
    isRecurring?: boolean;
    token?: {
      frequency?: string;
      max_amount?: number;
      expire_at?: number;
    };
  };
}

interface ConfigUI {
  paywall?: {
    pricing?: {
      initialAmount?: string;
      recurringAmount?: string;
      period?: string;
    };
  };
}

interface AppConfig {
  features?: ConfigFeatures;
  ui?: ConfigUI;
  [key: string]: unknown;
}

/**
 * GET /api/config/v2
 *
 * Fetch application configuration for the requesting app only.
 * Filters config by x-app-id (or x-app-identifier) header.
 *
 * - If x-app-id is present and matches a known app → returns that app's config.
 * - If x-app-id is missing or unknown → returns 401 Unauthorized.
 * - If user abandoned checkout 30+ mins ago and offer not expired → returns discount pricing
 * - Discount offer expires 24 hours after first eligibility (regardless of purchase)
 *
 * Requires authentication via Better Auth session.
 *
 * Response:
 * - 200: Configuration data for the app
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
          { status: error.statusCode || 401 },
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
        { status: 401 },
      );
    }

    const userId = session.user.id;
    const config = getConfigForAppId(appId) as AppConfig;

    if (!config) {
      return NextResponse.json(
        { error: `Configuration not found for app ID: ${appId}` },
        { status: 401 },
      );
    }
    // Check if user is eligible for discount pricing
    const lastAbandonedCheckout = await db
      .select()
      .from(abandonedCheckouts)
      .where(
        and(
          eq(abandonedCheckouts.userId, userId),
          eq(abandonedCheckouts.appId, appId),
        )
      )
      .orderBy(desc(abandonedCheckouts.checkoutStartedAt))
      .limit(1);

    const thirtyMinutesAgo = new Date(Date.now() - DISCOUNT_ELIGIBILITY_MINUTES * 60 * 1000);
    
    const isEligibleForDiscount = lastAbandonedCheckout.length > 0 && 
      lastAbandonedCheckout[0].checkoutStartedAt < thirtyMinutesAgo;
    
    // Check if discount offer has expired (24 hours from when first eligible)
    let isOfferExpired = false;
    let calculatedExpiry: Date | null = null;
    
    if (isEligibleForDiscount) {
      if (lastAbandonedCheckout[0].offerExpiresAt) {
        // Use stored expiration time
        isOfferExpired = new Date() > lastAbandonedCheckout[0].offerExpiresAt;
      } else {
        // Calculate expiration: checkoutStartedAt + 30 mins + 24 hours
        calculatedExpiry = new Date(
          lastAbandonedCheckout[0].checkoutStartedAt.getTime() + 
          (DISCOUNT_ELIGIBILITY_MINUTES * 60 * 1000) + 
          (DISCOUNT_OFFER_HOURS * 60 * 60 * 1000)
        );
        isOfferExpired = new Date() > calculatedExpiry;
      }
    }
    
    // Clone config to avoid mutating original
    const responseConfig: AppConfig = { ...config };

    // If eligible for discount and offer not expired, update pricing in the config
    if (isEligibleForDiscount && !isOfferExpired) {
      const discountAmount = responseConfig.features?.subscription?.discount_amount;
      
      if (discountAmount) {
        // Update order token max_amount to discount price
        if (responseConfig.features?.order?.token) {
          responseConfig.features.order.token = {
            ...responseConfig.features.order.token,
            max_amount: discountAmount * 100, // in paise
          };
        }
        
        // Update UI pricing display
        if (responseConfig.ui?.paywall?.pricing) {
          responseConfig.ui.paywall.pricing = {
            ...responseConfig.ui.paywall.pricing,
            recurringAmount: `₹${discountAmount}`,
          };
        }
        
        // Add discount flag for Android to know
        if (responseConfig.features?.subscription) {
          responseConfig.features.subscription = {
            ...responseConfig.features.subscription,
            is_discount_eligible: true,
          };
        }
        
        // Set expiration time if not already set (first time becoming eligible)
        if (!lastAbandonedCheckout[0].offerExpiresAt) {
          const offerExpiresAt = calculatedExpiry || new Date(Date.now() + DISCOUNT_OFFER_HOURS * 60 * 60 * 1000);
          await db
            .update(abandonedCheckouts)
            .set({ offerExpiresAt })
            .where(eq(abandonedCheckouts.id, lastAbandonedCheckout[0].id));
        }
      }
    } else if (isOfferExpired) {
    }

    return NextResponse.json(
      {
        success: true,
        appId,
        config: responseConfig,
        ...(isEligibleForDiscount && !isOfferExpired && { isDiscountEligible: true }),
        ...(isOfferExpired && { isDiscountExpired: true }),
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[GET /api/config/v2] Error:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message || "Failed to fetch config" },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
