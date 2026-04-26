<!-- Source: https://razorpay.com/docs/payments/international-payments/outward-remittances/custom-integration/test-integration -->

You can make test payments using one of the payment methods configured at the Checkout.

- No money is deducted from the customer's account as this is a simulated transaction.
- Ensure you have entered the API Keys generated in the Test Mode in the Checkout code.

## Netbanking

You can select any of the listed banks. After choosing a bank, Razorpay will redirect to a mock page where you can make the payment `success` or a `failure`. Since this is Test Mode, we will not redirect you to the bank login portals.

## UPI

You can enter one of the following UPI IDs:

- `success@razorpay`: To make the payment successful.
- `failure@razorpay`: To fail the payment.

**Handy Tips**

You can use **Test Mode** to test UPI payments, and **Live Mode** for UPI Intent and QR payments.

## Wallet

You can select any of the listed wallets. After choosing a wallet, Razorpay will redirect to a mock page where you can make the payment `success` or a `failure`. Since this is Test Mode, we will not redirect you to the wallet login portals.

## Cards

You can use one of the test cards to make transactions in the Test Mode. Use any valid expiration date in the future and any random CVV to create a successful payment.

## Next Steps [Step 3: Go-Live Checklist](/razorpay-docs-md/international-payments/outward-remittances/custom-integration/go-live-checklist.md)
