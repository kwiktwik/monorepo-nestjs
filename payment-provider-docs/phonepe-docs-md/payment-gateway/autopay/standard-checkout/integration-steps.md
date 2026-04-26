<!-- Source: https://developer.phonepe.com/payment-gateway/autopay/standard-checkout/integration-steps -->

# Autopay Integration

---

Hereâs how the integration process with PhonePe Payment Gateway works.
Follow the steps outlined below to set up and verify your payment flow with ease.

![](/static/af67f5cb773b150b51d8faa11741b066/58f13/Subscription-Setup.png)![](/static/af67f5cb773b150b51d8faa11741b066/58f13/Subscription-Setup.png)

![](/static/af67f5cb773b150b51d8faa11741b066/58f13/Subscription-Setup.png)![](/static/af67f5cb773b150b51d8faa11741b066/58f13/Subscription-Setup.png)

## 1. Generate an authorization token to authenticate your system

Authentication is the first step in PhonePe Payment Gatewayâs Standard Autopay API integration. It involves generating an authorization token to make further API calls.Â

Creating an **authorization token** to make API calls means generating a unique key or password that proves your system has permission to interact with PhonePe Payment Gateway. This token identifies and authenticates your website when it requests services like processing payments, checking status, etc.

For complete details, refer to the [Generate Authorization Token](/phonepe-docs-md/payment-gateway/autopay/standard-checkout/authorization.md).

## 2. Subscription Setup

In this step, you will simultaneously create a user subscription and set up its payment mandate. The integration flow differs based on your platform:

- **Web Applications:** Use the [Checkout API](/phonepe-docs-md/payment-gateway/autopay/standard-checkout/setup-subscription/api-integration.md) to create the subscription and initiate the mandate setup directly within the web interface.
- **Mobile Applications:** Use the [Order Token API](/phonepe-docs-md/payment-gateway/autopay/standard-checkout/setup-subscription/sdk-integration.md) to generate a unique `orderToken`. Pass this token to the Mobile SDK to allow the user to authorize the mandate via their preferred UPI app.

Once the user completes the mandate through mandate supported apps( PhonePe, BHIM, GPay, Paytm, CRED, Amazon Pay, SuperMoney), use [Subscription Order Status](/phonepe-docs-md/payment-gateway/autopay/standard-checkout/order-status.md) API to check the status of a Subscription Setup after initiating it.
To check the status of the Subscription, use the [Subscription Status](/phonepe-docs-md/payment-gateway/autopay/standard-checkout/subscription-status.md) API to retrieve the current Subscription Status.

## 3. Notify Redemption

In this step, You must notify users 24 hours before a scheduled debit. This is a mandatory requirement for all active subscriptions to ensure transparency before funds are deducted. This API call is a prerequisite; you cannot execute a subscription redemption without first completing this step.

For complete details, refer to the [Notify Redemption](/phonepe-docs-md/payment-gateway/autopay/api-integration/api-reference/redemption-notify.md).

After initiating a redemption request for an active subscription, use the [Redemption Order Status](/phonepe-docs-md/payment-gateway/autopay/standard-checkout/redemption-order-status.md) API to check the execution status and check whether the redemption has been notified, is in pending, or completed.

## 4. Execute Redemption

The Redemption Execute API is to directly debit the required payment from a userâs bank account, thereby initiating and completing the actual financial transaction. This API should be called from the backend only if the auto-debit is set to false.

For complete details, refer to the [Execute Redemption](/phonepe-docs-md/payment-gateway/autopay/api-integration/api-reference/redemption-execute.md).

After executing the redemption for an active subscription, use the [Redemption Order Status](/phonepe-docs-md/payment-gateway/autopay/standard-checkout/redemption-order-status.md) API to check the execution status and check whether the redemption is successful, is in pending, or failed.

## 5. Verifying Payment Response

In a subscription system, itâs important to know whether a payment was successful, failed, or still pending.

PhonePe supports this with automated callbacks for two key events:

- [Subscription Callbacks](/phonepe-docs-md/payment-gateway/autopay/standard-checkout/webhook-handling.md#nav-1-subscription-callback)
  Sent when a new subscription is created. These confirm if the userâs first payment was successful or not, helping you handle activation or failure from the start.
- [Redemption Callbacks](/phonepe-docs-md/payment-gateway/autopay/standard-checkout/webhook-handling.md#nav-2-redemption-callback)
  Sent for ongoing auto debits. These share the status of each recurring payment and provide individual transaction details, which are useful for retries and reconciliation.

## Other features:

- [Cancel Subscription](/phonepe-docs-md/payment-gateway/autopay/api-integration/api-reference/subscription-cancel.md): Use the Cancel Subscription API to deactivate an active autopay subscription that is no longer required.
- [Pause or Unpause Subscription](/phonepe-docs-md/payment-gateway/autopay/api-integration/api-reference/subscription-pause-unpause.md): PhonePe will send anÂ Webhook callbackÂ to notify you that the subscription has been Paused/Unpaused from the userâs end.
- [Revoke Subscription](/phonepe-docs-md/payment-gateway/autopay/api-integration/api-reference/subscription-revoke.md): PhonePe will send anÂ Webhook callbackÂ to notify you that the subscription has been cancelled from the userâs end.
- [Initiate Refund](/phonepe-docs-md/payment-gateway/autopay/api-integration/api-reference/refund.md) and [Check Refund Status](/phonepe-docs-md/payment-gateway/autopay/api-integration/api-reference/refund.md#nav-check-refund-status): TheÂ Refund APIÂ allows you to initiate refunds for specific transactions, returning funds to customers for reasons like order cancellations, returns, or payment adjustments. You can also check the status of the initiated refund.

## Whatâs Next?

Now that you are aware of what Autopay is, letâs explore how to integrate the Autopay feature.
