<!-- Source: https://razorpay.com/docs/payments/dynamic-convenience-fees -->

Razorpay charges a platform fee for every payment (from you). You can choose to charge this as a convenience fee to your customers for the use of technology. You can charge this fee dynamically to the customer; instead of a standard amount, you can split the charges dynamically for every payment.

For example, the business can create a configuration wherein, if the total platform fee is ₹12, then the business will pay ₹6, and the customer will pay ₹6.

Alternatively, the business can create a configuration wherein the customer will bear 20% of the total platform fee, and the business will bear the rest.

You can perform this configuration at the method level.

The modified convenience fee will be visible on the Razorpay Checkout and displayed to the customer ensuring complete transparency and no experience breakage.

![Dynamic Convenience Fees](https://razorpay.com/docs/payments/build/browser/assets/images/payments-dynamic-convenience-fees-v2.jpg)

**Handy Tips**

- This feature is currently supported for specific business cases only. You can contact our [Support team](https://razorpay.com/support)

  to get this feature activated on your account.
- In case of a refund, the customer is refunded the Convenience fee along with the payment amount.
- **INR** is the only supported currency. This feature is not available for international payments.
- This feature is **not available** for:
  - Smart Collect (via VA, VPA and QR Codes)
  - Route
  - Subscriptions (via Emandate, Paper NACH)

## Use Cases

Given below are the various use cases for dynamic convenience fees:

- An insurance company wants to waive off the transaction fee on customers when they pay within the **Premium Amount Due** period. However, once the period expires, the insurance company wants to pass on the transaction fee to the customers.
- A business wants to pass on the transaction fee (flat/percentage) to its customers based on the payment method and amount. The business wants to keep the flexibility of a flat/percentage-based model.
  - In this use case, the business also wants to display a message on checkout to the customer informing them of the charges applicable to the payment method.
  - For example, an additional convenience fee of INR xx.xx will be charged for this credit card payment towards the charges levied by your credit card issuing bank. To make the payment without any additional charges, please use UPI, netbanking or any debit card.

## Prerequisites

- [Create a Razorpay account](https://dashboard.razorpay.com/signup)

  .
- Contact [Razorpay support](https://razorpay.com/support/#request)

  to enable this feature for your account.
- Generate [API Keys](/razorpay-docs-md/api/authentication.md#generate-api-keys)

  on the Dashboard.

## Workflow

To charge dynamic convenience fees:

1. Create an order in your server using the [Orders API](/razorpay-docs-md/dynamic-convenience-fees/api.md#orders-api)

   and pass the convenience fee details.
2. Pass order\_id to [Standard checkout](/razorpay-docs-md/payment-gateway/web-integration/standard/integration-steps.md#12-integrate-with-checkout-on-client-side)   .
3. [Store fields](/razorpay-docs-md/payment-gateway/web-integration/standard/integration-steps.md#14-store-fields-in-your-server)

   in server.
4. [Verify payment signature](/razorpay-docs-md/payment-gateway/web-integration/standard/integration-steps.md#15-verify-payment-signature)

   .

## Communication

You should inform the customers about the convenience fees, as we do not notify the customer of the convenience fees except at checkout. The convenience fees are added to the total amount in the Razorpay Payment Acknowledgement email on successful payment.

**Watch Out!**

The email does not contain the payment breakup to indicate the convenience fees separately but is added to the total amount.

### Related Information

- [Dynamic Convenience Fees APIs](/razorpay-docs-md/dynamic-convenience-fees/api.md)
- [Dynamic Convenience Fees FAQs](/razorpay-docs-md/dynamic-convenience-fees/faqs.md)
