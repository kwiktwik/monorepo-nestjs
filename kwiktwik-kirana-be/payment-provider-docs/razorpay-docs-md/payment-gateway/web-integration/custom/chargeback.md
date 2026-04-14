<!-- Source: https://razorpay.com/docs/payments/payment-gateway/web-integration/custom/chargeback -->

Integrate Razorpay Payment Gateway with your Custom Checkout. You can build a checkout form to suit your unique business needs and branding guidelines.

![](https://razorpay.com/docs/payments/payment-gateway/web-integration/custom/build/browser/assets/images/web-integration-custom-custom-checkout.jpg)

Custom Checkout's JavaScript library lets you customise the checkout interface at a granular level. For example, you can white-label the checkout to:

- Display only the select payment methods.
- Integrate external wallets such as Paytm.
- Modify the look and feel of Checkout.

**Watch Out!**

You can accept payments **only** from those websites that you had registered with us at the time of [account setup](/razorpay-docs-md/set-up.md). Razorpay **fails** the payments received on the **unregistered websites**. If you want to accept payments from multiple websites, contact our [Support team](https://razorpay.com/support/) to register additional websites for your account.

## Prerequisites

Before integrating with the Checkout, run through this checklist:

- Create a [Razorpay account](https://dashboard.razorpay.com/signup)  .
- Generate the [API Keys](/razorpay-docs-md/api/authentication.md#generate-api-keys)

  from the Dashboard. To go live with the integration and start accepting real payments, generate Live Mode API Keys and replace them in the integration.
- Know about the [Razorpay Payment Flow](/razorpay-docs-md/payment-gateway/how-it-works.md)  .

**Watch Out!**

A customer's payment information should never reach your servers unless you are PCI-DSS certified.

## Integration Steps

Follow these integration steps:

1. Build Integration

- [E-Commerce](/razorpay-docs-md/payment-gateway/web-integration/custom/chargeback/build-integration-ecommerce.md)
- [Hotel](/razorpay-docs-md/payment-gateway/web-integration/custom/chargeback/build-integration-hotel.md)
- [Travel](/razorpay-docs-md/payment-gateway/web-integration/custom/chargeback/build-integration-travel.md)

1. [Test Integration](/razorpay-docs-md/payment-gateway/web-integration/custom/chargeback/test-integration.md)
2. [Go-Live Checklist](/razorpay-docs-md/payment-gateway/web-integration/custom/chargeback/go-live-checklist.md)

### Related Information

- [Best Practices](/razorpay-docs-md/payment-gateway/web-integration/custom/best-practices.md)
- [Address Verification System](/razorpay-docs-md/international-payments/address-verification-system.md)
