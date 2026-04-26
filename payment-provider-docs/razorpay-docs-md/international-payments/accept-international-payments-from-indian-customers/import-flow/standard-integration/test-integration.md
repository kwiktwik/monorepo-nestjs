<!-- Source: https://razorpay.com/docs/payments/international-payments/accept-international-payments-from-indian-customers/import-flow/standard-integration/test-integration -->

After the integration is complete, a **Pay** button appears on your webpage/app.

![Test integration on your webpage/app](https://razorpay.com/docs/payments/international-payments/accept-international-payments-from-indian-customers/import-flow/standard-integration/build/browser/assets/images/test-int.gif)

Click the button and make a test transaction to ensure the integration is working as expected. You can start accepting actual payments from your customers once the test transaction is successful.

You can make test payments using one of the payment methods configured at the Checkout.

**Watch Out!**

This is a mock payment page that uses your test API keys, test card and payment details.

- Ensure you have entered only your [Test Mode API keys](/razorpay-docs-md/dashboard/account-settings/api-keys.md#generate-api-keys)

  in the Checkout code.
- Test mode features a mock bank page with **Success** and **Failure** buttons to replicate the live payment experience.
- No real money is deducted due to the usage of test API keys. This is a simulated transaction.

Supported Payment Methods

Following are all the payment modes that the customer can use to complete the payment on the Checkout. Some of them are available by default, while others require approval from us. Raise a request from the Dashboard to enable such payment methods.

#### Netbanking

You can select any of the listed banks. After choosing a bank, Razorpay will redirect to a mock page where you can make the payment `success` or a `failure`. Since this is Test Mode, we will not redirect you to the bank login portals.

Check the list of [supported banks](/razorpay-docs-md/payment-methods/netbanking.md#supported-banks).

#### UPI

You can enter one of the following UPI IDs:

- `success@razorpay`: To make the payment successful.
- `failure@razorpay`: To fail the payment.

Check the following lists:

- [Supported UPI Flows](/razorpay-docs-md/payment-methods/upi.md)

  .
- [UPI Error Codes](/docs/errors/payments/upi/)

  .

**Handy Tips**

You can use **Test Mode** to test UPI payments, and **Live Mode** for UPI Intent and QR payments.

#### Cards

You can use one of the following test cards to test transactions for your integration in Test Mode.

Check the following lists:

- [Supported Card Networks](/razorpay-docs-md/payment-methods/cards.md)

  .
- [Cards Error Codes](/docs/errors/payments/cards/)

  .
- [Test Error Scenarios](/razorpay-docs-md/payments/test-card-details.md#error-scenario-test-cards)

  .

## Next Steps [Step 3: Go Live Checklist](/razorpay-docs-md/international-payments/accept-international-payments-from-indian-customers/import-flow/standard-integration/go-live-checklist.md)
