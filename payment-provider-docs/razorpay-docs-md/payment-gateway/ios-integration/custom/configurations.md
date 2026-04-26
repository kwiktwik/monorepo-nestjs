<!-- Source: https://razorpay.com/docs/payments/payment-gateway/ios-integration/custom/configurations -->

This section explains the additional configurations available for Razorpay iOS Custom SDK.

- [Change API Key](/razorpay-docs-md/payment-gateway/ios-integration/custom/configurations.md#change-api-key)
- [Card Utilities](/razorpay-docs-md/payment-gateway/ios-integration/custom/configurations.md#card-utilities)
- [Save Card Details](/razorpay-docs-md/payment-gateway/ios-integration/custom/configurations.md#save-card-details)
- [Fetch Logo](/razorpay-docs-md/payment-gateway/ios-integration/custom/configurations.md#fetch-logos)

## Change API Key

Call the following function after the successful SDK initialization and change the API key:

Change API Key

copy

```swift
razorpay.changeApiKey("rzp_new_key")
```

## Card Utilities

#### Fetch Card Network

The SDK provides a method to get the card network of the card. At least six digits of the card number are required to identify the network. The below method fetches the card network for a card. A minimum of 6 digits is required to identify the network.

Get Card Network

copy

```swift
razorpay.getCardNetwork(fromCardNumber: "cardNumber")
```

Possible values are:

- `visa`
- `mastercard`
- `maestro16`
- `amex`
- `rupay`
- `maestro` and
- `diners`

If the method cannot identify the network, it returns `unknown`.

#### Card Number Validation

The entered card number can be validated using the checksum-based method.

Card Number Validation

copy

```swift
razorpay.isCardValid("cardNumber")
```

#### Fetch Card Number Length for Card Network

Use the below method to fetch the card number's length for a card network:

Fetch Card Number Length for Card Network

copy

```swift
razorpay.getCardNetworkLength(ofNetwork: "network")
```

#### Save Card Details

You can save the card details as **tokens** with Razorpay. On repeat visits, the customers can complete the payment quicker by just entering the `cvv` of the card.

To implement the `save cards` feature in your app:

1. [Create a Customer](/razorpay-docs-md/payment-gateway/ios-integration/custom/configurations.md#step-1-create-a-customer)
2. [Create a Token for the Card](/razorpay-docs-md/payment-gateway/ios-integration/custom/configurations.md#step-2-create-a-token)
3. [Fetch Card Tokens](/razorpay-docs-md/payment-gateway/ios-integration/custom/configurations.md#step-3-fetch-card-tokens)
4. [Create a Payment using the Token](/razorpay-docs-md/payment-gateway/ios-integration/custom/configurations.md#step-4-create-a-payment-using-the-token)

#### Step 1: Create a Customer

Create a customer, whose card details should be saved, from the Dashboard or [Customers API](/razorpay-docs-md/api/customers.md).

POST

/customers

RequestJavaPythonGoPHPRubyNode.js.NETResponse

copy

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X POST https://api.razorpay.com/v1/customers \
-H "Content-Type: application/json" \
-d '{
  "name": "Gaurav Kumar",
  "email": "gaurav.kumar@example.com",
  "contact": "9000090000",
  "fail_existing": "0",
  "notes":{
    "landmark": "Razorpay Office Building",
    "location": "Bangalore"
  }
}'
```

#### Step 2: Create a Token

Use the following code to create a token.

Swift

copy

```swift
internal func showPaymentForm(){
  let options: [String:Any] = [
    "amount": "100",
    "currency": "INR",
    "order_id": "order_4xbQrmEoA5WJ0G",
    "method": "card",
    "card[name]": "Gaurav Kumar",
    "card[number]": "4386289407660153",
    "card[expiry_month]": "9",
    "card[expiry_year]": "20",
    "card[cvv]": "123",
    "customer_id": "cust_1Aa00000000001",
    "save": "1",
    // And the remaining fields
    ]
  razorpay.open(options)
}
```

For saving the card details on the Checkout, send the following parameters in the `options` dictionary:

customer\_id

`NSString` Unique identifier of the customer. Obtained from the response of the [previous step](/razorpay-docs-md/payment-gateway/ios-integration/custom/configurations.md#step-1-create-a-customer).

save

`NSString` Specifies if the card details should be stored as tokens. Possible values are:

- `1`: Saves the card details.
- `0` (default): Does not save the card details.

**Watch Out!**

- CVV is not required by default for tokenised cards across all networks.
- CVV is optional for tokenised card payments. Do not pass dummy CVV values.
- To implement this change, skip passing the `cvv` parameter entirely, or pass a `null` or empty value in the CVV field.
- We recommend removing the CVV field from your checkout UI/UX for tokenised cards.
- If CVV is still collected for tokenised cards and the customer enters a CVV, pass the entered CVV value to Razorpay.

We save the card details entered by the customer as tokens in Razorpay.

#### Step 3: Fetch Card Tokens

You can fetch all tokens generated for a customer by sending a request to the Fetch Tokens API.

GET

/customers/:customer\_id/tokens

RequestResponse

copy

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
    -X GET https://api.razorpay.com/v1/customers/:cust_1Aa00000000001/tokens
```

All the tokens (saved card details) returned in the response can be shown to the customer when payment creation.

#### Step 4: Create a Payment using the Token

On a repeat visit, the customer selects a card from the list of saved cards and completes the payment by entering the `cvv` of the card. Send the `customer_id`, and `token_id`(associated with the saved card) attributes along with `cvv` in the payment request:

Swift

copy

```swift
internal func showPaymentForm(){
  let options: [String:Any] = [
    "amount": "100", 
        "currency": "INR",
        "order_id": "order_4xbXrmEoB5WApy",
        "method": "card",
        "customer_id": "cust_1Aa00000000001",
        "token": "token_4zwefDSCC829ma",
        "card[cvv]": "123",
          // And the remaining fields
    ]
  razorpay.open(options)
}
```

## Fetch Logos

#### Fetch Bank Logo URL

Use the below method to fetch the bank logo URL. Here `bankCode` is the code of the bank. This should be available in the response received in the `onPaymentMethodsReceived` callback.

Fetch Bank Logo URL

copy

```swift
razorpay.getBankLogo(havingBankCode: "bankCode")
```

#### Fetch Wallet Logo URL

Use the below method to fetch the wallet logo URL:

Fetch Wallet Logo URL

copy

```swift
razorpay.getWalletLogo(havingWalletName: "name")
```

#### Fetch Wallet Square Logo URL

Use the below method to fetch the wallet square image logo URL:

Fetch Wallet Square Logo URL

copy

```swift
razorpay.getCardNetwork(fromCardNumber: "cardNumber")
```0
