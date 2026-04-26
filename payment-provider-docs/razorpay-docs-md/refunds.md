<!-- Source: https://razorpay.com/docs/payments/refunds -->

There could be situations when customers request a refund of the payments made for the products or services purchased or availed on your website or app.

**Customer Looking for Refund**

If you are a customer looking for a refund, know about [customer refunds](/razorpay-docs-md/customers/customer-refunds.md).

## Refund Types

Following are the various types of refunds that you can use to refund payments to your customers:

- [Normal Refund](/razorpay-docs-md/refunds/normal.md)

  Amount is refunded within 5-7 working days.
- [Instant Refund](/razorpay-docs-md/refunds/instant.md)

  Amount is refunded almost immediately.
   By issuing instant refunds to your customers, you can provide a better user experience for them. This also helps in improving their reliability and trust in your business.
- [Batch Refund](/razorpay-docs-md/refunds/batch.md)

  Issue refunds in bulk using an XLSX or CSV file. Once you upload a file, it is picked up for processing after 70 minutes. You can cancel a batch upload in the 70 minutes before it is picked up for processing.

## Dashboard Actions

You can perform the following actions on refunds from the Dashboard:

- [View Refunds](/razorpay-docs-md/refunds/view.md)
- [Issue Refunds](/razorpay-docs-md/refunds/issue.md)
- [View Settlement Details of a Refund](/razorpay-docs-md/refunds/view.md#view-settlement-details-of-a-refund)
- [Subscribe to Webhook Events](/razorpay-docs-md/refunds/subscribe-to-webhooks.md)

## Refund States

Following are the various states of a refund:

**Watch Out!**

Usually, Razorpay moves a refund to the `processed` state before receiving the ARN/RRN number from the Gateway. You can ensure that a refund moves to the `processed` state only after receiving confirmation from the Gateway by activating this feature on your account by raising a [support request](https://razorpay.com/support/#request).

## Handle Refund Chargeback

For the prevention of chargebacks, Razorpay only does **source refunds**. It means that money is refunded to the payment method that the customer used to make the payment. For example, if a credit card was used to make the payment, the refund is pushed to the same credit card. Similarly, in the case of UPI payments, the refund is pushed to the VPA used while making the payment.

If a chargeback is received for an instantly refunded payment, the processed refund will have a **UTR (Unique Transfer Reference)** in the callback. This UTR appears against the **ARN (Application Reference Number)** parameter in the Refund entity. The UTR serves as a proof of refund completed between you and Razorpay.

Additionally, Razorpay passes the **RRN (Razorpay Reference Number)** of the payment in the Fund Transfer Request sent for the refund. This ties the instant refund back to the parent payment, thereby, serving as a proof of the refund. This data can also be used as a defense against a future chargeback or arbitration case.

## Reports

Detailed insights can be gained using reports and real-time data on the Dashboard. These reports can then be used for accounting and reconciliation purposes. Know more about [reports](/razorpay-docs-md/dashboard/reports.md).

Understand [how the Refund process works](/razorpay-docs-md/refunds/normal.md#how-normal-refunds-work).

### Related Information

- [EMI and Pay Later Refunds](/razorpay-docs-md/refunds/emi-pay-later.md)
- [Add funds to your account to process refunds (low account balance)](/razorpay-docs-md/dashboard/account-settings/balances.md#add-funds-to-your-current-balance)
- [Handle refund errors](/razorpay-docs-md/refunds/errors.md)
- [Refunds API](/razorpay-docs-md/refunds/apis.md)
- [Refund Communication](/razorpay-docs-md/refunds/communication.md)
- [Refunds FAQs](/razorpay-docs-md/refunds/faqs.md)
