<!-- Source: https://razorpay.com/docs/api/payments/smart-collect-tpv/fetch-with-id -->

# Fetch a Customer Identifier Using ID With TPV

`GET`

`/v1/virtual_accounts/:id`

Use this endpoint to fetch a Customer Identifier using id.

Sample Code

Path Parameters

1

Response Parameters

Errors

Curl

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X GET \
https://api.razorpay.com/v1/virtual_accounts/va_D6Vw6zyJ0OmRZg \
```

Success

Failure

```json
{
  "id": "va_D6Vw6zyJ0OmRZg",
  "name": "Acme Corp",
  "entity": "virtual_account",
  "status": "active",
  "description": "Customer Identifier for Raftar Soft",
  "amount_expected": 5000,
  "notes": [],
  "amount_paid": null,
  "customer_id": "cust_9xnHzNGIEY4TAV",
  "receivers": [
    {
      "id": "ba_D6Vw76RrHA3DC9",
      "entity": "bank_account",
      "ifsc": "RATN0VAAPIS",
      "bank_name": "RBL Bank",
      "name": "Acme Corp",
      "notes": [],
      "account_number": "2223330025991681"
    }
  ],
  "allowed_payers": [
    {
      "type": "bank_account",
      "id":"ba_DlGmm9mSj8fjRM",
      "bank_account": {
        "ifsc": "UTIB0000013",
        "account_number": "914010012345679"
      }
    },
    {
      "type": "bank_account",
      "id":"ba_Cmtnm5tSj6agUW",
      "bank_account": {
        "ifsc": "UTIB0000014",
        "account_number": "914010012345680"
      }
    }
  ],
  "close_by": null,
  "closed_at": 1568109789,
  "created_at": 1565939036
}
```

###### Path Parameters

`id`

\*

`string`

The unique identifier of the Customer Identifier whose details are to be fetched.

###### Response Parameters

`id`

`string`

The unique identifier of the Customer Identifier.

`name`

`string`

The `merchant billing label` as it appears on the Dashboard.

`entity`

`string`

Indicates the type of entity. Here, it is `virtual account`.

`status`

`string`

Indicates whether the Customer Identifier is in `active` or `closed` state.

`description`

`string`

A brief description about the Customer Identifier.

`amount_expected`

`integer`

The amount expected by the merchant.

`amount_paid`

`integer`

The amount paid by the customer into the Customer Identifier.

`notes`

`json object`

Any custom notes you might want to add to the Customer Identifier can be entered here. Check the [Notes section](/razorpay-docs-md/api/understand.md#notes) to know more.

`customer_id`

`string`

Unique identifier of the customer the Customer Identifier is linked with. Check the [Customer API](/razorpay-docs-md/api/customers.md) section to know more.

`receivers`

`json object`

Configuration of desired receivers for the Customer Identifier.

Show child parameters (7)

`allowed_payers`

`array`

Details of customer bank accounts which will be allowed to make payments to your Customer Identifier. The parent parameter under which the customer bank account details must be passed as child parameters. You can add account details of 10 allowed payers for a Customer Identifier. For more details, refer to the [Third Party Validation](/razorpay-docs-md/smart-collect/third-party-validation.md) section.

Show child parameters (3)

`close_by`

`integer`

UNIX timestamp at which the Customer Identifier is scheduled to be automatically closed. The time must be at least 15 minutes after current time. The date range can be set till `2147483647` in UNIX timestamp format (equivalent to Tuesday, January 19, 2038 8:44:07 AM GMT+05:30). Any request beyond `2147483647` UNIX timestamp will fail.

`closed_at`

`integer`

UNIX timestamp at which the Customer Identifier is automatically closed.

`created_at`

`integer`

UNIX timestamp at which the Customer Identifier was created.

###### Errors

The API <key/secret> provided is invalid.

Error Status: 4xx

Occurs when there is a mismatch between the API credentials passed in the API call and the API credentials generated on the dashboard.

Solution

# Fetch a Customer Identifier Using ID With TPV

`GET`

`/v1/virtual_accounts/:id`

Use this endpoint to fetch a Customer Identifier using id.

Path Parameters

1

Response Parameters

Errors

###### Path Parameters

`id`

\*

`string`

The unique identifier of the Customer Identifier whose details are to be fetched.

###### Response Parameters

`id`

`string`

The unique identifier of the Customer Identifier.

`name`

`string`

The `merchant billing label` as it appears on the Dashboard.

`entity`

`string`

Indicates the type of entity. Here, it is `virtual account`.

`status`

`string`

Indicates whether the Customer Identifier is in `active` or `closed` state.

`description`

`string`

A brief description about the Customer Identifier.

`amount_expected`

`integer`

The amount expected by the merchant.

`amount_paid`

`integer`

The amount paid by the customer into the Customer Identifier.

`notes`

`json object`

Any custom notes you might want to add to the Customer Identifier can be entered here. Check the [Notes section](/razorpay-docs-md/api/understand.md#notes) to know more.

`customer_id`

`string`

Unique identifier of the customer the Customer Identifier is linked with. Check the [Customer API](/razorpay-docs-md/api/customers.md) section to know more.

`receivers`

`json object`

Configuration of desired receivers for the Customer Identifier.

Show child parameters (7)

`allowed_payers`

`array`

Details of customer bank accounts which will be allowed to make payments to your Customer Identifier. The parent parameter under which the customer bank account details must be passed as child parameters. You can add account details of 10 allowed payers for a Customer Identifier. For more details, refer to the [Third Party Validation](/razorpay-docs-md/smart-collect/third-party-validation.md) section.

Show child parameters (3)

`close_by`

`integer`

UNIX timestamp at which the Customer Identifier is scheduled to be automatically closed. The time must be at least 15 minutes after current time. The date range can be set till `2147483647` in UNIX timestamp format (equivalent to Tuesday, January 19, 2038 8:44:07 AM GMT+05:30). Any request beyond `2147483647` UNIX timestamp will fail.

`closed_at`

`integer`

UNIX timestamp at which the Customer Identifier is automatically closed.

`created_at`

`integer`

UNIX timestamp at which the Customer Identifier was created.

###### Errors

The API <key/secret> provided is invalid.

Error Status: 4xx

Occurs when there is a mismatch between the API credentials passed in the API call and the API credentials generated on the dashboard.

Solution

Curl

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X GET \
https://api.razorpay.com/v1/virtual_accounts/va_D6Vw6zyJ0OmRZg \
```

Success

Failure

```json
{
  "id": "va_D6Vw6zyJ0OmRZg",
  "name": "Acme Corp",
  "entity": "virtual_account",
  "status": "active",
  "description": "Customer Identifier for Raftar Soft",
  "amount_expected": 5000,
  "notes": [],
  "amount_paid": null,
  "customer_id": "cust_9xnHzNGIEY4TAV",
  "receivers": [
    {
      "id": "ba_D6Vw76RrHA3DC9",
      "entity": "bank_account",
      "ifsc": "RATN0VAAPIS",
      "bank_name": "RBL Bank",
      "name": "Acme Corp",
      "notes": [],
      "account_number": "2223330025991681"
    }
  ],
  "allowed_payers": [
    {
      "type": "bank_account",
      "id":"ba_DlGmm9mSj8fjRM",
      "bank_account": {
        "ifsc": "UTIB0000013",
        "account_number": "914010012345679"
      }
    },
    {
      "type": "bank_account",
      "id":"ba_Cmtnm5tSj6agUW",
      "bank_account": {
        "ifsc": "UTIB0000014",
        "account_number": "914010012345680"
      }
    }
  ],
  "close_by": null,
  "closed_at": 1568109789,
  "created_at": 1565939036
}
```
