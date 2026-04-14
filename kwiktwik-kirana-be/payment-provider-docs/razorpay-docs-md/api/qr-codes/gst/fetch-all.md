<!-- Source: https://razorpay.com/docs/api/qr-codes/gst/fetch-all -->

# Fetch All QR Codes

`GET`

`/v1/payments/qr_codes?count=2`

Use this endpoint to retrieve the details of multiple QR Codes.

Sample Code

Query Parameters

4

Response Parameters

Curl

```bash
curl -u <YOUR_KEY_ID>:<YOUR_KEY_SECRET> \
-X GET https://api.razorpay.com/v1/payments/qr_codes \
```

Success

```json
{
  "entity": "collection",
  "count": 2,
  "items": [
    {
      "id": "qr_HO2jGkWReVBMNu",
      "entity": "qr_code",
      "created_at": 1623914648,
      "name": "Store_1",
      "usage": "single_use",
      "type": "upi_qr",
      "image_url": "https://rzp.io/i/w2CEwYmkAu",
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
      "closed_at": null,
      "close_reason": null,
      "tax_invoice": {
        "number": "INV001",
        "date": 1589994898,
        "customer_name": "Gaurav Kumar",
        "business_gstin": "06AABCU9605R1ZR",
        "gst_amount": 4000,
        "cess_amount": 0,
        "supply_type": "interstate",
        "tax_invoice": {
          "number": "INV001",
          "date": 1589994898,
          "customer_name": "Gaurav Kumar",
          "business_gstin": "06AABCU9604R1ZR",
          "gst_amount": 4000,
          "cess_amount": 0,
          "supply_type": "interstate"
        }
      }
    },
    {
      "id": "qr_HO2e0813YlchUn",
      "entity": "qr_code",
      "created_at": 1623914349,
      "name": "Acme Groceries",
      "usage": "multiple_use",
      "type": "upi_qr",
      "image_url": "https://rzp.io/i/X6QM7LL",
      "payment_amount": null,
      "status": "closed",
      "description": "Buy fresh groceries",
      "fixed_amount": false,
      "payments_amount_received": 200,
      "payments_count_received": 1,
      "notes": {
        "Branch": "Bangalore - Rajaji Nagar"
      },
      "customer_id": "cust_HKsR5se84c5LTO",
      "close_by": 1625077799,
      "closed_at": 1623914515,
      "close_reason": "on_demand",
      "tax_invoice": {
        "number": "INV001",
        "date": "1589994898",
        "customer_name": "Gaurav Kumar",
        "business_gstin": "06AABCU9604R1ZR",
        "gst_amount": 4000,
        "cess_amount": 0,
        "supply_type": "interstate",
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
    }
  ]
}
```

###### Query Parameters

`from`

`integer`

Timestamp, in seconds, from when QR Codes are to be retrieved.

`to`

`integer`

Timestamp, in seconds, till when QR Codes are to be retrieved.

`count`

`integer`

Number of QR Codes to be retrieved. The default value is `10` and the maximum value is `100`. This can be used for pagination, in combination with `skip`.

`skip`

`integer`

Number of records to be skipped while fetching the QR Codes. This can be used for pagination, in combination with `count`.

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

# Fetch All QR Codes

`GET`

`/v1/payments/qr_codes?count=2`

Use this endpoint to retrieve the details of multiple QR Codes.

Query Parameters

4

Response Parameters

###### Query Parameters

`from`

`integer`

Timestamp, in seconds, from when QR Codes are to be retrieved.

`to`

`integer`

Timestamp, in seconds, till when QR Codes are to be retrieved.

`count`

`integer`

Number of QR Codes to be retrieved. The default value is `10` and the maximum value is `100`. This can be used for pagination, in combination with `skip`.

`skip`

`integer`

Number of records to be skipped while fetching the QR Codes. This can be used for pagination, in combination with `count`.

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
-X GET https://api.razorpay.com/v1/payments/qr_codes \
```

Success

```json
{
  "entity": "collection",
  "count": 2,
  "items": [
    {
      "id": "qr_HO2jGkWReVBMNu",
      "entity": "qr_code",
      "created_at": 1623914648,
      "name": "Store_1",
      "usage": "single_use",
      "type": "upi_qr",
      "image_url": "https://rzp.io/i/w2CEwYmkAu",
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
      "closed_at": null,
      "close_reason": null,
      "tax_invoice": {
        "number": "INV001",
        "date": 1589994898,
        "customer_name": "Gaurav Kumar",
        "business_gstin": "06AABCU9605R1ZR",
        "gst_amount": 4000,
        "cess_amount": 0,
        "supply_type": "interstate",
        "tax_invoice": {
          "number": "INV001",
          "date": 1589994898,
          "customer_name": "Gaurav Kumar",
          "business_gstin": "06AABCU9604R1ZR",
          "gst_amount": 4000,
          "cess_amount": 0,
          "supply_type": "interstate"
        }
      }
    },
    {
      "id": "qr_HO2e0813YlchUn",
      "entity": "qr_code",
      "created_at": 1623914349,
      "name": "Acme Groceries",
      "usage": "multiple_use",
      "type": "upi_qr",
      "image_url": "https://rzp.io/i/X6QM7LL",
      "payment_amount": null,
      "status": "closed",
      "description": "Buy fresh groceries",
      "fixed_amount": false,
      "payments_amount_received": 200,
      "payments_count_received": 1,
      "notes": {
        "Branch": "Bangalore - Rajaji Nagar"
      },
      "customer_id": "cust_HKsR5se84c5LTO",
      "close_by": 1625077799,
      "closed_at": 1623914515,
      "close_reason": "on_demand",
      "tax_invoice": {
        "number": "INV001",
        "date": "1589994898",
        "customer_name": "Gaurav Kumar",
        "business_gstin": "06AABCU9604R1ZR",
        "gst_amount": 4000,
        "cess_amount": 0,
        "supply_type": "interstate",
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
    }
  ]
}
```
