<!-- Source: https://razorpay.com/docs/payments/payment-gateway/emi²/widget/woocommerce -->

You can integrate Affordability Widget with your WooCommerce website to influence your customer's purchase decisions before they reach checkout by displaying various affordable payment options and offers.

**Handy Tips**

Only the Owner, Admin and Manager roles can enable the widget.

## Prerequisites

- Create a [Razorpay account](https://dashboard.razorpay.com/)  .
- Generate the [API keys](/razorpay-docs-md/api/authentication.md#generate-api-keys)

  from the Dashboard by navigating to **Account & Settings** → **Website and app settings** → **API keys**.
  - You can use the **Test Mode** keys to test the integration and preview the Widget.
  - Switch to **Live Mode** on the Razorpay Dashboard → Generate the [Live API keys](/razorpay-docs-md/api/authentication.md#live-mode-api-keys)

    and replace it with the test keys.
- Install the plugin version **4.3.4** directly from the [WordPress Plugin Directory](https://wordpress.org/plugins/woo-razorpay/)  .

  **Handy Tips**

  Ensure you have the PHP-curl extension installed to make network requests.

**Watch Out!**

Refer to [FAQs](/razorpay-docs-md/payment-gateway/emi-/widget/faqs.md#1-i-am-integrating-with-razorpay-plugin-for) if you are integrating with our plugin for the first time.

List of Supported Themes

Razorpay Affordability Widget WooCommerce is supported on the following popular themes:

**Handy Tip**

This is not a complete list, and it is recommended to try it on your themes as well.

## Integration Steps

1. [Enable the Widget](/razorpay-docs-md/payment-gateway/emi-/widget/woocommerce.md#step-1-enable-the-widget)

   .
2. [Preview and Go Live](/razorpay-docs-md/payment-gateway/emi-/widget/woocommerce.md#step-2-preview-and-go-live)

   .

### Step 1: Enable the Widget

Follow the steps given below to enable the widget:

1. Log in to the Dashboard and navigate to **Affordability** in the **Payment Products** section.
2. Choose **WooCommerce** as your **website platform**.

   ![Select website platform for widget](https://razorpay.com/docs/payments/payment-gateway/emi²/widget/build/browser/assets/images/widget-woocommerce-platform.jpg)
3. In the **Activate on your website** section, click **Enable Widget**.

   ![Enable the widget](https://razorpay.com/docs/payments/payment-gateway/emi²/widget/build/browser/assets/images/woocommerce-widget-enable.jpg)
4. Select the check box if you consent to enable the widget and click **Yes, enable**.

### Step 2: Preview and Go Live

Follow the steps given below:

1. Log in to the [WordPress account](https://wordpress.com/log-in)   .
2. Follow the steps given below to preview the widget in admin mode:
   1. Hover over **Razorpay Wordpress** and click **Visit Store**.

      ![Click visit store to test the widget](https://razorpay.com/docs/payments/payment-gateway/emi²/widget/build/browser/assets/images/widget-woocommerce-test.jpg)
   2. Click on a product to view the widget.

      ![Preview the widget before publishing](https://razorpay.com/docs/payments/payment-gateway/emi²/widget/build/browser/assets/images/widget-woocommerce-preview.jpg)

**Watch Out!**

It is mandatory to preview the widget before displaying it to your customers on the WooCommerce website.

## Successful Activation

Here is a glimpse of the default widget with offers and payment method options enabled.

![Glimpse of the default widget](https://razorpay.com/docs/payments/payment-gateway/emi²/widget/build/browser/assets/images/default-widget.jpg)

**Minimum Order Limit**

All the payment method options that are enabled and that satisfy the minimum order limit appear on the widget. Know more about the minimum order limit for:

- [EMI](/razorpay-docs-md/payment-gateway/emi-/faqs.md#1-what-are-the-standard-credit-card-interest)
- [Cardless EMI](/razorpay-docs-md/payment-gateway/emi-/faqs.md#cardless-emi)
- [Pay Later](/razorpay-docs-md/payment-gateway/emi-/faqs.md#2-what-are-the-standard-interest-rates-charged)

## Next Steps

After you successfully integrate the widget on your WooCommerce website, you can choose to [customise the widget](/razorpay-docs-md/payment-gateway/emi-/widget/woocommerce/customise.md) based on your requirement.

**Handy Tips**

- Fill in the [integration support form](https://form.typeform.com/to/Ro3nJPzp)

  in case you are facing any issues with the integration.
- In case you have any queries, raise a ticket on the [Razorpay Support Portal](https://razorpay.com/support/)  .

### Related Information [Affordability Widget FAQs for WooCommerce](/razorpay-docs-md/payment-gateway/emi-/widget/faqs.md#woocommerce)
