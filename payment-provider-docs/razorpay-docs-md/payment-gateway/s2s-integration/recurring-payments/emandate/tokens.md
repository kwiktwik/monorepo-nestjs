<!-- Source: https://razorpay.com/docs/payments/payment-gateway/s2s-integration/recurring-payments/emandate/tokens -->

Once you capture a payment, Razorpay returns a `razorpay_payment_id` that can be used to fetch the `token_id`. This is a manual process and can be done using either APIs or Webhooks. This `token_id` is used to create and charge subsequent payments.

**Handy Tips**

You can also [search for the Token](/razorpay-docs-md/recurring-payments/create.md#3-search-for-the-token) on your Dashboard.

## 2.1. Fetch Token by Payment ID

The following endpoint retrieves the `token_id` using a `payment_id`.

GET

/payments/:id

**Handy Tips**

You can also retrieve the `token_id` via the [payment.authorized](/razorpay-docs-md/api/payments/recurring-payments/webhooks.md#payment-authorized) webhook.

### Path Parameter

id

mandatory

`string` The unique identifier of the payment to be retrieved. For example, `pay_1Aa00000000002`.

## 2.2. Fetch Tokens by Customer ID

A customer can have multiple tokens and these tokens can be used to create subsequent payments for multiple products or services. The following endpoint retrieves tokens linked to a customer.

**Watch Out!**

This endpoint will not fetch the details of expired and unused tokens.

GET

/customers/:id/tokens

### Path Parameter

id

mandatory

`string` The unique identifier of the customer for whom tokens are to be retrieved. For example, `cust_1Aa00000000002`.

## 2.3. Delete Tokens

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
