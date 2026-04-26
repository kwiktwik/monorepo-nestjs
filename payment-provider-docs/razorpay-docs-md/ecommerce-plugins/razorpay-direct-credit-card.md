<!-- Source: https://razorpay.com/docs/payments/ecommerce-plugins/razorpay-direct-credit-card -->

Follow the steps given below to integrate credit card payment with your Shopify store directly on the checkout page using Razorpay Direct - Credit Card plugin.

#### 1. Build Integration

Install and configure the Razorpay Direct - Credit Card plugin.

#### 2. Test Integration

Test the integration by making a test payment.

#### 3. Go-Live Checklist

Check the go-live checklist.

Before you proceed:

- Create a [Razorpay account](https://dashboard.razorpay.com/signup)  .
- Create a [Shopify account](https://www.shopify.in)  .
- Understand the [payment flow](/razorpay-docs-md/payment-gateway/how-it-works.md)

  process.

## 1. Build Integration

Install the plugin

1. **Install** [Razorpay Direct - Credit Card](https://apps.shopify.com/razorpay-cc-prod)

   from the Shopify app store.

   ![Activate Razorpay Direct - Credit Card plugin](https://razorpay.com/docs/payments/ecommerce-plugins/build/browser/assets/images/shopify-store-cc-plugin-install.jpg)

   **Handy Tips**

   If you have multiple stores, select the store for which you want to install the Razorpay Direct - Credit Card.
2. You will be redirected to the Shopify home screen. Click **Install app**.

   ![Shopify install app](https://razorpay.com/docs/payments/ecommerce-plugins/build/browser/assets/images/shopify-cc-installapp.jpg)
3. You will be redirected to a landing page. Click **I am an existing user** and log in to your Razorpay account.

   ![Shopify auth for existing Razorpay user](https://razorpay.com/docs/payments/ecommerce-plugins/build/browser/assets/images/shopify-cc-auth.gif)

   **Handy Tips**

   - Ensure you log in with **owner** credentials to connect Razorpay with Shopify successfully.
   - If you are a new Razorpay user, click **I am new to Razorpay** and [set up](/razorpay-docs-md/set-up.md)

     an account.
4. Click **Activate Razorpay Direct - Credit Card** on the activation screen on your Shopify Dashboard.

   ![Activate Razorpay Direct - Credit Card plugin](https://razorpay.com/docs/payments/ecommerce-plugins/build/browser/assets/images/shopify-activate-cc-plugin.jpg)

Razorpay Direct - Credit Card Plugin now appears as a payment method on your Shopify Store.

![Enabled credit card plugin on shopify store](https://razorpay.com/docs/payments/ecommerce-plugins/build/browser/assets/images/shopify-cc-plugin-store.jpg)

**Handy Tips**

- Webhooks is auto-configured. You need to verify if webhooks are enabled on your [Dashboard](/razorpay-docs-md/ecommerce-plugins/razorpay-direct-credit-card/troubleshooting-faqs.md#7-how-can-i-verify-if-webhooks-are)  .
- The `order.paid`, `payment.authorized`, `refund.processed` and `refund.failed` events are auto-configured. You do not have to configure it on the Dashboard.

## 2. Test Integration

After the integration is complete, you need to ensure that the integration is working as expected. You can start accepting actual payments from your customers once the test mode transaction is successful.

Test Transaction in Test Mode

Follow the steps given below to test a transaction in test mode:

1. Log in to your [Shopify store](https://accounts.shopify.com/lookup?rid=f19e1541-cd24-4856-a398-156d2ed5d56f)   .
2. Navigate to **Settings** → **Payments**.
3. Click **Manage** on the **Razorpay Direct - Credit Card** app.

   ![edit settings on the plugin to enable test mode](https://razorpay.com/docs/payments/ecommerce-plugins/build/browser/assets/images/shopify-cc-test-navigation.jpg)
4. At the bottom of the page, select the **Enable test mode** check box and click **Save**.

   ![Enable test mode to test the flow](https://razorpay.com/docs/payments/ecommerce-plugins/build/browser/assets/images/shopify-cc-enable-test-mode.jpg)
5. On your Shopify store, add an item to your cart and click **Buy it now**.
6. Fill in your **contact** and **shipping** details and click **Continue to shipping**.
7. Select the **Shipping method** and click **Continue to payment**.
8. Select **Credit card** and enter the card details.
9. Click **Pay now** and complete the order.

   ![Test Razorpay Direct - Credit Card plugin](https://razorpay.com/docs/payments/ecommerce-plugins/build/browser/assets/images/shopify-cc-test.gif)

Verify Payment Status

You can track the payment status from the Razorpay Dashboard or poll our APIs.

Verify Payment Status From Dashboard

Poll APIs

1. Log in to the Dashboard and navigate to **Transactions** → **Payments**.
2. Check if a `payment_ID` has been generated and note the status. In case of a successful payment, the status is marked as `captured`.

![Verify the transaction status from the Razorpay Dashboard](https://razorpay.com/docs/payments/ecommerce-plugins/build/browser/assets/images/shopify-cc-verify-transactions.jpg)

## 3. Go-live Checklist

Follow these steps before taking the integration live:

Switch from Test Mode to Live Mode

You can perform an end-to-end simulation of funds flow in the Test Mode. Once confident that the installation and integration is working as expected, switch to the Live Mode and start accepting payments from customers.

To switch from Test Mode to Live Mode:

1. Log in to your [Shopify store](https://accounts.shopify.com/lookup?rid=f19e1541-cd24-4856-a398-156d2ed5d56f)   .
2. Navigate to **Settings** → **Payments**.
3. On the **Supported payment methods** section, click **Manage** on the **Razorpay Direct - Credit Card** app.
4. At the bottom of the page, clear the **Enable test mode** check box and click **Save**.

   ![Disable test mode to start accepting payments from customers](https://razorpay.com/docs/payments/ecommerce-plugins/build/browser/assets/images/shopify-cc-live.jpg)

You can now start accepting actual payments on your Shopify store.

## Refunds

#### Initiate Refunds

To initiate refunds using Shopify store:

1. Log in to the [Shopify account](https://www.shopify.in)   .
2. After a payment is completed, navigate to **Orders**.
3. Select the order you want to initiate a refund.

   ![Select the order to initiate refund](https://razorpay.com/docs/payments/ecommerce-plugins/build/browser/assets/images/shopify-cc-orders.jpg)
4. Click **Refund**.

   ![Initiate refund](https://razorpay.com/docs/payments/ecommerce-plugins/build/browser/assets/images/shopify-cc-refund.jpg)
5. Select the quantity of the item and click **Refund**.
6. You can either issue a full refund or a partial refund.
   - For a **full refund**, enter the entire payment amount.
   - For a **partial refund**, enter a value lesser than the payment amount.

     ![Refund the order](https://razorpay.com/docs/payments/ecommerce-plugins/build/browser/assets/images/shopify-cc-refund-order.jpg)
7. You can verify the refund status from the Dashboard. Navigate to **Transactions** → **Refunds** and check if a **Refund Id** is generated for the relevant Payment Id.

   ![Verify refund status on the Razorpay Dashboard](https://razorpay.com/docs/payments/ecommerce-plugins/build/browser/assets/images/shopify-cc-refund-verify.jpg)

## Support

If you have queries, raise a ticket on the [Razorpay Support Portal](https://razorpay.com/support/).

### Related Information

- [Troubleshooting and FAQs](/razorpay-docs-md/ecommerce-plugins/razorpay-direct-credit-card/troubleshooting-faqs.md)
- [Ecommerce Plugins](/razorpay-docs-md/payment-gateway/ecommerce-plugins.md)
