<!-- Source: https://razorpay.com/docs/payments/payment-gateway/flutter-integration/standard/payment-methods/turbo-upi -->

[Turbo UPI Flutter Standard SDK

Discover new features, updates and deprecations related to Turbo UPI on Flutter Standard Checkout (since Jan 2024).](/razorpay-docs-md/changelog.md#products)

Razorpay Turbo UPI enables businesses to offer faster and simpler payments by reducing the payment process from 5 steps to just 1, eliminating app redirections. This provides a seamless in-app payment experience, reduce dependencies on third-party UPI apps, and offers complete visibility into the payment journey.

You can easily integrate Turbo UPI with the Razorpay Flutter Standard SDK. Explore the full potential of [Razorpay Turbo UPI](/razorpay-docs-md/payment-methods/upi/turbo-upi.md) and learn how it works.

![Turbo UPI Standard Checkout Flow](https://razorpay.com/docs/payments/payment-gateway/flutter-integration/standard/payment-methods/build/browser/assets/images/turbo-upi-flow.jpg)

Prerequisites

1. Contact our [integrations team](mailto:integrations@razorpay.com)

   to get your mobile number, app, and GitHub account whitelisted for access to the `https://github.com/upi-turbo/razorpay-turbo-flutter` sample app repository.
2. Review the [Razorpay Flutter Standard SDK](/razorpay-docs-md/payment-gateway/flutter-integration/standard.md)

   documentation for integration guidelines.
3. Add Location Dependency: The SDK requires location permission to complete device onboarding. Ensure you have added the necessary location dependencies as described below.

   - For iOS:
     Update your `Info.plist` file with the following keys to request location permissions:

     plist

     copy

     ```yml
<key>NSLocationWhenInUseUsageDescription</key>
<string>
Your app needs access to your location while using the app.</string>
```

     Make sure these permissions are clearly communicated to your users to ensure a smooth onboarding experience.
4. For Android-specific integrations, add the following dependencies to your `build.gradle` file:

**Getting the Turbo Dependencies:**

gradle

copy

```java
implementation("com.razorpay:checkout:<checkout_version>")
implementation("com.razorpay:razorpay-turbo:<razorpay-turbo_version>")
implementation("com.razorpay:turbo-ui:<turbo-ui_version>")
```

Replace `<checkout_version>`, `<razorpay-turbo_version>`, and `<turbo-ui_version>` with the latest versions available.

You can find the latest versions here:

- [Razorpay Checkout](https://central.sonatype.com/artifact/com.razorpay/checkout)
- [Razorpay Turbo](https://central.sonatype.com/artifact/com.razorpay/razorpay-turbo)
- [Turbo UI](https://central.sonatype.com/artifact/com.razorpay/turbo-ui)

**Enable `viewBinding` and `dataBinding`:**

gradle

copy

```java
buildFeatures {
        viewBinding = true
        dataBinding = true
}
```

Ensure you sync your project after adding these dependencies.

Library Dependencies

To integrate Turbo UPI, you must add the required library dependencies to your Flutter project:

1. Add the following entry to the `dependencies` section of your `pubspec.yaml` file:

   yaml

   copy

   ```yaml
razorpay_turbo_standard: 1.0.0
```
2. Run the following command in your terminal to fetch and install the new dependency:

   bash

   copy

   ```bash
flutter pub get
```

## Onboarding Flow

Ensure your customers [onboard with Razorpay Turbo UPI](/razorpay-docs-md/payment-methods/upi/turbo-upi.md#onboarding-flow) to get started.

## 1. Integration Steps

Follow these steps to integrate with Razorpay Turbo UPI:

### 1.1 Import Razorpay Package

To integrate Turbo UPI with your Flutter app, start by importing the required packages.

This sets up the SDK and enables your app to handle UPI payments. Use the code snippet below to import the package:

dart

copy

```yml
import 'package:razorpay_flutter/razorpay_flutter.dart';
```

### 1.2 Initialise Razorpay and Register Event Listeners

Set up the Razorpay instance and register event listeners to handle payment success, failure, and session token refresh.

This ensures your app can respond appropriately to payment outcomes and keep session tokens up to date for a smooth user experience.

Add the following method during initialisation:

dart

copy

```java
void initializeRazorpayWithEvents() {
 // Create a Razorpay instance
 razorpay = Razorpay("YOUR_KEY_ID");
 //Session token event
 razorpay.on(Razorpay.EVENT_FETCH_SESSION_TOKEN, _handleRefreshToken);

 //Payment Events
 razorpay.on(Razorpay.EVENT_PAYMENT_ERROR, handlePaymentErrorResponse);
 razorpay.on(Razorpay.EVENT_PAYMENT_SUCCESS, handlePaymentSuccessResponse);
}
```

### 1.3. Create a Session Token

To enhance security, you must create a session token via a server-to-server (S2S) call between your backend and Razorpay's backend. This session token ensures secure communication between the Turbo SDK and Razorpay's systems.

#### How to Create a Session Token

1. Trigger the S2S API from your Backend. Use the following API to generate a session token:

   Request Parameter

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

   Errors

   Given below is a list of errors you may face during session token.
2. Create/Retry Session Token Mechanism

   To ensure a smooth experience during token expiry, the Turbo SDK provides the `updateSessionToken` method. This method dynamically fetches and updates the session token without reinitialising the session.

   This allows you to seamlessly refresh the session by retrieving a new token via a server-to-server (S2S) call.

   Below is an example of using `updateSessionToken`.

   - Handle the event using the code given below:

     dart

     copy

     ```java
void _handleRefreshToken(dynamic response) async {
  // API Call to generate token
  razorpay.upiTurbo.updateSessionToken(token: ‘<session-token>’);
};
```

### 1.4. Handle UPI Account Linking and Payment Flow

You can link a customer's UPI account and initiate payments using the methods described below.

#### 1.4.1 Link Customer's UPI Account

To link a customer's UPI account with your app, use the following code sample. This will prompt the customer to add and link their UPI account.

dart

copy

```java
razorpay.upiTurbo.linkNewUpiAccount(
        customerMobile: mobileNumber,
        color: "#ffffff",
        onSuccess: (List<UpiAccount> upiAccounts) {
                // Handle successful linking. upiAccounts may be empty if no accounts are linked yet.
        },
        onFailure: (Error error) {
                // Handle error during linking.
        }
);
```

Request Parameters

customerMobile

mandatory

`string` Mobile number of the customer.

color

optional

`string` Colour in HEX format.

Response Parameters

#### 1.4.2 Initiate Payment Using Standard Checkout

To initiate a payment, call the Standard Checkout’s `open` method with the required payload:

dart

copy

```java
Map<String, Object> payload = {
        'amount': 100, // Amount in the smallest currency unit (e.g., paise)
        'currency': 'INR',
        'prefill': {
                'contact': 'YOUR_MOBILE_NUMBER',
                'email': 'YOUR_EMAIL'
        },
        'theme': {'color': '#0CA72F'},
        'key': 'YOUR_KEY_ID',
        'image': 'https://spaceplace.nasa.gov/templates/featured/sun/sunburn300.png'
};

razorpay.open(payload);
```

Request Parameters

payload

mandatory

`Map<String, dynamic>` Payload for initiating the transaction.

#### 1.4.3 Handle Payment Events

Handle payment success and failure responses:

- **Handle Payment Failure:**

  Log and display error details such as error code, description, and metadata.

  dart

  copy

  ```java
implementation("com.razorpay:checkout:<checkout_version>")
implementation("com.razorpay:razorpay-turbo:<razorpay-turbo_version>")
implementation("com.razorpay:turbo-ui:<turbo-ui_version>")
```0
- **Handle Payment Success:**

  Log and display key information like order ID, payment ID, and signature.

  dart

  copy

  ```java
implementation("com.razorpay:checkout:<checkout_version>")
implementation("com.razorpay:razorpay-turbo:<razorpay-turbo_version>")
implementation("com.razorpay:turbo-ui:<turbo-ui_version>")
```1

By following these steps, you can seamlessly link customer UPI accounts and handle payments using Razorpay Turbo UPI in your Flutter app.

### Non-Transactional Flow

Razorpay provides a single exposed function that allows you to manage linked UPI accounts and access all non-transactional flows seamlessly.

![View the non-transactional flow](https://razorpay.com/docs/payments/payment-gateway/flutter-integration/standard/payment-methods/build/browser/assets/images/turbo-upi-non-transactional.jpg)

Manage UPI Accounts

The SDK manages the linked `UpiAccounts` on the application by triggering `manageUpiAccounts()`. The sequence of steps is as given below:

- **Fetch balance**: Check the customer's account balance.
- **Change UPI PIN**: Provide the customer the ability to change their UPI PIN.
- **Reset UPI PIN**: Let your customers reset the PIN for their account.
- **Delete the account from the application**: Let your customers delink, that is, remove a selected UPI account from your application.

dart

copy

```java
implementation("com.razorpay:checkout:<checkout_version>")
implementation("com.razorpay:razorpay-turbo:<razorpay-turbo_version>")
implementation("com.razorpay:turbo-ui:<turbo-ui_version>")
```2

Request Parameters

customerMobile

mandatory

`string` Mobile number of the customer.

color

optional

`string` Colour in HEX format.

Response Parameter

### Models Exposed from the SDKs

The SDKs given below provide access to exposed models for seamless integration.

Error [Refer to the list of possible error reasons](/razorpay-docs-md/payment-gateway/flutter-integration/standard/payment-methods/turbo-upi/error-codes.md).

UpiAccount
