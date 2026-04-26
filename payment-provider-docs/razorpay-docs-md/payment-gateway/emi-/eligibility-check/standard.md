<!-- Source: https://razorpay.com/docs/payments/payment-gateway/emi²/eligibility-check/standard -->

Razorpay offers a pre-eligibility check on Debit Card EMI, Cardless EMI, and Pay Later instruments. By assessing eligibility upfront, your customers can effortlessly choose the most relevant emi² option and complete the purchase quickly.

**Handy Tips**

- This feature is available by default.
- The eligibility check is performed only for [Debit Card EMI](/razorpay-docs-md/payment-methods/emi/debit-card-emi.md)  , [Cardless EMI](/razorpay-docs-md/payment-methods/emi/credit-card-emi.md)  , and [Pay Later](/razorpay-docs-md/payment-methods/pay-later.md)  .
- Eligibility check is not applicable for Credit Card EMI as it is a pre-eligible form of credit.

## Advantages

- **Higher Success Rate**
  Increase the success rate of transactions with EMI² instruments by displaying only eligible payment options, thereby reducing failed transactions due to ineligibility.
- **Enhance Customer Experience**: Deliver a seamless customer experience through an intuitive UI that enables customers to discover and choose the most relevant affordable options.

## How it Works

A customer selects the products on your website or app and proceeds to Checkout. After choosing EMI or Pay Later as the payment method, the customer can differentiate between the eligible and ineligible payment options. They can opt for an eligible payment option to complete the payment.

![View eligible payment options](https://razorpay.com/docs/payments/payment-gateway/emi²/eligibility-check/build/browser/assets/images/eligible-payment-options.jpg)

- **Eligible**: The customer selects an eligible payment instrument and completes the payment successfully.
- **Ineligible**: The customer can view the reason for ineligibility as highlighted below.

  ![Highlight ineligible payment instruments](https://razorpay.com/docs/payments/payment-gateway/emi²/eligibility-check/build/browser/assets/images/ineligibility-highlight.jpg)

  To proceed with the payment in case of ineligibility, the customer can choose to:

  - Use a different mobile number for the chosen payment method and try again.
  - Opt for a different payment instrument/method.

  ![Demo for ineligible flow](https://razorpay.com/docs/payments/payment-gateway/emi²/eligibility-check/build/browser/assets/images/emi-ineligibility.gif)

## Reasons for Ineligibility

The table below provides a list of reasons for customer ineligibility with payment methods/instruments and their descriptions:

## List of Payment Methods

View the list of payment methods/instruments and providers on which eligibility check is performed:

Debit Card EMI

Cardless EMI

Pay Later

HDFC Bank

### Related Information

- [FAQs](/razorpay-docs-md/payment-gateway/emi-/faqs.md#eligibility-check)
- [EMI² Suite](/razorpay-docs-md/payment-gateway/emi-.md)
