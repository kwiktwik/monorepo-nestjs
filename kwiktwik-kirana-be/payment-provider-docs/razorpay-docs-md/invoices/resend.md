<!-- Source: https://razorpay.com/docs/payments/invoices/resend -->

You can resend an invoice as a payment reminder or just in case the customer has not received the link.

## Resend an Invoice Using Dashboard

Watch this video to see how to resend an invoice to a customer.

1. Log in to the Dashboard. Click on **Invoices**.
2. Search for the **Draft** invoice that you want to resend using the [search criteria](/razorpay-docs-md/invoices/search.md)   .
3. Select the **Invoice Id**.
4. An invoice in `issued` status cannot be updated. However, you can change the **EXPIRY DATE**, **CUSTOMER NOTES** and **TERMS AND CONDITIONS**.
5. On the right-hand side panel, click **Resend Invoice**.

The invoice details along with the **Payment Link** is resent to the customer using which the customer can pay.

## Resend an Invoice Using API

You can resend `issued` invoices using [this](/razorpay-docs-md/api/payments/invoices.md#send-notifications/)

API.

### Related Information

- [Invoices](/razorpay-docs-md/invoices.md)
- [How Invoices Work](/razorpay-docs-md/invoices/how-it-works.md)
- [Invoices States](/razorpay-docs-md/invoices/states.md)
- [Create an Invoice](/razorpay-docs-md/invoices/create.md)
- [Search an Invoice](/razorpay-docs-md/invoices/search.md)
- [Update an Invoice](/razorpay-docs-md/invoices/update.md)
- [Duplicate an Invoice](/razorpay-docs-md/invoices/duplicate.md)
- [Delete an Invoice](/razorpay-docs-md/invoices/delete.md)
- [Cancel an Invoice](/razorpay-docs-md/invoices/cancel.md)
- [Download and Print an Invoice](/razorpay-docs-md/invoices/download-print.md)
- [Invoice APIs](/razorpay-docs-md/invoices/apis.md)
