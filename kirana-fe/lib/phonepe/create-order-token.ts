import { getAuthToken } from "./auth";
import { type PaymentModeType, type CardType, type PaymentModeConfig, type SubscriptionDetails } from "./types";

export type { PaymentModeType, CardType };

export interface PaymentFlowModeConfig {
  enabledPaymentModes?: PaymentModeConfig[];
  disabledPaymentModes?: PaymentModeConfig[];
}

export interface CreateOrderTokenRequest {
  merchantOrderId: string;
  amount: number;
  expireAfter?: number;
  redirectUrl?: string;
  disablePaymentRetry?: boolean;
  metaInfo?: {
    [key: string]: string | undefined;
    udf1?: string;
    udf2?: string;
    udf3?: string;
    udf4?: string;
    udf5?: string;
    udf6?: string;
    udf7?: string;
    udf8?: string;
    udf9?: string;
    udf10?: string;
    udf11?: string;
    udf12?: string;
    udf13?: string;
    udf14?: string;
    udf15?: string;
  };
  paymentFlow?: {
    type: "PG_CHECKOUT" | "SUBSCRIPTION_CHECKOUT_SETUP";
    paymentModeConfig?: PaymentModeConfig;
    subscriptionDetails?: SubscriptionDetails;
  };
}

export interface CreateOrderTokenResponse {
  orderId: string;
  state: string;
  expireAt: number;
  token: string;
}

export async function createOrderToken(
  requestData: CreateOrderTokenRequest,
  envKey: string = (process.env.PHONEPE_ENV || "SANDBOX")
): Promise<CreateOrderTokenResponse> {
  const env = envKey.toUpperCase();
  const isProd = env === "PRODUCTION" || env === "PROD";

  // Get Auth Token first
  const authResponse = await getAuthToken(env);
  const accessToken = authResponse.access_token;

  // Determine URL based on environment
  const url =
    isProd
      ? "https://api.phonepe.com/apis/pg/checkout/v2/sdk/order"
      : "https://api-preprod.phonepe.com/apis/pg-sandbox/checkout/v2/sdk/order";

  // Set default payment flow if not provided
  if (!requestData.paymentFlow) {
    requestData.paymentFlow = { type: "PG_CHECKOUT" };
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `O-Bearer ${accessToken}`,
        "accept": "application/json",
      },
      body: JSON.stringify(requestData),
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `PhonePe Create Order Token Failed: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    const data = (await response.json()) as CreateOrderTokenResponse;
    return data;
  } catch (error) {
    if (error instanceof Error && error.name === 'TimeoutError') {
      console.error("PhonePe createOrderToken timeout");
      throw new Error("PhonePe order token creation timed out");
    }
    console.error("PhonePe createOrderToken error:", error);
    throw error;
  }
}

