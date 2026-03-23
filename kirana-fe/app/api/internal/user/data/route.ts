import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  user,
  userMetadata,
  account,
  pushTokens,
  deviceSessions,
  userImages,
  playStoreRatings,
  subscriptions,
  orders,
  abandonedCheckouts,
  subscriptionLogs,
  phonepeOrders,
  phonepeSubscriptions,
  enhancedNotifications,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * Internal API: Fetch all user data for migration
 * This endpoint returns all user-related data from all tables
 * Protected by INTERNAL_API_KEY
 * POST /api/internal/user/data
 * Headers:
 *   X-Internal-Key: <internal_api_key>
 * Body: { userId: "...", phoneNumber: "..." }
 * Response: Complete user data from all tables
 */

// Get internal API key from environment
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY;

export async function POST(req: NextRequest) {
  try {
    // Check internal API key
    const internalKey = req.headers.get("x-internal-key");

    if (!INTERNAL_API_KEY || internalKey !== INTERNAL_API_KEY) {
      return NextResponse.json(
        { error: "Unauthorized - invalid internal API key" },
        { status: 401 },
      );
    }

    const body = await req.json();
    const { userId, phoneNumber } = body;

    if (!userId || !phoneNumber) {
      return NextResponse.json(
        { error: "userId and phoneNumber are required" },
        { status: 400 },
      );
    }

    const appId = "com.kiranaapps.app";

    // Fetch user data first
    const userData = await db
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    // Fetch all user data in parallel
    const [
      metadata,
      accounts,
      pushTokensData,
      deviceSessionsData,
      userImagesData,
      playStoreRatingsData,
      subscriptionsData,
      ordersData,
      abandonedCheckoutsData,
      subscriptionLogsData,
      phonepeOrdersData,
      phonepeSubscriptionsData,
      enhancedNotificationsData,
    ] = await Promise.all([
      // User metadata
      db
        .select()
        .from(userMetadata)
        .where(
          and(eq(userMetadata.userId, userId), eq(userMetadata.appId, appId)),
        ),

      // Linked accounts (Google, Truecaller, etc)
      db.select().from(account).where(eq(account.userId, userId)),

      // Push tokens
      db
        .select()
        .from(pushTokens)
        .where(and(eq(pushTokens.userId, userId), eq(pushTokens.appId, appId))),

      // Device sessions
      db
        .select()
        .from(deviceSessions)
        .where(
          and(
            eq(deviceSessions.userId, userId),
            eq(deviceSessions.appId, appId),
          ),
        ),

      // User images
      db
        .select()
        .from(userImages)
        .where(and(eq(userImages.userId, userId), eq(userImages.appId, appId))),

      // Play Store ratings
      db
        .select()
        .from(playStoreRatings)
        .where(
          and(
            eq(playStoreRatings.userId, userId),
            eq(playStoreRatings.appId, appId),
          ),
        ),

      // Subscriptions
      db
        .select()
        .from(subscriptions)
        .where(
          and(eq(subscriptions.userId, userId), eq(subscriptions.appId, appId)),
        ),

      // Orders
      db
        .select()
        .from(orders)
        .where(and(eq(orders.userId, userId), eq(orders.appId, appId))),

      // Abandoned checkouts
      db
        .select()
        .from(abandonedCheckouts)
        .where(
          and(
            eq(abandonedCheckouts.userId, userId),
            eq(abandonedCheckouts.appId, appId),
          ),
        ),

      // Subscription logs
      db
        .select()
        .from(subscriptionLogs)
        .where(
          and(
            eq(subscriptionLogs.userId, userId),
            eq(subscriptionLogs.appId, appId),
          ),
        ),

      // PhonePe orders
      db
        .select()
        .from(phonepeOrders)
        .where(eq(phonepeOrders.merchantUserId, userId)),

      // PhonePe subscriptions
      db
        .select()
        .from(phonepeSubscriptions)
        .where(
          and(
            eq(phonepeSubscriptions.userId, userId),
            eq(phonepeSubscriptions.appId, appId),
          ),
        ),

      // Enhanced notifications
      db
        .select()
        .from(enhancedNotifications)
        .where(eq(enhancedNotifications.userId, userId)),
    ]);

    return NextResponse.json({
      userId,
      phoneNumber,
      user: userData[0] || null,
      metadata,
      accounts,
      pushTokens: pushTokensData,
      deviceSessions: deviceSessionsData,
      userImages: userImagesData,
      playStoreRatings: playStoreRatingsData,
      subscriptions: subscriptionsData,
      orders: ordersData,
      abandonedCheckouts: abandonedCheckoutsData,
      subscriptionLogs: subscriptionLogsData,
      phonepeOrders: phonepeOrdersData,
      phonepeSubscriptions: phonepeSubscriptionsData,
      enhancedNotifications: enhancedNotificationsData,
    });
  } catch (error) {
    console.error("[Internal API] Error fetching user data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
