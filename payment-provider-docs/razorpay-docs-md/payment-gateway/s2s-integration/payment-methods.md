<!-- Source: https://razorpay.com/docs/payments/payment-gateway/s2s-integration/payment-methods -->

You can accept payments through several payment methods such as netbanking, debit cards, credit cards, wallets and UPI. However, you can configure payment methods of your choice for collecting payments from your customers.

Check the [payment methods](/razorpay-docs-md/payment-gateway/s2s-integration/payment-methods/methods-api.md) activated for your account.

### Check the API Endpoint

On this page, we have listed the sample codes with the S2S JSON V2 API. If you are using the Redirect API version, use the API endpoint as suggested below:

#### Supported Payment Fields

Understand the fields required to construct a payment request:

key\_id

mandatory

`string` The key id that you have generated from the **API Keys** tab in the Dashboard.

amount

mandatory

`integer` Payment amount in the smallest currency sub-unit. For example, if the amount to be charged is ₹299, then pass `29900` in this field.

currency

mandatory

`string` Currency code for the currency in which you want to accept the payment. For example, `INR`. Refer to the list of [supported currencies](/razorpay-docs-md/international-payments.md#supported-currencies). Length must be of 3 characters.

order\_id

mandatory

`string` Unique identifier of the Order.
 Know more about [Orders API](/razorpay-docs-md/api/orders.md).

ip

mandatory

`string` Customer's IP address.

email

mandatory

`string` Email address of the customer. Maximum length supported is 40 characters.

contact

mandatory

`string` Phone number of the customer. Maximum length supported is 15 characters, inclusive of country code.

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

method

mandatory

`string` Name of the payment method. Possible values are:

- `card`
- `netbanking`
- `wallet`
- `emi`
- `upi`
- `cardless_emi`
- `paylater`

card

`object` Details associated with the card. Required if the payment method is `card`.

number

mandatory

`string` Unformatted card number. Required if the method is `card`.

name

mandatory

`string` Name of the cardholder. Required if the method is `card`.

expiry\_month

mandatory

`integer` Expiry month for card in `MM` format. Required if the method is `card`.

expiry\_year

mandatory

`string` Expiry year for card in `YY` format. Required if the method is `card`.

cvv

mandatory

`string` CVV printed on the back of card. Required if the method is `card`.

**Handy Tips**

- CVV is not required by default for tokenised cards across all networks.
- CVV is optional for tokenised card payments. Do not pass dummy CVV values.
- To implement this change, skip passing the `cvv` parameter entirely, or pass a `null` or empty value in the CVV field.
- We recommend removing the CVV field from your checkout UI/UX for tokenised cards.
- If CVV is still collected for tokenised cards and the customer enters a CVV, pass the entered CVV value to Razorpay.

bank

`string` Bank code of the bank used for the payment. Required if the method is `netbanking`.

bank\_account

The details of the bank account that should be passed in the request. Required if the method is `emandate`.

account\_number

mandatory

`string` Bank account number used to initiate the payment.

ifsc

mandatory

`string` IFSC of the bank used to initiate the payment.

name

mandatory

`string` Name associated with the bank account used to initiate the payment.

emi\_duration

`string` The EMI duration in months. Required if the method is `emi`.

vpa

`string` Virtual payment address of the customer. Required if the method is `upi`.

wallet

`string` Wallet code for the wallet used for the payment. Required if the method is `wallet`.

notes

optional

`object` Key-value object used for passing tracking info. Refer to [Notes](/razorpay-docs-md/api/understand.md#notes) for more details.

callback\_url

optional

`string` URL endpoint where Razorpay will submit the final payment status.

referrer

optional

`string` Referrer header passed by the client's browser.

user\_agent

optional

`string` Customer user-agent.

Sample payloads for each of the payment methods are shown below in the JSON format.

## Debit and Credit Cards

Given below is the sample code for card payments:

CurlJavaPythonGoPHPRubyNode.js.NETResponse

copy

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X POST https://api.razorpay.com/v1/payments/create/json \
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
    "browser": {
    	"java_enabled": false,
    	"javascript_enabled": false,
    	"timezone_offset": 11,
    	"color_depth": 23,
    	"screen_width": 23,
    	"screen_height": 100
    }
    // Note: The authentication and browser parameters are applicable for 3DS 2 transactions
}'
```

#### Supported Card Networks

List of supported card networks:

- Visa
- Mastercard
- American Express
- Bajaj
- Maestro
- Rupay
- Diners (Only available for private limited and registered businesses)

## Netbanking

Given below is the sample code for netbanking payments. Pass the value for the `bank` parameter as shown below:

CurlJavaPythonGoPHPRubyNode.js.NETResponse

copy

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X POST https://api.razorpay.com/v1/payments/create/json
-H "Content-Type: application/json" \
-d '{
	"amount": 200000,
	"currency": "INR",
	"contact": "9000090000",
	"email": "gaurav.kumar@example.com",
	"order_id": "order_DPzFe1Q1dEObDT",
	"method": "netbanking",
	"bank": "HDFC"
}'
```

#### Supported Banks

Fetch the supported bank codes using the [Methods API](/razorpay-docs-md/payment-gateway/s2s-integration/payment-methods/methods-api.md).

## EMI

Given below is the sample code for EMI payments. Pass the card details along with these parameters:

- `method`
- `emi_duration`

CurlJavaPythonGoPHPRubyNode.js.NETResponse

copy

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X POST https://api.razorpay.com/v1/payments/create/json \
-H "Content-Type: application/json" \
-d '{
	"amount": 200000,
	"currency": "INR",
	"contact": "9000090000",
	"email": "gaurav.kumar@example.com",
	"order_id": "order_DPzFe1Q1dEObeD",
	"method": "emi",
	"emi_duration": 9,
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
    "browser": {
        "java_enabled": false,
        "javascript_enabled": false,
        "timezone_offset": 11,
        "color_depth": 23,
        "screen_width": 23,
        "screen_height": 100
    }
    // Note: The authentication and browser parameters are applicable for 3DS 2 transactions
}'
```

### EMI Plans

- Fetch the available EMI plans (for each supported bank) by invoking the [Methods API](/razorpay-docs-md/payment-gateway/s2s-integration/payment-methods/methods-api.md)  . Extract the EMI plans from the response to be shown to your customers while making the payment.
- Know more about EMI plans offered by [OneCard](/razorpay-docs-md/payment-gateway/s2s-integration/payment-methods/emi/one-card.md)

  and [HSBC](/razorpay-docs-md/payment-gateway/s2s-integration/payment-methods/emi/hsbc.md)  .

## Cardless EMI

Given below is the sample code for Cardless EMI payments.

**Handy Tips**

- Contact our [Support Team](https://razorpay.com/support/#request)

  to get the Cardless EMI payment method enabled for your account.
- Customers should have accounts with the Cardless EMI payment partner.

CurlJavaPythonGoPHPRubyNode.js.NETResponse

copy

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X POST https://api.razorpay.com/v1/payments/create/json
-H "Content-Type: application/json" \
-d '{
	"amount": 200000,
	"currency": "INR",
	"contact": "9000090000",
	"email": "gaurav.kumar@example.com",
	"order_id": "order_DPzFe1Q1dEOboB",
	"method": "cardless_emi",
	"provider": "zestmoney"
}'
```

