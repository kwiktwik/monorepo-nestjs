<!-- Source: https://razorpay.com/docs/api/orders/fetch-all-expanded-payments -->

# Fetch All Orders (With Expanded Payments)

Copy for AI

View as Markdown

`GET`

`/v1/orders?expand[]=payments`

Use this endpoint to retrieve the details of all the orders that you created, with the payment parameter expanded.

Sample Code

Query Parameters

1

Response Parameters

Curl

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET]
-X GET https://api.razorpay.com/v1/orders?expand[]=payments
```

Success

```json
{
  "entity": "collection",
  "count": 2,
  "items": [
    {
      "id": "order_EpMTIJM0rhOj3H",
      "entity": "order",
      "amount": 10000,
      "amount_paid": 0,
      "amount_due": 10000,
      "currency": "",
      "receipt": null,
      "payments": {
        "entity": "collection",
        "count": 1,
        "items": [
          {
            "id": "pay_EpMq4YcK0z5UYk",
            "entity": "payment",
            "amount": 10000,
            "currency": "",
            "status": "authorized",
            "order_id": "order_EpMTIJM0rhOj3H",
            "invoice_id": null,
            "international": false,
            "method": "card",
            "amount_refunded": 0,
            "refund_status": null,
            "captured": false,
            "description": null,
            "card_id": "card_EpMq4e7H6fHBQZ",
            "bank": null,
            "wallet": null,
            "vpa": null,
            "email": "gaurav.kumar@example.com",
            "contact": "+919876543210",
            "notes": [],
            "fee": null,
            "tax": null,
            "error_code": null,
            "error_description": null,
            "error_source": null,
            "error_step": null,
            "error_reason": null,
            "created_at": 1589269390
          }
        ]
      },
      "offer_id": null,
      "status": "attempted",
      "attempts": 1,
      "notes": [],
      "created_at": 1589268096
    },
    {
      "id": "order_Eoryq8z9wd0y7i",
      "entity": "order",
      "amount": 10000,
      "amount_paid": 0,
      "amount_due": 10000,
      "currency": "",
      "receipt": null,
      "payments": {
        "entity": "collection",
        "count": 1,
        "items": [
          {
            "id": "pay_EpMr7r6DRIdYPO",
            "entity": "payment",
            "amount": 10000,
            "currency": "",
            "status": "authorized",
            "order_id": "order_Eoryq8z9wd0y7i",
            "invoice_id": null,
            "international": false,
            "method": "card",
            "amount_refunded": 0,
            "refund_status": null,
            "captured": false,
            "description": null,
            "card_id": "card_EpMr7y6E5cDXvd",
            "bank": null,
            "wallet": null,
            "vpa": null,
            "email": "gaurav.kumar@example.com",
            "contact": "+919876543210",
            "notes": [],
            "fee": null,
            "tax": null,
            "error_code": null,
            "error_description": null,
            "error_source": null,
            "error_step": null,
            "error_reason": null,
            "created_at": 1589269450
          }
        ]
      },
      "offer_id": null,
      "status": "attempted",
      "attempts": 1,
      "notes": [],
      "created_at": 1589160718
    }
  ]
}
```

###### Query Parameters

`expand[]=payments`

`string`

Use to expand the payments made for an order.

###### Response Parameters

`id`

`string`

The unique identifier of the order.

`amount`

`integer`

The amount for which the order was created, in currency subunits. For example, for an amount of ₹295, enter `29500`.

`entity`

`string`

Name of the entity. Here, it is `order`.

`amount_paid`

`integer`

The amount paid against the order.

`amount_due`

`integer`

The amount pending against the order.

`currency`

\*

`string`

ISO code for the currency in which you want to accept the payment. The default length is 3 characters. Refer to the [list of supported currencies](/razorpay-docs-md/international-payments.md#supported-currencies).

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

Show child parameters (29)

# Fetch All Orders (With Expanded Payments)

Copy for AI

View as Markdown

`GET`

`/v1/orders?expand[]=payments`

Use this endpoint to retrieve the details of all the orders that you created, with the payment parameter expanded.

Query Parameters

1

Response Parameters

###### Query Parameters

`expand[]=payments`

`string`

Use to expand the payments made for an order.

###### Response Parameters

`id`

`string`

The unique identifier of the order.

`amount`

`integer`

The amount for which the order was created, in currency subunits. For example, for an amount of ₹295, enter `29500`.

`entity`

`string`

Name of the entity. Here, it is `order`.

`amount_paid`

`integer`

The amount paid against the order.

`amount_due`

`integer`

The amount pending against the order.

`currency`

\*

`string`

ISO code for the currency in which you want to accept the payment. The default length is 3 characters. Refer to the [list of supported currencies](/razorpay-docs-md/international-payments.md#supported-currencies).

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

Show child parameters (29)

Curl

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET]
-X GET https://api.razorpay.com/v1/orders?expand[]=payments
```

Success

```json
{
  "entity": "collection",
  "count": 2,
  "items": [
    {
      "id": "order_EpMTIJM0rhOj3H",
      "entity": "order",
      "amount": 10000,
      "amount_paid": 0,
      "amount_due": 10000,
      "currency": "",
      "receipt": null,
      "payments": {
        "entity": "collection",
        "count": 1,
        "items": [
          {
            "id": "pay_EpMq4YcK0z5UYk",
            "entity": "payment",
            "amount": 10000,
            "currency": "",
            "status": "authorized",
            "order_id": "order_EpMTIJM0rhOj3H",
            "invoice_id": null,
            "international": false,
            "method": "card",
            "amount_refunded": 0,
            "refund_status": null,
            "captured": false,
            "description": null,
            "card_id": "card_EpMq4e7H6fHBQZ",
            "bank": null,
            "wallet": null,
            "vpa": null,
            "email": "gaurav.kumar@example.com",
            "contact": "+919876543210",
            "notes": [],
            "fee": null,
            "tax": null,
            "error_code": null,
            "error_description": null,
            "error_source": null,
            "error_step": null,
            "error_reason": null,
            "created_at": 1589269390
          }
        ]
      },
      "offer_id": null,
      "status": "attempted",
      "attempts": 1,
      "notes": [],
      "created_at": 1589268096
    },
    {
      "id": "order_Eoryq8z9wd0y7i",
      "entity": "order",
      "amount": 10000,
      "amount_paid": 0,
      "amount_due": 10000,
      "currency": "",
      "receipt": null,
      "payments": {
        "entity": "collection",
        "count": 1,
        "items": [
          {
            "id": "pay_EpMr7r6DRIdYPO",
            "entity": "payment",
            "amount": 10000,
            "currency": "",
            "status": "authorized",
            "order_id": "order_Eoryq8z9wd0y7i",
            "invoice_id": null,
            "international": false,
            "method": "card",
            "amount_refunded": 0,
            "refund_status": null,
            "captured": false,
            "description": null,
            "card_id": "card_EpMr7y6E5cDXvd",
            "bank": null,
            "wallet": null,
            "vpa": null,
            "email": "gaurav.kumar@example.com",
            "contact": "+919876543210",
            "notes": [],
            "fee": null,
            "tax": null,
            "error_code": null,
            "error_description": null,
            "error_source": null,
            "error_step": null,
            "error_reason": null,
            "created_at": 1589269450
          }
        ]
      },
      "offer_id": null,
      "status": "attempted",
      "attempts": 1,
      "notes": [],
      "created_at": 1589160718
    }
  ]
}
```
