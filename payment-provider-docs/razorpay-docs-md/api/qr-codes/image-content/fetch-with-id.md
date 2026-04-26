<!-- Source: https://razorpay.com/docs/api/qr-codes/image-content/fetch-with-id -->

# Fetch a Qr Code With ID

Copy for AI

View as Markdown

`GET`

`/v1/payments/qr_codes/:id`

Use this endpoint to fetch the details of a QR Code.

Sample Code

Path Parameters

1

Response Parameters

Errors

Curl

```bash
curl -u <YOUR_KEY_ID>:<YOUR_KEY_SECRET> \
-X GET https://api.razorpay.com/v1/payments/qr_codes/qr_FuZIYx6rMbP6gs \
```

Success

Failure

```json
{
  "id": "qr_HO2r1MDprYtWRT",
  "entity": "qr_code",
  "created_at": 1623915088,
  "name": "Store_1",
  "usage": "single_use",
  "type": "upi_qr",
  "image_url": "https://rzp.io/i/oCswTOcCo",
  "image_content": "upi://pay?pa=qmart.razorpay@hdfcbank&pn=TestAccount&tr=RZPGT5viB4WHeoUuuqrv2&tn=TestAccountRaftarSoft&am=100&cu=INR&mc=5411",
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
  "close_reason": null
}
```

###### Path Parameters

`id`

\*

`string`

The unique identifier of the QR Code.

###### Response Parameters

`id`

`string`

The unique identifier of the QR Code.

`entity`

`string`

Indicates the type of entity. Here, it is `qr_code`.

`type`

`string`

The type of the QR Code. Possible values:

- `upi_qr`: Create a QR Code that accepts only UPI payments.
- `bharat_qr`: Create a QR Code that accepts UPI and card payments. This is an on-demand feature. Learn more about [Bharat QR](/razorpay-docs-md/payment-methods/bharatqr.md)  .

`image_url`

`string`

The URL of the QR Code. For example, `http://rzp.io/l6MS`. Click the link to download the code.

`image_content`

`string`

The link encoded to the payable QR Code using any QR Code generator. For example:

- For UPI QR: `upi://pay?pa=dmart.razorpay@hdfcbank&pn=TestAccount&tr=RZPGT5viB4WHeoUuuqrv2&tn=TestAccountRaftarSoft&am=100&cu=INR&mc=5411`
- For Bharat QR: `000201010212021643926300000000850415540461000000008061661005900000000890827YESB0CMSNOC222333004882700126430010A0000005240117razorpaybqr@icici02041.1027350010A0000005240117RZPGT8ildsFTgS5Sp52047531530335654041.105802IN5906zxcbmn6005Delhi610611008562300514GT8ildsFTgS5Sp070838R004506304B6A9`

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

Unix timestamp at which the QR Code is scheduled to be automatically closed. The time must be at least 15 minutes after the current time. The date range can be set to `2147483647` in Unix timestamp format (equivalent to Tuesday, January 19, 2038 8:44:07 AM GMT+05:30).

**Watch Out!**

Any request beyond 2147483647 Unix timestamp will fail.

`closed_at`

`integer`

Unix timestamp at which the QR Code is automatically closed.

`created_at`

`integer`

Unix timestamp at which the QR Code was created.

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

The id provided does not exist.

Error Status: 400

- The URL is wrong or is missing something.
- A GET API is executed by POST Method.

Solution

{Qr code id} is not a valid id.

Error Status: 400

A wrong QR Code id is provided.

Solution

# Fetch a Qr Code With ID

Copy for AI

View as Markdown

`GET`

`/v1/payments/qr_codes/:id`

Use this endpoint to fetch the details of a QR Code.

Path Parameters

1

Response Parameters

Errors

###### Path Parameters

`id`

\*

`string`

The unique identifier of the QR Code.

###### Response Parameters

`id`

`string`

The unique identifier of the QR Code.

`entity`

`string`

Indicates the type of entity. Here, it is `qr_code`.

`type`

`string`

The type of the QR Code. Possible values:

- `upi_qr`: Create a QR Code that accepts only UPI payments.
- `bharat_qr`: Create a QR Code that accepts UPI and card payments. This is an on-demand feature. Learn more about [Bharat QR](/razorpay-docs-md/payment-methods/bharatqr.md)  .

`image_url`

`string`

The URL of the QR Code. For example, `http://rzp.io/l6MS`. Click the link to download the code.

`image_content`

`string`

The link encoded to the payable QR Code using any QR Code generator. For example:

- For UPI QR: `upi://pay?pa=dmart.razorpay@hdfcbank&pn=TestAccount&tr=RZPGT5viB4WHeoUuuqrv2&tn=TestAccountRaftarSoft&am=100&cu=INR&mc=5411`
- For Bharat QR: `000201010212021643926300000000850415540461000000008061661005900000000890827YESB0CMSNOC222333004882700126430010A0000005240117razorpaybqr@icici02041.1027350010A0000005240117RZPGT8ildsFTgS5Sp52047531530335654041.105802IN5906zxcbmn6005Delhi610611008562300514GT8ildsFTgS5Sp070838R004506304B6A9`

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

Unix timestamp at which the QR Code is scheduled to be automatically closed. The time must be at least 15 minutes after the current time. The date range can be set to `2147483647` in Unix timestamp format (equivalent to Tuesday, January 19, 2038 8:44:07 AM GMT+05:30).

**Watch Out!**

Any request beyond 2147483647 Unix timestamp will fail.

`closed_at`

`integer`

Unix timestamp at which the QR Code is automatically closed.

`created_at`

`integer`

Unix timestamp at which the QR Code was created.

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

The id provided does not exist.

Error Status: 400

- The URL is wrong or is missing something.
- A GET API is executed by POST Method.

Solution

{Qr code id} is not a valid id.

Error Status: 400

A wrong QR Code id is provided.

Solution

Curl

```bash
curl -u <YOUR_KEY_ID>:<YOUR_KEY_SECRET> \
-X GET https://api.razorpay.com/v1/payments/qr_codes/qr_FuZIYx6rMbP6gs \
```

Success

Failure

```json
{
  "id": "qr_HO2r1MDprYtWRT",
  "entity": "qr_code",
  "created_at": 1623915088,
  "name": "Store_1",
  "usage": "single_use",
  "type": "upi_qr",
  "image_url": "https://rzp.io/i/oCswTOcCo",
  "image_content": "upi://pay?pa=qmart.razorpay@hdfcbank&pn=TestAccount&tr=RZPGT5viB4WHeoUuuqrv2&tn=TestAccountRaftarSoft&am=100&cu=INR&mc=5411",
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
  "close_reason": null
}
```
