<!-- Source: https://razorpay.com/docs/payments/payment-gateway/flutter-integration/custom -->

Flutter custom SDK is a wrapper for Flutter framework that interacts with native our custom SDK (iOS and Android platforms). Flutter apps can interact with wrapper methods to initiate payment and other payment operations.

## Platform Support

## List of Razorpay Flutter Custom SDK Versions (Last 5 versions)

**Update SDK**

Check your [current SDK version](/razorpay-docs-md/payment-gateway/flutter-integration/custom/troubleshooting-faqs.md#6-how-can-i-check-the-razorpay-flutter). If it is outdated, please [update the SDK](/razorpay-docs-md/payment-gateway/flutter-integration/custom/troubleshooting-faqs.md#7-how-can-i-update-the-razorpay-flutter) to ensure uninterrupted settlements of your funds.

**UPI Collect Flow Deprecated**

According to NPCI guidelines, the UPI Collect flow is being deprecated effective 28 February 2026. Customers can no longer make payments or register UPI mandates by manually entering VPA/UPI id/mobile numbers.

**Exemptions:** UPI Collect will continue to be supported for:

- MCC 6012 & 6211 (IPO and secondary market transactions).
- iOS mobile app and mobile web transactions.
- UPI Mandates (execute/modify/revoke operations only)
- eRupi vouchers.
- PACB businesses (cross-border/international payments).

**Action Required:**

- If you are a new Razorpay user, use [UPI Intent](/razorpay-docs-md/payment-gateway/web-integration/custom/payment-methods.md#intent-flow)  .
- If you are an existing Razorpay user not covered by exemptions, you must migrate to UPI Intent or UPI QR code to continue accepting UPI payments. For detailed migration steps, refer to the [migration documentation](/docs/announcements/upi-collect-migration/custom-integration/)  .

## Prerequisites

- Create a Razorpay account.
- Generate [API Keys](/razorpay-docs-md/api/authentication.md#generate-api-keys)

  from the Dashboard. To go live with the integration and start accepting real payments, generate Live Mode API Keys and replace them in the integration.
- Know about the [Razorpay Payment Flow](/razorpay-docs-md/payment-gateway/how-it-works.md)  .

## Integration Steps

Follow these integration steps:

1. [Build Integration](/razorpay-docs-md/payment-gateway/flutter-integration/custom/build-integration.md)
2. [Test Integration](/razorpay-docs-md/payment-gateway/flutter-integration/custom/test-integration.md)
3. [Go-Live Checklist](/razorpay-docs-md/payment-gateway/flutter-integration/custom/go-live-checklist.md)

### Related Information

- [Troubleshooting and FAQs](/razorpay-docs-md/payment-gateway/flutter-integration/custom/troubleshooting-faqs.md)
- [Address Verification System](/razorpay-docs-md/international-payments/address-verification-system.md)
