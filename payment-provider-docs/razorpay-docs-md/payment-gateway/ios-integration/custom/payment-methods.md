<!-- Source: https://razorpay.com/docs/payments/payment-gateway/ios-integration/custom/payment-methods -->

The Razorpay iOS Custom SDK lets you integrate the supported payment methods on your iOS app's Checkout form.

## Fetch Payment Methods

Use the [Fetch Payment Methods API](/razorpay-docs-md/payment-gateway/android-integration/custom/build-integration.md#14-fetch-payment-methods) to fetch the payment methods available for your account.

Below are the sample payloads for each payment method.

## Debit and Credit Card

Add the following code where you want to initiate a card payment:

ViewController.swiftViewController.m

copy

```swift
let options: [String: Any] = [
    "amount": 100, // amount in currency subunits. Defaults to INR. 100 = 100 paise = INR 1.
    "currency": "INR", // We support international currencies.
    "email": "gaurav.kumar@example.com",
    "contact": "9000090000",
    "order_id": "order_DBJOWzybf0sJbb",
    "method": "card",
    "card[name]": "Gaurav Kumar",
    "card[number]": "4386289407660153",
    "card[expiry_month]": 06,
    "card[expiry_year]": 30,
    "card[cvv]": "123"
]
razorpay.authorize(options)
```

Check the [list of supported cards](/razorpay-docs-md/payment-gateway/web-integration/standard/configure-payment-methods/supported-methods.md#supported-cards).

## Bank Transfer

This payment method allows you to display your Customer Identifier details on checkout. Your customers can make online bank transfers to this account.

**Feature Request**

- This is an on-demand feature. Please raise a request with our [Support team](https://razorpay.com/support/#request)

  to get this feature activated on your Razorpay account.
- Watch this video to know how to raise a feature enablement request on the Dashboard.

![Feature Request GIF](https://razorpay.com/docs/payments/payment-gateway/ios-integration/custom/build/browser/assets/images/feature-request.gif)

There are no specific request parameters to be passed. Instead, you must pass the `fetchVirtualAccount` method for your Customer Identifier to get created and the details to appear on the checkout. Know more about [integrating bank transfer with Custom Checkout](/razorpay-docs-md/payment-methods/bank-transfer/custom-integration.md).

## EMI on Debit and Credit Cards

Add the following code where you want to initiate an EMI payment:

ViewController.swiftViewController.m

copy

```swift
let options: [String: Any] = [
    "amount": 100, // amount in currency subunits. Defaults to INR. 100 = 100 paise = INR 1.
    "currency": "INR",
    "email": "gaurav.kumar@example.com",
    "contact": "9000090000",
    "order_id": "order_DBJOWzybf0sJbb",
    "method": "emi",
    "emi_duration": 9,
    "card[name]": "Gaurav Kumar",
    "card[number]": "4386289407660153",
    "card[expiry_month]": 06,
    "card[expiry_year]": 30,
    "card[cvv]": "123"
]
razorpay.authorize(options)
```

Check the list of supported [debit card](/razorpay-docs-md/payment-methods/emi/debit-card-emi.md#supported-banks-for-debit-card-emis) and [credit card](/razorpay-docs-md/payment-methods/emi/credit-card-emi.md#supported-banks-for-credit-card-emis)

EMI providers.

## Cardless EMI

Add the following code where you want to initiate a cardless EMI payment:

ViewController.swiftViewController.m

copy

```swift
let options: [String: Any] = [
    "amount": 100, // amount in currency subunits. Defaults to INR. 100 = 100 paise = INR 1.
    "currency": "INR",
    "email": "gaurav.kumar@example.com",
    "contact": "9000090000",
    "order_id": "order_DBJOWzybf0sJbb",
    "method": "cardless_emi",
    "provider": "earlysalary"
]
razorpay.authorize(options)
```

Check the [list of supported cardless EMI providers](/razorpay-docs-md/payment-methods/emi/cardless-emi.md#supported-payment-partners).

## Netbanking

Add the following code where you want to initiate a netbanking payment:

ViewController.swiftViewController.m

copy

```swift
let options: [String: Any] = [
    "amount": 100, // amount in currency subunits. Defaults to INR. 100 = 100 paise = INR 1.
    "currency": "INR", // We support international currencies.
    "email": "gaurav.kumar@example.com",
    "contact": "9000090000",
    "order_id": "order_DBJOWzybf0sJbb",
    "method": "netbanking",
    "bank": "HDFC"
]
razorpay.authorize(options)
```

Check the [list of supported banks](/razorpay-docs-md/payment-methods/netbanking.md).

## Pay Later

Add the following code where you want to initiate a Pay Later payment:

ViewController.swiftViewController.m

copy

```swift
let options: [String: Any] = [
    "amount": 100, // amount in currency subunits. Defaults to INR. 100 = 100 paise = INR 1.
    "currency": "INR",
    "email": "gaurav.kumar@example.com",
    "contact": "9000090000",
    "order_id": "order_DBJOWzybf0sJbb", // From response of Step 3
    "method": "paylater",
    "provider": "icic"
]
razorpay.authorize(options)
```

Check the [list of Pay Later providers](/razorpay-docs-md/payment-methods/pay-later.md#providers).

## Wallet

Add the following code where you want to initiate a wallet payment:

ViewController.swiftViewController.m

copy

```swift
let options = [
    "amount": "100",
    "currency": "INR",
    "email": "gaurav.kumar@example.com",
    "order_id": "order_4xbQrmEoA5WJ0G",
    "contact": "9000090000",
    "method": "wallet",
    "wallet": "mobikwik",
   ]
razorpay.authorize(options)
```

## UPI

Specify `upi` the `method` parameter for UPI payments. The SDK supports two flows:

- Collect
- Intent

#### Collect Flow

Customers enter their `vpa` or [phone number](/razorpay-docs-md/payment-gateway/ios-integration/custom/payment-methods.md#upi-payments-using-phone-number) on your UI and complete the payments on their respective UPI apps in collect flow.

You can now pass the `vpa` parameter in the `upi` array as shown below.

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

#### Sample Code

The sample code below sends a collect request to the `gaurav.kumar@exampleupi` handle:

ViewController.swiftViewController.m

copy

```swift
let options: [String: Any] = [
    "amount": 100, // amount in currency subunits. Defaults to INR. 100 = 100 paise = INR 1.
    "currency": "INR",
    "email": "gaurav.kumar@example.com",
    "contact": "9000090000",
    "order_id": "order_DBJOWzybf0sJbb",
    "method": "upi",
    "_[flow]": "collect",
    "vpa": "gaurav.kumar@exampleupi"
]
razorpay.authorize(options)
```

UPI Payments Using Phone Number

You can accept UPI payments using phone number for the collect flow. Follow the steps given below:

1. You must collect the customer's phone number from your end.
2. Check if any `vpa` is associated with the given number and get the `vpa_token` for that number using the sample code given below:

   ViewController.swiftViewController.m

   copy

   ```swift
self.razorpay?.isValidVpa("9000090000", withSuccessCallback: { response in
    // VPA Validation Successful
    // get and store response.vpa_token for initiating payment
    // you will get response.masked_vpa in this response which you can show to the end user
}, withFailure: { responseError in
    print(responseError)
    // Error: no VPA associated with the given number
})
```
3. Pass the `vpa_token` parameter in the `upi` array as shown below:

   ViewController.swiftViewController.m

   copy

   ```swift
let options: [String: Any] = [
    "amount": 5000, 
    "currency": "INR",
    "email": "gaurav.kumar@example.com",
    "contact": "9000090000",
    "order_id": "order_DBJOWzybf0XXXX",
    "method": "upi",
    "_[flow]": "collect",
    "vpa_token": "f731951149df8903d374b117f921ab41"
]
razorpay.authorize(options)
```

#### Intent Flow

Provide your customers with a better payment experience by enabling UPI Intent on your app's Checkout form. In the UPI Intent flow:

1. You have to fetch the list of UPI supported apps and show it in your app so that the customer can see only valid apps.
2. After the customer selects the app, you have to pass the app name in `options`, with the key `upi_app_package_name` value. Possible values for `upi_app_package_name` are:
   - `google_pay`
   - `phonepe`
   - `paytm`
   - `cred`
3. The customer enters their UPI PIN to complete the transaction.
4. The customer returns to your app manually without redirection.

#### Step 1: Update the info.plist File

Your iOS app must seek permission from the device to open the UPI PSP app that the customer selects on the Checkout. For this, you must make the following changes to your iOS app's info.plist file:

info.plist

copy

```xml
<key>LSApplicationQueriesSchemes</key>
<array>
    <string>tez</string>
    <string>phonepe</string>
    <string>paytmmp</string>
    <string>credpay</string>
    <string>mobikwik</string>
    <string>in.fampay.app</string>
    <string>bhim</string>
    <string>amazonpay</string>
    <string>navi</string>
    <string>kiwi</string>
    <string>payzapp</string>
    <string>jupiter</string>
    <string>omnicard</string>
    <string>icici</string>
    <string>popclubapp</string>
    <string>sbiyono</string>
    <string>myjio</string>
    <string>slice-upi</string>
    <string>bobupi</string>
    <string>shriramone</string>
    <string>indusmobile</string>
    <string>whatsapp</string>
    <string>kotakbank</string>
</array>
```

#### Step 2: Get a List of UPI Supported Apps

This sample code fetches the list of apps on the customer's device that support UPI payments.

ViewController.swiftViewController.m

copy

```swift
let options: [String: Any] = [
    "amount": 100, // amount in currency subunits. Defaults to INR. 100 = 100 paise = INR 1.
    "currency": "INR",
    "email": "gaurav.kumar@example.com",
    "contact": "9000090000",
    "order_id": "order_DBJOWzybf0sJbb",
    "method": "emi",
    "emi_duration": 9,
    "card[name]": "Gaurav Kumar",
    "card[number]": "4386289407660153",
    "card[expiry_month]": 06,
    "card[expiry_year]": 30,
    "card[cvv]": "123"
]
razorpay.authorize(options)
```0

The sample code below invokes the UPI intent where the user can select the desired application.

Ensure that the `upi_app_package_name` is passed from the `getAppsWhichSupportUpi()` method value. Otherwise, it will not pass the validation.

ViewController.swiftViewController.m

copy

```swift
let options: [String: Any] = [
    "amount": 100, // amount in currency subunits. Defaults to INR. 100 = 100 paise = INR 1.
    "currency": "INR",
    "email": "gaurav.kumar@example.com",
    "contact": "9000090000",
    "order_id": "order_DBJOWzybf0sJbb",
    "method": "emi",
    "emi_duration": 9,
    "card[name]": "Gaurav Kumar",
    "card[number]": "4386289407660153",
    "card[expiry_month]": 06,
    "card[expiry_year]": 30,
    "card[cvv]": "123"
]
razorpay.authorize(options)
```1

#### UPI Intent on Recurring Payments

Configure and initiate a recurring payment transaction on UPI Intent:

ViewController.swiftViewController.m

copy

```swift
let options: [String: Any] = [
    "amount": 100, // amount in currency subunits. Defaults to INR. 100 = 100 paise = INR 1.
    "currency": "INR",
    "email": "gaurav.kumar@example.com",
    "contact": "9000090000",
    "order_id": "order_DBJOWzybf0sJbb",
    "method": "emi",
    "emi_duration": 9,
    "card[name]": "Gaurav Kumar",
    "card[number]": "4386289407660153",
    "card[expiry_month]": 06,
    "card[expiry_year]": 30,
    "card[cvv]": "123"
]
razorpay.authorize(options)
```2

#### Turbo UPI

Make UPI payments a faster, 2-step experience for your customers with Razorpay's Turbo UPI SDK.

1. [Turbo UPI Headless Integration](/razorpay-docs-md/payment-gateway/ios-integration/custom/payment-methods/turbo-upi/integrate-ui.md)
2. [Turbo UPI UI Integration](/razorpay-docs-md/payment-gateway/ios-integration/custom/payment-methods/turbo-upi/integrate-noui.md)

Know more about the [Customer Onboarding](/razorpay-docs-md/payment-gateway/ios-integration/custom/payment-methods/turbo-upi.md#customer-onboarding-flow) and [Integration Steps](/razorpay-docs-md/payment-gateway/ios-integration/custom/payment-methods/turbo-upi.md#next-steps).

## CRED

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

Customers can make payments on your iOS app using their CRED Coins as well as the credit cards saved on CRED. The SDK supports two flows:

1. [Collect](/razorpay-docs-md/payment-gateway/ios-integration/custom/payment-methods.md#collect-flow-1)
2. [Intent](/razorpay-docs-md/payment-gateway/ios-integration/custom/payment-methods.md#intent-flow-1)

**Handy Tips**

Ensure you have integrated with Razorpay iOS SDK version 1.3.5 or higher.

#### Prerequisites

For both collect and intent flow, you need to pass the `app_offer` parameter in the Orders API.

POST

/orders

CurlJavaPythongoPHPRubyNode.js.NETResponse

copy

```swift
let options: [String: Any] = [
    "amount": 100, // amount in currency subunits. Defaults to INR. 100 = 100 paise = INR 1.
    "currency": "INR",
    "email": "gaurav.kumar@example.com",
    "contact": "9000090000",
    "order_id": "order_DBJOWzybf0sJbb",
    "method": "emi",
    "emi_duration": 9,
    "card[name]": "Gaurav Kumar",
    "card[number]": "4386289407660153",
    "card[expiry_month]": 06,
    "card[expiry_year]": 30,
    "card[cvv]": "123"
]
razorpay.authorize(options)
```3

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

#### Collect Flow

In the Collect Flow, the SDK sends a push notification to the `contact` number passed in the create request. To initiate collect flow, send `app_present` the parameter as `0` while creating the payment.

ViewController.swiftViewController.m

copy

```swift
let options: [String: Any] = [
    "amount": 100, // amount in currency subunits. Defaults to INR. 100 = 100 paise = INR 1.
    "currency": "INR",
    "email": "gaurav.kumar@example.com",
    "contact": "9000090000",
    "order_id": "order_DBJOWzybf0sJbb",
    "method": "emi",
    "emi_duration": 9,
    "card[name]": "Gaurav Kumar",
    "card[number]": "4386289407660153",
    "card[expiry_month]": 06,
    "card[expiry_year]": 30,
    "card[cvv]": "123"
]
razorpay.authorize(options)
```4

#### Request Parameters

Along with the other payment creation request parameters, you must pass:

method

mandatory

`string` The method used to make the payment. Here, it must be `app`.

provider

mandatory if method=app

`string` Name of the PSP app. Here, it must be `cred`.

app\_present

mandatory if app=cred

`integer` Sets the payment flow as collect. Possible values:

- `1`: Opens the CRED app on the customer's device.
- `0` (default): Sends a push notification to the customer's device.

#### Intent Flow

In Intent Flow, the SDK invokes an intent, which is handled by the Cred app installed on the iOS device. Follow these steps:

#### Step 1: Update the info.plist File

You must make the following changes to your iOS app's info.plist file:

info.plist

copy

```swift
let options: [String: Any] = [
    "amount": 100, // amount in currency subunits. Defaults to INR. 100 = 100 paise = INR 1.
    "currency": "INR",
    "email": "gaurav.kumar@example.com",
    "contact": "9000090000",
    "order_id": "order_DBJOWzybf0sJbb",
    "method": "emi",
    "emi_duration": 9,
    "card[name]": "Gaurav Kumar",
    "card[number]": "4386289407660153",
    "card[expiry_month]": 06,
    "card[expiry_year]": 30,
    "card[cvv]": "123"
]
razorpay.authorize(options)
```5

#### Step 2: Detect CRED App in Customer's Mobile

- Check if the CRED app is present on the customer's mobile using the `isCredAppAvailable()` method.

  ViewController.swiftViewController.m

  copy

  ```swift
let options: [String: Any] = [
    "amount": 100, // amount in currency subunits. Defaults to INR. 100 = 100 paise = INR 1.
    "currency": "INR",
    "email": "gaurav.kumar@example.com",
    "contact": "9000090000",
    "order_id": "order_DBJOWzybf0sJbb",
    "method": "emi",
    "emi_duration": 9,
    "card[name]": "Gaurav Kumar",
    "card[number]": "4386289407660153",
    "card[expiry_month]": 06,
    "card[expiry_year]": 30,
    "card[cvv]": "123"
]
razorpay.authorize(options)
```6
- CRED app listens to the URI Schema.

  xml

  copy

  ```swift
let options: [String: Any] = [
    "amount": 100, // amount in currency subunits. Defaults to INR. 100 = 100 paise = INR 1.
    "currency": "INR",
    "email": "gaurav.kumar@example.com",
    "contact": "9000090000",
    "order_id": "order_DBJOWzybf0sJbb",
    "method": "emi",
    "emi_duration": 9,
    "card[name]": "Gaurav Kumar",
    "card[number]": "4386289407660153",
    "card[expiry_month]": 06,
    "card[expiry_year]": 30,
    "card[cvv]": "123"
]
razorpay.authorize(options)
```7

  This can be passed in the `uriSchema` parameter in the above function. `isCredAppAvailable()` returns a boolean value informing whether the app is present on the device or not.

  ViewController.swiftViewController.m

  copy

  ```swift
let options: [String: Any] = [
    "amount": 100, // amount in currency subunits. Defaults to INR. 100 = 100 paise = INR 1.
    "currency": "INR",
    "email": "gaurav.kumar@example.com",
    "contact": "9000090000",
    "order_id": "order_DBJOWzybf0sJbb",
    "method": "emi",
    "emi_duration": 9,
    "card[name]": "Gaurav Kumar",
    "card[number]": "4386289407660153",
    "card[expiry_month]": 06,
    "card[expiry_year]": 30,
    "card[cvv]": "123"
]
razorpay.authorize(options)
```8
- If the CRED app is installed, pass the `callback_url` parameter in the payload:

  ViewController.swiftViewController.m

  copy

  ```swift
let options: [String: Any] = [
    "amount": 100, // amount in currency subunits. Defaults to INR. 100 = 100 paise = INR 1.
    "currency": "INR",
    "email": "gaurav.kumar@example.com",
    "contact": "9000090000",
    "order_id": "order_DBJOWzybf0sJbb",
    "method": "emi",
    "emi_duration": 9,
    "card[name]": "Gaurav Kumar",
    "card[number]": "4386289407660153",
    "card[expiry_month]": 06,
    "card[expiry_year]": 30,
    "card[cvv]": "123"
]
razorpay.authorize(options)
```9

**Handy Tips**

The redirect happens from the CRED app based on the URL scheme passed in the payload. If not passed, the app will not redirect.

#### Listen to CRED Callback

Listen to CRED callback in the `AppDelegate` class by implementing the `open url` method. Handle the success response.

ViewController.swiftViewController.m

copy

```swift
let options: [String: Any] = [
    "amount": 100, // amount in currency subunits. Defaults to INR. 100 = 100 paise = INR 1.
    "currency": "INR",
    "email": "gaurav.kumar@example.com",
    "contact": "9000090000",
    "order_id": "order_DBJOWzybf0sJbb",
    "method": "cardless_emi",
    "provider": "earlysalary"
]
razorpay.authorize(options)
```0

#### Register for Notification

Register for notification in CustomWebVC using the code sample given below:

ViewController.swiftViewController.m

copy

```swift
let options: [String: Any] = [
    "amount": 100, // amount in currency subunits. Defaults to INR. 100 = 100 paise = INR 1.
    "currency": "INR",
    "email": "gaurav.kumar@example.com",
    "contact": "9000090000",
    "order_id": "order_DBJOWzybf0sJbb",
    "method": "cardless_emi",
    "provider": "earlysalary"
]
razorpay.authorize(options)
```1

Use the code given below to handle payment data:

ViewController.swiftViewController.m

copy

```swift
let options: [String: Any] = [
    "amount": 100, // amount in currency subunits. Defaults to INR. 100 = 100 paise = INR 1.
    "currency": "INR",
    "email": "gaurav.kumar@example.com",
    "contact": "9000090000",
    "order_id": "order_DBJOWzybf0sJbb",
    "method": "cardless_emi",
    "provider": "earlysalary"
]
razorpay.authorize(options)
```2

#### Initiate Intent Flow

To initiate intent flow, send the `app_present` parameter as `1` while creating the payment.

ViewController.swiftViewController.m

copy

```swift
let options: [String: Any] = [
    "amount": 100, // amount in currency subunits. Defaults to INR. 100 = 100 paise = INR 1.
    "currency": "INR",
    "email": "gaurav.kumar@example.com",
    "contact": "9000090000",
    "order_id": "order_DBJOWzybf0sJbb",
    "method": "cardless_emi",
    "provider": "earlysalary"
]
razorpay.authorize(options)
```3

#### Request Parameters

Along with the other payment creation request parameters, you must pass:

method

mandatory

`string` The method used to make the payment. Here, it must be `app`.

provider

mandatory if method=app

`string` Name of the PSP app. Here, it must be `cred`.

app\_present

mandatory if app=cred

`integer` Based upon response from the app present function, pass the value in this field. Possible values:

- `1`: Opens the CRED app on customer's device.
- `0` (default): Sends a push notification to the customer's device.

callback\_url

mandatory

`string` The URI scheme, using which the CRED app will be opened on the customer's mobile device.
