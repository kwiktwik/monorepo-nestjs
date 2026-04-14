<!-- Source: https://developer.phonepe.com/offline-integration/sqr-generation-flow/staticqr-disable-api -->

# StaticQR Disable API

---

**UAT Endpoints:**
`PUT` [https://mercury-uat.phonepe.com/enterprise-sandbox/v1/sqr/{merchantId}/{qrCodeId}/disable](https://mercury-uat.phonepe.com/enterprise-sandbox/v1/merchant/transaction/metadata)

**Prod Endpoints:**
`PUT` <https://mercury-t2.phonepe.com/v1/sqr/{merchantId}/{qrCodeId}/disable>

## Request Headers

| Header Name | Header Value |
| --- | --- |
| *`Content-Type`* | application/json |
| *`X-VERIFY`* | SHA256(“/v1/sqr/{merchantId}/{qrCodeId}/disable” + salt key) + ### + salt index |

Sample Success Response

```
{
    "success": true,
    "data": {
        "staticQrCodeId": "EQR2404241503081345429964",
        "merchantId": "PHONEPETESTUAT",
        "storeId": "teststore1",
        "terminalId": "ET2404241503081445429838",
        "orderId": "testorder",
        "message": "test message for user",
        "amountRestrictionType": "MAX_BOUNDED",
        "sourceType": "INTERNAL_API",
        "state": "DISABLED",
        "maxAmount": 10000,
        "intent": "upi://pay?mode=02&pa=EQR2404241503081345429964@ybl&purpose=00&mc=5311&pn=PhonePeMerchant&orgid=500044",
        "activeFrom": [
            2024,
            4,
            24,
            15,
            3,
            8
        ],
        "activeTill": [
            2024,
            4,
            24,
            15,
            3,
            8
        ]
    }
}
```
