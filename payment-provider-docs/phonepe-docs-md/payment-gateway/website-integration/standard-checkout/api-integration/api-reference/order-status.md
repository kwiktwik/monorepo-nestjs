<!-- Source: https://developer.phonepe.com/payment-gateway/website-integration/standard-checkout/api-integration/api-reference/order-status -->

# Check Payment Status

---

The Order Status API enables you to check the current status of a specific order by providing its order ID. It returns information indicating whether the order has been successfully completed with payment details, is part of a split payment using PPE\_INTENT, has no payment attempts yet, or if the payment has failed. Additionally, it handles cases where the provided order ID is invalid. This helps you reliably track and manage the order and take necessary actions based on its status.

## Environment

|  |  |  |
| --- | --- | --- |
| **Environment** | **HTTP Method** | **API** |
| Sandbox | `GET` | https://api-preprod.phonepe.com/apis/pg-sandbox/checkout/v2/order/{merchantOrderId}/status |
| Production | `GET` | https://api.phonepe.com/apis/pg/checkout/v2/order/{merchantOrderId}/status |

## Request

Request Headers

|  |  |
| --- | --- |
| **Header Name** | **Header Value** |
| Content-Type | application/json |
| Authorization | O-Bearer <merchant-auth-token> |

⚠️ ****For Partner Integrations!****

---

It is mandatory to include the **X-MERCHANT-ID** header with the MerchantID of the end merchant.

Sample CURL Request

```
curl --location 'https://api-preprod.phonepe.com/apis/pg-sandbox/checkout/v2/order/TX123rrty34432456/status?details=false' \
--header 'Content-Type: application/json' \
--header 'Authorization: O-Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHBpcmVzT24iOjE3MTIyNTM2MjU2NDQsIm1lcmNoYW50SWQiOiJWMlNVQlVBVCJ9.7aVzYI_f_77-bBicEcRNuYx093b2wCsgl_WFNkKqAPY'
```

Request Parameters

|  |  |
| --- | --- |
| **Parameter Name** | **Description** |
| `details` | **•** true → return all attempt details under paymentDetails list **•** false → return only latest attempt details under paymentDetails list |
| `errorContext` | **•** true → To receive the errorContext block with error details if the state is FAILED. **•** false → If the errorContext block is not required. |
| `merchantOrderId` | Order ID created in a Payment request. |

## Response

Sample Response for the CURL Request

```
{
    "orderId": "OMO2403282020198641071317",
    "state": "COMPLETED",
    "amount": 1000,
    "expireAt": 1711867462542,
    "paymentDetails": [
        {
            "paymentMode": "UPI_QR",
            "transactionId": "OM2403282020198651071949",
            "timestamp": 1711694662542,
            "amount": 1000,
            "state": "COMPLETED",
            "rail": {
                "type": "UPI",
                "utr": "<utr>",
                "upiTransactionId": "<upiTransactionId>",
                "vpa": "<vpa>"
            },
            "instrument": {
                "type": "ACCOUNT",
                "maskedAccountNumber": "<maskedAccountNumber>",
                "accountType": "SAVINGS",
                "accountHolderName": "<accountHolderName>"
            }
        }
    ]
}
```

Case 1: Response for Order is completed and details = true

```
{
  "orderId": "OMO2407021511185686967711",
  "state": "COMPLETED",
  "amount": 1000,
  "payableAmount": 1000,
  "feeAmount": 0,
  "expireAt": 1719913878566,
  "paymentDetails": [
    {
      "transactionId": "OM2407021515097451914211",
      "paymentMode": "UPI_INTENT",
      "timestamp": 1719913509762,
      "amount": 1000,
      "payableAmount": 1000,
      "feeAmount": 0,
      "state": "COMPLETED",
      "rail": {
        "type": "UPI",
        "upiTransactionId": "upi12313",
        "vpa": "12****78@ybl"
      },
      "instrument": {
        "type": "ACCOUNT",
        "maskedAccountNumber": "******1234",
        "accountType": "SAVINGS"
      },
      "splitInstruments": [
        {
          "instrument": {
            "type": "ACCOUNT",
            "maskedAccountNumber": "******1234",
            "accountType": "SAVINGS"
          },
          "rail": {
            "type": "UPI",
            "utr": "455069731511",
            "upiTransactionId": "YBL369f6d962de74c2680789bff8c11aec9",
            "vpa": "12****78@ybl"
          },
          "amount": 1000
        }
      ]
    }
  ],
  "metaInfo": {
    "udf1": "",
    "udf2": "",
    "udf3": "",
    "udf4": "",
    "udf5": "",
    "udf6": "",
    "udf7": "",
    "udf8": "",
    "udf9": "",
    "udf10": "",
    "udf11": "",
    "udf12": "",
    "udf13": "",
    "udf14": "",
    "udf15": ""
  }
}
```

Case 2: Response for PPE\_INTENT split payment case

