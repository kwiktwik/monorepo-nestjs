<!-- Source: https://developer.phonepe.com/payment-gateway/autopay/standard-checkout/refund -->

# Initiate Refund and Check Refund Status

---

## Initiate Refund

The **Refund API** allows you to initiate refunds for specific transactions, returning funds to customers for reasons like order cancellations, returns, or payment adjustments. This ensures smooth and direct refund processing through the payment gateway.

## Environment

|  |  |  |
| --- | --- | --- |
| **Environment** | **HTTP Method** | **API** |
| Sandbox | `POST` | https://api-preprod.phonepe.com/apis/pg-sandbox/payments/v2/refundÂ |
| Production | `POST` | https://api.phonepe.com/apis/pg/payments/v2/refundÂ |

## Initiating Refund Request

Request Headers

|  |  |
| --- | --- |
| **Header Name** | **Header Value** |
| `Content-Type` | application/json |
| `Authorization` | O-Bearer <merchant-auth-token> |

Sample Request

```
{
    "merchantRefundId": "Refund-id-12345",
    "originalMerchantOrderId": "Order-12345",
    "amount": 1234
}
```

Request Parameters

|  |  |  |  |  |
| --- | --- | --- | --- | --- |
| **Field Name** | **Data Type** | **Mandatory(Y/N)** | **Description** | **Constraints** |
| merchantRefundId | String | Yes | A unique refund ID that you create to identify the refund request. | Max Length = 63 characters |
| originalMerchantOrderId | String | Yes | The merchant OrderId for which you want to initiate the refund. |  |
| amount | Long | Yes | The amount to be refunded, specified in paisa. | Min Value = 1 paisa |

â ï¸ ****Invalid Refund Amount!****

---

The refund amount cannot exceed the initiated amount. It must always be less than or equal to the amount originally initiated.

## Refund Initiation Response

Sample Response for Case 1: Refund initiated successfully

```
{
    "refundId": "OMRxxxxx"
    "amount": 1234,
    "state": "PENDING"
}
```

Response Parameters

|  |  |  |
| --- | --- | --- |
| **Field Name** | **Data Type** | **Description** |
| `refundId` | String | Payment Gateway generated internal order ID. |
| `amount` | Long | Refund amount specified in paisa. |
| `state` | String | Indicates the current state of the refund process. Expected value: **PENDING**. |

## Try it yourself!

headers

body params

## Check Refund Status

Refund status provides information about the current progress of a refund request. It helps track whether the refund is still pending, completed, or failed, ensuring that merchants can monitor and manage the refund process effectively.

|  |  |  |
| --- | --- | --- |
| **Environment** | **HTTP Method** | **API** |
| Sandbox | `GET` | https://api-preprod.phonepe.com/apis/pg-sandbox/payments/v2/refund/{merchantRefundId}/status |
| Production | `GET` | https://api.phonepe.com/apis/pg/payments/v2/refund/{merchantRefundId}/status |

## Refund Status Request

Request Headers

|  |  |
| --- | --- |
| **Header Name** | **Header Value** |
| `Content-Type` | application/json |
| `Authorization` | O-Bearer <merchant-auth-token> |

## Refund Status Response

Sample Response for UPI

```
{
    "originalMerchantOrderId": "MORD_79933919900218710833",
    "currency": "INR",
    "amount": 100,
    "feesReversalAmount": 0,
    "adjustedDiscountAmount": 0,
    "refundableAmount": 100,
    "state": "COMPLETED",
    "refundId": "OMR2602171448036393404822W",
    "timestamp": 1771319883641,
    "splitInstruments": [
        {
            "instrument": {
                "type": "ACCOUNT",
                "maskedAccountNumber": "XXXXXXXX0223",
                "ifsc": "KKBK0000724",
                "accountHolderName": "RAVINDRA RAJ",
                "accountType": "SAVINGS"
            },
            "rail": {
                "type": "UPI",
                "utr": "604893953961",
                "vpa": "b6XXXXXXXXXXXXXXXXXXXXXXXXXXXX60@ybl"
            },
            "currency": null,
            "amount": 100
        }
    ],
    "phonepeTPAPTxnDetailsLink": "https://phon.pe/jstkg6us"
}
```

Sample Response for RupayCC

```
{
    "originalMerchantOrderId": "MORD_79217538817499990968",
    "currency": "INR",
    "amount": 100,
    "feesReversalAmount": 0,
    "adjustedDiscountAmount": 0,
    "refundableAmount": 100,
    "state": "COMPLETED",
    "refundId": "OMR2602171446159166189536W",
    "timestamp": 1771319775918,
    "splitInstruments": [
        {
            "instrument": {
                "type": "ACCOUNT",
                "maskedAccountNumber": "653047XXXXXXXX74",
                "ifsc": "UTIB0AXISCC",
                "accountHolderName": "RISHI",
                "accountType": "CREDIT"
            },
            "rail": {
                "type": "UPI",
                "vpa": "33XXXXXXXXXXXXXXXXXXXXXXXXXXXX83@ybl"
            },
            "currency": null,
            "amount": 100
        }
    ],
    "phonepeTPAPTxnDetailsLink": "https://phon.pe/3gwea0kh"
}
```

Response Parameters

|  |  |  |
| --- | --- | --- |
| **Field Name** | **Data Type** | **Description** |
| originalMerchantOrderId | String | The original merchant order ID is used to identify the transaction for which the refund is being processed. |
| amount | String | The amount to be refunded, specified in paisa. |
| `state` | String | Refund state, Expected values: â¢ PENDING â¢ CONFIRMED â¢ COMPLETED â¢ FAILED |
| `timestamp` | Long | Timestamp of the transaction attempt in epoch (in milliseconds). |
| `refundId` | String | Refund Id generated by PhonePe. |
| `errorCode` | String | Error code returned only if the transaction state is **FAILED**. |
| `detailedErrorCode` | String | Detailed error code returned only when the transaction state is **FAILED**. |
| `splitInstruments.rail` | String | Includes details of the processing rail used for the payment attempt. |
| `splitInstruments.rail.type` | String | Specifies the type of processing rail used. Expected values:  â¢ UPI â¢ PG |
| `splitInstruments.instrument` | String | Includes the details of the payment instrument used for the transaction. |
| `splitInstruments.instrument.type` | String | Specifies the type of payment instrument used. Expected values:  â¢ ACCOUNT â¢ CREDIT\_CARD â¢ DEBIT\_CARD â¢ NET\_BANKING |

## Try it yourself!

headers

url params

## Whatâs Next?

In this section, youâve learned how to initiate a refund and check its status. In the next section, youâll understand how payment verification is handled using webhook.
