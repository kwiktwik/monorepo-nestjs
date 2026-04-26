<!-- Source: https://razorpay.com/docs/payments/payment-methods/cards/google-pay/custom-integration -->

Using this feature, you can allow your customers to make payments on your Android app using the cards they have saved on Google Pay.

To support Google Pay Cards on your custom checkout implementation:

1. [Show Google Pay as a separate option when Google Pay is set-up on your customer’s device](/razorpay-docs-md/payment-methods/cards/google-pay.md#onboarding-and-integration)

   .
2. Trigger payment when the user clicks Google Pay Cards on your checkout.

**Feature Request**

- This is an on-demand feature. Please raise a request with our [Support team](https://razorpay.com/support/#request)

  to get this feature activated on your Razorpay account.
- Watch this video to know how to raise a feature enablement request on the Dashboard.

![Feature Request GIF](https://razorpay.com/docs/payments/payment-methods/cards/google-pay/build/browser/assets/images/feature-request.gif)

## Prerequisites

- You should have already integrated [Razorpay Custom Checkout](/razorpay-docs-md/payment-gateway/android-integration/custom.md)

  on your Android app.
- Complete the onboarding process mentioned [here](/razorpay-docs-md/payment-methods/cards/google-pay.md)  .

## Integration Steps

1. [Add or update the Google SDKs](/razorpay-docs-md/payment-methods/cards/google-pay/custom-integration.md#step-1-add-or-update-the-google-sdks)
2. [Update the Razorpay Custom Integration SDK](/razorpay-docs-md/payment-methods/cards/google-pay/custom-integration.md#step-2-update-razorpay-custom-integration-sdk)
3. [Add dependencies in the Build Gradle file](/razorpay-docs-md/payment-methods/cards/google-pay/custom-integration.md#step-3-add-dependencies-in-build-gradle-file)
4. [Add metadata in the Android Manifest file](/razorpay-docs-md/payment-methods/cards/google-pay/custom-integration.md#step-4-add-metadata-in-android-manifest-file)

   .
5. [Instantiate and initialize the Razorpay Android Custom SDK](/razorpay-docs-md/payment-methods/cards/google-pay/custom-integration.md#step-5-instantiate-and-initialize-razorpay-android-custom)
6. [Implement Orders API in your server-side](/razorpay-docs-md/payment-methods/cards/google-pay/custom-integration.md#step-6-implement-orders-api-in-your-server-side)

   .
7. [Fetch payment methods](/razorpay-docs-md/payment-methods/cards/google-pay/custom-integration.md#step-7-fetch-payment-methods)

   .
8. [Check if Google Pay Cards is setup on the customer's device](/razorpay-docs-md/payment-methods/cards/google-pay/custom-integration.md#step-8-check-if-google-pay-cards-is)

   .
9. [Set up the WebView](/razorpay-docs-md/payment-methods/cards/google-pay/custom-integration.md#step-9-set-up-the-webview)

   .
10. [Submit payment data and handle success and error events](/razorpay-docs-md/payment-methods/cards/google-pay/custom-integration.md#step-10-submit-payment-data-and-handle-success)

    .
11. [Store fields in the server](/razorpay-docs-md/payment-methods/cards/google-pay/custom-integration.md#step-11-store-the-fields-in-the-server)

    .
12. [Verify payment signature](/razorpay-docs-md/payment-methods/cards/google-pay/custom-integration.md#step-12-verify-payment-signature)

    .

### Step 1: Add or Update the Google SDKs

You will need to integrate the Google SDK in your Android app.

Import the SDK from our Maven repository by adding the following lines to your app's `build.gradle` file.

build.gradle

copy

```java
repositories {
    mavenCentral()
}

dependencies {
    implementation 'com.razorpay:gpay:1.0.0'
}
```

### Step 2: Update Razorpay Custom Integration SDK

Google Pay Cards is supported on Razorpay Android - Custom Checkout version 3.8.8 and higher. If you are using an older version, you will need to update the same.

You can update the Custom Checkout version in your `build.gradle` file as shown below:

Update Razorpay Checkout version

copy

```java
dependencies {
  ...
  implementation(name:'razorpay-android-3.8.8', ext: 'aar')’)
}
```

### Step 3: Add Dependencies in Build Gradle File

Add the following lines to your app's `build.gradle` file.

Dependencies

copy

```java
dependencies {
    ...
    implementation 'com.android.support:customtabs:26.1.0'
    implementation 'com.google.android.gms:play-services-tasks:15.0.1'
    implementation 'com.google.android.gms:play-services-wallet:18.0.0'
    ...
}
```

### Step 4: Add Metadata in Android Manifest File

Add the following lines inside the app’s `AndroidManifest.xml` file.

Adds Meta Data

copy

```xml
<meta-data
   android:name="com.google.android.gms.wallet.api.enabled"
   android:value="true" />
```

### Step 5: Instantiate and Initialize Razorpay Android Custom SDK

#### Instantiate

To instantiate Razorpay, pass a reference of your activity to the Razorpay constructor, as shown below:

Instantiate Razorpau

copy

```java
import com.razorpay.Razorpay
Razorpay razorpay = new Razorpay(activity);
```

#### Initialize

Add your Razorpay API keys to `AndroidManifest.xml`.

**Handy Tips**

API keys should not be hardcoded in the app. It should be sent from your server-side as an app-related metadata fetch.

The sample `AndroidManifest.xml` file with auto-OTP reading feature enabled is shown below:

AndroidManifest.xml file

copy

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
  <application>
    <meta-data
        android:name="com.razorpay.ApiKey"
        android:value="YOUR_KEY_ID"
        />
  </application>
</manifest>
```

To set your API key programmatically, that is, at the runtime instead of statically defining it in your `AndroidManifest.xml`, you can pass it as a parameter to the Razorpay constructor, as shown below:

Set API Key Programmatically

copy

```java
Razorpay razorpay = new Razorpay(activity, "YOUR_KEY_ID");
```

### Step 6: Implement Orders API in your Server-side

Order is an important step in the payment process.

- An order should be created for every payment.
- You can create an order using the [Orders API](/razorpay-docs-md/payment-methods/cards/google-pay/custom-integration.md#api-sample-code)  . It is a server-side API call.  Know how to [authenticate](/razorpay-docs-md/api/authentication.md#generate-api-keys)

  Orders API.
- The order\_id received in the response should be passed to the checkout. This ties the Order with the payment and secures the request from being tampered.

**Watch Out!**

Payments made without an `order_id` cannot be captured and will be automatically refunded. You must create an order before initiating payments to ensure proper payment processing.

#### API Sample Code

The following is a sample API request and response for creating an order:

CurlJavaPythonPHPRubyNode.js.NETResponse

copy

```bash
curl -X POST https://api.razorpay.com/v1/orders
-u [YOUR_KEY_ID]:[YOUR_KEY_SECRET]
-H 'content-type:application/json'
-d '{
    "amount": 50000,
    "currency": "INR",
    "receipt": "rcptid_11",
    "partial_payment": true,
    "first_payment_min_amount": 23000
}'
```

#### Request Parameters

Here is the list of parameters and their description for creating an order:

amount

mandatory

`integer` Payment amount in the smallest currency sub-unit. For example, if the amount to be charged is ₹299, then pass `29900` in this field. In the case of three decimal currencies, such as KWD, BHD and OMR, to accept a payment of 295.991, pass the value as 295990. And in the case of zero decimal currencies such as JPY, to accept a payment of 295, pass the value as 295.

**Watch Out!**

As per payment guidelines, you should pass the last decimal number as 0 for three decimal currency payments. For example, if you want to charge a customer 99.991 KD for a transaction, you should pass the value for the amount parameter as `99990` and not `99991`.

currency

mandatory

`string` The currency in which the transaction should be made. See the [list of supported currencies](/razorpay-docs-md/international-payments.md#supported-currencies). Length must be 3 characters.

**Handy Tips**

Razorpay has added support for zero decimal currencies, such as JPY and three decimal currencies, such as KWD, BHD and OMR, allowing businesses to accept international payments in these currencies. Know more about [Currency Conversion](/razorpay-docs-md/international-payments/currency-conversion.md)

(May 2024).

receipt

optional

`string` Your receipt id for this order should be passed here. Maximum length is 40 characters.

notes

optional

`json object` Key-value pair that can be used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

partial\_payment

optional

`boolean` Indicates whether the customer can make a partial payment. Possible values:

- `true`: The customer can make partial payments.
- `false` (default): The customer cannot make partial payments.

id

mandatory

`string` Unique identifier of the customer. For example, `cust_1Aa00000000004`.

Know more about [Orders API](/razorpay-docs-md/api/orders.md).

#### Response Parameters

Descriptions for the response parameters are present in the [Orders Entity](/razorpay-docs-md/api/orders/entity.md) table.

#### Error Response Parameters

The error response parameters are available in the [API Reference Guide](/razorpay-docs-md/api/orders/create.md).

The `razorpay_order_id`, returned on successful creation of the order, should be sent to the Checkout form.

### Step 7: Fetch Payment Methods

To get a list of available payment methods, call `getPaymentMethods`. This fetches the list of payment methods asynchronously and returns the result in JSON format in the `onPaymentMethodsReceived` callback. For the structure of the JSON result, you can refer: [https://api.razorpay.com/v1/methods?key\_id=`{Your\_Key\_ID}`](https://api.razorpay.com/v1/methods?key_id=%60%7BYour_Key_ID%7D%60)

JavaKotlin

copy

```java
razorpay.getPaymentMethods(new Razorpay.PaymentMethodsCallback() {
	@Override
	public void onPaymentMethodsReceived(String result) {
		JSONObject paymentMethods = new JSONObject(result);
	}

	@Override
	public void onError(String error){

	}
	});
});
```

Know [how to integrate the different payment methods](/razorpay-docs-md/payment-gateway/android-integration/custom/payment-methods.md) using Razorpay Android Custom SDK in detail.

### Step 8: Check if Google Pay Cards is Setup on Customer's Device

**Handy Tips**

Ensure the Google Pay Cards feature is enabled for your account. If it is not enabled, [get in touch](https://razorpay.com/support/) with us to get it enabled on your account.

Use the code given below to check if Google Pay cards are setup on your customer’s device.

JavaKotlin

copy

```java
razorpay.isUserRegisteredOnGpay(this, new GPayCardsRegisteredListener(){
	@Override
	public void isUserRegisteredOnGpay(boolean status){
		//status of user 
	}
}
```

You should show Google Pay cards method to your customers only when `isUserRegisteredOnGpay` returns true.

### Step 9: Set Up the WebView

The bank ACS pages are displayed to the user in a WebView.
You need to define a WebView in your layout and pass the reference to our SDK using `setWebView`, as shown below:

JavaKotlin

copy

```java
dependencies {
  ...
  implementation(name:'razorpay-android-3.8.8', ext: 'aar')’)
}
```0

### Step 10: Submit Payment Data and Handle Success and Error Events

Once you have received the customer's payment information, it needs to be sent to Razorpay to complete the `creation` step of the payment flow. You can do this by invoking the `submit` method. Before invoking this method, you have to make your WebView visible to the customer. The data that needs to be submitted in the form of a `JSONObject` is shown below:

JavaKotlin

copy

```java
dependencies {
  ...
  implementation(name:'razorpay-android-3.8.8', ext: 'aar')’)
}
```1

**Handy Tips**

To reuse the Razorpay Checkout web integration inside a web view on Android or iOS, pass a [callback\_url](/razorpay-docs-md/payment-gateway/callback-url.md) along with other checkout options to process the desired payment.

#### Using `PaymentResultWithDataListener`

You have the option to implement `PaymentResultListener` or `PaymentResultWithDataListener` to receive callbacks for the payment result.

`PaymentResultListener` provides only `payment_id` as the payment result.
`PaymentResultWithDataListener` provides additional payment data, such as `email` and `contact` of the customer, along with the `order_id`, `payment_id`, `signature` and more.

Java

copy

```java
dependencies {
  ...
  implementation(name:'razorpay-android-3.8.8', ext: 'aar')’)
}
```2

### Step 11: Store the Fields in the Server

A successful payment returns the following fields to the Checkout form.

Success Callback

- You need to store these fields in your server.
- You can confirm the authenticity of these details by verifying the signature in the next step.

razorpay\_payment\_id

`string` Unique identifier for the payment returned by Checkout **only** for successful payments.

razorpay\_order\_id

`string` Unique identifier for the order returned by Checkout.

razorpay\_signature

`string` Signature returned by the Checkout. This is used to verify the payment.

### Step 12: Verify Payment Signature

This is a mandatory step to confirm the authenticity of the details returned to the Checkout form for successful payments.

To verify the `razorpay_signature` returned to you by the Checkout form:

1. Create a signature in your server using the following attributes:

   - `order_id`: Retrieve the `order_id` from your server. Do not use the `razorpay_order_id` returned by Checkout.
   - `razorpay_payment_id`: Returned by Checkout.
   - `key_secret`: Available in your server. The `key_secret` that was generated from the [Dashboard](/razorpay-docs-md/dashboard/account-settings/api-keys.md#generate-api-keys)     .
2. Use the SHA256 algorithm, the `razorpay_payment_id` and the `order_id` to construct a HMAC hex digest as shown below:

   HMAC Hex Digest

   copy

   ```java
dependencies {
  ...
  implementation(name:'razorpay-android-3.8.8', ext: 'aar')’)
}
```3
3. If the signature you generate on your server matches the `razorpay_signature` returned to you by the Checkout form, the payment received is from an authentic source.

Generate Signature on Your Server

Given below is the sample code for payment signature verification:

JavaPythonGoPHPRubyNode.js.NET

copy

```java
dependencies {
  ...
  implementation(name:'razorpay-android-3.8.8', ext: 'aar')’)
}
```4

Post Signature Verification

After you have completed the integration, you can [set up webhooks](/docs/webhooks/setup-edit-payments/), make test payments, replace the test key with the live key and integrate with other [APIs](/razorpay-docs-md/api/index.md).
