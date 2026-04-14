<!-- Source: https://razorpay.com/docs/api/payments/payment-links/offers -->

# Offers on Payment Links

`POST`

`/v1/payment_links`

Use this endpoint to provide offers on Payment Links. Razorpay Offers provides discounts or cashback on Payment Links issued to customers. You can restrict the payment methods on which the Offers are applied and limit their usage to a defined time period.

**Watch Out!**

Ensure you do not enable partial payments on Payment Links on which offer is being applied.

Know more about how to show [Offers Payment Links](/razorpay-docs-md/payment-links/offers.md) via the Dashboard.

Sample Code

Request Parameters

Response Parameters

Errors

Curl

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X POST https://api.razorpay.com/v1/payment_links
-H 'content-type: application/json'
-d '{
 "amount": 3400,
 "currency": "INR",
 "accept_partial": false,
 "reference_id": "#425",
 "description": "Payment for policy no #23456",
 "customer": {
   "name": "Gaurav Kumar",
   "contact": "+919000090000",
   "email": "gaurav.kumar@example.com"
 },
 "notify": {
   "sms": true,
   "email": true
 },
 "reminder_enable": false,
 "options": {
   "order": {
     "offers": [
       "offer_F4WMTC3pwFKnzq",
       "offer_F4WJHqvGzw8dWF"
     ]
   }
 }
}'
```

Success

Failure

```json
{
 "accept_partial": false,
 "amount": 3400,
 "amount_paid": 0,
 "cancelled_at": 0,
 "created_at": 1600183040,
 "currency": "INR",
 "customer": {
   "contact": "+919000090000",
   "email": "gaurav.kumar@example.com",
   "name": "Gaurav Kumar"
 },
 "description": "Payment for policy no #23456",
 "expire_by": 0,
 "expired_at": 0,
 "first_min_partial_amount": 0,
 "id": "plink_FdLt0WBldRyE5t",
 "notes": null,
 "notify": {
   "email": true,
   "sms": true
 },
 "payments": null,
 "reference_id": "#425",
 "reminder_enable": false,
 "reminders": [],
 "short_url": "https://rzp.io/i/CM5ohDC",
 "status": "created",
 "user_id": ""
}
```

###### Request Parameters

`amount`

\*

`integer`

Amount to be paid using the Payment Link. Must be in the smallest unit of the currency. For example, if you want to receive a payment of ₹300, you must enter the value `30000`. In the case of three decimal currencies, such as KWD, BHD and OMR, to refund a payment of 295.991, pass the value as 295990. And in the case of zero decimal currencies such as JPY, to refund a payment of 295, pass the value as 295.

**Watch Out!**

As per payment guidelines, you should pass the last decimal number as 0 for three decimal currency payments. For example, if you want to refund a customer 99.991 KD for a transaction, you should pass the value for the amount parameter as `99990` and not `99991`.

`currency`

`string`

A three-letter ISO code for the currency in which you want to accept the payment. For example, INR. Refer to the list of [supported currencies](/razorpay-docs-md/international-payments.md#supported-currencies).

**Handy Tips**

Razorpay has added support for zero decimal currencies, such as JPY, and three decimal currencies, such as KWD, BHD, and OMR, allowing businesses to accept international payments in these currencies. Know more about [Currency Conversion](/razorpay-docs-md/international-payments/currency-conversion.md)

(May 2024).

`accept_partial`

`boolean`

Indicates whether customers can make [partial payments](/razorpay-docs-md/payment-links/partial-payments.md) using the Payment Link. Possible values:

- `true`: Customer can make partial payments.
- `false` (default): Customer cannot make partial payments.

`first_min_partial_amount`

`integer`

Minimum amount, in currency subunits, that must be paid by the customer as the first partial payment. Default value is `100`. Default currency is `INR`. For example, if an amount of ₹700 is to be received from the customer in two installments of #1 - ₹500, #2 - ₹200, then you can set this value as `500000`. Must be passed along with `accept_partial` parameter.

`upi_link`

`boolean`

Must be set to `true` for creating UPI Payment Link. If the `upi_link` parameter is not passed or passed with value as false, a Standard Payment Link will be created. Possible values:

- `true`: Creates a UPI Payment Link.
- `false`: Creates a Standard Payment Link.

`description`

`string`

A brief description of the Payment Link. The maximum character limit supported is 2048.

`reference_id`

`string`

Reference number tagged to a Payment Link. Must be a unique number for each Payment Link. The maximum character limit supported is 40.

`customer`

`json object`

Customer details

Show child parameters (3)

`expire_by`

`integer`

Timestamp, in Unix, at which the Payment Link will expire. By default, a Payment Link will be valid for six months from the date of creation. Please note that the expire by date cannot exceed more than six months from the date of creation.

`notify`

`array`

Defines who handles Payment Link notification.

Show child parameters (2)

`notes`

`json object`

Key-value pair that can be used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Payment Link for Groceries.”`.

