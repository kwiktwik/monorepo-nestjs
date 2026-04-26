<!-- Source: https://developer.phonepe.com/offline-integration/intent-generation-solution/intent-init-api -->

# Intent Init API

Intent Init API is used when the merchant wants to generate a Dynamic Intent
(QR code / Paylink / Collect Request)

**UAT Endpoints:**
`POST` <https://mercury-uat.phonepe.com/enterprise-sandbox/v1/intent/init>

**Prod Endpoints:**
`POST` [https://mercury-t2.phonepe.com/v1/intent/init](https://mercury-t2.phonepe.com/v3/qr/init)

## Request Headers

| Header Name | Header Value |
| --- | --- |
| *`Content-Type`* | application/json |
| *`X-VERIFY`* | SHA256(base64 encoded payload + “/v1/intent/init” + salt key) + ### + salt index |
| *`X-CALL-MODE`* | **HTTP** mode to be used for callback. Default Value: POST |
| *`X-PROVIDER-ID`* | Used for the cases where the merchants are getting onboarded via their Providers |
| *`X-CALLBACK-URL`* | Merchants need to pass their Callback URL to receive automated callbacks/ webhooks from Phonepe post performing transactions |

Sample Request – Payload

```
{
  "merchantId": "MERCHANTUAT",
  "transactionId": "TX32321849644234",
  "merchantOrderId": "TX32321849644234",
  "amount": 1000,
  "storeId": "teststore1",
  "terminalId": "testterminal1",
  "solutionType" :"DQR",
  "intentExpiryInSeconds" : 30
}
```

Sample Request – Base64 Encoded Payload

```
{"request": "eyJtZXJjaGFudElkIjogIk5BWUFOVEVTVFVBVCIsICJ0cmFuc2FjdGlvbklkIjogIlRlc3Q2ODgyIiwgIm1lcmNoYW50T3JkZXJJZCI6ICJQQVlkQkc0MzQ1MTQ0IiwgImFtb3VudCI6IDEwMCwgImludGVudEV4cGlyeUluU2Vjb25kcyI6IDg2NjQwMCwgInNvbHV0aW9uVHlwZSI6ICJEUVIiLCAidGVybWluYWxJZCI6ICJ0ZXN0dGVybWluYWwxIiwgInN0b3JlSWQiOiAidGVzdHN0b3JlMSJ9"}
```

## Request Parameters

| Parameter Name | Type | Description | Mandatory |
| --- | --- | --- | --- |
| *`merchantId`* | `STRING` | Unique `MerchantID` assigned to the merchant by PhonePe | `Yes` |
| *`subMerchantId`* | `STRING` | Unique identity of end merchant | `No` |
| *`storeId`* | `STRING` | Store Id of store. Should be `unique` across. Special characters like ” “, “,”, “@” etc. are not allowed. Length should be lesser than `38 characters` | `Yes` |
| *`terminalId`* | `STRING` | Unique terminal Id for each POS device. Special characters like ” “, “,”, “@” etc. are not allowed. Length should be lesser than `38 characters` | `No` |
| *solutionType* | `OBJECT` | Allowed Values – [“CHARGE”,”DQR”,”PAY\_LINK”] | Yes |
| *customerPhoneNumber* | `OBJECT` | Valid customer Phone number for Collect Call and Pay link request . It is mandatory only in case of solutionType: [“CHARGE”,”PAY\_LINK”] | `No` |
| *sendToCustomer* | BOOLEAN | This flag doesn’t need to be set if partner is expecting the customer to Scan & Pay on the QR. Only if the UPI Intent needs to be sent to customer, this param can be set to true. | No |
| *generatePaylink* | BOOLEAN | Default Value : false This flag indicate if partner required payment intent short link | No |
| *`transactionId`* | `STRING` | Unique transactionId **Note**: – **TransactionId** length should be **less than 35** characters.   – No Special characters allowed except **underscore “\_”** and **hyphen “-“** | `Yes` |
| *`amount`* | `LONG` | Amount in Paise | `Yes` |
| `intentExpiryInSeconds` | `LONG` | Expiry time in seconds | `Yes` |
| *`merchantOrderId`* | `STRING` | OrderId. This can be same as transactionId | Yes |
| *`message`* | `STRING` | Message for customer | `No` |

Sample Success Response

```
{
    "success": true,
    "code": "SUCCESS",
    "message": "Your request has been successfully completed.",
    "data": {
        "merchantId": "MERCHANTUAT",
        "groupId": null,
        "transactionId": "TX32321849644234",
        "superMerchantId": null,
        "subMerchantId": null,
        "storeId": "teststore1",
        "terminalId": "testterminal1",
        "amount": 100,
        "intentString": "upi://pay?pa=MERCHANTTUAT@ybl&pn=P2Mstore3&am=100&mam=100&tr=Test6355&tn=PaymentforPAYdBG4345144&mc=5192&mode=04&purpose=00",
        "paymentLink": null,
        "expiryTimestamp": 1762077473053
    }
}
```

## Response Codes

| Code | Description |
| --- | --- |
| *`INVALID_TRANSACTION_ID`* | Duplicate TransactionID was passed. |
| *`BAD_REQUEST`* | Invalid request payload. |
| *`AUTHORIZATION_FAILED`* | Incorrect X-VERIFY header value or Incorrect Salt Keys or Incorrect Salt Index value used in the X-VERIFY generation. Please verify the Checksum Generation logic as well in these cases. |
| *`INTERNAL_SERVER_ERROR`* | Something went wrong . It is Possible due to incorrect parameter values in the payload or due to missing mandatory parameters . If all these checks are in place it is an issue with the backend server . |
| *`SUCCESS`* | API successful |

Python SampleCode

```
import requests
import json
import base64
import hashlib
import random

apiUrl = "/v1/intent/init"
url = "https://mercury-uat.phonepe.com/enterprise-sandbox" + apiUrl
transactionId = "Test6" + str(random.randint(1, 999))
merchantOrderId = "PAYdBG4345144"
saltkey = 'f1fed176-917c-4c1b-b5ae-1e1d39e1f8d5'
keyindex = '1'

req = json.dumps({
  "merchantId": "MERCHANTUAT",
  "transactionId": transactionId,
  "merchantOrderId": merchantOrderId,
  "amount": 100,
  "intentExpiryInSeconds": 866400,
  "solutionType": "DQR",
  "terminalId":"testterminal1",
  "storeId":"teststore1"
})

byte_msg = req.encode('ascii')
base64_val = base64.b64encode(byte_msg)
base64_req = base64_val.decode('ascii')

payload = json.dumps({
  "request": base64_req
})

hashStr = base64_req+apiUrl+saltkey

xVerifyStr = hashlib.sha256(hashStr.encode()).hexdigest()

xVerifyStr = xVerifyStr +"###"+ keyindex

headers = {
  'accept': 'application/json',
  'x-verify': xVerifyStr,
  'X-PROVIDER-ID' : "MERCHANTPROVIDER",
  'Content-Type': 'application/json'
}

response = requests.request("POST", url, headers=headers, data=payload)
print(response.text)
```
