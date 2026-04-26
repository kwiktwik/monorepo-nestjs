<!-- Source: https://razorpay.com/docs/payments/payment-gateway/ios-integration/custom/build-integration -->

Follow the steps to integrate the Razorpay iOS Custom SDK:

**1.1** [Import Razorpay.framework library to Your Project](/razorpay-docs-md/payment-gateway/ios-integration/custom/build-integration.md#11-import-razorpayframework-library-to-your-project).

- [Cocoapod](/razorpay-docs-md/payment-gateway/ios-integration/custom/build-integration.md#cocoapod)
- [Manual](/razorpay-docs-md/payment-gateway/ios-integration/custom/build-integration.md#manual)
- [Objective-C](/razorpay-docs-md/payment-gateway/ios-integration/custom/build-integration.md#objective-c)

**1.2** [Initialise Razorpay iOS Custom SDK](/razorpay-docs-md/payment-gateway/ios-integration/custom/build-integration.md#12-initialise-razorpay-ios-custom-sdk).

**1.3** [Create an Order in Server](/razorpay-docs-md/payment-gateway/ios-integration/custom/build-integration.md#13-create-an-order-in-server).

**1.4** [Get Payment Methods](/razorpay-docs-md/payment-gateway/ios-integration/custom/build-integration.md#14-get-payment-methods).

**1.5** [Initiate Payment](/razorpay-docs-md/payment-gateway/ios-integration/custom/build-integration.md#15-initiate-payment).

**1.6** [Pass WKNavigationDelegate actions to SDK](/razorpay-docs-md/payment-gateway/ios-integration/custom/build-integration.md#16-pass-wknavigationdelegate-actions-to-sdk).

**1.7** [Handle Success and Errors Events](/razorpay-docs-md/payment-gateway/ios-integration/custom/build-integration.md#17-handle-success-and-error-events).

**1.8** [Store Fields in Your Server](/razorpay-docs-md/payment-gateway/ios-integration/custom/build-integration.md#18-store-the-fields-in-server).

**1.9** [Verify Payment Signature](/razorpay-docs-md/payment-gateway/ios-integration/custom/build-integration.md#19-verify-payment-signature).

**1.10** [Verify Payment Status](/razorpay-docs-md/payment-gateway/ios-integration/custom/build-integration.md#110-verify-payment-status).

## 1.1 Import Razorpay.framework library to Your Project

You can import the Razorpay iOS Custom SDK library using any of these ways: Cocoapod, Manual and Objective-C.

#### Cocoapod

Refer to our [Cocoapod](https://cocoapods.org/pods/razorpay-customui-pod) pod.

#### Manual

1. Download the file and unzip the SDK attachment.
2. Open your project in XCode and go to **file** under **Menu** and select **Add files to "yourproject"**.
3. Select **Razorpay.xcframework** in the directory you just unzipped.
4. Click on the **Copy items if needed** checkbox.
5. Click **Add**.

Ensure that you have the framework added in both **Embedded Binaries** and **Linked Frameworks and Libraries** under **Target settings - General**.

#### Objective-C

If you are building an **Objective-C** project, follow the steps given for Swift and the additional steps given below:

1. Go to **Project Settings** and select **Build Settings - All and Combined**.
2. Set the **Always Embed Swift Standard Libraries** option to **TRUE**.

Ensure that you have the framework added in both **Embedded Binaries** and **Linked Frameworks and Libraries** under **Target settings - General**.

#### Xcode 11

Ensure that you have the framework added in **Frameworks, Libraries, and Embed Content** under **Target settings - General**. Change `Embed status` from - `Do not Embed` to `Embed & Sign`.
Watch the GIF to see how to add Frameworks, Libraries and Embed Content.

![](https://razorpay.com/docs/payments/payment-gateway/ios-integration/custom/build/browser/assets/images/ios-embed-framework.gif)

## 1.2 Initialise Razorpay iOS Custom SDK

To initialise the Razorpay SDK:

- API key. You can generate this from the [Dashboard](/razorpay-docs-md/dashboard/account-settings.md#api-keys)  .

  **Watch Out!**

  API keys should not be hardcoded in the app. They must be sent from your backend as app-related metadata fetch.
- A delegate that implements `RazorpayPaymentCompletionProtocol` and `WKNavigationDelegate`
- A `WKWebView` to show the bank pages

**Watch Out!**

- For Swift version 5.1+, ensure to declare `var razorpay: RazorpayCheckout!`.
- For versions lower than 5.1, use `var razorpay: Razorpay!`.
- Alternatively, you can use the following alias and retain the variable as Razorpay.

  `typealias Razorpay = RazorpayCheckout`

ViewController.swiftViewController.m

copy

```swift
import Razorpay

class ViewController: UIViewController, RazorpayPaymentCompletionProtocol, WKNavigationDelegate {
// typealias Razorpay = RazorpayCheckout
    var webView: WKWebView!
    var razorpay: RazorpayCheckout!
    .
    .
    override func viewDidLoad() {
        super.viewDidLoad()
        self.webView = WKWebView(frame: self.view.frame)
        self.razorpay = RazorpayCheckout.initWithKey("Key", andDelegate: self, withPaymentWebView: self.webView)
        self.view.addSubview(self.webView)
    }
}
```

**Initialise the Razorpay SDK only with API Key**

To render your UI based on the available payment methods, initialise the Razorpay SDK only with the API key and call [getPaymentMethods](/razorpay-docs-md/payment-gateway/ios-integration/custom/build-integration.md#14-get-payment-methods).

ViewController.swiftViewController.m

copy

```swift
self.razorpay = RazorpayCheckout.initWithKey("KEY")
```

To use the SDK initialisation mentioned above, call the following method using the previously created Razorpay instance on any other page where you wish to initiate the payment through the authorise method.

ViewController.swiftViewController.m

copy

```swift
do {
    try self.razorpay?.setWebView(self.wkWebView)
    try self.razorpay?.setDelegate(self)
} catch {
    print(error.localizedDescription)
}
```

## 1.3 Create an Order in Server

**Order is an important step in the payment process.**

- An order should be created for every payment.
- You can create an order using the [Orders API](/razorpay-docs-md/payment-gateway/ios-integration/custom/build-integration.md#api-sample-code)  . It is a server-side API call. Know how to [authenticate](/razorpay-docs-md/dashboard/account-settings/api-keys.md#generate-api-keys)

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

## 1.4 Get Payment Methods

You can accept payments through UPI, credit/debit cards, netbanking and wallets, depending on the methods enabled for your account. When you use [Razorpay iOS Standard SDK](/razorpay-docs-md/payment-gateway/ios-integration/standard.md), you do not have to handle the availability of different payment methods. However, when creating a custom checkout form, ensure the display of only the methods activated for your account to the customer.

To get a list of available payment methods, call `getPaymentMethods`. This fetches the list of payment methods asynchronously and returns the results.

ViewController.swiftViewController.m

copy

```swift
self.razorpay.getPaymentMethods(withOptions: nil, withSuccessCallback: {methods in
     paymentMethods = methods
    }){ error in
        errorDescription = error
    }
```

#### For Subscriptions

If you use your iOS app to receive subscription payments, you must pass the `subscription_id` in `options` to fetch the relevant payment methods. This is because Subscription payments are supported only by select banks and cards.

ViewController.swiftViewController.m

copy

```swift
let options :[String:String] = ["subscription_id": "sub_testid"] \\ For subscriptions
var paymentMethods :[AnyHashable:Any] = [:]
var errorDescription: String = ""
self.razorpay.getPaymentMethods(withOptions: options, withSuccessCallback: {methods in
     paymentMethods = methods
    }){ error in
        errorDescription = error
    }
```

### Get Subscription Amount

You can get the subscription amount against the subscription ID using the following function:

ViewController.swiftViewController.m

copy

```swift
var errorDescription: String = ""
var amount: UInt64 = 0
self.razorpay.getSubscriptionAmount(havingSubscriptionId: "sub_testid", withSuccessCallback: {subAmount in
        amount = subAmount
    }){ error in
        errorDescription = error
    }
```

## 1.5 Initiate Payment

Once you receive the required input from the customer, pass them to our SDK, which takes them to the appropriate authentication channel.

Add the following code where you want to initiate payment:

ViewController.swiftViewController.m

copy

```swift
let options: [String:Any] = [
            "amount": 100, // amount in currency subunits. Defaults to INR. 100 = 100 paise = INR 1. We support more than 92 currencies.
            "currency": "INR",//We support more that 92 international currencies.
            "email": "gaurav.kumar@example.com",
            "contact": "9090980808",
            "order_id": "order_DBJOWzybf0sJbb",//From response of Step 3
            "method": "card",
            "card[name]": "Gaurav Kumar",
            "card[number]": "4386289407660153",
            "card[expiry_month]": 06,
            "card[expiry_year]": 30,
            "card[cvv]": "123"
        ]
razorpay.authorize(options)
```

#### UPI Intent

For UPI Intent requests, use the following dictionary and pass it to the `authorize` function as shown below:

ViewController.swift

copy

```swift
let options: [AnyHashable:Any] = [
    "amount": "100", // amount in paise
    "currency": "INR",
    "email": "a@b.com",
    "contact": "1234567890",
    "method": "upi",
    "flow": "intent"
]
self.razorpay?.authorize(options)
```

ViewController.m

copy

```swift
self.razorpay = RazorpayCheckout.initWithKey("KEY")
```0

Here, `razorpay` is an instance of Razorpay.

- When you initiate a UPI Intent payment, the SDK will present a list of UPI apps installed on the device.
- The customer selects their preferred UPI app.
- The customer is redirected to the selected app to complete the authentication.
- After successful authentication, the customer is redirected back to your app.

#### UPI Collect Requests

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

For UPI collect requests, use the following dictionary and pass it to the `authorize` function as shown below:

copy

```swift
self.razorpay = RazorpayCheckout.initWithKey("KEY")
```1

Here, `razorpay` is an instance of Razorpay.

**NPCI Restrictions for UPI Collect Flow**

As per NPCI guidelines, the following MCC codes are restricted and cannot accept UPI Collect payments:

Restricted MCC Codes

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

- The `notes` field is a read-only field associated with payment and is returned while fetching payment details. Razorpay cannot modify this field. You can add up to 15 `notes` that will then be associated with the payment. For example: `"notes[internal_key_1]", "notes[internal_key_2]")`. Razorpay returns this when you fetch payment details from the API.
- The `emi` option is available only for certain banks. To check the right banks, valid duration and EMI rates/plans to display to the user, please visit the [EMI Demo](https://razorpay.com/emidemo/)

  page and click EMI in the payment form. You can safely cache this data at your end since this does not change without prior notification. Calculate the monthly EMI or
  cache using the following formula:

![EMI Formula](https://razorpay.com/docs/payments/payment-gateway/ios-integration/custom/build/browser/assets/images/ios_customui_emi.jpg)

## 1.6 Pass WKNavigationDelegate actions to SDK

SDK handles the responses from WKWebView to give you the correct status of the payment.

ViewController.swiftViewController.m

copy

```swift
self.razorpay = RazorpayCheckout.initWithKey("KEY")
```2

## 1.7 Handle Success and Error Events

This is done by implementing the `onPaymentSuccess` and `onPaymentError` methods of the `RazorpayPaymentCompletionProtocol`.

We recommend giving the user an option to cancel the payment midway and pass on this action. You may also implement a retry action or display a relevant message at this step based on your use case.

ViewController.swiftViewController.m

copy

```swift
self.razorpay = RazorpayCheckout.initWithKey("KEY")
```3

Success handler will receive `payment_id` that you can use later to capture the payment.

## 1.8 Store the Fields in Server

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

## 1.9 Verify Payment Signature

This is a mandatory step to confirm the authenticity of the details returned to the Checkout form for successful payments.

To verify the `razorpay_signature` returned to you by the Checkout form:

1. Create a signature in your server using the following attributes:

   - `order_id`: Retrieve the `order_id` from your server. Do not use the `razorpay_order_id` returned by Checkout.
   - `razorpay_payment_id`: Returned by Checkout.
   - `key_secret`: Available in your server. The `key_secret` that was generated from the [Dashboard](/razorpay-docs-md/dashboard/account-settings/api-keys.md#generate-api-keys)     .
2. Use the SHA256 algorithm, the `razorpay_payment_id` and the `order_id` to construct a HMAC hex digest as shown below:

   HMAC Hex Digest

   copy

   ```swift
self.razorpay = RazorpayCheckout.initWithKey("KEY")
```4
3. If the signature you generate on your server matches the `razorpay_signature` returned to you by the Checkout form, the payment received is from an authentic source.

Generate Signature on Your Server

Given below is the sample code for payment signature verification:

JavaPythonGoPHPRubyNode.js.NET

copy

```swift
self.razorpay = RazorpayCheckout.initWithKey("KEY")
```5

Post Signature Verification

After you have completed the integration, you can [set up webhooks](/docs/webhooks/setup-edit-payments/), make test payments, replace the test key with the live key and integrate with other [APIs](/razorpay-docs-md/api/index.md).

**Handy Tips**

iOS 9 has higher requirements for secure URLs. As many Indian banks do not comply with the requirements, you can implement the following as a workaround:

info.plist

copy

```swift
self.razorpay = RazorpayCheckout.initWithKey("KEY")
```6

Add the above to your `info.plist` file. For more information click [here](https://developer.apple.com/library/content/documentation/General/Reference/InfoPlistKeyReference/Articles/CocoaKeys.html#//apple_ref/doc/uid/TP40009251-SW33).

## 1.10 Verify Payment Status

**Handy Tips**

On the Razorpay Dashboard, ensure that the payment status is `captured`. Refer to the payment capture settings page to know how to [capture payments automatically](/razorpay-docs-md/payments/capture-settings.md).

You can track the payment status in three ways:

Verify Status from Dashboard

Subscribe to Webhook Events

Poll APIs

To verify the payment status from the Razorpay Dashboard:

1. Log in to the Razorpay Dashboard and navigate to **Transactions** → **Payments**.
2. Check if a **Payment Id** has been generated and note the status. In case of a successful payment, the status is marked as **Captured**.

![Payment details on Dashboard](https://razorpay.com/docs/payments/payment-gateway/ios-integration/custom/build/browser/assets/images/testpayment.jpg)

## Next Steps [Step 2: Test Integration](/razorpay-docs-md/payment-gateway/ios-integration/custom/test-integration.md)
