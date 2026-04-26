<!-- Source: https://razorpay.com/docs/api/payments/recurring-payments/upi/create-subsequent-payments -->

You should perform the following steps to create and charge your customer subsequent payments:

1. [Create an order to charge the customer](/razorpay-docs-md/api/payments/recurring-payments/upi/create-subsequent-payments.md#31-create-an-order-to-charge-the-customer)
2. [Create a recurring payment](/razorpay-docs-md/api/payments/recurring-payments/upi/create-subsequent-payments.md#32-create-a-recurring-payment)

## 3.1. Create an Order to Charge the Customer

You have to create a new order every time you want to charge your customers. This order is different from the one created during the authorisation transaction.

**Handy Tips**

You can use the notification object in the request if you want to control pre-debit notifications and recurring debits.

The following endpoint creates an order.

POST

/orders

CurlJavaPythonGoPHPRubyNode.js.NET

copy

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X POST https://api.razorpay.com/v1/orders \
-H "Content-Type: application/json" \
-d '{
  "amount":1000,
  "currency":"",
  "payment_capture":true,
  "receipt":"Receipt No. 1",
  "notification":{ 
    "token_id":"token_M7K2eFBU7vToaQ",
    "payment_after":1634057114
  },
  "notes":{
    "notes_key_1":"Tea, Earl Grey, Hot",
    "notes_key_2":"Tea, Earl Grey… decaf."
  }
}'
```

Success ResponseFailure Response

copy

```json
{
  "id":"order_1Aa00000000002",
  "entity":"order",
  "amount":1000,
  "amount_paid":0,
  "amount_due":1000,
  "currency":"",
  "receipt":"Receipt No. 1",
  "notification":{
    "token_id":"token_M7K2eFBU7vToaQ",
    "payment_after":1634057114,
    "id":"notification_00000000000001"
  },
  "offer_id":null,
  "status":"created",
  "attempts":0,
  "notes":{
    "notes_key_1":"Tea, Earl Grey, Hot",
    "notes_key_2":"Tea, Earl Grey… decaf."
  },
  "created_at":1579782776
}
```

### Request Parameters

amount

mandatory

`integer` Amount in currency subunits. For cards, the minimum value is `100` (₹1).

currency

mandatory

`string` The 3-letter ISO currency code for the payment. Currently, we only support `INR`.

receipt

optional

`string` A user-entered unique identifier for the order. For example, `Receipt No. 1`. You should map this parameter to the `order_id` sent by Razorpay.

notification

`object` Details of the pre-debit notification. This object is optional. You should use it only if you want to control pre-debit notifications and debits. If you do not pass this object, we will automatically try to debit 25 hours after the pre-debit notification is delivered.

**Watch Out!**

We will not attempt any retry if the debit fails for tokens with the notification object in the created order. You should manually retry the debit attempt.

token\_id

mandatory

`string` The `token_id` generated when the customer successfully completes the authorisation payment. Different payment instruments for the same customer have different `token_id`.

payment\_after

optional

`integer` UNIX timestamp post which the debit is supposed to happen. Defaults to 25 hours after the pre-debit notification is delivered.

notes

optional

`object` Key-value pair you can use to store additional information about the entity. Maximum of 15 key-value pairs, 256 characters each. For example, `"note_key": "Beam me up Scotty”`.

payment\_capture

mandatory

`boolean` Determines whether the payment status should be changed to `captured` automatically or not. Possible values:

- `true`: Payments are captured automatically.
- `false`: Payments are not captured automatically. You can manually capture payments using the [Manually Capture Payments API](/razorpay-docs-md/api/payments.md#capture-a-payment)  .

### Response Parameters

id

`string` A unique identifier of the order created. For example `order_1Aa00000000001`.

entity

`string` The entity that has been created. Here it is `order`.

amount

`integer` Amount in currency subunits.

amount\_paid

`integer` The amount that has been paid.

amount\_due

`integer` The amount that is yet to pay.

currency

`string` The 3-letter ISO currency code for the payment. Currently, we only support `INR`.

receipt

`string` A user-entered unique identifier of the order. For example, `rcptid #1`.

status

`string` The status of the order.

notes

`object` Key-value pair you can use to store additional information about the entity. Maximum of 15 key-value pairs, 256 characters each. For example, `"note_key": "Beam me up Scotty”`.

created\_at

`integer` The Unix timestamp at which the order was created.

### Error Response Parameters

Given below is a list of possible errors you may face while creating an Order.

## 3.2. Create a Recurring Payment

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

**UPI Payments**

- We recommend sending a pre-debit notification to the customer 48 hours before the debit date.
- For UPI, it may take between 24-36 hours for the subsequent payment to reflect on your Dashboard.
- This is because of the failure of pre-debit notification and/or any retries that we attempt for the payment.
- Do not create another subsequent payment until you get the status of the previous one.

**UPI Payments**

- The subsequent payment may fail if there is late authorisation of an earlier payment.
- For UPI, **do not** create subsequent payments on the last day of the cycle. This will cause the payment to fail.

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

### Response Parameters

razorpay\_payment\_id

`string` The unique identifier of the payment that is created. For example, `pay_1Aa00000000001`.

razorpay\_order\_id

`string` The unique identifier of the order that is created. For example, `order_1Aa00000000001`.

razorpay\_signature

`string` The signature generated by the Razorpay. For example, `9ef4dffbfd84f1318f6739a3ce19f9d85851857ae648f114332d8401e0949a3d`

### Error Response Parameters

Given below is a list of possible errors you may face while creating a Recurring Payment.

adequate\_funds\_not\_available\_blocked

- **Description**: Sufficient unblocked funds not available in customer's account. Please ask customer to add fund and try again.
- **Next Steps**: Please ask customer to add sufficient unblocked funds and try again.

amount\_does\_not\_match\_mandate\_amount

Amount Mismatch - Mandate Amount

- **Description**: The payment failed as the amount does not match the amount provided at the time of mandate creation.
- **Next Steps**: Pass the transaction amount less than or equal to the mandate amount.

Amount Mismatch - Payment Amount

- **Description**: The amount does not match with payment amount.
- **Next Steps**: Retry with correct amount.

bad\_request\_error

- **Description**: Invalid Mandate Sequence Number.
- **Next Steps**: Retry after some time during the valid cycle.

bank\_account\_invalid

- **Description**: Payment failed because Account linked to VPA is invalid.
- **Next Steps**: Create a new mandate with the customer.

bank\_not\_available

- **Description**: Payment was unsuccessful as the bank linked to this UPI ID is temporarily unavailable. Any amount deducted will be refunded within 5-7 working days.
- **Next Steps**: Retry after some time.

bank\_technical\_error

Bank Decline

- **Description**: Payment was unsuccessful as it was declined by your bank. Any amount deducted will be refunded within 5-7 working days.
- **Next Steps**: Retry after some time.

Bank or Wallet Gateway Error

- **Description**: Payment processing failed due to error at bank or wallet gateway
- **Next Steps**: Retry after some time.

Temporary Bank Issue

- **Description**: Payment was unsuccessful due to a temporary issue at your bank. Any amount deducted will be refunded within 5-7 working days.
- **Next Steps**: Retry after some time.

General Temporary Issue

- **Description**: Payment was unsuccessful due to a temporary issue. Any amount deducted will be refunded within 5-7 working days.
- **Next Steps**: Retry after some time.

Bank Services Halt

- **Description**: Payment was unsuccessful due to a temporary halt of services at this bank.
- **Next Steps**: Retry after some time.

banks\_hsm\_is\_down\_remitter

- **Description**: Remitter bank failed to process the transaction. Please try again after some time.
- **Next Steps**: Please try again after some time.

credit\_to\_beneficiary\_failed

- **Description**: Payment was unsuccessful due to a temporary issue. Any amount deducted will be refunded within 5-7 working days.
- **Next Steps**: Retry after some time.

debit\_declined

- **Description**: Payment was unsuccessful as it was declined by remitter bank.
- **Next Steps**: Create a new mandate with the customer.

debit\_instrument\_blocked

- **Description**: Payment was unsuccessful as the account linked to this UPI ID is blocked. Try using another account.
- **Next Steps**: Create a new mandate with the customer.

execution\_day\_rule\_mismatch

Execution Day Rule Mismatch

- **Description**: Day of debit does not match the debit execution rule for the payer. Please ensure execution day matches the execution rule.
- **Next Steps**: Please ensure execution day matches execution rule.

Execution Day Rule Mismatch - Remitter

- **Description**: Day of debit does not match the debit execution rule for the payer. Please ensure execution day matches the execution rule.
- **Next Steps**: Please ensure execution day matches execution rule and try again.

gateway\_technical\_error

Bank or Wallet Gateway Error

- **Description**: Payment processing failed due to error at bank or wallet gateway.
- **Next Steps**: Retry after some time.

Temporary Issue with Money Deduction

- **Description**: Payment was unsuccessful due to a temporary issue. If money got deducted, reach out to the seller.
- **Next Steps**: Retry after some time.

id\_value\_must\_be\_present

- **Description**: Failed to debit customer's bank account. Mandate details are incorrect.
- **Next Steps**: Please try after sometime.

insufficient\_funds

- **Description**: Transaction failed due to insufficient funds.
- **Next Steps**: Ask the customer to add balance to their account and retry.

invalid\_response\_from\_gateway

- **Description**: Payment was unsuccessful due to a temporary issue. Any amount deducted will be refunded within 5-7 working days.
- **Next Steps**: Retry after some time.

invalid\_token

- **Description**: Invalid Token.
- **Next Steps**: Create a new mandate with the customer.

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

mandate\_cancelled

- **Description**: UPI mandate created for payment has been cancelled by user.
- **Next Steps**: Create a new mandate with the customer.

mandate\_current\_cycle\_allowed\_debit\_exceeds

- **Description**: Mandate is already honoured.
- **Next Steps**: Wait till next cycle for debiting the customer.

mandate\_debit\_beyond\_psp\_amount\_cap

- **Description**: Debit amount is beyond payer PSP specified amount cap. Please reduce the amount and try again.
- **Next Steps**: Please reduce the mandate amount to match customer PSP.

mandate\_expired

- **Description**: UPI Mandate is expired.
- **Next Steps**: Create a new mandate with the customer.

mandate\_not\_active

- **Description**: UPI mandate is not active.
- **Next Steps**: Create a new mandate with the customer.

mandate\_paused

- **Description**: UPI mandate is not active, it is paused by user.
- **Next Steps**: Ask the customer to resume the mandate & retry.

merchant\_error\_payee\_psp

- **Description**: VPA resolution into bank account details failed. Please try again after some time.
- **Next Steps**: Please try again after some time.

mobile\_number\_invalid

- **Description**: Registered Mobile number linked to the account has been changed or removed.
- **Next Steps**: Create a new mandate with the customer.

mpin\_not\_set\_by\_customer

- **Description**: UPI MPIN not set by customer. Please ask customer to set MPIN and try again.
- **Next Steps**: Please ask customer to set MPIN and try again.

nature\_of\_debit\_not\_allowed

- **Description**: Nature of debit not allowed in customer's account. Please ask the customer to use a different bank account.
- **Next Steps**: Please ask the customer to use a different bank account.

no\_financial\_address\_record\_found

- **Description**: No financial address record found for this vpa. Please ask customer to try with another bank account.
- **Next Steps**: Please ask customer to try with other bank account.

no\_original\_request\_found

- **Description**: No mandate details were found in the record during debit. Please try after some time.
- **Next Steps**: Please try after some time.

null\_ack\_processing\_failure

- **Description**: Processing failure at gateway. Please try again after some time.
- **Next Steps**: Please try again after some time.

number\_of\_pin\_tries\_exceeded

- **Description**: Customer has exceeded PIN retry limit. Please ask customer to create a new mandate and enter the right PIN.
- **Next Steps**: Please ask customer to create a new mandate and enter the right PIN.

payer\_account\_has\_changed

- **Description**: Payer account linked to the customer's VPA has changed. Please request the customer to either change it to the bank account used during mandate registration or register a new mandate for them.
- **Next Steps**: Please request the customer to either change it to the bank account used during mandate registration or register a new mandate for them.

payer\_seqnum\_validation\_failure

- **Description**: Payer sequence number length validation failed.
- **Next Steps**: Please provide a valid payer sequence number (1-3 digits).

payment\_failed

Temporary Issue with Refund

- **Description**: Payment was unsuccessful due to a temporary issue. If amount got deducted, it will be refunded within 5-7 working days.
- **Next Steps**: Retry after 1 hour.

Try Another Bank Account

- **Description**: Payment failed. Please try again with another bank account.
- **Next Steps**: Retry after some time.

payment\_pending

- **Description**: The status of your payment is pending. You can either wait or retry to pay successfully.
- **Next Steps**: Retry after some time.

payment\_risk\_check\_failed

- **Description**: Payment was unsuccessful as your account does not pass the risk checks done by your bank. Try using another account.
- **Next Steps**: Retry after some time.

payment\_stopped\_by\_court\_order

- **Description**: Payment processing failure at remitter bank. Please ask customer to try with another bank account.
- **Next Steps**: Please ask customer to try with another bank account.

payment\_timed\_out

- **Description**: Payment was unsuccessful as the bank linked to this UPI ID is not reachable at this time.
- **Next Steps**: Retry after some time.

per\_transaction\_limit\_exceeded

- **Description**: Customer bank per transaction limit exceeded. Please try again with a lower amount.
- **Next Steps**: Please reduce transaction amount and try again.

psp\_bank\_not\_available

- **Description**: Payer PSP / Bank not available. Please try again after some time.
- **Next Steps**: Please try again after some time.

psp\_not\_available

- **Description**: Payment was unsuccessful as the UPI app is not reachable at this time. Any amount deducted will be refunded within 5-7 working days.
- **Next Steps**: Retry after some time.

psp\_timeout

- **Description**: Payer PSP timed out. Please try again.
- **Next Steps**: Please try again after some time.

regid\_details\_must\_be\_present

- **Description**: Gateway validation failure. Please try after sometime or create a new mandate.
- **Next Steps**: Please try after sometime or create a new mandate.

remitter\_account\_dormant

- **Description**: Bank Account is closed.
- **Next Steps**: Create a new mandate with the customer.

remitter\_dispatch\_failed

- **Description**: Payment failed due to some issue at the customer's. Please try again after some time.
- **Next Steps**: Please try again after some time.

request\_timed\_out

- **Description**: Payment was unsuccessful due to a temporary issue. Any amount deducted will be refunded within 5-7 working days.
- **Next Steps**: Retry after some time.

response\_not\_received\_within\_tat

- **Description**: VPA resolution into bank account details failed. Please try again after some time.
- **Next Steps**: Please try again after some time.

seqnum\_mismatch\_payer\_psp

- **Description**: Sequence number mismatch between payer and payee PSP. Please try again after some time.
- **Next Steps**: Please ask customer to try after sometime.

suspected\_fraud\_decline

- **Description**: Suspected fraud, transaction declined by customer's bank. Please try again after some time.
- **Next Steps**: Please try after sometime.

transaction\_frequency\_limit\_exceeded

- **Description**: Payment failed. Please try again with another bank account.
- **Next Steps**: Create a new mandate with the customer.

transaction\_limit\_exceeded

- **Description**: Payment failed because Transaction amount limit has exceeded
- **Next Steps**: Reach out to the customer to collect the amount.

transaction\_not\_allowed

- **Description**: Payment was unsuccessful as it was declined by your bank. Reach out to your bank for more details. Try using another account.
- **Next Steps**: Create a new mandate with the customer.

transaction\_not\_permitted\_cardholder

- **Description**: Transaction not permitted for customer's account. Please ask customer to try with another bank account.
- **Next Steps**: Please ask customer to try with another bank account.

transaction\_not\_permitted\_cardholder\_beneficiary

- **Description**: Transaction not permitted in beneficiary account. Please try again with another bank account.
- **Next Steps**: Please try again with another bank account.

transaction\_not\_permitted\_to\_vpa

- **Description**: Transaction not permitted to payee VPA by the payer PSP. Please contact your bank to enable Autopay for this VPA.
- **Next Steps**: Please contact your bank to enable autopay for this VPA.

umn\_does\_not\_exist\_payer

- **Description**: Mandate does not exist. Please create a new mandate.
- **Next Steps**: Please ask customer to create new mandate.

unable\_to\_process\_beneficiary\_bank

- **Description**: Error processing request at beneficiary bank. Please try again after some time.
- **Next Steps**: Please try again after some time.

vpa\_resolution\_failed

- **Description**: You have entered an incorrect UPI ID. Please retry with the correct UPI ID.
- **Next Steps**: Retry after some time.

## 3.3. Fetch an Order With ID

Use this endpoint to retrieve details of a particular order as per the id.

GET

/v1/orders/:id

### Path Parameter

id

mandatory

`string` Unique identifier of the order to be retrieved.

### Response Parameters

id

`string` The unique identifier of the order.

amount

`integer` The amount for which the order was created, in currency subunits. For example, for an amount of ₹295, enter `29500`.

entity

`string` Name of the entity. Here, it is `order`.

amount\_paid

`integer` The amount paid against the order.

amount\_due

`integer` The amount pending against the order.

currency

`string` ISO code for the currency in which you want to accept the payment. The default length is 3 characters. Refer to the [list of supported currencies](/razorpay-docs-md/international-payments.md#supported-currencies).

receipt

`string` Receipt number that corresponds to this order. Can have a maximum length of 40 characters and has to be unique.

notification

`object` Details of the pre-debit notification. The notification object is populated in the response only if you have passed this while creating an order.

token\_id

`string` The `token_id` generated when the customer successfully completes the authorisation payment. Different payment instruments for the same customer have different `token_id`.

payment\_after

`integer` Unix timestamp post which the debit is supposed to happen.

id

`string` Unique identifier of the notification.

delivered\_at

`integer` Indicates the unix timestamp when the notification was delivered.

status

`string` The status of the order. Possible values:

- `created`: When you create an order it is in the `created` state. It stays in this state till a payment is attempted on it.
- `attempted`: An order moves from `created` to `attempted` state when a payment is first attempted on it. It remains in the `attempted` state till one payment associated with that order is captured.
- `paid`: After the successful capture of the payment, the order moves to the `paid` state. No further payment requests are permitted once the order moves to the `paid` state. The order stays in the `paid` state even if the payment associated with the order is refunded.

attempts

`integer` The number of payment attempts, successful and failed, that have been made against this order.

notes

`json object` Key-value pair that can be used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

created\_at

`integer` Indicates the Unix timestamp when this order was created.
