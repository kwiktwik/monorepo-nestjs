<!-- Source: https://razorpay.com/docs/api/payments/recurring-payments/custom/webhooks -->

Webhooks (Web Callback, HTTP Push API or Reverse API) automatically notify your application when specific events occur. Instead of continuously polling APIs to check for updates, webhooks push notifications directly to your server when events happen.

## Webhooks vs APIs

Here is how webhooks compare to traditional API polling:

## How Razorpay Webhooks Work

When you subscribe to webhook events, Razorpay sends an HTTP POST request with JSON payload to your configured endpoint URL whenever those events are triggered.

Suppose you have subscribed to the `order.paid` webhook event, you will receive a notification every time a user pays you for an order, in the configured endpoint URL.

### Use Cases

There can be multiple uses for webhook events. Two of these are listed below.

Capturing Late Authorised Payments

Capturing payments for which you did not receive a response on the client-side is perhaps the most important use case for the `payment.authorized` event.

Sometimes, the communication between the bank and Razorpay or between you and Razorpay may not occur. This could be because of a slow network connection or your customer closing the window while processing the payment. This could lead to a payment being marked as **Failed** on the Dashboard but changed to **Authorized** at a later time. Know more about [late authorisation of payments](/razorpay-docs-md/payments/late-authorisation.md).

You can use webhooks to get notified about payments that get authorised and analyse this data to decide whether to capture the payment or not.

Notifications on Failed Payments

When a payment attempted by your customer fails, we receive the failed payment status from the bank. This payment gets recorded in our system as **Failed**.

Suppose you have enabled the `payment.failed` webhook, you will receive a notification from us about the failed payment. You can then further analyse this payment and notify your customer about the failure.

### Setup and Configuration

- You can set up webhooks from your Dashboard and configure separate URLs for **Live** mode and **Test** mode. Know more about setting up [Payment webhooks](/docs/webhooks/setup-edit-payments/)

  and [Payout webhooks](/docs/webhooks/setup-edit-payouts/)  .
