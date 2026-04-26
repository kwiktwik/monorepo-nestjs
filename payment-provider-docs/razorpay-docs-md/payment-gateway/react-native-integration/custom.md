<!-- Source: https://razorpay.com/docs/payments/payment-gateway/react-native-integration/custom -->

The React Native SDK acts as a wrapper around the Razorpay Custom UI SDK to build a dynamic and responsive Checkout interface for your iOS or Android application.

**Watch Out!**

- Minimum software requirement: React version 16.5.0
- React Native version 0.57.1: This version of the Razorpay-React Native SDK supports Xcode 10. The [known issues of React Native on Xcode 10](https://github.com/facebook/react-native/issues/19573)

  are fixed in the current version of our SDK.

**Handy Tips** [Razorpay React Native Standard SDK](/razorpay-docs-md/payment-gateway/react-native-integration/standard.md) supports all payment methods by default. We recommend you integrate with the Razorpay React Native Standard SDK. If you integrate with Custom Checkout SDK, you will need to integrate these manually.

## List of Razorpay React Native Custom SDK Versions (Last 4 versions)

**Update SDK**

Check your current SDK version. If it is outdated, please [update the SDK](/razorpay-docs-md/payment-gateway/react-native-integration/custom/troubleshooting-faqs.md#4-how-can-i-update-the-razorpay-react) to ensure uninterrupted settlements of your funds.

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

- Create a [Razorpay Account](https://dashboard.razorpay.com/signup)  .

- [Generate API Keys in Test Mode](/razorpay-docs-md/api/authentication.md#generate-api-keys)

  . To go live with the integration and start accepting real payments, generate Live Mode API Keys and replace them in the integration.
- Know about the [Razorpay Payment Flow](/razorpay-docs-md/payment-gateway/how-it-works.md)  .

## Integration Steps

Follow these integration steps:

1. [Build Integration](/razorpay-docs-md/payment-gateway/react-native-integration/custom/build-integration.md)
2. [Test Integration](/razorpay-docs-md/payment-gateway/react-native-integration/custom/test-integration.md)
3. [Go-Live Checklist](/razorpay-docs-md/payment-gateway/react-native-integration/custom/go-live-checklist.md)

### Related Information

- [Troubleshooting and FAQs](/razorpay-docs-md/payment-gateway/react-native-integration/standard/troubleshooting-faqs.md)
- [Address Verification System](/razorpay-docs-md/international-payments/address-verification-system.md)
