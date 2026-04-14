<!-- Source: https://razorpay.com/docs/payments/payment-gateway/web-integration/custom/build-integration -->

Follow the steps to integrate Custom Checkout in your site:

**1.1** [Create an Order in Server](/razorpay-docs-md/payment-gateway/web-integration/custom/build-integration.md#11-create-an-order-in-server).

**1.2** [Fetch Payment Methods](/razorpay-docs-md/payment-gateway/web-integration/custom/build-integration.md#12-fetch-payment-methods).

**1.3** [Invoke Checkout and Pass Order Id and Other Options to it](/razorpay-docs-md/payment-gateway/web-integration/custom/build-integration.md#13-invoke-checkout-and-pass-order-id-and).

**1.3.1** [Include JavaScript code in your Webpage](/razorpay-docs-md/payment-gateway/web-integration/custom/build-integration.md#131-include-javascript-code-in-your-webpage).

**1.3.2** [Instantiate Custom Checkout](/razorpay-docs-md/payment-gateway/web-integration/custom/build-integration.md#132-instantiate-custom-checkout).

**1.3.3** [Submit Payment Details](/razorpay-docs-md/payment-gateway/web-integration/custom/build-integration.md#133-submit-payment-details).

**1.4** [Store Fields in Your Server](/razorpay-docs-md/payment-gateway/web-integration/custom/build-integration.md#14-store-fields-in-your-server).

**1.5** [Verify Payment Signature](/razorpay-docs-md/payment-gateway/web-integration/custom/build-integration.md#15-verify-payment-signature).

**1.6** [Verify Payment Status](/razorpay-docs-md/payment-gateway/web-integration/custom/build-integration.md#16-verify-payment-status).

## 1.1 Create an Order in Server

Order is an important step in the payment process.

- An order should be created for every payment.
- You can create an order using the [Orders API](/razorpay-docs-md/payment-gateway/web-integration/custom/build-integration.md#api-sample-code)  . It is a server-side API call.  Know how to [authenticate](/razorpay-docs-md/api/authentication.md#generate-api-keys)

  Orders API.
- The order\_id received in the response should be passed to the checkout. This ties the Order with the payment and secures the request from being tampered.

**Watch Out!**

Payments made without an `order_id` cannot be captured and will be automatically refunded. You must create an order before initiating payments to ensure proper payment processing.

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
    "currency": "",
    "receipt": "rcptid_11",
    "partial_payment": true,
    "first_payment_min_amount": 23000
}'
```

#### Request Parameters

Here is the list of parameters and their description for creating an order:

amount

mandatory

`integer` Payment amount in the smallest currency sub-unit. For example, if the amount to be charged is ₹299, then pass `29900` in this field. In the case of three decimal currencies, such as KWD, BHD and OMR, to accept a payment of 295.991, pass the value as `295990`. And in the case of zero decimal currencies such as JPY, to accept a payment of 295, pass the value as `295`.

**Watch Out!**

As per payment guidelines, you should pass the last decimal number as 0 for three decimal currency payments. For example, if you want to charge a customer 99.991 KD for a transaction, you should pass the value for the amount parameter as `99990` and not `99991`.

currency

mandatory

`string` Currency code for the currency in which you want to accept the payment. For example, `INR`. Refer to the [supported currencies](/razorpay-docs-md/international-payments.md#supported-currencies) for a list of supported international currencies.

**Handy Tips**

Razorpay has added support for zero decimal currencies, such as JPY, and three decimal currencies, such as KWD, BHD, and OMR, allowing businesses to accept international payments in these currencies. Know more about [Currency Conversion](/razorpay-docs-md/international-payments/currency-conversion.md)

(May 2024).

amount

mandatory

`integer` Payment amount in the smallest currency sub-unit. For example, if the amount to be charged is ₹299, then pass `29900` in this field.

currency

mandatory

`string` Currency code for the currency in which you want to accept the payment.

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

The error response parameters are available in the [API Reference Guide](/razorpay-docs-md/api/orders.md#error-response-parameters).

## 1.2 Fetch Payment Methods

When creating a custom checkout form, display only the activated methods to the customer. Use the below methods to fetch all payments methods available to you:

RequestResponse

copy

```javascript
var razorpay = new Razorpay({
  key: '<YOUR_KEY_ID>',
    // logo, displayed in the popup
  image: 'https://i.imgur.com/n5tjHFD.jpg',
});
razorpay.once('ready', function(response) {
  console.log(response.methods);
})
```

Know more about [the various payment methods](/razorpay-docs-md/payment-methods.md) offered by Razorpay.

## 1.3 Invoke Checkout and Pass Order Id and Other Options to it

### 1.3.1 Include JavaScript code in your Webpage

Include the following script, preferably in the `<head>` section of your page:

Index HTML

copy

```html
<script type="text/javascript" src="https://checkout.razorpay.com/v1/razorpay.js"></script>
```

**Handy Tips**

- Include the script from `https://checkout.razorpay.com/v1/razorpay.js` instead of serving a copy from your server. This allows the library's new updates and bug fixes to fit your application automatically.
- We always maintain backward compatibility with our code.

### 1.3.2 Instantiate Custom Checkout

- Single Instance on a Page:

  Invoke a Single Instance

  copy

  ```javascript
var razorpay = new Razorpay({
  key: '<YOUR_KEY_ID>',
  image: 'https://i.imgur.com/n5tjHFD.jpg', 
  // logo, displayed in the payment processing popup
  redirect: true
});
```
- Multiple Instances on Same Page: If you need multiple Razorpay instances on the same page, you can globally set some of the options:

  Invoke Multiple Instances

  copy

  ```javascript
Razorpay.configure({
  key: '<YOUR_KEY_ID>',
  // logo, displayed in the payment processing popup
  image: 'https://i.imgur.com/n5tjHFD.jpg',
  redirect: true
});
new Razorpay({}); // will inherit key and image from above
```

**Customer Fee Bearer (CFB) Requirements**

For card payments with CFB enabled, set `redirect: true` and include `callback_url` during Razorpay instantiation.

#### Checkout Options

While building a custom UI for accepting payments from your customers, you should be familiar with the fields supported in the `razorpay.js` script.

key

mandatory

`string` API Key ID generated from **Dashboard** → **Account & Settings** → [API Keys](/razorpay-docs-md/api/authentication.md#generate-api-keys).

amount

mandatory

`integer` Payment amount in the smallest currency sub-unit. For example, if the amount to be charged is ₹299, then pass `29900` in this field. In the case of three decimal currencies, such as KWD, BHD and OMR, to accept a payment of 295.999, pass the value as `295999`. And in the case of zero decimal currencies such as JPY, to accept a payment of 295, pass the value as `295`.

**Watch Out!**

As per VISA Guidelines, you should pass the last decimal number as 0 for three decimal currency payments. For example, if you want to charge a customer 99.991 KD for a transaction, you should pass the value for the amount parameter as `99990` and not `99991`.

currency

mandatory

`string` The currency in which the payment should be made by the customer. For example, `INR`. See the list of [supported currencies](/razorpay-docs-md/international-payments.md#supported-currencies).

**Handy Tips**

Razorpay has added support for zero decimal currencies, such as JPY, and three decimal currencies, such as KWD, BHD, and OMR, allowing businesses to accept international payments in these currencies. Know more about [Currency Conversion](/razorpay-docs-md/international-payments/currency-conversion.md)

(April 2023).

description

optional

`string` Description of the product shown in the Checkout form. It must start with an alphanumeric character.

image

optional

`string` Link to an image (usually your business logo) shown in the Checkout form. Can also be a **base64** string, if loading the image from a network is not desirable.

order\_id

mandatory

`string` Order ID generated via the [Orders API](/razorpay-docs-md/api/orders.md).

notes

optional

`object` Set of key-value pairs that can be used to store additional information about the payment. It can hold a maximum of 15 key-value pairs, each 256 characters long (maximum).

method

mandatory

`string` The payment method used by the customer on Checkout.
Possible values:

- `card` (default)
- `upi` (default)
- `netbanking` (default)
- `wallet` (default)
- `emi` (default)
- `cardless_emi` (requires [approval](https://razorpay.com/support/#request)

  )
- `paylater` (requires [approval](https://razorpay.com/support/#request)

  )
- `emandate` (requires [approval](https://razorpay.com/support/#request)

  )

card

mandatory if method=card/emi

`object` The details of the card that should be entered while making the payment.

number

`integer` Unformatted card number.

name

`string` The name of the cardholder.

expiry\_month

`integer` Expiry month for card in MM format.

expiry\_year

`integer` Expiry year for card in YY format.

cvv

`integer` CVV printed on the back of the card.

**Handy Tips**

- CVV is not required by default for tokenised cards across all networks.
- CVV is optional for tokenised card payments. Do not pass dummy CVV values.
- To implement this change, skip passing the `cvv` parameter entirely, or pass a `null` or empty value in the CVV field.
- We recommend removing the CVV field from your checkout UI/UX for tokenised cards.
- If CVV is still collected for tokenised cards and the customer enters a CVV, pass the entered CVV value to Razorpay.

emi\_duration

`integer` Defines the number of months in the EMI plan.

bank\_account

mandatory if method=emandate

The details of the bank account that should be passed in the request. These details include bank account number, IFSC code and the name of the customer associated with the bank account.

account\_number

`string` Bank account number used to initiate the payment.

ifsc

`string` IFSC of the bank used to initiate the payment.

name

`string` Name associated with the bank account used to initiate the payment.

bank

mandatory if method=netbanking

`string` Bank code. List of available banks enabled for your account can be fetched via [**methods**](/razorpay-docs-md/payment-gateway/web-integration/custom/payment-methods.md#fetch-supported-methods).

wallet

mandatory if method=wallet

`string` Wallet code for the wallet used for the payment. Possible values:

- `payzapp` (default)
- `olamoney` (requires [approval](https://razorpay.com/support/#request)

  )
- `phonepe` (requires [approval](https://razorpay.com/support/#request)

  )
- `airtelmoney` (requires [approval](https://razorpay.com/support/#request)

  )
- `mobikwik` (requires [approval](https://razorpay.com/support/#request)

  )
- `jiomoney` (requires [approval](https://razorpay.com/support/#request)

  )
- `amazonpay` (requires [approval](https://razorpay.com/support/#request)

  )
- `paypal` (requires [approval](https://razorpay.com/support/#request)

  )
- `phonepeswitch` (requires [approval](https://razorpay.com/support/#request)

  )

provider

mandatory if method=cardless\_emi/paylater

`string` Name of the cardless EMI provider partnered with Razorpay.

Available options for Cardless EMI (requires [approval](https://razorpay.com/support/#request)

):

- `hdfc`
- `icic`
- `idfb`
- `kkbk`
- `zestmoney`
- `earlysalary`
- `walnut369`

Available options for Pay Later:

- `lazypay`
- `paypal`

vpa

mandatory if method=upi

`string` UPI ID used for making the payment on the UPI app.

**Deprecation Notice**

UPI Collect is deprecated effective 28 February 2026. This tab is applicable only for exempted businesses. If you are not covered by the exemptions, refer to the [migration documentation](/docs/announcements/upi-collect-migration/custom-integration/) to switch to UPI Intent.

callback\_url

optional

`string` The URL to which the customer must be redirected upon completion of payment. The URL must accept incoming `POST` requests. The callback URL will have `razorpay_payment_id`, `razorpay_order_id` and `razorpay_signature` as the request parameters for a successful payment.

redirect

conditionally mandatory

`boolean` Determines whether customer should be redirected to the URL mentioned in the
`callback_url` parameter. This is mandatory if `callback_url` parameter is used. Possible values:

- `true`: Customer will be redirected to the `callback_url`.
- `false`: Customer will not be redirected to the `callback_url`

### 1.3.3 Submit Payment Details

After creating an order and obtaining the customer's payment details, send the information to Razorpay to complete the payment. The data that needs to be submitted depends on the customer's payment method. You can do this by invoking `createPayment` method.

Know more about [sample codes for various payment methods](/razorpay-docs-md/payment-gateway/web-integration/custom/payment-methods.md).

createPayment with handler functioncreatePayment with callback URL

copy

```javascript
var data = {
  amount: 1000, // in currency subunits. 
  currency: "",// 
  email: 'gaurav.kumar@example.com',
  contact: '+919876543210',
  notes: {
    address: 'Ground Floor, SJR Cyber, Laskar Hosur Road, Bengaluru',
  },
  order_id: 'order_CuEzONfnOI86Ab',// Replace with Order ID generated in Step 4
  method: 'netbanking',

  // method specific fields
  bank: 'HDFC'
};

var btn = document.querySelector('#btn');
btn.addEventListener('click', function(){
  // has to be placed within user initiated context, such as click, in order for popup to open.
  razorpay.createPayment(data);

  razorpay.on('payment.success', function(resp) {
    alert(resp.razorpay_payment_id),
    alert(resp.razorpay_order_id),
    alert(resp.razorpay_signature)}); // will pass payment ID, order ID, and Razorpay signature to success handler.

  razorpay.on('payment.error', function(resp){alert(resp.error.description)}); // will pass error object to error handler

})
```

**Watch Out!**

The `createPayment` method should be called within an event listener triggered by user action to prevent the popup from being blocked. For example:

javascript

copy

```javascript
$('button').click( function (){ razorpay.createPayment(...) })
```

**Handy Tips**

- **Handler Function**

  When you use the handler function, the response object of the successful payment (`razorpay_payment_id`, `razorpay_order_id` and `razorpay_signature`) is submitted to the Checkout Form. You need to collect these and send them to your server.
- **Callback URL**

  When you use a callback URL, Razorpay makes a post call to the callback URL, with the `razorpay_payment_id`, `razorpay_order_id` and `razorpay_signature` in the response object of the successful payment (`razorpay_payment_id` and `razorpay_order_id`).

## 1.4 Store Fields in Your Server

A successful payment returns the following fields to the Checkout form.

Success Callback

- You need to store these fields in your server.
- You can confirm the authenticity of these details by verifying the signature in the next step.

razorpay\_payment\_id

`string` Unique identifier for the payment returned by Checkout **only** for successful payments.

razorpay\_order\_id

`string` Unique identifier for the order returned by Checkout.

razorpay\_signature

`string` Signature returned by the Checkout. This is used to verify the payment.

Failure Response

A failed payment returns an error response.

Sample Error Response

copy

```json
{
  "error": {
    "code": "BAD_REQUEST_ERROR",
    "description": "Authentication failed due to incorrect otp",
    "field": null,
    "source": "customer",
    "step": "payment_authentication",
    "reason": "invalid_otp",
    "metadata": {
      "payment_id": "pay_EDNBKIP31Y4jl8",
      "order_id": "order_DBJKIP31Y4jl8"
    }
  }
}
```

Know more about [Error Codes](/docs/errors/).

## 1.5 Verify Payment Signature

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

## 1.6 Verify Payment Status

**Handy Tips**

On the Razorpay Dashboard, ensure that the payment status is `captured`. Refer to the payment capture settings page to know how to [capture payments automatically](/razorpay-docs-md/payments/capture-settings.md).

You can track the payment status in three ways:

Verify Status from Dashboard

Subscribe to Webhook Events

Poll APIs

To verify the payment status from the Razorpay Dashboard:

1. Log in to the Razorpay Dashboard and navigate to **Transactions** → **Payments**.
2. Check if a **Payment Id** has been generated and note the status. In case of a successful payment, the status is marked as **Captured**.

![Payment details on Dashboard](https://razorpay.com/docs/payments/payment-gateway/web-integration/custom/build/browser/assets/images/testpayment.jpg)

## Next Steps [Step 2: Test Integration](/razorpay-docs-md/payment-gateway/web-integration/custom/test-integration.md)
