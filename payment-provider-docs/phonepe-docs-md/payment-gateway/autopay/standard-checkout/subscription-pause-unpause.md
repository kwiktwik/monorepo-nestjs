<!-- Source: https://developer.phonepe.com/payment-gateway/autopay/standard-checkout/subscription-pause-unpause -->

# Pause or Unpause Subscription

---

Customers can Pause/Unpause their subscription anytime by going to the Autopay section in their PSP (Payment Service Provider) app and selecting “Pause/Unpause” for the active mandate. When this happens, the subscription will be Paused/Unpaused, and PhonePe will send an Webhook callback to notify you that the subscription has been paused/unpaused from the customer’s end.

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
| subscription.paused subscription.unpaused |

📘 **Webhook Handling Best Practices!**

---

- Always use the root-level payload.state parameter to confirm the subscription status.
- Avoid strict deserialization of the webhook response.
- Do not depend on the type parameter (this will be deprecated); instead, use the event parameter to identify the webhook event.
- expireAt and timestamp values are provided in epoch time format (in milliseconds).

## Responses

Sample Responses for Autopay Pause Subscription

```
{
    "type": "SUBSCRIPTION_PAUSED",
    "payload": {
        "merchantSubscriptionId": "MS1708797962855",
        "subscriptionId": "OMS2402242336054995042603",
        "state": "PAUSED",
        "authWorkflowType": "TRANSACTION",
        "amountType": "FIXED",
        "maxAmount": 200,
        "frequency": "ON_DEMAND",
        "expireAt": 1737278524000,
        "pauseStartDate": 1708798426196,
        "pauseEndDate": 1708885799000
    }
}
```

Sample Response for Autopay Unpause Subscription

```
{
    "type": "SUBSCRIPTION_UNPAUSED",
    "payload": {
        "merchantSubscriptionId": "MS1708797962855",
        "subscriptionId": "OMS2402242336054995042603",
        "state": "ACTIVE",
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

### UNPAUSE Subscription

User can pause/unpause via the PSP app where the mandate was originally set up. You will not be able to unpause the subscription.

- If you receive a `pauseEndDate` in the Pause Callback and that date has passed, you can unpause the subscription automatically.
- If Redemption Notify has been successfully completed and then the user pauses the subscription, redemption cannot be executed while the subscription is paused.
- After a successful Redemption Notify, if the user pauses and then unpauses the subscription, you **cannot** execute redemption immediately. You need to send Redemption Notify again, and then execute redemption only after 24 hours from the successful notification.
- You can cancel or revoke the mandate even when the subscription is in the paused state.

**Best Practice:**
Before calling Redemption Notify or Redemption Execute, always check the subscription status using the Subscription Status API. Proceed only if the subscription state is **ACTIVE** to avoid failures.

## What’s Next?

Now that you’ve learned how to pause and unpause an active subscription, the next step is to understand how to revoke an active subscription.
