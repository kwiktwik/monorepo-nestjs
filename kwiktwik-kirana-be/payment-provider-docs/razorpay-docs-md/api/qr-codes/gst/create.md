<!-- Source: https://razorpay.com/docs/api/qr-codes/gst/create -->

# Create a QR Code

`POST`

`/v1/payments/qr_codes`

Use this endpoint to create a QR Code.

- You can share the short URL with customers to accept payments.
- You can print and download it.
- You can create QR Codes for single or multiple use and for specific or all customers.

Sample Code

Request Parameters

Response Parameters

Curl

```bash
curl -u <YOUR_KEY_ID>:<YOUR_KEY_SECRET> \
-X POST https://api.razorpay.com/v1/payments/qr_codes \
-H "Content-Type: application/json" \
-d '{
  "type": "upi_qr",
  "name": "Store_1",
  "usage": "single_use",
  "fixed_amount": true,
  "payment_amount": 300,
  "description": "For Store 1",
  "customer_id": "cust_HKsR5se84c5LTO",
  "close_by": 1681615838,
  "notes": {
    "purpose": "Test UPI QR Code notes"
  },
  "tax_invoice": {
    "number": "INV001",
    "date": 1589994898,
    "customer_name": "Gaurav Kumar",
    "business_gstin": "06AABCU9605R1ZR",
    "gst_amount": 4000,
    "cess_amount": 0,
    "supply_type": "interstate"
  }
}'
```

Success

```json
{
  "id": "qr_HMsVL8HOpbMcjU",
  "entity": "qr_code",
  "created_at": 1623660301,
  "name": "Store_1",
  "usage": "single_use",
  "type": "upi_qr",
  "image_url": "https://rzp.io/i/BWcUVrLp",
  "payment_amount": 300,
  "status": "active",
  "description": "For Store 1",
  "fixed_amount": true,
  "payments_amount_received": 0,
  "payments_count_received": 0,
  "notes": {
    "purpose": "Test UPI QR Code notes"
  },
  "customer_id": "cust_HKsR5se84c5LTO",
  "close_by": 1681615838,
  "tax_invoice": {
    "number": "INV001",
    "date": 1589994898,
    "customer_name": "Gaurav Kumar",
    "business_gstin": "06AABCU9605R1ZR",
    "gst_amount": 4000,
    "cess_amount": 0,
    "supply_type": "interstate"
  }
}
```

###### Request Parameters

`type`

\*

`string`

The type of the QR Code. Possible values:

- `upi_qr`: Create a QR Code that accepts only UPI payments.

`name`

`string`

Label entered to identify the QR Code. For example, `Store Front Display`.

`usage`

\*

`string`

Indicates if the QR Code should be allowed to accept single payment or multiple payments. Possible values:

- `single_use`: QR Code will accept only one payment and then close automatically.
- `multiple_use` (default): QR Code will accept multiple payments.

`fixed_amount`

`boolean`

Indicates if the QR should accept payments of specific amounts or any amount. Possible values:

- `true`: QR Code accepts only a specific amount.
- `false` (default): QR Code accepts any amount.

`payment_amount`

`integer`

The amount allowed for a transaction. If this is specified, then any transaction of an amount less than or more than this value is not allowed. For example, if this amount is set as `500000`, the customer cannot pay an amount less than or more than ₹5000. This is a mandatory parameter if **fixed\_amount** is selected.

`description`

`string`

A brief description about the QR Code.

`notes`

`object`

Key-value pair that can be used to store additional information about the QR Code. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

`customer_id`

`string`

Unique identifier of the customer the QR Code is linked with. Know more about to the [Customers API](/razorpay-docs-md/api/customers.md).

`close_by`

`integer`

UNIX timestamp at which the QR Code is scheduled to be automatically closed. The time must be at least 2 minutes after the current time. The date range can be set to `2147483647` in UNIX timestamp format (equivalent to Tuesday, January 19, 2038 8:44:07 AM GMT+05:30). Any request beyond 2147483647 UNIX timestamp will fail.

`tax_invoice`

`json object`

This block contains information about the invoices. If not provided, the transaction will default to non-GST compliant UPI flow.

Show child parameters (7)

###### Response Parameters

`id`

`string`

The unique identifier of the QR Code.

`entity`

`string`

Indicates the type of entity. Here, it is `qr_code`.

`tax_invoice`

`json object`

This block contains information about the invoices. If not provided, the transaction will default to non-GST compliant UPI flow.

Show child parameters (7)

`type`

`string`

The type of the QR Code. Possible values:

