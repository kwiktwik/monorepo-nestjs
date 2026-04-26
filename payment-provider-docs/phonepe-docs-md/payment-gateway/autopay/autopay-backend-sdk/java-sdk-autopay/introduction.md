<!-- Source: https://developer.phonepe.com/payment-gateway/autopay/autopay-backend-sdk/java-sdk-autopay/introduction -->

# Introduction to Autopay Java SDK

---

The ****PhonePe Java SDK** **(v 2.2.1)**** for Autopay simplifies server-side integration with the PhonePe Payment Gateway for recurring payments. It offers a simple, secure, and efficient way to manage autopay transactions, allowing you to focus on delivering seamless and engaging user experiences.

## User Journey

The following user journey illustrates the complete payment lifecycle to help you understand the integration flow clearly.

![](/static/da5266d4e0c0cee421c2af5b25a4000c/58f13/Autopay-Java-SDK-1-scaled.png)![](/static/da5266d4e0c0cee421c2af5b25a4000c/58f13/Autopay-Java-SDK-1-scaled.png)

![](/static/da5266d4e0c0cee421c2af5b25a4000c/58f13/Autopay-Java-SDK-1-scaled.png)![](/static/da5266d4e0c0cee421c2af5b25a4000c/58f13/Autopay-Java-SDK-1-scaled.png)

## Prerequisites

Before you start the integration process, ensure you have:

- Access to PhonePe PG’s UAT (User Acceptance Testing) and production environments.
- A testing environment to simulate the payment flow.
- **Java 8 or higher** installed on your system.

## Java SDK Setup

This section guides you through setting up the PhonePe Java SDK for Autopay in projects using **Maven** and **Gradle**. It includes the necessary dependencies and repository configuration to get started. Additionally, test credentials are provided to help you simulate and validate integration flows before going live.

### Setting Up the SDK with Maven

Add the dependency to your project’s POM file:

Add the dependency to your project

```
<dependency>
    <groupId>com.phonepe</groupId>
    <artifactId>pg-sdk-java</artifactId>
    <version>2.2.1</version>
</dependency>
```

## Setting Up the SDK with Gradle

Add the following to your project’s `build.gradle` file.

include the PhonePe repository URL under the `repositories` section, and add the `pg-sdk-java` JAR under dependencies.

Add the following to you project

```
dependencies {
    implementation 'com.phonepe:pg-sdk-java:2.2.1'
}
```

## Test Credentials

To get started with the integration, you’ll need three essential details: the API key, merchant ID, and secret key. Reach out to the Integration team to obtain these credentials for testing.

Test Credentials

```
String clientId = "<clientId>";
String clientSecret = "<clientSecret>";
Integer clientVersion = "<clientVersion>"; 
```

## What’s Next ?

The introduction has provided you with a broad overview of setting up the Java SDK. Now, let’s move forward with **Class Initialisation** to begin integrating the SDK into your application.

Head over to ClassInitialisation, the first step to begin the integration process.
