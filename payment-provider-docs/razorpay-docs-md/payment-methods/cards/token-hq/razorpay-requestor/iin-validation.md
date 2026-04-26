<!-- Source: https://razorpay.com/docs/payments/payment-methods/cards/token-hq/razorpay-requestor/iin-validation -->

**Watch Out**

- As per RBI guidelines, businesses and payment acquirers are allowed to save the last 4 card digits and the Bank Identification Number (BIN) only.
- As per current interpretation, businesses and Payment Acquirer are not allowed to save the Issuer Identification Number (IIN) of the card.\*
  \*Razorpay is seeking clarification on this from the industry and RBI.

## Token IIN API

A token is an alias or surrogate value for the actual card number. Whenever the network tokenises a card, the token generated will be a numeric value with the same length as the actual card number.

#### For Example

When a card is tokenised, the first 6 digits or the IIN of the card gets changed.
The new IIN for the card is referred to as token IIN.

Use the following API to fetch the properties of the card using token IIN.

GET

/iins/:token\_iin

#### Path Parameter

token\_iin

mandatory

`integer` The token IIN.

### Related Information

- [Fetch Card IIN Information API](/razorpay-docs-md/api/payments/cards/iin-api.md)
