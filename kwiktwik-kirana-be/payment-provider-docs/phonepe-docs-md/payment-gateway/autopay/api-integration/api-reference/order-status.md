<!-- Source: https://developer.phonepe.com/payment-gateway/autopay/api-integration/api-reference/order-status -->

# Check Order Status

---

This API allows you to check the status of a mandate after a subscription has been successfully set up. Once the mandate is created and the payment is debited, you can use this API to track the corresponding order status, including whether it is successful, pending, or failed.

## Environment

|  |  |  |
| --- | --- | --- |
| **Environment** | **HTTP Method** | **API** |
| Sandbox | `GET` | https://api-preprod.phonepe.com/apis/pg-sandbox/subscriptions/v2/order/{merchantOrderId}/status?details=true |
| Production | `GET` | https://api.phonepe.com/apis/pg/subscriptions/v2/order/{merchantOrderId}/status?details=true |

## Request

Request Headers

|  |  |
| --- | --- |
| **Header Name** | **Header Value** |
| Content-Type | application/json |
| Authorization | O-Bearer <merchant-auth-token> |

⚠️ ****For Partner Integrations!****

---

It is mandatory to include the `X-MERCHANT-ID` header with the MerchantID of the end merchant.

Path Parameters Details

|  |  |
| --- | --- |
| **Parameter Name** | **Description** |
| `merchantOrderId` | Merchant-generated order ID provided during the Subscription Setup API call. |

Sample Request in CURL

```
curl --location 'https://api-preprod.phonepe.com/apis/pg-sandbox/subscriptions/v2/order/MO1709025691805/status?details=true' \
--header 'Accept: application/json' \
--header 'Authorization: O-Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHBpcmVzT24iOjE3MTIyNTM2MjU2NDQsIm1lcmNoYW50SWQiOiJWMlNVQlVBVCJ9.7aVzYI_f_77-bBicEcRNuYx093b2wCsgl_WFNkKqAPY'
```

## Response

Sample Response for Success

```
{
    "merchantId": "SWIGGY8",
    "merchantOrderId": "MO1708797962855",
    "orderId": "OMO2402242336055135042802",
    "state": "COMPLETED",
    "amount": 200,
    "expireAt": 1708798385505,
    "metaInfo": {
        "udf1": "some meta info of max length 256",
        "udf2": "some meta info of max length 256",
        "udf3": "some meta info of max length 256",
        "udf4": "some meta info of max length 256",
        "udf5": "some meta info of max length 256",
        "udf6": "some meta info of max length 256",
        "udf7": "some meta info of max length 256",
        "udf8": "some meta info of max length 256",
        "udf10": "some meta info of max length 256",
        "udf11": "some meta info of max length 50",
        "udf12": "some meta info of max length 50",
        "udf13": "some meta info of max length 50",
        "udf14": "some meta info of max length 50",
        "udf15": "some meta info of max length 50"
    },
    "paymentFlow": {
        "type": "SUBSCRIPTION_SETUP",
        "merchantSubscriptionId": "MS1708797962855",
        "authWorkflowType": "TRANSACTION",
        "amountType": "FIXED",
        "maxAmount": 200,
        "frequency": "ON_DEMAND",
        "expireAt": 1741345725943,
        "subscriptionId": "OMS2502051638460659623138"
    },
    "paymentDetails": [
        {
            "transactionId": "OM2402242336055865042862",
            "paymentMode": "UPI_INTENT",
            "timestamp": 1708797965588,
            "amount": 200,
            "payableAmount": 200,
            "feeAmount": 0,
            "state": "COMPLETED",
            "instrument": {
                "type": "ACCOUNT",
                "maskedAccountNumber": "XXXXXXXXXXX0945"
            },
            "rail": {
                "type": "UPI",
                "utr": "405554491450",
                "vpa": "12****78@ybl",
                "umn": "d519347eb2374125bcad6e69a42cc13b@ybl"
            }
      }
    ]
}
```

Sample Order Status Response for Failure

