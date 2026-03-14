"use server";

import { razorpay } from "@/lib/razorpay";
import { db } from "@/db";
import { orders, user } from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";
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
  retryCount?: number;
}

// Simple user type for lookups
type UserLookup = {
  id: string;
  email: string | null;
  phoneNumber: string | null;
};

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Check if error is a rate limit error (429)
 */
function isRateLimitError(error: any): boolean {
  return error?.statusCode === 429 || 
         error?.error?.code === 'BAD_REQUEST_ERROR' ||
         error?.message?.includes('Too many requests');
}

/**
 * Retry wrapper with exponential backoff for Razorpay API calls
 */
async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      
      // Only retry on rate limit errors
      if (!isRateLimitError(error)) {
        throw error;
      }
      
      // Don't retry on last attempt
      if (attempt === maxRetries) {
        break;
      }
      
      // Exponential backoff with jitter
      const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), 10000);
      const jitter = Math.random() * 500;
      const totalDelay = delay + jitter;
      
      console.log(`Rate limit hit, retrying attempt ${attempt}/${maxRetries} after ${Math.round(totalDelay)}ms...`);
      await sleep(totalDelay);
    }
  }
  
  throw lastError;
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
 * Validate date range (max 31 days / 1 month)
 */
function validateDateRange(fromDate: Date, toDate: Date): void {
  const diffMs = toDate.getTime() - fromDate.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  if (diffDays > 31) {
    throw new Error("Date range must be 31 days or less");
  }

  if (fromDate > toDate) {
    throw new Error("From date must be before to date");
  }
}

/**
 * Convert local date to UTC timestamp for Razorpay API
 * Ensures consistent behavior across timezones
 */
function dateToUTCTimestamp(date: Date): number {
  // Treat the date as UTC midnight to avoid timezone issues
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  
  // Create UTC date at midnight
  const utcDate = new Date(Date.UTC(year, month, day));
  return Math.floor(utcDate.getTime() / 1000);
}

/**
 * Fetch all orders from Razorpay for a date range (auto-pagination)
 * Uses UTC timestamps to ensure consistent results across timezones
 */
