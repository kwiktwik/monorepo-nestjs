<!-- Source: https://razorpay.com/docs/api/qr-codes/fetch-payment-id -->

# Fetch QR Codes for a Payment ID

`GET`

`/v1/payments/qr_codes?payment_id={payment_id}`

Use this endpoint to retrieve the details of a QR Code by using a Payment Id.

Sample Code

Query Parameters

1

Response Parameters

Errors

Curl

```bash
curl -u <YOUR_KEY_ID>:<YOUR_KEY_SECRET> \
-X GET https://api.razorpay.com/v1/payments/qr_codes?payment_id=pay_Di5iqCqA1WEHq6 \
```

Success

Failure

```json
{
  "entity": "collection",
  "count": 1,
  "items": [
    {
      "id": "qr_HMsqRoeVwKbwAF",
      "entity": "qr_code",
      "created_at": 1623661499,
      "name": "Fresh Groceries",
      "usage": "multiple_use",
      "type": "upi_qr",
      "image_url": "https://rzp.io/i/eI9XD54Q",
      "payment_amount": null,
      "status": "active",
      "description": "Buy fresh groceries",
      "fixed_amount": false,
      "payments_amount_received": 1000,
      "payments_count_received": 1,
      "notes": [],
      "customer_id": "cust_HKsR5se84c5LTO",
      "close_by": 1624472999,
      "close_reason": null
    }
  ]
}
```

###### Query Parameters

`id`

\*

`string`

The unique identifier of the payment.

###### Response Parameters

`id`

`string`

The unique identifier of the QR Code. For example, `qr_HMsVL8HOpbMcjU`.

`entity`

`string`

Indicates the type of entity. Here, it is `qr_code`.

`created_at`

`integer`

Unix timestamp at which the QR Code is created.

`name`

`string`

Label entered to identify the QR Code. For example, `Store Front Display`.

`usage`

`string`

Indicates if the QR Code should be allowed to accept single payment or multiple payments. Possible values:

- `single_use`: QR Code will accept only one payment and then close automatically.
- `multiple_use` (default): QR Code will accept multiple payments.

`type`

`string`

The type of the QR Code. Possible value is `upi_qr`, which creates a QR Code that accepts only UPI payments.

**Feature Request**