```
{
    "merchantId": "SWIGGY8",
    "merchantOrderId": "MO1708797962855",
    "orderId": "OMO2402242336055135042802",
    "state": "FAILED",
    "amount": 200,
    "expireAt": 1708798385505,
    "errorCode": "INVALID_MPIN",
    "detailedErrorCode": "ZM",
    "paymentFlow": {
        "type": "SUBSCRIPTION_SETUP",
        "merchantSubscriptionId": "MS1708797962855",
        "authWorkflowType": "TRANSACTION",
        "amountType": "FIXED",
        "maxAmount": 200,
        "frequency": "ON_DEMAND",
        "expireAt": 1741345725943,
        "subscriptionId": "OMS2502051638460659623138"
    },
    "paymentDetails": [
        {
            "transactionId": "OM2402242336055865042862",
            "paymentMode": "UPI_INTENT",
            "timestamp": 1708797965588,
            "amount": 200,
            "payableAmount": 200,
            "feeAmount": 0,
            "state": "FAILED",
            "errorCode": "INVALID_MPIN",
            "detailedErrorCode": "ZM"
        }
    ]
}
```

Sample Order Status Response – Pending

```
{
    "merchantId": "SWIGGY8",
    "merchantOrderId": "MO1708797962855",
    "orderId": "OMO2402242336055135042802",
    "state": "PENDING",
    "amount": 200,
    "expireAt": 1708798385505,
    "paymentFlow": {
        "type": "SUBSCRIPTION_SETUP",
        "merchantSubscriptionId": "MS1708797962855",
        "authWorkflowType": "TRANSACTION",
        "amountType": "FIXED",
        "maxAmount": 200,
        "frequency": "ON_DEMAND",
        "expireAt": 1741345725943,
        "subscriptionId": "OMS2502051638460659623138"
    },
    "paymentDetails": [
        {
            "transactionId": "OM2402242336055865042862",
            "paymentMode": "UPI_INTENT",
            "timestamp": 1708797965588,
            "amount": 200,
            "payableAmount": 200,
            "feeAmount": 0,
            "state": "PENDING"
        }
    ]
}
```

Response Parameters

|  |  |  |
| --- | --- | --- |
| **Parameter Name** | **Data Type** | **Description** |
| `merchantId` | String | A unique ID assigned to the merchant by the PhonePe system during the onboarding process. |
| `merchantOrderId` | String | A unique orderId provided by the merchant when creating the order. This helps in tracking and managing the specific transaction across systems. |
| `orderId` | String | An orderId generated by PhonePe. |
| `state` | String | Possible value: • COMPLETED • FAILED • PENDING |
| `amount` | Long | The amount provided by the merchant in Paise. |
| `expireAt` | DateTime | Represents the time in **epoch** (milliseconds). |
| `errorCode` | String | Indicates the reason for the failure. **[PRESENT ONLY IF STATE = FAILED]** |
| `detailedErrorCode` | String | Provides a detailed explanation for the failure. |
| `MetaInfo` | Object | **•** For udf1 to udf10, there is no constraint. Maximum length = 256 characters **•** For udf11 to udf15, alphanumeric values with \_-+@. are allowed. Maximum length = 50 characters **Note**: **It is mandatory to keep the parameter names udf1, udf2, etc., exactly as they are in the** `metainfo` **block. Renaming these key values will result in a production error.** |
| `paymentFlow` | Object | Provides the detailed information of the subscription. |
| `paymentDetails` | Array | Contains the details of the payment. |

The **paymentFlow** object contains additional parameters, which are explained in the table below.

Request Parameters of paymentFlow Object:

|  |  |  |
| --- | --- | --- |
| **Parameter Name** | **Data Type** | **Description** |
| `paymentFlow.type` | String | The type should be set to “SUBSCRIPTION\_REDEMPTION” for redemption transactions. |
| `paymentFlow.merchantSubscriptionId` | String | A unique subscriptionId provided by the merchant to identify and manage the subscription request. |
| `paymentFlow.amountType` | String | Nature of redemption amount Possible Values: • FIXED • VARIABLE |
| `paymentFlow.maxAmount` | Long | Specifies the maximum amount that can be debited from the user’s account for each redemption cycle. |
| `paymentFlow.frequency` | String | Defines how often the payment will be deducted from the user’s account. |
| `paymentFlow.subscriptionId` | String | A subscriptionId generated by PhonePe to uniquely identify the user’s subscription. |

## Check Subscription Order Status!

headers

url params

You can also test this API request directly in Postman for a quick and easy integration check.

[Run in Postman ->](https://www.postman.com/pg-api-collections-579549/pg-api-collections-s-workspace/)

## What’s Next?

After retrieving the subscription order status, the next step is to check the current status of a subscription after it has been set up.
