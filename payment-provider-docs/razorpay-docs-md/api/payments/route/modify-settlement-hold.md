<!-- Source: https://razorpay.com/docs/api/payments/route/modify-settlement-hold -->

# Modify Settlement Hold for Transfers

Copy for AI

View as Markdown

`PATCH`

`/v1/transfers/:id`

Use this endpoint to modify the settlement configuration for a particular `transfer_id`. On a successful request, the API responds with the modified transfer entity.

Sample Code

Path Parameters

1

Request Parameters

Response Parameters

Errors

Curl

```bash
curl -X PATCH https://api.razorpay.com/v1/transfers/trf_JJD536GI6wuz3m \
-u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-H 'content-type: application/json' \
-d '{
  "on_hold": true,
  "on_hold_until": 1679691505
}'
```

Success

Failure

```json
{
  "id": "trf_JJD536GI6wuz3m",
  "entity": "transfer",
  "status": "processed",
  "source": "pay_JGmCgTEa9OTQcX",
  "recipient": "acc_IRQWUleX4BqvYn",
  "amount": 300,
  "currency": "INR",
  "amount_reversed": 0,
  "fees": 1,
  "tax": 0,
  "notes": {
    "name": "Saurav Kumar",
    "roll_no": "IEC2011026"
  },
  "linked_account_notes": [
    "roll_no"
  ],
  "on_hold": true,
  "on_hold_until": 1649971331,
  "settlement_status": "on_hold",
  "recipient_settlement_id": null,
  "created_at": 1649933574,
  "processed_at": 1649933579,
  "error": {
    "code": null,
    "description": null,
    "reason": null,
    "field": null,
    "step": null,
    "id": "trf_JJD536GI6wuz3m",
    "source": null,
    "metadata": null
  }
}
```

###### Path Parameters

`id`

\*

`string`

Unique identifier of the transfer for which settlement configurations should be modified.

###### Request Parameters

`on_hold`

\*

`boolean`

Indicates whether the account settlement for transfer is on hold. Possible values:

- `true`: Put the transfer settlement on hold.
- `false`: Releases the settlement.
  For example, if the settlement schedule is T+10 days, a transfer made with `on_hold` set to true will not be settled even after 10 days, as it is on hold. If the hold is disabled on `T+15` day, the amount will be settled to the Linked Account by the next working day.

`on_hold_until`

`integer`

Timestamp, in Unix, that indicates until when the settlement of the transfer must be put on hold. If no value is passed, the settlement is put on hold indefinitely. For example, if a transfer is created with `on_hold_until` timestamp defined as `1583991784`, the settlement will be held off until the specified time period. The amount will be settled to the Linked Account only on the next day.

###### Response Parameters

`id`

`string`

Unique identifier of the transfer.

`entity`

`string`

The name of the entity. Here, it is `transfer`.

`transfer_status`

`string`

The status of the transfer. Possible values are:

- `created`
- `pending`
- `processed`
- `failed`
- `reversed`
- `partially_reversed`

`settlement_status`

`string`

The status of the settlement. Possible values are:

- `pending`
- `on_hold`
- `settled`

`source`

`string`

Unique identifier of the transfer source. The source can be a `payment` or an `order`.

`recipient`

`string`

Unique identifier of the transfer destination, that is, the Linked Account.

`amount`

`integer`

The amount to be transferred to the Linked Account, in paise. For example, for an amount of ₹200.35, the value of this field should be 20035.

`currency`

`string`

ISO currency code. We support route transfers only in `INR`.

`amount_reversed`

`integer`

Amount reversed from this transfer for refunds.

`notes`

`json object`

Set of key-value pairs that can be associated with an entity. These pairs can be useful for storing additional information about the entity. A maximum of 15 key-value pairs, each of 256 characters (maximum), are supported. For example, `"region": "south", "city": "Bangalore"`.

`error`

`string`

Provides error details that may occur during transfers.

Show child parameters (7)

`linked_account_notes`

`array`

List of keys from the `notes` object which needs to be shown to Linked Accounts on their Dashboard. For example, `"region", "city"`. Only the keys will be shown, not values.

`on_hold`

`boolean`

Indicates whether the account settlement for transfer is on hold. Possible values:

- `true`: Puts the settlement on hold.
- `false`: Releases the settlement.

`on_hold_until`

`integer`

Timestamp, in Unix format, indicates until when the settlement of the transfer must be put on hold. If no value is passed, the settlement is put on hold indefinitely.

`recipient_settlement_id`

`string`

Unique identifier of the settlement.

`created_at`

`integer`

Timestamp, in Unix, at which the record was created.

###### Errors

The api key/secret provided is invalid

Error Status: 4xx

This error occurs when there is a mismatch between the API credentials passed in the API call and the API credentials generated on the Dashboard.

Solution

The amount must be at least INR 1.00

Error Status: 400

This error occurs when the amount is less than the minimum amount. The transaction amount expressed in the currency subunit, such as paise (in INR) should always be greater than or equal to ₹1.

Solution

transfer\_id is not a valid id

