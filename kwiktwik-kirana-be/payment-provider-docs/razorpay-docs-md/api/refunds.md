<!-- Source: https://razorpay.com/docs/api/refunds -->

# Refunds APIs

Make full or partial refunds to customers. You can initiate refunds only on those payments that are in `captured` state. A payment in `authorized` state is auto-refunded if not `captured` within 3 days of creation. You can create and manage refunds using APIs or from the [Dashboard](/razorpay-docs-md/refunds.md#dashboard-actions).

Fork the Razorpay Postman Public Workspace and try the Refunds APIs using your [Test API Keys](/razorpay-docs-md/api/authentication.md#generate-api-keys). [![Run in Postman](https://run.pstmn.io/button.svg)](https://www.postman.com/razorpaydev/workspace/razorpay-public-workspace/folder/12492020-49fdb1f6-7e7d-426c-b7b4-3dd468d8565e)

Related Guides: [About Refunds](/razorpay-docs-md/refunds.md) [Set Up Webhooks](/docs/webhooks/setup-edit-payments/) [Sample Payloads](/docs/webhooks/refunds/)

Endpoints

09 [Create a Normal Refund

POST

Creates a normal refund for a payment.](/razorpay-docs-md/api/refunds/create-normal.md) [Create a Normal Refund (Idempotent Request)

POST

Retry or send the same normal refund request multiple times safely by creating a normal refund idempotency request.](/razorpay-docs-md/api/refunds/normal-refunds-idempotent.md) [Create an Instant Refund

POST

Creates an instant refund for a payment.](/razorpay-docs-md/api/refunds/create-instant.md) [Create an Instant Refund (Idempotent Request)

POST

Retry or send the same instant refund request multiple times safely by creating an instant refund idempotency request.](/razorpay-docs-md/api/refunds/instant-refunds-idempotent.md) [Fetch Multiple Refunds for a Payment

GET

Retrieves multiple refunds for a payment.](/razorpay-docs-md/api/refunds/fetch-multiple-refund-payment.md) [Fetch a Specific Refund for a Payment

GET

Retrieves details of a specific refund made for a payment.](/razorpay-docs-md/api/refunds/fetch-specific-refund-payment.md) [Fetch All Refunds

GET

Retrieves details of all refunds.](/razorpay-docs-md/api/refunds/fetch-all.md) [Fetch Refund With ID

GET

Retrieves the refund using the id.](/razorpay-docs-md/api/refunds/fetch-with-id.md) [Update a Refund

PATCH

Updates the `notes` parameter for a refund.](/razorpay-docs-md/api/refunds/update.md)
