<!-- Source: https://razorpay.com/docs/payments/payment-gateway/s2s-integration/json/v2/build-integration/cards/browser -->

If you integrated with our S2S APIs before October 15, 2022, you must make the following changes to your integration to accept card payments with the 3DS 2 authentication protocol.

**Watch Out!**

You must have a PCI compliance certificate to get this feature enabled on your account.

## Quick Summary of Integration Changes

Ensure you make the following changes in your Create a Payment API request. There is no change in the response.

#### Sample Code

Given below is the sample code:

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
  "method": "card",
  "card":{
         "number": "4386289407660153",
         "name": "Gaurav",
         "expiry_month": "11",
         "expiry_year": "2030",
         "cvv": "100"
      },
      "authentication":{
         "authentication_channel": "browser"
      },
      ### 3DS2.0 Browser Parameters###
      "browser":{
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

- The payment request and response would remain the same for both frictionless and challenge scenarios.
- The payment request would remain the same for redirection and native OTP flows.

#### Request Parameters

amount

mandatory

`integer` Payment amount in the smallest currency sub-unit. For example, if the amount to be charged is ₹299, then pass `29900` in this field.

currency

mandatory

`string` Currency code for the currency in which you want to accept the payment. For example, INR. Refer to the list of supported currencies. The length must be 3 characters.

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

`string` Name of the payment method. The possible value is `card`.

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

notes

optional

`object` Key-value object used for passing tracking info. Refer to [Notes](/razorpay-docs-md/api/understand.md#notes) for more details.

callback\_url

optional

`string` URL endpoint where Razorpay will submit the final payment status.

referrer

optional

`string` Referrer header passed by the client's browser.

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

#### Response Parameters

If the payment request is valid, the response contains the following fields.

razorpay\_payment\_id

`string` Unique identifier of the payment. Present for all responses.

next

`array` A list of action objects available to you to continue the payment process. Present when the payment requires further processing.

action

`string` An indication of the next step available to you to continue the payment process. Possible values:

- `otp_generate`: This URL allows the customer to generate OTP and complete the payment on your webpage.
- `redirect`: This URL redirects the customer to submit the OTP on the bank page.

url

`string` URL to be used for the action indicated.

## OTP Generation

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

## Next Step

The rest of the integration steps mentioned in the [S2S JSON V2 Cards Build Integration document](/razorpay-docs-md/payment-gateway/s2s-integration/json/v2/build-integration/cards.md) remain the same. No changes are required in those.

After completing the build integration steps, you can continue with [Step 2: Test Integration](/razorpay-docs-md/payment-gateway/s2s-integration/json/v2/test-integration.md)
