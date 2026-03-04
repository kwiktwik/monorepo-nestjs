import { NextRequest, NextResponse } from "next/server";
import { getPhonePePgClient } from "@/lib/phonepe-pg";
import { StandardCheckoutPayRequest, MetaInfo } from "pg-sdk-node";
import { auth } from "@/lib/better-auth/auth";
import { validateAppId, AppValidationError } from "@/lib/utils/app-validator";
import { db } from "@/db";
import { phonepeOrders } from "@/db/schema";
import { generateOrderId } from "@/lib/utils";
import { rupeesToPaise, createLocalOrder } from "@/lib/phonepe/helpers";

/**
 * Initiate a PhonePe Standard Checkout payment using the official Node.js SDK.
 *
 * Docs:
 * - Installation: https://developer.phonepe.com/payment-gateway/backend-sdk/nodejs-be-sdk/api-reference-node-js/installation
 * - Class init: https://developer.phonepe.com/payment-gateway/backend-sdk/nodejs-be-sdk/api-reference-node-js/class-initialization
 * - Initiate payment: https://developer.phonepe.com/payment-gateway/backend-sdk/nodejs-be-sdk/api-reference-node-js/initiate-payment
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
      console.error("[PhonePe PG] Authentication failed: No valid session found for initiate-payment");
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    const userId = session.user.id;
    const body = await request.json();

    const {
      amount, // in rupees from client
      redirectUrl,
      meta,
      message,
    } = body as {
      amount: number;
      redirectUrl?: string;
      meta?: Record<string, string>;
      message?: string;
    };

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Valid amount is required" },
        { status: 400 },
      );
    }

    // Amount in paise
    const amountInPaise = rupeesToPaise(amount);
    const merchantOrderId = generateOrderId();

    // Create local order record
    const order = await createLocalOrder(merchantOrderId, userId, appId, amountInPaise);

    const metaInfoBuilder = MetaInfo.builder();
    if (meta) {
      if (meta.udf1) metaInfoBuilder.udf1(meta.udf1);
      if (meta.udf2) metaInfoBuilder.udf2(meta.udf2);
      if (meta.udf3) metaInfoBuilder.udf3(meta.udf3);
      if (meta.udf4) metaInfoBuilder.udf4(meta.udf4);
      if (meta.udf5) metaInfoBuilder.udf5(meta.udf5);
    }
    const metaInfo = metaInfoBuilder.build();

    const requestBuilder = StandardCheckoutPayRequest.builder()
      .merchantOrderId(merchantOrderId)
      .amount(amountInPaise)
      .metaInfo(metaInfo);

    if (redirectUrl) {
      requestBuilder.redirectUrl(redirectUrl);
    }
    if (message) {
      requestBuilder.message(message);
    }

    const payRequest = requestBuilder.build();

    const phonePePgClient = getPhonePePgClient();
    const response = await phonePePgClient.pay(payRequest);

    // Persist PhonePe order info
    await db.insert(phonepeOrders).values({
      orderId: order.id,
      phonepeOrderId: response.orderId,
      state: response.state,
      redirectUrl: response.redirectUrl,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({
      orderId: order.id,
      phonepeOrderId: response.orderId,
      state: response.state,
      redirectUrl: response.redirectUrl,
      expireAt: response.expireAt,
    });
  } catch (error: any) {
    console.error("[PhonePe PG] Initiate payment error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}

