<!-- Source: https://razorpay.com/docs/payments/payment-gateway/android-integration/custom/payment-methods/turbo-upi/integration-ui -->

Use Razorpay Turbo UPI to make UPI payments faster. Follow these steps to integrate with the Razorpay Turbo UPI UI SDK.

Prerequisites

1. Integrate with the [Razorpay Android Custom SDK](/razorpay-docs-md/payment-gateway/android-integration/custom/build-integration.md)   .
2. Contact our [Integrations team](mailto:integrations@razorpay.com)

   and provide the following details to get allowlisted:
   - Mobile numbers of your internal users.
   - App id of your debug, staging and production apps.
3. Contact our [Integrations team](mailto:integrations@razorpay.com)

   to get the access to the Sample App Repository `https://github.com/upi-turbo/android-turbo-sample-app`. Once you have access, please read the **readme** section of the repository to learn how to locate the library files and integrate them into your project.
4. Add the following lines to your Android project's `gradle.properties` file:

   - `android.enableJetifier=true`
   - `android.useAndroidX=true`
5. The `minSDKversion` for using Turbo UPI is currently 23 and cannot be over written.

**Add the following dependencies:**

- In the root settings.gradle file, use:

Kotlin

copy

```kotlin
dependencyResolutionManagement {
       repositories {
           // ... other repositories ...
           maven {
               url = uri("https://maven.pkg.github.com/upi-turbo/android-turbo-sample-app")
               credentials {
                   username = "upi-turbo"
                   password = "<Get the password from Razorpay team>"
               }
           }
       }
   }
```

- In the library module's build.gradle, use:

Kotlin

copy

```kotlin
dependencies {
       // UAT
       implementation "com.razorpay:customui-uat:$CUSTOMUI_VERSION"
       implementation "com.razorpay:razorpay-turbo-uat:$TURBO_VERSION"
       implementation "com.razorpay:turbo-ui-uat:$TURBO_VERSION"

       // Production
       releaseImplementation "com.razorpay:customui:$CUSTOMUI_VERSION"
       releaseImplementation "com.razorpay:razorpay-turbo:$TURBO_VERSION"
       releaseImplementation "com.razorpay:turbo-ui:$TURBO_VERSION"
   }
```

**Watch Out!**

