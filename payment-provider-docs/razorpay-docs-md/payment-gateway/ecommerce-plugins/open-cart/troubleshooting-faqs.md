<!-- Source: https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/open-cart/troubleshooting-faqs -->

1. My Webhooks are not auto-configured since I am not using the upgraded version of OpenCart. How do I manually configure webhooks?

To set up webhooks:

1. Log in to the Razorpay Dashboard and navigate to **Account & Settings**.
2. In the **Website and app settings** section, click **Webhooks**.

   ![Navigate to Webhooks](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/open-cart/build/browser/assets/images/account-settings-webhooks.jpg)
3. Click **+ Add New Webhook**.

   ![](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/open-cart/build/browser/assets/images/webhooks-webhook-creation-1.jpg)
4. In the **Webhook Setup** pop-up page:

   1. Enter the **URL** where you want to receive the webhook payload when an event is triggered. We recommended using an HTTPS URL.

      **Handy Tips**

      You can set up to **10 URLs** to receive Webhook notifications. Webhooks can only be delivered to public URLs. If you attempt to save a localhost endpoint as part of a webhook setup, you will notice an error. Know more about [testing Webhooks on an application running on localhost](/docs/webhooks/validate-test/#application-running-on-localhost)      .
   2. Enter a **Secret** for the webhook endpoint. The secret is used to validate that the webhook is from Razorpay. Do not expose the secret publicly. Know more about [how to validate webhooks](/docs/webhooks/validate-test/)      .

      **Handy Tips**

      - When setting up the webhook, you will be asked to specify a secret. Using this secret, you can validate that the webhook is from Razorpay. Entering the secret is optional but recommended. The secret should never be exposed publicly.
      - The webhook secret does not need to be the merchant secret key provided by Razorpay.
   3. In the **Alert Email** field, enter the email address to which the notifications should be sent in case of webhook failure. You will receive webhook deactivation notifications to this email address.
   4. Select the required events from the list of **Active Events**.

      ![](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/open-cart/build/browser/assets/images/webhooks-webhook-creation-2.jpg)
5. Click **Create Webhook**.
6. After you set up a webhook, it appears on the list of webhooks.

2. How can I verify if webhooks are enabled?

To verify if webhooks are enabled:

1. Log in to the Razorpay Dashboard and navigate to **Account & Settings**.
2. In the **Website and app settings**, click **Webhooks**.

   ![Navigate to Webhooks](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/open-cart/build/browser/assets/images/account-settings-webhooks.jpg)
3. Select the relevant webhook **URL**.
4. On the right panel, check if the status for `payment.authorized`, `refund.created` and `virtual_account.credited` is enabled.

   ![List of webhooks created](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/open-cart/build/browser/assets/images/plugin-webhook-faq.jpg)

List of Events to Subscribe

You must subscribe to the following events:

3. What troubleshooting procedures should be carried out prior to initiating a support ticket?

Follow the troubleshooting steps given below:

1. Reinstall the Razorpay Opencart plugin and ensure that your system meets all the requirements mentioned [here](/razorpay-docs-md/payment-gateway/ecommerce-plugins/open-cart/integration-steps.md)   .
2. We recommend you to keep your Razorpay Opencart plugin up to date. You can find the latest versions [here](https://github.com/razorpay/razorpay-opencart/releases)   .
3. If the issue persists after following these steps, contact our [Support team](https://razorpay.com/support/)   . Provide the following information while creating a ticket:
   - Razorpay Opencart plugin version (4, 3, 2, or 1.5)
   - Steps to reproduce the issue (Screen recording/Screenshots)
   - Error logs, if any
   - Staging website credentials (login URL, login id, and password)

4. Does the Open-Cart plugin support 3 or 0 decimal unit currencies?

The Open-Cart plugin currently supports only currencies that use 2 decimal units. For example: USD, EUR, INR. It does not support currencies with 0 decimal (for example, JPY) or 3 decimal units (for example, BHD).
