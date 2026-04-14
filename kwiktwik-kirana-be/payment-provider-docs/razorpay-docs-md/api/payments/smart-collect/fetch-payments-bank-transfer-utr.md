<!-- Source: https://razorpay.com/docs/api/payments/smart-collect/fetch-payments-bank-transfer-utr -->

# Fetch Payments Using UTR Number

`GET`

`/v1/payments?skip=0&count=25&va_transaction_id=:id&virtual_account=1`

Use this endpoint to retrieve details of payments made using the bank transfer method via UTR.

Sample Code

Query Parameters

4

Response Parameters

Errors

Curl

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X GET \
https://api.razorpay.com/v1/payments?skip=0&count=25&va_transaction_id=209817848101&virtual_account=1
-H "Content-Type: application/json" \
```

Success

Failure

```json
{
  "entity": "collection",
  "count": 1,
  "items": [
    {
      "id": "pay_JGmL38CqCHTyZZ",
      "entity": "payment",
      "amount": 1000,
      "currency": "INR",
      "status": "captured",
      "order_id": null,
      "invoice_id": null,
      "international": false,
      "method": "upi",
      "amount_refunded": 0,
      "refund_status": null,
      "captured": true,
      "description": null,
      "card_id": null,
      "bank": null,
      "wallet": null,
      "vpa": "gaurav.kumar@exampleupi ",
      "email": "saurav.kumar@example.com",
      "contact": "+919900990099",
      "customer_id": "cust_HWj3MjySAHSjtq",
      "notes": [],
      "fee": 12,
      "tax": 2,
      "error_code": null,
      "error_description": null,
      "error_source": null,
      "error_step": null,
      "error_reason": null,
      "acquirer_data": {
        "rrn": "209817848101"
      },
      "created_at": 1649402719
    }
  ]
}
```

###### Query Parameters

`count`

`integer`

Number of payments to be fetched. Default value is 10. Maximum value is 100. This can be used for pagination, in combination with the `skip` parameter.

`skip`

`integer`

Number of records to be skipped while fetching the payments.

`va_transaction_id`

`integer`

The UTR number or the unique transaction id of the transaction done via a Customer Identifier.

`virtual_account`

`integer`

The product used to fetch is Customer Identifiers.
Possible values: `1`

###### Response Parameters

`id`

`string`

UTR number or unique transaction id of the transaction.

`entity`

`string`

Indicates the type of entity.

`amount`

`integer`

The payment amount in currency subunits. For example, `amount_refunded = 1000` indicates ₹10.00.

`currency`

`string`

The currency in which the payment is made.

`status`

`string`

The status of the payment. Possible values:

- `created`
- `authorised`
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

The amount refunded in currency subunits. For example, `amount_refunded = 1000` indicates ₹10.00.

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

Occurs when there is a mismatch between the API credentials passed in the API call and the API credentials generated on the dashboard.

Solution

# Fetch Payments Using UTR Number

`GET`

`/v1/payments?skip=0&count=25&va_transaction_id=:id&virtual_account=1`

Use this endpoint to retrieve details of payments made using the bank transfer method via UTR.

Query Parameters

4

Response Parameters

Errors

###### Query Parameters

`count`

`integer`

Number of payments to be fetched. Default value is 10. Maximum value is 100. This can be used for pagination, in combination with the `skip` parameter.

`skip`

`integer`

Number of records to be skipped while fetching the payments.

`va_transaction_id`

`integer`

The UTR number or the unique transaction id of the transaction done via a Customer Identifier.

`virtual_account`

`integer`

The product used to fetch is Customer Identifiers.
Possible values: `1`

###### Response Parameters

`id`

`string`

UTR number or unique transaction id of the transaction.

`entity`

`string`

Indicates the type of entity.

`amount`

`integer`

The payment amount in currency subunits. For example, `amount_refunded = 1000` indicates ₹10.00.

`currency`

`string`

The currency in which the payment is made.

`status`

`string`

The status of the payment. Possible values:

- `created`
- `authorised`
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

The amount refunded in currency subunits. For example, `amount_refunded = 1000` indicates ₹10.00.

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

Occurs when there is a mismatch between the API credentials passed in the API call and the API credentials generated on the dashboard.

Solution

Curl

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X GET \
https://api.razorpay.com/v1/payments?skip=0&count=25&va_transaction_id=209817848101&virtual_account=1
-H "Content-Type: application/json" \
```

Success

Failure

```json
{
  "entity": "collection",
  "count": 1,
  "items": [
    {
      "id": "pay_JGmL38CqCHTyZZ",
      "entity": "payment",
      "amount": 1000,
      "currency": "INR",
      "status": "captured",
      "order_id": null,
      "invoice_id": null,
      "international": false,
      "method": "upi",
      "amount_refunded": 0,
      "refund_status": null,
      "captured": true,
      "description": null,
      "card_id": null,
      "bank": null,
      "wallet": null,
      "vpa": "gaurav.kumar@exampleupi ",
      "email": "saurav.kumar@example.com",
      "contact": "+919900990099",
      "customer_id": "cust_HWj3MjySAHSjtq",
      "notes": [],
      "fee": 12,
      "tax": 2,
      "error_code": null,
      "error_description": null,
      "error_source": null,
      "error_step": null,
      "error_reason": null,
      "acquirer_data": {
        "rrn": "209817848101"
      },
      "created_at": 1649402719
    }
  ]
}
```
