<!-- Source: https://razorpay.com/docs/api/payments/route/create-transfers-orders -->

# Create Transfers From Orders

`POST`

`/v1/orders`

Use this endpoint to set up transfer of funds while creating an order. This can be done by passing the transfers parameters as part of the request body.

- You cannot create transfers on orders which has the `partial_payment` parameter enabled. Ensure that this parameter is set to `0`.
- You cannot create transfers on orders for international currencies. Currently, this feature only supports orders created using INR.

Sample Code

Request Parameters

Response Parameters

Errors

Curl

```bash
curl -X POST https://api.razorpay.com/v1/orders \
-u [YOUR_KEY_ID]:[YOUR_KEY_SECRET]
-H 'content-type: application/json'
-d '{
  "amount": 2000,
  "currency": "INR",
  "transfers": [
    {
      "account": "acc_IRQWUleX4BqvYn",
      "amount": 1000,
      "currency": "INR",
      "notes": {
        "branch": "Acme Corp Bangalore North",
        "name": "Gaurav Kumar"
      },
      "linked_account_notes": [
        "branch"
      ],
      "on_hold": true,
      "on_hold_until": 1671222870
    },
    {
      "account": "acc_IROu8Nod6PXPtZ",
      "amount": 1000,
      "currency": "INR",
      "notes": {
        "branch": "Acme Corp Bangalore South",
        "name": "Saurav Kumar"
      },
      "linked_account_notes": [
        "branch"
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
  "id": "order_JJCYnu3hipocHz",
  "entity": "order",
  "amount": 2000,
  "amount_paid": 0,
  "amount_due": 2000,
  "currency": "INR",
  "receipt": null,
  "offer_id": null,
  "offers": {
    "entity": "collection",
    "count": 0,
    "items": []
  },
  "status": "created",
  "attempts": 0,
  "notes": [],
  "created_at": 1649931742,
  "transfers": [
    {
      "id": "trf_JJCYnw77tqUT9r",
      "entity": "transfer",
      "status": "created",
      "source": "order_JJCYnu3hipocHz",
      "recipient": "acc_IRQWUleX4BqvYn",
      "amount": 1000,
      "currency": "INR",
      "amount_reversed": 0,
      "notes": {
        "branch": "Acme Corp Bangalore North",
        "name": "Gaurav Kumar"
      },
      "linked_account_notes": [
        "branch"
      ],
      "on_hold": true,
      "on_hold_until": 1671222870,
      "recipient_settlement_id": null,
      "created_at": 1649931742,
      "processed_at": null,
      "error": {
        "code": null,
        "description": null,
        "reason": null,
        "field": null,
        "step": null,
        "id": "trf_JJCYnw77tqUT9r",
        "source": null,
        "metadata": null
      }
    },
    {
      "id": "trf_JJCYnxe5GV19Kk",
      "entity": "transfer",
      "status": "created",
      "source": "order_JJCYnu3hipocHz",
      "recipient": "acc_IROu8Nod6PXPtZ",
      "amount": 1000,
      "currency": "INR",
      "amount_reversed": 0,
      "notes": {
        "branch": "Acme Corp Bangalore South",
        "name": "Saurav Kumar"
      },
      "linked_account_notes": [
        "branch"
      ],
      "on_hold": false,
      "on_hold_until": null,
      "recipient_settlement_id": null,
      "created_at": 1649931742,
      "processed_at": null,
      "error": {
        "code": null,
        "description": null,
        "reason": null,
        "field": null,
        "step": null,
        "id": "trf_JJCYnxe5GV19Kk",
        "source": null,
        "metadata": null
      }
    }
  ]
}
```

###### Request Parameters

`amount`

\*

`integer`

The transaction amount, in paise. For example, for an amount of ₹299.35, the value of this field should be 29935.

`currency`

\*

`string`

The currency in which the transaction should be made. We support only `INR` for Route transactions.

`receipt`

`string`

Unique identifier that you can use for internal reference.

`transfers`

