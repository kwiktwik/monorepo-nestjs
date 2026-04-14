<!-- Source: https://developer.phonepe.com/payment-gateway/autopay/standard-checkout/redemption-execute -->

# Redemption Execute

The Redemption API is used to debit the payment from the user’s bank account as part of a recurring subscription. This process is initiated after the Notify step has been completed and serves as the actual payment transaction. By calling this API, the merchant requests the system to initiate the payment transfer to process the required amount from the user’s account.

📘 ****Check Subscription Status Before Execution****!

---

Before calling the Execute API, you must first verify that the subscription state is ACTIVE by using the Subscription Status API. This ensures that the transaction proceeds without any issues or failures.

## Environment

|  |  |  |
| --- | --- | --- |
| **Environment** | **HTTP Method** | **API** |
| Sandbox | `POST` | https://api-preprod.phonepe.com/apis/pg-sandbox/checkout/v2/subscriptions/redeem |
| Production | `POST` | https://api.phonepe.com/apis/pg/checkout/v2/subscriptions/redeem |

## Request

Request Headers

|  |  |
| --- | --- |
| **Header Name** | **Header Value** |
| `Content-Type` | application/json |
| `Authorization` | O-Bearer <merchant-auth-token> |

Sample Request

```
{
    "merchantOrderId": "{{merchantOrderId}}"
}
```

Request Parameters

|  |  |  |  |  |
| --- | --- | --- | --- | --- |
| **Parameter Name** | **Data Type** | **Description** | **Mandatory (Yes/No)** | **Constraints** |
| `merchantOrderId` | String | Pass the same `merchantOrderId` used in the Notify request. | Yes | **•** Maximum length is 63 characters. **•** Only underscore (\_) and hyphen (-) are allowed as special characters. |

⚠️ ******Redemption Handling Alert!******

---

- **Custom**:
  - If paymentFlow.redemptionRetryStrategy is set to CUSTOM, merchants are required to retry the redemption until a terminal status (COMPLETED or FAILED) is achieved. The maximum time window to get a terminal status is *by default* 48 hours, and a maximum of 4 tries (1 attempt + 3 retries) are allowed.
  - +Subsequent redemption retry attempts must be separated by a minimum interval of 1.5 hours, following a terminal state for a previous attempt.
  - **Note**: No further retries will be executed once the transaction status is marked as completed.+\_
- **Standard**:
  - If paymentFlow.redemptionRetryStrategy is set to STANDARD, PhonePe will handle the internal retries for redemption. The maximum time window to get a terminal status is *by default* 48 hours, and retries are managed by PhonePe internally.
- Default Value: **STANDARD**.

## Response

Sample Response

```
{
    "transactionId": "OM2603101539420517924712BW",
    "state": "PENDING"
}
```

Response Parameters

|  |  |  |
| --- | --- | --- |
| **Parameter Name** | **Data Type** | **Description** |
| transactionId | String | PG generated internal transactionId id |
| state | String | State of the transaction created, Expected value is PENDING |

## Try it yourself!

headers

body params

## What’s Next?

In the next section, you will learn how to check the execution status once a Redemption Request is initiated for an active subscription.
