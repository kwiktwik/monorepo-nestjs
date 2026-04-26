<!-- Source: https://developer.phonepe.com/payment-gateway/uat-testing-go-live/uat-checklist -->

# Merchant Integration Checklist

## UAT Sign-Off Process

Once your integration is completed, you must share your UAT instance for end-to-end flow verification.

- Any issues identified during the UAT stage must be resolved and reverified by your integration point of contact (POC) in the same UAT environment.
- The UAT sign-off will be provided only after all required use cases are successfully handled.
- Once sign-off is granted, you must acknowledge it to proceed further and receive Production Credentials.

## API-Wise Checklist

This checklist helps ensure that you have addressed all the necessary use cases during your integration phase, leading to a smoother UAT closure.

**â¹ï¸** **Must-Do!**

---

All use cases listed below are mandatory and must be implemented.

## 1. Authorization API

You must use the `expires_at` parameter in the response to manage your token lifecycle.

**Option 1: Validate Token Before Each Request**

- Before making any API request:
  - If the token is active: reuse it.
  - If expired: call the Authorization API to generate a new one and use it.

**Option 2: Scheduled Token Renewal**

- Set up a scheduler to regenerate the token **3â5 minutes before its actual expiry** using the Authorization API.

**â ï¸ **Avoid Unnecessary Token Calls!****

---

Do not call the Authorization API before every request without first checking the tokenâs expiry.

## 2. Payment API

#### Request Parameters

- `merchantOrderId`: Always pass a unique ID for each transaction.
- `expireAfter`: Defines order expiry in seconds. If not passed, default value will be used.Â
  - For Standard Checkout: Min = 300, Max = 3600 seconds.
- `amount`: Must be passed in Paise (â¹ Ã 100).
- `udf` in `metaInfo`: Use only if needed. Remove unused fields instead of leaving them empty.
- `paymentFlow.redirectUrl`: Provide your redirection URL where users should be returned after payment.
- `paymentFlow.type`: Set this to `PG_CHECKOUT`.

#### Response Fields

- `orderId`: PhonePe-generated Order ID. You should map this with your `merchantOrderId`.
- `redirectUrl`: PhonePe Checkout URL. You must use this **e**xactly as received, without modifications.

## 3. Order Status API

- Avoid strict deserialization of the response.
- Use the root-level `state` parameter to determine payment status:
  - COMPLETED **â** Payment Successful
  - FAILED **â** Payment failed
  - PENDING **â** Payment in progress

#### Handling PENDING Transactions

If the transaction status is **PENDING**, there are two handling options:

- **Option 1: Mark as Failed**
  - Show a Payment Failed page to the user.
  - Reconcile the transaction status on the server side until the terminal status (COMPLETED or FAILED) is reached.
  - If the final status is COMPLETED, then initiate a Refund. Note: For this use case, it is strongly recommended to integrate the Refund API.

- **Option 2: Mark as Pending**
  - Show a Payment Pending page to the user.
  - Reconcile the transaction status on the backend until the terminal status (COMPLETED or FAILED) is determined.
  - If the final status is COMPLETED, the order can be fulfilled accordingly.

#### Reconciliation Schedule (Mandatory)

When the transaction state is PENDING, you must call the Order Status API as per the below schedule:

- First status check: 20â25 seconds after transaction initiation.
- Then:
  - Every 3 seconds for the next 30 seconds
  - Every 6 seconds for the next 60 seconds
  - Every 10 seconds for the next 60 seconds
  - Every 30 seconds for the next 60 seconds
  - Every 1 minute until the terminal status is reached
    (Or until the `expireAfter` value passed in the request is reached)

## 4. Webhook Handling

- Avoid strict deserialization of the webhook payload.
- Rely only on the `payload.state` field for payment status.
- Ignore the `type` parameter (deprecated) and use the `event` field instead.
- `expireAt` and `timestamp` are epoch timestamps in milliseconds.

#### Webhook Validation (Mandatory)

- Once you receive a webhook, calculate the Authorization header value as `SHA256(username:password)` and compare it with the value sent in the headers.
- If they match: process the update.
- If not: discard the webhook and refer to the Order Status API for the latest update.

#### Webhook Setup

- **UAT**: Share your UAT webhook URL with the integration team to get it configured.
- **Production**: Configure your webhook directly via the PhonePe Business Dashboard.

## 5. Refund API

This section applies only if you initiate refunds via API (not through the dashboard).

#### Required Parameters

- `merchantRefundId`: Must be unique for every refund.
- `originalMerchantOrderId`: Pass the original order ID for which the refund is being issued.
- `amount`: Enter the refund amount in **Paise** (â¹ Ã 100).

After you initiate a refund, the status will start as `PENDING`. The updated status must be tracked via Webhook and Refund Status API â both are mandatory.

## 6. Refund Status API

- Avoid strict deserialization.
- Use the root-level `state` to track refund progress:
  - PENDING **â** Refund is being processed.
  - CONFIRMED **â** Still in progress, not yet final.
  - COMPLETED **â** Refund successfully completed.
  - FAILED **â** Refund failed â must be retried.

#### Handling Ongoing Refunds

- If you receive the `state` parameter as **PENDING** or **CONFIRMED** in the Refund API response, then the **Refund Status API** with the `merchantRefundId` should be called for this refund transaction until the final state **COMPLETED**/**FAILED** is reached.
- The **Scheduler/Cron Job** must be set as per your convenience to get the terminal state.
- Also, make sure **not to initiate another refund** for the same transaction while previous refund transaction is still in the **PENDING** or **CONFIRMED** state.
- If you receive the `state` parameter as **COMPLETED** in the Refund Order Status API response, then the refund has been processed successfully.
- If you receive the `state` parameter as **FAILED** in the Refund Order Status API response, then the refund transaction has failed and the refund has to be **reinitiated again** with a unique `merchantRefundId`.

## Whatâs Next?

You have now learned the mandatory steps and API handling required for a smooth integration and successful UAT completion. In the next section, we will guide you through the process of simulating complete payment flows to test your integration thoroughly. It uses templates that map APIs to predefined sample responses, allowing you to simulate various scenarios such as payment success, failure, and pending without making real transactions
