<!-- Source: https://razorpay.com/docs/api/payments/recurring-payments/custom/paper-nach/auto-debit -->

## 1. Create an Authorisation Transaction

**Authorisation transaction + auto-charge first payment**

You can register a customer's mandate **AND** charge them the first recurring payment as part of the same transaction. To do this all you have to do is pass the `first_payment_amount` parameter while creating the order.

The flow to complete an authorisation transaction using paper NACH is a little different from the regular recurring payment flow. The flow when using paper NACH is:

1. Create a customer.
2. Create an order by passing the `customer_id` and method `nach`. When you do this, Razorpay generates a NACH form with the customer information pre-filled and ready to sign.
3. The customer signs the form. The customer can obtain the form in one of the following ways:

   - You can download the form from the Dashboard and send it to the customer.
   - Download from the Hosted page (in the case of registration links).
4. The signed form is uploaded to Razorpay. This can be done in one of the following ways:

   - Using custom Checkout page created from Razorpay APIs.
   - Hosted page (in the case of registration links).
   - The customer can send you the form and you can upload the form for the customer. The acceptable image formats and size are:
     - jpeg
     - jpg
     - png
     - Maximum accepted size is 6 MB.

Once the details are validated, the authorisation transaction is completed and a token is generated. You can charge your customer as per your business model once the token status changes to `confirmed`.

