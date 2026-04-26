<!-- Source: https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/configure-restrict-payment-methods -->

Razorpay Standard Checkout hosts a variety of payment methods for customers to make payments. The order of these payment methods on the Checkout used to be fixed and could not be interchanged. There can be situations where you want certain payment methods to be shown more prominently or rearrange the order in which the payment methods are displayed on the Checkout.

Now, you can configure the payment methods of your choice on the Checkout to provide a highly personalized experience for your customers. This simple and accessible experience for them will increase your sales and success rates.

## Use Cases

Razorpay allows you to configure the payment methods depending on your use case.

- Highlighting certain payment instruments on the Checkout.
  For example **Google Pay** could be displayed outside the UPI block as a separate payment method. **HDFC Netbanking** could come out of the Netbanking container as a separate payment method. Similarly, **OlaMoney** can be pulled out of the wallet block.
- Restricting the kind of network, issuer, BIN and card type, different properties of the card, to accept payments.
  For example, you can choose to accept payments only from **HDFC Visa Debit cards** on the Checkout.
- Removing a certain payment method or instrument.
  For example, **OlaMoney** can be removed as a payment method from wallets. The entire **Netbanking** block or a certain bank in Netbanking can be removed from the Checkout.
- Reordering of payment methods on the Checkout.
  You can choose to have **UPI** as the first section instead of **Cards** on the Checkout. Within the UPI block, you can again order the PSPs, according to your need.
- Grouping of payment instruments.
  For example, you can choose to group **Netbanking** and **UPI** payment methods of a bank as a block that will be labelled as **Pay via Bank** on the Checkout.

## Examples

## Configuring Payment Methods

Depending on how you want to control the payment methods on the Checkout, there are different ways in which the configuration can be passed to the Checkout:

