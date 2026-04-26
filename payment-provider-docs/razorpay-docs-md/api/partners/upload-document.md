<!-- Source: https://razorpay.com/docs/api/partners/upload-document -->

# Document APIs

Copy for AI

View as Markdown

Use the Document APIs to upload and fetch documents for the KYC verification process. Check the [product activation status and updates permitted](/docs/partners/aggregators/onboarding-api/#product-activation-status-and-updates-permitted) for Document APIs.

The maximum supported file size for a JPG/PNG is 4MB. The maximum supported file size for a PDF is 2MB. Do not pass file URLs instead of uploading documents. If you have uploaded the document but mandatory field-level parameters are not passed in the API, you need to re-execute the Documents API with the same document and pass the fields.

Fork the Razorpay Postman Public Workspace and try the Document APIs using your [Test API Keys](/docs/partners/aggregators/onboarding-api/#api-authentication/). [![Run in Postman](https://run.pstmn.io/button.svg)](https://www.postman.com/razorpaydev/workspace/razorpay-public-workspace/folder/12492020-91288595-d910-4f84-822d-808de103aeba)

Related Guides: [Sub-merchant Onboarding APIs](/docs/partners/aggregators/onboarding-api/) [Set Up Webhooks](/docs/partners/aggregators/onboarding-api/webhooks/) [Webhook Payloads](/docs/webhooks/partners/)

Endpoints

04 [Upload Account Documents

POST

Uploads business documents for a sub-merchant's account.](/razorpay-docs-md/api/partners/upload-document/upload-account-documents.md) [Upload Stakeholder Documents

POST

Uploads signatory documents for a stakeholder.](/razorpay-docs-md/api/partners/upload-document/upload-stakeholder-documents.md) [Fetch Account Documents

GET

Retrieves the documents uploaded for an account.](/razorpay-docs-md/api/partners/upload-document/fetch-account-documents.md) [Fetch Stakeholder Documents

GET

Retrieves the documents uploaded for a stakeholder.](/razorpay-docs-md/api/partners/upload-document/fetch-stakeholder-documents.md)
