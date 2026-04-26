<!-- Source: https://developer.phonepe.com/payment-gateway/autopay/api-integration/api-reference/subscription-cancel -->

# Cancel Subscription

---

This API allows you to deactivate an active subscription that is no longer required. This ensures that no further payments are processed. Once canceled, the subscription is terminated and will not trigger any future charges.

## Environment

|  |  |  |
| --- | --- | --- |
| **Environment** | **HTTP Method** | **API** |
| Sandbox | `POST` | https://api-preprod.phonepe.com/apis/pg-sandbox/subscriptions/v2/{merchantSubscriptionId}/cancel |
| Production | `POST` | https://api.phonepe.com/apis/pg/subscriptions/v2/{merchantSubscriptionId}/cancel |

## Request

Request Headers

|  |  |
| --- | --- |
| **Header Name** | **Header Value** |
| `Content-Type` | application/json |
| `Authorization` | O-Bearer <merchant-auth-token> |

⚠️ ****For Partner Integrations!****

---

It is mandatory to include the `X-MERCHANT-ID` header with the MerchantID of the end merchant.

Path Parameter

|  |  |
| --- | --- |
| **Parameter Name** | **Description** |
| `merchantSubscriptionId` | A unique merchant subscription ID provided by the merchant at the time of subscription creation. |

## Response

Once the Cancel API is executed, a **`204 No Content`** response is returned, indicating that the subscription cancellation request was successfully processed. This means the subscription is now inactive and no further payments will be triggered. To confirm the cancellation and view the updated state, you can use the **[Subscription Status API](/phonepe-docs-md/payment-gateway/autopay/api-integration/api-reference/subscription-status.md)**, which will return the current status of the subscription (e.g., `state`: cancelled).

## Try it yourself!

headers

body params

You can also test this API request directly in Postman for a quick and easy integration check.

[Run in Postman ->](https://www.postman.com/pg-api-collections-579549/pg-api-collections-s-workspace/)

## What’s Next?

We’ve seen how a subscription can be cancelled. Next, we’ll explore how the subscription can be revoked.

Head over to the next section to learn how to revoke the cancelled subscription.
