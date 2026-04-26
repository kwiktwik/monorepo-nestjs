<!-- Source: https://razorpay.com/docs/payments/subscriptions/offers/link -->

After creating an Offer and a Subscription Plan, you need to link the Offer to a Subscription.

- [Link an Offer while creating a Subscription](/razorpay-docs-md/subscriptions/offers/link.md#link-an-offer-when-creating-a-subscription)
- [Link an Offer to an active Subscription](/razorpay-docs-md/subscriptions/offers/link.md#link-an-offer-to-an-existing-subscription)

You can also [delete an Offer linked to a Subscription](/razorpay-docs-md/subscriptions/offers/delete.md).

## Link an Offer While Creating a Subscription

Watch this video to see how to link an Offer to a Subscription.

You can link an Offer while creating a Subscription from the [Dashboard](/razorpay-docs-md/subscriptions/offers/link.md#link-an-offer-while-creating-a-subscription-from) or using [APIs](/razorpay-docs-md/subscriptions/offers/link.md#link-an-offer-while-creating-a-subscription-using).

**Watch Out!**

Offers for Subscriptions are only available when using Razorpay Standard Checkout.

### Link an Offer While Creating a Subscription From Dashboard

You can link an Offer to a Subscription by selecting the required Offer using the **Offer** drop-down list when creating the Subscription.

![link offer when creating a subscription](https://razorpay.com/docs/payments/subscriptions/offers/build/browser/assets/images/subscriptions-offers-link_offer_when_creating_subscription.jpg)

Know more about [Subscription Links](/razorpay-docs-md/subscriptions/create-subscription-links.md).

### Link an Offer While Creating a Subscription Using APIs

Use the [Link an Offer to a Subscription API](/razorpay-docs-md/api/payments/subscriptions.md#link-an-offer-to-a-subscription).

## Link an Offer to an Existing Subscription

You can link an Offer to a Subscription or update the Offer linked to a Subscription from the [Dashboard](/razorpay-docs-md/subscriptions/offers/link.md#link-an-offer-to-an-existing-subscription-from) or using [API](/razorpay-docs-md/subscriptions/offers/link.md#link-an-offer-to-an-existing-subscription-using).

- This is possible only if the Subscription is in the `active` state and not in any other state.
- The Offer is applied to the Subscription at the end of the current billing cycle. It is not possible to update an Offer linked to a Subscription immediately.

### Link an Offer to an Existing Subscription From Dashboard

You can link an Offer to an existing active Subscription by selecting the required Offer using the **Offer** drop-down when updating the Subscription.

![link an offer to an existing active subscription](https://razorpay.com/docs/payments/subscriptions/offers/build/browser/assets/images/subscriptions-offers-link_offer_to_existing_subscription.jpg)

Know more about [updating a Subscription](/razorpay-docs-md/subscriptions/update.md).

### Link an Offer to an Existing Subscription Using APIs

Use the [Update a Subscription API](/razorpay-docs-md/api/payments/subscriptions.md#update-a-subscription) to link an Offer to an existing active Subscription by passing the `offer_id: <offer_id>` in the request body.

### Related Information

- [About Offers](/razorpay-docs-md/subscriptions/offers.md)
- [Create Subscription Offers](/razorpay-docs-md/subscriptions/offers/create.md)
- [Update an Offer Linked to a Subscription](/razorpay-docs-md/subscriptions/offers/update.md)
- [Delete an Offer Linked to a Subscription](/razorpay-docs-md/subscriptions/offers/delete.md)
