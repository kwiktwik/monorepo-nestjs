<!-- Source: https://razorpay.com/docs/api/payments/smart-collect-tpv -->

# Smart Collect TPV

You can create Customer Identifiers using the **Smart Collect** APIs to accept large payments from your customers in the form of bank transfers via NEFT, RTGS and IMPS. In addition, you can also add an Allowed Payer or delete an Allowed payer using **Smart Collect TPV** APIs.

**Handy Tips**

If you are a new customer, explore [Smart Collect 2.0](/razorpay-docs-md/api/payments/smart-collect-2.md). It uses the same APIs as **Smart Collect**, while also offering additional endpoints—such as creating a Customer Identifier with a VPA and bank account, fetching UPI payments, and adding a VPA Receiver to an existing Customer Identifier.

Fork the Razorpay Postman Public Workspace and try the Smart Collect with TPV APIs using your [Test API Keys](/razorpay-docs-md/api/authentication.md#generate-api-keys). [![Run in Postman](https://run.pstmn.io/button.svg)](https://www.postman.com/razorpaydev/workspace/razorpay-public-workspace/folder/12492020-3ea069ae-e9fc-4778-b70b-193e0693e476)

Related Guides: [About Smart Collect](/razorpay-docs-md/smart-collect.md) [Set Up Webhooks](/docs/webhooks/setup-edit-payments/) [Webhook Payloads](/docs/webhooks/smart-collect/)

Endpoints

07 [Create a Customer Identifier with TPV

POST

Creates a Customer Identifier with bank account.](/razorpay-docs-md/api/payments/smart-collect-tpv/create.md) [Add an Allowed Payer With TPV

POST

Adds an allowed payer's account.](/razorpay-docs-md/api/payments/smart-collect-tpv/add-allowed-payer.md) [Fetch a Customer Identifier Using id With TPV

GET

Retrieves details of a Customer Identifier with id.](/razorpay-docs-md/api/payments/smart-collect-tpv/fetch-with-id.md) [Fetch All Customer Identifiers With TPV

GET

Retrieves details of all Customer Identifiers.](/razorpay-docs-md/api/payments/smart-collect-tpv/fetch-all.md) [Fetch Payments for a Customer Identifier With TPV

GET

Retrieves details of payments made against a particular Customer Identifier.](/razorpay-docs-md/api/payments/smart-collect-tpv/fetch-payments.md) [Fetch Payment Details Using id and Transfer Method With TPV

GET

Retrieves details of a payment using payment id and bank transfer method.](/razorpay-docs-md/api/payments/smart-collect-tpv/fetch-payment-id-transfer.md) [Delete an Allowed Payer Account With TPV

DELETE

Deletes an allowed payer account.](/razorpay-docs-md/api/payments/smart-collect-tpv/delete-allowed-payer.md)