- `upi_qr`: Create a QR Code that accepts only UPI payments.

`image_url`

`string`

The URL of the QR Code. A sample short URL looks like this `http://rzp.io/l6MS`. Click the link to download the code.

`name`

`string`

Label entered to identify the QR Code. For example, `Store Front Display`.

`usage`

`string`

Indicates if the QR Code should be allowed to accept single payment or multiple payments. Possible values:

- `single_use`: QR Code will accept only one payment and then close automatically.
- `multiple_use` (default): QR Code will accept multiple payments.

`fixed_amount`

`boolean`

Indicates if the QR should accept payments of specific amounts or any amount. Possible values:

- `true`: QR Code accepts only a specific amount.
- `false` (default): QR Code accepts any amount.

`payment_amount`

`integer`

The amount allowed for a transaction. If this is specified, then any transaction of an amount less than or more than this value is not allowed. For example, if this amount is set as `500000`, the customer cannot pay an amount less than or more than ₹5000.

`status`

`string`

Indicates the status of the QR Code. Possible values:

- `active`
- `closed`

`description`

`string`

A brief description about the QR Code.

`payments_amount_received`

`integer`

The total amount received on the QR Code. All captured payments are considered.

`payments_count_received`

`integer`

The total number of payments received on the QR Code. All captured payments are considered.

`notes`

`object`

Key-value pair that can be used to store additional information about the QR Code. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

`customer_id`

`string`

Unique identifier of the customer the QR Code is linked with. Know more about to the [Customers API](/razorpay-docs-md/api/customers.md).

`close_by`

`integer`

UNIX timestamp at which the QR Code is scheduled to be automatically closed. The time must be at least 15 minutes after the current time. The date range can be set to `2147483647` in UNIX timestamp format (equivalent to Tuesday, January 19, 2038 8:44:07 AM GMT+05:30).

**Watch Out**

Any request beyond 2147483647 UNIX timestamp will fail.

`closed_at`

`integer`

UNIX timestamp at which the QR Code is automatically closed.

`created_at`

`integer`

UNIX timestamp at which the QR Code was created.

`close_reason`

`string`

The reason for the closure of the QR Code. Possible values:

- `on_demand`: When you close the QR Code using the APIs or the Dashboard.
- `paid`: If the QR Code is created with the `usage=single_payment` parameter, the QR Code closes automatically once the customer makes the payment, with the reason marked as `paid`.
- `null`: The QR Code has not been closed yet.

# Create a QR Code

`POST`

`/v1/payments/qr_codes`

Use this endpoint to create a QR Code.

- You can share the short URL with customers to accept payments.
- You can print and download it.
- You can create QR Codes for single or multiple use and for specific or all customers.

Request Parameters

Response Parameters

###### Request Parameters

`type`

\*

`string`

The type of the QR Code. Possible values:

- `upi_qr`: Create a QR Code that accepts only UPI payments.

`name`

`string`

Label entered to identify the QR Code. For example, `Store Front Display`.

`usage`

\*

`string`

Indicates if the QR Code should be allowed to accept single payment or multiple payments. Possible values:

- `single_use`: QR Code will accept only one payment and then close automatically.
- `multiple_use` (default): QR Code will accept multiple payments.

`fixed_amount`

`boolean`

Indicates if the QR should accept payments of specific amounts or any amount. Possible values:

- `true`: QR Code accepts only a specific amount.
- `false` (default): QR Code accepts any amount.

`payment_amount`

`integer`

The amount allowed for a transaction. If this is specified, then any transaction of an amount less than or more than this value is not allowed. For example, if this amount is set as `500000`, the customer cannot pay an amount less than or more than ₹5000. This is a mandatory parameter if **fixed\_amount** is selected.

`description`

`string`

A brief description about the QR Code.

`notes`

`object`

Key-value pair that can be used to store additional information about the QR Code. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

`customer_id`

`string`

Unique identifier of the customer the QR Code is linked with. Know more about to the [Customers API](/razorpay-docs-md/api/customers.md).

`close_by`

`integer`

UNIX timestamp at which the QR Code is scheduled to be automatically closed. The time must be at least 2 minutes after the current time. The date range can be set to `2147483647` in UNIX timestamp format (equivalent to Tuesday, January 19, 2038 8:44:07 AM GMT+05:30). Any request beyond 2147483647 UNIX timestamp will fail.

`tax_invoice`

`json object`

This block contains information about the invoices. If not provided, the transaction will default to non-GST compliant UPI flow.

Show child parameters (7)

###### Response Parameters

`id`

`string`

The unique identifier of the QR Code.

