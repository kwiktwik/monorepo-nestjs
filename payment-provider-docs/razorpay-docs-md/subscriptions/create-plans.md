<!-- Source: https://razorpay.com/docs/payments/subscriptions/create-plans -->

You must create a Plan before you create a Subscription.

**International Currency**

Create the plan in the currency you want to charge the customer. You can select any one of our [supported currencies](/razorpay-docs-md/international-payments.md#supported-currencies) to create a Plan.

## Create a Plan

You can create a Plan in two ways: [Dashboard](/razorpay-docs-md/subscriptions/create-plans.md#create-a-plan-from-dashboard) and [APIs](/razorpay-docs-md/subscriptions/create-plans.md#create-a-plan-using-apis)

**Watch Out!**

- Plans with `daily` frequency should have the interval set to a value greater than 7.
- Once a Plan is created, you cannot edit or delete it.

### Create a Plan From Dashboard

Watch this video to see how to create a Plan from the Dashboard. [

Create a Plan

](/razorpay-docs-md/subscriptions/build/browser/assets/images/create-a-plan.md)

To create a plan:

1. Log in to the Dashboard and click **Subscriptions** under **PAYMENT PRODUCTS** in the left menu.
2. Go to **Plans** and click **+ New Plan**. The **New Plan** window displays.
3. Enter the following details:
   1. **Plan Name:** Name of the plan.
   2. **Plan Description:** A brief description for the plan. This is an optional field.
   3. **Billing Frequency:** How often should the customer be charged.
   4. **Billing Amount:** Amount to be charged. Refer to the [supported currencies](/razorpay-docs-md/international-payments.md#supported-currencies)

      page for information on currencies.
   5. **Internal Notes:** Any internal notes if required.
4. Click **Create Plan**.

### Create a Plan Using APIs

You can create a Subscription Plan using the [create a plan API](/razorpay-docs-md/api/payments/subscriptions.md#create-a-plan).

## View Plan Details

You can view Plan details in two ways: [Dashboard](/razorpay-docs-md/subscriptions/create-plans.md#view-plan-details-using-dashboard) and [APIs](/razorpay-docs-md/subscriptions/create-plans.md#view-plan-details-using-api)

### View Plan Details Using Dashboard

To view Plan details:

1. Log in to the Dashboard and click **Subscriptions** under **PAYMENT PRODUCTS** in the left menu.
2. Go to **Plans** and click on the required **Plan Id** to view its details.

![](https://razorpay.com/docs/payments/subscriptions/build/browser/assets/images/view_plan_details.jpg)

### View Plan Details Using API

- View all Plans using the [fetch all plans API](/razorpay-docs-md/api/payments/subscriptions.md#fetch-all-plans)  .
- View a Plan with an id using the [fetch a plan by id API](/razorpay-docs-md/api/payments/subscriptions.md#fetch-a-plan-by-id)  .

### Related Information

- [Create Subscriptions via Links](/razorpay-docs-md/subscriptions/create-subscription-links.md)
- [Charge a Card Manually](/razorpay-docs-md/subscriptions/manually-charge-card.md)
- [Update a Subscription](/razorpay-docs-md/subscriptions/update.md)
- [Subscriptions Settings](/razorpay-docs-md/subscriptions/settings.md)
