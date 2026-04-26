<!-- Source: https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/bigcommerce/integration-steps -->

Follow the steps given below to integrate Razorpay Payment Gateway with your BigCommerce website.

#### 1. Build Integration

Install and configure the BigCommerce plugin.

#### 2. Test Integration

Test the integration by making a test payment.

#### 3. Go-Live Checklist

Check the go-live checklist.

## 1. Build Integration

Follow the steps given below:

1.1 Installation

Follow the steps given below to install the plugin:

1. Log in to your [BigCommerce account](https://login.bigcommerce.com/login)   .
2. Navigate to **Apps** → **Marketplace**.

   ![Navigate to Apps](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/bigcommerce/build/browser/assets/images/bigcommerce-apps.jpg)
3. Click **BIGCOMMERCE.COM/APPS** and search for **Razorpay**.

   ![specific and meaningful image title](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/bigcommerce/build/browser/assets/images/bigcommerce-marketplace.jpg)
4. Click **Razorpay** and click **GET THIS APP**.

   ![Install the app](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/bigcommerce/build/browser/assets/images/bigcommerce-get-app.gif)
5. Enter the **API Key ID** generated from the [Razorpay Dashboard](/razorpay-docs-md/api/authentication.md#generate-api-keys)   .

   **Handy Tips**

   To go live with the integration and start accepting real payments, generate [Live Mode API Keys](/razorpay-docs-md/api/authentication.md#live-mode-api-keys)

   and replace the test key with the live key in the integration.
6. Click **Submit**.

![Submit detail to install the Razorpay plugin](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/bigcommerce/build/browser/assets/images/bigcommerce-install1.jpg)

You have successfully integrated the Razorpay Payment Gateway with your BigCommerce website.

**Handy Tips**

- Webhooks are auto-configured when you enter and submit the API key ID during the installation. You can verify if webhooks are enabled on your Razorpay Dashboard.
- The `order.paid` and `refund.processed` events are auto-configured. You do not have to configure it on the Razorpay Dashboard.

## 2. Test Integration

After the integration is complete, a **RAZORPAY PAYMENTS** button will appear on your web page/app. You need to click the button and make a test transaction to ensure that the integration is working as expected. You can start accepting actual payments from your customers once the test is successful.

![Test the integration on your webpage/app](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/bigcommerce/build/browser/assets/images/bigcommerce-test.gif)

**Watch Out!**

This is a mock payment page that uses your test API keys, test card and payment details.

- Ensure you have entered only your [Test Mode API keys](/razorpay-docs-md/dashboard/account-settings/api-keys.md#generate-api-keys)

  in the Checkout code.
- Test mode features a mock bank page with **Success** and **Failure** buttons to replicate the live payment experience.
- No real money is deducted due to the usage of test API keys. This is a simulated transaction.

Supported Payment Methods

After the integration is complete, a **Pay** button appears on your webpage/app.

![Test integration on your webpage/app](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/bigcommerce/build/browser/assets/images/test-int.gif)

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

   ![Payment details on Dashboard](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/bigcommerce/build/browser/assets/images/testpayment.jpg)

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

After a payment is `authorized`, it is automatically captured and the amount is settled to your account as per the settlement schedule. Know more about [Auto-capture payments](/razorpay-docs-md/payments/capture-settings.md#auto-capture-all-payments).
