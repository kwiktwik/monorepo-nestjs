<!-- Source: https://developer.phonepe.com/offline-integration/integrated-edc-solution/edc-txn-search-api -->

# EDC Txn Search API

---

The search API supports transaction search using both RRN and posRequestId.Â

**UAT Endpoints:**
`POST` <https://mercury-uat.phonepe.com/enterprise-sandbox/v1/edc/transaction/status>

**Prod Endpoints:**
`POST` <https://mercury-t2.phonepe.com/v1/edc/transaction/status>

## Request Headers

|  |  |
| --- | --- |
| **Header Name** | **Header Value** |
| *Content-Type* | application/json |
| *X-VERIFY* | SHA256(base64 encoded payload + â**/v1/edc/transaction/status**â + salt key) + ### + salt index |
| *X-PROVIDER-ID* | Used for merchants getting onboarded via Providers. Pass providerID shared by PhonePe |

**Mandatory params:Â**

1. merchantIdÂ
2. terminalId
3. Either RRN or posRequestId is mandatory.

**Note:** If both rrn and posRequestId is passed then the priority will be given to posRequestId for the search.

**Optional Params:**

1. starttimestamp
2. endTimestamp
3. amount

\*\* If both timestamps are not passed in request then by default the API will return transactions from the last 24 hours of data.

\*\* StartTimeStamp should always be less then the endTimestamp

## Request Parameters

|  |  |  |  |
| --- | --- | --- | --- |
| **Parameter Name** | **Type** | **Description** | **Mandatory** |
| *merchantId* | String | Unique Merchant ID assigned to the merchant by PhonePe | Yes |
| *terminalId* | String | Unique Terminal Id shared by Phonepe. Special characters like â â, â,â, â@â etc. are not allowed. | Yes |
| *rrn* | String | Unique transaction reference ID of the transaction. This is **referenceNumber** from the response payload. | Yes |
| *merchantTransactionId* | String | This is the **transactionId** that is passed in the EDC Sale request and Response | Yes |
| *startTimestamp* | Long | Epoch timestamp from which the transactions will be fetched and rrn will be searched | No |
| *endTimestamp* | Long | Epoch timestamp till which the transactions will be fetched and searched. | No |

JSON Request payload

```
{
  "merchantId": "M101NLBM5TQL3U",
  "terminalId": "MST2405301213090863007",
  "merchantTransactionId": "test3456",
  "rrn": "467543752",
  "startTimestamp": 1729248705772,
  "endTimestamp": 1729248705772
}
```

Base 64 encoded request payload

```
{
  "request": "ewogICJtZXJjaGFudElkIjogIk0xMDFOTEJNNVRRTDNVIiwKICAidGVybWluYWxJZCI6ICJNU1QyNDA1MzAxMjEzMDkwODYzMDA3IiwKICAibWVyY2hhbnRUcmFuc2FjdGlvbklkIjogInRlc3QzNDU2IiwKICAicnJuIjogIjQ2NzU0Mzc1MiIKfQo="
}
```

Sample Curl Request

```
curl --location 'https://mercury-t2.phonepe.com/v1/edc/transaction/status' \
  --header 'Content-Type: application/json' \
  --header 'X-VERIFY: 0ea78d35134416cf114c220e0706d549ed9e33b02d643894ebbdcafb9356502a###1' \
  --header 'X-PROVIDER-ID: OFFLINEPRODTESTPOS' \
  --data '{
    "request":"ewogICJtZXJjaGFudElkIjogIlRFU1RNSUQxMjMiLAogICJ0ZXJtaW5hbElkIjogIk1TVDI1MDQwOTE0Mzk0ODA3NzA1MjcwNTAiLAogICJycm4iOiAiNjQ5NjU5MzMyNDgxIgp9"
  }'
```

Sample Curl Response

```
{
  "success": true,
  "code": "SUCCESS",
  "message": "Your request has been successfully completed.",
  "data": [
    {
      "merchantId": "TESTMID123",
      "storeId": "MS2502111XXXX05955930709",
      "terminalId": "MST2504XXXX39480770527050",
      "orderId": "141511012",
      "transactionId": "57111833380079",
      "referenceNumber": "64964332481",
      "paymentMode": "DQR",
      "amount": 100,
      "status": "SUCCESS",
      "responseCode": "null",
      "paymentInstruments": [
        {
          "type": "ACCOUNT",
          "amount": 100,
          "upiTransactionId": "IBLe100972b18b5480692fe5beb32c4d4bb"
        }
      ],
      "timestamp": 1748953450000
    }
  ]
}
```
