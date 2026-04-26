<!-- Source: https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/configure-payment-methods/display-configuration -->

The `display` configuration can be passed in the Checkout options.

You can use the `display` configuration to put together all the modules, that is, `blocks`, `sequence`, `preferences`, and `hide` instruments as shown below:

display configurationJavaScript Checkout options

copy

```javascript
let config = {
  display: {
    blocks: {
      code: {
        name: "The name of the block", // The title of the block
        instruments: [instrument, instrument] // The list of instruments
      },

      anotherCode: {
        name: "Another block",
        instruments: [instrument]
      }
    },

    hide: [
      {
        method: "method"
      }
    ],

    sequence: ["block.code"], // The sequence in which blocks and methods should be shown

    preferences: {
      show_default_blocks: true // Should Checkout show its default blocks?
    }
  }
};
```

## Checkout options

Descriptions for the checkout options parameters are present in the [Checkout Options](/razorpay-docs-md/payment-gateway/web-integration/standard/integration-steps.md#123-checkout-options) table.

## Orders API Sample Code

Given below is the sample code:

CurlJavaPythonGoPHPRubyNode.js.NETResponse

copy

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET]
-X POST https://api.razorpay.com/v1/orders
-H "content-type: application/json"
-d '{
  "amount": 50000,
  "currency": "",
  "receipt": "receipt#1",
  "checkout_config_id": "config_Ep0eOCwdSfgkco"
}'
```

Know more about [Orders API](/razorpay-docs-md/api/orders.md).

#### Request Parameters

Descriptions for the request parameters are present in the [Create an Order Request Parameters](/razorpay-docs-md/api/orders/create.md) table.

#### Response Parameters

Descriptions for the response parameters are present in the [Orders Entity](/razorpay-docs-md/api/orders/entity.md) parameters table.

### Related Information

- [Supported Methods](/razorpay-docs-md/payment-gateway/web-integration/standard/configure-payment-methods/supported-methods.md)
- [Sample Codes](/razorpay-docs-md/payment-gateway/web-integration/standard/configure-payment-methods/sample-code.md)
