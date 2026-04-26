<!-- Source: https://razorpay.com/docs/payments/payment-gateway/flutter-integration/custom/payment-methods/turbo-upi/integration-noui -->

With Razorpay Turbo UPI, businesses experience faster and simpler payments. It condenses the payment process from 5 steps to just 1, eliminating app redirections. Enjoy a seamless in-app payment experience, reduce dependencies on third-party UPI apps, and gain complete visibility of the payment journey.

**Watch Out!**

Currently, Flutter SDK is supported only for Android.

Prerequisites

1. Contact our [integrations team](mailto:integrations@razorpay.com)

   to get your mobile number, app, and GitHub account whitelisted to get access to the `https://github.com/upi-turbo/android-turbo-sample-app` - sample app repository. In this repository, you will find the AAR files (libraries for Turbo). The AARs on the main branch are for the UAT environment, and the ones on the prod branch are for the production environment.
   These are the important files in the sample app repo:
   - `app/libs`: All libraries (Bank, SecureComponent and Turbo) common for headless SDK.
   - `app/build.gradle`: All transitive dependencies needed to integrate Turbo SDK.
2. Integrate with [Razorpay Flutter Custom Integration](/razorpay-docs-md/payment-gateway/flutter-integration/custom/build-integration.md)   .
3. Import the following frameworks:

   - Razorpay Turbo Wrapper Plugin SDK (maven)
   - Razorpay Turbo Core SDK
   - Razorpay SecureComponent SDK
   - Bank SDK
4. Add the following lines to your Android project's `gradle.properties` file:

   - `android.enableJetifier=true`
   - `android.useAndroidX=true`

**Watch Out!**

Currently, the Flutter SDK is available for Android, while iOS support is under development and will be available soon.

## 1. Integration Steps

1. Use the code given below to initialise the SDK.

   Import Package

   copy

   ```yml
import 'package:razorpay_flutter/razorpay_flutter.dart'; 
 // Create a Razorpay instance
razorpay = Razorpay("YOUR_KEY_ID");
```
2. Use the following code to link the newly created UPI account with your app. This function can be called from anywhere in the application, providing multiple entry points for customers to link their UPI account with your app.

   Link UPI Account

   copy

   ```java
razorpay.upiTurbo.linkNewUpiAccount("mobileNumber");
```

   Request Parameter

   - Initialise the instance to handle the event using the code given below:

   Instantiate

   copy

   ```java
razorpay.on(Razorpay.EVENT_UPI_TURBO_LINK_NEW_UPI_ACCOUNT,
_handleLinkNewUpiAccountFlows);
```

   - Handle dynamic responses to perform specific actions, including error handling and interactions with the integration, based on 'type' and 'action' properties.

   **Watch Out!**

   It is mandatory to add the import statement within the `linkNewUpiAccount` function for **RazorpayCard** access.

   Attach Event Listeners

   copy

   ```yml
import 'package:razorpay_flutter_customui/card.dart' as RazorPayCard;

void _handleLinkNewUpiAccountFlows(dynamic response) {
 if (response["error"] != null) {
    Error error = response["error"];
    error.errorCode;
    error.errorDescription;
    return;
}

switch (response["action"]) {
 case "ASK_FOR_PERMISSION":
    razorpay.upiTurbo.askForPermission();
    break;
 case "LOADER_DATA":
    / Use this trigger to easily show background process happening in the SDK during onboarding
    break;
 case "STATUS":
    razorpay.upiTurbo.getLinkedUpiAccounts(
        customerMobile: mobileNumber,
        onSuccess: (List<UpiAccount> upiAccounts) {},
        onFailure: (Error error) {},
    );
    break;
 case "SELECT_SIM":
    List<Sim> sims = response["data"];
    // Show dialog with a list of sims
    razorpay.upiTurbo.register(sim: sims[0]);
    break;
 case "SELECT_BANK":
    AllBanks allBank = response["data"];
    List<Bank> popularBanks = allBank.popularBanks;
    List<Bank> banks = allBank.banks;

    // Show dialog with bank list
    razorpay.upiTurbo.getBankAccounts(bank: banks[0]);
    break;
 case "SELECT_BANK_ACCOUNT":
    List<BankAccount> bankAccounts = response["data"];
    razorpay.upiTurbo.selectedBankAccount(bankAccount: bankAccounts[0]);
    break;
 case "SETUP_UPI_PIN":
    var card = RazorPayCard.Card(
        lastSixDigits: lastSixDigits,
        expiryYear: expiryYear,
        expiryMonth: expiryMonth,
    );
    razorpay.upiTurbo.setupUpiPin(card: card);
    break;
 default:
  // Wrong action message
 }
}
```
3. If your customer has already linked the UPI account, use the following code to fetch it. If there are no linked UPI accounts, an empty list is returned.

   Get Linked UPI Account

   copy

   ```java
razorpay.upiTurbo.getLinkedUpiAccounts(customerMobile: mobileNumber,
  onSuccess: (List<UpiAccount> upiAccounts){
     //Display on boarded UpiAccounts.     
  },
  onFailure: (Error error) {
     //Display error message to user.             
  }
);
```

   Request Parameter

   Response Parameters