Error Status: 400

This error occurs when you pass an invalid `transfer_id` in the API endpoint.

Solution

# Modify Settlement Hold for Transfers

Copy for AI

View as Markdown

`PATCH`

`/v1/transfers/:id`

Use this endpoint to modify the settlement configuration for a particular `transfer_id`. On a successful request, the API responds with the modified transfer entity.

Path Parameters

1

Request Parameters

Response Parameters

Errors

###### Path Parameters

`id`

\*

`string`

Unique identifier of the transfer for which settlement configurations should be modified.

###### Request Parameters

`on_hold`

\*

`boolean`

Indicates whether the account settlement for transfer is on hold. Possible values:

- `true`: Put the transfer settlement on hold.
- `false`: Releases the settlement.
  For example, if the settlement schedule is T+10 days, a transfer made with `on_hold` set to true will not be settled even after 10 days, as it is on hold. If the hold is disabled on `T+15` day, the amount will be settled to the Linked Account by the next working day.

`on_hold_until`

`integer`

Timestamp, in Unix, that indicates until when the settlement of the transfer must be put on hold. If no value is passed, the settlement is put on hold indefinitely. For example, if a transfer is created with `on_hold_until` timestamp defined as `1583991784`, the settlement will be held off until the specified time period. The amount will be settled to the Linked Account only on the next day.

###### Response Parameters

`id`

`string`

Unique identifier of the transfer.

`entity`

`string`

The name of the entity. Here, it is `transfer`.

`transfer_status`

`string`

The status of the transfer. Possible values are:

- `created`
- `pending`
- `processed`
- `failed`
- `reversed`
- `partially_reversed`

`settlement_status`

`string`

The status of the settlement. Possible values are:

- `pending`
- `on_hold`
- `settled`

`source`

`string`

Unique identifier of the transfer source. The source can be a `payment` or an `order`.

`recipient`

`string`

Unique identifier of the transfer destination, that is, the Linked Account.

`amount`

`integer`

The amount to be transferred to the Linked Account, in paise. For example, for an amount of ₹200.35, the value of this field should be 20035.

`currency`

`string`

ISO currency code. We support route transfers only in `INR`.

`amount_reversed`

`integer`

Amount reversed from this transfer for refunds.

`notes`

`json object`

Set of key-value pairs that can be associated with an entity. These pairs can be useful for storing additional information about the entity. A maximum of 15 key-value pairs, each of 256 characters (maximum), are supported. For example, `"region": "south", "city": "Bangalore"`.

`error`

`string`

Provides error details that may occur during transfers.

Show child parameters (7)

`linked_account_notes`

`array`

List of keys from the `notes` object which needs to be shown to Linked Accounts on their Dashboard. For example, `"region", "city"`. Only the keys will be shown, not values.

`on_hold`

`boolean`

Indicates whether the account settlement for transfer is on hold. Possible values:

- `true`: Puts the settlement on hold.
- `false`: Releases the settlement.

`on_hold_until`

`integer`

Timestamp, in Unix format, indicates until when the settlement of the transfer must be put on hold. If no value is passed, the settlement is put on hold indefinitely.

`recipient_settlement_id`

`string`

Unique identifier of the settlement.

`created_at`

`integer`

Timestamp, in Unix, at which the record was created.

###### Errors

The api key/secret provided is invalid

Error Status: 4xx

This error occurs when there is a mismatch between the API credentials passed in the API call and the API credentials generated on the Dashboard.

Solution

The amount must be at least INR 1.00

Error Status: 400

This error occurs when the amount is less than the minimum amount. The transaction amount expressed in the currency subunit, such as paise (in INR) should always be greater than or equal to ₹1.

Solution

transfer\_id is not a valid id

Error Status: 400

This error occurs when you pass an invalid `transfer_id` in the API endpoint.

Solution

Curl

```bash
curl -X PATCH https://api.razorpay.com/v1/transfers/trf_JJD536GI6wuz3m \
-u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-H 'content-type: application/json' \
-d '{
  "on_hold": true,
  "on_hold_until": 1679691505
}'
```

Success

Failure

```json
{
  "id": "trf_JJD536GI6wuz3m",
  "entity": "transfer",
  "status": "processed",
  "source": "pay_JGmCgTEa9OTQcX",
  "recipient": "acc_IRQWUleX4BqvYn",
  "amount": 300,
  "currency": "INR",
  "amount_reversed": 0,
  "fees": 1,
  "tax": 0,
  "notes": {
    "name": "Saurav Kumar",
    "roll_no": "IEC2011026"
  },
  "linked_account_notes": [
    "roll_no"
  ],
  "on_hold": true,
  "on_hold_until": 1649971331,
  "settlement_status": "on_hold",
  "recipient_settlement_id": null,
  "created_at": 1649933574,
  "processed_at": 1649933579,
  "error": {
    "code": null,
    "description": null,
    "reason": null,
    "field": null,
    "step": null,
    "id": "trf_JJD536GI6wuz3m",
    "source": null,
    "metadata": null
  }
}
```
