<!-- Source: https://developer.phonepe.com/offline-integration/single-suite-api-for-all-solutions/external-status-api -->

# External Status API

---

This StatusCheck API is used to fetch the current status of the raised transaction to the customer.

**UAT Endpoints:**
GET [https://mercury-uat.phonepe.com/enterprise-sandbox/v1/payment/{merchantId}/{phonepeTransactionId}/status](https://mercury-uat.phonepe.com/enterprise-sandbox/v1/edc/transaction/%7BmerchantId%7D/%7BtransactionId%7D/status)

**Prod Endpoints:**
GET [https://mercury-t2.phonepe.com/v1/payment/{merchantId}/{phonepeTransactionId}/status](https://mercury-t2.phonepe.com/v1/edc/transaction/%7BmerchantId%7D/%7Btran/v1/edc/transaction/%7BmerchantId%7D/%7BtransactionId%7D/statussactionId%7D/status)

## Request Headers

| Header Name | Header Value |
| --- | --- |
| *`Content-Type`* | application/json |
| *`X-VERIFY`* | SHA256(“/v1/payment/{merchantId}/{phonepeTransactionId}/status ” + saltKey) + ### + saltIndex |
| *`X-PROVIDER-ID`* | Used for the cases where the merchants are getting onboarded via their Providers |

## Path Parameters

| Parameter Name | Type | Description | Mandatory |
| --- | --- | --- | --- |
| *`merchantId`* | `STRING` | Unique Merchant ID assigned to the merchant by PhonePe | `Yes` |
| *`phonepeTransactionId`* | `STRING` | PhonePe transactionID for which status is to be fetched | `Yes` |

## Response Parameters

| Parameter Name | Type | Description |
| --- | --- | --- |
| *`success`* | `BOOLEAN` | A boolean to indicate the success/failure of the request. |
| *`code`* | `ENUM` | Please see the list of Status Response Codes below. |
| *`message`* | `STRING` | Short message about the status of transaction |
| *`data`* | `JSON OBJECT` | Data in JSON Object |

## Data JSON Object

| Parameter Name | Type | Description |
| --- | --- | --- |
| *`merchantId`* | `STRING` | Unique Merchant ID assigned to the merchant by PhonePe |
| *`storeId`* | `STRING` | This will be a Phonepe generated storeId |
| *`terminalId`* | `STRING` | This will be a Phonepe generated terminalId |
| *`orderId`* | `STRING` | Merchant passed orderId inside the Sale Init API |
| *`transactionId`* | `STRING` | Merchant passed transactionId inside the Sale Init API |
| *`referenceNumber`* | `STRING` | This reference number will be present on Charge slip. It will be returned for every successful payment. For Card transaction it’s RRN number, UPI transactions it’s UTR number and for Wallet transactions it’s Phonepe payment Id |
| *`paymentMode`* | `STRING` | Payment Mode is visible if a transaction is attempted. Mainly it gives two values: CARD and DQR |
| *`amount`* | `LONG` | Amount in Paise format |
| *`status`* | `STRING` | It gives the status of a transaction. Mainly it gives values: PENDING/SUCCESS/FAILED/EXPIRED |
| *`responseCode`* | `STRING` | In case of error, this parameter provides granular reason for error: Wrong UPI Pin/PG Backbone Error/UPI Backbone Error |
| *`paymentInstruments`* | `STRING` | List of payment instruments used by customer to make payment. CARD payment mode: CREDIT\_CARD/DEBIT\_CARD. DQR payment mode: ACCOUNT/ WALLET/EXTERNAL\_WALLET/ DEBIT\_CARD/CREDIT\_CARD/ EXTERNAL\_VPA/EGV/NET\_BANKING |
| *`p`*`honepeTransactionId` | `STRING` | *`PhonePe Generated Transaction ID`* |

## Status API Response Codes

| Code | Description |
| --- | --- |
| *`SUCCESS`* | Payment is successful |
| *`UNAUTHORIZED`* | X-VERIFY SHA header is incorrect |
| *`INVALID_MERCHANT_ID`* | The merchantId passed is invalid |
| *`INVALID_TRANSACTION_ID`* | The Transaction ID passed is invalid |

Credit Card Response

```

{
    "success": true,
    "code": "SUCCESS",
    "message": "Your request has been successfully completed.",
    "data": {
        "merchantId": "MERCHANTUAT",
        "storeId": "teststore1",
        "terminalId": "testTerminal1",
        "orderId": "MRCH124",
        "transactionId": "TXN0011113211_18OCT",
        "referenceNumber": "579649795540",
        "paymentMode": "CARD",
        "amount": 0,
        "status": "SUCCESS",
        "responseCode": "null",
        "paymentInstruments": [
            {
                "type": "CARD",
                "amount": 100,
                "last4Digits": "4894",
                "cardNetwork": "VISA",
                "cardType": "CREDIT_CARD"
            }
        ],
        "timestamp": 1729248705772
    }
}
```

Debit Card Response

```
{
    "success": true,
    "code": "SUCCESS",
    "message": "Your request has been successfully completed.",
    "data": {
        "merchantId": "MERCHANTUAT",
        "storeId": "teststore1",
        "terminalId": "testTerminal1",
        "orderId": "MRCH124",
        "transactionId": "TXN0011113211_18OCT01",
        "referenceNumber": "861916342174",
        "paymentMode": "CARD",
        "amount": 0,
        "status": "SUCCESS",
        "responseCode": "null",
        "paymentInstruments": [
            {
                "type": "CARD",
                "amount": 100,
                "last4Digits": "5590",
                "cardNetwork": "VISA",
                "cardType": "DEBIT_CARD"
            }
        ],
        "timestamp": 1729249881076
    }
}
```

Account Wallet Response

```
{
    "success": true,
    "code": "SUCCESS",
    "message": "Your request has been successfully completed.",
    "data": {
        "merchantId": "MERCHANTUAT",
        "storeId": "teststore1",
        "terminalId": "testTerminal1",
        "orderId": "MRCH124",
        "transactionId": "TXN0011113211_18OCT02",
        "referenceNumber": "457143042016",
        "paymentMode": "DQR",
        "amount": 0,
        "status": "SUCCESS",
        "responseCode": "null",
        "paymentInstruments": [
            {
                "type": "ACCOUNT",
                "amount": 100,
                "upiTransactionId": "YBL4b8450b7e81e46bc962fbee3ee855945"
            },
            {
                "type": "WALLET",
                "amount": 0
            }
        ],
        "timestamp": 1729251765008
    }
}
```

Wallet Response

```
{
    "success": true,
    "code": "SUCCESS",
    "message": "Your request has been successfully completed.",
    "data": {
        "merchantId": "MERCHANTUAT",
        "storeId": "teststore1",
        "terminalId": "testTerminal1",
        "orderId": "MRCH124",
        "transactionId": "TXN0011113211_18OCT05",
        "referenceNumber": "457143042016",
        "paymentMode": "DQR",
        "amount": 0,
        "status": "SUCCESS",
        "responseCode": "null",
        "paymentInstruments": [
            {
                "type": "WALLET",
                "amount": 100
            }
        ],
        "timestamp": 1729252209353
    }
}
```

Account Response

```
{
    "success": true,
    "code": "SUCCESS",
    "message": "Your request has been successfully completed.",
    "data": {
        "merchantId": "MERCHANTUAT",
        "storeId": "teststore1",
        "terminalId": "testTerminal1",
        "orderId": "MRCH124",
        "transactionId": "TXN0011113211_18OCT04",
        "referenceNumber": "457143042016",
        "paymentMode": "DQR",
        "amount": 0,
        "status": "SUCCESS",
        "responseCode": "null",
        "paymentInstruments": [
            {
                "type": "ACCOUNT",
                "amount": 100,
                "upiTransactionId": "YBL4b8450b7e81e46bc962fbee3ee855945"
            }
        ],
        "timestamp": 1729252056166
    }
}
```

Python SampleCode

```
import requests
import json
import base64
import hashlib
import baseAPI
import random


apiUrl = "/v1/payment/MERCHANTUAT/{phonepeTransactionId}/status"
url = baseAPI.baseUrl + apiUrl

hashStr = apiUrl+"98372344-919d-4e1e-966e-f91f67bf87b2"

xVerifyStr = hashlib.sha256(hashStr.encode()).hexdigest()

xVerifyStr = xVerifyStr +"###" +baseAPI.saltIndex

headers = {
  'accept': 'application/json',
  'x-verify': xVerifyStr,
  'x-callback-url': "http://www.google.dom",
  'X-PROVIDER-ID': "CAFECOFFEEDAYPROVIDER",
  # 'X-REQUEST-ENV':"stage.feature.unified.api",
  'Content-Type': 'application/json'
}

print(xVerifyStr)
response = requests.request("GET", url, headers=headers)
print(response.text)
print(response.status_code)
print(f"Requesting URL: {url}")
```
