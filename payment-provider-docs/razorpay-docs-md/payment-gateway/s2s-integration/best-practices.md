<!-- Source: https://razorpay.com/docs/payments/payment-gateway/s2s-integration/best-practices -->

S2S integration is an API-based white label integration provided by Razorpay wherein you can capture payment details on your page and pass it.

Given below are some of the best practices to be followed for a smoother integration and payment experience:

- We recommend using S2S JSON API for S2S integration.
- Open the HTML provided as part of the API response from the customer's browser.
- Pass the actual user\_agent, customer IP and referrer to avoid any failures due to risk.
- Integrate webhooks to get a callback via a server-to-server call.
- Integrate the Payments Rainy Day kit to tackle payment exceptions such as late authorized payments, payment downtimes and errors.

**What's New**

Razorpay has added support for zero decimal currencies, such as JPY, and three decimal currencies, such as KWD, BHD, and OMR, allowing businesses to accept international payments in these currencies. Know more about [Currency Conversion](/razorpay-docs-md/international-payments/currency-conversion.md)

(May 2024).

### Related Information

- [Server-to-Server Integration](/razorpay-docs-md/payment-gateway/s2s-integration.md)
- [Webhooks](/docs/webhooks/)
- [Server-to-Server JSON V2 Integration](/razorpay-docs-md/payment-gateway/s2s-integration/json/v2.md)
