<!-- Source: https://razorpay.com/docs/payments/payment-gateway/s2s-integration/json/v2/build-integration/cards -->

You can integrate with Razorpay APIs to start accepting card payments. Razorpay APIs support the latest 3DS2 authentication protocol.

**Handy Tips**

If you are an existing Razorpay user, that is, you integrated with our S2S APIs before October 15, 2022, you need to make certain integration changes to [migrate to the 3DS2 flow](/razorpay-docs-md/payment-gateway/s2s-integration/json/v2/build-integration/cards/migrate-3ds2.md).

**Watch Out!**

You must have a PCI compliance certificate to get this feature enabled on your account.

## 3DS2 Authentication

3DS2 is an authentication protocol, the successor of 3DS1, that enables businesses and payment providers to send additional information (such as customer device or browser data) to verify the transaction's authenticity. Razorpay integration is compliant with the 3DS2 protocol.

**Know more**: Razorpay supports [3DS2 transactions](/razorpay-docs-md/payment-gateway/s2s-integration/payment-methods/cards/3ds2.md).

**Handy Tips**

- Integration does not differ for the challenge flow or frictionless flow.
- Frictionless flow is not applicable for payments on cards issued in India.

## Integration Steps

Follow the steps below to integrate S2S JSON API with browser flow and accept payments using cards.

