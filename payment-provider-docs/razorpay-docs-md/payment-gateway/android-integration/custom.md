<!-- Source: https://razorpay.com/docs/payments/payment-gateway/android-integration/custom -->

With Razorpay Android Custom SDK, you can customise the Razorpay Checkout UI.

- Customise the look-and-feel such as colors and themes of your app's Checkout form.
- Validate customer inputs such as card number, expiry date and others using the [Luhn check algorithm](https://en.wikipedia.org/wiki/Luhn_algorithm)  .
- Configure and integrate the payment methods on the Checkout form.

**Handy Tips**

It is recommended to integrate with the [Razorpay Android Standard SDK](/razorpay-docs-md/payment-gateway/android-integration/standard.md) as it supports all payment methods by default. If you integrate with Custom Checkout SDK, you will need to integrate these manually.

## List of Razorpay Android Custom SDK Versions (Last 5 versions)

**Update SDK**

Check your [current SDK version](/razorpay-docs-md/payment-gateway/android-integration/custom/troubleshooting-faqs.md#6-how-can-i-check-the-razorpay-android). If it is outdated, please [update the SDK](/razorpay-docs-md/payment-gateway/android-integration/custom/troubleshooting-faqs.md#7-how-can-i-update-the-razorpay-android) to ensure uninterrupted settlements of your funds.

From version 3.9.22 onwards, the latest version is automatically updated, eliminating the need for manual updates.

## Sample Code

Check the sample code on [GitHub](https://github.com/razorpay/razorpay-android-custom-sample-app) to integrate.

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

- Create a [Razorpay account](https://dashboard.razorpay.com/signup)  .
- Generate the [API Keys](/razorpay-docs-md/dashboard/account-settings/api-keys.md#generate-api-keys)

  from the Dashboard. To go live with the integration and start accepting real payments, generate Live Mode API Keys and replace them in the integration.
- Know about the [Payment Flow](/razorpay-docs-md/payment-gateway/how-it-works.md)  .
- According to the PCI regulations, payment processing is not allowed on TLS v1. Hence, if the device does not have TLS v1.1 or v1.2, the SDK will throw an error in the onPaymentError method. Check the [TLS versions](https://developer.android.com/reference/javax/net/ssl/SSLSocket#default-configuration-for-different-android-versions)  .

## Integration Steps

Follow these integration steps:

1. [Build Integration](/razorpay-docs-md/payment-gateway/android-integration/custom/build-integration.md)
2. [Test Integration](/razorpay-docs-md/payment-gateway/android-integration/custom/test-integration.md)
3. [Go Live Checklist](/razorpay-docs-md/payment-gateway/android-integration/custom/go-live-checklist.md)

### Related Information

- [Troubleshooting and FAQs](/razorpay-docs-md/payment-gateway/android-integration/standard/troubleshooting-faqs.md)
- [Address Verification System](/razorpay-docs-md/international-payments/address-verification-system.md)
