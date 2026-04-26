<!-- Source: https://developer.phonepe.com/payment-gateway/backend-sdk/nodejs-be-sdk/introduction -->

# Introduction to PhonePe Node.js SDK

---

**PhonePe Node.js SDK**(**v2.0.5**) is a lightweight and secure software development kit that allows you to integrate the PhonePe Payment Gateway seamlessly into your Node.js backend systems. With this integration, you can accept a wide range of payment methods, initiate payments, check payment status, handle callbacks, and process refunds with ease.

If you choose to integrate the PhonePe Payment Gateway into your website or application using the Node.js backend SDK, here’s an overview of the end-to-end user journey.

## User Journey

The following user journey illustrates the complete payment lifecycle to help you understand the integration flow clearly.

![](/static/942f1b27a63343f927cec8df6c02d7ca/58f13/Nodejs-SDK-1-scaled.png)![](/static/942f1b27a63343f927cec8df6c02d7ca/58f13/Nodejs-SDK-1-scaled.png)

![](/static/942f1b27a63343f927cec8df6c02d7ca/58f13/Nodejs-SDK-1-scaled.png)![](/static/942f1b27a63343f927cec8df6c02d7ca/58f13/Nodejs-SDK-1-scaled.png)

## Prerequisites

Before you start the integration process, ensure you have:

- Access to PhonePe PG’s UAT (User Acceptance Testing) and production environments.
- SDK credentials, including the Merchant ID, Client ID, Client Secret and Client Version.
- A testing environment to simulate the payment flow.
- **Node Version: v14** **or above** should be installed on your system.
- **npm** or **yarn** configured as the project package manager.

You can find your Client ID and Secret in the [PhonePe Business Dashboard](https://business.phonepe.com/login). Set the ‘Test Mode’ toggle to ON to get Sandbox (UAT) credentials, or set it to OFF to get Production credentials.

Sample Variables

```
String clientId = "<clientId>";String clientSecret = "<clientSecret>";Integer clientVersion = "<clientVersion>";
```

## What’s Next?

Now that you know about the Node.js Backend SDK, you can start to integrate the PhonePe Payment Gateway into your website. The next section will guide you step by step on how to set it up.

Head over to the next section to learn the key steps involved in integrating PhonePe Payment Gateway into your website.
