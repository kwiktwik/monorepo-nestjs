<!-- Source: https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/shopify/integration-steps -->

Follow the steps given below to integrate 1 Razorpay App on your Shopify store.

#### 1. Build Integration

Install the 1 Razorpay App.

#### 2. Test Integration

Test the integration by making a test payment.

#### 3. Go-Live Checklist

Check the go-live checklist.

## 1. Build Integration

Follow the steps given below:

1.1 Installation

**Step 1: Sign up for a Razorpay account**.

1. [Sign up](https://dashboard.razorpay.com/signup?)

   for a Razorpay account. If you already have an account, skip to Step 2.
2. Submit your KYC, and if we need any further clarification, we will reach out to you on WhatsApp, SMS and email.
3. Once our team completes KYC verification and you are enabled to accept payments, we will send a confirmation on WhatsApp, SMS and email.

**Step 2: Access the 1Razorpay App on Shopify**.

Once your Razorpay account is activated, you can install the app using either of these methods:

Method A: Direct Link Installation

Method B: Manual Installation

1. Click on [this link](https://accounts.shopify.com/store-login?redirect=settings%2Fpayments%2Falternative-providers%2F1058839)

   to access the "1Razorpay - UPI, Cards, Wallets, NB" App directly on your Shopify store.

**Step 3: Install and Activate the App**.

1. Click **Install** on the app installation page.

   ![Shopify Install](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/shopify/build/browser/assets/images/shopify-1-razorpay-install-install.jpg)
2. You will be redirected to a landing page. Click **I am an existing user**.

   ![Existing Merchant Shopify](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/shopify/build/browser/assets/images/shopify-existing-merchant.jpg)
3. Scroll down and click **Login**.

   **Handy Tips**

   Make sure you log in with **store owner** credentials to connect Razorpay with Shopify successfully.

   ![Shopify login](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/shopify/build/browser/assets/images/shopify-login-v2.gif)
4. Click **Activate** on the activation screen on your Shopify Dashboard.

   ![Shopify Activate](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/shopify/build/browser/assets/images/shopify-1razorpay-activate.jpg)

1 Razorpay now appears as a Payment Gateway on your Shopify Store checkout.

![Shopify Checkout](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/shopify/build/browser/assets/images/shopify-v2-checkout.jpg)

This completes your integration. For more information, see [Shopify FAQs](/razorpay-docs-md/payment-gateway/ecommerce-plugins/shopify/faqs.md).

## 2. Test Integration

After the integration of **Shopify - 1 Razorpay** on your Shopify store is complete, follow the steps given below:

2.1 Make a Test Transaction in Test Mode

After completing the integration, you must ensure it is working as expected. You can start accepting actual payments from your customers once the test mode transaction is successful.
Follow the steps given below to test a transaction in test mode:

1. Log in to your [Shopify store](https://accounts.shopify.com/lookup?rid=f19e1541-cd24-4856-a398-156d2ed5d56f)   .
2. Navigate to **Settings** → **Payments**.
3. Under **Additional payment methods** section, click **01. Razorpay UPI, Cards, Wallets** app.

   ![Shopify go live v2](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/shopify/build/browser/assets/images/shopify-go-live-v2.jpg)
4. At the bottom of the page, toggle the **Test mode** option and click **Save**.

   ![Shopify go live v2 save test](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/shopify/build/browser/assets/images/shopify-go-live-test.jpg)
5. On your Shopify store, add an item to your cart and click **Buy it now**.

   ![Shopify checkout](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/shopify/build/browser/assets/images/buy-now-shopify.jpg)
6. Fill in your **contact** and **shipping** details and click **Continue to shipping**.

   ![Shopify contact details](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/shopify/build/browser/assets/images/shipping-contact-details.jpg)
7. Select **1 Razorpay** and click **Complete order**.

   ![Shopify complete order](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/shopify/build/browser/assets/images/complete-order.jpg)
8. On the checkout screen, enter your **phone number**, click **PROCEED**, and complete the payment.

You can make test payments using one of the payment methods configured at the Checkout.

- No money is deducted from the customer's account as this is a simulated transaction.
- Ensure you have entered the API keys generated in the test mode in the Checkout code.

Supported Payment Methods

After the integration is complete, a **Pay** button appears on your webpage/app.

![Test integration on your webpage/app](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/shopify/build/browser/assets/images/test-int.gif)

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

2.2 Update Checkout Settings

Follow the steps given below for a smooth checkout experience:

1. Log in to your [Shopify store](https://accounts.shopify.com/lookup?rid=f19e1541-cd24-4856-a398-156d2ed5d56f)   .
2. Navigate to **Settings** → **Checkout**.
3. On the **Customer contact method** section, click **Phone number or email** and click **Save**.

   ![Shopify Checkout v2](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/shopify/build/browser/assets/images/shopify-checkout-v2.jpg)

**Handy Tips**

Your customer's email ID is prefilled during checkout, but the `phone number` must be entered manually.

2.3 Verify Payment Status

You can track the payment status from the Razorpay Dashboard or by polling APIs.

Verify Payment Status From Dashboard

Poll APIs

1. Log in to the Razorpay Dashboard and navigate to **Transactions** → **Payments**.
2. Check if a `payment_ID` has been generated and note the status. In case of a successful payment, the status is marked as `captured`.

![Payment status on dashboard](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/shopify/build/browser/assets/images/testpayment.jpg)

## 3. Go-live Checklist

Follow these steps before taking the integration live:

3.1 Switch from Test mode to Live mode

You can perform an end-to-end simulation of funds flow in the Test Mode. Once confident that the installation and integration is working as expected, switch to the Live Mode and start accepting payments from customers.

Watch this short animation to know how to switch from **Test Mode** to **Live Mode** on your Shopify store.

![Shopify Go Live](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/shopify/build/browser/assets/images/shopify-go-live-v2.gif)

To switch from **Test Mode** to **Live Mode**:

1. Log in to your [Shopify store](https://accounts.shopify.com/lookup?rid=f19e1541-cd24-4856-a398-156d2ed5d56f)   .
2. Navigate to **Settings** → **Payments**.
3. On the **Supported payment methods** section, click **Manage** on the **1 Razorpay** app.

   ![Shopify go live v2](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/shopify/build/browser/assets/images/shopify-go-live-v2.jpg)
4. At the bottom of the page, select the **Enable test mode** option and click **Save**.

   ![Shopify go live v2 save](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/shopify/build/browser/assets/images/shopify-go-live-save.jpg)

You can now start accepting actual payments on your Shopify store.
