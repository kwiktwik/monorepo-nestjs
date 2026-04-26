<!-- Source: https://razorpay.com/docs/api/payments/recurring-payments/cards/create-subsequent-payments -->

You should perform the following steps to create and charge your customer subsequent payments:

1. [Create an order to charge the customer](/razorpay-docs-md/api/payments/recurring-payments/cards/create-subsequent-payments.md#31-create-an-order-to-charge-the-customer)
2. [Create a recurring payment](/razorpay-docs-md/api/payments/recurring-payments/cards/create-subsequent-payments.md#32-create-a-recurring-payment)

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

Request Parameters

amount

mandatory

`integer` Amount in currency subunits. For cards, the minimum value is `100`, that is, ₹1.

currency

mandatory

`string` The 3-letter ISO currency code for the payment.

receipt

optional

`string` A user-entered unique identifier for the order. For example, `Receipt No. 1`. You should map this parameter to the `order_id` sent by Razorpay.

notification

`object` Details of the pre-debit notification. This object is optional. You should use it only if you want to control pre-debit notifications and debits. If you do not pass this object, we will automatically try to debit after 36 hours and 5 minutes.

**Handy Tips**

The TAT to create a debit if you send a pre-debit notification is 36 hours and 5 minutes.

**Watch Out!**

We will not attempt any retry if the debit fails for tokens with the notification object in the created order. You should manually retry the debit attempt.

token\_id

mandatory

`string` The `token_id` generated when the customer successfully completes the authorisation payment. Different payment instruments for the same customer have different `token_id`.

payment\_after

optional

`integer` UNIX timestamp post which the debit is supposed to happen. Defaults to 36 hours and 5 minutes after the pre-debit notification is delivered.

notes

optional

`object` Key-value pair you can use to store additional information about the entity. Maximum of 15 key-value pairs, 256 characters each. For example, `"note_key": "Beam me up Scotty”`.

payment\_capture

mandatory

`boolean` Determines whether the payment status should be changed to `captured` automatically or not. Possible values:

- `true`: Payments are captured automatically.
- `false`: Payments are not captured automatically. You can manually capture payments using the [Manually Capture Payments API](/razorpay-docs-md/api/payments.md#capture-a-payment)  .

Response Parameters

id

`string` A unique identifier of the order created. For example `order_1Aa00000000001`.

entity

`string` The entity that has been created. Here it is `order`.

amount

`integer` Amount in currency subunits.

amount\_paid

`integer` The amount that has been paid.

amount\_due

`integer` The amount that is yet to be paid.

currency

`string` The 3-letter ISO currency code for the payment.

receipt

`string` A user-entered unique identifier of the order. For example, `rcptid #1`.

notification

`object` Details of the pre-debit notification.

token\_id

`string` The `token_id` generated when the customer successfully completes the authorisation payment. Different payment instruments for the same customer have different `token_id`.

payment\_after

`integer` UNIX timestamp post which the debit is supposed to happen.

id

`string` the unique identifier of the notification. For example, `notification_00000000000001`.

status

`string` The status of the order.

notes

`object` Key-value pair you can use to store additional information about the entity. Maximum of 15 key-value pairs, 256 characters each. For example, `"note_key": "Beam me up Scotty”`.

created\_at

`integer` The Unix timestamp at which the order was created.

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

- You will get a `razorpay_payment_id`, `razorpay_order_id` and `razorpay_signature` as a response after the payment request is successfully processed.
- In the case of some banks, such as HDFC Bank and Axis Bank, the payment entity is in the `created` state since the charging system of these banks is file-based and can take some time.

Request Parameters

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

Response Parameters

razorpay\_payment\_id

`string` The unique identifier of the payment that is created. For example, `pay_1Aa00000000001`.

razorpay\_order\_id

`string` The unique identifier of the order that is created. For example, `order_1Aa00000000001`.

razorpay\_signature

`string` The signature generated by the Razorpay. For example, `9ef4dffbfd84f1318f6739a3ce19f9d85851857ae648f114332d8401e0949a3d`

Error Response Parameters

Given below is a list of possible errors you may face while creating a Recurring Payment.

## 3.3. Fetch an Order With ID

Use this endpoint to retrieve details of a particular order as per the id.

GET

/v1/orders/:id

Path Parameter

id

mandatory

`string` Unique identifier of the order to be retrieved.

Response Parameters

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
