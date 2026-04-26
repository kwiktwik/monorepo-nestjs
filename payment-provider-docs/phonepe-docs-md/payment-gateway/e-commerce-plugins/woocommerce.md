<!-- Source: https://developer.phonepe.com/payment-gateway/e-commerce-plugins/woocommerce -->

# WooCoomerce Integration

---

WooCommerce is a popular plugin for WordPress that lets you set up and manage an online store with ease. It allows you to handle product listings, orders, and payments directly on your website. By integrating the PhonePe Payment Gateway with your WooCommerce store, you can offer customers a smooth and secure checkout experience.

## Prerequisite

Before proceeding with the integration, please ensure your website environment meets the following:

- **PHP version 8.2 or higher**
- **WordPress version 5.4 or higher**
- **WooCommerce version 4.1 or higher**

**📘** **WooCommerce-Autopay(recurring) Integration**

---

You can integrate WooCommerce with recurring payments via API. To proceed, please refer to the [Autopay](/phonepe-docs-md/payment-gateway/autopay/standard-checkout/introduction.md) documentation for detailed steps.

⚠️ ****Admins Only**!**

---

Only users with Admin access can set up and integrate PhonePe Payment Gateway.

# Integrate PhonePe Payment Gateway with WooCommerce

## Install PhonePe Payment Plugin

- Go to Plugins > **Add New** in your WordPress dashboard and search for “**PhonePe Payment Solutions**.” Click **Install Now** next to the plugin and then select **Activate** to complete the process.

[](/static/40b1b216b739f01ec8de249adc4a21f1/WooCommerce-Step1-1.mp4)

[](/static/40b1b216b739f01ec8de249adc4a21f1/WooCommerce-Step1-1.mp4)

## Configure PhonePe Payments

- After installation, go to the **Installed Plugins** section, you’ll see ‘PhonePe Payment Solutions’ listed as a payment option. Click on settings to configure.
- To enable payments, you will need your API credentials from the [PhonePe Business Dashboard](https://business.phonepe.com/login). Under Developer Settings > API Keys, copy your Client ID, Client Version, and Client Secret(API Key). Paste these into the WooCommerce settings and save your changes to complete the integration.
- This plugin is designed for your **Live Production Environment only**. We do not currently provide support for UAT or test environments with this plugin.

[](/static/9b3c949384eefa57dc36e7936cbd8eab/WooCommerce-Step2-1.mp4)

[](/static/9b3c949384eefa57dc36e7936cbd8eab/WooCommerce-Step2-1.mp4)

## Check the Payment Flow

- To verify the **Standard Checkout** flow, simply add an item to your cart and follow the prompts to the payment session. After completing the payment on the PhonePe secure page, your order status should automatically update to “Successful.”

[](/static/13b2b0037ecaa86f14bce499f9eab28c/WooCommerce-Step3.mp4)

[](/static/13b2b0037ecaa86f14bce499f9eab28c/WooCommerce-Step3.mp4)

That’s it! PhonePe Payment Gateway is now integrated with your WooCommerce store, and you’re ready to start accepting payments from your customers.
