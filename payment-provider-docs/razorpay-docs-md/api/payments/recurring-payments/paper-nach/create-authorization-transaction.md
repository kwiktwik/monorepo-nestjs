<!-- Source: https://razorpay.com/docs/api/payments/recurring-payments/paper-nach/create-authorization-transaction -->

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

You can create an authorisation transaction:

- Using the [Razorpay Standard Checkout](/razorpay-docs-md/api/payments/recurring-payments/paper-nach/create-authorization-transaction.md#11-using-razorpay-standard-checkout)  .
- Using a [Registration Link](/razorpay-docs-md/api/payments/recurring-payments/paper-nach/create-authorization-transaction.md#12-using-a-registration-link)  .

## 1.1. Using Razorpay Standard Checkout

To create an authorisation transaction using the Razorpay Standard Checkout, you need to:

1. [Create a Customer](/razorpay-docs-md/api/payments/recurring-payments/paper-nach/create-authorization-transaction.md#111-create-a-customer)

   .
2. [Create an Order](/razorpay-docs-md/api/payments/recurring-payments/paper-nach/create-authorization-transaction.md#112-create-an-order)

   .
3. [Create Authorisation Payment using Razorpay Standard Checkout](/razorpay-docs-md/api/payments/recurring-payments/paper-nach/create-authorization-transaction.md#113-create-an-authorisation-payment)

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

#### Response Parameters

id

`string` A unique identifier of the order created. For example `order_1Aa00000000001`.

entity

`string` The entity that is created. Here it is `order`.

amount

`integer` Amount in currency subunits. For NACH, the amount should be `0`.

amount\_paid

`integer` The amount that has been paid.

amount\_due

`integer` The amount that is yet to pay.

currency

`string` The 3-letter ISO currency code for the payment. Currently, we only support `INR`.

receipt

`string` A user-entered unique identifier of the order. For example, `rcptid #10`. You should map this parameter to the `order_id` sent by Razorpay.

status

`string` The status of the order. Here, it is `created`.

notes

`object` Key-value pair that can be used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

created\_at

`integer` The Unix timestamp at which the order was created.

token

Details related to the authorisation such as max amount and bank account information.

method

`string` Payment method used to make the authorisation payment. Here, it is `nach`.

notes

`object` Key-value pair that can be used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

max\_amount

`integer` The maximum amount in paise a customer can be charged in a transaction. Know about [maximum and default values](/razorpay-docs-md/recurring-payments/paper-nach/faqs.md#3-is-there-a-limit-on-the-debit).

expire\_at

`integer` The Unix timestamp to indicate the date till which you can use the token (authorisation on the payment method) to charge the customer subsequent payments.

auth\_type

`string` NACH type used to make the authorisation payment. Here, it is `physical`.

nach

Additional information to be printed on the NACH form that your customer will sign.

create\_form

`boolean` Indicates whether the form is created or not. Possible values:

- `true`: The NACH form is created.
- `false`: The NACH form is not created.

form\_reference1

`string` A user-entered reference that appears on the NACH form.

form\_reference2

`string` A user-entered reference that appears on the NACH form.

prefilled\_form

`string` The link from where you can download the pre-filled NACH form.

upload\_form\_url

`string` The link where the NACH form should be uploaded once it is signed by the customer.

description

`string` A user-entered description that appears on the hosted page. For example, `Paper NACH Gaurav Kumar`.

bank\_account

Customer's bank account details that should be pre-filled on the checkout.

ifsc\_code

`string` Customer's bank IFSC. For example, `HDFC0000001`.

bank\_name

`string` The bank name. For example, `HDFC Bank`.

name

`string` Name of the beneficiary. For example, `Gaurav Kumar`.

account\_number

`string` Customer's bank account number.

account\_type

`string` Customer's bank account type. Possible values:

- `savings` (default)
- `current`
- `cc` (Cash Credit)
- `nre` (SB-NRE)
- `nro` (SB-NRO)

beneficiary\_email

`string` Email address of the beneficiary. For example, `gaurav.kumar@example.com`.

beneficiary\_mobile

`integer` Mobile number of the beneficiary.

**Download and Upload the Pre-filled NACH Form**

Once the order is created, the pre-filled form must be downloaded, signed by your customer and uploaded back to Razorpay to complete the transaction.

You receive the following parameters as part of the response:

prefilled\_form

The link from where you can download the pre-filled NACH form.

upload\_form\_url

The link where the NACH form should be uploaded once it is signed by the customer.

**Authorisation transaction + auto-charge first payment**:

You can register a customer's mandate **and** charge them the first recurring payment as part of the same transaction. Refer to the [Paper NACH section under Registration and Charge First Payment Together](/razorpay-docs-md/api/payments/recurring-payments/paper-nach/auto-debit.md#1-create-an-authorization-transaction) for more information.

#### Error Response Parameters

Given below is a list of possible errors you may face while creating an Order.

### 1.1.3. Create an Authorisation Payment

You should create an authorisation payment after you create an order.

To create an authorisation payment:

1. Download the Paper NACH form and send it to the customer.
2. Ask the customers to fill the form and either [Upload via Checkout](/razorpay-docs-md/api/payments/recurring-payments/paper-nach/create-authorization-transaction.md#1131-upload-the-nach-file-via-checkout)

   or send it to you to upload the form using the [create NACH File API](/razorpay-docs-md/api/payments/recurring-payments/paper-nach/create-authorization-transaction.md#1132-upload-the-nach-file-via-api)   .

#### 1.1.3.1 Upload the NACH File via Checkout

Create a payment checkout form for customers to upload the NACH form and make the Authorisation Transaction. You can use the Handler Function or Callback URL.

**Watch Out!**

The Callback URL is not supported for Recurring Payments created using the registration link.

#### Additional Checkout Fields

customer\_id

mandatory

`string` Unique identifier of the customer created in the [first step](/razorpay-docs-md/api/payments/recurring-payments/paper-nach/create-authorization-transaction.md#111-create-a-customer).

order\_id

mandatory

`string` Unique identifier of the order created in the [second step](/razorpay-docs-md/api/payments/recurring-payments/paper-nach/create-authorization-transaction.md#112-create-an-order).

recurring

mandatory

`boolean` Determines whether the recurring is enabled or not. Possible values:

- `true`: Recurring payment is enabled.
- `false`: Recurring payment is not enabled.

#### Error Response Parameters

Given below is a list of possible errors you may face while making the authorisation payment.

adequate\_funds\_not\_available\_blocked

- **Description**: Sufficient unblocked funds not available in customer's account. Please ask customer to add fund and try again.
- **Next Steps**: Please ask customer to add sufficient unblocked funds and try again.

bad\_request\_error

- **Description**: Invalid Mandate Sequence Number.
- **Next Steps**: Retry after some time during the valid cycle.

bank\_account\_invalid

- **Description**: Payment failed because Account linked to VPA is invalid.
- **Next Steps**: Create a new mandate with the customer.

bank\_account\_validation\_failed

- **Description**: Payment was unsuccessful as the details are invalid. Please retry with the right details.
- **Next Steps**: Ask the customer to retry again.

bank\_not\_available

- **Description**: Payment was unsuccessful as the bank linked to this UPI ID is temporarily unavailable. Any amount deducted will be refunded within 5-7 working days.
- **Next Steps**: Retry after some time.

bank\_technical\_error

Bank Temporarily Unavailable

- **Description**: Payment was unsuccessful as the bank linked to this UPI ID is temporarily unavailable. Any amount deducted will be refunded within 5-7 working days.
- **Next Steps**: Retry after some time.

Temporary Bank Issue

- **Description**: Payment was unsuccessful due to a temporary issue at your bank. Any amount deducted will be refunded within 5-7 working days.
- **Next Steps**: Retry after some time.

Bank Declined

- **Description**: Payment was unsuccessful as it was declined by your bank. Any amount deducted will be refunded within 5-7 working days.
- **Next Steps**: Retry after some time.

Bank or Wallet Gateway Error

- **Description**: Payment processing failed due to error at bank or wallet gateway.
- **Next Steps**: Retry after some time.

General Temporary Issue

- **Description**: Payment was unsuccessful due to a temporary issue. Any amount deducted will be refunded within 5-7 working days.
- **Next Steps**: Retry after some time.

Bank Services Halt

- **Description**: Payment was unsuccessful due to a temporary halt of services at this bank.
- **Next Steps**: Retry after some time.

credit\_to\_beneficiary\_failed

- **Description**: Payment was unsuccessful due to a temporary issue. Any amount deducted will be refunded within 5-7 working days.
- **Next Steps**: Retry after some time.

debit\_declined

- **Description**: Payment was unsuccessful as it was declined by remitter bank.
- **Next Steps**: Create a new mandate with the customer.

debit\_instrument\_blocked

- **Description**: Payment was unsuccessful as the account linked to this UPI ID is blocked. Try using another account.
- **Next Steps**: Create a new mandate with the customer.

duplicate\_mandate\_request

- **Description**: Duplicate mandate request. Please try again with another mandate request.
- **Next Steps**: Please try again with another mandate request.

gateway\_technical\_error

Bank or Wallet Gateway Error

- **Description**: Payment processing failed due to error at bank or wallet gateway.
- **Next Steps**: Retry after some time.

Temporary Issue with Money Deduction

- **Description**: Payment was unsuccessful due to a temporary issue. If money got deducted, reach out to the seller.
- **Next Steps**: Retry after some time.

incorrect\_pin

- **Description**: You have entered an incorrect PIN on the UPI app. Please retry with the correct PIN.
- **Next Steps**: Ask the customer to retry with correct PIN.

insufficient\_funds

- **Description**: Transaction failed due to insufficient funds.
- **Next Steps**: Ask the customer to add balance to their account and retry.

invalid\_request

- **Description**: Payment processing failed due to error at bank or wallet gateway.
- **Next Steps**: Retry after some time.

invalid\_response\_from\_gateway

- **Description**: Payment was unsuccessful due to a temporary issue. Any amount deducted will be refunded within 5-7 working days.
- **Next Steps**: Retry after some time.

invalid\_transaction\_beneficiary

- **Description**: Beneficiary address resolution failed. Please try again after some time.
- **Next Steps**: Please try again after some time.

invalid\_vpa

- **Description**: You have entered an incorrect UPI ID. Please retry with the correct UPI ID.
- **Next Steps**: Ask the customer to retry with a valid VPA.

issuer\_dispatch\_failed

- **Description**: Payment failed due to some issue at the issuer bank. Please try again after some time.
- **Next Steps**: Please try again after some time.

limit\_exceeded\_remitting\_bank

- **Description**: Limit exceeded for remitter bank. Please ask customer to try with another bank account.
- **Next Steps**: Please ask customer to try with another bank account.

mandate\_debit\_beyond\_psp\_amount\_cap

- **Description**: Debit amount is beyond payer PSP specified amount cap. Please reduce the amount and try again.
- **Next Steps**: Please reduce the mandate amount to match customer PSP.

mandate\_request\_limit\_breached

- **Description**: Maximum number of mandate creation requests exceeded for customer's bank account. Please wait for some time before initiating new mandate creation requests.
- **Next Steps**: Please wait for some time before initiating new mandate creation requests.

mobile\_number\_invalid

- **Description**: Registered Mobile number linked to the account has been changed or removed.
- **Next Steps**: Create a new mandate with the customer.

nature\_of\_debit\_not\_allowed

- **Description**: Nature of debit not allowed in customer's account. Please ask the customer to use a different bank account.
- **Next Steps**: Please ask the customer to use a different bank account.

no\_financial\_address\_record\_found

- **Description**: No financial address record found for this VPA. Please ask customer to try with another bank account.
- **Next Steps**: Please ask customer to try with other bank account.

no\_original\_request\_found

- **Description**: No mandate details were found in the record during debit. Please try after some time.
- **Next Steps**: Please try after some time.

payment\_collect\_request\_expired

- **Description**: Payment was unsuccessful as you could not pay with the UPI app within time.
- **Next Steps**: Retry after some time.

payment\_declined

Bank Declined Payment

- **Description**: Payment was unsuccessful as it was declined by your bank. Any amount deducted will be refunded within 5-7 working days.
- **Next Steps**: Ask the customer to retry with other account.

Customer Declined Payment

- **Description**: You have declined the payment request on the UPI app. Please retry when you are ready.
- **Next Steps**: Ask the customer to approve the payment.

payment\_failed

- **Description**: Payment was unsuccessful due to a temporary issue. If amount got deducted, it will be refunded within 5-7 working days.
- **Next Steps**: Retry after 1 hour.

payment\_pending

- **Description**: The status of your payment is pending. You can either wait or retry to pay successfully.
- **Next Steps**: Retry after some time.

payment\_risk\_check\_failed

- **Description**: Payment was unsuccessful as your account does not pass the risk checks done by your bank. Try using another account.
- **Next Steps**: Retry after some time.

payment\_timed\_out

- **Description**: Payment was unsuccessful as you could not complete it in time.
- **Next Steps**: Retry after some time.

pre\_debit\_notification\_failed

- **Description**: Unable to Notify the Customer.
- **Next Steps**: Retry after some time.

remitter\_dispatch\_failed

- **Description**: Payment failed due to some issue at the customer's. Please try again after some time.
- **Next Steps**: Please try again after some time.

request\_timed\_out

General Timeout - Temporary Issue

- **Description**: Payment was unsuccessful due to a temporary issue. Any amount deducted will be refunded within 5-7 working days.
- **Next Steps**: Retry after some time.

Timeout - Bank Declined

- **Description**: Payment was unsuccessful as it was declined by your bank. Any amount deducted will be refunded within 5-7 working days.
- **Next Steps**: Retry after some time.

Timeout - Recurring Payment Creation

- **Description**: Payment was unsuccessful as the recurring payment can not be created at this time. Any amount deducted will be refunded within 5-7 working days.
- **Next Steps**: Retry after some time.

transaction\_frequency\_limit\_exceeded

- **Description**: Payment failed. Please try again with another bank account.
- **Next Steps**: Create a new mandate with the customer.

transaction\_limit\_exceeded

Amount Limit Exceeded

- **Description**: Payment failed because Transaction amount limit has exceeded.
- **Next Steps**: Reach out to the customer to collect the amount.

Bank Account Amount Limit

- **Description**: Payment was unsuccessful as you exceeded the amount limit on the bank account linked to this UPI id.
- **Next Steps**: Ask the customer to retry after some time.

transaction\_not\_allowed

- **Description**: Payment was unsuccessful as it was declined by your bank. Reach out to your bank for more details. Try using another account.
- **Next Steps**: Create a new mandate with the customer.

upi\_dummy\_payment

- **Description**: Payment was a dummy payment for one time mandate registration.
- **Next Steps**: NA

#### 1.1.3.2 Upload the NACH File via API

Use the following API to upload the NACH file sent by the customer.

#### Request Parameters

order\_id

mandatory

`string` The unique identifier of the order that was created. For example, `order_FoLdZrq6QGKUWg`.

recurring

mandatory

`boolean` Determines whether the recurring is enabled or not. Possible values:

- `1`: Recurring is enabled.
- `0`: Recurring is not enabled.

file

mandatory

`strinng` The path where you have saved the NACH file.

#### Response Parameters

razorpay\_payment\_id

`string` The unique identifier of the payment that is created. For example, `pay_FjDn43bvssCqEM`.

razorpay\_order\_id

`string` The unique identifier of the order that is created. For example, `order_FjDdQ6a0GluJ2c`.

razorpay\_signature

`string` The signature generated by the Razorpay. For example, `f13775ea8a91e9bf229b9fdba3ad783f7ff2bdbce1c35e87a69ae7418808da04`

#### Error Response Parameters

Given below is a list of possible errors you may face while while uploading a NACH file.

## 1.2. Using a Registration Link

Registration Link is an alternate way of creating an authorisation transaction. You can create a registration link using the [API](/razorpay-docs-md/api/payments/recurring-payments/paper-nach/create-authorization-transaction.md#121-create-a-registration-link) or [Dashboard](/razorpay-docs-md/recurring-payments/create.md#1-create-a-registration-link).

**Handy Tips**

You do not have to create a customer if you choose the registration link method for creating an authorisation transaction.

- When you create a registration link, an [invoice](/razorpay-docs-md/invoices.md)

  is automatically issued to the customer. They can use this invoice to make the authorisation payment.
- A registration link should always have an order amount (in paise) the customer will be charged when making the authorisation payment. This amount should be `0` in the case of Paper NACH.

**Handy Tips**

You can [use Webhooks to get notifications about successful payments](/razorpay-docs-md/api/payments/recurring-payments/webhooks.md#check-authorization-link-status-using-webhooks) against a registration link.

### 1.2.1. Create a Registration Link

The following endpoint creates a registration link for recurring payments.

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

#### Response Parameters

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

#### Response Parameters

success

`boolean` Indicates whether the notifications were sent successfully. Possible values:

- `true`: The notifications were successfully sent via SMS, email or both.
- `false`: The notifications were not sent.

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

#### Response Parameters

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