**1.1** [Create an Order](/razorpay-docs-md/payment-gateway/s2s-integration/json/v2/build-integration/cards.md#11-create-an-order).

**1.2** [Create a Payment](/razorpay-docs-md/payment-gateway/s2s-integration/json/v2/build-integration/cards.md#12-create-a-payment).

**1.3** [Handle Payment Success and Error Events](/razorpay-docs-md/payment-gateway/s2s-integration/json/v2/build-integration/cards.md#13-handle-payment-success-and-error-events).

**1.4** [Verify Payment Signature](/razorpay-docs-md/payment-gateway/s2s-integration/json/v2/build-integration/cards.md#14-verify-payment-signature).

**1.5** [Integrate Payments Rainy Day Kit](/razorpay-docs-md/payment-gateway/s2s-integration/json/v2/build-integration/cards.md#15-integrate-payments-rainy-day-kit).

**1.6** [Verify Payment Status](/razorpay-docs-md/payment-gateway/s2s-integration/json/v2/build-integration/cards.md#16-verify-payment-status).

**Watch Out!**

Do not hardcode the URL returned in the API responses.

### 1.1 Create an Order

**Order is an important step in the payment process.**

- An order should be created for every payment.
- You can create an order using the [Orders API](/razorpay-docs-md/payment-gateway/s2s-integration/json/v2/build-integration/cards.md#api-sample-code)  . It is a server-side API call. Know how to [authenticate](/razorpay-docs-md/dashboard/account-settings/api-keys.md#generate-api-keys)

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

After the order is created, your next step is to create a payment. The following API will create a payment with `card` as the payment method. The [`browser` parameters](/razorpay-docs-md/payment-gateway/s2s-integration/json/v2/build-integration/cards.md#:~:text=the%20authentication%20channel.-,browser,-mandatory) capture the customer's browser details, which are sent to the banks to aid their risk analysis.

#### Sample Code

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
  "contact": "9900008989",
  "email": "gaurav.kumar@example.com",
  "order_id": "order_DPzFe1Q1dEOKed",
  "callback_url": "https://webhook.site/fa184d00-53da-4257-b5e4-f98e3373b005",
  "method": "card",
  "card": {
    "number": "4386289407660153",
    "name": "Gaurav",
    "expiry_month": "11",
    "expiry_year": "30",
    "cvv": "100"
  },
  "authentication": {
    "authentication_channel": "browser"
  },
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

**Handy Tips**

The payment request and response would remain the same for both frictionless and challenge scenarios.

Request Parameters

amount

mandatory

`integer` Payment amount in the smallest currency sub-unit. For example, if the amount to be charged is ₹299, then pass `29900` in this field. In the case of three decimal currencies, such as KWD, BHD and OMR, to accept a payment of 295.991, pass the value as `295990`. And in the case of zero decimal currencies such as JPY, to accept a payment of 295, pass the value as `295`.

**Watch Out!**

As per payment guidelines, you should pass the last decimal number as 0 for three decimal currency payments. For example, if you want to charge a customer 99.991 KD for a transaction, you should pass the value for the amount parameter as `99990` and not `99991`.

currency

mandatory

`string` Currency code for the currency in which you want to accept the payment. For example, INR. Refer to the list of supported currencies. The length must be 3 characters.

**Handy Tips**

Razorpay has added support for zero decimal currencies, such as JPY, and three decimal currencies, such as KWD, BHD, and OMR, allowing businesses to accept international payments in these currencies. Know more about [Currency Conversion](/razorpay-docs-md/international-payments/currency-conversion.md)

(May 2024).

order\_id

mandatory

`string` Unique identifier of the Order generated in the first step.

email

mandatory

`string` Email address of the customer. The maximum length supported is 40 characters.

contact

mandatory

`string` Phone number of the customer. The maximum length supported is 15 characters, inclusive of country code.

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

`string` The User-Agent header of the user's browser. The default value will be passed by Razorpay if not provided by you.

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

`integer` Time difference between UTC time and the cardholder's browser local time. Obtained from the `getTimezoneOffset()` method applied to the `Date` object.

screen\_width

`integer` Total width of the payer's screen in pixels. Obtained from the `screen.width` HTML DOM property.

screen\_height

`integer` Obtained from the `navigator` HTML DOM object.

color\_depth

`integer` Obtained from the payer's browser using the `screen.colorDepth` HTML DOM property.

language

`string` Obtained from the payer's browser using the `navigator.language` HTML DOM property. Maximum limit of 8 characters.

notes

optional

`object` Key-value object used for passing tracking info. Refer to [Notes](/razorpay-docs-md/api/understand.md#notes) for more details.

callback\_url

optional

`string` URL endpoint where Razorpay will submit the final payment status.

referrer

optional

`string` Referrer header passed by the client's browser.

Response Parameters

If the payment request is valid, the response contains the following fields.

razorpay\_payment\_id

`string` Unique identifier of the payment. Present for all responses.

next

`array` A list of action objects available to you to continue the payment process. Present when the payment requires further processing.

action

`string` An indication of the next step available to you to continue the payment process. Possible values:

- `otp_generate`: Use this URL to allow the customer to generate OTP and complete the payment on your webpage.
- `redirect`: Use this URL to redirect the customer to submit the OTP on the bank page.

url

`string` URL to be used for the action indicated.

#### OTP Generation

If you would like the customer to enter the OTP on your website instead of the bank page, use the `otp_generate` URL. When this URL is triggered, you get the following response:

CurlJavaPHPRubyNode.js.NETResponse

copy

```bash
curl -u [YOUR_KEY_ID]
-X POST https://api.razorpay.com/v1/payments/pay_FVmAstJWfsD3SO/otp_generate
-H "Content-Type: application/json" \
```

#### Path Parameter

id

mandatory

`string` Unique identifier of the payment.

#### Response Parameters

If the payment request is valid, the response contains the following fields.

razorpay\_payment\_id

`string` Unique identifier of the payment. Present for all responses.

next

`array` A list of action objects available to you to continue the payment process. Present when the payment requires further processing.

action

`string` An indication of the next step available for payment processing. Possible values:

- `opt_submit` - Use this URL to allow the customer to submit OTP and complete the payment on your webpage.
- `opt_resend` - Use this URL to resend OTP to the customer.

url

`string` URL to be used for the action indicated.

If the customer faces any latency issues, you can choose to cancel this request and redirect the customer to the bank page to enter the OTP and complete the payment. Thus, you can avoid payment failure by switching the customer to the bank page payment flow.

#### Response on Submitting OTP

Razorpay sends the respective success or failure response after the customer submits the OTP on your page.

The following endpoint submits the OTP:

POST

payments/:id/otp/submit

After the payment is completed, the final response is posted to the URL given in `callback_url` of the request, and can then be verified.

### 1.3 Handle Payment Success and Error Events

Once the payment is completed by the customer, a `POST` request is made to the `callback_url` provided in the payment request. The data contained in this request will depend on whether the payment was a **success** or a **failure**.

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

If the payment has failed, the callback will contain details of the error. Refer to [Errors](/docs/errors/) for details.

### 1.4 Verify Payment Signature

Signature verification is a mandatory step to ensure that the callback is sent by Razorpay. The `razorpay_signature` contained in the callback can be regenerated by your system and verified as follows.

Create a string to be hashed using the `razorpay_payment_id` contained in the callback and the Order ID generated in the first step, separated by a `|`. Hash this string using SHA256 and your API Secret.

copy

```
generated_signature = hmac_sha256(order_id + "|" + razorpay_payment_id, secret);

if (generated_signature == razorpay_signature) {
    payment is successful
}
```

#### Generate Signature on your Server

Sample code

JavaPythonGoPHPRubyNode.js.NET

copy

```java
/**
* This class defines common routines for generating
* authentication signatures for Razorpay Webhook requests.
*/
public class Signature
{
    private static final String HMAC_SHA256_ALGORITHM = "HmacSHA256";
    /**
    * Computes RFC 2104-compliant HMAC signature.
    * * @param data
    * The data to be signed.
    * @param key
    * The signing key.
    * @return
    * The Base64-encoded RFC 2104-compliant HMAC signature.
    * @throws
    * java.security.SignatureException when signature generation fails
    */
    public static String calculateRFC2104HMAC(String data, String secret)
    throws java.security.SignatureException
    {
        String result;
        try {

            // get an hmac_sha256 key from the raw secret bytes
            SecretKeySpec signingKey = new SecretKeySpec(secret.getBytes(), HMAC_SHA256_ALGORITHM);

            // get an hmac_sha256 Mac instance and initialize with the signing key
            Mac mac = Mac.getInstance(HMAC_SHA256_ALGORITHM);
            mac.init(signingKey);

            // compute the hmac on input data bytes
            byte[] rawHmac = mac.doFinal(data.getBytes());

            // base64-encode the hmac
            result = DatatypeConverter.printHexBinary(rawHmac).toLowerCase();

        } catch (Exception e) {
            throw new SignatureException("Failed to generate HMAC : " + e.getMessage());
        }
        return result;
    }
}
```

### 1.5 Integrate Payments Rainy Day Kit

Use Payments Rainy Day kit to overcome payments exceptions such as:

- [Late Authorisation](/razorpay-docs-md/payments/late-authorisation.md)
- [Payment Downtime](/razorpay-docs-md/api/payments/downtime.md)
- [Payment Errors](/docs/errors/)

### 1.6 Verify Payment Status

**Handy Tips**

On the Razorpay Dashboard, ensure that the payment status is `captured`. Refer to the payment capture settings page to know how to [capture payments automatically](/razorpay-docs-md/payments/capture-settings.md).

You can track the payment status in three ways:

Verify Status from Dashboard

Subscribe to Webhook Events

Poll APIs

To verify the payment status from the Razorpay Dashboard:

1. Log in to the Razorpay Dashboard and navigate to **Transactions** → **Payments**.
2. Check if a **Payment Id** has been generated and note the status. In case of a successful payment, the status is marked as **Captured**.

![Payment details on Dashboard](https://razorpay.com/docs/payments/payment-gateway/s2s-integration/json/v2/build-integration/build/browser/assets/images/testpayment.jpg)

#### Test Cards

Use the following test cards for Indian payments:

#### Error Scenarios

Use these test cards to simulate payment errors. See the [complete list](/razorpay-docs-md/payments/test-card-details.md#error-scenario-test-cards) of error test cards with detailed scenarios.
Check the following lists:

- [Supported Card Networks](/razorpay-docs-md/payment-methods/cards.md)

  .
- [Cards Error Codes](/docs/errors/payments/cards/)

  .

## Next Steps [Step 2: Test Integration](/razorpay-docs-md/payment-gateway/s2s-integration/json/v2/test-integration.md)
