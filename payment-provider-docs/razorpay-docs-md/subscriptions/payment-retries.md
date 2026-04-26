<!-- Source: https://razorpay.com/docs/payments/subscriptions/payment-retries -->

Recurring payments for a Subscription are auto-debited based on the scheduled day that you defined. However, these payments could fail.

## Reasons for Payment Failures

- The card has expired.
- The bank has blocked the card.
- The customer's account has insufficient balance.
- The customer has cancelled the mandate from their end.

## What Happens in Case of a Payment Failure

Here is the Subscription flow if a payment fails:

1. The Subscription will move to the `pending` state.
2. You are notified about it via our webhooks. We automatically retry the payment on the following day.
   - We automatically charge the last invoice if the customer changes the card when the Subscription is in the `pending` state.
   - If this charge is successful, the Subscription moves to the `active` state.
3. If the payment fails after all retries, the Subscription will move to the `halted` state.
   - If the customer successfully changes the card details when a Subscription is in the `halted` state, it moves to the `active` state. Invoices for such Subscriptions are still created. However, we will not charge these invoices. You will have to charge them manually.

**Handy Tips**

This process will not affect the charge cycle for the subsequent months.

### Notifications

- If you have enabled the `subscription.pending` and `subscription.halted` webhook, you receive notifications every time a Subscription moves to one of the above-mentioned states. You can then decide to hold off the delivery of the service as per your business model.
- We also send an email to the customer notifying them about the payment failure. This email contains a link that the customer can use to change the card details associated with the Subscription.

## Retry Model

Following is the retry model for Emandate, UPI and Cards:

Emandate

UPI

Cards

In failure scenarios, we attempt to retry only when we get the confirmation or rejection of the last payment, as it may take more than 24 hours.

Below is the retry model:

1. If the charge day (T) is a bank holiday, we will charge on T-1 days
2. If the charge day (T) and the previous day (T-1) are bank holidays, we will charge on T-3 days.

The customer can switch to a different payment method to continue with the payment process.

## Handle Failed Charge (Cards)

There are two ways to handle a failed charge:

- [Manually attempt to charge the same card](/razorpay-docs-md/subscriptions/payment-retries.md#manual-charge-on-same-card)
- [Change the card details associated with the Subscription](/razorpay-docs-md/subscriptions/payment-retries.md#change-card-linked-to-subscription)

### Manual Charge on Same Card

When an auto-charge fails, you can manually attempt to charge the invoice as long as the invoice is in the `issued` state.

**Watch Out!**

Manual charging of a domestic card is not supported.

**Example**
The customer's account might have an insufficient balance when you attempt to auto-charge. When they receive the payment failure email, they add money to their account and inform you about this. You can [attempt a manual charge on the invoice using the Dashboard](/razorpay-docs-md/subscriptions/manually-charge-card.md).

- If you have enabled the `subscription.pending` and `subscription.halted` webhook, you receive notifications every time a Subscription moves to one of the above-mentioned states. You can then decide to hold off the delivery of the service as per your business model.
- We also send an email to the customer notifying them about the payment failure. This email contains a link that the customer can use to change the card details associated with the Subscription.

### Change Card Linked to Subscription

1. When an auto-charge fails, we send the customer an email about the payment failure. This email has a link that the customer can use to change the card linked to the Subscription.
2. You can ask the customer to change the card linked to the Subscription.

Change Card Using Checkout

You can ask the customer to change the card details associated with the Subscription on your checkout using our APIs. Use the `subscription_card_change` parameter to control this feature:

- 1 : Allow the customer to change the card details from your checkout
- 0 : Do not allow the customer to change the card details from your checkout

**Handler Function vs Callback URL**

Update Payment Method on Our Hosted Page

You can use our ready-made hosted page solution to handle payment failures when you attempt an auto-charge. Here is how the hosted page handles payment failure:

1. The customer is notified via email about the payment failure.
2. The payment failure email contains a link that allows the customer to take further action on the failed payment.
3. Customers can either retry the payment on the same card or update the card details or change the payment method to UPI or Emandate (bank accounts) using the link. These actions are handled seamlessly by the hosted page.

The following table lists the supported payment method change.

- A sample hosted page is shown below:

  ![Sample hosted page for payment methods](https://razorpay.com/docs/payments/subscriptions/build/browser/assets/images/sub-update-payment-method.jpg)
- After the customer clicks the **Update Payment Method** button, the checkout page appears as shown. The customer can choose a card (of [supported banks](/razorpay-docs-md/subscriptions/supported-banks-apps.md)

  ), UPI or Emandate (of [supported banks](/razorpay-docs-md/subscriptions/supported-banks-apps.md#emandate)

  ) to make the payment. If the payment is successful, the Subscription moves back to the `actived` state.

  ![Checkout page to update payment method](https://razorpay.com/docs/payments/subscriptions/build/browser/assets/images/sub-select-payment-method.jpg)
- Use the Dashboard status filter to search for `halted` and `pending` Subscriptions. You can send the Subscription link to the respective customers to clear dues and make those Subscriptions active.

  ![Sub Subscription links for halted and pending subscriptions](https://razorpay.com/docs/payments/subscriptions/build/browser/assets/images/sub-subscription-link.jpg)

### Related Information

- [Subscription Workflow](/razorpay-docs-md/subscriptions/workflow.md)
- [Subscription States](/razorpay-docs-md/subscriptions/states.md)
- [Create Subscriptions](/razorpay-docs-md/subscriptions/create.md)
- [Test Subscriptions](/razorpay-docs-md/subscriptions/test.md)
- [Subscriptions APIs](/razorpay-docs-md/subscriptions/apis.md)
