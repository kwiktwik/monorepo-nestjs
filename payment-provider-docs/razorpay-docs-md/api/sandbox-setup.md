<!-- Source: https://razorpay.com/docs/api/sandbox-setup -->

The Razorpay Sandbox environment allows you to test your integration without using real money. It is a crucial step before going live with your Razorpay integration.

## Steps

Follow these steps to set up the sandbox environment.

1. Generate API Keys

Follow these [steps to generate API keys](/razorpay-docs-md/api/authentication.md#generate-api-keys).

2. Use Sandbox URL & Client Libraries

The base URL for the Razorpay Sandbox and production API is the same - `https://api.razorpay.com/v1/`. In case of certain APIs, it is `https://api.razorpay.com/v2`.

For testing APIs in the sandbox environment, use the test API keys.

How you use them depends on the programming language and the Razorpay SDK you are using. Refer to the relevant SDK documentation for specific instructions. The SDK documentation will have clear examples of how to initialise the Razorpay client with your Key ID and Key Secret.

**Client Libraries**

For Razorpay Payments, the client SDK libraries are available on GitHub. You can use the API keys generated above to try out the API sample codes:

#### .Net

![Integrate](https://razorpay.com/docs/api/build/browser/assets/images/dotnet11.svg) [Integrate](/razorpay-docs-md/server-integration/dot-net.md)

![GitHub Repo](https://razorpay.com/docs/api/build/browser/assets/images/github.svg) [GitHub Repo](https://github.com/razorpay/razorpay-dot-net)

#### Java

![Integrate](https://razorpay.com/docs/api/build/browser/assets/images/java11.svg) [Integrate](/razorpay-docs-md/server-integration/java.md)

![GitHub Repo](https://razorpay.com/docs/api/build/browser/assets/images/github.svg) [GitHub Repo](https://github.com/razorpay/razorpay-java)

#### Node.JS

![Integrate](https://razorpay.com/docs/api/build/browser/assets/images/nodejs.svg) [Integrate](/razorpay-docs-md/server-integration/nodejs.md)

![GitHub Repo](https://razorpay.com/docs/api/build/browser/assets/images/github.svg) [GitHub Repo](https://github.com/razorpay/razorpay-node)

#### PHP

![Integrate](https://razorpay.com/docs/api/build/browser/assets/images/php11.svg) [Integrate](/razorpay-docs-md/server-integration/php.md)

![GitHub Repo](https://razorpay.com/docs/api/build/browser/assets/images/github.svg) [GitHub Repo](https://github.com/razorpay/razorpay-php)

#### Python

![Integrate](https://razorpay.com/docs/api/build/browser/assets/images/python.svg) [Integrate](/razorpay-docs-md/server-integration/python.md)

![GitHub Repo](https://razorpay.com/docs/api/build/browser/assets/images/github.svg) [GitHub Repo](https://github.com/razorpay/razorpay-python)

#### Ruby

![Integrate](https://razorpay.com/docs/api/build/browser/assets/images/ruby11.svg) [Integrate](/razorpay-docs-md/server-integration/ruby.md)

![GitHub Repo](https://razorpay.com/docs/api/build/browser/assets/images/github.svg) [GitHub Repo](https://github.com/razorpay/razorpay-ruby)

#### Go

![Integrate](https://razorpay.com/docs/api/build/browser/assets/images/go11.svg) [Integrate](/razorpay-docs-md/server-integration/go.md)

![GitHub Repo](https://razorpay.com/docs/api/build/browser/assets/images/github.svg) [GitHub Repo](https://github.com/razorpay/razorpay-go)

3. Go live

After testing is complete, generate [Live API keys](/razorpay-docs-md/dashboard/account-settings/api-keys.md#live-mode-api-keys) from the dashboard. Ensure to replace the Test API keys in your integration with the Live API keys before going live. You can accept real money payments using the Live API Keys.

### Related Information

- [Understand Razorpay APIs](/razorpay-docs-md/api/understand.md)
- [Errors](/docs/errors/)
- [Best Practices](/razorpay-docs-md/api/best-practices.md)
- [Glossary](/razorpay-docs-md/api/glossary.md)
