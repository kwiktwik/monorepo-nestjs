<!-- Source: https://razorpay.com/docs/payments/route/plugins/woocommerce -->

Use Razorpay Route on your WooCommerce website to split payments received using the Razorpay Payment Gateway and transfer the funds to Linked Accounts. Razorpy Route is available in the [Razorpay Payment Gateway for WooCommerce plugin](https://woocommerce.com/products/razorpay-for-woocommerce/?quid=57ce5a37ef6413695523cb3fd68f1c1b).

## Plugin Dependencies

You must have the following installed for the plugin to work:

## Prerequisites

- Integrate your [WooCommerce website](/razorpay-docs-md/payment-gateway/ecommerce-plugins/woocommerce.md)

  with the Razorpay Payment Gateway plugin.
- Create [Linked Accounts](/razorpay-docs-md/route/linked-account.md#create-linked-accounts)

  to split the received payments.
- Understand the [payment flow](/razorpay-docs-md/payment-gateway/how-it-works.md)

  process.

- Generate the API keys from the Razorpay Dashboard by navigating to **Settings** → **API Keys**. You can use the Test mode keys for testing and later switch to the Live mode keys when going live with the integration.

## How it Works

1. You enable the Route Module in the Razorpay Payment Gateway plugin for WooCommerce.
2. You define the transfer details, such as the Linked Account number and amount, while creating a product.

   **Handy Tips**

   The Route Module is a product-specific feature. You can exclude this module for the required product by not defining the transfer details while creating a product.
3. The transfer will be initiated automatically after the customer makes the payment.

## Integration Steps

Follow these steps to integrate Razorpay Route on your WooCommerce-enabled WordPress website:

#### 1. Build Integration

Integrate Route Using WooCommerce plugin.

#### 2. Test Integration

Test the integration by making a test payment.

#### 3. Go-live Checklist

Check the go-live checklist.

## Support

If you have any queries, raise a ticket on the [Razorpay Support Portal](https://razorpay.com/support/).
