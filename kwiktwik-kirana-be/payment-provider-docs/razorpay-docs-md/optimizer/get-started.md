<!-- Source: https://razorpay.com/docs/payments/optimizer/get-started -->

Check the prerequisites and the integration steps for Optimizer.

## Prerequisites

- [Create a Razorpay account](https://dashboard.razorpay.com/)

  .
- If you are an existing Razorpay user, please raise a request with our [support team](https://razorpay.com/support/#request)

  to get this feature activated on your Razorpay account.

## Integration Steps

To accept payments using Optimizer, follow the steps given below:

1. [Integrate with Razorpay Payment Gateway](/razorpay-docs-md/optimizer/get-started.md#step-1-integrate-with-razorpay-payment-gateway)

   .
2. [Add Payment Providers](/razorpay-docs-md/optimizer/get-started.md#step-2-add-payment-providers)

   .
3. [Configure Routing rules](/razorpay-docs-md/optimizer/get-started.md#step-3-configure-routing-rules)

   .

## Step 1: Integrate With Razorpay Payment Gateway

You can start accepting payments by integrating your website, app, or ecommerce store with the Razorpay Payment Gateway through any of the [integration methods available](/razorpay-docs-md/payment-gateway.md).

Payments API

Payments APIs are used to capture and fetch payments. The payment entity has one extra field with Optimizer to identify the payment provider through which the payment is processed.

Given below is the additional response parameter apart from the Payment Entity:

gateway\_provider

`string` The payment provider used to process the payment. Possible values:

- `payu`
- `cashfree`
- `paytm`
- `pinelabs`
- `ccavenue`
- `ingenico`
- `billdesk_optimizer`

Refer to [Payments Entity](/razorpay-docs-md/api/payments.md#payments-entity) for the rest of the parameters.

Webhooks

You can use Webhooks to configure and receive notifications when a specific event occurs. When an event is triggered, we send an HTTP POST payload in JSON to the webhook's configured URL. You can [set up Webhooks](/docs/webhooks/setup-edit-payments/) from the Dashboard.

Given below is the sample payload for webhook events for Optimizer. All the parameters and events will remain the same as shown in the [sample payloads for payment webhooks](/docs/webhooks/payments/) except for one additional parameter, `gateway_provider`.

## Step 2: Add Payment Providers

Watch this video to know how to add payment providers and configure rules using Optimizer.

The Razorpay Dashboard offers a self-serve flow to [add Payment Providers](/razorpay-docs-md/optimizer/add-payment-providers.md) by submitting your details. This process is secure, and the details you add are fully encrypted which is only visible on your Dashboard. Know more about [Razorpay Security](/docs/security/).

## Step 3: Configure Routing Rules

Create your rules on the Razorpay Dashboard to [dynamically route transactions](/razorpay-docs-md/optimizer/dynamic-routing.md) using different parameters like payment method, amount, issuer, and more. You can also add priorities in every rule to ensure transactions are routed to the best-performing gateway.

### Related Information

- [Add a Payment Provider](/razorpay-docs-md/optimizer/add-payment-providers.md)
- [Dynamic Routing](/razorpay-docs-md/optimizer/dynamic-routing.md)
- [Capture and Refund Settings](/razorpay-docs-md/optimizer/capture-refund-settings.md)
- [Supported Gateways and Aggregators](/razorpay-docs-md/optimizer/supported-gateways-aggregators.md)
- [SR Analytics Dashboard](/razorpay-docs-md/optimizer/success-rate.md)
- [Single Reconciliation View](/razorpay-docs-md/optimizer/reconciliation.md)
- [Roles and Permissions](/razorpay-docs-md/optimizer/roles-and-permissions.md)
- [Tokenisation for Optimizer](/razorpay-docs-md/optimizer/tokenisation.md)
