<!-- Source: https://razorpay.com/docs/api/orders -->

# Orders APIs

You can create [Orders](/razorpay-docs-md/orders.md) and link them to payments. Orders APIs are used to create, update and retrieve details of Orders. Also, you can retrieve details of payments made towards these Orders.

Fork the Razorpay Postman Public Workspace and try the Orders APIs using your [Test API Keys](/razorpay-docs-md/dashboard/account-settings/api-keys.md#generate-api-keys). [![Run in Postman](https://run.pstmn.io/button.svg)](https://www.postman.com/razorpaydev/workspace/razorpay-public-workspace/folder/12492020-91450029-1c52-4375-8033-39ca4c2d0a8c)

Related Guides: [About Orders](/razorpay-docs-md/orders.md) [Set Up Webhooks](/docs/webhooks/setup-edit-payments/) [Webhook Payloads](/docs/webhooks/orders/)

Endpoints

07 [Create an Order

POST

Creates an order by providing basic details such as amount and currency.](/razorpay-docs-md/api/orders/create.md) [Fetch All Orders

GET

Retrieves details of all the orders.](/razorpay-docs-md/api/orders/fetch-all.md) [Fetch All Orders (Example 1)

GET

Retrieves details of all the orders and expands the payments object.](/razorpay-docs-md/api/orders/fetch-all-expanded-payments.md) [Fetch All Orders (Example 2)

GET

Retrieves details of all the orders and expands cards parameter in the payments object.](/razorpay-docs-md/api/orders/fetch-all-expanded-card-payments.md) [Fetch Order With ID

GET

Retrieves details of a particular order.](/razorpay-docs-md/api/orders/fetch-with-id.md) [Fetch All Payments for an Order

GET

Retrieves all the payments made for an order.](/razorpay-docs-md/api/orders/fetch-payments.md) [Update an Order

PATCH

Modifies an existing order.](/razorpay-docs-md/api/orders/update.md)
