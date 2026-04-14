<!-- Source: https://razorpay.com/docs/api/payments/fetch-all-payments -->

# Fetch All Payments

`GET`

`/v1/payments`

Use this endpoint to retrieve details of all the payments. By default, only the last 10 records are displayed. You can use the `count` and `skip` parameters to retrieve the specific number of records that you need.

Sample Code

Query Parameters

4

Response Parameters

Errors

Curl

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET]
-X GET https://api.razorpay.com/v1/payments?from=1593320020&to=1624856020&count=2&skip=1
```

Success

Failure

```json
{
  "entity": "collection",
  "count": 2,
  "items": [
    {
      "id": "pay_KbCFyQ0t9Lmi1n",
      "entity": "payment",
      "amount": 1000,
      "currency": "INR",
      "status": "authorized",
      "order_id": null,
      "invoice_id": null,
      "international": false,
      "method": "netbanking",
      "amount_refunded": 0,
      "refund_status": null,
      "captured": false,
      "description": "Test Transaction",
      "card_id": null,
      "bank": "IBKL",
      "wallet": null,
      "vpa": null,
      "email": "gaurav.kumar@gmail.com",
      "contact": "+919000090000",
      "notes": {
        "address": "Razorpay Corporate Office"
      },
      "fee": null,
      "tax": null,
      "error_code": null,
      "error_description": null,
      "error_source": null,
      "error_step": null,
      "error_reason": null,
      "acquirer_data": {
        "bank_transaction_id": "5733649"
      },
      "created_at": 1667397881
    },
    {
      "id": "pay_KbCEDHh1IrU4RJ",
      "entity": "payment",
      "amount": 1000,
      "currency": "INR",
      "status": "authorized",
      "order_id": null,
      "invoice_id": null,
      "international": false,
      "method": "upi",
      "amount_refunded": 0,
      "refund_status": null,
      "captured": false,
      "description": "Test Transaction",
      "card_id": null,
      "bank": null,
      "wallet": null,
      "vpa": "gaurav.kumar@okhdfcbank",
      "upi": {
      "payer_account_type": "credit_card",
      "vpa": "gaurav.kumar@examplebank",
      "flow": "intent"
      }
      "email": "gaurav.kumar@gmail.com",
      "contact": "+919000090000",
      "notes": {
        "address": "Razorpay Corporate Office"
      },
      "fee": null,
      "tax": null,
      "error_code": null,
      "error_description": null,
      "error_source": null,
      "error_step": null,
      "error_reason": null,
      "acquirer_data": {
        "rrn": "230901495295",
        "upi_transaction_id": "6935B87A72C2A7BC83FA927AA264AD53"
      },
      "created_at": 1667397781
    }
  ]
}
```

###### Query Parameters

`from`

`integer`

UNIX timestamp, in seconds, from when payments are to be fetched.

`to`

`integer`

UNIX timestamp, in seconds, till when payments are to be fetched.

`count`

`integer`

Number of payments to be fetched.
 Default value is 10. Maximum value is 100. This can be used for pagination, in combination with the `skip` parameter.

`skip`

`integer`

Number of records to be skipped while fetching the payments.

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

`issuer`

`string`

The card issuer. The 4-character code denotes the issuing bank. This attribute will not be set for the card issued by a foreign bank.

`emi`

`boolean`

Indicates whether the card can be used for EMI payment method. Possible values:

- `true`: Card can be used for EMI payments.
- `false`: Card cannot be used for EMI payments.

`sub_type`

`string`

The sub-type of the customer's card. Possible values:

- `customer`
- `business`
  Know how to accept payments made by customers using [corporate cards](/razorpay-docs-md/payment-methods/cards/corporate-cards.md)  .

Show child parameters (4)

###### Errors

The API {key/secret} provided is invalid.

Error Status: 4xx

The API credentials passed in the API call differ from the ones generated on the Dashboard.

Solution

from must be between 946684800 and 4765046400

Error Status: 400

The time range entered is invalid.

Solution

# Fetch All Payments

`GET`

`/v1/payments`

Use this endpoint to retrieve details of all the payments. By default, only the last 10 records are displayed. You can use the `count` and `skip` parameters to retrieve the specific number of records that you need.

Query Parameters

4

Response Parameters

Errors

###### Query Parameters

`from`

`integer`

UNIX timestamp, in seconds, from when payments are to be fetched.

`to`

`integer`

UNIX timestamp, in seconds, till when payments are to be fetched.

`count`

`integer`

Number of payments to be fetched.
 Default value is 10. Maximum value is 100. This can be used for pagination, in combination with the `skip` parameter.

`skip`

`integer`

Number of records to be skipped while fetching the payments.

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

`issuer`

`string`

The card issuer. The 4-character code denotes the issuing bank. This attribute will not be set for the card issued by a foreign bank.

`emi`

`boolean`

Indicates whether the card can be used for EMI payment method. Possible values:

- `true`: Card can be used for EMI payments.
- `false`: Card cannot be used for EMI payments.

`sub_type`

`string`

The sub-type of the customer's card. Possible values:

- `customer`
- `business`
  Know how to accept payments made by customers using [corporate cards](/razorpay-docs-md/payment-methods/cards/corporate-cards.md)  .

Show child parameters (4)

###### Errors

The API {key/secret} provided is invalid.

Error Status: 4xx

The API credentials passed in the API call differ from the ones generated on the Dashboard.

Solution

from must be between 946684800 and 4765046400

Error Status: 400

The time range entered is invalid.

Solution

Curl

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET]
-X GET https://api.razorpay.com/v1/payments?from=1593320020&to=1624856020&count=2&skip=1
```

