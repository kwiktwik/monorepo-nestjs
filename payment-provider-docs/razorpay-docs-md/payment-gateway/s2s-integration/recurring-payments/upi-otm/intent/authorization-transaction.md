<!-- Source: https://razorpay.com/docs/payments/payment-gateway/s2s-integration/recurring-payments/upi-otm/intent/authorization-transaction -->

Create a one time mandate on UPI to let your customers block an amount and pay later. The amount gets blocked on the customer's bank account and can be debited once within the expiry of the mandate. A one time mandate on UPI can help charge customers post-delivery of products or services, helping make the customer experience delightful for businesses like E-commerce, Travel, Transport, Healthcare, and many more.

**Example**

Gaurav Kumar wants to reserve a room at Acme Hotel. However, he is still determining the travel plan. He wants to pay after check-in.

Using UPI One Time Mandate, Gaurav Kumar can consent to block the hotel booking amount and only let Acme Hotel debit the amount after check-in.

To create a one time mandate:

1. [Create an authorisation transaction](/razorpay-docs-md/payment-gateway/s2s-integration/recurring-payments/upi-otm/intent/authorization-transaction.md#create-an-authorization-transaction)
2. [Fetch and manage tokens](/razorpay-docs-md/payment-gateway/s2s-integration/recurring-payments/upi-otm/intent/tokens.md)
3. [Create a one time mandate](/razorpay-docs-md/payment-gateway/s2s-integration/recurring-payments/upi-otm/intent/one-time-payment.md)

## Create an Authorisation Transaction

You can create an authorisation transaction using the [Razorpay APIs](/razorpay-docs-md/payment-gateway/s2s-integration/recurring-payments/upi-otm/intent/authorization-transaction.md#11-using-razorpay-apis) or [Registration Link](/razorpay-docs-md/payment-gateway/s2s-integration/recurring-payments/upi-otm/intent/authorization-transaction.md#12-using-a-registration-link).

## 1.1 Using Razorpay APIs

To create an authorisation transaction using the Razorpay APIs, you need to:

1. [Create a Customer](/razorpay-docs-md/payment-gateway/s2s-integration/recurring-payments/upi-otm/intent/authorization-transaction.md#111-create-a-customer)

   .
2. [Create an Order](/razorpay-docs-md/payment-gateway/s2s-integration/recurring-payments/upi-otm/intent/authorization-transaction.md#112-create-an-order)

   .
3. [Create Authorisation Payment using Razorpay APIs](/razorpay-docs-md/payment-gateway/s2s-integration/recurring-payments/upi-otm/intent/authorization-transaction.md#113-create-an-authorization-payment)

   .

### 1.1.1 Create a Customer

Razorpay links a one time mandate token to customers via a unique identifier. You can generate this identifier using the Customer API.

You can create [customers](/razorpay-docs-md/api/customers.md) with basic information such as `email` and `contact` and use them for various Razorpay offerings. The following endpoint creates a customer.

POST

/customers

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

### 1.1.2. Create an Order

Use the [Orders API](/razorpay-docs-md/api/orders.md) to create a unique Razorpay `order_id` that is associated with the authorisation transaction for a one time mandate. To create a one-time mandate, pass the value of the `frequency` parameter as `one_time`. The following endpoint creates an order.

POST

/orders

Request Parameters

amount

mandatory

`integer` Amount in currency subunits.

currency

mandatory

`string` The 3-letter ISO currency code for the payment. Currently, we only support `INR`.

customer\_id

mandatory

`string` The unique identifier of the customer. For example, `cust_4xbQrmEoA5WJ01`.

method

mandatory

`string` The authorisation method. Here, it is `upi`.

receipt

optional

`string` A user-entered unique identifier of the order. For example, `Receipt No. 1`. You should map this parameter to the `order_id` sent by Razorpay.

notes

optional

`object` Key-value pair that can be used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters each. For example, `"note_key": "Beam me up Scotty”`.

token

`object` Details related to the authorisation such as max amount, frequency and expiry information.

max\_amount

mandatory

`integer` The maximum amount that can be debited in a single charge.

For other categories and MCCs, the minimum value is `100` (₹1) and maximum value is 9999900 (₹99,999).

expire\_at

mandatory

`integer` The Unix timestamp at which the authorisation transaction expires. For insurance MCCs (6300, 5960, 6529), the maximum validity is 14 days. For all other MCCs, the maximum validity is 30 years.

frequency

mandatory

`string` The frequency at which you can charge your customer. The value should be `one_time` for one time mandate.

### 1.1.3. Create an Authorisation Payment

After you create an order, you should create a payment. Use the endpoint below to create a payment. This is a dummy transaction that fails with an error `BAD_REQUEST_ERROR` when a customer tries to approve the mandate request from a PSP application. A token is created and marked as `confirmed` for the same.

**Handy Tips**

You will get the [token.confirmed](/razorpay-docs-md/api/payments/recurring-payments/webhooks.md#token-confirmed) webhook after the customer approves the mandate request.

POST

/payments/create/upi

RequestResponse

copy

```bash
curl -u <YOUR_KEY_ID>:<YOUR_KEY_SECRET> \
-X POST https://api.razorpay.com/v1/payments/create/upi \
-H "Content-Type: application/json" \
-d '{
  "amount": 200,
  "currency": "INR",
  "order_id": "order_Ee0biRtLOqzRjP",
  "email": "gaurav.kumar@example.com",
  "contact": "9000090000",
  "customer_id": "cust_EIW4T2etiweBmG",
  "recurring": "1",
  "method": "upi",
  "upi": {
    "flow": "intent"
  },
  "notes": {
    "note_key": "value1"
  }
}'
```

Request Parameters

amount

mandatory

`integer` The amount associated with the payment in smallest unit of the supported currency. For example, `2000` means ₹20. Must match the amount in [Step 1.1.2.: Create an Order](/razorpay-docs-md/payment-gateway/s2s-integration/recurring-payments/upi-otm/intent/authorization-transaction.md#112-create-an-order).

currency

mandatory

`string` The 3-letter ISO currency code for the payment. Currently, we only support INR.

order\_id

mandatory

`string` The unique identifier of the order created in [Step 1.1.2.: Create an Order](/razorpay-docs-md/payment-gateway/s2s-integration/recurring-payments/upi-otm/intent/authorization-transaction.md#112-create-an-order).

email

mandatory

`string` The customer's email address. For example, `gaurav.kumar@example.com`.

contact

mandatory

`string` The customer's contact number. For example, `9123456780`.

customer\_id

mandatory

`string` Unique identifier of the customer, obtained from the response of [Step 1.1.1.: Create a Customer](/razorpay-docs-md/payment-gateway/s2s-integration/recurring-payments/upi-otm/intent/authorization-transaction.md#111-create-a-customer).

recurring

mandatory

`string` Determines if the recurring payment is enabled or not. Possible values:

- `1`: Recurring payment is enabled.
- `preferred`: Use this if you want to allow **recurring payments** and **one-time payment** in the same flow.

method

mandatory

`string` The payment method selected by the customer. Here, the value must be `upi`.

upi

`object` Details of the expiry of the UPI link

flow

mandatory

`string` Specify the type of the UPI payment flow.
 Possible values are:

- `collect` (default)
- `intent`

notes

optional

`json object` Key-value pairs that can hold additional information about the payment. Refer to the [Notes](/razorpay-docs-md/api/understand.md#notes) section of the API Reference Guide.

## 1.2. Using a Registration Link

Registration Links are an alternate way of creating an authorisation transaction. If you create a registration link, you need not create a customer or an order.

When you create a registration link, an [invoice](/razorpay-docs-md/invoices.md) is automatically issued to the customer. The customer can use the invoice to make the Authorisation Payment.

**Handy Tips**

You can use [Token Webhooks](/razorpay-docs-md/api/payments/recurring-payments/webhooks.md#check-authorization-link-status-using-webhooks) to get notifications about successful payments against a registration link. Do not use payment webhooks for Authorisation Payments.

### 1.2.1. Create a Registration Link

The following endpoint creates a registration link you can share with your customers to make one time mandate payments. This is a dummy transaction that fails with an error `BAD_REQUEST_ERROR` when a customer tries to approve the mandate request from a PSP application. A token is created and marked as `confirmed` for the same.

POST

/subscription\_registration/auth\_links

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

`string` The frequency at which you can charge your customer. The value should be `one_time` for one time mandate.

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

Path Parameters

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

Path Parameters

id

mandatory

`string` The unique identifier for the invoice linked to the registration link that you want to cancel. For example, `inv_1Aa00000000001`.
