<!-- Source: https://razorpay.com/docs/payments/payment-gateway/web-integration/custom -->

Integrate Razorpay Payment Gateway with your Custom Checkout. You can build a checkout form to suit your unique business needs and branding guidelines.

![](https://razorpay.com/docs/payments/payment-gateway/web-integration/build/browser/assets/images/web-integration-custom-custom-checkout.jpg)

Custom Checkout's JavaScript library lets you customise the checkout interface at a granular level. For example, you can white-label the checkout to:

- Display only the select payment methods.
- Integrate external wallets.
- Modify the look and feel of Checkout.

**Watch Out!**

You can accept payments **only** from those websites that you had registered with us at the time of [account setup](/razorpay-docs-md/set-up.md). Razorpay **fails** the payments received on the **unregistered websites**. If you want to accept payments from multiple websites, contact our [Support team](https://razorpay.com/support/) to register additional websites for your account.

**UPI Collect Flow Deprecated**

According to NPCI guidelines, the UPI Collect flow is being deprecated effective 28 February 2026. Customers can no longer make payments or register UPI mandates by manually entering VPA/UPI id/mobile numbers.

**Exemptions:** UPI Collect will continue to be supported for:

- MCC 6012 & 6211 (IPO and secondary market transactions).
- iOS mobile app and mobile web transactions.
- UPI Mandates (execute/modify/revoke operations only)
- eRupi vouchers.
- PACB businesses (cross-border/international payments).

**Action Required:**

- If you are a new Razorpay user, use [UPI Intent](/razorpay-docs-md/payment-gateway/web-integration/custom/payment-methods.md#intent-flow)  .
- If you are an existing Razorpay user not covered by exemptions, you must migrate to UPI Intent or UPI QR code to continue accepting UPI payments. For detailed migration steps, refer to the [migration documentation](/docs/announcements/upi-collect-migration/custom-integration/)  .

## Prerequisites

Before integrating with the Checkout, run through this checklist:

- Create a [Razorpay account](https://dashboard.razorpay.com/signup)  .
- Generate the [API Keys](/razorpay-docs-md/dashboard/account-settings/api-keys.md#generate-api-keys)

  from the Dashboard. To go live with the integration and start accepting real payments, generate Live Mode API Keys and replace them in the integration.
- Know about the [Payment Flow](/razorpay-docs-md/payment-gateway/how-it-works.md)  .

**Watch Out!**

A customer's payment information should never reach your servers unless you are PCI-DSS certified.

## Integration Steps

Follow these integration steps:

1. [Build Integration](/razorpay-docs-md/payment-gateway/web-integration/custom/build-integration.md)
2. [Test Integration](/razorpay-docs-md/payment-gateway/web-integration/custom/test-integration.md)
3. [Go-Live Checklist](/razorpay-docs-md/payment-gateway/web-integration/custom/go-live-checklist.md)

### Related Information

- [Best Practices](/razorpay-docs-md/payment-gateway/web-integration/custom/best-practices.md)
- [Address Verification System](/razorpay-docs-md/international-payments/address-verification-system.md)
