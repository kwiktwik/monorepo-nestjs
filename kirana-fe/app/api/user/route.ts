import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/better-auth/auth";
import { db } from "@/db";
import {
  user,
  account,
  userMetadata,
  orders,
  subscriptions,
  phonepeSubscriptions,
  session as sessionTable,
  notifications,
  playStoreRatings,
} from "@/db/schema";
import { PHONEPE_CONSTANTS } from "@/lib/phonepe";
import { eq, and, inArray, isNotNull } from "drizzle-orm";
import { ORDER_STATUS } from "@/lib/constants/order-status";
import {
  validateAppId,
  AppValidationError,
  getEquivalentAppIds,
} from "@/lib/utils/app-validator";

/**
 * GET /api/user
 *
 * Fetch current user's profile information including:
 * - name, phone number, email
 * - account type (telegram, google, otp)
 * - upi vpa
 * - audio language
 *
 * Requires authentication via Better Auth session
 *
 * Response:
 * - 200: User data retrieved successfully
 * - 401: Unauthorized - no valid session
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

    // Get the Better Auth session from the incoming request
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
    console.log("[GET /api/user] Request for userId:", userId, "appId:", appId);

    // Fetch user data
    const [userData] = await db
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch account type from account table
    const accounts = await db
      .select()
      .from(account)
      .where(eq(account.userId, userId));

    const accountType = accounts.length > 0 ? accounts[0].providerId : null;

    // Fetch user metadata for this app (treat alertpay-default and alertpay-android as same)
    const [userMeta] = await db
      .select()
      .from(userMetadata)
      .where(
        and(
          eq(userMetadata.userId, userId),
          inArray(userMetadata.appId, getEquivalentAppIds(appId)),
        ),
      )
      .limit(1);

    const upiVpa = userMeta?.upiVpa || null;
    const audioLanguage = userMeta?.audioLanguage || "en-US";

    // Check if user is premium (has captured/paid orders OR active subscriptions) for this app
    // Treat alertpay-default and alertpay-android as the same app
    console.log("[GET /api/user] Checking premium status...");
    const paidOrders = await db
      .select()
      .from(orders)
      .where(
        and(
          eq(orders.userId, userId),
          inArray(orders.appId, getEquivalentAppIds(appId)),
          eq(orders.status, ORDER_STATUS.CAPTURED),
        ),
      );

    console.log("[GET /api/user] Paid orders fetched:", paidOrders.length);

    // Check if user has active subscriptions
    // Fetch all records for this user/app and filter in memory to avoid potential Enum SQL issues
    const allUserSubscriptions = await db
      .select()
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.userId, userId),
          inArray(subscriptions.appId, getEquivalentAppIds(appId)),
        ),
      );

    const now = new Date();
    const activeSubscriptions = allUserSubscriptions.filter(
      (sub) =>
        sub.status === ORDER_STATUS.ACTIVE ||
        (sub.status === ORDER_STATUS.CANCELLED &&
          sub.endAt != null &&
          sub.endAt > now)
    );

    // Check PhonePe Subscriptions (Decoupled)
    const allPhonePeSubscriptions = await db
      .select()
      .from(phonepeSubscriptions)
      .where(
        and(
          eq(phonepeSubscriptions.userId, userId),
          // PhonePe subs also need appId check if we added it to schema
          inArray(phonepeSubscriptions.appId, getEquivalentAppIds(appId))
        )
      );

    const activePhonePeSubscriptions = allPhonePeSubscriptions.filter(
      (sub) => sub.state === PHONEPE_CONSTANTS.STATES.ACTIVE
    );

    console.log(
      "[GET /api/user] Subscription check:",
      {
        razorpay: {
          total: allUserSubscriptions.length,
          active: activeSubscriptions.length,
          statuses: allUserSubscriptions.map(s => s.status)
        },
        phonepe: {
          total: allPhonePeSubscriptions.length,
          active: activePhonePeSubscriptions.length,
          statuses: allPhonePeSubscriptions.map(s => s.state)
        }
      }
    );

    // Check if user has submitted a Play Store review for this app
    // Treat alertpay-default and alertpay-android as the same app
    console.log("[GET /api/user] Checking Play Store review status...");
    const [review] = await db
      .select()
      .from(playStoreRatings)
      .where(
        and(
          eq(playStoreRatings.userId, userId),
          inArray(playStoreRatings.appId, getEquivalentAppIds(appId)),
          isNotNull(playStoreRatings.submittedToPlayStoreAt),
        ),
      )
      .limit(1);

    const isPlayStoreReviewSubmitted = !!review;
    console.log(
      "[GET /api/user] isPlayStoreReviewSubmitted:",
      isPlayStoreReviewSubmitted,
    );

    const isPremium = paidOrders.length > 0 || activeSubscriptions.length > 0;

    console.log("[GET /api/user] isPremium:", isPremium);
    // Return user data
    return NextResponse.json(
      {
        success: true,
        data: {
          id: userData.id,
          name: userData.name,
          phoneNumber: userData.phoneNumber,
          email: userData.email,
          accountType: accountType,
          upiVpa: upiVpa,
          audioLanguage: audioLanguage,
          emailVerified: userData.emailVerified,
          phoneNumberVerified: userData.phoneNumberVerified,
          image: userData.image,
          createdAt: userData.createdAt,
          updatedAt: userData.updatedAt,
          appId: appId,
          isPlayStoreReviewSubmitted: isPlayStoreReviewSubmitted,
          isPremium: isPremium,
          debug: {
            subsTotal: allUserSubscriptions.length,
            subsActive: activeSubscriptions.length,
            subsStatuses: allUserSubscriptions.map(s => s.status),
            appId: appId,
            equivalentAppIds: getEquivalentAppIds(appId)
          }
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[GET /api/user] Error:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message || "Failed to fetch user data" },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/user
 *
 * Update current user's profile information
 *
 * Body Parameters:
 * - name*: User's name (required)
 * - phoneNumber*: User's phone number (required)
 * - email: User's email (optional)
 * - accountType: Account type - telegram, google, otp (optional, read-only from account table)
 * - upiVpa: UPI Virtual Payment Address (optional)
 * - audioLanguage: Audio language preference (optional, e.g., "en", "hi")
 *
 * Requires authentication via Better Auth session
 *
 * Response:
 * - 200: User updated successfully
 * - 400: Invalid input data
 * - 401: Unauthorized - no valid session
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
          { status: error.statusCode || 401 },
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
        { status: 401 },
      );
    }

    const userId = session.user.id;
    const body = await req.json();
    const { name, phoneNumber, email, upiVpa, audioLanguage } = body;

    console.log(
      "[POST /api/user] Update request for userId:",
      userId,
      "appId:",
      appId,
    );

    // Validate required fields
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    if (!phoneNumber) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 },
      );
    }

    // Validate phone number format (E.164 format)
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return NextResponse.json(
        {
          error:
            "Invalid phone number format. Please use E.164 format (e.g., +919876543210)",
        },
        { status: 400 },
      );
    }

    // Validate email format if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { error: "Invalid email format" },
          { status: 400 },
        );
      }
    }

    // Validate UPI VPA format if provided
    if (upiVpa) {
      const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
      if (!upiRegex.test(upiVpa)) {
        return NextResponse.json(
          { error: "Invalid UPI VPA format. Expected format: user@bank" },
          { status: 400 },
        );
      }
    }

    // Validate app-specific fields
    // Only AlertPay apps support audioLanguage
    if (audioLanguage !== undefined && !appId.startsWith("alertpay")) {
      return NextResponse.json(
        { error: `Audio language field is not supported for ${appId}` },
        { status: 400 },
      );
    }

    // Update user table
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

    // Update or create user metadata for this app (treat alertpay-default and alertpay-android as same)
    const [existingMeta] = await db
      .select()
      .from(userMetadata)
      .where(
        and(
          eq(userMetadata.userId, userId),
          inArray(userMetadata.appId, getEquivalentAppIds(appId)),
        ),
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

    if (audioLanguage !== undefined) {
      metadataUpdate.audioLanguage = audioLanguage || null;
    }

    if (existingMeta) {
      // Update existing metadata for this app (treat alertpay-default and alertpay-android as same)
      await db
        .update(userMetadata)
        .set(metadataUpdate)
        .where(
          and(
            eq(userMetadata.userId, userId),
            inArray(userMetadata.appId, getEquivalentAppIds(appId)),
          ),
        );
    } else {
      // Create new metadata record for this app
      await db.insert(userMetadata).values(metadataUpdate);
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

    // Fetch user metadata for this app (treat alertpay-default and alertpay-android as same)
    const [userMetaRecord] = await db
      .select()
      .from(userMetadata)
      .where(
        and(
          eq(userMetadata.userId, userId),
          inArray(userMetadata.appId, getEquivalentAppIds(appId)),
        ),
      )
      .limit(1);

    const finalUpiVpa = userMetaRecord?.upiVpa || upiVpa || null;
    const finalAudioLanguage =
      userMetaRecord?.audioLanguage || audioLanguage || null;

    return NextResponse.json(
      {
        success: true,
        message: "User updated successfully",
        data: {
          id: updatedUser.id,
          name: updatedUser.name,
          phoneNumber: updatedUser.phoneNumber,
          email: updatedUser.email,
          accountType: accountType,
          upiVpa: finalUpiVpa,
          audioLanguage: finalAudioLanguage,
          emailVerified: updatedUser.emailVerified,
          phoneNumberVerified: updatedUser.phoneNumberVerified,
          image: updatedUser.image,
          createdAt: updatedUser.createdAt,
          updatedAt: updatedUser.updatedAt,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[POST /api/user] Error:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message || "Failed to update user" },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
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
];

/**
 * DELETE /api/user
 *
 * Delete the current user and all associated data
 *
 * This endpoint will explicitly delete:
 * - All sessions
 * - All accounts
 * - User metadata
 * - All notifications
 * - All orders
 * - The user record
 *
 * Requires authentication via Better Auth session
 *
 * Accepts phoneNumber or userId as query parameter or in request body
 * Allowed when: (1) user deletes their own account, or (2) target user is a test user (testUserId)
 *
 * Response:
 * - 200: User and all data deleted successfully
 * - 400: Phone number or userId is required or invalid format
 * - 401: Unauthorized - no valid session
 * - 403: Forbidden - cannot delete this user
 * - 404: User not found
 * - 500: Internal server error
 */
