<!-- Source: https://razorpay.com/docs/api/payments/route/refund-payments-and-reverse-transfer -->

# Refund Payments and Reverse Transfer from a Linked Account

`POST`

`/v1/payments/:id/refund`

Use this endpoint to create refunds on a particular `payment_id`.

- The amount is deducted from your main account balance when refunding a payment. You can set the `reverse_all` parameter to `true` in the refund POST request to recover the amount from the Linked Account. This will recover the amount for every transfer made on the payment before processing the refund to the customer.
- You can automate reversals with the `reverse_all` parameter in the following refund scenarios:

  - Full refund
  - Partial refund for a payment transferred to a single account.

**Watch Out!**

For partial refunds on a payment transferred to multiple accounts, the `reverse_all` parameter cannot be applied since Razorpay cannot determine which transfer to reverse partially. You will have to use the transfer reversal API to reverse this payment.

A new `reversal` entity is created internally and linked for every `reversal` defined by the `transfer_id`.

Sample Code

Path Parameters

1

Request Parameters

Response Parameters

Errors

Curl

```bash
curl -X POST  https://api.razorpay.com/v1/payments/pay_JJCqynf4fQS0N1/refund \
-u [YOUR_KEY_ID]:[YOUR_KEY_SECRET]
-H 'content-type: application/json'
-d '{
  "amount": 100,
  "reverse_all": true
}'
```

Success

Failure

```json
{
  "id": "rfnd_JJFNlNXPHY640A",
  "entity": "refund",
  "amount": 100,
  "currency": "INR",
  "payment_id": "pay_JJCqynf4fQS0N1",
  "notes": [],
  "receipt": null,
  "acquirer_data": {
    "arn": null
  },
  "created_at": 1649941680,
  "batch_id": null,
  "status": "processed",
  "speed_processed": "normal",
  "speed_requested": "normal"
}
```

###### Path Parameters

`id`

\*

`string`

A unique identifier of the payment that should be refunded.

###### Request Parameters

`amount`

\*

`string`

The amount of refund in the smallest unit of currency. For example, for an amount of ₹200.35, the value of this field should be 20035.

`reverse_all`

`boolean`

Reverses transfer made to a linked account. Possible values:

- `true`: Reverses transfer made to a linked account.
- `false`: Does not reverse transfer made to a linked account.

###### Response Parameters

`id`

`string`

Unique identifier of the refund.

`entity`

`string`

Indicates the type of entity. Here, it is `refund`.

`amount`

`integer`

The amount of refund in the smallest unit of currency. For example, for an amount of ₹200.35, the value of this field should be 20035.

`currency`

`string`

The currency of refund. Currently, only INR is supported.

`payment_id`

`string`

Unique identifier of the payment for which this refund has been requested.

`created_at`

`integer`

Timestamp, in Unix, of refund creation.

`notes`

`json object`

Set of key-value pairs that can be associated with an entity. These pairs can be useful for storing additional information about the entity. A maximum of 15 key-value pairs, each of 256 characters (maximum), are supported.

`receipt`

`string`

Unique identifier that you can use for internal reference.

`acquirer_data`

`array`

A dynamic array consisting of a unique reference number (either RRN, ARN or UTR) that is provided by the banking partner when a refund is processed. This reference number can be used by the customer to track the status of the refund with the bank.

###### Errors

The api key/secret provided is invalid

Error Status: 4xx

This error occurs when there is a mismatch between the API credentials passed in the API call and the API credentials generated on the Dashboard.

Solution

The sum of amount requested for refund is greater than the available amount

Error Status: 400

This error occurs when the total transferred amount exceeds the payment amount.

Solution

The amount must be at least INR 1.00

Error Status: 400

This error occurs when the amount is less than the minimum amount. The transaction amount expressed in the currency subunit, such as paise (in INR) should always be greater than or equal to ₹1.

Solution

payment\_id is not a valid id

Error Status: 400

