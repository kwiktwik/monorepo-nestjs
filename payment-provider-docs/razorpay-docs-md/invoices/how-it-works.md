<!-- Source: https://razorpay.com/docs/payments/invoices/how-it-works -->

Given below is a complete end-to-end flow about how you can use Razorpay Invoices.

![Invoices Flow](https://razorpay.com/docs/payments/invoices/build/browser/assets/images/invoices-invoices-flow-chart.jpg)

### Step 1: Create an Invoice [Create an invoice](/razorpay-docs-md/invoices/create.md) by providing all the required details. You can set an expiry date and enable partial payments.

Save the invoice. The invoice is in `draft` status. Know more about [invoice states](/razorpay-docs-md/invoices/states.md).

**Handy Tips**

- You can [update](/razorpay-docs-md/invoices/update.md)  , [delete](/razorpay-docs-md/invoices/delete.md)  , or [create a duplicate](/razorpay-docs-md/invoices/duplicate.md)

  of an invoice in `draft` status.
- **Invoice APIs**:
  - [Create an invoice](/razorpay-docs-md/api/payments/invoices.md#create-an-invoice)
  - [Update an invoice](/razorpay-docs-md/api/payments/invoices.md#update-an-invoice)
  - [Delete an invoice](/razorpay-docs-md/api/payments/invoices.md#delete-an-invoice)

### Step 2: Issue an Invoice [Issue an invoice](/razorpay-docs-md/invoices/issue.md) to a customer via email and/or sms.
The customer receives a notification by email or sms with a payment link using which the customer can pay using one of the available [payment methods](/razorpay-docs-md/invoices.md#list-of-supported-payment-methods).

**Handy Tips**

Use the [Issue an Invoice API](/razorpay-docs-md/api/payments/invoices.md#issue-an-invoice).

### Step 3: Receive Payments

Customer clicks the payment link and tries to make the payment.

- If [partial payments](/razorpay-docs-md/payment-links/partial-payments.md)

  payments was enabled, the customer chooses the amount to be paid.
- The customer chooses the mode of payment: Pay Online or Pay via Bank Transfer

Customer makes a successful payment. The invoice is marked as `paid` or `partially paid`. You receive a notification about the payment.

**Handy Tips**

After the payment is captured, the amount is settled to your account as per the settlement schedule. Know more about [payments](/razorpay-docs-md/payments.md), [settlements](/razorpay-docs-md/settlements.md), [refunds](/razorpay-docs-md/refunds.md) and [disputes](/razorpay-docs-md/disputes.md).

### Step 4: Track Invoices and Reports

- Notifications

  You receive notifications regarding activity on invoices via SMS, emails and webhook. Know more about [subscribing to Webhooks](/razorpay-docs-md/invoices/subscribe-to-webhooks.md)  .
- Track Payments

  Track payments made against the issued invoices on Dashboard. Click **Invoices** from the left menu. All the invoices are listed with their status under **Invoices**.
- Reports

  Detailed insights can be gained using reports and real-time data on the Dashboard. These reports can then be used for accounting and reconciliation purposes. Know more about [reports](/razorpay-docs-md/dashboard/reports.md)  .

### Related Information

- [Invoices](/razorpay-docs-md/invoices.md)
- [Invoices States](/razorpay-docs-md/invoices/states.md)
- [Create an Invoice](/razorpay-docs-md/invoices/create.md)
- [Issue an Invoice](/razorpay-docs-md/invoices/issue.md)
- [Search an Invoice](/razorpay-docs-md/invoices/search.md)
- [Update an Invoice](/razorpay-docs-md/invoices/update.md)
- [Duplicate an Invoice](/razorpay-docs-md/invoices/duplicate.md)
- [Delete an Invoice](/razorpay-docs-md/invoices/delete.md)
- [Cancel an Invoice](/razorpay-docs-md/invoices/cancel.md)
- [Download and Print an Invoice](/razorpay-docs-md/invoices/download-print.md)
- [Subscribe to Webhooks](/razorpay-docs-md/invoices/subscribe-to-webhooks.md)
- [Invoice APIs](/razorpay-docs-md/invoices/apis.md)
