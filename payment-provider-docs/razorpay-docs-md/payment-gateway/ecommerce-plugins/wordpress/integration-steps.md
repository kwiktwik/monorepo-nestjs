<!-- Source: https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/wordpress/integration-steps -->

Follow the steps given below to integrate Razorpay Payment Gateway with your WordPress website.

#### 1. Build Integration

Install and configure the WordPress plugin.

#### 2. Test Integration

Test the integration by making a test payment.

#### 3. Go-Live Checklist

Check the go-live checklist.

## 1. Build Integration

Follow the steps given below:

1.1 Installation and Configuration

**Watch Out!**

This plugin does not support dynamic amount calculation from your webpage. You can accept only fixed amounts using this plugin. Explore our [WooCommerce plugin](/razorpay-docs-md/payment-gateway/ecommerce-plugins/woocommerce.md) or [Payment Button plugin](/razorpay-docs-md/payment-button/supported-platforms/wordpress.md) for your use case.

1. [Download the plugin](https://wordpress.org/plugins/razorpay-quick-payments/)

   from the WordPress Plugin Directory.
2. Open your WordPress site and navigate to **Plugins** → **Add New**.
3. Upload the plugin.

   ![Upload plugin screen](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/wordpress/build/browser/assets/images/ecommerce-plugins-wordpress-upload-plugin.jpg)
4. Click **Activate Plugin**.

   ![Activate plugin](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/wordpress/build/browser/assets/images/ecommerce-plugins-wordpress-activate-plugin.jpg)
5. Click **Settings**.

   ![Plugin settings](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/wordpress/build/browser/assets/images/ecommerce-plugins-wordpress-click-settings.jpg)
6. Make the following changes in the **Edit Settings** screen:
   1. Select **Enable Razorpay Payment Module**.
   2. Edit **Title** and **Description** as required.
   3. Add your [KEY\_ID] and [KEY\_SECRET]. These can be generated from your Razorpay Dashboard.
   4. Set the **Payment Action** to **Authorize and Capture** to auto-capture payments.
   5. Click **Save Changes**.

   ![Razorpay PG save settings](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/wordpress/build/browser/assets/images/ecommerce-plugins-wordpress-edit-settings.jpg)

1.2 Add Custom Fields

1. In your WordPress site, open the page or blog post where you want the button to appear.
2. Click the more icon and select **Preferences**.

   ![Select Preferences](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/wordpress/build/browser/assets/images/ecommerce-plugins-wordpress-options.jpg)
3. Click **Panels** and enable the **Custom Fields** checkbox in the **Additional** section. Now you will have the option to add custom fields on your page/blog post.

   ![Preferences custom fields](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/wordpress/build/browser/assets/images/ecommerce-plugins-wordpress-custom-fields.jpg)
4. Scroll down the current page till you see the **Custom fields** section.

   ![Custom field section](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/wordpress/build/browser/assets/images/ecommerce-plugins-wordpress-custom-fields-scroll.jpg)

   **Handy Tips**

   If you are using WordPress 4.8 or later, the custom fields can be added via **Screen Option**. If you are still not able to view the custom field, refer to the [FAQs](/razorpay-docs-md/payment-gateway/ecommerce-plugins/wordpress/faqs.md#1-i-am-unable-to-view-the-custom)   .
5. Add the following three custom fields as metadata:

   1. amount (in INR).
   2. name (name of the product).
   3. description (description of the product that is being sold).

   ![Custom fields amount name description](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/wordpress/build/browser/assets/images/ecommerce-plugins-wordpress-custom-fields-added.jpg)
6. Add the `[RZP]`(shortcode indicated by square brackets) in the content section to display the **Pay with Razorpay** button anywhere.

   ![RZP shortcode](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/wordpress/build/browser/assets/images/ecommerce-plugins-wordpress-shortcode.jpg)
7. Publish or update the page. The page appears with the **Pay with Razorpay** button.

   ![Razorpay checkout](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/wordpress/build/browser/assets/images/ecommerce-plugins-wordpress-checkout.gif)

   **Watch Out!**

   If the payment button does not appear, ensure the Button script is placed inside the `<form>` tag. This issue might be caused by certain cache plugins (for example, SpeedyCache) or Optimizer plugins (for example, SiteGround Optimizer). To resolve it, please deactivate these plugins. Once they are deactivated, the payment button should work properly.

## 2. Test Integration

After the integration, a **Pay** button will appear on your web page/app. You need to click the button and make a test transaction to ensure the integration works as expected. You can start accepting actual payments from your customers once the test is successful.

![Pay with Razorpay button](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/wordpress/build/browser/assets/images/wordpress-pay.jpg)

You can make test payments using one of the payment methods configured at the Checkout.

- No money is deducted from the customer's account as this is a simulated transaction.
- Ensure you have entered the API keys generated in the test mode in the Checkout code.

Supported Payment Methods

After the integration is complete, a **Pay** button appears on your webpage/app.

![Test integration on your webpage/app](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/wordpress/build/browser/assets/images/test-int.gif)

Click the button and make a test transaction to ensure the integration is working as expected. You can start accepting actual payments from your customers once the test transaction is successful.

**Watch Out!**

This is a mock payment page that uses your test API keys, test card and payment details.

- Ensure you have entered only your [Test Mode API keys](/razorpay-docs-md/dashboard/account-settings/api-keys.md#generate-api-keys)

  in the Checkout code.
- Test mode features a mock bank page with **Success** and **Failure** buttons to replicate the live payment experience.
- No real money is deducted due to the usage of test API keys. This is a simulated transaction.

Following are all the payment modes that the customer can use to complete the payment on the Checkout. Some of them are available by default, while others may require approval from us. Raise a request from the Dashboard to enable such payment methods.

You can make test payments using one of the payment methods configured at the Checkout.

Netbanking

You can select any of the listed banks. After choosing a bank, Razorpay will redirect to a mock page where you can make the payment `success` or a `failure`. Since this is Test Mode, we will not redirect you to the bank login portals.

Check the list of [supported banks](/razorpay-docs-md/payment-methods/netbanking.md#supported-banks).

UPI

You can enter one of the following UPI IDs:

- `success@razorpay`: To make the payment successful.
- `failure@razorpay`: To fail the payment.

Check the list of [supported UPI flows](/razorpay-docs-md/payment-methods/upi.md).

**Handy Tips**

You can use **Test Mode** to test UPI payments, and **Live Mode** for UPI Intent and QR payments.

Cards

You can use the following test cards to test transactions for your integration in Test Mode.

### Domestic Cards

Use the following test cards for Indian payments:

#### Error Scenarios

Use these test cards to simulate payment errors. See the [complete list](/razorpay-docs-md/payments/test-card-details.md#error-scenario-test-cards) of error test cards with detailed scenarios.
Check the following lists:

- [Supported Card Networks](/razorpay-docs-md/payment-methods/cards.md)

  .
- [Cards Error Codes](/docs/errors/payments/cards/)

  .

### International Cards

Use the following test cards to test international payments. Use any valid expiration date in the future in the MM/YY format and any random CVV to create a successful payment.

Check the list of [supported card networks](/razorpay-docs-md/payment-methods/cards.md).

Wallet

You can select any of the listed wallets. After choosing a wallet, Razorpay will redirect to a mock page where you can make the payment `success` or a `failure`. Since this is Test Mode, we will not redirect you to the wallet login portals.

Check the list of [supported wallets](/razorpay-docs-md/payment-methods/wallets.md#supported-wallets).

Verify Payment Status

**Handy Tips**

On the Razorpay Dashboard, ensure that the payment status is `captured`. Refer to the payment capture settings page to know how to [capture payments automatically](/razorpay-docs-md/payments/capture-settings.md).

You can track the payment status in three ways:

Verify Status from Dashboard

Subscribe to Webhook Events

Poll APIs

To verify the payment status from the Razorpay Dashboard:

1. Log in to the Razorpay Dashboard and navigate to **Transactions** → **Payments**.
2. Check if a **Payment Id** has been generated and note the status. In case of a successful payment, the status is marked as **Captured**.

![Payment details on Dashboard](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/wordpress/build/browser/assets/images/testpayment.jpg)

## 3. Go-live Checklist

Follow these steps before taking the integration live:

3.1 Accept Live Payments

Perform an end-to-end simulation of funds flow in the Test Mode. Once confident that the integration is working as expected, switch to the Live Mode and start accepting payments from customers.

**Watch Out!**

Ensure you are switching your test API keys with API keys generated in Live Mode.

To generate API Keys in Live Mode on your Razorpay Dashboard:

1. Log in to the Razorpay Dashboard and switch to **Live Mode** on the menu.
2. Navigate to **Account & Settings** → **API Keys** → **Generate Key** to generate the API Key for Live Mode.
3. Download the keys and save them securely.
4. Replace the Test API Key with the Live Key in the Checkout code and start accepting actual payments.

3.2 Payment Capture

After payment is `authorized`, you need to capture it to settle the amount to your bank account as per the settlement schedule. Payments that are not captured are auto-refunded after a fixed time.

**Watch Out**

- You should deliver the products or services to your customers only after the payment is captured. Razorpay automatically refunds all the uncaptured payments.
- You can track the payment status using our [Fetch a Payment API](/razorpay-docs-md/api/payments.md#fetch-a-payment)

  or webhooks.

Auto-capture Payments (Recommended)

Manually Capture Payments

Authorized payments can be automatically captured. You can auto-capture all payments [using global settings](/razorpay-docs-md/payments/capture-settings.md#auto-capture-all-payments) on the Razorpay Dashboard. Know more about [capture settings for payments](/razorpay-docs-md/payments/capture-settings.md).

**Watch Out!**

Payment capture settings work only if you have integrated with Orders API on your server side. Know more about the [Orders API](/razorpay-docs-md/api/orders/create.md).
