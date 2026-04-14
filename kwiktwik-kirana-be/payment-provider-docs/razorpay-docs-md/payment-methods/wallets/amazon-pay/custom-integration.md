<!-- Source: https://razorpay.com/docs/payments/payment-methods/wallets/amazon-pay/custom-integration -->

Amazon Pay is a wallet-based payment method that allows customers with an Amazon account to make payments using their Amazon Pay balance. After Amazon Pay is enabled and integrated, it is listed on your website/app Checkout page as an option under the wallet payment method. Know more about [Amazon Pay](https://www.amazonpay.in/).

**Feature Request**

- This is an on-demand feature. Please raise a request with our [Support team](https://razorpay.com/support/#request)

  to get this feature activated on your Razorpay account.
- Watch this video to know how to raise a feature enablement request on the Dashboard.

![Feature Request GIF](https://razorpay.com/docs/payments/payment-methods/wallets/amazon-pay/build/browser/assets/images/feature-request.gif)

## Web Integration

After an order is created and the customer's payment details are received, the information should be sent to Razorpay to complete the payment. You can do this by invoking `createPayment` method and passing `method = wallet` and `wallet=amazonpay`.

Example

copy

```javascript
razorpay.createPayment({
  amount: 5000,
  email: 'gaurav.kumar@example.com',
  contact: '9123456780',
  order_id: 'order_9A33XWu170gUtm',
  method: 'wallet',
  wallet: 'amazonpay'
});
```

## Android Integration

To integrate Amazon Pay wallet with the Custom Checkout on your Android app:

1. Download the following SDKs and add the `aar` files to the application library.

   - Download [Amazon-SDK](https://rzp-1415-prod-mobile.s3.amazonaws.com/android/googlepay-sdk/tez-client-api-0.9.4.aar)     .
   - Download [Razorpay-Amazon Pay SDK](https://rzp-1415-prod-mobile.s3.amazonaws.com/android/googlepay-sdk/tez-client-api-0.9.4.aar)     .

   **Handy Tips**

   The Razorpay-Amazon Pay SDK acts as a wrapper over the native Amazon-SDK.
2. Add the following lines of code to the `build.gradle` file of your application:

   build.gradle

   copy

   ```java
dependencies {
      implementation(name: 'razorpay-amazonpay-1.3.0', ext: 'aar')
      implementation(name:'PayWithAmazon', ext:'aar')
    }
```

This will add the dependencies for the SDK and create an Amazon Pay payment method on your Checkout form.

## iOS Integration

The iOS integration for Amazon Pay is similar to the [Razorpay iOS Custom UI SDK](/razorpay-docs-md/payment-gateway/ios-integration/custom.md) integration.

**Handy Tips**

- Always use the Live key with Amazon Pay, even for testing.

- Razorpay SDK has a minimum deployment target of iOS 10.0, built with Swift 4.2. It requires Xcode 10 and above to work.

## Prerequisites

Before you begin the integration, download the following SDKs:

- [Razorpay SDK](https://rzp-1415-prod-mobile.s3.amazonaws.com/android/googlepay-sdk/tez-client-api-0.9.4.aar)

  that has Amazon Pay enabled.
- [AmazonPay SDK](https://s3.ap-south-1.amazonaws.com/rzp-1415-prod-mobile/ios/CustomLinks/StripInvalidArchitectures.sh)

  .

## Integration Steps

To use Amazon Pay via the Razorpay SDK:

1. Add the Amazon Pay SDK to the project directory containing your *.xcodeproj* or *.xcworkspace* file.
2. Add `$(PROJ_DIR)` to the framework search paths of your target and set the search type to recursive.
3. Add the following code to your *info.plist* file:

   xml

   copy

   ```xml
<key>CFBundleURLTypes</key>
   <array>
       <dict>
           <key>CFBundleURLName</key>
           <string>com.amazon.pwain</string>
           <key>CFBundleURLSchemes</key>
           <array>
               <string>amzn.$(PRODUCT_BUNDLE_IDENTIFIER)</string>
           </array>
       </dict>
   </array>
```
4. Import the *PayWithAmazon* file to your AppDelegate and implement the following function:

   swift

   copy

   ```swift
func application(_ app: UIApplication, open url: URL, options: [UIApplicationOpenURLOptionsKey : Any] = [:]) -> Bool {
       #if canImport(PayWithAmazon)
       return PayWithAmazon.sharedInstance().handleRedirectURL(url,
         sourceApplication: "")
       #endif
       return false
}
```
5. Use the following command to trigger Amazon Pay:

   swift

   copy

   ```swift
let options: [String:Any] = [
   "method": "wallet",
   "wallet": "amazonpay",
   "amount": 100,
   "contact": "9000090000",
   "email": "gaurav.kumar@example.com",
   "currency": "INR"
]
razorpayInstance.payWithExternalPaymentEntity(options: dataSource.options)
```

   Here, `razorpayInstance` is an instance of Razorpay.
