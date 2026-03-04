"use server";

import { db } from "@/db";
import {
  user,
  subscriptions,
  phonepeSubscriptions,
  subscriptionLogs,
  subscriptionStatusEnum,
  phonepeSubscriptionStateEnum,
} from "@/db/schema";
import { and, eq, ilike, inArray, or } from "drizzle-orm";
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

    type SubscriptionStatus =
      (typeof subscriptionStatusEnum.enumValues)[number];
    type PhonepeSubscriptionState =
      (typeof phonepeSubscriptionStateEnum.enumValues)[number];

    const razorpayStatusesToExpire = [
      "created",
      "authenticated",
      "active",
      "pending",
      "halted",
    ] as const satisfies readonly SubscriptionStatus[];

    const phonepeStatesToExpire = [
      "CREATED",
      "AUTHENTICATED",
      "ACTIVE",
      "PAUSED",
    ] as const satisfies readonly PhonepeSubscriptionState[];

    const razorpaySubsToExpire = await db
      .select({
        id: subscriptions.id,
        appId: subscriptions.appId,
        razorpaySubscriptionId: subscriptions.razorpaySubscriptionId,
        status: subscriptions.status,
      })
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.userId, targetUserId),
          inArray(subscriptions.status, razorpayStatusesToExpire),
        ),
      );

    const phonepeSubsToExpire = await db
      .select({
        id: phonepeSubscriptions.id,
        appId: phonepeSubscriptions.appId,
        merchantSubscriptionId: phonepeSubscriptions.merchantSubscriptionId,
        state: phonepeSubscriptions.state,
      })
      .from(phonepeSubscriptions)
      .where(
        and(
          eq(phonepeSubscriptions.userId, targetUserId),
          inArray(phonepeSubscriptions.state, phonepeStatesToExpire),
        ),
      );

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
        .where(
          and(
            eq(subscriptions.userId, targetUserId),
            inArray(subscriptions.status, razorpayStatusesToExpire),
          ),
        );

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

    if (phonepeSubsToExpire.length > 0) {
      await db
        .update(phonepeSubscriptions)
        .set({
          state: "CANCELLED",
          endDate: now,
          nextChargeDate: null,
          updatedAt: now,
        })
        .where(
          and(
            eq(phonepeSubscriptions.userId, targetUserId),
            inArray(phonepeSubscriptions.state, phonepeStatesToExpire),
          ),
        );

      await db.insert(subscriptionLogs).values(
        phonepeSubsToExpire.map((s) => ({
          userId: targetUserId,
          appId: s.appId ?? "alertpay-default",
          subscriptionId: s.merchantSubscriptionId,
          provider: "phonepe" as const,
          action: "manual_expire",
          status: "CANCELLED",
          metadata: {
            reason: "manual_expire_from_admin",
            previousState: s.state,
          },
        })),
      );
    }

    revalidatePath("/admin");
    return {
      success: true,
      expired: {
        razorpay: razorpaySubsToExpire.length,
        phonepe: phonepeSubsToExpire.length,
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