```
{
  "orderId": "OMO2407111823257502858511",
  "state": "COMPLETED",
  "amount": 200,
  "payableAmount": 200,
  "feeAmount": 0,
  "expireAt": 1720703005748,
  "paymentDetails": [
    {
      "transactionId": "OM2407111823340281302812",
      "paymentMode": "UPI_INTENT",
      "timestamp": 1720702414053,
      "amount": 200,
      "payableAmount": 200,
      "feeAmount": 0,
      "state": "COMPLETED",
      "splitInstruments": [
        {
          "instrument": {
            "type": "ACCOUNT",
            "maskedAccountNumber": "******1234",
            "accountType": "SAVINGS"
          },
          "rail": {
            "type": "UPI",
            "utr": "455948340054",
            "upiTransactionId": "YBLec33d3d277264fd8ac5deeabfece2494",
            "vpa": "12****78@ybl"
          },
          "amount": 100
        },
        {
          "instrument": {
            "type": "WALLET"
          },
          "rail": {
            "type": "PPI_WALLET"
          },
          "amount": 100
        }
      ]
    }
  ],
  "metaInfo": {
    "udf1": "",
    "udf2": "",
    "udf3": "",
    "udf4": "",
    "udf5": "",
    "udf6": "",
    "udf7": "",
    "udf8": "",
    "udf9": "",
    "udf10": "",
    "udf11": "",
    "udf12": "",
    "udf13": "",
    "udf14": "",
    "udf15": ""
  }
}
```

Case 3: Response for Payment Mode: CARD

```
{
    "orderId": "OMO2507241148405311106438",
    "state": "COMPLETED",
    "amount": 100,
    "payableAmount": 100,
    "feeAmount": 0,
    "expireAt": 1753338820531,
    "paymentDetails":
    [
        {
            "transactionId": "OM2507241150264011152620",
            "paymentMode": "CARD",
            "timestamp": 1753338026421,
            "amount": 100,
            "payableAmount": 100,
            "feeAmount": 0,
            "state": "COMPLETED",
            "instrument":
            {
                "type": "CREDIT_CARD",
                "bankId": "HDFC",
                "brn": "520506406845",
                "geoScope": "DOMESTIC",
                "cardNetwork": "VISA",
                "maskedCardNumber": "******1234"
            },
            "rail":
            {
                "type": "PG",
                "authorizationCode": "088005"
            },
            "splitInstruments":
            [
                {
                    "instrument":
                    {
                        "type": "CREDIT_CARD",
                        "bankId": "HDFC",
                        "brn": "520506406845",
                        "geoScope": "DOMESTIC",
                        "cardNetwork": "VISA",
                        "maskedCardNumber": "******1234"
                    },
                    "rail":
                    {
                        "type": "PG",
                        "authorizationCode": "088005"
                    },
                    "amount": 100
                }
            ]
        }
    ],
    "metaInfo":
    {
        "udf1": "Harshad",
        "udf2": "30",
        "udf3": "UDF3",
        "udf4": "UDF4",
        "udf5": "UDF5",
        "udf6": "UDF6",
        "udf7": "UDF7",
        "udf8": "UDF8",
        "udf9": "UDF9",
        "udf10": "UDF10",
        "udf11": "UDF11",
        "udf12": "UDF12",
        "udf13": "UDF13",
        "udf14": "UDF14",
        "udf15": "UDF15"
    }
}
```

Case 4: Response for No payment attempt is made for the order

```
{
    "orderId": "OMO2407111821482103732111",
    "state": "PENDING",
    "amount": 100,
    "expireAt": 1720702908208,
    "paymentDetails": [],
    "metaInfo": {
        "udf1": "additional-information-1",
        "udf2": "additional-information-2",
        "udf3": "additional-information-3",
        "udf4": "additional-information-4",
        "udf5": "additional-information-5",
        "udf6": "additional-information-6",
        "udf7": "additional-information-7",
        "udf8": "additional-information-8",
        "udf9": "additional-information-9",
        "udf10": "additional-information-10",
        "udf11": "additional-information-11",
        "udf12": "additional-information-12",
        "udf13": "additional-information-13",
        "udf14": "additional-information-14",
        "udf15": "additional-information-15"
    }
}
```

Case 5: Response for Order is Failed

```
{
    "orderId": "OMO2407121214395503786511",
    "state": "FAILED",
    "amount": 200,
    "expireAt": 1720767279548,
    "errorCode": "INVALID_MPIN",
    "detailedErrorCode": "ZM",
    "paymentDetails": [
        {
            "transactionId": "OM2407121214579231302711",
            "paymentMode": "UPI_COLLECT",
            "timestamp": 1720766697944,
            "amount": 200,
            "payableAmount": 200,
            "feeAmount": 0,
            "state": "FAILED",
            "errorCode": "INVALID_MPIN",
            "detailedErrorCode": "ZM"
        }
    ],
    "errorContext": {
       "errorCode" : "INVALID_MPIN",
       "detailedErrorCode" : "ZM",
       "source" : "CUSTOMER",
       "stage" : "AUTHENTICATION",
       "description" : "Wrong MPIN was entered"
    },
    "metaInfo": {
        "udf1": "<additional-information-1>",
        "udf2": "<additional-information-2>",
        "udf3": "<additional-information-3>",
        "udf4": "<additional-information-4>",
        "udf5": "<additional-information-5>",
        "udf6": "<additional-information-6>",
        "udf7": "<additional-information-7>",
        "udf8": "<additional-information-8>",
        "udf9": "<additional-information-9>",
        "udf10": "<additional-information-10>",
        "udf11": "<additional-information-11>",
        "udf12": "<additional-information-12>",
        "udf13": "<additional-information-13>",
        "udf14": "<additional-information-14>",
        "udf15": "<additional-information-15>"
    }
}
```

