<!-- Source: https://razorpay.com/docs/payments/payment-gateway/s2s-integration/payment-methods/methods-api -->

You can configure payment methods of your choice for collecting payments from your customers.

## Fetch Payment Methods

Send the following request to fetch a list of payment methods enabled for your account:

**Handy Tips**

Provide only the API Key ID to send this request. Do not provide the API key secret.

GET

/methods

RequestResponse

copy

```bash
curl -u [YOUR_KEY_ID] \
- X GET https://api.razorpay.com/v1/methods \
```

### Next Steps

You can start creating payment requests using the [sample payloads](/razorpay-docs-md/payment-gateway/s2s-integration/payment-methods.md) for the payment methods of your choice.

To get additional payment methods enabled for your account, contact our [Support team](https://razorpay.com/support/#request).
