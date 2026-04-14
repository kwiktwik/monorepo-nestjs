<!-- Source: https://developer.phonepe.com/payment-gateway/website-integration/standard-checkout/api-integration/troubleshooting -->

# Common Issues & Fixes

---

## Troubleshooting 4xx Errors

#### ****ð**** **Issue:** **What causes a 404 (Not Found Error) or Key\_not\_configured error?**

The error is caused by using Salt\_Keys (V1 Credentials, which are deprecated now) for the current (V2)Integration flow. It can also occur if the client credentials are passed incorrectly in the Fetch Auth Token API.

**How do I resolve these errors?**

Ensure that you are using the correct Credentials(V2) which are present on the [PhonePe Dashboard](https://business.phonepe.com/login) under âDeveloper Settingsâ. Review your implementation of the Fetch Auth Token API to confirm that you are passing all required credentials correctly. Refer to the [API documentation](/phonepe-docs-md/payment-gateway/website-integration/standard-checkout/api-integration/api-reference/authorization.md) to verify the correct integration flow.

**NOTE:**
PG V2\_keys (client\_id, client\_secret & client\_version) on the developer settings indicates you are onboarded on a V2 flow, kindly refer to the [PhonePe Developer documents](/phonepe-docs-md/payment-gateway.md) and integrate accordingly.

#### ****ð**** **Issue:** **What causes 400 â Bad Request Error?Â**

This error is usually caused by problems with the request structure, such as incorrect headers, incorrect API endpoints, or an incorrect request body.

**How do I resolve 400 â Bad Request Error?**

Verify that all headers are correct with correct API endpoints being called. Also, confirm you are using the credentials for the correct environment. Check that your request body is correctly structured according to the [API documentation](/phonepe-docs-md/payment-gateway/website-integration/standard-checkout/api-integration/api-reference/authorization.md).

#### ****ð**** **Issue:** **â400 â API Mapping Not Foundâ Error**

The âAPI Mapping Not Foundâ error indicates a fundamental mismatch between the request your system is sending and the expectations of the PhonePe server. This is typically due to an incorrect API endpoint, wrong request body version, or missing account configuration.

**How do I resolve this error?**

**Step 1:** Verify API Version and Endpoint

The most common cause is calling an incorrect or outdated URL.

**Check API Endpoint:** Ensure you are using the correct API endpoint for the specific function (e.g., OAuth Token generation or Payment initiation) and the correct environment (Sandbox vs. Production).

**Step 2:** Validate Headers and Request Body

Incorrect headers or body structure will prevent the server from mapping your request to the correct function.

**Content-Type Header:** For OAuth Token generation, confirm you are passing:

Content-Type: application/x-www-form-urlencoded

**Authorization Header (Payment API):** For payment initiation, the authorization header must be in the specific format:

Authorization: O-Bearer <access-token> [ O-Bearer and space followed by access token]

Content-Type: application/json

**Step 3:** Confirm Credential Usage and Environment

Using the wrong keys for the environment or flow will result in authorization failure or an unmappable request.

#### ****ð**** **Issue:** **What causes 401 â Unauthorized Error?Â**

This error occurs when the **access token is invalid or expired**.

**How do I resolve 401 â Unauthorized Error?**

Ensure you are using a complete valid access token. We recommend generating a new access token at least 5 minutes before your current one is set to expire.. You must pass the access token in the Authorization header using the specific â**O-Bearer** âprefix format (e.g., Authorization: O-Bearer <access\_token>).

If the access token is correct & valid, still encountering 401 ??
â Â  Raise a support ticket to integration for a resolution.

âââââââÂ

## CORS Error

#### ****ð**** **Issue:** **What is CORS?Â**

Cross-Origin Resource Sharing (CORS) is a security mechanism enforced by web browsers to limit HTTP requests made between different domains or origins.Â

**How do I resolve a CORS Error?**Â

To resolve this, you should call the API from your secure backend server instead of trying to call it directly from your frontend.

âââââââÂ

## Processing Error / Missing QR

#### ****ð**** **Issue:** **Something went wrong, we couldnât process your request/ QR is missing**.

**How do I resolve this error?**

- Change your websiteâs referrer policy and ensure it is set to **strict-origin-when-cross-origin** to allow the payment source URL to be passed.
- Do not open the pay page on a new tab. Ensure you use the URL (whitelisted/registered on our end) to process transactions.
- Ensure you are initiating production/live transactions through your **registered/whitelisted website URL**. **Avoid** initiating transactions via a **localhost** when operating in the production environment.
- If you have integrated the Web API for a mobile application, switch to the [Mobile SDK](/phonepe-docs-md/payment-gateway.md#:~:text=Github-,Mobile%20App%20Integration,-Integrate%20PhonePe%20seamlessly) and use the relevant documentation.

âââââââÂ

## Migrating from V1 to V2 Credentials

#### ****ð**** **Issue:** **I am currently using a V1 flow (Deprecated) and want to migrate to a V2 flow. How do I get V2 credentials?**

- You need to **raise a support ticket to the integration team in order** to release PG V2 credentials. The credentials will be provided based on the specific **integrationType** and the flow the merchant is implementing.

#### ****ð**** **Issue:** **I am a Shopify merchant, but I want to perform a custom API integration (standard checkout). What credentials do I need?(shopify to custom integrationType)**

- **Shopify Integration** does **not** require a credential/role.Â
- For **Custom API Integration**, you **do** require credentials (i.e., **client\_id, client\_secret, and client\_version**) and the relevant role to be enabled on your merchant account. Please raise a support ticket to the integration team for the same.

âââââââÂ

## Webhook

#### ****ð**** **Issue:** **How can I reliably receive transaction statuses?**

- You should configure the **webhook URL** on the PhonePe business dashboard. This is necessary to receive a callback/webhook response for each transaction that reaches a terminal state (success or failed).

#### ****ð**** **Issue:** **What should I do if the webhook fails?**

- In addition to configuring the webhook, you must also configure the **Order Status API**. In the event of a webhook failure, you can rely on the data from the Order Status API to display the correct transaction status to your user.

#### ****ð**** **Issue:** **How many webhook URLs I can configure?**

- You can configure multiple webhook Urls through the dashboard. You can set a unique webhook url for each eventType or a single webhook url for all the eventTypes.

#### ****ð**** **Issue:** **Why am I not receiving webhook response?**

- Ensure you have configured a webhook url on the dashboard.
- Ensure you have created a valid webhook url, with no IP address or port number in it and https method and accept post json data.
- Ensure there shouldnât be any data validations and rate limiting on the webhook API.
- Ensure to acknowledge the webhook received from the PhonePe to avoid webhook failures.

âââââââÂ

## General Integration & Configuration

#### ****ð**** **Issue:** **Can I request V1 Credentials (salt\_key/salt\_index)?**

- **No.** The V1 flow has been **deprecated** and is no longer supported. V1 credentials cannot be generated. Please contact your Business Development (BD) representative for more information.

#### ****ð**** **Issue:** **Can I whitelist multiple URLs for a single merchant ID?**

- **Â Â No.** Only **one** URL can be whitelisted for one merchantID. Multiple URL whitelisting is not supported.
- Either a domain or a sub-domain can be whitelisted, both cannot be whitelisted.

#### ****ð**** **Issue: How can I integrate Payment Links via API?**

- You must **share a business use case** with the integration team on a support ticket for approval.Â
- Once approved, the relevant role will be assigned to your account, allowing you to integrate payment links via API.

#### ****ð**** **Issue:** **I am facing a redirection issue after the payment is complete. What is the cause?**

- Ensure you have passed a **valid redirectUrl** in the request payload. This is the URL where you want the user to be directed after the payment is completed.

#### ****ð**** **Issue:** **Till what duration I can initiate the refund?**

- You can initiate the refund within 3 months from the date of successful forward transaction.
- While initiating the refund ensure you have a sufficient forward balance for a day of the amount you are initiating the refund.
- Refund can be partial. However, ensure you are not initiating in the same batch(bulk refund).
- If you are initiating the refund in bulk, ensure to initiate it at the end of the day so that you have enough forward balance to initiate the same.

âââââââÂ
