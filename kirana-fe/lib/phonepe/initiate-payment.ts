import { CreateSdkOrderRequest } from 'pg-sdk-node';
import { getPhonePeClient } from './client';

/**
 * Initiates a PhonePe Standard Checkout payment.
 * 
 * @param merchantOrderId - Unique order ID
 * @param amount - Amount in paise (e.g. 100 = ₹1.00)
 * @param redirectUrl - URL to redirect after payment completion
 * @param message - Message to show in the UPI collect request
 * @param metaInfo - Optional metadata to include
 * @returns The redirect URL for the payment page
 */
export async function initiatePayment(
    merchantOrderId: string,
    amount: number,
    redirectUrl: string,
    message: string = 'Payment',
    metaInfo?: any
) {
    const builder = CreateSdkOrderRequest.StandardCheckoutBuilder()
        .merchantOrderId(merchantOrderId)
        .amount(amount)
        .redirectUrl(redirectUrl)
        .message(message);

    if (metaInfo) {
        builder.metaInfo(metaInfo);
    }

    const request = builder.build();

    try {
        const phonePeClient = getPhonePeClient();
        const response = await phonePeClient.pay(request);
        return response.redirectUrl;
    } catch (error) {
        console.error('PhonePe Payment Initiation Failed:', error);
        throw error;
    }
}
