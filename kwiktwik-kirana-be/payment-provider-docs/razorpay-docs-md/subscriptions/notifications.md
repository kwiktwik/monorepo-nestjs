<!-- Source: https://razorpay.com/docs/payments/subscriptions/notifications -->

There are three types of notifications for Subscriptions: Email, SMS and Webhook notifications.

## Email and SMS

Your customers will receive an email and SMS at various events such as:

- The start of the Subscription.
- When a payment is successfully charged.
- When a payment fails.
- Action required by the customer in the event of a payment failure
- When the card linked to a Subscription is changed or updated.
- When a Subscription is moved to the `halted` state post 3 retry attempts of payment failure.
- When a Subscription is cancelled.
- When the details of a Subscription (such as plan, quantity or billing frequency) are updated.

### Types of Emails and SMS

Razorpay sends emails and SMS to customers at 8 different stages during the life cycle of a Subscription.

## Webhooks

Know more about [how to set up and subscribe to Subscriptions webhooks](/razorpay-docs-md/subscriptions/subscribe-to-webhooks.md).

### Related Information

- [Subscription Workflow](/razorpay-docs-md/subscriptions/workflow.md)
- [Subscription States](/razorpay-docs-md/subscriptions/states.md)
- [Create Subscriptions](/razorpay-docs-md/subscriptions/create.md)
- [Test Subscriptions](/razorpay-docs-md/subscriptions/test.md)
- [Subscriptions APIs](/razorpay-docs-md/subscriptions/apis.md)
