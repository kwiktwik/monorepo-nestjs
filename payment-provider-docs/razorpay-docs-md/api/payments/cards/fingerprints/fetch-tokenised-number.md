<!-- Source: https://razorpay.com/docs/api/payments/cards/fingerprints/fetch-tokenised-number -->

# Fetch Card Reference Number Using Tokenised Card Number

`POST`

`/v1/cards/fingerprints`

Use this endpoint to retrieve the card reference number for a specific card using the tokenised card number.

**Watch Out!**

Using a RuPay card will throw an error as it is not supported. It will not provide `network_reference_id` for tokenised card numbers. It will be available as part of Create Token response only.

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

Success - Visa and MC

Failure

```json
{
  "network": "Visa",
  "payment_account_reference": "V0010013819231376539033235990",
  "network_reference_id": null
}
```

###### Request Parameters

`number`

\*

`string`

The tokenised card number whose PAR or network reference id should be retrieved.

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

# Fetch Card Reference Number Using Tokenised Card Number

`POST`

`/v1/cards/fingerprints`

Use this endpoint to retrieve the card reference number for a specific card using the tokenised card number.

**Watch Out!**

Using a RuPay card will throw an error as it is not supported. It will not provide `network_reference_id` for tokenised card numbers. It will be available as part of Create Token response only.

Request Parameters

Response Parameters

###### Request Parameters

`number`

\*

`string`

The tokenised card number whose PAR or network reference id should be retrieved.

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

Success - Visa and MC

Failure

```json
{
  "network": "Visa",
  "payment_account_reference": "V0010013819231376539033235990",
  "network_reference_id": null
}
```