This is an on-demand feature. Please raise a request with our [Support team](https://razorpay.com/support/#request) to get this feature activated on your account.

`image_url`

`string`

The URL of the QR Code. For example, `http://rzp.io/l6MS`. Click the link to download the code.

`payment_amount`

`integer`

The amount allowed for a transaction. If this is specified, then any transaction of an amount less than or more than this value is not allowed. For example, if this amount is set as `500000`, the customer cannot pay an amount less than or more than ₹5000.

`status`

`string`

Indicates the status of the QR Code. Possible values:

- `active`: Indicates that the QR Code has been created and is ready to accept payments.
- `closed`: Indicates that the QR Code has been closed.

`description`

`string`

A brief description about the QR Code.

`fixed_amount`

`boolean`

Indicates if the QR Code should accept payments of specific amounts or any amount. Possible values:

- `true`: QR Code accepts only a specific amount.
- `false` (default): QR code accepts any amount.

**Watch Out!**

When setting the `usage` to `single_use`, ensure that `fixed_amount` is `true` to generate the QR Code successfully.

`payments_amount_received`

`integer`

The total amount received on the QR Code. Only captured payments are considered.

`payments_count_received`

`integer`

The total number of payments received on the QR Code. All captured payments are considered.

`notes`

`object`

Key-value pair that can be used to store additional information about the QR Code. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

`customer_id`

`string`

The unique identifier of the customer the QR Code is linked with. Know more about the [Customers API](/razorpay-docs-md/api/customers.md).

`close_by`

`integer`

Unix timestamp at which the QR Code is scheduled to be automatically closed. The time must be at least 15 minutes after the current time. The date range can be set to `2147483647` in Unix timestamp format (equivalent to Tuesday, January 19, 2038 8:44:07 AM GMT+05:30).

**Handy Tips**

- Any request beyond 2147483647 Unix timestamp will fail.

**Watch Out!**

- This parameter is only available for QR codes with `usage` set as `single_use`. You will not be able to use this parameter for `multiple_use` QR codes as it will generate an error.
- For `single_use` QR codes, the `close_by` date can be set for a maximum of 45 days. If no `close_by` date is specified, the QR code will automatically become inactive after 45 days. Conversely, `multiple_use` QR codes do not have an expiration date.

`closed_at`

`integer`

Unix timestamp at which the QR Code is automatically closed.

`close_reason`

`string`

The reason for the closure of the QR Code. Possible values:

- `on_demand`: When you close the QR Code using the APIs or the Dashboard.
- `paid`: If the QR Code is created with the `usage=single_payment` parameter, the QR Code closes automatically once the customer makes the payment, with the reason marked as `paid`.
- `null`: The QR Code has not been closed yet.

###### Errors

The API {key/secret} provided is invalid.

Error Status: 4xx

The API credentials passed in the API call differ from the ones generated on the Dashboard.

Solution

We are facing some trouble completing your request at the moment. Please try again shortly.

Error Status: 400

A GET API is executed by POST Method.

Solution

{Payment\_id} is not a valid id.

Error Status: 400

A wrong Payment id is provided.

Solution

{Payment\_id} is/are not required and should not be sent

Error Status: 400

The URL is wrong or is missing something.

Solution

The requested URL was not found on the server.

Error Status: 400

The URL is wrong or is missing something.

Solution

"count": 0

Error Status: 400

No QR Code is found for the search criteria.

Solution

# Fetch QR Codes for a Payment ID

`GET`

`/v1/payments/qr_codes?payment_id={payment_id}`

Use this endpoint to retrieve the details of a QR Code by using a Payment Id.

Query Parameters

1

Response Parameters

Errors

###### Query Parameters

`id`

\*

`string`

The unique identifier of the payment.

###### Response Parameters

`id`

`string`

The unique identifier of the QR Code. For example, `qr_HMsVL8HOpbMcjU`.

`entity`

`string`

Indicates the type of entity. Here, it is `qr_code`.

`created_at`

`integer`

Unix timestamp at which the QR Code is created.

`name`

`string`

Label entered to identify the QR Code. For example, `Store Front Display`.

`usage`

`string`

Indicates if the QR Code should be allowed to accept single payment or multiple payments. Possible values:

- `single_use`: QR Code will accept only one payment and then close automatically.
- `multiple_use` (default): QR Code will accept multiple payments.

`type`

`string`

The type of the QR Code. Possible value is `upi_qr`, which creates a QR Code that accepts only UPI payments.

**Feature Request**

This is an on-demand feature. Please raise a request with our [Support team](https://razorpay.com/support/#request) to get this feature activated on your account.

`image_url`

`string`

The URL of the QR Code. For example, `http://rzp.io/l6MS`. Click the link to download the code.

`payment_amount`

`integer`

The amount allowed for a transaction. If this is specified, then any transaction of an amount less than or more than this value is not allowed. For example, if this amount is set as `500000`, the customer cannot pay an amount less than or more than ₹5000.

`status`

`string`

Indicates the status of the QR Code. Possible values:

- `active`: Indicates that the QR Code has been created and is ready to accept payments.
- `closed`: Indicates that the QR Code has been closed.

`description`

`string`

A brief description about the QR Code.

`fixed_amount`

`boolean`

Indicates if the QR Code should accept payments of specific amounts or any amount. Possible values:

- `true`: QR Code accepts only a specific amount.
- `false` (default): QR code accepts any amount.

**Watch Out!**

When setting the `usage` to `single_use`, ensure that `fixed_amount` is `true` to generate the QR Code successfully.

`payments_amount_received`

`integer`

The total amount received on the QR Code. Only captured payments are considered.

`payments_count_received`

`integer`

The total number of payments received on the QR Code. All captured payments are considered.

`notes`

`object`

Key-value pair that can be used to store additional information about the QR Code. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

`customer_id`

`string`

The unique identifier of the customer the QR Code is linked with. Know more about the [Customers API](/razorpay-docs-md/api/customers.md).

`close_by`

`integer`

Unix timestamp at which the QR Code is scheduled to be automatically closed. The time must be at least 15 minutes after the current time. The date range can be set to `2147483647` in Unix timestamp format (equivalent to Tuesday, January 19, 2038 8:44:07 AM GMT+05:30).

**Handy Tips**

- Any request beyond 2147483647 Unix timestamp will fail.

**Watch Out!**

- This parameter is only available for QR codes with `usage` set as `single_use`. You will not be able to use this parameter for `multiple_use` QR codes as it will generate an error.
- For `single_use` QR codes, the `close_by` date can be set for a maximum of 45 days. If no `close_by` date is specified, the QR code will automatically become inactive after 45 days. Conversely, `multiple_use` QR codes do not have an expiration date.

`closed_at`

`integer`

Unix timestamp at which the QR Code is automatically closed.

`close_reason`

`string`

The reason for the closure of the QR Code. Possible values:

- `on_demand`: When you close the QR Code using the APIs or the Dashboard.
- `paid`: If the QR Code is created with the `usage=single_payment` parameter, the QR Code closes automatically once the customer makes the payment, with the reason marked as `paid`.
- `null`: The QR Code has not been closed yet.

###### Errors

The API {key/secret} provided is invalid.

Error Status: 4xx

The API credentials passed in the API call differ from the ones generated on the Dashboard.

Solution

We are facing some trouble completing your request at the moment. Please try again shortly.

Error Status: 400

A GET API is executed by POST Method.

Solution

{Payment\_id} is not a valid id.

Error Status: 400

A wrong Payment id is provided.

Solution

{Payment\_id} is/are not required and should not be sent

Error Status: 400

The URL is wrong or is missing something.

Solution

The requested URL was not found on the server.

Error Status: 400

The URL is wrong or is missing something.

Solution

"count": 0

Error Status: 400

No QR Code is found for the search criteria.

Solution

Curl

```bash
curl -u <YOUR_KEY_ID>:<YOUR_KEY_SECRET> \
-X GET https://api.razorpay.com/v1/payments/qr_codes?payment_id=pay_Di5iqCqA1WEHq6 \
```

Success

Failure

```json
{
  "entity": "collection",
  "count": 1,
  "items": [
    {
      "id": "qr_HMsqRoeVwKbwAF",
      "entity": "qr_code",
      "created_at": 1623661499,
      "name": "Fresh Groceries",
      "usage": "multiple_use",
      "type": "upi_qr",
      "image_url": "https://rzp.io/i/eI9XD54Q",
      "payment_amount": null,
      "status": "active",
      "description": "Buy fresh groceries",
      "fixed_amount": false,
      "payments_amount_received": 1000,
      "payments_count_received": 1,
      "notes": [],
      "customer_id": "cust_HKsR5se84c5LTO",
      "close_by": 1624472999,
      "close_reason": null
    }
  ]
}
```
