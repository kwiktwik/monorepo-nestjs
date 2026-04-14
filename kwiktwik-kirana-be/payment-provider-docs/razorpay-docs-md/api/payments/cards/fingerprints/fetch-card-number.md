<!-- Source: https://razorpay.com/docs/api/payments/cards/fingerprints/fetch-card-number -->

# Fetch Card Reference Number Using Card Number

`POST`

`/v1/cards/fingerprints`

Use this endpoint to retrieve the card reference number for a specific card using card number.

Sample Code

Request Parameters

Response Parameters

Curl

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X POST https://api.razorpay.com/v1/cards/fingerprints \
-H "content-type: application/json" \
-d '{
    "number": "4854980604708430"
}'
```

Success - Rupay

Success - Visa and MC

```json
{
  "network": "RuPay",
  "payment_account_reference": null,
  "network_reference_id": "1001381923137653903323591234sdfds90"
}
```

###### Request Parameters

`number`

\*

`string`

The card number whose PAR or network reference id should be retrieved.

`tokenised`

`boolean`

Determines if the card is saved as a token.
Possible Values:

- `true`: The card number is saved as a token.
- `false`: The card number is not saved as a token.

###### Response Parameters

`network`

`string`

The card network. Possible values:

- `Mastercard`
- `RuPay`
- `Visa`

`payment_account_reference`

`string`

The 29-character unique identifier for Mastercard and Visa cards. For RuPay cards, the value is `null`.

`network_reference_id`

`string`

The unique identifier generated for RuPay cards.

# Fetch Card Reference Number Using Card Number

`POST`

`/v1/cards/fingerprints`

Use this endpoint to retrieve the card reference number for a specific card using card number.

Request Parameters

Response Parameters

###### Request Parameters

`number`

\*

`string`

The card number whose PAR or network reference id should be retrieved.

`tokenised`

`boolean`

Determines if the card is saved as a token.
Possible Values:

- `true`: The card number is saved as a token.
- `false`: The card number is not saved as a token.

###### Response Parameters

`network`

`string`

The card network. Possible values:

- `Mastercard`
- `RuPay`
- `Visa`

`payment_account_reference`

`string`

The 29-character unique identifier for Mastercard and Visa cards. For RuPay cards, the value is `null`.

`network_reference_id`

`string`

The unique identifier generated for RuPay cards.

Curl

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X POST https://api.razorpay.com/v1/cards/fingerprints \
-H "content-type: application/json" \
-d '{
    "number": "4854980604708430"
}'
```

Success - Rupay

Success - Visa and MC

```json
{
  "network": "RuPay",
  "payment_account_reference": null,
  "network_reference_id": "1001381923137653903323591234sdfds90"
}
```
