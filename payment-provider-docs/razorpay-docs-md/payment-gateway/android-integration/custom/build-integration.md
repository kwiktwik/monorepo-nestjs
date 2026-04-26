<!-- Source: https://razorpay.com/docs/payments/payment-gateway/android-integration/custom/build-integration -->

Follow these steps to integrate your Android application with Razorpay Android Custom SDK:

**1.1** [Install Razorpay Android Custom SDK](/razorpay-docs-md/payment-gateway/android-integration/custom/build-integration.md#11-install-razorpay-android-custom-sdk).

**1.2** [Instantiate and Initialise Razorpay Android Custom SDK](/razorpay-docs-md/payment-gateway/android-integration/custom/build-integration.md#12-instantiate-and-initialise-razorpay-android-custom-sdk).

**1.3** [Create an Order in Server](/razorpay-docs-md/payment-gateway/android-integration/custom/build-integration.md#13-create-an-order-in-server).

**1.4** [Fetch Payment Methods](/razorpay-docs-md/payment-gateway/android-integration/custom/build-integration.md#14-fetch-payment-methods).

**1.5** [Set Up WebView](/razorpay-docs-md/payment-gateway/android-integration/custom/build-integration.md#15-set-up-webview).

**1.6** [Submit Payment Data and Handle Success and Error Events](/razorpay-docs-md/payment-gateway/android-integration/custom/build-integration.md#16-submit-payment-data-and-handle-success-and).

**1.7** [Store Fields in Your Server](/razorpay-docs-md/payment-gateway/android-integration/custom/build-integration.md#17-store-fields-in-your-server).

**1.8** [Verify Payment Signature](/razorpay-docs-md/payment-gateway/android-integration/custom/build-integration.md#18-verify-payment-signature).

**1.9** [Verify Payment Status](/razorpay-docs-md/payment-gateway/android-integration/custom/build-integration.md#19-verify-payment-status).

## 1.1 Install Razorpay Android Custom SDK

Follow the steps given below to install the SDK in your Android project:

- Add the code given below to your project's top-level `build.gradle` file:
   This gives access to the SDK library.

  Java

  copy

  ```java
dependencies {
implementation 'com.razorpay:customui:3.9.22'
}
```

  This adds the dependencies for the SDK.
- If you are using SDK version 3.9.5 or below, download the file and add it to the libs directory.

**Handy Tips**

From version 3.9.22 onwards, the latest version is automatically updated, eliminating the need for manual updates.

## 1.2 Instantiate and Initialise Razorpay Android Custom SDK

#### Instantiate

To instantiate Razorpay, pass a reference of your activity to the `Razorpay` constructor, as shown below:

java

copy

```java
import com.razorpay.Razorpay

Razorpay razorpay = new Razorpay(activity);
```

#### Proguard Rules

If you are using Proguard for your builds, you need to add the following lines to your `proguard-rules.pro` file.

Java

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

#### Initialise

Add your [API keys](/razorpay-docs-md/api/authentication.md#generate-api-keys) to `AndroidManifest.xml`.

**Watch Out!**

API keys should not be hardcoded in the app. It should be sent from your server-side as an app-related metadata fetch.

#### Sample Code

For additional support on Payment Methods, such as fetching bank or wallet logos, fetching card network and information on how to validate card information,

XML

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

**Handy Tips**

The auto-OTP reading feature is available only for saved cards. Know more about [saved cards](/razorpay-docs-md/dashboard/account-settings/checkout-features.md#flash-checkout).

To set your API key programmatically, that is, at the runtime instead of statically defining it in your `AndroidManifest.xml`, you can pass it as a parameter to the Razorpay constructor, as shown below:

java

copy

```java
Razorpay razorpay = new Razorpay(activity, "YOUR_KEY_ID");
```

## 1.3 Create an Order in Server

**Order is an important step in the payment process.**

- An order should be created for every payment.
- You can create an order using the [Orders API](/razorpay-docs-md/payment-gateway/android-integration/custom/build-integration.md#api-sample-code)  . It is a server-side API call. Know how to [authenticate](/razorpay-docs-md/dashboard/account-settings/api-keys.md#generate-api-keys)

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

## 1.4 Fetch Payment Methods

 You can accept payments through UPI, credit and debit cards, netbanking and wallets, as per the methods enabled on your account.

- When you use Razorpay Android Standard SDK, you do not have to handle the availability of different payment methods.
- When creating a Custom checkout form, you must ensure that only the methods activated for your account are displayed to the customer.

To get a list of available payment methods, call `getPaymentMethods`. This fetches the list of payment methods asynchronously and returns the result in JSON format in the `onPaymentMethodsReceived` callback.

#### Sample Code

The following is an API used to fetch all enabled payment methods for a given API Key ID:

Payment Methods API

copy

```java
https://api.razorpay.com/v1/methods?key_id=[Your_Key_ID]
```

JavaKotlin

copy

```java
razorpay.getPaymentMethods(new PaymentMethodsCallback() {
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

Check the various [payment methods](/razorpay-docs-md/payment-gateway/android-integration/custom/payment-methods.md) available with Razorpay Android Custom SDK.

**Handy Tips**

If you are using Subscriptions, you can pass the `subscription_id` in the options, which fetches subscription-related details along with the payment method. This saves you a network call to get amount for that `subscription_id`. Know more about [Subscriptions](/razorpay-docs-md/subscriptions.md).

## 1.5 Set Up WebView

The bank ACS pages are displayed to the user in a WebView.
You need to define a WebView in your layout and pass the reference to our SDK using `setWebView`, as shown below:

JavaKotlin

copy

```java
webview = findViewById(R.id.payment_webview);
// Hide the webview until the payment details are submitted
webview.setVisibility(View.GONE);
razorpay.setWebView(webview);
```

## 1.6 Submit Payment Data and Handle Success and Error Events

Once you have received the customer's payment information, it needs to be sent to our API to complete the `creation` step of the payment flow. You can do this by invoking `submit` method. Before invoking this method, you have to make your webview visible to the customer. The data that needs to be submitted in the form of a `JSONObject` is shown below.

JavaKotlin

copy

```java
import com.razorpay.Razorpay

Razorpay razorpay = new Razorpay(activity);
```0

Below is a complete list of Checkout form parameters:

key

mandatory

`string` API Key ID generated from **Dashboard** → **Account & Settings** → [API Keys](/razorpay-docs-md/dashboard/account-settings/api-keys.md#generate-api-keys).

amount

mandatory

`integer` The amount to be paid by the customer in currency subunits. For example, if the amount is ₹100, enter `10000`. In the case of three decimal currencies, such as KWD, BHD and OMR, to accept a payment of 295.991, pass the value as 295990. And in the case of zero decimal currencies such as JPY, to accept a payment of 295, pass the value as 295.

**Watch Out!**

As per payment guidelines, you should pass the last decimal number as 0 for three decimal currency payments. For example, if you want to charge a customer 99.991 KD for a transaction, you should pass the value for the amount parameter as `99990` and not `99991`.

currency

mandatory

`string` The currency in which the payment should be made by the customer. For example, `INR`. See the list of [supported currencies](/razorpay-docs-md/international-payments.md#supported-currencies).

**Handy Tips**

Razorpay has added support for zero decimal currencies, such as JPY, and three decimal currencies, such as KWD, BHD, and OMR, allowing businesses to accept international payments in these currencies. Know more about [Currency Conversion](/razorpay-docs-md/international-payments/currency-conversion.md)

(May 2024).

description

optional

`string` Description of the product shown in the Checkout form. It must start with an alphanumeric character.

image

optional

`string` Link to an image (usually your business logo) shown in the Checkout form. Can also be a **base64** string, if loading the image from a network is not desirable.

order\_id

mandatory

`string` Order ID generated via the [Orders API](/razorpay-docs-md/api/orders.md).

notes

optional

`object` Set of key-value pairs that can be used to store additional information about the payment. It can hold a maximum of 15 key-value pairs, each 256 characters long (maximum).

method

mandatory

`string` The payment method used by the customer on Checkout.
Possible values:

- `card` (default)
- `upi` (default)
- `netbanking` (default)
- `wallet` (default)
- `emi` (default)
- `cardless_emi` (requires [approval](https://razorpay.com/support/#request)

  )
- `paylater` (requires [approval](https://razorpay.com/support/#request)

  )
- `emandate` (requires [approval](https://razorpay.com/support/#request)

  )

card

mandatory if method=card/emi

`object` The details of the card that should be entered while making the payment.

number

`integer` Unformatted card number.

name

`string` The name of the cardholder.

expiry\_month

`integer` Expiry month for card in MM format.

expiry\_year

`integer` Expiry year for card in YY format.

cvv

`integer` CVV printed on the back of the card.

**Handy Tips**

- CVV is not required by default for tokenised cards across all networks.
- CVV is optional for tokenised card payments. Do not pass dummy CVV values.
- To implement this change, skip passing the `cvv` parameter entirely, or pass a `null` or empty value in the CVV field.
- We recommend removing the CVV field from your checkout UI/UX for tokenised cards.
- If CVV is still collected for tokenised cards and the customer enters a CVV, pass the entered CVV value to Razorpay.

emi\_duration

`integer` Defines the number of months in the EMI plan.

bank\_account

mandatory if method=emandate

The details of the bank account that should be passed in the request. These details include bank account number, IFSC code and the name of the customer associated with the bank account.

account\_number

`string` Bank account number used to initiate the payment.

ifsc

`string` IFSC of the bank used to initiate the payment.

name

`string` Name associated with the bank account used to initiate the payment.

bank

mandatory if method=netbanking

`string` Bank code. List of available banks enabled for your account can be fetched via [**methods**](/razorpay-docs-md/payment-gateway/web-integration/custom/payment-methods.md#fetch-supported-methods).

wallet

mandatory if method=wallet

`string` Wallet code for the wallet used for the payment. Possible values:

- `payzapp` (default)
- `olamoney` (requires [approval](https://razorpay.com/support/#request)

  )
- `phonepe` (requires [approval](https://razorpay.com/support/#request)

  )
- `airtelmoney` (requires [approval](https://razorpay.com/support/#request)

  )
- `mobikwik` (requires [approval](https://razorpay.com/support/#request)

  )
- `jiomoney` (requires [approval](https://razorpay.com/support/#request)

  )
- `amazonpay` (requires [approval](https://razorpay.com/support/#request)

  )
- `paypal` (requires [approval](https://razorpay.com/support/#request)

  )
- `phonepeswitch` (requires [approval](https://razorpay.com/support/#request)

  )

provider

mandatory if method=cardless\_emi/paylater

`string` Name of the cardless EMI provider partnered with Razorpay.

Available options for Cardless EMI (requires [approval](https://razorpay.com/support/#request)

):

- `hdfc`
- `icic`
- `idfb`
- `kkbk`
- `zestmoney`
- `earlysalary`
- `walnut369`

Available options for Pay Later:

- `lazypay`
- `paypal`

vpa

mandatory if method=upi

`string` UPI ID used for making the payment on the UPI app.

**Deprecation Notice**

UPI Collect is deprecated effective 28 February 2026. This tab is applicable only for exempted businesses. If you are not covered by the exemptions, refer to the [migration documentation](/docs/announcements/upi-collect-migration/custom-integration/) to switch to UPI Intent.

callback\_url

optional

`string` The URL to which the customer must be redirected upon completion of payment. The URL must accept incoming `POST` requests. The callback URL will have `razorpay_payment_id`, `razorpay_order_id` and `razorpay_signature` as the request parameters for a successful payment.

redirect

conditionally mandatory

`boolean` Determines whether customer should be redirected to the URL mentioned in the
`callback_url` parameter. This is mandatory if `callback_url` parameter is used. Possible values:

- `true`: Customer will be redirected to the `callback_url`.
- `false`: Customer will not be redirected to the `callback_url`

**Handy Tips**

To reuse the Razorpay Checkout web integration inside a web view on Android or iOS, pass a [callback\_url](/razorpay-docs-md/payment-gateway/callback-url.md) along with other checkout options to process the desired payment.

#### Use PaymentResultWithDataListener

You have the option to implement `PaymentResultListener` or `PaymentResultWithDataListener` to receive callbacks for the payment result.

- `PaymentResultListener` provides only `payment_id` as the payment result.
- `PaymentResultWithDataListener` provides additional payment data such as email and contact of the customer, along with the `order_id`, `payment_id`, `signature` and more.

JavaKotlin

copy

```java
import com.razorpay.Razorpay

Razorpay razorpay = new Razorpay(activity);
```1

## 1.7 Store Fields in Your Server

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

## 1.8 Verify Payment Signature

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
import com.razorpay.Razorpay

Razorpay razorpay = new Razorpay(activity);
```2
3. If the signature you generate on your server matches the `razorpay_signature` returned to you by the Checkout form, the payment received is from an authentic source.

Generate Signature on Your Server

Given below is the sample code for payment signature verification:

JavaPythonGoPHPRubyNode.js.NET

copy

```java
import com.razorpay.Razorpay

Razorpay razorpay = new Razorpay(activity);
```3

Post Signature Verification

After you have completed the integration, you can [set up webhooks](/docs/webhooks/setup-edit-payments/), make test payments, replace the test key with the live key and integrate with other [APIs](/razorpay-docs-md/api/index.md).

## 1.9 Verify Payment Status

**Handy Tips**

On the Razorpay Dashboard, ensure that the payment status is `captured`. Refer to the payment capture settings page to know how to [capture payments automatically](/razorpay-docs-md/payments/capture-settings.md).

You can track the payment status in three ways:

Verify Status from Dashboard

Subscribe to Webhook Events

Poll APIs

To verify the payment status from the Razorpay Dashboard:

1. Log in to the Razorpay Dashboard and navigate to **Transactions** → **Payments**.
2. Check if a **Payment Id** has been generated and note the status. In case of a successful payment, the status is marked as **Captured**.

![Payment details on Dashboard](https://razorpay.com/docs/payments/payment-gateway/android-integration/custom/build/browser/assets/images/testpayment.jpg)

## Integrate Payments Rainy Day Kit

Use Payments Rainy Day kit to overcome payments exceptions such as:

- [Late Authorisation](/razorpay-docs-md/payments/late-authorisation.md)
- [Payment Downtime](/razorpay-docs-md/api/payments/downtime.md)
- [Payment Errors](/docs/errors/)

## Next Steps [Step 2: Test Integration](/razorpay-docs-md/payment-gateway/android-integration/custom/test-integration.md)

### Related Information

- [Integrate With Android Custom SDK](/razorpay-docs-md/payment-gateway/android-integration/custom.md)
- [Payment Methods](/razorpay-docs-md/payment-gateway/android-integration/custom/payment-methods.md)
- [Troubleshooting & FAQs](/razorpay-docs-md/payment-gateway/android-integration/custom/troubleshooting-faqs.md)

- [Additional Support for Payment Methods](/razorpay-docs-md/payment-gateway/android-integration/custom/additional-features.md)
