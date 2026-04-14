<!-- Source: https://razorpay.com/docs/payments/webstore/create -->

You can build a Webstore from your Dashboard to start accepting payments from customers. This method does not require any code or API integration.

**Prerequisites**

- [Sign up](https://easy.razorpay.com/onboarding/l1/signup?field=MobileNumber)

  for a Razorpay account.
- Log in to the Dashboard and complete the KYC requirements.
- The Dashboard has [test and live modes](/razorpay-docs-md/dashboard/test-live-modes.md)  . Use the test mode for a sandbox experience. You can switch to live mode when you are ready to accept payments. You will have to create a new Webstore in live mode.
- Understand the [Payment Flow](/razorpay-docs-md/payment-gateway/how-it-works.md)  .

## Steps

To create a Webstore, you must complete the following actions:

1. [Add Product Details](/razorpay-docs-md/webstore/create.md#step-1-add-product-details)
2. [Add Business Details](/razorpay-docs-md/webstore/create.md#step-2-add-business-details)
3. [Configure Page Settings](/razorpay-docs-md/webstore/create.md#step-3-configure-page-settings)
4. [Share and Start Accepting Payments](/razorpay-docs-md/webstore/create.md#step-4-share-and-start-accepting-payments)

### Step 1: Add Product Details

You can add your products and the accompanying details such as stock availability, description, images and so on in this section.

1. Log in to the Dashboard and navigate to **Payment Pages**.
2. Click the **+ Create Payment Page** button and click **Create Razorpay Webstore**.

   ![Select which product you want to use.](https://razorpay.com/docs/payments/webstore/build/browser/assets/images/pp-select-choice.jpg)
3. Click **Add products to this page** and then click **Add a new product**.
4. Add a **Product name**.

   **Product Name Character Limit**

   The product name cannot exceed 100 characters.
5. Add the **Price** of your product. In addition, you can add a **Discounted price**, which will serve as the final listed price for the product. Customers will see the following.

   ![Webstore Discounted price view](https://razorpay.com/docs/payments/webstore/build/browser/assets/images/store-discounted-price.jpg)
6. Add **Quantity in stock** if you have a limited quantity.
7. You can also upload up to five product images.
8. You can also add your product to a Category:

   1. Click on the Category drop-down and click **+Create new category**.
   2. Add a category name and click **Add category**.

      **Category Name Character Limit**

      The category name cannot exceed 100 characters.

      ![Adding category name for Webstores](https://razorpay.com/docs/payments/webstore/build/browser/assets/images/pp-category-name-add.jpg)
9. Add a brief description for your product if needed and click **Add product**.

   ![Webstore Product Addition Preview](https://razorpay.com/docs/payments/webstore/build/browser/assets/images/pp-store-product-addition.jpg)

### Step 2: Add Business Details

Add you contact details such as phone number and email in this section.

1. Click **More options**.

   ![Webstore More Options section](https://razorpay.com/docs/payments/webstore/build/browser/assets/images/pp-stores-more-options.jpg)
2. Enter you **Business email id**.
3. Enter your **Business phone no.** and click **Save contact details**.

   ![Webstore Business Contact Details](https://razorpay.com/docs/payments/webstore/build/browser/assets/images/pp-stores-business-contact.jpg)

### Step 3: Configure Page Settings

Customise your Webstore by adding a custom URL, adding an expiry date and so on through the **Page Settings** option.

1. Click **Page Settings**.
2. Add a unique URL slug in the **URL for this page** section.

   **Watch Out!**

   This is a mandatory step. You will not be able to create a Webstore if you do not add a unique URL slug.
3. You can add an expiry date for your Webstore.
4. You can also add a custom message for your customers and redirect to your preferred website after successful payment.
5. You can also configure Facebook Pixel and Google Analytics for your Webstore for metrics. Know more about how to add [Facebook Pixel and Google Analytics](/razorpay-docs-md/webstore/plugins-add-ons.md)

   to your Webstore.
6. Click **Save**.

   ![Configure Settings for your Webstore](https://razorpay.com/docs/payments/webstore/build/browser/assets/images/pp-store-settings.jpg)

### Step 4: Share and Start Accepting Payments

Share your Webstore with your customers and start accepting payments.

1. Click **Publish Page** to go live.
2. Click **Copy** to copy the URL to share with your customers. You can also find the URL on the Dashboard in the Webstore list.

   ![Webstore succesful creation.](https://razorpay.com/docs/payments/webstore/build/browser/assets/images/storefront-page-publish.jpg)

#### View Transaction Details on Dashboard

You can view the payments as and when they are made in the **Transactions** section.

1. Navigate to **Payment Pages** on the Dashboard and select **Razorpay Webstore**.
2. From the list, click the Webstore you wish to view.
3. Select the payment id you wish to check.

   ![Transactions list on Webstore.](https://razorpay.com/docs/payments/webstore/build/browser/assets/images/sp-transactions-view.jpg)
4. Once you open the payment id, you can check out the order details.

   ![Transaction Details](https://razorpay.com/docs/payments/webstore/build/browser/assets/images/sp-transaction-details.jpg)
5. Click the order id to view the address details of the customer.

   ![Order details of Webstore](https://razorpay.com/docs/payments/webstore/build/browser/assets/images/sp-order-details.jpg)

### Related Information

- [About Razorpay Webstore](/razorpay-docs-md/webstore.md)
- [How Razorpay Webstore Works](/razorpay-docs-md/webstore/how-it-works.md)
- [Webstore States](/razorpay-docs-md/webstore/states.md)
- [Search for Webstore](/razorpay-docs-md/webstore/search.md)
- [Manage Webstore](/razorpay-docs-md/webstore/manage.md)
