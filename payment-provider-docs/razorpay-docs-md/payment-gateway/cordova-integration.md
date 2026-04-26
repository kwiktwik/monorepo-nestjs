<!-- Source: https://razorpay.com/docs/payments/payment-gateway/cordova-integration -->

#### Cordova Standard SDK Changelog

Discover new features, updates and deprecations related to the Razorpay Cordova Standard SDK (since Jan 2024).

#### Troubleshooting & FAQs

Troubleshoot common error scenarios and find answers to frequently asked questions about Cordova Standard integration.

You can use Razorpay Standard SDK to integrate the Razorpay Payment Gateway with your Cordova Application to accept payments. The Razorpay Cordova plugin acts as a wrapper around the Razorpay Standard SDK to build a dynamic and responsive Checkout interface for your iOS or Android application.

**Update SDK**

Check your current [Cordova](/razorpay-docs-md/payment-gateway/cordova-integration/troubleshooting-faqs.md#7-how-can-i-check-the-razorpay-cordova) or [Iconic](/razorpay-docs-md/payment-gateway/cordova-integration/troubleshooting-faqs.md#8-how-can-i-check-the-razorpay-ionic)

Standard SDK version. If it is outdated, please [update the SDK](/razorpay-docs-md/payment-gateway/cordova-integration/troubleshooting-faqs.md#9-how-can-i-update-the-razorpay-cordova) to ensure uninterrupted settlements of your funds.

## Guidelines

- Add the integration code snippet after the `deviceready` event.
- On browser, change the [Content Security Policy](https://content-security-policy.com/)

  to whitelist the `razorpay.com` domain.

javascript

copy

```javascript
<meta http-equiv="Content-Security-Policy" content="default-src 'self' https://*.razorpay.com data: gap: https://ssl.gstatic.com 'unsafe-eval'; style-src 'self' 'unsafe-inline'; media-src *"/>
```

- We do not support [ionic server](https://github.com/ionic-team/ionic-cli/issues/354)

  at the moment because it does not support cordova browser plugins. Try using the `ionic cordova run browser` command instead.

## Integration Steps

**Before you proceed:**

- Create a [Razorpay account](https://dashboard.razorpay.com/signup)  .
- Generate the [API Keys](/razorpay-docs-md/dashboard/account-settings/api-keys.md#generate-api-keys)

  from the Dashboard. To go live with the integration and start accepting real payments, generate Live Mode API Keys and replace them in the integration.
- Know about the [Payment Flow](/razorpay-docs-md/payment-gateway/how-it-works.md)  .

Follow these integration steps:

#### 1. Build Integration

Integrate Cordova Standard SDK.

#### 2. Test Integration

Test the integration by making a test payment.

#### 3. Go-live Checklist

Check the go-live checklist.

#### Sample Code

Check the sample code on GitHub to integrate.

### Related Information [Address Verification System](/razorpay-docs-md/international-payments/address-verification-system.md)
