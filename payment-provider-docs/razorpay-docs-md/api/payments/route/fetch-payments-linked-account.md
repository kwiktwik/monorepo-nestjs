<!-- Source: https://razorpay.com/docs/api/payments/route/fetch-payments-linked-account -->

# Fetch Payments of a Linked Account

Copy for AI

View as Markdown

`GET`

`/v1/payments/`

Use this endpoint to fetch a list of all the payments received by a Linked Account. For this, you should send the Linked Account id in the `X-Razorpay-Account` API request header, as shown in the Curl example.

Sample Code

Response Parameters

Errors

Curl

```bash
curl -X GET https://api.razorpay.com/v1/payments \
-u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-H 'X-Razorpay-Account: acc_IRQWUleX4BqvYn' \
```

Success

Failure

```json
{
  "entity": "collection",
  "count": 2,
  "items": [
    {
      "id": "pay_JJCqynf4fQS0N1",
      "entity": "payment",
      "amount": 10000,
      "currency": "INR",
      "status": "captured",
      "order_id": "order_JJCqnZG8f3754z",
      "invoice_id": null,
      "international": false,
      "method": "netbanking",
      "amount_refunded": 0,
      "refund_status": null,
      "captured": true,
      "description": "#JJCqaOhFihfkVE",
      "card_id": null,
      "bank": "YESB",
      "wallet": null,
      "vpa": null,
      "email": "john.example@example.com",
      "contact": "+919820958250",
      "notes": [],
      "fee": 236,
      "tax": 36,
      "error_code": null,
      "error_description": null,
      "error_source": null,
      "error_step": null,
      "error_reason": null,
      "acquirer_data": {
        "bank_transaction_id": "2118867"
      },
      "created_at": 1649932775
    },
    {
      "id": "pay_JHAe1Zat55GbZB",
      "entity": "payment",
      "amount": 5000,
      "currency": "INR",
      "status": "captured",
      "order_id": "order_IluGWxBm9U8zJ8",
      "invoice_id": null,
      "international": false,
      "method": "netbanking",
      "amount_refunded": 0,
      "refund_status": null,
      "captured": true,
      "description": "Test Transaction",
      "card_id": null,
      "bank": "KKBK",
      "wallet": null,
      "vpa": null,
      "email": "gaurav.kumar@example.com",
      "contact": "+919000090000",
      "notes": {
        "address": "Razorpay Corporate Office"
      },
      "fee": 118,
      "tax": 18,
      "error_code": null,
      "error_description": null,
      "error_source": null,
      "error_step": null,
      "error_reason": null,
      "acquirer_data": {
        "bank_transaction_id": "7003347"
      },
      "created_at": 1649488316
    }
  ]
}
```

###### Response Parameters

`id`

`string`

Unique identifier of the payment.

`entity`

`string`

Indicates the type of entity.

`amount`

`string`

The payment amount represented in the smallest unit of the currency passed. For example, for an amount of ₹200.35, the value of this field should be 20035.

`currency`

`string`

The currency in which the payment is made. We support only `INR` for Route transactions.

`status`

`string`

The status of the payment. Possible values:

- `created`
- `authorized`
- `captured`
- `refunded`
- `failed`

`method`

`string`

The payment method used for making the payment. Here, it will be `transfer`.

`order_id`

`string`

Unique identifier of the order associated with the payment.

`description`

`string`

Description of the payment, if any.

`refund_status`

`string`

The refund status of the payment. Possible values include:

- `null`
- `partial`
- `full`

`amount_refunded`

`integer`

The amount refunded in the smallest unit of the currency passed. For example, if the `amount_refunded` is 100, then it translates to 100 paise, that is ₹1. Only INR is supported.

`captured`

`boolean`

Indicates whether the payment has been captured. Possible values:

- `true`: Payment has been captured.
- `false`: Payment has not been captured.

`email`

`string`

Customer email address used for the payment.

`contact`

`string`

Customer contact number used for the payment.

`fee`

`integer`

Fee (including GST) charged by Razorpay.

`tax`

`integer`

GST charged for the payment.

`error_code`

`string`

Code for the error that occurred during payment. For example, `BAD_GATEWAY_ERROR`.

`error_description`

`string`

Description of the error that occurred during payment.

`notes`

`json object`

Set of key-value pairs that can be associated with an entity. These pairs can be useful for storing additional information about the entity. A maximum of 15 key-value pairs, each of 256 characters (maximum), are supported.

`created_at`

`integer`

Timestamp, in Unix, on which the payment was created.

###### Errors

The api key/secret provided is invalid

Error Status: 4xx

This error occurs when there is a mismatch between the API credentials passed in the API call and the API credentials generated on the Dashboard.

