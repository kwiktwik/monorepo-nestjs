<!-- Source: https://razorpay.com/docs/payments/payment-gateway/android-integration/custom/override-minimum-sdk -->

- `minSdkVersion` is the minimum version of the Android operating system required to run your application. The Android app must have a minimum SDK version 19 or higher.
- If you want to support devices below API level 19, you must override `minSDK` version.

#### Sample Code to Override minSDK Version

Override MinSDK Version

copy

```javascript
<uses-sdk android:targetSdkVersion="27" android:minSdkVersion="19"
            tools:overrideLibrary="com.razorpay"/>
```
