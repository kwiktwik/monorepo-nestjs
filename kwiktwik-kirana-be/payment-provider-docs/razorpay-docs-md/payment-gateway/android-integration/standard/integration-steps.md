<!-- Source: https://razorpay.com/docs/payments/payment-gateway/android-integration/standard/integration-steps -->

Follow these steps to integrate your Android application:

#### 1. Build Integration

Integrate Android Standard Checkout.

#### 2. Test Integration

Test the integration by making a test payment.

#### 3. Go-live Checklist

Check the go-live checklist.

**Watch Out!**

The Android app must have a `minSDKversion` of 19 or higher. If you want to support devices below API level 19, you must override `minSDKversion`. Use the sample code below to override `minSDKversion`:

Override minSDK

copy

```java
<uses-sdk android:targetSdkVersion="27" android:minSdkVersion="19"
            tools:overrideLibrary="com.razorpay"/>
```

## 1. Build Integration

Follow the steps given below:

1.1 Install Razorpay Android Standard SDK

To install the SDK in your Android project:

Add the code given below to your project's top-level `build.gradle` file:
This gives access to the SDK library.

build.gradle

copy

```java
repositories {
    mavenCentral()
}

dependencies {
    implementation 'com.razorpay:checkout:1.6.40'
}
```

**Handy Tips**

From version 1.6.40 onwards, the latest version is automatically updated, eliminating the need for manual updates.

1.2 Initialize Razorpay Android Standard SDK

Add your `<API_KEY_ID>` dynamically using Checkout's `setKeyId()` method. You can generate the [API Keys](/razorpay-docs-md/dashboard/account-settings/api-keys.md#generate-api-keys) from the Dashboard.

To quickly load the `Checkout` form, the `preload` method of `Checkout` must be called much earlier than the other methods in the payment flow. The loading time of the preload resources can vary depending on your network's bandwidth.

JavaKotlin

copy

```java
public class PaymentActivity extends Activity {

  // ...

  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    /**
     * Preload payment resources
     */
    Checkout.preload(getApplicationContext());

    // ...

    checkout.setKeyID("<YOUR_KEY_ID>");

    // ...
  }
}
```

**Watch Out!**

It is recommended to send the API Key ID from your server-side as app-related metadata fetch. Do not add API Keys in the `AndroidManifest` file.

Proguard Rules

If you are using Proguard for your builds, you must add the following lines to your `proguard-rules.pro` file.

java

copy

```java
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

-keepattributes JavascriptInterface
-keepattributes *Annotation*

-dontwarn com.razorpay.**
-keep class com.razorpay.** {*;}

-optimizations !method/inlining/*

-keepclasseswithmembers class * {
  public void onPayment*(...);
}
```

SDK Integration Check

Call `Checkout.sdkCheckIntegration(activity)` to check the health of integration. This will also let you know if the SDK version is outdated. This will only appear in debug mode and not in the release.

1.3 Create an Order in Server

**Order is an important step in the payment process.**