Success

Failure

```json
{
  "entity": "collection",
  "count": 2,
  "items": [
    {
      "id": "pay_KbCFyQ0t9Lmi1n",
      "entity": "payment",
      "amount": 1000,
      "currency": "INR",
      "status": "authorized",
      "order_id": null,
      "invoice_id": null,
      "international": false,
      "method": "netbanking",
      "amount_refunded": 0,
      "refund_status": null,
      "captured": false,
      "description": "Test Transaction",
      "card_id": null,
      "bank": "IBKL",
      "wallet": null,
      "vpa": null,
      "email": "gaurav.kumar@gmail.com",
      "contact": "+919000090000",
      "notes": {
        "address": "Razorpay Corporate Office"
      },
      "fee": null,
      "tax": null,
      "error_code": null,
      "error_description": null,
      "error_source": null,
      "error_step": null,
      "error_reason": null,
      "acquirer_data": {
        "bank_transaction_id": "5733649"
      },
      "created_at": 1667397881
    },
    {
      "id": "pay_KbCEDHh1IrU4RJ",
      "entity": "payment",
      "amount": 1000,
      "currency": "INR",
      "status": "authorized",
      "order_id": null,
      "invoice_id": null,
      "international": false,
      "method": "upi",
      "amount_refunded": 0,
      "refund_status": null,
      "captured": false,
      "description": "Test Transaction",
      "card_id": null,
      "bank": null,
      "wallet": null,
      "vpa": "gaurav.kumar@okhdfcbank",
      "upi": {
      "payer_account_type": "credit_card",
      "vpa": "gaurav.kumar@examplebank",
      "flow": "intent"
      }
      "email": "gaurav.kumar@gmail.com",
      "contact": "+919000090000",
      "notes": {
        "address": "Razorpay Corporate Office"
      },
      "fee": null,
      "tax": null,
      "error_code": null,
      "error_description": null,
      "error_source": null,
      "error_step": null,
      "error_reason": null,
      "acquirer_data": {
        "rrn": "230901495295",
        "upi_transaction_id": "6935B87A72C2A7BC83FA927AA264AD53"
      },
      "created_at": 1667397781
    }
  ]
}
```
