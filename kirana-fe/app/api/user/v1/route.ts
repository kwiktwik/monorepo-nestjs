import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/better-auth/auth";
import { db } from "@/db";
import {
  user,
  account,
  userMetadata,
  orders,
  subscriptions,
  session as sessionTable,
  notifications,
  playStoreRatings,
  enhancedNotifications,
  notificationLogs,
  teamNotifications,
  userImages,
  pushTokens,
  phonepeSubscriptions,
  phonepeOrders,
} from "@/db/schema";
import { eq, and, or, gt, inArray, isNotNull } from "drizzle-orm";
import { ORDER_STATUS } from "@/lib/constants/order-status";
import { validateAppId, AppValidationError, getEquivalentAppIds } from "@/lib/utils/app-validator";

/* =========================
   TYPES
========================= */

/**
 * User response data structure
 */
interface UserResponseData {
  id: string;
  name: string;
  phoneNumber: string | null;
  email: string;
  accountType: string | null;
  emailVerified: boolean;
  phoneNumberVerified: boolean | null;
  createdAt: Date;
  updatedAt: Date;
  appId: string;
  upiVpa?: string | null;
  audioLanguage?: string;
  isPremium?: boolean;
  isPlayStoreReviewSubmitted?: boolean;
}

/* =========================
   APP-SPECIFIC FEATURES
========================= */

/**
 * Define which features each app group needs
 */
const JAMUN_FEATURES = {
  needsPremiumStatus: true,
  needsUpiVpa: false,
  needsAudioLanguage: false,
  needsOrders: false,
  needsSubscriptions: false,
  needsNotifications: false,
};

const APP_FEATURES: Record<string, typeof JAMUN_FEATURES> = {
  // AlertPay family apps - full payment features
  alertpay: {
    needsPremiumStatus: true,
    needsUpiVpa: true,
    needsAudioLanguage: true,
    needsOrders: true,
    needsSubscriptions: true,
    needsNotifications: true,
  },
  // Specific App IDs for Sharekaro family
  "com.sharestatus.app": JAMUN_FEATURES,
  "com.sharekaro.kirana": JAMUN_FEATURES,
  // Default fallback
  default: {
    needsPremiumStatus: false,
    needsUpiVpa: false,
    needsAudioLanguage: false,
    needsOrders: false,
    needsSubscriptions: false,
    needsNotifications: false,
  },
};

/**
 * Get app feature configuration based on appId
 */
function getAppFeatures(appId: string) {
  if (appId.startsWith("alertpay")) {
    return APP_FEATURES.alertpay;
  }

  if (appId in APP_FEATURES) {
    return APP_FEATURES[appId];
  }

  return APP_FEATURES.default;
}

