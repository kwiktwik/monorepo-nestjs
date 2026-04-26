<!-- Source: https://razorpay.com/docs/api/payments/route/direct-transfers-idempotent-request -->

# Create a Direct Transfer (Idempotent Request)

`POST`

`/v1/transfers`

Idempotency allows you to safely retry or send the same request multiple times without fear of repeating the transfer request more than once.

- When you try to create a transfer, in some cases due to network downtimes, you may not get a response from our servers. As a consequence, you will not be aware of the transfer id or its state. In such cases, you can safely retry the transaction using the same idempotency key without risk of double-payout or duplication.
- To make a transfer request idempotent, add the header `X-Transfer-Idempotency` to the request and pass an idempotency key against it. The idempotency key (4-36 characters) can contain alphabets, numbers, hyphens, underscores and space only. For example, `fbdabb70-9548-4cfe-8da1-c9bbf39e96b0`.

**Watch Out!**

Currently, idempotency is supported only on the Direct Transfers API.

**Handy Tips**

- When retrying a request, the request body must be the same as the first request for idempotency to work. A different payload will be rejected as a `BAD_REQUEST`.
- The idempotency key in retries must be the same as the original request.
- Use unique idempotency keys for each unique request.
- If we receive another request while the first one is in process, we will send a 409 error code. You can retry if you get this error code.

Sample Code

Request Parameters

Response Parameters

Errors

Curl

```bash
curl -X POST https://api.razorpay.com/v1/transfers \
-u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-H 'content-type: application/json' \
-H 'X-Transfer-Idempotency: fbdabb70-9548-4cfe-8da1-c9bbf39e96b0' \
-d '{
  "account": "acc_CPRsN1LkFccllA",
  "amount": 100,
  "currency": "INR"
}'
```

Success

Failure

```json
{
  "id": "trf_JqpKevElHShZkw",
  "entity": "transfer",
  "status": "processed",
  "source": "acc_CJoeHMNpi0nC7k",
  "recipient": "acc_CPRsN1LkFccllA",
  "amount": 100,
  "currency": "INR",
  "amount_reversed": 0,
  "fees": 1,
  "tax": 0,
  "notes": [],
  "linked_account_notes": [],
  "on_hold": false,
  "on_hold_until": null,
  "recipient_settlement_id": null,
  "created_at": 1657273505,
  "processed_at": 1657273505,
  "error": {
    "code": null,
    "description": null,
    "reason": null,
    "field": null,
    "step": null,
    "id": "trf_JqpKevElHShZkw",
    "source": null,
    "metadata": null
  }
}
```

###### Request Parameters

`account`

\*

`string`

Unique identifier of the Linked Account to which the transfer must be made.

`amount`

\*

`integer`

The amount (in paise) to be transferred to the Linked Account. For example, for an amount of ₹200.35, the value of this field should be 20035.

`currency`

\*

`string`

The currency used in the transaction. We support only `INR` for Route transactions.

`notes`

`json object`

Set of key-value pairs that can be associated with an entity. These pairs can be useful for storing additional information about the entity. A maximum of 15 key-value pairs, each of 256 characters (maximum), are supported.

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

The API key/secret provided is invalid.

Error Status: 4xx

This error occurs when there is a mismatch between the API credentials passed in the API call and the API credentials generated on the Dashboard.

Solution

# Create a Direct Transfer (Idempotent Request)

`POST`

`/v1/transfers`

Idempotency allows you to safely retry or send the same request multiple times without fear of repeating the transfer request more than once.

- When you try to create a transfer, in some cases due to network downtimes, you may not get a response from our servers. As a consequence, you will not be aware of the transfer id or its state. In such cases, you can safely retry the transaction using the same idempotency key without risk of double-payout or duplication.
- To make a transfer request idempotent, add the header `X-Transfer-Idempotency` to the request and pass an idempotency key against it. The idempotency key (4-36 characters) can contain alphabets, numbers, hyphens, underscores and space only. For example, `fbdabb70-9548-4cfe-8da1-c9bbf39e96b0`.

**Watch Out!**

Currently, idempotency is supported only on the Direct Transfers API.

**Handy Tips**

- When retrying a request, the request body must be the same as the first request for idempotency to work. A different payload will be rejected as a `BAD_REQUEST`.
- The idempotency key in retries must be the same as the original request.
- Use unique idempotency keys for each unique request.
- If we receive another request while the first one is in process, we will send a 409 error code. You can retry if you get this error code.

Request Parameters

Response Parameters

Errors

###### Request Parameters

`account`

\*

`string`

Unique identifier of the Linked Account to which the transfer must be made.

`amount`

\*

`integer`

The amount (in paise) to be transferred to the Linked Account. For example, for an amount of ₹200.35, the value of this field should be 20035.

`currency`

\*

`string`

The currency used in the transaction. We support only `INR` for Route transactions.

`notes`

`json object`

Set of key-value pairs that can be associated with an entity. These pairs can be useful for storing additional information about the entity. A maximum of 15 key-value pairs, each of 256 characters (maximum), are supported.

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

The API key/secret provided is invalid.

Error Status: 4xx

This error occurs when there is a mismatch between the API credentials passed in the API call and the API credentials generated on the Dashboard.

Solution

Curl

```bash
curl -X POST https://api.razorpay.com/v1/transfers \
-u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-H 'content-type: application/json' \
-H 'X-Transfer-Idempotency: fbdabb70-9548-4cfe-8da1-c9bbf39e96b0' \
-d '{
  "account": "acc_CPRsN1LkFccllA",
  "amount": 100,
  "currency": "INR"
}'
```

Success

Failure

```json
{
  "id": "trf_JqpKevElHShZkw",
  "entity": "transfer",
  "status": "processed",
  "source": "acc_CJoeHMNpi0nC7k",
  "recipient": "acc_CPRsN1LkFccllA",
  "amount": 100,
  "currency": "INR",
  "amount_reversed": 0,
  "fees": 1,
  "tax": 0,
  "notes": [],
  "linked_account_notes": [],
  "on_hold": false,
  "on_hold_until": null,
  "recipient_settlement_id": null,
  "created_at": 1657273505,
  "processed_at": 1657273505,
  "error": {
    "code": null,
    "description": null,
    "reason": null,
    "field": null,
    "step": null,
    "id": "trf_JqpKevElHShZkw",
    "source": null,
    "metadata": null
  }
}
```