- An order should be created for every payment.
- You can create an order using the [Orders API](/razorpay-docs-md/payment-gateway/android-integration/standard/integration-steps.md#api-sample-code)  . It is a server-side API call. Know how to [authenticate](/razorpay-docs-md/dashboard/account-settings/api-keys.md#generate-api-keys)

  Orders API.
- The `order_id` received in the response should be passed to the checkout. This ties the order with the payment and secures the request from being tampered.

**Watch Out!**

Payments made without an `order_id` cannot be captured and will be automatically refunded. You must create an order before initiating payments to ensure proper payment processing.

You can create an order using:

API Sample Code

Razorpay Postman Public Workspace

Use this endpoint to create an order using the Orders API.

POST

/orders

CurlJavaPythonGoPHPRubyNode.js.NET

copy

```bash
curl -X POST https://api.razorpay.com/v1/orders 
-U [YOUR_KEY_ID]:[YOUR_KEY_SECRET]
-H 'content-type:application/json'
-d '{
    "amount": 50000,
    "currency": "",
    "receipt": "qwsaq1",
    "partial_payment": true,
    "first_payment_min_amount": 230
}'
```

Success ResponseFailure Response

copy

```json
{
    "id": "order_IluGWxBm9U8zJ8",
    "entity": "order",
    "amount": 50000,
    "amount_paid": 0,
    "amount_due": 50000,
    "currency": "",
    "receipt": "rcptid_11",
    "offer_id": null,
    "status": "created",
    "attempts": 0,
    "notes": [],
    "created_at": 1642662092
}
```

Request Parameters

amount

mandatory

`integer` The transaction amount, expressed in the currency subunit. For example, for an actual amount of ₹222.25, the value of this field should be `22225`.

currency

mandatory

`string` The currency in which the transaction should be made.  See the [list of supported currencies](/razorpay-docs-md/international-payments.md#supported-currencies). Length must be of 3 characters.

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

first\_payment\_min\_amount

optional

`integer` Minimum amount that must be paid by the customer as the first partial payment. For example, if an amount of ₹7,000 is to be received from the customer in two installments of #1 - ₹5,000, #2 - ₹2,000, then you can set this value as `500000`. This parameter should be passed only if `partial_payment` is `true`.

Response Parameters

Descriptions for the response parameters are present in the [Orders Entity](/razorpay-docs-md/api/orders/entity.md) parameters table.

Error Response Parameters

The error response parameters are available in the [API Reference Guide](/razorpay-docs-md/api/orders/create.md).

1.4 Initiate Payment and Display Checkout Form

There are two ways to pass the checkout parameters. You can either use `payloadhelper` or the `JSONObject` options. We recommend using `payloadhelper` to ensure that the right data types are used for the parameter values.

PayloadHelper

Create a `JSONObject` to send it to the SDK.

JavaKotlin

copy

```java
PayloadHelper payloadHelper = new PayloadHelper("", 100, "order_XXXXXXXXX");
      payloadHelper.setName("Gaurav Kumar");
      payloadHelper.setDescription("Description");
      payloadHelper.setPrefillEmail("gaurav.kumar@example.com");
      payloadHelper.setPrefillContact("+919876543210");
      payloadHelper.setPrefillCardNum("4628 9499 7226 2986");
      payloadHelper.setPrefillCardCvv("111");
      payloadHelper.setPrefillCardExp("11/30");
      payloadHelper.setPrefillMethod("card");
      payloadHelper.setPrefillName("MerchantName");
      payloadHelper.setSendSmsHash(true);
      payloadHelper.setRetryMaxCount(4);
      payloadHelper.setRetryEnabled(true);
      payloadHelper.setColor("#000000");
      payloadHelper.setAllowRotation(true);
      payloadHelper.setRememberCustomer(true);
      payloadHelper.setTimeout(10);
      payloadHelper.setRedirect(true);
      payloadHelper.setRecurring("1");
      payloadHelper.setSubscriptionCardChange(true);
      payloadHelper.setCustomerId("cust_XXXXXXXXXX");
      payloadHelper.setCallbackUrl("https://accepts-posts.request");
      payloadHelper.setSubscriptionId("sub_XXXXXXXXXX");
      payloadHelper.setModalConfirmClose(true);
      payloadHelper.setBackDropColor("#ffffff");
      payloadHelper.setHideTopBar(true);
      payloadHelper.setNotes(new JSONObject("{\"remarks\":\"Discount to customer\"}"));
      payloadHelper.setReadOnlyEmail(true);
      payloadHelper.setReadOnlyContact(true);
      payloadHelper.setReadOnlyName(true);
      payloadHelper.setImage("https://www.razorpay.com");
      payloadHelper.setAmount(100);
      payloadHelper.setCurrency("");
      payloadHelper.setOrderId("order_XXXXXXXXXXXXXX");
```

If you want to create certain options that are not available, add them to the `JSONObject` we get from `payloadHelper.getJson()`.

JSONObject

You can alternatively use the JSONObject options given below.

Create an instance of the `Checkout` and pass the payment details and options as a `JSONObject`. Ensure that you add the `order_id` generated in [Step 3](/razorpay-docs-md/payment-gateway/android-integration/standard/integration-steps.md#13-create-an-order-in-server).

JavaKotlin

copy

```java
public void startPayment() {
  checkout.setKeyID("<YOUR_KEY_ID>");
  /**
   * Instantiate Checkout
   */
  Checkout checkout = new Checkout();

  /**
   * Set your logo here
   */
  checkout.setImage(R.drawable.logo);

  /**
   * Reference to current activity
   */
  final Activity activity = this;

  /**
   * Pass your payment options to the Razorpay Checkout as a JSONObject
   */
  try {
      JSONObject options = new JSONObject();

      options.put("name", "Merchant Name");
      options.put("description", "Reference No. #123456");
      options.put("image", "http://example.com/image/rzp.jpg");
      options.put("order_id", "order_DBJOWzybf0sJbb");//from response of step 3.
      options.put("theme.color", "#3399cc");
      options.put("currency", "");
      options.put("amount", "50000");//pass amount in currency subunits
      options.put("prefill.email", "gaurav.kumar@example.com");
      options.put("prefill.contact","+919876543210");
      JSONObject retryObj = new JSONObject();
      retryObj.put("enabled", true);
      retryObj.put("max_count", 4);
      options.put("retry", retryObj);

      checkout.open(activity, options);

  } catch(Exception e) {
    Log.e(TAG, "Error in starting Razorpay Checkout", e);
  }
}
```

**Handy Tips**

When you paste the checkout options given above, the following error message appears: '`TAG` has private access in `androidx.fragment.app.FragmentActivity`'. You can resolve this by adding the following code:

Resolve TAG has private access

copy

```java
public class MainActivity extends AppCompatActivity implements PaymentResultListener {
private static final String TAG = MainActivity.class.getSimpleName();
```

`Checkout.open()` launches the Checkout form where the customer completes the payment and returns the payment result via appropriate callbacks on the `PaymentResultListener`.

**Payment Options in JSONObject**:
All available options in the `Standard Web Checkout` are also available in Android.

Checkout Options

You must pass these parameters in Checkout to initiate the payment.

key

mandatory

`string` API Key ID generated from the Dashboard.

amount

mandatory

`integer` Payment amount in the smallest currency subunit. For example, if the amount to be charged is ₹2,222.50, enter `222250` in this field. In the case of three decimal currencies, such as KWD, BHD and OMR, to accept a payment of 295.991, pass the value as 295990. And in the case of zero decimal currencies such as JPY, to accept a payment of 295, pass the value as 295.

**Watch Out!**

As per payment guidelines, you should pass the last decimal number as 0 for three decimal currency payments. For example, if you want to charge a customer 99.991 KD for a transaction, you should pass the value for the amount parameter as `99990` and not `99991`.

currency

mandatory

`string` The currency in which the payment should be made by the customer. See the list of [supported currencies](/razorpay-docs-md/international-payments.md#supported-currencies).

**Handy Tips**

Razorpay has added support for zero decimal currencies, such as JPY, and three decimal currencies, such as KWD, BHD, and OMR, allowing businesses to accept international payments in these currencies. Know more about [Currency Conversion](/razorpay-docs-md/international-payments/currency-conversion.md)

(May 2024).

name

mandatory

`string` Your Business/Enterprise name shown on the Checkout form. For example, **Acme Corp**.

description

optional

`string` Description of the purchase item shown on the Checkout form. It should start with an alphanumeric character.

image

optional

`string` Link to an image (usually your business logo) shown on the Checkout form. Can also be a **base64** string if you are not loading the image from a network.

order\_id

mandatory

`string` Order ID generated via [Orders API](/razorpay-docs-md/api/orders.md).

prefill

`object` You can prefill the following details at Checkout.

**Boost Conversions and Minimise Drop-offs**

- Autofill customer contact details, especially phone number to ease form completion. Include customer’s phone number in the `contact` parameter of the JSON request's `prefill` object. Format: +(country code)(phone number). Example: "contact": "+919000090000".
- This is not applicable if you do not collect customer contact details on your website before checkout, have Shopify stores or use any of the no-code apps.

name

optional

`string` Cardholder's name to be prefilled if customer is to make card payments on Checkout. For example, **Gaurav Kumar**.

email

optional

`string` Email address of the customer.

contact

optional

`string` Phone number of the customer. The expected format of the phone number is `+ {country code}{phone number}`. If the country code is not specified, `91` will be used as the default value. This is particularly important while prefilling `contact` of customers with phone numbers issued outside India. **Examples**:

- +14155552671 (a valid non-Indian number)
- +919977665544 (a valid Indian number).
  If 9977665544 is entered, `+91` is added to it as +919977665544.

method

optional

`string` Pre-selection of the payment method for the customer. Will only work if `contact` and `email` are also prefilled. Possible values:

- `card`
- `netbanking`
- `wallet`
- `upi`
- `emi`

notes

optional

`object` Set of key-value pairs that can be used to store additional information about the payment. It can hold a maximum of 15 key-value pairs, each 256 characters long (maximum).

theme

`object` Thematic options to modify the appearance of Checkout.

color

optional

`string` Enter your brand colour's HEX code to alter the text, payment method icons and CTA (call-to-action) button colour of the Checkout form.

backdrop\_color

optional

`string` Enter a HEX code to change the Checkout's backdrop colour.

modal

`object` Options to handle the Checkout modal.

backdropclose

optional

`boolean` Indicates whether clicking the translucent blank space outside the Checkout form should close the form. Possible values:

- `true`: Closes the form when your customer clicks outside the checkout form.
- `false` (default): Does not close the form when customer clicks outside the checkout form.

escape

optional

`boolean` Indicates whether pressing the **escape** key should close the Checkout form. Possible values:

- `true` (default): Closes the form when the customer presses the **escape** key.
- `false`: Does not close the form when the customer presses the **escape** key.

handleback

optional

`boolean` Determines whether Checkout must behave similar to the browser when back button is pressed. Possible values:

- `true` (default): Checkout behaves similarly to the browser. That is, when the browser's back button is pressed, the Checkout also simulates a back press. This happens as long as the Checkout modal is open.
- `false`: Checkout does not simulate a back press when browser's back button is pressed.

confirm\_close

optional

`boolean` Determines whether a confirmation dialog box should be shown if customers attempts to close Checkout. Possible values:

- `true`: Confirmation dialog box is shown.
- `false` (default): Confirmation dialog box is not shown.

ondismiss

optional

`function` Used to track the status of Checkout. You can pass a modal object with `ondismiss: function()\{\}` as options. This function is called when the modal is closed by the user. If `retry` is `false`, the `ondismiss` function is triggered when checkout closes, even after a failure.

animation

optional

`boolean` Shows an animation before loading of Checkout. Possible values:

- `true`(default): Animation appears.
- `false`: Animation does not appear.

subscription\_id

optional

`string` If you are accepting recurring payments using Razorpay Checkout, you should pass the relevant `subscription_id` to the Checkout. Know more about [Subscriptions on Checkout](/razorpay-docs-md/api/payments/subscriptions.md#checkout-integration).

subscription\_card\_change

optional

`boolean` Permit or restrict customer from changing the card linked to the subscription. You can also do this from the [hosted page](/razorpay-docs-md/subscriptions/payment-retries.md#update-the-payment-method-via-our-hosted-page). Possible values:

- `true`: Allow the customer to change the card from Checkout.
- `false` (default): Do not allow the customer to change the card from Checkout.

recurring

optional

`boolean` Determines if you are accepting [recurring (charge-at-will) payments on Checkout](/razorpay-docs-md/api/payments/recurring-payments.md) via instruments such as emandate, paper NACH and so on. Possible values:

- `true`: You are accepting recurring payments.
- `false` (default): You are not accepting recurring payments.

callback\_url

optional

`string` Customers will be redirected to this URL on successful payment. Ensure that the domain of the Callback URL is allowlisted.

redirect

optional

`boolean` Determines whether to post a response to the event handler post payment completion or redirect to Callback URL. `callback_url` must be passed while using this parameter. Possible values:

- `true`: Customer is redirected to the specified callback URL in case of payment failure.
- `false` (default): Customer is shown the Checkout popup to retry the payment with the suggested next best option.

customer\_id

optional

`string` Unique identifier of customer. Used for:

- [Local saved cards feature](/razorpay-docs-md/payment-methods/cards/features/saved-cards.md#manage-saved-cards)

  .
- Static bank account details on Checkout in case of [Bank Transfer payment method](/razorpay-docs-md/payment-methods/bank-transfer.md)  .

remember\_customer

optional

`boolean` Determines whether to allow saving of cards. Can also be configured via the [Dashboard](/razorpay-docs-md/dashboard/account-settings/checkout-features.md#flash-checkout). Possible values:

- `true`: Enables card saving feature.
- `false` (default): Disables card saving feature.

timeout

optional

`integer` Sets a timeout on Checkout, in seconds. After the specified time limit, the customer will not be able to use Checkout.

**Watch Out!**

Some browsers may pause `JavaScript` timers when the user switches tabs, especially in power saver mode. This can cause the checkout session to stay active beyond the set timeout duration.

readonly

`object` Marks fields as read-only.

contact

optional

`boolean` Used to set the `contact` field as readonly. Possible values:

- `true`: Customer will not be able to edit this field.
- `false` (default): Customer will be able to edit this field.

email

optional

`boolean` Used to set the `email` field as readonly. Possible values:

- `true`: Customer will not be able to edit this field.
- `false` (default): Customer will be able to edit this field.

name

optional

`boolean` Used to set the `name` field as readonly. Possible values:

- `true`: Customer will not be able to edit this field.
- `false` (default): Customer will be able to edit this field.

hidden

`object` Hides the contact details.

contact

optional

`boolean` Used to set the `contact` field as optional. Possible values:

- `true`: Customer will not be able to view this field.
- `false` (default): Customer will be able to view this field.

email

optional

`boolean` Used to set the `email` field as optional. Possible values:

- `true`: Customer will not be able to view this field.
- `false` (default): Customer will be able to view this field.

send\_sms\_hash

optional

`boolean` Used to auto-read OTP for cards and netbanking pages. Applicable from Android SDK version 1.5.9 and above. Possible values:

- `true`: OTP is auto-read.
- `false` (default): OTP is not auto-read.

allow\_rotation

optional

`boolean` Used to rotate payment page as per screen orientation. Applicable from Android SDK version 1.6.4 and above. Possible values:

- `true`: Payment page can be rotated.
- `false` (default): Payment page cannot be rotated.

retry

optional

`object` Parameters that enable retry of payment on the checkout.

enabled

`boolean` Determines whether the customers can retry payments on the checkout. Possible values:

- `true` (default): Enables customers to retry payments.
- `false`: Disables customers from retrying the payment.

max\_count

`integer` The number of times the customer can retry the payment. We recommend you to set this to 4. Having a larger number here can cause loops to occur.

**Watch Out!**

Web Integration does not support the `max_count` parameter. It is applicable only in Android and iOS SDKs.

config

optional

`object` Parameters that enable checkout configuration. Know more about how to [configure payment methods on Razorpay standard checkout](/razorpay-docs-md/payment-gateway/web-integration/standard/configure-payment-methods.md).

display

`object` Child parameter that enables configuration of checkout display language.

language

`string` The language in which checkout should be displayed. Possible values:

- `en`: English
- `ben`: Bengali
- `hi`: Hindi
- `mar`: Marathi
- `guj`: Gujarati
- `tam`: Tamil
- `tel`: Telugu

**Handy Tips**

If you call the payment start method inside a fragment, ensure that the `fragment`'s parent `activity` implements the `PaymentResultListener` interface.

1.5 Handle Success and Error Events

You have the option to implement `PaymentResultListener` or `PaymentResultWithDataListener` to receive callbacks for the payment result.

- `PaymentResultListener` provides only `payment_id` as the payment result.
- `PaymentResultWithDataListener` provides additional payment data such as email and contact of the customer, along with the `order_id`, `payment_id`, `signature` and more.

Use the code below to import the function in your `.java` file. This should be added at the beginning of the file.

PaymentResultListenerPaymentResultWithDataListener

copy

```java
import com.razorpay.PaymentResultListener
```

1.5.1 Sample Code

Given below are the sample codes for implementation:

Java - PaymentResultListenerKotlin - PaymentResultListener

copy

```java
repositories {
    mavenCentral()
}

dependencies {
    implementation 'com.razorpay:checkout:1.6.40'
}
```0

Java - PaymentResultWithDataListenerKotlin - PaymentResultWithDataListener

copy

```java
repositories {
    mavenCentral()
}

dependencies {
    implementation 'com.razorpay:checkout:1.6.40'
}
```1

**Watch Out!**

- Razorpay's payment process takes place in a new activity. Since there are two activities involved, your activity can get corrupted or destroyed if the device is low on memory. These two methods should not depend on any variables not set through your life cycle hooks.
- It is recommended that you test everything by enabling "Don't Keep Activities" in **Developer Options** under **Settings**.

Error Codes

The error codes are returned in the `onPaymentError` method:

1.5.2 Erase User Data from SDK

The SDK stores customer-specific data such as email, contact number, and user-session cookies if the customer wants to make another payment in the same session. You can delete such sensitive information before another customer logs into the app.

To erase customer data from the app, you can call the following method anywhere in your app.

Erase Customer Data

copy

```java
repositories {
    mavenCentral()
}

dependencies {
    implementation 'com.razorpay:checkout:1.6.40'
}
```2

1.6 Store Fields in Your Server

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

1.7 Verify Payment Signature

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
repositories {
    mavenCentral()
}

dependencies {
    implementation 'com.razorpay:checkout:1.6.40'
}
```3
3. If the signature you generate on your server matches the `razorpay_signature` returned to you by the Checkout form, the payment received is from an authentic source.

Generate Signature on Your Server

Given below is the sample code for payment signature verification:

JavaPythonGoPHPRubyNode.js.NET

copy

```java
repositories {
    mavenCentral()
}

dependencies {
    implementation 'com.razorpay:checkout:1.6.40'
}
```4

Post Signature Verification

After you have completed the integration, you can [set up webhooks](/docs/webhooks/setup-edit-payments/), make test payments, replace the test key with the live key and integrate with other [APIs](/razorpay-docs-md/api/index.md).

1.8 Verify Payment Status

**Handy Tips**

On the Razorpay Dashboard, ensure that the payment status is `captured`. Refer to the payment capture settings page to know how to [capture payments automatically](/razorpay-docs-md/payments/capture-settings.md).

You can track the payment status in three ways:

Verify Status from Dashboard

Subscribe to Webhook Events

Poll APIs

To verify the payment status from the Razorpay Dashboard:

1. Log in to the Razorpay Dashboard and navigate to **Transactions** → **Payments**.
2. Check if a **Payment Id** has been generated and note the status. In case of a successful payment, the status is marked as **Captured**.

![Payment details on Dashboard](https://razorpay.com/docs/payments/payment-gateway/android-integration/standard/build/browser/assets/images/testpayment.jpg)

## 2. Test Integration

After the integration is complete, a **Pay** button appears on your webpage/app.

![Test integration on your webpage/app](https://razorpay.com/docs/payments/payment-gateway/android-integration/standard/build/browser/assets/images/test-int.gif)

Click the button and make a test transaction to ensure the integration is working as expected. You can start accepting actual payments from your customers once the test transaction is successful.

**Watch Out!**

This is a mock payment page that uses your test API keys, test card and payment details.

- Ensure you have entered only your [Test Mode API keys](/razorpay-docs-md/dashboard/account-settings/api-keys.md#generate-api-keys)

  in the Checkout code.
- Test mode features a mock bank page with **Success** and **Failure** buttons to replicate the live payment experience.
- No real money is deducted due to the usage of test API keys. This is a simulated transaction.

Following are all the payment modes that the customer can use to complete the payment on the Checkout. Some of them are available by default, while others may require approval from us. Raise a request from the Dashboard to enable such payment methods.

You can make test payments using one of the payment methods configured at the Checkout.

Netbanking

You can select any of the listed banks. After choosing a bank, Razorpay will redirect to a mock page where you can make the payment `success` or a `failure`. Since this is Test Mode, we will not redirect you to the bank login portals.

Check the list of [supported banks](/razorpay-docs-md/payment-methods/netbanking.md#supported-banks).

UPI

You can enter one of the following UPI IDs:

- `success@razorpay`: To make the payment successful.
- `failure@razorpay`: To fail the payment.

Check the list of [supported UPI flows](/razorpay-docs-md/payment-methods/upi.md).

**Handy Tips**

You can use **Test Mode** to test UPI payments, and **Live Mode** for UPI Intent and QR payments.

Cards

You can use the following test cards to test transactions for your integration in Test Mode.

### Domestic Cards

Use the following test cards for Indian payments:

#### Error Scenarios

Use these test cards to simulate payment errors. See the [complete list](/razorpay-docs-md/payments/test-card-details.md#error-scenario-test-cards) of error test cards with detailed scenarios.
Check the following lists:

- [Supported Card Networks](/razorpay-docs-md/payment-methods/cards.md)

  .
- [Cards Error Codes](/docs/errors/payments/cards/)

  .

### International Cards

Use the following test cards to test international payments. Use any valid expiration date in the future in the MM/YY format and any random CVV to create a successful payment.

Check the list of [supported card networks](/razorpay-docs-md/payment-methods/cards.md).

Wallet

You can select any of the listed wallets. After choosing a wallet, Razorpay will redirect to a mock page where you can make the payment `success` or a `failure`. Since this is Test Mode, we will not redirect you to the wallet login portals.

Check the list of [supported wallets](/razorpay-docs-md/payment-methods/wallets.md#supported-wallets).

## 3. Go-live Checklist

Check the go-live checklist for Razorpay Android Standard SDK. Consider these steps before taking the integration live.

3.1 Accept Live Payments

Perform an end-to-end simulation of funds flow in the Test Mode. Once confident that the integration is working as expected, switch to the Live Mode and start accepting payments from customers.

**Watch Out!**

Ensure you are switching your test API keys with API keys generated in Live Mode.

To generate API Keys in Live Mode on your Razorpay Dashboard:

1. Log in to the Razorpay Dashboard and switch to **Live Mode** on the menu.
2. Navigate to **Account & Settings** → **API Keys** → **Generate Key** to generate the API Key for Live Mode.
3. Download the keys and save them securely.
4. Replace the Test API Key with the Live Key in the Checkout code and start accepting actual payments.

3.2 Payment Capture

After payment is `authorized`, you need to capture it to settle the amount to your bank account as per the settlement schedule. Payments that are not captured are auto-refunded after a fixed time.

**Watch Out**

- You should deliver the products or services to your customers only after the payment is captured. Razorpay automatically refunds all the uncaptured payments.
- You can track the payment status using our [Fetch a Payment API](/razorpay-docs-md/api/payments.md#fetch-a-payment)

  or webhooks.

Auto-capture Payments (Recommended)

Manually Capture Payments

Authorized payments can be automatically captured. You can auto-capture all payments [using global settings](/razorpay-docs-md/payments/capture-settings.md#auto-capture-all-payments) on the Razorpay Dashboard. Know more about [capture settings for payments](/razorpay-docs-md/payments/capture-settings.md).

**Watch Out!**

Payment capture settings work only if you have integrated with Orders API on your server side. Know more about the [Orders API](/razorpay-docs-md/api/orders/create.md).

3.3 Set Up Webhooks

Ensure you have [set up webhooks](/docs/webhooks/setup-edit-payments/) in the live mode and configured the events for which you want to receive notifications.

**Implementation Considerations**

Webhooks are the primary and most efficient method for event notifications. They are delivered asynchronously in near real-time. For critical user-facing flows that need instant confirmation (like showing "Payment Successful" immediately), supplement webhooks with API verification.

**Recommended approach**

- Rely on webhooks for all automation, which can be asynchronous.
- If a critical user-facing flow requires instant status, but the webhook notification has not arrived within the time mandated by your business needs, perform an immediate API Fetch call ( [Payments](/razorpay-docs-md/api/payments/fetch-with-id.md)  , [Orders](/razorpay-docs-md/api/orders/fetch-with-id.md)

  and [Refunds](/razorpay-docs-md/api/refunds/fetch-specific-refund-payment.md)

  ) to verify the status.

### Related Information [Google Play's Data Safety](/razorpay-docs-md/payment-gateway/android-integration/standard/google-data-safety.md)
