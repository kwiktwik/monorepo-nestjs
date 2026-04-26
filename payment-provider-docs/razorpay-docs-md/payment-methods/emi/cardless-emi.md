<!-- Source: https://razorpay.com/docs/payments/payment-methods/emi/cardless-emi -->

#### Cardless EMI Changelog

Discover new features, updates and deprecations related to Cardless EMI (since Jan 2024).

Offer Cardless EMI as a payment method to convert their payment amount to EMIs without a debit or credit card. Customers enjoy the benefits of the EMI as the payments are made using credits approved by the supported Cardless EMI Payment Partners.

**Watch Out!**

Instant Refunds are not supported on EMI, Cardless EMI and Pay Later.

**Feature Enablement**

Cardless EMI as a payment method is not enabled by default. Raise a request with our [Support Team](https://razorpay.com/support/#request) to enable this feature.

## Supported Payment Partners

Following is the list of supported Payment Partners for Cardless EMI and the minimum order amount stipulated by them:

Banks

Non-Banking Payment Partners

Optimizer Providers

**Handy Tips**

Check the standard [interest rates charged by Banks/Partners](/razorpay-docs-md/payment-methods/emi/faqs.md#1-what-are-the-standard-interest-rates-charged).

## Payment Flow

Given below is a diagram that explains the payment flow for Cardless EMI:

![payment flow for Cardless EMI](https://razorpay.com/docs/payments/payment-methods/emi/build/browser/assets/images/payment-flow-cardless_emi.jpg)

## Payment Flow on Standard Checkout

Customers select the products on your website or app and proceed to Checkout. On the Checkout page, the customers:

1. Enter their **Phone Number** and click **Continue**.
2. Select **EMI** as the payment method.

   ![Select emi payment option on checkout](https://razorpay.com/docs/payments/payment-methods/emi/build/browser/assets/images/emi-options-card.jpg)
3. Select **Cardless and Others**.

   ![Select Cardless and Others](https://razorpay.com/docs/payments/payment-methods/emi/build/browser/assets/images/emi-select-cardless.jpg)
4. Choose a payment instrument from the list and select the EMI tenure. Click **Continue**.

   ![EMI tenure and click Select Plan](https://razorpay.com/docs/payments/payment-methods/emi/build/browser/assets/images/emi-cardless-tenure.jpg)

After the successful payment, Razorpay redirects customers to your application or website. Customers' monthly statements will reflect the EMI amount with interest charged by the bank.

You will receive the entire payment amount from the Cardless EMI service provider. Based on the terms and conditions, the customer pays the total payment amount with additional interest (if any) as EMIs to the provider.

## Standard Checkout Integration

No additional integration is required to show Cardless EMI on your Standard Checkout page.

## FAQs

See: [Cardless EMI FAQs](/razorpay-docs-md/payment-methods/emi/faqs.md#cardless-emi).