This error occurs when you pass an invalid `payment_id` in the API endpoint.

Solution

# Refund Payments and Reverse Transfer from a Linked Account

`POST`

`/v1/payments/:id/refund`

Use this endpoint to create refunds on a particular `payment_id`.

- The amount is deducted from your main account balance when refunding a payment. You can set the `reverse_all` parameter to `true` in the refund POST request to recover the amount from the Linked Account. This will recover the amount for every transfer made on the payment before processing the refund to the customer.
- You can automate reversals with the `reverse_all` parameter in the following refund scenarios:

  - Full refund
  - Partial refund for a payment transferred to a single account.

**Watch Out!**

For partial refunds on a payment transferred to multiple accounts, the `reverse_all` parameter cannot be applied since Razorpay cannot determine which transfer to reverse partially. You will have to use the transfer reversal API to reverse this payment.

A new `reversal` entity is created internally and linked for every `reversal` defined by the `transfer_id`.

Path Parameters

1

Request Parameters

Response Parameters

Errors

###### Path Parameters

`id`

\*

`string`

A unique identifier of the payment that should be refunded.

###### Request Parameters

`amount`

\*

`string`

The amount of refund in the smallest unit of currency. For example, for an amount of ₹200.35, the value of this field should be 20035.

`reverse_all`

`boolean`

Reverses transfer made to a linked account. Possible values:

- `true`: Reverses transfer made to a linked account.
- `false`: Does not reverse transfer made to a linked account.

###### Response Parameters

`id`

`string`

Unique identifier of the refund.

`entity`

`string`

Indicates the type of entity. Here, it is `refund`.

`amount`

`integer`

The amount of refund in the smallest unit of currency. For example, for an amount of ₹200.35, the value of this field should be 20035.

`currency`

`string`

The currency of refund. Currently, only INR is supported.

`payment_id`

`string`

Unique identifier of the payment for which this refund has been requested.

`created_at`

`integer`

Timestamp, in Unix, of refund creation.

`notes`

`json object`

Set of key-value pairs that can be associated with an entity. These pairs can be useful for storing additional information about the entity. A maximum of 15 key-value pairs, each of 256 characters (maximum), are supported.

`receipt`

`string`

Unique identifier that you can use for internal reference.

`acquirer_data`

`array`

A dynamic array consisting of a unique reference number (either RRN, ARN or UTR) that is provided by the banking partner when a refund is processed. This reference number can be used by the customer to track the status of the refund with the bank.

###### Errors

The api key/secret provided is invalid

Error Status: 4xx

This error occurs when there is a mismatch between the API credentials passed in the API call and the API credentials generated on the Dashboard.

Solution

The sum of amount requested for refund is greater than the available amount

Error Status: 400

This error occurs when the total transferred amount exceeds the payment amount.

Solution

The amount must be at least INR 1.00

Error Status: 400

This error occurs when the amount is less than the minimum amount. The transaction amount expressed in the currency subunit, such as paise (in INR) should always be greater than or equal to ₹1.

Solution

payment\_id is not a valid id

Error Status: 400

This error occurs when you pass an invalid `payment_id` in the API endpoint.

Solution

Curl

```bash
curl -X POST  https://api.razorpay.com/v1/payments/pay_JJCqynf4fQS0N1/refund \
-u [YOUR_KEY_ID]:[YOUR_KEY_SECRET]
-H 'content-type: application/json'
-d '{
  "amount": 100,
  "reverse_all": true
}'
```

Success

Failure

```json
{
  "id": "rfnd_JJFNlNXPHY640A",
  "entity": "refund",
  "amount": 100,
  "currency": "INR",
  "payment_id": "pay_JJCqynf4fQS0N1",
  "notes": [],
  "receipt": null,
  "acquirer_data": {
    "arn": null
  },
  "created_at": 1649941680,
  "batch_id": null,
  "status": "processed",
  "speed_processed": "normal",
  "speed_requested": "normal"
}
```
