import { getPhonePeClient } from './client';
import { getAuthToken } from './auth';

/**
 * Checks the status of a PhonePe order using standard SDK.
 * 
 * @param merchantOrderId - Unique order ID
 * @returns The order status response
 */
export async function checkStatus(merchantOrderId: string) {
    try {
        const phonePeClient = getPhonePeClient();
        const response = await phonePeClient.getOrderStatus(merchantOrderId);
        return {
            state: response.state,
            orderId: response.orderId,
            amount: response.amount,
            transactionId: response.paymentDetails?.[0]?.transactionId,
            paymentMode: response.paymentDetails?.[0]?.paymentMode
        };
    } catch (error) {
        console.error('PhonePe Check Status Failed:', error);
        throw error;
    }
}

/**
 * Checks the status of a PhonePe order using Mobile SDK API (Bearer token).
 * 
 * @param merchantOrderId - Unique order ID
 * @returns The mobile order status response
 */
export async function checkMobileStatus(merchantOrderId: string, envKey: string = (process.env.PHONEPE_ENV || "SANDBOX")) {
    const env = envKey.toUpperCase();
    const isProd = env === "PRODUCTION" || env === "PROD";

    // Get Auth Token
    const authResponse = await getAuthToken(env);
    const accessToken = authResponse.access_token;

    // Determine URL based on environment
    const baseUrl =
        isProd
            ? "https://api.phonepe.com/apis/pg/checkout/v2"
            : "https://api-preprod.phonepe.com/apis/pg-sandbox/checkout/v2";

    const url = `${baseUrl}/order/${merchantOrderId}/status?details=false`;

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `O-Bearer ${accessToken}`,
                "accept": "application/json",
            },
            signal: AbortSignal.timeout(10000), // 10 second timeout
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
                `PhonePe Mobile Check Status Failed: ${response.status} ${response.statusText} - ${errorText}`
            );
        }

        return await response.json();
    } catch (error) {
        console.error("PhonePe checkMobileStatus error:", error);
        throw error;
    }
}
