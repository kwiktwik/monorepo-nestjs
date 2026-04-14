<!-- Source: https://razorpay.com/docs/payments/payment-gateway/s2s-integration/redirect/build-integration -->

You can integrate with Razorpay APIs to start accepting payments made using netbanking, card, UPI and other payment methods. In this document, the netbanking payment method has been shown as an example.

Follow these steps to integrate your Web application with the Razorpay S2S Redirect API:

**1.1** [Create an Order](/razorpay-docs-md/payment-gateway/s2s-integration/redirect/build-integration.md#11-create-an-order).

**1.2** [Create a Payment](/razorpay-docs-md/payment-gateway/s2s-integration/redirect/build-integration.md#12-create-a-payment).

**1.3** [Handle Payment Success and Failure](/razorpay-docs-md/payment-gateway/s2s-integration/redirect/build-integration.md#13-handle-payment-success-and-failure).

**1.4** [Verify Payment Signature](/razorpay-docs-md/payment-gateway/s2s-integration/redirect/build-integration.md#14-verify-payment-signature).

**1.5** [Verify Payment Status](/razorpay-docs-md/payment-gateway/s2s-integration/redirect/build-integration.md#15-verify-payment-status).

**Watch Out!**

Do not hardcode the URL returned in the API responses.

## 1.1 Create an Order

**Order is an important step in the payment process.**

- An order should be created for every payment.
- You can create an order using the [Orders API](/razorpay-docs-md/payment-gateway/s2s-integration/redirect/build-integration.md#api-sample-code)  . It is a server-side API call. Know how to [authenticate](/razorpay-docs-md/dashboard/account-settings/api-keys.md#generate-api-keys)

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

## 1.2 Create a Payment

Create a payment using the API given below after your order is created.

POST

/payments/create/redirect

#### Sample Code

The following is a sample API request and response for creating a payment:

#### Request Parameters

amount

mandatory

`integer` Payment amount in the smallest currency subunit.
 For example, if the amount to be charged is ₹299, then pass `29900` in this field.

currency

mandatory

`string` Currency code for the currency in which you want to accept the payment. For example, `INR`. Refer to the [supported currencies](/razorpay-docs-md/international-payments.md#supported-currencies) for a list of supported international currencies.

order\_id

mandatory

`string` Unique identifier of the Order created at your server side.
 Enter the `id` returned in the response of the [previous](/razorpay-docs-md/payment-gateway/s2s-integration/redirect/build-integration.md#11-create-an-order) step.

email

mandatory

`string` Email address of the customer.

contact

mandatory

`string` Contact of the customer.

method

mandatory

`string` Supported payment methods are:

- `card`
- `netbanking`
- `wallet`
- `emi`
- `upi`
- `emandate`

vpa

mandatory

`string` Virtual payment address of the customer. Required if the method is `upi`.

**Deprecation Notice**

UPI Collect is deprecated effective 28 February 2026. This tab is applicable only for exempted businesses. If you are not covered by the exemptions, refer to the [migration documentation](/docs/announcements/upi-collect-migration/s2s-integration/) to switch to UPI Intent.

card

The fields that can be pre-populated in the Checkout form.

number

mandatory

`string` Unformatted card number. Required if the method is `card`.

name

mandatory

`string` Name of the cardholder. Required if the method is `card`.

expiry\_month

mandatory

`integer` Expiry month for the card in `MM` format. Required if the method is `card`.

expiry\_year

mandatory

`string` Expiry year for the card in `YY` format. Required if the method is `card`.

cvv

mandatory

`string` CVV printed on the back of the card. Required if the method is `card`.

**Handy Tips**

- CVV is not required by default for tokenised cards across all networks.
- CVV is optional for tokenised card payments. Do not pass dummy CVV values.
- To implement this change, skip passing the `cvv` parameter entirely, or pass a `null` or empty value in the CVV field.
- We recommend removing the CVV field from your checkout UI/UX for tokenised cards.
- If CVV is still collected for tokenised cards and the customer enters a CVV, pass the entered CVV value to Razorpay.

bank\_account

The details of the bank account that should be passed in the request.

account\_number

mandatory

`string` Bank account number used to initiate the payment. Required if the method is `emandate`.

ifsc

mandatory

`string` IFSC of the bank used to initiate the payment. Required if the method is `emandate`.

name

mandatory

`string` Name associated with the bank account used to initiate the payment. Required if the method is `emandate`.

bank

mandatory

`string` Bank code of the bank used for the payment. Required if the method is `fpx`.

wallet

mandatory

`string` Wallet code for the wallet used for the payment. Required if the method is `wallet`.

notes

optional

`object` Key-value object used for passing tracking info. Refer to [notes](/razorpay-docs-md/api/understand.md#notes) for more details.

callback\_url

optional

`string` URL endpoint where Razorpay will submit the final payment status.

ip

mandatory

`string` IP Address of the client's browser.

referrer

mandatory

`string` Referrer header passed by the client's browser.

user\_agent

mandatory

`string` Value of **user\_agent** header passed by the client's browser.

#### Response Parameters

Descriptions for the response parameters are present in the [Payments Entity](/razorpay-docs-md/api/payments.md#payments-entity) parameters table.

#### Response Types

2OO OK

The response contains `200 OK` code along with the HTML content that needs to be opened in the customer's browser. This HTML content contains form fields that will be automatically posted to the bank or wallet URL (specified in the form) to continue with the payment process.

400 Bad Request

This can happen when erroneous parameters are passed in the request, for example invalid currency.

copy

```
{
"error_code": "BAD_REQUEST_ERROR",
"error_description": "Payment failed",
"error_source": "gateway",
"error_step": "payment_authorization",
"error_reason": "payment_failed",
}
```

Know more about [errors](/docs/errors/).

The HTML form returned in the response should be opened in the customer's browser. The customer completes the payment on the displayed page.

## 1.3 Handle Payment Success and Failure

Once the payment is completed by the customer, a `POST` request is sent to the `callback_url` provided in the [create a payment request](/razorpay-docs-md/payment-gateway/s2s-integration/redirect/build-integration.md#12-create-a-payment). The data contained in the `POST` request depends on the **success** or **failure** of the payment made by the customer.

#### Success

A successful payment contains the following fields:

1. `razorpay_payment_id`
2. `razorpay_order_id`
3. `razorpay_signature`

Success - Callback

copy

```json
{   "razorpay_payment_id": "pay_29QQoUBi66xm2f",
    "razorpay_order_id": "order_9A33XWu170gUtm",
    "razorpay_signature": "9ef4dffbfd84f1318f6739a3ce19f9d85851857ae648f114332d8401e0949a3d"
}
```

#### Failure

In failed payments, the response received at the callback contains the error details as shown below:

copy

```
error%5Bcode%5D=BAD_REQUEST_ERROR&error%5Bdescription%5D=Payment+failed&error%5Bsource%5D=gateway&error%5Bstep%5D=payment_authorization&error%5Breason%5D=payment_failed&error%5Bmetadata%5D=%7B%22payment_id%22%3A%22pay_HDP0E0MdoAaOYu%22%2C%22order_id%22%3A%22order_HDOSKuUVbejk0C%22%7D
```

The key-value parameters of the request are shown below:

error\_code

`string` Error that occurred during payment. For example, `BAD_REQUEST_ERROR`.

error\_description

`string` Description of the error that occurred during payment. For example, `Payment failed`.

error\_source

`string` The point of failure. For example, `gateway`.

error\_step

`string` The stage where the transaction failure occurred. The stages can vary depending on the payment method used to complete the transaction. For example, `payment_auhtorization`.

error\_reason

`string` The exact error reason. For example, `payment_failed`.

metadata

`object` Contains additional information about the request.

payment\_id

`string` Unique identifier of the payment.

order\_id

`string` Unique identifier of the order associated with the payment.

Know more about [errors](/docs/errors/).

## 1.4 Verify Payment Signature

This is a mandatory step to confirm the authenticity of the details returned to the Checkout form for successful payments.

To verify the `razorpay_signature` returned to you by the Checkout form:

1. Create a signature in your server using the following attributes:

   - `order_id`: Retrieve the `order_id` from your server. Do not use the `razorpay_order_id` returned by Checkout.
   - `razorpay_payment_id`: Returned by Checkout.
   - `key_secret`: Available in your server. The `key_secret` that was generated from the [Dashboard](/razorpay-docs-md/dashboard/account-settings/api-keys.md#generate-api-keys)     .
2. Use the SHA256 algorithm, the `razorpay_payment_id` and the `order_id` to construct a HMAC hex digest as shown below:

   HMAC Hex Digest

   copy

   ```html
generated_signature = hmac_sha256(order_id + "|" + razorpay_payment_id, secret);

  if (generated_signature == razorpay_signature) {
    payment is successful
  }
```
3. If the signature you generate on your server matches the `razorpay_signature` returned to you by the Checkout form, the payment received is from an authentic source.

Generate Signature on Your Server

Given below is the sample code for payment signature verification:

JavaPythonGoPHPRubyNode.js.NET

copy

```java
RazorpayClient razorpay = new RazorpayClient("[YOUR_KEY_ID]", "[YOUR_KEY_SECRET]");

String secret = "EnLs21M47BllR3X8PSFtjtbd";

JSONObject options = new JSONObject();
options.put("razorpay_order_id", "order_IEIaMR65cu6nz3");
options.put("razorpay_payment_id", "pay_IH4NVgf4Dreq1l");
options.put("razorpay_signature", "0d4e745a1838664ad6c9c9902212a32d627d68e917290b0ad5f08ff4561bc50f");

boolean status =  Utils.verifyPaymentSignature(options, secret);
```

Post Signature Verification

After you have completed the integration, you can [set up webhooks](/docs/webhooks/setup-edit-payments/), make test payments, replace the test key with the live key and integrate with other [APIs](/razorpay-docs-md/api/index.md).

## 1.5 Verify Payment Status

**Handy Tips**

On the Razorpay Dashboard, ensure that the payment status is `captured`. Refer to the payment capture settings page to know how to [capture payments automatically](/razorpay-docs-md/payments/capture-settings.md).

You can track the payment status in three ways:

Verify Status from Dashboard

Subscribe to Webhook Events

Poll APIs

To verify the payment status from the Razorpay Dashboard:

1. Log in to the Razorpay Dashboard and navigate to **Transactions** → **Payments**.
2. Check if a **Payment Id** has been generated and note the status. In case of a successful payment, the status is marked as **Captured**.

![Payment details on Dashboard](https://razorpay.com/docs/payments/payment-gateway/s2s-integration/redirect/build/browser/assets/images/testpayment.jpg)

## Integrate Payments Rainy Day Kit

Use Payments Rainy Day kit to overcome payments exceptions such as:

- [Late Authorisation](/razorpay-docs-md/payments/late-authorisation.md)
- [Payment Downtime](/razorpay-docs-md/api/payments/downtime.md)
- [Payment Errors](/docs/errors/)

## Next Steps [Step 2: Test Integration](/razorpay-docs-md/payment-gateway/s2s-integration/redirect/test-integration.md)
