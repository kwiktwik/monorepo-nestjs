<!-- Source: https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/cs-cart/integration-steps -->

Follow the steps given below to integrate Razorpay Payment Gateway with your CS-Cart website.

#### 1. Build Integration

Install and configure the CS-Cart plugin.

#### 2. Test Integration

Test the integration by making a test payment.

#### 3. Go-Live Checklist

Check the go-live checklist.

## 1. Build Integration

Follow the steps given below:

1.1 Installation

1. Ensure you have the latest version of CS-Cart installed.
2. Download the latest [Source code zip file](https://github.com/razorpay/razorpay-cscart/releases)

   from the releases section. Unzip the repository.
3. Run the `install.razorpay.sql` file, which can be found inside the unzipped package, against your CS-Cart database. To do this, you can either:
   - Use phpMyAdmin to import the file into your CS-Cart database.
   - Copy and paste the content and run it directly in your MySQL shell.
4. Upload the rest of the plugin's contents to your CS-Cart Installation directory.
   1. The app folder's content goes into your CS-Cart Installation directory.
   2. The content of the design folder goes into the design folder in your CS-Cart Installation directory.

1.2 Configuration

1. Log in to CS-Cart as administrator.
2. Navigate to **Administration** → **Payment Methods**.
3. Add a new payment method.
4. Select **Razorpay** from the list and then click **Save**. Select `cc_outside.tpl` for the template.
5. Navigate to the **Configure** tab.
6. Add your [KEY\_ID] and [KEY\_SECRET] generated from the Razorpay Dashboard.

**Handy Tips**

Webhook is auto-configured when you enter and save the API key ID and secret on the plugin settings page. You need to verify that webhooks are enabled on your Razorpay [Dashboard](/razorpay-docs-md/payment-gateway/ecommerce-plugins/cs-cart/troubleshooting-faqs.md#2-how-can-i-verify-if-webhooks-are). However, for versions lower than 1.4.0, you need to [manually configure webhooks](/razorpay-docs-md/payment-gateway/ecommerce-plugins/cs-cart/troubleshooting-faqs.md#1-my-webhooks-are-not-auto-configured-since-i).

## 2. Test Integration

After the integration, Razorpay is added as a payment option on your web page/app. You need to click the button and make a test transaction to ensure the integration works as expected. You can start accepting actual customer payments once the test is successful.

![](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/cs-cart/build/browser/assets/images/pg-cs-cart-plugin.jpg)

You can make test payments using one of the payment methods configured at the Checkout.

- No money is deducted from the customer's account as this is a simulated transaction.
- Ensure you have entered the API keys generated in the test mode in the Checkout code.

Supported Payment Methods

After the integration is complete, a **Pay** button appears on your webpage/app.

![Test integration on your webpage/app](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/cs-cart/build/browser/assets/images/test-int.gif)

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

   ![Payment details on Dashboard](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/cs-cart/build/browser/assets/images/testpayment.jpg)

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
