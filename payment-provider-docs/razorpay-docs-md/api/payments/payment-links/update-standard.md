<!-- Source: https://razorpay.com/docs/api/payments/payment-links/update-standard -->

# Update Standard Payment Link

`PATCH`

`/v1/payment_links/:id`

Use this endpoint to edit the Standard Payment Link details such as the reference id, expiry date and so on.

Sample Code

Path Parameters

1

Request Parameters

Response Parameters

Errors

Curl

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X PATCH https://api.razorpay.com/v1/payment_links/plink_Et2G7ymGcTTuM5 \
-H 'Content-type: application/json' \
-d '{
    "reference_id": "TS35",
    "expire_by": 1653347540,
    "reminder_enable":false,
    "notes":{
      "policy_name": "Life Insurance Policy"
    }
}'
```

Success

Failure

```json
{
  "accept_partial": false,
  "amount": 1000,
  "amount_paid": 0,
  "callback_method": "",
  "callback_url": "",
  "cancelled_at": 0,
  "created_at": 1596194425,
  "currency": "",
  "customer": {
    "contact": "+919876543210",
    "email": "gaurav.kumar@example.com",
    "name": "Gaurav Kumar"
  },
  "description": "Payment for policy no #23456",
  "expire_by": 1653347540,
  "expired_at": 0,
  "first_min_partial_amount": 100,
  "id": "plink_FL5HCrWEO112OW",
  "notes": [
    {
      "key": "policy_name",
      "value": "Life Insurance Policy"
    }
  ],
  "notify": {
    "email": true,
    "sms": true
  },
  "payments": [],
  "reference_id": "TS35",
  "reminder_enable": false,
  "reminders": {
    "status": "failed"
  },
  "short_url": "https://rzp.io/i/O8CYyZ2",
  "status": "created",
  "updated_at": 1596194683,
  "user_id": ""
}
```

###### Path Parameters

`id`

\*

`string`

Unique identifier of the Payment Link.

###### Request Parameters

`accept_partial`

`boolean`

Indicates whether customers can make [partial payments](/razorpay-docs-md/payment-links/partial-payments.md) using the Payment Link. Partial payments are not allowed with UPI Payment Links. Possible values:

- `true`: Customer can make partial payments.
- `false` (default): Customer cannot make partial payments.

`reference_id`

`string`

Adds a unique reference number to an existing link.

`expire_by`

`integer`

Timestamp, in Unix format, when the payment links should expire.

`notes`

`object`

Key-value pair that can be used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Payment Link for Groceries”`.

###### Response Parameters

`accept_partial`

`boolean`

Indicates whether customers can make [partial payments](/razorpay-docs-md/payment-links/partial-payments.md) using the Payment Link. Possible values:

- `true`: Customer can make partial payments.
- `false` (default): Customer cannot make partial payments.

`amount`

`integer`

Amount to be paid using the Payment Link. Must be in the smallest unit of the currency. For example, if you want to receive a payment of ₹300, you must enter the value `30000`. In the case of three decimal currencies, such as KWD, BHD and OMR, to refund a payment of 295.991, pass the value as 295990. And in the case of zero decimal currencies such as JPY, to refund a payment of 295, pass the value as 295.

**Watch Out!**

As per payment guidelines, you should pass the last decimal number as 0 for three decimal currency payments. For example, if you want to refund a customer 99.991 KD for a transaction, you should pass the value for the amount parameter as `99990` and not `99991`.

`amount_paid`

`integer`

Amount paid by the customer.

`callback_url`

`string`

If specified, adds a redirect URL to the Payment Link. Once the customer completes the payment, they are redirected to the specified URL.

`callback_method`

`string`

If `callback_url` parameter is passed, `callback_method` must be passed with the value `get`.

`cancelled_at`

`integer`

Timestamp, in Unix, at which the Payment Link was cancelled by you.

`created_at`

`integer`

Timestamp, in Unix, indicating when the Payment Link was created.

`currency`

`string`

