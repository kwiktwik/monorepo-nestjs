<!-- Source: https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/shopify-cod -->

**Watch Out!**

This is an on-demand feature. Write to us at [[magic-checkout-support@razorpay.com](mailto:magic-checkout-support@razorpay.com)](mailto:magic-checkout-support@razorpay.com)

to integrate Razorpay - Cash on Delivery with your Shopify website.

**Before you proceed:**

- Sign up for [Razorpay account](https://dashboard.razorpay.com/signup)

- Sign up for a [Shopify account](https://www.shopify.in)  .

Follow the steps given below to integrate your Shopify website with the Razorpay - Cash on Delivery plugin.

#### 1. Build Integration

Install and configure the Shopify COD plugin.

#### 2. Test Integration

Test the integration by making a test payment.

#### 3. Go-Live Checklist

Check the go-live checklist.

## 1. Build Integration

Follow the steps given below:

1.1 Integration Steps

**Handy Tips**

If you are an existing Razorpay user, you can directly begin the integration process from step 4.

1. [Sign up](https://dashboard.razorpay.com/signup?)

   for a Razorpay account.
2. Submit your KYC, and if we need any further clarification, we will reach out to you on WhatsApp, SMS and email. Once our team completes KYC verification and you are enabled to accept payments, we will send a confirmation on WhatsApp, SMS and email.
3. Create a [Shopify account](https://www.shopify.in)   .
4. **Install** [Razorpay - Cash on Delivery](https://apps.shopify.com/razorpay-cash-on-delivery)

   from the Shopify app store.

   ![Shopify App Install](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/build/browser/assets/images/shopify-store-cod-install.jpg)

   **Handy Tips**

   If you have multiple stores, select the store for which you want to install Razorpay - Cash on Delivery.
5. You will be redirected to Shopify home screen. Click **Install app**.

   ![Shopify Install](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/build/browser/assets/images/shopify-cod-install.jpg)

   You will be redirected to a landing page. Click **I am an existing user**.

   ![Existing Merchant Shopify](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/build/browser/assets/images/shopify-cod-existing-merchant.jpg)
6. Scroll down and click **Login**. Log in to the Razorpay Dashboard.

   **Handy Tips**

   Make sure you log in with **owner** credentials to connect Razorpay with Shopify successfully.

   ![Shopify login](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/build/browser/assets/images/shopify-login-v2.gif)
7. Click **Activate Razorpay - Cash on Delivery** on the activation screen on your Shopify Dashboard.

   ![Shopify Authorize](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/build/browser/assets/images/cod-activate-rzp-new.jpg)

Razorpay - Cash on Delivery now appears as a Payment Gateway on your Shopify Store checkout.

![Shopify Checkout](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/build/browser/assets/images/shopify-cod-v2-checkout.jpg)

This completes your integration. For more information, see [Shopify FAQs](/razorpay-docs-md/payment-gateway/ecommerce-plugins/shopify/faqs.md).

## 2. Test Integration

After the integration is complete, follow the steps given below:

2.1 Enable Test Mode in Shopify Dashboard

After the integration is complete, you need to ensure the integration is working as expected. You can start accepting actual payments once the test mode transaction is successful.

Follow the steps given below to test a transaction:

1. Log in to [Shopify store](https://accounts.shopify.com/lookup?rid=f19e1541-cd24-4856-a398-156d2ed5d56f)   .
2. Navigate to **Settings** → **Payments**.
3. Click **Manage** on the Razorpay - Cash on Delivery app on the **Supported payment methods** section.

   ![Shopify go live v2](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/build/browser/assets/images/shopify-cod-go-live-v2.jpg)
4. Select **Enable test mode** and click **Save**.

   ![Shopify go live v2 save test](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/build/browser/assets/images/shopify-cod-go-live-test.jpg)

2.2 Make a Test Payment

1. Click **Buy it now**.

   ![Shopify checkout](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/build/browser/assets/images/buy-now-shopify-cod.jpg)
2. Fill in your **Contact** and **Delivery** details.

   ![Shopify contact details](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/build/browser/assets/images/cod-shipping-contact-details.jpg)

   Select **Cash on Delivery** as Payment method and select **Billing address**.

   ![Shopify contact details](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/build/browser/assets/images/shopify-cod-shipping-contact-details1.jpg)
3. Click **Pay now** and the order is placed.

2.3 Verify Payment Status

You can track the payment status from the Razorpay Dashboard, subscribe to the Webhook event or poll our APIs.

**Verify Payment Status From Dashboard**

1. Log in to the Dashboard and navigate to **Transactions** → **Payments**.
2. Check if a `payment_ID` has been generated and note the status. In case of a successful payment, the status is marked as `captured`.

## 3. Go-live Checklist

Follow these steps before taking the integration live:

3.1 Switch from Test mode to Live mode

You can perform an end-to-end simulation of funds flow in the Test Mode. Once confident that the installation and integration is working as expected, switch to the Live Mode and start accepting payments from customers.

To switch from **Test Mode** to **Live Mode**:

1. Log in to your [Shopify store](https://accounts.shopify.com/lookup?rid=f19e1541-cd24-4856-a398-156d2ed5d56f)   .
2. Navigate to **Settings** → **Payments**.
3. On the **Supported payment methods** section, click **Manage** on the **Razorpay - Cash on Delivery** app.

   ![Shopify go live v2](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/build/browser/assets/images/shopify-cod-go-live-v2.jpg)
4. Clear **Enable test mode** and click **Save**.

   ![Shopify go live v2 save](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/build/browser/assets/images/shopify-cod-go-live-test.jpg)

You can now start accepting actual payments on your Shopify store.

## Support

Queries: If you have queries, raise a ticket on the [Razorpay Support Portal](https://razorpay.com/support/)

### Related Information [Shopify - 1 Razorpay](/razorpay-docs-md/payment-gateway/ecommerce-plugins/shopify.md)