`entity`

`string`

Indicates the type of entity. Here, it is `qr_code`.

`tax_invoice`

`json object`

This block contains information about the invoices. If not provided, the transaction will default to non-GST compliant UPI flow.

Show child parameters (7)

`type`

`string`

The type of the QR Code. Possible values:

- `upi_qr`: Create a QR Code that accepts only UPI payments.

`image_url`

`string`

The URL of the QR Code. A sample short URL looks like this `http://rzp.io/l6MS`. Click the link to download the code.

`name`

`string`

Label entered to identify the QR Code. For example, `Store Front Display`.

`usage`

`string`

Indicates if the QR Code should be allowed to accept single payment or multiple payments. Possible values:

- `single_use`: QR Code will accept only one payment and then close automatically.
- `multiple_use` (default): QR Code will accept multiple payments.

`fixed_amount`

`boolean`

Indicates if the QR should accept payments of specific amounts or any amount. Possible values:

- `true`: QR Code accepts only a specific amount.
- `false` (default): QR Code accepts any amount.

`payment_amount`

`integer`

The amount allowed for a transaction. If this is specified, then any transaction of an amount less than or more than this value is not allowed. For example, if this amount is set as `500000`, the customer cannot pay an amount less than or more than ₹5000.

`status`

`string`

Indicates the status of the QR Code. Possible values:

- `active`
- `closed`

`description`

`string`

A brief description about the QR Code.

`payments_amount_received`

`integer`

The total amount received on the QR Code. All captured payments are considered.

`payments_count_received`

`integer`

The total number of payments received on the QR Code. All captured payments are considered.

`notes`

`object`

Key-value pair that can be used to store additional information about the QR Code. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

`customer_id`

`string`

Unique identifier of the customer the QR Code is linked with. Know more about to the [Customers API](/razorpay-docs-md/api/customers.md).

`close_by`

`integer`

UNIX timestamp at which the QR Code is scheduled to be automatically closed. The time must be at least 15 minutes after the current time. The date range can be set to `2147483647` in UNIX timestamp format (equivalent to Tuesday, January 19, 2038 8:44:07 AM GMT+05:30).

**Watch Out**

Any request beyond 2147483647 UNIX timestamp will fail.

`closed_at`

`integer`

UNIX timestamp at which the QR Code is automatically closed.

`created_at`

`integer`

UNIX timestamp at which the QR Code was created.

`close_reason`

`string`

The reason for the closure of the QR Code. Possible values:

- `on_demand`: When you close the QR Code using the APIs or the Dashboard.
- `paid`: If the QR Code is created with the `usage=single_payment` parameter, the QR Code closes automatically once the customer makes the payment, with the reason marked as `paid`.
- `null`: The QR Code has not been closed yet.

Curl

```bash
curl -u <YOUR_KEY_ID>:<YOUR_KEY_SECRET> \
-X POST https://api.razorpay.com/v1/payments/qr_codes \
-H "Content-Type: application/json" \
-d '{
  "type": "upi_qr",
  "name": "Store_1",
  "usage": "single_use",
  "fixed_amount": true,
  "payment_amount": 300,
  "description": "For Store 1",
  "customer_id": "cust_HKsR5se84c5LTO",
  "close_by": 1681615838,
  "notes": {
    "purpose": "Test UPI QR Code notes"
  },
  "tax_invoice": {
    "number": "INV001",
    "date": 1589994898,
    "customer_name": "Gaurav Kumar",
    "business_gstin": "06AABCU9605R1ZR",
    "gst_amount": 4000,
    "cess_amount": 0,
    "supply_type": "interstate"
  }
}'
```

Success

```json
{
  "id": "qr_HMsVL8HOpbMcjU",
  "entity": "qr_code",
  "created_at": 1623660301,
  "name": "Store_1",
  "usage": "single_use",
  "type": "upi_qr",
  "image_url": "https://rzp.io/i/BWcUVrLp",
  "payment_amount": 300,
  "status": "active",
  "description": "For Store 1",
  "fixed_amount": true,
  "payments_amount_received": 0,
  "payments_count_received": 0,
  "notes": {
    "purpose": "Test UPI QR Code notes"
  },
  "customer_id": "cust_HKsR5se84c5LTO",
  "close_by": 1681615838,
  "tax_invoice": {
    "number": "INV001",
    "date": 1589994898,
    "customer_name": "Gaurav Kumar",
    "business_gstin": "06AABCU9605R1ZR",
    "gst_amount": 4000,
    "cess_amount": 0,
    "supply_type": "interstate"
  }
}
```
