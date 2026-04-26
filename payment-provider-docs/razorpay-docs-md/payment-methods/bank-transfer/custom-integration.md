<!-- Source: https://razorpay.com/docs/payments/payment-methods/bank-transfer/custom-integration -->

You can now accept payments from customers in the form of online bank transfers using the Razorpay Custom Checkout.

## How it Works

1. Customer selects bank transfer as the payment method on Checkout.
2. A Customer Identifier is created with the bank account number and IFSC details and displayed to the customer.
3. The customer copies these details and makes a netbanking payment from their online banking portal.

These Customer Identifiers are linked to the bank account you have registered with Razorpay. The payments are settled in your account as per the settlement schedule.

**Feature Request**

This is an on-demand feature. Please raise a request with our [Support team](https://razorpay.com/support/#request) to get this feature activated on your Razorpay account.

## Prerequisites

- [Create a Razorpay Account](https://dashboard.razorpay.com/signup)

  .
- [Generate the API keys](/razorpay-docs-md/api/authentication.md#generate-api-keys)

  .
- Integrate with [Razorpay Custom Checkout](/razorpay-docs-md/payment-gateway/web-integration/custom.md)  .

## Integration Steps

1. [Create an order](/razorpay-docs-md/payment-methods/bank-transfer/custom-integration.md#step-1-create-an-order)

   .
2. [Add the `fetchVirtualAccount` method to the custom checkout integration](/razorpay-docs-md/payment-methods/bank-transfer/custom-integration.md#step-2-add-fetchvirtualaccount-method-to-custom-checkout)

   .
3. [Subscribe to the virtual account credited webhook event](/razorpay-docs-md/payment-methods/bank-transfer/custom-integration.md#step-3-subscribe-to-webhook-event)

   .

### Step 1: Create an Order

**Order is an important step in the payment process.**

- An order should be created for every payment.
- You can create an order using the [Orders API](/razorpay-docs-md/payment-methods/bank-transfer/custom-integration.md#api-sample-code)  . It is a server-side API call. Know how to [authenticate](/razorpay-docs-md/dashboard/account-settings/api-keys.md#generate-api-keys)

  Orders API.
- The `order_id` received in the response should be passed to the checkout. This ties the order with the payment and secures the request from being tampered.

**Watch Out!**

Payments made without an `order_id` cannot be captured and will be automatically refunded. You must create an order before initiating payments to ensure proper payment processing.

You can create an order:

- Using the sample code on the Razorpay Postman Public Workspace.
- By manually integrating the API sample codes on your server.

#### Razorpay Postman Public Workspace

You can use the Postman workspace below to create an order: [![Run in Postman](https://run.pstmn.io/button.svg)](https://www.postman.com/razorpaydev/workspace/razorpay-public-workspace/request/12492020-6f15a901-06ea-4224-b396-15cd94c6148d)

**Handy Tips**

Under the **Authorization** section in Postman, select **Basic Auth** and add the Key Id and secret as the Username and Password, respectively.

#### API Sample Code

Use this endpoint to create an order using the Orders API.

POST

/orders

CurlJavaPythonGoPHPRubyNode.js.NET

copy

```bash
curl -X POST https://api.razorpay.com/v1/orders
-U [YOUR_KEY_ID]:[YOUR_KEY_SECRET]
-H 'content-type:application/json'
-d '{
 "amount": 500,
 "currency": "INR",
 "receipt": "qwsaq1",
 "partial_payment": true,
 "first_payment_min_amount": 230,
 "notes": {
   "key1": "value3",
   "key2": "value2"
 }
}'
```

Success ResponseFailure Response

copy

```json
{
 "id": "order_IluGWxBm9U8zJ8",
 "entity": "order",
 "amount": 5000,
 "amount_paid": 0,
 "amount_due": 5000,
 "currency": "INR",
 "receipt": "rcptid_11",
 "offer_id": null,
 "status": "created",
 "attempts": 0,
 "notes": [],
 "created_at": 1642662092
}
```

Request Parameters

amount

mandatory

`integer` Payment amount in the smallest currency subunit. For example, if the amount to be charged is ₹299, then pass `29900` in this field. In the case of three decimal currencies, such as KWD, BHD and OMR, to accept a payment of 295.991, pass the value as 295990. And in the case of zero decimal currencies such as JPY, to accept a payment of 295, pass the value as 295.

**Watch Out!**

As per payment guidelines, you should pass the last decimal number as 0 for three decimal currency payments. For example, if you want to charge a customer 99.991 KD for a transaction, you should pass the value for the amount parameter as `99990` and not `99991`.

currency

mandatory

`string` The currency in which the transaction should be made. See the [list of supported currencies](/razorpay-docs-md/international-payments.md#supported-currencies). Length must be 3 characters.

**Handy Tips**

Razorpay has added support for zero decimal currencies, such as JPY and three decimal currencies, such as KWD, BHD and OMR, allowing businesses to accept international payments in these currencies. Know more about [Currency Conversion](/razorpay-docs-md/international-payments/currency-conversion.md)

(May 2024).

receipt

optional

`string` Your receipt id for this order should be passed here. Maximum length is 40 characters.

notes

optional

`json object` Key-value pair that can be used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

partial\_payment

optional

`boolean` Indicates whether the customer can make a partial payment. Possible values:

- `true`: The customer can make partial payments.
- `false` (default): The customer cannot make partial payments.

first\_payment\_min\_amount

optional

`integer` Minimum amount that must be paid by the customer as the first partial payment. For example, if an amount of ₹7,000 is to be received from the customer in two installments of #1 - ₹5,000, #2 - ₹2,000 then you can set this value as `500000`. This parameter should be passed only if `partial_payment` is `true`.

Know more about [Orders API](/razorpay-docs-md/api/orders.md).

Response Parameters

Descriptions for the response parameters are present in the [Orders Entity](/razorpay-docs-md/api/orders/entity.md) parameters table.

Error Response Parameters

The error response parameters are available in the [API Reference Guide](/razorpay-docs-md/api/orders/create.md).

### Step 2: Add `fetchVirtualAccount` method to Custom Checkout

Use the method `fetchVirtualAccount` to create and fetch the virtual account details. The method is called with the following data.

#### Sample Code

Bank TransferSample Response

copy

```javascript
var data = {
 
  order_id: 'order_CuEzONfnOI86Ab',// Replace with Order ID generated in Step 1
  customer_id: "cust_1Aa00000000004",
  notes: {
    address: 'Ground Floor, SJR Cyber, Laskar Hosur Road, Bengaluru',
  }
};

razorpay.fetchVirtualAccount(data)
.then((response) => {
    console.log(response)
  })
  .catch((error) => {
    // 
});
```

#### Request Parameters

order\_id

\_mandatory`string` The unique identifier of the order created in the previous step.

customer\_id

optional

`string` The unique identifier of the customer. Learn how to create a customer using the [Customers API](/razorpay-docs-md/api/customers.md). This parameter is mandatory if you want to associate the virtual account with a specific customer.

notes

optional

`object` Key-value pair that can be used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

#### Response Parameters

id

`string` The unique identifier of the virtual account.

name

`string` The `merchant billing label` as it appears on the Dashboard.

entity

`string` Indicates the type of entity. Here, it is `virtual account`.

status

`string` Indicates whether the virtual account is in `active` or `closed` state.

description

`string` A brief description about the virtual account.

amount\_paid

`integer` The amount paid by the customer.

notes

`json object` Any custom notes you might want to add to the virtual account can be entered here. Refer [Notes section of the API Reference Guide](/razorpay-docs-md/api/understand.md#notes) to learn more.

customer\_id

`string` Unique identifier of the customer to whom the virtual account is linked. Refer the [Customer API](/razorpay-docs-md/api/customers.md) section to learn more.

receivers

`json object` Configuration of desired receivers for the virtual account.

id

`string` The unique identifier of the virtual bank account or virtual UPI ID. Sample IDs for:

- virtual bank account
- `ba_Di5gbQsGn0QSz3`
- virtual UPI ID
- `vpa_CkTmLXqVYPkbxx`.

entity

`string` Name of the entity. Possible values:

- `bank_account`
- `vpa`

ifsc

`string` The IFSC for the virtual bank account created. For example, `RAZR0000001`. This parameter appears in the response only when `bank_account` is passed as the receiver `type`.

bank\_name

`string` The bank associated with the virtual bank account. For example, `RBL Bank`. This parameter appears in the response only when `bank_account` is passed as the receiver `type`.

account\_number

`string` The unique account number provided by the bank. For example, `1112220061746877`. This parameter appears in the response only when `bank_account` is passed as the receiver `type`.

name

`string` The `merchant billing label` as it appears on the Dashboard. This parameter appears in the response only when `bank_account` is passed as the receiver `type`.

notes

`json object` Any custom notes you might want to add to the virtual bank account or virtual UPI ID can be entered here. Refer [Notes section of the API Reference Guide](/razorpay-docs-md/api/understand.md#notes) to learn more. This parameter appears in the response only when `bank_account` is passed as the receiver `type`.

username

`string` The UPI ID consists of the username and the bank handle. The `username` consists of the `namespace` (assigned by the bank to Razorpay), the `merchant prefix` (which can be customised by you) and the `descriptor` (which you provide to identify the customer). The unique identifier which forms the first half of the virtual UPI ID. For example, `rpy.payto00000gaurikumari`. This parameter appears in the response only when `vpa` is passed as the receiver `type`.

handle

`string` The bank name that forms the second half of the virtual UPI ID. For example, `icici`. This parameter appears in the response only when `vpa` is passed as the receiver `type`.

address

`string` The UPI ID that combines the `username` and the `handle` with the `@` symbol. For example, `rpy.payto00000gaurikumari@icici`. This parameter appears in the response only when `vpa` is passed as the receiver `type`.

close\_by

`integer` UNIX timestamp at which the virtual account is scheduled to be automatically closed. The time must be at least 15 minutes after the current time. The date range can be set till `2147483647` in UNIX timestamp format (equivalent to Tuesday, January 19, 2038 8:44:07 AM GMT+05:30).

**Handy Tips**

Any request beyond `2147483647` UNIX timestamp will fail.

closed\_at

`integer` UNIX timestamp at which the virtual account is automatically closed.

created\_at

`integer` UNIX timestamp at which the virtual account was created.

**Handy Tips**

The above flow also works with the following cases:

1. With the Customer Fee bearer model, the amount validation should happen with Amount + Fee.
2. You can pass the customer id in Checkout to ensure that a static virtual account is created for each customer.

### Step 3: Subscribe to Webhook Event

You must subscribe to the `virtual_account.credited` webhook event on the Dashboard to receive notifications whenever customers make payments using bank transfers. Learn how to [setup webhooks](/docs/webhooks/#set-up-webhooks).

#### Sample Payload

virtual\_account.credited

copy

```json
{
  "entity": "event",
  "account_id": "acc_BFQ7uQEaa7j2z7",
  "event": "virtual_account.credited",
  "contains": [
    "payment",
    "virtual_account",
    "bank_transfer"
  ],
  "payload": {
    "payment": {
      "entity": {
        "id": "pay_DETA2KrOlhqQzF",
        "entity": "payment",
        "amount": 50000,
        "currency": "INR",
        "status": "captured",
        "order_id": "order_DBJOWzybf0sJbb",
        "invoice_id": null,
        "international": false,
        "method": "bank_transfer",
        "amount_refunded": 0,
        "amount_transferred": 0,
        "refund_status": null,
        "captured": true,
        "description": "NA",
        "card_id": null,
        "bank": null,
        "wallet": null,
        "vpa": null,
        "email": "gaurav.kumar@example.com",
        "contact": "+919000090000",
        "customer_id": "cust_1Aa00000000004",
        "notes": [],
        "fee": 731,
        "tax": 112,
        "error_code": null,
        "error_description": null,
        "created_at": 1567675983
      }
    },
    "virtual_account": {
      "entity": {
        "id": "va_DET8z3wBxfPB5L",
        "name": "Acme Corp",
        "entity": "virtual_account",
        "status": "active",
        "description": "Virtual Account to test webhook",
        "amount_expected": null,
        "notes": {
          "Important": "Notes for Internal Reference"
        },
        "amount_paid": 50000,
        "customer_id": "cust_1Aa00000000004",
        "close_by": null,
        "closed_at": null,
        "created_at": 1567675923,
        "receivers": [
          {
            "id": "ba_DET8z5Z5ghv4hW",
            "entity": "bank_account",
            "ifsc": "RATN0VAAPIS",
            "bank_name": "RBL Bank",
            "name": "Acme Corp",
            "account_number": "1112220006712324"
          }
        ]
      }
    },
    "bank_transfer": {
      "entity": {
        "id": "bt_DETA2KSUJ3uCM9",
        "entity": "bank_transfer",
        "payment_id": "pay_DETA2KrOlhqQzF",
        "mode": "NEFT",
        "bank_reference": "156767598340",
        "amount": 50000,
        "payer_bank_account": {
          "id": "ba_DETA2UuuKtKLR1",
          "entity": "bank_account",
          "ifsc": "KKBK0000007",
          "bank_name": "Kotak Mahindra Bank",
          "name": "Gaurav Kumar",
          "account_number": "765432123456789"
        },
        "virtual_account_id": "va_DET8z3wBxfPB5L"
      }
    }
  },
  "created_at": 1567675983
}
```
