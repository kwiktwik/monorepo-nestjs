<!-- Source: https://razorpay.com/docs/api/payments/invoices/fetch-with-id -->

# Fetch an Invoice With ID

`GET`

`/v1/invoices/:id`

Use this endpoint to retrieve all the details of an invoice.

Sample Code

Path Parameters

1

Response Parameters

Errors

Curl

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET]
-X GET https://api.razorpay.com/v1/invoices/inv_E7q0tqkxBRzdau
-H 'content-type:application/json'
```

Success

Failure

```json
{
  "id": "inv_E7q0tqkxBRzdau",
  "entity": "invoice",
  "receipt": null,
  "invoice_number": null,
  "customer_id": "cust_E7q0trFqXgExmT",
  "customer_details": {
    "id": "cust_E7q0trFqXgExmT",
    "name": "Gaurav Kumar",
    "email": "gaurav.kumar@example.com",
    "contact": "+919876543210",
    "gstin": null,
    "billing_address": {
      "id": "addr_E7q0ttqh4SGhAC",
      "type": "billing_address",
      "primary": true,
      "line1": "Bakers Street",
      "line2": "Country Road",
      "zipcode": "560068",
      "city": "Bengaluru",
      "state": "Karnataka",
      "country": "in"
    },
    "shipping_address": {
      "id": "addr_E7q0ttKwVA1h2V",
      "type": "shipping_address",
      "primary": true,
      "line1": "Bakers Street",
      "line2": "Country Road",
      "zipcode": "560068",
      "city": "Bengaluru",
      "state": "Karnataka",
      "country": "in"
    },
    "customer_name": "Gaurav Kumar",
    "customer_email": "gaurav.kumar@example.com",
    "customer_contact": "+919876543210"
  },
  "order_id": "order_E7q0tvRpC0WJwg",
  "line_items": [
    {
      "id": "li_E7q0tuPNg84VbZ",
      "item_id": null,
      "ref_id": null,
      "ref_type": null,
      "name": "Master Cloud Computing in 30 Days",
      "description": "Book by Ravena Ravenclaw",
      "amount": 399,
      "unit_amount": 399,
      "gross_amount": 399,
      "tax_amount": 0,
      "taxable_amount": 399,
      "net_amount": 399,
      "currency": "",
      "type": "invoice",
      "tax_inclusive": false,
      "hsn_code": null,
      "sac_code": null,
      "tax_rate": null,
      "unit": null,
      "quantity": 1,
      "taxes": []
    }
  ],
  "payment_id": null,
  "status": "issued",
  "expire_by": 1589765167,
  "issued_at": 1579765167,
  "paid_at": null,
  "cancelled_at": null,
  "expired_at": null,
  "sms_status": "pending",
  "email_status": "pending",
  "date": 1579765167,
  "terms": null,
  "partial_payment": true,
  "gross_amount": 399,
  "tax_amount": 0,
  "taxable_amount": 399,
  "amount": 399,
  "amount_paid": 0,
  "amount_due": 399,
  "currency": "",
  "currency_symbol": "₹",
  "description": "Invoice for the month of January 2020",
  "notes": [],
  "comment": null,
  "short_url": "https://rzp.io/i/2wxV8Xs",
  "view_less": true,
  "billing_start": null,
  "billing_end": null,
  "type": "invoice",
  "group_taxes_discounts": false,
  "created_at": 1579765167,
  "idempotency_key": null
}
```

###### Path Parameters

`id`

\*

`string`

The unique identifier of the invoice.

###### Response Parameters

`id`

`string`

The unique identifier of the invoice.

`entity`

`string`

Indicates the type of entity. Here, it is `invoice`.

`type`

`string`

Here, it should be `invoice`.

`invoice_number`

`string`

Unique number you added for internal reference. The minimum character length is 1 and maximum is 40.

`customer_id`

`string`

The unique identifier of the customer. You can create `customer_id` using the [Customers API](/razorpay-docs-md/api/customers.md). Alternatively, you can pass the customer object described in the below fields.

`customer_details`

`object`

Details of the customer.

Show child parameters (6)

`order_id`

`string`

The unique identifier of the order associated with the invoice.

`line_items`

`object`

Details of the line item that is billed in the invoice. Maximum of 50 line items.

Show child parameters (8)

`payment_id`

`string`

Unique identifier of a payment made against this invoice.

`status`

`string`

The status of the invoice. Know more about [Invoice States](/razorpay-docs-md/invoices/states.md). Possible values:

- `draft`
- `issued`
- `partially_paid`
- `paid`
- `cancelled`
- `expired`
- `deleted`

`expire_by`

`integer`

Timestamp, in Unix format, at which the invoice will expire.

`issued_at`

`integer`

Timestamp, in Unix format, at which the invoice was issued to the customer.

`paid_at`

`integer`

Timestamp, in Unix format, at which the payment was made.

`cancelled_at`

`integer`

Timestamp, in Unix format, at which the invoice was cancelled.

`expired_at`

`integer`

Timestamp, in Unix format, at which the invoice expired.

`sms_status`

`string`

The delivery status of the SMS notification for the invoice sent to the customer. Possible values:

- `pending`
- `sent`

`email_status`

`string`

The delivery status of the email notification for the invoice sent to the customer. Possible values:

- `pending`
- `sent`

`partial_payment`

`boolean`

Indicates whether the customer can make a partial payment on the invoice. Possible values:

- `true`: The customer can make partial payments.
- `false` (default): The customer cannot make partial payments.

`amount`

`integer`

Amount to be paid using the invoice. Must be in the smallest unit of the currency. For example, if the amount to be received from the customer is ₹300, pass the value as `30000`.

`amount_paid`

`integer`

Amount paid by the customer against the invoice.

`amount_due`

`integer`

The remaining amount to be paid by the customer for the issued invoice.

`currency`

`string`

The currency associated with the invoice. You must mandatorily pass this parameter if accepting international payments. If you have passed `currency` as a sub-parameter in the `line_item` object, you must ensure that the same currency is passed in both places. Know about the [list of supported international currencies.](/razorpay-docs-md/international-payments.md#supported-currencies)

`description`

`string`

A brief description of the invoice. The maximum character length is 2048.

`notes`

`object`

Any custom notes added to the invoice. Maximum of 2048 characters.

`short_url`

`string`

The short URL that is generated. Share this link with customers to accept payments.

`date`

`integer`

Timestamp, in Unix format, that indicates the issue date of the invoice.

`terms`

`string`

Any terms to be included in the invoice. Maximum of 2048 characters.

`comment`

`string`

Any comments to be added in the invoice. Maximum of 2048 characters.

###### Errors

The API <key/secret> provided is invalid.

Error Status: 4xx

The API key or secret are not entered or an invalid API key is used.

Solution

The id provided does not exist.

Error Status: 400

The invoice id entered is either invalid or does not belong to the requester account.

Solution

# Fetch an Invoice With ID

`GET`

`/v1/invoices/:id`

Use this endpoint to retrieve all the details of an invoice.

Path Parameters

1

Response Parameters

Errors

###### Path Parameters

`id`

\*

`string`

The unique identifier of the invoice.

###### Response Parameters

`id`

`string`

The unique identifier of the invoice.

`entity`

`string`

Indicates the type of entity. Here, it is `invoice`.

`type`

`string`

Here, it should be `invoice`.

`invoice_number`

`string`

Unique number you added for internal reference. The minimum character length is 1 and maximum is 40.

`customer_id`

`string`

The unique identifier of the customer. You can create `customer_id` using the [Customers API](/razorpay-docs-md/api/customers.md). Alternatively, you can pass the customer object described in the below fields.

`customer_details`

`object`

Details of the customer.

Show child parameters (6)

`order_id`

`string`

The unique identifier of the order associated with the invoice.

`line_items`

`object`

Details of the line item that is billed in the invoice. Maximum of 50 line items.

Show child parameters (8)

`payment_id`

`string`

Unique identifier of a payment made against this invoice.

`status`

`string`

The status of the invoice. Know more about [Invoice States](/razorpay-docs-md/invoices/states.md). Possible values:

- `draft`
- `issued`
- `partially_paid`
- `paid`
- `cancelled`
- `expired`
- `deleted`

`expire_by`

`integer`

Timestamp, in Unix format, at which the invoice will expire.

`issued_at`

`integer`

Timestamp, in Unix format, at which the invoice was issued to the customer.

`paid_at`

`integer`

Timestamp, in Unix format, at which the payment was made.

`cancelled_at`

`integer`

Timestamp, in Unix format, at which the invoice was cancelled.

`expired_at`

`integer`

Timestamp, in Unix format, at which the invoice expired.

`sms_status`

`string`

The delivery status of the SMS notification for the invoice sent to the customer. Possible values:

- `pending`
- `sent`

`email_status`

`string`

The delivery status of the email notification for the invoice sent to the customer. Possible values:

- `pending`
- `sent`

`partial_payment`

`boolean`

Indicates whether the customer can make a partial payment on the invoice. Possible values:

- `true`: The customer can make partial payments.
- `false` (default): The customer cannot make partial payments.

`amount`

`integer`

Amount to be paid using the invoice. Must be in the smallest unit of the currency. For example, if the amount to be received from the customer is ₹300, pass the value as `30000`.

`amount_paid`

`integer`

Amount paid by the customer against the invoice.

`amount_due`

`integer`

The remaining amount to be paid by the customer for the issued invoice.

`currency`

`string`

The currency associated with the invoice. You must mandatorily pass this parameter if accepting international payments. If you have passed `currency` as a sub-parameter in the `line_item` object, you must ensure that the same currency is passed in both places. Know about the [list of supported international currencies.](/razorpay-docs-md/international-payments.md#supported-currencies)

`description`

`string`

A brief description of the invoice. The maximum character length is 2048.

`notes`

`object`

Any custom notes added to the invoice. Maximum of 2048 characters.

`short_url`

`string`

The short URL that is generated. Share this link with customers to accept payments.

`date`

`integer`

Timestamp, in Unix format, that indicates the issue date of the invoice.

`terms`

`string`

Any terms to be included in the invoice. Maximum of 2048 characters.

`comment`

`string`

Any comments to be added in the invoice. Maximum of 2048 characters.

###### Errors

The API <key/secret> provided is invalid.

Error Status: 4xx

The API key or secret are not entered or an invalid API key is used.

Solution

The id provided does not exist.

Error Status: 400

The invoice id entered is either invalid or does not belong to the requester account.

Solution

Curl

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET]
-X GET https://api.razorpay.com/v1/invoices/inv_E7q0tqkxBRzdau
-H 'content-type:application/json'
```

