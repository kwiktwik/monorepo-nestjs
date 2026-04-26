<!-- Source: https://razorpay.com/docs/payments/refunds/normal -->

You can issue Normal refunds to your customers which are processed within 7-10 working days.

**Customer Looking for Refund**

If you are a customer looking for a refund, know more about [customer refunds](/razorpay-docs-md/customers/customer-refunds.md).

## How Normal Refunds Work

When you make a Normal refund request to Razorpay, the information is sent to banking partners or other related stakeholders. Each of them have their own process for refund requests. After processing the refund request, the refund amount is sent to the customer's bank account or card balance.

Following is a typical flow for card refunds:

![Normal Refund Flow](https://razorpay.com/docs/payments/refunds/build/browser/assets/images/normal-refund-flow.jpg)

### Payment Methods

We support all payment methods for Normal refunds.

Refunds are sent back to the original payment method used in making the payment. For example, if a credit card was used to make the payment, the refund amount is pushed to the same credit card.

### Processing Time

When you send a Normal refund request to Razorpay, the information is sent to our banking partners. Depending on the bank's processing time, it can take 7-10 business days for the refunds to reflect in the customer's bank account or card balance.

The time taken to process a normal refund depends on the payment mode used while making the payment.

### Refund Fees

For Normal refunds, Razorpay does not charge any processing fee. However, the transaction fee and GST levied by Razorpay at the time of payment capture will not be reversed to your account (merchant's account).

## Dashboard and API Actions

You can perform the following actions:

- [Issue Normal refunds](/razorpay-docs-md/refunds/issue.md)
- [View Refunds](/razorpay-docs-md/refunds/view.md)
- [Handle refund errors](/razorpay-docs-md/refunds/errors.md)

### Related Information

- [Batch Refund](/razorpay-docs-md/refunds/batch.md)
- [Instant Refund](/razorpay-docs-md/refunds/instant.md)
- [Add funds to your account to process refunds (low account balance)](/razorpay-docs-md/dashboard/account-settings/balances.md#add-funds-to-your-current-balance)
- [Refunds API](/razorpay-docs-md/refunds/apis.md)
- [Subscribe to Webhooks](/razorpay-docs-md/refunds/subscribe-to-webhooks.md)
- [Refunds FAQs](/razorpay-docs-md/refunds/faqs.md)
