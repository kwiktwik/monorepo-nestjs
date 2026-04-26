<!-- Source: https://razorpay.com/docs/api/payments/route/fetch-transfers-payment -->

# Fetch Transfers for a Payment

`GET`

`/v1/payments/:id/transfers`

Use this endpoint to retrieve the collection of all transfers created on a specific Payment id. Once the settlement against the transfer is processed, a webhook notification `settlement.processed` is sent which contains a `recipient_settlement_id`. Know more about [sample webhook payloads](/docs/webhooks/route/#settlement-processed).

Sample Code

Path Parameters

1

Response Parameters

Errors

Curl

```bash
curl -X GET https://api.razorpay.com/v1/payments/pay_JGmCgTEa9OTQcX/transfers \
-u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
```

Success

Failure

```json
{
  "entity": "collection",
  "count": 2,
  "items": [
    {
      "id": "trf_JJD535tJtk6Yy0",
      "entity": "transfer",
      "status": "processed",
      "source": "pay_JGmCgTEa9OTQcX",
      "recipient": "acc_IROu8Nod6PXPtZ",
      "amount": 100,
      "currency": "INR",
      "amount_reversed": 0,
      "fees": 1,
      "tax": 0,
      "notes": {
        "name": "Gaurav Kumar",
        "roll_no": "IEC2011025"
      },
      "linked_account_notes": [
        "roll_no"
      ],
      "on_hold": true,
      "on_hold_until": 1671222870,
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
        "id": "trf_JJD535tJtk6Yy0",
        "source": null,
        "metadata": null
      }
    },
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
      "on_hold": false,
      "on_hold_until": null,
      "settlement_status": "pending",
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
  ]
}
```

###### Path Parameters

`id`

\*

`string`

Unique identifier of the Payment for which transfers must be retrieved.

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

payment\_id is not a valid id

Error Status: 400

This error occurs when you pass an invalid `payment_id` in the API endpoint.

Solution

# Fetch Transfers for a Payment

`GET`

`/v1/payments/:id/transfers`

Use this endpoint to retrieve the collection of all transfers created on a specific Payment id. Once the settlement against the transfer is processed, a webhook notification `settlement.processed` is sent which contains a `recipient_settlement_id`. Know more about [sample webhook payloads](/docs/webhooks/route/#settlement-processed).

Path Parameters

1

Response Parameters

Errors

###### Path Parameters

`id`

\*

`string`

Unique identifier of the Payment for which transfers must be retrieved.

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

payment\_id is not a valid id

Error Status: 400

This error occurs when you pass an invalid `payment_id` in the API endpoint.

Solution

Curl

```bash
curl -X GET https://api.razorpay.com/v1/payments/pay_JGmCgTEa9OTQcX/transfers \
-u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
```

Success

Failure

```json
{
  "entity": "collection",
  "count": 2,
  "items": [
    {
      "id": "trf_JJD535tJtk6Yy0",
      "entity": "transfer",
      "status": "processed",
      "source": "pay_JGmCgTEa9OTQcX",
      "recipient": "acc_IROu8Nod6PXPtZ",
      "amount": 100,
      "currency": "INR",
      "amount_reversed": 0,
      "fees": 1,
      "tax": 0,
      "notes": {
        "name": "Gaurav Kumar",
        "roll_no": "IEC2011025"
      },
      "linked_account_notes": [
        "roll_no"
      ],
      "on_hold": true,
      "on_hold_until": 1671222870,
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
        "id": "trf_JJD535tJtk6Yy0",
        "source": null,
        "metadata": null
      }
    },
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
      "on_hold": false,
      "on_hold_until": null,
      "settlement_status": "pending",
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
  ]
}
```
