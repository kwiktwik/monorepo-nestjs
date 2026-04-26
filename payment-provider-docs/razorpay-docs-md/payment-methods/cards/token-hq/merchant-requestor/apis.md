<!-- Source: https://razorpay.com/docs/payments/payment-methods/cards/token-hq/merchant-requestor/apis -->

According to recent Payment Acquirer (PA)/ Payment Gateway (PG) guidelines from RBI, businesses cannot save their customers' card numbers and other card data on their servers. Razorpay TokenHQ is a RBI-compliant solution that allows you to save customer credentials with card networks and card-issuing banks. You can use Razorpay Optimizer to route payments through the PA/PG of your choice.

## List of APIs

Given below is the list of APIs:

1. [Tokenise cards](/razorpay-docs-md/payment-methods/cards/token-hq/merchant-requestor/apis.md#1-tokenise-cards)

   .
   - [Token Entity](/razorpay-docs-md/payment-methods/cards/token-hq/merchant-requestor/apis.md#token-entity)
   - [Create a token](/razorpay-docs-md/payment-methods/cards/token-hq/merchant-requestor/apis.md#11-create-a-token)
   - [Fetch card properties of an existing token](/razorpay-docs-md/payment-methods/cards/token-hq/merchant-requestor/apis.md#12-fetch-card-properties-of-an-existing-token)
   - [Delete a token](/razorpay-docs-md/payment-methods/cards/token-hq/merchant-requestor/apis.md#13-delete-a-token)
2. [Initiate payment using token saved with Razorpay](/razorpay-docs-md/payment-methods/cards/token-hq/merchant-requestor/apis.md#2-initiate-payment-using-token-saved-with-razorpay)

   .
3. [Initiate Payment on Razorpay with token created on another PA/PG](/razorpay-docs-md/payment-methods/cards/token-hq/merchant-requestor/apis.md#3-initiate-payment-on-razorpay-with-token-created)

   .
4. [Save card to vault token while making a payment on Razorpay](/razorpay-docs-md/payment-methods/cards/token-hq/merchant-requestor/apis.md#4-save-card-to-vault-token-while-making)

   .

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

compliant\_with\_tokenisation\_guidelines

`boolean` Indicates whether the token is compliant with the RBI guidelines. Possible values:

- `true`: The token is compliant with RBI guidelines.
- `false`: The token is not compliant with RBI guidelines.

expired\_at

`string` The expiry timestamp for the token.

status

`string` The overall status for the token. Possible values:

- `initiated`: The token attains this state after Razorpay has received the tokenisation request and is working with token service providers for creating the token.
- `active` - The token attains this state if the token is activated for at least one of the token service providers.
- `suspended` - The token attains this state if:
  - The token is not activated for any one of the token service providers.
  - The token is suspended for at least one of the token service providers.
- `deactivated`- The token attains this state if the token is not active/suspended for any one of the token service providers and is deactivated for at least one token service provider. Know about the complete list of [token states](/razorpay-docs-md/payment-methods/cards/token-hq/merchant-requestor/token-lifecycle.md)  .

status\_reason

`string` When the token reaches the deactivated state, this field will provide the reason for deactivation. Possible values:

- `expired`
- `deactivated_by_bank`

notes

optional

`object` Key-value pair that can be used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

### 1.1 Create a Token

A token is an alias for the actual card number. Use this API to save your customer's card.

As per RBI guidelines, customer consent and AFA (3ds authentication) are mandatory for saving a card.

- This API should be called only after authentication is complete. Authentication can be processed through any payment processor.
- You will receive a token as a response.

**Handy Tips**

For cases where all the card details are identical (duplicate requests), the API will return a new token.

**Watch Out**

This API is only available to businesses that are TRs.

POST

/tokens

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

number

`string` The card number. If the card number has spaces, it will be trimmed by Razorpay for further processing.

cvv

`string` The card CVV.

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
- `zakpay`

provider\_reference\_id

`string` The unique payment identifier of the payment used to collect AFA on any PA/PG.

authentication\_reference\_number

conditional

`string` A unique reference number generated when authentication is initiated. The maximum length supported is 26 characters. This field is mandatory for RuPay cards only after June 30, 2022.

**Watch Out!**

For tokenising RuPay cards, you will need to provide the authRefNo provided by NPCI during the payment where AFA was collected from card\_holder for tokenising the card. The validity of authRefNo is up to a few minutes.

#### Error Codes

Given below is a list of sample error codes:

**Scenario 1: When any mandatory field is empty**

- Code: BAD\_REQUEST\_ERROR
- Description: The `<field name>` is required
- Source: internal
- Step: token\_initiation
- Reason: input\_validation\_failed
- Field: number

**Scenario 2: When cvv provided is invalid**

- Code: BAD\_REQUEST\_ERROR
- Description: The cvv must be between 3 and 4 digits
- Source: business
- Step: payment\_initiation
- Reason: input\_validation\_failed
- Field: cvv

**Scenario 3: When the connection with token service provider times out**

- Code: TOKEN\_SERVICE\_PROVIDER\_TIMEOUT
- Description: There is an issue in connecting with the token service provider
- Source: service\_provider
- Step: token\_creation
- Reason: token\_service\_provider\_timed\_out

### 1.2 Fetch Card Properties of an Existing Token

Use this API to retrieve card details such as network, issuer and so on for a given token.

POST

/tokens/fetch

#### Path Parameter

id

mandatory

`string` The unique identifier of the token.

### 1.3 Delete a Token

Use the following API to delete a token already saved with Razorpay.

POST

/tokens/delete

#### Request Parameter

id

mandatory

`string` The unique identifier of the token to be deleted.

## 2. Initiate Payment using Token saved with Razorpay

Use this API to make the payment when a customer initiates a subsequent payment using the saved card. Pass the token ID from the previous API request to initiate a payment using the token.

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

mandatory

`string` The card's cvv.

**Handy Tips**

- CVV is not required by default for tokenised cards across all networks.
- CVV is optional for tokenised card payments. Do not pass dummy CVV values.
- To implement this change, skip passing the `cvv` parameter entirely, or pass a `null` or empty value in the CVV field.
- We recommend removing the CVV field from your checkout UI/UX for tokenised cards.
- If CVV is still collected for tokenised cards and the customer enters a CVV, pass the entered CVV value to Razorpay.

notes

optional

`object` Key-value pair that can be used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

## 3. Initiate Payment on Razorpay with Token Created on another PA/PG

Use this API to create a payment with token saved on another PA/PG.

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

cryptogram\_value

mandatory

`string` The cryptogram value for the token. This will be provided by the entity which provided the token. This field is mandatory if `tokenised_card=true`.

tokenised

mandatory

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
- `zakpay`

cvv

mandatory

`string` The card's cvv.

**Handy Tips**

- CVV is not required by default for tokenised cards across all networks.
- CVV is optional for tokenised card payments. Do not pass dummy CVV values.
- To implement this change, skip passing the `cvv` parameter entirely, or pass a `null` or empty value in the CVV field.
- We recommend removing the CVV field from your checkout UI/UX for tokenised cards.
- If CVV is still collected for tokenised cards and the customer enters a CVV, pass the entered CVV value to Razorpay.

notes

optional

`object` Key-value pair that can be used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

## 4. Save Card to Vault Token While Making a Payment on Razorpay

If you are using Razorpay to process the first payment from a new card, do not call the tokenisation API. Instead, initiate the existing Razorpay Payment API, with an additional parameter `save=true`. This avoids two API requests and processes payments faster.

Use the following API to save card details while making a payment:

POST

/payments/create/json

Redirect the customer to the URL given in the response to complete the authentication.

#### Fetch a Payment API for Token Information

The token will be created only if the cardholder successfully completes 3ds authentication.

Use the Fetch Payment API to fetch the token.

GET

/payments/{pay\_id}

#### Path Parameter

id

mandatory

`string` The unique identifier of the payment.
