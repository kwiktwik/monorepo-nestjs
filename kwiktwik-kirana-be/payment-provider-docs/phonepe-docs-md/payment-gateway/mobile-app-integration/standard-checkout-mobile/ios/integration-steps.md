<!-- Source: https://developer.phonepe.com/payment-gateway/mobile-app-integration/standard-checkout-mobile/ios/integration-steps -->

# iOS SDK Integration

---

### To get started with integration, follow these steps

- [App Side iOS SDK Setup](/phonepe-docs-md/payment-gateway/mobile-app-integration/standard-checkout-mobile/ios/integration-steps.md#nav-1-app-side-setup-i-os-sdk)
- [Server Side iOS SDK Setup](/phonepe-docs-md/payment-gateway/mobile-app-integration/standard-checkout-mobile/ios/integration-steps.md#nav-2-server-side-setup-i-os-sdk)

## 1. App Side Setup (iOS SDK)

The iOS **App Side Setup** is about configuring and implementing the SDK (Software Development Kit) on your mobile application to interact with PhonePe Payment Gateway. Focuses on integrating the SDK in the mobile app to trigger the payment process and handle responses.

- **Install the SDK**: You need to add PhonePeâs SDK into your mobile app so that it can communicate with PhonePeâs systems.
- **Configure the App**: This includes editing the appâs settings (like in Info.plist for iOS) to allow it to recognize different payment systemsÂ  and handle transactions securely.
- **Start the Payment Flow**: Youâll integrate a payment button or screen in your app. When the user proceeds with the payment, the app uses the SDK to initiate the transaction with PhonePe.
- **Handle Callbacks**: After the payment is processed, the app receives a callback with the payment result. You need to implement logic to capture and handle these results (e.g., whether the payment was successful or failed).

## 2. Server Side Setup (iOS SDK)

The **Server Side Setup** is about configuring your backend (server) to interact with PhonePeâs system to handle things like order creation, authentication, and status tracking.Â

- **Fetch Auth Token**: Before you can create an order, your server needs to authenticate with PhonePeâs system. You do this by fetching an **Auth Token** that will be used to validate requests from your server.
- **Create Order**: When a user initiates a payment in your app, your backend needs to create a payment order by calling the **Create Order API** on PhonePeâs server. The server receives an **Order Token** andÂ **Order ID** in response.
- **Pass Order Token to App**: After your server creates the order, it sends the **Order Token** and **Order ID** to the mobile app so the app can use it to complete the payment process.
- **Monitor Payment Status**: Once the user makes a payment, your server should track the payment status. You can either listen for a **Webhook** notification from PhonePe or make periodic requests to check the payment status. Based on the response, you update the orderâs status (whether the payment was successful or failed).

## Whatâs Next?

Youâve now understood the key steps involved in integrating PhonePe Payment Gateway into your app. Itâs time to begin the actual integration process by generating an authorization token.

Head over to the next section to learn how to securely authenticate your API requests using our Authorization API.
