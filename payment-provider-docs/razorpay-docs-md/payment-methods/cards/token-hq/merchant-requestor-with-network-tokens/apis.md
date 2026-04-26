<!-- Source: https://razorpay.com/docs/payments/payment-methods/cards/token-hq/merchant-requestor-with-network-tokens/apis -->

According to recent Payment Acquirer (PA)/ Payment Gateway (PG) guidelines from RBI, businesses cannot save their customers' card numbers and other card data on their servers. Razorpay TokenHQ is a RBI-compliant solution that allows you to save customer credentials with card networks and card-issuing banks. You can use Razorpay Optimizer to route payments through the PA/PG of your choice.

## List of APIs

Given below is the list of APIs:

1. [Tokenise cards](/razorpay-docs-md/payment-methods/cards/token-hq/merchant-requestor-with-network-tokens/apis.md#1-tokenise-cards)

   .
   - [Token Entity](/razorpay-docs-md/payment-methods/cards/token-hq/merchant-requestor-with-network-tokens/apis.md#token-entity)
   - [Create a token](/razorpay-docs-md/payment-methods/cards/token-hq/merchant-requestor-with-network-tokens/apis.md#11-create-a-token)
   - [Fetch card properties of an existing token](/razorpay-docs-md/payment-methods/cards/token-hq/merchant-requestor-with-network-tokens/apis.md#12-fetch-card-properties-of-an-existing-token)
   - [Delete a token](/razorpay-docs-md/payment-methods/cards/token-hq/merchant-requestor-with-network-tokens/apis.md#13-delete-a-token)
2. [Initiate payment using token saved with Razorpay](/razorpay-docs-md/payment-methods/cards/token-hq/merchant-requestor-with-network-tokens/apis.md#2-initiate-payment-using-token-saved-with-razorpay)

   .
3. [Process a payment on another PA/PG with token created on Razorpay](/razorpay-docs-md/payment-methods/cards/token-hq/merchant-requestor-with-network-tokens/apis.md#3-process-a-payment-on-another-pa-pg)

   .
4. [Initiate Payment on Razorpay with token created on another PA/PG](/razorpay-docs-md/payment-methods/cards/token-hq/merchant-requestor-with-network-tokens/apis.md#4-initiate-payment-on-razorpay-with-token-created)

   .
5. [Save card to vault token while making a payment on Razorpay](/razorpay-docs-md/payment-methods/cards/token-hq/merchant-requestor-with-network-tokens/apis.md#5-save-card-to-vault-token-while-making)

   .

## 1. Tokenise Cards

You can save customer card details in the form of tokens and then use these tokens to accept payments from customers.

### Token Entity

Given below is a sample entity.

Entity Parameters

id

`string` The unique identifier of the Razorpay token.

entity

`string` The name of the entity. Here, it is `token`.

customer\_id

`string` This is the Razorpay customer id. You can create token for a specific customer using their customer id. Use the [Customers API](/razorpay-docs-md/api/customers.md) to create customer id. This is an optional parameter.

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
- `MasterCard`
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

token\_requestor\_id

`string` The tr\_merchant\_id provided by HDFC. (Displayed only for Diners tokens).

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

- `active`: The token attains this state if the token is activated for at least one of the token service providers.
- `suspended`: The token attains this state if:
  - The token is not activated for any one of the token service providers.
  - The token is suspended for at least one of the token service providers.
- `deactivated`: The token attains this state if the token is not `active`/`suspended` for any one of the token service providers and is deactivated for at least one token service provider.
   Know about the complete list of [token states](/razorpay-docs-md/payment-methods/cards/token-hq/merchant-requestor-with-network-tokens/token-lifecycle.md)  .

status\_reason

`string` When the token reaches the `deactivated` state, this field will provide the reason for deactivation. Possible values:

- `expired`
- `deactivated_by_bank`

notes

`object` Key-value pair that can be used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

### 1.1 Create a Token

A token is an alias for the actual card number. Use this API to save your customer's card.

As per RBI guidelines, customer consent and AFA (3ds authentication) are mandatory for saving a card.

- This API should be called only after authentication is complete. Authentication can be processed through any payment processor.
- You will receive a token as a response.

**Handy Tips**

If multiple tokenisation requests have been raised for the same card using this API, then for:

- MasterCard and RuPay Cards: Different tokens will be created for each request.
- Visa Cards: If a token has already been created, the API will return the same token for subsequent requests.
  This is in sync with the Network Tokenisation API.

**Watch Out**

This API is only available to businesses that are TRs and not available for Rupay payments.

POST

/tokens

Request Parameters

customer\_id

optional

`string` The unique identifier of the customer created using [Customers API](/razorpay-docs-md/api/customers.md).

method

mandatory

`string` The type of object that needs to be tokenised. Currently, `card` is the only supported value.

card

mandatory

`object` The card details.

number

`string` The card number. If the card number has spaces, it will be trimmed by Razorpay for further processing.

cvv

`string` The card's CVV number.

**Handy Tips**

- CVV is not required by default for tokenised cards across all networks.
- CVV is optional for tokenised card payments. Do not pass dummy CVV values.
- To implement this change, skip passing the `cvv` parameter entirely, or pass a `null` or empty value in the CVV field.
- We recommend removing the CVV field from your checkout UI/UX for tokenised cards.
- If CVV is still collected for tokenised cards and the customer enters a CVV, pass the entered CVV value to Razorpay.

expiry\_month

`string` The card expiry month in `mm` format.

expiry\_year

`string` The card expiry year in `yy` or `yyyy` format.

name

`string` The cardholder's name.

authentication

mandatory

`object` Token authentication details.

provider

`string` The platform through which authentication was processed. Possible values:

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

provider\_reference\_id

`string` The unique payment identifier of the payment used to collect AFA on any PA/PG.

authentication\_reference\_number

conditional

`string` A unique reference number generated for Amex and RuPay payments when the cardholder consents to tokenisation and AFA is successfully completed. This value must be obtained from the payment processor/gateway that handled the authentication and passed to Razorpay during token creation. It is mandatory for all Amex token creation requests. For RuPay, it is required only when generated and provided by the gateway.

**Watch Out!**

To tokenise RuPay and Amex cards, the following information is required:

- **authRefNo**: Provided by NPCI for RuPay transactions.
- **AeVV**: Provided by Amex during payments where AFA was collected from the cardholder for tokenisation.
  These values must be shared by the payment processor handling the transaction. For RuPay, this is required only if generated by the gateway. For Amex, it is mandatory for all payments.

### Error Codes

Given below is a list of sample error codes:

Scenario 1: When any mandatory field is empty

- Code: BAD\_REQUEST\_ERROR
- Description: The `<field name>` is required
- Source: internal
- Step: token\_initiation
- Reason: input\_validation\_failed

Scenario 2: When the field name is invalid

- Code: BAD\_REQUEST\_ERROR
- Description: The `<field name>` is invalid
- Source: internal
- Step: token\_initiation
- Reason: input\_validation\_failed

Scenario 3: When the connection with token service provider times out

- Code: TOKEN\_SERVICE\_PROVIDER\_TIMEOUT
- Description: There is an issue in connecting with the token service provider
- Source: service\_provider
- Step: token\_creation
- Reason: token\_service\_provider\_timed\_out

### 1.2 Fetch Card Properties of an Existing Token

Use this API to retrieve card details such as network, issuer and so on for a given token.

POST

/tokens/fetch

CurlJavaGoPHPNode.jsResponse - Visa, MasterCard & RuPayResponse - Diners

copy

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET]
-X POST https://api.razorpay.com/v1/tokens/fetch
-H "content-type: application/json"
-d'{
  "id": "token_4lsdksD31GaZ09"
}'
```

Request Parameters

id

mandatory

`string` The unique identifier of the token.

### 1.3 Delete a Token

Use the following API to delete a token already saved with Razorpay.

POST

/tokens/delete

Request Parameter

id

mandatory

`string` The unique identifier of the token to be deleted.

## 2. Initiate Payment using Token saved with Razorpay

Use this API to make the payment when a customer initiates a subsequent payment using the saved card. Pass the token ID from the previous API request to initiate a payment using the token.

POST

/payments/create/json

Request Parameters

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

`string` The card's CVV number.

notes

optional

`object` Key-value pair that can be used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

**Handy Tips**

Know more about the [S2S Integration payment flow](/razorpay-docs-md/payment-gateway/s2s-integration/json/v2.md).

## 3. Process a Payment on another PA/PG with Token Created on Razorpay

To process a payment on the tokenised card on another PA/PG, you will need the token and relevant additional data for each token. You can pass the service provider token id or the token id.

- The data required may vary for different networks.
- Use the API given below to obtain the token and the relevant data.
- You can pass this data to any PA/PG to process the payment.

POST

/tokens/service\_provider\_tokens/token\_transactional\_data

**Watch Out!**

**This endpoint is decommissioned for Diners cards**.

To use a Razorpay-created Diners token on a different Payment Aggregator (PA) or Payment Gateway (PG), switch to the `/tokens/fetch` API. Use the response from `/tokens/fetch` to retrieve the necessary `requestor_id` and `reference_number`.

Request Parameters

id

`string` The unique identifier of the service provider token whose details are to be fetched. Pass either this id or the `token_id`.

token\_id

`string` The unique identifier of the token. Pass either this id or the `spt_id`.

Response Parameters

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

## 4. Initiate Payment on Razorpay with Token Created on another PA/PG

Use this API to create a payment with token saved on another PA/PG.

POST

/payments/create/json

Request Parameters

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

cryptogram\_value

mandatory

`string` The cryptogram value for the token. This will be provided by the entity which provided the token. This field is mandatory if `tokenised=true` only for Visa, Mastercard and Rupay. Do not pass this for Amex and Diners cards.

tokenised

optional

`boolean` Indicates if the payment is made using tokenised card or actual card. Possible values:

- `true`: Pass `true` when you are making the payment using a token.
- `false` (default): Pass `false` when you are making the payment using a card.

token\_provider

mandatory

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

last4

mandatory

`string` The last four digits of the original card number.

provider\_type

optional

`string` The type of provider through which the token was created. Possible values:

- `network`
- `issuer`

service\_provider\_token\_data

mandatory for diners

`object` Token service provider data created by the network/issuer.

requestor\_id

`string` The `tr_merchant_id` provided by HDFC.

reference\_number

`string` The token reference number provided by HDFC.

cvv

`string` The card's CVV number. For Amex tokenised cards, this will be a dynamic CVV provided by Amex for every payment on the tokenised card. Dynamic CVV is valid for about 20 minutes.

**Handy Tips**

- CVV is not required by default for tokenised cards across all networks.
- CVV is optional for tokenised card payments. Do not pass dummy CVV values.
- To implement this change, skip passing the `cvv` parameter entirely, or pass a `null` or empty value in the CVV field.
- We recommend removing the CVV field from your checkout UI/UX for tokenised cards.
- If CVV is still collected for tokenised cards and the customer enters a CVV, pass the entered CVV value to Razorpay.

notes

optional

`object` Key-value pair that can be used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

**Handy Tips**

Know more about the [S2S Integration payment flow](/razorpay-docs-md/payment-gateway/s2s-integration/json/v2.md).

## 5. Save Card to Vault Token While Making a Payment on Razorpay

If you are using Razorpay to process the first payment from a new card, do not call the tokenisation API. Instead, initiate the existing Razorpay Payment API, with an additional parameter `save=true`. This avoids two API requests and processes payments faster.

Use the following API to save card details while making a payment:

POST

/payments/create/json

Redirect the customer to the URL given in the response to complete the authentication.

### Fetch a Payment API for Token Information

The token will be created only if the cardholder successfully completes 3ds authentication.

Use the Fetch Payment API to fetch the token.

GET

/payments/{pay\_id}

Path Parameter

id

mandatory

`string` The unique identifier of the payment.
