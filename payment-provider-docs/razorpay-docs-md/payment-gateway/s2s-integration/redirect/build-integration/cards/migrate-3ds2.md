<!-- Source: https://razorpay.com/docs/payments/payment-gateway/s2s-integration/redirect/build-integration/cards/migrate-3ds2.0 -->

If you integrated with our S2S APIs before October 15, 2022, you must make the following changes to your integration to accept card payments with 3DS2 authentication protocol.

**Watch Out!**

You must have a PCI compliance certificate to get this feature enabled on your account.

## 3DS2 Authentication

3DS2 is an authentication protocol, the successor of 3DS1, that enables businesses and payment providers to send additional information (such as customer device or browser data) to verify the transaction's authenticity. Razorpay integration is compliant with the 3DS2 protocol.

**Know more**: Razorpay supports [3DS2 transactions](/razorpay-docs-md/payment-gateway/s2s-integration/payment-methods/cards/3ds2.md).

The customer's bank evaluates the transaction for risk and decides on the payment flow.

- **Frictionless Flow**: This flow is activated if the bank determines that the transaction is from a trusted device and allows the payment to go through without any additional authentication from the customer. Currently, this would not be applicable in India for domestic payments as RBI mandates OTP-based authentication. For international payments, this flow is viable.
- **Challenge Flow**: This flow is activated if the bank determines that the transaction is not from a trusted device and needs additional information. The customer needs to perform additional authentication steps.

**Handy Tips**

- Integration does not differ for the challenge flow or the frictionless flow.
- Frictionless flow is not applicable for payments on cards issued in India.

Given below is a diagram that explains the 3DS2 flow:

![Cards 3DS2 Protocol](https://razorpay.com/docs/payments/payment-gateway/s2s-integration/redirect/build-integration/cards/build/browser/assets/images/cards-3ds-flowchart.jpg)

## Quick Summary of Integration Changes

Ensure you make the following changes in your [Create a Payment API](/razorpay-docs-md/payment-gateway/s2s-integration/redirect/build-integration/cards.md#12-create-a-payment) request. There is no change in the response.

### Sample Code

The following endpoint creates a payment via the redirect flow.

POST

/payments/create/redirect

RequestResponseFailure Response

copy

```bash
curl -X POST \
https://api.razorpay.com/v1/payments/create/redirect \
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
    	   "expiry_month": 11,
    	   "expiry_year": 23,
    	   "cvv": 100
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

- The payment request and response would remain the same for both the frictionless and challenge flows.
- The payment request would remain the same for both redirection and native OTP flows.

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

`integer` Time difference between UTC time and the cardholder's browser local time. Obtained from the `getTimezoneOffset()` method applied to `Date` object.

screen\_width

`integer` Total width of the payer's screen in pixels. Obtained from the `screen.width` HTML DOM property.

screen\_height

`integer` Obtained from the `navigator` HTML DOM object.

color\_depth

`integer` Obtained from the payer's browser using the `screen.colorDepth` HTML DOM property.

language

`string` Obtained from the payer's browser using the `navigator.language` HTML DOM property. Maximum limit of 8 characters.

#### Response Parameters

Descriptions for the response parameters are present in the [Payments Entity](/razorpay-docs-md/api/payments.md#payments-entity) parameters table.

#### Response Types

2OO OK

The response contains `200 OK` code along with the HTML content that needs to be opened in the customer's browser. This HTML content contains form fields which will be automatically posted to the bank or wallet URL (specified in the form) to continue with the payment process.

400 Bad Request

This can happen when erroneous parameters are passed in the request, for example, invalid currency or wrong card number.

Know more about [errors](/docs/errors/).

The HTML form returned in the response should be opened in the customer's browser. The customer completes the payment on the displayed page.

## Next Step

The rest of the integration steps mentioned in the [S2S Redirect Cards Build Integration document](/razorpay-docs-md/payment-gateway/s2s-integration/redirect/build-integration/cards.md) remain the same. No changes are required in those.

After completing the build integration steps, you can continue with [Step 2: Test Integration](/razorpay-docs-md/payment-gateway/s2s-integration/redirect/test-integration.md)
