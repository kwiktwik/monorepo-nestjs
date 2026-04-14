<!-- Source: https://razorpay.com/docs/payments/payment-methods/cards/features/integrate-saved-cards -->

Check the prerequisites and the integration steps for [Saved Cards](/razorpay-docs-md/payment-methods/cards/features/saved-cards.md) on your standard checkout page. Know [how to integrate Saved Cards on Custom Checkout](/razorpay-docs-md/payment-gateway/web-integration/custom/features/saved-cards.md).

## Prerequisites

- Create a [Razorpay account](https://dashboard.razorpay.com/signup)  .
- [Generate API Keys on Dashboard.](/razorpay-docs-md/api/authentication.md#generate-api-keys)

  Test Mode API Keys

  Live Mode API Keys

  Watch this video to know how to generate Test Mode API keys.
- [Integrate with our Standard Checkout](/razorpay-docs-md/payment-gateway/web-integration/standard.md)

  .

## Step 1: Enable Flash Checkout on Dashboard

Flash Checkout, enabled by default on your Standard Checkout, lets your customers save their card details for future purchases. Customers can choose whether to save their card information during the payment process. All card details are stored securely using PCI-DSS-compliant technology. Know more about [Flash Checkout](/razorpay-docs-md/dashboard/account-settings/checkout-features.md#flash-checkout).

## Step 2: Create a Customer

Create a customer whose card details should be saved from the Dashboard or using the Customers API. You can create customers with basic details such as `email` and `contact` using the following endpoint:

API Sample Code

The following endpoint creates or add a customer with basic details such as name and contact details. You can use this API for various Razorpay Solution offerings.

POST

/customers

Know more about [Customers API](/razorpay-docs-md/api/customers.md).

#### Request Parameters

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

## Step 3: Create an Order

Order is an important step in the payment process.

- An order should be created for every payment.
- You can create an order using the [Orders API](/razorpay-docs-md/payment-methods/cards/features/integrate-saved-cards.md#api-sample-code)  . It is a server-side API call.  Know how to [authenticate](/razorpay-docs-md/api/authentication.md#generate-api-keys)

  Orders API.
- The order\_id received in the response should be passed to the checkout. This ties the Order with the payment and secures the request from being tampered.

**Watch Out!**

Payments made without an `order_id` cannot be captured and will be automatically refunded. You must create an order before initiating payments to ensure proper payment processing.

#### API Sample Code

The following is a sample API request and response for creating an order:

CurlJavaPythonPHPRubyNode.js.NETResponse

copy

```bash
curl -X POST https://api.razorpay.com/v1/orders
-u [YOUR_KEY_ID]:[YOUR_KEY_SECRET]
-H 'content-type:application/json'
-d '{
    "amount": 50000,
    "currency": "INR",
    "receipt": "rcptid_11",
    "partial_payment": true,
    "first_payment_min_amount": 23000
}'
```

#### Request Parameters

Here is the list of parameters and their description for creating an order:

amount

mandatory

`integer` Payment amount in the smallest currency sub-unit. For example, if the amount to be charged is ₹299, then pass `29900` in this field. In the case of three decimal currencies, such as KWD, BHD and OMR, to accept a payment of 295.991, pass the value as 295990. And in the case of zero decimal currencies such as JPY, to accept a payment of 295, pass the value as 295.

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

id

mandatory

`string` Unique identifier of the customer. For example, `cust_1Aa00000000004`.

Know more about [Orders API](/razorpay-docs-md/api/orders.md).

#### Response Parameters

Descriptions for the response parameters are present in the [Orders Entity](/razorpay-docs-md/api/orders/entity.md) table.

#### Error Response Parameters

The error response parameters are available in the [API Reference Guide](/razorpay-docs-md/api/orders/create.md).

## Step 4: Enable Customer Card Saving on Checkout

While making the payment, the customer enters card details and can choose to save them for future use. Pass `customer_id` along with the other parameters into the Checkout form.

Web

Android

iOS

Web Standard Checkout

copy

```html
<button id="rzp-button1">Pay</button>
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
<script>
var options = {
    "key": "<YOUR_KEY_ID>",
    "amount": "5076",
    "currency": "",
    "name": "Acme Corp",
    "description": "Test Transaction",
    "image": "https://example.com/your_logo",
    "customer_id": "cust_EYqfYOviw62csf",
    "order_id": "order_DBJOWzybf0sJbb",
    "prefill":{
        "contact":"+919876543210",
        "email":"gaurav.kumar@example.com",
        "name":"Gaurav Kumar"
        },
    "handler": function (response){
        alert(response.razorpay_payment_id);
        alert(response.razorpay_order_id);
        alert(response.razorpay_signature)
    }
};
var rzp1 = new Razorpay(options);
document.getElementById('rzp-button1').onclick = function(e){
    rzp1.open();
    e.preventDefault();
}
</script>
```

#### Request Parameter

customer\_id

mandatory

`string` Unique identifier of the customer. This can be obtained from the response of the previous step.

Know more about [Checkout parameters](/razorpay-docs-md/payment-gateway/web-integration/standard/integration-steps.md#123-checkout-options) for web integration.

## Step 5: Create Payments Using Saved Card

Once the card is saved, customers can complete payments on repeat purchases by only entering the CVV. To fetch saved cards, pass the `customer_id` to the Checkout form.

Web

Android

iOS

Initiate payment by passing `customer_id` to Checkout along with the other options.

Standard Checkout

copy

```html
<button id="rzp-button1">Pay</button>
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
<script>
var options = {
    "key": "YOUR_KEY_ID", // Enter the Key ID generated from the Dashboard
    "amount": "50000", // Amount is in currency subunits.
    "currency": "",
    "name": "Acme Corp",
    "description": "Test Transaction",
    "order_id":"order_CgmcjRh9ti2lP7",
    "image": "https://example.com/your_logo",
    "customer_id": "cust_EYqfYOviw62csf",
    "handler": function (response){
        alert(response.razorpay_payment_id);
        alert(response.razorpay_order_id);
        alert(response.razorpay_signature)
    }
};
var rzp1 = new Razorpay(options);
document.getElementById('rzp-button1').onclick = function(e){
    rzp1.open();
    e.preventDefault();
}
</script>
```

#### Request Parameter

customer\_id

mandatory

`string` Unique identifier of the customer. [Created in Step 2](/razorpay-docs-md/payment-methods/cards/features/integrate-saved-cards.md#step-2-create-a-customer).

## Test Integration

Use test cards to test your payment integration before going live. The test cards simulate different payment scenarios and error conditions for all supported card networks. Know more about [Test Cards](/razorpay-docs-md/payments/test-card-details.md#saved-cards).
