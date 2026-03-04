import { NextRequest, NextResponse } from "next/server";
import { razorpay } from "@/lib/razorpay";
import Razorpay from "razorpay";
import { db } from "@/db";
import { subscriptions } from "@/db/schema";
import { nanoid } from "nanoid";
import { auth } from "@/lib/better-auth/auth";
import { validateAppId, AppValidationError } from "@/lib/utils/app-validator";

interface RazorpayCustomer {
  id: string;
  name?: string;
  email?: string;
  contact?: string | number;
  gstin?: string | null;
  notes?: Record<string, string | number | null>;
}

async function findCustomerByEmailOrContact(
  instance: Razorpay,
  email: string,
  contact: string
): Promise<RazorpayCustomer | null> {
  let skip: number = 0;
  const count = 100;
  const maxSkip = 1000; // Limit search to prevent infinite loops

  while (skip < maxSkip) {
    const customers = await instance.customers.all({
      count,
      skip,
    });

    if (!customers.items || customers.items.length === 0) {
      break;
    }

    // Match by email or contact (phone)
    const matchedCustomer = customers.items.find(
      (customer) => customer.email === email || customer.contact === contact
    );

    if (matchedCustomer) {
      return matchedCustomer;
    }

    skip += count;
  }

  return null;
}

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
          { status: error.statusCode || 401 }
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
        { status: 401 }
      );
    }

    const userId = session.user.id;
    console.log("[POST /api/razorpay/subscriptions/v1] Authenticated user:", userId, "appId:", appId);

    const {
      plan_id,
      quantity = 1,
      start_at,
      notes,
    } = await request.json();

    const email = notes?.email;
    const contact = notes?.contact;

    if (!email || !contact) {
      return NextResponse.json(
        { error: "email and contact are required in notes" },
        { status: 400 }
      );
    }

    if (!plan_id) {
      return NextResponse.json(
        { error: "plan_id is required" },
        { status: 400 }
      );
    }

    // Fetch plan details from Razorpay to get currency, amount, and billing cycles
    let planDetails;
    try {
      planDetails = await razorpay.plans.fetch(plan_id);
    } catch (error: any) {
      console.error("Error fetching plan:", error);
      return NextResponse.json(
        {
          error: "Invalid plan_id",
          details: error.error?.description || "Plan not found",
        },
        { status: 400 }
      );
    }

    // Determine total_count from plan details or use a sensible default
    // Razorpay plans don't have a built-in total_count, so we set a default of 100 billing cycles
    // This can be adjusted based on business logic (e.g., based on plan type or duration)
    const total_count = 100;

    // Find or create customer
    let customerId: string | null = null;
    try {
      const customer = await razorpay.customers.create({
        name: email,
        email: email,
        contact: contact,
        fail_existing: 0,
        notes: notes,
      });
      customerId = customer.id;
    } catch (error: unknown) {
      const errorMessage = (error as { error: { description: string } }).error
        .description;
      if (errorMessage.toLowerCase().includes("customer already exists")) {
        const customer = await findCustomerByEmailOrContact(
          razorpay,
          email,
          contact
        );
        customerId = customer?.id || null;
      } else {
        console.error("Customer creation error:", errorMessage);
        return NextResponse.json(
          {
            error: errorMessage,
          },
          { status: 500 }
        );
      }
    }

    if (!customerId) {
      return NextResponse.json(
        { error: "Failed to create or find customer" },
        { status: 500 }
      );
    }

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
      plan_id,
      customer_notify: true,
      quantity,
      total_count,
      start_at: subscriptionStartAt,
      addons: [
        {
          item: {
            name: "First Payment",
            amount: 500, // ₹5 in paise
            currency: "INR",
          },
        },
      ],
      notes,
    });

    // Save subscription to database
    const subscriptionId = nanoid(8);
    console.log("[POST /api/razorpay/subscriptions/v1] Saving subscription to database:", {
      subscriptionId,
      razorpaySubscriptionId: subscription.id,
      userId,
      appId,
    });
    await db.insert(subscriptions).values({
      id: subscriptionId,
      razorpaySubscriptionId: subscription.id,
      razorpayPlanId: plan_id,
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
      notes: notes,
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
        notes: notes,
        theme: {
          color: "#F37254"
        }
      },
      subscriptionId,
      customerId,
      message: "Subscription created successfully. First payment of ₹5 will be charged immediately.",
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
          statusCode: error.statusCode
        },
        { status: error.statusCode }
      );
    }

    // Handle other errors
    return NextResponse.json(
      {
        error: error.message || "Failed to create subscription",
        details: error.description || error.toString()
      },
      { status: 500 }
    );
  }
}
