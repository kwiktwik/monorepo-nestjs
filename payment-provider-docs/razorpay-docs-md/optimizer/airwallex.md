<!-- Source: https://razorpay.com/docs/payments/optimizer/airwallex -->

You can collect payments in international currencies and accept internationally issued cards by using Airwallex as a payment gateway.

Follow the steps below to onboard Airwallex as a payment provider.

**Watch Out!**

Optimizer routes payments based on your business logic. However, the method enablement of each gateway needs to be handled between you and the gateway, or it may lead to failed payments.

Prerequisites

Reach out to your Relationship Manager to get your server-to-server or seamless integration kit with credentials.

## Add Airwallex as Payment Provider

To add Airwallex as a payment provider:

1. Log in to your Dashboard.
2. Go to the **PAYMENT PRODUCTS** section and click **Optimizer**.
3. In the top-right section, click **Add Provider**.
4. Select **Airwallex** in the list of gateways available.

   ![Add airwallex](https://razorpay.com/docs/payments/optimizer/build/browser/assets/images/add-airwallex.jpg)
5. Enter the provider name and description and click **Next**.

   ![Airwallex Add Provider Name](https://razorpay.com/docs/payments/optimizer/build/browser/assets/images/airwallex-provider-name.jpg)
6. Enter your **Api Key** and **Client Id**.
7. Select **Card** as the payment method and click **Submit**.

   ![Add Salt Key airwallex](https://razorpay.com/docs/payments/optimizer/build/browser/assets/images/airwallex-add-key-salt.jpg)

You have successfully added **Airwallex** as a payment provider on Optimizer.

## Supported Payment Methods

**Handy Tips**

Airwallex supports [Tokenisation](/razorpay-docs-md/optimizer/tokenisation.md).

## Best Practices

Before routing all traffic or some traffic to a new gateway via Optimizer, the following best practices are recommended:

Live and Test Mode Rules

All rules configured in live or test mode on the Razorpay Dashboard will reflect in live mode. However, credentials added in test mode will not be automatically replicated in live mode.

Sanity Test at Razorpay

You can reach out to Razorpay for basic sanity testing of the integration. Razorpay will try a test payment of a small value and ensure that the credentials are correct.

Perform Self-Sanity Test

We recommend configuring a rule on live mode to route payments less than a set value (for example, ₹2) to the Airwallex gateway. This helps to test on production whether small value payments are being routed to Airwallex and working successfully, thus helping to avoid any direct impact on production traffic.

Follow the steps given below to configure a rule in live mode:

1. Log in to your Dashboard.
2. In the left navigation, click **Optimizer**.
3. Click **+Add Rule** and enter the **Rule name** and **Description**.
4. Click **Next** and enter the following rule:
   - In **Parameter** field, select **Amount (In Rupees)**.
   - In **Select Connection** field, select **Less Than**.
   - In **Enter Amount** field, enter the value 2 and click **Next**.

   ![Add Rule](https://razorpay.com/docs/payments/optimizer/build/browser/assets/images/add-rule.jpg)
5. Enter the value 100 in the **Route field**, select **Airwallex** in the **Payment Via** field, and click **Next**.

   ![target Provider](https://razorpay.com/docs/payments/optimizer/build/browser/assets/images/target-provider.jpg)
6. Click **Publish Rule**.

   ![Publish Rule](https://razorpay.com/docs/payments/optimizer/build/browser/assets/images/publish-rule.jpg)

## Go Live

After the integration is tested and successful, you can go live on Airwallex.
