<!-- Source: https://developer.phonepe.com/payment-gateway/mobile-app-integration/standard-checkout-mobile/ios/introduction -->

# Introduction to iOS SDK

---

## What is an SDK?

An SDK (Software Development Kit) is a collection of tools and libraries that makes it easier for developers to add specific features or functionalities to their apps, without starting from scratch.

**The PhonePe Payment Gateway iOS SDK** helps you quickly integrate secure and reliable payment processing into your iOS app. It handles all the complex parts of the payment flow, so you can focus on delivering a smooth experience to your users. With just a few lines of code, you can start accepting payments through various modes supported by PhonePe.

The PhonePe iOS SDK supports multiple payment methods, including:

- UPI
- Cards
- Net Banking
- Wallets

With the iOS SDK, you can deliver a seamless, app-native payment experience to your users.

This guide will walk you through everything, from setting up the SDK to initiating transactions and handling refunds.

## User Journey

The following user journey illustrates the complete payment lifecycle to help you understand the integration flow clearly.

![](/static/7c0991247098d1f8556b6ceb4c15ea33/58f13/iOS-1.png)![](/static/7c0991247098d1f8556b6ceb4c15ea33/58f13/iOS-1.png)

![](/static/7c0991247098d1f8556b6ceb4c15ea33/58f13/iOS-1.png)![](/static/7c0991247098d1f8556b6ceb4c15ea33/58f13/iOS-1.png)

## Prerequisites

Before you begin integrating the PhonePe iOS SDK, make sure you have the following:

- **iOS SDK version 5.3.4**
- **Xcode 12.5 or later**
  Ensure your development environment is up to date.
- **CocoaPods**
  Used to install and manage the SDK and its dependencies.
- **PhonePe Merchant Onboarding Completed**
  You should have the following credentials provided by PhonePe PG:
  - Merchant ID
  - Client Secret
  - API Version (for generating the OAuth token)

## Integration Overview

Here’s how the PhonePe iOS SDK integration works:

1. **Customer initiates a payment** from iOS app.
2. **Your backend fetches an Auth Token** using the Authorization API.
3. **Your backend creates a payment order** using the Create Order API.
4. **The SDK is initialized** from iOS app.
5. **The app launches PhonePe checkout screen** using the SDK.
6. **User completes the payment** and is redirected back to your app.
7. Yourbackend verifies the final payment status using **Webhook** or the **Order Status API**.

## Environments

Use the environment URLs below to integrate and test your API calls. The Sandbox environment is intended for testing and validation, while the Production environment should be used once your integration is live. Make sure to switch the base URL based on the environment you’re working in.

|  |  |
| --- | --- |
| **Environment** | **API** |
| `Sandbox` | https://api-preprod.phonepe.com/apis/pg-sandbox/<Endpoint> |
| `Production` | **Authorization API:** https://api.phonepe.com/apis/identity-manager/<Endpoint> **Other APIs:** https://api.phonepe.com/apis/pg/<Endpoint> |

## API Endpoints

Here’s a quick reference to the key APIs involved in the Android SDK integration flow. Each API plays a specific role, from initiating a transaction to handling refunds and fetching statuses. Use this table to understand which endpoint to call for each step in the payment lifecycle.

Endpoint Details:

|  |  |  |
| --- | --- | --- |
| **API** | **Method** | **Endpoint** |
| `Authorization` | `POST` | /v1/oauth/token |
| `Create Payment` | `POST` | /checkout/v2/sdk/order |
| `Order Status API` | `GET` | /checkout/v2/order/{merchantOrderId}/status |
| `Refund` | `POST` | /payments/v2/refund |
| `Refund Status API` | `GET` | /payments/v2/refund/{merchantRefundId}/status |

## What’s Next?

Now that you’re familiar with the iOS SDK and how it streamlines payment integration, you can begin the actual integration process.

In the next section, we’ll guide you through the integration steps to help you set up and start accepting payments in your iOS app.
