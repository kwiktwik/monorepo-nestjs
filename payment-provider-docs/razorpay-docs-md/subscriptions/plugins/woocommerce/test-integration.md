<!-- Source: https://razorpay.com/docs/payments/subscriptions/plugins/woocommerce/test-integration -->

After the integration is complete, Razorpay will appear as a payment option on your web page/app. You need to click the button and make a test transaction to ensure that the integration is working as expected. You can start accepting actual payments from your customers once the test is successful.

![WooCommerce subscriptions plugin](https://razorpay.com/docs/payments/subscriptions/plugins/woocommerce/build/browser/assets/images/woocommerce-subscriptions-plugin.jpg)

You can make test payments using one of the payment methods configured at the Checkout.

- No money is deducted from the customer's account as this is a simulated transaction.
- Ensure you have entered the API keys generated in the test mode in the Checkout code.

## UPI

You can enter one of the following UPI IDs:

- `success@razorpay`: To make the payment successful.
- `failure@razorpay`: To fail the payment.

**Handy Tips**

You can use **Test Mode** to test UPI payments, and **Live Mode** for UPI Intent and QR payments.

## Cards

You can use one of the test cards to make transactions in the test mode. Use any valid expiration date in the future and any random CVV to create a successful payment.

### Next Steps [Step 3: Go Live Checklist](/razorpay-docs-md/subscriptions/plugins/woocommerce/go-live-checklist.md)
