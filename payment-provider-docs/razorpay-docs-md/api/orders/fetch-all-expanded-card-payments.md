<!-- Source: https://razorpay.com/docs/api/orders/fetch-all-expanded-card-payments -->

# Fetch All Orders (With Expanded Card Payments)

Copy for AI

View as Markdown

`GET`

`/v1/orders?expand[]=payments.card`

Use this endpoint to retrieve the details of all the orders that you created, with the card parameter expanded in the payments object.

Sample Code

Query Parameters

1

Response Parameters

Errors

Curl

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET]
-X GET https://api.razorpay.com/v1/orders?expand[]=payments.card
```

Success

Failure

```json
{
  "entity": "collection",
  "count": 1,
  "items": [
    {
      "id": "order_MjehF7I6RXSm2o",
      "entity": "order",
      "amount": 500,
      "amount_paid": 500,
      "amount_due": 0,
      "currency": "",
      "receipt": null,
      "payments": {
        "entity": "collection",
        "count": 1,
        "items": [
          {
            "id": "pay_MjehkbJc3pPERF",
            "entity": "payment",
            "amount": 500,
            "currency": "",
            "status": "captured",
            "order_id": "order_MjehF7I6RXSm2o",
            "invoice_id": null,
            "international": false,
            "method": "card",
            "amount_refunded": 0,
            "refund_status": null,
            "captured": true,
            "description": null,
            "card_id": "card_MjehkeMkNIzhOb",
            "card": {
              "id": "card_MjehkeMkNIzhOb",
              "entity": "card",
              "name": "",
              "last4": "0153",
              "network": "Visa",
              "type": "debit",
              "issuer": null,
              "international": false,
              "emi": false,
              "sub_type": "consumer",
              "token_iin": null
            },
            "bank": null,
            "wallet": null,
            "vpa": null,
            "email": "gaurav.kumar@example.com",
            "contact": "+919876543210",
            "notes": [],
            "fee": 10,
            "tax": 0,
            "error_code": null,
            "error_description": null,
            "error_source": null,
            "error_step": null,
            "error_reason": null,
            "acquirer_data": {
              "auth_code": "486881"
            },
            "created_at": 1696318958
          }
        ]
      },
      "offer_id": null,
      "status": "paid",
      "attempts": 1,
      "notes": [],
      "created_at": 1696318929
    }
  ]
}
```

###### Query Parameters

`expand[]=payments.card`

`string`

Use to expand the card payments made for an order.

###### Response Parameters

`id`

`string`

The unique identifier of the order.

`entity`

`string`

Name of the entity. Here, it is `order`.

`amount`

`integer`

The amount for which the order was created, in currency subunits. For example, for an amount of ₹295, enter `29500`.

`amount_paid`

`integer`

The amount paid against the order.

`amount_due`

`integer`

The amount pending against the order.

`currency`

\*

`string`

ISO code for the currency in which you want to accept the payment. The default length is 3 characters.

`receipt`

`string`

Receipt number that corresponds to this order. Can have a maximum length of 40 characters and has to be unique.

`status`

`string`

The status of the order. Possible values:

- `created`: When you create an order it is in the `created` state. It stays in this state till a payment is attempted on it.
- `attempted`: An order moves from `created` to `attempted` state when a payment is first attempted on it. It remains in the `attempted` state till one payment associated with that order is captured.
- `paid`: After the successful capture of the payment, the order moves to the `paid` state. No further payment requests are permitted once the order moves to the `paid` state. The order stays in the `paid` state even if the payment associated with the order is refunded.

`attempts`

`integer`

The number of payment attempts, successful and failed, that have been made against this order.

`notes`

`json object`

Key-value pair that can be used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

`created_at`

`integer`

Indicates the Unix timestamp when this order was created.

`payments`

`object`

Details of the payment.

Show child parameters (30)

###### Errors

The API {key/secret} provided is invalid.

Error Status: 4xx

The API credentials passed in the API call differ from the ones generated on the Dashboard.

Solution

# Fetch All Orders (With Expanded Card Payments)

Copy for AI

View as Markdown

`GET`

`/v1/orders?expand[]=payments.card`

Use this endpoint to retrieve the details of all the orders that you created, with the card parameter expanded in the payments object.

Query Parameters

1

Response Parameters

Errors

###### Query Parameters

`expand[]=payments.card`

`string`

Use to expand the card payments made for an order.

###### Response Parameters

`id`

`string`

The unique identifier of the order.

`entity`

`string`

Name of the entity. Here, it is `order`.

`amount`

`integer`

The amount for which the order was created, in currency subunits. For example, for an amount of ₹295, enter `29500`.

`amount_paid`

`integer`

The amount paid against the order.

`amount_due`

`integer`

The amount pending against the order.

`currency`

\*

`string`

ISO code for the currency in which you want to accept the payment. The default length is 3 characters.

`receipt`

`string`

Receipt number that corresponds to this order. Can have a maximum length of 40 characters and has to be unique.

`status`

`string`

The status of the order. Possible values:

- `created`: When you create an order it is in the `created` state. It stays in this state till a payment is attempted on it.
- `attempted`: An order moves from `created` to `attempted` state when a payment is first attempted on it. It remains in the `attempted` state till one payment associated with that order is captured.
- `paid`: After the successful capture of the payment, the order moves to the `paid` state. No further payment requests are permitted once the order moves to the `paid` state. The order stays in the `paid` state even if the payment associated with the order is refunded.

`attempts`

`integer`

The number of payment attempts, successful and failed, that have been made against this order.

`notes`

`json object`

Key-value pair that can be used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

`created_at`

`integer`

Indicates the Unix timestamp when this order was created.

`payments`

`object`

Details of the payment.

Show child parameters (30)

###### Errors

The API {key/secret} provided is invalid.

Error Status: 4xx

The API credentials passed in the API call differ from the ones generated on the Dashboard.

Solution

Curl

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET]
-X GET https://api.razorpay.com/v1/orders?expand[]=payments.card
```

