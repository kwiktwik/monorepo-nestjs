<!-- Source: https://razorpay.com/docs/api/payments/invoices/cancel -->

# Cancel an Invoice

Copy for AI

View as Markdown

`POST`

`/v1/invoices/:id/cancel`

Use this endpoint to cancel an invoice. Invoices in the `paid` state cannot be cancelled.

Sample Code

Path Parameters

1

Response Parameters

Errors

Curl

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET]

-X POST https://api.razorpay.com/v1/invoices/inv_JqVZyyKWjCs9cY/cancel \
```

Success

Failure

```json
{
  "amount": 20000,
  "amount_due": null,
  "amount_paid": null,
  "billing_end": null,
  "billing_start": null,
  "cancelled_at": 1657203958,
  "comment": "Fresh sea weed mowed this morning",
  "created_at": 1657203943,
  "currency": "",
  "currency_symbol": "<currency_symbol>",
  "customer_details": {
    "billing_address": null,
    "contact": "+919876543210",
    "customer_contact": "+919876543210",
    "customer_email": "gaurav.kumar@example.com",
    "customer_name": "Gaurav Kumar",
    "email": "gaurav.kumar@example.com",
    "gstin": null,
    "id": "cust_DtHaBuooGHTuyZ",
    "name": "Gaurav Kumar",
    "shipping_address": null
  },
  "customer_id": "cust_DtHaBuooGHTuyZ",
  "date": 1588076279,
  "description": "Domestic invoice for Gaurav Kumar.",
  "email_status": "pending",
  "entity": "invoice",
  "expire_by": 1924991999,
  "expired_at": null,
  "first_payment_min_amount": null,
  "gross_amount": 20000,
  "group_taxes_discounts": false,
  "id": "inv_JqVZyyKWjCs9cY",
  "idempotency_key": null,
  "invoice_number": "Receipt No. 123234",
  "issued_at": null,
  "line_items": [
    {
      "amount": 20000,
      "currency": "",
      "description": "Crate of sea weed.",
      "gross_amount": 20000,
      "hsn_code": null,
      "id": "li_JqVZyzHIx1exXC",
      "item_id": null,
      "name": "Crate of sea weed",
      "net_amount": 20000,
      "quantity": 1,
      "ref_id": null,
      "ref_type": null,
      "sac_code": null,
      "tax_amount": 0,
      "tax_inclusive": false,
      "tax_rate": null,
      "taxable_amount": 20000,
      "taxes": [],
      "type": "invoice",
      "unit": null,
      "unit_amount": 20000
    }
  ],
  "notes": {
    "notes_key_1": "Tea, Earl Grey, Hot",
    "notes_key_2": "Tea, Earl Grey… decaf."
  },
  "order_id": null,
  "paid_at": null,
  "partial_payment": true,
  "payment_id": null,
  "receipt": "Receipt No. 123234",
  "reminder_status": null,
  "short_url": null,
  "sms_status": "pending",
  "status": "cancelled",
  "subscription_status": null,
  "supply_state_code": null,
  "tax_amount": 0,
  "taxable_amount": 20000,
  "terms": "No Returns; No Refunds",
  "type": "invoice",
  "user_id": null,
  "view_less": true
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

Operation not allowed for Invoice in cancelled status.

Error Status: 400

You are trying to cancel an invoice which is already in the cancelled status.

Solution

# Cancel an Invoice

Copy for AI

View as Markdown

`POST`

`/v1/invoices/:id/cancel`

Use this endpoint to cancel an invoice. Invoices in the `paid` state cannot be cancelled.

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

Operation not allowed for Invoice in cancelled status.

Error Status: 400

You are trying to cancel an invoice which is already in the cancelled status.

Solution

Curl

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET]

-X POST https://api.razorpay.com/v1/invoices/inv_JqVZyyKWjCs9cY/cancel \
```

Success

Failure

```json
{
  "amount": 20000,
  "amount_due": null,
  "amount_paid": null,
  "billing_end": null,
  "billing_start": null,
  "cancelled_at": 1657203958,
  "comment": "Fresh sea weed mowed this morning",
  "created_at": 1657203943,
  "currency": "",
  "currency_symbol": "<currency_symbol>",
  "customer_details": {
    "billing_address": null,
    "contact": "+919876543210",
    "customer_contact": "+919876543210",
    "customer_email": "gaurav.kumar@example.com",
    "customer_name": "Gaurav Kumar",
    "email": "gaurav.kumar@example.com",
    "gstin": null,
    "id": "cust_DtHaBuooGHTuyZ",
    "name": "Gaurav Kumar",
    "shipping_address": null
  },
  "customer_id": "cust_DtHaBuooGHTuyZ",
  "date": 1588076279,
  "description": "Domestic invoice for Gaurav Kumar.",
  "email_status": "pending",
  "entity": "invoice",
  "expire_by": 1924991999,
  "expired_at": null,
  "first_payment_min_amount": null,
  "gross_amount": 20000,
  "group_taxes_discounts": false,
  "id": "inv_JqVZyyKWjCs9cY",
  "idempotency_key": null,
  "invoice_number": "Receipt No. 123234",
  "issued_at": null,
  "line_items": [
    {
      "amount": 20000,
      "currency": "",
      "description": "Crate of sea weed.",
      "gross_amount": 20000,
      "hsn_code": null,
      "id": "li_JqVZyzHIx1exXC",
      "item_id": null,
      "name": "Crate of sea weed",
      "net_amount": 20000,
      "quantity": 1,
      "ref_id": null,
      "ref_type": null,
      "sac_code": null,
      "tax_amount": 0,
      "tax_inclusive": false,
      "tax_rate": null,
      "taxable_amount": 20000,
      "taxes": [],
      "type": "invoice",
      "unit": null,
      "unit_amount": 20000
    }
  ],
  "notes": {
    "notes_key_1": "Tea, Earl Grey, Hot",
    "notes_key_2": "Tea, Earl Grey… decaf."
  },
  "order_id": null,
  "paid_at": null,
  "partial_payment": true,
  "payment_id": null,
  "receipt": "Receipt No. 123234",
  "reminder_status": null,
  "short_url": null,
  "sms_status": "pending",
  "status": "cancelled",
  "subscription_status": null,
  "supply_state_code": null,
  "tax_amount": 0,
  "taxable_amount": 20000,
  "terms": "No Returns; No Refunds",
  "type": "invoice",
  "user_id": null,
  "view_less": true
}
```
