<!-- Source: https://razorpay.com/docs/payments/international-payments/accept-international-payments-from-indian-customers/custom-integration/recurring-payments/upi/tokens -->

Once you capture a payment, Razorpay Checkout returns a `razorpay_payment_id`. You can use this id to fetch the `token_id`, which is used to create and charge subsequent payments.

You can retrieve the `token_id` using the [Dashboard](/razorpay-docs-md/recurring-payments/create.md#3-search-for-the-token) or the APIs given below.

## 2.1. Fetch Token by Payment ID

Use the below endpoint to fetch the `token_id` using a `payment_id`.

GET

/payments/:id

**Note**

You can also retrieve the `token_id` via the [payment.authorized webhook](/razorpay-docs-md/api/payments/recurring-payments/webhooks.md#payment-authorized).

Path Parameter

id

mandatory

`string` The unique identifier of the payment to be retrieved. For example, `pay_1Aa00000000002`.

## 2.2. Fetch Tokens by Customer ID

**Watch Out!**

The UPI tokens are not populated in the API response if the `save_vpa` feature is not enabled in your account. Please raise a request with our [Support team](https://razorpay.com/support/#request) to get this activated.

Path Parameter

id

mandatory

`string` The unique identifier of the customer for whom tokens are to be retrieved. For example, `cust_1Aa00000000002`.

## 2.3. Delete Tokens

The following endpoint deletes a token.

DELETE

/customers/:customer\_id/tokens/:token\_id

Path Parameter

customer\_id

mandatory

`string` The unique identifier of the customer with whom the token is linked. For example, `cust_1Aa00000000002`.

token\_id

mandatory

`string` The unique identifier of the token that is to be deleted. For example, `token_1Aa00000000001`.
