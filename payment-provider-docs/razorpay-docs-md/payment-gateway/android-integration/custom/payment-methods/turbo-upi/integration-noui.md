<!-- Source: https://razorpay.com/docs/payments/payment-gateway/android-integration/custom/payment-methods/turbo-upi/integration-noui -->

Use Razorpay Turbo UPI to make UPI payments faster. Follow these steps to integrate with the Razorpay Turbo UPI Headless SDK.

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

       // Production
       implementation "com.razorpay:customui:$CUSTOMUI_VERSION"
       implementation "com.razorpay:razorpay-turbo:$TURBO_VERSION"
   }
```

**Watch Out!**

- Use the `rzp_test_0wFRWIZnH65uny` API key id for testing on the UAT environment and the [Razorpay live keys](/razorpay-docs-md/api/authentication.md#live-mode-api-keys)

  on the prod testing.
- Replace the placeholders ($CUSTOMUI\_VERSION, $TURBO\_VERSION and $CHECKOUT\_VERSION) with the latest versions provided by Razorpay's team or similar to `app/build.gradle` file in the Sample app.

## 1. Integration Steps

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

### 1.2 Initialise Turbo SDK

Initialise the `TurboSessionDelegate` object anonymously and pass it through the initialize method. The SDK will call `fetchToken` function whenever required to get new token.

In the `fetchToken` function, retrieve a new token from your server section, check [1.1 Create a Session Token](/razorpay-docs-md/payment-gateway/android-integration/custom/payment-methods/turbo-upi/integration-noui.md#11-create-a-session-token). Once available, pass it to the completion object.

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
   - For enhanced user experience mobile number is required in `getLinkedUpiAccounts` function, otherwise feel free to use either mobile number or customer id.

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

### 1.4 New user onboarding / Linking additional accounts

Invoke the below function for these use cases:

1. To initiate new onboarding, in case you get a **DEVICE\_BINDING\_INCOMPLETE** error in the above section,
2. To link additional bank accounts for already onboarded users.

   **Handy Tips**

   A mobile number is required in the `linkNewUpiAccount` function for an enhanced user experience. Otherwise, feel free to use either your mobile number or customer id.

   KotlinJava

   copy

   ```kotlin
razorpay.upiTurbo?.linkNewUpiAccount(<10 digit mobile number>, <unique customer id>, object: UpiTurboLinkAccountListener {
    override fun onResponse(action: UpiTurbo.LinkAction) {
        when(action.code) {
            UpiTurbo.LinkAction.ASK_FOR_PERMISSION - > {
                action.requestPermission()
            }
            UpiTurbo.LinkAction.SHOW_PERMISSION_ERROR - > {
                //Show Permission Required error
            }
            UpiTurbo.LinkAction.SELECT_SIM - > {
                action.error ? .let {
                    //show ERROR UI with State.
                    return
                }
                val sims = action.data as List < * >
                val sim1 = sims[0] as Sim
                val sim2 = sims[1] as Sim
                // show UI to select SIM
                action.selectedSim(sim2)
            }
            UpiTurbo.LinkAction.SELECT_BANK - > {
                action.error ? .let {
                    //show ERROR UI with State.
                    return
                }
                val banks = action.data as AllBanks
                val popularBanks : List < Bank > = banks.popularBanks
                val allBanks: List < Bank > = banks.allBanks
                //show UI with banks
                action.selectedBank(popularBanks[0])
            }
            UpiTurbo.LinkAction.SELECT_BANK_ACCOUNT - > {
                action.error ? .let {
                    //show ERROR UI with State.
                    return
                }
                val bankAccounts = action.data as List < * >
                val bankAccount = bankAccounts[0] as BankAccount
                // show Bank Accounts
                action.selectedBankAccount(bankAccount)
            }
            UpiTurbo.LinkAction.SET_UPI_PIN - > {
                action.error ? .let {
                    //show ERROR UI with State.
                    return
                }
                val card = Card("234567", "01", "28")
                action.setUpiPin(card)
            }
            UpiTurboLinkAction.LOADER_DATA - > {
                val message = action.data.toString()
            }
            UpiTurboLinkAction.STATUS - > {
                if (action.error != null) {
                    showErrorAlert(action.error!!.errorDescription)
                    return
                }
                getLinkedUpiAccounts()
            }
            else - > {}
        }
    }
})
```
3. Invoke the below function in your Activity's `onRequestPermissionsResult` function.

   KotlinJava

   copy

   ```kotlin
override fun onRequestPermissionsResult(
    requestCode: Int,
    permissions: Array<out String>,
    grantResults: IntArray){
    if (requestCode == 101) {
        // make sure not to use the 101 requestCode for your other cases 
        razorpay.upiTurbo.onPermissionsRequestResult()
    }
}
```
4. Additionally `razorpay.onBackPressed()` has to be invoked when a user tries to exit the app or return to the previous page. The `razorpay.upiTurbo.releaseActivityReference()` function releases the allocated memory.

   KotlinJava

   copy

   ```kotlin
