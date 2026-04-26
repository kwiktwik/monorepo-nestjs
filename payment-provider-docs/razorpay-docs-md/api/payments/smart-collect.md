<!-- Source: https://razorpay.com/docs/api/payments/smart-collect -->

# Smart Collect

You can create Customer Identifiers using the Smart Collect APIs to accept large payments from your customers in the form of bank transfers via NEFT, RTGS and IMPS.

**Handy Tips**

- If you are a new customer, explore [Smart Collect 2.0](/razorpay-docs-md/api/payments/smart-collect-2.md)  . It uses the same APIs as **Smart Collect**, while also offering additional endpoints—such as creating a Customer Identifier with a VPA and bank account, fetching UPI payments, and adding a VPA Receiver to an existing Customer Identifier.
- You can also **Add an Allowed Payer** or **Delete an Allowed Payer** using [Smart Collect TPV](/razorpay-docs-md/api/payments/smart-collect-tpv.md)

  APIs.

Fork the Razorpay Postman Public Workspace and try the Smart Collect APIs using your [Test API Keys](/razorpay-docs-md/api/authentication.md#generate-api-keys). [![Run in Postman](https://run.pstmn.io/button.svg)](https://www.postman.com/razorpaydev/workspace/razorpay-public-workspace/folder/12492020-9fd01f11-0b59-4e97-a281-40f4b14277ec)

Related Guides: [About Smart Collect](/razorpay-docs-md/smart-collect.md) [Set Up Webhooks](/docs/webhooks/setup-edit-payments/) [Webhook Payloads](/docs/webhooks/smart-collect/)

Endpoints

11 [Create a Customer Identifier With Bank Account Receiver

POST

Creates a Customer Identifier with bank account receiver.](/razorpay-docs-md/api/payments/smart-collect/create-cust-id-bank-account.md) [Update a Customer Identifier

POST

Updates details of a Customer Identifier.](/razorpay-docs-md/api/payments/smart-collect/update.md) [Fetch a Customer Identifier Using ID

GET

Retrieves details of a Customer Identifier using id.](/razorpay-docs-md/api/payments/smart-collect/fetch-with-id.md) [Fetch All Customer Identifiers

GET

Retrieves details of all Customer Identifiers.](/razorpay-docs-md/api/payments/smart-collect/fetch-all.md) [Fetch Payments for a Customer Identifier

GET

Retrieves details of payments made against a particular Customer Identifier.](/razorpay-docs-md/api/payments/smart-collect/fetch-payments-cust-id.md) [Fetch Payments Made By Bank Transfer

GET

Retrieves details of a payment using bank transfer method.](/razorpay-docs-md/api/payments/smart-collect/fetch-payments-bank-transfer.md) [Fetch Payments Using UTR

GET

Retrieves details of a payment using bank transfer method via UTR.](/razorpay-docs-md/api/payments/smart-collect/fetch-payments-bank-transfer-utr.md) [Close a Customer Identifier

POST

Closes a Customer Identifier.](/razorpay-docs-md/api/payments/smart-collect/close.md) [Add VPA Receiver to existing Customer Identifier With Smart Collect 2.0

POST

Adds a VPA Receiver to an existing Customer Identifier With Smart Collect 2.0.](/razorpay-docs-md/api/payments/smart-collect-2/add-receiver-vpa.md) [Create Customer Identifier with VPA and Bank Account Receivers With Smart Collect 2.0

POST

Creates a Customer Identifier with VPA and Bank Account Receivers With Smart Collect 2.0.](/razorpay-docs-md/api/payments/smart-collect-2/create-cust-id-bank-account-vpa.md) [Fetch Payments Made Using UPI With Smart Collect 2.0

GET

Retrieves payments made using UPI With Smart Collect 2.0.](/razorpay-docs-md/api/payments/smart-collect-2/fetch-payments-upi.md)
