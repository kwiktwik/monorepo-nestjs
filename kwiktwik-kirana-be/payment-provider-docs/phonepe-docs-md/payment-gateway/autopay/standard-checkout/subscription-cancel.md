<!-- Source: https://developer.phonepe.com/payment-gateway/autopay/standard-checkout/subscription-cancel -->

# Cancel Subscription

---

Use the Cancel Subscription API to deactivate an active autopay subscription that is no longer required. This ensures that no further payments are processed. Once canceled, the subscription is terminated and will not trigger any future charges.

## Environment

|  |  |  |
| --- | --- | --- |
| **Environment** | **HTTP Method** | **API** |
| Sandbox | `POST` | https://api-preprod.phonepe.com/apis/pg-sandbox/checkout/v2/subscriptions/{merchantSubscriptionId}/cancel |
| Production | `POST` | https://api.phonepe.com/apis/pg/checkout/v2/subscriptions/{merchantSubscriptionId}/cancel |

## Request

Request Headers

|  |  |
| --- | --- |
| **Header Name** | **Header Value** |
| `Content-Type` | application/json |
| `Authorization` | O-Bearer <merchant-auth-token> |

Path Parameter

|  |  |
| --- | --- |
| **Parameter Name** | **Description** |
| `merchantSubscriptionId` | A unique merchant subscription ID provided by the merchant at the time of subscription creation. |

## Response

Once the Cancel API is executed, a **`204 No Content`** response is returned, indicating that the subscription cancellation request was successfully processed. This means the subscription is now inactive and no further payments will be triggered. To confirm the cancellation and view the updated state, you can use the **Subscription Status API**, which will return the current status of the subscription (e.g., `state`: cancelled).

## Try it yourself!

headers

body params

## What’s Next?

We’ve seen how a subscription can be cancelled. Next, we’ll explore how the subscription can be revoked.

Head over to the next section to learn how to revoke the cancelled subscription.
