<!-- Source: https://razorpay.com/docs/payments/payment-button/supported-platforms/wordpress -->

[Payment Button - Wordpress Changelog

Version 2.4.6 released for Payment Button Wordpress. This version fixes naming conflict in Razorpay section.](/razorpay-docs-md/changelog.md#products)

WordPress is one of the most popular Content Management Systems out there. You can quickly build a website using WordPress and embed the our Payment Button to accept payments from customers.

![WordPress Homepage](https://razorpay.com/docs/payments/payment-button/supported-platforms/build/browser/assets/images/payment-button-wordpress-wordpress-homepage.jpg)

## WordPress Plan

For Websites Hosted on Domain

For Websites Hosted on Localhost

If you have built your website using `www.wordpress.com`, and are on a paid plan, you can directly install the Razorpay Payment Button Plugin from the WordPress Plugins store.

1. [Install the Razorpay Payment Button Plugin on your WordPress site](https://wordpress.org/plugins/razorpay-payment-button/)

   .
2. [Create a Payment Button on Dashboard](/razorpay-docs-md/payment-button/supported-platforms/wordpress.md#step-2-create-a-payment-button-on-razorpay)

   .
3. [Embed the Payment Button on your WordPress site](/razorpay-docs-md/payment-button/supported-platforms/wordpress.md#step-3-embed-the-payment-button-on-wordpress)

   .

## Prerequisites

1. Download the [Razorpay Payment Button WordPress Plugin](https://wordpress.org/plugins/razorpay-payment-button/)   .
2. Create a Razorpay account.
3. Navigate to **Settings** → **API Keys** and [generate API keys](/razorpay-docs-md/api/authentication.md#generate-api-keys)

   in the test mode.

Add the API key details in the Razorpay Payment Button plugin settings.

**Handy Tips**

- When testing: Generate the keys in Test mode.
- To accept live payments: Generate the keys in Live mode and replace them in the Payment Button plugin settings.

## Set Up a Payment Button Using Wordpress Plugin

Watch this video to see how to set up a Payment Button using Wordpress Plugin.

### 1. Set Up WordPress Site Locally on Your System

For Windows Users

For Mac Users

See: [Installation Steps for Windows](https://documentation.mamp.info/en/MAMP-Windows/Installation/)

## 2. Create a Payment Button on Razorpay Dashboard

To accept payments on your WordPress site, you must create a Payment Button.

- [Quick Pay Button](/razorpay-docs-md/payment-button/quick-pay.md)
- [Buy Now Button](/razorpay-docs-md/payment-button/buy-now.md)
- [Donations Button](/razorpay-docs-md/payment-button/donations.md)
- [Custom Button](/razorpay-docs-md/payment-button/custom.md)

## 3. Embed the Payment Button on WordPress Site

To embed the Payment Button:

3.1 Download and install the Razorpay Payment Button Plugin. You can do this using either of these methods:

- [Download the plugin from the WordPress Plugin Directory](https://wordpress.org/plugins/razorpay-payment-button/)

  and add the zip file to your WordPress website's **Plugins** folder.
- Add the plugin directly onto your WordPress website from the **Plugin** page.

3.2 In your WordPress site, activate the plugin in the **WordPress Plugin Manager**.

![Activate Plugin](https://razorpay.com/docs/payments/payment-button/supported-platforms/build/browser/assets/images/payment-button-wordpress-activate-plugin.jpg)

3.3 Navigate to **Razorpay Buttons** → **Settings** to add your Razorpay API key details and connect your Razorpay account to the plugin.

![Add Razorpay API Key](https://razorpay.com/docs/payments/payment-button/supported-platforms/build/browser/assets/images/payment-button-wordpress-settings.jpg)

3.4 Navigate to **Razorpay Buttons**. A list of buttons you created on Razorpay are available here. Select the required button.

![List of Payment Buttons](https://razorpay.com/docs/payments/payment-button/supported-platforms/build/browser/assets/images/payment-button-wordpress-view-buttons.jpg)

3.5 Click **Pages** and navigate to the page where you want to embed the Payment button.

![Select Page](https://razorpay.com/docs/payments/payment-button/supported-platforms/build/browser/assets/images/payment-button-wordpress-shop-page.jpg)

3.6 Select **Add Block** → **Widgets** → **Razorpay: Payment Button** to embed the Payment button onto the page.

![Embed Button](https://razorpay.com/docs/payments/payment-button/supported-platforms/build/browser/assets/images/payment-button-wordpress-add-pb-widget.jpg)

3.7 Choose the Payment Button using the drop-down and publish or update the page.

![Choose Payment Button](https://razorpay.com/docs/payments/payment-button/supported-platforms/build/browser/assets/images/payment-button-wordpress-select-button.jpg)

The Payment Button appears on the page.

![Payment Button Appears](https://razorpay.com/docs/payments/payment-button/supported-platforms/build/browser/assets/images/payment-button-wordpress-pb.gif)

You can now start accepting payments on your WordPress website using the Payment Button.

## FAQs

1. I have created a Payment Button on the Dashboard. When I try to embed this code on my `www.wordpress.com` website, I am facing errors. How do I resolve this?

You cannot directly use the Payment Button code generated from the Dashboard if you are using `www.wordpress.com`. You must upgrade to the WordPress paid plan and use the Razorpay Payment Button plugin.

2. I am using Thrive Editor to add the button code for Razorpay. What should I be aware of, and how should I add payment buttons?

If you are using Thrive Editor to add the button code for Razorpay, it is essential to note that Thrive Editor does not support the direct inclusion of scripts in HTML pages or posts. It automatically places a code tag on top of the script and adds a `<code class="tve_js_placeholder">` above the payment button script. Unfortunately, there is no workaround for this behaviour. We recommend using the WordPress default editor, Gutenberg, or any other compatible editor to add payment buttons effectively. These editors allow you to add payment button scripts without the interference caused by Thrive Editor's script handling. This will ensure a smooth integration of Razorpay payment buttons into your website.

3. I am getting following error message `Razorpay error: Payment button fetch failed with the following message: The API key provided by you has expired and cannot be used. Please use the correct key and secret.` How do I resolve this?

This error indicates that your API Key and Secret for Razorpay have expired. Follow the steps given below to resolve the issue:

1. Log in to Dashboard.
2. Generate new [API Keys](/razorpay-docs-md/api/authentication.md#generate-api-keys)   .
3. Replace the old API Key and Secret in your integration code with the newly generated API keys.

### Related Information

- [Payment Button](/razorpay-docs-md/payment-button.md)
- [Create a WordPress Website](/razorpay-docs-md/payment-button/supported-platforms/wordpress/create-website.md)
- [Payment Button Elementor Plugin for WordPress](/razorpay-docs-md/payment-button/supported-platforms/wordpress/elementor.md)
- [Payment Button SiteOrigin Plugin for WordPress](/razorpay-docs-md/payment-button/supported-platforms/wordpress/site-origin.md)
- [Payment Button Visual Composer Plugin for WordPress](/razorpay-docs-md/payment-button/supported-platforms/wordpress/visual-composer.md)