export async function fetchOrdersByDateRange(
  fromDate: Date,
  toDate: Date,
  appId: string
): Promise<RazorpayOrder[]> {
  await requireAdmin();
  validateDateRange(fromDate, toDate);

  // Convert to UTC timestamps for Razorpay API
  const fromTimestamp = dateToUTCTimestamp(fromDate);
  const toTimestamp = dateToUTCTimestamp(toDate) + 86399; // End of day (23:59:59)

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

    const orders = (response.items || []) as RazorpayOrder[];
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

  // Query DB for existing orders in bulk
  const existingOrders = await db.query.orders.findMany({
    where: inArray(orders.razorpayOrderId, razorpayOrderIds),
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
 * Fetch all necessary data upfront to minimize DB queries
 */
async function preloadSyncData(
  orderIds: string[],
  appId: string
): Promise<{
  existingOrderIds: Set<string>;
  usersByEmail: Map<string, UserLookup>;
  usersByPhone: Map<string, UserLookup>;
}> {
  // Fetch all existing orders in one query
  const existingOrders = await db.query.orders.findMany({
    where: inArray(orders.razorpayOrderId, orderIds),
    columns: {
      razorpayOrderId: true,
    },
  });
  const existingOrderIds = new Set(
    existingOrders
      .map((o) => o.razorpayOrderId)
      .filter((id): id is string => id !== null)
  );

  // Fetch all users in one query (we'll filter in memory)
  // This is more efficient than querying per order
  const allUsers = await db.query.user.findMany({
    columns: {
      id: true,
      email: true,
      phoneNumber: true,
    },
  });

  // Create lookup maps
  const usersByEmail = new Map<string, UserLookup>();
  const usersByPhone = new Map<string, UserLookup>();

  for (const u of allUsers) {
    if (u.email) {
      usersByEmail.set(u.email.toLowerCase(), u);
    }
    if (u.phoneNumber) {
      usersByPhone.set(u.phoneNumber, u);
      // Also store without + for matching
      usersByPhone.set(u.phoneNumber.replace(/\+/g, ""), u);
    }
  }

  return { existingOrderIds, usersByEmail, usersByPhone };
}

/**
 * Process a single order sync using preloaded data with retry logic
 */
async function syncSingleOrderWithData(
  rzpOrderId: string,
  appId: string,
  existingOrderIds: Set<string>,
  usersByEmail: Map<string, UserLookup>,
  usersByPhone: Map<string, UserLookup>
): Promise<SyncResult> {
  try {
    // Check if order already exists (fast in-memory check)
    if (existingOrderIds.has(rzpOrderId)) {
      return {
        razorpayOrderId: rzpOrderId,
        status: "skipped",
        message: "Order already exists in database",
      };
    }

    // Fetch order details from Razorpay with retry
    const rzpOrder = await withRetry(() => razorpay.orders.fetch(rzpOrderId));

    // Fetch payments for this order with retry
    const payments = await withRetry(() => razorpay.orders.fetchPayments(rzpOrderId));
    const firstPayment = payments.items?.[0];

    // Try to get user info from multiple sources
    let email: string | null = null;
    let contact: string | null = null;
    let customerId: string | null = null;
    let paymentId: string | null = null;
    let paymentStatus: string | null = null;

    if (firstPayment) {
      email = firstPayment.email ? String(firstPayment.email) : null;
      contact = firstPayment.contact ? String(firstPayment.contact) : null;
      customerId = firstPayment.customer_id || null;
      paymentId = firstPayment.id;
      paymentStatus = firstPayment.status;
    }

    // Fallback: Try to get from order notes
    if ((!email && !contact) && rzpOrder.notes) {
      const notes = rzpOrder.notes as Record<string, any>;
      email = notes.email ? String(notes.email) : notes.customer_email ? String(notes.customer_email) : null;
      contact = notes.phone ? String(notes.phone) : notes.contact ? String(notes.contact) : notes.customer_phone ? String(notes.customer_phone) : null;
    }

    if (!customerId && (rzpOrder as any).customer_id) {
      customerId = (rzpOrder as any).customer_id;
    }

    // If still no user identifiers, skip this order
    if (!email && !contact) {
      return {
        razorpayOrderId: rzpOrderId,
        status: "skipped",
        message: `No user info found (unpaid order - status: ${rzpOrder.status})`,
      };
    }

    // Find user using preloaded maps (fast in-memory lookup)
    let dbUser = null;

    // Strategy 1: Match by exact email
    if (email) {
      dbUser = usersByEmail.get(email.toLowerCase()) || null;
    }

    // Strategy 2: Match by exact contact/phone
    if (!dbUser && contact) {
      dbUser = usersByPhone.get(contact) || null;
    }

    // Strategy 3: Match by normalized phone
    if (!dbUser) {
      const normalizedPhone = normalizePhoneNumber(email) || normalizePhoneNumber(contact);
      if (normalizedPhone) {
        dbUser = usersByPhone.get(normalizedPhone) || 
                 usersByPhone.get(normalizedPhone.replace(/\+/g, "")) || 
                 null;
      }
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

    // Add to existing set to prevent duplicates in same batch
    existingOrderIds.add(rzpOrderId);

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
    
    // Check if it's a rate limit error after all retries
    if (isRateLimitError(error)) {
      return {
        razorpayOrderId: rzpOrderId,
        status: "error",
        message: "Rate limit exceeded - too many requests. Please wait a moment and try again.",
      };
    }
    
    return {
      razorpayOrderId: rzpOrderId,
      status: "error",
      message: error.message || "Unknown error occurred",
    };
  }
}

/**
 * Sync selected orders from Razorpay to local DB
 * Optimized with bulk data loading, smaller batches with delays, and retry logic
 */
export async function syncSelectedOrders(
  orderIds: string[],
  appId: string
): Promise<SyncResult[]> {
  await requireAdmin();

  // Preload all necessary data in 2 DB queries instead of N queries
  const { existingOrderIds, usersByEmail, usersByPhone } = await preloadSyncData(orderIds, appId);

  // Process orders in smaller batches (20 at a time) with delays to avoid rate limits
  const BATCH_SIZE = 20;
  const DELAY_BETWEEN_BATCHES = 2000; // 2 seconds between batches
  const results: SyncResult[] = [];

  for (let i = 0; i < orderIds.length; i += BATCH_SIZE) {
    const batch = orderIds.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(orderIds.length / BATCH_SIZE);
    
    console.log(`Processing batch ${batchNum}/${totalBatches} (${batch.length} orders)...`);
    
    // Process batch
    const batchResults = await Promise.all(
      batch.map((orderId) => 
        syncSingleOrderWithData(orderId, appId, existingOrderIds, usersByEmail, usersByPhone)
      )
    );
    results.push(...batchResults);

    // Add delay between batches to avoid rate limiting (except for last batch)
    if (i + BATCH_SIZE < orderIds.length) {
      console.log(`Waiting ${DELAY_BETWEEN_BATCHES}ms before next batch...`);
      await sleep(DELAY_BETWEEN_BATCHES);
    }
  }

  return results;
}