- Pass the configuration in the `options` parameter of the Checkout code at the run time.
   This is useful when you want to modify the order of the payment methods for a particular set of payments while rendering the Checkout. See the [sample code](/razorpay-docs-md/payment-gateway/web-integration/standard/configure-restrict-payment-methods.md#sample-code)

  for details.
- Create a global setting of the payments as a **Configuration ID** and pass these values while creating the Order.
  This is useful when you want to fix the order of the payment methods on all the Checkout renderences.

  **Note:**

  Contact our [Support Team](https://razorpay.com/support/#raise-a-request)

  for more details about the Configuration ID.

## Understanding the Configuration

Let us understand the building blocks that are required to build a configuration of your choice:

1. [Payment Methods](/razorpay-docs-md/payment-gateway/web-integration/standard/configure-restrict-payment-methods.md#payment-methods)
2. [Payment Instruments](/razorpay-docs-md/payment-gateway/web-integration/standard/configure-restrict-payment-methods.md#payment-instruments)
3. [Blocks](/razorpay-docs-md/payment-gateway/web-integration/standard/configure-restrict-payment-methods.md#blocks)
4. [Sequence](/razorpay-docs-md/payment-gateway/web-integration/standard/configure-restrict-payment-methods.md#sequence)
5. [Preferences](/razorpay-docs-md/payment-gateway/web-integration/standard/configure-restrict-payment-methods.md#preferences)

### Payment Methods

Before deciding the payment methods or payment instruments that you want to configure on the Checkout, refer to the [payment methods](/razorpay-docs-md/payment-methods.md) supported by Razorpay.

### Payment Instruments

A payment instrument is a combination of the payment method and its associated properties. For example, a payment instrument can be an **AXIS Debit card**, where **card** is the payment method and the issuer (AXIS bank) is the associated **instrument**.

An instrument is a JSON object with a key named `method`. Each method and its associated properties are described in the sections below:

#### Card

Payment instruments for the `method: card` are listed below:

JavaScript

copy

```javascript
// beginning of the code
....
card: { \\name for cards
    name: "Pay Via Cards"
    instruments: [
      {
        method: "card",
        issuers: ["UTIB"],
        networks: ["MasterCard"],
        types: ["debit","credit"]
      }
    ]
},
...
//rest of the code
```

#### Netbanking

Payment instruments for the `method: netbanking` are listed below:

#### Wallet

Payment instruments for the `method: wallet` are listed below:

#### UPI

Payment instruments for the `method: upi` are listed below:

#### Cardless EMI

Payment instruments for the `method: cardless_emi` are listed below:

#### PayLater

For the method: `paylater`, the payment instruments are listed below:

#### Apps

For the method `app`, the payment instrument is listed below:

JavaScript

copy

```javascript
// beginning of the code
....
{
  "custom": {
    "name": "Pay with Apps",
    "instruments": [
      {
        "method": "app",
        "providers": [
          "cred"
        ]
      }
    ]
  }
}
...
//rest of the code
```

### Blocks

A block is a collection of one or more payment instruments. Each block has a `name` and `code` associated as shown below:

JavaScript

copy

```javascript
// Block creation
let myPayments = {
  name: "My Custom Block",
  instruments: ["gpay"]
};
// Usage in config
let config = {
  display: {
    block: {
      highlighted: myPayments
    }
  }
};
```

Here, `highlighted` is the code associated with `myPayments`. Multiple blocks can be added to the config at the same time.

### Sequence

You can specify the `sequence`, that is the order, in which the payment methods should be displayed on the Checkout.

A sequence is an `array` of strings, where each string is the name of the payment method or a `block`.

In a sequence, you can include any block using the `block.${code}` format. The block with code **highlighted** should be represented as `block.highlighted` as shown below:

JavaScript

copy

```javascript
let sequence = ["block.highlighted", "upi", "netbanking"];
```

The above sequence will place the code `highlighted` first followed by the payment methods `upi` and `netbanking` in that particular order.

**Important**

Every block defined has to be present in the sequence. If you do not wish to reorder the methods and want to place your block, the sequence should contain `block.highlighted` with just one item in it.

## Preferences

Using the `preferences` object, you can enhance the configuration of the Checkout. By setting this value, you can decide whether the default list of payment methods should be displayed or not.

Possible values are:

true

Checkout will display the sequence of the payment methods configured by you alongside the default order of payment methods available in the Checkout.

false

Checkout will only show the sequence of the payment methods configured by you.

### Hide Payment Instruments

You can also hide or remove certain instruments from the Checkout.

This is an `array` containing the `method` key used to hide either the payment method and/or the payment instrument associated with that payment method. For example, you can hide the methods, `card` and `HDFC netbanking` on the Checkout.

JavaScript

copy

```javascript
let cardInstrument = {
  method: "card"
};

let instrumentOfSomeBank = {
  method: "netbanking",
  banks: ["HDFC"]
};

let hiddenInstruments = [cardInstrument, instrumentOfSomeBank];
```

**Note**

Hiding any instrument using `hide` does not affect the similar instrument defined in `blocks`. So, if you want to hide `HDFC` bank from `netbanking` and have defined the same instrument in one of your blocks, HDFC bank will still be displayed in that block.

![Certain bank](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/build/browser/assets/images/payment-methods-customise-certain-bank.jpg)

## Building the Configuration

This section contains details about the `display` configuration and the `restrictions` configuration.

### Display Configuration

Using the `display` config, you can put together all the modules, that is, `blocks`, `sequence`, `preferences`, `hide` instruments as shown below:

The `display` config can be passed in the Checkout options or in the [Orders API](/razorpay-docs-md/api/orders.md) request using the `checkout_config_id` parameter.

**Handy Tips**

Contact our [Support Team](https://razorpay.com/support/#raise-a-request) to get your `checkout_config_id` parameter.

Orders Sample Requestdisplay configJavaScript Checkout options

copy

```bash
curl -u <YOUR_KEY_ID>:<YOUR_SECRET> \
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

### Restrictions Configuration

Using the `display` config, you can reorder, highlight or hide instruments and methods, and display the modules on the Checkout, whereas using the `restrictions` config you can accept payments using only certain instruments.

For example, if you want to accept payments only from specific cards such as Rupay or Diners Card/only HDFC or Axis Bank Cards/Cards of a particular BIN.

To restrict the payments, it is recommended to use `restrictions` config.

@include feature-request

The `restrictions` config must be sent in Orders API request as shown below: [Learn more about Orders API](/razorpay-docs-md/api/orders.md).

#### Sample Code

Let us assume you want to list all the payment methods offered by `HDFC` bank, allow card payments for `ICICI` bank only and hide `upi` payment method from the Checkout. You can do so using the code given below:

![custom checkout](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/build/browser/assets/images/payment-methods-customize-custom-checkout.jpg)

Checkout Code

copy

```html
<html>
<button id="rzp-button1" class="btn btn-outline-dark btn-lg"><i class="fas fa-money-bill"></i> Own Checkout</button>
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
<script>
  var options = {
    "key": "<YOUR_KEY_ID>", // Enter the Key ID generated from the Dashboard
    "amount": "1000",
    "currency": "INR",
    "description": "Acme Corp",
    "image": "http://example.com/image/rzp.jpg",
    "prefill":
    {
      "email": "gaurav.kumar@example.com",
      "contact": +919900000000,
    },
    config: {
      display: {
        blocks: {
          hdfc: { //name for HDFC block
            name: "Pay using HDFC Bank",
            instruments: [
              {
                method: "card",
                issuers: ["HDFC"]
              },
              {
                method: "netbanking",
                banks: ["HDFC"]
              },
            ]
          },
          other: { //  name for other block
            name: "Other Payment modes",
            instruments: [
              {
                method: "card",
                issuers: ["ICIC"]
              },
              {
                method: 'netbanking',
              }
            ]
          }
        },
        hide: [
          {
          method: "upi"
          }
        ],
        sequence: ["block.hdfc", "block.other"],
        preferences: {
          show_default_blocks: false // Should Checkout show its default blocks?
        }
      }
    },
    "handler": function (response) {
      alert(response.razorpay_payment_id);
    },
    "modal": {
      "ondismiss": function () {
        if (confirm("Are you sure, you want to close the form?")) {
          txt = "You pressed OK!";
          console.log("Checkout form closed by the user");
        } else {
          txt = "You pressed Cancel!";
          console.log("Complete the Payment")
        }
      }
    }
  };
  var rzp1 = new Razorpay(options);
  document.getElementById('rzp-button1').onclick = function (e) {
    rzp1.open();
    e.preventDefault();
  }
</script>
</html>
```

## Reference

All the supported payment methods and instruments are listed below:

## Supported Cards

Any card issued by the following banks:

### Supported Card Types

- `credit` for credit cards
- `debit` for debit cards

### Supported Card Networks

## Supported Banks

## Supported Wallets

## Supported UPI Apps

### Supported UPI flows

Given below are the supported UPI flows:

- `collect` for flow via VPA
- `intent` for flow via UPI apps

  **Handy Tips**

  The supported UPI apps for intent on android mobile web are **Google Pay** and **PhonePe**.
- `qr` for flow via UPI QR

## Supported PayLater Providers

**Handy Tips**

- PayPal now supports the Pay Later feature. You should enable both [PayPal](/razorpay-docs-md/payment-methods/wallets/paypal.md#to-enable-paypal)

  and the Pay Later options under Account & Settings → Pay Later (under Payment methods) on the Dashboard to enable the Pay Later feature.

## Supported Cardless EMI Providers

**Handy Tips**

Know the standard interest rates charged by:

- [Banks/Partners](/razorpay-docs-md/payment-methods/emi/faqs.md#1-what-are-the-standard-interest-rates-charged)
- [Pay Later Providers](/razorpay-docs-md/payment-methods/emi/faqs.md#2-what-are-the-standard-interest-rates-charged)

## Supported Apps
