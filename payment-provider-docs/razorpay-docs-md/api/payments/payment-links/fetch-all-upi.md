<!-- Source: https://razorpay.com/docs/api/payments/payment-links/fetch-all-upi -->

# Fetch All UPI Payment Links

`GET`

`/v1/payment_links/`

Use this endpoint to retrieve the details of all the UPI Payment Links.

Sample Code

Query Parameters

2

Response Parameters

Errors

Curl

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
- X GET https://api.razorpay.com/v1/payment_links/ \
- H "content-type: application/json"
```

Success

Failure

```json
{
  "payment_links": [
    {
      "accept_partial": false,
      "amount": 100,
      "amount_paid": 0,
      "cancelled_at": 0,
      "created_at": 1602523443,
      "currency": "INR",
      "customer": {
        "contact": "9000090000",
        "email": "gaurav.kumar@razorpay.com",
        "name": "Gaurav Kumar"
      },
      "description": "Payment for policy no #23456",
      "expire_by": 0,
      "expired_at": 0,
      "first_min_partial_amount": 0,
      "id": "plink_Fo4T7Ht271epg3",
      "notes": {
        "policy_name": "Jeevan Bima"
      },
      "notify": {
        "email": false,
        "sms": true
      },
      "payments": [],
      "reference_id": "#41956",
      "reminder_enable": true,
      "reminders": {
        "status": "in_progress"
      },
      "short_url": "https://rzp.io/i/LXnmFr3a",
      "status": "created",
      "updated_at": 1602523443,
      "upi_link": true,
      "user_id": ""
    },
    {
      "accept_partial": false,
      "amount": 100,
      "amount_paid": 0,
      "cancelled_at": 1602522621,
      "created_at": 1602522615,
      "currency": "INR",
      "customer": {
        "contact": "9000090000",
        "email": "gaurav.kumar@razorpay.com"
      },
      "description": "Payment for Acme Inc",
      "expire_by": 0,
      "expired_at": 0,
      "first_min_partial_amount": 0,
      "id": "plink_Fo4EWsg3KmfWGW",
      "notes": [],
      "notify": {
        "email": true,
        "sms": true
      },
      "order_id": "order_Fo4EayQh1zSGxn",
      "payments": [],
      "reference_id": "",
      "reminder_enable": false,
      "reminders": [],
      "short_url": "https://rzp.io/i/2agF8tv",
      "status": "cancelled",
      "updated_at": 1602522621,
      "upi_link": true,
      "user_id": "FmjfFPCOUOAcSH"
    }
  ]
}
```

###### Query Parameters

`payment_id`

`string`

Unique identifier of the payment associated with the Payment Link.

`reference_id`

`string`

The unique reference number entered while creating the Payment Link.

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

The api {key/secret} provided is invalid

Error Status: 4xx

There is a mismatch between the API credentials passed in the API call and the API credentials generated on the Dashboard.

Solution

# Fetch All UPI Payment Links

`GET`

`/v1/payment_links/`

Use this endpoint to retrieve the details of all the UPI Payment Links.

Query Parameters

2

Response Parameters

Errors

###### Query Parameters

`payment_id`

`string`

Unique identifier of the payment associated with the Payment Link.

`reference_id`

`string`

The unique reference number entered while creating the Payment Link.

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

The api {key/secret} provided is invalid

Error Status: 4xx

There is a mismatch between the API credentials passed in the API call and the API credentials generated on the Dashboard.

Solution

Curl

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
- X GET https://api.razorpay.com/v1/payment_links/ \
- H "content-type: application/json"
```

Success

Failure

```json
{
  "payment_links": [
    {
      "accept_partial": false,
      "amount": 100,
      "amount_paid": 0,
      "cancelled_at": 0,
      "created_at": 1602523443,
      "currency": "INR",
      "customer": {
        "contact": "9000090000",
        "email": "gaurav.kumar@razorpay.com",
        "name": "Gaurav Kumar"
      },
      "description": "Payment for policy no #23456",
      "expire_by": 0,
      "expired_at": 0,
      "first_min_partial_amount": 0,
      "id": "plink_Fo4T7Ht271epg3",
      "notes": {
        "policy_name": "Jeevan Bima"
      },
      "notify": {
        "email": false,
        "sms": true
      },
      "payments": [],
      "reference_id": "#41956",
      "reminder_enable": true,
      "reminders": {
        "status": "in_progress"
      },
      "short_url": "https://rzp.io/i/LXnmFr3a",
      "status": "created",
      "updated_at": 1602523443,
      "upi_link": true,
      "user_id": ""
    },
    {
      "accept_partial": false,
      "amount": 100,
      "amount_paid": 0,
      "cancelled_at": 1602522621,
      "created_at": 1602522615,
      "currency": "INR",
      "customer": {
        "contact": "9000090000",
        "email": "gaurav.kumar@razorpay.com"
      },
      "description": "Payment for Acme Inc",
      "expire_by": 0,
      "expired_at": 0,
      "first_min_partial_amount": 0,
      "id": "plink_Fo4EWsg3KmfWGW",
      "notes": [],
      "notify": {
        "email": true,
        "sms": true
      },
      "order_id": "order_Fo4EayQh1zSGxn",
      "payments": [],
      "reference_id": "",
      "reminder_enable": false,
      "reminders": [],
      "short_url": "https://rzp.io/i/2agF8tv",
      "status": "cancelled",
      "updated_at": 1602522621,
      "upi_link": true,
      "user_id": "FmjfFPCOUOAcSH"
    }
  ]
}
```
