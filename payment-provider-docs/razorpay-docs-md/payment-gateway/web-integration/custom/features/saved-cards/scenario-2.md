<!-- Source: https://razorpay.com/docs/payments/payment-gateway/web-integration/custom/features/saved-cards/scenario-2 -->

If you do not intend to collect customer consent to save card details on your UI and want Razorpay to collect the consent, follow the steps below.

## New Card Workflow

New cards are cards that have previously not been saved with Razorpay. Follow the steps given below to make changes in the integration code:

## Step 1: Create a Customer

You can create customers using the [Create a Customer API](/razorpay-docs-md/api/customers.md). The `customer_id` received in the response should be passed in the Create Payment request.

## Step 2: Create Payment

Use the following code to **Create a Payment**.

Custom Checkout

copy

```javascript
<script src="https://checkout.razorpay.com/v1/razorpay.js"></script>
  <button id="rzp-button1" style="background-color: #3399cc; color: white; font-size: 16px; font-family: sans-serif">Pay</button>
  <script>
       var razorpay = new Razorpay({
        key: "<YOUR_KEY_ID>",
        image: "https://i.imgur.com/n5tjHFD.jpg",
        name: "Gaurav Kumar",
       });
       var data = {
        amount: 6666,
        currency: "",
        email: "gaurav.kumar@example.com",
        order_id: "order_ISsp1ekSCHgoAw",
        contact: +919876543210,
        notes: {
          address: "Ground Floor, SJR Cyber, Laskar Hosur Road, Bengaluru",
        },
        customer_id: "cust_1Aa00000000001",
        save: 1,
        method: "card",
        card[number]: '4242424242424242',
        card[expiry_month]: '11',
        card[expiry_year]: '23',
        card[cvv]: '123',
        card[name]: 'Gaurav Kumar'
       };

       document.getElementById("rzp-button1").onclick = function(){
        razorpay.createPayment(data);
        razorpay.on("payment.success", function(resp) {
          alert(resp.razorpay_payment_id)
          });
        razorpay.on("payment.error", function(resp){alert(resp.error.description)});
}
</script>
```

#### Request Parameters

save

mandatory

`integer` Determines whether Razorpay should save customer card details as tokens with the card network. Possible values:

- `1`: Razorpay should save customer card details as tokens with the card network.
- `0`: Razorpay should not save the card details.

card

mandatory

The details of the card that should be entered while making the payment.

number

`string` Unformatted card number.

name

`string` The name of the cardholder.

expiry\_month

`string` Expiry month for card in MM format.

expiry\_year

`string` Expiry year for card in YY format.

cvv

`string` The card's CVV number.

**Handy Tips**

- CVV is not required by default for tokenised cards across all networks.
- CVV is optional for tokenised card payments. Do not pass dummy CVV values.
- To implement this change, skip passing the `cvv` parameter entirely, or pass a `null` or empty value in the CVV field.
- We recommend removing the CVV field from your checkout UI/UX for tokenised cards.
- If CVV is still collected for tokenised cards and the customer enters a CVV, pass the entered CVV value to Razorpay.

customer\_id

mandatory

`string` Unique identifier of the customer. This can be obtained from the response of the previous step.

## Step 3: Fetch all Tokens of Customer

Fetch all tokens created for a customer using the API given below.

GET

/customers/:customer\_id/tokens

CurlJavaPythonGoPHPRubyNode.jsResponse