`callback_url`

`string`

If specified, adds a redirect URL to the Payment Link. Once customers completes the payment, they are redirected to the specified URL.

**Handy Tips**

If the `callback_url` is passed, it must be passed in the correct format. That is, it should contain a URL.

`callback_method`

`string`

If `callback_url` parameter is passed, callback\_method must be passed with the value `get`.

`reminder_enable`

`boolean`

Used to send [reminders](/razorpay-docs-md/payment-links/reminders.md) for the Payment Link. Possible values:

- `true`: To send reminders.
- `false`: To disable reminders.

`options`

\*

`array`

Options to associate the `offer_id` with the Payment Link. Parent parameter under which the `order` child parameter must be passed.

Show child parameters (1)

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

The {input field} is required

Error Status: 4xx

A mandatory field is empty.

Solution

wrong input fields sent.

Error Status: 400

When wrong input fields are sent during Payment Link creation.

Solution

payment link creation with reference ID already attempted

Error Status: 400

An existing reference id has been passed.

Solution

timestamp must be atleast 15 minutes in future

Error Status: 400

The epoch time passed is less than 15 minutes from the current time.

Solution

Invalid access: Cannot create a payment link in live mode, as live mode is disabled for merchant.

Error Status: 400

Occurs when you try to create a Payment Link in Live mode, but live mode is disabled for you

Solution

Invalid access: Cannot create a payment link, as Merchant is Suspended.

Error Status: 400

Occurs when you try to create a Payment Link when you have been been suspended.

Solution

value: the length must not be greater than 255.

Error Status: 400

When the notes length is greater than 255 characters during Payment Link creation.

Solution

# Offers on Payment Links

`POST`

`/v1/payment_links`

Use this endpoint to provide offers on Payment Links. Razorpay Offers provides discounts or cashback on Payment Links issued to customers. You can restrict the payment methods on which the Offers are applied and limit their usage to a defined time period.

**Watch Out!**

Ensure you do not enable partial payments on Payment Links on which offer is being applied.

Know more about how to show [Offers Payment Links](/razorpay-docs-md/payment-links/offers.md) via the Dashboard.

Request Parameters

Response Parameters

Errors

###### Request Parameters

`amount`

\*

`integer`

Amount to be paid using the Payment Link. Must be in the smallest unit of the currency. For example, if you want to receive a payment of ₹300, you must enter the value `30000`. In the case of three decimal currencies, such as KWD, BHD and OMR, to refund a payment of 295.991, pass the value as 295990. And in the case of zero decimal currencies such as JPY, to refund a payment of 295, pass the value as 295.

**Watch Out!**

As per payment guidelines, you should pass the last decimal number as 0 for three decimal currency payments. For example, if you want to refund a customer 99.991 KD for a transaction, you should pass the value for the amount parameter as `99990` and not `99991`.

`currency`

`string`

