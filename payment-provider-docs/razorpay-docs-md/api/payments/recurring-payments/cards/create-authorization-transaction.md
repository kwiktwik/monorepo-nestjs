<!-- Source: https://razorpay.com/docs/api/payments/recurring-payments/cards/create-authorization-transaction -->

You can create an authorisation transaction using [Razorpay APIs](/razorpay-docs-md/api/payments/recurring-payments/cards/create-authorization-transaction.md#11-using-razorpay-apis) or [Registration Link](/razorpay-docs-md/api/payments/recurring-payments/cards/create-authorization-transaction.md#12-using-a-registration-link).

**Watch Out!**

Bank downtime can affect success rates when processing recurring payments via debit cards.

## 1.1. Using Razorpay APIs

To create an authorisation transaction using Razorpay APIs, you need to:

1. [Create a Customer](/razorpay-docs-md/api/payments/recurring-payments/cards/create-authorization-transaction.md#111-create-a-customer)

   .
2. [Create an Order](/razorpay-docs-md/api/payments/recurring-payments/cards/create-authorization-transaction.md#112-create-an-order)

   .
3. [Create Authorisation Payment using Razorpay APIs](/razorpay-docs-md/api/payments/recurring-payments/cards/create-authorization-transaction.md#113-create-an-authorisation-payment)

   .

**Handy Tips**

For the Authorisation Payment to be successful in a day (for example, 5th June), you should create an Order and the Authorisation Transaction on the same day (5th June) before 11:59 pm.

### 1.1.1. Create a Customer

Razorpay links recurring tokens to customers using a unique identifier generated through the Customer API.

You can create [customers](/razorpay-docs-md/api/customers.md) with basic information such as `email` and `contact` and use them for various Razorpay offerings. The following endpoint creates a customer.

POST

/customers

Sample Code

Request Parameters

name

`string` The name of the customer. For example, `Gaurav Kumar`.

email

`string` The email address of the customer. For example, `gaurav.kumar@example.com`.

contact

`string` The phone number of the customer. For example, `9876543210`.

fail\_existing

optional

`string` The request throws an exception by default if a customer with the exact details already exists. You can pass an additional parameter `fail_existing` to get the existing customer's details in the response. Possible values:

- `1` (default): If a customer with the same details already exists, throws an error.
- `0`: If a customer with the same details already exists, fetches details of the existing customer.

notes

optional

`object` Key-value pair that can be used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

Response Parameters

id

`string` The unique identifier of the customer. For example `cust_1Aa00000000001`.

entity

`string` The name of the entity. Here, it is `customer`.

name

`string` The name of the customer. For example, `Gaurav Kumar`.

email

`string` The email address of the customer. For example, `gaurav.kumar@example.com`.

contact

`string` The phone number of the customer. For example, `9876543210`.

notes

`object` Key-value pair that can be used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

created\_at

`integer` A Unix timestamp, at which the customer was created.

You can create an order once you create a customer for the payment authorisation.

### 1.1.2. Create an Order

Use the [Orders API](/razorpay-docs-md/api/orders.md) to create a unique Razorpay `order_id` that is associated with the authorisation transaction. The following endpoint creates an order.

POST

/orders

CurlJavaPythonGoPHPRubyNode.js.NET

copy

```bash
curl -u <YOUR_KEY_ID>:<YOUR_KEY_SECRET> \
-X POST https://api.razorpay.com/v1/orders \
-H "Content-Type: application/json" \
-d '{
   "amount":100,
   "currency":"",
   "customer_id":"cust_4xbQrmEoA5WJ01",
   "method":"card",
   "token": {
    "max_amount": 1000000,
    "expire_at": 2709971120,
    "frequency": "monthly"
  },
   "receipt":"Receipt No. 1",
   "notes":{
      "notes_key_1":"Tea, Earl Grey, Hot",
      "notes_key_2":"Tea, Earl Grey... decaf."
   }
}'
```

Response

copy

```json
{
   "id":"order_1Aa00000000002",
   "entity":"order",
   "amount":100,
   "amount_paid":0,
   "amount_due":100,
   "currency":"",
   "receipt":"Receipt No. 1",
   "method":"card",
   "description":null,
   "customer_id":"cust_4xbQrmEoA5WJ01",
   "offer_id":null,
   "status":"created",
   "attempts":0,
   "notes":{
      "notes_key_1":"Tea, Earl Grey, Hot",
      "notes_key_2":"Tea, Earl Grey… decaf."
   },
   "created_at":1565172642
}
```

Request Parameters

amount

mandatory

`integer` Amount in currency subunits. For cards, the amount should be `100`, that is, ₹1.

currency

mandatory

`string` The 3-letter ISO currency code for the payment.

customer\_id

mandatory

`string` The unique identifier of the customer. For example, `cust_4xbQrmEoA5WJ01`.

method

optional

`string` Payment method used to make the authorisation transaction. Here, it is `card`.

token

`object` Details related to the authorisation such as max amount, frequency and expiry information.

max\_amount

mandatory

`integer` The maximum amount that can be auto-debited in a single charge. The minimum value is `100`, that is, ₹1, and the maximum value is `1500000`, that is, ₹15,000. For an amount higher than this, the cardholder should provide an Additional Factor of Authentication (AFA) as per RBI guidelines.

expire\_at

mandatory

`integer` The Unix timestamp that indicates when the authorisation transaction must expire. The card's expiry year is considered a default value.

frequency

mandatory

`string` The frequency at which you can charge your customer. Possible values:

- `weekly`
- `monthly`
- `yearly`
- `as_presented`

receipt

optional

`string` A user-entered unique identifier for the order. For example, `Receipt No. 1`. You should map this parameter to the `order_id` sent by Razorpay.

notes

optional

`object` Key-value pair you can use to store additional information about the entity. Maximum 15 key-value pairs, 256 characters each. For example, `"note_key": "Beam me up Scotty”`.

Response Parameters

id

`string` A unique identifier of the order created. For example `order_1Aa00000000002`.

entity

`string` The entity that has been created. Here it is `order`.

amount

`integer` Amount in currency subunits. For cards, the amount should be `100`, that is, ₹1.

amount\_paid

`integer` The amount that has been paid.

amount\_due

`integer` The amount that is yet to pay.

currency

`string` The 3-letter ISO currency code for the payment.

receipt

`string` A user-entered unique identifier of the order. For example, `Receipt No. 1`. You should map this parameter to the `order_id` sent by Razorpay.

method

`string` Payment method used to make the authorisation transaction. Here, it is `card`.

customer\_id

`string` The unique identifier of the customer. For example, `cust_4xbQrmEoA5WJ01`.

status

`string` The status of the order.

notes

`object` Key-value pair that can be used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

created\_at

`integer` The Unix timestamp at which the order was created.

You can create a payment against the `order_id` after you create an order.

### 1.1.3. Create an Authorisation Payment

Create a payment checkout form for customers to make Authorisation Transaction and register their mandate. You can use the Handler Function or Callback URL.

**Watch Out!**

- The callback URL is not supported for recurring payments created using the registration link.
- While handling the first time authorisation payment response, consume the `error_reason` field with value `upi_dummy_payment` and `error_description` field with value `Payment was a dummy payment for one time mandate registration.` to identify successful mandate registration. The parent `error_code` will be `BAD_REQUEST_ERROR`.

Additional Checkout Fields

You should send the following additional parameters along with the existing checkout options as a part of the authorisation transaction.

customer\_id

mandatory

`string` Unique identifier of the customer created in the [first step](/razorpay-docs-md/api/payments/recurring-payments/cards/create-authorization-transaction.md#111-create-a-customer).

order\_id

mandatory

`string` Unique identifier of the order created in the [second step](/razorpay-docs-md/api/payments/recurring-payments/cards/create-authorization-transaction.md#112-create-an-order).

recurring

mandatory

`boolean` Possible values:

- `true`: Recurring payment is enabled.
- `false`: Recurring payment is not enabled.

**Handy Tips**

The `recurring` parameter also supports the value `preferred`. Use this when you want to support recurring payments and one-time payment in the same flow.

After this step, you can proceed to integrate with the [Fetch Token API](/razorpay-docs-md/api/payments/recurring-payments/cards/tokens.md).

## 1.2. Using a Registration Link

Registration Link is an alternate way of creating an authorisation transaction. You can create a registration link using the API or [Dashboard](/razorpay-docs-md/recurring-payments/create.md#1-create-a-registration-link).

- You do not have to create a customer if you choose the registration link method for creating an authorisation transaction.
- When you create a registration link, an [invoice](/razorpay-docs-md/invoices.md)

  is automatically issued to the customer. They can use this invoice to make the authorisation payment.
- A registration link should always have an order amount (in subunits) the customer will be charged when making the authorisation payment. For cards, the amount should be ₹1 in the case of cards.

**Handy Tips**

You can [use Webhooks to get notifications about successful payments](/razorpay-docs-md/api/payments/recurring-payments/webhooks.md#check-authorization-link-status-using-webhooks) against a registration link.

### 1.2.1. Create a Registration Link

The following endpoint creates a registration link.

POST

/subscription\_registration/auth\_links

CurlJavaPythonGoPHPRubyNode.js.NET

copy

```bash
curl -u <YOUR_KEY_ID>:<YOUR_KEY_SECRET>
-X POST https://api.razorpay.com/v1/subscription_registration/auth_links
-H "Content-Type: application/json" \
-d '{
  "customer":{
    "name":"Gaurav Kumar",
    "email":"gaurav.kumar@example.com",
    "contact":"+919876543210"
  },
  "type":"link",
  "amount":"100",
  "currency":"",
  "description":"Registration Link for Gaurav Kumar",
  "subscription_registration":{
    "method":"card",
    "max_amount":"1000000",
    "expire_at":1609423824,
    "frequency": "monthly"
  },
  "receipt":"Receipt No. 1",
  "email_notify": true,
  "sms_notify": true,
  "expire_by":1580479824,
  "notes":{
    "note_key 1":"Beam me up Scotty",
    "note_key 2":"Tea. Earl Gray. Hot."
  }
}'
```

Response

copy

```json
{
  "id": "inv_FHrXGIpd3N17DX",
  "entity": "invoice",
  "receipt": "Receipt No. 24",
  "invoice_number": "Receipt No. 24",
  "customer_id": "cust_BMB3EwbqnqZ2EI",
  "customer_details": {
    "id": "cust_BMB3EwbqnqZ2EI",
    "name": "Gaurav Kumar",
    "email": "gaurav.kumar@example.com",
    "contact": "+919876543210",
    "gstin": null,
    "billing_address": null,
    "shipping_address": null,
    "customer_name": "Gaurav Kumar",
    "customer_email": "gaurav.kumar@example.com",
    "customer_contact": "+919876543210"
  },
  "order_id": "order_FHrXGJNngJyEAe",
  "line_items": [],
  "payment_id": null,
  "status": "issued",
  "expire_by": 4102444799,
  "issued_at": 1595491014,
  "paid_at": null,
  "cancelled_at": null,
  "expired_at": null,
  "sms_status": "pending",
  "email_status": "pending",
  "date": 1595491014,
  "terms": null,
  "partial_payment": false,
  "gross_amount": 100,
  "tax_amount": 0,
  "taxable_amount": 0,
  "amount": 100,
  "amount_paid": 0,
  "amount_due": 100,
  "currency": "",
  "currency_symbol": "₹",
  "description": "Registration Link for Gaurav Kumar",
  "notes": {
    "note_key 1": "Beam me up Scotty",
    "note_key 2": "Tea. Earl Gray. Hot."
  },
  "comment": null,
  "short_url": "https://rzp.io/i/VSriCfn",
  "view_less": true,
  "billing_start": null,
  "billing_end": null,
  "type": "link",
  "group_taxes_discounts": false,
  "created_at": 1595491014,
  "idempotency_key": null
}
```

Request Parameters

customer

`object` Details of the customer to whom the registration link is sent.

name

mandatory

`string` Customer's name.

email

mandatory

`string` Customer's email address.

contact

mandatory

`integer` Customer's contact number.

type

mandatory

`string` In this case, the value is `link`.

amount

mandatory

`integer` The payment amount in the smallest currency sub-unit.

currency

mandatory

`string` The 3-letter ISO currency code for the payment.

description

mandatory

`string` A description that appears on the hosted page.

subscription\_registration

`object` Details of the authorisation transaction.

method

mandatory

`string` The authorisation method. Here it is `card`.

max\_amount

mandatory

`integer` The maximum amount that can be auto-debited in a single charge. The minimum value is `100` (₹1) and the maximum value is `100000000` (₹10,00,000). For an amount higher than this or the RBI limit of ₹15,000 (`1500000`) or ₹1,00,000 (`10000000`) respectively, the cardholder should provide an Additional Factor of Authentication (AFA) as per RBI guidelines.

expire\_at

optional

`integer` The Unix timestamp till when you can use the token (authorisation on the payment method) to charge the customer subsequent payments. The card's expiry year is considered a default value.

frequency

mandatory

`string` The frequency at which you can charge your customer. Possible values:

- `weekly`
- `monthly`
- `yearly`
- `as_presented`

sms\_notify

optional

`boolean` Indicates if SMS notifications are to be sent by Razorpay. Possible values:

- `true` (default): Notifications are sent by Razorpay .
- `false`: Notifications are not sent by Razorpay.

email\_notify

optional

`boolean` Indicates if email notifications are to be sent by Razorpay. Possible values:

- `true` (default): Notifications are sent by Razorpay .
- `false`: Notifications are not sent by Razorpay.

expire\_by

optional

`integer` The Unix timestamp indicates the expiry of the registration link.

receipt

optional

`string` A unique identifier entered by you for the order. For example, `Receipt No. 1`. You should map this parameter to the `order_id` sent by Razorpay.

notes

optional

`object` This is a key-value pair that is used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

Response Parameters

id

`string` The unique identifier of the invoice.

entity

`string` The entity that has been created. Here, it is `invoice`.

receipt

`string` A user-entered unique identifier of the invoice.

invoice\_number

`string` Unique number you added for internal reference.

customer\_id

`string` The unique identifier of the customer. For example, `cust_BMB3EwbqnqZ2EI`.

customer\_details

`object` Details of the customer.

id

`string` The unique identifier associated with the customer to whom the invoice has been issued.

name

`string` The customer's name.

email

`string` The customer's email address.

contact

`integer` The customer's phone number.

billing\_address

`string` Details of the customer's billing address.

shipping\_address

`string` Details of the customer's shipping address.

order\_id

`string` The unique identifier of the order associated with the invoice.

line\_items

`string` Details of the line item that is billed in the invoice. Maximum of 50 line items are allowed.

payment\_id

`string` Unique identifier of a payment made against the invoice.

status

`string` The status of the invoice. Possible values:

- `draft`
- `issued`
- `partially_paid`
- `paid`
- `cancelled`
- `expired`
- `deleted`

expire\_by

`integer` The Unix timestamp at which the invoice will expire.

issued\_at

`integer` The Unix timestamp at which the invoice was issued to the customer.

paid\_at

`integer` The Unix timestamp at which the payment was made.

cancelled\_at

`integer` The Unix timestamp at which the invoice was cancelled.

expired\_at

`integer` The Unix timestamp at which the invoice expired.

sms\_status

`string` The delivery status of the SMS notification for the invoice sent to the customer. Possible values:

- `pending`
- `sent`

email\_status

`string` The delivery status of the email notification for the invoice sent to the customer. Possible values:

- `pending`
- `sent`

date

`integer` Timestamp, in Unix format, that indicates the issue date of the invoice.

terms

`string` Any terms to be included in the invoice. Maximum of 2048 characters.

partial\_payment

`boolean` Indicates whether the customer can make a partial payment on the invoice. Possible values:

- `true`: The customer can make partial payments.
- `false` (default): The customer cannot make partial payments.

amount

`integer` Amount to be paid using the invoice. Must be in the smallest unit of the currency. For example, if the amount to be received from the customer is ₹299.95, pass the value as `29995`.

amount\_paid

`integer` Amount paid by the customer against the invoice.

amount\_due

`integer` The remaining amount to be paid by the customer for the issued invoice.

currency

`string` The currency associated with the invoice.

description

`string` A brief description of the invoice.

notes

`object` Any custom notes added to the invoice. Maximum of 2048 characters.

short\_url

`string` The short URL that is generated. This is the link that can be shared with the customer to receive payments.

type

`string` Here, it is `invoice`.

comment

`string` Any comments to be added in the invoice. Maximum of 2048 characters.

### 1.2.2. Send/Resend Notifications

The following endpoint sends/resends notifications with the short URL to the customer:

POST

/invoices/:id/notify\_by/:medium

Sample Code

CurlJavaPythonGoPHPRubyNode.js.NET

copy

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET]
 -X POST https://api.razorpay.com/v1/invoices/inv_1Aa00000000001/notify_by/sms
```

Response

copy

```json
{
  "success": true
}
```

Path Parameters

id

mandatory

`string` The unique identifier of the invoice linked to the registration link for which you want to send the notification. For example, `inv_1Aa00000000001`.

medium

mandatory

`string` Determines through which medium you want to resend the notification. Possible values:

- `sms`
- `email`

Response Parameter

success

`boolean` Indicates whether the notifications were sent successfully. Possible values:

- `true`: The notifications were successfully sent via SMS, email or both.
- `false`: The notifications were not sent.

### 1.2.3. Cancel a Registration Link

The following endpoint cancels a registration link.

POST

/invoices/:id/cancel

**Handy Tips**

You can only cancel registration link in the `issued` state.

Sample Code

CurlJavaPythonGoPHPRubyNode.js.NET

copy

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET]
 -X POST https://api.razorpay.com/v1/invoices/inv_1Aa00000000001/cancel
```

Response

copy

```json
{
  "id": "inv_FHrfRupD2ouKIt",
  "entity": "invoice",
  "receipt": "Receipt No. 1",
  "invoice_number": "Receipt No. 1",
  "customer_id": "cust_BMB3EwbqnqZ2EI",
  "customer_details": {
      "id": "cust_BMB3EwbqnqZ2EI",
      "name": "Gaurav Kumar",
      "email": "gaurav.kumar@example.com",
      "contact": "+919876543210",
      "gstin": null,
      "billing_address": null,
      "shipping_address": null,
      "customer_name": "Gaurav Kumar",
      "customer_email": "gaurav.kumar@example.com",
      "customer_contact": "+919876543210"
  },
  "order_id": "order_FHrfRw4TZU5Q2L",
  "line_items": [],
  "payment_id": null,
  "status": "cancelled",
  "expire_by": 4102444799,
  "issued_at": 1595491479,
  "paid_at": null,
  "cancelled_at": 1595491488,
  "expired_at": null,
  "sms_status": "sent",
  "email_status": "sent",
  "date": 1595491479,
  "terms": null,
  "partial_payment": false,
  "gross_amount": 100,
  "tax_amount": 0,
  "taxable_amount": 0,
  "amount": 100,
  "amount_paid": 0,
  "amount_due": 100,
  "currency": "",
  "currency_symbol": "₹",
  "description": "Registration Link for Gaurav Kumar",
  "notes": {
      "note_key 1": "Beam me up Scotty",
      "note_key 2": "Tea. Earl Gray. Hot."
  },
  "comment": null,
  "short_url": "https://rzp.io/i/QlfexTj",
  "view_less": true,
  "billing_start": null,
  "billing_end": null,
  "type": "link",
  "group_taxes_discounts": false,
  "created_at": 1595491480,
  "idempotency_key": null
}
```

Path Parameter

id

mandatory

`string` The unique identifier for the invoice linked to the registration link that you want to cancel. For example, `inv_1Aa00000000001`.

Response Parameter

id

`string` The unique identifier of the invoice.

entity

`string` The entity that has been created. Here, it is `invoice`.

receipt

`string` A user-entered unique identifier of the invoice.

invoice\_number

`string` Unique number you added for internal reference.

customer\_id

`string` The unique identifier of the customer. For example, `cust_BMB3EwbqnqZ2EI`.

customer\_details

`object` Details of the customer.

id

`string` The unique identifier associated with the customer to whom the invoice has been issued.

name

`string` The customer's name.

email

`string` The customer's email address.

contact

`integer` The customer's phone number.

billing\_address

`string` Details of the customer's billing address.

shipping\_address

`string` Details of the customer's shipping address.

order\_id

`string` The unique identifier of the order associated with the invoice.

line\_items

`string` Details of the line item that is billed in the invoice. Maximum of 50 line items are allowed.

payment\_id

`string` Unique identifier of a payment made against the invoice.

status

`string` The status of the invoice. Possible values:

- `draft`
- `issued`
- `partially_paid`
- `paid`
- `cancelled`
- `expired`
- `deleted`

expire\_by

`integer` The Unix timestamp at which the invoice will expire.

issued\_at

`integer` The Unix timestamp at which the invoice was issued to the customer.

paid\_at

`integer` The Unix timestamp at which the payment was made.

cancelled\_at

`integer` The Unix timestamp at which the invoice was cancelled.

expired\_at

`integer` The Unix timestamp at which the invoice expired.

sms\_status

`string` The delivery status of the SMS notification for the invoice sent to the customer. Possible values:

- `pending`
- `sent`

email\_status

`string` The delivery status of the email notification for the invoice sent to the customer. Possible values:

- `pending`
- `sent`

date

`integer` Timestamp, in Unix format, that indicates the issue date of the invoice.

terms

`string` Any terms to be included in the invoice. Maximum of 2048 characters.

partial\_payment

`boolean` Indicates whether the customer can make a partial payment on the invoice. Possible values:

- `true`: The customer can make partial payments.
- `false` (default): The customer cannot make partial payments.

amount

`integer` Amount to be paid using the invoice. Must be in the smallest unit of the currency. For example, if the amount to be received from the customer is ₹299.95, pass the value as `29995`.

amount\_paid

`integer` Amount paid by the customer against the invoice.

amount\_due

`integer` The remaining amount to be paid by the customer for the issued invoice.

currency

`string` The currency associated with the invoice.

description

`string` A brief description of the invoice.

notes

`object` Any custom notes added to the invoice. Maximum of 2048 characters.

short\_url

`string` The short URL that is generated. This is the link that can be shared with the customer to receive payments.

type

`string` Here, it is `invoice`.

comment

`string` Any comments to be added in the invoice. Maximum of 2048 characters.

After this step, you can proceed to integrate with the [Fetch Token API](/razorpay-docs-md/api/payments/recurring-payments/cards/tokens.md).
