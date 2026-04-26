<!-- Source: https://razorpay.com/docs/payments/payment-gateway/s2s-integration/payment-methods/moto -->

With Razorpay, you can use MOTO (Mail-Order-Telephone-Order) transactions to charge a customer's credit card without using the CVV or 2-factor-authentication. You can extend this flow to your customers to reduce payment failures that may occur due to low internet speeds or redirects to bank pages.

## Step 1: Create an Order

Order creation is the first step to integrate your application with Razorpay and start accepting payments. Orders API allows you to create an Order when a payment is expected from a customer.

Ensure the `razorpay_order_id` is stored against the corresponding transaction. The API endpoint given below will create an Order at your server-side:

POST

/orders

Order is an important step in the payment process.

- An order should be created for every payment.
- You can create an order using the [Orders API](/razorpay-docs-md/payment-gateway/s2s-integration/payment-methods/moto.md#api-sample-code)  . It is a server-side API call.  Know how to [authenticate](/razorpay-docs-md/api/authentication.md#generate-api-keys)

  Orders API.
- The order\_id received in the response should be passed to the checkout. This ties the Order with the payment and secures the request from being tampered.

**Watch Out!**

Payments made without an `order_id` cannot be captured and will be automatically refunded. You must create an order before initiating payments to ensure proper payment processing.

## API Sample Code

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
    "receipt": "rcptid_11"
}'
```

#### Request Parameters

Here is the list of parameters and their description for creating an order:

amount

mandatory

`integer` The transaction amount, expressed in the currency subunit. For example, for an actual amount of ₹299.35, the value of this field should be `29935`.

currency

mandatory

`string` The currency in which the transaction should be made. See the [list of supported currencies](/razorpay-docs-md/international-payments.md#supported-currencies). Length must be 3 characters.

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

optional

`string` Unique identifier of the customer. For example, `cust_1Aa00000000004`.

Know more about [Orders API](/razorpay-docs-md/api/orders.md).

## Error Response Parameters

The error response parameters are available in the [API Reference Guide](/razorpay-docs-md/api/orders/create.md).

## Step 2: Create a Payment

Use the `order_id`, that is the `id` returned in the [previous step](/razorpay-docs-md/payment-gateway/s2s-integration/payment-methods/moto.md#step-1-create-an-order) to create a payment. The API endpoint given below creates a payment using cards. Your customers can make payments by providing either card details or the token id.

### Pay using Cards

Use the following endpoint to make payment using card details.

POST

/payments/create/redirect

RequestResponse

copy

```bash
curl -u <YOUR_KEY_ID>:<YOUR_KEY_SECRET>
-X POST https://api.razorpay.com/v1/payments/create/redirect
-H 'content-type:application/json'
-d '{
  "amount": 50000,
  "currency": "INR",
  "email": "gaurav.kumar@example.com",
  "contact": 9000090000,
  "order_id": "order_DBJOWzybf0sJbb",
  "method": "card",
  "card":{
    "number": "5104060000000008",
    "name": "Gaurav Kumar",
    "expiry_month": "01",
    "expiry_year": "22"
  },
  "auth_type": "skip"
}'
```

### Pay using Tokens

According to recent Payment Acquirer (PA)/ Payment Gateway (PG) guidelines from RBI, businesses cannot save their customers' card numbers and other card data on their servers.

Use the following endpoint to make payment using token id.

POST

/payments/create/redirect

RequestResponse

copy

```bash
curl -u <YOUR_KEY_ID>:<YOUR_KEY_SECRET>
-X POST https://api.razorpay.com/v1/payments/create/redirect
-H 'content-type:application/json'
-d '{
"amount":100,
"currency":"INR",
"contact":"9164544995",
"email":"shivamyuvraaj1@gmail.com",
"order_id": "order_JfhhSvgLYUDoNC",
"token":"token_IaoGJDRc9eRff0",
"customer_id" :"cust_IaV8vdrgdosxe6",
"auth_type":"skip"
}'
```

## Step 3: Post Processing

If the payment is successful, you can query the `razorpay_order_id` in your database and mark the corresponding transaction at your end as paid.

## Create Multiple Payments in a Batch

You can create bulk payments from the [Dashboard](https://dashboard.razorpay.com). Know more about [batch payments](/razorpay-docs-md/payment-methods/moto/batch.md).
