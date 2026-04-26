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
  "merchantId": "Mer01",
  "merchantOrderId": "M27",
  "orderId": "OMO2604141111125363306797V",
  "state": "COMPLETED",
  "currency": "INR",
  "amount": 100,
  "expireAt": 1776146172517,
  "paymentFlow": {
    "type": "SUBSCRIPTION_SETUP",
    "merchantSubscriptionId": "MS27",
    "authWorkflowType": "TRANSACTION",
    "amountType": "FIXED",
    "maxAmount": 100,
    "frequency": "ON_DEMAND",
    "expireAt": 1807681114000,
    "subscriptionId": "OMS2604141111125173306721V",
    "productType": null,
    "authInstrumentType": null
  },
  "paymentDetails": [
    {
      "transactionId": "OM2604141111125613306810V",
      "paymentMode": "UPI_INTENT",
      "timestamp": 1776145272562,
      "currency": "INR",
      "amount": 100,
      "payableCurrency": "INR",
      "payableAmount": 100,
      "feeCurrency": "INR",
      "feeAmount": 0,
      "state": "COMPLETED",
      "instrument": {
        "type": "ACCOUNT",
        "maskedAccountNumber": "XXXXXX6392",
        "ifsc": "SBIN0011290",
        "accountType": "SAVINGS",
        "bankId": "SBIN"
      },
      "rail": {
        "type": "UPI",
        "utr": "610485002694",
        "umn": "13e911bd03aa4a1db0b02e290a228342@axl"
      },
      "splitInstruments": [
        {
          "instrument": {
            "type": "ACCOUNT",
            "maskedAccountNumber": "XXXXXX6392",
            "ifsc": "SBIN0011290",
            "accountType": "SAVINGS",
            "bankId": "SBIN"
          },
          "rail": {
            "type": "UPI",
            "utr": "610485002694",
            "umn": "13e911bd03aa4a1db0b02e290a228342@axl"
          },
          "currency": "INR",
          "amount": 100
        }
      ]
    }
  ],  
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
  }
}
```

Sample Response for Failed(INVALID\_MPIN)

```
{
  "merchantId": "SU******",
  "merchantOrderId": "M271210",
  "orderId": "OMO2604211357199714095113V",
  "state": "FAILED",
  "currency": "INR",
  "amount": 100,
  "expireAt": 1776760939961,
  "errorCode": "INVALID_MPIN",
  "detailedErrorCode": "ZM",
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
    "merchantSubscriptionId": "MS27121",
    "authWorkflowType": "TRANSACTION",
    "amountType": "FIXED",
    "maxAmount": 100,
    "frequency": "ON_DEMAND",
    "expireAt": 1807681114000,
    "subscriptionId": "OMS2604211357199594095766V",
    "productType": null,
    "authInstrumentType": null
  },
  "paymentDetails": [
    {
      "transactionId": "OM2604211357199994095478V",
      "paymentMode": "UPI_INTENT",
      "timestamp": 1776760040000,
      "currency": "INR",
      "amount": 100,
      "payableCurrency": "INR",
      "payableAmount": 100,
      "feeCurrency": "INR",
      "feeAmount": 0,
      "state": "FAILED",
      "errorCode": "INVALID_MPIN",
      "detailedErrorCode": "ZM"
    }
  ]
}
```

Sample Response for Failed(INSUFFICIENT\_BALANCE)

```
{
  "merchantId": "SU******",
  "merchantOrderId": "M27122120",
  "orderId": "OMO2604211400357071615908V",
  "state": "FAILED",
  "currency": "INR",
  "amount": 1500000,
  "expireAt": 1776761135695,
  "errorCode": "INSUFFICIENT_BALANCE",
  "detailedErrorCode": "Z9",
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
    "merchantSubscriptionId": "MS2721221",
    "authWorkflowType": "TRANSACTION",
    "amountType": "FIXED",
    "maxAmount": 1500000,
    "frequency": "ON_DEMAND",
    "expireAt": 1807681114000,
    "subscriptionId": "OMS2604211400356931615261V",
    "productType": null,
    "authInstrumentType": null
  },
  "paymentDetails": [
    {
      "transactionId": "OM2604211400357321615447V",
      "paymentMode": "UPI_INTENT",
      "timestamp": 1776760235732,
      "currency": "INR",
      "amount": 1500000,
      "payableCurrency": "INR",
      "payableAmount": 1500000,
      "feeCurrency": "INR",
      "feeAmount": 0,
      "state": "FAILED",
      "errorCode": "INSUFFICIENT_BALANCE",
      "detailedErrorCode": "Z9"
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
