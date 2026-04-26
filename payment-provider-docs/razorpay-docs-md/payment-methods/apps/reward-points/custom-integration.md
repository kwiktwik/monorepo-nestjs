<!-- Source: https://razorpay.com/docs/payments/payment-methods/apps/reward-points/custom-integration -->

Enable your customers to pay using a combination of reward points and another payment method such as cards, netbanking, wallets or UPI, on your Web custom integration.

**Feature Request**

- This is an on-demand feature. Please raise a request with our [Support team](https://razorpay.com/support/#request)

  to get this feature activated on your Razorpay account.
- Watch this video to know how to raise a feature enablement request on the Dashboard.

![Feature Request GIF](https://razorpay.com/docs/payments/payment-methods/apps/reward-points/build/browser/assets/images/feature-request.gif)

## Prerequisites

- Sign up for a Razorpay account.
- Generate [API Keys](/razorpay-docs-md/api/authentication.md#generate-api-keys)

  on the Dashboard.
- Configure [payment capture settings](/razorpay-docs-md/payments.md#dashboard-actions)

  on the Dashboard.
- Integrate Razorpay Custom Checkout on your [website](/razorpay-docs-md/payment-gateway/web-integration/custom.md)  .
- Customers should have earned reward points. In the absence of reward points, customers will get an error and will not be able to proceed with `Pay with Reward Points`.

## Integrate Reward Points on Web Custom

Follow the steps mentioned in the [Web Custom Integration document](/razorpay-docs-md/payment-gateway/web-integration/custom.md).

To add **Pay with Reward Points** as a payment method, you need to pass the `method` and `provider` parameters while creating the payment.

#### Request Parameters

Along with the other checkout options, you must pass:

method

mandatory

`string` The method used to make the payment. Here, it should be `app`.

provider

mandatory if method=app

`string` Name of the service provider. Here, it should be `twid`.

Create Payment

copy

```javascript
razorpay.createPayment({
  amount: 12340,
  currency: 'INR',
  email: 'gaurav.kumar@example.com',
  contact: '9111145678',
  order_id: 'order_EAbtuXPh24LrEc',
  method: 'app',
  provider: 'twid'
});
```

### Related Information

- [FAQs](/razorpay-docs-md/payment-methods/apps/reward-points/faqs.md)
