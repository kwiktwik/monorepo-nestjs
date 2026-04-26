<!-- Source: https://developer.phonepe.com/payment-gateway/autopay/autopay-backend-sdk/python-sdk-autopay/introduction -->

# Introduction to Autopay Python SDK

---

The **PhonePe Python SDK(v 2.1.7)** for Autopay simplifies server-side integration with the PhonePe Payment Gateway for recurring payments. It offers a simple, secure, and efficient way to manage autopay transactions, allowing you to focus on delivering seamless and engaging user experiences.

## User Journey

The following user journey illustrates the complete payment lifecycle to help you understand the integration flow clearly.

![](/static/29a95d4f96877d78acb071d12ed3182c/58f13/Autopay-Python-SDK-1-scaled.png)![](/static/29a95d4f96877d78acb071d12ed3182c/58f13/Autopay-Python-SDK-1-scaled.png)

![](/static/29a95d4f96877d78acb071d12ed3182c/58f13/Autopay-Python-SDK-1-scaled.png)![](/static/29a95d4f96877d78acb071d12ed3182c/58f13/Autopay-Python-SDK-1-scaled.png)

## Prerequisites

Before you start the integration process, ensure you have:

- Access to PhonePe PG’s UAT (User Acceptance Testing) and production environments.
- A testing environment to simulate the payment flow.
- **Python 3.9 or higher** installed on your system.

## Python SDK Setup

install phonepe\_sdk package

```
pip install phonepe-pg-sdk-python
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

The introduction has provided you with a broad overview of setting up the Python SDK. Now, let’s move forward with **Class Initialisation** to begin integrating the SDK into your application.

Head over to ClassInitialisation, the first step to begin the integration process.
