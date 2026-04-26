<!-- Source: https://razorpay.com/docs/api/x -->

Post sign up, account activation and KYC verification you can start using APIs to make payouts. To make a payout, you must:

1. Create a Contact
2. Add a Fund Account for a contact.
3. Create a Payout.

**Watch Out!**

According to PCI regulations, payout processing is allowed on **TLS version 1.2** or higher.
RazorpayX will not acknowledge APIs if they are triggered without **TLS version 1.2** or higher.

Watch the below video to know how to create Payouts using our APIs.

**Handy Tips**

It is assumed that you have already added funds to your business account. This action **cannot** be performed via APIs and has to be done before you can make a payout. Refer to the business account section to know [how to add funds to your business account](/docs/x/account-types/#add-funds).

## Payout APIs

You can try the Payout APIs on the Razorpay Postman Public Workspace. [![Run in Postman](https://run.pstmn.io/button.svg)](https://www.postman.com/razorpaydev/workspace/razorpay-public-workspace/folder/12492020-fcd32a4a-0c53-41a7-a879-d771de7e2804)

Know more about [API parameters](/docs/x/apis/).

## Test Mode

RazorpayX test mode is a replication of RazorpayX in a sandbox environment. It allows you to test all aspects of your integration before you go live.

Actions taken in the test mode have no consequences in your live environment. Test mode has its own dummy balance. **No real money is used in the test mode**.

Contacts, fund accounts and payouts created in the test mode do not appear in the live environment. You can create contacts and fund accounts using real-world or dummy data.

For example, a contact created in the test mode does not carry over to the live mode and vice versa. Payouts made to a fund account in the test mode uses funds from the test account balance, which is not real money.

Know more about [Test Mode](/docs/x/dashboard/test-mode/).

## API Gateway URL

For most of the Razorpay APIs, the Gateway URL is `https://api.razorpay.com/v1`. You need to include this before each API endpoint to make API calls. However, certain APIs are on V2. Hence, the gateway URL may differ for certain APIs.

Example

- Use the URL `https://api.razorpay.com/v1/payments` to access payment resources.
- Use the URL `https://api.razorpay.com/v2/accounts` to access Route (Linked Account)-related resources.

## API Authentication

All our APIs are authenticated using Basic Auth. Basic auth requires the following:

- `[YOUR_KEY_ID]`
- `[YOUR_KEY_SECRET]`

### Generate API Key

**Handy Tips**

If you are an existing Razorpay merchant, you can use your existing API key with RazorpayX.

To generate your API Keys:

1. Log in to your [RazorpayX Dashboard](https://x.razorpay.com/)   .
2. Navigate to the user icon on the top-right of the screen, and to **My Account & Settings** → **Developer Controls**.
3. In the **API Keys** section, click **GENERATE KEY**, or **REGENERATE KEY** if you want to generate your API Keys again.
4. API Keys are generated for your business account. Click **Download Key Details** to download your API Keys for future reference.

Watch the short animation below for more information.

![](https://razorpay.com/docs/api/build/browser/assets/images/RZPX-RZPX-api-keys.gif)

**Watch Out!**

After generating the keys from the Dashboard, download and save them securely. Razorpay does not store `<YOUR_KEY_SECRET>`. This is visible only at the time of key generation.

If you have already generated your API Keys and do not remember it, you must regenerate the keys from the [RazorpayX Dashboard](https://x.razorpay.com/settings/developer-controls)

/ [Razorpay Dashboard](https://dashboard.razorpay.com/app/keys) and replace it in your integration code for RazorpayX and Razorpay Payment Gateway.

## Rate Limits

Razorpay employs a **request rate limiter** that limits the number of requests received by the API within a time window. This is to maintain system stability in the event of unintentional high traffic loads.

While integrating with APIs, watch for `HTTP status code 429` and build the retry mechanism based on the requirement.

To make the best use of the limits, it is recommended to use an Exponential backoff/stepped backoff strategy to reduce request volume and stay within the limit. It is also recommended to have some randomization within the backoff schedule to avoid the [thundering herd effect](https://en.wikipedia.org/wiki/Thundering_herd_problem).

## Webhooks [Set up Payout Webhooks](/docs/webhooks/setup-edit-payouts/) to configure and receive notifications when a [specific event occurs](/docs/webhooks/#available-events). When one of these events is triggered, we send an HTTP POST [payload](/docs/webhooks/) in JSON to the webhook's configured URL.

### Related Information

- [Set up your RazorpayX account](/docs/x/set-up/)
- [RazorpayX Account Types](/docs/x/account-types/)
- [Test Mode](/docs/x/dashboard/test-mode/)
