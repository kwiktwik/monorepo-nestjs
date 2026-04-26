<!-- Source: https://razorpay.com/docs/payments/third-party-validation/s2s-integration/methods-api -->

You can configure payment methods of your choice for collecting payments from your customers.

## Fetch Payment Methods

To fetch a list of payment methods enabled for your account, send the following request:

GET

/methods

CurlJavaPythonGoPHPRubyNode.js.NETResponse

copy

```bash
curl -u <YOUR_KEY_ID> \
-X GET https://api.razorpay.com/v1/methods \
```

### Next Steps

Now that you know the available payment methods, you can start creating payment requests using the [sample payloads](/razorpay-docs-md/payment-gateway/s2s-integration/payment-methods.md) for the payment methods of your choice.

To get additional payment methods enabled for your account, contact our [Support team](https://razorpay.com/support/#request).