Success

Failure

```json
{
  "id": "inv_E7q0tqkxBRzdau",
  "entity": "invoice",
  "receipt": null,
  "invoice_number": null,
  "customer_id": "cust_E7q0trFqXgExmT",
  "customer_details": {
    "id": "cust_E7q0trFqXgExmT",
    "name": "Gaurav Kumar",
    "email": "gaurav.kumar@example.com",
    "contact": "+919876543210",
    "gstin": null,
    "billing_address": {
      "id": "addr_E7q0ttqh4SGhAC",
      "type": "billing_address",
      "primary": true,
      "line1": "Bakers Street",
      "line2": "Country Road",
      "zipcode": "560068",
      "city": "Bengaluru",
      "state": "Karnataka",
      "country": "in"
    },
    "shipping_address": {
      "id": "addr_E7q0ttKwVA1h2V",
      "type": "shipping_address",
      "primary": true,
      "line1": "Bakers Street",
      "line2": "Country Road",
      "zipcode": "560068",
      "city": "Bengaluru",
      "state": "Karnataka",
      "country": "in"
    },
    "customer_name": "Gaurav Kumar",
    "customer_email": "gaurav.kumar@example.com",
    "customer_contact": "+919876543210"
  },
  "order_id": "order_E7q0tvRpC0WJwg",
  "line_items": [
    {
      "id": "li_E7q0tuPNg84VbZ",
      "item_id": null,
      "ref_id": null,
      "ref_type": null,
      "name": "Master Cloud Computing in 30 Days",
      "description": "Book by Ravena Ravenclaw",
      "amount": 399,
      "unit_amount": 399,
      "gross_amount": 399,
      "tax_amount": 0,
      "taxable_amount": 399,
      "net_amount": 399,
      "currency": "",
      "type": "invoice",
      "tax_inclusive": false,
      "hsn_code": null,
      "sac_code": null,
      "tax_rate": null,
      "unit": null,
      "quantity": 1,
      "taxes": []
    }
  ],
  "payment_id": null,
  "status": "issued",
  "expire_by": 1589765167,
  "issued_at": 1579765167,
  "paid_at": null,
  "cancelled_at": null,
  "expired_at": null,
  "sms_status": "pending",
  "email_status": "pending",
  "date": 1579765167,
  "terms": null,
  "partial_payment": true,
  "gross_amount": 399,
  "tax_amount": 0,
  "taxable_amount": 399,
  "amount": 399,
  "amount_paid": 0,
  "amount_due": 399,
  "currency": "",
  "currency_symbol": "₹",
  "description": "Invoice for the month of January 2020",
  "notes": [],
  "comment": null,
  "short_url": "https://rzp.io/i/2wxV8Xs",
  "view_less": true,
  "billing_start": null,
  "billing_end": null,
  "type": "invoice",
  "group_taxes_discounts": false,
  "created_at": 1579765167,
  "idempotency_key": null
}
```
