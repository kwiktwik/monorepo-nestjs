import { NextRequest, NextResponse } from "next/server";
import { razorpay } from "@/lib/razorpay";
import Razorpay from "razorpay";
import { generateOrderId } from "@/lib/utils";
import { auth } from "@/lib/better-auth/auth";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { ORDER_STATUS } from "@/lib/constants/order-status";
import { validateAppId, AppValidationError } from "@/lib/utils/app-validator";

// Recurring payment defaults (when token is not provided)
const RECURRING_DEFAULTS = {
  FREQUENCY: "monthly" as const,
  DEFAULT_EXPIRY_DAYS: 30, // Token expires 30 days from creation
  MAX_AMOUNT_MULTIPLIER: {
    daily: 365,
    weekly: 52,
    monthly: 12,
    yearly: 1,
    as_presented: 12, // Default to monthly multiplier
  },
} as const;

// Valid frequency values for Razorpay recurring payments
const VALID_FREQUENCIES = ["daily", "weekly", "monthly", "yearly", "as_presented"] as const;
type Frequency = typeof VALID_FREQUENCIES[number];

interface RazorpayCustomer {
  id: string;
  name?: string;
  email?: string;
  contact?: string | number;
  gstin?: string | null;
  notes?: Record<string, string | number | null>;
}

interface TokenParams {
  frequency?: string;
  max_amount?: number;
  expire_at?: number;
  recurring_value?: number;
  recurring_type?: string;
}

/**
 * Calculate default max_amount based on frequency and base amount
 */
function calculateDefaultMaxAmount(amount: number, frequency: Frequency): number {
  const multiplier = RECURRING_DEFAULTS.MAX_AMOUNT_MULTIPLIER[frequency];
  return amount * multiplier;
}

/**
 * Validate and normalize token parameters
 */
function validateTokenParams(
  token: TokenParams | undefined,
  amount: number
): {
  frequency: Frequency;
  max_amount: number;
  expire_at: number;
  recurring_value?: number;
  recurring_type?: string;
} {
  const nowSeconds = Math.floor(Date.now() / 1000);
  const defaultExpireAt = nowSeconds + 60 * 60 * 24 * RECURRING_DEFAULTS.DEFAULT_EXPIRY_DAYS;
  
  // Validate frequency
  const frequency = (token?.frequency || RECURRING_DEFAULTS.FREQUENCY).toLowerCase() as Frequency;
  if (!VALID_FREQUENCIES.includes(frequency)) {
    throw new Error(
      `Invalid frequency: ${token?.frequency}. Must be one of: ${VALID_FREQUENCIES.join(", ")}`
    );
  }

  // Calculate max_amount
  const max_amount = token?.max_amount ?? calculateDefaultMaxAmount(amount, frequency);
  if (max_amount < amount) {
    throw new Error(`max_amount (${max_amount}) must be greater than or equal to amount (${amount})`);
  }

  // Validate and normalize expire_at
  let expireAt = token?.expire_at ?? defaultExpireAt;
  
  // If expireAt is in milliseconds, convert to seconds
  if (expireAt > 4765046400 * 1000) {
    expireAt = Math.floor(expireAt / 1000);
  }

  // Clamp expireAt to allowed range (Razorpay requirement: between 946684800 and 4765046400)
  const minEndTime = 946684800;
  const maxEndTime = 4765046400;
  if (expireAt < minEndTime) expireAt = minEndTime;
  if (expireAt > maxEndTime) expireAt = maxEndTime;

  return {
    frequency,
    max_amount,
    expire_at: expireAt,
    ...(token?.recurring_value && { recurring_value: token.recurring_value }),
    ...(token?.recurring_type && { recurring_type: token.recurring_type }),
  };
}

