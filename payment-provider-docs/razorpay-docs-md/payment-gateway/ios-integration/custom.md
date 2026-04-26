<!-- Source: https://razorpay.com/docs/payments/payment-gateway/ios-integration/custom -->

With Razorpay iOS Custom SDK, you can customise the Razorpay Checkout UI.
Customise the look and feel such as colours and themes of your app's Checkout form.

- Validate customer inputs such as card number, expiry date and others using the [Luhn check algorithm](https://en.wikipedia.org/wiki/Luhn_algorithm)  .
- Configure and integrate the payment methods on the Checkout form.

**Watch Out!**

- [Razorpay iOS Standard SDK](/razorpay-docs-md/payment-gateway/ios-integration/standard.md)

  supports all payment methods by default. We recommend you integrate with the Razorpay iOS Standard SDK. If you integrate with Custom Checkout SDK, you will need to integrate these manually.
- This framework only supports iOS version **10.0 and above**.

## List of Razorpay iOS Custom SDK Versions (Last 5 versions)

**Update SDK**

Check your [current SDK version](/razorpay-docs-md/payment-gateway/ios-integration/custom/troubleshooting-faqs.md#10-how-can-i-check-the-razorpay-ios). If it is outdated, please [update the SDK](/razorpay-docs-md/payment-gateway/ios-integration/custom/troubleshooting-faqs.md#11-how-can-i-update-the-razorpay-ios) to ensure uninterrupted settlements of your funds.

## Prerequisites

- Create a [Razorpay account](https://dashboard.razorpay.com/signup)  .
- Generate the [API Keys](/razorpay-docs-md/api/authentication.md#generate-api-keys)

  from the Dashboard. To go live with the integration and start accepting real payments, generate Live Mode API Keys and replace them in the integration.
- Know about the [Razorpay Payment Flow](/razorpay-docs-md/payment-gateway/how-it-works.md)  .

## Integration Steps

Follow these integration steps:

1. [Build Integration](/razorpay-docs-md/payment-gateway/ios-integration/custom/build-integration.md)
2. [Test Integration](/razorpay-docs-md/payment-gateway/ios-integration/custom/test-integration.md)
3. [Go-Live Checklist](/razorpay-docs-md/payment-gateway/ios-integration/custom/go-live-checklist.md)

### Related Information

- [Troubleshooting and FAQs](/razorpay-docs-md/payment-gateway/ios-integration/custom/troubleshooting-faqs.md)
- [Address Verification System](/razorpay-docs-md/international-payments/address-verification-system.md)
