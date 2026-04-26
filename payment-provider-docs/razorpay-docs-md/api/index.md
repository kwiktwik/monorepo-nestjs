<!-- Source: https://razorpay.com/docs/api -->

Razorpay APIs are completely RESTful, and all our responses are returned in JSON.

**Integrations**

- Looking to integrate your website, ecommerce store or mobile app with Razorpay Payment Gateway? Find the [right integration method](/razorpay-docs-md/payment-gateway.md#integration-types)  .
- Accept payments [**without** a website or app](/razorpay-docs-md/index.md#accept-payments)

  using other Razorpay products, such as Payment Links, Payment Pages, Subscription Links, Invoices and Smart Collect.
- For S2S integration, contact the [Support team](https://razorpay.com/support/#request)

  with your requirements.

#### Razorpay Postman Public Workspace

Our APIs are present on the Razorpay [Postman Public Workspace](https://www.postman.com/razorpaydev/workspace/razorpay-public-workspace/collection/12492020-952c7295-118c-400f-8f2c-5266ef6f689a). Watch the video to know how to fork APIs and save them to your private workspace for testing.

#### Try Razorpay APIs on Postman

Test Razorpay APIs using Postman. Watch the video to know how to get started.

All Razorpay APIs are authenticated using Basic Authentication. You must [generate test API keys](/razorpay-docs-md/api/authentication.md) on the Dashboard before trying the APIs.

## API Gateway URL

For most of the Razorpay APIs, the Gateway URL is `https://api.razorpay.com/v1`. You need to include this before each API endpoint to make API calls. However, certain APIs are on V2. Hence, the gateway URL may differ for certain APIs.

Example

- Use the URL `https://api.razorpay.com/v1/payments` to access payment resources.
- Use the URL `https://api.razorpay.com/v2/accounts` to access Route (Linked Account)-related resources.

### Related Information

- [Understand Razorpay APIs](/razorpay-docs-md/api/understand.md)
- [API Authentication](/razorpay-docs-md/api/authentication.md)
- [Sandbox Setup](/razorpay-docs-md/api/sandbox-setup.md)
- [Errors](/docs/errors/)
- [API Best Practices](/razorpay-docs-md/api/best-practices.md)
- [API Glossary](/razorpay-docs-md/api/glossary.md)
