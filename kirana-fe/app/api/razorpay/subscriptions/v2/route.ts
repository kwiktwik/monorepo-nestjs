import { NextRequest, NextResponse } from "next/server";
import { razorpay } from "@/lib/razorpay";
import Razorpay from "razorpay";
import { db } from "@/db";
import { subscriptions, abandonedCheckouts } from "@/db/schema";
import { nanoid } from "nanoid";
import { auth } from "@/lib/better-auth/auth";
import { validateAppId, AppValidationError } from "@/lib/utils/app-validator";
import { and, eq, desc } from "drizzle-orm";

interface RazorpayCustomer {
  id: string;
  name?: string;
  email?: string;
  fail_existing?: string;
  contact?: string | number;
  gstin?: string | null;
  notes?: Record<string, string | number | null>;
}

// Discount plan ID for users who abandoned checkout 30+ minutes ago
const DISCOUNT_PLAN_ID = "plan_SL3uNUOHS4ouiR";
const DISCOUNT_ELIGIBILITY_MINUTES = 30;
const DISCOUNT_OFFER_HOURS = 24;

// Create subscription with Razorpay
// https://razorpay.com/docs/api/payments/subscriptions/create-subscription/
export async function POST(request: NextRequest) {
  try {
    // Validate app ID from headers
    let appId: string;
    try {
      appId = validateAppId(request);
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
      headers: request.headers,
    });

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized - no valid session" },
        { status: 401 },
      );
    }

    const userId = session.user.id;

    const {
      plan_id,
      quantity = 1,
      start_at,
      notes,
      flow = "intent", // UPI flow type: "intent" or "collect"
      vpa, // UPI ID (required for collect flow)
    } = await request.json();

    // Extract device/app metadata from request headers
    const deviceMeta: Record<string, string> = {};
    const headerMap: [string, string][] = [
      ["X-App-Version",        "app_version"],
      ["X-Build-Number",       "build_number"],
      ["X-Locale",             "locale"],
      ["X-Platform",           "platform"],
      ["X-Android-SDK-Version","android_sdk"],
      ["X-Android-Release",    "android_release"],
      ["X-Android-Incremental","android_incremental"],
    ];
    for (const [header, key] of headerMap) {
      const value = request.headers.get(header);
      if (value && value.length > 0) {
        deviceMeta[key] = value;
      }
    }

    // Razorpay notes is capped at 15 key-value pairs.
    // Merge existing notes first, then fill remaining slots with device metadata.
    const RAZORPAY_NOTES_LIMIT = 15;
    const mergedNotes: Record<string, string> = { ...(notes ?? {}) };
    const remainingSlots = RAZORPAY_NOTES_LIMIT - Object.keys(mergedNotes).length;
    const deviceMetaEntries = Object.entries(deviceMeta).slice(0, remainingSlots);
    for (const [k, v] of deviceMetaEntries) {
      mergedNotes[k] = v;
    }

    const email = notes?.email;
    const contact = notes?.contact;

    if (!email || !contact) {
      return NextResponse.json(
        { error: "email and contact are required in notes" },
        { status: 400 },
      );
    }

    if (!plan_id) {
      return NextResponse.json(
        { error: "plan_id is required" },
        { status: 400 },
      );
    }

    // Validate flow parameter
    if (flow !== "intent" && flow !== "collect") {
      return NextResponse.json(
        { error: "flow must be either 'intent' or 'collect'" },
        { status: 400 },
      );
    }

    // Validate vpa is provided for collect flow
    if (flow === "collect" && !vpa) {
      return NextResponse.json(
        { error: "vpa (UPI ID) is required for collect flow" },
        { status: 400 },
      );
    }

    // Check discount eligibility - has user abandoned checkout 3+ hours ago?
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

    // Use discount plan only if eligible and offer not expired
    const finalPlanId = (isEligibleForDiscount && !isOfferExpired) ? DISCOUNT_PLAN_ID : plan_id;

    // Track this checkout attempt ONLY if user is not already eligible for discount (not expired)
    // This prevents resetting the 30-min timer for users who already qualify for discount
    if (!(isEligibleForDiscount && !isOfferExpired)) {
      await db.insert(abandonedCheckouts).values({
        userId,
        appId,
        checkoutStartedAt: new Date(),
      });
    } else {

      // Set expiration time if not already set (first time becoming eligible)
      if (!lastAbandonedCheckout[0].offerExpiresAt) {
        const offerExpiresAt = calculatedExpiry || new Date(Date.now() + DISCOUNT_OFFER_HOURS * 60 * 60 * 1000);
        await db
          .update(abandonedCheckouts)
          .set({ offerExpiresAt })
          .where(eq(abandonedCheckouts.id, lastAbandonedCheckout[0].id));
      }
    }

    // Fetch plan details from Razorpay to get currency, amount, and billing cycles
    let planDetails;
    try {
      planDetails = await razorpay.plans.fetch(finalPlanId);
    } catch (error: any) {
      console.error("Error fetching plan:", error);
      return NextResponse.json(
        {
          error: "Invalid plan_id",
          details: error.error?.description || "Plan not found",
        },
        { status: 400 },
      );
    }

    // Determine total_count from plan details or use a sensible default
    // Razorpay plans don't have a built-in total_count, so we set a default of 100 billing cycles
    // This can be adjusted based on business logic (e.g., based on plan type or duration)
    const total_count = 100;

    // Find or create customer
    // fail_existing: 0 fetches existing customer if one already exists

    const customer = await razorpay.customers.create({
      name: email,
      email: email,
      contact: contact,
      // @ts-expect-error - Razorpay SDK types don't include fail_existing parameter
      fail_existing: "0", // Returns existing customer instead of throwing error
      notes: notes,
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Failed to create customer" },
        { status: 500 },
      );
    }
    // @ts-expect-error - Razorpay SDK types don't include fail_existing parameter
    const customerId = customer?.id;

    // Calculate start_at: default to 24 hours from now
    const nowSeconds = Math.floor(Date.now() / 1000);
    const defaultStartAt = nowSeconds + 60 * 60 * 24; // 24 hours from now
    let subscriptionStartAt = start_at ?? defaultStartAt;

    // If start_at is in milliseconds, convert to seconds
    if (subscriptionStartAt > 4765046400 * 1000) {
      subscriptionStartAt = Math.floor(subscriptionStartAt / 1000);
    }

    // Create subscription with Razorpay
    // First payment addon of ₹5 (500 paise)
    const subscription = await razorpay.subscriptions.create({
      plan_id: finalPlanId,
      customer_notify: true,
      quantity,
      total_count,
      start_at: subscriptionStartAt,
      notes: mergedNotes,
    });

    // Save subscription to database
    const subscriptionId = nanoid(8);
    await db.insert(subscriptions).values({
      id: subscriptionId,
      razorpaySubscriptionId: subscription.id,
      razorpayPlanId: finalPlanId,
      userId: userId,
      appId: appId,
      customerId: email,
      razorpayCustomerId: customerId,
      status: "created",
      quantity,
      totalCount: total_count,
      paidCount: 0,
      remainingCount: total_count,
      startAt: new Date(subscriptionStartAt * 1000),
      endAt: subscription.end_at ? new Date(subscription.end_at * 1000) : null,
      chargeAt: subscription.charge_at
        ? new Date(subscription.charge_at * 1000)
        : null,
      currentStart: subscription.current_start
        ? new Date(subscription.current_start * 1000)
        : null,
      currentEnd: subscription.current_end
        ? new Date(subscription.current_end * 1000)
        : null,
      notes: mergedNotes,
      metadata: { ...subscription, deviceMeta },
    });

    return NextResponse.json({
      subscription,
      razorpaySubscription: {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        subscription_id: subscription.id,
        name: "AlertPay Premium",
        description: notes?.description || "Monthly subscription",
        image: notes?.image || undefined,
        callback_url: notes?.callback_url || undefined,
        amount: 500,
        max_amount: planDetails.item.amount,
        currency: planDetails.item.currency,
        prefill: {
          name: notes?.name || undefined,
          email: email,
          contact: contact,
        },
        notes: mergedNotes,
        theme: {
          color: "#F37254",
        },
        flow: flow, // UPI flow from request: "intent" or "collect"
        ...(flow === "collect" && vpa ? { vpa } : {}), // Add vpa for collect flow
      },
      subscriptionId,
      customerId,
      isDiscountApplied: isEligibleForDiscount && !isOfferExpired,
      isOfferExpired,
      planId: finalPlanId,
      message: (isEligibleForDiscount && !isOfferExpired)
        ? "Discount applied! Subscription created with special pricing. First payment of ₹5 will be charged immediately."
        : isOfferExpired
          ? "Discount offer expired. Subscription created at regular price. First payment of ₹5 will be charged immediately."
          : "Subscription created successfully. First payment of ₹5 will be charged immediately.",
    });
  } catch (error: any) {
    console.error("Error creating subscription:", error);

    // Handle Razorpay API errors
    if (error.statusCode && error.error) {
      return NextResponse.json(
        {
          error: error.error.description || "Razorpay API error",
          code: error.error.code,
          field: error.error.field,
          statusCode: error.statusCode,
        },
        { status: error.statusCode },
      );
    }

    // Handle other errors
    return NextResponse.json(
      {
        error: error.message || "Failed to create subscription",
        details: error.description || error.toString(),
      },
      { status: 500 },
    );
  }
}
