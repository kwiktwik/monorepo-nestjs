<!-- Source: https://razorpay.com/docs/payments/payment-methods/cards/token-hq/razorpay-requestor-with-network-tokens/apis -->

According to recent Payment Acquirer (PA)/ Payment Gateway (PG) guidelines from RBI, businesses cannot save their customers' card numbers and other card data on their servers. Razorpay TokenHQ is a RBI-compliant solution that allows you to save customer credentials with card networks and card-issuing banks. You can use Razorpay Optimizer to route payments through the PA/PG of your choice.

## List of APIs

Given below is the list of APIs:

1. Token APIs
   - [Token Entity](/razorpay-docs-md/payment-methods/cards/token-hq/razorpay-requestor-with-network-tokens/apis.md#token-entity)
   - [Fetch card properties of an existing token](/razorpay-docs-md/payment-methods/cards/token-hq/razorpay-requestor-with-network-tokens/apis.md#11-fetch-card-properties-of-an-existing-token)
   - [Delete a token](/razorpay-docs-md/payment-methods/cards/token-hq/razorpay-requestor-with-network-tokens/apis.md#12-delete-a-token)
2. [Save card request along with payment](/razorpay-docs-md/payment-methods/cards/token-hq/razorpay-requestor-with-network-tokens/apis.md#2-save-card-request-along-with-payment)
3. [Initiate a payment using a previously created token](/razorpay-docs-md/payment-methods/cards/token-hq/razorpay-requestor-with-network-tokens/apis.md#3-initiate-payment-using-saved-token)
4. [Process a Payment on another PA/PG with Token Created on Razorpay](/razorpay-docs-md/payment-methods/cards/token-hq/razorpay-requestor-with-network-tokens/apis.md#4-process-a-payment-on-another-pa-pg)

## 1. Tokenise Cards

You can save customer card details in the form of tokens and then use these tokens to accept payments from customers.

### Token Entity

Given on the right is a sample entity.

id

`string` The unique identifier of the Razorpay token.

entity

`string` The name of the entity. Here, it is `token`.

customer\_id

`string` This is the Razorpay customer id. You can create token for a specific customer using their customer id. Use the [Customers API](/razorpay-docs-md/customers.md) to create customer id. This is an optional parameter.

method

`string` The type of object that was tokenised. Currently, it only supports `card`.

card

`object` The customer card details.

last4

`string` The last 4 digits of the tokenised card.

network

`string` The card network. Possible values:

- `Visa`
- `RuPay`
- MasterCard`
- `American Express`
- `Diners Club`
- `Maestro`
- `JCB`
- `Union Pay`

issuer

`string` The 4-character issuer code unique to each issuing bank in India. For example, `HDFC`, `SBIN` and so on.

type

`string` The type of card. Possible values:

- `credit`
- `debit`
- `prepaid`

international

`boolean` Indicates whether the card is international (issued outside India) or domestic. Possible values:

- `true`: The card is international.
- `false`: The card is domestic.

emi

`boolean` Indicates whether the card is eligible for EMI payments or not. Possible values:

- `true`: The card is eligible for EMI payments.
- `false`: The card is not eligible for EMI payments.

sub\_type

`string` The card sub\_type for the given IIN. Pricing of card payment may change on the basis of card type. Possible values:

- `consumer`
- `business`
- `unknown`

token\_iin

`string` The token IIN provided by the card network. When a token is created with card networks such as Visa or MasterCard, this field will have the token IIN. This will be useful to fetch all the token properties so that you can apply your existing IIN validations and processing. This field will be absent when the token is created by a token service provider other than the card network.

compliant\_with\_tokenisation\_guidelines

`boolean` Indicates whether the token is compliant with the RBI guidelines. Possible values:

- `true`: The token is compliant with RBI guidelines.
- `false`: The token is not compliant with RBI guidelines.

service\_provider\_tokens

`array` Every Razorpay token will have one or more token service providers(card networks, issuing banks or Razorpay). For each service provider, Razorpay will return a service provider token. This service provider token is the raw token returned by the token service provider (card network or issuer). Currently, we will have only card networks as token service providers. In future, a token may be created with more than one service provider. A token can be created with one or more of the following service providers:

**Handy Tips**

The `service_provider_tokens` object is an on-demand feature, made available only to PCI DSS compliant businesses.

id

`string` The unique identifier of the token.

entity

`string` The name of the entity. Here, it is `service_provider_token`.

provider\_type

`string` The type of provider through which the token was created. Possible values:

- `network`
- `issuer`
- `aggregator` (When the token provider is Razorpay.)

provider\_name

`string` The name of the provider through which the token was created. Possible values:

- `Visa`
- `MasterCard`
- `HDFC`
- `razorpay`

interoperable

`boolean` This field suggests if the token provided is interoperable across different acquirers. Possible values:

- `true`: The token is interoperable.
- `false`: The token is not interoperable.

status

`string` The current status for the token as provided by the token service provider. Possible values:

- `active`
- `suspended`
- `deactivated`
- `failed`

   Know about the complete list of [token states](/razorpay-docs-md/payment-methods/cards/token-hq/merchant-requestor-with-network-tokens/token-lifecycle.md)  .

status\_reason

`string` When the token status is deactivated, this field will provide the reason for deactivation. Possible values:

- `expired`
- `deactivated_by_bank`

provider\_data

`object` Service provider data.

token\_reference\_number

`string` The token reference number provider by the token provider.

payment\_account\_reference

`string` The unique card identifier provided by the token provider. If the `service_provider` is `network`, this identifier will be consistent for a given card across the card network ecosystem.

token\_iin

`string` The IIN of the token thus created. The IIN will be helpful to fetch all the properties of the token and apply your existing IIN validations and processes.

token\_expiry\_month

`string` The expiry date for the token. The format used is `mm`.

token\_expiry\_year

`string` The expiry year for the token. The format used is `yyyy`.

error

`object` Details of error.

code

`string` Type of the error.

description

`string` Description of the error.

field

`string` Name of the parameter that caused the error.

source

`string` The point of failure in token creation.

step

`string` The stage where the failure occurred.

reason

`string` The exact error reason.

metadata

`object` Contains additional information about the request.

expired\_at

`string` The expiry timestamp for the token.

status

`string` The overall status for the token. Possible values:

- `initiated`: The token attains this state after Razorpay has received the tokenisation request and is working with token service providers for creating the token.
- `active`: The token attains this state if the token is activated for at least one of the token service providers.
- `suspended`: The token attains this state if:
  - The token is not activated for any one of the token service providers.
  - The token is suspended for at least one of the token service providers.
- `deactivated`: The token attains this state if the token is not `active`/`suspended` for any one of the token service providers and is deactivated for at least one token service provider.
  Know about the complete list of [token states](/razorpay-docs-md/payment-methods/cards/token-hq/merchant-requestor-with-network-tokens/token-lifecycle.md#overall-token-states)  .

status\_reason

`string` When the token reaches the `deactivated` state, this field will provide the reason for deactivation. Possible values:

- `expired`
- `deactivated_by_bank`

notes

optional

`object` Key-value pair that can be used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

### 1.1 Fetch Card Properties of an Existing Token

Use this API to retrieve card details such as network, issuer and so on for a given token.

POST

/tokens/fetch

#### Path Parameter

id

mandatory

`string` The unique identifier of the token.

### 1.2 Delete a Token

Use the following API to delete a token already saved with Razorpay.

POST

/tokens/delete

#### Request Parameter

id

mandatory

`string` The unique identifier of the token to be deleted.

## 2. Save Card Request along with Payment

**Handy Tips**

This API is available for testing.

You can create the token when your customer opts to save their card on your checkout during the first payment. As per RBI guidelines, you must collect customer consent to save their card.

- Use the following API to save the customer card details and create a token.
- Pass an additional field `save=true` to save and tokenise the card.
- Use Razorpay Optimizer to route this payment to a PA/PG of your preference.

POST

/payments/create/json

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

customer\_id

optional

`string` Unique identifier of customer.

email

mandatory

`string` The customer's email address.

contact

mandatory

`string` The customer's phone number.

method

mandatory

`string` The payment method. Here, it is `card`.

card

mandatory

`object` The details of the card.

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

`string` The card's cvv.

save

mandatory

`boolean` Pass this parameter to save the card details. Possible values:

- `true`: Saves the card details.
- `false`: Does not save the card details.

notes

optional

`object` Key-value pair that can be used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters each. For example, `"note_key": "Beam me up Scotty”`.

Redirect the customer to the above URL to complete the authentication.

#### Fetch the Token Information

The token is created only if the cardholder successfully completes 3DS authentication.

Use the Fetch Payment API to fetch the token.

GET

/payments/`\{id\}`?expand[]=token

## 3. Initiate Payment using Saved Token

When a customer initiates a subsequent payment using the saved card, use this API to make the payment.

- Pass the token ID from the previous API request to initiate a payment using the token.
- Use Razorpay Optimizer to route this payment to a PA/PG of your preference.

POST

/payments/create/json

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

`string` The payment method. Here, it is `card`.

token

mandatory

`string` The unique identifier of the token.

card

mandatory

`object` The details of the card.

cvv

optional

`string` The card's cvv.

notes

optional

`object` Key-value pair that can be used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

**Handy Tips**

Know more about the [S2S Integration payment flow](/razorpay-docs-md/payment-gateway/s2s-integration/json/v2.md).

## 4. Process a Payment on another PA/PG with Token Created on Razorpay

To process a payment on the tokenised card on another PA/PG, you will need the token and relevant additional data for each token.

- The data required may vary for different networks.
- Use the API given below to obtain the token and the relevant data.
- You can pass this data to any PA/PG to process the payment.

POST

/tokens/service\_provider\_tokens/token\_transactional\_data

#### Request Parameters

id

mandatory

`string` The unique identifier of the token.

#### Response Parameters

token\_number

`string` The unique reference number generated for the token. For example, `4016981500100002`.

cryptogram\_value

`string` The token cryptogram value.

token\_expiry\_month

`integer` The token expiry month in `mm` format.

token\_expiry\_year

`integer` The token expiry year in `yyyy` format.

cvv

amex only

`integer` A dynamic 4-digit number printed on the front of the `Amex` card. This cvv should be passed in the CVV field to your PA/PG for processing the payment.
