"use server";

import { razorpay } from "@/lib/razorpay";
import { db } from "@/db";
import { orders, user } from "@/db/schema";
import { eq, or, sql } from "drizzle-orm";
import { requireAdmin } from "@/lib/better-auth/auth-utils";
import { ORDER_STATUS } from "@/lib/constants/order-status";
import { generateOrderId } from "@/lib/utils";

/**
 * Extract phone number from email or contact and normalize to E.164 format
 * e.g., "919405760574@kiranaapps.local" -> "+919405760574"
 * e.g., "919405760574" -> "+919405760574"
 */
function normalizePhoneNumber(value: string | null | undefined): string | null {
    if (!value) return null;
    
    // Extract digits from the value (removes @domain if present)
    const digits = value.replace(/\D/g, '');
    
    // If it looks like an Indian phone number (10 digits with 91 prefix or 12 digits)
    if (digits.length === 12 && digits.startsWith('91')) {
        return `+${digits}`;
    }
    
    // If it's 10 digits, assume India and add +91
    if (digits.length === 10) {
        return `+91${digits}`;
    }
    
    return null;
}

export interface SyncResult {
    razorpayOrderId: string;
    status: "success" | "skipped" | "error";
    message: string;
}

export async function syncOrdersAction(razorpayOrderIds: string[], targetAppId: string): Promise<SyncResult[]> {
    // Ensure only admins can run this
    await requireAdmin();

    const results: SyncResult[] = [];

    for (const rzpOrderId of razorpayOrderIds) {
        try {
            if (!rzpOrderId.startsWith("order_")) {
                results.push({
                    razorpayOrderId: rzpOrderId,
                    status: "error",
                    message: "Invalid Razorpay Order ID format",
                });
                continue;
            }

            // Check if order already exists in our DB
            const existingOrder = await db.query.orders.findFirst({
                where: eq(orders.razorpayOrderId, rzpOrderId),
            });

            if (existingOrder) {
                results.push({
                    razorpayOrderId: rzpOrderId,
                    status: "skipped",
                    message: "Order already exists in database",
                });
                continue;
            }

            // Fetch order details from Razorpay
            const rzpOrder = await razorpay.orders.fetch(rzpOrderId);

            // Fetch payments for this order to get user details
            const payments = await razorpay.orders.fetchPayments(rzpOrderId);
            const firstPayment = payments.items?.[0];

            if (!firstPayment) {
                results.push({
                    razorpayOrderId: rzpOrderId,
                    status: "error",
                    message: "No payments found for this order on Razorpay",
                });
                continue;
            }

            const email = firstPayment.email;
            const contact = firstPayment.contact;

            if (!email && !contact) {
                results.push({
                    razorpayOrderId: rzpOrderId,
                    status: "error",
                    message: "No email or contact found in Razorpay payment",
                });
                continue;
            }

            // Normalize phone numbers for matching
            const normalizedEmailPhone = normalizePhoneNumber(email);
            const normalizedContactPhone = normalizePhoneNumber(contact ? String(contact) : null);

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

            // Strategy 3: Match by normalized phone (extracted from email like 919405760574@kiranaapps.local)
            // This handles the case where DB has +919405760574 but Razorpay has 919405760574@domain
            if (!dbUser && (normalizedEmailPhone || normalizedContactPhone)) {
                const phoneToMatch = normalizedEmailPhone || normalizedContactPhone;
                dbUser = await db.query.user.findFirst({
                    where: eq(user.phoneNumber, phoneToMatch!),
                });
            }

            // Strategy 4: Try matching without the + prefix (in case DB has inconsistent data)
            if (!dbUser && (normalizedEmailPhone || normalizedContactPhone)) {
                const phoneWithoutPlus = (normalizedEmailPhone || normalizedContactPhone)!.replace('+', '');
                dbUser = await db.query.user.findFirst({
                    where: sql`REPLACE(${user.phoneNumber}, '+', '') = ${phoneWithoutPlus}`,
                });
            }

            // If user not found, use system_deleted_user to preserve order data
            const SYSTEM_DELETED_USER = 'system_deleted_user';
            let isSystemUser = false;
            if (!dbUser) {
                dbUser = await db.query.user.findFirst({
                    where: eq(user.id, SYSTEM_DELETED_USER),
                });
                
                if (!dbUser) {
                    results.push({
                        razorpayOrderId: rzpOrderId,
                        status: "error",
                        message: `User not found and system_deleted_user does not exist`,
                    });
                    continue;
                }
                isSystemUser = true;
            }

            // Insert order into our DB
            const internalOrderId = generateOrderId();

            // Determine status based on payment status if available, else fall back to order status
            const paymentStatus = firstPayment.status;
            let finalStatus: any = ORDER_STATUS.CREATED;

            if (paymentStatus === "authorized") finalStatus = ORDER_STATUS.AUTHORIZED;
            else if (paymentStatus === "captured") finalStatus = ORDER_STATUS.CAPTURED;
            else if (paymentStatus === "failed") finalStatus = ORDER_STATUS.FAILED;
            else if (rzpOrder.status === "paid") finalStatus = ORDER_STATUS.CAPTURED;

            // Attempt to auto-detect appId if targetAppId is "auto"
            let appIdToUse = targetAppId;
            if (targetAppId === "auto") {
                const notes = {
                    ...(rzpOrder.notes as Record<string, string>),
                    ...(firstPayment.notes as Record<string, string>)
                };

                // Common keys for app identifier
                const possibleKeys = ["app_id", "appId", "package_name", "packageName", "package"];
                const detectedAppId = possibleKeys.map(k => notes[k]).find(v => v && typeof v === "string");

                if (detectedAppId) {
                    appIdToUse = detectedAppId;
                } else {
                    // Fallback or error
                    results.push({
                        razorpayOrderId: rzpOrderId,
                        status: "error",
                        message: "Auto-detection failed: No appId found in notes.",
                    });
                    continue;
                }
            }

            await db.insert(orders).values({
                id: internalOrderId,
                razorpayOrderId: rzpOrderId,
                userId: dbUser.id,
                appId: appIdToUse,
                customerId: dbUser.id,
                razorpayCustomerId: firstPayment.customer_id || null,
                amount: typeof rzpOrder.amount === "number" ? rzpOrder.amount : parseInt(String(rzpOrder.amount)),
                currency: rzpOrder.currency || "INR",
                status: finalStatus,
                razorpayPaymentId: firstPayment.id,
                notes: rzpOrder.notes ? JSON.stringify(rzpOrder.notes) : null,
                createdAt: new Date(rzpOrder.created_at * 1000),
                updatedAt: new Date(),
            });

            results.push({
                razorpayOrderId: rzpOrderId,
                status: "success",
                message: isSystemUser 
                    ? "Order successfully synced (assigned to system_deleted_user - user was deleted)" 
                    : "Order successfully synced",
            });

        } catch (error: any) {
            console.error(`Error syncing order ${rzpOrderId}:`, error);
            results.push({
                razorpayOrderId: rzpOrderId,
                status: "error",
                message: error.message || "Unknown error occurred",
            });
        }
    }

    return results;
}
