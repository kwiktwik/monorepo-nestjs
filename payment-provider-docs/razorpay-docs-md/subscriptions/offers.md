<!-- Source: https://razorpay.com/docs/payments/subscriptions/offers -->

You can use Subscription Offers to provide discounts or cashback on Subscriptions. This attracts more customers, retains existing customers and increases sales. You have complete control over the offers you provide to your customers, such as the payment methods on which the Offer should be applied, maximum number of customers who can avail the offers and define the time of offers.

## How it Works

You can create and apply offers for Subscriptions in 3 easy steps:

1. [Create an Offer from the Dashboard](/razorpay-docs-md/subscriptions/offers/create.md)

   .
2. [Create a Plan for the Subscription](/razorpay-docs-md/subscriptions/create-plans.md#create-a-plan)

   .
3. [Link the Offer to a Subscription](/razorpay-docs-md/subscriptions/offers/link.md)

   .

After you create a Subscription with an Offer, customers can select the offer when making the payment, and it is applied immediately.

![Offer preview on checkout](https://razorpay.com/docs/payments/subscriptions/build/browser/assets/images/subscriptions-offers-offers_preview_checkout.jpg)

## How are Discounts Calculated

There are 2 types of discount calculations:

- [Percentage Discount Calculations](/razorpay-docs-md/subscriptions/offers.md#percentage-discount-calculations)
- [Flat Discount Calculations](/razorpay-docs-md/subscriptions/offers.md#flat-discount-calculations)

### Percentage Discount Calculations

Let us say you sell keto meals.

- Plan amount = ₹1,000/month
- Quantity = 2 units
- Upfront amount (delivery fee) = ₹250/month
- Add-on (keto chips) = ₹250/month
- You offer a 10% discount up to ₹300.

copy

```
Total amount = (Plan amount x Quantity) + Upfront Amount
Total amount = (₹1,000 x 2) + ₹250
Total amount = 2,250
Discount amount = Total amount x Discount percentage
Discount amount = ₹2,250 x 10%
Discount amount = ₹225
```

### Flat Discount Calculations

Let us say you sell keto meals.

- Plan amount = ₹1,000/month
- Quantity = 2 units
- Upfront amount (delivery fee) = ₹250/month
- You offer a flat discount of ₹150.

copy

```
Total amount = (Plan amount x Quantity) + Upfront Amount
Total amount = (₹1,000 x 2) + ₹250 
Total amount = 2,250
Discount amount = ₹150
```

## Subscription Offers States

A Subscription Offer has 2 states:

- **Enabled**: The Offer is active and available to your customers.
- **Disabled**: The Offer is disabled and no longer available to your customers.

![offers life cycle](https://razorpay.com/docs/payments/subscriptions/build/browser/assets/images/subscriptions-offers-offers_life_cycle.jpg)

## Customise Subscription Offers

There are 3 main parameters that you can use to customise and control Offers: **Subscription Offer Type**, **Discount Type** and **Payment Method**. You can also use **Other Parameters** to configure attributes, such as the start and end dates and the number of times the Offer can be used.

Subscription Offer Types

Following are the 3 types of offers you can create for Subscriptions:

Discount Type

Following are the 2 types of discounts you can provide on Subscription Offers:

**Watch Out!**

Offers can only be applied if the chargeable amount after applying the Offer is greater than ₹1.

Payment Methods

Following are the 2 payment methods available for Offers on Subscriptions:

Other Parameters

Following are the other parameters available to you when creating an Offer:

### Related Information

- [Create Subscription Offers](/razorpay-docs-md/subscriptions/offers/create.md)
- [Link an Offer to a Subscription](/razorpay-docs-md/subscriptions/offers/link.md)
- [Update an Offer Linked to a Subscription](/razorpay-docs-md/subscriptions/offers/update.md)
- [Delete an Offer Linked to a Subscription](/razorpay-docs-md/subscriptions/offers/delete.md)
