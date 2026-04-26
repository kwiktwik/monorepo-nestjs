<!-- Source: https://razorpay.com/docs/payments/payment-gateway/s2s-integration/recurring-payments/upi-tpv/authorization-transaction -->

You can create an authorisation transaction using the [Razorpay APIs](/razorpay-docs-md/payment-gateway/s2s-integration/recurring-payments/upi-tpv/authorization-transaction.md#11-using-razorpay-apis) or [Registration Link](/razorpay-docs-md/payment-gateway/s2s-integration/recurring-payments/upi-tpv/authorization-transaction.md#12-using-a-registration-link).

## 1.1 Using Razorpay APIs

You can create an authorisation transaction with the UPI Collect payment method using the following APIs:

1.1.1 Create a Customer

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

1.1.2. Create an Order

Use the [Orders API](/razorpay-docs-md/api/orders.md) to create a unique Razorpay `order_id` that is associated with the authorisation transaction. The following endpoint creates an order.

POST

/orders

Sample Code

Request Parameters

amount

mandatory

`integer` Amount, in paise.

currency

mandatory

`string` The 3-letter ISO currency code for the payment. Currently, we only support `INR`.

customer\_id

mandatory

`string` The unique identifier of the customer. For example, `cust_4xbQrmEoA5WJ01`.

method

mandatory

`string` Payment method for the authorisation transaction. Here, the value should be `upi`.

receipt

optional

`string` Unique identifier for the order entered by you. For example, `Receipt No. 1`. This parameter should be mapped to the `order_id` sent by Razorpay.

notes

optional

`object` Key-value pair that can be used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

token

Details related to the authorization such as max amount, frequency and expiry information.

max\_amount

mandatory

`integer` The maximum amount that can be debited in a single charge.

For other categories and MCCs, the minimum value is `100` (₹1) and maximum value is 9999900 (₹99,999).

expire\_at

mandatory

`integer` The Unix timestamp that indicates when the authorisation transaction must expire. The default value is 10 years and the maximum value allowed is 30 years.

frequency

mandatory

`string` The frequency at which you can charge your customer. Possible values:

- `daily`
- `weekly`
- `fortnightly`
- `bimonthly`
- `monthly`
- `quarterly`
- `half_yearly`
- `yearly`
- `as_presented`

recurring\_value

optional

`integer` Determines the exact date or range of dates for recurring debits. Possible values are:

- 1-7 for `weekly` frequency
- 1-31 for `fortnightly` frequency
- 1-31 for `bimonthly` frequency
- 1-31 for `monthly` frequency
- 1-31 for `quarterly` frequency
- 1-31 for `half_yearly` frequency
- 1-31 for `yearly` frequency and is not applicable for the `as_presented` frequency.

**Watch Out!**

If the date entered for the recurring debit is not available for a month, then the last day of the month is considered by default. For example, if the date entered is 31 and the month has only 28 days, then the date 28 is considered.

recurring\_type

optional

`string` Determines when the recurring debit can be done. Possible values are:

- `on`: Recurring debit happens on the exact day of every month.

  **Handy Tips**

  For creating an order with `recurring_type`=`on`, set the `recurring_value` parameter to the current date.
- `before`: Recurring debit can happen any time before the specified date.
- `after`: Recurring debit can happen any time after the specified date.

For example, if the frequency is `monthly`, recurring\_value is `17` and recurring\_type is `before`, recurring debit can happen between the month's 1st and 17th. Similarly, if recurring\_type is `after`, recurring debit can only happen on or after the 17th of the month.

bank\_account

mandatory

Details of the bank account of the customer.

account\_number

mandatory

`integer` The bank account number of the customer. For example, `123456789012345`.

name

mandatory

`string` The name of the bank account holder.

ifsc

mandatory

The IFSC of the bank. For example, `HDFC0000053`.

1.1.3. Validate the VPA (UPI ID)

Use the below endpoint to validate the customer's UPI ID.

POST

/payments/validate/vpa

Sample Code

RequestResponse

copy

```bash
curl -u <YOUR_KEY_ID>:<YOUR_KEY_SECRET> \
    -X POST https://api.razorpay.com/v1/payments/validate/vpa \
    -H "Content-Type: application/json" \
    -d '{
      "vpa": "gauravkumar@exampleupi"
    }'
```

**Request Parameters**

vpa

mandatory

`string` The UPI ID you want to validate. For example, `gauravkumar@exampleupi`.

1.1.4. Create an Authorisation Payment

Once an order is created, your next step is to create a payment. Use the below endpoint to create a payment with payment method `upi`.

POST

/payments/create/upi

Request Parameters

amount

mandatory

`integer` The amount associated with the payment in smallest unit of the supported currency. For example, `2000` means ₹20. Must match the amount in [Step 1.1.2.: Create an Order](/docs/#112-create-an-order).

currency

mandatory

`string` The 3-letter ISO currency code for the payment. Currently, we only support INR.

order\_id

mandatory

`string` The unique identifier of the order created in [Step 1.1.2.: Create an Order](/docs/#112-create-an-order).

email

mandatory

`string` The customer's email address. For example, `gaurav.kumar@example.com`.

contact

mandatory

`string` The customer's contact number. For example, `9123456780`.

customer\_id

mandatory

`string` Unique identifier of the customer, obtained from the response of [Step 1.1.1.: Create an Customer](/razorpay-docs-md/payment-gateway/s2s-integration/recurring-payments/upi-tpv/authorization-transaction.md#111-create-a-customer).

recurring

mandatory

`string` Possible values:

- `1`: Recurring payment is enabled.
- `preferred`: Use this when you want to support recurring payments and one-time payment in the same flow.

method

mandatory

`string` The payment method selected by the customer. Here, the value must be `upi`.

upi

Details of the expiry of the UPI link

flow

mandatory

`string` Specify the type of the UPI payment flow.
 Possible values are:

- `collect` (default)
- `intent`

vpa

mandatory

`string` VPA of the customer where the collect request will be sent.

expiry\_time

mandatory

`integer` Period of time (in minutes) after which the link will expire. The default value is **5**.

ip

mandatory

`string` Client's browser IP address. For example, **117.217.74.98**.

referer

mandatory

`string` Value of `referer` header passed by the client's browser. For example, **<https://example.com/>**

user\_agent

mandatory

`string` Value of `user_agent` header passed by the client's browser.
For example, **Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36**

description

optional

`string` Descriptive text of the payment.

save

optional

`boolean` Specifies if the VPA should be stored as a token. Possible values:

- `true`: Saves the VPA details.
- `false`(default): Does not save the VPA details.

notes

optional

`json object` Key-value pairs that can hold additional information about the payment.
 Refer to the [Notes](/razorpay-docs-md/api/understand.md#notes) section of the API Reference Guide.

**Response Parameters**

If the payment request is valid, the response contains the following fields. Refer to the [UPI Collect Flow document](/razorpay-docs-md/payment-gateway/s2s-integration/payment-methods/upi/collect.md#step-4-initiate-a-payment) for more details.

razorpay\_payment\_id

`string` Unique reference for the payment created. For example, `pay_EAm09NKReXi2e0`.

## 1.2. Using a Registration Link

Registration Links are an alternate way of creating an authorisation transaction. If you create a registration link, you need not create a customer or an order.

When you create a registration link, an [invoice](/razorpay-docs-md/invoices.md) is automatically issued to the customer. The customer can use the invoice to make the Authorisation Payment.

Know how to [create Registration Links](/razorpay-docs-md/recurring-payments/create.md) using the Dashboard.

**Handy Tips**

You can use webhooks to get notifications about successful payments against a registration link. Know more about [Webhooks](/razorpay-docs-md/api/payments/recurring-payments/webhooks.md#check-authorization-link-status-using-webhooks).

A registration link must always have the amount (in Paise) that the customer will be charged when making the authorisation payment. For UPI, the amount must be a minimum of `₹1`.

### 1.2.1. Create a Registration Link

The following endpoint creates a registration link.

POST

/subscription\_registration/auth\_links

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

Details of the authorisation transaction.

method

mandatory

`string` The payment method used to make authorisation transaction. Here, it is `card`.

max\_amount

mandatory

`integer` Use to set the maximum amount (in paise) per debit request.

For other categories and MCCs, the minimum value is `100` (₹1) and maximum value is 9999900 (₹99,999).

expire\_at

optional

`integer` The Unix timestamp till when you can use the token to charge the customer subsequent payments. The default value is 10 years and the maximum value allowed is 30 years.

frequency

mandatory

`string` The frequency at which you can charge your customer. Possible values:

- `daily`
- `weekly`
- `fortnightly`
- `bimonthly`
- `monthly`
- `quarterly`
- `half_yearly`
- `yearly`
- `as_presented`

recurring\_value

optional

`integer` Determines the exact date or range of dates for recurring debits. Possible values are:

- 1-7 for `weekly` frequency
- 1-31 for `fortnightly` frequency
- 1-31 for `bimonthly` frequency
- 1-31 for `monthly` frequency
- 1-31 for `quarterly` frequency
- 1-31 for `half_yearly` frequency
- 1-31 for `yearly` frequency and is not applicable for the `as_presented` frequency.

**Watch Out!**

If the date entered for the recurring debit is not available for a month, then the last day of the month is considered by default. For example, if the date entered is 31 and the month has only 28 days, then the date 28 is considered.

recurring\_type

optional

`string` Determines when the recurring debit can be done. Possible values are:

- `on`: recurring debit happens on the exact day of every month.
- `before`: recurring debit can happens any time before the specified date.
- `after`: recurring debit can happens any time after the specified date.

For example, if the frequency is `monthly`, recurring\_value is `17` and recurring\_type is `before`, recurring debit can happen between the month's 1st and 17th. Similarly, if recurring\_type is `after`, recurring debit can only happen on or after the 17th of the month.

bank\_account

mandatory

Details of the bank account of the customer.

account\_number

mandatory

`integer` The bank account number of the customer. For example, `123456789012345`.

name

mandatory

`string` The name of the bank account holder.

ifsc

mandatory

`string` The IFSC of the bank. For example, `HDFC0000053`.

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
