<!-- Source: https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/drupal-commerce/integration-steps -->

Follow the steps given below to integrate Razorpay Payment Gateway with your Drupal Commerce website.

#### 1. Build Integration

Install and configure the Drupal Commerce plugin.

#### 2. Test Integration

Test the integration by making a test payment.

#### 3. Go-Live Checklist

Check the go-live checklist.

## 1. Build Integration

Follow the steps given below:

1.1 Download and Upload Plugin

To upload the plugin:

1. [Download](https://github.com/razorpay/drupal_commerce_razorpay/releases)

   the `drupal_commerce_razorpay.zip`.
2. Log in to your [Drupal Commerce account](https://drupal.plugin.razorpay.in/)

   and navigate to **Extend**.

   ![Navigate to Extend on Drupal](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/drupal-commerce/build/browser/assets/images/drupal-extend.jpg)
3. Click **+ Add new module**.
4. Add the module from **URL** or click **Choose file** and select the .zip file downloaded previously.
5. Click **Continue**.

![Add/upload drupal .zip file/URL](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/drupal-commerce/build/browser/assets/images/add-drupal-plugin1.gif)

You have successfully uploaded the plugin.

**Handy Tips**

Alternatively, you can skip this step and simply run `composer require 'drupal/drupal_commerce_razorpay:^1.0'` in your drupal directory to download the plugin. You can view the downloaded file in the `contrib` folder.

1.2 Install Plugin

To install the plugin:

1. On your Drupal Commerce Dashboard, navigate to **Extend**.
2. Search for **Razorpay** in the **Filter** section.
3. Select **Commerce Razorpay** and click **Install**.

![Install drupal plugin](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/drupal-commerce/build/browser/assets/images/drupal-install-plugin.jpg)

1.3 Configure Plugin

To configure the plugin:

1. On your Drupal Commerce Dashboard, navigate to **Commerce**.
2. Click **Configuration**.

   ![Navigate to commerce to configure the plugin](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/drupal-commerce/build/browser/assets/images/drupal-commerce-config.jpg)
3. In the **Payment** section, select **Payment gateways**.

   ![Configure the payment gateway](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/drupal-commerce/build/browser/assets/images/drupal-config-pg.jpg)
4. Click **+ Add payment gateway**.

   ![Add the payment gateway](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/drupal-commerce/build/browser/assets/images/drupal-config-add-pg.jpg)
5. In the **Name** section, enter **Razorpay** and select **Razorpay** as the **Plugin**.
6. Select **Test** Mode to test the integration and enter the test **Key ID** and **Secret** generated from the Razorpay [Dashboard](/razorpay-docs-md/api/authentication.md#generate-api-keys)   .

   **Handy Tips**

   To go live with the integration and start accepting real payments:

   - Select **Live** Mode.
   - Generate [Live Mode API Keys](/razorpay-docs-md/api/authentication.md#live-mode-api-keys)

     and replace the test keys with the live keys in the integration. Click **Save**.

   ![Switch to live mode](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/drupal-commerce/build/browser/assets/images/drupal-live-mode.jpg)
7. Select the **Payment Action** based on your requirement. Set the Payment Action to **Authorize and Capture** to auto-capture payments. If you want to capture payments manually, set the Payment Method to **Authorize**.
8. Select **Enabled** in the **Status** section.
9. Click **Save**.

   ![Configure the Razorpay payment gateway](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/drupal-commerce/build/browser/assets/images/drupal-config.gif)

**Handy Tips**

If you want to edit any fields, navigate to **Commerce** → **Configuration**. Select **Payment Gateway** and click **Edit**.

You have successfully integrated the Razorpay Payment Gateway with your Drupal Commerce website.

**Handy Tips**

- Webhooks are auto-configured when you enter and submit the API key ID during the installation. You can verify if webhooks are enabled on your Razorpay Dashboard.
- The `payment.authorized`, `payment.failed` and `refund.created` events are auto-configured. You do not have to configure it on the Razorpay Dashboard.

## 2. Test Integration

After the integration is complete, a payment button will appear on your web page/app. You need to click the button and make a test transaction to ensure the integration works as expected. You can start accepting actual payments from your customers once the test is successful.

**Watch Out!**

This is a mock payment page that uses your test API keys, test card and payment details.

- Ensure you have entered only your [Test Mode API keys](/razorpay-docs-md/api/authentication.md#generate-api-keys)

  in the **Configuration** section of the Drupal Commerce Dashboard.
- Test mode features a mock bank page with **Success** and **Failure** buttons to replicate the live payment experience.
- No real money is deducted due to the usage of test API keys. This is a simulated transaction.

![Test the integration on your webpage/app](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/drupal-commerce/build/browser/assets/drupal-test2.gif)

Supported Payment Methods

After the integration is complete, a **Pay** button appears on your webpage/app.

![Test integration on your webpage/app](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/drupal-commerce/build/browser/assets/images/test-int.gif)

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

   ![Payment details on Dashboard](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/drupal-commerce/build/browser/assets/images/testpayment.jpg)

## 3. Go-live Checklist

Follow these steps before taking the integration live:

3.1 Accept Live Payments

You can perform an end-to-end simulation of funds flow in the Test Mode. Once confident that the integration is working as expected, switch to the Live Mode and start accepting payments from customers.

**Watch Out!**

Ensure you are switching your test API keys with API keys generated in Live Mode.

To generate API Keys in Live Mode on your Razorpay Dashboard:

1. Log in to the Razorpay Dashboard and switch to **Live Mode** on the menu.
2. Navigate to **Account & Settings** → **API Keys** → **Generate Key** to generate the API Key for Live Mode.
3. Download the keys and save them securely.
4. On your [Drupal Commerce Dashboard](https://drupal.plugin.razorpay.in/)   , navigate to **Commerce**.
5. Click **Configuration**.

   ![Navigate to commerce to configure the plugin](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/drupal-commerce/build/browser/assets/images/drupal-commerce-config.jpg)
6. In the **Payment** section, select **Payment gateways**.

   ![Configure the payment gateway](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/drupal-commerce/build/browser/assets/images/drupal-config-pg.jpg)
7. Click **Edit**.

   ![Edit the payment gateway configurations](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/drupal-commerce/build/browser/assets/images/drupal-edit-config.jpg)
8. In the **Mode** section, select **Live**.
9. Replace the Test Key ID and Secret with the Live Keys and accept actual payments.

![Replace test keys with live ones](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/drupal-commerce/build/browser/assets/images/drupal-live-keys.jpg)

3.2 Payment Capture

After a payment is `authorized`, you must capture it to settle the amount to your bank account as per the settlement schedule.

Follow the steps given below to set a payment action:

1. On the [Drupal Commerce Dashboard](https://drupal.plugin.razorpay.in/)   , navigate to **Commerce**.
2. Click **Configuration**.

   ![Navigate to commerce to configure the plugin](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/drupal-commerce/build/browser/assets/images/drupal-commerce-config.jpg)
3. In the **Payment** section, select **Payment gateways**.

   ![Configure the payment gateway](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/drupal-commerce/build/browser/assets/images/drupal-config-pg.jpg)
4. Click **Edit**.

   ![Edit the payment gateway configurations](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/drupal-commerce/build/browser/assets/images/drupal-edit-config.jpg)
5. In the **Payment Action** section, you can choose to:

   ![Edit the payment capture settings](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/drupal-commerce/build/browser/assets/images/drupal-payment-capture.jpg)

   1. **Authorize and Capture**: This setting captures all authorized payments automatically. This eliminates the time and effort spent manually capturing payments.
   2. **Authorize**: Each authorized payment can also be captured individually.
      1. Once a payment is completed, navigate to **Commerce** → **Orders**.
      2. Identify the order you want to capture the payment and click **View**.

         ![Identify the order](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/drupal-commerce/build/browser/assets/images/drupal-order.jpg)
      3. Navigate to **Payments**.
      4. In the **Operations** section, click **Capture**.

         ![Manually capture the payment](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/drupal-commerce/build/browser/assets/images/drupal-manual-capture.jpg)

#### Refunds

To initiate refunds using the Drupal Commerce Dashboard:

1. Log in to the [Drupal Commerce Dashboard](https://drupal.plugin.razorpay.in/)   .
2. After a payment is completed, navigate to **Commerce** → **Orders**.
3. Identify the order you want to initiate a refund and click **View**.

   ![Identify the order](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/drupal-commerce/build/browser/assets/images/drupal-order.jpg)
4. Navigate to **Payments**.
5. In the **Operations** section, click **Refund**.

   ![Issue a Refund](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/drupal-commerce/build/browser/assets/images/drupal-refund.jpg)
6. You can either issue a full refund or a partial refund.
   - For a **full refund**, enter the entire payment amount.
   - For a **partial refund**, enter a value lesser than the payment amount.
7. Click **Refund**.
