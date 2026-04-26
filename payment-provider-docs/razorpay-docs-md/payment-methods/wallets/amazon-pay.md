<!-- Source: https://razorpay.com/docs/payments/payment-methods/wallets/amazon-pay -->

Amazon Pay is a wallet-based payment method that allows customers with an Amazon account to make payments using their Amazon Pay balance. After Amazon Pay is enabled and integrated, it is listed on your website/app Checkout page as an option under the wallet payment method. Know more about [Amazon Pay](https://www.amazonpay.in/).

On-Demand Feature - Raise a Request

**Feature Request**

- This is an on-demand feature. Please raise a request with our [Support team](https://razorpay.com/support/#request)

  to get this feature activated on your Razorpay account.
- Watch this video to know how to raise a feature enablement request on the Dashboard.

![Feature Request GIF](https://razorpay.com/docs/payments/payment-methods/wallets/build/browser/assets/images/feature-request.gif)

## Integrate Amazon Pay on Standard Checkout - Web, Mobile and iOS

You can accept payments through wallets which are available by default. However, if you want to accept payments from external wallets, such as Amazon Pay, integration is required. Razorpay does not process payments for external wallets and gives you the control along with all the customer data entered in the Checkout form.

**Handy Tips**

The wallet payment option can be used for a purchase amount of up to ₹20000 (2000000 in paise).

Web

Android

iOS

To list external wallets on your web application, you need to first integrate our [Checkout form](/razorpay-docs-md/payment-gateway/web-integration/standard.md). After you integrate, follow the steps given below:

1. Add a key `external` to `checkout.js` options.
2. Set `wallets` with wallet name array in `external` as the first parameter.

   JavaScript

   copy

   ```javascript
external: {
    wallets: ['amazonpay']
  }
```
3. Set `handler` with a callback function in `external` as the second parameter.

   JavaScript

   copy

   ```javascript
external: {
    wallets: ['amazonpay'],
    handler: function(data) {
      'data'
      console.log(this, data)
    }
  }
```

The Amazon Pay is now shown in the wallets section. If the customer selects the external wallet and clicks **Submit**, our Standard Checkout library returns the control to you in the `external:handler:` method. You will get the selected wallet name as an argument. You will have to handle the payment flow for the wallet from hereon.
