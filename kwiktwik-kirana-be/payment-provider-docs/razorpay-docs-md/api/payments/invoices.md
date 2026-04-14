<!-- Source: https://razorpay.com/docs/api/payments/invoices -->

# Invoices APIs

Copy for AI

View as Markdown

You can use [Razorpay Invoices](/razorpay-docs-md/invoices.md) to send invoices to your customers and accept payments instantly. The invoice contains information regarding the sale such as the name of the invoiced products or services, quantity, billing cycle, price breakup, receipt number and customer information.

You can create and manage Invoices using APIs or from the [Dashboard](/razorpay-docs-md/invoices/create.md#create-an-invoice-from-dashboard).

**Handy Tips**

You can only create non-GST Invoices via APIs. Non-GST invoices can be created in any of the [supported international currencies](/razorpay-docs-md/international-payments.md#supported-currencies). You cannot add tax rates for invoices created using international currencies.

Fork the Razorpay Postman Public Workspace and try the invoices APIs using your [Test API Keys](/razorpay-docs-md/api/authentication.md#generate-api-keys). [![Run in Postman](https://run.pstmn.io/button.svg)](https://www.postman.com/razorpaydev/workspace/razorpay-public-workspace/folder/12492020-6109230d-794c-4a01-b982-4d8479afee53)

Related Guides: [About Invoices](/razorpay-docs-md/invoices.md) [Set Up Webhooks](/docs/webhooks/setup-edit-payments/) [Webhook Payloads](/docs/webhooks/invoices/)

Endpoints

14 [Create an Invoice (Example 1)

POST

Creates an Invoice using a Customer id.](/razorpay-docs-md/api/payments/invoices/create-with-customer-id.md) [Create an Invoice (Example 2)

POST

Creates an Invoice using customer details such as name and billing details.](/razorpay-docs-md/api/payments/invoices/create-with-details.md) [Update an Invoice

PATCH

Updates an Invoice.](/razorpay-docs-md/api/payments/invoices/update.md) [Issue an Invoice

POST

Issues an Invoice.](/razorpay-docs-md/api/payments/invoices/issue.md) [Delete an Invoice

DELETE

Deletes an Invoice.](/razorpay-docs-md/api/payments/invoices/delete.md) [Cancel an Invoice

POST

Cancels an Invoice.](/razorpay-docs-md/api/payments/invoices/cancel.md) [Fetch an Invoice With ID

GET

Retrieves details of a particular Invoice using id.](/razorpay-docs-md/api/payments/invoices/fetch-with-id.md) [Fetch All Invoices

GET

Retrieves details of all Invoices.](/razorpay-docs-md/api/payments/invoices/fetch-all.md) [Send Notifications

POST

Sends notifications to customers.](/razorpay-docs-md/api/payments/invoices/resend.md) [Create an Item

POST

Creates an item by providing basic details such as name and amount.](/razorpay-docs-md/api/payments/invoices/create-item.md) [Fetch an Item With ID

GET

Retrieves details an item by id.](/razorpay-docs-md/api/payments/invoices/fetch-with-id-item.md) [Fetch All Items

GET

Retrieves details of multiple items.](/razorpay-docs-md/api/payments/invoices/fetch-all-items.md) [Update an Item

PATCH

Updates the details of an item.](/razorpay-docs-md/api/payments/invoices/update-item.md) [Delete an Item

DELETE

Deletes an item.](/razorpay-docs-md/api/payments/invoices/delete-item.md)
