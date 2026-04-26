<!-- Source: https://developer.phonepe.com/payment-gateway/e-commerce-plugins/magento -->

# Magento Integration

---

Built on open-source technology, Magento is a highly flexible e-commerce platform that puts you in the driver’s seat. It offers a comprehensive shopping cart system and allows you to customize every aspect of your online store’s appearance, content, and functionality. The platform also includes built-in tools for marketing, SEO, and catalog management, giving you everything you need to succeed online.

**📘** **Magento Integration: Key Information for Merchants!**

---

- Our plugin supports **Magento 2.x** since Magento 1.x has officially reached EOL in June 2020. We highly recommend migrating to Magento 2.x for continued support and updates.
- We support both **UAT(Test)** and **Production** modes for processing transactions.
- The merchant order ID is now visible on the Magento dashboard, allowing you to view all transaction details.
- We provide webhook support and the option to invoke the paypage in an iFrame or a new window.
- We currently do not support controlling payment methods or defining custom timeout periods.

## Installation

To get started with the PhonePe plugin, you will need two main components to be installed:

- **Install the PhonePe PHP SDK** (**V2 – 2.0.0**) by following the official instructions on the [PhonePe Developer Documentation](/phonepe-docs-md/payment-gateway/backend-sdk/php-be-sdk/sdk-reference-php/installation.md).
  - Open your project’s **composer.json** file in your preferred editor.
  - Copy and paste the `repositories` and `require` code from the PhonePe PHP developer documentation into the corresponding sections of your **composer.json** file.
  - Once you have copied the code, run the **`composer install`** command in your terminal from your Magento root directory to install the PHP dependencies.

- **Download the latest** release of the **PhonePe plugin(1.0.0)** for your e-commerce platform. To download click [here](https://phonepe.mycloudrepo.io/public/repositories/phonepe-plugins/magento/Phonepe_Plugin.zip).
  - Unzip the plugin file you downloaded.
  - Copy the unzipped folder into your Magento project’s app **→** code directory.
  - From your project’s root directory (where the `bin` folder is located), run the required Magento-specific commands to enable the plugin into your store.

Run this command to enable your PhonePe Payment Gateway

```
php bin/magento module:enable Phonepe_PG
```

Run these are magento specific commands

```
php bin/magento setup:upgrade
php bin/magento setup:di:compile
php bin/magento cache:flush
```

## Integrating PhonePe Payment Gateway with Magento

- Log in to your Magento site as an administrator.

[](/static/aeb531bca0ffbc0e7cc653c1f07882b0/PhonePe-Integration-with-Magento-Plugin.mp4)

[](/static/aeb531bca0ffbc0e7cc653c1f07882b0/PhonePe-Integration-with-Magento-Plugin.mp4)

- From the menu, go to Stores **→** Configuration and make sure the scope is set to “Default Config.”

[](/static/c20a6c867520f9e919e1c23b73d9ee65/PhonePe-Integration-with-Magento-Plugin-2.mp4)

[](/static/c20a6c867520f9e919e1c23b73d9ee65/PhonePe-Integration-with-Magento-Plugin-2.mp4)

- Scroll to Sales and click on Payment Methods.

[](/static/d1e2114e29229eb00abebcf77fb24e42/PhonePe-Integration-with-Magento-Plugin-4.mp4)

[](/static/d1e2114e29229eb00abebcf77fb24e42/PhonePe-Integration-with-Magento-Plugin-4.mp4)

- Find the PhonePe Payment Gateway section.
- Set “Enable” to “Yes” and enter your Client ID, Client Secret, and Client Version.

[](/static/caed2f75c7c40d2cd8f425d996136c5a/PhonePe-Integration-with-Magento-Plugin-6.mp4)

[](/static/caed2f75c7c40d2cd8f425d996136c5a/PhonePe-Integration-with-Magento-Plugin-6.mp4)

- We have two environments: **UAT (Test)** and **Production**. To validate the payment flow, begin in the ****UAT (Test)**** environment. Once you have successfully completed the process and verified its functionality, you may then use the **Production** environment.

[](/static/9f943eefde7b244f15679cc3bcf89b79/PhonePe-Integration-with-Magento-Plugin-14.mp4)

[](/static/9f943eefde7b244f15679cc3bcf89b79/PhonePe-Integration-with-Magento-Plugin-14.mp4)

**📘** **Accessing Your Credentials**

---

You can view your **Client ID** and **Client Secret** from the [PhonePe Business Dashboard](https://business.phonepe.com/). Navigate to **Developer Settings** to find your API keys and use them to try out the sample code.

⚠️ ******Webhook Registration in UAT!******

---

Webhook registration is currently not supported in UAT(Test) environment. This will not have an impact on the overall successful flow of the plugin.

## Check the Payment Flow

- Add an item to your cart and go to checkout. Fill in your shipping details and proceed.

[](/static/b06946a33652a838df48320fe38e96da/PhonePe-Integration-with-Magento-Plugin-7.mp4)

[](/static/b06946a33652a838df48320fe38e96da/PhonePe-Integration-with-Magento-Plugin-7.mp4)

- Select PhonePe PG on the Payment page.

[](/static/e1b571437d0d51bca6916e3b49b3a374/PhonePe-Integration-with-Magento-Plugin-8.mp4)

[](/static/e1b571437d0d51bca6916e3b49b3a374/PhonePe-Integration-with-Magento-Plugin-8.mp4)

- Complete the checkout to confirm the Payment is working.

[](/static/b67ba1222a4ee24a94b79b5e6733797f/PhonePe-Integration-with-Magento-Plugin-12.mp4)

[](/static/b67ba1222a4ee24a94b79b5e6733797f/PhonePe-Integration-with-Magento-Plugin-12.mp4)

That’s it! PhonePe Payment Gateway is now integrated with your Magento store, and you’re ready to start accepting payments from your customers.

## Troubleshoot

If your plugin is not visible on the store, please ensure to remove the old generated files and force deploy static content.

Run these commant to remove

```
rm -rf pub/static/frontend                           
rm -rf var/view_preprocessed
php bin/magento setup:static-content:deploy -f
php bin/magento cache:flush
```

## For step-by-step guidance, watch the integration video.

.custom-block-wrapper {
padding: 20px;
border: 1px solid black;
background-color: #d9edbc;
}
