<!-- Source: https://razorpay.com/docs/payments/international-payments/accept-international-payments-from-indian-customers/standard-integration/test-integration -->

This guide helps you understand how to test the integration using Razorpay. It outlines what features are supported in Test (sandbox) vs Live environments and how to simulate various scenarios effectively.

You can make test payments using one of the payment methods configured at the Checkout.

- No money is deducted from the customer's account as this is a simulated transaction.
- Ensure you have entered the API Keys generated in the Test Mode in the Checkout code.

## Supported Payment Methods

Netbanking

You can select any of the listed banks. After choosing a bank, Razorpay will redirect to a mock page where you can make the payment `success` or a `failure`. Since this is Test Mode, we will not redirect you to the bank login portals.

UPI

You can enter one of the following UPI IDs:

- `success@razorpay`: To make the payment successful.
- `failure@razorpay`: To fail the payment.

**Handy Tips**

You can use **Test Mode** to test UPI payments, and **Live Mode** for UPI Intent and QR payments.

Cards

You can use one of the test cards to make transactions in the Test Mode. Use any valid expiration date in the future and any random CVV to create a successful payment.

Card BIN Information

Currently, we do not have dummy card details for all card networks. However, you can refer to the BIN (Bank Identification Number) information below to simulate different card types:

## What You Can Test in Sandbox Mode

The following features are supported in Test Mode using test cards, UPI ids, and mock data:

Features supported in test mode

You can also test webhook events using failure VPAs like `failure@razorpay` to simulate failure scenarios.

## What You Cannot Test in Sandbox Mode

Some features require real payment instruments, user authentication, or live customer flows, and thus cannot be tested in Test Mode:

Features not supported in test mode

## Testing Charge at Will (CAW) Flows

In Test Mode

In Live Mode

- You can simulate token creation and charge requests.
- Mandate registration and authentication are mocked.
- No real customer authentication (3DS, OTP) is involved.

## Minimum Transaction Amounts (Live Environment)

To ensure successful transaction processing in the Live environment, please refer to the following minimum amount requirements per payment method:

## Next Steps [Step 3: Go Live Checklist](/razorpay-docs-md/international-payments/accept-international-payments-from-indian-customers/standard-integration/go-live-checklist.md)
