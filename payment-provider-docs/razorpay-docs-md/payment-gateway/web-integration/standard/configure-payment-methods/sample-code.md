<!-- Source: https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/configure-payment-methods/sample-code -->

If you want to list all the payment methods offered by `Axis` bank, allow card payments for `ICICI` bank only and hide `upi` payment method from the Checkout, you can do so as follows:

Mobile

Desktop

![payment gateway customised checkout on mobile](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/configure-payment-methods/build/browser/assets/images/payment-methods-customise-checkout-mweb.jpg)

Checkout Code

copy

```html
<html>
<button id="rzp-button1" class="btn btn-outline-dark btn-lg"><i class="fas fa-money-bill"></i> Own Checkout</button>
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
<script>
  var options = {
    "key": "[YOUR_KEY_ID]", // Enter the Key ID generated from the Dashboard
    "amount": "1000",
    "currency": "",
    "description": "Acme Corp",
    "image": "example.com/image/rzp.jpg",
    "prefill":
    {
      "email": "gaurav.kumar@example.com",
      "contact": +919876543210,
    },
    config: {
      display: {
        blocks: {
          utib: { //name for Axis block
            name: "Pay Using Axis Bank",
            instruments: [
              {
                method: "card",
                issuers: ["UTIB"]
              },
              {
                method: "netbanking",
                banks: ["UTIB"]
              },
            ]
          },
          other: { //  name for other block
            name: "Other Payment Methods",
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
        sequence: ["block.utib", "block.other"],
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

**Watch Out!**

You can use the payment methods enabled for your account on the Dashboard. Also, you can raise a request with our [Support Team](https://razorpay.com/support/)

   for additional payment methods or providers.

**UPI Collect Flow Deprecated**

According to NPCI guidelines, the UPI Collect flow is being deprecated effective 28 February 2026. Customers can no longer make payments or register UPI mandates by manually entering VPA/UPI id/mobile numbers.

**Exemptions:** UPI Collect will continue to be supported for:

- MCC 6012 & 6211 (IPO and secondary market transactions).
- iOS mobile app and mobile web transactions.
- UPI Mandates (execute/modify/revoke operations only)
- eRupi vouchers.
- PACB businesses (cross-border/international payments).

**Action Required:**

- If you are a new Razorpay user, use [UPI Intent](/razorpay-docs-md/payment-methods/upi/upi-intent.md)  .
- If you are an existing Razorpay user not covered by exemptions, you must migrate to UPI Intent or UPI QR code to continue accepting UPI payments. For detailed migration steps, refer to the [migration documentation](/docs/announcements/upi-collect-migration/standard-integration/)  .

## Show OlaMoney

Use the code given below to show OlaMoney on Checkout:

Ola Money

copy

```javascript
config: {
    display: {
      blocks: {
        banks: {
          name: 'Methods With Offers',
          instruments: [
            {
              method: 'wallet',
              wallets: ['olamoney']
            }]
        },
      },
      sequence: ['block.banks'],
      preferences: {
        show_default_blocks: true,
      },
    },
  },
};
```

Mobile

Desktop

![show ola money on checkout on mobile](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/configure-payment-methods/build/browser/assets/images/payment-methods-customise-olamoney-mweb.jpg)

## Show Most Used Methods

Use the code given below to show the most used methods:

Most Used Methods

copy

```javascript
config: {
    display: {
      blocks: {
        banks: {
          name: 'Most Used Methods',
          instruments: [
            {
              method: 'wallet',
              wallets: ['payzapp']
            },
            {
                method: 'upi'
            },
            ],
        },
      },
      sequence: ['block.banks'],
      preferences: {
        show_default_blocks: true,
      },
    },
  },
};
```

Mobile

Desktop

![show most used methods on mobile](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/configure-payment-methods/build/browser/assets/images/payment-methods-customise-sample-code-show-most-used.jpg)

## Show Instruments of a Certain Bank Only

Use the code given below to show the instruments of a certain bank only on Checkout:

Instruments of Axis Bank Only

copy

```javascript
config: {
    display: {
      blocks: {
        banks: {
          name: 'Pay Using Axis Bank',
          instruments: [
            {
              method: 'netbanking',
              banks: ['UTIB'],
            },
            {
              method: 'card',
              issuers: ['UTIB'],
            }
          ],
        },
      },
      sequence: ['block.banks'],
      preferences: {
        show_default_blocks: false,
      },
    },
  },
};
```

**Watch Out!**

This configuration is not applicable for [Recurring Payments](/razorpay-docs-md/recurring-payments.md).

Mobile

Desktop

![show instruments of a certain bank only on mobile](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/configure-payment-methods/build/browser/assets/images/payment-methods-customise-instruments-certain-bank.jpg)

## Highlight Instruments of a Certain Bank

Use the code given below to highlight the instruments of a certain bank only on Checkout:

Highlight Instruments of Axis Bank

copy

```javascript
config: {
    display: {
      blocks: {
        banks: {
          name: 'Pay Using Axis Bank',
          instruments: [
            {
              method: 'netbanking',
              banks: ['UTIB'],
            },
            {
              method: 'card',
              issuers: ['UTIB'],
            }
          ],
        },
      },
      sequence: ['block.banks'],
      preferences: {
        show_default_blocks: true,
      },
    },
  },
};
```

Mobile

Desktop

![highlight instruments of a certain bank on mobile](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/configure-payment-methods/build/browser/assets/images/payment-methods-customise-certain-bank.jpg)

## Reorder Payment Methods

Use the code given below to reorder payment methods on Checkout:

Reorder Payment Methods

copy

```javascript
config: {
    display: {
      blocks: {
        banks: {
          name: 'All Payment Options',
          instruments: [
            {
              method: 'upi'
            },
            {
              method: 'card'
            },
            {
                method: 'wallet'
            },
            {
                method: 'netbanking'
            }
          ],
        },
      },
      sequence: ['block.banks'],
      preferences: {
        show_default_blocks: false,
      },
    },
  },
};
```

![reorder payment methods](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/configure-payment-methods/build/browser/assets/images/payment-methods-reorder-customise.jpg)

## Remove a Method from Checkout

Use the code given below to remove a method from Checkout:

EMI Removed from Checkout

copy

```javascript
config: {
    display: {
      hide: [
        {
          method: 'emi'
        }
      ],
      preferences: {
        show_default_blocks: true,
      },
    },
  },
};
```

Mobile

Desktop

![remove a method from checkout on mobile](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/configure-payment-methods/build/browser/assets/images/payment-methods-customise-hide-payment-method.jpg)

## Show Only a Certain Payment Method on Checkout

Use the code given below to show only a certain payment method on Checkout:

### Card

Land on Card

copy

```javascript
config: {
  display: {
    blocks: {
      cards_only: {
        name: "Pay via Card",
        instruments: [
          {
            method: "card",
          },
        ],
      },
    },
    sequence: ["block.cards_only"],
    preferences: {
      show_default_blocks: false,
      },
    },
  },
};
```

![show only UPI on checkout](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/configure-payment-methods/build/browser/assets/images/payment-methods-customise-sample-code-land-on-card.jpg)

### UPI

Land on UPI

copy

```javascript
config: {
    display: {
      blocks: {
        banks: {
          name: 'Pay via UPI',
          instruments: [
            {
              method: 'upi'
            }
          ],
        },
      },
      sequence: ['block.banks'],
      preferences: {
        show_default_blocks: false,
      },
    },
  },
};
```

![show only UPI on checkout](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/configure-payment-methods/build/browser/assets/images/payment-methods-customise-sample-code-land-on-upi.jpg)

### EMI

Land on EMI

copy

```javascript
config: {
  display: {
    blocks: {
      banks: {
        name: "Pay Using HDFC Bank",
        instruments: [
          {
              method: "emi",
              issuers: ["HDFC"],
              types: ["debit"],
              iins: [438628]
          },
        ]
      },
    },
    sequence: ["block.banks"],
    preferences: {
      show_default_blocks: false 
    }
  }
}
```

![show only UPI on checkout](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/configure-payment-methods/build/browser/assets/images/payment-methods-customise-sample-code-land-on-emi.jpg)

### Related Information

- [Supported Methods](/razorpay-docs-md/payment-gateway/web-integration/standard/configure-payment-methods/supported-methods.md)
- [Configurability of Payment Methods](/razorpay-docs-md/payment-gateway/web-integration/standard/configure-payment-methods.md)
