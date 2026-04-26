<!-- Source: https://razorpay.com/docs/payments/payment-gateway/s2s-integration/recurring-payments/emandate/auto-debit -->

## 1. Create an Authorisation Transaction

**Authorisation transaction + auto-charge first payment**

You can register a customer's mandate **AND** charge them the first recurring payment as part of the same transaction. To do this all you have to do is pass the `first_payment_amount` parameter while creating the order.

You can create an authorisation transaction using the [Razorpay APIs](/razorpay-docs-md/payment-gateway/s2s-integration/recurring-payments/emandate/auto-debit.md#11-using-razorpay-apis) or [Registration Link](/razorpay-docs-md/payment-gateway/s2s-integration/recurring-payments/emandate/auto-debit.md#12-using-a-registration-link).

### 1.1. Using Razorpay APIs

To create an authorisation transaction using the Razorpay APIs, you need to:

1. [Create a Customer](/razorpay-docs-md/payment-gateway/s2s-integration/recurring-payments/emandate/auto-debit.md#111-create-a-customer)

   .
2. [Create an Order](/razorpay-docs-md/payment-gateway/s2s-integration/recurring-payments/emandate/auto-debit.md#112-create-an-order)

   .
3. [Create Authorisation Payment using Razorpay APIs](/razorpay-docs-md/payment-gateway/s2s-integration/recurring-payments/emandate/auto-debit.md#113-create-an-authorisation-payment)

   .

#### 1.1.1. Create a Customer

Razorpay links recurring tokens to customers using a unique identifier generated through the Customer API.

You can create [customers](/razorpay-docs-md/api/customers.md) with basic information such as `email` and `contact` and use them for various Razorpay offerings. The following endpoint creates a customer.

POST

/customers

Sample Code

##### Request Parameters

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

#### 1.1.2. Create an Order

Use the [Orders API](/razorpay-docs-md/api/orders.md) to create a unique Razorpay `order_id` that is associated with the authorisation transaction. The following endpoint creates an order.

POST

/orders

#### Emandate via Netbanking

#### Emandate via Debit Card

#### Emandate via Aadhaar

##### Request Parameters

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

`object` Details related to the authorisation such as max amount and bank account information. Pass a value in the `first_payment_amount` parameter if you want to auto-charge the customer the first payment immediately after authorisation using the same `order_id`. The first payment will be created automatically and executed within 2 days of emandate token confirmation.

first\_payment\_amount

optional

`integer` The amount, in paise, that should be auto-charged in addition to the authorization amount. For example, `100000`.

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

#### 1.1.3. Create an Authorisation Payment

Once an order is created, your next step is to create a payment. Use the below endpoint to create a payment with payment method `netbanking`.

POST

/payments/create/json

##### Request Parameters

amount

mandatory

`integer` Amount in currency subunits. For netbanking, the amount has to be `0` (₹0).

currency

mandatory

`string` The 3-letter ISO currency code for the payment. Currently, we only support INR.

order\_id

mandatory

`string` The unique identifier of the order created using in [Step 1.1.2](/razorpay-docs-md/payment-gateway/s2s-integration/recurring-payments/emandate/auto-debit.md#112-create-an-order).

customer\_id

mandatory

`string` The unique identifier of the customer to be charged. For example, `cust_K39wXdBlhqNk0B`.

recurring

mandatory

`boolean` Possible values:

- `true`: Recurring payment is enabled.
- `false`: Recurring payment is not enabled.

auth\_type

optional

`string` Emandate type used to make the authorisation payment. Possible values:

- `netbanking`
- `debitcard`
- `aadhaar`

email

mandatory

`string` The customer's email address. For example, `gaurav.kumar@example.com`.

contact

mandatory

`string` The customer's contact number. For example, `8888888888`.

method

mandatory

`string` The payment method selected by the customer. Here, the value must be `emandate`.

bank

mandatory

`string` The customer's bank name. The bank code used here should match the bank details used in [Step 1.1.2](/razorpay-docs-md/payment-gateway/s2s-integration/recurring-payments/emandate/auto-debit.md#112-create-an-order). Use the [Method API](/razorpay-docs-md/payment-gateway/s2s-integration/payment-methods/methods-api.md) to check the bank code.

account\_number

`string` Customer's bank account number.

account\_type

`string` Customer's bank account type. Possible values:

- `savings` (default)
- `current`

ifsc\_code

`string` Customer's bank IFSC. For example `HDFC0000001`.

##### Response Parameters

If the payment request is valid, the response contains the following fields. Refer to the [S2S Json V2 integration document](/razorpay-docs-md/payment-gateway/s2s-integration/json/v2.md#step-2-create-a-payment_) for more details.

razorpay\_payment\_id

`string` Unique identifier of the payment. Present for all responses.

next

`array` A list of action objects available to you to continue the payment process. Present when the payment requires further processing.

action

`string` An indication of the next step available to you to continue the payment process. The value here is `redirect` - Use this URL to redirect customer to the bank page.

url

`string` URL to be used for the action indicated.

### 1.2. Using a Registration Link

Registration Links are an alternate way of creating an authorisation transaction. If you create a registration link, you need not create a customer or an order.

When you create a registration link, an [invoice](/razorpay-docs-md/invoices.md) is automatically issued to the customer. The customer can use the invoice to make the Authorisation Payment.

Know how to [create Registration Links](/razorpay-docs-md/recurring-payments/create.md) using the Dashboard.

**Handy Tips**

You can use webhooks to get notifications about successful payments against a registration link. Know more about [Webhooks](/razorpay-docs-md/api/payments/recurring-payments/webhooks.md#check-authorization-link-status-using-webhooks).

A registration link must always have an amount (in paise) that the customer will be charged when making the authorisation payment. In the case of emandate, the order amount must be `0`.

#### 1.2.1. Create a Registration Link

The following endpoint creates a registration link.

POST

/subscription\_registration/auth\_links

#### Emandate via Netbanking

#### Emandate via Debit Card

#### Emandate via Aadhaar

##### Request Parameters

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

first\_payment\_amount

optional

`integer` The amount, in paise, the customer should be auto-charged in addition to the authorization amount. For example, `100000`.

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

#### 1.2.2. Send/Resend Notifications

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

##### Path Parameters

id

mandatory

`string` The unique identifier of the invoice linked to the registration link for which you want to send the notification. For example, `inv_1Aa00000000001`.

medium

mandatory

`string` Determines through which medium you want to resend the notification. Possible values:

- `sms`
- `email`

#### 1.2.3. Cancel a Registration Link

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

##### Path Parameter

id

mandatory

`string` The unique identifier for the invoice linked to the registration link that you want to cancel. For example, `inv_1Aa00000000001`.

## 2. Fetch and Manage Tokens

Once you capture a payment, Razorpay Checkout returns a `razorpay_payment_id`. You can use this id to fetch the `token_id`, which is used to create and charge subsequent payments.

You can retrieve the `token_id` using the [Dashboard](/razorpay-docs-md/recurring-payments/create.md#3-search-for-the-token) or the APIs given below.

### 2.1. Fetch Token by Payment ID

The following endpoint retrieves the `token_id` using a `payment_id`.

GET

/payments/:id

**Handy Tips**

You can also retrieve the `token_id` via the [payment.authorized](/razorpay-docs-md/api/payments/recurring-payments/webhooks.md#payment-authorized) webhook.

#### Path Parameter

id

mandatory

`string` The unique identifier of the payment to be retrieved. For example, `pay_1Aa00000000002`.

### 2.2. Fetch Tokens by Customer ID

A customer can have multiple tokens and these tokens can be used to create subsequent payments for multiple products or services. The following endpoint retrieves tokens linked to a customer.

**Watch Out!**

This endpoint will not fetch the details of expired and unused tokens.

GET

/customers/:id/tokens

#### Path Parameter

id

mandatory

`string` The unique identifier of the customer for whom tokens are to be retrieved. For example, `cust_1Aa00000000002`.

### 2.3. Delete Tokens

The following endpoint deletes a token.

DELETE

/customers/:customer\_id/tokens/:token\_id

#### Path Parameter

customer\_id

mandatory

`string` The unique identifier of the customer with whom the token is linked. For example, `cust_1Aa00000000002`.

token\_id

mandatory

`string` The unique identifier of the token that is to be deleted. For example, `token_1Aa00000000001`.

## 3. Create Subsequent Payments

You should perform the following steps to create and charge your customer subsequent payments:

1. [Create an order to charge the customer](/razorpay-docs-md/payment-gateway/s2s-integration/recurring-payments/emandate/auto-debit.md#31-create-an-order-to-charge-the-customer)
2. [Create a recurring payment](/razorpay-docs-md/payment-gateway/s2s-integration/recurring-payments/emandate/auto-debit.md#32-create-a-recurring-payment)

### 3.1. Create an Order to Charge the Customer

You have to create a new order every time you want to charge your customers. This order is different from the one created during the authorisation transaction.

The following endpoint creates an order.

POST

/orders

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

#### Request Parameters

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