You can create an authorisation transaction using [Razorpay APIs](/razorpay-docs-md/api/payments/recurring-payments/custom/paper-nach/auto-debit.md#11-using-razorpay-apis) or [Registration Link](/razorpay-docs-md/api/payments/recurring-payments/custom/paper-nach/auto-debit.md#12-using-a-registration-link).

### 1.1. Using Razorpay APIs

To create an authorisation transaction using Razorpay APIs, you need to:

1. [Create a Customer](/razorpay-docs-md/api/payments/recurring-payments/custom/paper-nach/auto-debit.md#111-create-a-customer)

   .
2. [Create an Order](/razorpay-docs-md/api/payments/recurring-payments/custom/paper-nach/auto-debit.md#112-create-an-order)

   .
3. [Create Authorisation Payment using Razorpay APIs](/razorpay-docs-md/api/payments/recurring-payments/custom/paper-nach/auto-debit.md#113-create-an-authorisation-payment)

   .

**Handy Tips**

For the Authorisation Payment to be successful in a day (for example, 5th June), you should create an Order and the Authorisation Transaction on the same day (5th June) before 11:59 pm.

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

### 1.1.2. Create an Order

You can use the [Orders](/razorpay-docs-md/orders.md)

API to create a unique Razorpay `order_id` that is associated with the authorisation transaction. The following endpoint creates an order.

POST

/orders

**Download and Upload the Pre-filled NACH Form**

Once the order is created, the generated pre-filled form must be downloaded, signed by your customer and uploaded back to Razorpay to complete the transaction.

You receive the following parameters as part of the response:

prefilled\_form

The link from where you can download the pre-filled NACH form.

upload\_form\_url

The link where the NACH form should be uploaded once it is signed by the customer.

#### Request Parameters

amount

mandatory

`integer` Amount in currency subunits. For Paper NACH, the amount has to be `0`.

currency

mandatory

`string` The 3-letter ISO currency code for the payment. Currently, we only support `INR`.

method

mandatory

`string` The authorization method. In this case, the value will be `nach`.

customer\_id

mandatory

`string` The unique identifier of the customer who is to be charged. For example, `cust_D0cs04OIpPPU1F`.

receipt

optional

`string` A user-entered unique identifier for the order. For example, `Receipt No. 1`. This parameter should be mapped to the `order_id` sent by Razorpay.

notes

optional

`object` Key-value pair that can be used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

token

Details related to the authorization such as max amount and bank account information. Pass a value in the `first_payment_amount` parameter if you want to auto-charge the customer the first payment immediately after authorization.

first\_payment\_amount

optional

`integer` The amount, in paise, the customer should be auto-charged in addition to the authorization amount. For example, `100000`.

auth\_type

mandatory

`string` In this case, it will be `nach`.

bank\_account

The customer's bank account details.

beneficiary\_name

mandatory

`string` Name on the bank account. For example, `Gaurav Kumar`.

account\_number

mandatory

`integer` Customer's bank account number. For example, `11214311215411`.

account\_type

mandatory

`string` Customer's bank account type. Possible values:

- `savings` (default)
- `current`

ifsc\_code

mandatory

`string` Customer's bank IFSC. For example, `HDFC0000001`.

nach

Additional information to be printed on the NACH form that your customer will sign.

form\_reference1

optional

`string` A user-entered reference that appears on the NACH form.

form\_reference2

optional

`string` A user-entered reference that appears on the NACH form.

max\_amount

optional

`integer` Use to set the maximum amount, in paise, per debit request. Know about [maximum and default values](/razorpay-docs-md/recurring-payments/paper-nach/faqs.md#3-is-there-a-limit-on-the-debit).

expire\_at

optional

`integer` The timestamp, in Unix, till when you can use the token (authorization on the payment method) to charge the customer subsequent payments. Defaults to 10 years for `emandate`. The value can range from the current date to 31-12-2099 (`4101580799`).

notes

optional

`object` Key-value pair that can be used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

### 1.1.3. Create an Authorisation Payment

Follow these steps to create authorisation transaction:

1. Download the Paper NACH form and send it to the customers.
2. Ask the customers to fill the form and
   - Upload it via the Checkout.
   - Send it to you and you can upload it from the Dashboard.
3. Upload the received form via create NACH File API.

### 1.1.3.1 Upload the NACH File via Checkout

**Handler Function vs Callback URL**

- **Handler Function**:

  When you use the handler function, the response object of the successful payment (`razorpay_payment_id`, `razorpay_order_id` and `razorpay_signature`) is submitted to the Checkout Form. You need to collect these and send them to your server.
- **Callback URL**:

  When you use a Callback URL, the response object of the successful payment (`razorpay_payment_id`, `razorpay_order_id` and `razorpay_signature`) is submitted to the Callback URL.

#### Additional Checkout Fields

customer\_id

mandatory

`string` Unique identifier of the customer created in the [first step](/razorpay-docs-md/api/payments/recurring-payments/custom/paper-nach/auto-debit.md#111-create-a-customer).

order\_id

mandatory

`string` Unique identifier of the order created in the [second step](/razorpay-docs-md/api/payments/recurring-payments/custom/paper-nach/auto-debit.md#112-create-an-order).

recurring

mandatory

`boolean` Determines whether the recurring is enabled or not. Possible values:

- `true`: Recurring payment is enabled.
- `false`: Recurring payment is not enabled.

### 1.2. Using a Registration Link

Registration Link is an alternate way of creating an authorisation transaction. You can create a registration link using the [API](/razorpay-docs-md/api/payments/recurring-payments/custom/paper-nach/auto-debit.md#121-create-a-registration-link) or [Dashboard](/razorpay-docs-md/recurring-payments/create.md#1-create-a-registration-link).

**Handy Tips**

- You do not have to create a customer if you choose the registration link method for creating an authorisation transaction.
- You can [use Webhooks to get notifications about successful payments](/razorpay-docs-md/api/payments/recurring-payments/webhooks.md#check-authorization-link-status-using-webhooks)

  against a registration link.

When you create a registration link, an [invoice](/razorpay-docs-md/invoices.md) is automatically issued to the customer. They can use this invoice to make the authorisation payment.

A registration link must always have an amount (in paise) that the customer will be charged when making the authorisation payment. In the case of Paper NACH, the order amount must be `0`.

### 1.2.1. Create a Registration Link

Use the below endpoint to create a registration link for recurring payments.

POST

/subscription\_registration/auth\_links

**Download and Upload the Pre-filled NACH Form**

Once the registration link is created, the generated pre-filled form must be downloaded, signed by your customer and uploaded back to Razorpay to complete the transaction.
The hosted page has a **Download NACH Form** option from where the customer can download the pre-filled form. Once downloaded, the customer has to sign the form. The signed form can then be uploaded to Razorpay using the **Upload NACH Form** option on the hosted page.

#### Request Parameters

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

first\_payment\_amount

optional

`integer` The amount, in paise, the customer should be auto-charged in addition to the authorization amount. For example, `100000`.

method

mandatory

`string` The NACH type used to make the authorisation payment. Here, it is `physical`.

auth\_type

mandatory

`string` The authorization method used to make the authorisation transaction. Here, it is `nach`.

bank\_account

The customer's bank account details.

beneficiary\_name

mandatory

`string` The name on the beneficiary. For example, `Gaurav Kumar`.

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

`integer` Use to set the maximum amount, in paise, per debit request. Know about [maximum and default values](/razorpay-docs-md/recurring-payments/paper-nach/faqs.md).

expire\_at

optional

`integer` The Unix timestamp till when you can use the token (authorization on the payment method) to charge the customer subsequent payments. The default value is 10 years for `emandate`. This value can range from the current date to 31-12-2099 (`4101580799`).

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

Use the below endpoint to cancel a registration link.

POST

/invoices/:id/cancel

**Note**

You can only cancel registration link that is in the `issued` state.

#### Path Parameter

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

### Path Parameter

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

### Path Parameter

id

mandatory

`string` The unique identifier of the customer for whom tokens are to be retrieved. For example, `cust_1Aa00000000002`.

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

## 3. Create Subsequent Payments

You should perform the following steps to create and charge your customer subsequent payments:

1. [Create an order to charge the customer](/razorpay-docs-md/api/payments/recurring-payments/custom/paper-nach/auto-debit.md#31-create-an-order-to-charge-the-customer)
2. [Create a recurring payment](/razorpay-docs-md/api/payments/recurring-payments/custom/paper-nach/auto-debit.md#32-create-a-recurring-payment)

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
