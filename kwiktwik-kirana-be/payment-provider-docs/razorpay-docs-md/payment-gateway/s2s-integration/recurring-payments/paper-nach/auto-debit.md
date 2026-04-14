<!-- Source: https://razorpay.com/docs/payments/payment-gateway/s2s-integration/recurring-payments/paper-nach/auto-debit -->

The flow to complete an authorisation transaction using paper NACH differs from the other payment method's flow.

1. Create a customer.
2. Create an order by passing the `customer_id` and the method as `nach`. Razorpay generates a NACH form with the customer information pre-filled and ready to sign.
3. The customer can get the form in one of the following ways to sign it:
   - You can download the form from the Dashboard and send it to the customer.
   - A customer can download the form from the Hosted page (in the case of registration links).
4. The signed form can be uploaded in one of the following ways:
   - Using the Standard Checkout page.
   - Hosted page (in the case of registration links).
   - The customer can send you the form and you can upload the form for the customer. The acceptable image formats and size are:
     - jpeg
     - jpg
     - png
     - Maximum accepted size is 6 MB.

Once the details are validated, the authorisation transaction is completed and a token is generated. You can charge your customer as per your business model after the token status changes to `confirmed`.

## 1. Create an Authorisation Transaction

You can create an authorisation transaction using the [Razorpay APIs](/razorpay-docs-md/payment-gateway/s2s-integration/recurring-payments/paper-nach/auto-debit.md#11-using-razorpay-apis) or [Registration Link](/razorpay-docs-md/payment-gateway/s2s-integration/recurring-payments/paper-nach/auto-debit.md#12-using-a-registration-link).

### 1.1. Using Razorpay APIs

To create an authorisation transaction using the Razorpay APIs, you need to:

1. [Create a Customer](/razorpay-docs-md/payment-gateway/s2s-integration/recurring-payments/paper-nach/auto-debit.md#111-create-a-customer)

   .
2. [Create an Order](/razorpay-docs-md/payment-gateway/s2s-integration/recurring-payments/paper-nach/auto-debit.md#112-create-an-order)

   .
3. [Create Authorisation Payment using Razorpay APIs](/razorpay-docs-md/payment-gateway/s2s-integration/recurring-payments/paper-nach/auto-debit.md#113-create-an-authorisation-payment)

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

Use the [Orders API](/razorpay-docs-md/api/orders.md) to create a unique Razorpay `order_id` that is associated with the authorisation transaction. The following endpoint creates an order.

POST

/orders

##### Request Parameters

amount

mandatory

`integer` Amount in currency subunits. For Paper NACH, the amount has to be `0`.

currency

mandatory

`string` The 3-letter ISO currency code for the payment. Currently, we only support `INR`.

method

mandatory

`string` The authorisation method. In this case the value will be `nach`.

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

Details related to the authorisation transaction such as max amount and bank account information. Pass a value in the `first_payment_amount` parameter if you want to auto-charge the customer the first payment immediately after authorization.

first\_payment\_amount

optional

`integer` The amount, in paise, that should be auto-charged in addition to the authorization amount. For example, `100000`.

auth\_type

mandatory

`string` In this case, it will be `physical`.

bank\_account

Customer's bank account details that will be printed on the NACH form.

account\_number

mandatory

`string` Customer's bank account number. For example `11214311215411`.

ifsc\_code

mandatory

`string` Customer's bank IFSC. For example `UTIB0000001`.

beneficiary\_name

mandatory

`string` Customer's name. For example, `Gaurav Kumar`.

account\_type

optional

`string` Customer's bank account type. Possible values:

- `savings` (default)
- `current`
- `cc` (Cash Credit)
- `nre` (SB-NRE)
- `nro` (SB-NRO)

max\_amount

optional

`integer` Use to set the maximum amount per debit request. Know about [maximum and default values](/razorpay-docs-md/recurring-payments/paper-nach/faqs.md#3-is-there-a-limit-on-the-debit).

expire\_at

optional

`integer` Timestamp, in Unix, that specifies when the registration link should expire. The value can range from the current date to 01-19-2038 (`2147483647`).

nach

Additional information to be printed on the NACH form that your customer will sign.

form\_reference1

optional

`string` A user-entered reference that appears on the NACH form.

form\_reference2

optional

`string` A user-entered reference that appears on the NACH form.

description

optional

`string` A user-entered description that appears on the hosted page. For example, `Form for Gaurav Kumar.`

notes

optional

`object` Key-value pair that can be used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

#### 1.1.3. Create an Authorisation Payment

After you create an order, you have to create an authorisation payment. To create an authorisation payment:

1. Download the Paper NACH form and send it to the customers.
2. Ask the customers to fill the form and send it to you.
3. You upload the received form via the create NACH File API. The acceptable image formats and size are jpeg, jpg and png. Maximum accepted size is 6 MB.

Use the below endpoint to upload the signed Paper NACH form via APIs.

POST

/payments/create/nach/file

Razorpay's OCR-enabled NACH engine submits the form to NPCI on successful verification and you will receive a success/failure response.

Use the following API to upload the NACH file sent by the customer.

### 1.2. Using a Registration Link

Registration Links are an alternate way of creating an authorisation transaction. If you create a registration link, you need not create a customer or an order.

When you create a registration link, an [invoice](/razorpay-docs-md/invoices.md) is automatically issued to the customer. The customer can use the invoice to make the Authorisation Payment.

Know how to [create Registration Links](/razorpay-docs-md/recurring-payments/create.md) using the Dashboard.

**Handy Tips**

You can use webhooks to get notifications about successful payments against a registration link. Know more about [Webhooks](/razorpay-docs-md/api/payments/recurring-payments/webhooks.md#check-authorization-link-status-using-webhooks).

A registration link must always have an amount (in paise) that the customer will be charged when making the authorisation payment. In the case of Paper NACH, the order amount must be `0`.

#### 1.2.1. Create a Registration Link

Use the below endpoint to create a registration link for recurring payments.

POST

/subscription\_registration/auth\_links

**Download and Upload the Pre-filled NACH Form**

Once the registration link is created, the customer should complete these steps:

1. Download the pre-filled form using the Download NACH Form option on the Razorpay hosted page.
2. Sign the form.
3. Upload the signed form using the Upload NACH Form option on the Razorpay hosted page.

The following endpoint creates a registration link for recurring payments.

POST

/subscription\_registration/auth\_links

**Download and Upload the Pre-filled NACH Form**

Once the registration link is created, the customer should complete these steps:

1. Download the pre-filled form using the Download NACH Form option on the Razorpay hosted page.
2. Sign the form.
3. Upload the signed form using the Upload NACH Form option on the Razorpay hosted page.

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

first\_payment\_amount

optional

`integer` The amount, in paise, the customer should be auto-charged in addition to the authorization amount. For example, `100000`.

subscription\_registration

Details of the authorisation payment.

method

mandatory

`string` The Paper NACH method used to make the authorisation transaction. Here, it is `physical`.

auth\_type

mandatory

`string` The payment method used to make the authorisation transaction. Here, it is `nach`.

bank\_account

The customer's bank account details.

beneficiary\_name

mandatory

`string` The beneficiary name. For example, `Gaurav Kumar`.

account\_number

mandatory

`integer` The customer's bank account number. For example, `11214311215411`.

account\_type

mandatory

`string` The customer's bank account type. Possible values:

- `savings`
- `current`

ifsc\_code

mandatory

`string` The customer's bank IFSC. For example, `HDFC0000001`.

max\_amount

optional

`integer` Use to set the maximum amount, in paise, per debit request. Know about [maximum and default values](/razorpay-docs-md/recurring-payments/paper-nach/faqs.md#3-is-there-a-limit-on-the-debit).

expire\_at

optional

`integer` The Unix timestamp till when you can use the token (authorisation on the payment method) to charge the customer subsequent payments. The default value is 10 years. The value can range from the current date to 31-12-2099 (`4101580799`).

nach

Additional information to be printed on the NACH form your customer will sign.

form\_reference1

optional

`string` A user entered reference that appears on the NACH form.

form\_reference2

optional

`string` A user entered reference that appears on the NACH form.

description

optional

`string` A user entered description that appears on the hosted page. For example, `Form for Gaurav Kumar.`

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

##### Path Parameter

id

mandatory

`string` The unique identifier for the invoice linked to the registration link that you want to cancel. For example, `inv_1Aa00000000001`.

## 2. Fetch and Manage Tokens

Once you capture a payment, Razorpay Checkout returns a `razorpay_payment_id`. You can use this id to fetch the `token_id`, which is used to create and charge subsequent payments.

You can retrieve the `token_id` using the [Dashboard](/razorpay-docs-md/recurring-payments/create.md#3-search-for-the-token) or the APIs given below.

### 2.1. Fetch Token by Payment ID

Use the below endpoint to fetch the `token_id` using a `payment_id`.

GET

/payments/:id

**Handy Tips**

You can also retrieve the `token_id` via the [payment.authorized webhook](/razorpay-docs-md/api/payments/recurring-payments/webhooks.md#payment-authorized).

#### Path Parameter

id

mandatory

`string` The unique identifier of the payment to be retrieved. For example, `pay_1Aa00000000002`.

### 2.2. Fetch Tokens by Customer ID

Use the below endpoint to fetch tokens linked to a customer.

A customer can have multiple tokens tied to them. These tokens can be used to create subsequent payments for multiple products or services.

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

1. [Create an order to charge the customer](/razorpay-docs-md/payment-gateway/s2s-integration/recurring-payments/paper-nach/auto-debit.md#31-create-an-order-to-charge-the-customer)
2. [Create a recurring payment](/razorpay-docs-md/payment-gateway/s2s-integration/recurring-payments/paper-nach/auto-debit.md#32-create-a-recurring-payment)

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
