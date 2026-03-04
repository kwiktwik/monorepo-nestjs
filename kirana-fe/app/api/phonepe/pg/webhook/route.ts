import { NextRequest, NextResponse } from "next/server";
import { getPhonePePgClient } from "@/lib/phonepe-pg";
import { db } from "@/db";
import { phonepeSubscriptions, subscriptionLogs } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * PhonePe Payment Gateway webhook handler using official Node.js SDK.
 *
 * Docs:
 * https://developer.phonepe.com/payment-gateway/backend-sdk/nodejs-be-sdk/api-reference-node-js/webhook-handling
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();

    const authorizationHeaderData = request.headers.get("authorization") || "";

    const usernameConfigured =
      process.env.PHONEPE_PG_WEBHOOK_USERNAME || process.env.PHONEPE_WEBHOOK_USERNAME || "";
    const passwordConfigured =
      process.env.PHONEPE_PG_WEBHOOK_PASSWORD || process.env.PHONEPE_WEBHOOK_PASSWORD || "";

    if (!usernameConfigured || !passwordConfigured) {
      console.error(
        "[PhonePe PG Webhook] Missing PHONEPE_PG_WEBHOOK_USERNAME / PHONEPE_PG_WEBHOOK_PASSWORD env vars",
      );
      return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
    }

    // Get the singleton PhonePe client (initialized at module level)
    const phonePePgClient = getPhonePePgClient();

    const callbackResponse = phonePePgClient.validateCallback(
      usernameConfigured,
      passwordConfigured,
      authorizationHeaderData,
      body,
    );

    // Generic Subscription / Payment Webhook Logging for PhonePe
    try {
      const payloadString = callbackResponse.payload || {};
      let parsedPayload: any = {};

      if (typeof payloadString === "string") {
        parsedPayload = JSON.parse(Buffer.from(payloadString, "base64").toString("utf-8"));
      } else {
        parsedPayload = payloadString;
      }

      const subIdFromPayload = parsedPayload?.data?.merchantSubscriptionId || parsedPayload?.data?.subscriptionId;

      let userIdToLog: string | null = null;
      let appIdToLog = "alertpay-default";

      if (subIdFromPayload) {
        const sub = await db
          .select({ userId: phonepeSubscriptions.userId, appId: phonepeSubscriptions.appId })
          .from(phonepeSubscriptions)
          .where(eq(phonepeSubscriptions.merchantSubscriptionId, subIdFromPayload))
          .limit(1);

        if (sub.length > 0) {
          userIdToLog = sub[0].userId;
          appIdToLog = sub[0].appId;
        }
      }

      await db.insert(subscriptionLogs).values({
        userId: userIdToLog,
        appId: appIdToLog,
        subscriptionId: subIdFromPayload || "unknown", // Try to find subscription if applicable
        provider: "phonepe",
        action: String(callbackResponse.type || "phonepe_webhook"),
        status: parsedPayload?.data?.state || parsedPayload?.data?.status || null,
        metadata: { type: callbackResponse.type, payload: parsedPayload },
      });
    } catch (logErr) {
      console.error("[PhonePe PG Webhook] ⚠️ Failed to insert generic log:", logErr);
    }

    // callbackResponse contains { type, payload }
    // You can switch on type (CHECKOUT_ORDER_COMPLETED, PG_REFUND_COMPLETED, etc.)
    // and update your local DB (orders / phonepe_orders) accordingly.
    console.log("[PhonePe PG Webhook] Valid callback received:", callbackResponse.type);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[PhonePe PG Webhook] Error validating callback:", error);
    return NextResponse.json({ error: "Invalid callback" }, { status: 400 });
  }
}

