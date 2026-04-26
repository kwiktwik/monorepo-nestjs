<!-- Source: https://razorpay.com/docs/payments/payment-methods/cards/token-hq/dual-token -->

TokenHQ, a complete RBI-compliant solution from Razorpay, enables you to save customer credentials as tokens with card networks and card-issuing banks.
Razorpay provides a Dual Token process which works with networks and issuing banks both to create network and issuer tokens with a single Token Create request.

Tokenisation is the process by which the original card number/Primary Account Number (PAN) is replaced with a surrogate value called a `token`.

## Razorpay Dual Token

When a customer tries to save a card on your platform, our Dual Token feature communicates with networks and issuers to generate one network and one issuer token against the card respectively. To the customer saving their card, this process is invisible, and they view a single saved instance of their card on your checkout page. When the customer tries attempting the payment via saved card, the payment is processed via issuer/network token depending on your preference or best possible success rate.

**Handy Tips**

Dual Tokenisation is currently only available for Axis-issued cards, and is a work in progress for HDFC, ICICI and other Banks.

## List of APIs

Given below is the list of APIs:

1. [Tokenise Cards](/razorpay-docs-md/payment-methods/cards/token-hq/dual-token.md#1-tokenise-cards)

   - [Token Entity](/razorpay-docs-md/payment-methods/cards/token-hq/dual-token.md#token-entity)
   - [Create a Token](/razorpay-docs-md/payment-methods/cards/token-hq/dual-token.md#11-create-a-token)
   - [Delete a Token](/razorpay-docs-md/payment-methods/cards/token-hq/dual-token.md#12-delete-a-token)
2. [Initiate a Tokenised Payment](/razorpay-docs-md/payment-methods/cards/token-hq/dual-token.md#2-initiate-a-tokenised-payments)

   - [Initiate Payment Using the Dual Token](/razorpay-docs-md/payment-methods/cards/token-hq/dual-token.md#21-initiate-payment-using-the-dual-token)
   - [Initiate Payment Using Only the Network Token](/razorpay-docs-md/payment-methods/cards/token-hq/dual-token.md#22-initiate-payment-using-only-the-network-token)

## 1. Tokenise Cards

You can save customer card details in the form of tokens and then use these tokens to accept payments from customers.

#### Token Entity

Given below is a sample entity.

id

`string` The unique identifier of the Razorpay token.

entity

`string` The name of the entity. Here, it is `token`.

customer\_id

`string` This is the Razorpay customer id. You can create a token for a specific customer using their customer id. Use the [Customers API](/razorpay-docs-md/customers.md) to create a customer id. This is an optional parameter.

method

`string` The type of object that was tokenised. Currently, it only supports `card`.

card

`object` The customer card details.

compliant\_with\_tokenisation\_guidelines

`boolean` Indicates whether the token is compliant with the RBI guidelines. Possible values:

- `true`: The token is compliant with RBI guidelines.
- `false`: The token is not compliant with RBI guidelines.

service\_provider\_tokens

`array` Every Razorpay token will have one or more token service providers (card networks, issuing banks or Razorpay). For each service provider, Razorpay will return a service provider token. This service provider token is the raw token returned by the token service provider (card network or issuer).

**Handy Tips**

The `service_provider_tokens` object is an on-demand feature, made available only to PCI DSS-compliant businesses.

expired\_at

`string` The expiry timestamp for the token.

status

`string` The overall status for the token. Possible values:

- `active` : The token attains this state if it is activated for at least one of the token service providers.
- `suspended` : The token attains this state if:
  - The token is not activated for any one of the token service providers.
  - The token is suspended for at least one of the token service providers.
- `deactivated` : The token attains this state if the token is not active/suspended for any one of the token service providers and is deactivated for at least one token service provider. Know about the complete list of [token states](/razorpay-docs-md/payment-methods/cards/token-hq/merchant-requestor/token-lifecycle.md)  .

status\_reason

`string` When the token reaches the deactivated state, this field will provide the reason for deactivation. Possible values:

- `expired`
- `deactivated_by_bank`

notes

`object` Key-value pair that can be used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

### 1.1 Create a Token

A token is an alias for the actual card number. Use this API to save your customer's card.

1. When a merchant requests for token creation (with or without payment), the token id is created by Razorpay.
2. For those token id created, there are two calls made:
   - to the network for a network token.
   - to the issuer for an issuer token.
3. For both, these tokens (service provider) are mapped to the same token reference number is displayed to the business.

POST

/tokens

CurlJavaGoPHPNode.js

copy

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET]
-X POST https://api.razorpay.com/v1/tokens
-H "content-type: application/json"
-d'{
  "customer_id": "cust_1Aa00000000001",
  "method": "card",
  "card": {
    "number": "4386289407660153",
    "cvv": "",
    "expiry_month": "12",
    "expiry_year": "30",
    "name": "Gaurav Kumar"
  },
  "authentication": {
    "provider": "razorpay",
    "provider_reference_id": "pay_123wkejnsakd",
    "authentication_reference_number": "100222021120200000000742753928"   
  }
}'
```

#### Request Parameters

customer\_id

optional

`string` The unique identifier of the customer created using [Customers API](/razorpay-docs-md/customers.md).

method

mandatory

`string` The type of object that needs to be tokenised. Currently, `card` is the only supported value.

card

mandatory

`object` The card details.

name

`string` The cardholder's name.

number

`string` The card number.

expiry\_month

`string` The expiry month of the card in `mm` format.

expiry\_year

`string` The expiry year of the card in `yy` format.

cvv

mandatory

`string` The card's CVV.

**Handy Tips**

- CVV is not required by default for tokenised cards across all networks.
- CVV is optional for tokenised card payments. Do not pass dummy CVV values.
- To implement this change, skip passing the `cvv` parameter entirely, or pass a `null` or empty value in the CVV field.
- We recommend removing the CVV field from your checkout UI/UX for tokenised cards.
- If CVV is still collected for tokenised cards and the customer enters a CVV, pass the entered CVV value to Razorpay.

authentication

`object` Token authentication details.

provider

`string` The platform through which authentication was processed.

provider\_reference\_id

`string` The unique payment identifier of the payment used to collect AFA on any PA/PG.

authentication\_reference\_number

`string` A unique reference number generated when authentication is initiated. The maximum length supported is 26 characters.

#### Response Parameters

Descriptions for the response parameters are present in the [Token Entity parameters table](/razorpay-docs-md/payment-methods/cards/token-hq/dual-token.md#token-entity).

### 1.2 Delete a Token

Use the following API to delete a token already saved with Razorpay.

POST

/tokens/delete

#### Request Parameters

id

mandatory

`string` The unique identifier of the token to be deleted.

**Watch Out!**

Deleting a token will apply at a global level. That is, once you delete a token, you cannot use that token under any of the MIDs.

## 2. Initiate a Tokenised Payment

### 2.1 Initiate Payment Using the Dual Token

Use this API to use either issuer or network token.

Razorpay processes the payment using either the issuer or network token based on the one that gives the best success rate.

**Handy Tips**

- Payment in this case will be routed via issuer or network token depending on the better success rate.
- Issuer tokens are not interoperable.
  For example, ABD Corp cannot request Razorpay to process an issuer token created by Juspay.

#### Request Parameters

amount

mandatory

`integer` Payment amount in the smallest currency sub-unit. For example, if the amount to be charged is ₹299, then pass `29900` in this field.

currency

mandatory

`string` Currency code for the currency in which you want to accept the payment. For example, INR. Refer to the list of supported currencies. Length must be of 3 characters.

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

cvv

`string` CVV printed on the back of card.

**Handy Tips**

- CVV is not required by default for tokenised cards across all networks.
- CVV is optional for tokenised card payments. Do not pass dummy CVV values.
- To implement this change, skip passing the `cvv` parameter entirely, or pass a `null` or empty value in the CVV field.
- We recommend removing the CVV field from your checkout UI/UX for tokenised cards.
- If CVV is still collected for tokenised cards and the customer enters a CVV, pass the entered CVV value to Razorpay.

ip

mandatory

`string` The customer's IP address.

user-agent

mandatory

`string` The User-Agent header of the user's browser. Default value will be passed by Razorpay if not provided by merchant.

description

optional

`string` A brief description of the Customer Identifier.

notes

`object` Key-value pair that can be used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

#### Response Parameters

Descriptions for the response parameters are present in the [Token Entity parameters table](/razorpay-docs-md/payment-methods/cards/token-hq/dual-token.md#token-entity).

### 2.2 Initiate Payment Using Only the Network Token

Use the following API for initiating a payment using the network token.

**Watch Out!**

1. Fetching the cryptogram value precedes the below request.
2. Make the fetch cryptogram request with your token service provider and then call the below API.

#### Request Parameters

amount

mandatory

`integer` Payment amount in the smallest currency sub-unit. For example, if the amount to be charged is ₹299, then pass `29900` in this field.

currency

mandatory

`string` Currency code for the currency in which you want to accept the payment. For example, INR. Refer to the list of supported currencies. Length must be of 3 characters.

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

mandatory

`string` Unformatted card number. Required if the method is `card`.

name

mandatory

`string` Name of the cardholder. Required if the method is `card`

expiry\_month

mandatory

`integer` Expiry month for card in `MM` format. Required if the method is `card`.

expiry\_year

mandatory

`string` Expiry year for card in `YY` format. Required if the method is `card`.

cvv

mandatory

`string` CVV printed on the back of card.

**Handy Tips**

- CVV is not required by default for tokenised cards across all networks.
- CVV is optional for tokenised card payments. Do not pass dummy CVV values.
- To implement this change, skip passing the `cvv` parameter entirely, or pass a `null` or empty value in the CVV field.
- We recommend removing the CVV field from your checkout UI/UX for tokenised cards.
- If CVV is still collected for tokenised cards and the customer enters a CVV, pass the entered CVV value to Razorpay.

cryptogram\_value

mandatory

`string` The cryptogram value for the token.

tokenised

mandatory

`boolean` Indicates if the payment is made using tokenised card or actual card. Possible values:

- `true`: Pass `true` when you are making the payment using a token.
- `false` (default): Pass `false` when you are making the payment using a card.

token\_provider

mandatory

`string` The name of the aggregator that provided the token.

ip

mandatory

`string` The customer's IP address.

user-agent

mandatory

`string` The User-Agent header of the user's browser. Default value will be passed by Razorpay if not provided by merchant.

description

optional

`string` A brief description of the Customer Identifier.

notes

`object` Key-value pair that can be used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

#### Response Parameters

Descriptions for the response parameters are present in the [Token Entity parameters table](/razorpay-docs-md/payment-methods/cards/token-hq/dual-token.md#token-entity).
