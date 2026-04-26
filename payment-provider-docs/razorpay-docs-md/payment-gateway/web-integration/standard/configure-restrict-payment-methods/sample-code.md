<!-- Source: https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/configure-restrict-payment-methods/sample-code -->

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

![show ola money on checkout on mobile](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/configure-restrict-payment-methods/build/browser/assets/images/payment-methods-customise-olamoney-mweb.jpg)

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

![show most used methods on mobile](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/configure-restrict-payment-methods/build/browser/assets/images/payment-methods-customise-sample-code-show-most-used.jpg)

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

![show instruments of a certain bank only on mobile](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/configure-restrict-payment-methods/build/browser/assets/images/payment-methods-customise-instruments-certain-bank.jpg)

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

![highlight instruments of a certain bank on mobile](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/configure-restrict-payment-methods/build/browser/assets/images/payment-methods-customise-certain-bank.jpg)

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

![reorder payment methods](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/configure-restrict-payment-methods/build/browser/assets/images/payment-methods-reorder-customise.jpg)

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

![remove a method from checkout on mobile](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/configure-restrict-payment-methods/build/browser/assets/images/payment-methods-customise-hide-payment-method.jpg)

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

![show only UPI on checkout](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/configure-restrict-payment-methods/build/browser/assets/images/payment-methods-customise-sample-code-land-on-card.jpg)

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

![show only UPI on checkout](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/configure-restrict-payment-methods/build/browser/assets/images/payment-methods-customise-sample-code-land-on-upi.jpg)

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

![show only UPI on checkout](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/configure-restrict-payment-methods/build/browser/assets/images/payment-methods-customise-sample-code-land-on-emi.jpg)
