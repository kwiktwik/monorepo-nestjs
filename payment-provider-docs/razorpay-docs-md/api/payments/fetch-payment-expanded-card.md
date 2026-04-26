<!-- Source: https://razorpay.com/docs/api/payments/fetch-payment-expanded-card -->

# Fetch a Payment (With Expanded Card Details)

Copy for AI

View as Markdown

`GET`

`/v1/payments/:id/?expand[]=card`

Use this endpoint to retrieve the details of all the payments that you created, with the `card` parameter expanded in the payments object.

Sample Code

Path Parameters

1

Query Parameters

1

Response Parameters

Errors

Curl

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET]
-X GET https://api.razorpay.com/v1/payments/pay_DG4a4vAWvKrh79/?expand[]=card
```

Success

Failure

```json
{
  "id": "pay_H9oR0gLCaVlV6m",
  "entity": "payment",
  "amount": 100,
  "currency": "INR",
  "status": "failed",
  "order_id": "order_H9o58N6qmLYQKC",
  "invoice_id": null,
  "terminal_id": "term_G5kJnYM9GhhLYT",
  "international": false,
  "method": "card",
  "amount_refunded": 0,
  "refund_status": null,
  "captured": false,
  "description": null,
  "card_id": "card_H9oR0ocen1cmZq",
  "card": {
    "id": "card_H9oR0ocen1cmZq",
    "entity": "card",
    "name": "Gaurav",
    "last4": "1213",
    "network": "RuPay",
    "type": "credit",
    "issuer": "UTIB",
    "international": false,
    "emi": false,
    "sub_type": "business"
  },
  "bank": null,
  "wallet": null,
  "vpa": null,
  "email": "gaurav.kumar@example.com",
  "contact": "+919000090000",
  "notes": {
    "email": "gaurav.kumar@example.com",
    "phone": "09000090000"
  },
  "fee": null,
  "tax": null,
  "error_code": "BAD_REQUEST_ERROR",
  "error_description": "Card issuer is invalid",
  "error_source": "customer",
  "error_step": "payment_authentication",
  "error_reason": "incorrect_card_details",
  "acquirer_data": {
    "auth_code": null,
    "authentication_reference_number": "100222021120200000000742753928" // Pass AEVV as the value for AMEX card transactions.
  },
  "created_at": 1620807547
}
```

###### Path Parameters

`id`

\*

`string`

Unique identifier of the payment to be retrieved.

###### Query Parameters

`expand[]=card`

`string`

Use to expand the card details when the payment method is `card`.

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

The API {key/secret} provided is invalid.

Error Status: 4xx

The API credentials passed in the API call differ from the ones generated on the Dashboard.

Solution

# Fetch a Payment (With Expanded Card Details)

Copy for AI

View as Markdown

`GET`

`/v1/payments/:id/?expand[]=card`

Use this endpoint to retrieve the details of all the payments that you created, with the `card` parameter expanded in the payments object.

Path Parameters

1

Query Parameters

1

Response Parameters

Errors

###### Path Parameters

`id`

\*

`string`

Unique identifier of the payment to be retrieved.

###### Query Parameters

`expand[]=card`

`string`

Use to expand the card details when the payment method is `card`.

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

The API {key/secret} provided is invalid.

Error Status: 4xx

The API credentials passed in the API call differ from the ones generated on the Dashboard.

Solution

Curl

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET]
-X GET https://api.razorpay.com/v1/payments/pay_DG4a4vAWvKrh79/?expand[]=card
```

Success

Failure

```json
{
  "id": "pay_H9oR0gLCaVlV6m",
  "entity": "payment",
  "amount": 100,
  "currency": "INR",
  "status": "failed",
  "order_id": "order_H9o58N6qmLYQKC",
  "invoice_id": null,
  "terminal_id": "term_G5kJnYM9GhhLYT",
  "international": false,
  "method": "card",
  "amount_refunded": 0,
  "refund_status": null,
  "captured": false,
  "description": null,
  "card_id": "card_H9oR0ocen1cmZq",
  "card": {
    "id": "card_H9oR0ocen1cmZq",
    "entity": "card",
    "name": "Gaurav",
    "last4": "1213",
    "network": "RuPay",
    "type": "credit",
    "issuer": "UTIB",
    "international": false,
    "emi": false,
    "sub_type": "business"
  },
  "bank": null,
  "wallet": null,
  "vpa": null,
  "email": "gaurav.kumar@example.com",
  "contact": "+919000090000",
  "notes": {
    "email": "gaurav.kumar@example.com",
    "phone": "09000090000"
  },
  "fee": null,
  "tax": null,
  "error_code": "BAD_REQUEST_ERROR",
  "error_description": "Card issuer is invalid",
  "error_source": "customer",
  "error_step": "payment_authentication",
  "error_reason": "incorrect_card_details",
  "acquirer_data": {
    "auth_code": null,
    "authentication_reference_number": "100222021120200000000742753928" // Pass AEVV as the value for AMEX card transactions.
  },
  "created_at": 1620807547
}
```
