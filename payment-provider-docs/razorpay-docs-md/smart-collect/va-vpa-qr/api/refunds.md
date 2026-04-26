<!-- Source: https://razorpay.com/docs/payments/smart-collect/va-vpa-qr/api/refunds -->

You can process refunds for a payment made towards a Customer Identifier. The following endpoint refunds a payment using the payment ID.

POST

/payments/:id/refund

## Path Parameter

id

mandatory

`string` The unique identifier of the payment to be refunded.

## Request Parameters

amount

optional

`string` Amount to be refunded. If no value is passed, a full refund is issued.

notes

optional

`json object` Array of notes fields. You can enter custom data in key-value pairs. Refer the [Notes section of the API Reference](/razorpay-docs-md/api/understand.md#notes) documentation to learn more.

## Response Parameters

id

`string` The unique identifier of the refund.

amount

`integer` The amount that is refunded to the customer.

currency

`string` The currency in which the payment is made. We support [international currencies](/razorpay-docs-md/international-payments.md#supported-currencies).

payment\_id

`string` The unique identifier of the payment.

notes

`json object` Array of notes fields. You can enter custom data in key-value pairs.

created\_at

`integer` UNIX Timestamp that indicates when the refund was processed.

Refer [Refunds API](/razorpay-docs-md/api/refunds.md) to perform other refund-related operations:

- Fetch a particular refund or a list of refunds for a payment ID.
- Update a refund to modify the Notes field.
