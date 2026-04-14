<!-- Source: https://developer.phonepe.com/offline-integration/single-suite-api-for-all-solutions/transaction-cancel-api -->

# Transaction Cancel API

This Transaction Cancel API is used to cancel the raised transaction to the customer before payment is done.

**UAT Endpoints:**
PUT [https://mercury-uat.phonepe.com/enterprise-sandbox/v1/payment/{merchantId}/{merchantTransactionId}/cancel](https://mercury-uat.phonepe.com/enterprise-sandbox/v1/edc/transaction/%7BmerchantId%7D/%7BtransactionId%7D/status)

**Prod Endpoints:**
PUT [https://mercury-t2.phonepe.com/v1/payment/{merchantId}/{merchantTransactionId}/cancel](https://mercury-t2.phonepe.com/v1/edc/transaction/%7BmerchantId%7D/%7Btran/v1/edc/transaction/%7BmerchantId%7D/%7BtransactionId%7D/statussactionId%7D/status)

## Request Headers

| Header Name | Header Value |
| --- | --- |
| *`Content-Type`* | application/json |
| *`X-VERIFY`* | SHA256(“/v1/payment/{merchantId}/{phonepeTransactionId}/cancel ” + saltKey) + ### + saltIndex |
| *`X-PROVIDER-ID`* | Used for the cases where the merchants are getting onboarded via their Providers |

## Path Parameters

| Parameter Name | Type | Description | Mandatory |
| --- | --- | --- | --- |
| *`merchantId`* | `STRING` | Unique Merchant ID assigned to the merchant by PhonePe | `Yes` |
| *`merchantTransactionId`* | `STRING` | Merchant transactionID whose transaction needs to be cancelled | `Yes` |

## Response Parameters

| Parameter Name | Type | Description |
| --- | --- | --- |
| *`success`* | `BOOLEAN` | A boolean to indicate the success/failure of the request. |
| *merchantId* | `STRING` | merchant ID |
| *terminalId* | `STRING` | Terminal ID |
| *merchantTransactionId* | `STRING` | Merchant Transaction ID |
| message | `STRING` | Successfully processed Message |
