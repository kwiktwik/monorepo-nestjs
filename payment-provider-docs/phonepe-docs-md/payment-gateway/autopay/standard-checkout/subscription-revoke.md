<!-- Source: https://developer.phonepe.com/payment-gateway/autopay/standard-checkout/subscription-revoke -->

# Revoke Subscription

---

Customers can cancel their subscription anytime by going to the **AutoPay** section in their PSP (Payment Service Provider) app and selecting **“Remove Autopay”** for the active mandate. When this happens, the subscription is revoked, and PhonePe will send an **Webhook callback** to notify you that the subscription has been cancelled from the customer’s end.

## Webhook Configuration

- **Callback URL** – Your server endpoint where PhonePe will send subscription updates.
- **Username** – Create and set your own username.
- **Password** – Create and set your own password.

Make sure the same username and password are used in your code to validate the Authorization header received in the callback from PhonePe.

## Callback Validation/Verification

For incoming requests, extract the `Authorization` header, validate it against the username:password you configured with us, and accept the response only if the values match.
`Authorization: SHA256(username:password)`

## Callback Event Types

|  |
| --- |
| **Callback Type** |
| subscription.revoked |

📘 **Webhook Handling Best Practices!**

---

- Always use the root-level payload.state parameter to confirm the subscription status.
- Avoid strict deserialization of the webhook response.
- Do not depend on the type parameter (this will be deprecated); instead, use the event parameter to identify the webhook event.
- expireAt and timestamp values are provided in epoch time format (in milliseconds).

## Response

Sample Response – Revoke Subscription for Notification Success

```
{
    "type": "SUBSCRIPTION_REVOKED",
    "payload": {
        "merchantSubscriptionId": "MS1708797962855",
        "subscriptionId": "OMS2402242336054995042603",
        "state": "REVOKED",
        "authWorkflowType": "TRANSACTION",
        "amountType": "FIXED",
        "maxAmount": 200,
        "frequency": "ON_DEMAND",
        "expireAt": 1737278524000,
        "pauseStartDate": null,
        "pauseEndDate": null
    }
}
```

## What’s next?

Now that you have understood how to revoke a subscription, let’s move forward to learn how to initiate refunds and check their status.
