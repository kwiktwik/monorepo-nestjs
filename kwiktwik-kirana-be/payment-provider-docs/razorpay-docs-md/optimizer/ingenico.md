<!-- Source: https://razorpay.com/docs/payments/optimizer/ingenico -->

Follow the steps below to onboard Ingenico as a payment provider.

**Watch Out!**

- While Optimizer can route payments based on your business logic, the method enablement of each gateway must be handled between you and the gateway, or it may lead to failed payments.
- Ingenico does not support **tokenisation**.

Prerequisites

1. Write to your TPSL Account Manager with the following requests:
   - Create a new MID for your account and get the seamless option enabled for your Merchant ID.
   - Configure the below webhook url to receive payment status:
     - `https://api.razorpay.com/v1/callback/ingenico`
   - Share the **Encryption Keys** with **Merchant Code**, **Scheme Code** and **Encryption IV** via email.
   - Share any bank codes sent by the TPSL team.
   - Enable the following features for your Ingenico merchant id (MID):
     - Feature to receive **Bank Reference ID** in Enquiry API.
     - Feature to receive **other\_details** in Enquiry API. This contains transaction metadata, including Auth Code.
     - Feature to initiate refund request.
     - Feature to receive **client\_ref\_id** in Refund Enquiry API. This allows Razorpay to send its own internal ID in Refund API and receive the same in Refund Enquiry API.
     - Feature to receive refund ARN in Refund Enquiry API.
2. If UAT is needed, ensure that the following bank/network codes are configured for your Ingenico test account:
   - For debit card : 1280
   - For credit card : 1270
   - For Netbanking:
     - HDFC : 410
     - ICICI : 10
     - SBI : 530
     - Any other bank/Test Bank : 470
3. Copy Razorpay in the email and we will provide the supporting document from our end.

## Integration Requirements

Before you go live with Ingenico on Optimizer, make sure you configure the **scheme code** as per your requirement.

Configure Scheme Code

Ingenico has a scheme code field that is an arrangement between you and Ingenico. By default, this is “FIRST”, but it can be modified by changes in the notes field used in checkout:

## Add Ingenico as a Payment Provider

To add Ingenico as a payment provider:

1. Log in to your Dashboard.
2. Go to the **PAYMENT PRODUCTS** section and click **Optimizer**.
3. In the top-right section, click **Add Provider**.

   ![Add provider](https://razorpay.com/docs/payments/optimizer/build/browser/assets/images/add-provider.jpg)
4. Select **Ingenico (Tech Process)** in the list of gateways available and click **Next**.

   ![Add Ingenico](https://razorpay.com/docs/payments/optimizer/build/browser/assets/images/add-ingenico.jpg)
5. Enter the provider name and description and click **Next**.

   ![Add Provider Ingenico](https://razorpay.com/docs/payments/optimizer/build/browser/assets/images/add-provider-ingenico.jpg)
6. Enter your **Encryption IV**, **Encryption Key** and **Merchant Code**.
7. Select the payment methods you want to enable for Ingenico and click **Submit**.

   ![Add Secret Ingenico](https://razorpay.com/docs/payments/optimizer/build/browser/assets/images/add-secrect-ingenico.jpg)

You have successfully added **Ingenico** as a payment provider on Optimizer.

## Supported Payment Methods

**Handy Tips**

Ingenico supports [Third-Party Validation (TPV)](/razorpay-docs-md/optimizer/third-party-validation.md#supported-bank-gateways-payment-gateways-and-payment-methods).

### Supported Netbanking Banks

There are few banks for which netbanking is enabled by default for Ingenico. Given below is the list of banks along with its Ingenico bank codes:

**Watch Out!**

Any supported network or bank should be checked with Ingenico, or it may lead to payment failure.

#### List of Netbanking Banks Enabled by Default

## Best Practices

Before routing all traffic or some traffic to a new gateway via Optimizer, the following best practices are recommended:

Live and Test Mode rules

All rules configured on live or test mode on the Razorpay Dashboard will reflect on live mode. However, credentials added on test mode will not be automatically replicated in live mode.

Sanity Test at Razorpay

You can reach out to Razorpay for basic sanity testing of the integration. Razorpay will try a test payment of small value and ensure that the credentials are correct.

Perform Self Sanity Test

We recommend configuring a rule on live mode to route payments lesser than a set value (for example, ₹2) to the Ingenico gateway. This helps to test on production whether small value payments are being routed to Ingenico and working successfully, thus avoiding any direct impact on production traffic.

To configure a rule in live mode:

1. Log in to your Dashboard.
2. In the left navigation, click **Optimizer**.
3. Click **+Add Rule** and enter the **Rule name** and **Description**.
4. Click **Next** and enter the following rule:
   - In **Parameter** field, select **Amount (In Rupees)**.
   - In **Select Connection** field, select **Less Than**.
   - In **Enter Amount** field, enter the value 2 and click **Next**.

   ![Add Rule](https://razorpay.com/docs/payments/optimizer/build/browser/assets/images/add-rule.jpg)
5. Enter the value 100 in the **Route field**, select **Ingenico (Tech Process)** in the **Payment Via** field, and click **Next**.

   ![Ingenico target Provider](https://razorpay.com/docs/payments/optimizer/build/browser/assets/images/ingenico-target-provider.jpg)
6. Click **Publish Rule**.

   ![Ingenico Publish Rule](https://razorpay.com/docs/payments/optimizer/build/browser/assets/images/ingenico-publish-rule.jpg)

## Go Live

After the integration is tested and successful, you can go live on Ingenico (Tech Process).
