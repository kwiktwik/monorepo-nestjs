<!-- Source: https://razorpay.com/docs/payments/payment-gateway/s2s-integration/json/v2/build-integration/single-integration-api -->

You can now create an order along with a payment using a single API for netbanking, cards and UPI. Given below are details and examples for all three payment methods followed by steps to integrate S2S JSON API and accept payments using [netbanking](/razorpay-docs-md/payment-gateway/s2s-integration/json/v2/build-integration/single-integration-api.md#netbanking), [cards](/razorpay-docs-md/payment-gateway/s2s-integration/json/v2/build-integration/single-integration-api.md#cards) and [UPI](/razorpay-docs-md/payment-gateway/s2s-integration/json/v2/build-integration/single-integration-api.md#upi).

Netbanking

Create an **order** along with **payment** using the consolidated order and payment API. This single API call combines order and payment creation, resulting in a more efficient and faster transaction process.

Create a order along with payment by:

- Making a single API call to Razorpay, combining order and payment creation.
- Authenticating using the provided credentials, ensuring access to the consolidated payment API.
- Manually integrating the API sample codes on your server.

Use the following API to create an order along with payment using `netbanking` as the payment method:

CurlJavaPythonPHPRubyNode.js

copy

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X POST https://api.razorpay.com/v1/orders \
-H "Content-Type: application/json" \
-d '{
 "amount": 50000,
 "currency": "INR",
 "receipt": "receipt#1",
 "notes": {
   "key1": "value3",
   "key2": "value2"
 },
 "partial_payment": true,
 "customer_id": "cust_E9penp7VGhT5yt",
 "transfers": [
   {
     "account": "acc_IRQWUleX4BqvYn",
     "amount": 1000,
     "currency": "INR",
     "notes": {
       "branch": "Acme Corp Bangalore North",
       "name": "Gaurav Kumar"
     },
     "linked_account_notes": [
       "branch"
     ],
     "on_hold": true,
     "on_hold_until": 1671222870
   },
   {
     "account": "acc_IROu8Nod6PXPtZ",
     "amount": 1000,
     "currency": "INR",
     "notes": {
       "branch": "Acme Corp Bangalore South",
       "name": "Saurav Kumar"
     },
     "linked_account_notes": [
       "branch"
     ],
     "on_hold": false
   }
 ],
 "products": [],
 "bank_account": {
   "account_number": "765432123456789",
   "name": "Gaurav Kumar",
   "ifsc": "HDFC0000053"
 },
 "payment_config": {
 "capture": "automatic",
 "capture_options": {
     "automatic_expiry_period": 12,
     "manual_expiry_period": 7200,
     "refund_speed": "optimum"
   }
 },
 "payment": {
   "amount": 100,
   "email": "gaurav.kumar@example.com",
   "contact": "9123456789",
   "ip": "192.168.0.103",
   "method": "netbanking",
   "bank": "HDFC",
   "description": "Test payment",
   "notes": {
     "note_key": "value1"
   }
 },
 "user_agent": "Mozilla/5.0"
}
```

SuccessFailure

copy

```json
{
  "id": "order_EKwxwAgItmmXdp",
  "status": "attempted",
  "receipt": "receipt#1",
  "notes": {
    "key1": "value3",
    "key2": "value2"
  },
  "created_at": 1582628071,
  "amount": 50000,
  "amount_paid": 0,
  "amount_due": 50000,
  "currency": "INR",
  "offer_id": null,
  "attempts": 1,
  "transfers": [],
  "payment_workflow": {
     "id": "pay_FVmAstJWfsD3SO",
     "next": [
       {
         "action": "redirect",
         "url": "https://api.razorpay.com/v1/payments/FVptEs3cSWX1fs/authorize"
       },
     ]
   }
 }
