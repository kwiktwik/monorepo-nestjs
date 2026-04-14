<!-- Source: https://razorpay.com/docs/api/payments/route/create-transfers-payments -->

# Create Transfers From Payments

`POST`

`/v1/payments/:id/transfers`

Use this endpoint to create Transfers from captured payments. You can create and capture payments in the regular payments flow using the [Razorpay Checkout](/razorpay-docs-md/payment-gateway/web-integration/standard.md) and [Payment APIs](/razorpay-docs-md/api/payments.md#capture-a-payment).

You should perform additional steps to disburse payments using Razorpay Route.

1. The customer pays the amount using the standard payment flow.
2. Once the payment is `captured`, you can initiate a transfer to Linked Accounts with a transfer API call. You have to pass the details such as `account_id` and `amount`.

Sample Code

Path Parameters

1

Request Parameters

Response Parameters

Errors

Curl

```bash
curl -X POST https://api.razorpay.com/v1/payments/pay_E8JR8E0XyjUSZd/transfers \
-u [YOUR_KEY_ID]:[YOUR_KEY_SECRET]
-H 'content-type: application/json'
-d '{
  "transfers": [
    {
      "account": "acc_IROu8Nod6PXPtZ",
      "amount": 100,
      "currency": "INR",
      "notes": {
        "name": "Gaurav Kumar",
        "roll_no": "IEC2011025"
      },
      "linked_account_notes": [
        "roll_no"
      ],
      "on_hold": true,
      "on_hold_until": 1671222870
    },
    {
      "account": "acc_IRQWUleX4BqvYn",
      "amount": 300,
      "currency": "INR",
      "notes": {
        "name": "Saurav Kumar",
        "roll_no": "IEC2011026"
      },
      "linked_account_notes": [
        "roll_no"
      ],
      "on_hold": false
    }
  ]
}'
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
      "status": "pending",
      "source": "pay_JGmCgTEa9OTQcX",
      "recipient": "acc_IROu8Nod6PXPtZ",
      "amount": 100,
      "currency": "INR",
      "amount_reversed": 0,
      "notes": {
        "name": "Gaurav Kumar",
        "roll_no": "IEC2011025"
      },
      "linked_account_notes": [
        "roll_no"
      ],
      "on_hold": true,
      "on_hold_until": 1671222870,
      "recipient_settlement_id": null,
      "created_at": 1649933574,
      "processed_at": null,
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
      "status": "pending",
      "source": "pay_JGmCgTEa9OTQcX",
      "recipient": "acc_IRQWUleX4BqvYn",
      "amount": 300,
      "currency": "INR",
      "amount_reversed": 0,
      "notes": {
        "name": "Saurav Kumar",
        "roll_no": "IEC2011026"
      },
      "linked_account_notes": [
        "roll_no"
      ],
      "on_hold": false,
      "on_hold_until": null,
      "recipient_settlement_id": null,
      "created_at": 1649933574,
      "processed_at": null,
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

Unique identifier of the payment on which the transfer must be created.

###### Request Parameters

`transfers`

`array`

Details regarding the transfer.

Show child parameters (7)

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

The transfers.0.amount must be at least 100.

Error Status: 400

This error occurs when the amount is less than the minimum amount. The transaction amount expressed in the currency subunit, such as paise (in INR) should always be greater than or equal to 100.

Solution

The input field is required

Error Status: 400

This error occurs when a mandatory field is empty.

Solution

payment\_id is not a valid id

Error Status: 400

This error occurs when you pass an invalid `payment_id` in the API endpoint.

Solution

The id provided does not exist

Error Status: 400

This error occurs when there is a miss-match between the API keys via which the transaction was initiated for that particular `payment_id` and the API keys passed in the API call.

Solution

input is an invalid account\_code.

Error Status: 400

This error occurs when the `account_code` passed is invalid or does not belong to the requested merchant.

Solution

Transfer cannot be made due to insufficient balance

Error Status: 400

This error occurs when the total balance is less than or equal to the transfer amount.

Solution

The sum of amount requested for transfer is greater than the captured amount

Error Status: 400

This error occurs when the total transferred amount exceeds the captured payment amount.

Solution

# Create Transfers From Payments

`POST`

`/v1/payments/:id/transfers`

Use this endpoint to create Transfers from captured payments. You can create and capture payments in the regular payments flow using the [Razorpay Checkout](/razorpay-docs-md/payment-gateway/web-integration/standard.md) and [Payment APIs](/razorpay-docs-md/api/payments.md#capture-a-payment).

You should perform additional steps to disburse payments using Razorpay Route.

1. The customer pays the amount using the standard payment flow.
2. Once the payment is `captured`, you can initiate a transfer to Linked Accounts with a transfer API call. You have to pass the details such as `account_id` and `amount`.

Path Parameters

1

Request Parameters

Response Parameters

Errors

###### Path Parameters

`id`

\*

`string`

Unique identifier of the payment on which the transfer must be created.

###### Request Parameters

`transfers`

`array`

Details regarding the transfer.

Show child parameters (7)

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

The transfers.0.amount must be at least 100.

Error Status: 400

This error occurs when the amount is less than the minimum amount. The transaction amount expressed in the currency subunit, such as paise (in INR) should always be greater than or equal to 100.

Solution

The input field is required

Error Status: 400

This error occurs when a mandatory field is empty.

Solution

payment\_id is not a valid id

Error Status: 400

This error occurs when you pass an invalid `payment_id` in the API endpoint.

Solution

The id provided does not exist

Error Status: 400

This error occurs when there is a miss-match between the API keys via which the transaction was initiated for that particular `payment_id` and the API keys passed in the API call.

Solution

input is an invalid account\_code.

Error Status: 400

This error occurs when the `account_code` passed is invalid or does not belong to the requested merchant.

Solution

Transfer cannot be made due to insufficient balance

Error Status: 400

This error occurs when the total balance is less than or equal to the transfer amount.

Solution

The sum of amount requested for transfer is greater than the captured amount

Error Status: 400

This error occurs when the total transferred amount exceeds the captured payment amount.

Solution

Curl

```bash
curl -X POST https://api.razorpay.com/v1/payments/pay_E8JR8E0XyjUSZd/transfers \
-u [YOUR_KEY_ID]:[YOUR_KEY_SECRET]
-H 'content-type: application/json'
-d '{
  "transfers": [
    {
      "account": "acc_IROu8Nod6PXPtZ",
      "amount": 100,
      "currency": "INR",
      "notes": {
        "name": "Gaurav Kumar",
        "roll_no": "IEC2011025"
      },
      "linked_account_notes": [
        "roll_no"
      ],
      "on_hold": true,
      "on_hold_until": 1671222870
    },
    {
      "account": "acc_IRQWUleX4BqvYn",
      "amount": 300,
      "currency": "INR",
      "notes": {
        "name": "Saurav Kumar",
        "roll_no": "IEC2011026"
      },
      "linked_account_notes": [
        "roll_no"
      ],
      "on_hold": false
    }
  ]
}'
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
      "status": "pending",
      "source": "pay_JGmCgTEa9OTQcX",
      "recipient": "acc_IROu8Nod6PXPtZ",
      "amount": 100,
      "currency": "INR",
      "amount_reversed": 0,
      "notes": {
        "name": "Gaurav Kumar",
        "roll_no": "IEC2011025"
      },
      "linked_account_notes": [
        "roll_no"
      ],
      "on_hold": true,
      "on_hold_until": 1671222870,
      "recipient_settlement_id": null,
      "created_at": 1649933574,
      "processed_at": null,
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
      "status": "pending",
      "source": "pay_JGmCgTEa9OTQcX",
      "recipient": "acc_IRQWUleX4BqvYn",
      "amount": 300,
      "currency": "INR",
      "amount_reversed": 0,
      "notes": {
        "name": "Saurav Kumar",
        "roll_no": "IEC2011026"
      },
      "linked_account_notes": [
        "roll_no"
      ],
      "on_hold": false,
      "on_hold_until": null,
      "recipient_settlement_id": null,
      "created_at": 1649933574,
      "processed_at": null,
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
