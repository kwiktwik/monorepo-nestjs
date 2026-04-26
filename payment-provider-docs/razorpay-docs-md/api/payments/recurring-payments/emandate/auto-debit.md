<!-- Source: https://razorpay.com/docs/api/payments/recurring-payments/emandate/auto-debit -->

You can register a customer's mandate and charge them the first recurring payment as part of the same transaction. For this, you have to pass the `first_payment_amount` parameter while creating the order.

## 1. Create an Authorisation Transaction

You can create an authorisation transaction:

- Using the [Razorpay Standard Checkout](/razorpay-docs-md/api/payments/recurring-payments/emandate/auto-debit.md#11-using-razorpay-standard-checkout)  .
- Using a [Registration Link](/razorpay-docs-md/api/payments/recurring-payments/emandate/auto-debit.md#12-using-a-registration-link)  .

### 1.1. Using Razorpay Standard Checkout

To create an authorisation transaction using the Razorpay Standard Checkout, you need to:

1. [Create a Customer](/razorpay-docs-md/api/payments/recurring-payments/emandate/auto-debit.md#111-create-a-customer)

   .
2. [Create an Order](/razorpay-docs-md/api/payments/recurring-payments/emandate/auto-debit.md#112-create-an-order)

   .
3. [Create Authorisation Payment using Razorpay Standard Checkout](/razorpay-docs-md/api/payments/recurring-payments/emandate/auto-debit.md#113-create-an-authorisation-payment)

   .

### 1.1.1. Create a Customer

Razorpay links recurring tokens to customers using a unique identifier generated through the Customer API.

You can create [customers](/razorpay-docs-md/api/customers.md) with basic information such as `email` and `contact` and use them for various Razorpay offerings. The following endpoint creates a customer.

POST

/customers

Sample Code

#### Request Parameters

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

#### Response Parameters

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

#### Emandate via Netbanking

#### Emandate via Debit Card

#### Emandate via Aadhaar

#### Request Parameters

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

`object` Details related to the authorization such as max amount and bank account information. Pass a value in the `first_payment_amount` parameter if you want to auto-charge the customer the first payment immediately after mandate authorisation. The first payment amount will be debited, with a new `order_id` and corresponding `payment_id` created automatically and executed within 2 days of emandate token confirmation.

first\_payment\_amount

optional

`integer` The amount, in paise, that should be auto-charged in addition to the authorization amount. For example, `100000`.

auth\_type

optional

`string` The payment method used to make the authorisation transaction. Possible values:

- `netbanking`
- `debitcard`
- `aadhaar`

max\_amount

optional

`integer` The maximum amount, in paise, that a customer can be charged in one transaction. Know about [maximum and default values](/razorpay-docs-md/recurring-payments/emandate/faqs.md#2-what-is-the-maximum-amount-which-can).

expire\_at

optional

`integer` The Unix timestamp, till when you can use the token (authorisation on the payment method) to charge the customer subsequent payments. The default value is 10 years for `emandate`. This value can range from the current date to 31-12-2099 (`4102444799`).

notes

optional

`object` Key-value pair that can be used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

bank\_account

The customer's bank account details that should be pre-filled on the checkout.

account\_number

optional

`string` The customer's bank account number.

account\_type

optional

`string` The customer's bank account type. Possible values:

- `savings` (default)
- `current`

ifsc\_code

optional

`string` The customer's bank IFSC. For example `UTIB0000001`.

beneficiary\_name

optional

`string` The customer's name. For example, `Gaurav Kumar`.

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

`object` Customer's bank account details that should be pre-filled on the checkout.

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

`string` Unique identifier of the customer created in the [first step](/razorpay-docs-md/api/payments/recurring-payments/emandate/auto-debit.md#111-create-a-customer).

order\_id

mandatory

`string` Unique identifier of the order created in the [second step](/razorpay-docs-md/api/payments/recurring-payments/emandate/auto-debit.md#112-create-an-order).

### 1.2. Using a Registration Link

Registration Link is an alternate way of creating an authorisation transaction. You can create a registration link using the [API](/razorpay-docs-md/api/payments/recurring-payments/emandate/auto-debit.md#121-create-a-registration-link) or [Dashboard](/razorpay-docs-md/recurring-payments/create.md#1-create-a-registration-link).

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

#### Emandate via Netbanking

#### Emandate via Debit Card

#### Emandate via Aadhaar

#### Request Parameters

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

`object` Details of the authorisation payment.

method

mandatory

`string` The authorization method. Here, it is `emandate`.

auth\_type

optional

`string` Possible values:

- `netbanking`
- `debitcard`
- `aadhaar`

first\_payment\_amount

optional

`integer` The amount, in paise, the customer should be auto-charged in addition to the authorisation amount. For example, `100000`. Pass a value in the `first_payment_amount` parameter if you want to auto-charge the customer the first payment immediately after mandate authorisation. The first payment amount will be debited, with a new `order_id` and corresponding `payment_id` created automatically and executed within 2 days of emandate token confirmation.

max\_amount

optional

`integer` The maximum amount, in paise, a customer can be charged in a transaction. Know about [maximum and default values](/razorpay-docs-md/recurring-payments/emandate/faqs.md#2-what-is-the-maximum-amount-which-can).

expire\_at

optional

`integer` The Unix timestamp indicates till when you can use the token (authorization on the payment method) to charge the customer their subsequent payments. Defaults to `40 years`. The maximum value you can set is 40 years from the current date. Any value beyond this will throw an error.

bank\_account

`object` The customer's bank account details.

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

#### Path Parameters

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

#### Path Parameter

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

## 2. Fetch and Manage Tokens

Once you capture a payment, Razorpay Checkout returns a `razorpay_payment_id`. You can use this id to fetch the `token_id`, which is used to create and charge subsequent payments.

You can retrieve the `token_id` using the [Dashboard](/razorpay-docs-md/recurring-payments/create.md#3-search-for-the-token) or the APIs given below.

Know more about [Tokens](/razorpay-docs-md/recurring-payments/emandate/integrate.md#fetch-emandate-registration-details).

### 2.1. Fetch Token by Payment ID

The following endpoint retrieves the `token_id` using a `payment_id`.

GET

/payments/:id

**Handy Tips**

You can also retrieve the `token_id` via the [payment.authorized](/razorpay-docs-md/api/payments/recurring-payments/webhooks.md#payment-authorized) webhook.

### Path Parameter

id

mandatory

`string` The unique identifier of the payment to be retrieved. For example, `pay_1Aa00000000002`.

### Response Parameters

id

`string` Unique identifier of the payment.

entity

`string` Indicates the type of entity. Here, it is `payment`.

amount

`integer` The payment amount represented in smallest unit of the currency passed. For example, `amount = 100` translates to `100` subunits, that is ₹1.

currency

`string` The currency in which the payment is made. Refer to the list of [international currencies](/razorpay-docs-md/international-payments.md#supported-currencies) that we support.

status

`string` The status of the payment. Possible values:

- `created`
- `authorized`
- `captured`
- `refunded`
- `failed`

order\_id

`string` The unique identifier of the order.

invoice\_id

`string` The unique identifier of the invoice.

international

`boolean` Indicates whether the payment is done via an international card or a domestic one. Possible values:

- `true`: Payment made using international card.
- `false`: Payment not made using international card.

method

`string` The payment method used for making the payment. Possible values:

- `card`
- `netbanking`
- `wallet`
- `emi`
- `upi`

amount\_refunded

`integer` The amount refunded in smallest unit of the currency passed.

refund\_status

`string` The refund status of the payment. Possible values:

- `null`
- `partial`
- `full`

captured

`boolean` Indicates if the payment is captured. Possible values:

- `true`: Payment has been captured.
- `false`: Payment has not been captured.

description

`string` Description of the payment, if any.

email

`string` Customer email address used for the payment.

contact

`integer` Customer contact number used for the payment.

customer\_id

`string` The unique identifier of the customer.

token\_id

`string` The unique identifier of the token.

notes

`json object` Contains user-defined fields, stored for reference purposes.

fee

`integer` Fee (including GST) charged by Razorpay.

tax

`integer` GST charged for the payment.

error\_code

`string` Error that occurred during payment. For example, `BAD_REQUEST_ERROR`.

error\_description

`string` Description of the error that occurred during payment. For example, `Payment processing failed because of incorrect OTP`.

error\_source

`string` The point of failure. For example, `customer`.

error\_step

`string` The stage where the transaction failure occurred. The stages can vary depending on the payment method used to complete the transaction. For example, `payment_authentication`.

error\_reason

`string` The exact error reason. For example, `incorrect_otp`.

created\_at

`integer` Timestamp, in UNIX format, on which the payment was created.

### 2.2. Fetch Tokens by Customer ID

A customer can have multiple tokens and these tokens can be used to create subsequent payments for multiple products or services. The following endpoint retrieves tokens linked to a customer.

**Watch Out!**

This endpoint will not fetch the details of expired and unused tokens.

GET

/customers/:id/tokens

### Path Parameter

id

mandatory

`string` The unique identifier of the customer for whom tokens are to be retrieved. For example, `cust_1Aa00000000002`.

### Response Parameters

entity

`string` The entity being created. Here, it is a `collection`.

count

`integer` The number of tokens to be fetched.

items

`object` Details related to token such as `token id` and bank information.

id

`string` The unique identifier linked to an item. In this example, it is `token_id`.

entity

`string` The entity being created. Here, it is a `token`.

token

`string` The token is being fetched.

bank

`string` Card issuing bank details.

wallet

`string` Provides wallet information.

method

`string` The payment method used to make the transaction.

card

`object` Details related to card used to make the transaction.

entity

`string` The entity being created. Here, it is `card`.

name

`string` Name of the cardholder.

last4

`integer` Last 4 digits of the card.

network

`string` Name of the payment processor. Here it is `Visa`.

type

`string` Card type (debit or credit). In this example, it is `credit`.

issuer

`string` Name of the card-issuing bank.

international

`boolean` Card usage restriction. Possible values:

- `true`: Supports international transactions.
- `false`: International transactions are not supported.

emi

`string` Card EMI status. Possible values.

- `true`: The card is on EMI.
- `false`: The card is not on EMI.

sub\_type

`string` Type of the customer.

expiry\_month

`integer` Month on which the card expires.

expiry\_year

`integer` Year on which the card expires.

flows

`object` The transaction flow details.

otp

`string` Whether the OTP function is enabled or not. Possible values:

- `true`: The OTP function is enabled.
- `false`: The OTP function is not enabled.

recurring

`string` Whether the recurring for this payment method is enabled or not. Possible Values:

- `true`: Recurring is enabled.
- `false`: Recurring is not enabled.

vpa

`object` The VPA details.

username

`string` The username of the VPA holder. For example, `gaurav.kumar`.

handle

`string` The VPA handle. Here it is `upi`.

name

`string` The name of the VPA holder.

recurring

`string` This represents whether recurring is enabled for this token. Possible values:

- `true`: Recurring is enabled.
- `false`: Recurring is not enabled.

recurring\_details

`object` Details of the recurring transaction.

status

`string` This represents the status of the recurring transaction. Possible values:

- `initiated`
- `confirmed`
- `rejected`
- `cancelled`
- `paused`

failure\_reason

`string` This provides the reason why the recurring transaction failed.

auth\_type

`string` The authorisation type details.

mrn

`string` The unique identifier issued by the payment gateway during customer registration. This can be Gateway Reference Number or Gateway Token.

used\_at

`integer` The VPA usage timestamp.

created\_at

`integer` The token creation timestamp.

expired\_at

`integer` The token expiry date timestamp.

dcc\_enabled

`string` Indicates whether the option to change currency is enabled or not. Possible values.

- `true`: The option to change currency is enabled
- `false`: The option to change currency is not enabled.

### 2.3. Delete Tokens

The following endpoint deletes a token.

DELETE

/customers/:customer\_id/tokens/:token\_id

### Path Parameter

customer\_id

mandatory

`string` The unique identifier of the customer with whom the token is linked. For example, `cust_1Aa00000000002`.

token\_id

mandatory

`string` The unique identifier of the token that is to be deleted. For example, `token_1Aa00000000001`.

### Response Parameters

deleted

`boolean` Indicates whether the token is deleted. Possible values:

- `true`: The token is deleted successfully.
- `false`: The token was not deleted.

## 3. Create Subsequent Payments

You should perform the following steps to create and charge your customer subsequent payments:

1. [Create an order to charge the customer](/razorpay-docs-md/api/payments/recurring-payments/emandate/auto-debit.md#31-create-an-order-to-charge-the-customer)
2. [Create a recurring payment](/razorpay-docs-md/api/payments/recurring-payments/emandate/auto-debit.md#32-create-a-recurring-payment)

### 3.1. Create an Order to Charge the Customer

You have to create a new order every time you want to charge your customers. This order is different from the one created during the authorisation transaction.

The following endpoint creates an order.

POST

/orders

### Request Parameters

amount

mandatory

`integer` Amount in currency subunits.

currency

mandatory

`string` The 3-letter ISO currency code for the payment.

receipt

optional

`string` A user-entered unique identifier for the order. For example, `Receipt No. 1`. You should map this parameter to the `order_id` sent by Razorpay.

notes

optional

`object` Key-value pair you can use to store additional information about the entity. Maximum of 15 key-value pairs, 256 characters each. For example, `"note_key": "Beam me up Scotty”`.

payment\_capture

mandatory

`boolean` Determines whether the payment status should be changed to `captured` automatically or not. Possible values:

- `true`: Payments are captured automatically.
- `false`: Payments are not captured automatically. You can manually capture payments using the [Manually Capture Payments API](/razorpay-docs-md/api/payments.md#capture-a-payment)  .

### Response Parameters

id

`string` A unique identifier of the order created. For example `order_1Aa00000000001`.

entity

`string` The entity that has been created. Here it is `order`.

amount

`integer` Amount in currency subunits.

amount\_paid

`integer` The amount that has been paid.

amount\_due

`integer` The amount that is yet to pay.

currency

`string` The 3-letter ISO currency code for the payment. Currently, we only support `INR`.

receipt

`string` A user-entered unique identifier of the order. For example, `rcptid #1`.

status

`string` The status of the order.

notes

`object` Key-value pair you can use to store additional information about the entity. Maximum of 15 key-value pairs, 256 characters each. For example, `"note_key": "Beam me up Scotty”`.

created\_at

`integer` The Unix timestamp at which the order was created.

### 3.2. Create a Recurring Payment

Once you have generated an `order_id`, use it with the `token_id` to create a payment and charge the customer. The following endpoint creates a payment to charge the customer.

POST

/payments/create/recurring

CurlJavaPythonGoPHPRubyNode.js.NET

copy

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X POST https://api.razorpay.com/v1/payments/create/recurring \
-H "Content-Type: application/json" \
-d '{
  "email": "gaurav.kumar@example.com",
  "contact": "+919876543210",
  "amount": 1000,
  "currency": "",
  "order_id": "order_1Aa00000000002",
  "customer_id": "cust_1Aa00000000001",
  "token": "token_1Aa00000000001",
  "recurring": true,
  "description": "Creating recurring payment for Gaurav Kumar",
  "notes": {
    "note_key 1": "Beam me up Scotty",
    "note_key 2": "Tea. Earl Gray. Hot."
  }
}'
```

Success ResponseFailure Response

copy

```json
{
  "razorpay_payment_id" : "pay_1Aa00000000001"
}
```

### Request Parameters

email

mandatory

`string` The customer's email address. For example, `gaurav.kumar@example.com`.

contact

mandatory

`integer` The customer's phone number. For example, `9876543210`.

currency

mandatory

`string` 3-letter ISO currency code for the payment. Currently, only `INR` is allowed.

amount

mandatory

`integer` The amount you want to charge your customer. This should be the same as the order amount.

order\_id

mandatory

`string` The unique identifier of the order created. For example, `order_1Aa00000000002`.

customer\_id

mandatory

`string` The unique identifier of the customer you want to charge. For example, `cust_1Aa00000000002`.

token

mandatory

`string` The `token_id` generated when the customer successfully completes the authorisation payment. Different payment instruments for the same customer have different `token_id`.

recurring

mandatory

`boolean` Determines whether recurring payment is enabled or not.

- `true`: Recurring payment is enabled.
- `false`: Recurring payment is not enabled.

description

optional

`string` A user-entered description for the payment. For example, `Creating recurring payment for Gaurav Kumar`

notes

optional

`object` Key-value pair you can use to store additional information about the entity. Maximum of 15 key-value pairs, 256 characters each. For example, `"note_key": "Beam me up Scotty”`.

### Response Parameters

razorpay\_payment\_id

`string` The unique identifier of the payment that is created. For example, `pay_1Aa00000000001`.
