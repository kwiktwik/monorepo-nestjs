<!-- Source: https://razorpay.com/docs/payments/third-party-validation -->

#### Third-Party Validation Changelog

Discover new features, updates and deprecations related to Third Party Validation (since Jan 2024).

Third-Party Validation (TPV) of bank accounts is a mandatory requirement for businesses in the BFSI (Banking, Financial Services and Insurance) sector dealing with Securities, Broking and Mutual Funds. As per Securities and Exchange Board of India (SEBI) guidelines, transactions must be made by the investors **only** from those bank accounts provided when they registered with your business.

With Razorpay, you can comply with the SEBI guidelines for online payment collections by offering TPV integrations with [major banks](/razorpay-docs-md/third-party-validation/bank-list.md) at Checkout. Investors can make payments using netbanking, debit card or UPI. Know [how to integrate TPV on Razorpay Standard Integration](/razorpay-docs-md/third-party-validation/standard-integration.md).

**Feature Request**

This is an on-demand feature. Please raise a request with our [Support team](https://razorpay.com/support/#request) to get this feature activated on your Razorpay account.

How it Works

1. At the Checkout, investors complete the payment using the bank account details passed during the order creation.
2. The payment is marked as successful only when the bank account details entered in the order match those entered by the investor on the Checkout. If the investor tries to make a payment with an account other than the registered account, Razorpay fails the transaction.

![TPV Standard Checkout](https://razorpay.com/docs/payments/build/browser/assets/images/tpv-standard-checkout.jpg)

## Supported Products

TPV is supported on the following products:

- [Payment Links](/razorpay-docs-md/api/payments/payment-links/third-party-validation.md)
- [Payment Gateway](/razorpay-docs-md/payment-gateway.md)

## Supported Platforms

TPV is supported on the following platforms:

Standard Checkout

Custom Checkout

## Integration Flow

Know [how to integrate TPV on Razorpay Standard Integration](/razorpay-docs-md/third-party-validation/standard-integration.md).

### Related Information

- [Webhooks](/docs/webhooks/)

  (Recommended)
- [Error Codes](/docs/errors/)

  (Recommended)
- [How Payment Gateway Works](/razorpay-docs-md/payment-gateway/how-it-works.md)
- [Payment States](/razorpay-docs-md/payments.md)
- [Settlements](/razorpay-docs-md/settlements.md)
- [Refunds](/razorpay-docs-md/refunds.md)
