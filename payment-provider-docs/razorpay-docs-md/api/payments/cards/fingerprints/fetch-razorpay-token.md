<!-- Source: https://razorpay.com/docs/api/payments/cards/fingerprints/fetch-razorpay-token -->

# Fetch Card Reference Number Using Razorpay Token

Copy for AI

View as Markdown

`POST`

`/v1/cards/fingerprints`

Use this endpoint to retrieve the card reference number for a specific card using Razorpay token.

Sample Code

Request Parameters

Response Parameters

Curl

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X POST https://api.razorpay.com/v1/cards/fingerprints \
-H "content-type: application/json" \
-d '{
    "token": "token_4lsdksD31GaZ09"
}'
```

Success - Rupay

Success - Mastercard

Success - Visa

```json
{
  "provider": "RuPay",
  "payment_account_reference": null,
  "network_reference_id": "1001381923137653903323591234sdfds90"
}
```

###### Request Parameters

`token`

\*

`string`

The token whose PAR or network reference id should be retrieved.

###### Response Parameters

`provider`

`string`

The card network provider. Possible values:

- `Mastercard`
- `RuPay`
- `Visa`

`payment_account_reference`

`string`

The 29-character unique identifier for Mastercard and Visa cards. For RuPay cards, the value is `null`.

`network_reference_id`

`string`

The unique identifier generated for RuPay cards.

# Fetch Card Reference Number Using Razorpay Token

Copy for AI

View as Markdown

`POST`

`/v1/cards/fingerprints`

Use this endpoint to retrieve the card reference number for a specific card using Razorpay token.

Request Parameters

Response Parameters

###### Request Parameters

`token`

\*

`string`

The token whose PAR or network reference id should be retrieved.

###### Response Parameters

`provider`

`string`

The card network provider. Possible values:

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
    "token": "token_4lsdksD31GaZ09"
}'
```

Success - Rupay

Success - Mastercard

Success - Visa

```json
{
  "provider": "RuPay",
  "payment_account_reference": null,
  "network_reference_id": "1001381923137653903323591234sdfds90"
}
```
