<!-- Source: https://razorpay.com/docs/api/payments/recurring-payments/upi/create-authorization-transaction -->

**UPI Collect Flow Deprecated**

According to NPCI guidelines, the UPI Collect flow is being deprecated for new UPI Autopay registrations effective 28 February 2026.

- Customers can no longer register UPI mandates by manually entering VPA/UPI id/mobile numbers.
- Subsequent debits for existing mandates created via UPI Collect will continue to be executed without change.

**Exemptions**

UPI Collect will continue to be supported for:

- MCC 6012 & 6211 (IPO and secondary market transactions).
- iOS mobile app and mobile web transactions.
- UPI Mandates (execute/modify/revoke operations only).
- eRupi vouchers.
- PACB businesses (cross-border/international payments).

**Action Required**

- If you are a new Razorpay user, use UPI Intent.
- If you are an existing Razorpay user not covered by exemptions, you must migrate to UPI Intent or UPI QR code to continue accepting UPI Autopay registrations. For detailed migration steps, refer to the [migration documentation](/docs/announcements/upi-collect-migration/recurring-payments/standard-checkout/)  .

You can create an authorisation transaction using [Razorpay APIs](/razorpay-docs-md/api/payments/recurring-payments/upi/create-authorization-transaction.md#11-using-razorpay-apis) or [Registration Link](/razorpay-docs-md/api/payments/recurring-payments/upi/create-authorization-transaction.md#12-using-a-registration-link).

## 1.1 Using Razorpay APIs

To create an authorisation transaction using Razorpay APIs, you need to:

1. [Create a Customer](/razorpay-docs-md/api/payments/recurring-payments/upi/create-authorization-transaction.md#111-create-a-customer)

   .
2. [Create an Order](/razorpay-docs-md/api/payments/recurring-payments/upi/create-authorization-transaction.md#112-create-an-order)

   .
3. [Create Authorisation Payment using Razorpay APIs](/razorpay-docs-md/api/payments/recurring-payments/upi/create-authorization-transaction.md#113-create-an-authorisation-payment)

   .

**Handy Tips**

For the Authorisation Payment to be successful in a day (for example, 5th June), you should create an Order and the Authorisation Transaction on the same day (5th June) before 11:59 pm.

### 1.1.1 Create a Customer

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

Response Parameters

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

### 1.1.2 Create an Order

Use the [Orders API](/razorpay-docs-md/api/orders.md) to create a unique Razorpay `order_id` that is associated with the authorisation transaction. The following endpoint creates an order.

POST

/orders

Sample Code

**Handy Tips**

The subsequent payment frequency is displayed on your customer's PSP. They can select the required frequency while registering for the mandate.

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

Details related to the authorisation such as max amount, frequency and expiry information.

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

For example, if the `frequency` is `monthly`, `recurring_value` is `17` and `recurring_type` is `before`, recurring debit can happen between the month's 1st and 17th. Similarly, if `recurring_type` is `after`, recurring debit can only happen on or after the 17th of the month.

Response Parameters

id

`string` A unique identifier of the order created. For example `order_1Aa00000000001`.

entity

`string` The entity that has been created. Here it is `order`.

amount

`integer` Amount in currency subunits. For emandate, the amount should be `0`.

amount\_paid

`integer` The amount that has been paid.

amount\_due

`integer` The amount that is yet to be paid.

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

Error Response Parameters

Given below is a list of possible errors you may face while creating an Order.

### 1.1.3. Create an Authorisation Payment

Create a payment checkout form for customers to make Authorisation Transaction and register their mandate. You can use the Handler Function or Callback URL.

**Watch Out!**

The callback URL is not supported for recurring payments created using the registration link.

UPI Intent

UPI Intent is supported on **mWeb (Android)** and **Mobile App (WebView)**. On **Desktop Web**, as UPI Intent is not supported, a QR code is automatically displayed instead.

If UPI Intent is not enabled on your account, please reach out to the [support team](https://razorpay.com/support).

UPI Collect

**Deprecation Notice**

**UPI Collect is deprecated effective 28 February 2026.** This section is applicable only for exempted businesses. If you are an existing Razorpay user not covered by the exemptions, refer to the [migration documentation](/docs/announcements/upi-collect-migration/recurring-payments/standard-checkout/) to switch to UPI Intent.

#### Additional Checkout Fields

customer\_id

mandatory

`string` Unique identifier of the customer created in the [first step](/razorpay-docs-md/api/payments/recurring-payments/upi/create-authorization-transaction.md#111-create-a-customer).

order\_id

mandatory

`string` Unique identifier of the order created in the [second step](/razorpay-docs-md/api/payments/recurring-payments/upi/create-authorization-transaction.md#112-create-an-order).

recurring

mandatory

`string` Determines if the recurring payment is enabled or not. Possible values:

- `1`: Recurring payment is enabled.
- `preferred`: Use this if you want to allow **recurring payments** and **one-time payment** in the same flow.

Error Response Parameters

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

## 1.2 Using a Registration Link

Registration Link is an alternate way of creating an authorisation transaction. You can create a registration link using the [API](/razorpay-docs-md/api/payments/recurring-payments/upi/create-authorization-transaction.md#121-create-a-registration-link) or [Dashboard](/razorpay-docs-md/recurring-payments/create.md#1-create-a-registration-link).

**Handy Tips**

You do not have to create a customer if you choose the registration link method for creating an authorisation transaction.

- When you create a registration link, an [invoice](/razorpay-docs-md/invoices.md)

  is automatically issued to the customer. They can use this invoice to make the authorisation payment.
- A registration link should always have an order amount (in paise) the customer is charged when making the authorisation payment. For UPI, the amount must be a minimum of `₹1`.

**Handy Tips**

You can [use Webhooks to get notifications about successful payments](/razorpay-docs-md/api/payments/recurring-payments/webhooks.md#check-registration-link-status-using-webhooks) against a registration link.

### 1.2.1 Create a Registration Link

The following endpoint creates a registration link.

POST

/subscription\_registration/auth\_links

Sample Code

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

Response Parameters

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

### 1.2.2 Send/Resend Notifications

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

Response Parameters

success

`boolean` Indicates whether the notifications were sent successfully. Possible values:

- `true`: The notifications were successfully sent via SMS, email or both.
- `false`: The notifications were not sent.

### 1.2.3 Cancel a Registration Link

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

Path Parameter

id

mandatory

`string` The unique identifier for the invoice linked to the registration link that you want to cancel. For example, `inv_1Aa00000000001`.

Response Parameters

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
