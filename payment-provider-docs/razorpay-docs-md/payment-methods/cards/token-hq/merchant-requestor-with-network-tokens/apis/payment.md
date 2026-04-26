<!-- Source: https://razorpay.com/docs/payments/payment-methods/cards/token-hq/merchant-requestor-with-network-tokens/apis/payment -->

Use this API to directly process payments with tokens saved on another PA/PG.

POST

/payments/create/json

**Handy Tips**

The payment processing flow is the same as mentioned [here](/razorpay-docs-md/payment-gateway/s2s-integration/json/v2.md). However, you need to make the following changes:

- Pass the token number and token expiry values instead of the card number and card expiry values.
- Pass the cryptogram (TAVV) in the `cryptogram_value` field.

## Card Payments

#### Request Parameters

amount

mandatory

`integer` The payment amount you want to collect from the customer.

currency

mandatory

`string` The 3-character ISO code of the currency. Here, it is `INR`.

order\_id

mandatory

`string` The unique identifier of the order created for this payment. Create an order using the [Orders API](/razorpay-docs-md/api/orders.md).

email

mandatory

`string` The customer's email address.

contact

mandatory

`string` The customer's phone number.

method

mandatory

`string` The payment method. Possible value is `card`.

card

mandatory

`object` The details of the card.

number

mandatory

`string` If payment is made using an actual card, then this field should have the entire actual card number. If card number has spaces, Razorpay will trim them for further processing. If payment is made using a network token, then this field should have the token number. If token number has spaces, Razorpay will trim them for further processing.

expiry\_month

mandatory

`string` If payment is made using an actual card, then this field should have the 2-digit expiry month for the card. If payment is made using a network token, then this field should have the 2-digit expiry month for the token.

expiry\_year

mandatory

`string` If payment is made using an actual card, then this field should have the 2 or 4-digit expiry year for the card. If payment is made using a network token, then this field should have the 2 or 4-digit expiry year for the token.

cryptogram\_value \_

conditionally mandatory

`string` The cryptogram value for the token. This will be provided by the entity which provided the token. This field is mandatory if `tokenised=true` only for Visa, Mastercard and Rupay. Do not pass this for Amex cards.

tokenised

optional

`boolean` Indicates if the payment is made using tokenised card or actual card. Possible values:

- `true`: Pass `true` when you are making the payment using a token.
- `false` (default): Pass `false` when you are making the payment using a card.

token\_provider

optional

`string` The name of the aggregator that provided the token. Possible values:

- `amex`
- `axis_migs`
- `cashfree`
- `ccavenue`
- `cybersource`
- `first_data`
- `fss`
- `hdfc`
- `mpgs`
- `paysecure`
- `paytm`
- `payu`
- `zaakpay`
- `Visa`
- `RuPay`
- `MasterCard`

cvv

mandatory

`string` The card's cvv. For Amex tokenised cards, this will be a dynamic CVV provided by Amex for every payment on the tokenised card. Dynamic CVV is valid for about 20 minutes.

notes

optional

`object` Key-value pair that can be used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

#### Response Parameters

razorpay\_payment\_id

`string` Unique identifier of the payment. Present for all responses.

next

`array` A list of action objects available to you to continue the payment process. Present when the payment requires further processing.

action

`string` An indication of the next step available to you to continue the payment process. Possible value:

- `redirect`: Use this URL to redirect the customer to submit the OTP on the bank page.

url

`string` URL to be used for the action indicated.

## EMI Payments

**Handy Tips**

The payment processing flow is the same as mentioned [here](/razorpay-docs-md/payment-gateway/s2s-integration/payment-methods.md#emi). However, you need to make the following changes:

- Pass the token number and token expiry values instead of the card number and card expiry values.
- Pass the cryptogram (TAVV) in the `cryptogram_value` field.
- Additionally, provide the actual card's last 4 digits along with tokens for EMI payments.

#### Request Parameters

amount

mandatory

`integer` The payment amount you want to collect from the customer.

currency

mandatory

`string` The 3-character ISO code of the currency. Here, it is `INR`.

order\_id

mandatory

`string` The unique identifier of the order created for this payment. Create an order using the [Orders API](/razorpay-docs-md/api/orders.md).

email

mandatory

`string` The customer's email address.

contact

mandatory

`string` The customer's phone number.

method

mandatory

`string` The payment method. Possible value is `emi`.

emi\_duration

mandatory

`integer` The EMI duration in months.

card

mandatory

`object` The details of the card.

number

mandatory

`string` If payment is made using an actual card, then this field should have the entire actual card number. If card number has spaces, they will be trimmed by Razorpay for further processing. If payment is made using a network token, then this field should have the token number. If token number has spaces, they will be trimmed by Razorpay for further processing.

expiry\_month

mandatory

`string` If payment is made using an actual card, then this field should have the 2-digit expiry month for the card. If payment is made using a network token, then this field should have the 2-digit expiry month for the token.

expiry\_year

mandatory

`string` If payment is made using an actual card, then this field should have the 2 or 4-digit expiry year for the card. If payment is made using a network token, then this field should have the 2 or 4-digit expiry year for the token.

cryptogram\_value \_

conditionally mandatory

`string` The cryptogram value for the token. This will be provided by the entity which provided the token. This field is mandatory if `tokenised=true`.

tokenised

optional

`boolean` Indicates if the payment is made using tokenised card or actual card. Possible values:

- `true`: Pass `true` when you are making the payment using a token.
- `false` (default): Pass `false` when you are making the payment using a card.

token\_provider

optional

`string` The name of the aggregator that provided the token. Possible values:

- `amex`
- `axis_migs`
- `cashfree`
- `ccavenue`
- `cybersource`
- `first_data`
- `fss`
- `hdfc`
- `mpgs`
- `paysecure`
- `paytm`
- `payu`
- `zaakpay`
- `Visa`
- `RuPay`
- `MasterCard`

cvv

mandatory

`string` The card's cvv.

last4

conditionally mandatory

`string` The last four digits of the credit card used to make the EMI payment. This parameter is mandatory if `method=emi` and `tokenised=true`.

notes

optional

`object` Key-value pair that can be used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

#### Response Parameters

razorpay\_payment\_id

`string` Unique identifier of the payment. Present for all responses.

next

`array` A list of action objects available to you to continue the payment process. Present when the payment requires further processing.

action

`string` An indication of the next step available to you to continue the payment process. Possible value:

- `redirect`: Use this URL to redirect the customer to submit the OTP on the bank page.

url

`string` URL to be used for the action indicated.
