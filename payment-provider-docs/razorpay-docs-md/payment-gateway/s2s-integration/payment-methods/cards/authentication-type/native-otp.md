<!-- Source: https://razorpay.com/docs/payments/payment-gateway/s2s-integration/payment-methods/cards/authentication-type/native-otp -->

Razorpay's Native OTP feature supports one-time passwords (OTPs) in the Checkout form, without redirecting customers to the ACS page of the respective issuing banks.
This enables you to extend a simple and efficient OTP flow to your customers, reduce payment failures due to low internet speeds and avoid failures due to redirects to bank pages.

Shown below is a sample OTP input screen:

![](https://razorpay.com/docs/payments/payment-gateway/s2s-integration/payment-methods/cards/authentication-type/build/browser/assets/images/rzp-acs_page.jpg)

**Feature Request**

This is an on-demand feature. Please raise a request with our [Support team](https://razorpay.com/support/#request) to get this feature activated on your Razorpay account.

## Prerequisites

Before implementing the Native OTP feature, ensure that the following requirements are met:

1. Verify that you are PCI compliant to accept and process customer's card details at your end. [Learn more about PCI compliance](https://www.pcicomplianceguide.org/faq/#1)   . The compliance certificate should be updated as per the yearly renewal cycle.
2. Familiarize yourselves with the [payment flow](/razorpay-docs-md/payment-gateway/how-it-works.md)   .

## Workflow for Native OTP

1. [Create a Razorpay order](/razorpay-docs-md/payment-gateway/s2s-integration/payment-methods/cards/authentication-type/native-otp.md#1-create-a-razorpay-order)
2. [Validate Authentication Type](/razorpay-docs-md/payment-gateway/s2s-integration/payment-methods/cards/authentication-type/native-otp.md#2-validate-authentication-type)
3. [Create a Payment](/razorpay-docs-md/payment-gateway/s2s-integration/payment-methods/cards/authentication-type/native-otp.md#3-create-a-payment)
4. [OTP Authentication](/razorpay-docs-md/payment-gateway/s2s-integration/payment-methods/cards/authentication-type/native-otp.md#4-otp-authentication)
5. [Payment Verification](/razorpay-docs-md/payment-gateway/s2s-integration/payment-methods/cards/authentication-type/native-otp.md#5-verify-the-payment)

**API Authentication**

Razorpay APIs are authenticated using **Basic Auth** method where your `key_id` is the **Username** and `key_secret` is the **Password**. You can access your API keys from the [Dashboard](/razorpay-docs-md/api/authentication.md#generate-api-keys).

### 1. Create a Razorpay Order

A **Razorpay Order** creates an order ID that corresponds to the unique transaction ID or checkout ID created at your end. The Order ID is tied to all the payments made against that particular order.

POST

/orders

Order is an important step in the payment process.

- An order should be created for every payment.
- You can create an order using the [Orders API](/razorpay-docs-md/payment-gateway/s2s-integration/payment-methods/cards/authentication-type/native-otp.md#api-sample-code)  . It is a server-side API call.  Know how to [authenticate](/razorpay-docs-md/api/authentication.md#generate-api-keys)

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
    "currency": "INR",
    "receipt": "rcptid_11",
    "partial_payment": true,
    "first_payment_min_amount": 23000
}'
```

#### Request Parameters

Here is the list of parameters and their description for creating an order:

amount

mandatory

`integer` Payment amount in the smallest currency sub-unit. For example, if the amount to be charged is ₹299, then pass `29900` in this field. In the case of three decimal currencies, such as KWD, BHD and OMR, to accept a payment of 295.991, pass the value as 295990. And in the case of zero decimal currencies such as JPY, to accept a payment of 295, pass the value as 295.

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

id

mandatory

`string` Unique identifier of the customer. For example, `cust_1Aa00000000004`.

Know more about [Orders API](/razorpay-docs-md/api/orders.md).

#### Response Parameters

Descriptions for the response parameters are present in the [Orders Entity](/razorpay-docs-md/api/orders/entity.md) table.

#### Error Response Parameters

The error response parameters are available in the [API Reference Guide](/razorpay-docs-md/api/orders/create.md).

### 2. Validate Authentication Type

Validating the authentication type is critical. This will help you to set the value of `auth_type` in [payment creation](/razorpay-docs-md/payment-gateway/s2s-integration/payment-methods/cards/authentication-type/native-otp.md#3-create-a-payment). If the value of `auth_type` is sent as `otp` for a BIN which is not validated successfully, the transaction will fail.

The following API endpoint will enable Razorpay to verify the OTP-based authentication flow for a specific card:

POST

/payment/flows

RequestResponse

copy

```bash
curl -X POST \
'https://api.razorpay.com/v1/payment/flows' \
-u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-H 'content-type: application/json'
-d '{
    "card_number":"4242424242424242"
}'
```

### 3. Create a Payment

After the Order ID is created, create a payment for the Order ID. The API endpoint for creating a payment is given below:

POST

/payments/create/redirect

Example Request with auth\_typeJavaRubyResponse with OTPNormal Error ResponseFeature Unavailable for the BIN

copy

```bash
curl -X POST \
'https://api.razorpay.com/v1/payments/create/redirect' \
-u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-H "Content-Type: application/x-www-form-urlencoded" \
-d 'amount=5000&currency=INR&contact=9123456780&email=gaurav.kumar@example.com&method=card&card[number]=4386289407660153&card[name]=Gaurav%20Kumar&card[expiry_month]=01&card[expiry_year]=25&card[cvv]=111&user_agent=Razorpay%20SDK&ip=1.160.10.240&referer=https://www.example.com&auth_type=otp'
```

#### Request Parameters

currency

mandatory

`string` The currency of the transaction as passed in [Orders](/razorpay-docs-md/payment-gateway/s2s-integration/payment-methods/cards/authentication-type/native-otp.md#1-create-a-razorpay-order). [See the list of supported currencies](/razorpay-docs-md/international-payments.md#supported-currencies)

.

amount

mandatory

`integer` The transaction amount, expressed in the smallest currency unit such as paise. For example, for an actual amount of ₹299.35, the value of this field should be `29935`.

order\_id

mandatory

`string` The unique identifier of the order created using in [Step 1](/razorpay-docs-md/payment-gateway/s2s-integration/payment-methods/cards/authentication-type/native-otp.md#1-create-a-razorpay-order).

email

mandatory

`string` The customer's email address. For example, `gaurav.kumar@example.com`.

contact

mandatory

`string` The customer's contact number. For example, `9123456780`.

method

mandatory

`string` The payment method selected by the customer. Here, the value must be `card`.

card

The attributes associated with a card.

number

mandatory

`integer` Unformatted card number. This field is required if value of `method` is `card`. Use one of our test cards to try out the payment flow.

name

mandatory

`string` The name of the cardholder.

expiry\_month

mandatory

`integer` The expiry month of the card in `MM` format. For example, `01` for January and `12` for December.

expiry\_year

mandatory

`integer` Expiry year for card in `YY` format. For example, 2025 will be in format `25`.

cvv

mandatory

`integer` CVV printed on the back of the card.

**Handy Tips**

- CVV is not required by default for tokenised cards across all networks.
- CVV is optional for tokenised card payments. Do not pass dummy CVV values.
- To implement this change, skip passing the `cvv` parameter entirely, or pass a `null` or empty value in the CVV field.
- We recommend removing the CVV field from your checkout UI/UX for tokenised cards.
- If CVV is still collected for tokenised cards and the customer enters a CVV, pass the entered CVV value to Razorpay.

notes

optional

`object` Set of key-value pairs used to store additional information about the entity. It can hold a maximum of 15 key-value pairs, each 256 characters long (maximum).

ip

mandatory

`string` The client's IP address.

referer

mandatory

`string` The client's referer URL.

user\_agent

mandatory

`string` The client's User-Agent.

auth\_type

mandatory

`string` Indicates the authentication type for this integration method.
Defaults to `3ds`. Upon [successful validation](/razorpay-docs-md/payment-gateway/s2s-integration/payment-methods/cards/authentication-type/native-otp.md#2-validate-authentication-type), pass `auth_type=otp`.

#### Response Parameters

razorpay\_payment\_id

`string` Unique identifier of a payment.

razorpay\_order\_id

string

`string` Unique identifier of an Order.

razorpay\_signature

string

`string` Unique alpha-numeric identifier used for verifying a payment.

next

`array` Lists the subsequent payment actions available:

- `otp_submit`
- `otp_resend` [Learn more about `next` actions.](/razorpay-docs-md/payment-gateway/s2s-integration/payment-methods/cards/authentication-type/native-otp.md#4-otp-authentication)

The following example request creates a payment for ₹50:

**Note**

The payment data is passed in `form-urlencoded` format which ensures that nested keys are correctly passed.

### 4. OTP Authentication

After entering the OTP, the customer can perform either of the two actions, as described in the `next` parameter:

1. [OTP Submit](/razorpay-docs-md/payment-gateway/s2s-integration/payment-methods/cards/authentication-type/native-otp.md#otp-submit)
2. [OTP Resend](/razorpay-docs-md/payment-gateway/s2s-integration/payment-methods/cards/authentication-type/native-otp.md#otp-resend) next

`array` This array specifies the available actions as a comma-separated list. It can have the following predefined values:
-`otp_submit`
-`otp_resend`

In cases where two-factor authentication is not required or not available, the `next` object will not be returned in the response.

otp\_submit

`string` This value is consumed to display otp submit option.

otp\_resend

`string` This value is consumed as a retry option for OTP submission. If the parameter is not present, the OTP resend option cannot be shown to the customers. The resend option may be unavailable after a certain number of retries. The number of retries is determined by the bank and not by Razorpay.

#### OTP Submit

OTP submission is a part of the payment authentication process from the customer's end where an OTP received is submitted through your application's frontend.

For card payments, customers receive the OTP via their preferred notification medium - SMS or email.

**Note**

Do not perform any validation on the length of the OTP since this can vary across banks. However, the OTP should not be blank.

The OTP received must be submitted to the following endpoint:

POST

payments/:id/otp/submit

Example RequestSuccessFailure

copy

```bash
curl -X POST \
'https://api.razorpay.com/v1/payments/pay_29QQoUBi66xm2f/otp/submit' \
-u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-H "Content-Type: application/x-www-form-urlencoded" \
-d 'otp=123456'
```

#### Path Parameter

id

mandatory

`string` Unique identifier of the payment.

#### Request Parameter

otp

mandatory

`integer` The OTP received by the customer.

#### OTP Resend

There could be situations when the customer has to re-enter the OTP. The number of retries that the user is allowed is determined by the issuing bank.

POST

payments/:id/otp/resend

Example RequestSuccess

copy

```bash
curl -X POST \
'https://api.razorpay.com/v1/payments/pay_29QQoUBi66xm2f/otp/resend' \
-u [YOUR_KEY_ID]:[YOUR_KEY_SECRET]
```

#### Path Parameter

id

mandatory

`string` Unique identifier of the payment.

### 5. Verify the Payment

Once the payment process is completed, Razorpay will make a `POST` request to the `callback_url` on whether the payment was a **success** or a **failure**.

You can easily verify the payment signature using our SDKs:

JavaPythonPHPRuby

copy

```java
RazorpayClient razorpay = new RazorpayClient("[YOUR_KEY_ID]", "[YOUR_KEY_SECRET]");

JSONObject options = new JSONObject();
options.put("razorpay_order_id", "order_IEIaMR65cu6nz3");
options.put("razorpay_payment_id", "pay_IH4NVgf4Dreq1l");
options.put("razorpay_signature", "0d4e745a1838664ad6c9c9902212a32d627d68e917290b0ad5f08ff4561bc50f");

boolean status =  Utils.verifyPaymentSignature(options, secret);
```

If `razorpay_payment_id` is returned, the payment is successfully created and verified.

**Post-processing**

A successful transaction results in the creation of the `razorpay_order_id` in your database. You can mark the corresponding transaction at your end as paid and notify the customer of the same.

### Failure Scenario

An exception is thrown in the event of unsuccessful signature verification. If the `razorpay_payment_id` field is missing in the API request, the following error is displayed in the corresponding response body:

Response

copy

```html
error%5Bcode%5D=BAD_REQUEST_ERROR&error%5Bdescription%5D=Payment+failed
```
