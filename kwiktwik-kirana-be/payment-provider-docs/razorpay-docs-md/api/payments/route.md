<!-- Source: https://razorpay.com/docs/api/payments/route -->

# Route

You should create a linked account to integrate Route and start transferring payments to vendors.

Below are the steps to integrate Route. You can also refer to our comprehensive [Route Integration guide](/razorpay-docs-md/route/integration-guide.md).

1. [Create a Linked Account](/razorpay-docs-md/api/payments/route/create-linked-account.md)
2. [Create a Stakeholder](/razorpay-docs-md/api/payments/route/create-stakeholder.md)
3. [Request a Product Configuration](/razorpay-docs-md/api/payments/route/request-product-config.md)
4. [Update a Product Configuration](/razorpay-docs-md/api/payments/route/update-product-config.md)
5. Transfer funds to Linked Accounts using [Orders](/razorpay-docs-md/api/payments/route/create-transfers-orders.md)   , [Payments](/razorpay-docs-md/api/payments/route/create-transfers-payments.md)

   or [Direct Transfer](/razorpay-docs-md/api/payments/route/direct-transfers.md)

   methods.

Fork the Razorpay Postman Public Workspace and try the Linked Account APIs using your [Test API Keys](/razorpay-docs-md/api/authentication.md#generate-api-keys). [![Run in Postman](https://run.pstmn.io/button.svg)](https://www.postman.com/razorpaydev/workspace/razorpay-public-workspace/folder/12492020-ee29e3a3-f06a-464c-b9f2-03a20e875591)

Related Guides: [About Linked Accounts](/razorpay-docs-md/route/linked-account.md) [About Route](/razorpay-docs-md/route.md) [Integrate With Route](/razorpay-docs-md/route/integration-guide.md)

Endpoints

22 [Create a Linked Account

POST

Creates a Linked Account.](/razorpay-docs-md/api/payments/route/create-linked-account.md) [Update a Linked Account

PATCH

Updates a Linked Account.](/razorpay-docs-md/api/payments/route/update-linked-accounts.md) [Fetch a Linked Account With ID

GET

Fetches a Linked Account using a unique identifier.](/razorpay-docs-md/api/payments/route/fetch-with-id.md) [Create a Stakeholder

POST

Creates a Stakeholder.](/razorpay-docs-md/api/payments/route/create-stakeholder.md) [Update a Stakeholder Account

PATCH

Updates a Stakeholder account.](/razorpay-docs-md/api/payments/route/update-stakeholder.md) [Request a Product Configuration

POST

Requests a product configuration.](/razorpay-docs-md/api/payments/route/request-product-config.md) [Update a Product Configuration

PATCH

Updates a product configuration.](/razorpay-docs-md/api/payments/route/update-product-config.md) [Fetch a Product Configuration

GET

Fetches a product configuration.](/razorpay-docs-md/api/payments/route/fetch-product-config.md) [Create Transfers from Orders

POST

Creates Transfers from orders.](/razorpay-docs-md/api/payments/route/create-transfers-orders.md) [Create Transfers from Payments

POST

Creates Transfers to Linked Accounts once the payments are captured.](/razorpay-docs-md/api/payments/route/create-transfers-payments.md) [Direct Transfers

POST

Transfers funds directly from your account balance to the Linked Accounts.](/razorpay-docs-md/api/payments/route/direct-transfers.md) [Create a Direct Transfer (Idempotent Request)

POST

Transfers funds directly from your account balance to the Linked Accounts.](/razorpay-docs-md/api/payments/route/direct-transfers-idempotent-request.md) [Fetch Transfers for a Payment

GET

Fetches transfers created for a specific payment.](/razorpay-docs-md/api/payments/route/fetch-transfers-payment.md) [Fetch Transfer for an Order

GET

Fetches transfers created for a specific order.](/razorpay-docs-md/api/payments/route/fetch-transfer-order.md) [Fetch a Transfer With ID

GET

Displays specific transfer details.](/razorpay-docs-md/api/payments/route/fetch-a-transfer.md) [Fetch Transfers for a Settlement

GET

Retrieves the collection of transfers created for a particular Settlement ID.](/razorpay-docs-md/api/payments/route/fetch-transfers-for-a-settlement.md) [Fetch Settlement Details

GET

Displays the details of settlements made to Linked Accounts.](/razorpay-docs-md/api/payments/route/fetch-settlement-details.md) [Fetch Payments of a Linked Account

GET

Displays all the payments received by a Linked Account.](/razorpay-docs-md/api/payments/route/fetch-payments-linked-account.md) [Refund Payments and Reverse Transfer from a Linked Account

POST

Initiates a payment refund to a customer.](/razorpay-docs-md/api/payments/route/refund-payments-and-reverse-transfer.md) [Reverse a Transfer

POST

Initiates a reversal of funds from the Linked Account to your account.](/razorpay-docs-md/api/payments/route/reverse-a-transfer.md) [Fetch Reversals for a Transfer

GET

Fetches reversals for a Transfer.](/razorpay-docs-md/api/payments/route/fetch-reversals.md) [Modify Settlement Hold for Transfers

PATCH

Modifies the settlement configuration for a particular transfer id.](/razorpay-docs-md/api/payments/route/modify-settlement-hold.md)
