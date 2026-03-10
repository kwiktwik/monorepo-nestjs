"use server";

import { razorpay } from "@/lib/razorpay";
import { db } from "@/db";
import { orders, user } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { requireAdmin } from "@/lib/better-auth/auth-utils";
import { ORDER_STATUS } from "@/lib/constants/order-status";
import { generateOrderId } from "@/lib/utils";

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

            // Find user in our DB
            const dbUser = await db.query.user.findFirst({
                where: or(
                    email ? eq(user.email, String(email)) : undefined,
                    contact ? eq(user.phoneNumber, String(contact)) : undefined
                ),
            });

            if (!dbUser) {
                results.push({
                    razorpayOrderId: rzpOrderId,
                    status: "error",
                    message: `User not found for ${email || contact}`,
                });
                continue;
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
                message: "Order successfully synced",
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
