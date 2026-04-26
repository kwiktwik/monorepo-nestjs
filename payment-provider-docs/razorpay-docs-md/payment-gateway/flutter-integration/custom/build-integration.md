<!-- Source: https://razorpay.com/docs/payments/payment-gateway/flutter-integration/custom/build-integration -->

Follow these steps to integrate your Flutter application with the Razorpay Payment Gateway:

**1.1** [Install Razorpay Flutter Plugin](/razorpay-docs-md/payment-gateway/flutter-integration/custom/build-integration.md#11-install-razorpay-flutter-plugin).

**1.2** [Add Dependencies](/razorpay-docs-md/payment-gateway/flutter-integration/custom/build-integration.md#12-add-dependencies).

**1.3** [Import Package](/razorpay-docs-md/payment-gateway/flutter-integration/custom/build-integration.md#13-import-package).

**1.4** [Create Razorpay instance](/razorpay-docs-md/payment-gateway/flutter-integration/custom/build-integration.md#14-create-razorpay-instance).

**1.5** [Attach Event Listeners](/razorpay-docs-md/payment-gateway/flutter-integration/custom/build-integration.md#15-attach-event-listeners).

**1.6** [Create an Order in Server](/razorpay-docs-md/payment-gateway/flutter-integration/custom/build-integration.md#16-create-an-order-in-server).

**1.7** [Add Checkout Options](/razorpay-docs-md/payment-gateway/flutter-integration/custom/build-integration.md#17-add-checkout-options).

**1.8** [Open Checkout](/razorpay-docs-md/payment-gateway/flutter-integration/custom/build-integration.md#18-open-checkout).

**1.9** [Store Fields in Your Server](/razorpay-docs-md/payment-gateway/flutter-integration/custom/build-integration.md#19-store-fields-in-your-server).

**1.10** [Verify Payment Signature](/razorpay-docs-md/payment-gateway/flutter-integration/custom/build-integration.md#110-verify-payment-signature).

**1.11** [Verify Payment Status](/razorpay-docs-md/payment-gateway/flutter-integration/custom/build-integration.md#111-verify-payment-status).

**Handy Tips**

After you complete the integration:

- Set up webhooks
- Make test payments
- Replace Test API keys with Live API keys
- Integrate with other APIs
  Refer to the [post-integration steps](/razorpay-docs-md/payment-gateway/flutter-integration/custom/test-integration.md)  .

**Watch Out!**

If you use M1 MacBook, you need to make [these changes](/razorpay-docs-md/payment-gateway/flutter-integration/custom/build-integration.md#m1-macbook-changes) in your `podfile`.

## 1.1 Install Razorpay Flutter Plugin [Download the plugin](https://pub.dev/packages/razorpay_flutter_customui) from Pub.dev.

## 1.2 Add Dependencies

Add the below code to `dependencies` in your app's `pubspec.yaml`:

Add Dependencies

copy

```yml
razorpay_flutter_customui: 1.0.0
```

#### Add Proguard Rules (Android Only)

If you are using Proguard for your builds, you need to add the following lines to the Proguard files:

Add Proguard Rules

copy

```java
-keepattributes *Annotation*
-dontwarn com.razorpay.**
-keep class com.razorpay.** {*;}
-optimizations !method/inlining/
-keepclasseswithmembers class * {
  public void onPayment*(...);
}
```

Know more about [Proguard rules](https://github.com/razorpay/razorpay-flutter/issues/42#issuecomment-550161626).

#### Get Packages

Run `flutter packages get` in the root directory of your app.

**Handy Tips**

- For **Android**, ensure that the minimum API level for your app is 19 or higher.
- For **iOS**, ensure that the minimum deployment target for your app is iOS 10.0 or higher. Also, do not forget to enable bitcode for your project.

## 1.3 Import Package

Use the below code to import the `razorpay_flutter_customui.dart` file to your project:

Import Package

copy

```yml
import 'package:razorpay_flutter_customui/razorpay_flutter_customui.dart';
```

## 1.4 Create Razorpay instance

For Android, use the below code to create a Razorpay instance:

Instantiate

copy

```java
_razorpay = Razorpay();
```

For iOS, you need to initialise and instantiate the SDK using the following method:

Initialise and Instantiate

copy

```swift
@override
void initState() {
  _razorpay = Razorpay();
  _razorpay.initializeSDK(key);
}
```

## 1.5 Attach Event Listeners

The plugin uses event-based communication and emits events when payments fail or succeed.

- The event names are exposed via the constants `EVENT_PAYMENT_SUCCESS` and `EVENT_PAYMENT_ERROR` from the `Razorpay` class.
- Use the `on(String event, Function handler)` method on the Razorpay instance to attach event listeners.

Attach Event Listeners

copy

```yml
_razorpay.on(Razorpay.EVENT_PAYMENT_SUCCESS, _handlePaymentSuccess);
_razorpay.on(Razorpay.EVENT_PAYMENT_ERROR, _handlePaymentError);
```

The handlers would be defined in the class as:

Handlers

copy

```yml
void _handlePaymentSuccess(PaymentSuccessResponse response) {
  // Do something when payment succeeds
}

void _handlePaymentError(PaymentFailureResponse response) {
  // Do something when payment fails
}
```

## 1.6 Create an Order in Server

**Order is an important step in the payment process.**

- An order should be created for every payment.
- You can create an order using the [Orders API](/razorpay-docs-md/payment-gateway/flutter-integration/custom/build-integration.md#api-sample-code)  . It is a server-side API call. Know how to [authenticate](/razorpay-docs-md/dashboard/account-settings/api-keys.md#generate-api-keys)

  Orders API.
- The `order_id` received in the response should be passed to the checkout. This ties the order with the payment and secures the request from being tampered.

**Watch Out!**

Payments made without an `order_id` cannot be captured and will be automatically refunded. You must create an order before initiating payments to ensure proper payment processing.

You can create an order:

- Using the sample code on the Razorpay Postman Public Workspace.
- By manually integrating the API sample codes on your server.

#### Razorpay Postman Public Workspace

You can use the Postman workspace below to create an order: [![Run in Postman](https://run.pstmn.io/button.svg)](https://www.postman.com/razorpaydev/workspace/razorpay-public-workspace/request/12492020-6f15a901-06ea-4224-b396-15cd94c6148d)

**Handy Tips**

Under the **Authorization** section in Postman, select **Basic Auth** and add the Key Id and secret as the Username and Password, respectively.

#### API Sample Code

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
 "amount": 500,
 "currency": "INR",
 "receipt": "qwsaq1",
 "partial_payment": true,
 "first_payment_min_amount": 230,
 "notes": {
   "key1": "value3",
   "key2": "value2"
 }
}'
```

Success ResponseFailure Response

copy

```json
{
 "id": "order_IluGWxBm9U8zJ8",
 "entity": "order",
 "amount": 5000,
 "amount_paid": 0,
 "amount_due": 5000,
 "currency": "INR",
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

`integer` Payment amount in the smallest currency subunit. For example, if the amount to be charged is ₹299, then pass `29900` in this field. In the case of three decimal currencies, such as KWD, BHD and OMR, to accept a payment of 295.991, pass the value as 295990. And in the case of zero decimal currencies such as JPY, to accept a payment of 295, pass the value as 295.

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

first\_payment\_min\_amount

optional

`integer` Minimum amount that must be paid by the customer as the first partial payment. For example, if an amount of ₹7,000 is to be received from the customer in two installments of #1 - ₹5,000, #2 - ₹2,000 then you can set this value as `500000`. This parameter should be passed only if `partial_payment` is `true`.

Know more about [Orders API](/razorpay-docs-md/api/orders.md).

Response Parameters

Descriptions for the response parameters are present in the [Orders Entity](/razorpay-docs-md/api/orders/entity.md) parameters table.

Error Response Parameters

The error response parameters are available in the [API Reference Guide](/razorpay-docs-md/api/orders/create.md).

## 1.7 Add Checkout Options

Pass the Checkout options. Ensure that you pass the `order_id` that you received in the response of the previous step.

Checkout Options

copy

```yml
var options = {
                "key": key,
                "amount": 29935,
                "currency": "",
                "contact": "+919876543210",
                "email": "gaurav.kumar@example.com",
                "order_id": "order_EMBFqjDHEEn80l", // Generate order_id using Orders API
                "description": "Fine T-Shirt",
                "method": "card",
                "card[name]": "Test User",
                "card[number]": "card number",
                "card[expiry_month]": 11,
                "card[expiry_year]": 30,
                "card[cvv]": <CVV>
            };
        _razorpay.submit(options);
```

You must pass these parameters in Checkout to initiate the payment.

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

#### Enable UPI Intent on iOS

Provide your customers with a better payment experience by enabling UPI Intent on your app's Checkout form. In the UPI Intent flow:

1. Customer selects UPI as the payment method in your iOS app. A list of UPI apps supporting the intent flow is displayed. For example, PhonePe, Google Pay and Paytm.
2. Customer selects the preferred app. The UPI app opens with pre-populated payment details.
3. Customer enters their UPI PIN to complete their transactions.
4. Once the payment is successful, the customer is redirected to your app or website.

To enable this in your iOS integration, you must make the following changes in your app's info.plist file.

info.plist

copy

```java
-keepattributes *Annotation*
-dontwarn com.razorpay.**
-keep class com.razorpay.** {*;}
-optimizations !method/inlining/
-keepclasseswithmembers class * {
  public void onPayment*(...);
}
```0

Know more about [UPI Intent and its benefits](/razorpay-docs-md/payment-methods/upi/upi-intent.md).

### UPI Intent on Recurring Payments

Configure and initiate a recurring payment transaction on UPI Intent:

ViewController.swiftViewController.m

copy

```java
-keepattributes *Annotation*
-dontwarn com.razorpay.**
-keep class com.razorpay.** {*;}
-optimizations !method/inlining/
-keepclasseswithmembers class * {
  public void onPayment*(...);
}
```1

## 1.8 Open Checkout

Use the below code to open the Razorpay checkout:

Open Razorpay Checkout

copy

```java
-keepattributes *Annotation*
-dontwarn com.razorpay.**
-keep class com.razorpay.** {*;}
-optimizations !method/inlining/
-keepclasseswithmembers class * {
  public void onPayment*(...);
}
```2

## 1.9 Store Fields in Your Server

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

## 1.10 Verify Payment Signature

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
-keepattributes *Annotation*
-dontwarn com.razorpay.**
-keep class com.razorpay.** {*;}
-optimizations !method/inlining/
-keepclasseswithmembers class * {
  public void onPayment*(...);
}
```3
3. If the signature you generate on your server matches the `razorpay_signature` returned to you by the Checkout form, the payment received is from an authentic source.

Generate Signature on Your Server

Given below is the sample code for payment signature verification:

JavaPythonGoPHPRubyNode.js.NET

copy

```java
-keepattributes *Annotation*
-dontwarn com.razorpay.**
-keep class com.razorpay.** {*;}
-optimizations !method/inlining/
-keepclasseswithmembers class * {
  public void onPayment*(...);
}
```4

Post Signature Verification

After you have completed the integration, you can [set up webhooks](/docs/webhooks/setup-edit-payments/), make test payments, replace the test key with the live key and integrate with other [APIs](/razorpay-docs-md/api/index.md).

#### M1 MacBook Changes

If you use M1 MacBook, you need to make the following changes in your podfile.

**Handy Tips**

Add the following code inside `post_install do |installer|`.

podfile

copy

```java
-keepattributes *Annotation*
-dontwarn com.razorpay.**
-keep class com.razorpay.** {*;}
-optimizations !method/inlining/
-keepclasseswithmembers class * {
  public void onPayment*(...);
}
```5

## 1.8 Verify Payment Status

**Handy Tips**

On the Razorpay Dashboard, ensure that the payment status is `captured`. Refer to the payment capture settings page to know how to [capture payments automatically](/razorpay-docs-md/payments/capture-settings.md).

You can track the payment status in three ways:

Verify Status from Dashboard

Subscribe to Webhook Events

Poll APIs

To verify the payment status from the Razorpay Dashboard:

1. Log in to the Razorpay Dashboard and navigate to **Transactions** → **Payments**.
2. Check if a **Payment Id** has been generated and note the status. In case of a successful payment, the status is marked as **Captured**.

![Payment details on Dashboard](https://razorpay.com/docs/payments/payment-gateway/flutter-integration/custom/build/browser/assets/images/testpayment.jpg)

## Next Steps [Step 2: Test Integration](/razorpay-docs-md/payment-gateway/flutter-integration/custom/test-integration.md)