override fun onBackPressed() {
    razorpay.onBackPressed()
    razorpay.upiTurbo.releaseActivityReference()
    super.onBackPressed()
}
```
5. To process the payment, first create a payload, which will be a `JSONObject` as shown in the code below.

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
    "order_id":"order_L2MUBUOeFItcpU",//mandatory
    "customer_id":"cust_KQlMczYKcDIqmB"//optional
}
    """.trimIndent())
```
6. Pass the `upiAccount` and `payload` objects as shown in the code below.

   KotlinJava

   copy

   ```kotlin
val turboPayload = HashMap<String, Any>()
    turboPayload["upiAccount"] = upiAccount
    turboPayload["payload"] = payload
    razorpay.submit(turboPayload, object : PaymentResultWithDataListener {
        override fun onPaymentSuccess(razorpayPaymentID: String?, paymentData: PaymentData?) {}
        override fun onPaymentError(code: Int, response: String?, paymentData: PaymentData?) {
            //Show error message
        }
    })
```

**Handy Tips**

In case of an error response, you will get a nested `reason` JSON object, which will contain the original error code and description from the bank/NPCI.

### Non-Transactional Flow

You can directly interact with the exposed methods of the Turbo Framework to perform the non-transactional flows listed below.

Fetch Balance

Fetch the customer's account balance. Call `getBalance()` and pass the `UpiAccount` instance you have received from Turbo SDK before.

KotlinJava

copy

```kotlin
razorpay.upiTurbo.getBalance(upiAccount = upiAccount, listener = object: Callback<AccountBalance>{
    override fun onFailure(error: Error) {}

    override fun onSuccess(accBalance : AccountBalance) {
    `object`.balance
    }
})
```

Change UPI PIN

Provide the customer the ability to change their UPI PIN. Call `changeUpiPin()` and pass the `upiAccount` instance you have received from Turbo SDK before.

KotlinJava

copy

```kotlin
dependencies {
       // UAT
       implementation "com.razorpay:customui-uat:$CUSTOMUI_VERSION"
       implementation "com.razorpay:razorpay-turbo-uat:$TURBO_VERSION"

       // Production
       implementation "com.razorpay:customui:$CUSTOMUI_VERSION"
       implementation "com.razorpay:razorpay-turbo:$TURBO_VERSION"
   }
```0

Reset UPI

Let your customers reset the PIN for their account. You will need to collect the below mentioned details for the account:

- Bank accounts: last 6 digits, expiry month & year of the Debit Card.
- Credit cards: last 6 digits, expiry month & year of the Credit Card.

Pass these details in the `Card` data class provided by Turbo SDK and the `upiAccount` object you received from Turbo SDK.

KotlinJava

copy

```kotlin
dependencies {
       // UAT
       implementation "com.razorpay:customui-uat:$CUSTOMUI_VERSION"
       implementation "com.razorpay:razorpay-turbo-uat:$TURBO_VERSION"

       // Production
       implementation "com.razorpay:customui:$CUSTOMUI_VERSION"
       implementation "com.razorpay:razorpay-turbo:$TURBO_VERSION"
   }
```1

Delink

Let your customers delink, that is, remove a selected UPI account from your application.

KotlinJava

copy

```kotlin
dependencies {
       // UAT
       implementation "com.razorpay:customui-uat:$CUSTOMUI_VERSION"
       implementation "com.razorpay:razorpay-turbo-uat:$TURBO_VERSION"

       // Production
       implementation "com.razorpay:customui:$CUSTOMUI_VERSION"
       implementation "com.razorpay:razorpay-turbo:$TURBO_VERSION"
   }
```2

**Watch Out!**

The same mobile number and customer id combination must be consistently passed across all sessions when calling linkNewUpiAccount and getLinkedUpiAccounts for a given user.

### Additional Features

1. To get the device binding status, please use the method `isDeviceOnboarded()` which returns a boolean. It indicates whether the device binding, which is a prerequisite for adding UPI accounts, is done with the user's mobile number.

   Kotlin

   copy

   ```kotlin
dependencies {
       // UAT
       implementation "com.razorpay:customui-uat:$CUSTOMUI_VERSION"
       implementation "com.razorpay:razorpay-turbo-uat:$TURBO_VERSION"

       // Production
       implementation "com.razorpay:customui:$CUSTOMUI_VERSION"
       implementation "com.razorpay:razorpay-turbo:$TURBO_VERSION"
   }
```3
2. Users can now link their credit cards alongside bank accounts during onboarding. You can seamlessly retrieve both credit and bank accounts for transactions, thereby simplifying payments, expanding options, and ensuring security.
3. Changes have been made to the [AccountBalance](/razorpay-docs-md/payment-gateway/android-integration/custom/payment-methods/turbo-upi/integration-noui.md#accountbalance)

   and [UpiAccount](/razorpay-docs-md/payment-gateway/android-integration/custom/payment-methods/turbo-upi/integration-noui.md#upiaccount)

   models regarding credit card support on UPI.
4. Charges will be levied for payments made using CC on UPI. Contact the [support team](https://razorpay.com/support/#request)

   for further information.
5. Turbo SDK will auto-select the SIM card in few cases and the `SELECT_SIM` action will not be triggered in such cases:

   - Device has only one SIM card.
   - Device has multiple SIM cards and the mobile number provided by you matches the number on one of the SIM cards.

Action Parameter Values

Following are the constants passed in the `action.code` parameter in `onResponse`.

### Models Exposed from the SDKs

The SDKs given below provide access to exposed models for seamless integration.

BankAccount

Bank

AccountBalance

Error

UpiAccount

SIM

Card

AllBanks

UpiTurbo.LinkAction

BankAccountState

## 2. Test Integration

We recommend the following:

- Complete the integration on UAT before using the prod builds.
- Perform the UAT using the Razorpay-provided API keys.

## 3. Go-live Checklist

Complete these steps to take your integration live:

- You should get your app id whitelisted by Razorpay to test on prod.
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
