<!-- Source: https://developer.phonepe.com/payment-gateway/autopay/standard-checkout/subscription-status -->

# Check Subscription Status

---

This API is used to check the current status of a subscription after it has been set up. It helps determine whether the subscription is Active (successfully set up and ongoing), Cancelled (manually cancelled by the user), or Revoked(withdrawn by the user).

## Environment

|  |  |  |
| --- | --- | --- |
| **Environment** | **HTTP Method** | **API** |
| Sandbox | `GET` | https://api-preprod.phonepe.com/apis/pg-sandbox/checkout/v2/subscriptions/{merchantSubscriptionId}/status |
| Production | `GET` | https://api.phonepe.com/apis/pg/checkout/v2/subscriptions/{merchantSubscriptionId}/status |

## Request

Request Headers

|  |  |
| --- | --- |
| **Header Name** | **Header Value** |
| Content-Type | application/json |
| Authorization | O-Bearer <merchant-auth-token> |

Path Parameters

|  |  |
| --- | --- |
| **Parameter Name** | **Description** |
| `merchantSubscriptionId` | The unique merchant subscription ID provided by the merchant when creating the subscription |

## Response

Sample Response

```
{
    "merchantSubscriptionId": "MS597cc71b",
    "subscriptionId": "OMS2602061522174978849048",
    "state": "ACTIVE",
    "productType": null,
    "authInstrumentType": null,
    "authWorkflowType": "TRANSACTION",
    "amountType": "FIXED",
    "currency": "INR",
    "maxAmount": 47900,
    "frequency": "ON_DEMAND",
    "expireAt": 2717056337500,
    "pauseStartDate": null,
    "pauseEndDate": null
}
```

Response Parameters

|  |  |  |
| --- | --- | --- |
| **Parameter Name** | **Data Type** | **Description** |
| merchantSubscriptionId | String | merchant subscription Id |
| subscriptionId | String |  |
| state | String | State of the Subscription |
| authWorkflowType | String | TRANSACTION, PENNY\_DROP |
| amountType | String | FIXED, VARIABLE |
| currency | String | INR |
| maxAmount | Long | maximum mandate amount |
| frequency | String | DAILY, MONTHLY |
| expireAt | epoch |  |

## Try it yourself!

headers

url params

## What’s Next?

After retrieving the subscription status, the next step is to collect the redemption amount according to the selected subscription cycle.
