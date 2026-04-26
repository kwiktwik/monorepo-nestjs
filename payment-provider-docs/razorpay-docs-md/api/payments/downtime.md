<!-- Source: https://razorpay.com/docs/api/payments/downtime -->

# Payment Downtime APIs

Downtime is when one or more payment options underperform, leading to considerable delays in payment processing. These downtimes are due to technical issues or outages at Razorpay's partner or issuing banks.

Razorpay [informs you about the downtime](/razorpay-docs-md/payments/downtime-updates.md) to communicate it to your customers and display only the unaffected payment methods while accepting payments from them. You can poll the API or configure Webhooks to be notified of the downtimes and plan the remediation steps accordingly. Downtime communication for the payment methods such as cards, netbanking and UPI is available.

Fork the Razorpay Postman Public Workspace and try the Downtime APIs using your [Test API Keys](/razorpay-docs-md/api/authentication.md#generate-api-keys). [![Run in Postman](https://run.pstmn.io/button.svg)](https://www.postman.com/razorpaydev/workspace/razorpay-public-workspace/folder/12492020-4270ff49-ebe0-478e-8d3d-e7c2c75b2e4d)

Related Guides: [About Downtime](/razorpay-docs-md/payments/downtime-updates.md) [Set Up Webhooks](/docs/webhooks/setup-edit-payments/) [Webhook Payloads](/docs/webhooks/payments/#payments-downtime)

Endpoints

02 [Fetch Payment Downtime Details

GET

Retrieves details of Payment Downtime.](/razorpay-docs-md/api/payments/downtime/fetch-all.md) [Fetch Payment Downtime Details With ID

GET

Retrieves details of a Payment Downtime with id.](/razorpay-docs-md/api/payments/downtime/fetch-with-id.md)
