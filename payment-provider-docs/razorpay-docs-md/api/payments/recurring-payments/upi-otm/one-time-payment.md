<!-- Source: https://razorpay.com/docs/api/payments/recurring-payments/upi-otm/one-time-payment -->

You should perform the following steps to create and charge your customer a one time payment:

1. [Create an order to charge the customer](/razorpay-docs-md/api/payments/recurring-payments/upi-otm/one-time-payment.md#31-create-an-order-to-charge-the-customer)
2. [Create a one time payment](/razorpay-docs-md/api/payments/recurring-payments/upi-otm/one-time-payment.md#32-create-a-one-time-payment)

## 3.1. Create an Order to Charge the Customer

You have to create a new order to charge a one time mandate. This order is different from the one created during the authorisation transaction.

The following endpoint creates an order.

POST

/orders

Request Parameters

amount

mandatory

`integer` Amount in currency subunits.

currency

mandatory

`string` The 3-letter ISO currency code for the payment.

receipt

optional

`string` A user-entered unique identifier for the order. For example, `Receipt No. 1`. You should map this parameter to the `order_id` sent by Razorpay.

notes

optional

`object` Key-value pair you can use to store additional information about the entity. Maximum of 15 key-value pairs, 256 characters each. For example, `"note_key": "Beam me up Scotty”`.

payment\_capture

mandatory

`boolean` Determines whether the payment status should be changed to `captured` automatically or not. Possible values:

- `true`: Payments are captured automatically.
- `false`: Payments are not captured automatically. You can manually capture payments using the [Manually Capture Payments API](/razorpay-docs-md/api/payments.md#capture-a-payment)  .

## 3.2. Create a One Time Payment

Once you have generated an `order_id`, use it with the `token_id` to create a one-time payment. After the payment is complete (authorized or failed), the respective token will move to the `cancelled` state and you can no longer use the token. You will get the [token.cancelled](/razorpay-docs-md/api/payments/recurring-payments/webhooks.md#token-cancelled) webhook notification for the same.

The following endpoint creates a one time payment to charge the customer.

POST

/payments/create/recurring

Request Parameters

email

mandatory

`string` The customer's email address. For example, `gaurav.kumar@example.com`.

contact

mandatory

`integer` The customer's phone number. For example, `9876543210`.

currency

mandatory

`string` 3-letter ISO currency code for the payment. Currently, only `INR` is allowed.

amount

mandatory

`integer` The amount you want to charge your customer. This should be the same as the order amount.

order\_id

mandatory

`string` The unique identifier of the order created. For example, `order_1Aa00000000002`.

customer\_id

mandatory

`string` The unique identifier of the customer you want to charge. For example, `cust_1Aa00000000002`.

token

mandatory

`string` The `token_id` generated when the customer successfully completes the authorisation payment. Different payment instruments for the same customer have different `token_id`.

description

optional

`string` A user-entered description for the payment. For example, `Creating recurring payment for Gaurav Kumar`

notes

optional

`object` Key-value pair you can use to store additional information about the entity. Maximum of 15 key-value pairs, 256 characters each. For example, `"note_key": "Beam me up Scotty”`.
