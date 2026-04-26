<!-- Source: https://razorpay.com/docs/payments/payment-methods/cards/dynamic-currency-conversion/custom-integration -->

Razorpay Dynamic Currency Conversion (DCC) feature is available on Custom Checkout. It allows the cardholders a choice to pay in their native currency or any other currency. The customers can view the exact amount that will be charged to them before making the transaction.

The feature is available by default for all the Custom Checkout integrations.

**Watch Out!**

Dynamic Currency Conversion (DCC) is not available for [Razorpay Optimizer](/razorpay-docs-md/optimizer.md).

## Video Tutorial

Watch this video to integrate Custom Checkout using the Dynamic Currency Conversion feature. [

Dynamic Currency Conversion on Custom Checkout Integration

](/razorpay-docs-md/payment-methods/cards/dynamic-currency-conversion/build/browser/assets/images/dcc_custom_checkout.md)

## DCC Custom Checkout Payment Flow

1. The cardholder selects the payment method on the custom checkout page and tries to make the payment.
2. If the card is a non-INR card, the user is directed to the Dynamic Currency Conversion screen to change the currency.
3. The users also get the option to change the currency as per their choice. Based on the selected currency, the amount is displayed. The user can check the amount in the selected currency and proceed to make the payment.

**Handy Tips**

DCC Custom Checkout payment flow is similar to the [S2S payment flow](/razorpay-docs-md/payment-methods/cards/dynamic-currency-conversion/s2s-integration.md).

### Related Information

- [DCC S2S Payment Flow](/razorpay-docs-md/payment-methods/cards/dynamic-currency-conversion/s2s-integration.md)
- [International Payment Support](/razorpay-docs-md/international-payments.md)
