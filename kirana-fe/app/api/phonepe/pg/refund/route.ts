import { NextRequest, NextResponse } from "next/server";
import { getPhonePePgClient } from "@/lib/phonepe-pg";
import { RefundRequest } from "pg-sdk-node";
import { auth } from "@/lib/better-auth/auth";
import { validateAppId, AppValidationError } from "@/lib/utils/app-validator";
import { generateOrderId } from "@/lib/utils";
import { rupeesToPaise } from "@/lib/phonepe/helpers";

/**
 * Initiate a refund via PhonePe PG SDK.
 *
 * Docs:
 * https://developer.phonepe.com/payment-gateway/backend-sdk/nodejs-be-sdk/api-reference-node-js/refund
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
      console.error("[PhonePe PG] Authentication failed: No valid session found for refund");
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    const userId = session.user.id;

    const body = await request.json();
    const {
      originalMerchantOrderId,
      amount, // in rupees
      merchantRefundId,
    } = body as {
      originalMerchantOrderId: string;
      amount: number;
      merchantRefundId?: string;
    };

    if (!originalMerchantOrderId) {
      return NextResponse.json(
        { error: "originalMerchantOrderId is required" },
        { status: 400 },
      );
    }

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Valid amount is required" },
        { status: 400 },
      );
    }

    const amountInPaise = rupeesToPaise(amount);
    const refundId = merchantRefundId || `RF_${generateOrderId()}`;

    const refundReq = RefundRequest.builder()
      .merchantRefundId(refundId)
      .originalMerchantOrderId(originalMerchantOrderId)
      .amount(amountInPaise)
      .build();

    const phonePePgClient = getPhonePePgClient();
    const response = await phonePePgClient.refund(refundReq);

    return NextResponse.json({
      refundId: response.refundId,
      state: response.state,
      amount: response.amount,
    });
  } catch (error: any) {
    console.error("[PhonePe PG] Refund error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
