<!-- Source: https://razorpay.com/docs/payments/payment-gateway/web-integration/custom/features/cvv-less-flow -->

CVV-less card payments are recently introduced for saved cards where the card-holder can complete a payment without the card CVV. CVV-less card payments are simple, fast and secure, and do not require a memory test of your customers.

## Recommended Checkout Experience

To provide your customers with a faster and more seamless payment experience, we recommend removing the CVV field from your checkout flow.

- Removing the CVV field encourages customers to use their saved (tokenised) cards, making payments more convenient and frictionless.
- Alternatively, you can also make CVV optional. You can choose to retain the CVV box and mark it as optional, with a clear message such as “CVV not required for tokenised cards”.

**Note**

If you are already integrated with Razorpay Standard Checkout, these UI changes are handled automatically and no additional action is required on your part.

**Handy Tips**

Offering CVV-less saved card flows to your customers can increase the conversion rate by 4%.

![CVV Less Card Payment Flow GIF](https://razorpay.com/docs/payments/payment-gateway/web-integration/custom/features/build/browser/assets/images/cvv-less-otp-less.gif)

## Saved Card Payment without CVV

#### Request Parameters

card

optional

`string` The card’s CVV.

**Handy Tips**

CVV-less payments on RuPay is an on-demand feature for standard checkout merchants. Reach out to our [support team](https://razorpay.com/support/#request) for more information.

### Related information

- [FAQs](/razorpay-docs-md/payment-methods/cards/features/cvv-less-flow.md#frequently-asked-questions-faqs)