```

#### Request Parameters

amount

mandatory

`integer` The amount for which the order was created in currency subunits. For example, for an amount of ₹295.00, enter 29500. The same amount will be used for the payment creation. For the partial payment scenario, we will use the amount specified in the payment request object in case.

currency

mandatory

`string` The currency in which the transaction should be made.  See the [list of supported currencies](/razorpay-docs-md/international-payments.md#supported-currencies). Length must be of 3 characters.

receipt

optional

`string` Receipt number that corresponds to this order. Can have a maximum length of 40 characters and has to be unique.

partial\_payment

optional

`boolean` Indicates whether the customer can make a partial payment. Possible values:

- `true`: The customer can make partial payments.
- `false` (default): The customer cannot make partial payments.

first\_payment\_min\_amount

optional

`integer` Minimum amount that must be paid by the customer as the first partial payment. For example, if an amount of ₹7,000 is to be received from the customer in two installments of #1 - ₹5,000, #2 - ₹2,000, then you can set this value as `500000`. This parameter should be passed only if `partial_payment` is `true`.

customer\_id

optional

`string` Unique identifier of the customer.

transfers

optional

`json object` Details regarding the transfer.

account

`string` The recipient account ID for fund transfer.

amount

optional

`string` The amount of the transfer.

currency

mandatory

`string` The currency in which the transaction should be made.  See the [list of supported currencies](/razorpay-docs-md/international-payments.md#supported-currencies). Length must be of 3 characters.

notes

optional

`json object` Key-value pair that can be used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

linked\_account\_notes

optional

`string` Notes associated with the linked account.

on\_hold

mandatory

`boolean` Indicates whether the account settlement for transfer is on hold. Possible values:

- `true`: Puts the settlement on hold.
- `false`: Releases the settlement.

on\_hold\_until

mandatory

`integer` Timestamp until which the transfer amount is on hold.

bank\_account

optional

`json object` Details of the bank account that the customer provides at the time of registration.

account\_number

optional

`string` Account number of the customers bank account.

name

optional

`string` The name associated with the bank account.

ifsc

optional

`string` The IFSC code of the bank.

payment\_config

optional

`array` Payment capture settings for the payment. The options sent here override the [account level auto-capture settings](/razorpay-docs-md/payments/capture-settings.md) configured using the Dashboard.

capture

mandatory

`string` Option to automatically capture payment. Possible values:

- `automatic`: Payments are auto-captured according to the configurations specified in the `capture_options` array.
- `manual`: You have to manually capture payments using our [Capture API](/razorpay-docs-md/api/payments.md#capture-a-payment)

  or from the [Dashboard](/razorpay-docs-md/payments/dashboard.md#manually-capture-payments)  .

capture\_options

optional

`array` Use this array to determine the expiry period for automatic and [manual capture](/razorpay-docs-md/payments/capture-settings/api.md) of payments and the refund speed in the case of non-capture.

automatic\_expiry\_period

mandatory if capture = automatic

`integer` Time in minutes till when payments in the `authorized` state should be auto-captured.
Minimum value `12` minutes. This parameter is mandatory only if the value of `capture` parameter is `automatic`.

manual\_expiry\_period

optional

`integer` Time in minutes till when you can manually capture payments in the `authorized` state.

- Must be equal to or greater than the `automatic_expiry_period` value.
- Default value `7200` minutes.
- Maximum value `7200` minutes.
- Payments in the `authorized` state after the `manual_expiry_period` are auto-refunded.

refund\_speed

mandatory

`string` Refund speed for payments that were not captured (automatically or manually). Possible values:

- `optimum`: We try to process the refund instantly. We charge a small fee for this. If it is not possible to process an instant refund, we will process a normal refund in 5-7 working days. [Learn more about instant refunds](/razorpay-docs-md/refunds.md#how-instant-refunds-work)  .
- `normal`: The refund is processed in 5-7 working days.

  If no value is passed, the refund is processed using the [default speed set on the Dashboard](/razorpay-docs-md/refunds.md#setting-the-default-speed-of-refunds)  .

payment

mandatory

`object` Details of the payment.

amount

optional

`integer` The amount for which the order was created in currency subunits. For example, for an amount of ₹295.00, enter 29500. The same amount will be used for the payment creation. For the partial payment scenario, we will use the amount specified in the payment request object in case.

email

mandatory

`string` Email address of the customer.

contact

mandatory

`integer` Contact number of the customer.

ip

mandatory

`string` The customer's IP address.

method

mandatory

`string` Name of the payment method (example, netbanking, cards and upi).

bank

mandatory

`string` Name of the bank.

description

mandatory

`string` Description of the payment.

Descriptions for the response parameters are present in the [Response parameter table](/razorpay-docs-md/payment-gateway/s2s-integration/json/v2/build-integration/single-integration-api.md#response-parameters).

Cards

**Watch Out!**

The request body will differ from those created by other PSPs for tokens created on Razorpay.

The following API will create a payment with `cards` as the payment method:

With Card NumberWith Token Created on RazorpayJavaPythonPHPRubyNode.js

copy

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X POST https://api.razorpay.com/v1/orders \
-H "Content-Type: application/json" \
-d {
 "amount": 50000,
 "currency": "INR",
 "receipt": "receipt#1",
 "notes": {
   "key1": "value3",
   "key2": "value2"
 },
 "partial_payment": true,
 "customer_id": "cust_E9penp7VGhT5yt",
 "transfers": [
   {
     "account": "acc_IRQWUleX4BqvYn",
     "amount": 1000,
     "currency": "INR",
     "notes": {
       "branch": "Acme Corp Bangalore North",
       "name": "Gaurav Kumar"
     },
     "linked_account_notes": [
       "branch"
     ],
     "on_hold": true,
     "on_hold_until": 1671222870
   },
   {
     "account": "acc_IROu8Nod6PXPtZ",
     "amount": 1000,
     "currency": "INR",
     "notes": {
       "branch": "Acme Corp Bangalore South",
       "name": "Gaurav Kumar"
     },
     "linked_account_notes": [
       "branch"
     ],
     "on_hold": false
   }
 ],
 "products": [],
 "payment_config": {
   "capture": "automatic",
   "capture_options": {
     "automatic_expiry_period": 12,
     "manual_expiry_period": 7200,
     "refund_speed": "optimum"
   }
 },
 "payment": {
   "amount": 100,
   "email": "gaurav.kumar@example.com",
   "contact": "9090909090",
   "method": "card",
   "notes": {
     "key1": "value3",
     "key2": "value2"
   },
   "card": {
     "number": "4386289407660153",
     "name": "Gaurav",
     "expiry_month": "11",
     "expiry_year": "30",
     "cvv": "100"
   },
   "authentication": {
     "authentication_channel": "browser"
   },
   "browser": {
     "java_enabled": false,
     "javascript_enabled": false,
     "timezone_offset": 11,
     "color_depth": 23,
     "screen_width": 23,
     "screen_height": 100
   },
   "ip": "105.106.107.108",
   "referer": "https://merchansite.com/example/paybill"
 },
 "user_agent": "Mozilla/5.0"
}
```

