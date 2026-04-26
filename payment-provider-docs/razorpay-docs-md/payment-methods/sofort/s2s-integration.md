<!-- Source: https://razorpay.com/docs/payments/payment-methods/sofort/s2s-integration -->

**Feature Request**

- This is an on-demand feature. Please raise a request with our [Support team](https://razorpay.com/support/#request)

  to get this feature activated on your Razorpay account.
- Watch this video to know how to raise a feature enablement request on the Dashboard.

![Feature Request GIF](https://razorpay.com/docs/payments/payment-methods/sofort/build/browser/assets/images/feature-request.gif)

## Prerequisites

1. [Sign up](https://dashboard.razorpay.com/#/access/signup)

   for a Razorpay account.
2. Generate API Keys.
3. Follow the [Razorpay S2S Integration documentation](/razorpay-docs-md/payment-gateway/s2s-integration.md)   .

## Integrate Sofort on S2S

- Create an Order.
- Pass `method` and `provider` parameters in Create Payments API.

### Create an Order

Order is an important step in the payment process.

1. An order should be created for every payment.
2. You can create an order using the [Orders API](/razorpay-docs-md/payment-methods/sofort/s2s-integration.md#api-sample-code)   . It is a server-side API call.  Know how to [authenticate](/razorpay-docs-md/api/authentication.md#generate-api-keys)

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

### Pass method and provider Parameters in Create Payments API

The following is a sample API to create a payment.

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

Along with the other Create Payment API request parameters, you must pass:

method

mandatory

`string` The method used to make the payment. Here, it should be `app`.

provider

mandatory if method=app

`string` Name of the PSP app. Here, it should be `sofort`.
