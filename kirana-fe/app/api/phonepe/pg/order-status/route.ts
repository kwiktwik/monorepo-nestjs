import { NextRequest, NextResponse } from "next/server";
import { getPhonePePgClient } from "@/lib/phonepe-pg";
import { auth } from "@/lib/better-auth/auth";
import { validateAppId, AppValidationError } from "@/lib/utils/app-validator";
import { db } from "@/db";
import { phonepeOrders } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Get order status from PhonePe PG SDK.
 *
 * Docs:
 * https://developer.phonepe.com/payment-gateway/backend-sdk/nodejs-be-sdk/api-reference-node-js/order-status-api
 */
export async function GET(request: NextRequest) {
  try {
    // Validate app ID
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

    const searchParams = request.nextUrl.searchParams;
    const merchantOrderId = searchParams.get("merchantOrderId");

    if (!merchantOrderId) {
      return NextResponse.json(
        { error: "merchantOrderId is required" },
        { status: 400 },
      );
    }

    // Authenticate user
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || !session.user) {
      console.error("[PhonePe PG] Authentication failed: No valid session found for order-status");
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    const userId = session.user.id;

    // Ensure order belongs to this app & user
    const order = await db.query.orders.findFirst({
      where: (tbl, { and, eq: eqFn }) =>
        and(eqFn(tbl.id, merchantOrderId), eqFn(tbl.appId, appId)),
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 },
      );
    }

    const phonePePgClient = getPhonePePgClient();
    const response = await phonePePgClient.getOrderStatus(merchantOrderId);

    // Optionally sync minimal status to phonepe_orders table
    const existing = await db.query.phonepeOrders.findFirst({
      where: eq(phonepeOrders.orderId, order.id),
    });

    if (existing) {
      await db
        .update(phonepeOrders)
        .set({
          state: response.state,
          updatedAt: new Date(),
        })
        .where(eq(phonepeOrders.id, existing.id));
    }

    return NextResponse.json({
      state: response.state,
      amount: response.amount,
      expireAt: response.expireAt,
      metaInfo: response.metaInfo,
      paymentDetails: response.paymentDetails,
    });
  } catch (error) {
    console.error("[PhonePe PG] Order status error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 },
    );
  }
}
