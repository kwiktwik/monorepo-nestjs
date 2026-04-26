<!-- Source: https://razorpay.com/docs/payments/payment-gateway/ecommerce-plugins -->

Integrate seamlessly with ecommerce platforms through our robust and secure plugins. You can accept payments via a range of payment methods like debit cards, credit cards, netbanking (supports 3D Secure), UPI and so on.

## List of Ecommerce Plugins and Supported Platforms

Following are the various ecommerce plugins and supported platforms:

Payment Gateway Ecommerce Plugins

Other Ecommerce Plugins

**Payment Gateway Ecommerce Plugins** provide a convenient checkout experience and expand the payment options available to businesses.

You can [build your own plugin](/razorpay-docs-md/payment-gateway/ecommerce-plugins/build-your-own.md) in case the plugin you are looking for is not listed above.

### Frequently Asked Questions

1. Does Razorpay provide integration support for all ecommerce platforms?

Razorpay offers official plugins for the following platforms:

- Shopify
- WooCommerce
- Wix
- Magento
- BigCommerce
- OpenCart
- PrestaShop
- WHMCS
- WordPress
- Drupal Commerce
- CS-Cart
- Arastta
- Easy Digital Downloads
- Gravity Forms

For platforms without an official Razorpay plugin, integration support is managed by the respective platform's support team. This ensures you receive the best assistance for platform-specific requirements and configurations.

2. I am using a platform not listed in Razorpay's plugin directory. How do I integrate Razorpay?

For platforms without an official Razorpay plugin, you have two options: contact your platform's support team to check if they offer Razorpay integration support, or use Razorpay's APIs to [build a custom integration](/razorpay-docs-md/payment-gateway/ecommerce-plugins/build-your-own.md).

3. Why am I seeing only a "Pay with Credit/Debit Card" option instead of the full Razorpay Checkout?

This usually indicates malicious code (malware) injected into your website that is hijacking the checkout. To verify and fix this:

1. Test your API keys on the Razorpay test page or set up a fresh installation of your ecommerce platform and test the integration there. If checkout loads correctly, the issue is with your current website code.
2. Run a full malware scan on your website using security tools appropriate for your platform.
3. Remove any suspicious or recently added plugins/extensions and check theme files for unknown JavaScript code.
4. After cleanup, reinstall the Razorpay plugin from the official source.

If the issue persists even after following these steps, contact our [Support team](https://razorpay.com/support/).

### Related Information

- [How Payment Gateway Works](/razorpay-docs-md/payment-gateway/how-it-works.md)
- [Features](/razorpay-docs-md/payment-gateway/features.md)
- [Supported Payment Methods](/razorpay-docs-md/payment-methods.md#supported-payment-methods)
