<!-- Source: https://developer.phonepe.com/payment-gateway/autopay/api-integration/introduction -->

# Introduction to Autopay

---

Managing recurring payments can be a hassle! PhonePe Payment Gateway simplifies the process by providing  an easy and secure solution with autopay feature, helping you streamline your billing processes. With a one-time authorization from your customer, you can schedule automatic deductions at specified periods, eliminating the need for the customer’s repeated involvement. This approach is particularly useful for services like OTT subscriptions, insurance premiums, and memberships, where regular payments are expected.

## User Journey

The following user journey illustrates the complete payment lifecycle to help you understand the integration flow clearly.

![](/static/12a2a2e474da122b48e2428f798bb8d1/58f13/Autopay-Subscription-Setup-1-scaled.png)![](/static/12a2a2e474da122b48e2428f798bb8d1/58f13/Autopay-Subscription-Setup-1-scaled.png)

![](/static/12a2a2e474da122b48e2428f798bb8d1/58f13/Autopay-Subscription-Setup-1-scaled.png)![](/static/12a2a2e474da122b48e2428f798bb8d1/58f13/Autopay-Subscription-Setup-1-scaled.png)

## Prerequisites

Before you start the integration process, ensure you have:

- Access to PhonePe PG’s UAT (User Acceptance Testing) and production environments
- API credentials, including the client ID and client secret
- A basic understanding of HTTP methods (GET, POST) and JSON
- A testing environment to simulate payment flows

## Environments

Use the environment URLs provided below to integrate and test your API calls. The Sandbox environment is meant for testing purposes—it allows you to validate your integration and make sure everything is working correctly without affecting real users or data. Once your integration is fully tested and ready, use the Production environment for live transactions. Always remember to switch the base URL depending on whether you’re working in the Sandbox or Production environment.

|  |  |
| --- | --- |
| **Environment** | **API** |
| Sandbox | https://api-preprod.phonepe.com/apis/pg-sandbox/<Endpoint> |
| Production | **Authorization API:** https://api.phonepe.com/apis/identity-manager/<Endpoint> **Other APIs:** https://api.phonepe.com/apis/pg/<Endpoint> |

**📘** **Test Before Production!**

---

To ensure a smooth integration, please integrate with the Test environment first and then move to production.

## API Endpoints

Here’s a quick reference to the key APIs involved in the Autopay flow. Each API plays a specific role, from initiating a transaction to handling refunds and fetching statuses. Use this table to understand which endpoint to call for each step in the Autopay payment lifecycle.

Endpoint Details:

|  |  |  |
| --- | --- | --- |
| **API** | **Method** | **Endpoint** |
| Authorization | POST | /v1/oauth/token |
| Subscription Setup | POST | /subscriptions/v2/setup |
| Subscription Order Status | GET | /subscriptions/v2/order/{merchantOrderId}/status |
| Subscription Status | GET | /subscriptions/v2/{merchantSubscriptionId}/status |
| Redemption – Notify | POST | /subscriptions/v2/notify |
| Redemption – Execute | POST | /subscriptions/v2/redeem |
| Redemption – Order Status | GET | /subscriptions/v2/order/{merchantOrderId}/status |
| Subscription Cancel | POST | /subscriptions/v2/{merchantSubscriptionId}/cancel |
| Refund | POST | /payments/v2/refund |
| Refund Status | GET | /payments/v2/refund/{merchantRefundId}/status |

## What’s Next?

Now that you are familiar with what Autopay feature offers, the next step is to look at the APIs that you will use to integrate them into your system to enable Autopay.
