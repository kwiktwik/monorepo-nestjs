import { NextRequest } from "next/server";
import { razorpay } from "@/lib/razorpay";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { inArray } from "drizzle-orm";
import { ORDER_STATUS } from "@/lib/constants/order-status";
import { generateOrderId } from "@/lib/utils";
import { requireAdmin } from "@/lib/better-auth/auth-utils";

// Types
interface SyncResult {
  razorpayOrderId: string;
  status: "success" | "skipped" | "error";
  message: string;
}

interface SyncProgressUpdate {
  current: number;
  total: number;
  batchNum: number;
  totalBatches: number;
  batchResults: SyncResult[];
  accumulatedResults: SyncResult[];
  isComplete: boolean;
  message: string;
}

type UserLookup = {
  id: string;
  email: string | null;
  phoneNumber: string | null;
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRateLimitError(error: any): boolean {
  return error?.statusCode === 429 || 
         error?.error?.code === 'BAD_REQUEST_ERROR' ||
         error?.message?.includes('Too many requests');
}

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
      
      if (!isRateLimitError(error)) {
        throw error;
      }
      
      if (attempt === maxRetries) {
        break;
      }
      
      const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), 10000);
      const jitter = Math.random() * 500;
      const totalDelay = delay + jitter;
      
      await sleep(totalDelay);
    }
  }
  
  throw lastError;
}

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

async function preloadSyncData(
  orderIds: string[],
  appId: string
): Promise<{
  existingOrderIds: Set<string>;
  usersByEmail: Map<string, UserLookup>;
  usersByPhone: Map<string, UserLookup>;
}> {
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

  const allUsers = await db.query.user.findMany({
    columns: {
      id: true,
      email: true,
      phoneNumber: true,
    },
  });

  const usersByEmail = new Map<string, UserLookup>();
  const usersByPhone = new Map<string, UserLookup>();

  for (const u of allUsers) {
    if (u.email) {
      usersByEmail.set(u.email.toLowerCase(), u);
    }
    if (u.phoneNumber) {
      usersByPhone.set(u.phoneNumber, u);
      usersByPhone.set(u.phoneNumber.replace(/\+/g, ""), u);
    }
  }

  return { existingOrderIds, usersByEmail, usersByPhone };
}

async function syncSingleOrderWithData(
  rzpOrderId: string,
  appId: string,
  existingOrderIds: Set<string>,
  usersByEmail: Map<string, UserLookup>,
  usersByPhone: Map<string, UserLookup>
): Promise<SyncResult> {
  try {
    if (existingOrderIds.has(rzpOrderId)) {
      return {
        razorpayOrderId: rzpOrderId,
        status: "skipped",
        message: "Order already exists in database",
      };
    }

    const rzpOrder = await withRetry(() => razorpay.orders.fetch(rzpOrderId));
    const payments = await withRetry(() => razorpay.orders.fetchPayments(rzpOrderId));
    const firstPayment = payments.items?.[0];

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

    if ((!email && !contact) && rzpOrder.notes) {
      const notes = rzpOrder.notes as Record<string, any>;
      email = notes.email ? String(notes.email) : notes.customer_email ? String(notes.customer_email) : null;
      contact = notes.phone ? String(notes.phone) : notes.contact ? String(notes.contact) : notes.customer_phone ? String(notes.customer_phone) : null;
    }

    if (!customerId && (rzpOrder as any).customer_id) {
      customerId = (rzpOrder as any).customer_id;
    }

    if (!email && !contact) {
      return {
        razorpayOrderId: rzpOrderId,
        status: "skipped",
        message: `No user info found (unpaid order - status: ${rzpOrder.status})`,
      };
    }

    let dbUser = null;

    if (email) {
      dbUser = usersByEmail.get(email.toLowerCase()) || null;
    }

    if (!dbUser && contact) {
      dbUser = usersByPhone.get(contact) || null;
    }

    if (!dbUser) {
      const normalizedPhone = normalizePhoneNumber(email) || normalizePhoneNumber(contact);
      if (normalizedPhone) {
        dbUser = usersByPhone.get(normalizedPhone) || 
                 usersByPhone.get(normalizedPhone.replace(/\+/g, "")) || 
                 null;
      }
    }

    if (!dbUser) {
      return {
        razorpayOrderId: rzpOrderId,
        status: "skipped",
        message: `User not found for ${email || contact} - skipping order`,
      };
    }

    const internalOrderId = generateOrderId();

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

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    await requireAdmin();

    const { orderIds, appId } = await request.json();
    
    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return new Response(
        JSON.stringify({ error: "No order IDs provided" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Preload all necessary data
    const { existingOrderIds, usersByEmail, usersByPhone } = await preloadSyncData(orderIds, appId);

    const BATCH_SIZE = 20;
    const DELAY_BETWEEN_BATCHES = 2000;
    const totalBatches = Math.ceil(orderIds.length / BATCH_SIZE);

    const encoder = new TextEncoder();
    
    const stream = new ReadableStream({
      async start(controller) {
        const accumulatedResults: SyncResult[] = [];

        try {
          for (let i = 0; i < orderIds.length; i += BATCH_SIZE) {
            const batch = orderIds.slice(i, i + BATCH_SIZE);
            const batchNum = Math.floor(i / BATCH_SIZE) + 1;
            const current = Math.min(i + batch.length, orderIds.length);
            
            console.log(`Processing batch ${batchNum}/${totalBatches} (${batch.length} orders)...`);
            
            // Process batch
            const batchResults = await Promise.all(
              batch.map((orderId) => 
                syncSingleOrderWithData(orderId, appId, existingOrderIds, usersByEmail, usersByPhone)
              )
            );
            
            accumulatedResults.push(...batchResults);

            // Send progress update
            const update: SyncProgressUpdate = {
              current,
              total: orderIds.length,
              batchNum,
              totalBatches,
              batchResults,
              accumulatedResults: [...accumulatedResults],
              isComplete: false,
              message: `Processing batch ${batchNum}/${totalBatches} (${batch.length} orders)...`,
            };
            
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(update)}\n\n`));

            // Delay between batches
            if (i + BATCH_SIZE < orderIds.length) {
              console.log(`Waiting ${DELAY_BETWEEN_BATCHES}ms before next batch...`);
              await sleep(DELAY_BETWEEN_BATCHES);
            }
          }

          // Final completion update
          const finalUpdate: SyncProgressUpdate = {
            current: orderIds.length,
            total: orderIds.length,
            batchNum: totalBatches,
            totalBatches,
            batchResults: [],
            accumulatedResults,
            isComplete: true,
            message: `Sync completed: ${accumulatedResults.filter((r) => r.status === "success").length} success, ${accumulatedResults.filter((r) => r.status === "skipped").length} skipped`,
          };
          
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(finalUpdate)}\n\n`));
          controller.close();
        } catch (error) {
          console.error("Stream error:", error);
          controller.error(error);
        }
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error: any) {
    console.error("API error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
