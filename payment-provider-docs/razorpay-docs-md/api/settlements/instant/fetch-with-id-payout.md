<!-- Source: https://razorpay.com/docs/api/settlements/instant/fetch-with-id-payout -->

# Fetch Instant Settlement With ID and Payout Details

`GET`

`/v1/settlements/ondemand/:id?expand[]=ondemand_payouts`

Use this endpoint to retrieve payout details as part of the response for a specific instant settlements.

Sample Code

Path Parameters

1

Query Parameters

1

Response Parameters

Errors

Curl

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET]\
- X GET \
https://api.razorpay.com/v1/settlements/ondemand/setlod_FNj7g2YS5J67Rz?expand[]=ondemand_payouts
```

Success

Failure

```json
{
  "id": "setlod_FNj7g2YS5J67Rz",
  "entity": "settlement.ondemand",
  "amount_requested": 200000,
  "amount_settled": 199410,
  "amount_pending": 0,
  "amount_reversed": 0,
  "fees": 590,
  "tax": 90,
  "currency": "INR",
  "settle_full_balance": false,
  "status": "processed",
  "description": "Need this to buy stock.",
  "notes": {
    "notes_key_1": "Tea, Earl Grey, Hot",
    "notes_key_2": "Tea, Earl Grey, decaf."
  },
  "created_at": 1596771429,
  "ondemand_payouts": {
    "entity": "collection",
    "count": 1,
    "items": [
      {
        "id": "setlodp_FNj7g2cbvw8ueO",
        "entity": "settlement.ondemand_payout",
        "initiated_at": 1596771430,
        "processed_at": 1596778752,
        "reversed_at": null,
        "amount": 200000,
        "amount_settled": 199410,
        "fees": 590,
        "tax": 90,
        "utr": "022011173948",
        "status": "processed",
        "created_at": 1596771429
      }
    ]
  }
}
```

###### Path Parameters

`id`

\*

`string`

The unique identifier for the instant settlement transaction. For example, `setlod_FNj7g2YS5J67Rz`.

###### Query Parameters

`expand[]=ondemand_payouts`

`string`

Pass this if you want to fetch payout details as part of the response for a specific instant settlements.

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

Possible values:

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

The id provided does not exist

Error Status: 400

The settlement id does not belong to the requestor or does not exist.

Solution

# Fetch Instant Settlement With ID and Payout Details

`GET`

`/v1/settlements/ondemand/:id?expand[]=ondemand_payouts`

Use this endpoint to retrieve payout details as part of the response for a specific instant settlements.

Path Parameters

1

Query Parameters

1

Response Parameters

Errors

###### Path Parameters

`id`

\*

`string`

The unique identifier for the instant settlement transaction. For example, `setlod_FNj7g2YS5J67Rz`.

###### Query Parameters

`expand[]=ondemand_payouts`

`string`

Pass this if you want to fetch payout details as part of the response for a specific instant settlements.

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

Possible values:

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

The id provided does not exist

Error Status: 400

The settlement id does not belong to the requestor or does not exist.

Solution

Curl

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET]\
- X GET \
https://api.razorpay.com/v1/settlements/ondemand/setlod_FNj7g2YS5J67Rz?expand[]=ondemand_payouts
```

Success

Failure

```json
{
  "id": "setlod_FNj7g2YS5J67Rz",
  "entity": "settlement.ondemand",
  "amount_requested": 200000,
  "amount_settled": 199410,
  "amount_pending": 0,
  "amount_reversed": 0,
  "fees": 590,
  "tax": 90,
  "currency": "INR",
  "settle_full_balance": false,
  "status": "processed",
  "description": "Need this to buy stock.",
  "notes": {
    "notes_key_1": "Tea, Earl Grey, Hot",
    "notes_key_2": "Tea, Earl Grey, decaf."
  },
  "created_at": 1596771429,
  "ondemand_payouts": {
    "entity": "collection",
    "count": 1,
    "items": [
      {
        "id": "setlodp_FNj7g2cbvw8ueO",
        "entity": "settlement.ondemand_payout",
        "initiated_at": 1596771430,
        "processed_at": 1596778752,
        "reversed_at": null,
        "amount": 200000,
        "amount_settled": 199410,
        "fees": 590,
        "tax": 90,
        "utr": "022011173948",
        "status": "processed",
        "created_at": 1596771429
      }
    ]
  }
}
```