/**
 * GET /api/user/v1
 * 
 * Fetch current user's profile information with app-specific features:
 * - Basic: name, phone number, email, account type
 * - App-specific: upi vpa, audio language, premium status (based on app needs)
 * 
 * Requires authentication via Better Auth session
 * Requires X-App-ID header for multi-app support
 * 
 * Response:
 * - 200: User data retrieved successfully
 * - 401: Unauthorized - no valid session or invalid app ID
 * - 404: User not found
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

    // Get the Better Auth session from the incoming request
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized - no valid session" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const appFeatures = getAppFeatures(appId);

    // Fetch user data (always needed)
    const [userData] = await db
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (!userData) {
      console.log(`[GET /api/user/v1] User not found: ${userId}`);
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Fetch account type (always needed)
    const accounts = await db
      .select()
      .from(account)
      .where(eq(account.userId, userId));

    const accountType = accounts.length > 0 ? accounts[0].providerId : null;

    // Compute premium status (active subscription for this app)
    const equivalentAppIdsForPremium = getEquivalentAppIds(appId);
    const now = new Date();
    const activeSubscriptions = await db
      .select()
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.userId, userId),
          inArray(subscriptions.appId, equivalentAppIdsForPremium),
          or(
            eq(subscriptions.status, ORDER_STATUS.ACTIVE),
            and(
              eq(subscriptions.status, ORDER_STATUS.CANCELLED),
              isNotNull(subscriptions.endAt),
              gt(subscriptions.endAt, now)
            )
          )
        )
      )
      .limit(1);
    const isPremium = activeSubscriptions.length > 0;

    // Fetch user metadata (treat alertpay-default and alertpay-android as same)
    const equivalentAppIdsForMeta = getEquivalentAppIds(appId);
    const [userMeta] = await db
      .select()
      .from(userMetadata)
      .where(
        and(
          eq(userMetadata.userId, userId),
          inArray(userMetadata.appId, equivalentAppIdsForMeta)
        )
      )
      .limit(1);

    const upiVpa = userMeta?.upiVpa || null;

    // Build base response
    const responseData: UserResponseData = {
      id: userData.id,
      name: userData.name,
      phoneNumber: userData.phoneNumber,
      email: userData.email,
      accountType: accountType,
      emailVerified: userData.emailVerified,
      phoneNumberVerified: userData.phoneNumberVerified,
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt,
      appId: appId,
      isPremium,
      upiVpa,
    };

    // Add app-specific metadata
    if (appFeatures.needsAudioLanguage) {
      responseData.audioLanguage = userMeta?.audioLanguage || "en-US";
    }

    // Check if user has submitted a Play Store review for this app
    const equivalentAppIds = getEquivalentAppIds(appId);
    const [submittedReview] = await db
      .select({ id: playStoreRatings.id })
      .from(playStoreRatings)
      .where(
        and(
          eq(playStoreRatings.userId, userId),
          inArray(playStoreRatings.appId, equivalentAppIds),
          isNotNull(playStoreRatings.submittedToPlayStoreAt)
        )
      )
      .limit(1);
    responseData.isPlayStoreReviewSubmitted = !!submittedReview;

    // Return user data with app-specific features
    return NextResponse.json(
      {
        success: true,
        data: responseData,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[GET /api/user/v1] Error:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message || "Failed to fetch user data" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/user/v1
 * 
 * Update current user's profile information with app-specific fields
 * 
 * Body Parameters:
 * - name*: User's name (required)
 * - phoneNumber*: User's phone number (required)
 * - email: User's email (optional)
 * - upiVpa: UPI Virtual Payment Address (optional, AlertPay apps only)
 * - audioLanguage: Audio language preference (optional, AlertPay apps only)
 * 
 * Headers:
 * - X-App-ID: App identifier (required for multi-app support)
 * 
 * Requires authentication via Better Auth session
 * 
 * Response:
 * - 200: User updated successfully
 * - 400: Invalid input data or unsupported field for app
 * - 401: Unauthorized - no valid session or invalid app ID
 * - 500: Internal server error
 */
