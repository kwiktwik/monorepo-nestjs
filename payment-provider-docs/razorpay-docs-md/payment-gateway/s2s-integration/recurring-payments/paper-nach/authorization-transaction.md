<!-- Source: https://razorpay.com/docs/payments/payment-gateway/s2s-integration/recurring-payments/paper-nach/authorization-transaction -->

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

The acceptable image formats and size are:

- jpeg
- jpg
- png
- Maximum accepted size is 6 MB.

## Ways to Accept Authorisation Payment

You can create an authorisation transaction using the [Razorpay APIs](/razorpay-docs-md/payment-gateway/s2s-integration/recurring-payments/paper-nach/authorization-transaction.md#11-using-razorpay-apis) or [Registration Link](/razorpay-docs-md/payment-gateway/s2s-integration/recurring-payments/paper-nach/authorization-transaction.md#12-using-a-registration-link).

## 1.1. Using Razorpay APIs

To create an authorisation transaction using the Razorpay APIs, you need to:

1. [Create a Customer](/razorpay-docs-md/payment-gateway/s2s-integration/recurring-payments/paper-nach/authorization-transaction.md#111-create-a-customer)

   .
2. [Create an Order](/razorpay-docs-md/payment-gateway/s2s-integration/recurring-payments/paper-nach/authorization-transaction.md#112-create-an-order)

   .
3. [Create Authorisation Payment using Razorpay APIs](/razorpay-docs-md/payment-gateway/s2s-integration/recurring-payments/paper-nach/authorization-transaction.md#113-create-an-authorisation-payment)

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

### 1.1.2. Create an Order

Use the [Orders API](/razorpay-docs-md/api/orders.md) to create a unique Razorpay `order_id` that is associated with the authorisation transaction. The following endpoint creates an order.

POST

/orders

**Download and Upload the Pre-filled NACH Form**

Once the order is created, the pre-filled form must be downloaded, signed by your customer and uploaded back to Razorpay to complete the transaction.

You receive the following parameters as part of the response:

prefilled\_form

The link from where you can download the pre-filled NACH form.

upload\_form\_url

The link where the NACH form should be uploaded once it is signed by the customer.

**Authorisation transaction + auto-charge first payment**:

You can register a customer's mandate **and** charge them the first recurring payment as part of the same transaction. Refer to the [Paper NACH section under Registration and Charge First Payment Together](/razorpay-docs-md/api/payments/recurring-payments/paper-nach/auto-debit.md#1-create-an-authorization-transaction) for more information.

#### Request Parameters

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

Details related to the authorisation such as max amount, bank account information and NACH information.

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

### 1.1.3. Create an Authorisation Payment

After you create an order, you have to create an authorisation payment. To create an authorisation payment:

1. Download the Paper NACH form and send it to the customers.
2. Ask the customers to fill the form and send it to you.
3. You upload the received form via the create NACH File API. The acceptable image formats and size are jpeg, jpg and png. Maximum accepted size is 6 MB.

Use the below endpoint to upload the signed Paper NACH form via APIs.

POST

/payments/create/nach/file

Razorpay's OCR-enabled NACH engine submits the form to NPCI on successful verification and you will receive a success/failure response.

Use the following API to upload the NACH file sent by the customer.

#### Error Reasons

To learn about errors, refer to the FAQ [Upload the NACH File](/razorpay-docs-md/recurring-payments/paper-nach/faqs.md) section.

## 1.2. Using a Registration Link

Registration Links are an alternate way of creating an authorisation transaction. If you create a registration link, you need not create a customer or an order.

When you create a registration link, an [invoice](/razorpay-docs-md/invoices.md) is automatically issued to the customer. The customer can use the invoice to make the Authorisation Payment.

Know how to [create Registration Links](/razorpay-docs-md/recurring-payments/create.md) using the Dashboard.

**Handy Tips**

You can use webhooks to get notifications about successful payments against a registration link. Know more about [Webhooks](/razorpay-docs-md/api/payments/recurring-payments/webhooks.md#check-authorization-link-status-using-webhooks).

In the case of Paper NACH, the order amount must be `0`.

### 1.2.1. Create a Registration Link

Use the below endpoint to create a registration link for recurring payments.

POST

/subscription\_registration/auth\_links

**Download and Upload the Pre-filled NACH Form**

Once the registration link is created, the customer should complete these steps:

1. Download the pre-filled form using the Download NACH Form option on the Razorpay hosted page.
2. Sign the form.
3. Upload the signed form using the Upload NACH Form option on the Razorpay hosted page.

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

Details of the authorisation payment.

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

**Watch Out!**

You can only cancel the registration link that is in the `issued` state.

#### Path Parameter

id

mandatory

`string` The unique identifier for the invoice linked to the registration link that you want to cancel. For example, `inv_1Aa00000000001`.
