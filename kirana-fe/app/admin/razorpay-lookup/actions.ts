"use server";

import { razorpay } from "@/lib/razorpay";
import { requireAdmin } from "@/lib/better-auth/auth-utils";

export async function getRazorpayOrderDetails(orderId: string) {
    try {
        await requireAdmin();

        if (!orderId || !orderId.startsWith("order_")) {
            throw new Error("Invalid Razorpay Order ID format. Should start with 'order_'.");
        }

        // Fetch order details
        const order = await razorpay.orders.fetch(orderId);

        // Fetch payments for this order
        const payments = await razorpay.orders.fetchPayments(orderId);

        // Fetch refunds for this order (some payments might have refunds)
        // Note: Razorpay doesn't have a direct "fetch refunds for order", 
        // usually we list refunds and filter or check individual payments.
        // For simplicity, we'll return payments and their status.

        return {
            success: true,
            data: {
                order,
                payments: payments.items || [],
            }
        };

    } catch (error: any) {
        console.error("Error fetching Razorpay order details:", error);
        return {
            success: false,
            error: error.message || "Failed to fetch Razorpay order details"
        };
    }
}
