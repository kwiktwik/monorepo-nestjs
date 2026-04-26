<!-- Source: https://razorpay.com/docs/api/payments/recurring-payments/custom/upi/tokens -->

Once you capture a payment, Razorpay Checkout returns a `razorpay_payment_id`. You can use this id to fetch the `token_id`, which is used to create and charge subsequent payments.

You can retrieve the `token_id` using the [Dashboard](/razorpay-docs-md/recurring-payments/create.md#3-search-for-the-token) or the APIs given below.

## 2.1. Fetch Token by Payment ID

Use the below endpoint to fetch the `token_id` using a `payment_id`.

GET

/payments/:id

**Note**

You can also retrieve the `token_id` via the [payment.authorized webhook](/razorpay-docs-md/api/payments/recurring-payments/webhooks.md#payment-authorized).

### Path Parameter

id

mandatory

`string` The unique identifier of the payment to be retrieved. For example, `pay_1Aa00000000002`.

## 2.2. Fetch Tokens by Customer ID

**Watch Out!**

The UPI tokens are not populated in the API response if the `save_vpa` feature is not enabled in your account. Please raise a request with our [Support team](https://razorpay.com/support/#request) to get this activated.

### Path Parameter

id

mandatory

`string` The unique identifier of the customer for whom tokens are to be retrieved. For example, `cust_1Aa00000000002`.

## 2.3. Cancel Token

You can cancel tokens that are in the `initiated`, `confirmed` or `paused` state. Razorpay does not perform any additional validation checks before forwarding the cancellation request to NPCI.

Cancellations can fail if NPCI returns a failure response. This typically happens due to an internal issue on the remitter's side. Use the following endpoint to cancel a token. This initiates the cancellation of the mandate from NPCI.

PUT

/customers/:customer\_id/tokens/:token\_id/cancel

RequestPythonResponse

copy

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X PUT https://api.razorpay.com/v1/customers/cust_1Aa00000000002/tokens/token_1Aa00000000001/cancel
```

Path Parameters

customer\_id

mandatory

`string` The unique identifier of the customer with whom the token is linked. For example, `cust_1Aa00000000002`.

token\_id

mandatory

`string` The unique identifier of the token that is to be cancelled. For example, `token_1Aa00000000001`.

### Error Response Parameters

Given below is a list of possible errors you may face while cancelling a token.

token\_not\_recurring

- **Description**: The token provided is not a recurring/autopay token and is not eligible for cancellation via this API.
- **Next Steps**: Please ensure you are passing a valid UPI Autopay recurring token. Non-recurring tokens cannot be cancelled using this API.

invalid\_mandate\_state

- **Description**: The UPI mandate linked to this token is not in a cancellable state. The mandate may already be revoked or failed.
- **Next Steps**: Please check the current status of the mandate before attempting cancellation. Cancellation is only allowed when the mandate is in confirmed or active state.

token\_customer\_mismatch

- **Description**: The token provided does not belong to the authenticated customer. Cross-customer token access is not permitted.
- **Next Steps**: Please verify that the `token_id` belongs to the customer in context and retry with the correct token.

token\_merchant\_mismatch

- **Description**: The token provided was not created under your merchant account. Cross-merchant token access is not permitted.
- **Next Steps**: Please ensure you are using tokens created under your own merchant account and retry with the correct `token_id`.

concurrent\_request\_in\_progress

- **Description**: A cancellation or update operation is already in progress for this token. Simultaneous requests on the same token are not allowed.
- **Next Steps**: Please wait at least 60 seconds before retrying the cancellation request. Avoid sending duplicate or parallel cancel requests for the same token.

## 2.4. Delete Tokens

Deleting a token removes it from Razorpay's database. The deleted token will not appear on the Dashboard or when all tokens are fetched. However, it does not cancel the mandate. If you wish to delete the mandate with Razorpay, you must first cancel it using the [Cancel Token API](/razorpay-docs-md/api/payments/recurring-payments/custom/upi/tokens.md#23-cancel-token).

The following endpoint deletes a token.

DELETE

/customers/:customer\_id/tokens/:token\_id

Path Parameters

customer\_id

mandatory

`string` The unique identifier of the customer with whom the token is linked. For example, `cust_1Aa00000000002`.

token\_id

mandatory

`string` The unique identifier of the token that is to be deleted. For example, `token_1Aa00000000001`.

Response Parameters

deleted

`boolean` Indicates whether the token is deleted. Possible values:

- `true`: The token is deleted successfully.
- `false`: The token was not deleted.