SuccessFailure

copy

```json
{
  "id": "order_EKwxwAgItmmXdp",
  "status": "attempted",
  "receipt": "receipt#1",
  "notes": {
    "key1": "value3",
    "key2": "value2"
  },
  "created_at": 1582628071,
  "amount": 50000,
  "amount_paid": 0,
  "amount_due": 50000,
  "currency": "INR",
  "offer_id": null,
  "attempts": 1,
  "transfers": [],
  "payment_workflow": {
    "id": "pay_FVmAstJWfsD3SO",
    "next": [
      {
        "action": "redirect",
        "url": "https://api.razorpay.com/v1/payments/pay_FVmAstJWfsD3SO/authorize"
      },
      {
        "action": "otp_generate",
        "url": "https://api.razorpay.com/v1/payments/pay_FVmAstJWfsD3SO/otp_generate?track_id=FVmAtLUe9XZSGM&key_id=<YOUR_KEY_ID>"
      }
    ]
  }
 }
```

#### Request Parameters

amount

mandatory

`integer` The amount for which the order was created in currency subunits. For example, for an amount of ₹295.00, enter 29500. The same amount will be used for the payment creation. For the partial payment scenario, we will use the amount specified in the payment request object in case.

currency

mandatory

`string` The currency in which the transaction should be made.  See the [list of supported currencies](/razorpay-docs-md/international-payments.md#supported-currencies). Length must be of 3 characters.

receipt

optional

`string` Receipt number that corresponds to this order. Can have a maximum length of 40 characters and has to be unique.

partial\_payment

optional

`boolean` Indicates whether the customer can make a partial payment. Possible values:

- `true`: The customer can make partial payments.
- `false` (default): The customer cannot make partial payments.

first\_payment\_min\_amount

optional

`integer` Minimum amount that must be paid by the customer as the first partial payment. For example, if an amount of ₹7,000 is to be received from the customer in two installments of #1 - ₹5,000, #2 - ₹2,000, then you can set this value as `500000`. This parameter should be passed only if `partial_payment` is `true`.

customer\_id

optional

`string` Unique identifier of the customer.

transfers

optional

`json object` Details regarding the transfer.

account

`string` The recipient account ID for fund transfer.

amount

optional

`string` The amount of the transfer.

currency

mandatory

`string` The currency in which the transaction should be made.  See the [list of supported currencies](/razorpay-docs-md/international-payments.md#supported-currencies). Length must be of 3 characters.

notes

optional

`json object` Key-value pair that can be used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

linked\_account\_notes

optional

`string` Notes associated with the linked account.

on\_hold

mandatory

`boolean` Indicates whether the account settlement for transfer is on hold. Possible values:

- `true`: Puts the settlement on hold.
- `false`: Releases the settlement.

on\_hold\_until

mandatory

`string` Timestamp until which the transfer amount is on hold.

payment\_config

optional

`array` Payment capture settings for the payment. The options sent here override the [account level auto-capture settings](/razorpay-docs-md/payments/capture-settings.md) configured using the Dashboard.

capture

mandatory

`string` Option to automatically capture payment. Possible values:

- `automatic`: Payments are auto-captured according to the configurations specified in the `capture_options` array.
- `manual`: You have to manually capture payments using our [Capture API](/razorpay-docs-md/api/payments.md#capture-a-payment)

  or from the [Dashboard](/razorpay-docs-md/payments/dashboard.md#manually-capture-payments)  .

capture\_options

optional

`array` Use this array to determine the expiry period for automatic and [manual capture](/razorpay-docs-md/payments/capture-settings/api.md) of payments and the refund speed in the case of non-capture.

automatic\_expiry\_period

mandatory if capture = automatic

`integer` Time in minutes till when payments in the `authorized` state should be auto-captured.
Minimum value `12` minutes. This parameter is mandatory only if the value of `capture` parameter is `automatic`.

manual\_expiry\_period

optional

`integer` Time in minutes till when you can manually capture payments in the `authorized` state.

- Must be equal to or greater than the `automatic_expiry_period` value.
- Default value `7200` minutes.
- Maximum value `7200` minutes.
- Payments in the `authorized` state after the `manual_expiry_period` are auto-refunded.

refund\_speed

mandatory

`string` Refund speed for payments that were not captured (automatically or manually). Possible values:

- `optimum`: We try to process the refund instantly. We charge a small fee for this. If it is not possible to process an instant refund, we will process a normal refund in 5-7 working days. [Learn more about instant refunds](/razorpay-docs-md/refunds.md#how-instant-refunds-work)  .
- `normal`: The refund is processed in 5-7 working days.

  If no value is passed, the refund is processed using the [default speed set on the Dashboard](/razorpay-docs-md/refunds.md#setting-the-default-speed-of-refunds)  .

payment

mandatory

`object` Details of the payment.

amount

optional

`integer` The amount for which the order was created in currency subunits. For example, for an amount of ₹295.00, enter 29500. The same amount will be used for the payment creation. For the partial payment scenario, we will use the amount specified in the payment request object in case.

email

mandatory

`string` Email address of the customer.

contact

mandatory

`integer` Contact number of the customer.

method

mandatory

`string` Name of the payment method (example, netbanking, cards and upi).

card

mandatory

`object` Details of the payment.

number

mandatory

`integer` Details associated with the card.

expiry\_month

mandatory

`string` Expiry month for the card in MM format.

name

mandatory

`string` Name of the cardholder.

expiry\_year

mandatory

`string` Expiry year for the card in YY format.

cvv

mandatory

`integer` CVV printed on the back of the card.

ip

mandatory

`string` The customer's IP address.

referrer

optional

`string` Referrer header passed by the client's browser.

user-agent

mandatory

`string` The User-Agent header of the user's browser. The default value will be passed by Razorpay if not provided by you.

authentication

mandatory

`object` Details of the authentication method used for the payment.

authentication\_channel

mandatory

`string` Specifies the channel through which authentication is performed. In this example, it's set to browser.

browser

mandatory

`object` Information regarding the customer's browser. This parameter need not be passed when `authentication_channel=app`.

java\_enabled

mandatory

`boolean` Indicates whether the customer's browser supports Java. Obtained from the `navigator` HTML DOM object.

javascript\_enabled

mandatory

`boolean` Indicates whether the customer's browser can execute JavaScript.Obtained from the `navigator` HTML DOM object.

timezone\_offset

mandatory

`integer` Time difference between UTC time and the cardholder's browser local time. Obtained from the `getTimezoneOffset()` method applied to the `Date` object.

color\_depth

mandatory

`integer` Obtained from the payer's browser using the `screen.colorDepth` HTML DOM property.

screen\_width

mandatory

`integer` Total width of the payer's screen in pixels. Obtained from the `screen.width` HTML DOM property.

screen\_height

mandatory

`integer` Obtained from the `navigator` HTML DOM object.

Descriptions for the response parameters are present in the [Response parameter table](/razorpay-docs-md/payment-gateway/s2s-integration/json/v2/build-integration/single-integration-api.md#response-parameters).

UPI

The following API will create a payment with `UPI` as the payment method:

CurlJavaPythonPHPRubyNode.js

copy

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
 -X POST https://api.razorpay.com/v1/orders \
 -H "Content-Type: application/json" \
 -d {
  "amount": 50000,
  "currency": "INR",
  "receipt": "receipt#1",
  "notes": {
    "key1": "value3",
    "key2": "value2"
  },
  "partial_payment": true,
  "customer_id": "cust_E9penp7VGhT5yt",
  "transfers": [
    {
      "account": "acc_IRQWUleX4BqvYn",
      "amount": 1000,
      "currency": "INR",
      "notes": {
        "branch": "Acme Corp Bangalore North",
        "name": "Gaurav Kumar"
      },
      "linked_account_notes": [
        "branch"
      ],
      "on_hold": true,
      "on_hold_until": 1671222870
    },
    {
      "account": "acc_IROu8Nod6PXPtZ",
      "amount": 1000,
      "currency": "INR",
      "notes": {
        "branch": "Acme Corp Bangalore South",
        "name": "Gaurav Kumar"
      },
      "linked_account_notes": [
        "branch"
      ],
      "on_hold": false
    }
  ],
  "products": [],
  "bank_account": {
    "account_number": "765432123456789",
    "name": "Gaurav Kumar",
    "ifsc": "HDFC0000053"
  },
  "payment_config": {
    "capture": "automatic",
    "capture_options": {
      "automatic_expiry_period": 12,
      "manual_expiry_period": 7200,
      "refund_speed": "optimum"
    }
  },
  "payment": {
    "amount": 100,
    "email": "gaurav.kumar@example.com",
    "contact": "9090909090",
    "method": "upi",
    "upi": {
      "flow": "collect",
      "vpa": "gauravkumar@okhdfcbank"
    },
    "ip": "192.168.0.103",
    "referer": "http",
    "user_agent": "Mozilla/5.0",
    "description": "Test payment",
    "notes": {
      "note_key": "value1"
    }
  },
  "user_agent": "Mozilla/5.0"
 }
```

SuccessFailure

copy

```json
{
  "id": "order_EKwxwAgItmmXdp",
  "status": "attempted",
  "receipt": "receipt#1",
  "notes": {
    "key1": "value3",
    "key2": "value2"
  },
  "created_at": 1582628071,
  "amount": 50000,
  "amount_paid": 0,
  "amount_due": 50000,
  "currency": "INR",
  "offer_id": null,
  "attempts": 1,
  "transfers": [],
  "payment_workflow": {
    "id": "pay_FVmAstJWfsD3SO",
    "next": [
      {
        "action": "poll",
        "url": "https://api.razorpay.com/v1/payments/pay_ERGVHAXaLNV1y5"
      }
    ]
  }
 }
```

#### Request Parameters

amount

mandatory

`integer` The amount for which the order was created in currency subunits. For example, for an amount of ₹295.00, enter 29500. The same amount will be used for the payment creation. For the partial payment scenario, we will use the amount specified in the payment request object in case.

currency

mandatory

`string` The currency in which the transaction should be made.  See the [list of supported currencies](/razorpay-docs-md/international-payments.md#supported-currencies). Length must be of 3 characters.

receipt

optional

`string` Receipt number that corresponds to this order. Can have a maximum length of 40 characters and has to be unique.

partial\_payment

optional

`boolean` Indicates whether the customer can make a partial payment. Possible values:

- `true`: The customer can make partial payments.
- `false` (default): The customer cannot make partial payments.

first\_payment\_min\_amount

optional

`integer` Minimum amount that must be paid by the customer as the first partial payment. For example, if an amount of ₹7,000 is to be received from the customer in two installments of #1 - ₹5,000, #2 - ₹2,000, then you can set this value as `500000`. This parameter should be passed only if `partial_payment` is `true`.

customer\_id

optional

`string` Unique identifier of the customer.

transfers

optional

`json object` Details regarding the transfer.

account

`string` The recipient account ID for fund transfer.

amount

optional

`string` The amount of the transfer.

currency

mandatory

`string` The currency in which the transaction should be made.  See the [list of supported currencies](/razorpay-docs-md/international-payments.md#supported-currencies). Length must be of 3 characters.

notes

optional

`json object` Key-value pair that can be used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

linked\_account\_notes

optional

`string` Notes associated with the linked account.

on\_hold

mandatory

`boolean` Indicates whether the account settlement for transfer is on hold. Possible values:

- `true`: Puts the settlement on hold.
- `false`: Releases the settlement.

on\_hold\_until

mandatory

`string` Timestamp until which the transfer amount is on hold.

bank\_account

optional

`json object` Details of the bank account that the customer provides at the time of registration.

account\_number

optional

`string` Account number of the customers bank account.

name

optional

`string` The name associated with the bank account.

ifsc

optional

`string` The IFSC code of the bank.

payment\_config

optional

`array` Payment capture settings for the payment. The options sent here override the [account level auto-capture settings](/razorpay-docs-md/payments/capture-settings.md) configured using the Dashboard.

capture

mandatory

`string` Option to automatically capture payment. Possible values:

- `automatic`: Payments are auto-captured according to the configurations specified in the `capture_options` array.
- `manual`: You have to manually capture payments using our [Capture API](/razorpay-docs-md/api/payments.md#capture-a-payment)

  or from the [Dashboard](/razorpay-docs-md/payments/dashboard.md#manually-capture-payments)  .

capture\_options

optional

`array` Use this array to determine the expiry period for automatic and [manual capture](/razorpay-docs-md/payments/capture-settings/api.md) of payments and the refund speed in the case of non-capture.

automatic\_expiry\_period

mandatory if capture = automatic

`integer` Time in minutes till when payments in the `authorized` state should be auto-captured.
Minimum value `12` minutes. This parameter is mandatory only if the value of `capture` parameter is `automatic`.

manual\_expiry\_period

optional

`integer` Time in minutes till when you can manually capture payments in the `authorized` state.

- Must be equal to or greater than the `automatic_expiry_period` value.
- Default value `7200` minutes.
- Maximum value `7200` minutes.
- Payments in the `authorized` state after the `manual_expiry_period` are auto-refunded.

refund\_speed

mandatory

`string` Refund speed for payments that were not captured (automatically or manually). Possible values:

- `optimum`: We try to process the refund instantly. We charge a small fee for this. If it is not possible to process an instant refund, we will process a normal refund in 5-7 working days. [Learn more about instant refunds](/razorpay-docs-md/refunds.md#how-instant-refunds-work)  .
- `normal`: The refund is processed in 5-7 working days.

  If no value is passed, the refund is processed using the [default speed set on the Dashboard](/razorpay-docs-md/refunds.md#setting-the-default-speed-of-refunds)  .

payment

mandatory

`object` Details of the payment.

amount

optional

`integer` The amount for which the order was created in currency subunits. For example, for an amount of ₹299. The same amount will be used for the payment creation. For the partial payment scenario, we will use the amount specified in the payment request object in case.

email

mandatory

`string` Email address of the customer. The maximum length supported is 40 characters.

contact

mandatory

`integer` Phone number of the customer. The maximum length supported is 15 characters, inclusive of country code.

ip

mandatory

`string` The customer's IP address.

method

mandatory

`string` Name of the payment method (example, netbanking, cards and upi).

bank

mandatory

`string` Name of the bank.

description

mandatory

`string` Description of the payment.

referrer

optional

`string` Referrer header passed by the client's browser.

upi

mandatory

`json object` Details of the UPI payment received. Only applicable if method is upi.

flow

`string` The type of UPI flow. Possible value in\_app.

vpa

`string` The customer's VPA (Virtual Payment Address) or UPI id used to make the payment. For example, gauravkumar@exampleupi.

user\_agent

optional

`string` The User-Agent header of the user's browser. The default value will be passed by Razorpay if not provided by you.

Descriptions for the response parameters are present in the [Response parameter table](/razorpay-docs-md/payment-gateway/s2s-integration/json/v2/build-integration/single-integration-api.md#response-parameters).

Response Parameters

#### Response Parameters

If the payment request is valid, the response contains the following fields.

receipt

`string` Receipt number that corresponds to this order. Can have a maximum length of 40 characters and has to be unique.

status

`string` Status of the order. Possible values:

- `attempted`: An order moves from `created` to `attempted` state when a payment is first attempted on it. It remains in the `attempted` state till one payment associated with that order is captured.
- `created`: When you create an order it is in the `created` state. It stays in this state till a payment is attempted on it.
- `paid`: After the successful capture of the payment, the order moves to the `paid` state. No further payment requests are permitted once the order moves to the `paid` state. The order stays in the `paid` state even if the payment associated with the order is refunded.

id

`string` The unique identifier of the order.

amount

`integer` The amount for which the order was created, in currency subunits. For example, for an amount of ₹295.00, enter `29500`.

created\_at

`integer` Indicates the Unix timestamp when this order was created.

amount\_paid

`integer` Indicates the amount paid for the order.

amount\_due

`integer` Indicates the amount due for the order.

currency

`string` The currency in which the transaction was made.  See the [list of supported currencies](/razorpay-docs-md/international-payments.md#supported-currencies). Length must be of 3 characters.

offer\_id

`string` The unique identifier of the created offer.

attempts

`string` The number of payment attempts, successful and failed, that have been made against this order.

transfers

`string` Details regarding the transfer.

notes

`object` Key-value pair that can be used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each.

payment\_workflow

`array` Details regarding the payment.

id

`string` Unique identifier of the payment.

next

`array` A list of action objects available to you to continue the payment process. Present when the payment requires further processing.

action

`string` An indication of the next step available to you to continue the payment process. Possible values:

- `otp_generate`: Use this URL to allow the customer to generate OTP and complete the payment on your webpage.
- `redirect`: Use this URL to redirect the customer to submit the OTP on the bank page.

url

`string` URL endpoint where Razorpay will submit the final payment status.

**Watch Out!**

After completing the initial step for your preferred payment method mentioned above, follow these common steps given below, applicable for all payment methods.

**Watch Out!**

The steps given below are common for all payment methods.

1.1 Handle Payment Success and Error Events

Once a customer completes the payment, a `POST` request is made to the `callback_url` provided in the payment request. The data contained in this request will depend on whether the payment was a **success** or a **failure**.

#### Success Callback

If the payment made by the customer is successful, the following fields are sent:

- `razorpay_payment_id`
- `razorpay_order_id`
- `razorpay_signature`

Callback Example

copy

```json
{
  "razorpay_payment_id": "pay_29QQoUBi66xm2f",
  "razorpay_order_id": "order_9A33XWu170gUtm",
  "razorpay_signature": "9ef4dffbfd84f1318f6739a3ce19f9d85851857ae648f114332d8401e0949a3d"
}
```

#### Failure Callback

If the payment has failed, the callback will contain details of the error. Refer to [Errors](/docs/errors/) for details.

Given below is a sample error code you will receive when the order fails.

Order Create Failure Example

copy

```json
{
   "error": {
   "code": "BAD_REQUEST_ERROR",
   "description": "The amount must be at least INR 1.00",
   "source": "business",
   "step": "order_create",
   "reason": "input_validation_failed",
   "metadata": {},
   "field": "amount"
    }
}
```

Given below is a sample error code you will receive when the payment fails.

**Watch Out!**

You can use the order id present in the metadata for additional payment attempts on the order without creating a new one.

Payment Create Failure Example

copy

```json
{
   "error": {
   "code": "BAD_REQUEST_ERROR",
   "description": "Authentication failed due to incorrect OTP",
   "field": null,
   "source": "customer",
   "step": "payment_authentication",
   "reason": "invalid_otp",
   "metadata": {
       "order_id": "order_EKwxwAgItmmXdp"
    }
  }
}
```

The following error occurs when the order was processed, payment was created in Razorpay but failed at gateway level.

Gateway Processing Error Example

copy

```json
{
   "error": {
   "code": "GATEWAY_ERROR",
   "description": "Authentication failed due to incorrect OTP",
   "field": null,
   "source": "customer",
   "step": "payment_authentication",
   "reason": "gateway failure",
   "metadata": {
   "order_id": "order_EKwxwAgItmmXdp",
   "payment_id": "pay_TKwxwAgItmmXdp"
    }
  }
}
```

1.2 Retry/Re-Attempt Request

Use the following sample code example to make a retry request using `Order id` and `Receipt` in the request.

Order ID in requestReceipt in request

copy

```json
{
  "id": "order_EKwxwAgItmmXdp",
  "status": "attempted",
  "receipt": "receipt#1",
  "notes": {
    "key1": "value3",
    "key2": "value2"
  },
  "created_at": 1582628071,
  "amount": 50000,
  "amount_paid": 0,
  "amount_due": 50000,
  "currency": "INR",
  "offer_id": null,
  "attempts": 1,
  "transfers": [],
  "payment_workflow": {
     "id": "pay_FVmAstJWfsD3SO",
     "next": [
       {
         "action": "redirect",
         "url": "https://api.razorpay.com/v1/payments/FVptEs3cSWX1fs/authorize"
       },
     ]
   }
 }
```0

SuccessFailure

copy

```json
{
  "id": "order_EKwxwAgItmmXdp",
  "status": "attempted",
  "receipt": "receipt#1",
  "notes": {
    "key1": "value3",
    "key2": "value2"
  },
  "created_at": 1582628071,
  "amount": 50000,
  "amount_paid": 0,
  "amount_due": 50000,
  "currency": "INR",
  "offer_id": null,
  "attempts": 1,
  "transfers": [],
  "payment_workflow": {
     "id": "pay_FVmAstJWfsD3SO",
     "next": [
       {
         "action": "redirect",
         "url": "https://api.razorpay.com/v1/payments/FVptEs3cSWX1fs/authorize"
       },
     ]
   }
 }
```1

1.3 Verify Payment Signature

Signature verification is a mandatory step to ensure that the callback is sent by Razorpay. The `razorpay_signature` contained in the callback can be regenerated by your system and verified as follows.

Create a string to be hashed using the `razorpay_payment_id` contained in the callback and the Order ID generated in the first step, separated by a `|`. Hash this string using SHA256 and your API Secret.

copy

```json
{
  "id": "order_EKwxwAgItmmXdp",
  "status": "attempted",
  "receipt": "receipt#1",
  "notes": {
    "key1": "value3",
    "key2": "value2"
  },
  "created_at": 1582628071,
  "amount": 50000,
  "amount_paid": 0,
  "amount_due": 50000,
  "currency": "INR",
  "offer_id": null,
  "attempts": 1,
  "transfers": [],
  "payment_workflow": {
     "id": "pay_FVmAstJWfsD3SO",
     "next": [
       {
         "action": "redirect",
         "url": "https://api.razorpay.com/v1/payments/FVptEs3cSWX1fs/authorize"
       },
     ]
   }
 }
```2

#### Generate Signature on your Server

JavaPythonGoPHPRubyNode.js.NET

copy

```json
{
  "id": "order_EKwxwAgItmmXdp",
  "status": "attempted",
  "receipt": "receipt#1",
  "notes": {
    "key1": "value3",
    "key2": "value2"
  },
  "created_at": 1582628071,
  "amount": 50000,
  "amount_paid": 0,
  "amount_due": 50000,
  "currency": "INR",
  "offer_id": null,
  "attempts": 1,
  "transfers": [],
  "payment_workflow": {
     "id": "pay_FVmAstJWfsD3SO",
     "next": [
       {
         "action": "redirect",
         "url": "https://api.razorpay.com/v1/payments/FVptEs3cSWX1fs/authorize"
       },
     ]
   }
 }
```3

1.4 Integrate Payments Rainy Day Kit

Use Payments Rainy Day kit to overcome payments exceptions such as:

- [Late Authorisation](/razorpay-docs-md/payments/late-authorisation.md)
- [Payment Downtime](/razorpay-docs-md/api/payments/downtime.md)
- [Payment Errors](/docs/errors/)

1.5 Verify Payment Status

**Handy Tips**

On the Razorpay Dashboard, ensure that the payment status is `captured`. Refer to the payment capture settings page to know how to [capture payments automatically](/razorpay-docs-md/payments/capture-settings.md).

You can track the payment status in three ways:

Verify Status from Dashboard

Subscribe to Webhook Events

Poll APIs

To verify the payment status from the Razorpay Dashboard:

1. Log in to the Razorpay Dashboard and navigate to **Transactions** → **Payments**.
2. Check if a **Payment Id** has been generated and note the status. In case of a successful payment, the status is marked as **Captured**.

![Payment details on Dashboard](https://razorpay.com/docs/payments/payment-gateway/s2s-integration/json/v2/build-integration/build/browser/assets/images/testpayment.jpg)

## Next Steps [Step 2: Test Integration](/razorpay-docs-md/payment-gateway/s2s-integration/json/v2/test-integration.md)
