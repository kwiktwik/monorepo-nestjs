<!-- Source: https://razorpay.com/docs/payments/server-integration/dot-net -->

#### .NET Changelog

Discover new features, updates and deprecations related to the Razorpay .NET SDK (since Jan 2024).

#### Troubleshooting & FAQs

Troubleshoot common error scenarios and find answers to frequently asked questions about Razorpay .NET SDK.

Install the Razorpay .NET SDK and integrate it with your .NET-based website to accept payments, initiate refunds and do much more.

## Dependencies

You must use .NET v4.5 or higher with TLS version 1.2. Using it with a lower .NET version will lead to [errors](/razorpay-docs-md/server-integration/dot-net/troubleshooting-faqs.md). Know more about the [latest .NET versions](https://versionsof.net/framework/).

## .NET Client API

The .NET Client API follows the below practices:

- Namespaced under `Razorpay.Api`.
- The .NET client throws exceptions instead of returning errors.
- Options are passed as a Dictionary instead of multiple arguments, wherever possible.
- All requests and responses are communicated over JSON.

## Installation

Install Razorpay using either:

NuGet Package Manager

Terminal/Command Prompt

To install the SDK using NuGet Package Manager:

1. [Download the latest source code zip file](https://github.com/razorpay/razorpay-dot-net/releases)

   from the releases section on GitHub.
2. [Download the NuGet Package Manager](https://marketplace.visualstudio.com/items?itemName=NuGetTeam.NuGetPackageManager)

   and install it.

   **Handy Tips**

   The NuGet Package Manager only supports .NET 4.0 and higher. Ensure that you have the appropriate version of .NET installed.
3. Run the following command on the NuGet Package Manager:

   copy

   ```
Install-Package Razorpay -Version {version_number}
```

#### Payment Gateway

Integrate with Razorpay Payment Gateway.

#### API Sample Codes

Integrate using API sample codes.

## Support

- **Queries**: If you have queries, [contact support](https://razorpay.com/support/)  .

- **Feature Request:** If you have a feature request, raise an issue on [GitHub](https://github.com/razorpay/razorpay-dot-net/issues/new)  .

### Related Information [Address Verification System](/razorpay-docs-md/international-payments/address-verification-system.md)
