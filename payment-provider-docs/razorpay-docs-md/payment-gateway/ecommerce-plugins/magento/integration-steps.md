<!-- Source: https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/magento/integration-steps -->

Follow the steps given below to integrate Razorpay Payment Gateway with your Magento website.

#### 1. Build Integration

Install the Magento plugin.

#### 2. Test Integration

Test the integration by making a test payment.

#### 3. Go-Live Checklist

Check the go-live checklist.

## 1. Build Integration

Follow the steps given below to integrate Razorpay Payment Gateway with your Magento 1.x and 2.x Extensions.

Integration Steps for Magento 1.x Extension

Step 1: Download and Install via Repository

Follow the steps given below to download and install Magento 1.x Extension.

#### Download Repository

1. [Download](https://github.com/razorpay/razorpay-magento-v1/releases/latest)

   the `Razorpay-1.2.1.tgz` file from the latest release.
2. If you have **Onepage Checkout (IWD or Fire Checkout)**, [download](https://github.com/razorpay/razorpay-magento-v1/releases/latest)

   the Source Code zip from the latest release. With Onepage Checkout you can gather the required information from the shopper and complete the checkout process quickly. When Onepage Checkout is enabled, the entire checkout process takes place on a single page.

### Install Repository

You can install the repository in two ways:

Install via Magento Connect

Install Without Magento Connect

1. Go to Magento Connect Manager.
2. Go to `Direct package file upload`.
3. Click `Choose File` and select the TGZ file from Step 1.
4. Click `upload`.

Once installed, navigate to **Configuration** and then to **Payment Gateways** and [configure the extension](/razorpay-docs-md/payment-gateway/ecommerce-plugins/magento/integration-steps.md#step-2-configure-magento-store-1x) to suit your needs.

Step 2: Configure Magento Store 1.x

To configure your Magento store for Razorpay:

1. Log in to your [Magento store](https://business.adobe.com/products/magento/magento-commerce.html/)   .
2. Click on the **System** tab and then select **Configuration** option from the drop-down list.

   ![](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/magento/build/browser/assets/images/ecommerce-plugins-magento1.x-3.jpg)
3. Click **Payment Methods** in the menu panel.
4. Scroll down. Click **Razorpay** and enter your test mode `[KEY_ID]` and `[KEY_SECRET]`.

   ![](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/magento/build/browser/assets/images/ecommerce-plugins-magento1.x-4.jpg)
5. Select **Yes** for the **Enabled** option.
6. Click **Save Config** button. This activates your account in the Test Mode. You can use this account to make a few test payments to ensure a successful workflow.

**Handy Tips**

In test mode, no real money is deducted from your account.

Integration Steps for Magento 2.x Extension

Step 1: Download and Install Extension

You can install the extension through two ways:

Install Using Composer

Install Without Composer

1. Install the extension on your Magento store using the Composer Package Manager. Composer is an application-level package manager for the PHP programming language that provides a standard format for managing dependencies of PHP software and required libraries.
2. Go to your installation root directory of Magento and execute the following command:

   Command

   copy

   ```bash
composer require razorpay/magento
bin/magento module:enable Razorpay_Magento
```
3. You can check if the installation was successful by executing the following command in the Magento root directory.

   Command

   copy

   ```bash
bin/magento module:status
```

   **Handy Tips**

   You should see `Razorpay_Magento` in the status. It might appear on the disabled modules list.
4. Enable and deploy the Razorpay module using commands:

   Command

   copy

   ```bash
bin/magento module:enable Razorpay_Magento
bin/magento setup:di:compile
bin/magento setup:upgrade
bin/magento cache:flush
bin/magento setup:static-content:deploy
```

**Upgrade Magento Extension**

If you are an existing extension user, you can [upgrade](/razorpay-docs-md/payment-gateway/ecommerce-plugins/magento.md#upgrade-magento-extension) to the latest version using the composer.

Step 2: Configure Magento Store 2.x

To configure your Magento store for Razorpay:

1. Log in to your [Magento store](https://business.adobe.com/products/magento/magento-commerce.html/)   .
2. Choose **Stores** on the Admin sidebar to the left. Now go to **Settings** → **Configuration**.

   ![](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/magento/build/browser/assets/images/plugins-magento-magento-2.x-1.jpg)
3. In the **Configuration** page, click on **Sales** on the left and choose **Payment Methods**.

   ![](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/magento/build/browser/assets/images/plugins-magento-magento-2.x-2.jpg)
4. In the **Payment Methods** page, navigate to Razorpay.

   ![](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/magento/build/browser/assets/images/plugins-magento-magento-2.x-1.jpg)
5. Enter your test mode [KEY\_ID] and [KEY\_SECRET]. These can be [generated from the Razorpay Dashboard](/razorpay-docs-md/api/authentication.md#generate-api-keys)   .
6. Select **Yes** for the option **Enabled**.
7. Click **Save Config**. This activates your account in the test mode. You can use this account to make a few test payments and ensure a successful workflow.

**Handy Tips**

In test mode, no real money is deducted from your account.

Step 3: Set Up Webhooks

Webhooks are triggered when certain events occur. Subscribe to webhook events to receive notification (in the form of a webhook payload) when these events occur.

Setting up webhooks makes your integration more robust, and guards against issues arising from poor connectivity. The webhook URL is available on the plugin's settings page. You must copy it from there and use it to set up webhook on the Razorpay Dashboard.

**Handy Tips**

- If you are using Magento plugin version 3.4.1, ensure the webhook delay is set to a minimum of 300 seconds.
- Webhook is auto-configured on Magento plugin version 3.8.1-beta and above. For versions lower than 3.8.1-beta, you should [configure webhooks manually](/razorpay-docs-md/payment-gateway/ecommerce-plugins/magento/integration-steps.md#step-3-set-up-webhooks)  .

To set up webhooks in the Razorpay Dashboard:

1. Log in to the Razorpay Dashboard.
2. Navigate to **Accounts & Settings** → **Webhooks**.
3. Click + Add New Webhook.
4. In the Webhook Setup modal:
   - Paste the URL copied from the Magento site.

     **Handy Tips**

     Webhooks can only be delivered to public URLs. If you attempt to save a localhost endpoint as part of a webhook set-up, you will notice an error. Please refer to the [test webhooks](/docs/webhooks/validate-test/)

     section for alternatives to localhost.
   - Enter the Secret you had provided on the Magento site. The secret is used to validate that the webhook is from Razorpay. Do not expose the secret publicly. Know more about [webhooks validation](/docs/webhooks/validate-test/#validate-webhooks)     .
   - In the **Alert Email field**, enter the email address to which notifications must be sent in case of webhook failure.
   - Select only the `order.paid` event from the list of **Active Events**.
5. Click **Create Webhook**.

Know more about [webhooks](/docs/webhooks/).

**Handy Tips**

If the notification says Razorpay table is not set up correctly, please contact our [Support team](https://razorpay.com/support/).

Step 4: Set Up Cron With Magento

Setup cron with Magento to execute Razorpay cronjobs for the following actions:

**Cancel Pending Orders**

It will cancel the order created by Razorpay according to the timeout saved in the configuration if Cancel Pending Order is enabled.

**Update Order to Processing**

Accepts response from Razorpay Webhook for events `payment.authorized` and `order.paid` and updates pending order to processing.

Install Magento cron jobs using the command:

Command

copy

```bash
bin/magento cron:install
```

## 2. Test Integration

After the integration, a **Pay** button will appear on your web page/app. You need to click the button and make a test transaction to ensure the integration works as expected. You can start accepting actual payments from your customers once the test is successful.

![](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/magento/build/browser/assets/images/magento-pay.jpg)

You can make test payments using one of the payment methods configured at the Checkout.

- No money is deducted from the customer's account as this is a simulated transaction.
- Ensure you have entered the API keys generated in the test mode in the Checkout code.

Supported Payment Methods

After the integration is complete, a **Pay** button appears on your webpage/app.

![Test integration on your webpage/app](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/magento/build/browser/assets/images/test-int.gif)

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

You can track the payment status from the Dashboard or by polling APIs.

Verify Payment Status From Dashboard

Poll APIs

1. Log in to the Razorpay Dashboard and navigate to **Transactions** → **Payments**.
2. Check if a `payment_ID` has been generated and note the status. In case of a successful payment, the status is marked as `captured`.

   ![Payment details on Dashboard](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/magento/build/browser/assets/images/testpayment.jpg)

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
