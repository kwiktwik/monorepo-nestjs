<!-- Source: https://razorpay.com/docs/payments/orders -->

Order is an important step of the payment life cycle at Razorpay. When a customer clicks the pay button on your website or app, an order is created with a unique identifier. This contains details such as the transaction amount and currency. The order id secures the payment request and one cannot tamper with the order amount. Pass this order id to the Razorpay Checkout.

You need to integrate your server with Orders API before proceeding with Razorpay Payment Gateway integration on your website or app.

### Advantages

- Single successful payment bound to an order. Prevents multiple payments.
- Quick and easy query in the database. Combines multiple payment attempts for a single order.

## Order States

Following are the various states of an order:

**Watch Out!**

If an order is in an `attempted` state with the associated payment id in the `authorised` state, initiating another payment using the same order id is not allowed.

## Order and Payment Flows

Following is a pictorial representation of how order and payment flows are closely related:

![Pictorial representation of Order and Payment Flow](https://razorpay.com/docs/payments/build/browser/assets/images/orders-payment-flow.jpg)

## Create Orders

You can [create an order using this API](/razorpay-docs-md/api/orders.md#create-an-order).

## Dashboard Actions

Perform the following actions using the Dashboard:

- [View orders](/razorpay-docs-md/orders/dashboard.md#view-order-details)
- [Subscribe to Webhook Events related to orders](/razorpay-docs-md/orders/dashboard.md#subscribe-to-webhook-events)
- [View reports related to orders](/razorpay-docs-md/orders/dashboard.md#reports)

### Related Information [Orders APIs](/razorpay-docs-md/orders/apis.md)
