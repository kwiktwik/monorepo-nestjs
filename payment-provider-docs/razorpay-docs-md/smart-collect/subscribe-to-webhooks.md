<!-- Source: https://razorpay.com/docs/payments/smart-collect/subscribe-to-webhooks -->

Subscribe to webhook events relevant to Smart Collect.

To subscribe to webhook events:

1. Log in to the Dashboard.
2. Navigate to **Dashboard** → **Account & Settings** → **Webhooks** to subscribe to any of the events mentioned in the following section.

**Handy Tips**

- Ensure that you mitigate possible webhook failures.
- Ensure that you have subscribed to [Smart Collect Events](/docs/webhooks/smart-collect/#smart-collect)  .
- If the Customer Identifier is customer-specific, please pass `customer_id` while creating the Customer Identifier. Customer\_id will be reflected in webhooks as well for easy reconciliation.
- To uniquely identify the payment, store the `bank_reference` (unique reference number on the customer's bank statement) received in [webhooks](/docs/webhooks/smart-collect/#smart-collect)

  or the [Fetch API response](/razorpay-docs-md/api/payments/smart-collect.md#fetch-a-customer-identifier-by-id)  .

## Webhook Events and Descriptions

Know more about [Webhooks](/docs/webhooks/) and check the [sample payloads](/docs/webhooks/smart-collect/).

### Related Information

- [Razorpay Smart Collect](/razorpay-docs-md/smart-collect.md)
- [How Smart Collect Works](/razorpay-docs-md/smart-collect/how-it-works.md)
- [Customer Identifier States](/razorpay-docs-md/smart-collect/states.md)
- [Smart Collect Dashboard](/razorpay-docs-md/smart-collect.md)
- [Create Customer Identifiers](/razorpay-docs-md/smart-collect/create.md)
- [Close Customer Identifiers](/razorpay-docs-md/smart-collect/close.md)
- [Refund Payments](/razorpay-docs-md/smart-collect/refund.md)
- [Refund Failures](/razorpay-docs-md/smart-collect/refund-failures.md)
- [Search for a Customer Identifier](/razorpay-docs-md/smart-collect/search.md)
- [Make Test Payments](/razorpay-docs-md/smart-collect/test-payments.md)
- [Smart Collect APIs](/razorpay-docs-md/api/payments/smart-collect.md)