Defaults to INR. We accept payments in [international currencies.](/razorpay-docs-md/international-payments.md#supported-currencies)

**Handy Tips**

Razorpay has added support for zero decimal currencies, such as JPY, and three decimal currencies, such as KWD, BHD, and OMR, allowing businesses to accept international payments in these currencies. Know more about [Currency Conversion](/razorpay-docs-md/international-payments/currency-conversion.md)

(May 2024).

`customer`

`json object`

Customer details.

Show child parameters (3)

`description`

`string`

A brief description of the Payment Link.

`expire_by`

`integer`

Timestamp, in Unix, when the Payment Link will expire. By default, a Payment Link will be valid for six months from the date of creation. Please note that the expire by date cannot exceed more than six months from the date of creation.

`expired_at`

`integer`

Timestamp, in Unix, at which the Payment Link expired.

`first_min_partial_amount`

`integer`

Minimum amount that must be paid by the customer as the first partial payment. For example, if an amount of ₹700 is to be received from the customer in two installments of #1 - ₹500, #2 - ₹200, then you can set this value as `500000`.

`id`

`string`

Unique identifier of the Payment Link. For example, `plink_ERgihyaAAC0VNW`.

`upi_link`

`boolean`

Indicates whether the Payment Link is a UPI Payment Link.

- `true`: A UPI Payment Link has been created.
- `false`: It is a Standard Payment Link.

`notes`

`object`

Set of key-value pairs that you can use to store additional information. You (Businesses) can enter a maximum of 15 key-value pairs, with each value having a maximum limit of 256 characters.

`notify`

`array`

Defines who handles Payment Link notification.

Show child parameters (2)

`payments`

`array`

Payment details such as amount, payment id, Payment Link id and more are stored in this array. It is populated only after a payment is successfully captured by the customer. Only captured payments will be shown here. Until then, the value is `null`.

Show child parameters (7)

`reference_id`

`string`

Reference number tagged to a Payment Link. Must be a unique number for each Payment Link. The maximum character limit supported is 40.

`short_url`

`string`

The unique short URL generated for the Payment Link.

`status`

`string`

Displays the current state of the Payment Link. Possible values:

- `created`
- `partially_paid`
- `expired`
- `cancelled`
- `paid`

`updated_at`

`integer`

Timestamp, in Unix, indicating when the Payment Link was updated.

`reminder_enable`

`boolean`

Used to send [reminders](/razorpay-docs-md/payment-links/reminders.md) for the Payment Link. Possible values:

- `true`: To send reminders.
- `false`: To disable reminders.

`user_id`

`string`

A unique identifier for the user role through which the Payment Link was created. For example, `HD1JAKCCPGDfRx`.

###### Errors

update can only be made in created or partially paid state

Error Status: 400

A payment link has been passed in `paid` state.

Solution

wrong input fields sent.

Error Status: 400

When wrong input fields are sent while updating the Payment Link.

Solution

The id provided does not exist

Error Status: 400

The Payment Link does not belong to the requestor business, or it doesn't exist.

Solution

The api {key/secret} provided is invalid

Error Status: 4xx

There is a mismatch between the API credentials passed in the API call and the API credentials generated on the Dashboard.

Solution

# Update Standard Payment Link

`PATCH`

`/v1/payment_links/:id`

Use this endpoint to edit the Standard Payment Link details such as the reference id, expiry date and so on.

Path Parameters

1

Request Parameters

Response Parameters

Errors

###### Path Parameters

`id`

\*

`string`

Unique identifier of the Payment Link.

###### Request Parameters

`accept_partial`

`boolean`

Indicates whether customers can make [partial payments](/razorpay-docs-md/payment-links/partial-payments.md) using the Payment Link. Partial payments are not allowed with UPI Payment Links. Possible values:

- `true`: Customer can make partial payments.
- `false` (default): Customer cannot make partial payments.

`reference_id`

`string`

Adds a unique reference number to an existing link.

`expire_by`

`integer`

Timestamp, in Unix format, when the payment links should expire.

`notes`

`object`

Key-value pair that can be used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Payment Link for Groceries”`.

###### Response Parameters

`accept_partial`

`boolean`

Indicates whether customers can make [partial payments](/razorpay-docs-md/payment-links/partial-payments.md) using the Payment Link. Possible values:

- `true`: Customer can make partial payments.
- `false` (default): Customer cannot make partial payments.

`amount`

`integer`

Amount to be paid using the Payment Link. Must be in the smallest unit of the currency. For example, if you want to receive a payment of ₹300, you must enter the value `30000`. In the case of three decimal currencies, such as KWD, BHD and OMR, to refund a payment of 295.991, pass the value as 295990. And in the case of zero decimal currencies such as JPY, to refund a payment of 295, pass the value as 295.

**Watch Out!**

As per payment guidelines, you should pass the last decimal number as 0 for three decimal currency payments. For example, if you want to refund a customer 99.991 KD for a transaction, you should pass the value for the amount parameter as `99990` and not `99991`.

`amount_paid`

`integer`

Amount paid by the customer.

`callback_url`

`string`

If specified, adds a redirect URL to the Payment Link. Once the customer completes the payment, they are redirected to the specified URL.

`callback_method`

`string`

If `callback_url` parameter is passed, `callback_method` must be passed with the value `get`.

`cancelled_at`

`integer`

Timestamp, in Unix, at which the Payment Link was cancelled by you.

`created_at`

`integer`

Timestamp, in Unix, indicating when the Payment Link was created.

`currency`

`string`

Defaults to INR. We accept payments in [international currencies.](/razorpay-docs-md/international-payments.md#supported-currencies)

**Handy Tips**

Razorpay has added support for zero decimal currencies, such as JPY, and three decimal currencies, such as KWD, BHD, and OMR, allowing businesses to accept international payments in these currencies. Know more about [Currency Conversion](/razorpay-docs-md/international-payments/currency-conversion.md)

(May 2024).

`customer`

`json object`

Customer details.

Show child parameters (3)

`description`

`string`

A brief description of the Payment Link.

`expire_by`

`integer`

Timestamp, in Unix, when the Payment Link will expire. By default, a Payment Link will be valid for six months from the date of creation. Please note that the expire by date cannot exceed more than six months from the date of creation.

`expired_at`

`integer`

Timestamp, in Unix, at which the Payment Link expired.

`first_min_partial_amount`

`integer`

Minimum amount that must be paid by the customer as the first partial payment. For example, if an amount of ₹700 is to be received from the customer in two installments of #1 - ₹500, #2 - ₹200, then you can set this value as `500000`.

`id`

`string`

Unique identifier of the Payment Link. For example, `plink_ERgihyaAAC0VNW`.

`upi_link`

`boolean`

Indicates whether the Payment Link is a UPI Payment Link.

- `true`: A UPI Payment Link has been created.
- `false`: It is a Standard Payment Link.

`notes`

`object`

Set of key-value pairs that you can use to store additional information. You (Businesses) can enter a maximum of 15 key-value pairs, with each value having a maximum limit of 256 characters.

`notify`

`array`

Defines who handles Payment Link notification.

Show child parameters (2)

`payments`

`array`

Payment details such as amount, payment id, Payment Link id and more are stored in this array. It is populated only after a payment is successfully captured by the customer. Only captured payments will be shown here. Until then, the value is `null`.

Show child parameters (7)

`reference_id`

`string`

Reference number tagged to a Payment Link. Must be a unique number for each Payment Link. The maximum character limit supported is 40.

`short_url`

`string`

The unique short URL generated for the Payment Link.

`status`

`string`

Displays the current state of the Payment Link. Possible values:

- `created`
- `partially_paid`
- `expired`
- `cancelled`
- `paid`

`updated_at`

`integer`

Timestamp, in Unix, indicating when the Payment Link was updated.

`reminder_enable`

`boolean`

Used to send [reminders](/razorpay-docs-md/payment-links/reminders.md) for the Payment Link. Possible values:

- `true`: To send reminders.
- `false`: To disable reminders.

`user_id`

`string`

A unique identifier for the user role through which the Payment Link was created. For example, `HD1JAKCCPGDfRx`.

###### Errors

update can only be made in created or partially paid state

Error Status: 400

A payment link has been passed in `paid` state.

Solution

wrong input fields sent.

Error Status: 400

When wrong input fields are sent while updating the Payment Link.

Solution

The id provided does not exist

Error Status: 400

The Payment Link does not belong to the requestor business, or it doesn't exist.

Solution

The api {key/secret} provided is invalid

Error Status: 4xx

There is a mismatch between the API credentials passed in the API call and the API credentials generated on the Dashboard.

Solution

Curl

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X PATCH https://api.razorpay.com/v1/payment_links/plink_Et2G7ymGcTTuM5 \
-H 'Content-type: application/json' \
-d '{
    "reference_id": "TS35",
    "expire_by": 1653347540,
    "reminder_enable":false,
    "notes":{
      "policy_name": "Life Insurance Policy"
    }
}'
```

Success

Failure

```json
{
  "accept_partial": false,
  "amount": 1000,
  "amount_paid": 0,
  "callback_method": "",
  "callback_url": "",
  "cancelled_at": 0,
  "created_at": 1596194425,
  "currency": "",
  "customer": {
    "contact": "+919876543210",
    "email": "gaurav.kumar@example.com",
    "name": "Gaurav Kumar"
  },
  "description": "Payment for policy no #23456",
  "expire_by": 1653347540,
  "expired_at": 0,
  "first_min_partial_amount": 100,
  "id": "plink_FL5HCrWEO112OW",
  "notes": [
    {
      "key": "policy_name",
      "value": "Life Insurance Policy"
    }
  ],
  "notify": {
    "email": true,
    "sms": true
  },
  "payments": [],
  "reference_id": "TS35",
  "reminder_enable": false,
  "reminders": {
    "status": "failed"
  },
  "short_url": "https://rzp.io/i/O8CYyZ2",
  "status": "created",
  "updated_at": 1596194683,
  "user_id": ""
}
```
