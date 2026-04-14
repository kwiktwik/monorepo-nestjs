<!-- Source: https://developer.phonepe.com/payment-gateway/general-faqs -->

# General FAQs

---

## PhonePe PG Integration

#### Q. How can I integrate PhonePe Payment Gateway for my website?

You can integrate PhonePe Payment Gateway for your website using any one of the below links:

- PhonePe Standard Checkout:
  - [API Integration](/phonepe-docs-md/payment-gateway/website-integration/standard-checkout/api-integration/api-integration-website.md)
- E-commerce Plugins:
  - [Shopify](/phonepe-docs-md/payment-gateway/e-commerce-plugins/shopify.md)
  - [WooCommerce](/phonepe-docs-md/payment-gateway/e-commerce-plugins/woocommerce.md)

#### Q. How can I integrate PhonePe Payment Gateway for my app?

You can integrate PhonePe Payment Gateway for your app depending on the OS and the programming language with which your platform was designed.

- **Native Android/iOS application**: You can use the SDK Integration
  - [Android](/phonepe-docs-md/payment-gateway/mobile-app-integration/standard-checkout-mobile/android-sdk/introduction.md)
  - [iOS](/phonepe-docs-md/payment-gateway/mobile-app-integration/standard-checkout-mobile/ios/introduction.md)
- **Cross-platform integration (React Native, Flutter, etc.)**: You can use the SDK Integration.
  - [Flutter](/phonepe-docs-md/payment-gateway/mobile-app-integration/standard-checkout-mobile/flutter/introduction.md)
  - [React Native](/phonepe-docs-md/payment-gateway/mobile-app-integration/standard-checkout-mobile/react-native/introduction.md)
  - [Ionic](/phonepe-docs-md/payment-gateway/mobile-app-integration/standard-checkout-mobile/ionic/introduction.md)

#### Q. Can my customers save their card details for faster checkout?

