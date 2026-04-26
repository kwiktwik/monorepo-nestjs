<!-- Source: https://razorpay.com/docs/payments/payment-gateway/android-integration/custom/payment-methods -->

The Razorpay Android Custom SDK lets you integrate the supported payment methods on your Android app's Checkout form.

## Fetch Payment Methods

Use the [Fetch Payment Methods API](/razorpay-docs-md/payment-gateway/android-integration/custom/build-integration.md#14-fetch-payment-methods) to fetch the payment methods available for your account.

Below are the sample payloads for each payment method.

## Bank Transfer

This payment method allows you to display your Customer Identifier details on checkout. Your customers can make online bank transfers to this account.

**Feature Request**

This is an on-demand feature. Please raise a request with our [Support team](https://razorpay.com/support/#request) to get this feature activated on your Razorpay account.

There are no specific request parameters to be passed. Instead, you must pass the `fetchVirtualAccount` method for your Customer Identifier to get created and the details to appear on the checkout. Know more about [integrating bank transfer with Custom Checkout](/razorpay-docs-md/payment-methods/bank-transfer/custom-integration.md).

## Debit and Credit Card

For Card payments, `method` should be specified as `card`. Other required fields:

- `card[name]`
- `card[number]`
- `card[cvv]`
- `card[expiry_month]`
- `card[expiry_year]`

#### Sample Code

The sample code shown below allows the checkout to accept a card payment of ₹299.35.

JavaKotlin

copy

```java
JSONObject data = new JSONObject();
data.put("amount", 29935);
data.put("currency", "");
data.put("order_id", "order_DgZ26rHjbzLLY2");//sample order_id. Generate orders using Orders API
data.put("email", "gaurav.kumar@example.com");
data.put("contact", "+919876543210");
data.put("method", "card");
data.put("card[name]", "Gaurav Kumar");
data.put("card[number]", "4628 9499 7226 2986");
data.put("card[expiry_month]", "12");
data.put("card[expiry_year]", "30");
data.put("card[cvv]", "100");
```

Check the [list of supported cards](/razorpay-docs-md/payment-gateway/web-integration/standard/configure-payment-methods/supported-methods.md#supported-cards).

If you want to securely store customer's card details as network tokens, know about [Saved Cards feature](/razorpay-docs-md/payment-gateway/web-integration/custom/features/saved-cards.md).

## EMI on Debit and Credit Cards

For EMI, `method` should be specified as `emi`. Add an additional field, `emi_duration`, corresponding to the number of months for EMI. After a customer selects the desired plan, pass the corresponding value in the `emi_duration` field.

#### Sample Code

The sample code below allows checkout to accept a card payment of ₹3999.35:

JavaKotlin

copy

```java
JSONObject data = new JSONObject();
data.put("amount", 399935);
data.put("order_id", "order_DgZ26rHjbzLLY2");//sample order_id. Generate orders using Orders API
data.put("email", "gaurav.kumar@example.com");
data.put("contact", "+919876543210");
data.put("method", "emi");
data.put("emi_duration", 2); //defines the number of months for the EMI.
data.put("card[name]", "Gaurav Kumar");
data.put("card[number]", "4628 9499 7226 2986");
data.put("card[expiry_month]", "12");
data.put("card[expiry_year]", "30");
data.put("card[cvv]", "100");
```

Check the list of supported [debit card](/razorpay-docs-md/payment-methods/emi/debit-card-emi.md#supported-banks-for-debit-card-emis) and [credit card](/razorpay-docs-md/payment-methods/emi/credit-card-emi.md#supported-payment-partners)

EMI providers.

## Cardless EMI

Cardless EMI is a payment method that allows customers to convert their payment amount to EMIs. The customer does not require a debit or credit card. They can make payments via credits approved by the supported Cardless EMI payment provider.
For Cardless EMI, `method` should be specified as `cardless_emi` and an additional field `provider` must specify the provider with its respective provider code.

**Feature Request**

This is an on-demand feature. Please raise a request with our [Support team](https://razorpay.com/support/#request) to get this feature activated on your Razorpay account.

**Watch Out!**

The customer should be registered with the cardless EMI payment provider before making the payment.

#### Sample Code

The sample code below allows checkout to accept a card payment of ₹5999.35:

JavaKotlin

copy

```java
JSONObject payload = new JSONObject("{\"currency\":\"\"}");
payload.put("amount", 599935);
payload.put("contact", "+919876543210");
payload.put("order_id", "order_9A33XWu170gUtm");
payload.put("email", "gaurav.kumar@example.com");
payload.put("method", "cardless_emi");
payload.put("provider", "walnut369");
```

Check the [list of supported Cardless EMI providers](/razorpay-docs-md/payment-methods/emi/cardless-emi.md#supported-payment-partners).

## Netbanking

For Netbanking, `method` should be specified as `netbanking` and an additional field `bank` must specify the bank with its respective bank code.

#### Sample Code

The sample code shown below allows the checkout to perform a netbanking transaction for a payment of ₹299.35:

JavaKotlin

copy

```java
JSONObject data = new JSONObject();
data.put("amount", 29935);
data.put("order_id", "order_DgZ26rHjbzLLY2");//sample order_id. Generate orders using Orders API
data.put("email", "gaurav.kumar@example.com");
data.put("contact", "+919876543210");
data.put("method", "netbanking");
data.put("bank", "SBIN");
```

Check the [list of supported banks](/razorpay-docs-md/payment-methods/netbanking.md#supported-banks).

## Pay Later

You can enable your customers to make payments using the **Pay Later** service offered by various third-party providers.
For pay later, `method` should be specified as `paylater` and an additional field `provider` must specify the provider with its respective provider code.

#### Sample Code

Use the sample code given below:

JavaKotlin

copy

```java
JSONObject payload = new JSONObject("{\"currency\":\"\"}");
payload.put("amount",5000);
payload.put("contact","+919876543210");
payload.put("order_id","order_9A33XWu170gUtm");
payload.put("email", "gaurav.kumar@example.com");
payload.put("method", "paylater");
payload.put("provider", "lazypay");
```

Check the [list of Pay Later providers](/razorpay-docs-md/payment-methods/pay-later.md#providers).

## Wallet

For Wallet payments, `method` should be specified as `wallet`.

#### Sample Code

The sample code shown below allows the checkout to perform a wallet transaction for a payment of ₹299.35 :

JavaKotlin

copy

```java
JSONObject data = new JSONObject();
data.put("amount", 29935);
data.put("order_id", "order_DgZ26rHjbzLLY2");//sample order_id. Generate orders using Orders API
data.put("email", "gaurav.kumar@example.com");
data.put("contact", "+919876543210");
data.put("method", "wallet");
data.put("wallet", "mobikwik");
```

Check the list [Wallets supported by Razorpay](/razorpay-docs-md/payment-methods/wallets.md#supported-wallets).

## UPI

For UPI payments, `method` should be specified as `upi`. The SDK supports two flows:

1. Intent
2. Collect

**UPI Collect Flow Deprecated**

According to NPCI guidelines, the UPI Collect flow is being deprecated effective 28 February 2026. Customers can no longer make payments or register UPI mandates by manually entering VPA/UPI id/mobile numbers.

**Exemptions:** UPI Collect will continue to be supported for:

- MCC 6012 & 6211 (IPO and secondary market transactions).
- iOS mobile app and mobile web transactions.
- UPI Mandates (execute/modify/revoke operations only)
- eRupi vouchers.
- PACB businesses (cross-border/international payments).

**Action Required:**

- If you are a new Razorpay user, use [UPI Intent](/razorpay-docs-md/payment-gateway/web-integration/custom/payment-methods.md#intent-flow)  .
- If you are an existing Razorpay user not covered by exemptions, you must migrate to UPI Intent or UPI QR code to continue accepting UPI payments. For detailed migration steps, refer to the [migration documentation](/docs/announcements/upi-collect-migration/custom-integration/)  .

#### Intent Flow

**Handy Tips**

If your application targetSdkVersion is 30 or above, add the following code in your app's manifest file to support the UPI Intent flow.

AndroidManifest.xml

copy

```xml
<queries>
    <!-- List of apps which you want to support for Intent pay -->
    <package android:name="com.google.android.apps.nbu.paisa.user" />
    <package android:name="com.phonepe.app"/>

    <!--
         Specific intents you query for,
         eg: for a custom share UI
    -->
    <intent>
        <action android:name="android.intent.action.SEND" />
    </intent>
</queries>
```

In Intent Flow, the SDK invokes a UPI intent, which is handled by the UPI apps installed on the Android device.

To implement this flow:

1. Fetch a list of apps on the customer's device that support UPI payments and Autopay using the sample codes given below:

   - Fetch list of UPI Supported Apps

     JavaKotlin

     copy

     ```java
Razorpay.getAppsWhichSupportUpi(this, new RzpUpiSupportedAppsCallback() {
    @Override
    public void onReceiveUpiSupportedApps(List<ApplicationDetails> list) {
        // List of upi supported app
    }
});
```
   - Fetch list of UPI Autopay Supported Apps

     JavaKotlin

     copy

     ```java
Razorpay.getAppsWhichSupportAutopayIntent(this, new RzpUpiSupportedAppsCallback() {
    @Override
    public void onReceiveUpiSupportedApps(List<ApplicationDetails> applicationDetailsList) {
    }
});
```
2. Override the `onActivityResult()` of your activity and pass the same to our SDK:

   JavaKotlin

   copy

   ```java
@Override
protected void onActivityResult(int requestCode, int resultCode, Intent data){
super.onActivityResult(requestCode, resultCode, data);
    if(razorpay!=null){
    razorpay.onActivityResult(requestCode,resultCode,data);
    }
}
```
3. Invoke the UPI and UPI Autopay Intent with the sample codes given below. This will enable the customer to select the desired application.

   - Invoke UPI Intent

     JavaKotlin

     copy

     ```java
JSONObject data = new JSONObject();
data.put("amount", 399935);
data.put("order_id", "order_DgZ26rHjbzLLY2");//sample order_id. Generate orders using Orders API
data.put("email", "gaurav.kumar@example.com");
data.put("contact", "+919876543210");
data.put("method", "emi");
data.put("emi_duration", 2); //defines the number of months for the EMI.
data.put("card[name]", "Gaurav Kumar");
data.put("card[number]", "4628 9499 7226 2986");
data.put("card[expiry_month]", "12");
data.put("card[expiry_year]", "30");
data.put("card[cvv]", "100");
```0
   - Invoke UPI Autopay Intent (Default)

     JavaKotlin

     copy

     ```java
JSONObject data = new JSONObject();
data.put("amount", 399935);
data.put("order_id", "order_DgZ26rHjbzLLY2");//sample order_id. Generate orders using Orders API
data.put("email", "gaurav.kumar@example.com");
data.put("contact", "+919876543210");
data.put("method", "emi");
data.put("emi_duration", 2); //defines the number of months for the EMI.
data.put("card[name]", "Gaurav Kumar");
data.put("card[number]", "4628 9499 7226 2986");
data.put("card[expiry_month]", "12");
data.put("card[expiry_year]", "30");
data.put("card[cvv]", "100");
```1
   - Preferred Payload for Recurring: In the sample code below, `recurring` is passed as `preferred`. It initiates a flow in SDK where, if a selected app supports Autopay payments, the payment passes via the Autopay payment route. If it does not, then it passes via the one-time payment route.

     JavaKotlin

     copy

     ```java
JSONObject data = new JSONObject();
data.put("amount", 399935);
data.put("order_id", "order_DgZ26rHjbzLLY2");//sample order_id. Generate orders using Orders API
data.put("email", "gaurav.kumar@example.com");
data.put("contact", "+919876543210");
data.put("method", "emi");
data.put("emi_duration", 2); //defines the number of months for the EMI.
data.put("card[name]", "Gaurav Kumar");
data.put("card[number]", "4628 9499 7226 2986");
data.put("card[expiry_month]", "12");
data.put("card[expiry_year]", "30");
data.put("card[cvv]", "100");
```2

Check the complete list of [UPI supported apps and their package names](/razorpay-docs-md/payment-methods/upi/supported-apps.md).

#### Customise Order of Apps

In the Intent Flow, you can customise the order in which UPI apps appear at the Checkout. There are two sections within the app: **Preferred Apps** and **Other Apps**.

To define the order in which apps appear under these sections of the app chooser, two lists that contain the application package names must be passed to the SDK within `options`.

1. Preferred apps list
2. Other apps list

**PREFERRED APPS Section**

This section displays the list of applications specified using the key `preferred_apps_order` within options. If no application exists for this key, this section is not displayed.

**OTHER APPS Section**

The list of applications specified using the key `other_apps_order` within options is displayed under this section. Any unspecified app (which supports UPI intent) appears subsequent to the list passed in the options.

#### Sample Code

In the sample code below, **BHIM** (in.org.npci.upiapp) is passed in the **preferred apps list** and **Google Pay**(com.google.android.apps.nbu.paisa.user) in *other apps list*. As a result, *BHIM* is shown in the **PREFERRED APPS SECTION**. **Google Pay** is shown at the top in the **OTHER APPS SECTION** followed by other apps present in the device:

Java

copy

```java
JSONObject data = new JSONObject();
data.put("amount", 399935);
data.put("order_id", "order_DgZ26rHjbzLLY2");//sample order_id. Generate orders using Orders API
data.put("email", "gaurav.kumar@example.com");
data.put("contact", "+919876543210");
data.put("method", "emi");
data.put("emi_duration", 2); //defines the number of months for the EMI.
data.put("card[name]", "Gaurav Kumar");
data.put("card[number]", "4628 9499 7226 2986");
data.put("card[expiry_month]", "12");
data.put("card[expiry_year]", "30");
data.put("card[cvv]", "100");
```3

#### Collect Flow

Customers enter their `vpa` or [phone number](/razorpay-docs-md/payment-gateway/android-integration/custom/payment-methods.md#upi-payments-using-phone-number) on your UI and complete the payments on their respective UPI apps in collect flow.

You can now pass the `vpa` parameter in the `upi` array as shown below.

#### Sample Code

The sample code below sends a collect request to `gaurav.kumar@exampleupi` handle.

JavaKotlin

copy

```java
JSONObject data = new JSONObject();
data.put("amount", 399935);
data.put("order_id", "order_DgZ26rHjbzLLY2");//sample order_id. Generate orders using Orders API
data.put("email", "gaurav.kumar@example.com");
data.put("contact", "+919876543210");
data.put("method", "emi");
data.put("emi_duration", 2); //defines the number of months for the EMI.
data.put("card[name]", "Gaurav Kumar");
data.put("card[number]", "4628 9499 7226 2986");
data.put("card[expiry_month]", "12");
data.put("card[expiry_year]", "30");
data.put("card[cvv]", "100");
```4

UPI Payments Using Phone Number

You can accept UPI payments using phone number for the collect flow. Follow the steps given below:

1. You must collect the customer's phone number from your end.
2. Check if any `vpa` is associated with the given number and get the `vpa_token` for that number using the sample code given below:

   JavaKotlin

   copy

   ```java
JSONObject data = new JSONObject();
data.put("amount", 399935);
data.put("order_id", "order_DgZ26rHjbzLLY2");//sample order_id. Generate orders using Orders API
data.put("email", "gaurav.kumar@example.com");
data.put("contact", "+919876543210");
data.put("method", "emi");
data.put("emi_duration", 2); //defines the number of months for the EMI.
data.put("card[name]", "Gaurav Kumar");
data.put("card[number]", "4628 9499 7226 2986");
data.put("card[expiry_month]", "12");
data.put("card[expiry_year]", "30");
data.put("card[cvv]", "100");
```5
3. Pass the `vpa_token` parameter in the `upi` array as shown below:

   JavaKotlin

   copy

   ```java
JSONObject data = new JSONObject();
data.put("amount", 399935);
data.put("order_id", "order_DgZ26rHjbzLLY2");//sample order_id. Generate orders using Orders API
data.put("email", "gaurav.kumar@example.com");
data.put("contact", "+919876543210");
data.put("method", "emi");
data.put("emi_duration", 2); //defines the number of months for the EMI.
data.put("card[name]", "Gaurav Kumar");
data.put("card[number]", "4628 9499 7226 2986");
data.put("card[expiry_month]", "12");
data.put("card[expiry_year]", "30");
data.put("card[cvv]", "100");
```6

#### Turbo UPI

Make UPI payments a faster, 2-step experience for your customers with Razorpay's Turbo UPI SDK.

1. [Turbo UPI Headless Integration](/razorpay-docs-md/payment-gateway/android-integration/custom/payment-methods/turbo-upi/integration-noui.md)
2. [Turbo UPI UI Integration](/razorpay-docs-md/payment-gateway/android-integration/custom/payment-methods/turbo-upi/integration-ui.md)

Know more about the [Customer Onboarding](/razorpay-docs-md/payment-gateway/android-integration/custom/payment-methods/turbo-upi.md).

## CRED

Customers can make payments on your Android app using their CRED Coins as well as the credit cards saved on CRED. The SDK supports two flows:

1. [Intent](/razorpay-docs-md/payment-gateway/android-integration/custom/payment-methods.md#intent-flow-1)
2. [Collect](/razorpay-docs-md/payment-gateway/android-integration/custom/payment-methods.md#collect-flow-1)

**Handy Tips**

Ensure you have integrated with Razorpay Android SDK version 3.9.0 or higher.

#### Prerequisites

You need to pass the `app_offer` parameter in the Orders API.

POST

/orders

CurlJavaPythongoPHPRubyNode.js.NETResponse

copy

```java
JSONObject data = new JSONObject();
data.put("amount", 399935);
data.put("order_id", "order_DgZ26rHjbzLLY2");//sample order_id. Generate orders using Orders API
data.put("email", "gaurav.kumar@example.com");
data.put("contact", "+919876543210");
data.put("method", "emi");
data.put("emi_duration", 2); //defines the number of months for the EMI.
data.put("card[name]", "Gaurav Kumar");
data.put("card[number]", "4628 9499 7226 2986");
data.put("card[expiry_month]", "12");
data.put("card[expiry_year]", "30");
data.put("card[cvv]", "100");
```7

#### Request Parameters

amount

mandatory

`integer` The transaction amount, expressed in the currency subunit, such as paise (in case of INR). For example, for an actual amount of ₹299.35, the value of this field should be `29935`.

currency

mandatory

`string` The currency in which the transaction should be made. See the [list of supported currencies](/razorpay-docs-md/international-payments.md#supported-currencies). Default is `INR`.

app\_offer

optional

`boolean` Allow/do not allow customers to use CRED coins to make payments. This is used to prevent double discounting scenarios where customers have already availed discounts using voucher/coupon, and you do not want them to redeem Coins as well. Possible values:

- `true`: Customer not allowed to use CRED coins to make payment.
- `false` (default): Customer can use CRED coins to make payment.

receipt

optional

`string` Your receipt id for this order should be passed here. Maximum length is 40 characters.

notes

optional

`object` Key-value pair that can be used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

#### Intent Flow

The Android SDK performs the following functions to invoke the intent on the Android device:

- Handles the intent response from CRED
- Opens the CRED app
- Process the payment
- Send success or failure response back to your app

To use this flow:

1. [Detect presence of CRED app on customer's Android device](/razorpay-docs-md/payment-gateway/android-integration/custom/payment-methods.md#1-detect-presence-of-cred-app)

   .
2. [Create a payment](/razorpay-docs-md/payment-gateway/android-integration/custom/payment-methods.md#2-create-payment)

   .
3. [Implement PaymentResultWithDataListener Method](/razorpay-docs-md/payment-gateway/android-integration/custom/payment-methods.md#3-implement-paymentresultwithdatalistener-method)

   .

#### 1. Detect Presence of CRED App

Use the below code to check if the CRED app is present in the customer's Android device. `Razorpay.isCredAppInstalled(activity)` returns a boolean value, disclosing whether the app is present on the device or not.

JavaKotlin

copy

```java
JSONObject data = new JSONObject();
data.put("amount", 399935);
data.put("order_id", "order_DgZ26rHjbzLLY2");//sample order_id. Generate orders using Orders API
data.put("email", "gaurav.kumar@example.com");
data.put("contact", "+919876543210");
data.put("method", "emi");
data.put("emi_duration", 2); //defines the number of months for the EMI.
data.put("card[name]", "Gaurav Kumar");
data.put("card[number]", "4628 9499 7226 2986");
data.put("card[expiry_month]", "12");
data.put("card[expiry_year]", "30");
data.put("card[cvv]", "100");
```8

#### 2. Create Payment

After you receive the customer's app information, send it to the Razorpay API to complete the creation step of the payment flow. Below is the payload(JSON Object) to be sent:

JavaKotlin

copy

```java
JSONObject data = new JSONObject();
data.put("amount", 399935);
data.put("order_id", "order_DgZ26rHjbzLLY2");//sample order_id. Generate orders using Orders API
data.put("email", "gaurav.kumar@example.com");
data.put("contact", "+919876543210");
data.put("method", "emi");
data.put("emi_duration", 2); //defines the number of months for the EMI.
data.put("card[name]", "Gaurav Kumar");
data.put("card[number]", "4628 9499 7226 2986");
data.put("card[expiry_month]", "12");
data.put("card[expiry_year]", "30");
data.put("card[cvv]", "100");
```9

#### Request Parameters

method

mandatory

`string` The method used to make the payment. Here, it must be `app`.

provider

mandatory if method=app

`string` Name of the PSP app. Here, it must be `cred`.

app\_present

mandatory if app=cred

`boolean` Based upon response from the app present function, pass the value in this field. Possible values:

- `true`: Opens the CRED app on customer's device.
- `false` (default): Sends a push notification to customer's device.

#### 3. Implement PaymentResultWithDataListener Method

The `PaymentResultListener` or `PaymentResultWithDataListener` methods can be implemented the way shown in the above function or directly globally to the activity class. The functions will be implemented based on the method chosen.

#### Sample Code for `PaymentResultListener`

Below are the sample codes for `PaymentResultListener` method.

JavaKotlin

copy

```java
JSONObject payload = new JSONObject("{\"currency\":\"\"}");
payload.put("amount", 599935);
payload.put("contact", "+919876543210");
payload.put("order_id", "order_9A33XWu170gUtm");
payload.put("email", "gaurav.kumar@example.com");
payload.put("method", "cardless_emi");
payload.put("provider", "walnut369");
```0

#### Sample Code for `PaymentResultWithDataListener`

Below are the sample codes for `PaymentResultWithDataListener` method.

JavaKotlin

copy

```java
JSONObject payload = new JSONObject("{\"currency\":\"\"}");
payload.put("amount", 599935);
payload.put("contact", "+919876543210");
payload.put("order_id", "order_9A33XWu170gUtm");
payload.put("email", "gaurav.kumar@example.com");
payload.put("method", "cardless_emi");
payload.put("provider", "walnut369");
```1

#### Collect Flow

In Collect Flow, the SDK sends a push notification to the `contact` number passed in the create request. Pass the following parameters to initiate a collect payment.

javaKotlin

copy

```java
JSONObject payload = new JSONObject("{\"currency\":\"\"}");
payload.put("amount", 599935);
payload.put("contact", "+919876543210");
payload.put("order_id", "order_9A33XWu170gUtm");
payload.put("email", "gaurav.kumar@example.com");
payload.put("method", "cardless_emi");
payload.put("provider", "walnut369");
```2

#### Request Parameters

method

mandatory

`string` The method used to make the payment. Here, it must be `app`.

provider

mandatory if method=app

`string` Name of the PSP app. Here, it must be `cred`.

app\_present

mandatory if app=cred

`boolean` Sets the payment flow as collect. Possible values:

- `true`: Opens the Cred app on customer's device.
- `false` (default): Sends a push notification to customer's device.

**UPI Collect Flow Deprecated**

According to NPCI guidelines, the UPI Collect flow is being deprecated effective 28 February 2026. Customers can no longer make payments or register UPI mandates by manually entering VPA/UPI id/mobile numbers.

**Exemptions:** UPI Collect will continue to be supported for:

- MCC 6012 & 6211 (IPO and secondary market transactions).
- iOS mobile app and mobile web transactions.
- UPI Mandates (execute/modify/revoke operations only)
- eRupi vouchers.
- PACB businesses (cross-border/international payments).

**Action Required:**

- If you are a new Razorpay user, use [UPI Intent](/razorpay-docs-md/payment-gateway/web-integration/custom/payment-methods.md#intent-flow)  .
- If you are an existing Razorpay user not covered by exemptions, you must migrate to UPI Intent or UPI QR code to continue accepting UPI payments. For detailed migration steps, refer to the [migration documentation](/docs/announcements/upi-collect-migration/custom-integration/)  .
