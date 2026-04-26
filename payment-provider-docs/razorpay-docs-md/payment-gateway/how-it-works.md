<!-- Source: https://razorpay.com/docs/payments/payment-gateway/how-it-works -->

A Payment Gateway focuses on securing the sensitive information given by the user throughout the process. It ensures security by encrypting data like card and bank details provided by the user.

## Payment Gateway Workflow

Given below is a complete end-to-end flow about how you can use Razorpay Payment Gateway.

![Payment Gateway Flow](https://razorpay.com/docs/payments/payment-gateway/build/browser/assets/images/payment-flow-pg.jpg)

1. Customer Places an Order

A customer visits your website or app, selects items they want to purchase and clicks the pay button to place an order. For each order placed by your customer, you create a `transaction_id` or `checkout_id` on your server for your reference. For example, `#trn-345`.

2. Create Order from Server

For each order placed by your customer, use the [Razorpay Orders API](/razorpay-docs-md/api/orders.md) to create an order from your server.

3. Order ID Returned

Razorpay processes the details sent and returns an `order_id` to you, for example, `order_EKwxwAgItmmXdp`. Map this `order_id` to the transaction\_id `#trn-345` you created in the first step. Know more about [order states](/razorpay-docs-md/orders.md#order-states).

4. Pass Order ID to Checkout

Pass the `order_id` returned by Razorpay to your integration. This invokes the Razorpay Checkout, the client-side UI, which displays various payment methods.

5. Collect Payment Details

The customer selects a payment option to complete the payment. The payment details entered by the customer are secured and stored by Razorpay as tokens. The generated tokens are exchanged with your servers for further use.

6. Bank Authenticates the Payment

Razorpay sends an authentication request to the customer's bank internally. After authentication, Razorpay is authorised to deduct the amount from the customer's bank account.

For successful payments, the Checkout returns the `razorpay_order_id`, `razorpay_payment_id` and `razorpay_signature`.

Know more about [payment states](/razorpay-docs-md/payments.md#payment-life-cycle).

### Payment Capture and Settlement

Once your customer completes the payment and Razorpay authenticates it, you must capture it automatically or manually. You can also verify the payment signature to ensure that the payment is received from an authentic source. Know more about [payment capture settings](/razorpay-docs-md/payments/capture-settings.md).

After the payment is successfully captured, the amount is settled in your account according to your settlement cycle. Know more about [settlements](/razorpay-docs-md/settlements.md).

### Refunds

Customers may claim [refunds](/razorpay-docs-md/refunds.md) after the transaction. In such cases, you can initiate a refund, post which the funds are sent back to the customer's account.

## Test Cards

Use the [test cards](/razorpay-docs-md/payments/test-card-details.md) to test domestic payments, international payments and subscriptions.

### Test Razorpay Checkout

Test the Checkout by clicking the **PAY WITH RAZORPAY** button.

- This initiates a ₹1 payment.
- Provide your phone number, email address, select your preferred payment method and complete the payment.

Pay with Razorpay

**Live Transaction with Auto Refund**

This is a real transaction and money will be deducted from your account. However, the amount debited will be auto-refunded to your account in 5-7 working days.

## Next Step [Get started with Razorpay Payment Gateway integration.](/razorpay-docs-md/payment-gateway.md)

### Related Information

- [Payment Gateway](/razorpay-docs-md/payment-gateway.md)
- [Payment Methods](/razorpay-docs-md/payment-methods.md)
- [Features](/razorpay-docs-md/payment-gateway/features.md)

- [Set up your Razorpay account](/razorpay-docs-md/set-up.md#1-sign-up)
- [List of required KYC documents](/razorpay-docs-md/business-types-kyc-documents.md)
