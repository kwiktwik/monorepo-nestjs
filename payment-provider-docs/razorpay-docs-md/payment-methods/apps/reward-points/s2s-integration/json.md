<!-- Source: https://razorpay.com/docs/payments/payment-methods/apps/reward-points/s2s-integration/json -->

You can enable your customers to pay using a combination of reward points and a payment method such as cards, netbanking, wallets or UPI, on your S2S integration.

**Feature Request**

This is an on-demand feature. Please raise a request with our [Support team](https://razorpay.com/support/#request) to get this feature activated on your Razorpay account.

## Prerequisites

- Sign up for a Razorpay account.
- Generate [API Keys](/razorpay-docs-md/api/authentication.md#generate-api-keys)

  on the Dashboard.
- Configure [payment capture settings](/razorpay-docs-md/payments.md#dashboard-actions)

  on the Dashboard.
- Follow the [Razorpay S2S Integration documentation](/razorpay-docs-md/payment-gateway/s2s-integration.md)  .
- Customers should have earned reward points. In the absence of reward points, customers will get an error and will not be able to proceed with `Pay with Reward Points`.

## Integration Steps

Given below are the integration steps:

1. [Fetch payment methods using the Methods API](/razorpay-docs-md/payment-methods/apps/reward-points/s2s-integration/json.md#step-1-fetch-payment-methods-using-methods-api)

   .
2. [Create an order using the Orders API](/razorpay-docs-md/payment-methods/apps/reward-points/s2s-integration/json.md#step-2-create-an-order-using-orders-api)

   .
3. [Create a payment using the S2S JSON Payments API](/razorpay-docs-md/payment-methods/apps/reward-points/s2s-integration/json.md#step-3-create-a-payment-using-s2s-json)

   .
4. [Handle payment success and failure](/razorpay-docs-md/payment-methods/apps/reward-points/s2s-integration/json.md#step-4-handle-payment-success-and-failure)

   .
5. [Fetch payment status](/razorpay-docs-md/payment-methods/apps/reward-points/s2s-integration/json.md#step-5-fetch-payment-status)

   .

### Step 1: Fetch Payment Methods using Methods API

To fetch a list of payment methods enabled for your account, send the following request:

GET

/methods

RequestResponse

copy

```bash
curl -u [YOUR_KEY_ID] \
- X GET https://api.razorpay.com/v1/methods \
```

### Step 2: Create an order using Orders API

Create an order using the Orders API. Send the order request parameters to the following endpoint:

**Order is an important step in the payment process.**

- An order should be created for every payment.
- You can create an order using the [Orders API](/razorpay-docs-md/payment-methods/apps/reward-points/s2s-integration/json.md#api-sample-code)  . It is a server-side API call. Know how to [authenticate](/razorpay-docs-md/dashboard/account-settings/api-keys.md#generate-api-keys)

  Orders API.
- The `order_id` received in the response should be passed to the checkout. This ties the order with the payment and secures the request from being tampered.

**Watch Out!**

Payments made without an `order_id` cannot be captured and will be automatically refunded. You must create an order before initiating payments to ensure proper payment processing.

You can create an order:

- Using the sample code on the Razorpay Postman Public Workspace.
- By manually integrating the API sample codes on your server.

#### Razorpay Postman Public Workspace

You can use the Postman workspace below to create an order: [![Run in Postman](https://run.pstmn.io/button.svg)](https://www.postman.com/razorpaydev/workspace/razorpay-public-workspace/request/12492020-6f15a901-06ea-4224-b396-15cd94c6148d)

**Handy Tips**

Under the **Authorization** section in Postman, select **Basic Auth** and add the Key Id and secret as the Username and Password, respectively.

#### API Sample Code

Use this endpoint to create an order using the Orders API.

POST

/orders

CurlJavaPythonGoPHPRubyNode.js.NET

copy

```bash
curl -X POST https://api.razorpay.com/v1/orders
-U [YOUR_KEY_ID]:[YOUR_KEY_SECRET]
-H 'content-type:application/json'
-d '{
 "amount": 500,
 "currency": "INR",
 "receipt": "qwsaq1",
 "partial_payment": true,
 "first_payment_min_amount": 230,
 "notes": {
   "key1": "value3",
   "key2": "value2"
 }
}'
```

Success ResponseFailure Response

copy

```json
{
 "id": "order_IluGWxBm9U8zJ8",
 "entity": "order",
 "amount": 5000,
 "amount_paid": 0,
 "amount_due": 5000,
 "currency": "INR",
 "receipt": "rcptid_11",
 "offer_id": null,
 "status": "created",
 "attempts": 0,
 "notes": [],
 "created_at": 1642662092
}
```

Request Parameters

amount

mandatory

`integer` Payment amount in the smallest currency subunit. For example, if the amount to be charged is ₹299, then pass `29900` in this field. In the case of three decimal currencies, such as KWD, BHD and OMR, to accept a payment of 295.991, pass the value as 295990. And in the case of zero decimal currencies such as JPY, to accept a payment of 295, pass the value as 295.

**Watch Out!**

As per payment guidelines, you should pass the last decimal number as 0 for three decimal currency payments. For example, if you want to charge a customer 99.991 KD for a transaction, you should pass the value for the amount parameter as `99990` and not `99991`.

currency

mandatory

`string` The currency in which the transaction should be made. See the [list of supported currencies](/razorpay-docs-md/international-payments.md#supported-currencies). Length must be 3 characters.

**Handy Tips**

Razorpay has added support for zero decimal currencies, such as JPY and three decimal currencies, such as KWD, BHD and OMR, allowing businesses to accept international payments in these currencies. Know more about [Currency Conversion](/razorpay-docs-md/international-payments/currency-conversion.md)

(May 2024).

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

first\_payment\_min\_amount

optional

`integer` Minimum amount that must be paid by the customer as the first partial payment. For example, if an amount of ₹7,000 is to be received from the customer in two installments of #1 - ₹5,000, #2 - ₹2,000 then you can set this value as `500000`. This parameter should be passed only if `partial_payment` is `true`.

Know more about [Orders API](/razorpay-docs-md/api/orders.md).

Response Parameters

Descriptions for the response parameters are present in the [Orders Entity](/razorpay-docs-md/api/orders/entity.md) parameters table.

Error Response Parameters

The error response parameters are available in the [API Reference Guide](/razorpay-docs-md/api/orders/create.md).

### Step 3: Create a Payment using S2S JSON Payments API

Use the following API to create a payment with `app` as the payment method:

POST

/payments/create/json

curlResponse

copy

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X POST https://api.razorpay.com/v1/payments/create/json \
-H "Content-Type: application/json" \
 -d '{
  "amount": "100",
  "currency": "INR",
  "email": "gaurav.kumar@example.com",
  "contact": "9000090000",
  "order_id": "order_EKwxwAgItmmXdp",
  "method": "app",
  "provider": "twid"
}'
```

#### Request Parameters

amount

mandatory

`integer` The amount to be paid by the customer in currency subunits. For example, if the amount is ₹100, enter `10000`.

currency

mandatory

`string` The currency in which the payment should be made by the customer. See the list of [supported currencies](/razorpay-docs-md/international-payments.md#supported-currencies).

order\_id

mandatory

`string` Order ID generated in the previous step.

email

mandatory

`string` Email address of the customer.

contact

mandatory

`string` Phone number of the customer.

method

mandatory

`string` Name of the payment method. Enter the value `app`.

provider

mandatory

`string` Name of the service provider partnered with Razorpay. Enter the value `twid`.

notes

optional

`object` Set of key-value pairs used to store additional information about the payment. It can hold a maximum of 15 key-value pairs, each 256 characters long (maximum).

callback\_url

optional

`string` URL endpoint where Razorpay will submit the final payment status.

ip

optional

`string` Customer IP Address.

referrer

optional

`string` Customer referrer.

user\_agent

optional

`string` Customer user-agent.

#### Response Parameters

If the payment request is valid, the response contains the following fields.

razorpay\_payment\_id

`string` Unique identifier of the payment. Present for all responses.

next

`array` A list of action objects available to you to continue the payment process. Present when the payment requires further processing.

action

`string` An indication of the next step available to you to continue the payment process. Possible value:

- `redirect`: Use this URL to redirect customers to the Twid page. Customers should select the reward points here and complete the redemption process/

url

`string` URL to be used for the action indicated.

### Step 4: Handle Payment Success and Failure

Once the customer completes the payment, a `POST` request is made to the `callback_url` provided in the payment request. The data contained in this request will depend on whether the payment was a **success** or a **failure**.

#### Success Callback

If the payment made by the customer is successful, the following fields are sent:

- `razorpay_payment_id`
- `razorpay_order_id`
- `razorpay_signature`

Callback Example

copy

```json
{
  "razorpay_payment_id": "pay_FVptEVkDdNzFx8",
  "razorpay_order_id": "order_EKwxwAgItmmXdp",
  "razorpay_signature": "9ef4dffbfd84f1318f6739a3ce19f9d85851857ae648f114332d8401e0949a3d"
}
```

#### Failure Callback

If the payment has failed, the callback will contain details of the error. Know more about [errors](/docs/errors/).

### Step 5: Fetch Payment Status

Upon payment completion, you can fetch the status of the payment using:

- [Fetch Payments API](/razorpay-docs-md/api/payments.md#fetch-multiple-payments)
- [Payments Webhooks (Recommended)](/docs/webhooks/payments/#payments)

### Related Information

- [FAQs](/razorpay-docs-md/payment-methods/apps/reward-points/faqs.md)
