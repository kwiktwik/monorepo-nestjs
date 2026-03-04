import { NextRequest, NextResponse } from "next/server";
import { createOrder } from "@/lib/phonepe/create-order";
import { initiatePayment } from "@/lib/phonepe/initiate-payment";
import { checkStatus, checkMobileStatus } from "@/lib/phonepe/check-status";
import { auth } from "@/lib/better-auth/auth";
import { validateAppId, AppValidationError } from "@/lib/utils/app-validator";
import { db } from "@/db";
import { phonepeSubscriptions } from "@/db/schema";
import {
  PHONEPE_ACTIONS,
  PHONEPE_SUBSCRIPTION_STATE,
  AMOUNT_TYPE,
  type AmountType,
  type Frequency
} from "@/lib/constants/phonepe-subscriptions";
import { generateOrderId } from "@/lib/utils";
import { getCurrentEnvironment, getPhonePeConfig } from "@/lib/phonepe-env";
import type { CreateOrderTokenRequest } from "@/lib/phonepe/create-order-token";
import { rupeesToPaise, createLocalOrder } from "@/lib/phonepe/helpers";
import { PhonePeError, createValidationError, createAuthError, createNotFoundError } from "@/lib/phonepe/errors";

/**
 * Refactored PhonePe API route using POST for all actions
 * 
 * POST /api/phonepe
 * {
 *   "action": PHONEPE_ACTIONS.CREATE_ORDER | PHONEPE_ACTIONS.CREATE_ORDER_WITH_AUTH | PHONEPE_ACTIONS.CREATE_ORDER_TOKEN | PHONEPE_ACTIONS.GET_AUTH_TOKEN | PHONEPE_ACTIONS.INITIATE_PAYMENT | PHONEPE_ACTIONS.SETUP_SUBSCRIPTION | PHONEPE_ACTIONS.CHECK_STATUS | PHONEPE_ACTIONS.GET_SDK_CONFIG,
 *   ...payload
 * }
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
      console.error("[PhonePe API] Authentication failed: No valid session found");
      throw createAuthError("Unauthorized");
    }

    const userId = session.user.id;
    const body = await request.json();
    const { action } = body;
    console.info(`[PhonePe API] Action: ${action}, User: ${userId}, App: ${appId}`);
    console.debug(`[PhonePe API] Request Body:`, JSON.stringify(body, null, 2));

    // Get environment with built-in security checks
    const env = await getCurrentEnvironment(request, userId);

    switch (action) {
      case PHONEPE_ACTIONS.CREATE_ORDER: {
        const {
          amount, // in rupees
          redirectUrl,
          disablePaymentRetry = false,
          paymentMode,
        } = body as {
          amount: number;
          redirectUrl: string;
          disablePaymentRetry?: boolean;
          paymentMode?: {
            type: "UPI_INTENT" | "UPI_COLLECT" | "UPI_QR" | "NET_BANKING" | "CARD" | "PAY_PAGE";
            vpa?: string;
            phoneNumber?: string;
          };
        };

        if (!amount || amount <= 0) {
          throw createValidationError("Valid amount is required", { amount });
        }

        if (!redirectUrl) {
          throw createValidationError("redirectUrl is required");
        }

        const amountInPaise = rupeesToPaise(amount);
        const merchantOrderId = generateOrderId();

        // Create local order record
        const order = await createLocalOrder(merchantOrderId, userId, appId, amountInPaise);

        // Create PhonePe order using lib/phonepe function
        console.info(`[PhonePe API] Creating order for Amount: ${amountInPaise} paise, OrderId: ${merchantOrderId}, PaymentMode: ${paymentMode?.type || 'UPI_INTENT'}`);
        const phonePeOrder = await createOrder(
          merchantOrderId,
          amountInPaise,
          redirectUrl,
          disablePaymentRetry,
          paymentMode // Pass payment mode config
        );
        console.info(`[PhonePe API] PhonePe order created: ${phonePeOrder.orderId}`);

        return NextResponse.json({
          orderId: order.id,
          phonepeOrderId: phonePeOrder.orderId,
          state: phonePeOrder.state,
          expireAt: phonePeOrder.expireAt,
          token: phonePeOrder.token,
          paymentMode: phonePeOrder.paymentMode, // Return actual payment mode used
        });
      }

      case PHONEPE_ACTIONS.INITIATE_PAYMENT: {
        const {
          amount, // in rupees from client
          redirectUrl,
          message = "Payment",
          metaInfo,
        } = body as {
          amount: number;
          redirectUrl: string;
          message?: string;
          metaInfo?: Record<string, string | undefined>;
        };

        if (!amount || amount <= 0) {
          throw createValidationError("Valid amount is required", { amount });
        }

        if (!redirectUrl) {
          throw createValidationError("redirectUrl is required");
        }

        const amountInPaise = rupeesToPaise(amount);
        const merchantOrderId = generateOrderId();

        // Create local order record
        const order = await createLocalOrder(merchantOrderId, userId, appId, amountInPaise);

        // Initiate payment using lib/phonepe function
        console.info(`[PhonePe API] Initiating payment for Amount: ${amountInPaise} paise, OrderId: ${merchantOrderId}`);
        const redirectUrl_response = await initiatePayment(
          merchantOrderId,
          amountInPaise,
          redirectUrl,
          message,
          metaInfo
        );
        console.info(`[PhonePe API] Payment initiated, redirect URL: ${redirectUrl_response}`);

        return NextResponse.json({
          orderId: order.id,
          redirectUrl: redirectUrl_response,
          merchantOrderId,
        });
      }

      case PHONEPE_ACTIONS.GET_AUTH_TOKEN: {
        const { getAuthToken } = await import("@/lib/phonepe/auth");
        const tokenResponse = await getAuthToken(env);
        return NextResponse.json(tokenResponse);
      }

      case PHONEPE_ACTIONS.CREATE_ORDER_WITH_AUTH: {
        const {
          redirectUrl,
          disablePaymentRetry = false,
          paymentMode,
        } = body as {
          redirectUrl: string;
          disablePaymentRetry?: boolean;
          paymentMode?: {
            type: "UPI_INTENT" | "UPI_COLLECT" | "UPI_QR" | "NET_BANKING" | "CARD" | "PAY_PAGE";
            vpa?: string;
            phoneNumber?: string;
          };
        };

        if (!redirectUrl) {
          throw createValidationError("redirectUrl is required");
        }

        // Fixed amount ₹5 - not taken from frontend
        const amountInPaise = 500;
        const merchantOrderId = generateOrderId();

        // Create local order record
        const order = await createLocalOrder(merchantOrderId, userId, appId, amountInPaise);

        // Get merchantId from config
        const config = getPhonePeConfig(env);
        const merchantId = config.merchantId;

        // Create PhonePe order and get auth token in parallel
        console.info(`[PhonePe API] Creating order with auth: OrderId: ${merchantOrderId}, PaymentMode: ${paymentMode?.type || 'UPI_INTENT'}`);
        const { getAuthToken } = await import("@/lib/phonepe/auth");
        const [phonePeOrder, authTokenResponse] = await Promise.all([
          createOrder(
            merchantOrderId,
            amountInPaise,
            redirectUrl,
            disablePaymentRetry,
            paymentMode // Pass payment mode config
          ),
          getAuthToken(env),
        ]);
        console.info(`[PhonePe API] Order with auth created: ${phonePeOrder.orderId}`);

        return NextResponse.json({
          merchantOrderId: merchantOrderId,
          orderId: phonePeOrder.orderId,
          merchantId: merchantId,
          token: phonePeOrder.token,
          merchantSubscriptionId: null,
          paymentMode: phonePeOrder.paymentMode, // Return actual payment mode used
        });
      }

      case PHONEPE_ACTIONS.CREATE_ORDER_TOKEN: {
        const { createOrderToken } = await import("@/lib/phonepe/create-order-token");
        const {
          amount, // in rupees
          merchantOrderId: customOrderId,
          expireAfter = 1200,
          metaInfo,
          paymentFlow,
          redirectUrl, // Added redirectUrl for createOrderToken
          disablePaymentRetry = false // Added disablePaymentRetry for createOrderToken
        } = body as CreateOrderTokenRequest & { merchantOrderId?: string; redirectUrl?: string; disablePaymentRetry?: boolean };

        if (!amount || amount <= 0) {
          throw createValidationError("Valid amount is required", { amount });
        }

        const amountInPaise = rupeesToPaise(amount);
        const merchantOrderId = customOrderId || generateOrderId();

        // Create local order record
        const order = await createLocalOrder(merchantOrderId, userId, appId, amountInPaise);

        console.info(`[PhonePe API] Creating order token: OrderId: ${merchantOrderId}, Amount: ${amountInPaise}`);
        const orderTokenResponse = await createOrderToken(
          {
            merchantOrderId,
            amount: amountInPaise,
            expireAfter,
            metaInfo,
            paymentFlow,
            redirectUrl,
            disablePaymentRetry,
          } as CreateOrderTokenRequest & { redirectUrl?: string; disablePaymentRetry?: boolean },
          env
        );
        console.info(`[PhonePe API] Order token created for: ${merchantOrderId}`);

        return NextResponse.json({
          ...orderTokenResponse,
          localOrderId: order.id
        });
      }

      case PHONEPE_ACTIONS.SETUP_SUBSCRIPTION: {
        const { createOrderToken } = await import("@/lib/phonepe/create-order-token");
        const {
          amount, // Initial amount in rupees (optional)
          maxAmount, // Max debit amount in rupees
          frequency,
          merchantSubscriptionId: customSubId,
          authWorkflowType = "TRANSACTION", // PENNY_DROP or TRANSACTION
          amountType = AMOUNT_TYPE.VARIABLE, // FIXED or VARIABLE
          metaInfo,
          redirectUrl
        } = body as {
          amount?: number;
          maxAmount: number;
          frequency: Frequency;
          recurringCount?: number;
          mobileNumber?: string;
          startTimestamp?: number; // Unix timestamp in ms
          endTimestamp?: number; // Unix timestamp in ms
          amountType?: AmountType;
          metaInfo?: Record<string, string | undefined>;
          redirectUrl: string;
          merchantSubscriptionId?: string;
          authWorkflowType?: "TRANSACTION" | "PENNY_DROP";
        };

        if (!maxAmount || maxAmount <= 0) {
          throw createValidationError("Valid maxAmount is required", { maxAmount });
        }

        if (!frequency) {
          throw createValidationError("frequency is required");
        }

        const initialAmountPaise = amount ? rupeesToPaise(amount) : 0;
        const maxAmountPaise = rupeesToPaise(maxAmount);
        const merchantSubscriptionId = customSubId || generateOrderId();
        const merchantOrderId = generateOrderId();

        try {
          await db.insert(phonepeSubscriptions).values({
            merchantSubscriptionId,
            userId,
            appId,
            phonepeSubscriptionId: `temp_${Date.now()}`,
            amount: initialAmountPaise,
            amountType: amountType as AmountType,
            frequency: frequency as Frequency,
            state: PHONEPE_SUBSCRIPTION_STATE.CREATED,
          });
        } catch (error) {
          console.error("Database insert error:", error);
          throw error;
        }

        console.info(`[PhonePe API] Setting up subscription: SubId: ${merchantSubscriptionId}, OrderId: ${merchantOrderId}`);
        const orderTokenResponse = await createOrderToken({
          merchantOrderId,
          amount: initialAmountPaise,
          redirectUrl,
          paymentFlow: {
            type: "SUBSCRIPTION_CHECKOUT_SETUP",
            subscriptionDetails: {
              merchantSubscriptionId,
              subscriptionType: "RECURRING",
              authWorkflowType,
              amountType,
              maxAmount: maxAmountPaise,
              frequency,
              productType: "UPI_MANDATE",
            }
          },
          metaInfo
        }, env);
        console.info(`[PhonePe API] Subscription setup initiated: ${merchantSubscriptionId}`);

        return NextResponse.json({
          ...orderTokenResponse,
          merchantSubscriptionId,
          merchantOrderId
        });
      }

      case PHONEPE_ACTIONS.CHECK_STATUS: {
        const { merchantOrderId, type = "standard" } = body as {
          merchantOrderId: string;
          type?: "standard" | "mobile";
        };

        if (!merchantOrderId) {
          throw createValidationError("merchantOrderId is required");
        }

        // Ensure order belongs to this app
        const order = await db.query.orders.findFirst({
          where: (tbl, { and, eq: eqFn }) =>
            and(eqFn(tbl.id, merchantOrderId), eqFn(tbl.appId, appId)),
        });

        if (!order) {
          throw createNotFoundError("Order not found", { merchantOrderId });
        }

        console.info(`[PhonePe API] Checking status: OrderId: ${merchantOrderId}, Type: ${type}`);
        const statusResponse =
          type === "mobile"
            ? await checkMobileStatus(merchantOrderId, env)
            : await checkStatus(merchantOrderId);
        console.info(`[PhonePe API] Status response for ${merchantOrderId}: ${statusResponse.state}`);

        return NextResponse.json({
          orderId: merchantOrderId,
          state: statusResponse.state,
          phonepeOrderId: statusResponse.orderId,
          amount: statusResponse.amount,
          transactionId: statusResponse.transactionId,
          paymentMode: statusResponse.paymentMode,
        });
      }

      case PHONEPE_ACTIONS.GET_SDK_CONFIG: {
        const config = getPhonePeConfig(env);
        return NextResponse.json({
          environment: env === "PRODUCTION" ? "PRODUCTION" : "SANDBOX",
          merchantId: config.merchantId,
          flowId: userId, // Using userId as flowId for tracking
          enableLogging: env !== "PRODUCTION"
        });
      }

      default:
        return NextResponse.json(
          { error: "Invalid action." },
          { status: 400 }
        );
    }
  } catch (error: unknown) {
    // Handle PhonePe custom errors
    if (error instanceof PhonePeError) {
      console.error(`[PhonePe API] ${error.code}:`, {
        message: error.message,
        details: error.details,
      });
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode }
      );
    }

    // Handle unknown errors - don't expose details
    console.error("[PhonePe API] Unexpected error:", error instanceof Error ? error : String(error));
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

// Keep GET for status for backward compatibility if needed, but the user requested POST refactor
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
    const action = searchParams.get("action");
    const merchantOrderId = searchParams.get("merchantOrderId");

    if (action === "status") {
      if (!merchantOrderId) {
        return NextResponse.json({ error: "merchantOrderId is required" }, { status: 400 });
      }

      const session = await auth.api.getSession({
        headers: request.headers,
      });

      if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      // Ensure order belongs to this app
      const order = await db.query.orders.findFirst({
        where: (tbl, { and, eq: eqFn }) =>
          and(eqFn(tbl.id, merchantOrderId), eqFn(tbl.appId, appId)),
      });

      if (!order) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      const status = await checkStatus(merchantOrderId);

      return NextResponse.json({
        orderId: merchantOrderId,
        state: status.state,
        phonepeOrderId: status.orderId,
        amount: status.amount,
        transactionId: status.transactionId,
        paymentMode: status.paymentMode,
      });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (error: unknown) {
    console.error("[PhonePe API] GET Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}