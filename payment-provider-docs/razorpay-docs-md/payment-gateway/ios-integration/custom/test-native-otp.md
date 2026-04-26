<!-- Source: https://razorpay.com/docs/payments/payment-gateway/ios-integration/custom/test-native-otp -->

Integrate the [Razorpay Native OTP](/razorpay-docs-md/payment-gateway/ios-integration/custom/native-otp.md) feature with iOS custom checkout to avoid customer payment issues such as payment failures due to low internet speeds and bank page redirects.
After the integration is complete, you need to test the integration to ensure that it is working as expected. You can make a test transaction using the test cards, verify the payment status from the Dashboard, APIs or subscribe to related Webhook events to take appropriate actions at your end. After testing the integration in test mode, you can start accepting actual payments from your customers.

## Test Payments

- No money is deducted from the customer's account as this is a test transaction.
- In the Checkout code, ensure that you have entered the API keys generated in the Test Mode.

#### Test Cards

You can use any of the test cards to make transactions in the Test Mode. Use any valid expiration date in the future and any random CVV to create a successful payment.

## Verify Payment Status

You can track the status of the payment from the Dashboard by subscribing to webhooks or polling our APIs.
Know [how to verify payment status](/razorpay-docs-md/payment-gateway/ios-integration/custom/build-integration.md#110-verify-payment-status).

## Accept Live Payments

After testing the flow of funds end-to-end in test mode and confident that the integration is working as expected, switch to the Live Mode and start accepting payments from customers.
Know more about how to [Accept Live Payments](/razorpay-docs-md/payment-gateway/ios-integration/custom/go-live-checklist.md#accept-live-payments).
