<!-- Source: https://razorpay.com/docs/payments/payment-gateway/s2s-integration/json/v1/build-integration/cards -->

Integrate with Razorpay APIs to start accepting card payments. Our APIs support the latest 3DS2 authentication protocol.

**Handy Tips**

If you are an existing Razorpay user, that is, you integrated with our S2S APIs before October 15, 2022, you need to make certain integration changes to [migrate to the 3DS2 flow](/razorpay-docs-md/payment-gateway/s2s-integration/json/v2/build-integration/cards/migrate-3ds2.md).

**Watch Out!**

You must have a PCI compliance certificate to get this feature enabled on your account.

## 3DS2 Authentication

3DS2 is an authentication protocol, the successor of 3DS1, that enables businesses and payment providers to send additional information (such as customer device or browser data) to verify the transaction's authenticity. Razorpay integration is compliant with the 3DS2 protocol.

**Know more**: Razorpay supports [3DS2 transactions](/razorpay-docs-md/payment-gateway/s2s-integration/payment-methods/cards/3ds2.md).

**Handy Tips**

- Integration does not differ for the challenge or frictionless flow.
- Frictionless flow is not applicable for payments on cards issued in India.

## Integration Steps

The integration consists of the following steps.

**1.1** [Create an Order](/razorpay-docs-md/payment-gateway/s2s-integration/json/v1/build-integration/cards.md#11-create-an-order).

**1.2** [Create a Payment](/razorpay-docs-md/payment-gateway/s2s-integration/json/v1/build-integration/cards.md#12-create-a-payment).

**1.3** [Handle Payment Success and Failure](/razorpay-docs-md/payment-gateway/s2s-integration/json/v1/build-integration/cards.md#13-handle-payment-success-and-failure).

**1.4** [Verify Payment Signature](/razorpay-docs-md/payment-gateway/s2s-integration/json/v1/build-integration/cards.md#14-verify-payment-signature).

**1.5** [Verify Payment Status](/razorpay-docs-md/payment-gateway/s2s-integration/json/v1/build-integration/cards.md#15-verify-payment-status).

**Watch Out!**

Do not hardcode the URL returned in the API responses.

### 1.1 Create an Order

**Order is an important step in the payment process.**

- An order should be created for every payment.
- You can create an order using the [Orders API](/razorpay-docs-md/payment-gateway/s2s-integration/json/v1/build-integration/cards.md#api-sample-code)  . It is a server-side API call. Know how to [authenticate](/razorpay-docs-md/dashboard/account-settings/api-keys.md#generate-api-keys)

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

### 1.2 Create a Payment

Create a payment using the API given below after your order is created.

POST

/payments/create/json

CurlJavaPythonGoPHPRubyNode.js.NETResponse

copy

```bash
curl -X POST \
https://api.razorpay.com/v1/payments/create/json \
-u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-H "Content-Type: application/json" \
-d '{
  "amount": 100,
  "currency": "INR",
  "contact": "9000090000",
  "email": "gaurav.kumar@example.com",
  "order_id": "order_DPzFe1Q1dEOKed",
  "method": "card",
  "card": {
    "number": "4386289407660153",
    "name": "Gaurav",
    "expiry_month": 11,
    "expiry_year": 30,
    "cvv": 100
  },
  "authentication": {
    "authentication_channel": "browser"
  },
  ### 3DS2.0 Browser Parameters###
  "browser": {
    "java_enabled": false,
    "javascript_enabled": false,
    "timezone_offset": 11,
    "color_depth": 23,
    "screen_width": 23,
    "screen_height": 100
  },
  "ip": "105.106.107.108",
  "referer": "https://merchansite.com/example/paybill",
  "user_agent": "Mozilla/5.0"
}'
```

#### Request Parameters

amount

mandatory

`integer` Payment amount in the smallest currency sub-unit. For example, if the amount to be charged is ₹299, then pass `29900` in this field. In the case of three decimal currencies, such as KWD, BHD and OMR, to accept a payment of 295.991, pass the value as `295990`. And in the case of zero decimal currencies such as JPY, to accept a payment of 295, pass the value as `295`.

**Watch Out!**

As per payment guidelines, you should pass the last decimal number as 0 for three decimal currency payments. For example, if you want to charge a customer 99.991 KD for a transaction, you should pass the value for the amount parameter as `99990` and not `99991`.

currency

mandatory

`string` Currency code for the currency in which you want to accept the payment. For example, INR. Refer to the [list of supported currencies](/razorpay-docs-md/international-payments.md#supported-currencies). Length must be of 3 characters.

**Handy Tips**

Razorpay has added support for zero decimal currencies, such as JPY, and three decimal currencies, such as KWD, BHD, and OMR, allowing businesses to accept international payments in these currencies. Know more about [Currency Conversion](/razorpay-docs-md/international-payments/currency-conversion.md)

(May 2024).

order\_id

mandatory

`string` Unique identifier of the Order generated in the first step.

email

mandatory

`string` Email address of the customer. Maximum length supported is 40 characters.

contact

mandatory

`string` Phone number of the customer. Maximum length supported is 15 characters, inclusive of country code.

method

mandatory

`string` Name of the payment method. Possible value is `card`.

card

mandatory

`object` Details associated with the card.

number

`string` Unformatted card number.

name

`string` Name of the cardholder.

expiry\_month

`string` Expiry month for the card in MM format.

expiry\_year

`string` Expiry year for the card in YY format.

cvv

`string` CVV printed on the back of the card.

**Handy Tips**

- CVV is not required by default for tokenised cards across all networks.
- CVV is optional for tokenised card payments. Do not pass dummy CVV values.
- To implement this change, skip passing the `cvv` parameter entirely, or pass a `null` or empty value in the CVV field.
- We recommend removing the CVV field from your checkout UI/UX for tokenised cards.
- If CVV is still collected for tokenised cards and the customer enters a CVV, pass the entered CVV value to Razorpay.

user-agent

mandatory

`string` The User-Agent header of the user's browser. Default value will be passed by Razorpay if not provided by merchant.

ip

mandatory

`string` The customer's IP address.

authentication

optional

`object` Details of the authentication channel.

authentication\_channel

`string` The authentication channel for the payment. Possible values:

- `browser` (default)
- `app`

browser

mandatory

`object` Information regarding the customer's browser. This parameter need not be passed when `authentication_channel=app`.

java\_enabled

`boolean` Indicates whether the customer's browser supports Java. Obtained from the `navigator` HTML DOM object. Possible values:

- `true`: Customer's browser supports Java.
- `false`: Customer's browser does not support Java.

javascript\_enabled

`boolean` Indicates whether the customer's browser can execute JavaScript. Obtained from the `navigator` HTML DOM object. Possible values:

- `true`: Customer's browser can execute JavaScript.
- `false`: Customer's browser cannot execute JavaScript.

timezone\_offset

`integer` Time difference between UTC time and the cardholder browser local time. Obtained from the `getTimezoneOffset()` method applied to `Date` object.

screen\_width

`integer` Total width of the payer's screen in pixels. Obtained from the `screen.width` HTML DOM property.

screen\_height

`integer` Obtained from the `navigator` HTML DOM object.

color\_depth

`integer` Obtained from payer's browser using the `screen.colorDepth` HTML DOM property.

language

`string` Obtained from payer's browser using the `navigator.language` HTML DOM property. Maximum limit of 8 characters.

notes

optional

`object` Key-value object used for passing tracking info. Refer to [Notes](/razorpay-docs-md/api/understand.md#notes) for more details.

callback\_url

optional

`string` URL endpoint where Razorpay will submit the final payment status.

referrer

optional

`string` Referrer header passed by the client's browser.

#### Response Parameters

If the payment request is valid, the response contains the following fields.

razorpay\_payment\_id

`string` Razorpay-generated ID for the payment created for this request. Present for all responses.

next

`array` A list of action objects available to you to continue the payment process.

action

`string` An indication of the next step available for payment processing. Possible value:

- `redirect`: The payment requires the customer to be redirected to a bank page. Redirect the customer's browser to the URL returned in the `url` attribute of the object.

url

`string` URL to be used for the action indicated. For `redirect`, this will be a URL that the customer's browser needs to be redirected to for authentication.

A basic integration must look out for one type of `next` action:

### Implementing Native OTP flows

If you are using this endpoint to implement [native OTP](/razorpay-docs-md/payment-methods/cards/authentication/native-otp.md) on your website, you can pass the following additional request parameters.

auth\_type

`string` Can be set to `otp` for Native OTP or `3ds` for regular ACS payments. This will force the payment to use this authentication type.

preferred\_auth

`array` List of authentication types that can be sent instead of `auth_type`, in order to indicate a preference. In this case, if the first authentication type is not supported, the payment will fallback to the next.

You can also opt to have `['otp', '3ds']` defined as your default preferred auth. Get in touch with our [Support Team](https://razorpay.com/support/#raise-a-request) to have this configured for your account.

The response contains the following actions that should be consumed:

**Watch Out!**

The OTP Submit and Resend APIs return a response in a particular [format](/razorpay-docs-md/payment-methods/cards/authentication/native-otp.md#4-otp-authentication). A payment that is successfully authenticated in this manner need not be verified.

#### Examples

Different samples of payments using Native OTP with and without redirect flows are given below.

#### Payment Using Native OTP

This payment request results in `next` array containing `otp_submit` and `otp_resend`. This means the customer must be prompted for an OTP which can be submitted in the **OTP Submit** endpoint.

As `otp_resend` is also available, you can re-trigger the OTP SMS using the URL shared.

RequestResponse

copy

```bash
curl -X POST https://api.razorpay.com/v1/payments/create/redirect \
-u [YOUR_KEY_ID]:[YOUR_SECRET] \
-H 'content-type: application/json'
-d '{
  "amount": "1000",
  "currency": "INR",
  "order_id": "order_D32tqGE9vgwgJq",
  "email": "gaurav.kumar@example.com",
  "contact": "9000090000",
  "method": "card",
  "card": {
    "number": "4386289407660153",
    "name": "Gaurav",
    "expiry_month": 11,
    "expiry_year": 23,
    "cvv": 100
  },
  "authentication": {
    "authentication_channel": "browser"
  },
  ### 3DS2.0 Browser Parameters###
  "browser": {
    "java_enabled": false,
    "javascript_enabled": false,
    "timezone_offset": 11,
    "color_depth": 23,
    "screen_width": 23,
    "screen_height": 100
  },
  "ip": "105.106.107.108",
  "referer": "https://merchansite.com/example/paybill",
  "user_agent": "Mozilla/5.0",
  "auth_type": "otp"
}'
```

#### Payment Using Native OTP with Redirect Fallback

This payment request results in a `next` array containing `otp_submit`, `otp_resend`, and `redirect`. The `redirect` action here acts as a fallback to the bank page, that is, if your customer opts to enter the OTP on his bank page only, the browser can be redirected to the redirect URL in order to complete the payment using 3DS flow.

RequestResponse

copy

```bash
curl -X POST https://api.razorpay.com/v1/payments/create/redirect \
-u [YOUR_KEY_ID]:[YOUR_SECRET] \
-H 'content-type: application/json'
-d '{
  "amount": "1000",
  "currency": "INR",
  "order_id": "order_D32tqGE9vgwgJq",
  "email": "gaurav.kumar@example.com",
  "contact": "9000090000",
  "method": "card",
  "card": {
    "number": "4386289407660153",
    "name": "Gaurav",
    "expiry_month": 11,
    "expiry_year": 23,
    "cvv": 100
  },
  "authentication": {
    "authentication_channel": "browser"
  },
  ### 3DS2.0 Browser Parameters###
  "browser": {
    "java_enabled": false,
    "javascript_enabled": false,
    "timezone_offset": 11,
    "color_depth": 23,
    "screen_width": 23,
    "screen_height": 100
  },
  "ip": "105.106.107.108",
  "referer": "https://merchansite.com/example/paybill",
  "user_agent": "Mozilla/5.0",
  "auth_type": "otp"
}
```

#### Payment Using Native OTP as Preferred Auth

Here the payment request contains `preferred auth` that opts for `otp` and falls back to `3ds`. This will result in a `next` array containing `otp_submit` and `otp_resend`. If Native OTP is not supported for the card, the `next` array containing only `redirect` is returned in the response.

RequestResponse for Native OTP SupportedResponse for Native OTP Not Supported

copy

```bash
curl -X POST https://api.razorpay.com/v1/payments/create/redirect \
-u [YOUR_KEY_ID]:[YOUR_SECRET] \
-H 'content-type: application/json'
-d '{
  "amount": "1000",
  "currency": "INR",
  "order_id": "order_D32tqGE9vgwgJq",
  "email": "gaurav.kumar@example.com",
  "contact": "9000090000",
  "method": "card",
  "card": {
    "number": "4386289407660153",
    "name": "Gaurav",
    "expiry_month": 11,
    "expiry_year": 23,
    "cvv": 100
  },
  "authentication": {
    "authentication_channel": "browser"
  },
  ### 3DS2.0 Browser Parameters###
  "browser": {
    "java_enabled": false,
    "javascript_enabled": false,
    "timezone_offset": 11,
    "color_depth": 23,
    "screen_width": 23,
    "screen_height": 100
  },
  "ip": "105.106.107.108",
  "referer": "https://merchansite.com/example/paybill",
  "user_agent": "Mozilla/5.0",
  "preferred_auth": [
    "otp",
    "3ds"
  ]
}
```

#### Response on Submitting OTP

Once the customer submits the OTP using the following endpoint, the respective success or failure responses will be generated.

**Feature Request**

This is an on-demand feature. Please raise a request with our [Support team](https://razorpay.com/support/#request) to get this feature activated on your Razorpay account.

The following endpoint submits the OTP:

POST

payments/:id/otp/submit

Example RequestSuccess - Auto CaptureSuccess - Manual CaptureFailure

copy

```bash
curl -X POST \
'https://api.razorpay.com/v1/payments/pay_D5jmY2H6vC7Cy3/otp/submit' \
-u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-H "Content-Type: application/x-www-form-urlencoded" \
-d 'otp=123456'
```

After the payment is completed, the final response is posted to the URL given in `callback_url` of the request.

### 1.3 Handle Payment Success and Failure

Once the payment is completed by the customer, a `POST` request is made to the `callback_url` provided in the payment request. The data contained in this request will depend on whether the payment was a **success** or a **failure** of the payment made by the customer.

#### Success Callback

If the payment made by the customer is successful, the following fields are sent:

- `razorpay_payment_id`
- `razorpay_order_id`
- `razorpay_signature`

Callback Example

copy

```json
{
  "razorpay_payment_id": "pay_29QQoUBi66xm2f",
  "razorpay_order_id": "order_9A33XWu170gUtm",
  "razorpay_signature": "9ef4dffbfd84f1318f6739a3ce19f9d85851857ae648f114332d8401e0949a3d"
}
```

#### Failure Callback

If the payment has failed, the callback will contain details of the error. Refer to [errors](/razorpay-docs-md/api/index.md#errors) for details.

### 1.4 Verify Payment Signature

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

### 1.5 Verify Payment Status

**Handy Tips**

On the Razorpay Dashboard, ensure that the payment status is `captured`. Refer to the payment capture settings page to know how to [capture payments automatically](/razorpay-docs-md/payments/capture-settings.md).

You can track the payment status in three ways:

Verify Status from Dashboard

Subscribe to Webhook Events

Poll APIs

To verify the payment status from the Razorpay Dashboard:

1. Log in to the Razorpay Dashboard and navigate to **Transactions** → **Payments**.
2. Check if a **Payment Id** has been generated and note the status. In case of a successful payment, the status is marked as **Captured**.

![Payment details on Dashboard](https://razorpay.com/docs/payments/payment-gateway/s2s-integration/json/v1/build-integration/build/browser/assets/images/testpayment.jpg)

#### Test Cards

Use the following test cards for Indian payments:

#### Error Scenarios

Use these test cards to simulate payment errors. See the [complete list](/razorpay-docs-md/payments/test-card-details.md#error-scenario-test-cards) of error test cards with detailed scenarios.
Check the following lists:

- [Supported Card Networks](/razorpay-docs-md/payment-methods/cards.md)

  .
- [Cards Error Codes](/docs/errors/payments/cards/)

  .

## Next Steps [Step 2: Test Integration](/razorpay-docs-md/payment-gateway/s2s-integration/json/v1/test-integration.md)
