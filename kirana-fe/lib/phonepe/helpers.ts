import { db } from "@/db";
import { orders } from "@/db/schema";
import { ORDER_STATUS } from "@/lib/constants/order-status";

/**
 * Currency conversion helpers
 */

/**
 * Convert rupees to paise
 * @param rupees - Amount in rupees
 * @returns Amount in paise (1 rupee = 100 paise)
 */
export function rupeesToPaise(rupees: number): number {
    return Math.round(rupees * 100);
}

/**
 * Convert paise to rupees
 * @param paise - Amount in paise
 * @returns Amount in rupees
 */
export function paiseToRupees(paise: number): number {
    return paise / 100;
}

/**
 * Database helpers
 */

/**
 * Create a local order record in the database
 * @param merchantOrderId - Unique merchant order ID
 * @param userId - User ID
 * @param appId - Application ID
 * @param amountInPaise - Amount in paise
 * @returns Created order record
 */
export async function createLocalOrder(
    merchantOrderId: string,
    userId: string,
    appId: string,
    amountInPaise: number
) {
    const [order] = await db
        .insert(orders)
        .values({
            id: merchantOrderId,
            userId,
            appId,
            customerId: userId,
            amount: amountInPaise,
            status: ORDER_STATUS.CREATED,
        })
        .returning();

    return order;
}