Case 6: Response for Invalid order ID

```
{  
    "code": "INVALID_MERCHANT_ORDER_ID",
    "message": "No entry found for given merchant order id"
}
```

Response Parameters

|  |  |  |
| --- | --- | --- |
| **Field Name** | **Data Type** | **Description** |
| `orderId` | String | Payment Gateway generated internal order ID |
| `state` | String | State of order; Expected Values: **•** PENDING **•** FAILED **•** COMPLETED |
| `amount` | String | Order amount in paisa |
| `expireAt` | Long | Order expiry time in epoch |
| `metaInfo` | Object | **•** For udf1 to udf10, there is no constraint. Maximum length = 256 characters **•** For udf11 to udf15, alphanumeric values with \_-+@. are allowed. Maximum length = 50 characters **Note**: **It is mandatory to keep the parameter names udf1, udf2, etc., exactly as they are in the** `metainfo` **block. Renaming these key values will result in a production error.** |
| `paymentDetails` | List | Contains a list of details of each payment attempt made corresponding to this order |
| `paymentDetails[*].paymentMode` | String | Mode of payment; Expected Values: **•** UPI\_INTENT **•** UPI\_COLLECT **•** UPI\_QR **•** CARD **•** NET\_BANKING |
| `paymentDetails[*].timestamp` | Long | Transaction attempt timestamp in epoch |
| `paymentDetails[*].amount` | Long | Amount in paisa, corresponding to payment attempt |
| `paymentDetails[*].transactionId` | String | Internal transaction ID for given payment attempt |
| `paymentDetails[*].state` | String | Transaction attempt state; Expected Values: **•** PENDING **•** COMPLETED **•** FAILED |
| `paymentDetails[*].errorCode` | String | Error code (Only present when the transaction state is failed) |
| `paymentDetails[*].detailedErrorCode` | String | Detailed Error Code (Only present when the transaction state is failed) |
| `paymentDetails[*].rail` | Object | Contains processing rail details under which payment attempt is made |
| `paymentDetails[*].rail.type` | String | Type of rail. Expected values: **•** UPI **•** PG |
| `paymentDetails[*].instrument` | Object | Contains instrument details |
| `paymentDetails[*].instrument.type` | String | Type of payment instrument; Expected values: **•** ACCOUNT **•** CREDIT\_CARD **•** DEBIT\_CARD **•** NET\_BANKING |

The **paymentDetails** object contains additional parameters, which are explained in the table below.

Response Parameters for paymentDetails object:

|  |  |  |
| --- | --- | --- |
| **Field Name** | **Data Type** | **Description** |
| `paymentDetails[*].paymentMode` | String | Mode of payment; Expected Values: **•** UPI\_INTENT **•** UPI\_COLLECT **•** UPI\_QR **•** CARD **•** NET\_BANKING |
| `paymentDetails[*].timestamp` | Long | Transaction attempt timestamp in epoch |
| `paymentDetails[*].amount` | Long | Amount in paisa, corresponding to payment attempt |
| `paymentDetails[*].transactionId` | String | Internal transaction ID for given payment attempt |
| `paymentDetails[*].state` | String | Transaction attempt state; Expected Values: **•** PENDING **•** COMPLETED **•** FAILED |
| `paymentDetails[*].errorCode` | String | Error code (Only present when the transaction state is failed) |
| `paymentDetails[*].detailedErrorCode` | String | Detailed Error Code (Only present when the transaction state is failed) |
| `paymentDetails[*].rail` | Object | Contains processing rail details under which payment attempt is made |
| `paymentDetails[*].rail.type` | String | Type of rail. Expected values: **•** UPI **•** PG |
| `paymentDetails[*].instrument` | Object | Contains instrument details |
| `paymentDetails[*].instrument.type` | String | Type of payment instrument; Expected values: **•** ACCOUNT **•** CREDIT\_CARD **•** DEBIT\_CARD **•** NET\_BANKING |

## Verify a Sample Payment Status!

headers

url params

You can also test this API request directly in Postman for a quick and easy integration check.

[Run in Postman ->](https://www.postman.com/pg-api-collections-579549/pg-api-collections-s-workspace/)

## What’s Next?

After checking the status of an order, the next step may involve handling post payment actions such as issuing a refund. This is especially relevant for transactions that are failed, cancelled, or returned by the customer.

Proceed to the next section to understand how to process refunds effectively.
