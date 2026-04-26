<!-- Source: https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/wix/integration-steps -->

Follow the steps given below to integrate Razorpay Payment Gateway with your Wix website.

#### 1. Build Integration

Install the Wix plugin.

#### 2. Test Integration

Test the integration by making a test payment.

#### 3. Go-Live Checklist

Check the go-live checklist.

## 1. Build Integration

Follow the steps given below:

1.1 Add Razorpay as a Payment Gateway

1. Log in to your [Wix website](https://users.wix.com/signin)   .
2. Navigate to **Settings** → **Accept payments**.

   ![Settings and Accept Payments](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/wix/build/browser/assets/images/wix-settings-accept.jpg)
3. Click **Connect** beside **Razorpay**.

   ![add razorpay](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/wix/build/browser/assets/images/wix-rzp-connect.jpg)
4. Enter your **API Key Id**, **Key Secret** and **Site URL**. Click **Connect**.

   ![account activation](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/wix/build/browser/assets/images/wix-api.jpg)
5. You have successfully connected your Wix website with Razorpay.

   ![dialog box](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/wix/build/browser/assets/images/wix-final.jpg)

## 2. Test Integration

After the integration, a **Pay** button will appear on your webpage. Click the button and make a test transaction to ensure the integration works as expected. You can start accepting actual payments from your customers once the test is successful.

![](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/wix/build/browser/assets/images/arastta-pay-button.jpg)

You can make test payments using one of the payment methods configured at the Checkout.

- No money is deducted from the customer's account as this is a simulated transaction.
- Ensure you have entered the API keys generated in the test mode in the Checkout code.

Supported Payment Methods

After the integration is complete, a **Pay** button appears on your webpage/app.

![Test integration on your webpage/app](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/wix/build/browser/assets/images/test-int.gif)

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

   ![Payment details on Dashboard](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/wix/build/browser/assets/images/testpayment.jpg)

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
