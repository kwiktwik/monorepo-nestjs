<!-- Source: https://razorpay.com/docs/payments/payment-methods/cards/token-hq/razorpay-requestor/apis -->

According to recent Payment Acquirer (PA)/ Payment Gateway (PG) guidelines from RBI, businesses cannot save their customers' card numbers and other card data on their servers. Razorpay TokenHQ is a RBI-compliant solution that allows you to save customer credentials with card networks and card-issuing banks. You can use Razorpay Optimizer to route payments through the PA/PG of your choice.

## List of APIs

Given below is the list of APIs:

1. [Token APIs](/razorpay-docs-md/payment-methods/cards/token-hq/razorpay-requestor/apis.md#1-token-apis)

   .
   - [Token Entity](/razorpay-docs-md/payment-methods/cards/token-hq/razorpay-requestor/apis.md#token-entity)
   - [Fetch card properties of an existing token](/razorpay-docs-md/payment-methods/cards/token-hq/razorpay-requestor/apis.md#11-fetch-card-properties-of-an-existing-token)
   - [Delete a token](/razorpay-docs-md/payment-methods/cards/token-hq/razorpay-requestor/apis.md#12-delete-a-token)
2. [Save card request along with payment](/razorpay-docs-md/payment-methods/cards/token-hq/razorpay-requestor/apis.md#2-save-card-request-along-with-payment)

   .
3. [Initiate a payment using a previously created token](/razorpay-docs-md/payment-methods/cards/token-hq/razorpay-requestor/apis.md#3-initiate-payment-using-saved-token)

   .

## 1. Token APIs

Customer card details are saved in the form of tokens. These tokens are used to accept payments from customers.

### Token Entity

Given below is a sample entity.

id

`string` The unique identifier of the Razorpay token.

entity

`string` The name of the entity. Here, it is `token`.

customer\_id

`string` This is the Razorpay customer id. You can create token for a specific customer using their customer id. Use the [Customers API](/razorpay-docs-md/api/customers.md) to create customer id.

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
- `Diners Club` (Only available for private limited and registered businesses)
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

`string` The unique token IIN.

compliant\_with\_tokenisation\_guidelines

`boolean` Indicates whether the token is compliant with the RBI guidelines. Possible values:

- `true`: The token is compliant with RBI guidelines.
- `false`: The token is not compliant with RBI guidelines.

expired\_at

`string` The expiry timestamp for the token.

status

`string` The overall status for the token. Possible values:

- `activated`: This status is attained if the token is activated for at least one of the token service providers.
- `suspended`: This status is attained if:
  - The token is not activated for any one of the token service providers.
  - The token is suspended for at least one of the token service providers.
- `deactivated`: This status is attained if token is not activated/suspended for any one of the token service providers and is deactivated for each token service provider.

status\_reason

`string` When the token reaches the deactivated state, this field will provide the reason for deactivation. Possible values:

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

You can create the token when your customer opts to save their card on your checkout during the first payment. As per RBI guidelines, you must collect explicit customer consent to save their card.

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

`string` The card's CVV.

**Handy Tips**

- CVV is not required by default for tokenised cards across all networks.
- CVV is optional for tokenised card payments. Do not pass dummy CVV values.
- To implement this change, skip passing the `cvv` parameter entirely, or pass a `null` or empty value in the CVV field.
- We recommend removing the CVV field from your checkout UI/UX for tokenised cards.
- If CVV is still collected for tokenised cards and the customer enters a CVV, pass the entered CVV value to Razorpay.

save

mandatory

`boolean` Pass this parameter to save the card details. Possible values:

- `true`: Saves the card details.
- `false`: Does not save the card detail.

notes

optional

`object` Key-value pair that can be used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

Redirect the customer to the above URL to complete the authentication.

#### Fetch the Token Information

The token is created only if the cardholder successfully completes 3DS authentication.

Use the Fetch Payment API to fetch the token.

GET

/payments/{id}

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

`string` The card's CVV number.

**Handy Tips**

- CVV is not required by default for tokenised cards across all networks.
- CVV is optional for tokenised card payments. Do not pass dummy CVV values.
- To implement this change, skip passing the `cvv` parameter entirely, or pass a `null` or empty value in the CVV field.
- We recommend removing the CVV field from your checkout UI/UX for tokenised cards.
- If CVV is still collected for tokenised cards and the customer enters a CVV, pass the entered CVV value to Razorpay.

notes

optional

`object` Key-value pair that can be used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”` `.

**Handy Tips**
Know more about the [S2S Integration payment flow](/razorpay-docs-md/payment-gateway/s2s-integration/json/v2.md).

### Related Information

- [Customers API](/razorpay-docs-md/api/customers.md)
- [Orders API](/razorpay-docs-md/api/orders.md)
- [Server-to-Server JSON V2 Integration](/razorpay-docs-md/payment-gateway/s2s-integration/json/v2.md)
