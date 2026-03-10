import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { 
  user, 
  userMetadata, 
  account, 
  pushToken, 
  deviceSession,
  userImage,
  playStoreRating,
  subscription,
  order,
  abandonedCheckout,
  subscriptionLog,
  phonepeOrder,
  phonepeSubscription
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
        { status: 401 }
      );
    }

    const body = await req.json();
    const { userId, phoneNumber } = body;

    if (!userId || !phoneNumber) {
      return NextResponse.json(
        { error: "userId and phoneNumber are required" },
        { status: 400 }
      );
    }

    const appId = "com.kiranaapps.app";

    // Fetch all user data in parallel
    const [
      metadata,
      accounts,
      pushTokens,
      deviceSessions,
      userImages,
      playStoreRatings,
      subscriptions,
      orders,
      abandonedCheckouts,
      subscriptionLogs,
      phonepeOrders,
      phonepeSubscriptions
    ] = await Promise.all([
      // User metadata
      db.select()
        .from(userMetadata)
        .where(and(eq(userMetadata.userId, userId), eq(userMetadata.appId, appId))),

      // Linked accounts (Google, Truecaller, etc)
      db.select()
        .from(account)
        .where(and(eq(account.userId, userId), eq(account.appId, appId))),

      // Push tokens
      db.select()
        .from(pushToken)
        .where(and(eq(pushToken.userId, userId), eq(pushToken.appId, appId))),

      // Device sessions
      db.select()
        .from(deviceSession)
        .where(and(eq(deviceSession.userId, userId), eq(deviceSession.appId, appId))),

      // User images
      db.select()
        .from(userImage)
        .where(and(eq(userImage.userId, userId), eq(userImage.appId, appId))),

      // Play Store ratings
      db.select()
        .from(playStoreRating)
        .where(and(eq(playStoreRating.userId, userId), eq(playStoreRating.appId, appId))),

      // Subscriptions
      db.select()
        .from(subscription)
        .where(and(eq(subscription.userId, userId), eq(subscription.appId, appId))),

      // Orders
      db.select()
        .from(order)
        .where(and(eq(order.userId, userId), eq(order.appId, appId))),

      // Abandoned checkouts
      db.select()
        .from(abandonedCheckout)
        .where(and(eq(abandonedCheckout.userId, userId), eq(abandonedCheckout.appId, appId))),

      // Subscription logs
      db.select()
        .from(subscriptionLog)
        .where(and(eq(subscriptionLog.userId, userId), eq(subscriptionLog.appId, appId))),

      // PhonePe orders
      db.select()
        .from(phonepeOrder)
        .where(and(eq(phonepeOrder.userId, userId), eq(phonepeOrder.appId, appId))),

      // PhonePe subscriptions
      db.select()
        .from(phonepeSubscription)
        .where(and(eq(phonepeSubscription.userId, userId), eq(phonepeSubscription.appId, appId))),
    ]);

    return NextResponse.json({
      userId,
      phoneNumber,
      metadata,
      accounts,
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
    });

  } catch (error) {
    console.error("[Internal API] Error fetching user data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
