<!-- Source: https://razorpay.com/docs/api/payments/fetch-payments-orders -->

# Fetch Payments Based on Orders

`GET`

`/v1/orders/:id/payments`

Use this endpoint to retrieve payments corresponding to an order.

Sample Code

Path Parameters

1

Response Parameters

Errors

Curl

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET]
-X GET https://api.razorpay.com/v1/orders/order_DovFx48wjYEr2I/payments
```

Success - UPI

Success - Card

Failure

```json
{
  "entity": "collection",
  "count": 1,
  "items": [
    {
      "acquirer_data": {
        "rrn": "867001630595",
        "upi_transaction_id": "AXI217bee8713a042c0a55d0ffaa12528ed"
      },
      "amount": 102,
      "amount_captured": null,
      "amount_refunded": 0,
      "bank": null,
      "captured": true,
      "card_id": null,
      "contact": "+919000090000",
      "created_at": 1740728156,
      "currency": "INR",
      "description": null,
      "email": "gaurav.kumar@gmail.com",
      "entity": "payment",
      "error_code": null,
      "error_description": null,
      "error_reason": null,
      "error_source": null,
      "error_step": null,
      "fee": 2,
      "gateway_provider": "Razorpay",
      "id": "pay_Q13AaZ8lLVJbTX",
      "international": false,
      "invoice_id": null,
      "method": "upi",
      "notes": [],
      "order_id": "order_Q139NCRSCkyESs",
      "provider": null,
      "refund_status": null,
      "reward": null,
      "status": "captured",
      "tax": 0,
      "token_id": "token_78aXYt4Iy7ThPb",
      "upi": {
        "payer_account_type": "bank_account",
        "vpa": "gaurav.kumar@okicici",
        "flow": "intent"
      },
      "vpa": "gaurav.kumar@okicici",
      "wallet": null
    }
  ]
}
```

###### Path Parameters

`id`

\*

`string`

Unique identifier of the order for which you want to fetch payment details.

###### Response Parameters

`id`

`string`

Unique identifier of the payment.

`entity`

`string`

Indicates the type of entity.

`amount`

`integer`

The payment amount in currency subunits. For example, for an amount of ₹1 enter 100.

`currency`

`string`

The currency in which the payment is made. Refer to the list of [international currencies](/razorpay-docs-md/international-payments.md#supported-currencies) that we support.

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

The payment method used for making the payment. Possible values:

- `card`
- `netbanking`
- `wallet`
- `emi`
- `upi`

`order_id`

`string`

Order id, if provided. Know more about [Orders](/razorpay-docs-md/orders.md).

`description`

`string`

Description of the payment, if any.

`international`

`boolean`

Indicates whether the payment is done via an international card or a domestic one. Possible values:

- `true`: Payment made using international card.
- `false`: Payment not made using international card.

`refund_status`

`string`

The refund status of the payment. Possible values:

- `null`
- `partial`
- `full`

`amount_refunded`

`integer`

The amount refunded in currency subunits. For example, if `amount_refunded = 100`, it is equal to ₹1.

`captured`

`boolean`

Indicates if the payment is captured. Possible values:

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

Error that occurred during payment. For example, `BAD_REQUEST_ERROR`.

`error_description`

`string`

Description of the error that occurred during payment. For example, `Payment processing failed because of incorrect OTP`.

`error_source`

`string`

The point of failure. For example, `customer`.

`error_step`

`string`

The stage where the transaction failure occurred. The stages can vary depending on the payment method used to complete the transaction. For example, `payment_authentication`.

`error_reason`

`string`

The exact error reason. For example, `incorrect_otp`.

`notes`

`json object`

Contains user-defined fields, stored for reference purposes.

`created_at`

`integer`

Timestamp, in UNIX format, on which the payment was created.

`card_id`

`string`

The unique identifier of the card used by the customer to make the payment.

`card`

`object`

Details of the card used to make the payment.

Show child parameters (9)

`upi`

`object`

Details of the UPI payment received. Only applicable if `method` is `upi`.

Show child parameters (3)

`bank`

`string`

The 4-character bank code which the customer's account is associated with. For example, `UTIB` for Axis Bank.

`vpa`

`string`

The customer's VPA (Virtual Payment Address) or UPI id used to make the payment. For example, `gauravkumar@exampleupi`.

`wallet`

`string`

The name of the wallet used by the customer to make the payment. For example, `payzapp`.

`acquirer_data`

`array`

A dynamic array consisting of a unique reference numbers.

Show child parameters (3)

###### Errors

The API <key/secret> provided is invalid.

Error Status: 4xx

The API credentials passed in the API call differ from the ones generated on the Dashboard.

Solution

The id provided does not exist.

Error Status: 400

The `order_id` is missing.

Solution

\_id is not a valid id.

Error Status: 400

The `order_id` provided is incorrect.

Solution

# Fetch Payments Based on Orders

`GET`

`/v1/orders/:id/payments`

Use this endpoint to retrieve payments corresponding to an order.

Path Parameters

1

Response Parameters

Errors

###### Path Parameters

`id`

\*

`string`

Unique identifier of the order for which you want to fetch payment details.

###### Response Parameters

`id`

`string`

Unique identifier of the payment.

`entity`

`string`

Indicates the type of entity.

`amount`

`integer`

The payment amount in currency subunits. For example, for an amount of ₹1 enter 100.

`currency`

`string`

The currency in which the payment is made. Refer to the list of [international currencies](/razorpay-docs-md/international-payments.md#supported-currencies) that we support.

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

The payment method used for making the payment. Possible values:

- `card`
- `netbanking`
- `wallet`
- `emi`
- `upi`

`order_id`

`string`

Order id, if provided. Know more about [Orders](/razorpay-docs-md/orders.md).

`description`

`string`

Description of the payment, if any.

`international`

`boolean`

Indicates whether the payment is done via an international card or a domestic one. Possible values:

- `true`: Payment made using international card.
- `false`: Payment not made using international card.

`refund_status`

`string`

The refund status of the payment. Possible values:

- `null`
- `partial`
- `full`

`amount_refunded`

`integer`

The amount refunded in currency subunits. For example, if `amount_refunded = 100`, it is equal to ₹1.

`captured`

`boolean`

Indicates if the payment is captured. Possible values:

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

Error that occurred during payment. For example, `BAD_REQUEST_ERROR`.

`error_description`

`string`

Description of the error that occurred during payment. For example, `Payment processing failed because of incorrect OTP`.

`error_source`

`string`

The point of failure. For example, `customer`.

`error_step`

`string`

The stage where the transaction failure occurred. The stages can vary depending on the payment method used to complete the transaction. For example, `payment_authentication`.

`error_reason`

`string`

The exact error reason. For example, `incorrect_otp`.

`notes`

`json object`

Contains user-defined fields, stored for reference purposes.

`created_at`

`integer`

Timestamp, in UNIX format, on which the payment was created.

`card_id`

`string`

The unique identifier of the card used by the customer to make the payment.

`card`

`object`

Details of the card used to make the payment.

Show child parameters (9)

`upi`

`object`

Details of the UPI payment received. Only applicable if `method` is `upi`.

Show child parameters (3)

`bank`

`string`

The 4-character bank code which the customer's account is associated with. For example, `UTIB` for Axis Bank.

`vpa`

`string`

The customer's VPA (Virtual Payment Address) or UPI id used to make the payment. For example, `gauravkumar@exampleupi`.

`wallet`

`string`

The name of the wallet used by the customer to make the payment. For example, `payzapp`.

`acquirer_data`

`array`

A dynamic array consisting of a unique reference numbers.

Show child parameters (3)

###### Errors

The API <key/secret> provided is invalid.

Error Status: 4xx

The API credentials passed in the API call differ from the ones generated on the Dashboard.

Solution

The id provided does not exist.

Error Status: 400

The `order_id` is missing.

Solution

\_id is not a valid id.

Error Status: 400

The `order_id` provided is incorrect.

Solution

Curl

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET]
-X GET https://api.razorpay.com/v1/orders/order_DovFx48wjYEr2I/payments
```

