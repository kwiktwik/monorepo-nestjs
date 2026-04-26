<!-- Source: https://developer.phonepe.com/payment-gateway/mobile-app-integration/standard-checkout-mobile/android-sdk/integration-steps -->

# Android SDK Integration

---

To get started with integration, follow these steps:

- [App Side Android SDK Setup](/phonepe-docs-md/payment-gateway/mobile-app-integration/standard-checkout-mobile/android-sdk/integration-steps.md#nav-1-app-side-setup-android-sdk)
- [Server Side Android SDK Setup](/phonepe-docs-md/payment-gateway/mobile-app-integration/standard-checkout-mobile/android-sdk/integration-steps.md#nav-2-server-side-setup-android-sdk)

## 1. App Side Setup (Android SDK)

The AndroidÂ **App Side Setup**Â is about configuring and implementing the SDK (Software Development Kit) on your mobile application to interact with PhonePe Payment Gateway. Focuses on integrating the SDK in the mobile app to trigger the payment process and handle responses.

- **Install the SDK**: You need to add PhonePeâs SDK into your mobile app so that it can communicate with PhonePeâs systems.
- **Configure the App**: This includes editing the appâs settings (like in Info.plist for Android) to allow it to recognize different payment systemsÂ and handle transactions securely.
- **Start the Payment Flow**: Youâll integrate a payment button or screen in your app. When the user proceeds with the payment, the app uses the SDK to initiate the transaction with PhonePe.
- **Handle Callbacks**: After the payment is processed, the app receives a callback with the payment result. You need to implement logic to capture and handle these results (e.g., whether the payment was successful or failed).

## 2. Server Side Setup (Android SDK)

TheÂ **Server Side Setup**Â is about configuring your backend (server) to interact with PhonePeâs system to handle things like order creation, authentication, and status tracking.Â

- **Fetch Auth Token**: Before you can create an order, your server needs to authenticate with PhonePeâs system. You do this by fetching anÂ **Auth Token**Â that will be used to validate requests from your server.
- **Create Order**: When a user initiates a payment in your app, your backend needs to create a payment order by calling theÂ **Create Order API**Â on PhonePeâs server. The server receives anÂ **Order Token**Â andÂ **Order ID**Â in response.
- **Pass Order Token to App**: After your server creates the order, it sends theÂ **Order Token**Â andÂ **Order ID**Â to the mobile app so the app can use it to complete the payment process.
- **Monitor Payment Status**: Once the user makes a payment, your server should track the payment status. You can either listen for aÂ **Webhook**Â notification from PhonePe or make periodic requests to check the payment status. Based on the response, you update the orderâs status (whether the payment was successful or failed).

## Whatâs Next?

You have completed integration the Android SDK to your app and learned about the Webhook callback. Next, set up the SDK so your app can make payments smoothly inside the app.

Head over to the next section to learn how to set up the Android SDK.
