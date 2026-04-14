<!-- Source: https://razorpay.com/docs/payments/optimizer/third-party-validation -->

Third-Party Validation (TPV) of bank accounts is a mandatory requirement for businesses in the BFSI (Banking, Financial Services and Insurance) sector dealing with Securities, Broking and Mutual Funds. As per Securities and Exchange Board of India (SEBI) guidelines, customers must only make transactions from those bank accounts provided when registering with your business.

You can use Optimizer and comply with the SEBI guidelines for online payment collections by offering TPV integrations with major bank gateways and payment aggregators at the Checkout. Customers can make payments using netbanking or UPI.

**Feature Request**

This is an on-demand feature. Please raise a request with our [Support team](https://razorpay.com/support/#request) to get this feature activated on your Razorpay account.

## Prerequisites

1. You need to have an [active Razorpay account](/razorpay-docs-md/set-up.md)

   with [Optimizer](/razorpay-docs-md/optimizer.md)

   enabled.
2. [Generate API keys](/razorpay-docs-md/api/authentication.md#generate-api-keys)

   required to authenticate API requests sent to Razorpay servers.
3. Follow [the integration steps](/razorpay-docs-md/third-party-validation.md#integration-flow)

   to let Razorpay map the customers' bank accounts to ensure the payment is processed only from their registered bank accounts.
4. Check the [best practices](/razorpay-docs-md/third-party-validation/best-practices.md)   .
5. Write to your Razorpay and external gateway Relationship Manager to enable **TPV feature flag** for the required payment methods.
6. Ensure you complete the prerequisites of the particular bank or payment gateway before adding it as a provider.

## Add a Bank or Payment Gateway as a Payment Provider

Given below is an example of how to add BillDesk with TPV support as a payment provider:

1. Log in to your Dashboard.
2. Go to the **PAYMENT PRODUCTS** section and click **Optimizer**.
3. In the top-right section, click **+ Add provider**.
4. Select **Billdesk** in the list of gateways available and click **Next**.

   ![Add Billdesk](https://razorpay.com/docs/payments/optimizer/build/browser/assets/images/add-billdesk2.jpg)
5. Enter the provider name and description and click **Next**.

   ![Add Billdesk Provider Name](https://razorpay.com/docs/payments/optimizer/build/browser/assets/images/billdesk-provider-name-description.jpg)
6. Enter your Client ID and Merchant ID.
7. Select the payment methods and TPV option you want to enable for Billdesk and click **Submit**.

   ![Add Security ID Billdesk](https://razorpay.com/docs/payments/optimizer/build/browser/assets/images/add-security-id2.jpg)

You have successfully added **Billdesk** as a payment provider and enabled TPV on Optimizer.

## Supported Bank Gateways, Payment Gateways and Payment Methods

List of banks and payment gateways supported on Optimizer TPV is given below:

Bank Gateways and Payment Methods

Payment Gateways and Payment Methods

### Related Information

- [Third Party Validation on Razorpay Standard Integration](/razorpay-docs-md/third-party-validation.md)
- [Best Practices](/razorpay-docs-md/third-party-validation/best-practices.md)
