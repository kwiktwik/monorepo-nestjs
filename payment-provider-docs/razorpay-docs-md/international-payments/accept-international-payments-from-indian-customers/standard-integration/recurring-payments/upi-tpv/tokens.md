<!-- Source: https://razorpay.com/docs/payments/international-payments/accept-international-payments-from-indian-customers/standard-integration/recurring-payments/upi-tpv/tokens -->

Once you capture a payment, Razorpay Checkout returns a `razorpay_payment_id`. You can use this id to fetch the `token_id`, which is used to create and charge subsequent payments.

You can retrieve the `token_id` using the [Dashboard](/razorpay-docs-md/recurring-payments/create.md#3-search-for-the-token) or the APIs given below.

Know about about [Tokens](/razorpay-docs-md/recurring-payments/upi/integrate.md#fetch-emandate-registration-details).

## 2.1. Fetch Token by Payment ID

The following endpoint fetches the `token_id` using a `payment_id`.

GET

/payments/:id

**Handy Tips**

You can also retrieve the `token_id` via the [payment.authorized webhook](/razorpay-docs-md/api/payments/recurring-payments/webhooks.md#payment-authorized).

Path Parameter

id

mandatory

`string` The unique identifier of the payment to be retrieved. For example, `pay_1Aa00000000002`.

## 2.2. Fetch Tokens by Customer ID

A customer can have multiple tokens and these tokens can be used to create subsequent payments for multiple products or services. The following endpoint retrieves tokens linked to a customer.

**Watch Out!**

- This endpoint will not fetch the details of expired and unused tokens.
- The UPI tokens are not populated in the API response if the `save_vpa` feature is not enabled in your account. Please raise a request with our [Support team](https://razorpay.com/support/#request)

  to get this activated.

GET

/customers/:id/tokens

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