4. To accept payments, call Custom Checkout’s `submit` method with the following payload:

   Submit Payment Details

   copy

   ```java
Map<String, dynamic> payload = {
 "key": "[YOUR_KEY_ID]",
 "currency": "INR",
 "amount": 100,
 "contact": "9000090000",
 "method": "upi",
 "email": "gaurav.kumar@example.com",
 "upi": {
     "flow": "in_app"
 }
};

Map<String, dynamic> turboPayload = {
 "upiAccount": getUpiAccountStr(upiAccounts[0]),
 "payload": payload,
};

String getUpiAccountStr(UpiAccount upiAccount) {
    return jsonEncode(UpiAccount(
        accountNumber: upiAccount.accountNumber,
        bankLogoUrl: upiAccount.bankLogoUrl,
        bankName: upiAccount.bankName,
        bankPlaceholderUrl: upiAccount.bankPlaceholderUrl,
        ifsc: upiAccount.ifsc,
        pinLength: upiAccount.pinLength,
        vpa: upiAccount.vpa,
    ).toJson());
}

razorpay.submit(turboPayload);
```

   Request Parameter

   Response Parameters

   - Initialise the instance to handle the event, using the code given below:

   Instantiate

   copy

   ```java
razorpay.on(Razorpay.EVENT_PAYMENT_SUCCESS, _handlePaymentSuccess);
razorpay.on(Razorpay.EVENT_PAYMENT_ERROR, _handlePaymentError);
```

   - Print payment success and error responses by attaching event listeners to payment events as given below:

   Attach Event Listeners

   copy

   ```yml
void _handlePaymentSuccess(Map<dynamic, dynamic> response) {
    print('Payment Success Response : $response');
}

void _handlePaymentError(Map<dynamic, dynamic> response) {
    print('Payment Error Response : $response');
}
```

### Non-Transactional Flow

You can directly interact with the exposed methods of the Turbo Framework to perform the non-transactional flows listed below.

Fetch Balance

Fetch the customer's account balance. Call `getBalance()` on the bank account object received from `upiAccount`.

Fetch Balance

copy

```java
razorpay.upiTurbo.getBalance(upiAccount: upiAccount,
    onSuccess: (AccountBalance accountBalance){
    },
    onFailure: (Error error) {
    }
);
```

Request Parameter

Response Parameters

Change UPI PIN

Provide the customer with the ability to change their UPI PIN. Call `changeUpiPin()` on the bank account object received from `UpiAccount`.

Change UPI PIN

copy

```java
razorpay.upiTurbo.changeUpiPin(upiAccount: upiAccount,
    onSuccess: (UpiAccount upiAccount){
    },
    onFailure: (Error error) {
    }
);
```

Request Parameters

Response Parameters

Reset UPI

Let your customers reset the PIN for their account.

Reset UPI

copy

```java
razorpay.upiTurbo.linkNewUpiAccount("mobileNumber");
```0

Request Parameters

Response Parameters

Delink

Let your customers delink, that is, remove a selected UPI account from your application.

Delink

copy

```java
razorpay.upiTurbo.linkNewUpiAccount("mobileNumber");
```1

Request Parameter

Response Parameters

### Models Exposed from the SDKs

The SDKs given below provide access to exposed models for seamless integration.

BankAccount

Bank

AccountBalance

Error [Refer to the list of possible error reasons](/razorpay-docs-md/payment-gateway/flutter-integration/custom/payment-methods/turbo-upi/error-codes.md).

UpiAccount

SIM

Card

AllBanks

## 2. Test Integration

We recommend the following:

- Complete the integration on UAT before using the prod builds.
- Perform the UAT using the Razorpay-provided API keys.

## 3. Go-live Checklist

Complete these steps to take your integration live:

1. You should get your app id whitelisted by Razorpay to test on prod.

   **Handy Tips**

   Contact our [integrations team](mailto:integrations@razorpay.com)

   to get your mobile number and app whitelisted.
2. Import the prod library from the GitHub repository → `https://github.com/upi-turbo/android-turbo-sample-app/tree/prod/app/libs` prod branch.
3. Add Proguard rules:

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
4. Replace the UAT credential with the [Razorpay live keys](/razorpay-docs-md/api/authentication.md#live-mode-api-keys)

   for prod testing.
