<!-- Source: https://razorpay.com/docs/api/payments/recurring-payments/custom/emandate/create-authorization-transaction -->

You can create an authorisation transaction using [Razorpay APIs](/razorpay-docs-md/api/payments/recurring-payments/custom/emandate/create-authorization-transaction.md#11-using-razorpay-apis) or [Registration Link](/razorpay-docs-md/api/payments/recurring-payments/custom/emandate/create-authorization-transaction.md#12-using-a-registration-link).

## 1.1. Using Razorpay APIs

To create an authorisation transaction using the Razorpay APIs, you need to:

1. [Fetch Payment Methods](/razorpay-docs-md/api/payments/recurring-payments/custom/emandate/create-authorization-transaction.md#111-fetch-payment-methods)

   .
2. [Create a Customer](/razorpay-docs-md/api/payments/recurring-payments/custom/emandate/create-authorization-transaction.md#112-create-a-customer)

   .
3. [Create an Order](/razorpay-docs-md/api/payments/recurring-payments/custom/emandate/create-authorization-transaction.md#113-create-an-order)

   .
4. [Create Authorisation Payment using Razorpay APIs](/razorpay-docs-md/api/payments/recurring-payments/custom/emandate/create-authorization-transaction.md#114-create-an-authorisation-payment)

   .

### 1.1.1. Fetch Payment Methods

Use the below endpoint to fetch a list of banks Razorpay supports for different payment methods.

GET

/methods

**Watch Out!**

To fire this API, provide your [KEY\_ID] for authorization. Your [KEY\_SECRET] is NOT required and should NOT be passed.

RequestResponse

copy

```bash
curl -u [YOUR_KEY_ID]\
- X GET https://api.razorpay.com/v1/methods \
```

### 1.1.2. Create a Customer

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

### 1.1.3. Create an Order

You can use the Orders API to create a unique Razorpay order\_id that is associated with the authorisation transaction. The following endpoint creates an order.

POST

/orders

Emandate via Aadhaar

Emandate via Netbanking

Emandate via Debit Card

Given below is the sample code to authenticate emandate with Aadhaar. Aadhaar authentication type is enabled by default for your Razorpay account.

**Authorisation transaction + auto-charge first payment**

You can register a customer's mandate **and** charge them the first recurring payment as part of the same transaction. Know more about [charge first payment automatically after Emandate registration](/razorpay-docs-md/api/payments/recurring-payments/emandate/auto-debit.md).

### Request Parameters

amount

mandatory

`integer` Amount in currency subunits. For emandate, the amount has to be `0`.

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

Details related to the authorisation such as max amount and bank account information.

auth\_type

optional

`string` Possible values:

- `netbanking`
- `debitcard`
- `aadhaar`

max\_amount

optional

`integer` The maximum amount, in paise, that a customer can be charged in one transaction. Know about [maximum and default values](/razorpay-docs-md/recurring-payments/emandate/faqs.md#2-what-is-the-maximum-amount-which-can).

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

`string` Customer's name. For example, `Gaurav Kumar`.

notes

optional

`object` Key-value pair that can be used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

**Authorisation transaction + auto-charge first payment**

You can register a customer's mandate **AND** charge them the first recurring payment as part of the same transaction. Refer to the [Emandate section under Registration and Charge First Payment Together](/razorpay-docs-md/api/payments/recurring-payments/emandate/auto-debit.md) for more information.

### 1.1.4. Create an Authorisation Payment

**Handler Function vs Callback URL**

- **Handler Function**:

  When you use the handler function, the response object of the successful payment (`razorpay_payment_id`, `razorpay_order_id` and `razorpay_signature`) is submitted to the Checkout Form. You need to collect these and send them to your server.
- **Callback URL**:

  When you use a Callback URL, the response object of the successful payment (`razorpay_payment_id`, `razorpay_order_id` and `razorpay_signature`) is submitted to the Callback URL.

Netbanking

Handler FunctionCallback URL

copy

```html
<script
   type="text/javascript"
   src="https://checkout.razorpay.com/v1/razorpay.js">
 </script>
 <script
   src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js">
 </script>

 <body>
   <button
     id="btn"
     style="background-color: #3399cc; color: white; font-size: 16px; font-family: sans-serif">
     Pay
   </button>

   <script>
     const btn = document.querySelector("#btn");

     var razorpay = new Razorpay({
       key: "<YOUR_TEST_KEY>",
       image: "https://i.imgur.com/n5tjHFD.jpg"
     });

     razorpay.once("ready", function (response) {
       console.log(response.methods);
     })

     var data = {
       "amount": 100, // in currency subunits. Here 1000 = 1000 paise, which equals to ₹10
       "currency": "INR", // Default is INR. We support more than 90 currencies.
       "email": "gaurav.kumar@example.com",
       "contact": "9123456780",
       "notes": {
         "address": "Ground Floor, SJR Cyber, Laskar Hosur Road, Bengaluru",
       },
       "order_id": "order_00000000000001",
       "customer_id": "cust_00000000000001",
       "recurring": true,
       "method": "emandate",
       "bank": "HDFC",
       "auth_type": "netbanking",
       "bank_account[name]": "Gaurav Kumar",
       "bank_account[account_number]": "1121431121541121",
       "bank_account[account_type]": "savings",
       "bank_account[ifsc]": "HDFC0000001"
     };

     btn.addEventListener("click", function () { // has to be placed within user initiated context, such as click, in order for popup to open.
       razorpay.createPayment(data);

       razorpay.on("payment.success", function (resp) {
         alert(resp.razorpay_payment_id),
         alert(resp.razorpay_order_id),
         alert(resp.razorpay_signature)
       }); // will pass payment ID, order ID and Razorpay signature to success handler.

       razorpay.on("payment.error", function (resp) {
         alert(resp.error.description)
       }); // will pass error object to error handler
     })
   </script>
 </body>
```

Debit Card

Handler FunctionCallback URL

copy

```html
<script
   type="text/javascript"
   src="https://checkout.razorpay.com/v1/razorpay.js">
 </script>
 <script
   src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js">
 </script>
 <body>
   <button
     id="btn"
     style="background-color: #3399cc; color: white; font-size: 16px; font-family: sans-serif">
     Pay
   </button>
   <script>
     const btn = document.querySelector("#btn");

     var razorpay = new Razorpay({
       key: "<YOUR_TEST_KEY>",
       image: "https://i.imgur.com/n5tjHFD.jpg"
     });

     razorpay.once("ready", function (response) {
       console.log(response.methods);
     })

     var data = {
       "amount": 100, // in currency subunits. Here 1000 = 1000 paise, which equals to ₹10
       "currency": "INR", // Default is INR. We support more than 90 currencies.
       "email": "gaurav.kumar@example.com",
       "contact": "9123456780",
       "notes": {
         "address": "Ground Floor, SJR Cyber, Laskar Hosur Road, Bengaluru",
       },
       "order_id": "order_00000000000001",
       "customer_id": "cust_00000000000001",
       "recurring": true,
       "method": "emandate",
       "bank": "HDFC",
       "auth_type": "debitcard",
       "bank_account[name]": "Gaurav Kumar",
       "bank_account[account_number]": "1121431121541121",
       "bank_account[account_type]": "savings",
       "bank_account[ifsc]": "HDFC0000001"
     };

     btn.addEventListener("click", function () { // has to be placed within user initiated context, such as click, in order for popup to open.
       razorpay.createPayment(data);

       razorpay.on("payment.success", function (resp) {
         alert(resp.razorpay_payment_id),
         alert(resp.razorpay_order_id),
         alert(resp.razorpay_signature)
       }); // will pass payment ID, order ID and Razorpay signature to success handler.

       razorpay.on("payment.error", function (resp) {
         alert(resp.error.description)
       }); // will pass error object to error handler
     })
   </script>
 </body>
```

Aadhaar

Handler FunctionCallback URL

copy

```html
<script
   type="text/javascript"
   src="https://checkout.razorpay.com/v1/razorpay.js">
 </script>
 <script
   src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js">
 </script>

 <body>
   <button
     id="btn"
     style="background-color: #3399cc; color: white; font-size: 16px; font-family: sans-serif">
     Pay
   </button>

   <script>
     const btn = document.querySelector("#btn");

     var razorpay = new Razorpay({
       key: "<YOUR_TEST_KEY>",
       image: "https://i.imgur.com/n5tjHFD.jpg"
     });

     razorpay.once("ready", function (response) {
       console.log(response.methods);
     })

     var data = {
       "amount": 100, // in currency subunits. Here 1000 = 1000 paise, which equals to ₹10
       "currency": "INR", // Default is INR. We support more than 90 currencies.
       "email": "gaurav.kumar@example.com",
       "contact": "9123456780",
       "notes": {
         "address": "Ground Floor, SJR Cyber, Laskar Hosur Road, Bengaluru",
       },
       "order_id": "order_00000000000001",
       "customer_id": "cust_00000000000001",
       "recurring": true,
       "method": "emandate",
       "bank": "HDFC",
       "auth_type": "aadhaar",
       "bank_account[name]": "Gaurav Kumar",
       "bank_account[account_number]": "1121431121541121",
       "bank_account[account_type]": "savings",
       "bank_account[ifsc]": "HDFC0000001"
     };

     btn.addEventListener("click", function () { // has to be placed within user initiated context, such as click, in order for popup to open.
       razorpay.createPayment(data);

       razorpay.on("payment.success", function (resp) {
         alert(resp.razorpay_payment_id),
         alert(resp.razorpay_order_id),
         alert(resp.razorpay_signature)
       }); // will pass payment ID, order ID and Razorpay signature to success handler.

       razorpay.on("payment.error", function (resp) {
         alert(resp.error.description)
       }); // will pass error object to error handler
     })
   </script>
 </body>
```

### Additional Checkout Fields

customer\_id

mandatory

`string` Unique identifier of the customer created in the [first step](/razorpay-docs-md/api/payments/recurring-payments/custom/emandate/create-authorization-transaction.md#111-create-a-customer).

order\_id

mandatory

`string` Unique identifier of the order created in the [second step](/razorpay-docs-md/api/payments/recurring-payments/custom/emandate/create-authorization-transaction.md#112-create-an-order).

recurring

mandatory

`boolean` Determines whether the recurring is enabled or not. Possible values:

- `true`: Recurring payment is enabled.
- `false`: Recurring payment is not enabled.

## 1.2. Using a Registration Link

Registration Link is an alternate way of creating an authorisation transaction. You can create a registration link using the [API](/razorpay-docs-md/api/payments/recurring-payments/custom/emandate/create-authorization-transaction.md#121-create-a-registration-link) or [Dashboard](/razorpay-docs-md/recurring-payments/create.md#1-create-a-registration-link).

**Handy Tips**

- You do not have to create a customer if you choose the registration link method for creating an authorisation transaction.
- You can [use Webhooks to get notifications about successful payments](/razorpay-docs-md/api/payments/recurring-payments/webhooks.md#check-authorization-link-status-using-webhooks)

  against a registration link.

When you create a registration link, an [invoice](/razorpay-docs-md/invoices.md) is automatically issued to the customer. They can use this invoice to make the authorisation payment.

A registration link must always have an amount (in Paise) that the customer will be charged when making the authorisation payment. In the case of emandate, the order amount must be `0`.

### 1.2.1. Create a Registration Link

Use the below endpoint to create a registration link for recurring payments.

POST

/subscription\_registration/auth\_links

### Request Parameters

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

`string` The authorization method. In this case, it will be `emandate`.

auth\_type

optional

`string` Possible values:

- `netbanking`
- `debitcard`
- `aadhaar`

max\_amount

optional

`integer` The maximum amount, in paise, that a customer can be charged in one transaction. Know about [maximum and default values](/razorpay-docs-md/recurring-payments/emandate/faqs.md#2-what-is-the-maximum-amount-which-can).

expire\_at

optional

`integer` The timestamp, in Unix format, till when you can use the token (authorization on the payment method) to charge the customer subsequent payments. Defaults to 10 years for `emandate`. The value can range from the current date to 31-12-2099 (`4101580799`).

bank\_account

The customer's bank account details.

beneficiary\_name

optional

`string` Name on the bank account. For example `Gaurav Kumar`.

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
