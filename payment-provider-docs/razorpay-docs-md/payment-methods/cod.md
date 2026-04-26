<!-- Source: https://razorpay.com/docs/payments/payment-methods/cod -->

You can now offer Cash on Delivery (COD) as a payment method on the Razorpay Checkout page. Customers can choose COD directly on the Checkout page, alongside UPI, cards, netbanking and more. This flow increases accessibility and builds trust among first-time buyers and high-value orders.

**Handy Tips** [Razorpay Magic Checkout](/razorpay-docs-md/magic-checkout.md) supports Cash on Delivery (COD) by default. For a simplified experience without the address section, use this flow that directly opens the payment page. Both flows support COD as a payment method.

## Prerequisites

- [Create a Razorpay account](https://dashboard.razorpay.com/)

  .
- Generate [API Keys](/razorpay-docs-md/dashboard/account-settings/api-keys.md#generate-api-keys)

  from the Dashboard. To go live with the integration and start accepting real payments, generate Live Mode API Keys and replace them in the integration.
- Integrate with Razorpay Magic Checkout:
  - [Native (Web)](/razorpay-docs-md/magic-checkout/web.md)
  - [Android](/razorpay-docs-md/magic-checkout/android-integration.md)
  - [iOS](/razorpay-docs-md/magic-checkout/ios-integration.md)
  - [React Native: Android](/razorpay-docs-md/magic-checkout/react-native-android-integration.md)
  - [React Native: iOS](/razorpay-docs-md/magic-checkout/react-native-ios-integration.md)
  - [Flutter](/razorpay-docs-md/magic-checkout/flutter-integration.md)
  - [Capacitor](/razorpay-docs-md/magic-checkout/capacitor-integration.md)

**Watch Out!**

This feature is currently supported only for native Razorpay integrations. It is not available on third-party platforms such as Shopify, WooCommerce and so on.

## Integration Steps

Follow the integration steps given below:

1. Use your existing Magic Checkout integration. While configuring the checkout options, pass the `show_address` parameter as shown below to control the visibility of the address section:

   json

   copy

   ```javascript
"options": {
    "show_address": false
    }
```

   show\_address

   `boolean` Determines whether the shipping address section appears on the Checkout page. Possible values

   - `true` (default): Show the address form.
   - `false`: Hide the address form.

   **Handy Tips**

   Magic Checkout supports **Cash on Delivery (COD)** by default and the checkout flow includes an address section. Use the `show_address` parameter to remove this step and maintain a simplified checkout experience.
2. **Cash on Delivery** appears as one of the available payment methods on the Checkout interface. Customers can select COD and confirm the order.

## Customer Experience

The flow below displays how customers can view and select **Cash on Delivery** during Checkout:

![COD on checkout - customer experience](https://razorpay.com/docs/payments/payment-methods/build/browser/assets/images/payment-methods-cod.gif)

### Related Information [Payment Configuration](/razorpay-docs-md/dashboard/account-settings/payment-configuration.md#configure-payment-options)
