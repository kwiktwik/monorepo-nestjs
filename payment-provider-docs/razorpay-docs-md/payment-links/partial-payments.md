<!-- Source: https://razorpay.com/docs/payments/payment-links/partial-payments -->

You can configure the Standard Payment Links to receive partial payments from your customer for a particular order.

## When to Use Partial Payments

The **Partial Payment** feature comes in handy while dealing with large transactions, where the customer finds paying the total amount in parts more convenient than paying the entire amount upfront.

**Handy Tips**

This feature is not available for UPI Payment Links.

#### Example

A tourism company, Acme Corp. offers expensive travel packages. As per the company's payment terms, a fixed booking amount should be collected from the customer before making any tour reservations.

With the **Partial Payments** feature, Acme Corp. issues a Payment Link using which the customer pays the booking amount for an order. The customer can make multiple payments for the remaining balance amount for the same order using the same Payment Link.

## How Partial Payments Work

Here is how Partial Payments work:

![partial payment workflow](https://razorpay.com/docs/payments/payment-links/build/browser/assets/images/payment-links-partial-payments.jpg)

1. You create a Payment Link of ₹2,000.
2. The customer chooses to pay an amount of ₹1,000 out of the due amount mentioned in the Payment Link.
3. Since the customer pays less than the due amount, the Payment Link would show `partially_paid` status until the amount due is zero or until the link gets `expired` or `canceled`.
4. After the full amount has been paid, the status of the Payment Link changes to `paid`.

Just like any other payment, each partial payment would have a unique `payment_id`, but will be tied to the same `order_id`, thereby allowing customers to easily make multiple payments for the same order using the same **Payment Link**. This makes it easier to track the status of a particular order. Know more about [Payment Links States](/razorpay-docs-md/payment-links/states.md).

## Enable Partial Payments From Dashboard

You can enable partial payments while creating the Payment Link. You can also edit an issued Payment Link to allow partial payments.

During Creation

Once Issued

Watch this video to see how to enable partial payments while creating the Payment Links.

To enable partial payments during Payment Link creation:

1. Log in to the Dashboard.
2. Navigate to **Payment Links**.
3. Click **+ Create Payment Link**.
4. Enter the necessary details such as **Amount** and **Payment For**.
5. Select the **Enable Partial Payments** option.
6. Click **Create Payment Link**.

### Enable Partial Payments Using API

Use the **`accept_partial`** parameter to enable partial payments for Payment Links using the [Create a Standard Payment Link API](/razorpay-docs-md/api/payments/payment-links/create-standard.md).

#### Related Information

- [How Payment Links Work](/razorpay-docs-md/payment-links/how-it-works.md)
- [Payment Links States](/razorpay-docs-md/payment-links/states.md)
- [Create a Payment Link](/razorpay-docs-md/payment-links/create.md)
- [FAQs](/razorpay-docs-md/payment-links/faqs.md)
- [Payment Links APIs](/razorpay-docs-md/payment-links/apis.md)
