<!-- Source: https://razorpay.com/docs/payments/subscriptions/manually-charge-card -->

If one or more auto-charge attempts fail, you will receive a webhook notification. Know more about [webhooks](/docs/webhooks/subscriptions/). In such scenarios, you can manually charge the card linked to the Subscription from the Dashboard. Until a successful charge is made, the invoice will be in the `issued` state.

**Watch Out!**

Manual charging of a domestic card is not supported.

## Manually Charge a Card From Dashboard

To manually charge a card:

1. Log in to the Dashboard and click **Subscriptions** under **PAYMENT PRODUCTS** in the left menu.
2. Click the **Subscription Id** in the `pending` state that is to be charged.
3. Click the invoice in the `issued` state and click **Attempt Charge**. Alternatively, you can click **Attempt Charge** against the invoice in the `issued` state on the details panel.

### Related Information

- [Create and View Plans](/razorpay-docs-md/subscriptions/create-plans.md)
- [Create Subscriptions via Links](/razorpay-docs-md/subscriptions/create-subscription-links.md)
- [Update a Subscription](/razorpay-docs-md/subscriptions/update.md)
- [Subscriptions Settings](/razorpay-docs-md/subscriptions/settings.md)
