<!-- Source: https://razorpay.com/docs/payments/webstore/manage -->

You can perform the following actions:

- [Edit Webstore Content](/razorpay-docs-md/webstore/manage.md#edit-webstore-content)
- [Update Stock](/razorpay-docs-md/webstore/manage.md#update-stock)
- [Edit Webstore Settings](/razorpay-docs-md/webstore/manage.md#edit-webstore-settings)
- [Deactivate Webstore](/razorpay-docs-md/webstore/manage.md#deactivate-webstore)

## Edit Webstore Content

To edit content:

1. Navigate to **Payment Pages** on the Dashboard and select **Razorpay Webstore**.
2. From the list, select the Webstore you want to modify.
3. In the top right corner, click the **Edit Page** button.

   ![Edit Button - Manage Webstore](https://razorpay.com/docs/payments/webstore/build/browser/assets/images/payment-pages-v3-update_stock.jpg)

The Webstore appears in edit mode. You can now edit any of the fields to update the details, including the price fields.

You can update the stock quantity of a price field, for example `Individuals Entry Ticket`, in the edit mode of the Webstore.

To update stock:

1. Navigate to **Payment Pages** on the Dashboard and select **Razorpay Webstore**.

   ![Dashboard Page type selection](https://razorpay.com/docs/payments/webstore/build/browser/assets/images/dashboard-pp-page-selection.jpg)
2. Select the Webstore you want to modify.
3. In the top right corner, the different price fields are displayed. Click **Update Stock** against the relevant price item.
4. You can either make the stock quantity unlimited, using **No Limit**, or enter an amount in the box given below.
5. Click **Save**.

![Save Button - Update Stock - Manage Webstore](https://razorpay.com/docs/payments/webstore/build/browser/assets/images/payment-pages-v3-update_stock.jpg)

## Edit Webstore Settings

To modify Webstore settings:

1. Navigate to **Payment Pages** on the Dashboard and select **Razorpay Webstore**.
2. Click on the Webstore id. This opens the Webstore details panel where you can perform the following actions:

![Modify Settings - Manage Webstore](https://razorpay.com/docs/payments/webstore/build/browser/assets/images/payment-pages-v3-edit_pp_2.jpg)

**Best Practices**

- To avoid confusion, ensure that no two Webstores have the same **Title**.
- You can edit an expired or inactive Webstore and republish it with new changes. This helps avoid Webstore duplication and allows you to query the system efficiently.

## Deactivate Webstore

A Webstore can have two states, active and inactive.

You can make an existing Webstore inactive if you no longer wish to accept payments using it.

### Manual Deactivation

To deactivate manually:

1. Log in to Dashboard and navigate to **Payment Pages**.
2. Select **Razorpay Webstore**.
3. From the list, click the Webstore that you want to deactivate.
4. In the Webstore details screen, go to **Page Status** field and click **Deactivate**.
5. In the dialog box that appears, confirm the action by clicking the **Yes, deactivate** button.

![Deactivate Button - Manage Webstore](https://razorpay.com/docs/payments/webstore/build/browser/assets/images/payment-pages-v3-edit_pp.jpg)

### Deactivation Using Expiry Date

You can also automate Webstore deactivation by setting an expiry date. You can set expiry date:

- At the time of Creation
- After Creation

#### At the Time of Creation

Know how to [set the Webstore's expiry date](/razorpay-docs-md/webstore/create.md#step-3-configure-store-settings) at the time of creation.

#### After Creation

To set the expiry mode:

1. Navigate to the Dashboard → **Payment Pages**.
2. Select **Razorpay Webstore**.
3. From the list, click the Webstore that you want to set expiry for.
4. In the Webstore details screen, go to **Expires On** field and click **Change**.
5. The field now shows a **No Expiry** checkbox selected. Unselect the box for the calendar to appear.
6. In the calendar, set the date and time of expiry and click **Save**.

![Save Button - Expiry Date - Manage Webstore](https://razorpay.com/docs/payments/webstore/build/browser/assets/images/payment-pages-v3-edit_pp_2.jpg)

**Handy Tips**

The expiry time must be at least 15 minutes after current time.

### Related Information

- [Create a Razorpay Webstore](/razorpay-docs-md/webstore/create.md)
- [Search for Webstore](/razorpay-docs-md/webstore/search.md)