#### Supported Providers

List of supported Cardless EMI providers:

## Wallet

Given below is the sample code for wallet payments. Pass the wallet provider name as shown:

CurlJavaPythonGoPHPRubyNode.js.NETResponse

copy

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X POST https://api.razorpay.com/v1/payments/create/json
-H "Content-Type: application/json" \
-d '{
	"amount": 200000,
	"currency": "INR",
	"contact": "9000090000",
	"email": "gaurav.kumar@example.com",
	"order_id": "order_DPzFe1Q1dEObDU",
	"method": "wallet",
	"wallet": "payzapp"
}'
```

#### Supported Wallets

The table below lists the various wallets available to you. Some of them are available by default, while others require approval from us. Raise a request with our [Support Team](https://razorpay.com/support/#request) to enable such wallets.

**Handy Tips** [Integrate your PayPal account](/razorpay-docs-md/payment-gateway/s2s-integration/payment-methods/paypal.md#integration-steps) with Razorpay Checkout to accept payments in international currencies.

You can accept payments based on the transaction limit of your PayPal account.

## UPI

Know about [UPI Intent](/razorpay-docs-md/payment-gateway/s2s-integration/payment-methods/upi/intent.md) and [UPI Collect](/razorpay-docs-md/payment-gateway/s2s-integration/payment-methods/upi.md).

**UPI Collect Flow Deprecated**

According to NPCI guidelines, the UPI Collect flow is being deprecated effective 28 February 2026. Customers can no longer make payments or register UPI mandates by manually entering VPA/UPI id/mobile numbers.

**Exemptions:** UPI Collect will continue to be supported for:

- MCC 6012 & 6211 (IPO and secondary market transactions).
- iOS mobile app and mobile web transactions.
- UPI Mandates (execute/modify/revoke operations only)
- eRupi vouchers.
- PACB businesses (cross-border/international payments).

**Action Required:**

- If you are a new Razorpay user, use [UPI Intent](/razorpay-docs-md/payment-gateway/s2s-integration/payment-methods/upi/intent.md)  .
- If you are an existing Razorpay user not covered by exemptions, you must migrate to UPI Intent or UPI QR code to continue accepting UPI payments. For detailed migration steps, refer to the [migration documentation](/docs/announcements/upi-collect-migration/s2s-integration/)  .

## Pay Later

Given below is the sample code for Pay Later payments.

**Handy Tips**

- Contact our [Support Team](https://razorpay.com/support/#request)

  to get this payment method enabled for your account.
- Customers should have accounts with the Pay Later service providers.

Once the order is created and the customer's payment details are obtained, the information should be sent to Razorpay to complete the payment. You can do this by invoking `createPayment` and passing `method=paylater` and `provider=<provider_name>`.

CurlJavaPythonGoPHPRubyNode.js.NETResponse

copy

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X POST https://api.razorpay.com/v1/payments/create/json \
-u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-H "Content-Type: application/json" \
-d '{
	"amount": 200000,
	"currency": "INR",
	"contact": "9000090000",
	"email": "gaurav.kumar@example.com",
	"order_id": "order_DPzFe1Q1dEObDv",
	"method": "paylater",
	"provider": "<provider_name>"
}'
```