- Use the `rzp_test_0wFRWIZnH65uny` API key id for testing on the UAT environment and the [Razorpay live keys](/razorpay-docs-md/api/authentication.md#live-mode-api-keys)

  on the prod testing.
- Replace the placeholders ($CUSTOMUI\_VERSION, $TURBO\_VERSION and $CHECKOUT\_VERSION) with the latest versions provided by Razorpay's team or similar to `app/build.gradle` file in the Sample app.

## Integrate Steps

### 1.1 Create a Session Token

To enhance security, you must create a session token via a server-to-server (S2S) call between your backend and Razorpay's backend. This session token ensures secure communication between the Turbo SDK and Razorpay's systems.

#### How to Create a Session Token

1. Trigger the S2S API from your Backend. Use the following API to generate a session token:

   Environment based URLs:

   - UAT: `https://api-web-turbo-upi.ext.dev.razorpay.in`
   - Production: `https://api.razorpay.com`

   Authorization Header Creation: `Base64.encode(${public_key}:${secret})`

   Request Parameters

   customer\_reference

   mandatory

   `string` A unique identifier for the customer provided by the business. The recommended value is mobile number. For example, `9000090000`.

   Response Parameters

   token

   `string` A session token to be used in subsequent session-protected APIs.

   expire\_at

   `long` Expiry time (in seconds) for the session token, used to optimise session handling and reduce unnecessary reinitialisations.

   error

   `object` The request failure due to business or technical failure.
2. Pass the Generated Token to Turbo SDK. Use the session token in the [initialisation step](/razorpay-docs-md/payment-gateway/android-integration/custom/payment-methods/turbo-upi/integration-ui.md#12-initialise-turbo-sdk)   , ensuring that it is refreshed upon expiry.

### 1.2 Initialise Turbo SDK

Initialise the `TurboSessionDelegate` object anonymously and pass it through the initialize method. The SDK will call `fetchToken` whenever required and use the provided callback to handle the new/updated token.

In the fetchToken function, retrieve a new token from your server (see [1.1 Create a Session Token](/razorpay-docs-md/payment-gateway/android-integration/custom/payment-methods/turbo-upi/integration-ui.md#11-create-a-session-token)

) and once available, pass it to the completion object. This mechanism allows you to seamlessly refresh the session by retrieving a new token via a server-to-server (S2S) call whenever the SDK requests it.

KotlinJava

copy

```kotlin
val turboSessionDelegate: TurboSessionDelegate = object : TurboSessionDelegate {
        override fun fetchToken(completion: (Session) -> Unit) {
            // fetch token here and once fetched,
            // it can be passed back to Turbo SDK using completion lambda callback
            completion(Session(token: <new-token>))
        }
}

            // pass the above created turboSessionDelegate object through initialize method
razorpay
    .upiTurbo
    .initialize(turboSessionDelegate)
```

### 1.3 Getting Linked UPI Accounts

After initialising the Turbo SDK, proceed to securely link UPI accounts and complete the payment flow.

1. **Get already linked accounts**.

   If your customer has already linked accounts, use the following code to fetch them. If there are no linked UPI accounts, an empty list is returned.

   **Handy Tips**

   - When the user arrives at your checkout screen, use the `getLinkedUpiAccounts` function to fetch the updated list of UPI accounts.
   - A mobile number is required in the `linkNewUpiAccount` function for an enhanced user experience. Otherwise, feel free to use either your mobile number or customer id.

   KotlinJava

   copy

   ```kotlin
razorpay.upiTurbo?.getLinkedUpiAccounts(<10 digit mobile number>, <unique customer id>, object : UpiTurboResultListener {
    override fun onSuccess(accList: List<UpiAccount>) {
        if (accList.isNotEmpty()) {
            Log.d("UpiTurbo", "UpiAccount list")
        } else {
            // call linkNewAccount()
        }
    }
    override fun onError(error: Error) {
        Log.d("UpiTurbo", error.message)
    }
})
```

   **Watch Out!**

   If the device binding is not completed and the `getLinkedUpiAccounts` is triggered, it will return an `OnError` with a **DEVICE\_BINDING\_INCOMPLETE** error code.

   Request Parameters

   customerMobile

   mandatory

   `string` The customer's mobile number.

   listener

   `object` The listener to be sent should be of type `UpiTurboResultListener`.

   Response Parameters

   onSuccess

   This function is triggered if the list is fetched successfully. `accList` can be empty to indicate that no accounts have been linked yet.

   onError

   This function is triggered in case an error is thrown during the retrieval process, either by the Razorpay SDK or the Bank SDK.

### 1.4 Onboarding Flow

Invoke the below function for these use cases:

1. To initiate new onboarding, in case you get a **DEVICE\_BINDING\_INCOMPLETE** error in the above section,
2. To link additional bank accounts for already onboarded users.

   **Handy Tips**

   A mobile number is required in the `linkNewUpiAccount` function for an enhanced user experience. Otherwise, feel free to use either your mobile number or customer id.

   KotlinJava

   copy

   ```kotlin
razorpay.upiTurbo?.linkNewUpiAccountWithUI(<10 digit mobile number>, <unique customer id>, object: UpiTurboLinkAccountResultListener {
    override fun onSuccess(upiAccounts: List<UpiAccount>) {
        //Display onboarded UpiAccounts. 
    }
    override fun onFailure(error: com.razorpay.upi.Error) {
        //Display error message to user. 
    }
}, {color-hex for button's theme})
```

### Transactional Flow

1. To process the payments, call the `submit method` of custom checkout with the provided payload.

   KotlinJava

   copy

   ```kotlin
val payload = JSONObject("""
{
 "currency":"INR",
 "amount":"700",
 "email":"gaurav.kumar@example.com",
 "contact":"9000090000",
 "method":"upi",
 // the below upi block is specific for Turbo UPI Payment
 "upi":{ 
   "flow":"in_app"
 },
 "order_id":"order_L2MUBUOeFItcpU",//optional
 "customer_id":"cust_KQlMczYKcDIqmB"//optional
}
""".trimIndent())
```
2. Pass the `vpa` and `payload` objects as shown in the code below.

   KotlinJava

   copy

   ```kotlin
val turboPayload = HashMap<String, Any> ().apply {
    put("upiAccount", upiAccount)
    put("payload", payload)
}
razorpay.submit(turboPayload, object: PaymentResultWithDataListener {
    override fun onPaymentSuccess(razorpayPaymentID: String, paymentData: PaymentData) {

    }
    override fun onPaymentFailure(code: Int, response: String, paymentData: PaymentData) {
        //Show error message
    }
})
```

### Non-Transactional Flow

You can directly interact with the exposed methods of the Turbo Framework to perform the non-transactional flows listed below.

Manage UPI Accounts

Let Razorpay SDK manage the linked `UpiAccount` on the applications by triggering `manageUpiAccounts()`.

**Handy Tips**

A mobile number is required in the `linkNewUpiAccount` function for an enhanced user experience. Otherwise, feel free to use either your mobile number or customer id.

Code

Customer Interaction Walkthrough Video

Manage UPI Accounts

copy

```kotlin
razorpay.upiTurbo?.manageUpiAccounts(<10 digit mobile number>, <unique customer id>,
    object : UpiTurboManageAccountListener {
        override fun onError(error: JSONObject)  {
            /*Throws error if UPI Turbo cannot be initialized or throws error*/}

        override fun onSuccess(data: Any) {/*Can be safely ignored*/}
})
```

**Watch Out!**

The same combination of mobile number and customer id must be consistently passed across all sessions when calling `linkNewUpiAccountWithUI`, `getLinkedUpiAccounts` and `manageUpiAccounts` for a given user.

### Additional Features

1. To get the device binding status, please use the method `isDeviceOnboarded()` which returns a boolean. It indicates whether the device binding, which is a prerequisite for adding UPI accounts, is done with the user's mobile number.

   Kotlin

   copy

   ```kotlin
if (Razorpay.UpiTurbo.isDeviceOnboarded(activity: Activity)) {
    // User Device Binded
} else {
    // Call Link New Account for Device Binding
}
```
2. Users can now link their credit cards alongside bank accounts during onboarding. You can seamlessly retrieve both credit and bank accounts for transactions, thereby simplifying payments, expanding options, and ensuring security.
3. Charges will be levied for payments made using CC on UPI. Contact the [support team](https://razorpay.com/support/#request)

   for further information.

### Models Exposed from the SDKs

The SDKs given below provide access to exposed models for seamless integration.

UpiAccount

Error [Refer to the list of possible error reasons](/razorpay-docs-md/payment-gateway/android-integration/custom/payment-methods/turbo-upi/error-codes.md).

BankAccount

BankAccountState

Bank

PaymentData

## 2. Test Integration

We recommend the following:

- Complete the integration on UAT before using the prod builds.
- Perform the UAT using the Razorpay-provided API keys.

## 3. Go-live Checklist

Complete these steps to take your integration live:

- You should get your app id allowlisted by Razorpay to test on prod.
- As a compliance requirement, you need to get approval from Google for **READ\_SMS** permission. Refer [to the Google article](https://support.google.com/googleplay/android-developer/answer/10208820?hl=en)

  for more details.
- Add Proguard rules:

  - `keepclassmembers,allowobfuscation class * { @com.google.gson.annotations.SerializedName <fields>; }`
  - `keepclassmembers enum * { *; }`
  - `keepclassmembers class * { @android.webkit.JavascriptInterface <methods>; }`
  - `dontwarn com.razorpay.**`
  - `keep class com.razorpay.** {*;}`
  - `keep class com.olivelib.** {*;}`
  - `keep class com.olive.** {*;}`
  - `keep class org.apache.xml.security.** {*;}`
  - `keep interface org.apache.xml.security.** {*;}`
  - `keep class org.npci.** {*;}`
  - `keep interface org.npci.** {*;}`
  - `keep class retrofit2.** { *; }`
  - `keep class okhttp3.** { *; }`
- Replace the UAT credential with the [Razorpay live keys](/razorpay-docs-md/api/authentication.md#live-mode-api-keys)

  for prod testing.
