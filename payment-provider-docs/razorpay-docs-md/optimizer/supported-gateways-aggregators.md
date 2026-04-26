<!-- Source: https://razorpay.com/docs/payments/optimizer/supported-gateways-aggregators -->

## Supported Aggregators

Given below is the list of payment aggregators supported on Optimizer.

## Supported Bank Gateways

Given below is the list of supported bank gateways on Optimizer.

## Supported Payment Methods

Given below are the supported payment methods and payment providers for [Cards](/razorpay-docs-md/optimizer/supported-gateways-aggregators.md#cards), [UPI](/razorpay-docs-md/optimizer/supported-gateways-aggregators.md#upi), [Netbanking](/razorpay-docs-md/optimizer/supported-gateways-aggregators.md#netbanking), [EMI](/razorpay-docs-md/optimizer/supported-gateways-aggregators.md#emi), [Cardless EMI](/razorpay-docs-md/optimizer/supported-gateways-aggregators.md#cardless-emis), [Meal Cards](/razorpay-docs-md/optimizer/supported-gateways-aggregators.md#meal-cards), [Wallets](/razorpay-docs-md/optimizer/supported-gateways-aggregators.md#wallets) and [Pay Later](/razorpay-docs-md/optimizer/supported-gateways-aggregators.md#pay-later).

**Handy Tips**

All Razorpay netbanking gateways are available upon request. Please contact [support](https://razorpay.com/support/#request) to activate them on your Razorpay account.

Cards

List of supported providers is given below:

UPI

List of supported providers is given below:

Netbanking

List of supported providers is given below:

EMI

Given below is the list of payment gateways that support EMI:

**Watch Out!**

Optimizer supports EMI options for both credit and debit cards.

PayU EMI

Follow the steps given below to enable PayU EMI on Optimizer:

1. Reach out to your Relationship Manager to get the `EMI flag` enabled on PayU's side.
2. Provided that PayU has a `Fetch EMI` API, use it to retrieve the EMI banks and plans supported by PayU and display them at your checkout.

The list of supported banks by PayU for its EMI transactions is given below:

Billdesk and Ingenico EMI

Follow the steps given below to enable Billdesk and Ingenico EMI on Optimizer:

1. Add EMI as a payment method on the Dashboard. Know more about [how to request for a payment method](/razorpay-docs-md/dashboard/account-settings/payment-methods.md#request-for-payment-methods)   .
2. Enable [Optimizer](/razorpay-docs-md/optimizer/get-started.md)

   for your account.
3. [Add Billdesk or Ingenico as a payment method](/razorpay-docs-md/optimizer/billdesk.md)

   .
4. Route transactions via Billdesk or Ingenico. Know [how to route transactions](/razorpay-docs-md/optimizer/create-custom-rule.md#steps)   .

Cardless EMI

List of supported cardless EMIs on Optimizer is given below:

Meal Cards

List of supported meal cards on Optimizer is given below:

Pay Later

List of supported aggregators for Pay Later on Optimizer is given below:

Wallets

Optimizer supports **wallets** for PayU, CCAvenue, Paytm and Razorpay.

PayU

List of supported wallets for PayU is given below:

CCAvenue

List of supported wallets for CCAvenue is given below:

Paytm

List of supported wallets for Paytm is given below:

Razorpay

List of supported wallets for Razorpay is given below:

## International Payments

When a Razorpay business registered in India accepts a payment from a customer using an international card or payment instrument, it is called an international payment.

**Watch Out!**

- International payments are supported only on Razorpay.
- Non-INR payments are not supported on other downstream gateways for international transactions.

Supported Cases

Given below are a few specific cases where we support international payments.

1. **Amex Payments** - Amex is considered a domestic payment instrument and is not classified as an international payment. Razorpay converts these payments to the base currency, INR.
2. **Non-INR Payment Using Indian Payment Card/Instrument** - Payments made in a non-INR currency using an Indian-issued payment card or instrument are considered domestic. Razorpay converts the amount to the base currency, INR.
3. **INR Payment Using International Card/Instrument** - Although the card or instrument is international, payments made in INR are treated as domestic since the money collection occurs in INR. These transactions can be passed to the downstream gateways.

Given below is the list of payment aggregators that support international payments on Optimizer.

### Related Information

- [Add Payment Providers](/razorpay-docs-md/optimizer/add-payment-providers.md)
- [SR Analytics Dashboard](/razorpay-docs-md/optimizer/success-rate.md)
- [Single Reconciliation View](/razorpay-docs-md/optimizer/reconciliation.md)
- [Roles and Permissions](/razorpay-docs-md/optimizer/roles-and-permissions.md)
- [Tokenisation for Optimizer](/razorpay-docs-md/optimizer/tokenisation.md)
- [FAQs](/razorpay-docs-md/optimizer/faqs.md)
