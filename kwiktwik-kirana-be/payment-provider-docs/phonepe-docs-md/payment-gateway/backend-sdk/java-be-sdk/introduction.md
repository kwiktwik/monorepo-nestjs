<!-- Source: https://developer.phonepe.com/payment-gateway/backend-sdk/java-be-sdk/introduction -->

# Introduction to PhonePe Java SDK

---

**PhonePe Java SDK** **(v 2.2.2)** is a robust and secure software development kit that enables you to integrate PhonePe Payment Gateway seamlessly into your Java-based backend systems. With this integration, you can accept a wide range of payment methods, track payment status, manage callbacks, and process refunds efficiently.

If you choose to integrate the PhonePe Payment Gateway into your website with the Java backend SDK, hereâs an overview of the end-to-end user journey.Â

## User Journey

The following user journey illustrates the complete payment lifecycle to help you understand the integration flow clearly.

![](/static/d8290080f37b8851db1e2c5efad0dd56/58f13/Java-SDK-2-scaled.png)![](/static/d8290080f37b8851db1e2c5efad0dd56/58f13/Java-SDK-2-scaled.png)

![](/static/d8290080f37b8851db1e2c5efad0dd56/58f13/Java-SDK-2-scaled.png)![](/static/d8290080f37b8851db1e2c5efad0dd56/58f13/Java-SDK-2-scaled.png)

## Prerequisites

Before you start the integration process, ensure you have:

- Access to PhonePe PGâs UAT (User Acceptance Testing) and Production Credentials(Merchant ID, Client ID, Client Secret and Client Version).
- A testing environment to simulate the payment flow.
- **Java 8** or **above** installed.
- **Maven** or **Gradle** configured as the project build tool.

You can find your Client ID and Secret in the [PhonePe Business Dashboard](https://business.phonepe.com/login). Set the âTest Modeâ toggle to ON to get Sandbox (UAT) credentials, or set it to OFF to get Production credentials.

Credentials

```
String clientId = "<clientId>";
String clientSecret = "<clientSecret>";
Integer clientVersion = <clientVersion>; 
```

## Whatâs Next?

Now that you know about the Java Backend SDK, you can start to integrate the PhonePe Payment Gateway into your website. The next section will guide you step by step on how to set it up.

Head over to the next section to learn the key steps involved in integrating PhonePe Payment Gateway into your website.

 .custom-block-wrapper {
padding: 20px;
border: 1px solid black;
background-color: #d9edbc;
}
