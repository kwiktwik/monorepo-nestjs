<!-- Source: https://razorpay.com/docs/payments/payment-methods/cards/authentication/native-otp -->

Use Razorpay's Native OTP feature to provide an efficient and simple OTP flow to your customers, reduce payment failures due to low internet speeds and avoid payment failure due to redirects to bank pages.

## Prerequisites

Before implementing the Native OTP feature, check if the following requirements are in place:

1. Verify that you are PCI-compliant to accept and process the customer's card details. Know more about [PCI compliance](https://www.pcicomplianceguide.org/faq/#1)   . The compliance certificate should be updated as per the yearly renewal cycle.
2. Raise a request with [Razorpay Support](https://razorpay.com/support#request)

   to enable this feature on your Checkout page.
3. Understand the [payment process](/razorpay-docs-md/payment-gateway/how-it-works.md)   .

## Create Workflow for Native OTP

1. [Creating a Razorpay order](/razorpay-docs-md/payment-methods/cards/authentication/native-otp.md#1-create-a-razorpay-order)
2. [Validating authentication type](/razorpay-docs-md/payment-methods/cards/authentication/native-otp.md#2-validate-authentication-type)
3. [Creating a payment](/razorpay-docs-md/payment-methods/cards/authentication/native-otp.md#3-create-a-payment)
4. [OTP Authentication](/razorpay-docs-md/payment-methods/cards/authentication/native-otp.md#4-otp-authentication)
5. [Payment Verification](/razorpay-docs-md/payment-methods/cards/authentication/native-otp.md#5-verify-the-payment)

**API Authentication**

Razorpay APIs are authenticated using **Basic Auth** method, where `your_key_id` is the **Username** and `your_key_secret` is the **Password**. You can access your API keys from the Dashboard.

### 1. Create a Razorpay Order

A **Razorpay Order** creates an Order ID corresponding to the unique order (transaction ID or checkout ID) created at your end. The Order ID is tied to all the payments made against that particular order.

POST

/orders

Order is an important step in the payment process.

- An order should be created for every payment.
- You can create an order using the [Orders API](/razorpay-docs-md/payment-methods/cards/authentication/native-otp.md#api-sample-code)  . It is a server-side API call.  Know how to [authenticate](/razorpay-docs-md/api/authentication.md#generate-api-keys)

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

Validate the authentication type to set the value of `auth_type` in [payment creation](/razorpay-docs-md/payment-methods/cards/authentication/native-otp.md#3-create-a-payment). The transaction will fail if the value of `auth_type` is sent as `otp` for a BIN, which is not validated successfully.

The following API endpoint allows Razorpay to verify the OTP-based authentication flow for a specific card:

POST

/payment/flows

Example RequestValidation SuccessValidation Failure

copy

```bash
curl -X POST https://api.razorpay.com/v1/payment/flows \
-u <YOUR_KEY_ID>:<YOUR_SECRET> \
-H 'content-type: application/json'
-d '{
  "card_number": "4242424242424242"
}'
```

### 3. Create a Payment

Use the following API to create a payment using the Order ID.

POST

/payments/create/redirect

#### Request Parameters

currency

mandatory

`string` The currency of the payment amount. Pass `INR` for Indian rupees as currently, we do not support foreign currencies.

amount

mandatory

`integer` The payment amount in **paise**. For example, if the payment amount is ₹195.55, pass `19555`.

order\_id

mandatory

`string` The unique identifier of the order created in [step 1](/razorpay-docs-md/payment-methods/cards/authentication/native-otp.md#creating-the-workflow-for-native-otp).

email

mandatory

`string` The customer's email address. For example, `gaurav.kumar@example.com`.

contact

mandatory

`string` The customer's contact number. For example, `+919123456780`.

method

mandatory

`string` The payment method selected by the customer. The only allowed value is `card`.

card[number]

mandatory

`integer` Unformatted card number. This field is required if value of `method` is `card`. Use one of our [test cards](/razorpay-docs-md/payments/test-card-details.md) to try out the payment flow.

card[name]

mandatory

`string` The name of the cardholder.

card[expiry\_month]

mandatory

`integer` The expiry month of the card in *MM* format. For example, `01` for January and `12` for December.

card[expiry\_year]

mandatory

`integer` Expiry year for card in *YY* format. For example, `22` for 2022.

card[cvv]

mandatory

`integer` 3-digit code on the back of Master or Visa card or 4-digit code on the front of the AMEX card.

notes

optional

`object` A set of key-value pairs that you can attach to an entity. Maximum 15 pairs. Maximum 256 characters for each pair. This can be useful for storing additional information about the entity.

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
Defaults to `3ds`. Upon [successful validation](/razorpay-docs-md/payment-methods/cards/authentication/native-otp.md#2-validate-authentication-type), pass `auth_type=otp`.
@// Passing `auth_type=otp` when the [validation](/razorpay-docs-md/payment-methods/cards/authentication/native-otp.md#2-validate-authentication-type) has failed, will result in payment failure.

#### Response Parameters

razorpay\_payment\_id

`string` Specifies the unique identifier of a payment. A sample payment ID: `pay_29QQoUBi66xm2f`

next

`array` Lists the subsequent payment actions available: `otp_submit` and `otp_resend` [Know more about `next` actions.](/razorpay-docs-md/payment-methods/cards/authentication/native-otp.md#4-otp-authentication)

The following example request creates a payment of ₹50:

**Handy Tips**

The payment data is passed in `form-urlencoded` format, which ensures that nested keys are correctly passed.

Example Request with auth\_typeResponse with OTP

copy

```bash
curl -X POST \
'https://api.razorpay.com/v1/payments/create/redirect' \
-u <YOUR_KEY>:<YOUR_SECRET> \
-H "Content-Type: application/x-www-form-urlencoded" \
-d 'amount=5000&currency=INR&contact=9123456780&email=gaurav.kumar@example.com&method=card&card[number]=4386289407660153&card[name]=Gaurav%20Kumar&card[expiry_month]=01&card[expiry_year]=17&card[cvv]=111&user_agent=Razorpay%20SDK&ip=1.160.10.240&referer=https://www.example.com&auth_type=otp'
```

#### Error Responses

Normal Error ResponseFeature Unavailable for the BIN

copy

```json
{
  "error": {
    "code": "BAD_REQUEST_ERROR",
    "description": "Your payment was not successful as you have an invalid expiry date. To pay successfully try adding the right details",
    "source": "customer",
    "step": "payment_authentication",
    "reason": "incorrect_card_expiry_date",
    "metadata": {}
  }
}
```

**Know More**: Know more about [API error codes](/docs/errors/#error-response).

### 4. OTP Authentication

After entering the OTP, the customer can perform either of the two actions, as described in the `next` parameter:

1. [OTP Submit](/razorpay-docs-md/payment-methods/cards/authentication/native-otp.md#otp-submission)
2. [OTP Resend](/razorpay-docs-md/payment-methods/cards/authentication/native-otp.md#otp-resend) next

`array` This array specifies the available actions as a comma-separated list. It can have the following predefined values:

- `otp_submit`
- `otp_resend`

   In cases where two-factor authentication is not required or not available, the `next` object will not be returned in the response. [next]otp\_submit

`string` This value is consumed to display OTP submit option. [next]otp\_resend

`string` This value is consumed as a retry option for OTP submission. If the parameter is not present, the OTP resend option cannot be shown to the customers. The resend option may be unavailable after a certain number of retries. The bank determines the number of retries and not Razorpay.

#### OTP Submission

The customer needs to submit the OTP using your application frontend as part of the payment authentication process.

For card payments, the customer receives the OTP using their preferred notification medium - SMS or email.

**Handy Tips**

Do not perform any validation on the length of the OTP since this can vary across banks. The OTP should not be blank.

The OTP received must be submitted to the following endpoint:

POST

payments/:id/otp/submit

CurlJavaRuby.NETSuccessFailure

copy

```bash
curl -X POST \
'https://api.razorpay.com/v1/payments/pay_29QQoUBi66xm2f/otp/submit' \
-u <YOUR_KEY_ID>:<YOUR_SECRET> \
-H "Content-Type: application/x-www-form-urlencoded" \
-d 'otp=123456'
```

Know more about [Error Codes](/docs/errors/payments/payment-methods-error-parameters/#cards).

#### OTP Resend

For certain situations, the customers may need to re-enter the OTP sent to them. The card issuing bank sets the number of retries the customer is allowed to re-enter the OTP.

POST

payments/:id/otp/resend

CurlJavaRuby.NETResponse with OTPSuccess

copy

```bash
curl -X POST \
'https://api.razorpay.com/v1/payments/pay_29QQoUBi66xm2f/otp/resend' \
-u <YOUR_KEY_ID>:<YOUR_SECRET>
-H "Content-Type: application/x-www-form-urlencoded"
```

### 5. Verify the Payment

After the payment process is complete, Razorpay makes a `POST` request to the `callback_url` about whether the payment was a **success** or a **failure**.

You can easily verify the payment signature using our SDKs:

JavaPythonPHPRuby

copy

```java
RazorpayClient razorpay = new RazorpayClient("[YOUR_KEY_ID]", "[YOUR_KEY_SECRET]");

String secret = "EnLs21M47BllR3X8PSFtjtbd";

JSONObject options = new JSONObject();
options.put("razorpay_order_id", "order_9A33XWu170gUtm");
options.put("razorpay_payment_id", "pay_29QQoUBi66xm2f");
options.put("razorpay_signature", "9ef4dffbfd84f1318f6739a3ce19f9d85851857ae648f114332d8401e0949a3d");

boolean status =  Utils.verifyPaymentSignature(options, secret);
```

If `razorpay_payment_id` is returned, the payment is successfully created and verified.

**Post-processing**

A successful transaction results in the creation of the `razorpay_order_id` in your database. You can mark the corresponding transaction at your end as `paid` and notify the customer.

#### Failure

An exception is thrown in the event of unsuccessful signature verification. If the `razorpay_payment_id` field is missing in the API request, the following error is displayed in the corresponding response body:

Failure POST Request

copy

```html
error%5Bcode%5D=BAD_REQUEST_ERROR&error%5Bdescription%5D=Payment+failed
```