Solution

The id provided does not exist

Error Status: 400

This error occurs when the Linked Account is invalid or does not belong to the requested merchant.

Solution

# Fetch Payments of a Linked Account

Copy for AI

View as Markdown

`GET`

`/v1/payments/`

Use this endpoint to fetch a list of all the payments received by a Linked Account. For this, you should send the Linked Account id in the `X-Razorpay-Account` API request header, as shown in the Curl example.

Response Parameters

Errors

###### Response Parameters

`id`

`string`

Unique identifier of the payment.

`entity`

`string`

Indicates the type of entity.

`amount`

`string`

The payment amount represented in the smallest unit of the currency passed. For example, for an amount of ₹200.35, the value of this field should be 20035.

`currency`

`string`

The currency in which the payment is made. We support only `INR` for Route transactions.

`status`

`string`

The status of the payment. Possible values:

- `created`
- `authorized`
- `captured`
- `refunded`
- `failed`

`method`

`string`

The payment method used for making the payment. Here, it will be `transfer`.

`order_id`

`string`

Unique identifier of the order associated with the payment.

`description`

`string`

Description of the payment, if any.

`refund_status`

`string`

The refund status of the payment. Possible values include:

- `null`
- `partial`
- `full`

`amount_refunded`

`integer`

The amount refunded in the smallest unit of the currency passed. For example, if the `amount_refunded` is 100, then it translates to 100 paise, that is ₹1. Only INR is supported.

`captured`

`boolean`

Indicates whether the payment has been captured. Possible values:

- `true`: Payment has been captured.
- `false`: Payment has not been captured.

`email`

`string`

Customer email address used for the payment.

`contact`

`string`

Customer contact number used for the payment.

`fee`

`integer`

Fee (including GST) charged by Razorpay.

`tax`

`integer`

GST charged for the payment.

`error_code`

`string`

Code for the error that occurred during payment. For example, `BAD_GATEWAY_ERROR`.

`error_description`

`string`

Description of the error that occurred during payment.

`notes`

`json object`

Set of key-value pairs that can be associated with an entity. These pairs can be useful for storing additional information about the entity. A maximum of 15 key-value pairs, each of 256 characters (maximum), are supported.

`created_at`

`integer`

Timestamp, in Unix, on which the payment was created.

###### Errors

The api key/secret provided is invalid

Error Status: 4xx

This error occurs when there is a mismatch between the API credentials passed in the API call and the API credentials generated on the Dashboard.

Solution

The id provided does not exist

Error Status: 400

This error occurs when the Linked Account is invalid or does not belong to the requested merchant.

Solution

Curl

```bash
curl -X GET https://api.razorpay.com/v1/payments \
-u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-H 'X-Razorpay-Account: acc_IRQWUleX4BqvYn' \
```

Success

Failure

```json
{
  "entity": "collection",
  "count": 2,
  "items": [
    {
      "id": "pay_JJCqynf4fQS0N1",
      "entity": "payment",
      "amount": 10000,
      "currency": "INR",
      "status": "captured",
      "order_id": "order_JJCqnZG8f3754z",
      "invoice_id": null,
      "international": false,
      "method": "netbanking",
      "amount_refunded": 0,
      "refund_status": null,
      "captured": true,
      "description": "#JJCqaOhFihfkVE",
      "card_id": null,
      "bank": "YESB",
      "wallet": null,
      "vpa": null,
      "email": "john.example@example.com",
      "contact": "+919820958250",
      "notes": [],
      "fee": 236,
      "tax": 36,
      "error_code": null,
      "error_description": null,
      "error_source": null,
      "error_step": null,
      "error_reason": null,
      "acquirer_data": {
        "bank_transaction_id": "2118867"
      },
      "created_at": 1649932775
    },
    {
      "id": "pay_JHAe1Zat55GbZB",
      "entity": "payment",
      "amount": 5000,
      "currency": "INR",
      "status": "captured",
      "order_id": "order_IluGWxBm9U8zJ8",
      "invoice_id": null,
      "international": false,
      "method": "netbanking",
      "amount_refunded": 0,
      "refund_status": null,
      "captured": true,
      "description": "Test Transaction",
      "card_id": null,
      "bank": "KKBK",
      "wallet": null,
      "vpa": null,
      "email": "gaurav.kumar@example.com",
      "contact": "+919000090000",
      "notes": {
        "address": "Razorpay Corporate Office"
      },
      "fee": 118,
      "tax": 18,
      "error_code": null,
      "error_description": null,
      "error_source": null,
      "error_step": null,
      "error_reason": null,
      "acquirer_data": {
        "bank_transaction_id": "7003347"
      },
      "created_at": 1649488316
    }
  ]
}
```
