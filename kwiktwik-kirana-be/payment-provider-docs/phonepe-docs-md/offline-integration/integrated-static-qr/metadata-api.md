<!-- Source: https://developer.phonepe.com/offline-integration/integrated-static-qr/metadata-api -->

# Metadata API

---

The Metadata Api is used to push the invoice / billNumber generated with payment’s TransactionID to our phonepe server.

**UAT Endpoints:**
`POST` <https://mercury-uat.phonepe.com/enterprise-sandbox/v1/merchant/transaction/metadata>

**Prod Endpoints:**
`POST` <https://mercury-t2.phonepe.com/v1/merchant/transaction/metadata>

Sample Payload for Base64

```
{
  "merchantId": "MERCHANTSQRUAT",
  "phonepeTransactionId": "T2305311324226915327369",
  "schemaVersionNumber": "MERCHANTSQRUATV1",
  "metadata": {
    "BILLNUMBER": "12381"
  }
}
```

## Request Headers

| Header Name | Header Value |
| --- | --- |
| Content-Type | application/json |
| *`X-VERIFY`* | SHA256(base64 encoded payload + “/v1/merchant/transaction/metadata” + salt key) + ### + salt index |
| *`X-PROVIDER-ID`* | Used for the cases where the merchant has multiple merchant IDs |

## Request Parameters

| Parameter Name | Type | Description | Mandatory |
| --- | --- | --- | --- |
| merchantId | string | Will be provided by PhonePe | Yes |
| phonepeTransactionId | string | providerReferenceId from txnlist API | Yes |
| schemaVersionNumber | string | Unique value shared by PhonePe based on metadata | Yes |
| metadata | object | Metadata to be passed inside this like bill no. etc. | Yes |

Sample Request – Base64 Encoded Payload

```
{
  "request": "ewoJIm1lcmNoYW50SWQiOiAiSVZFUE9TVUFUIiwKCSJwaG9uZXBlVHJhbnNhY3Rpb25JZCI6ICJUMjMwNTMxMTMyNDIyNjkxNTMyNzM2OSIsCgkic2NoZW1hVmVyc2lvbk51bWJlciI6ICJJVkVQT1NVQVRWMSIsCgkibWV0YWRhdGEiOiB7CgkJIkJJTExOVU1CRVIiOiAiMTIzODEiCgl9Cn0="
}
```

Sample Payload

```
{
  "merchantId": "IVEPOSUAT",
  "phonepeTransactionId": "T2305311324226915327369",
  "schemaVersionNumber": "IVEPOSUATV1",
  "metadata": {
    "BILLNUMBER": "12381"
  }
}
```

Sample Response

```
{
  "success": true,
  "code": "SUCCESS",
  "message": "Your request has been successfully completed.",
  "data": {
    "merchantId": "IVEPOSUAT",
    "phonepeTransactionId": "T2305311324226915327369",
    "schemaVersionNumber": "IVEPOSUATV1",
    "metadata": {
      "BILLNUMBER": "12381"
    }
  }
}
```

Sample Curl Request

```
curl --location 'https://mercury-uat.phonepe.com/v1/merchant/transaction/metadata' \
--header 'Content-Type: application/json' \
--header 'X-VERIFY: cbd53121e2c9e1c65cd3c46075038840d971c19dca87d194e43b761587ef300f###1' \
--data '{
  "request": "ewoJIm1lcmNoYW50SWQiOiAiSVZFUE9TVUFUIiwKCSJwaG9uZXBlVHJhbnNhY3Rpb25JZCI6ICJUMjMwNTMxMTMyNDIyNjkxNTMyNzM2OSIsCgkic2NoZW1hVmVyc2lvbk51bWJlciI6ICJJVkVQT1NVQVRWMSIsCgkibWV0YWRhdGEiOiB7CgkJIkJJTExOVU1CRVIiOiAiMTIzODEiCgl9Cn0="
}'
```

## Various Failed Response codes of Metadata API are below:

**If incorrect schemaVersionNumber is passed : Invalid\_Schema\_Version**

ErrorResponse

```
{
  "success": false,
  "code": "INVALID_SCHEMA_VERSION",
  "message": "Request body has invalid schema version.",
  "data": {
    "merchantId": "CCDAYUAT",
    "phonepeTransactionId": "T2206301419545232701616",
    "schemaVersionNumber": "CCDV2",
    "metadata": {
      "BILLNUMBER": "1234"
    }
  }
}
```

**If phonepe txn id is not passed : Bad\_Request**

ErrorResponse

```
{
  "success": false,
  "code": "BAD_REQUEST",
  "message": "phonepeTransactionId must not be blank.",
  "data": {}
}
```

**If parameter name inside metadata is incorrect : Invalid\_Metadata\_Format**

ErrorResponse

```
{
  "success": false,
  "code": "INVALID_METADATA_FORMAT",
  "message": "Request body has invalid metadata",
  "data": {
    "merchantId": "CCDAYUAT",
    "phonepeTransactionId": "T2206301419545232701436",
    "schemaVersionNumber": "CCDV1",
    "metadata": {
      "BILLNUMBER": "1234"
    }
  }
}
```

**If the bill no. is not passed : Invalid\_Metadata\_Format**

ErrorResponse

```
{
  "success": false,
  "code": "INVALID_METADATA_FORMAT",
  "message": "Request body has invalid metadata",
  "data": {
    "merchantId": "CCDAYUAT",
    "phonepeTransactionId": "T2206301419545232701436",
    "schemaVersionNumber": "CCDV1",
    "metadata": {
      "BILLNUMBER": null
    }
  }
}
```

**If metadata value is null : Internal\_Server\_Error**

ErrorResponse

```
{
  "success": false,
  "code": "INTERNAL_SERVER_ERROR",
  "message": "Internal server error",
  "data": {
    "merchantId": "CCDAYUAT",
    "phonepeTransactionId": "T2206301419545232701436",
    "schemaVersionNumber": "CCDV1",
    "metadata": null
  }
}
```

**If already used phonepeTransactionId is passed for another bill : Invalid\_Transaction\_Id**

ErrorResponse

```
{
  "request": "ewoJIm1lcmNoYW50SWQiOiAiSVZFUE9TVUFUIiwKCSJwaG9uZXBlVHJhbnNhY3Rpb25JZCI6ICJUMjMwNTMxMTMyNDIyNjkxNTMyNzM2OSIsCgkic2NoZW1hVmVyc2lvbk51bWJlciI6ICJJVkVQT1NVQVRWMSIsCgkibWV0YWRhdGEiOiB7CgkJIkJJTExOVU1CRVIiOiAiMTIzODEiCgl9Cn0="
}
```0

**If x-verify checksum value is incorrect : Authorization\_Failed**

ErrorResponse

```
{
  "request": "ewoJIm1lcmNoYW50SWQiOiAiSVZFUE9TVUFUIiwKCSJwaG9uZXBlVHJhbnNhY3Rpb25JZCI6ICJUMjMwNTMxMTMyNDIyNjkxNTMyNzM2OSIsCgkic2NoZW1hVmVyc2lvbk51bWJlciI6ICJJVkVQT1NVQVRWMSIsCgkibWV0YWRhdGEiOiB7CgkJIkJJTExOVU1CRVIiOiAiMTIzODEiCgl9Cn0="
}
```1