async function findCustomerByEmailOrContact(
  instance: Razorpay,
  email: string,
  contact: string
): Promise<RazorpayCustomer | null> {
  console.log("[findCustomerByEmailOrContact] Searching for customer:", { email, contact });
  let skip: number = 0;
  const count = 100;
  const maxSkip = 1000;

  while (skip < maxSkip) {
    const customers = await instance.customers.all({ count, skip });
    if (!customers.items || customers.items.length === 0) {
      console.log("[findCustomerByEmailOrContact] No more customers found, stopping search");
      break;
    }

    const matchedCustomer = customers.items.find(
      (customer) => customer.email === email || customer.contact === contact
    );
    if (matchedCustomer) {
      console.log("[findCustomerByEmailOrContact] Customer found:", matchedCustomer.id);
      return matchedCustomer;
    }
    skip += count;
  }
  console.log("[findCustomerByEmailOrContact] Customer not found");
  return null;
}

export async function POST(request: NextRequest) {
  try {
    console.log("[POST /api/razorpay/orders] Request received");
    
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
    
    // Get the authenticated user's session
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || !session.user) {
      console.warn("[POST /api/razorpay/orders] Unauthorized - no valid session");
      return NextResponse.json(
        { error: "Unauthorized - no valid session" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    console.log("[POST /api/razorpay/orders] Authenticated user:", userId, "appId:", appId);

    const {
      amount,
      currency = "INR",
      notes,
      payment_method = "upi",
      upi = {
        vpa: undefined,
        flow: "collect",
      },
      // Recurring payment fields
      isRecurring = false,
      token,
    } = await request.json();

    console.log("[POST /api/razorpay/orders] Request params:", {
      amount,
      currency,
      payment_method,
      isRecurring,
      hasToken: !!token,
      userId,
    });

    // Generate receipt ID
    const receipt = `receipt_${generateOrderId()}`;

    if (!amount) {
      console.warn("[POST /api/razorpay/orders] Missing amount in request");
      return NextResponse.json(
        { error: "Amount is required" },
        { status: 400 }
      );
    }

    // Validate token parameters (will use defaults if not provided)
    let validatedToken;
    try {
      validatedToken = validateTokenParams(token, amount);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Invalid token parameters";
      console.warn("[POST /api/razorpay/orders] Token validation error:", errorMessage);
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }
    
    // Handle one-time payment
    if (!isRecurring) {
      console.log("[POST /api/razorpay/orders] Creating one-time payment order");
      const order = await razorpay.orders.create({
        amount,
        currency,
        receipt,
        notes,
        method: payment_method,
      });
      console.log("[POST /api/razorpay/orders] Razorpay order created:", order.id);

      // Save order to database with userId
      const orderId = generateOrderId();
      const notesString = notes
        ? typeof notes === "string"
          ? notes
          : JSON.stringify(notes)
        : null;
      const orderAmount = typeof order.amount === "number" 
        ? order.amount 
        : parseInt(String(order.amount), 10);
      
      console.log("[POST /api/razorpay/orders] Saving order to database:", {
        orderId,
        razorpayOrderId: order.id,
        userId,
        appId,
        amount: orderAmount,
      });
      
      await db.insert(orders).values({
        id: orderId,
        razorpayOrderId: order.id,
        userId: userId,
        appId: appId,
        customerId: userId, // Keep customerId for backward compatibility
        amount: orderAmount,
        currency: order.currency || currency,
        status: ORDER_STATUS.CREATED,
        notes: notesString,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      console.log("[POST /api/razorpay/orders] Order saved successfully:", orderId);
      return NextResponse.json({
        order,
        razorpayOrder: {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: order?.amount ?? 0 * 100,
          currency: order?.currency ?? "INR",
          email: notes?.email ?? undefined,
          contact: notes?.contact ?? undefined,
          customer_id: undefined,
          order_id: order.id,
          method: payment_method,
          upi: {
            vpa: upi?.vpa ?? undefined,
            flow: upi?.flow ?? "collect",
          },
        },
      });
    }

    // Handle recurring payment
    console.log("[POST /api/razorpay/orders] Creating recurring payment order");
    const email = notes?.email;
    const contact = notes?.contact;
    if (!email || !contact) {
      console.warn("[POST /api/razorpay/orders] Missing email or contact for recurring payment");
      return NextResponse.json(
        { error: "email and contact are required for recurring payments" },
        { status: 400 }
      );
    }

    let customerId: string | null = null;
    try {
      console.log("[POST /api/razorpay/orders] Creating Razorpay customer:", { email, contact });
      const customer = await razorpay.customers.create({
        name: email,
        email: email,
        contact: contact,
        fail_existing: 0,
        notes: notes,
      });
      customerId = customer.id;
      console.log("[POST /api/razorpay/orders] Razorpay customer created:", customerId);
    } catch (error: unknown) {
      const errorMessage = (error as { error: { description: string } }).error
        .description;
      if (errorMessage.toLowerCase().includes("customer already exists")) {
        console.log("[POST /api/razorpay/orders] Customer already exists, finding existing customer");
        const customer = await findCustomerByEmailOrContact(
          razorpay,
          email,
          contact
        );
        customerId = customer?.id || null;
        console.log("[POST /api/razorpay/orders] Found existing customer:", customerId);
      } else {
        console.error("[POST /api/razorpay/orders] Customer creation error:", errorMessage);
        return NextResponse.json({ error: errorMessage }, { status: 500 });
      }
    }

    console.log("[POST /api/razorpay/orders] Creating recurring order with token params:", {
      frequency: validatedToken.frequency,
      max_amount: validatedToken.max_amount,
      expire_at: validatedToken.expire_at,
      expire_at_date: new Date(validatedToken.expire_at * 1000).toISOString(),
    });

    const order = await razorpay.orders.create({
      amount,
      currency,
      customer_id: customerId ?? undefined,
      method: payment_method,
      token: {
        max_amount: validatedToken.max_amount,
        expire_at: validatedToken.expire_at,
        frequency: validatedToken.frequency,
        ...(validatedToken.recurring_value && {
          recurring_value: validatedToken.recurring_value,
        }),
        ...(validatedToken.recurring_type && { recurring_type: validatedToken.recurring_type }),
      },
      receipt,
      notes,
    });

    // Save order to database with userId
    const orderId = generateOrderId();
    const notesString = notes
      ? typeof notes === "string"
        ? notes
        : JSON.stringify(notes)
      : null;
    const orderAmount = typeof order.amount === "number" 
      ? order.amount 
      : parseInt(String(order.amount), 10);
    
    console.log("[POST /api/razorpay/orders] Saving recurring order to database:", {
      orderId,
      razorpayOrderId: order.id,
      userId,
      appId,
      customerId,
      razorpayCustomerId: customerId,
      amount: orderAmount,
    });
    
    await db.insert(orders).values({
      id: orderId,
      razorpayOrderId: order.id,
      userId: userId,
      appId: appId,
      customerId: userId, // Keep customerId for backward compatibility
      razorpayCustomerId: customerId || null,
      amount: orderAmount,
      currency: order.currency || currency,
      maxAmount: validatedToken.max_amount,
      frequency: validatedToken.frequency,
      status: ORDER_STATUS.CREATED,
      tokenId: null, // Will be updated via webhook when token is confirmed
      notes: notesString,
      expireAt: new Date(validatedToken.expire_at * 1000),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log("[POST /api/razorpay/orders] Recurring order saved successfully:", orderId);
    return NextResponse.json({
      order,
      razorpayOrder: {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        email: notes?.email ?? undefined,
        contact: notes?.contact ?? undefined,
        notes: notes ?? undefined,
        recurring: 1,
        customer_id: customerId ?? undefined,
        order_id: order.id,
        method: payment_method,
        upi: {
          vpa: upi?.vpa ?? undefined,
          flow: upi?.flow ?? "collect",
        },
      },
    });
  } catch (error: unknown) {
    console.error("[POST /api/razorpay/orders] Error creating order:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to create order";
    console.error("[POST /api/razorpay/orders] Error details:", {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
