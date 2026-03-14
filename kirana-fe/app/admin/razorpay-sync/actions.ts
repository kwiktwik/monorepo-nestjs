"use server";

import { razorpay } from "@/lib/razorpay";
import { db } from "@/db";
import { orders, user } from "@/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import { requireAdmin } from "@/lib/better-auth/auth-utils";
import { ORDER_STATUS } from "@/lib/constants/order-status";
import { generateOrderId } from "@/lib/utils";

// Types
export interface RazorpayOrder {
  id: string;
  amount: number;
  amount_due?: number;
  amount_paid?: number;
  currency: string;
  receipt?: string;
  status: string;
  attempts?: number;
  notes?: Record<string, any>;
  created_at: number;
}

export interface MissingOrder {
  razorpayOrderId: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: Date;
  receipt?: string;
  notes?: string;
}

export interface CompareResult {
  totalCount: number;
  existingCount: number;
  missingCount: number;
  missingOrders: MissingOrder[];
}

export interface SyncProgress {
  total: number;
  current: number;
  status: "idle" | "fetching" | "comparing" | "syncing" | "completed" | "error";
  message: string;
}

export interface SyncResult {
  razorpayOrderId: string;
  status: "success" | "skipped" | "error";
  message: string;
}

/**
 * Normalize phone number from email/contact to E.164 format
 */
function normalizePhoneNumber(value: string | null | undefined): string | null {
  if (!value) return null;
  const digits = value.replace(/\D/g, "");
  
  if (digits.length === 12 && digits.startsWith("91")) {
    return `+${digits}`;
  }
  
  if (digits.length === 10) {
    return `+91${digits}`;
  }
  
  return null;
}

/**
 * Validate date range (max 1 day)
 */
function validateDateRange(fromDate: Date, toDate: Date): void {
  const diffMs = toDate.getTime() - fromDate.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  
  if (diffHours > 24) {
    throw new Error("Date range must be 1 day or less");
  }
  
  if (fromDate > toDate) {
    throw new Error("From date must be before to date");
  }
}

/**
 * Fetch all orders from Razorpay for a date range (auto-pagination)
 */
export async function fetchOrdersByDateRange(
  fromDate: Date,
  toDate: Date,
  appId: string
): Promise<RazorpayOrder[]> {
  await requireAdmin();
  validateDateRange(fromDate, toDate);

  const fromTimestamp = Math.floor(fromDate.getTime() / 1000);
  const toTimestamp = Math.floor(toDate.getTime() / 1000);

  const allOrders: RazorpayOrder[] = [];
  let skip = 0;
  const count = 100; // Max per page

  while (true) {
    const response = await razorpay.orders.all({
      count,
      skip,
      from: fromTimestamp,
      to: toTimestamp,
    });

    const orders = response.items || [];
    allOrders.push(...orders);

    if (orders.length < count) {
      break; // No more pages
    }

    skip += count;
  }

  return allOrders;
}

/**
 * Compare Razorpay orders with local DB to find missing orders
 */
export async function compareOrders(
  razorpayOrders: RazorpayOrder[],
  appId: string
): Promise<CompareResult> {
  await requireAdmin();

  if (razorpayOrders.length === 0) {
    return {
      totalCount: 0,
      existingCount: 0,
      missingCount: 0,
      missingOrders: [],
    };
  }

  // Get all razorpay order IDs
  const razorpayOrderIds = razorpayOrders.map((o) => o.id);

  // Query DB for existing orders
  const existingOrders = await db.query.orders.findMany({
    where: and(
      eq(orders.appId, appId),
      // Use IN clause for better performance
    ),
    columns: {
      razorpayOrderId: true,
    },
  });

  // Create set of existing order IDs
  const existingOrderIds = new Set(
    existingOrders
      .map((o) => o.razorpayOrderId)
      .filter((id): id is string => id !== null)
  );

  // Find missing orders
  const missingOrders = razorpayOrders
    .filter((order) => !existingOrderIds.has(order.id))
    .map((order) => ({
      razorpayOrderId: order.id,
      amount: order.amount,
      currency: order.currency,
      status: order.status,
      createdAt: new Date(order.created_at * 1000),
      receipt: order.receipt,
      notes: order.notes ? JSON.stringify(order.notes) : undefined,
    }));

  return {
    totalCount: razorpayOrders.length,
    existingCount: existingOrders.length,
    missingCount: missingOrders.length,
    missingOrders,
  };
}

/**
 * Process a single order sync
 */
