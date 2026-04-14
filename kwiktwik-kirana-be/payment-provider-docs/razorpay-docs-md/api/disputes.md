<!-- Source: https://razorpay.com/docs/api/disputes -->

# Disputes APIs

Copy for AI

View as Markdown

A [dispute](/razorpay-docs-md/disputes.md) arises when your customer or the issuing bank questions the validity of a payment. You can manage disputes using APIs or from the [Dashboard](/razorpay-docs-md/disputes.md#dashboard-actions) to ensure a seamless dispute management experience.

Fork the Razorpay Postman Public Workspace and try the Disputes APIs using your [Test API Keys](/razorpay-docs-md/api/authentication.md#generate-api-keys). [![Run in Postman](https://run.pstmn.io/button.svg)](https://www.postman.com/razorpaydev/workspace/razorpay-public-workspace/folder/12492020-0803d1d0-dbdf-4312-bd7b-b4817cea2840)

Related Guides: [About Disputes](/razorpay-docs-md/disputes.md) [Set Up Webhooks](/docs/webhooks/setup-edit-payments/) [Webhook Payloads](/docs/webhooks/disputes/)

Endpoints

06 [Fetch All Disputes

GET

Retrieves information about all disputes.](/razorpay-docs-md/api/disputes/fetch-all.md) [Fetch a Dispute With ID

GET

Retrieves details for a specific dispute using the unique identifier linked to the dispute.](/razorpay-docs-md/api/disputes/fetch.md) [Fetch a Dispute With ID (Example 1)

GET

Retrieves details for a specific dispute with expanded payment details.](/razorpay-docs-md/api/disputes/fetch-dispute-expanded-payment.md) [Fetch a Dispute With ID (Example 2)

GET

Retrieves details for a specific dispute with expanded `transaction.settlement` details.](/razorpay-docs-md/api/disputes/fetch-dispute-expanded-transaction.md) [Accept a Dispute

POST

Accepts a dispute against the payment.](/razorpay-docs-md/api/disputes/accept.md) [Contest a Dispute

PATCH

Contests a dispute with explanations and supporting documents to submit evidences.](/razorpay-docs-md/api/disputes/contest.md)