Success - UPI

Success - Card

Failure

```json
{
  "entity": "collection",
  "count": 1,
  "items": [
    {
      "acquirer_data": {
        "rrn": "867001630595",
        "upi_transaction_id": "AXI217bee8713a042c0a55d0ffaa12528ed"
      },
      "amount": 102,
      "amount_captured": null,
      "amount_refunded": 0,
      "bank": null,
      "captured": true,
      "card_id": null,
      "contact": "+919000090000",
      "created_at": 1740728156,
      "currency": "INR",
      "description": null,
      "email": "gaurav.kumar@gmail.com",
      "entity": "payment",
      "error_code": null,
      "error_description": null,
      "error_reason": null,
      "error_source": null,
      "error_step": null,
      "fee": 2,
      "gateway_provider": "Razorpay",
      "id": "pay_Q13AaZ8lLVJbTX",
      "international": false,
      "invoice_id": null,
      "method": "upi",
      "notes": [],
      "order_id": "order_Q139NCRSCkyESs",
      "provider": null,
      "refund_status": null,
      "reward": null,
      "status": "captured",
      "tax": 0,
      "token_id": "token_78aXYt4Iy7ThPb",
      "upi": {
        "payer_account_type": "bank_account",
        "vpa": "gaurav.kumar@okicici",
        "flow": "intent"
      },
      "vpa": "gaurav.kumar@okicici",
      "wallet": null
    }
  ]
}
```
