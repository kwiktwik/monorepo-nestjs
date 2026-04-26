<!-- Source: https://razorpay.com/docs/payments/payment-methods/trustly/custom-integration -->

**Feature Request**

This is an on-demand feature. Please raise a request with our [Support team](https://razorpay.com/support/#request) to get this feature activated on your Razorpay account.

## Prerequisites

1. [Sign up](https://dashboard.razorpay.com/#/access/signup)

   for a Razorpay account.
2. [Generate API Keys](/razorpay-docs-md/api/authentication.md#generate-api-keys)

   from the Dashboard.
3. Integrate Razorpay Custom Checkout on your [website](/razorpay-docs-md/payment-gateway/web-integration/custom.md)   , [Android app](/razorpay-docs-md/payment-gateway/android-integration/custom.md)

   or [iOS App](/razorpay-docs-md/payment-gateway/ios-integration/custom.md)   .

## Integrate Trustly on Custom Checkout

- Create an Order.
- Pass `method` and `provider` parameters in [Create Payment Method](/razorpay-docs-md/payment-gateway/web-integration/custom/build-integration.md#133-submit-payment-details)  .

### Create an Order

Order is an important step in the payment process.

1. An order should be created for every payment.
2. You can create an order using the [Orders API](/razorpay-docs-md/payment-methods/trustly/custom-integration.md#api-sample-code)   . It is a server-side API call.  Know how to [authenticate](/razorpay-docs-md/api/authentication.md#generate-api-keys)

   Orders API.
3. Pass the `order_id` received in response to the checkout. This ties the Order with the payment and secures the request from being tampered.

#### API Sample Code

The following is a sample API request and response for creating an order:

CurlJavaPythonPHPRubyNode.js.NETResponse

copy

```bash
curl -X POST https://api.razorpay.com/v1/orders
-u [YOUR_KEY_ID]:[YOUR_KEY_SECRET]
-H 'content-type:application/json'
-d '{
    "amount": 50000,
    "currency": "INR",
    "receipt": "rcptid_11"
}'
```

#### Request Parameters

Here is the list of parameters and their description for creating an order:

amount

mandatory

`integer` The transaction amount, expressed in the currency subunit. For example, for an actual amount of ₹299.35 , the value of this field should be `29935`.

currency

mandatory

`string` The currency in which the transaction should be made. See the [list of supported currencies](/razorpay-docs-md/international-payments.md#supported-currencies). Length must be 3 characters.

receipt

optional

`string` Your receipt id for this order should be passed here. Maximum length is 40 characters.

notes

optional

`json object` Key-value pair that can be used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

partial\_payment

optional

`boolean` Indicates whether the customer can make a partial payment. Possible values:

- `true`: The customer can make partial payments.
- `false` (default): The customer cannot make partial payments.

id

mandatory

`string` Unique identifier of the customer. For example, `cust_1Aa00000000004`.

Know more about [Orders API](/razorpay-docs-md/api/orders.md).

#### Error Response Parameters

The error response parameters are available in the [API Reference Guide](/razorpay-docs-md/api/orders/create.md).

### Pass method and provider Parameters During Payment Creation

The following is a sample API to create a payment.

Trustly

copy

```javascript
razorpay.createPayment({
  "amount": 500,
  "currency": "INR",
  "email": "gaurav.kumar@example.com",
  "contact": 9111145678,
  "order_id": "order_EAbtuXPh24LrEc",
  "method": "app",
  "provider": "trustly"
});
```

Response

copy

```json
{
  "razorpay_payment_id": "pay_xxxx",
  "next": [
    {
      "action": "poll",
      "url": "https://api.razorpay.com/v1/payments/pay_xxx/status"
    }
  ]
}
```

#### Request Parameters

Along with the other checkout options, you must pass:

method

mandatory

`string` The method used to make the payment. Here, it should be `app`.

provider

mandatory if method=app

`string` Name of the PSP app. Here, it should be `trustly`.
