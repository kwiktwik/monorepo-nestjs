<!-- Source: https://razorpay.com/docs/payments/payment-gateway/s2s-integration/recurring-payments/upi-intent/subsequent-payments -->

You should perform the following steps to create and charge your customer subsequent payments:

1. [Create an order to charge the customer](/razorpay-docs-md/payment-gateway/s2s-integration/recurring-payments/upi-intent/subsequent-payments.md#31-create-an-order-to-charge-the-customer)
2. [Create a recurring payment](/razorpay-docs-md/payment-gateway/s2s-integration/recurring-payments/upi-intent/subsequent-payments.md#32-create-a-recurring-payment)

## 3.1. Create an Order to Charge the Customer

You have to create a new order every time you want to charge your customers. This order is different from the one created when you created the authorisation transaction.

Use the below endpoint to create an order:

POST

/orders

### Request Parameters

amount

mandatory

`integer` Amount in currency subunits. For cards, the minimum value is `100` (₹1).

currency

mandatory

`string` The 3-letter ISO currency code for the payment. Currently, we only support `INR`.

payment\_capture

mandatory

`boolean` Determines whether tha payment status should be changed to `captured` automatically or not. Possible values:

- `true`: Payments are captured automatically.
- `false`: Payments are not captured automatically. You can manually capture payments using the [Manually Capture Payments API](/razorpay-docs-md/api/payments.md#capture-a-payment)  .

## 3.2. Create a Recurring Payment

Once you have generated an `order_id`, use it along with the `token_id` to create a payment and charge the customer.

Use the below endpoint to create a payment and charge the customer.

POST

/payments/create/recurring

Once our system validates and successfully processes the payment request, a `razorpay_payment_id` is returned. In the case of some banks such as HDFC Bank and Axis Bank, the payment entity returned will be in the `created` state since the charge system of these banks are file-based and can take a few hours.

**UPI Payments**

- We recommend sending a pre-debit notification to the customer 48 hours before the debit date.
- For UPI, it may take between 24-36 hours for the subsequent payment to reflect on your Dashboard.
- This is because of the failure of pre-debit notification and/or any retries that we attempt for the payment.
- Do not create another subsequent payment until you get the status of the previous one.

**UPI Payments**

- The subsequent payment may fail if there is late authorisation of an earlier payment.
- For UPI, **do not** create subsequent payments on the last day of the cycle. This will cause the payment to fail.

### Request Parameters

email

mandatory

`string` The customer's email address. For example, `gaurav.kumar@example.com`.

contact

mandatory

`string` The customer's phone number. For example, `9876543210`.

amount

mandatory

`integer` The amount you want to charge your customer. This should be the same as the amount in the order.

currency

mandatory

`string` 3-letter ISO currency code for the payment. Currently, only `INR` is allowed.

order\_id

mandatory

`string` The unique identifier of the order created. For example, `order_1Aa00000000002`.

customer\_id

mandatory

`string` The `customer_id` for the customer you want to charge. For example, `cust_1Aa00000000002`.

token

mandatory

`string` The `token_id` generated when the customer successfully completes the authorisation payment. Different payment instruments for the same customer have different `token_id`.

recurring

mandatory

`boolean` Determines if recurring payment is enabled or not.

- `true`: Recurring Payment is enabled.
- `false`: Recurring Payment is not enabled.

description

optional

`string` A user-entered description for the payment. For example, `Creating recurring payment for Gaurav Kumar`.

notes

optional

`object` Key-value pair that can be used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.
