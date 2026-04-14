<!-- Source: https://razorpay.com/docs/payments/payment-methods/emi/cardless-emi/axio/checkout-configuration -->

After [axio payment method is enabled](/razorpay-docs-md/payment-methods/emi/cardless-emi.md), it appears as a Cardless EMI provider under EMI on Razorpay Standard Checkout. You can highlight **axio** on the Razorpay Checkout using a configuration and make it more prominent.

![Highlighted Axio on Checkout](https://razorpay.com/docs/payments/payment-methods/emi/cardless-emi/axio/build/browser/assets/images/cardless-emi-axio-axio-checkout.jpg)

Follow these steps to highlight axio on Razorpay Checkout:

1. [Configure payment methods](/razorpay-docs-md/payment-methods/emi/cardless-emi/axio/checkout-configuration.md#1-configure-payment-methods)

   .
2. [Build configuration](/razorpay-docs-md/payment-methods/emi/cardless-emi/axio/checkout-configuration.md#2-build-the-configuration)

   .

## 1. Configure Payment Methods

Based on how you want to control the payment methods at the Checkout, there are two different ways to pass the configuration to Checkout: **Options Parameter** and **Global Settings**.

Method 1: Options Parameter

Method 2: Global Settings

Pass the configuration to the `options` parameter of the Checkout code at run time. *Use it when you want to modify the order of the payment methods for a particular set of payments while rendering the Checkout.*

## 2. Build Configuration

Using the `display` config, you can put together all the modules, that is, `blocks`, `sequence`, `preferences`, `hide` instruments as shown below:

You can pass the `display` config in the Checkout options or the Orders API request using the `checkout_config_id` parameter.

display configJavaScript Checkout options

copy

```javascript
let config = {
    display: {
        blocks: {
            walnutBlock: {
                name: "Pay With Axio", // The title of the block
                instruments: [{
                    "method": "cardless_emi",
                    "providers": ["walnut369"]
                }] // The list of instruments
            },
        },
        sequence: ["block.walnutBlock"], // The sequence in which blocks and methods should be shown
        preferences: {
            show_default_blocks: true // Should Checkout show its default blocks?
        }
    }
};
```

Orders Sample RequestJavaPythonGoPHPRubyNode.js.NET

copy

```bash
//Contact our Support Team to get your `checkout_config_id` parameter.
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X POST https://api.razorpay.com/v1/orders \
-H "content-type: application/json" \
-d '{
  "amount": 50000,
  "currency": "INR",
  "receipt": "receipt#1",
  "checkout_config_id": "config_Ep0eOCwdSfgkco",
  "notes": {
    "reference_no": "IBFA10106201500002"
    }
}'
```

Know more about [Orders API](/razorpay-docs-md/api/orders.md).

## Sample Code

Given below is the sample code to highlight axio on Standard Checkout:

Highlight axio on Standard Checkout

copy

```html
<html>
        <button id="rzp-button1">Pay</button>
        <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
        <script>
        var options = {
            "key": " your key_id", // Enter the Key ID generated from the Dashboard
            "amount": "500000", // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
            "currency": "INR",
            "name": "Acme Corp",
            "description": "Test Transaction",
            "image": "https://example.com/your_logo",
        //  "order_id": "order_9A33XWu170gUtm", //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
            "handler": function (response){
                alert(response.razorpay_payment_id);
                alert(response.razorpay_order_id);
                alert(response.razorpay_signature)
            },
            "config": {
                "display": {
                    "blocks": {
                        "walnut": {
                            "name": 'Pay via axio',
                            "instruments": [
                                {
                            "method": 'cardless_emi',
                            "providers":['walnut369']
                        }
                    ],
                },
            },
        "sequence": ['block.walnut'],
        "preferences": {
            "show_default_blocks": false,
        },
        },
        },
            "prefill": {
                "name": "Gaurav Kumar",
                "email": "gaurav.kumar@example.com",
                "contact": "9000090000"
            },
            "notes": {
                "address": "Razorpay Corporate Office"
            },
            "theme": {
                "color": "#3399CC"
            }
        };
        var rzp1 = new Razorpay(options);
        rzp1.on('payment.failed', function (response){
                alert(response.error.code);
                alert(response.error.description);
                alert(response.error.source);
                alert(response.error.step);
                alert(response.error.reason);
                alert(response.error.metadata.order_id);
                alert(response.error.metadata.payment_id);
        });
        document.getElementById('rzp-button1').onclick = function(e){
            rzp1.open();
            e.preventDefault();
        }
        </script>
        </html>
```

### Related Information [Configure Payment Methods](/razorpay-docs-md/payment-gateway/web-integration/standard/configure-payment-methods.md) on Razorpay Checkout