A three-letter ISO code for the currency in which you want to accept the payment. For example, INR. Refer to the list of [supported currencies](/razorpay-docs-md/international-payments.md#supported-currencies).

**Handy Tips**

Razorpay has added support for zero decimal currencies, such as JPY, and three decimal currencies, such as KWD, BHD, and OMR, allowing businesses to accept international payments in these currencies. Know more about [Currency Conversion](/razorpay-docs-md/international-payments/currency-conversion.md)

(May 2024).

`accept_partial`

`boolean`

Indicates whether customers can make [partial payments](/razorpay-docs-md/payment-links/partial-payments.md) using the Payment Link. Possible values:

- `true`: Customer can make partial payments.
- `false` (default): Customer cannot make partial payments.

`first_min_partial_amount`

`integer`

Minimum amount, in currency subunits, that must be paid by the customer as the first partial payment. Default value is `100`. Default currency is `INR`. For example, if an amount of ₹700 is to be received from the customer in two installments of #1 - ₹500, #2 - ₹200, then you can set this value as `500000`. Must be passed along with `accept_partial` parameter.

`upi_link`

`boolean`

Must be set to `true` for creating UPI Payment Link. If the `upi_link` parameter is not passed or passed with value as false, a Standard Payment Link will be created. Possible values:

- `true`: Creates a UPI Payment Link.
- `false`: Creates a Standard Payment Link.

`description`

`string`

A brief description of the Payment Link. The maximum character limit supported is 2048.

`reference_id`

`string`

Reference number tagged to a Payment Link. Must be a unique number for each Payment Link. The maximum character limit supported is 40.

`customer`

`json object`

Customer details

Show child parameters (3)

`expire_by`

`integer`

Timestamp, in Unix, at which the Payment Link will expire. By default, a Payment Link will be valid for six months from the date of creation. Please note that the expire by date cannot exceed more than six months from the date of creation.

`notify`

`array`

Defines who handles Payment Link notification.

Show child parameters (2)

`notes`

`json object`

Key-value pair that can be used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Payment Link for Groceries.”`.

`callback_url`

`string`

If specified, adds a redirect URL to the Payment Link. Once customers completes the payment, they are redirected to the specified URL.

**Handy Tips**

If the `callback_url` is passed, it must be passed in the correct format. That is, it should contain a URL.

`callback_method`

`string`

If `callback_url` parameter is passed, callback\_method must be passed with the value `get`.

`reminder_enable`

`boolean`

Used to send [reminders](/razorpay-docs-md/payment-links/reminders.md) for the Payment Link. Possible values:

- `true`: To send reminders.
- `false`: To disable reminders.

`options`

\*

`array`

Options to associate the `offer_id` with the Payment Link. Parent parameter under which the `order` child parameter must be passed.

Show child parameters (1)

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

The {input field} is required

Error Status: 4xx

A mandatory field is empty.

Solution

wrong input fields sent.

Error Status: 400

When wrong input fields are sent during Payment Link creation.

Solution

payment link creation with reference ID already attempted

Error Status: 400

An existing reference id has been passed.

Solution

timestamp must be atleast 15 minutes in future

Error Status: 400

The epoch time passed is less than 15 minutes from the current time.

Solution

Invalid access: Cannot create a payment link in live mode, as live mode is disabled for merchant.

Error Status: 400

Occurs when you try to create a Payment Link in Live mode, but live mode is disabled for you

Solution

Invalid access: Cannot create a payment link, as Merchant is Suspended.

Error Status: 400

Occurs when you try to create a Payment Link when you have been been suspended.

Solution

value: the length must not be greater than 255.

Error Status: 400

When the notes length is greater than 255 characters during Payment Link creation.

Solution

Curl

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X POST https://api.razorpay.com/v1/payment_links
-H 'content-type: application/json'
-d '{
 "amount": 3400,
 "currency": "INR",
 "accept_partial": false,
 "reference_id": "#425",
 "description": "Payment for policy no #23456",
 "customer": {
   "name": "Gaurav Kumar",
   "contact": "+919000090000",
   "email": "gaurav.kumar@example.com"
 },
 "notify": {
   "sms": true,
   "email": true
 },
 "reminder_enable": false,
 "options": {
   "order": {
     "offers": [
       "offer_F4WMTC3pwFKnzq",
       "offer_F4WJHqvGzw8dWF"
     ]
   }
 }
}'
```

Success

Failure

```json
{
 "accept_partial": false,
 "amount": 3400,
 "amount_paid": 0,
 "cancelled_at": 0,
 "created_at": 1600183040,
 "currency": "INR",
 "customer": {
   "contact": "+919000090000",
   "email": "gaurav.kumar@example.com",
   "name": "Gaurav Kumar"
 },
 "description": "Payment for policy no #23456",
 "expire_by": 0,
 "expired_at": 0,
 "first_min_partial_amount": 0,
 "id": "plink_FdLt0WBldRyE5t",
 "notes": null,
 "notify": {
   "email": true,
   "sms": true
 },
 "payments": null,
 "reference_id": "#425",
 "reminder_enable": false,
 "reminders": [],
 "short_url": "https://rzp.io/i/CM5ohDC",
 "status": "created",
 "user_id": ""
}
```
