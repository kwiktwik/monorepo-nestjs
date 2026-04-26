<!-- Source: https://razorpay.com/docs/payments/payment-methods/emi/cardless-emi/axio/custom-integration -->

axio is a cardless EMI offering by Capital Float - a BNPL (Buy Now, Pay Later) and Credit platform. Using axio, your customers can convert their payment amount to EMIs without a debit or credit card. You can show axio as a cardless EMI service provider on your Custom Checkout integration.

**Feature Enablement**

This is an on-demand feature. You can sign-up for our early access program using this [form](https://forms.gle/pN5Q6Yhr9cscCByU6).

**Minimum Order Amount**

Your customers should place an order of at least ₹900 to use axio as the cardless EMI payment provider.

## Prerequisites

- Sign up for a Razorpay account.
- [Generate API Keys](/razorpay-docs-md/api/authentication.md#generate-api-keys)

  from the Dashboard.
- Have [Razorpay Custom Checkout](/razorpay-docs-md/payment-gateway/web-integration/custom.md)

  integrated on your website.

## Integrate axio on Custom Checkout

To show axio as a cardless EMI provider, you should pass the `method` and `provider` parameters in the Create Payments API.

Sample Request

copy

```javascript
razorpay.createPayment({
  amount: 500000,
  currency: 'INR',
  email: 'gaurav.kumar@example.com',
  contact: '9123456000',
  order_id: 'order_EAkbvXiCJlwhHR',
  method: 'cardless_emi',
  provider: 'walnut369'
});
```

#### Request Parameters

Along with the other checkout options, you must pass:

method

mandatory

`string` The method used to make the payment. Here, it should be `cardless_emi`.

provider

mandatory

`string` Name of the cardless EMI provider. Here, it should be `walnut369`.

### Related Information

- [Know more about axio](/razorpay-docs-md/payment-methods/emi/cardless-emi/axio.md)

  .
