import { CreateSdkOrderRequest } from 'pg-sdk-node';
import { type PaymentModeType, type PaymentModeConfig } from './types';
import { getPhonePeClient } from './client';

export type { PaymentModeType, PaymentModeConfig };

/**
 * Creates an SDK Order token for PhonePe Mobile SDK integration.
 *
 * NOTE ON PAYMENT MODE:
 * The paymentModeConfig.type only controls whether we use StandardCheckout (PAY_PAGE)
 * or CustomCheckout (all other types: UPI_INTENT, UPI_COLLECT, UPI_QR, CARD, NET_BANKING).
 *
 * The actual payment instrument (UPI_INTENT, CARD etc.) is selected by the
 * mobile SDK client at `pay()` time — NOT during order creation. Attempting to set
 * PgPaymentFlow on the server-side order request overwrites the internally-built
 * PgCheckoutPaymentFlow and causes a "Scenario not found" error from PhonePe.
 *
 * @param merchantOrderId - Unique order ID
 * @param amount - Amount in paise (e.g. 100 = ₹1.00)
 * @param redirectUrl - URL to redirect after payment completion
 * @param disablePaymentRetry - If true, disables retries on the payment page
 * @param paymentModeConfig - Optional payment mode configuration (defaults to CustomCheckout)
 * @returns The order token and details
 */
export async function createOrder(
    merchantOrderId: string,
    amount: number,
    redirectUrl: string,
    disablePaymentRetry: boolean = false,
    paymentModeConfig?: PaymentModeConfig
) {
    const modeType = paymentModeConfig?.type || "UPI_INTENT";

    // PAY_PAGE → StandardCheckout (hosted payment page shown by PhonePe)
    // All other modes → CustomCheckout (mobile SDK handles the payment instrument)
    const builder = modeType === "PAY_PAGE"
        ? CreateSdkOrderRequest.StandardCheckoutBuilder()
        : CreateSdkOrderRequest.CustomCheckoutBuilder();

    builder
        .merchantOrderId(merchantOrderId)
        .amount(amount)
        .redirectUrl(redirectUrl);

    if (disablePaymentRetry) {
        builder.disablePaymentRetry(true);
    }

    // build() internally creates the correct PgCheckoutPaymentFlow — do NOT override it.
    const request = builder.build();

    try {
        const phonePeClient = getPhonePeClient();
        const response = await phonePeClient.createSdkOrder(request);
        return {
            token: response.token,
            orderId: response.orderId,
            state: response.state,
            expireAt: response.expireAt,
            paymentMode: { type: modeType },
        };
    } catch (error) {
        console.error('PhonePe Create SDK Order Failed:', error);
        throw error;
    }
}