export async function DELETE(req: NextRequest) {
  try {
    // Authenticate via session
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized - no valid session" },
        { status: 401 },
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
        { status: 400 },
      );
    }

    let userData: (typeof user.$inferSelect) | undefined;

    if (userIdParam) {
      const [found] = await db.select().from(user).where(eq(user.id, userIdParam)).limit(1);
      userData = found;
    } else if (phoneNumber) {
      const phoneRegex = /^\+[1-9]\d{1,14}$/;
      if (!phoneRegex.test(phoneNumber)) {
        return NextResponse.json(
          {
            error:
              "Invalid phone number format. Please use E.164 format (e.g., +919876543210)",
          },
          { status: 400 },
        );
      }
      const [found] = await db.select().from(user).where(eq(user.phoneNumber, phoneNumber)).limit(1);
      userData = found;
    }

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = userData.id;

    // Allow: (1) user deletes own account, or (2) target is a test user
    const isSelfDelete = sessionUserId === userId;
    const isTestUser = TEST_USER_IDS.includes(userId);

    if (!isSelfDelete && !isTestUser) {
      return NextResponse.json(
        { error: "Forbidden - you can only delete your own account or test users" },
        { status: 403 },
      );
    }

    // Delete all related data explicitly
    // Delete sessions
    await db.delete(sessionTable).where(eq(sessionTable.userId, userId));

    // Delete accounts
    await db.delete(account).where(eq(account.userId, userId));

    // Delete user metadata
    await db.delete(userMetadata).where(eq(userMetadata.userId, userId));

    // Delete notifications
    await db.delete(notifications).where(eq(notifications.userId, userId));

    // Delete orders
    await db.delete(orders).where(eq(orders.userId, userId));

    // Delete subscriptions
    await db.delete(subscriptions).where(eq(subscriptions.userId, userId));

    // Finally, delete the user
    await db.delete(user).where(eq(user.id, userId));

    console.log(
      `[DELETE /api/user] User and all related data deleted successfully: ${phoneNumber} (userId: ${userId})`,
    );

    return NextResponse.json(
      {
        success: true,
        message: "User and all associated data deleted successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[DELETE /api/user] Error:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message || "Failed to delete user" },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
