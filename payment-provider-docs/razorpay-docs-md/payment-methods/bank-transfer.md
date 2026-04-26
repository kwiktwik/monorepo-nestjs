<!-- Source: https://razorpay.com/docs/payments/payment-methods/bank-transfer -->

Accept payments from customers using online bank transfers at Razorpay Checkout.

![Checkout screen with Bank Transfer](https://razorpay.com/docs/payments/payment-methods/build/browser/assets/images/pm-checkout-bank-transfer.jpg)

On-Demand Feature - Raise a Request

**Feature Request**

- This is an on-demand feature. Please raise a request with our [Support team](https://razorpay.com/support/#request)

  to get this feature activated on your Razorpay account.
- Watch this video to know how to raise a feature enablement request on the Dashboard.

![Feature Request GIF](https://razorpay.com/docs/payments/payment-methods/build/browser/assets/images/feature-request.gif)

**Watch Out!**

Bank transfer downloads are not supported by default on webviews. This feature is only available on web and native SDKs.

## How it Works

1. Customer selects bank transfer as the payment method on Checkout.
2. A Customer Identifier is created with bank account number and IFSC details and displayed to customer.
3. Customer copies these details and make a netbanking payment from their online banking portal.

These Customer Identifiers are linked to the bank account you have registered with Razorpay. The money will be settled to your account as per the settlement schedule.

You can choose:

- [**Method 1: Create New Customer Identifier Per Order**](/razorpay-docs-md/payment-methods/bank-transfer.md#method-1-create-new-customer-identifier-per-order)
- [**Method 2: Create New Customer Identifier Per Customer**](/razorpay-docs-md/payment-methods/bank-transfer.md#method-2-create-new-customer-identifier-per-customer)

**Watch Out!**

All bank transfer payments are auto-captured. [Manual capture](/razorpay-docs-md/payments/capture-settings.md#manually-capture-payments) of payments is not supported.

## Method 1: Create New Customer Identifier Per Order

This creates a new Customer Identifier per order, every time a customer selects bank transfer as the payment method on Checkout.

#### Integration

The bank transfer payment method will appear for the [Payment Gateway](/razorpay-docs-md/payment-gateway/web-integration/standard.md) and products such as Payment Links and Payment Pages.

**Payment Links and Payment Pages**

No additional integration is required if you are using Payment Links and Payment Pages. Raise a request with our [Support Team](https://razorpay.com/support/#request) to activate the feature on your account.

Apart from enabling this feature on your account, complete the following steps to integrate this feature on your Razorpay Standard Integration:

Step 1: Track Checkout Modal Using `ondismiss` Function

If you have integrated with [Razorpay Standard Checkout](/razorpay-docs-md/payment-gateway/web-integration/standard.md), you must implement the `ondismiss` function to track the lifecycle of the Checkout modal. This displays the `close` icon, which the customer can use to exit the Checkout.

**Handy Tips**

If you are using [Android SDK](/razorpay-docs-md/payment-gateway/android-integration/standard.md), you can rely on the "payment cancelled by user" error response to track the lifecycle of the Checkout modal.

ondismiss function

copy

```javascript
"modal": {
        "ondismiss": function(){
            console.log(data);
        }
  }
```

Step 2: Attach Event Listeners to `Razorpay` Instance

For bank transfer payments, Checkout will not give a success or a failure callback. You must attach event listeners to the `Razorpay` instance to track if and when the customer has selected the bank transfer payment method.

Event Listener

copy

```javascript
var rzp = new Razorpay(options);
rzp.on('payment.submit', function (data) {
  if (data.method === 'bank_transfer') {
    // User has selected Bank Transfer
  }
});
```

Step 3: Subscribe to Webhook Event

You must subscribe to the `virtual_account.credited` webhook event on the Dashboard to receive notifications whenever customers make payments using bank transfers. Know how to [set up webhooks](/docs/webhooks/setup-edit-payments/).

**Sample Payload**

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

## Method 2: Create New Customer Identifier Per Customer

This ensures that each customer will be allocated a unique Customer Identifier, whenever they use the bank transfer method on Checkout. This method requires specific integration steps, which are mentioned in the following section.

#### Integration

The bank transfer payment method will appear for the [Payment Gateway](/razorpay-docs-md/payment-gateway/web-integration/standard.md) and products such as Payment Links and Payment Pages.

**Payment Links and Payment Pages**

No additional integration is required if you are using Payment Links and Payment Pages. Raise a request with our [Support Team](https://razorpay.com/support/#request) to activate the feature on your account.

Apart from enabling this feature on your account, you must implement the following steps in your payment gateway integration:

Step 1: Create a Customer

You must create a customer using the Customers API. You can also do this using the Dashboard.

The following endpoint creates or add a customer with basic details such as name and contact details. You can use this API for various Razorpay Solution offerings.

POST

/customers

Request Parameters

Response Parameters

name

optional

`string` Customer's name. Alphanumeric value with period (.), apostrophe ('), forward slash (/), at (@) and parentheses are allowed. The name must be between 3-50 characters in length. For example, `Gaurav Kumar`.

contact

optional

`string` The customer's phone number. A maximum length of 15 characters including country code. For example, `+919876543210`.

email

optional

`string` The customer's email address. A maximum length of 64 characters. For example, `gaurav.kumar@example.com`.

fail\_existing

optional

`string` Possible values:

- `1` (default): If a customer with the same details already exists, throws an error.
- `0`: If a customer with the same details already exists, fetches details of the existing customer.

gstin

optional

`string` Customer's GST number, if available. For example, `29XAbbA4369J1PA`.

notes

optional

`object` This is a key-value pair that can be used to store additional information about the entity. It can hold a maximum of 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

Step 2: Create an Order

**Order is an important step in the payment process.**

- An order should be created for every payment.
- You can create an order using the [Orders API](/razorpay-docs-md/payment-methods/bank-transfer.md#api-sample-code)  . It is a server-side API call. Know how to [authenticate](/razorpay-docs-md/dashboard/account-settings/api-keys.md#generate-api-keys)

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

Step 3: Pass `customer_id` and `order_id` to Checkout

You must pass the `customer_id` and `order_id` generated in the previous steps to Checkout, as shown below:

Standard Checkout

copy

```javascript
<button id="rzp-button1">Pay</button>
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
<script>
var options = {
    "key": "<YOUR_KEY_ID>", // Enter the Key ID generated from the Dashboard
    "amount": "50000", // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
    "currency": "INR",
    "name": "Acme Corp",
    "description": "Test Transaction",
    "image": "https://cdn.razorpay.com/logos/BUVypPrCFaKDu3_large.jpg",
    "order_id": "order_DBJOWzybf0sJbb",
    "customer_id": "cust_1Aa00000000004",
    "handler": function (response){
        alert(response.razorpay_payment_id);
        alert(response.razorpay_order_id);
        alert(response.razorpay_signature)
    },
    "theme": {
        "color": "#3399cc"
    }
};
var rzp1 = new Razorpay(options);
document.getElementById('rzp-button1').onclick = function(e){
    rzp1.open();
    e.preventDefault();
}
</script>
```

Step 4: Track Checkout Modal Using `ondismiss` Function

(Only if you are using [Standard Checkout](/razorpay-docs-md/payment-gateway/web-integration/standard.md#manual)

)

If you have integrated with Razorpay Standard Checkout, you must implement the `ondismiss` function to track the lifecyle of the Checkout modal. This displays the `close` icon, which the customer can use to exit the Checkout.

ondismiss function

copy

```javascript
"modal": {
        "ondismiss": function(){
            console.log(data);
        }
  }
```

Step 5: Attach Event Listeners to `Razorpay` Instance *[Optional]*

For bank transfer payments, Checkout will not give a success or a failure callback. You must attach event listeners to the `Razorpay` instance to track if and when the customer has selected the bank transfer payment method.

Event Listener

copy

```javascript
var rzp = new Razorpay(options);
rzp.on('payment.submit', function (data) {
  if (data.method === 'bank_transfer') {
    // User has selected Bank Transfer
  }
});
```

Step 6: Subscribe to Webhook Event

You must subscribe to the `virtual_account.credited` webhook event on the Dashboard to receive notifications whenever customers make payments using bank transfers. Know how to [setup webhooks](/docs/webhooks/#set-up-webhooks).

**Sample Payload**

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

### Related Information

- [Hosted Integration for Bank Transfer](/razorpay-docs-md/payment-methods/bank-transfer/hosted-integration.md)
- [Custom Integration for Bank Transfer](/razorpay-docs-md/payment-methods/bank-transfer/custom-integration.md)
