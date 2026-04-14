<!-- Source: https://razorpay.com/docs/api/payments/recurring-payments/custom -->

Recurring Payments allow you to charge your customers repeatedly without requiring them to enter payment details each time. Your customers authorise their payment method once and you can charge them at intervals you control based on your business needs.

Use Razorpay Recurring Payments to create flexible payment schedules for subscriptions, installments, usage-based billing or on-demand charges. Set up recurring payments quickly using our powerful REST APIs.

**Feature Request**

This is an on-demand feature. Please raise a request with our [Support team](https://razorpay.com/support/#request) to get this feature activated on your Razorpay account.

## Integration Flow

The integration flow varies depending on how you choose to create the authorisation transaction.

Using Razorpay APIs

![](https://razorpay.com/docs/api/payments/recurring-payments/build/browser/assets/images/recurring-payments-recurring_payments_standard_checkout.jpg)

This is possible only via APIs. The integration flow to collect recurring payments using Razorpay APIs is:

1. Create a customer. This returns a `customer_id`.
2. Create an order. This returns an `order_id`. The order amount for:
   - Emandate is ₹0.
   - Cards is a minimum of ₹1.
   - Paper NACH is ₹0.
   - UPI is ₹1.
3. Pass the `customer_id`, `order_id` and a few additional parameters in your Checkout to create the authorisation payment. The customer completes the authorisation payment, which generates a `token`. This payment can be authorised using one of the following instruments:
   - Emandate.
   - Card.
   - Paper NACH. The following additional steps have to be completed for NACH:
     1. The customer either downloads a pre-filled NACH form or you can send it to the customer.
     2. The customer signs the pre-filled NACH form.
     3. The customer either uploads the signed form or sends it to you to upload for processing.
   - UPI.
4. Retrieve and check the status of the token. **Once the token status changes to `confirmed`, you can create and charge subsequent payments**.
5. Create and charge subsequent payments. To do this, you have to manually:
   1. Create a new order.
   2. Create a recurring payment.

Using a Registration Link

![](https://razorpay.com/docs/api/payments/recurring-payments/build/browser/assets/images/recurring-payments-recurring_payments_registration_link.jpg)

You can create registration links from the Dashboard or using APIs.

Following is the integration flow to collect recurring payments using a registration link:

1. **Create a registration link and send it to your customer**
   The customer completes the authorisation payment, which generates a `token`. This payment can be authorised using one of the following instruments:

   - Emandate
   - Card
   - Paper NACH. The following additional steps have to be completed for NACH:
     1. The customer either downloads a pre-filled NACH form or you can send it to the customer.
     2. The customer signs the pre-filled NACH form.
     3. The customer either uploads the signed form or sends it to you to upload for processing.
        Know more about [uploading Paper Nach Form](/razorpay-docs-md/recurring-payments/upload-paper-nach-form.md)        .
   - UPI

   **No Need to Create a Customer and Order Separately**

   If you use a registration link to create the authorisation transaction, Razorpay automatically creates a customer and the order on your behalf.
2. **Retrieve and check the token status**
   After the token status changes to `confirmed`, you can create and charge subsequent payments.
3. **Create and charge subsequent payments**
   To do this, you have to manually:

   1. Create a new order.
   2. Create a recurring payment.

## API Gateway URL

For most of the Razorpay APIs, the Gateway URL is `https://api.razorpay.com/v1`. You need to include this before each API endpoint to make API calls. However, certain APIs are on V2. Hence, the gateway URL may differ for certain APIs.

Example

- Use the URL `https://api.razorpay.com/v1/payments` to access payment resources.
- Use the URL `https://api.razorpay.com/v2/accounts` to access Route (Linked Account)-related resources.

## API Authorisation

All Razorpay APIs are authenticated using `Basic Auth`. Basic auth requires the following:

- `[YOUR_KEY_ID]`
- `[YOUR_KEY_SECRET]`

Basic auth expects an `Authorization` header for each request in the `Basic base64token` format. Here, `base64token` is a base64 encoded string of `YOUR_KEY_ID:YOUR_KEY_SECRET`.

**Watch Out!**

The `Authorization` header value should strictly adhere to the format mentioned above. Invalid formats will result in authentication failures.
Few examples of **invalid** headers are: `BASIC base64token`, `basic base64token`, `Basic "base64token"` and `Basic $base64token`.

### Generate API Key

Follow these steps to generate API keys:

#### Test Mode API Keys

Watch this video to see how to generate API keys in the Test mode.

#### Live Mode API Keys

Watch this video to see how to generate API keys in the Live mode.

1. Log in to your Dashboard with the appropriate credentials.
2. Select the mode (**Test** or **Live**) for which you want to generate the API key.
   - **Test Mode**: The test mode is a simulation mode that you can use to test your integration flow. **Your customers will not be able to make payments in this mode**.
   - **Live Mode**: When your integration is complete, switch to live mode and generate live mode API keys. In the integration, **replace test mode keys with live mode keys to accept customer payments**.
3. Navigate to **Account & Settings** → **API Keys** (under **Website and app settings**) → **Generate Key** to generate key for the selected mode.

**Watch Out!**

- After generating the keys from the Dashboard, download and save them securely. You can use only one set of API keys. If you do not remember your API keys, you must [regenerate them](/razorpay-docs-md/dashboard/account-settings/api-keys.md#regenerate-api-keys)

  from the Dashboard and update them wherever the previous keys were used for payment gateway integrations.
- API Keys are universal; that is, they are applicable to all websites and apps that you have whitelisted for your Merchant ID.
- **Do not share your API Key secret** with anyone or on any public platforms. **This can pose security threats to your Razorpay account**.
- Once you generate the API Keys, only the **Key Id** is visible on the Dashboard, **not the Key secret**, as it can pose security threats to your Razorpay account.
- Use the **Live API Keys** to accept live payments and the **Test API Keys** for test transactions.

## List of APIs as per Supported Payment Methods

Emandate

Cards

Paper NACH

UPI Autopay

UPI TPV
