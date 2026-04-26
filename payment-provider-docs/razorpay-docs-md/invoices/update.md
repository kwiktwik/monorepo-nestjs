<!-- Source: https://razorpay.com/docs/payments/invoices/update -->

You can only update a `draft` invoice. Know more about [invoice states](/razorpay-docs-md/invoices/states.md).

## Update an Invoice From Dashboard

Watch this video to see how to update an invoice.

To update an invoice:

1. Log in to the Dashboard.
2. Click on **Invoices**.
3. Search for the **Draft** invoice that you want to update using the [search criteria](/razorpay-docs-md/invoices/search.md)   .
4. Select the **Invoice Id**.
5. The following information can be edited:
   - Customer details
   - Description
   - Expiry date of the invoice
   - Notes
   - Billing Address
   - Shipping Address
   - Partial payments
   - Label
6. Click **Save Invoice**.

**Watch Out!**

When an item's attributes are modified at the time of invoice creation, the modified item cannot be reused. The item will then be referred as a **Line item**. In other words, a **Line Item** is created when an **Item** is used as a template, in order to customise its attributes.

The invoice now displays the updated details.

## Update an Invoice Using API

You can update a `draft` invoice using [this](/razorpay-docs-md/api/payments/invoices.md#update-an-invoice)

API.

### Related Information

- [Invoices](/razorpay-docs-md/invoices.md)
- [Invoices States](/razorpay-docs-md/invoices/states.md)
- [How Invoices Work](/razorpay-docs-md/invoices/how-it-works.md)
- [Create an Invoice](/razorpay-docs-md/invoices/create.md)
- [Issue an Invoice](/razorpay-docs-md/invoices/issue.md)
- [Search an Invoice](/razorpay-docs-md/invoices/search.md)
- [Duplicate an Invoice](/razorpay-docs-md/invoices/duplicate.md)
- [Delete an Invoice](/razorpay-docs-md/invoices/delete.md)
- [Cancel an Invoice](/razorpay-docs-md/invoices/cancel.md)
- [Invoice APIs](/razorpay-docs-md/invoices/apis.md)
- [Download and Print an Invoice](/razorpay-docs-md/invoices/download-print.md)
