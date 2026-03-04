/**
 * Shared PhonePe types — single source of truth.
 * Import from here rather than redefining in individual modules.
 */

export type PaymentModeType =
    | "UPI_INTENT"
    | "UPI_COLLECT"
    | "UPI_QR"
    | "NET_BANKING"
    | "CARD"
    | "WALLET"
    | "PHONEPE_WALLET"
    | "PAY_PAGE";

export type CardType = "DEBIT_CARD" | "CREDIT_CARD";

export interface PaymentModeConfig {
    type: PaymentModeType;
    /** For UPI_COLLECT via VPA */
    vpa?: string;
    /** For UPI_COLLECT via phone number */
    phoneNumber?: string;
    /** For card payment mode filtering */
    cardTypes?: CardType[];
}

export interface SubscriptionDetails {
    merchantSubscriptionId: string;
    subscriptionType: "RECURRING";
    authWorkflowType: "TRANSACTION" | "PENNY_DROP";
    amountType: "FIXED" | "VARIABLE";
    maxAmount: number;
    frequency: "DAILY" | "WEEKLY" | "MONTHLY" | "ON_DEMAND";
    productType: "UPI_MANDATE";
}
