<!-- Source: https://razorpay.com/docs/payments/subscriptions/supported-payment-methods -->

Razorpay Subscriptions supports Cards, UPI Autopay and Emandate. The table below provides a summary of each payment method, the supported networks or banks, and the maximum subscription amount allowed.

## Payment Methods Overview

## Cards

Customers can authorise subscriptions using their card. They enter their card details to authorise the subscription, similar to a regular one-time online payment. The payment is then debited automatically based on the selected plan.

Standing Instructions (SI) on cards are supported on **Visa**, **Mastercard** and **RuPay** cards of all major banks. For the list of supported banks, see [Supported Banks — Cards](/razorpay-docs-md/subscriptions/supported-banks-apps.md#cards).

For maximum monetary limits for card mandates, see [Card mandate limits](/razorpay-docs-md/subscriptions/faqs.md#7-is-there-a-maximum-monetary-limit-for).

**Handy Tips**

For card-based subscriptions, customer card details must be tokenised as per applicable laws. Customer consent is explicitly taken for tokenising the card to process e-mandate/subscription transactions.

## UPI Autopay

With UPI Autopay, customers can pay for subscriptions using any UPI application. They must enter their UPI VPA and authorise the subscription first. Razorpay supports popular UPI apps including PhonePe, Google Pay, Paytm, BHIM and more.

For the complete list of supported UPI applications, handles and banks, see [Supported Banks and Apps — UPI Autopay](/razorpay-docs-md/subscriptions/supported-banks-apps.md#upi-autopay).

## Emandate (eNACH)

Emandate is a digital payment service that enables customers to set up recurring payments using their bank account. With Emandate, the customer provides standing instructions to their issuing bank, allowing them to debit the specified amount from their bank account automatically at fixed intervals.

Customers can authorise an Emandate subscription using one of the following methods:

- **Netbanking**: The customer logs in to their bank's netbanking portal to authorise the mandate.
- **Debit Card**: The customer enters their debit card details to authorise.
- **Aadhaar**: The customer uses Aadhaar-based authentication to authorise.

### Related Information

- [About Subscriptions](/razorpay-docs-md/subscriptions.md)
- [Subscription Workflow](/razorpay-docs-md/subscriptions/workflow.md)
- [Supported Banks and Apps](/razorpay-docs-md/subscriptions/supported-banks-apps.md)
- [Create Subscriptions](/razorpay-docs-md/subscriptions/create.md)
- [Test Subscriptions](/razorpay-docs-md/subscriptions/test.md)
- [Payment Retries](/razorpay-docs-md/subscriptions/payment-retries.md)
