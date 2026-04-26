<!-- Source: https://razorpay.com/docs/payments/payment-gateway/android-integration/custom/test-native-otp-integration -->

Integrate the [Native OTP](/razorpay-docs-md/payment-gateway/android-integration/custom/native-otp-integration.md) feature with Android custom checkout to avoid customer payment issues such as payment failures due to low internet speeds and bank page redirects.

After the integration is complete, you need to test the integration to ensure that it is working as expected. You can make a test transaction using the test cards, verify the payment status from the Dashboard, APIs or subscribe to related Webhook events to take appropriate actions at your end. After testing the integration in Test mode, you can start accepting actual payments from your customers.

## Test Payments

- No money is deducted from the customer's account as this is a test transaction.
- In the Checkout code, ensure that you have entered the API keys generated in the Test mode.

#### Test Cards

You can use any of the test cards to make transactions in the Test mode. Use any valid expiration date in the future and any random CVV to create a successful payment.

## Verify Payment Status

You can track the status of the payment from the Dashboard by subscribing to webhooks or polling our APIs.
Know more about how to [Verify Payment Status](/razorpay-docs-md/payment-gateway/android-integration/custom/build-integration.md#19-verify-payment-status).

## Accept Live Payments

After testing the flow of funds end-to-end in Test mode and confident that the integration is working as expected, switch to the Live mode and start accepting payments from customers.
Know more about how to [Accept Live Payments](/razorpay-docs-md/payment-gateway/android-integration/custom/go-live-checklist.md#accept-live-payments).
