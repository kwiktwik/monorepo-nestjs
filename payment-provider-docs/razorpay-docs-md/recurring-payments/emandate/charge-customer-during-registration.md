<!-- Source: https://razorpay.com/docs/payments/recurring-payments/emandate/charge-customer-during-registration -->

If you are using the existing emandate flow, you can only charge the customer after they complete the authorisation transaction and the token is confirmed. This means, you need to wait a few days before you can charge the customer. If the mandate registration fails, you have to start the process again, causing further delays. This may lead to a delay in onboarding the customer impacting your business.

You can use this feature where you can charge any amount to your customer as part of the authorisation transaction. The customer is charged an amount immediately while initiating the mandate registration in the background. This helps you to onboard the customer immediately without waiting for the mandate to be registered.

**Feature Request**

This is an on-demand feature. Please raise a request with our [Support team](https://razorpay.com/support/#request) to get this feature activated on your Razorpay account.

## Use Cases

Following are a couple of use cases where you can use this feature:

### Mutual Funds

When a customer starts a new Systematic Investment Plan (SIP), the investment needs to be made immediately. The customer needs to be charged as part of the mandate registered process. It is not possible to wait for a few days while the mandate is registered before charging the customer.

### Insurance

If you are an insurance provider, you need to charge the customer the first premium immediately when selling them the policy.

## Supported Banks

Currently, only **HDFC** and **ICICI** support this feature.

## Integration Steps

The integration flow here is same as that for emandate registration.

1. [Create an authorisation transaction](/razorpay-docs-md/recurring-payments/emandate/charge-customer-during-registration.md#1-create-an-authorization-transaction)

   .
2. [Check token status](/razorpay-docs-md/recurring-payments/emandate/charge-customer-during-registration.md#2-fetch-and-manage-tokens)

   .
3. [Create subsequent charges](/razorpay-docs-md/recurring-payments/emandate/charge-customer-during-registration.md#3-create-subsequent-payments)

   .

## 1. Create an Authorisation Transaction

You can create an authorisation transaction:

- Using the [Razorpay Standard Checkout](/razorpay-docs-md/recurring-payments/emandate/charge-customer-during-registration.md#11-using-razorpay-standard-checkout)  .
- Using a [Registration Link](/razorpay-docs-md/recurring-payments/emandate/charge-customer-during-registration.md#12-using-a-registration-link)  .

### 1.1. Using Razorpay Standard Checkout

To create an authorisation transaction using the Razorpay Standard Checkout, you need to:

1. [Create a Customer](/razorpay-docs-md/recurring-payments/emandate/charge-customer-during-registration.md#111-create-a-customer)

   .
2. [Create an Order](/razorpay-docs-md/recurring-payments/emandate/charge-customer-during-registration.md#112-create-an-order)

   .
3. [Create Authorisation Payment using Razorpay Standard Checkout](/razorpay-docs-md/recurring-payments/emandate/charge-customer-during-registration.md#113-create-an-authorisation-payment)

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

The Orders API allows you to create a unique Razorpay `order_id`, for example, `order_1Aa00000000001`, that would be tied to a payment. This `order_id` has a 1:1 mapping with the order created for the authorisation payment at your end. To learn more about Razorpay Orders, refer our detailed [Order documentation](/razorpay-docs-md/orders.md).

Use the below endpoint to create an order.

POST

/orders

You can create a payment against the `order_id` generated in the response.

##### Request Parameters

amount

mandatory

`integer` Amount in currency subunits. Pass `100` for ₹1.

currency

mandatory

`string` The 3-letter ISO currency code for the payment. Currently, we only support `INR`.

method

mandatory

`string` The authorisation method. In this case the value will be `emandate`.

payment\_capture

mandatory

`boolean` Determines if payment should be automatically captured. Possible values:

- `true` (recommended): Automatically capture the payment.
- `false` (default/not recommended): You have to manually capture payments.

customer\_id

mandatory

`string` The unique identifier of the customer, who is to be charged. For example, `cust_D0cs04OIpPPU1F`.

receipt

optional

`string` A user-entered unique identifier for the order. For example, `rcptid #1`. This parameter should be mapped to the `order_id` sent by Razorpay.

notes

optional

`object` Key-value pair that can be used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

token

Details related to the authorization such as max amount and bank account information.

auth\_type

optional

`string` Here, it has to be `netbanking`.

max\_amount

optional

`integer` The maximum amount, in paise, that a customer can be charged in one transaction. Know about [maximum and default values](/razorpay-docs-md/recurring-payments/emandate/faqs.md#2-what-is-the-maximum-amount-which-can).

expire\_at

optional

`integer` The timestamp, in Unix format, till when you can use the token (authorisation on the payment method) to charge the customer subsequent payments. Default is 10 years for `emandate`. The value can range from the current date to 31-12-2099 (`4101580799`).

bank\_account

Customer bank account details.

account\_number

optional

`string` Customer's bank account number.

ifsc\_code

optional

`string` Customer's bank IFSC. For example `UTIB0000001`.

beneficiary\_name

optional

`string` Customer's name. For example, `Gaurav Kumar`.

account\_type

optional

`string` Customer's bank account type. Possible values:

- `savings` (default)
- `current`

notes

optional

`object` Key-value pair that can be used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

#### 1.1.3. Create an Authorisation Payment

Create a payment checkout form for customers to make Authorisation Transaction and register their mandate. You can use the Handler Function or Callback URL.

**Watch Out!**

- The callback URL is not supported for recurring payments created using the registration link.
- While handling the first time authorisation payment response, consume the `error_reason` field with value `upi_dummy_payment` and `error_description` field with value `Payment was a dummy payment for one time mandate registration.` to identify successful mandate registration. The parent `error_code` will be `BAD_REQUEST_ERROR`.

##### Additional Checkout Fields

customer\_id

mandatory

`string` Unique identifier of the customer created in the [first step](/razorpay-docs-md/recurring-payments/emandate/charge-customer-during-registration.md#111-create-a-customer).

order\_id

mandatory

`string` Unique identifier of the order created in the [second step](/razorpay-docs-md/recurring-payments/emandate/charge-customer-during-registration.md#112-create-an-order).
`recurring` *mandatory*
: `integer` In this case, the value has to be `1`.

### 1.2. Using a Registration Link

Registration Link is an alternate way of creating an authorisation transaction. You can create a registration link using the [API](/razorpay-docs-md/recurring-payments/emandate/charge-customer-during-registration.md#121-create-a-registration-link) or [Dashboard](/razorpay-docs-md/recurring-payments/create.md#1-create-a-registration-link).

**Handy Tips**

- You do not have to create a customer if you choose the registration link method for creating an authorisation transaction.
- You can [use Webhooks to get notifications about successful payments](/razorpay-docs-md/api/payments/recurring-payments/webhooks.md#check-authorization-link-status-using-webhooks)

  against a registration link.

When you create a registration link, an [invoice](/razorpay-docs-md/invoices.md) is automatically issued to the customer. They can use this invoice to make the authorisation payment.

#### 1.2.1. Create a Registration Link

Use the below endpoint to create a registration link.

POST

/subscription\_registration/auth\_links

##### Request Parameters

customer

Details of the customer to whom the registration link will be sent.

name

mandatory

`string` Customer's name.

email

mandatory

`string` Customer's email address.

contact

mandatory

`string` Customer's phone number.

type

mandatory

`string` In this case, the value is `link`.

currency

mandatory

`string` The 3-letter ISO currency code for the payment. Currently, only `INR` is supported.

amount

mandatory

`integer` The payment amount in the smallest currency sub-unit.

description

mandatory

`string` A description that appears on the hosted page. For example, `12:30 p.m. Thali meals (Gaurav Kumar)`.

subscription\_registration

Details of the authorisation payment.

method

mandatory

`string` The authorisation method. In this case, it will be `emandate`.

auth\_type

optional

`string` Here, it has to be `netbanking`.

max\_amount

optional

`integer` The maximum amount, in paise, that a customer can be charged in one transaction. Know about [maximum and default values](/razorpay-docs-md/recurring-payments/emandate/faqs.md#2-what-is-the-maximum-amount-which-can).

expire\_at

optional

`integer` The timestamp, in Unix, till when you can use the token (authorization on the payment method) to charge the customer subsequent payments. Default is 10 years for `emandate`. The value can range from the current date to 31-12-2099 (`4101580799`).

bank\_account

The customer's bank account details.

beneficiary\_name

optional

`string` The account holder's name. For example `Gaurav Kumar`.

account\_number

optional

`integer` Customer's bank account number. For example `11214311215411`.

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

`boolean` Indicates if SMS notifications are to be sent by Razorpay. Can have the following values:

- `true` (default): Notifications are sent by Razorpay.
- `false`: Notifications are not sent by Razorpay.

email\_notify

optional

`boolean` Indicates if email notifications are to be sent by Razorpay. Can have the following values:

- `true` (default): Notifications are sent by Razorpay.
- `false`: Notifications are not sent by Razorpay.

expire\_by

optional

`integer` The timestamp, in Unix, till when the registration link should be available to the customer to make the authorisation transaction.

receipt

optional

`string` A unique identifier entered by you for the order. For example, `Receipt No. 1`. This parameter should be mapped to the `order_id` sent by Razorpay.

notes

optional

`object` This is a key-value pair that can be used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

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

#### 1.2.4. Cancel a Registration Link

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

Following are the two steps to create and charge your customer a subsequent payment:

You should perform the following steps to create and charge your customer subsequent payments:

1. [Create an order to charge the customer](/razorpay-docs-md/recurring-payments/emandate/charge-customer-during-registration.md#31-create-an-order-to-charge-the-customer)
2. [Create a recurring payment](/razorpay-docs-md/recurring-payments/emandate/charge-customer-during-registration.md#32-create-a-recurring-payment)

### 3.1. Create an Order to Charge the Customer

You have to create a new order every time you want to charge your customers. This order is different from the one created during the authorisation transaction.

The following endpoint creates an order.

POST

/orders

#### Request Parameters

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

### Related Information

- [Integrate Recurring Payments Using Emandate](/razorpay-docs-md/recurring-payments/emandate/integrate.md)
- [Supported Banks and Apps](/razorpay-docs-md/recurring-payments/emandate/supported-banks.md)
- [APIs](/razorpay-docs-md/recurring-payments/emandate/apis.md)
- [Handle Errors](/razorpay-docs-md/recurring-payments/emandate/errors.md)
