<!-- Source: https://razorpay.com/docs/payments/quickstart -->

Welcome to Razorpay! This guide will walk you through setting up your account and choosing the right products for your business needs.

## Step 1: Create an Account

Sign up for a [Razorpay account](https://razorpay.com/signup) and complete the KYC process.

- Start using our products or SDK/API integration in Test Mode during the KYC verification process.
- After KYC completion and testing, live mode unlocks for real payments.

### Test Mode vs Live Mode [Test Mode

- Start integration immediately without KYC completion.
- Use test transactions with dummy data. No real money involved.
- API keys begin with `rzp_test_`.
- Perfect for development and testing.](/razorpay-docs-md/dashboard/test-live-modes.md#test-mode-vs-live-mode) [Live Mode

- Requires KYC verification (24-48 hours).
- Accept real customer payments.
- API keys begin with `rzp_live_`.
- Full access to all features.](/razorpay-docs-md/dashboard/test-live-modes.md#test-mode-vs-live-mode)

## Step 2: Select Product [Choose Razorpay products](/razorpay-docs-md/index.md) based on your business requirements.

Online Payments vs. Offline Payments

Choose between digital payment processing for ecommerce and websites using [Payment Gateway](/razorpay-docs-md/payment-gateway.md), [Magic Checkout](/razorpay-docs-md/magic-checkout.md) and [Payment Links](/razorpay-docs-md/payment-links.md) or physical payment solutions for retail stores and face-to-face transactions with [Razorpay POS](/docs/pos/). Know more about [online and offline payment options](/razorpay-docs-md/index.md#accept-payments).

One-time Payments vs. Recurring Payments

Select single transaction processing for individual purchases using [Payment Gateway](/razorpay-docs-md/payment-gateway.md), [Payment Links](/razorpay-docs-md/payment-links.md) and [Payment Pages](/razorpay-docs-md/payment-pages.md) or automated recurring billing for subscriptions and regular services with [Subscriptions](/razorpay-docs-md/subscriptions.md). Know more about [one-time and recurring payment solutions](/razorpay-docs-md/index.md#accept-payments).

No-code Products vs. Products with Coding Requirements

Pick ready-to-use payment solutions with simple setup like [Payment Links](/razorpay-docs-md/payment-links.md), [Payment Pages](/razorpay-docs-md/payment-pages.md), [Invoices](/razorpay-docs-md/invoices.md) or refer to our [Payment Gateway SDKs](/razorpay-docs-md/payment-gateway.md#integrate-payment-gateway-web-mobile-ecommerce-plugins) for advanced integration needs. Explore [no-code and developer-friendly options](/razorpay-docs-md/index.md#accept-payments).

Solutions by Industry

Find tailored payment solutions designed for your industry: [Payment Gateway](/razorpay-docs-md/payment-gateway.md) for ecommerce, [Subscriptions](/razorpay-docs-md/subscriptions.md) for SaaS, [Route](/razorpay-docs-md/route.md) for marketplaces or [Razorpay POS](/docs/pos/) for traditional retail businesses. View [industry-specific payment solutions](/razorpay-docs-md/index.md#solutions-by-industry).

Solutions by Platform

Integrate payments seamlessly with popular ecommerce platforms like Shopify, WooCommerce, Magento using [Payment Gateway ecommerce plugins](/razorpay-docs-md/payment-gateway.md#integrate-payment-gateway-web-mobile-ecommerce-plugins) or build custom solutions using our [Checkout SDKs](/razorpay-docs-md/payment-gateway.md#integrate-payment-gateway-web-mobile-ecommerce-plugins) for Go, PHP, Python, Node.js and [mobile platforms](/razorpay-docs-md/payment-gateway.md#integrate-payment-gateway-web-mobile-ecommerce-plugins)

(Android, iOS, React Native, Flutter, Cordova, Capacitor). Browse [platform-specific integration guides](/razorpay-docs-md/index.md#solutions-by-platform).

## Step 3: Key Dashboard Actions

Generate API Keys

If you are using our APIs, SDKs or plugins, follow these steps to generate API keys for the integration:

1. Log in to Dashboard.
2. Navigate to **Account & Settings** → **API Keys** under Website and app settings.
3. Click **Generate Key**.
4. Download and save **Key ID** and **Key Secret** securely.

**Important:**

- Only Owner and Admin roles can access API keys.
- Generate separate keys for Test and Live modes.
- Key Secret is only visible at generation time. [API Keys Documentation →](/razorpay-docs-md/dashboard/account-settings/api-keys.md)

Add Team Members

Follow these steps:

1. Log in to the Dashboard.
2. Navigate to **Account & Settings** → **Business settings** → **Manage Team**.
3. Click **Invite New Member**.
4. Enter their email address and select role from the dropdown.
5. Click **Send Invitation**. [Team Management Guide →](/razorpay-docs-md/dashboard/account-settings/manage-team.md)

Configure Webhooks

We recommend setting up webhooks to receive notifications, if you are integrating with our APIs or SDKs.

1. Log in to the Dashboard.
2. Navigate to **Account & Settings** → **Webhooks**.
3. Click **Add New Webhook**.
4. Enter your endpoint URL.
5. Select events to monitor.
6. Add webhook secret for signature verification.
7. Save and activate. [Webhooks Documentation →](/docs/webhooks/)

Payment Capture Settings

Log in to the Dashboard. Navigate to the **Account & Settings** option and scroll to the **Payments Capture** section. [Payment Capture Guide →](/razorpay-docs-md/payments/capture-settings.md)

## Next Steps

Once your account is created:

1. **Complete KYC**: [Submit KYC documents](/razorpay-docs-md/set-up.md#2-submit-kyc-details)

   for live mode activation.
2. **Choose Product/Integration Method**: Select based on your business needs and technical capabilities.
3. **Test Thoroughly**: Use test mode before going live.
4. **Go Live**: Switch to live mode when ready. Use live mode keys if integrating with our APIs/SDKs/plugins.
