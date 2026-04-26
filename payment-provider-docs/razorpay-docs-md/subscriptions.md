<!-- Source: https://razorpay.com/docs/payments/subscriptions -->

[Subscriptions Changelog

Discover new features, updates and deprecations related to Razorpay Subscriptions (since Jan 2024).](/razorpay-docs-md/changelog.md#products)

Use Razorpay Subscriptions to set up and manage recurring payments.

- Create a plan with your pricing and billing schedule, then create a subscription for customers. Razorpay automatically charges them at regular intervals.
- Manage all Subscriptions directly from the Dashboard - create plans, manage customer subscriptions, handle upgrades/downgrades, or pause billing.
- Receive near real-time notifications by subscribing to Webhook events.

## Advantages

- **Automated Billing**: Create a plan once and Razorpay automatically charges customers on schedule.
- **Multiple Billing Models**: Support fixed amounts, usage-based billing or add-ons for extra services.
- **Flexible Plans**: Set up trial periods, upfront charges and multiple pricing tiers.
- **Customer Management**: Allow customers to upgrade, downgrade, pause or cancel subscriptions.
- **Smart Payment Retries**: Automatic retry logic maximises successful collections.
- **Seamless Integration**: Integrate using Dashboard links or APIs.
- **Auto-Invoicing**: Invoices are automatically generated for every billing cycle.

## When to Use Subscriptions vs Recurring Payments

**Subscriptions** are plan-based recurring payments. You create a plan (pricing and billing schedule), create a subscription for each customer and Razorpay automatically charges them at the defined intervals. Billing is fully automated and managed from the Dashboard.

**Recurring Payments** let you charge customers repeatedly after they authorise their payment method once. You control when each charge is initiated using tokens. There is no built-in plan or automatic schedule; you trigger charges via API based on your business logic.

Choose Subscriptions when you have:

- Fixed billing schedules (weekly, monthly, quarterly, yearly)
- Multiple pricing plans for customers to choose from
- Need for automated, hands-off billing

Choose Recurring Payments when you need:

- Flexible billing based on usage or milestones
- Manual control over when to charge each payment
- On-demand or variable payment amounts

See [Recurring Payments](/razorpay-docs-md/recurring-payments.md) for flexible, usage-based billing.

## Supported Payment Methods

Cards

UPI AutoPay

Emandate

Customers can make payments using credit and debit cards. Card details are securely tokenised as per RBI guidelines.

See [Supported Payment Methods](/razorpay-docs-md/subscriptions/supported-payment-methods.md) for complete details on limits and supported banks.

## Prerequisites

1. Sign up for Account

Ensure you have a [Razorpay account](/razorpay-docs-md/set-up.md).

2. Enable Flash Checkout

1. Log in to the Dashboard.
2. Navigate to **Account & Settings → Checkout Features** and enable **Flash checkout**.

![Enable Flash Checkout](https://razorpay.com/docs/payments/build/browser/assets/images/flash_checkout_settings.jpg)

3. Understand Tokenisation

For card-based subscriptions, customer card details are securely tokenised with explicit consent during authorisation.

![Card tokenization flow](https://razorpay.com/docs/payments/build/browser/assets/images/subscriptions-tokenisation.gif)

## Get Started

1. Log in to the Dashboard and navigate to **Subscriptions** under **PAYMENT PRODUCTS**.
2. [Create a Plan](/razorpay-docs-md/subscriptions/create.md#plan)

   to define your product, pricing and billing frequency.
3. [Create a Subscription](/razorpay-docs-md/subscriptions/create.md#subscription)

   to link a customer to a plan using Dashboard or APIs.
4. Verify your subscription flow in [test mode](/razorpay-docs-md/subscriptions/test.md)   .

## Integrate With Your Systems

You can integrate Razorpay Subscriptions with your existing systems:

Dashboard

API Integration

Webhooks

Create [Plans](/razorpay-docs-md/subscriptions/create-plans.md) and [Subscription Links](/razorpay-docs-md/subscriptions/create-subscription-links.md) and share via email/SMS - no coding required.

#### Related Information

- [How Subscriptions Work](/razorpay-docs-md/subscriptions/workflow.md)
- [Subscription Use Cases](/razorpay-docs-md/subscriptions/use-cases.md)
- [Subscription States](/razorpay-docs-md/subscriptions/states.md)
- [Create Subscriptions](/razorpay-docs-md/subscriptions/create.md)
- [Integration Guide](/razorpay-docs-md/subscriptions/integration-guide.md)

- [Subscriptions APIs](/razorpay-docs-md/subscriptions/apis.md)

- [FAQs](/razorpay-docs-md/subscriptions/faqs.md)
