<!-- Source: https://razorpay.com/docs/api/partners/product-configuration -->

# Product Configuration APIs

Copy for AI

View as Markdown

You can use the Product Configuration APIs to configure and activate Razorpay products for a sub-merchant account according to their requirements. For example, if you need our Payment Gateway product for all sub-merchants or Payment Gateway for one sub-merchant and Payment Link product for another sub-merchant, you can do so using this API.

You can even accept terms and conditions for the requested product using these APIs. You can fetch the terms and conditions using the [Fetch Terms and Conditions API](/razorpay-docs-md/api/partners/terms-conditions/fetch.md).

The products Payment Links and Payment Gateway have similar requirements. If a requirement is submitted through a product configuration for `payment_gateway`, the same will be applicable for `payment_links`, and vice versa.

Fork the Razorpay Postman Public Workspace and try the Product Configuration APIs using your [Test API Keys](/docs/partners/aggregators/onboarding-api/#api-authentication). [![Run in Postman](https://run.pstmn.io/button.svg)](https://www.postman.com/razorpaydev/workspace/razorpay-public-workspace/folder/12492020-07bc4970-f967-4020-922f-8adb7ea407e8)

Related Guides: [Sub-merchant Onboarding APIs](/docs/partners/aggregators/onboarding-api/) [Set Up Webhooks](/docs/partners/aggregators/onboarding-api/webhooks/) [Webhook Payloads](/docs/webhooks/partners/)

Endpoints

04 [Request a Product Configuration

POST

Requests a product configuration for Payment Gateway and Payment Links.](/razorpay-docs-md/api/partners/product-configuration/request.md) [Fetch a Product Configuration

GET

Retrieves the details of an account.](/razorpay-docs-md/api/partners/product-configuration/fetch.md) [Update Settlement Account Details

PATCH

Updates settlement account details.](/razorpay-docs-md/api/partners/product-configuration/update-settlement-account-details.md) [Request Payment Methods

PATCH

Requests Payment Methods.](/razorpay-docs-md/api/partners/product-configuration/update-request-payment-methods.md)