export async function POST(req: NextRequest) {
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

    // Get the Better Auth session from the incoming request
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized - no valid session" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const appFeatures = getAppFeatures(appId);
    const body = await req.json();
    const {
      name,
      phoneNumber,
      email,
      upiVpa,
      audioLanguage,
    } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    if (!phoneNumber) {
      console.log(`[POST /api/user/v1] Validation failed: Phone number is required`);
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      );
    }

    // Validate phone number format (E.164 format)
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phoneNumber)) {
      console.log(`[POST /api/user/v1] Validation failed: Invalid phone number format: ${phoneNumber}`);
      return NextResponse.json(
        {
          error:
            "Invalid phone number format. Please use E.164 format (e.g., +919876543210)",
        },
        { status: 400 }
      );
    }

    // Validate email format if provided
    if (email) {
      console.log(`[POST /api/user/v1] Validating email format`);
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        console.log(`[POST /api/user/v1] Validation failed: Invalid email format`);
        return NextResponse.json(
          { error: "Invalid email format" },
          { status: 400 }
        );
      }
    }

    // Validate app-specific fields
    if (audioLanguage !== undefined && !appFeatures.needsAudioLanguage) {
      console.log(`[POST /api/user/v1] Validation failed: Audio language not supported for ${appId}`);
      return NextResponse.json(
        { error: `Audio language field is not supported for ${appId}` },
        { status: 400 }
      );
    }

    // Validate UPI VPA format if provided
    if (upiVpa) {
      console.log(`[POST /api/user/v1] Validating UPI VPA format`);
      const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
      if (!upiRegex.test(upiVpa)) {
        console.log(`[POST /api/user/v1] Validation failed: Invalid UPI VPA format`);
        return NextResponse.json(
          { error: "Invalid UPI VPA format. Expected format: user@bank" },
          { status: 400 }
        );
      }
    }

    console.log(`[POST /api/user/v1] All validations passed`);

    // Update user table (always)
    console.log(`[POST /api/user/v1] Updating user table for userId: ${userId}`);
    const updateData: {
      name: string;
      phoneNumber: string;
      email?: string;
      updatedAt: Date;
    } = {
      name,
      phoneNumber,
      updatedAt: new Date(),
    };

    if (email) {
      updateData.email = email;
    }

    await db.update(user).set(updateData).where(eq(user.id, userId));
    console.log(`[POST /api/user/v1] User table updated successfully`);

    // Update or create user metadata if upiVpa or app-specific fields provided
    // Treat alertpay-default and alertpay-android as the same app
    if (upiVpa !== undefined || (audioLanguage !== undefined && appFeatures.needsAudioLanguage)) {
      console.log(`[POST /api/user/v1] Checking for existing metadata for userId: ${userId}, appId: ${appId}`);
      const equivalentAppIds = getEquivalentAppIds(appId);
      const [existingMeta] = await db
        .select()
        .from(userMetadata)
        .where(
          and(
            eq(userMetadata.userId, userId),
            inArray(userMetadata.appId, equivalentAppIds)
          )
        )
        .limit(1);

      const metadataUpdate: {
        userId: string;
        appId: string;
        upiVpa?: string | null;
        audioLanguage?: string | null;
        updatedAt: Date;
      } = {
        userId,
        appId,
        updatedAt: new Date(),
      };

      if (upiVpa !== undefined) {
        metadataUpdate.upiVpa = upiVpa || null;
      }

      if (audioLanguage !== undefined && appFeatures.needsAudioLanguage) {
        metadataUpdate.audioLanguage = audioLanguage || null;
      }

      if (existingMeta) {
        // Update existing metadata for this app (treat alertpay-default and alertpay-android as same)
        console.log(`[POST /api/user/v1] Updating existing metadata`);
        await db
          .update(userMetadata)
          .set(metadataUpdate)
          .where(
            and(
              eq(userMetadata.userId, userId),
              inArray(userMetadata.appId, equivalentAppIds)
            )
          );
        console.log(`[POST /api/user/v1] Metadata updated successfully`);
      } else {
        // Create new metadata record for this app
        console.log(`[POST /api/user/v1] Creating new metadata record`);
        await db.insert(userMetadata).values(metadataUpdate);
        console.log(`[POST /api/user/v1] Metadata created successfully`);
      }
    }

    // Fetch updated user data to return
    const [updatedUser] = await db
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    // Fetch account type
    const accounts = await db
      .select()
      .from(account)
      .where(eq(account.userId, userId));

    const accountType = accounts.length > 0 ? accounts[0].providerId : null;

    // Build response with app-specific data
    const responseData: UserResponseData = {
      id: updatedUser.id,
      name: updatedUser.name,
      phoneNumber: updatedUser.phoneNumber,
      email: updatedUser.email,
      accountType: accountType,
      emailVerified: updatedUser.emailVerified,
      phoneNumberVerified: updatedUser.phoneNumberVerified,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
      appId: appId,
    };

    // Fetch user metadata to include in response (treat alertpay-default and alertpay-android as same)
    const equivalentAppIdsForResponse = getEquivalentAppIds(appId);
    const [userMetaRecord] = await db
      .select()
      .from(userMetadata)
      .where(
        and(
          eq(userMetadata.userId, userId),
          inArray(userMetadata.appId, equivalentAppIdsForResponse)
        )
      )
      .limit(1);

    responseData.upiVpa = userMetaRecord?.upiVpa || null;

    if (appFeatures.needsAudioLanguage) {
      responseData.audioLanguage = userMetaRecord?.audioLanguage || "en-US";
    }

    return NextResponse.json(
      {
        success: true,
        message: "User updated successfully",
        data: responseData,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[POST /api/user/v1] Error:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message || "Failed to update user" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Test user IDs - allowed to delete for cleanup during development
 */
const TEST_USER_IDS = [
  "QECitrvk5oeTJu-JtQCnF",
  "bpOYs4lsVGWEyweMpvQNmILpkBroar1F",
  "WoIHGy328w69P33Tw3HfRngLRpemvUyP",
  "YUdJSEfOPSqR3WFYVmihe5fhWbSEGEsp"
];

/**
 * DELETE /api/user/v1
 * 
 * Delete the current user and all associated data across all apps
 * 
 * This endpoint will explicitly delete:
 * - All sessions (across all apps)
 * - All accounts
 * - All user metadata (across all apps)
 * - All notifications
 * - All orders
 * - All subscriptions
 * - The user record
 * 
 * Note: This deletes the user globally, not just for the specific app.
 * If you need app-specific user removal, consider a different approach.
 * 
 * Requires authentication via Better Auth session
 * Requires X-App-ID header for multi-app support
 * 
 * Accepts phoneNumber or userId as query parameter or in request body
 * Allowed when: (1) user deletes their own account, or (2) target user is a test user (testUserId)
 * 
 * Response:
 * - 200: User and all data deleted successfully
 * - 400: Phone number or userId is required or invalid format
 * - 401: Unauthorized - no valid session or invalid app ID
 * - 403: Forbidden - cannot delete this user
 * - 404: User not found
 * - 500: Internal server error
 */
export async function DELETE(req: NextRequest) {
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

    // Authenticate via session
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized - no valid session" },
        { status: 401 }
      );
    }

    const sessionUserId = session.user.id;

    // Get phoneNumber or userId from query params or body
    const { searchParams } = new URL(req.url);
    let phoneNumber = searchParams.get("phoneNumber");
    let userIdParam = searchParams.get("userId");

    if (!phoneNumber && !userIdParam) {
      try {
        const body = await req.json();
        phoneNumber = phoneNumber ?? body.phoneNumber;
        userIdParam = userIdParam ?? body.userId;
      } catch {
        // Body parsing failed
      }
    }

    if (!phoneNumber && !userIdParam) {
      return NextResponse.json(
        { error: "Phone number or userId is required" },
        { status: 400 }
      );
    }

    let userData: typeof user.$inferSelect | undefined;

    if (userIdParam) {
      // Lookup by userId
      const [found] = await db.select().from(user).where(eq(user.id, userIdParam)).limit(1);
      userData = found;
    } else if (phoneNumber) {
      // Validate phone number format (E.164 format)
      const phoneRegex = /^\+[1-9]\d{1,14}$/;
      if (!phoneRegex.test(phoneNumber)) {
        return NextResponse.json(
          {
            error:
              "Invalid phone number format. Please use E.164 format (e.g., +919876543210)",
          },
          { status: 400 }
        );
      }
      const [found] = await db.select().from(user).where(eq(user.phoneNumber, phoneNumber)).limit(1);
      userData = found;
    }

    console.log(`[DELETE /api/user/v1] Delete request for userId/phone: ${userIdParam ?? phoneNumber ?? "?"}, appId: ${appId}`);

    if (!userData) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const userId = userData.id;

    // Allow: (1) user deletes own account, or (2) target is a test user
    // Note: Test users can be reset by anyone with access (if we allow purely by ID in future), but currently restricted to self-delete or if specifically listed as test user.
    // The previous logic allowed "target is a test user" to bypass self-check.
    // We keep that logic.
    const isSelfDelete = sessionUserId === userId;
    const isTestUser = TEST_USER_IDS.includes(userId);

    if (!isSelfDelete && !isTestUser) {
      return NextResponse.json(
        { error: "Forbidden - you can only delete your own account or test users" },
        { status: 403 }
      );
    }

    console.log(`[DELETE /api/user/v1] Starting deletion for userId: ${userId}`);

    // Delete all related data explicitly (CASCADE deletion handled by schema, but being explicit)
    // Order matters: delete child records before parent

    // 1. Delete sessions (forces logout)
    await db.delete(sessionTable).where(eq(sessionTable.userId, userId));
    console.log(`[DELETE /api/user/v1] Deleted sessions for userId: ${userId}`);

    // 2. Delete user metadata (across all apps)
    await db.delete(userMetadata).where(eq(userMetadata.userId, userId));
    console.log(`[DELETE /api/user/v1] Deleted user metadata for userId: ${userId}`);

    // 3. Delete notifications (AlertPay specific)
    await db.delete(notifications).where(eq(notifications.userId, userId));
    console.log(`[DELETE /api/user/v1] Deleted notifications for userId: ${userId}`);

    // 4. Delete enhanced notifications
    await db.delete(enhancedNotifications).where(eq(enhancedNotifications.userId, userId));
    console.log(`[DELETE /api/user/v1] Deleted enhanced notifications for userId: ${userId}`);

    // 5. Delete notification logs
    await db.delete(notificationLogs).where(eq(notificationLogs.userId, userId));
    console.log(`[DELETE /api/user/v1] Deleted notification logs for userId: ${userId}`);

    // 6. Delete team notifications
    await db.delete(teamNotifications).where(eq(teamNotifications.userId, userId));
    console.log(`[DELETE /api/user/v1] Deleted team notifications for userId: ${userId}`);

    // 7. Delete orders (AlertPay specific)
    await db.delete(orders).where(eq(orders.userId, userId));
    console.log(`[DELETE /api/user/v1] Deleted orders for userId: ${userId}`);

    // 8. Delete phonepe orders (this acts on orderId relation - wait, schema says phonepe_orders references orders.id CASCADE, so deleting orders handles it. But let's be safe if we want explicit clearing or if cascade fails)
    // Actually, phonepeOrders references orders.id with CASCADE. So deleting 'orders' is sufficient for PhonePe orders linked to those orders.
    // However, looking at schema: phonepe_orders references orders.id with onDelete: "cascade". So we are good.

    // 9. Delete subscriptions (AlertPay specific)
    await db.delete(subscriptions).where(eq(subscriptions.userId, userId));
    console.log(`[DELETE /api/user/v1] Deleted subscriptions for userId: ${userId}`);

    // 10. Delete phonepe subscriptions
    await db.delete(phonepeSubscriptions).where(eq(phonepeSubscriptions.userId, userId));
    console.log(`[DELETE /api/user/v1] Deleted phonepe subscriptions for userId: ${userId}`);

    // 11. Delete user images
    await db.delete(userImages).where(eq(userImages.userId, userId));
    console.log(`[DELETE /api/user/v1] Deleted user images for userId: ${userId}`);

    // 12. Delete play store ratings
    await db.delete(playStoreRatings).where(eq(playStoreRatings.userId, userId));
    console.log(`[DELETE /api/user/v1] Deleted play store ratings for userId: ${userId}`);

    // 13. Delete push tokens
    await db.delete(pushTokens).where(eq(pushTokens.userId, userId));
    console.log(`[DELETE /api/user/v1] Deleted push tokens for userId: ${userId}`);

    // 14. For non-test users, delete user and account (full delete)
    // For test users, we keep user and account to "reset" them
    if (!isTestUser) {
      await db.delete(account).where(eq(account.userId, userId));
      console.log(`[DELETE /api/user/v1] Deleted accounts for userId (non-test user): ${userId}`);

      await db.delete(user).where(eq(user.id, userId));
      console.log(`[DELETE /api/user/v1] Deleted user record for userId (non-test user): ${userId}`);
    } else {
      console.log(`[DELETE /api/user/v1] Skipped deleting user/account for test user: ${userId} (reset only)`);
    }

    const action = isTestUser ? "reset" : "deleted";
    console.log(`[DELETE /api/user/v1] User ${action} successfully: ${userData.phoneNumber ?? userId} (userId: ${userId}), requested from appId: ${appId}`);

    return NextResponse.json(
      {
        success: true,
        message: `User ${action} successfully${isTestUser ? " (data cleared, account preserved)" : ""}`,
        appId: appId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[DELETE /api/user/v1] Error:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message || "Failed to delete user" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