`array`

Details regarding the transfer.

Show child parameters (7)

###### Response Parameters

`id`

`string`

Unique identifier of the order created.

`entity`

`string`

The name of the entity. Here, it is `order`.

`amount`

`integer`

The order amount, in paise. For example, for an amount of ₹299.35, the value of this field should be 29935.

`amount_paid`

`integer`

The amount paid against the order.

`amount_due`

`integer`

The amount pending against the order.

`currency`

`string`

The currency in which the order should be created. We support only `INR` for Route transactions.

`receipt`

`string`

Unique identifier that you can use for internal reference.

`status`

`string`

The status of the order. Possible values:

- `created`
- `attempted`
- `paid`

`notes`

`json object`

Set of key-value pairs that can be associated with an entity. These pairs can be useful for storing additional information about the entity. A maximum of 15 key-value pairs, each of 256 characters (maximum), are supported.

`created_at`

`integer`

Timestamp in Unix. This indicates the time of the order created.

`transfers`

`array`

Details regarding the transfer.

Show child parameters (11)

###### Errors

The api key/secret provided is invalid

Error Status: 4xx

This error occurs when there is a mismatch between the API credentials passed in the API call and the API credentials generated on the Dashboard.

Solution

The amount must be at least INR 1.00

Error Status: 400

This error occurs when the amount is less than the minimum amount. The transaction amount expressed in the currency subunit, such as paise (in INR) should always be greater than or equal to 100.

Solution

The input field is required

Error Status: 400

This error occurs when a mandatory field is empty.

Solution

The currency should be INR for transfers

Error Status: 400

This error occurs when the currency is anything other than `INR`.

Solution

Keys sent in linked\_account\_notes must exist in notes

Error Status: 400

This error occurs when there is a mismatch between the key passed in the `linked_account_notes` array and the key from the `notes` object.

Solution

on\_hold\_until must be between 946684800 and 4765046400

Error Status: 400

This error occurs when the time stamp provided for the `on_hold_until` entity is not correct or if it is not between `946684800` and `4765046400`.

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

# Create Transfers From Orders

`POST`

`/v1/orders`

Use this endpoint to set up transfer of funds while creating an order. This can be done by passing the transfers parameters as part of the request body.

- You cannot create transfers on orders which has the `partial_payment` parameter enabled. Ensure that this parameter is set to `0`.
- You cannot create transfers on orders for international currencies. Currently, this feature only supports orders created using INR.

Request Parameters

Response Parameters

Errors

###### Request Parameters

`amount`

\*

`integer`

The transaction amount, in paise. For example, for an amount of ₹299.35, the value of this field should be 29935.

`currency`

\*

`string`

The currency in which the transaction should be made. We support only `INR` for Route transactions.

`receipt`

`string`

Unique identifier that you can use for internal reference.

`transfers`

`array`

Details regarding the transfer.

Show child parameters (7)

###### Response Parameters

`id`

`string`

Unique identifier of the order created.

`entity`

`string`

The name of the entity. Here, it is `order`.

`amount`

`integer`

The order amount, in paise. For example, for an amount of ₹299.35, the value of this field should be 29935.

`amount_paid`

`integer`

The amount paid against the order.

`amount_due`

`integer`

The amount pending against the order.

`currency`

`string`

The currency in which the order should be created. We support only `INR` for Route transactions.

`receipt`

`string`

Unique identifier that you can use for internal reference.

`status`

`string`

The status of the order. Possible values:

- `created`
- `attempted`
- `paid`

`notes`

`json object`

Set of key-value pairs that can be associated with an entity. These pairs can be useful for storing additional information about the entity. A maximum of 15 key-value pairs, each of 256 characters (maximum), are supported.

`created_at`

`integer`

Timestamp in Unix. This indicates the time of the order created.

`transfers`

`array`

Details regarding the transfer.

Show child parameters (11)

###### Errors

The api key/secret provided is invalid

Error Status: 4xx

