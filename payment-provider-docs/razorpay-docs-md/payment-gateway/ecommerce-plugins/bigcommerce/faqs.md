<!-- Source: https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/bigcommerce/faqs -->

1. How can I verify if the plugin is installed successfully?

On your BigCommerce Dashboard, navigate to **Channel Manager** → **Storefronts** section.

![specific and meaningful image title](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/bigcommerce/build/browser/assets/images/bigcommerce-verify-installation.jpg)

There are two ways to verify the installation:

### Web Pages

1. Click **Web pages**.
2. Ensure the **Razorpay Order Confirmation** page appears.

![Verify installation through web pages](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/bigcommerce/build/browser/assets/images/bigcommerce-web-page.jpg)

### Scripts

1. Click **Scripts**.
2. Ensure the Razorpay **Header** and **Footer** scripts appear.

![Verify installation through scripts](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/bigcommerce/build/browser/assets/images/bigcommerce-script.jpg)

2. How can I verify if webhooks are auto-configured?

To verify if webhooks are enabled:

1. Log in to the Razorpay Dashboard and navigate to **Account & Settings**.
2. In the **Website and app settings** section, click **Webhooks**.

   ![Navigate to Webhooks](https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins/bigcommerce/build/browser/assets/images/account-settings-webhooks.jpg)
3. Select the relevant webhook **URL**.
4. On the right panel, check if the status for `order.paid` and `refund.processed` is enabled.

3. Does the BigCommerce plugin support 3 or 0 decimal unit currencies?

The BigCommerce plugin currently supports only currencies that use 2 decimal units. For example: USD, EUR, INR. It does not support currencies with 0 decimal (for example, JPY) or 3 decimal units (for example, BHD).
