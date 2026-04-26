<!-- Source: https://razorpay.com/docs/payments/payment-gateway/flutter-integration/standard/payment-methods/api -->

Documented below is the API package for the plugin.

## Razorpay Class

### Method

open(map<String, dynamic> options)

Opens the checkout.

on(String eventName, Function listener)

Registers event listeners for payment events.

- `eventName`: The name of the event.
- `listener`: The function to be called. The listener should accept a single argument of the following type:
  - [PaymentSuccessResponse](/razorpay-docs-md/payment-gateway/flutter-integration/standard/payment-methods/api.md#paymentsuccessresponse)

    for EVENT\_PAYMENT\_SUCCESS.
  - [PaymentFailureResponse](/razorpay-docs-md/payment-gateway/flutter-integration/standard/payment-methods/api.md#paymentfailureresponse)

    for EVENT\_PAYMENT\_FAILURE.
  - [ExternalWalletResponse](/razorpay-docs-md/payment-gateway/flutter-integration/standard/payment-methods/api.md#externalwalletresponse)

    for EVENT\_EXTERNAL\_WALLET.

clear()

Clears all listeners.

**Handy Tips**

The `options` map has `key` as a required property in the open checkout method. All other properties are optional. Know about all the [options available on checkout form](/razorpay-docs-md/payment-gateway/flutter-integration/standard/integration-steps.md#17-add-checkout-options).

### Event Names

The event names have been exposed as `strings` by the `Razorpay` class.

#### PaymentSuccessResponse

#### PaymentFailureResponse

#### ExternalWalletResponse

## Error Codes

The error codes are exposed as integers by the `Razorpay` class. The error code is available as the code field of the `PaymentFailureResponse` instance passed to the callback.
