<!-- Source: https://razorpay.com/docs/payments/smart-collect/third-party-validation -->

Third-party validation is a very important step in the Banking, Financial Services and Insurance sector. As per SEBI guidelines, businesses operating in these sectors must ensure that payments are accepted from the customers' registered, KYC-approved bank accounts only.

![Auto Third-Party-Validation](https://razorpay.com/docs/payments/smart-collect/build/browser/assets/images/smart-collect-tpv-process.jpg)

- Using Razorpay Smart Collect API, you can comply with the regulatory guidelines to ensure that the customers make payments only from their registered bank accounts (TPV).
- If payments are made from the unregistered accounts (non-TPV), they are automatically refunded to the customers.
- When you create a Customer Identifier, send the `allowed_payers` array with the customer's bank `account_number` and `ifsc`. This helps to identify TPV transactions and automatically refund non-TPV transactions.

Know more about [API Endpoints](/razorpay-docs-md/api/payments/smart-collect-tpv.md) and [the list of banks that support TPV](/razorpay-docs-md/third-party-validation/bank-list.md).

### Related Information

- [Razorpay Smart Collect](/razorpay-docs-md/smart-collect.md)
- [How Smart Collect Works](/razorpay-docs-md/smart-collect/how-it-works.md)
- [Customer Identifier States](/razorpay-docs-md/smart-collect/states.md)
- [Refund Failures](/razorpay-docs-md/smart-collect/refund-failures.md)
- [Smart Collect APIs](/razorpay-docs-md/api/payments/smart-collect.md)
- [Subscribe to Webhooks](/razorpay-docs-md/smart-collect/subscribe-to-webhooks.md)
