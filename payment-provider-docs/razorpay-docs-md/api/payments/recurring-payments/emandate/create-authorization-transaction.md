<!-- Source: https://razorpay.com/docs/api/payments/recurring-payments/emandate/create-authorization-transaction -->

You can create an authorisation transaction using [Razorpay APIs](/razorpay-docs-md/api/payments/recurring-payments/emandate/create-authorization-transaction.md#11-using-razorpay-apis) or [Registration Link](/razorpay-docs-md/api/payments/recurring-payments/emandate/create-authorization-transaction.md#12-using-a-registration-link).

## 1.1. Using Razorpay APIs

To create an authorisation transaction using Razorpay APIs, you need to:

1. [Create a Customer](/razorpay-docs-md/api/payments/recurring-payments/emandate/create-authorization-transaction.md#111-create-a-customer)

   .
2. [Create an Order](/razorpay-docs-md/api/payments/recurring-payments/emandate/create-authorization-transaction.md#112-create-an-order)

   .
3. [Create Authorisation Payment using Razorpay APIs](/razorpay-docs-md/api/payments/recurring-payments/emandate/create-authorization-transaction.md#113-create-an-authorisation-payment)

   .

**Handy Tips**

For the Authorisation Payment to be successful in a day (for example, 5th June), you should create an Order and the Authorisation Transaction on the same day (5th June) before 11:59 pm.

### 1.1.1. Create a Customer

Razorpay links recurring tokens to customers using a unique identifier generated through the Customer API.

You can create [customers](/razorpay-docs-md/api/customers.md) with basic information such as `email` and `contact` and use them for various Razorpay offerings. The following endpoint creates a customer.

POST

/customers

Sample Code

### Request Parameters

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

### Response Parameters

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

**Authorisation transaction + auto-charge first payment**

You can register a customer's mandate **and** charge them the first recurring payment as part of the same transaction. Know more about [charge first payment automatically after Emandate registration](/razorpay-docs-md/api/payments/recurring-payments/emandate/auto-debit.md).

### Request Parameters

amount

mandatory

`integer` Amount in currency subunits. For emandate, the amount should be `0`.

currency

mandatory

`string` The 3-letter ISO currency code for the payment. Currently, we only support `INR`.

payment\_capture

mandatory

`boolean` Determines whether tha payment status should be changed to `captured` automatically or not. Possible values:

- `true`: Payments are captured automatically.
- `false`: Payments are not captured automatically. You can manually capture payments using the [Manually Capture Payments API](/razorpay-docs-md/api/payments.md#capture-a-payment)  .

method

mandatory

`string` The authorisation method. Here, it is `emandate`.

customer\_id

mandatory

`string` The unique identifier of the customer to be charged. For example, `cust_D0cs04OIpPPU1F`.

receipt

optional

`string` A user-entered unique identifier of the order. For example, `rcptid #1`. You should map this parameter to the `order_id` sent by Razorpay.

notes

optional

`json object` Key-value pair that can be used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

token

Details related to the authorisation such as max amount and bank account information.

auth\_type

optional

`string` Emandate type used to make the authorisation payment. Possible values:

- `netbanking`
- `debitcard`
- `aadhaar`

max\_amount

optional

`integer` The maximum amount in paise a customer can be charged in a transaction. Know about the [maximum and default values](/razorpay-docs-md/recurring-payments/emandate/faqs.md#2-what-is-the-maximum-amount-which-can).

expire\_at

optional

`integer` The Unix timestamp to indicate till when you can use the token (authorisation on the payment method) to charge the customer subsequent payments. Defaults to 40 years. The maximum value you can set is 40 years from the current date. Any value beyond this will throw an error.

notes

optional

`object` Key-value pair that can be used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

bank\_account

Customer's bank account details that should be pre-filled on the checkout.

account\_number

optional

`string` Customer's bank account number.

account\_type

optional

`string` Customer's bank account type. Possible values:

- `savings` (default)
- `current`

ifsc\_code

optional

`string` Customer's bank IFSC. For example `UTIB0000001`.

beneficiary\_name

optional

`string` Name of the beneficiary. For example, `Gaurav Kumar`.

**Watch Out!**

The `beneficiary_name` should be between 4 to 120 characters.

### Response Parameters

id

`string` A unique identifier of the order created. For example `order_1Aa00000000001`.

entity

`string` The entity that has been created. Here it is `order`.

amount

`integer` Amount in currency subunits. For emandate, the amount should be `0`.

amount\_paid

`integer` The amount that has been paid.

amount\_due

`integer` The amount that is yet to pay.

currency

`string` The 3-letter ISO currency code for the payment. Currently, we only support `INR`.

receipt

`string` A user-entered unique identifier of the order. For example, `rcptid #1`. You should map this parameter to the `order_id` sent by Razorpay.

status

`string` The status of the order.

notes

`object` Key-value pair that can be used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

created\_at

`integer` The Unix timestamp at which the order was created.

token

Details related to the authorisation such as max amount and bank account information.

auth\_type

`string` Emandate type used to make the authorisation payment. Possible values:

- `netbanking`
- `debitcard`
- `aadhaar`

max\_amount

`integer` The maximum amount in paise a customer can be charged in a transaction. Know about the [maximum and default values](/razorpay-docs-md/recurring-payments/emandate/faqs.md#2-what-is-the-maximum-amount-which-can).

expire\_at

`integer` The Unix timestamp to indicate till when you can use the token (authorisation on the payment method) to charge the customer subsequent payments. The default value is 10 years for `emandate`. This value can range from the current date to 31-12-2099 (`4102444799`).

notes

`object` Key-value pair that can be used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

bank\_account

Customer's bank account details that should be pre-filled on the checkout.

account\_number

`string` Customer's bank account number.

account\_type

`string` Customer's bank account type. Possible values:

- `savings` (default)
- `current`

ifsc\_code

`string` Customer's bank IFSC. For example `UTIB0000001`.

beneficiary\_name

`string` Name of the beneficiary. For example, `Gaurav Kumar`.

### 1.1.3. Create an Authorisation Payment

Create a payment checkout form for customers to make Authorisation Transaction and register their mandate. You can use the Handler Function or Callback URL.

**Watch Out!**

- The callback URL is not supported for recurring payments created using the registration link.
- While handling the first time authorisation payment response, consume the `error_reason` field with value `upi_dummy_payment` and `error_description` field with value `Payment was a dummy payment for one time mandate registration.` to identify successful mandate registration. The parent `error_code` will be `BAD_REQUEST_ERROR`.

### Additional Checkout Fields

customer\_id

mandatory

`string` Unique identifier of the customer created in the [first step](/razorpay-docs-md/api/payments/recurring-payments/emandate/create-authorization-transaction.md#111-create-a-customer).

order\_id

mandatory

`string` Unique identifier of the order created in the [second step](/razorpay-docs-md/api/payments/recurring-payments/emandate/create-authorization-transaction.md#112-create-an-order).

## 1.2. Using a Registration Link

Registration Link is an alternate way of creating an authorisation transaction. You can create a registration link using the [API](/razorpay-docs-md/api/payments/recurring-payments/emandate/create-authorization-transaction.md#121-create-a-registration-link) or [Dashboard](/razorpay-docs-md/recurring-payments/create.md#1-create-a-registration-link).

**Handy Tips**

You do not have to create a customer if you choose the registration link method for creating an authorisation transaction.

- When you create a registration link, an [invoice](/razorpay-docs-md/invoices.md)

  is automatically issued to the customer. They can use this invoice to make the authorisation payment.
- A registration link should always have an order amount (in paise) the customer will be charged when making the authorisation payment. This amount should be `0` in the case of Emandate.

**Handy Tips**

You can [use Webhooks to get notifications about successful payments](/razorpay-docs-md/api/payments/recurring-payments/webhooks.md#check-authorization-link-status-using-webhooks) against a registration link.

### 1.2.1. Create a Registration Link

The following endpoint creates a registration link.

POST

/subscription\_registration/auth\_links

### Request Parameters

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

Details of the authorisation payment.

method

mandatory

`string` The authorization method. Here, it is `emandate`.

auth\_type

optional

`string` Possible values:

- `netbanking`
- `debitcard`
- `aadhaar`

max\_amount

optional

`integer` The maximum amount, in paise, a customer can be charged in a transaction. Know about [maximum and default values](/razorpay-docs-md/recurring-payments/emandate/faqs.md#2-what-is-the-maximum-amount-which-can).

expire\_at

optional

`integer` The Unix timestamp indicates till when you can use the token (authorization on the payment method) to charge the customer their subsequent payments. Defaults to `40 years`. The maximum value you can set is 40 years from the current date. Any value beyond this will throw an error.

bank\_account

The customer's bank account details.

beneficiary\_name

optional

`string` Name on the beneficiary. For example `Gaurav Kumar`.

**Watch Out!**

The `beneficiary_name` should be between 4 to 120 characters.

account\_number

optional

`string` Customer's bank account number. For example `11214311215411`.

account\_type

optional

`string` Customer's bank account type. Possible values:

- `savings` (default)
- `current`

ifsc\_code

optional

`string` Customer's bank IFSC. For example `HDFC0000001`.

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

### Response Parameters

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

### Path Parameters

id

mandatory

`string` The unique identifier of the invoice linked to the registration link for which you want to send the notification. For example, `inv_1Aa00000000001`.

medium

mandatory

`string` Determines through which medium you want to resend the notification. Possible values:

- `sms`
- `email`

### Response Parameters

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

### Path Parameter

id

mandatory

`string` The unique identifier for the invoice linked to the registration link that you want to cancel. For example, `inv_1Aa00000000001`.

### Response Parameters

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
