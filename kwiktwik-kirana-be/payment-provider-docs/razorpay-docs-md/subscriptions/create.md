<!-- Source: https://razorpay.com/docs/payments/subscriptions/create -->

Use the following steps to create Subscriptions for your customers:

1. [Create a Plan](/razorpay-docs-md/subscriptions/create.md#plan)
2. [Create a Subscription](/razorpay-docs-md/subscriptions/create.md#subscription)

## 1. Create a Plan

A Plan is a foundation on which a Subscription is built. It acts as a reusable template and contains details of the goods or services offered with the amount to be charged and the frequency at which the customer should be charged (billing cycle). Depending upon your business, you can create multiple Plans with different billing cycles and pricing.

You should create a Plan before creating a Subscription. You can create Plans from the [Dashboard](/razorpay-docs-md/subscriptions/create-plans.md#create-a-plan) or using [APIs](/razorpay-docs-md/api/payments/subscriptions/create-plan.md).

**International Currencies**

You can create a Plan using any of the [supported currencies.](/razorpay-docs-md/international-payments.md#supported-currencies)

## 2. Create a Subscription

A Subscription contains details like the Plan, the start date, total number of billing cycles, free trial period (if any) and upfront amount to be collected.

Subscriptions can be created from the [Dashboard](/razorpay-docs-md/subscriptions/create-subscription-links.md#create-a-subscription-link) or using [APIs](/razorpay-docs-md/api/payments/subscriptions/create-subscription.md).

### Trial Period

You can create a fully-customised trial period of Subscriptions that does not have to follow the typical 1-week or 1-month trial template.

To create a trial period for your customers, provide a future start date when creating the Subscription. The actual billing cycle automatically starts at the specified date, creating a free trial period.

**Example**

1. Acme Corp. provides video streaming services and wants to offer a 1-month free trial.
2. The customer selects the Plan on March 5, 2025 and completes the **authentication transaction**.
3. During the authentication transaction, Acme Corp. creates a Subscription with start date of April 5, 2025.
4. Now, although the authentication transaction was done on March 5, 2025, the customer’s card will be charged only from April 5, 2025.
5. The customer or the business can decide to cancel the Subscription at any time before that. The time between March 5, 2025 and April 5, 2025 is treated as the trial period.

**Handy Tips**

- When creating a Subscription link from the [Dashboard](/razorpay-docs-md/subscriptions/create-subscription-links.md#create-a-subscription-link-from-dashboard)  , you can add a trial period by setting the start date to any future date.
- When creating a Subscription or a Subscription link using [APIs](/razorpay-docs-md/api/payments/subscriptions/create-subscription-link.md)  , you can add a trial period by passing a future start date in the `start-at` parameter.

### Upfront Amount

There might be scenarios where you want to charge the customers an extra amount either at the start of the Subscription or even before the Subscription starts. For example, you might want to charge the customer a delivery fee or a setup fee. You can add this to the Subscription as an upfront amount as part of the authentication transaction.

**Example**

1. Acme Corp. provides furniture on rent.
2. Acme Corp. charges ₹1,000 as security deposit. This needs to be collected before the furniture is delivered.
3. While creating a Subscription for the customer, Acme Corp. adds an upfront amount of ₹1,000.
4. When the customer subscribes to the service (during authentication transaction), ₹1,000 is collected from the customer.

**Handy Tips**

- When creating a Subscription link from the [Dashboard](/razorpay-docs-md/subscriptions/create-subscription-links.md#create-a-subscription-link-from-dashboard)  , you can add an upfront amount by selecting the **I want to add an upfront amount** check box and following the instructions on screen.
- When creating a Subscription or a Subscription link using [APIs](/razorpay-docs-md/api/payments/subscriptions/create-subscription-link.md)  , you can add an upfront amount by passing an `addons` key in the request.

### Related Information

- [Subscriptions](/razorpay-docs-md/subscriptions.md)
- [Subscriptions Workflow](/razorpay-docs-md/subscriptions/workflow.md)
- [Subscriptions States](/razorpay-docs-md/subscriptions/states.md)
- [Test Subscriptions](/razorpay-docs-md/subscriptions/test.md)
- [Subscriptions APIs](/razorpay-docs-md/subscriptions/apis.md)