- A **Test** mode webhook receives events for your test transactions. Know more about [testing webhooks](/docs/webhooks/validate-test/)  .
- Webhook URLs must use ports **80** or **443** only.
- Ensure Razorpay webhook IPs are whitelisted on your server. Even if your server accepts all incoming requests, webhooks may still be blocked by cloud security groups or network configurations. Refer to [Razorpay IPs and Certificates](/docs/security/whitelists/#webhook-ips)

  for the complete list of webhook IP addresses.

**Implementation Considerations**

Webhooks are the primary and most efficient method for event notifications. They are delivered asynchronously in near real-time. For critical user-facing flows that need instant confirmation (like showing "Payment Successful" immediately), supplement webhooks with API verification.

**Recommended approach**

- Rely on webhooks for all automation, which can be asynchronous.
- If a critical user-facing flow requires instant status, but the webhook notification has not arrived within the time mandated by your business needs, perform an immediate API Fetch call ( [Payments](/razorpay-docs-md/api/payments/fetch-with-id.md)  , [Orders](/razorpay-docs-md/api/orders/fetch-with-id.md)

  and [Refunds](/razorpay-docs-md/api/refunds/fetch-specific-refund-payment.md)

  ) to verify the status.

## Idempotency

There could be scenarios where your endpoint might receive the same webhook event multiple times. This is an expected behaviour based on the webhook design.

To handle duplicate webhook events:

1. You can identify the duplicate webhooks using the `x-razorpay-event-id` header. The value for this header is unique per event.
2. Check the value of `x-razorpay-event-id` in the webhook request header.
3. Verify if an event with the same header is processed at your end.

## Deactivation

All webhook responses must return a status code in the range `2XX` within a window of 5 seconds. If we receive response codes other than this or the request times out, it is considered a failure.

On failure, a webhook is re-tried at progressive intervals of time, defined in the exponential back-off policy, for 24 hours. If the failures continue for 24 hours, the webhook is disabled. You need to enable the webhook from the Dashboard after fixing the errors at your end. Know more about [enabling Webhooks](/docs/webhooks/setup-edit-payments/#enabledisable-a-webhook).

**Handy Tips**

When a webhook gets disabled, you receive an email notification on the email id you configured while setting up the webhooks.

## Setup Webhooks

Watch this video to see how to set up a webhook.

To set up webhooks:

1. Log in to the Dashboard and navigate to **Accounts & Settings**.
2. Click **Webhooks** under **Website and app settings**.
3. Click the **+ Add New Webhook** button.

   ![Add a new webhooks button on the Dashboard](https://razorpay.com/docs/api/payments/recurring-payments/custom/build/browser/assets/images/webhooks-webhook-creation-1.jpg)
4. In the **Webhook Setup** pop-up page:

   - Enter the **URL** where you want to receive the webhook payload when an event is triggered. We recommend using an HTTPS URL.

     **Handy Tips**

     - You can set up to **30 URLs** to receive Webhook notifications. Webhooks can only be delivered to public URLs.
     - If your URL contains `razorpay` as a domain, you will not be able to add the URL and will receive an error.
     - If you attempt to save a localhost endpoint as part of a webhook setup, you will notice an error. Know more about [testing Webhooks on an application running on localhost](/docs/webhooks/validate-test/#application-running-on-localhost)       .
   - Enter a **Secret** for the webhook endpoint. The secret is used to validate that the webhook is from Razorpay. Do not expose the secret publicly. Know more about [how to validate webhooks](/docs/webhooks/validate-test/)     .

     **Handy Tips**

     - When setting up the webhook, specify a secret. Use this secret to validate that the webhook is from Razorpay. Entering the secret is optional but recommended. The secret should never be exposed publicly.
     - The webhook secret does not need to be the Razorpay API key secret.
   - In the **Alert Email** field, enter the email address to which the notifications should be sent in case of webhook failure. You will receive webhook related notifications like failures, deactivation and so on.
   - Select the required events from the list of **Active Events**.

   ![List of active webhook events on Razorpay Dashboard](https://razorpay.com/docs/api/payments/recurring-payments/custom/build/browser/assets/images/webhooks-webhook-creation-2.jpg)
5. Click **Create Webhook**. After you set up a webhook, it appears on the list of webhooks.

   ![List of webhooks on Razorpay Dashboard](https://razorpay.com/docs/api/payments/recurring-payments/custom/build/browser/assets/images/webhooks-webhooks-list.jpg)
6. You can select the webhook and click **Edit** to make more changes.

## Validation

When your webhook `secret` is set, Razorpay uses it to create a hash signature with each payload. This hash signature is passed with each request under the `X-Razorpay-Signature` header that you need to validate at your end. We provide support for validating the signature in all of our [language SDKs](/razorpay-docs-md/server-integration.md).

If you have changed your webhook secret, remember to use the old secret for webhook signature validation while retrying older requests. Using the new secret will lead to a signature mismatch.

X-Razorpay-Signature

The hash signature is calculated using HMAC with SHA256 algorithm; with your webhook secret set as the key and the webhook request body as the message.

You can also validate the webhook signature yourself using a [HMAC](https://en.wikipedia.org/wiki/Hash-based_message_authentication_code) as shown below:

**Do Not Parse or Cast the Webhook Request Body**

While generating the signature at your end, ensure that the webhook body passed as an argument is the **raw webhook request body**. **Do not parse or cast the webhook request body**.

## Check Payment Status using Webhooks

You can use these webhooks to check the status of the authorisation payment and subsequent payments.

### Payment Authorized

Indicates that the payment has been authorized. A payment is authorized when the customer’s payment details are successfully authenticated by the bank.

**Watch Out!**

For Emandate, the 'acquirer\_data' is populated as an empty object in the webhook.

### Payment Captured

Indicates that the payment has been captured.

**Watch Out!**

For Emandate, the 'acquirer\_data' is populated as an empty object in the webhook.

### Order Paid

Indicates that the payment has been captured.

**Watch Out!**

- For Emandate, the 'acquirer\_data' is populated as an empty object in the webhook.
- The `invoice_id` parameter is populated with the unique identifier value (for example, `inv_FHf8iwg1ZaNMNh`) for Emandate, Card and Paper NACH methods only. For UPI, the value of the `invoice_id` parameter value is `null`.

### Payment Failed

Indicates that the payment has failed. If the payment fails, you need to create an authorisation transaction again.

**Watch Out!**

For Emandate, the 'acquirer\_data' is populated as an empty object in the webhook.

## Check Token Status using Webhooks

You can use the below webhooks to check the status of the token.

### Token Confirmed

Indicates that the bank has completed the mandate registration. Once confirmed, you can create subsequent payments as per your business needs.

Available for tokens authorized using the following methods:

- Emandate
- Card
- Paper NACH
- UPI

### Token Rejected

Triggered during the token creation/registration process, when the token creation process fails without completion.

This webhook is available for tokens authorized using the following methods:

- Emandate
- Card
- Paper NACH
- UPI

### Token Cancelled

Triggered when a token is explicitly cancelled or deactivated. Usually happens after a successful token creation.

### Token Paused

Indicates the token has been paused by your customer.

Available only for tokens authorized via UPI.

### Token Resumed

Indicates the token has been unpaused by your customer.

Available only for tokens authorized via UPI.

## Check Registration Link Status using Webhooks

You can use these webhooks to check the status of the registration link.

### Invoice Paid

Indicates that a registration link has been successfully paid.

**Watch Out!**

For Emandate, the 'acquirer\_data' is populated as an empty object in the webhook.

### Invoice Expired

Indicates that a registration link has expired.