Success

Failure

```json
{
  "entity": "collection",
  "count": 1,
  "items": [
    {
      "id": "order_MjehF7I6RXSm2o",
      "entity": "order",
      "amount": 500,
      "amount_paid": 500,
      "amount_due": 0,
      "currency": "",
      "receipt": null,
      "payments": {
        "entity": "collection",
        "count": 1,
        "items": [
          {
            "id": "pay_MjehkbJc3pPERF",
            "entity": "payment",
            "amount": 500,
            "currency": "",
            "status": "captured",
            "order_id": "order_MjehF7I6RXSm2o",
            "invoice_id": null,
            "international": false,
            "method": "card",
            "amount_refunded": 0,
            "refund_status": null,
            "captured": true,
            "description": null,
            "card_id": "card_MjehkeMkNIzhOb",
            "card": {
              "id": "card_MjehkeMkNIzhOb",
              "entity": "card",
              "name": "",
              "last4": "0153",
              "network": "Visa",
              "type": "debit",
              "issuer": null,
              "international": false,
              "emi": false,
              "sub_type": "consumer",
              "token_iin": null
            },
            "bank": null,
            "wallet": null,
            "vpa": null,
            "email": "gaurav.kumar@example.com",
            "contact": "+919876543210",
            "notes": [],
            "fee": 10,
            "tax": 0,
            "error_code": null,
            "error_description": null,
            "error_source": null,
            "error_step": null,
            "error_reason": null,
            "acquirer_data": {
              "auth_code": "486881"
            },
            "created_at": 1696318958
          }
        ]
      },
      "offer_id": null,
      "status": "paid",
      "attempts": 1,
      "notes": [],
      "created_at": 1696318929
    }
  ]
}
```
