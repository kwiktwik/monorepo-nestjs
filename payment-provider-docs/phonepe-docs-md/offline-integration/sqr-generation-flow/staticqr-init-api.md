<!-- Source: https://developer.phonepe.com/offline-integration/sqr-generation-flow/staticqr-init-api -->

# StaticQR Init API

---

**UAT Endpoints:**
`POST` <https://mercury-uat.phonepe.com/enterprise-sandbox/v1/sqr>

**Prod Endpoints:**
`POST` <https://mercury-t2.phonepe.com/v1/sqr>

## Request Headers

| Header Name | Header Value |
| --- | --- |
| *`Content-Type`* | application/json |
| *`X-VERIFY`* | SHA256(base64 encoded payload + “/v1/sqr” + salt key) + ### + salt index |

Sample Request – Payload

```
{
    "merchantId": "PHONEPETESTUAT",
    "storeId": "teststore1",
    "orderId": "testorder",
    "message": "test message for user",
    "amountRestrictionType": "UNKNOWN",
    "activeTill": 1738139169
}
```

Sample Request – Base64 Encoded Payload

```
{
  "request": "ewogICAgIm1lcmNoYW50SWQiOiAiUEhPTkVQRVRFU1RVQVQiLAogICAgInN0b3JlSWQiOiAidGVzdHN0b3JlMSIsCiAgICAib3JkZXJJZCI6ICJ0ZXN0b3JkZXIiLAogICAgIm1lc3NhZ2UiOiAidGVzdCBtZXNzYWdlIGZvciB1c2VyIiwKICAgICJhbW91bnRSZXN0cmljdGlvblR5cGUiOiAiVU5LTk9XTiIsCiAgICAiYWN0aXZlVGlsbCI6IDE3MzgxMzkxNjkKfQ=="
}
```

## Request Parameters

| Parameter Name | Type | Description | Mandatory |
| --- | --- | --- | --- |
| *`merchantId`* | `STRING` | Unique `MerchantID` assigned to the merchant by PhonePe | `Yes` |
| *`superMerchantId`* | `STRING` | Unique ID for the master MerchantID under which the multiple MIDs are tagged | `No` |
| *`storeId`* | `STRING` | Store Id of store. Should be `unique` across. Special characters like ” “, “,”, “@” etc. are not allowed. Length should be lesser than `38 characters` | `Yes` |
| *`terminalId`* | `STRING` | Store Id of store. Should be `unique` across. Special characters like ” “, “,”, “@” etc. are not allowed. Length should be lesser than `38 characters` | `No` |
| *`orderId`* | `STRING` | Unique orderId for each POS payments. Special characters like ” “, “,”, “@” etc. are not allowed. Length should be lesser than `38 characters` | `No` |
| *`customerId`* | `STRING` | Unique customerId for whom the QRCode is created. Avoid Special characters like ” “, “,”, “@” etc. Length should be lesser than `38 characters` | `No` |
| *`message`* | `STRING` | Message for the user. Special characters like ” “, “,”, “@” etc. are not allowed. Length should be lesser than `38 characters` | `No` |
| *`amountRestrictionType`* | `STRING` | The type of restriction required for the QRcode, possible values are FIXED\_AMOUNT, MIN\_BOUNDED, UNKNOWN | `Yes` |
| *`amount`* | `STRING` | The amount to be populated in SQR. Mandatory in case of FIXED\_AMOUNT QR code | `Yes` |
| *`activeFrom`* | `LONG` | The activeFrom parameter used as start timestamp and it’s in epoch datetime format. | `No` |
| *`activeTill`* | `LONG` | The activeTill parameter used as the end timestamp and it’s in epoch datetime format. | `Yes` |
| *`minAmount`* | `STRING` | The amount to be populated in SQR. Mandatory in case of MIN\_BOUNDED QR code | `Yes` |

Sample Success Response

```
{
    "success": true,
    "data": {
        "staticQrCodeId": "EQR2407291400248170583464",
        "merchantId": "PHONEPETESTUAT",
        "storeId": "teststore1",
        "terminalId": "ET2407291400248170583056",
        "orderId": "testorder",
        "message": "test message for user",
        "amountRestrictionType": "UNKNOWN",
        "sourceType": "INTERNAL_API",
        "state": "ENABLED",
        "intent": "upi://pay?mode=02&pa=EQR2407291400248170583464@ybl&purpose=00&mc=5311&pn=PhonePeMerchant&orgid=500044",
        "activeTill": [
            2025,
            1,
            29,
            13,
            56,
            9
        ]
    }
}
```