#### Supported Providers

## CRED

Your customers can pay via a combination of CRED Coins and Credit Cards saved on CRED.

To add CRED Pay as a payment method, you need to:

- Pass the `app_offer` parameter in Orders API.
- Pass the `method` and `provider` parameters in Create Payments API.

#### Pass app\_offer Parameter in Order

You must create an order using Orders API. In the response, you obtain an `order_id` which you must pass to Checkout.

POST

/orders

CurlJavaPythongoPHPRubyNode.js.NETResponse

copy

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X POST https://api.razorpay.com/v1/orders \
-H "content-type: application/json" \
-d '{
  "amount": 1000,
  "currency": "INR",
  "receipt": "receipt#1",
  "app_offer": true
}'
```

#### Request Parameters

amount

mandatory

`integer` The transaction amount, expressed in the currency sub-unit, such as paise (in case of INR). For example, for an actual amount of ₹299.35, the value of this field should be `29935`.

currency

mandatory

`string` The currency in which the transaction should be made. See the [list of supported currencies](/razorpay-docs-md/international-payments.md#supported-currencies). Default is `INR`.

app\_offer

optional

`boolean` Allow/disallow customers from using CRED coins to make payments. This is used to prevent double discounting scenarios where customers have already availed discounts using voucher/coupon and you do not want them to redeem Coins as well. Possible values:

- `true`: Customer not allowed to use CRED coins to make payment.
- `false` (default): Customer can use CRED coins to make payment.

receipt

optional

`string` Your receipt id for this order should be passed here. Maximum length is 40 characters.

notes

optional

`object` Key-value pair that can be used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

#### Pass method and provider Parameters in Create Payments API

Create PaymentResponse

copy

```bash
curl -X POST https://api.razorpay.com/v1/payments/create/json \
-u [YOUR_KEY_ID]:[YOUR_KEY_SECRET]
-H 'content-type: application/json'
-d '{
  "amount": 1000,
  "currency": "INR",
  "contact": 9900988990,
  "email": "gaurav.kumar@example.com",
  "order_id": "order_4xbQrmEoA5WJ0G",
  "method": "app",
  "provider": "cred",
  "app_present": "false"
}'
```

#### Request Parameters

Along with the other Create Payment API request parameters, you must pass:

method

mandatory

`string` The method used to make the payment. Here, it must be `app`.

provider

mandatory if method=app

`string` Name of the PSP app. Here, it must be `cred`.

app\_present

mandatory if app=cred

`boolean` Sets the payment flow as collect. Possible values:

- `true`: Opens CRED app on customer's device.
- `false` (default): Sends a push notification to customer's device.

## Emandate

You can accept recurring payments from your customers using `emandate`, `card` or `upi` as the method. Know more about [Recurring Payments](/razorpay-docs-md/recurring-payments.md).

**Feature Request**

This is an on-demand feature. Please raise a request with our [Support team](https://razorpay.com/support/#request) to get this feature activated on your Razorpay account.

### Workflow

1. [Create a customer.](/razorpay-docs-md/api/customers.md#create-a-customer)
2. Create an Order with method as `emandate`, `nach` or `upi`.
3. Collect authorisation transaction.
   - Using custom checkout
   - Using an authorization link
4. Verify Tokens.
5. Charge subsequent payments.

Know more about steps 2,3,4 and 5 in [Recurring Payments](/razorpay-docs-md/api/payments/recurring-payments.md).

#### Sample Checkout Code to Collect Authorisation Transaction

Emandate (Netbanking)Emandate (Debit Card)Emandate (Aadhaar)CardsUPI

copy

```bash
curl -X POST \
https://api.razorpay.com/v1/payments/create/redirect \
-u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-H "Content-Type: application/json" \
-d '{
   "amount":0,
   "currency":"INR",
   "contact":"9000090000",
   "email":"gaurav.kumar@example.com",
   "order_id":"order_EAbtuXPh24LrEc",
   "customer_id":"cust_E9penp7VGhT5yt",
   "recurring":"1",
   "method":"emandate",
   "bank":"HDFC",
   "auth_type":"netbanking",
   "bank_account":{
      "name":"Gaurav Kumar",
      "account_number":"1121431121541121",
      "account_type":"savings",
      "ifsc":"HDFC0000001"
   }
}'
```

### Upload NACH File Using API

The current way to collect the NACH form is via Razorpay:

- Checkout
- Merchant Dashboard
- Hosted Checkout page, where a customer signs and uploads the form via Checkout while attempting authorisation transaction.

You can upload the signed NACH forms that you have collected from your customers using the NACH file API. Razorpay OCR-enabled NACH engine submits the form to NPCI. on successful verification and you will receive a success/failure response.

**Feature Request**

This is an on-demand feature. Please raise a request with our [Support team](https://razorpay.com/support/#request) to get this feature activated on your Razorpay account.

Follow these steps to register a NACH mandate via S2S Image Transfer:

1. Create a Customer
2. Create an Order
3. Upload the NACH file via API
4. Fetch Token
5. Create Subsequent Payments

Know more about steps 2,3,4 and 5 in [Recurring Payments](/razorpay-docs-md/api/payments/recurring-payments.md).

#### Sample Server Request and Responses

RequestSuccessful ResponseError Response

copy

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X POST 'https://api.razorpay.com/v1/payments/create/nach/file' \
-H "Content-Type: multipart/form-data" \
-F 'order_id=order_FoLdZrq6QGKUWg' \
-F 'file=@/Users/your_name/sample_uploaded.jpeg' // file path
```

#### Acceptable Image Formats and Sizes

The acceptable image formats and sizes are:

- .jpeg
- .jpg
- .png
- Maximum accepted size is 6 MB.

#### Error Reasons

Know about [errors under Recurring Payments FAQs](/razorpay-docs-md/recurring-payments/paper-nach/faqs.md#14-what-are-the-errors-i-get-while).
