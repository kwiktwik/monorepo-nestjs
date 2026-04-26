<!-- Source: https://razorpay.com/docs/payments/subscriptions/plugins/opencart/test-integration -->

After the integration is complete, Razorpay will appear as a payment option on your web page/app. You need to make a test transaction to ensure that the integration is working as expected. You can start accepting actual payments from your customers once the test is successful.

## Buy a Product on Subscription

To buy a product on Subscription:

1. Select the recurring options of the product for which the recurring option has been enabled.
2. Click **Add to Cart**.

   ![](https://razorpay.com/docs/payments/subscriptions/plugins/opencart/build/browser/assets/images/opencart-rzp-subs-plugin-18.jpg)
3. Select **Pay by Razorpay** as your payment method and click **Continue**.

   ![](https://razorpay.com/docs/payments/subscriptions/plugins/opencart/build/browser/assets/images/opencart-rzp-subs-plugin-payment.jpg)
4. Verify the details and click **Confirm Order**.

You can make test payments using one of the payment methods configured at the Checkout.

- No money is deducted from the customer's account as this is a simulated transaction.
- Ensure you have entered the API keys generated in the test mode in the Checkout code.

### Netbanking

You can select any of the listed banks. After choosing a bank, Razorpay will redirect to a mock page where you can make the payment a `success` or a `failure`. Since it is the test mode, we will not redirect you to the bank login portals.

### UPI

You can enter one of the following UPI IDs:

- `success@razorpay`: To make the payment successful.
- `failure@razorpay`: To fail the payment.

**Handy Tips**

You can use **Test Mode** to test UPI payments, and **Live Mode** for UPI Intent and QR payments.

### Wallet

You can select any of the listed wallets. After choosing a wallet, Razorpay will redirect to a mock page where you can make the payment a `success` or a `failure`. Since it is the test mode, we will not redirect you to the wallet login portals.

### Cards

You can use one of the test cards to make transactions in the test mode. Use any valid expiration date in the future and any random CVV to create a successful payment.

### Next Steps [Step 3: Go Live Checklist](/razorpay-docs-md/subscriptions/plugins/opencart/go-live-checklist.md)
