"use server";

import { db } from "@/db";
import {
  user,
  subscriptions,
  subscriptionLogs,
  orders,
} from "@/db/schema";
import { eq, ilike, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { isAllowedAdmin, requireSubscriptionAdmin } from "@/lib/better-auth/auth-utils";

/**
 * Searches for users by email, phone number, or user ID.
 * Only accessible to authorized subscription-admins.
 */
export async function searchUserAction(query: string) {
  try {
    const session = await requireSubscriptionAdmin();
    const isFullAdmin = isAllowedAdmin(session.user.phoneNumber);

    // SEND-level admins can only see their own user record
    if (!isFullAdmin) {
      const [self] = await db
        .select()
        .from(user)
        .where(eq(user.id, session.user.id))
        .limit(1);

      return { success: true, users: self ? [self] : [] };
    }

    if (!query || query.length < 2) return { success: true, users: [] };

    const results = await db
      .select()
      .from(user)
      .where(
        or(
          eq(user.id, query),
          ilike(user.email, `%${query}%`),
          ilike(user.phoneNumber, `%${query}%`),
        ),
      )
      .limit(10);

    return { success: true, users: results };
  } catch (error) {
    console.error("[searchUserAction] Error:", error);
    const message = error instanceof Error ? error.message : "Failed to search users";
    return { success: false, error: message };
  }
}

/**
 * Expires (does not delete) all subscription-related data for a specific user.
 * Keeps the user profile and audit history intact.
 */
export async function expireSubscriptionDataAction(userId: string) {
  try {
    const session = await requireSubscriptionAdmin();
    const isFullAdmin = isAllowedAdmin(session.user.phoneNumber);
    const targetUserId = isFullAdmin ? userId : session.user.id;

    const now = new Date();

    const razorpaySubsToExpire = await db
      .select({
        id: subscriptions.id,
        appId: subscriptions.appId,
        razorpaySubscriptionId: subscriptions.razorpaySubscriptionId,
        status: subscriptions.status,
      })
      .from(subscriptions)
      .where(eq(subscriptions.userId, targetUserId));

    if (razorpaySubsToExpire.length > 0) {
      await db
        .update(subscriptions)
        .set({
          status: "expired",
          endAt: now,
          currentEnd: now,
          chargeAt: null,
          updatedAt: now,
        })
        .where(eq(subscriptions.userId, targetUserId));

      await db.insert(subscriptionLogs).values(
        razorpaySubsToExpire.map((s) => ({
          userId: targetUserId,
          appId: s.appId ?? "alertpay-default",
          subscriptionId: s.razorpaySubscriptionId ?? s.id,
          provider: "razorpay" as const,
          action: "manual_expire",
          status: "expired",
          metadata: {
            reason: "manual_expire_from_admin",
            previousStatus: s.status,
          },
        })),
      );
    }

    revalidatePath("/admin");
    return {
      success: true,
      expired: {
        razorpay: razorpaySubsToExpire.length,
        phonepe: 0,
      },
    };
  } catch (error) {
    console.error("[expireSubscriptionDataAction] Error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to expire subscription data";
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Fetches subscription and order-related billing data for a specific user.
 * Only accessible to authorized subscription-admins.
 */
export async function getUserBillingDataAction(userId: string) {
  try {
    const session = await requireSubscriptionAdmin();
    const isFullAdmin = isAllowedAdmin(session.user.phoneNumber);
    const targetUserId = isFullAdmin ? userId : session.user.id;

    const [razorpaySubs, razorpayOrders] = await Promise.all([
      db
        .select({
          id: subscriptions.id,
          appId: subscriptions.appId,
          status: subscriptions.status,
          startAt: subscriptions.startAt,
          endAt: subscriptions.endAt,
          currentEnd: subscriptions.currentEnd,
          chargeAt: subscriptions.chargeAt,
          createdAt: subscriptions.createdAt,
        })
        .from(subscriptions)
        .where(eq(subscriptions.userId, targetUserId)),
      db
        .select({
          id: orders.id,
          appId: orders.appId,
          status: orders.status,
          amount: orders.amount,
          currency: orders.currency,
          razorpayOrderId: orders.razorpayOrderId,
          createdAt: orders.createdAt,
        })
        .from(orders)
        .where(eq(orders.userId, targetUserId)),
    ]);

    return {
      success: true,
      data: {
        subscriptions: razorpaySubs,
        orders: razorpayOrders,
      },
    };
  } catch (error) {
    console.error("[getUserBillingDataAction] Error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to load billing data";
    return {
      success: false,
      error: message,
    };
  }
}
