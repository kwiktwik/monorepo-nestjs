<!-- Source: https://razorpay.com/docs/payments/payment-gateway/s2s-integration/recurring-payments/paper-nach/tokens -->

Once you capture a payment, Razorpay Checkout returns a `razorpay_payment_id`. You can use this id to fetch the `token_id`, which is used to create and charge subsequent payments.

You can retrieve the `token_id` using the [Dashboard](/razorpay-docs-md/recurring-payments/create.md#3-search-for-the-token) or the APIs given below.

## 2.1 Fetch Payment ID using Order ID.

After you send the registration link, You should wait for the customer to make the payment. You can check the status of the payment using our APIs. The following endpoint fetches the `payment_id` using an `order_id`.

GET

/orders/:id/payments

### Path Parameter

id

`string` The unique identifier of the order. For example, `order_1Aa00000000001`.

## 2.2. Fetch Token by Payment ID

Use the below endpoint to fetch the `token_id` using a `payment_id`.

GET

/payments/:id

**Handy Tips**

You can also retrieve the `token_id` via the [payment.authorized webhook](/razorpay-docs-md/api/payments/recurring-payments/webhooks.md#payment-authorized).

### Path Parameter

id

mandatory

`string` The unique identifier of the payment to be retrieved. For example, `pay_1Aa00000000002`.

## 2.3. Fetch Tokens by Customer ID

Use the below endpoint to fetch tokens linked to a customer.

A customer can have multiple tokens tied to them. These tokens can be used to create subsequent payments for multiple products or services.

**Watch Out!**

This endpoint will not fetch the details of expired and unused tokens.

GET

/customers/:id/tokens

### Path Parameters

id

mandatory

`string` The unique identifier of the customer for whom tokens are to be retrieved. For example, `cust_1Aa00000000002`.

## 2.4. Delete Tokens

The following endpoint deletes a token.

DELETE

/customers/:customer\_id/tokens/:token\_id

### Path Parameter

customer\_id

mandatory

`string` The unique identifier of the customer with whom the token is linked. For example, `cust_1Aa00000000002`.

token\_id

mandatory

`string` The unique identifier of the token that is to be deleted. For example, `token_1Aa00000000001`.
