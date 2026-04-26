<!-- Source: https://razorpay.com/docs/payments/international-payments/accept-international-payments-from-indian-customers/standard-integration/offers/s2s-integration -->

You can integrate offers with your payment flows while integrating directly with our APIs. This is particularly useful, if you are a business that is **not PCI-compliant** and would like to avail the offers that the issuer of network might provide. In such cases, validations must be done once the payment creation request is sent. Razorpay gives you the flexibility to design offers such that you can decide whether to pass the payments or not based on the set validations while creating the offers.

## Prerequisites

Generate the API keys to start your integration. The keys are required for authenticating API requests with our servers.

Log in to the Dashboard to generate the API keys, if you have not done earlier. For making the direct API calls, you need the `Key_Secret` as well.

## Workflow

1. [Create Offers from Dashboard](/razorpay-docs-md/international-payments/accept-international-payments-from-indian-customers/standard-integration/offers/s2s-integration.md#step-1-create-offers)

   .
2. [Create Orders to include the Offers in the payment request](/razorpay-docs-md/international-payments/accept-international-payments-from-indian-customers/standard-integration/offers/s2s-integration.md#step-2-create-an-order)

   .
3. [Create a payment to be sent to the customer](/razorpay-docs-md/international-payments/accept-international-payments-from-indian-customers/standard-integration/offers/s2s-integration.md#step-3-create-a-payment)

   .
4. [Verify the payment made by the customer](/razorpay-docs-md/international-payments/accept-international-payments-from-indian-customers/standard-integration/offers/s2s-integration.md#step-4-verify-the-payment)

   .

### Step 1: Create Offers [Create an offer](/razorpay-docs-md/international-payments/accept-international-payments-from-indian-customers/standard-integration/offers/create.md) from the Dashboard.

![](https://razorpay.com/docs/payments/international-payments/accept-international-payments-from-indian-customers/standard-integration/offers/build/browser/assets/images/offers-offers-description.jpg)

### Step 2: Create an Order

After generating offers from the Dashboard, pass the `offer_id` in the order request attributes to the following endpoint:

POST

/orders

CurlJavaPythonGoPHPRubyNode.js.NETSuccessFailure

copy

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X POST https://api.razorpay.com/v1/orders \
-H "Content-Type: application/json" \
-d '{
  "amount": 1000,
  "currency": "INR",
  "offer_id": "offer_DtEhEm3XslgfXE"
}'
```

### Step 3: Create a Payment

Send the following attributes required to create a payment at the following endpoint:

POST

/payments/create/json

#### Sample Code

CurlSuccessFailure

copy

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X POST https://api.razorpay.com/v1/payments/create/json \
-H "Content-Type: application/json" \
-d'{
  "amount": 1000,
  "currency": "INR",
  "contact": 9000090000,
  "email": "gaurav.kumar@example.com",
  "order_id": "order_CjyltuCttYiMe8",
  "offer_id": "offer_DtEhEm3XslgfXE",
  "method": "netbanking",
  "bank": "UTIB"
}'
```

#### Request Parameters

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

offer\_id

`string` Unique identifier of the offer.

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

Details associated with the card. Required if the payment method is `card`.

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

- CVV is not required by default for Visa and Amex tokenised cards.
- To enable CVV-less flow for Rupay and Mastercard, contact our [support team](https://razorpay.com/support/#request)  .
- CVV is mandatory for Diners tokenised cards.
- CVV is an optional field. Skip passing the `cvv` parameter to Razorpay to implement this change.

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

#### Response Types

2OO OK

In this case, the response contains `200 OK` code and the HTML content that needs to be opened in the customer's browser. This HTML content contains form-fields, which will be automatically posted to the redirect URL for the customer to complete the payment.

400 Bad Request

This can happen when erroneous parameters are passed in the request. For example, when the limit set in Offers is exceeded:

Know more about the [error codes](/razorpay-docs-md/api/index.md#error-codes).

The HTML form returned in the response should be opened in the customer's browser. The customer completes the payment on the displayed page.

### Step 4: Verify the Payment

Once the customer completes the payment, a `POST` request is sent to the `callback_url` provided in the [payment create request](/razorpay-docs-md/international-payments/accept-international-payments-from-indian-customers/standard-integration/offers/s2s-integration.md#step-3-create-a-payment). The data contained in the `POST` request depends on the **success** or **failure** of the payment made by the customer.

## Next Steps

After the customer has availed the offers and made the payment on the Checkout, you can track the status of the payments:

- From the Dashboard.
- By [configuring webhooks](/docs/webhooks/)  .
- By polling our [payment APIs](/razorpay-docs-md/api/index.md#fetch-payments-based-on-orders)  .

### Related Information

- [About Offers](/razorpay-docs-md/international-payments/accept-international-payments-from-indian-customers/standard-integration/offers.md)
- [Create Offers](/razorpay-docs-md/international-payments/accept-international-payments-from-indian-customers/standard-integration/offers/create.md)
- [Tutorial - How to Create Offers](/razorpay-docs-md/international-payments/accept-international-payments-from-indian-customers/standard-integration/offers/tutorial.md)
