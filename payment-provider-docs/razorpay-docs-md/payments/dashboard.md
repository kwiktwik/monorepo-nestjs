<!-- Source: https://razorpay.com/docs/payments/payments/dashboard -->

You can use the Dashboard to perform the following actions:

- [View Payment Details](/razorpay-docs-md/payments/dashboard.md#view-payment-details)
- [View Settlement Details of a Payment](/razorpay-docs-md/payments/dashboard.md#view-settlement-details-of-a-payment)
- [Manually Capture Payments](/razorpay-docs-md/payments/dashboard.md#manually-capture-payments)
- [Issue a Refund](/razorpay-docs-md/payments/dashboard.md#issue-a-refund)
- [Subscribe to Webhook Events](/razorpay-docs-md/payments/dashboard.md#subscribe-to-webhook-events)

## View Payment Details

Watch this video to see how to view the payment details.

To view the details of a payment made to your account:

1. Log in to your Dashboard.
2. Click **Transactions** → **Payments**.
3. Click a **Payment Id** to view details of the payment.

## View Settlement Details of a Payment

Watch this video to view the settlement details of a payment.

To view a detailed break-down of a settlement made to your account:

1. Log in to your Dashboard.
2. Navigate to **Transactions** → **Payments**.
3. Click on the specific **Payment Id** for which you want to view the settlement details.
4. In the **Payment Details** view, you can view the settlement details.
5. Click on the **settlement\_id** to view the detailed breakdown.

## Manually Capture Payments

Watch this video to capture payments manually.

To manually capture payments:

1. Log in to the Dashboard.
2. Navigate to **Transactions** → **Payments**.
3. Under the **Payments** tab, identify the authorized payment you want to capture.
4. Click the relevant **Payment Id**.
5. In the **Payment Details** pane, click **Capture Payment**.
6. A dialog box is displayed. Click **Yes, Capture**.

## Issue a Refund

You can issue refunds to your customers from the Dashboard. Know more about [issuing refunds](/razorpay-docs-md/refunds/issue.md).

## Subscribe to Webhook Events

You can subscribe to webhook events from the Dashboard. Know more about [Webhooks](/docs/webhooks/).

To subscribe to webhook events:

1. Log in to the Dashboard.
2. Navigate to **Accounts & Settings** → **Webhooks** to subscribe to events available for payments.

The table below lists the webhook events available for payments.

**Handy Tips**

- The payload for a Webhook is a snapshot of the entity when the event occurred.
  For example, when a customer makes a payment, its status changes to `authorized`. It can then immediately move to the `captured` state.
- The payment can be in the `captured` state when the `payment.authorized` Webhook is fired. However, the payload for the `payment.authorized` event contains details of the events when the payment was authorised, not when it was captured.
- In case of network tokenised cards, the last 4 digits will be of the tokenised card and not the actual card.
- The field `flow` is present only in the case of Turbo UPI Payments.

Know more about [webhooks](/docs/webhooks/) and check the [sample payloads](/docs/webhooks/payments/).

### Related Information

- [About Payments](/razorpay-docs-md/payments.md)
- [Payment APIs](/razorpay-docs-md/payments/apis.md)
