<!-- Source: https://razorpay.com/docs/api/settlements/instant/create -->

# Create an Instant Settlement

`POST`

`/v1/settlements/ondemand`

Use this endpoint to create an Instant Settlement.

Sample Code

Request Parameters

Response Parameters

Errors

Curl

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X POST https://api.razorpay.com/v1/settlements/ondemand \
-H "content-type: application/json" \
-d '{
  "amount": 200000,
  "settle_full_balance": false,
  "description": "Need this to make vendor payments.",
  "notes": {
    "notes_key_1": "Tea, Earl Grey, Hot",
    "notes_key_2": "Tea, Earl Grey… decaf."
  }
}'
```

Success

Failure

```json
{
  "id": "setlod_FNj7g2YS5J67Rz",
  "entity": "settlement.ondemand",
  "amount_requested": 200000,
  "amount_settled": 0,
  "amount_pending": 199410,
  "amount_reversed": 0,
  "fees": 590,
  "tax": 90,
  "currency": "INR",
  "settle_full_balance": false,
  "status": "initiated",
  "description": "Need this to make vendor payments.",
  "notes": {
    "notes_key_1": "Tea, Earl Grey, Hot",
    "notes_key_2": "Tea, Earl Grey… decaf."
  },
  "created_at": 1596771429,
  "ondemand_payouts": {
    "entity": "collection",
    "count": 1,
    "items": [
      {
        "id": "setlodp_FNj7g2cbvw8ueO",
        "entity": "settlement.ondemand_payout",
        "initiated_at": null,
        "processed_at": null,
        "reversed_at": null,
        "amount": 200000,
        "amount_settled": null,
        "fees": 590,
        "tax": 90,
        "utr": null,
        "status": "created",
        "created_at": 1596771429
      }
    ]
  }
}
```

###### Request Parameters

`amount`

\*

`integer`

The amount, in paise, you want to instantly settle.

**What's New**

Settlement amounts of ₹1 or lower are now supported.

`settle_full_balance`

`boolean`

Indicates whether full balance is settled. Possible values:

- `true`: Razorpay will settle the maximum amount possible. Values passed in the `amount` parameter are ignored.
- `false` (default): Razorpay will settle the amount requested in the `amount` parameter.

`description`

`string`

This is a custom note you can pass for the instant settlement for your reference. For example, `Need this to make vendor payments.`.

- Maximum length: 30 characters.
- Allowed characters: a-z, A-Z, 0-9 and space.

`notes`

`object`

Key-value pair that can be used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, `Beam me up Scotty`.

###### Response Parameters

`id`

`string`

The unique identifier of the instant settlement transaction. For example, `setlod_FNj7g2YS5J67Rz`.

`entity`

`string`

Indicates the type of entity. Here it is `settlement.ondemand`.

`amount_requested`

`integer`

The settlement amount, in paise, requested by you. For example, `200000`.

`amount_settled`

`integer`

Total amount (minus fees and tax), in paise, settled to the bank account. For example, `199410`.

`amount_pending`

`integer`

Portion of the requested amount, in paise, yet to be settled to you.

`amount_reversed`

`integer`

Portion of the requested amount, in paise, that was not settled to you. This amount is reversed to your PG current balance.

`fees`

`integer`

Total amount (fees+tax), in paise, deducted for the instant settlement. For example, `590`.

`tax`

`integer`

Total tax, in paise, charged for the fee component. For example, `90`.

`currency`

`string`

The 3-letter ISO currency code for the settlement. Here it is `INR`.

`settle_full_balance`

`boolean`

Indicates whether full balance is settled. Possible values:

- `true`: Razorpay will settle the maximum amount possible. Values passed in the `amount` parameter are ignored.
- `false` (default): Razorpay will settle the amount requested in the `amount` parameter.

`status`

`string`

Indicates the state of the instant settlement. Possible values:

- `created`: The instant settlement request has been created.
- `initiated`: The instant settlement process has been initiated.
- `partially_processed`: The instant settlement is being processed.
- `processed`: The instant settlement has been processed and the amount has been transferred to your bank account.
- `reversed`: The instant settlement could not be processed for some reason and the amount has been transferred back to your PG balance.

`description`

`string`

This is a custom note you can pass for the instant settlement for your reference. For example, `Need this to make vendor payments.`.

`notes`

`object`

Key-value pair that can be used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

`created_at`

`integer`

Unix timestamp at which the instant settlement was created. For example, `1596771429`.

`ondemand_payouts`

`object`

List of payouts created for the instant settlement.

Show child parameters (3)

###### Errors

The API {key/secret} provided is invalid.

Error Status: 4xx

The API credentials passed in the API call differ from the ones generated on the Dashboard.

Solution

# Create an Instant Settlement

`POST`

`/v1/settlements/ondemand`

Use this endpoint to create an Instant Settlement.

Request Parameters

Response Parameters

Errors

###### Request Parameters

`amount`

\*

`integer`

The amount, in paise, you want to instantly settle.

**What's New**

Settlement amounts of ₹1 or lower are now supported.

`settle_full_balance`

`boolean`

Indicates whether full balance is settled. Possible values:

- `true`: Razorpay will settle the maximum amount possible. Values passed in the `amount` parameter are ignored.
- `false` (default): Razorpay will settle the amount requested in the `amount` parameter.

`description`

`string`

This is a custom note you can pass for the instant settlement for your reference. For example, `Need this to make vendor payments.`.

- Maximum length: 30 characters.
- Allowed characters: a-z, A-Z, 0-9 and space.

`notes`

`object`

Key-value pair that can be used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, `Beam me up Scotty`.

###### Response Parameters

`id`

`string`

The unique identifier of the instant settlement transaction. For example, `setlod_FNj7g2YS5J67Rz`.

`entity`

`string`

Indicates the type of entity. Here it is `settlement.ondemand`.

`amount_requested`

`integer`

The settlement amount, in paise, requested by you. For example, `200000`.

`amount_settled`

`integer`

Total amount (minus fees and tax), in paise, settled to the bank account. For example, `199410`.

`amount_pending`

`integer`

Portion of the requested amount, in paise, yet to be settled to you.

`amount_reversed`

`integer`

Portion of the requested amount, in paise, that was not settled to you. This amount is reversed to your PG current balance.

`fees`

`integer`

Total amount (fees+tax), in paise, deducted for the instant settlement. For example, `590`.

`tax`

`integer`

Total tax, in paise, charged for the fee component. For example, `90`.

`currency`

`string`

The 3-letter ISO currency code for the settlement. Here it is `INR`.

`settle_full_balance`

`boolean`

Indicates whether full balance is settled. Possible values:

- `true`: Razorpay will settle the maximum amount possible. Values passed in the `amount` parameter are ignored.
- `false` (default): Razorpay will settle the amount requested in the `amount` parameter.

`status`

`string`

Indicates the state of the instant settlement. Possible values:

- `created`: The instant settlement request has been created.
- `initiated`: The instant settlement process has been initiated.
- `partially_processed`: The instant settlement is being processed.
- `processed`: The instant settlement has been processed and the amount has been transferred to your bank account.
- `reversed`: The instant settlement could not be processed for some reason and the amount has been transferred back to your PG balance.

`description`

`string`

This is a custom note you can pass for the instant settlement for your reference. For example, `Need this to make vendor payments.`.

`notes`

`object`

Key-value pair that can be used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

`created_at`

`integer`

Unix timestamp at which the instant settlement was created. For example, `1596771429`.

`ondemand_payouts`

`object`

List of payouts created for the instant settlement.

Show child parameters (3)

###### Errors

The API {key/secret} provided is invalid.

Error Status: 4xx

The API credentials passed in the API call differ from the ones generated on the Dashboard.

Solution

Curl

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X POST https://api.razorpay.com/v1/settlements/ondemand \
-H "content-type: application/json" \
-d '{
  "amount": 200000,
  "settle_full_balance": false,
  "description": "Need this to make vendor payments.",
  "notes": {
    "notes_key_1": "Tea, Earl Grey, Hot",
    "notes_key_2": "Tea, Earl Grey… decaf."
  }
}'
```

Success

Failure

```json
{
  "id": "setlod_FNj7g2YS5J67Rz",
  "entity": "settlement.ondemand",
  "amount_requested": 200000,
  "amount_settled": 0,
  "amount_pending": 199410,
  "amount_reversed": 0,
  "fees": 590,
  "tax": 90,
  "currency": "INR",
  "settle_full_balance": false,
  "status": "initiated",
  "description": "Need this to make vendor payments.",
  "notes": {
    "notes_key_1": "Tea, Earl Grey, Hot",
    "notes_key_2": "Tea, Earl Grey… decaf."
  },
  "created_at": 1596771429,
  "ondemand_payouts": {
    "entity": "collection",
    "count": 1,
    "items": [
      {
        "id": "setlodp_FNj7g2cbvw8ueO",
        "entity": "settlement.ondemand_payout",
        "initiated_at": null,
        "processed_at": null,
        "reversed_at": null,
        "amount": 200000,
        "amount_settled": null,
        "fees": 590,
        "tax": 90,
        "utr": null,
        "status": "created",
        "created_at": 1596771429
      }
    ]
  }
}
```
