<!-- Source: https://razorpay.com/docs/payments/payment-methods/bharatqr/status -->

Once created, a QR code can be in the following states:

## Active

Upon creation, the QR code is said to be in an `active` state and can receive payments to the corresponding Virtual Account.

## Closed

The QR code will remain active until the underlying virtual account is [closed](/razorpay-docs-md/payment-methods/bharatqr/api.md). Once the virtual account is `closed`, all the payments made to the QR code after the closure will be automatically refunded.
