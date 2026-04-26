<!-- Source: https://razorpay.com/docs/payments/subscriptions/create-subscription-links -->

If you do not have a website or app, you can still create and send Subscriptions to customers using a link. When the customer opens the link, they are taken to a checkout page hosted by Razorpay, where they make the authorisation payment. You can also use this feature to create and send custom Subscriptions to customers.

Subscription Links can be created from the [Dashboard](/razorpay-docs-md/subscriptions/create-subscription-links.md#create-a-subscription-link-from-dashboard) or using [APIs](/razorpay-docs-md/subscriptions/create-subscription-links.md#create-a-subscription-link-using-api).

## Subscriptions via Links Flow

Below is a high-level overview of Subscriptions via links.

![Flow of subscriptions via link](https://razorpay.com/docs/payments/subscriptions/build/browser/assets/images/subscriptions-link-overview.jpg)

To create a Subscriptions link from the Dashboard, you need to:

1. [Create a plan](/razorpay-docs-md/subscriptions/create-plans.md#create-a-plan)

   .
2. [Create and send a Subscription link](/razorpay-docs-md/subscriptions/create-subscription-links.md#create-a-subscription-link)

   .

## Create a Subscription Link From Dashboard

Watch this video to see how to create Subscription Links.

To create a Subscription Link:

1. Log in to the Dashboard and click **Subscriptions** under **PAYMENT PRODUCTS** in the left menu.
2. Click **+ Create New Subscription**. The **Create Subscription** screen displays.
3. Select the required plan from the **Select Plan** drop-down list.
4. Select the **Subscription Start Date**.

   **Trial Period**

   To create a trial period for your customers, all you need to provide is a future start date. The actual billing cycle automatically starts at the specified date, essentially creating a trial period.
5. Enter the **Total Count**. This defines how many times the customer should be charged (the number of billing cycles).

   **Handy Tips**

   You can create a Subscription for a maximum of 30 years, and the **Total Count** differs depending on the selected plan. For example, If you select a monthly plan, the **Total Count** is calculated as per the below formula:

   *Monthly=>(Number of months in a year(12) \* Number of Years supported (30)) / Interval (1 as every month in this example)*

   As per this formula, the **Total Count** for the monthly Subscription should be, *(12 \* 30)/1 = 1200*
6. Select the required offer from the **Offer** drop-down and click **Next**.
7. Select **I want to add an upfront amount**.
8. Click the drop-down and click **+Create New Item**. The **Add Upfront Amount** screen appears in a pop-out window.
9. Add the following details and click **Save**.

   - **Name**
   - **Rate per unit**
   - **Description** (optional)
10. You can add additional items using the **Add New Item** option.
11. Click **Next** once you have added all items tagged as upfront amount.

    **Handy Tips**

    - All the created add-on items display in the **Select Item to Add** drop-down.
    - The upfront amount and add-ons will have the same currency as the plan.
12. Enter the customer's mobile number and/or email address.
13. Select the **Notify Customer** check box if you want Razorpay to automatically send the Subscription Link to the customer via email to make the authorisation payment.
14. Set an expiry date for the link.
15. Add internal notes, if required.
16. Click **Next** once you have entered all the required details.

    **Handy Tips**

    If the **Notify Customer** check box is **not** selected, Razorpay does not send the customer the Subscription Link to make the authorisation payment.
17. Review the details and click **Create Subscription Link** to send the link to the customer.

## Create a Subscription Link Using API

You can create a Subscription Links using [Create a Subscription Link API](/razorpay-docs-md/api/payments/subscriptions/create-subscription-link.md).

### Related Information

- [Create and View Plans](/razorpay-docs-md/subscriptions/create-plans.md)
- [Charge a Card Manually](/razorpay-docs-md/subscriptions/manually-charge-card.md)
- [Update a Subscription](/razorpay-docs-md/subscriptions/update.md)
- [Subscriptions Settings](/razorpay-docs-md/subscriptions/settings.md)
