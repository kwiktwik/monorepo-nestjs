<!-- Source: https://razorpay.com/docs/payments/payment-gateway/flutter-integration/custom/payment-methods/turbo-upi -->

Use Razorpay Turbo UPI to make UPI payments faster. Following are the sample screens while making payments using Turbo UPI.

![Razorpay Turbo UPI Payment Flow](https://razorpay.com/docs/payments/payment-gateway/flutter-integration/custom/payment-methods/build/browser/assets/images/upi-turbo-in-app-transaction-flow.jpg)

**Watch Out!**

Currently, Flutter SDK is supported only for Android.

## Advantages

For Customers

For Businesses

- Simplified payment process with just two steps.
- Higher success rate.
- One stop for refunds and disputes.

**Watch Out!**

Due to the sensitive nature of the added libraries, we must ensure that the app is running in a proper environment. Therefore, after integration, the app will not run on Android emulators.

**Watch Out!**

- Use the `rzp_test_0wFRWIZnH65uny` merchant key for testing on the UAT environment and the [Razorpay live keys](/razorpay-docs-md/api/authentication.md#live-mode-api-keys)

  for prod testing.
- As a compliance requirement, you need to get approval from Google for **READ\_SMS** permission. Refer [to this link](https://support.google.com/googleplay/android-developer/answer/10208820?hl=en)

  for more details.

## Customer Onboarding

Your customers can link their bank accounts to your app with these steps:

1. The customer navigates to your app's checkout screen and taps **Add bank account**.

   ![Turbo UPI Add Bank Account](https://razorpay.com/docs/payments/payment-gateway/flutter-integration/custom/payment-methods/build/browser/assets/images/upi-turbo-custom-add-bank-account.jpg)

   **Handy Tips**

   The customer needs to give **allow SMS permission** so that we can validate the phone number with the bank.

   ![Turbo UPI SMS Verification](https://razorpay.com/docs/payments/payment-gateway/flutter-integration/custom/payment-methods/build/browser/assets/images/upi-turbo-custom-sms-verification.jpg)
2. The customer's bank details are fetched and linked to the bank account.

   ![Turbo UPI Fetch Bank Account](https://razorpay.com/docs/payments/payment-gateway/flutter-integration/custom/payment-methods/build/browser/assets/images/upi-turbo-custom-fetch-account.jpg)
3. The customer selects a bank from the list of banks. The top 8 banks are displayed for easier selection.

   ![Turbo UPI Select Bank Account](https://razorpay.com/docs/payments/payment-gateway/flutter-integration/custom/payment-methods/build/browser/assets/images/upi-turbo-custom-select-bank-account.jpg)

**Handy Tips**

If no UPI PIN is set, the customers are prompted to provide their card details, enter an OTP and complete the setup.

![Turbo UPI Enter Card Details](https://razorpay.com/docs/payments/payment-gateway/flutter-integration/custom/payment-methods/build/browser/assets/images/upi-turbo-custom-card-details.jpg)

This completes the onboarding.

## Transaction Flow

After the customer is onboarded, on the checkout page of your app:

1. The customer selects the linked bank account.

   ![Razorpay Turbo UPI Payment Flow](https://razorpay.com/docs/payments/payment-gateway/flutter-integration/custom/payment-methods/build/browser/assets/images/upi-turbo-linked-bank.jpg)
2. The customer enters the UPI PIN to complete the payment.

   ![Turbo UPI Payment Successful](https://razorpay.com/docs/payments/payment-gateway/flutter-integration/custom/payment-methods/build/browser/assets/images/upi-turbo-custom-enter-pin.jpg)

### Related Information

- [Turbo UPI Headless](/razorpay-docs-md/payment-gateway/flutter-integration/custom/payment-methods/turbo-upi/integration-noui.md)