This error occurs when there is a mismatch between the API credentials passed in the API call and the API credentials generated on the Dashboard.

Solution

The amount must be at least INR 1.00

Error Status: 400

This error occurs when the amount is less than the minimum amount. The transaction amount expressed in the currency subunit, such as paise (in INR) should always be greater than or equal to 100.

Solution

The input field is required

Error Status: 400

This error occurs when a mandatory field is empty.

Solution

The currency should be INR for transfers

Error Status: 400

This error occurs when the currency is anything other than `INR`.

Solution

Keys sent in linked\_account\_notes must exist in notes

Error Status: 400

This error occurs when there is a mismatch between the key passed in the `linked_account_notes` array and the key from the `notes` object.

Solution

on\_hold\_until must be between 946684800 and 4765046400

Error Status: 400

This error occurs when the time stamp provided for the `on_hold_until` entity is not correct or if it is not between `946684800` and `4765046400`.

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
curl -X POST https://api.razorpay.com/v1/orders \
-u [YOUR_KEY_ID]:[YOUR_KEY_SECRET]
-H 'content-type: application/json'
-d '{
  "amount": 2000,
  "currency": "INR",
  "transfers": [
    {
      "account": "acc_IRQWUleX4BqvYn",
      "amount": 1000,
      "currency": "INR",
      "notes": {
        "branch": "Acme Corp Bangalore North",
        "name": "Gaurav Kumar"
      },
      "linked_account_notes": [
        "branch"
      ],
      "on_hold": true,
      "on_hold_until": 1671222870
    },
    {
      "account": "acc_IROu8Nod6PXPtZ",
      "amount": 1000,
      "currency": "INR",
      "notes": {
        "branch": "Acme Corp Bangalore South",
        "name": "Saurav Kumar"
      },
      "linked_account_notes": [
        "branch"
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
  "id": "order_JJCYnu3hipocHz",
  "entity": "order",
  "amount": 2000,
  "amount_paid": 0,
  "amount_due": 2000,
  "currency": "INR",
  "receipt": null,
  "offer_id": null,
  "offers": {
    "entity": "collection",
    "count": 0,
    "items": []
  },
  "status": "created",
  "attempts": 0,
  "notes": [],
  "created_at": 1649931742,
  "transfers": [
    {
      "id": "trf_JJCYnw77tqUT9r",
      "entity": "transfer",
      "status": "created",
      "source": "order_JJCYnu3hipocHz",
      "recipient": "acc_IRQWUleX4BqvYn",
      "amount": 1000,
      "currency": "INR",
      "amount_reversed": 0,
      "notes": {
        "branch": "Acme Corp Bangalore North",
        "name": "Gaurav Kumar"
      },
      "linked_account_notes": [
        "branch"
      ],
      "on_hold": true,
      "on_hold_until": 1671222870,
      "recipient_settlement_id": null,
      "created_at": 1649931742,
      "processed_at": null,
      "error": {
        "code": null,
        "description": null,
        "reason": null,
        "field": null,
        "step": null,
        "id": "trf_JJCYnw77tqUT9r",
        "source": null,
        "metadata": null
      }
    },
    {
      "id": "trf_JJCYnxe5GV19Kk",
      "entity": "transfer",
      "status": "created",
      "source": "order_JJCYnu3hipocHz",
      "recipient": "acc_IROu8Nod6PXPtZ",
      "amount": 1000,
      "currency": "INR",
      "amount_reversed": 0,
      "notes": {
        "branch": "Acme Corp Bangalore South",
        "name": "Saurav Kumar"
      },
      "linked_account_notes": [
        "branch"
      ],
      "on_hold": false,
      "on_hold_until": null,
      "recipient_settlement_id": null,
      "created_at": 1649931742,
      "processed_at": null,
      "error": {
        "code": null,
        "description": null,
        "reason": null,
        "field": null,
        "step": null,
        "id": "trf_JJCYnxe5GV19Kk",
        "source": null,
        "metadata": null
      }
    }
  ]
}
```
