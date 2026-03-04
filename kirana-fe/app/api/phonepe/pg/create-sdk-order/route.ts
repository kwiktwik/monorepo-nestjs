import { NextRequest, NextResponse } from "next/server";
import { getPhonePePgClient } from "@/lib/phonepe-pg";
import { CreateSdkOrderRequest } from "pg-sdk-node";
import { auth } from "@/lib/better-auth/auth";
import { validateAppId, AppValidationError } from "@/lib/utils/app-validator";
import { db } from "@/db";
import { phonepeOrders } from "@/db/schema";
import { generateOrderId } from "@/lib/utils";
import { rupeesToPaise, createLocalOrder } from "@/lib/phonepe/helpers";

/**
 * Create a PhonePe SDK Order token for mobile SDK flows.
 *
 * Docs:
 * https://developer.phonepe.com/payment-gateway/backend-sdk/nodejs-be-sdk/api-reference-node-js/create-sdk-order
 */
export async function POST(request: NextRequest) {
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

    // Authenticate user
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || !session.user) {
      console.error("[PhonePe PG] Authentication failed: No valid session found for create-sdk-order");
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    const userId = session.user.id;
    const body = await request.json();

    const {
      amount, // in rupees
      redirectUrl,
      disablePaymentRetry = false,
    } = body as {
      amount: number;
      redirectUrl: string;
      disablePaymentRetry?: boolean;
    };

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Valid amount is required" },
        { status: 400 },
      );
    }

    if (!redirectUrl) {
      return NextResponse.json(
        { error: "redirectUrl is required" },
        { status: 400 },
      );
    }

    const amountInPaise = rupeesToPaise(amount);
    const merchantOrderId = generateOrderId();

    // Local order
    const order = await createLocalOrder(merchantOrderId, userId, appId, amountInPaise);

    const sdkOrderReq = CreateSdkOrderRequest.StandardCheckoutBuilder()
      .merchantOrderId(merchantOrderId)
      .amount(amountInPaise)
      .redirectUrl(redirectUrl)
      .disablePaymentRetry(disablePaymentRetry)
      .build();

    const phonePePgClient = getPhonePePgClient();
    const response = await phonePePgClient.createSdkOrder(sdkOrderReq);

    await db.insert(phonepeOrders).values({
      orderId: order.id,
      phonepeOrderId: response.orderId,
      state: response.state,
      redirectUrl,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({
      orderId: order.id,
      phonepeOrderId: response.orderId,
      state: response.state,
      expireAt: response.expireAt,
      token: response.token,
    });
  } catch (error: any) {
    console.error("[PhonePe PG] Create SDK order error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}

