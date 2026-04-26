<!-- Source: https://razorpay.com/docs/api/payments/cards/iin-api -->

The Issuer Identification Number (IIN, also known as BIN) is the first 6 digits of a credit or debit card. Our IIN API provides all the details about a given IIN.

Using this API, you can get details about customers' cards even before the payment is initiated. This helps you to determine whether the payment should be allowed.

For example, if you do not want to accept credit card payments from customers, you can use this API to detect the customer's card type by checking the IIN. Based on the response, you can decide whether to allow the payment to proceed or not.

**Feature Request**

- This is an on-demand feature. Please raise a request with our [Support team](https://razorpay.com/support/#request)

  to get this feature activated on your Razorpay account.
- Watch this video to know how to raise a feature enablement request on the Dashboard.

![Feature Request GIF](https://razorpay.com/docs/api/payments/cards/build/browser/assets/images/feature-request.gif)

## Card Tokenisation

Tokenisation is a process by which the card number gets replaced by another virtual 16-digit number called Token. This token (or tokenised card number) is used to process payments instead of the actual card number.

A token is a unique digital identifier in mobile and online transactions. The first 6 or 9 digits of token created is referred to as token\_iin.

### RBI Guidelines on Tokenisation

As per RBI guidelines, businesses or Payment Aggregators cannot save actual card numbers on their servers. They can only tokenise the card and use these tokens for subsequent payments.

## Tokenised IIN

The first 9 digits of the token are referred to as tokenised IIN.

- For Visa, Mastercard and RuPay tokenised cards, the IIN is the first 9 digits of the token. This is referred to as token\_iin. For example, `438628111`.
- For other networks, the length of Token IIN might change to 6 or 8 digits.

**Handy Tips**

- You will get the token\_iin from your tokenisation solution provider as part of the token entity.
- If you use **Razorpay** as your tokenisation solution provider, you will get the token\_iin within the card object. Refer to the `token.card.token_iin` parameter.

## Uses

You can use this API to:

- Check if the IIN of the card number entered by a customer is valid.
- Check if the IIN is eligible for different payment flows such as recurring and EMI.
- Get information about the card network, card type and issuing bank.
- Detect customer's card type.
- Fetch the actual card IIN for a given token IIN. This is currently supported for Visa and MasterCard.

## Supported Length of the IIN

Please make sure to pass the IIN with correct length as described in the table below:

## IIN Entity

iin

`string` The Issuer Identification Number (IIN). The starting 6 digits of credit or debit card number. For example, `438628` or `438628111`.

entity

`string` The name of the entity. Here, it is `iin`.

network

`string` The card network for the given IIN. Possible values:

- `Visa`
- `RuPay`
- `MasterCard`
- `American Express`
- `Diners Club`
- `Maestro`
- `JCB`
- `Union Pay`
- `Unknown`

- `Visa`
- `MasterCard`

type

`string` The card type for the given IIN. The card payment pricing may differ based on the card type. Possible values:

- `credit`
- `debit`
- `prepaid`
- `unknown`

sub\_type

`string` The card sub-type for the given IIN. The card payment pricing may differ based on the card sub-type. Possible values:

- `consumer`
- `business`
- `unknown`

international

`boolean` Determines whether the card is international (issued outside India) or domestic. Possible values:

- `true`: Card issued outside India.
- `false`: Card issued within India.

issuer\_code

`string` The 4-character issuer code unique to each issuing bank. For example, `HSBC`.

issuer\_name

`string` The name of the issuing bank. Available for cards issued in India only. For example, `HSBC Bank`.

emi

`json object` A JSON object which provides information about the applicability of EMI on the IIN.

available

`boolean` Determines whether the card is eligible for EMI payments or not. Possible values:

- `true`: IIN is eligible for EMI payments.
- `false`: IIN is not eligible for EMI payments.

recurring

`json object` A JSON object which provides information about the applicability of recurring payments on the IIN.

available

`boolean` Determines whether the card is eligible for recurring payments or not. Possible values:

- `true`: IIN is eligible for recurring payments.
- `false`: IIN is not eligible for recurring payments.

authentication\_types

`array` Array which lists the possible authentication types for which the IIN is eligible. Possible values:

- `type: 3ds`: Indicates that the card IIN supports normal 3ds payments.
- `type: otp`: Indicates that the card IIN supports native OTP payments. Native OTP gives you flexibility to accept the OTP entered by the cardholder on your screen.

## Fetch IIN

The following API helps you get all the information about the IIN:

GET

/iins/:iin

### Path Parameter

id

mandatory

`string` The first 6 to 9 digits of the customer's card number depending on the network.

- The IIN length will be 6 digits for:
  - Non-tokenised card IINs for all networks.
  - Tokenised IINs for Amex.
- The IIN length will be 9 digits for tokenised IINs for Visa and Mastercard.

#### 6-digit IINs

#### 9-digit IINs

## Error Handling

### Invalid IIN

The following error will be shown when the IIN is invalid:

### Invalid IIN length

The following error will be shown when the length of IIN is invalid :
