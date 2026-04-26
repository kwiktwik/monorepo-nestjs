<!-- Source: https://razorpay.com/docs/api/qr-codes/gst/fetch-payments -->

# Fetch Payments for a QR Code

`GET`

`/v1/payments/qr_codes/:qr_id/payments`

Use this endpoint to fetch the payments made on a QR Code using this endpoint.

Sample Code

Path Parameters

1

Query Parameters

4

Response Parameters

Curl

```bash
curl -u <YOUR_KEY_ID>:<YOUR_KEY_SECRET> \
-X GET https://api.razorpay.com/v1/payments/qr_codes/qr_FuZIYx6rMbP6gs/payments \
```

Success

```json
{
  "entity": "collection",
  "count": 2,
  "items": [
    {
      "id": "pay_HMtDKn3TnF4D8x",
      "entity": "payment",
      "amount": 500,
      "currency": "INR",
      "status": "captured",
      "order_id": null,
      "invoice_id": null,
      "international": false,
      "method": "upi",
      "amount_refunded": 0,
      "refund_status": null,
      "captured": true,
      "description": "QRv2 Payment",
      "card_id": null,
      "bank": null,
      "wallet": null,
      "vpa": "gauri.kumari@okhdfcbank",
      "email": "gauri.kumari@example.com",
      "contact": "+919000090000",
      "customer_id": "cust_HKsR5se84c5LTO",
      "notes": [],
      "fee": 0,
      "tax": 0,
      "error_code": null,
      "error_description": null,
      "error_source": null,
      "error_step": null,
      "error_reason": null,
      "acquirer_data": {
        "rrn": "116514257019"
      },
      "created_at": 1623662800
    },
    {
      "id": "pay_HMsr242ZnaLumA",
      "entity": "payment",
      "amount": 1000,
      "currency": "INR",
      "status": "refunded",
      "order_id": null,
      "invoice_id": null,
      "international": false,
      "method": "upi",
      "amount_refunded": 1000,
      "refund_status": "full",
      "captured": true,
      "description": "QRv2 Payment",
      "card_id": null,
      "bank": null,
      "wallet": null,
      "vpa": "gauri.kumari@okhdfcbank",
      "email": "gauri.kumari@example.com",
      "contact": "+919000090000",
      "customer_id": "cust_HKsR5se84c5LTO",
      "notes": [],
      "fee": 0,
      "tax": 0,
      "error_code": null,
      "error_description": null,
      "error_source": null,
      "error_step": null,
      "error_reason": null,
      "acquirer_data": {
        "rrn": "116514090501"
      },
      "created_at": 1623661533
    }
  ]
}
```

###### Path Parameters

`id`

\*

`string`

The unique identifier of the QR Code.

###### Query Parameters

`from`

`integer`

Timestamp, in seconds, from when payments are to be fetched.

`to`

`integer`

Timestamp, in seconds, till when payments are to be fetched.

`count`

`integer`

Number of payments to be fetched. The default value is `10` and the maximum value is `100`. This can be used for pagination, in combination with `skip`.

`skip`

`integer`

Number of records to be skipped while fetching the payments. This can be used for pagination, in combination with `count`.

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

# Fetch Payments for a QR Code

`GET`

`/v1/payments/qr_codes/:qr_id/payments`

Use this endpoint to fetch the payments made on a QR Code using this endpoint.

Path Parameters

1

Query Parameters

4

Response Parameters

###### Path Parameters

`id`

\*

`string`

The unique identifier of the QR Code.

###### Query Parameters

`from`

`integer`

Timestamp, in seconds, from when payments are to be fetched.

`to`

`integer`

Timestamp, in seconds, till when payments are to be fetched.

`count`

`integer`

Number of payments to be fetched. The default value is `10` and the maximum value is `100`. This can be used for pagination, in combination with `skip`.

`skip`

`integer`

Number of records to be skipped while fetching the payments. This can be used for pagination, in combination with `count`.

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

Curl

```bash
curl -u <YOUR_KEY_ID>:<YOUR_KEY_SECRET> \
-X GET https://api.razorpay.com/v1/payments/qr_codes/qr_FuZIYx6rMbP6gs/payments \
```

Success

```json
{
  "entity": "collection",
  "count": 2,
  "items": [
    {
      "id": "pay_HMtDKn3TnF4D8x",
      "entity": "payment",
      "amount": 500,
      "currency": "INR",
      "status": "captured",
      "order_id": null,
      "invoice_id": null,
      "international": false,
      "method": "upi",
      "amount_refunded": 0,
      "refund_status": null,
      "captured": true,
      "description": "QRv2 Payment",
      "card_id": null,
      "bank": null,
      "wallet": null,
      "vpa": "gauri.kumari@okhdfcbank",
      "email": "gauri.kumari@example.com",
      "contact": "+919000090000",
      "customer_id": "cust_HKsR5se84c5LTO",
      "notes": [],
      "fee": 0,
      "tax": 0,
      "error_code": null,
      "error_description": null,
      "error_source": null,
      "error_step": null,
      "error_reason": null,
      "acquirer_data": {
        "rrn": "116514257019"
      },
      "created_at": 1623662800
    },
    {
      "id": "pay_HMsr242ZnaLumA",
      "entity": "payment",
      "amount": 1000,
      "currency": "INR",
      "status": "refunded",
      "order_id": null,
      "invoice_id": null,
      "international": false,
      "method": "upi",
      "amount_refunded": 1000,
      "refund_status": "full",
      "captured": true,
      "description": "QRv2 Payment",
      "card_id": null,
      "bank": null,
      "wallet": null,
      "vpa": "gauri.kumari@okhdfcbank",
      "email": "gauri.kumari@example.com",
      "contact": "+919000090000",
      "customer_id": "cust_HKsR5se84c5LTO",
      "notes": [],
      "fee": 0,
      "tax": 0,
      "error_code": null,
      "error_description": null,
      "error_source": null,
      "error_step": null,
      "error_reason": null,
      "acquirer_data": {
        "rrn": "116514090501"
      },
      "created_at": 1623661533
    }
  ]
}
```
