<!-- Source: https://razorpay.com/docs/payments/smart-collect/how-it-works -->

The following steps explain how Smart Collect uses Customer Identifiers to receive payments from the customers:

![How Smart Collect Works](https://razorpay.com/docs/payments/smart-collect/build/browser/assets/images/smart-collect-sc_workflow.jpg)

1. Set up your [Razorpay account](/razorpay-docs-md/set-up.md)   .
2. Create Customer Identifiers tagged to the customer.
3. The account details of the Customer Identifier created by Razorpay (such as account number, IFSC and Name) should be shared with the customer.
4. The customer adds the bank account as a beneficiary on their preferred netbanking portal and transfers the money using NEFT, RTGS or IMPS.
5. Payment deposited in these customer identifiers is settled into your bank account linked with Razorpay.

**Payment Confirmation**

You can consider a payment to be successful only when you receive the notification from Razorpay. You can [check the payment status on the Dashboard](/razorpay-docs-md/smart-collect/create.md#view-payments). Also, you can choose to configure [webhooks](/razorpay-docs-md/smart-collect/subscribe-to-webhooks.md) and subscribe to the `virtual_account.credited` event to receive notifications when customers make payments.

## Customer Identifier Format

You can create a unique Customer Identifier using Smart Collect to receive payments from your customers. The Customer Identifier consists of 16 digits.

copy

```
Bank Account Number: 1112220040042526
```

Know more about [Customer Identifier States](/razorpay-docs-md/smart-collect/states.md).

### Related Information

- [Smart Collect](/razorpay-docs-md/smart-collect.md)
- [Auto Third Party Validation (TPV) on Smart Collect](/razorpay-docs-md/smart-collect/third-party-validation.md)
- [Smart Collect APIs](/razorpay-docs-md/api/payments/smart-collect.md)
- [Subscribe to Webhooks](/razorpay-docs-md/smart-collect/subscribe-to-webhooks.md)
