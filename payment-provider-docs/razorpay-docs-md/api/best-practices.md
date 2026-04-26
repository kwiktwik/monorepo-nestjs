<!-- Source: https://razorpay.com/docs/api/best-practices -->

Follow these best practices while working with APIs.

- **Do not share your API Key secret with anyone or on any public platforms.** This can pose security threats for your Razorpay account.
- While sending API requests to Razorpay servers, it is recommended to honour the TTL of the entries and not cache the DNS aggressively at your end. This is applicable when you are not using Razorpay SDKs.
- If you are using our SDKs, our SDKs can handle DNS caching and honour the TTLs that are set in the records.

**What's New**

Razorpay has added support for zero decimal currencies, such as JPY, and three decimal currencies, such as KWD, BHD, and OMR, allowing businesses to accept international payments in these currencies. Know more about [Currency Conversion](/razorpay-docs-md/international-payments/currency-conversion.md)

(May 2024).

### Related Information

- [Understand Razorpay APIs](/razorpay-docs-md/api/understand.md)
- [API Authentication](/razorpay-docs-md/api/authentication.md)
- [Sandbox Setup](/razorpay-docs-md/api/sandbox-setup.md)
- [Errors](/docs/errors/)
- [Glossary](/razorpay-docs-md/api/glossary.md)
