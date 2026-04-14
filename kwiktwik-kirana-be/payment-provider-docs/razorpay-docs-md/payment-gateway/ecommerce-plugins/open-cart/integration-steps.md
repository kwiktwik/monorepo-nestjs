<!-- Source: https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/open-cart/integration-steps -->

Follow the steps given below to integrate Razorpay Payment Gateway with your OpenCart Extension.

#### 1. Build Integration

Install and configure the OpenCart plugin.

#### 2. Test Integration

Test the integration by making a test payment.

#### 3. Go-Live Checklist

Check the go-live checklist.

## 1. Build Integration

Follow the steps given below:

1.1 Install Plugin

1. Download the latest Source code zip file of the required version of the plugin.
2. Download the latest release of the OpenCart 4 plugin from the [Releases section](https://github.com/razorpay/razorpay-opencart/releases)

   in GitHub. Tags for OpenCart 4 are opencart4-6.x.y.

   **Watch Out!**

   When installing the Razorpay plugin for Opencart 4, ensure that your zip folder only contains the following folders and file, with no hidden files:

   - `admin/`
   - `catalog/`
   - `system/`
   - `install.json`
3. Download the latest release of the OpenCart 3 plugin from the [Releases section](https://github.com/razorpay/razorpay-opencart/releases)

   in GitHub. Tags for OpenCart 3 are opencart3-1.x.y.
4. For OpenCart 2, [download this release](https://github.com/razorpay/razorpay-opencart/releases/tag/opencart2-3.0.0)

   from GitHub. Tags for OpenCart 2 are opencart2-3.x.y.
5. For OpenCart 1.5, [download this release](https://github.com/razorpay/razorpay-opencart/releases/tag/opencart1.5-1.0.0)

   from GitHub. Tags for OpenCart 1.5 are opencart1.5-1.x.y.
6. Navigate to **Extensions** → **Installer** and click **Upload**. Choose the zip file.

1.2 Configure OpenCart

Configure OpenCart as given below:

1. Log in to [OpenCart](https://www.opencart.com/)   .
2. Navigate to the **Admin Panel** → **Extensions** → **Payments** to install the Razorpay Payment Gateway extension.
3. Click **Edit**. Complete the following steps:

   1. Add in your Key\_ID and Key\_Secret generated from the Razorpay Dashboard.
   2. Change extension status to **Enabled**.
   3. Click **Save** to save the extension settings.

   **Handy Tips**

   Webhook is auto-configured on OpenCart 3 (versions 5.0.0 and above) and OpenCart 4 when you enter and save the API key ID and secret on the plugin settings page. You need to verify if webhooks are enabled on your Razorpay [Dashboard](/razorpay-docs-md/payment-gateway/ecommerce-plugins/open-cart/troubleshooting-faqs.md#2-how-can-i-verify-if-webhooks-are)   .
   However, for versions lower than 5.0.0, you must [configure webhooks manually](/razorpay-docs-md/payment-gateway/ecommerce-plugins/open-cart/troubleshooting-faqs.md#1-my-webhooks-are-not-auto-configured-since-i)   .

   #### [Create Cron for OpenCart 3](/razorpay-docs-md/payment-gateway/ecommerce-plugins/open-cart/integration-steps.md#Create Cron for OpenCart 3)

   Create a Cron for Webhook using cpanel, follow the steps given below:

   1. Log on to your cPanel Interface.
   2. Go to **Advanced** section.
   3. Click **Cron Jobs**.
   4. Select the specific time from the lists provided (every 5 minutes).
   5. Enter `https://<shop_url>/index.php?route=extension/payment/razorpay/rzpWebhookCron/` in the **Command** field.

   For more information about Cron, refer to [OpenCart Crons](https://docs.opencart.com/developer-guide/cron-jobs)   .

## 2. Test Integration

After the integration, Razorpay will appear as a payment option on your webpage/app. You need to click the button and make a test transaction to ensure the integration works as expected. You can start accepting actual payments from your customers once the test is successful.

![Open Cart](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/open-cart/build/browser/assets/images/pg-opencart-plugin-test.jpg)

You can make test payments using one of the payment methods configured at the Checkout.

- No money is deducted from the customer's account as this is a simulated transaction.
- Ensure you have entered the API keys generated in the test mode in the Checkout code.

Supported Payment Methods

After the integration is complete, a **Pay** button appears on your webpage/app.

![Test integration on your webpage/app](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/open-cart/build/browser/assets/images/test-int.gif)

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

   ![Payment details on Dashboard](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/open-cart/build/browser/assets/images/testpayment.jpg)

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
