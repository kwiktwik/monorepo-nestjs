<!-- Source: https://razorpay.com/docs/api/payments -->

# Payments APIs

Copy for AI

View as Markdown

Payments APIs are used to capture and fetch payments. You can also fetch payments based on orders and card details of payment.

**Handy Tips**

You can use Payments API only to retrieve payment details or change the status from `authorized` to `captured` and **not** to collect payments. You can use our [products](/razorpay-docs-md/index.md) to accept payments.

Fork the Razorpay Postman Public Workspace and try the Payments APIs using your [Test API Keys](/razorpay-docs-md/dashboard/account-settings/api-keys.md#generate-api-keys). [![Run in Postman](https://run.pstmn.io/button.svg)](https://www.postman.com/razorpaydev/workspace/razorpay-public-workspace/folder/12492020-11b2db21-9019-4814-9669-c70305b8fd6e)

Related Guides: [About Payments](/razorpay-docs-md/index.md) [Set Up Webhooks](/docs/webhooks/setup-edit-payments/) [Sample Payloads](/docs/webhooks/payments/)

Endpoints

11 [Capture a Payment

POST

Captures a payment.](/razorpay-docs-md/api/payments/capture.md) [Fetch a Payment With ID

GET

Retrieves details of a specific payment using id.](/razorpay-docs-md/api/payments/fetch-with-id.md) [Fetch a Payment With ID (Example 1)

GET

Retrieves details of all the payments that is created, with the `card` parameter.](/razorpay-docs-md/api/payments/fetch-payment-expanded-card.md) [Fetch a Payment With ID (Example 2)

GET

Retrieves details of all the payments that is created, with the `emi` parameter.](/razorpay-docs-md/api/payments/fetch-payment-expanded-emi.md) [Fetch a Payment With ID (Example 3)

GET

Retrieves details of all the payments that is created, with the `offers` parameter.](/razorpay-docs-md/api/payments/fetch-payment-expanded-offers.md) [Fetch All Payments

GET

Retrieves details of all payments.](/razorpay-docs-md/api/payments/fetch-all-payments.md) [Fetch All Payments (Example 1)

GET

Retrieves expanded card details of a payment.](/razorpay-docs-md/api/payments/fetch-all-payments-with-expanded-card-details.md) [Fetch All Payments (Example 2)

GET

Retrieves expanded EMI details of a payment.](/razorpay-docs-md/api/payments/fetch-all-payments-with-expanded-emi-details.md) [Fetch Payments Based on Orders

GET

Retrieves payments linked to an Order.](/razorpay-docs-md/api/payments/fetch-payments-orders.md) [Fetch Card Details of a Payment

GET

Retrieves card details of a payment.](/razorpay-docs-md/api/payments/fetch-card-details-payment.md) [Update a Payment

PATCH

Edits an existing payment.](/razorpay-docs-md/api/payments/update.md)