Yes. PhonePe PG allows customers to save cards on Standard Checkout in full compliance with **RBI mandates**. When a customer opts to save their card, PhonePe generates a secure “token” to replace sensitive card details.
On future visits, the customer only needs to enter their **CVV** to complete the payment. This significantly reduces checkout friction for your customer. Customers can manage or delete their saved cards at any time through the [PhonePe PG Portal](https://pg-checkout.phonepe.com/manage-cards)

#### Q. How do I fix a generic API errors?

This will depend on the error code received as below:

*`401 - Unauthorized`*

This error occurs when you use incorrect or invalid Auth Token while making the API requests.
To fix this, you need to ensure:

- You are using the correct UAT/Production credentials shared by PhonePe as per the environment being tested.
- You are using the correct API host and endpoints corresponding to the environment.
- Make sure the Auth Token is valid. If not, regenerate the new AuthToken using Authorization API.

*`400 - Bad Request`*

This error occurs when any one of the request parameter is not being passed with the valid input.
To fix this, you need to ensure:

- You’ve passed all the request parameters marked as mandatory in the developer document and there are no blank values in the request body.
- You are not passing any additional request parameter that is not included in the developer document.
- You’ve passed the request parameters with the appropriate data type specified in the developer document.

*`500 - Internal Server Error`*

This error occurs when are sent in the API request.
To fix this, you need to ensure:

- If you are testing in the UAT/simulator environment, check if the simulator template is set correctly for the UAT MID using the PhonePe test app.
- If you are testing it in the Production environment, try any of the following,
  - Try after some time
  - Make sure you’ve passed the correct paymentFlow details with the required parameters in the request body as mentioned in the developer document

If you’ve followed the above steps and still continue to face issues, you can raise the integration ticket using **PhonePe Business Dashboard** under the **Help** section (or) call your business point of contact and share the below details:

1. API host details and endpoints for triggering API
2. Request payload
3. Response payload
4. Integration platform (Web/Android/iOS)
5. Screenshot or Screen recording of the issue

#### Q. Why am I not receiving the callback response in the callback URL?

You could be facing this issue due to any one of the following reasons:

- You need to check on the PhonePe Business Dashboard whether the Callback URL is configured under the “**Developer Settings** **→** **Webhook**” with the appropriate events.
- You need to configure the POST method (POST API) for the callback URL and able to handle the POST response.
- Your callback URL might have HTTP in it and not HTTPS. We do not post our response on HTTP callback URLs.
- There should not be any Port Number or IP Address mentioned in the Callback URL. It should contain only the Public Domain to receive the response.
- The configured callback URL is not able to receive the responses and capture them at the same time at merchant’s end.

#### Q. How do I fix the FRA Error : “Internal Security Block” ?

You’ll see this error in any of the following scenarios. To avoid transaction block in production, kindly check the below points:

- If you are using a personalised Chrome tab within their Android app, hindering URL retrieval. Please use Android/iOS SDK integration to resolve this issue.
- If you are launching PayPage in a new window or tab, resulting in the absence of a referrer, then either redirect or employ an iFrame for PayPage is essential.
- If you have implemented a no-referrer-policy then it leads to blank merchant URLs captured at our end. Please refrain from using it on the checkout page.
- If you are redirecting to the PhonePe Checkout Page using the URL/package name that you haven’t shared with us during the onboarding.
  **Note**: If your URL/package name changed after you onboarded with us, please reach out to your business point of contact and get it updated.

#### Q. Is it mandatory to handle server-to-server (S2S)callback/webhook response?

Yes, it’s extremely important to handle Server-to-server (S2S) callback/webhook response due to data security reasons and a consistent flow of responses on the server in real time. Please refer to the [developer documentation](/phonepe-docs-md/payment-gateway.md) for more details.

#### Q. Is it mandatory to implementation the Order Status API?

Yes, it is important to call the Order Status API using a cron/scheduler until the terminal state “COMPLETED” or “FAILED” is reached.

**Example**: You may not receive an S2S response for a payment or there can be some payments that are pending. In such cases, you will need to trigger the Order Status API. Please refer to the [developer documentation](/phonepe-docs-md/payment-gateway.md) to check the recommended time frequency to run this API.

## WooCommerce Plugin

#### Q. How do I fix a 404 error?

First, please confirm that you are using the latest PhonePe plugin version 3.0.4(latest) and ensure that your website is running on PHP version 8.2 or above. If the issue persists even after upgrading to PHP 8.2 or higher, you will need to reset the PhonePe credentials page in WooCommerce. To do this, log in to the database where your website is hosted (for example, Hostinger or GoDaddy) and delete the entry related to the plugin settings by running the following query on the `wp_options` table:

```
DELETE FROM wp_options WHERE option_name='woocommerce_phonepe_settings';
```

.custom-block-wrapper {
padding: 20px;
border: 1px solid black;
background-color: #d9edbc;
}

#### Q. Merchants seeing MID and SaltKey fields in v3.0.1 and above instead of Client Id and Client Secret?

This is because of the entry being created in merchant DB at the time they installed the older version of the plugin and tested with UAT or Prod PG V1 credentials. Due to this even after upgrading to plugin version 3.0.1 and above still the saltkey and MID fields are visible.

**Solution**:

- Check the database where your website is hosted.
- Locate the table named **“wp-options”**and execute the following query to delete the stored credentials
  - **DELETE FROM wp\_options WHERE option\_name=’woocommerce\_phonepe\_settings’; [**This will remove any old keys stored in the table].
- After executing the query, you should navigate to the **PhonePe plugin settings**, where the fields will be reset, allowing them to re-enter their credentials and complete the integration.

#### Q. After entering Client Id and Client Secret when trying to save the screen goes blank or their has been a critical error on this website.

This is because the older version of PHP might be used.
**Solution**: To upgrade WooCommerce to Upgrade PHP Version to 8.2 or Above.

#### Q. Transaction could not be initiated because of a network issue. Please check network connectivity.

This happens if the credentials used are from an older version or if they are entered incorrectly.

**Solution:**

- Ensure that your **PHP version is 8.2** or **above**, and the PhonePe plugin version is **3.0.4**(**latest**)
- Please verify your credentials in the Developer Settings section.
  - If you see **salt\_key** and **salt\_index** (V1 credentials):
    - These are older keys. Please reach out to the Integration Team to request PG V2 keys.
  - If you see **client\_id**, **client\_secret**, and **client\_version** (V2 credentials):
    - Ensure that the credentials entered on the config page are correct.
    - Make sure there are no extra spaces.
    - The environment must be set to **PRODUCTION**, as the plugin currently does not support the UAT environment.
