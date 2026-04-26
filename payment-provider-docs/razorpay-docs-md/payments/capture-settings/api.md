<!-- Source: https://razorpay.com/docs/payments/payments/capture-settings/api -->

Once your customer completes a payment, it is automatically moved to `captured` state. However, the payment can attain `authorized` state in the following scenarios:

- **Late authorization**
  Due to external factors such as network issues or technical errors, Razorpay may not receive payment status from the bank immediately. In this case, Razorpay polls the APIs intermittently for 5 days to check the status. If we receive the payment status as successful, the payment is moved to the `authorized` state. [Learn more about late authorization](/razorpay-docs-md/payments/late-authorisation.md)  .
- **Specific business use case**
  Some businesses such as those in the Ecommerce industry may retain the payment in the `authorized` state and later move them to the `captured` state.

You must ensure that all payments in the `authorized` state are moved to the `captured` state within 5 days of creation. This is mandatory because payments that are not captured within this time period will be refunded automatically to customers.

You can configure **Payment Capture setting** for individual payments using the Orders API.

**Watch Out!**

The options sent in the below API take precedence over the [account level auto-capture settings](/razorpay-docs-md/payments/capture-settings.md) configured using the Dashboard.

## API

Use the below endpoint to configure auto-capture settings for individual payments.

POST

/orders

### Request Parameters

amount

mandatory

`integer` The amount, in currency subunit, for order. For example, for an amount of ₹295, enter `29500`.

currency

mandatory

`string` 3-letter ISO currency code for the payment. [List of supported currencies](/razorpay-docs-md/international-payments.md#supported-currencies).

payment

optional

`array` Payment capture settings for the payment. The options sent here override the [account level auto-capture settings](/razorpay-docs-md/payments/capture-settings.md) configured using the Dashboard.

capture

mandatory

`string` Option to automatically capture payment. Possible values:

- `automatic`: Payments are auto-captured according to the configurations specified in the `capture_options` array.
- `manual`: You have to manually capture payments using our [Capture API](/razorpay-docs-md/api/payments.md#capture-a-payment)

  or from the [Dashboard](/razorpay-docs-md/payments/dashboard.md#manually-capture-payments)  .

capture\_options

optional

`array` Use this array to determine the expiry period for automatic and [manual capture](/razorpay-docs-md/payments/capture-settings/api.md) of payments and the refund speed in the case of non-capture.

automatic\_expiry\_period

mandatory if capture = automatic

`integer` Time in minutes till when payments in the `authorized` state should be auto-captured.
Minimum value `12` minutes. This parameter is mandatory only if the value of `capture` parameter is `automatic`.

manual\_expiry\_period

optional

`integer` Time in minutes till when you can manually capture payments in the `authorized` state.

- Must be equal to or greater than the `automatic_expiry_period` value.
- Default value `7200` minutes.
- Maximum value `7200` minutes.
- Payments in the `authorized` state after the `manual_expiry_period` are auto-refunded.

refund\_speed

mandatory

`string` Refund speed for payments that were not captured (automatically or manually). Possible values:

- `normal`: The refund is processed in 5-7 working days.

  If no value is passed, the refund is processed using the [default speed set on the Dashboard](/razorpay-docs-md/refunds.md#setting-the-default-speed-of-refunds)  .

receipt

optional

`string` Maximum length is 40 characters. Receipt number, for internal reference, entered by you for the order.

notes

optional

`object` Key-value pair to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

### Response Parameters

id

`string` The unique identifier of the order. For example, `order_EKwxwAgItmmXdp`.

amount

`integer` The amount, in currency subunit, for the order. For example, for an amount of ₹295, enter `29500`.

amount\_paid

`integer` The amount, in currency subunit, paid against the order.

amount\_due

`integer` The amount, in currency subunit, pending against the order.

currency

`string` 3-letter ISO currency code for the payment. [List of supported currencies](/razorpay-docs-md/international-payments.md#supported-currencies).

receipt

`string` Maximum length is 40 characters. Receipt number, for internal reference, entered by you for the order.

status

`string` The status of the order. Possible values:

- `created`: When you create an order it is in the `created` state.
  It stays in this state till a payment is attempted on it.
- `attempted`: An order moves from `created` to `attempted` state when a payment is first attempted on it.
  It remains in the `attempted` state till one payment associated with that order is captured.
- `paid`: After the successful capture of the payment, the order moves to the `paid` state.
  No further payment requests are permitted once the order moves to the `paid` state.
  The order stays in the `paid` state even if the payment associated with the order is refunded.

attempts

`integer` The number of payment attempts, successful and failed, that have been made against this order. For example, `1`.

notes

`object` Key-value pairs to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

created\_at

`integer` Timestamp, in Unix, when the order was created. For example, `1593607540`.

**Handy Tips**

- If `automatic_expiry_period` is `60` minutes and `manual_expiry_period` is `120` minutes, payments in the `authorized` state after `120` minutes are auto-refunded.
- If `automatic_expiry_period` is `0` minutes and `manual_expiry_period` is `120` minutes, payments in the `authorized` state after `120` minutes are auto-refunded.

### Related Information

- [Orders API](/razorpay-docs-md/api/orders.md)
- [How Payment Gateway Works](/razorpay-docs-md/payment-gateway/how-it-works.md)
- [Payment States](/razorpay-docs-md/payments.md#payment-life-cycle)
- [Refunds](/razorpay-docs-md/refunds.md)
- [Manually capture payments using Capture API](/razorpay-docs-md/api/payments.md#capture-a-payment)
- [Manually capture payments from the Dashboard](/razorpay-docs-md/payments/dashboard.md#manually-capture-payments)
- [Set up and subscribe to Webhook events](/docs/webhooks/setup-edit-payments/)