async function syncSingleOrder(
  rzpOrderId: string,
  appId: string
): Promise<SyncResult> {
  try {
    // Check if order already exists in DB (prevent duplicates)
    const existingOrder = await db.query.orders.findFirst({
      where: eq(orders.razorpayOrderId, rzpOrderId),
    });

    if (existingOrder) {
      return {
        razorpayOrderId: rzpOrderId,
        status: "skipped",
        message: "Order already exists in database",
      };
    }

    // Fetch order details from Razorpay
    const rzpOrder = await razorpay.orders.fetch(rzpOrderId);

    // Fetch payments for this order to get user details
    const payments = await razorpay.orders.fetchPayments(rzpOrderId);
    const firstPayment = payments.items?.[0];

    // Try to get user info from multiple sources
    let email: string | null = null;
    let contact: string | null = null;
    let customerId: string | null = null;
    let paymentId: string | null = null;
    let paymentStatus: string | null = null;

    if (firstPayment) {
      // Primary source: payment data
      email = firstPayment.email || null;
      contact = firstPayment.contact || null;
      customerId = firstPayment.customer_id || null;
      paymentId = firstPayment.id;
      paymentStatus = firstPayment.status;
    }

    // Fallback 1: Try to get from order notes
    if ((!email && !contact) && rzpOrder.notes) {
      const notes = rzpOrder.notes as Record<string, any>;
      email = notes.email || notes.customer_email || null;
      contact = notes.phone || notes.contact || notes.customer_phone || null;
    }

    // Fallback 2: Try to get from customer_id in order
    if (!customerId && rzpOrder.customer_id) {
      customerId = rzpOrder.customer_id;
      // If we have customer_id but no email/contact, we could fetch customer details
      // But that would require another API call - skipping for now
    }

    // If still no user identifiers, skip this order
    if (!email && !contact) {
      return {
        razorpayOrderId: rzpOrderId,
        status: "skipped",
        message: `No user info found (unpaid order - status: ${rzpOrder.status})`,
      };
    }

    // Normalize phone numbers for matching
    const normalizedEmailPhone = normalizePhoneNumber(email);
    const normalizedContactPhone = normalizePhoneNumber(contact);

    // Find user in our DB - try multiple strategies
    let dbUser = null;

    // Strategy 1: Match by exact email
    if (email) {
      dbUser = await db.query.user.findFirst({
        where: eq(user.email, String(email)),
      });
    }

    // Strategy 2: Match by exact contact/phone
    if (!dbUser && contact) {
      dbUser = await db.query.user.findFirst({
        where: eq(user.phoneNumber, String(contact)),
      });
    }

    // Strategy 3: Match by normalized phone
    if (!dbUser && (normalizedEmailPhone || normalizedContactPhone)) {
      const phoneToMatch = normalizedEmailPhone || normalizedContactPhone;
      dbUser = await db.query.user.findFirst({
        where: eq(user.phoneNumber, phoneToMatch!),
      });
    }

    // If user not found, skip this order
    if (!dbUser) {
      return {
        razorpayOrderId: rzpOrderId,
        status: "skipped",
        message: `User not found for ${email || contact} - skipping order`,
      };
    }

    // Insert order into our DB
    const internalOrderId = generateOrderId();

    // Determine status based on payment status or order status
    let finalStatus: any = ORDER_STATUS.CREATED;

    if (paymentStatus === "authorized") finalStatus = ORDER_STATUS.AUTHORIZED;
    else if (paymentStatus === "captured") finalStatus = ORDER_STATUS.CAPTURED;
    else if (paymentStatus === "failed") finalStatus = ORDER_STATUS.FAILED;
    else if (rzpOrder.status === "paid") finalStatus = ORDER_STATUS.CAPTURED;
    else if (rzpOrder.status === "attempted") finalStatus = ORDER_STATUS.CREATED;

    await db.insert(orders).values({
      id: internalOrderId,
      razorpayOrderId: rzpOrderId,
      userId: dbUser.id,
      appId: appId,
      customerId: dbUser.id,
      razorpayCustomerId: customerId,
      amount: typeof rzpOrder.amount === "number" ? rzpOrder.amount : parseInt(String(rzpOrder.amount)),
      currency: rzpOrder.currency || "INR",
      status: finalStatus,
      razorpayPaymentId: paymentId,
      notes: rzpOrder.notes ? JSON.stringify(rzpOrder.notes) : null,
      createdAt: new Date(rzpOrder.created_at * 1000),
      updatedAt: new Date(),
    });

    const syncMessage = firstPayment 
      ? "Order successfully synced" 
      : "Order synced (no payment yet)";

    return {
      razorpayOrderId: rzpOrderId,
      status: "success",
      message: syncMessage,
    };

  } catch (error: any) {
    console.error(`Error syncing order ${rzpOrderId}:`, error);
    return {
      razorpayOrderId: rzpOrderId,
      status: "error",
      message: error.message || "Unknown error occurred",
    };
  }
}

/**
 * Sync selected orders from Razorpay to local DB
 * Processes orders in parallel batches for better performance
 * Skips orders where user is not found
 */
export async function syncSelectedOrders(
  orderIds: string[],
  appId: string
): Promise<SyncResult[]> {
  await requireAdmin();

  // Process orders in parallel batches of 10
  // This prevents overwhelming the API while still being fast
  const BATCH_SIZE = 10;
  const results: SyncResult[] = [];

  for (let i = 0; i < orderIds.length; i += BATCH_SIZE) {
    const batch = orderIds.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.all(
      batch.map((orderId) => syncSingleOrder(orderId, appId))
    );
    results.push(...batchResults);
  }

  return results;
}