copy

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X GET https://api.razorpay.com/v1/customers/:customer_id/tokens
```

#### Path Parameter

customer\_id

`string` Unique identifier of the customer.

#### Response Parameters

id

`string` The unique identifier of the Razorpay token.

entity

`string` The name of the entity. Here, it is `token`.

method

`string` The type of saved instrument. In the current use case, the value is `card`.

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

compliant\_with\_tokenisation\_guidelines

`boolean` Indicates whether the token is compliant with the RBI guidelines. Possible values:

- `true`: The token is compliant with RBI guidelines.
- `false`: The token is not compliant with RBI guidelines.

status

`string` The overall status for the token. Possible values:

- `initiated`: The token attains this state after Razorpay has received the tokenisation request and is working with token service providers for creating the token.
- `active`: The token attains this state if the token is activated for at least one of the token service providers.
- `suspended`: The token attains this state if:
  - The token is not activated for any one of the token service providers.
  - The token is suspended for at least one of the token service providers.
- `deactivated`: The token attains this state if the token is not active/suspended for any one of the token service providers and is deactivated for at least one token service provider. Know about the complete list of [token states](/razorpay-docs-md/payment-methods/cards/token-hq/merchant-requestor/token-lifecycle.md)  .

**Handy Tips**

You can convert a token BIN received in response to an **actual BIN** using [token APIs](/razorpay-docs-md/payment-methods/cards/token-hq/razorpay-requestor/apis.md).

## Step 4: Fetch Card Properties of an Existing Token

Use this API to retrieve card details such as network, issuer and so on for a given token.

GET

/customers/:customer\_id/tokens/:token\_id

#### Path Parameter

customer\_id

`string` Unique identifier of the customer.

token\_id

`string` Unique identifier of the token.

#### Response Parameters

id

`string` The unique identifier of the Razorpay token.

entity

`string` The name of the entity. Here, it is `token`.

method

`string` The type of saved instrument. In the current use case, the value is `card`.

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

compliant\_with\_tokenisation\_guidelines

`boolean` Indicates whether the token is compliant with the RBI guidelines. Possible values:

- `true`: The token is compliant with RBI guidelines.
- `false`: The token is not compliant with RBI guidelines.

status

`string` The overall status for the token. Possible values:

- `initiated`: The token attains this state after Razorpay has received the tokenisation request and is working with token service providers for creating the token.
- `active`: The token attains this state if the token is activated for at least one of the token service providers.
- `suspended`: The token attains this state if:
  - The token is not activated for any one of the token service providers.
  - The token is suspended for at least one of the token service providers.
- `deactivated`: The token attains this state if the token is not active/suspended for any one of the token service providers and is deactivated for at least one token service provider. Know about the complete list of [token states](/razorpay-docs-md/payment-methods/cards/token-hq/merchant-requestor/token-lifecycle.md)  .

**Handy Tips**

You can convert a token BIN received in response to an **actual BIN** using [token APIs](/razorpay-docs-md/payment-methods/cards/token-hq/razorpay-requestor/apis.md).

## Step 5: Create Payments using Saved Card

After the card is saved, customers can quickly complete the payment for every subsequent online transaction by entering only the `cvv`. If Razorpay should save the card details, pass the following additional parameters to the Checkout form.

Custom Checkout

copy

```javascript
<script src="https://checkout.razorpay.com/v1/razorpay.js"></script>
  <button id="rzp-button1" style="background-color: #3399cc; color: white; font-size: 16px; font-family: sans-serif">Pay</button>
  <script>
       var razorpay = new Razorpay({
        key: "<YOUR_KEY_ID>",
        image: "https://i.imgur.com/n5tjHFD.jpg",
        name: "Gaurav Kumar",
       });
       var data = {
        amount: 6666,
        currency: "",
        email: "gaurav.kumar@example.com",
        order_id: "order_ISsp1ekSCHgoAW",
        contact: 9123456780,
        notes: {
          address: "Ground Floor, SJR Cyber, Laskar Hosur Road, Bengaluru",
        },
        customer_id: "cust_1Aa00000000001",
        token: "token_4zwefDSCC829ma",
        method: "card",
        card[cvv]: '123'
       };

       document.getElementById("rzp-button1").onclick = function(){
        razorpay.createPayment(data);
        razorpay.on("payment.success", function(resp) {
          alert(resp.razorpay_payment_id)
          });
        razorpay.on("payment.error", function(resp){alert(resp.error.description)});
}
</script>
```

#### Request Parameters

customer\_id

`string` Unique identifier of the customer.

token

`string` Unique identifier of the token saved with the card network.

card[cvv]

`string` CVV of the card.

**Handy Tips**

- CVV is not required by default for tokenised cards across all networks.
- CVV is optional for tokenised card payments. Do not pass dummy CVV values.
- To implement this change, skip passing the `cvv` parameter entirely, or pass a `null` or empty value in the CVV field.
- We recommend removing the CVV field from your checkout UI/UX for tokenised cards.
- If CVV is still collected for tokenised cards and the customer enters a CVV, pass the entered CVV value to Razorpay.

## Step 6: Delete Tokens

If the customers want to remove the saved cards from their respective accounts, you can use the following API to delete the tokens:

DELETE

/customers/:customer\_id/tokens/:token\_id

#### Path Parameters

customer\_id

`string` Unique identifier of the customer.

token

`string` Token of the saved method that needs to be deleted.

## Delete Saved Card Details

Customers can delete their card details. Check this [demo](https://razorpay.com/flashcheckout/manage/) and follow the on-screen instructions.

## Existing Saved Card

Existing cards are cards whose details have been previously saved with Razorpay on Razorpay servers.

Existing card details will be saved as network tokens by Razorpay only if:

1. The `Collect Consent from Customers` feature is enabled on the Dashboard.
2. The customer provides their consent on the Razorpay webpage. If the customer does not consent, the card details will not be saved.
