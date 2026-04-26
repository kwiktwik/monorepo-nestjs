<!-- Source: https://razorpay.com/docs/api/payments/capture -->

# Capture a Payment

`POST`

`/v1/payments/:id/capture`

Use this endpoint to change the payment status from `authorized` to `captured`. Attempting to capture a payment whose status is not `authorized` will produce an error.

- After the customer's bank authorises the payment, you must verify if the authorised amount deducted from the customer's account is the same as the amount paid by the customer on your website or app.
- You can [configure automatic capture](/razorpay-docs-md/payments/capture-settings.md#auto-capture-all-payments)

  of payments on the Dashboard.

Sample Code

Path Parameters

1

Request Parameters

Response Parameters

Errors

Curl

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-H 'content-type: application/json' \
-X POST https://api.razorpay.com/v1/payments/pay_29QQoUBi66xm2f/capture \
-d '{
  "amount": 1000,
  "currency": "INR"
}'
```

Success

Failure

```json
{
  "id": "pay_G3P9vcIhRs3NV4",
  "entity": "payment",
  "amount": 1000,
  "currency": "INR",
  "status": "captured",
  "order_id": "order_GjCr5oKh4AVC51",
  "invoice_id": null,
  "international": false,
  "method": "card",
  "amount_refunded": 0,
  "refund_status": null,
  "captured": true,
  "description": "Payment for Adidas shoes",
  "card_id": "card_KOdY30ajbuyOYN",
  "bank": null,
  "wallet": null,
  "vpa": null,
  "email": "gaurav.kumar@example.com",
  "contact": "9000090000",
  "customer_id": "cust_K6fNE0WJZWGqtN",
  "token_id": "token_KOdY$DBYQOv08n",
  "notes": [],
  "fee": 1,
  "tax": 0,
  "error_code": null,
  "error_description": null,
  "error_source": null,
  "error_step": null,
  "error_reason": null,
  "acquirer_data": {
    "authentication_reference_number": "100222021120200000000742753928"
  },
  "created_at": 1605871409,
  "provider": null,
  "upi": {
      "payer_account_type": "credit_card",
      "vpa": "gaurav.kumar@examplebank",
      "flow": "intent"
  },
  "reward": null
}
```

###### Path Parameters

`id`

\*

`string`

Unique identifier of the payment to be captured.

###### Request Parameters

`amount`

\*

`integer`

The amount to be captured (should be equal to  the order amount, in the smallest unit of the currency). While creating a capture request, in the `amount` field, enter only the amount associated with the order that is stored in your database.

`currency`

\*

`string`

ISO code of the currency in which the payment was made. Refer to the [list of supported currencies](/razorpay-docs-md/international-payments.md#supported-currencies).

**Handy Tips**

Razorpay has added support for zero decimal currencies, such as JPY, and three decimal currencies, such as KWD, BHD, and OMR, allowing businesses to accept international payments in these currencies. Know more about [Currency Conversion](/razorpay-docs-md/international-payments/currency-conversion.md)

(May 2024).

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

Capture amount must be equal to the amount authorized.

Error Status: 400

- The capture amount is incorrect.
- The amount you are trying to capture differs from the authorised amount .

Solution

Your payment has been declined as the order is already paid. Please initiate the payment with a new order.

Error Status: 400

This payment has already been captured.

Solution

The id provided does not exist

Error Status: 400

The `payment_id` provided is incorrect.

Solution

The requested URL was not found on the server.

Error Status: 400

The URL is incorrect.

Solution

The amount must be an integer

Error Status: 400

The amount specified is incorrect.

Solution

# Capture a Payment

`POST`

`/v1/payments/:id/capture`

Use this endpoint to change the payment status from `authorized` to `captured`. Attempting to capture a payment whose status is not `authorized` will produce an error.

- After the customer's bank authorises the payment, you must verify if the authorised amount deducted from the customer's account is the same as the amount paid by the customer on your website or app.
- You can [configure automatic capture](/razorpay-docs-md/payments/capture-settings.md#auto-capture-all-payments)

  of payments on the Dashboard.

Path Parameters

1

Request Parameters

Response Parameters

Errors

###### Path Parameters

`id`

\*

`string`

Unique identifier of the payment to be captured.

###### Request Parameters

`amount`

\*

`integer`

The amount to be captured (should be equal to  the order amount, in the smallest unit of the currency). While creating a capture request, in the `amount` field, enter only the amount associated with the order that is stored in your database.

`currency`

\*

`string`

ISO code of the currency in which the payment was made. Refer to the [list of supported currencies](/razorpay-docs-md/international-payments.md#supported-currencies).

**Handy Tips**

Razorpay has added support for zero decimal currencies, such as JPY, and three decimal currencies, such as KWD, BHD, and OMR, allowing businesses to accept international payments in these currencies. Know more about [Currency Conversion](/razorpay-docs-md/international-payments/currency-conversion.md)

(May 2024).

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

Capture amount must be equal to the amount authorized.

Error Status: 400

- The capture amount is incorrect.
- The amount you are trying to capture differs from the authorised amount .

Solution

Your payment has been declined as the order is already paid. Please initiate the payment with a new order.

Error Status: 400

This payment has already been captured.

Solution

The id provided does not exist

Error Status: 400

The `payment_id` provided is incorrect.

Solution

The requested URL was not found on the server.

Error Status: 400

The URL is incorrect.

Solution

The amount must be an integer

Error Status: 400

The amount specified is incorrect.

Solution

Curl

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-H 'content-type: application/json' \
-X POST https://api.razorpay.com/v1/payments/pay_29QQoUBi66xm2f/capture \
-d '{
  "amount": 1000,
  "currency": "INR"
}'
```

Success

Failure

```json
{
  "id": "pay_G3P9vcIhRs3NV4",
  "entity": "payment",
  "amount": 1000,
  "currency": "INR",
  "status": "captured",
  "order_id": "order_GjCr5oKh4AVC51",
  "invoice_id": null,
  "international": false,
  "method": "card",
  "amount_refunded": 0,
  "refund_status": null,
  "captured": true,
  "description": "Payment for Adidas shoes",
  "card_id": "card_KOdY30ajbuyOYN",
  "bank": null,
  "wallet": null,
  "vpa": null,
  "email": "gaurav.kumar@example.com",
  "contact": "9000090000",
  "customer_id": "cust_K6fNE0WJZWGqtN",
  "token_id": "token_KOdY$DBYQOv08n",
  "notes": [],
  "fee": 1,
  "tax": 0,
  "error_code": null,
  "error_description": null,
  "error_source": null,
  "error_step": null,
  "error_reason": null,
  "acquirer_data": {
    "authentication_reference_number": "100222021120200000000742753928"
  },
  "created_at": 1605871409,
  "provider": null,
  "upi": {
      "payer_account_type": "credit_card",
      "vpa": "gaurav.kumar@examplebank",
      "flow": "intent"
  },
  "reward": null
}
```
