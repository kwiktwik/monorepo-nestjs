<!-- Source: https://razorpay.com/docs/api/payments/smart-collect-tpv/fetch-all -->

# Fetch All Customer Identifiers With TPV

Copy for AI

View as Markdown

`GET`

`/v1/virtual_accounts`

Use this endpoint to fetch the details of all Customer Identifiers.

Sample Code

Query Parameters

4

Response Parameters

Errors

Curl

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X GET \
https://api.razorpay.com/v1/virtual_accounts \
```

Success

Failure

```json
{
  "entity": "collection",
  "count": 2,
  "items": [
    {
      "id": "va_Di5gbNptcWV8fQ",
      "name": "Acme Corp",
      "entity": "virtual_account",
      "status": "closed",
      "description": "Customer Identifier created for M/S ABC Exports",
      "amount_expected": 2300,
      "notes": {
        "material": "teakwood"
      },
      "amount_paid": 239000,
      "customer_id": "cust_DOMUFFiGdCaCUJ",
      "receivers": [
        {
          "id": "ba_Di5gbQsGn0QSz3",
          "entity": "bank_account",
          "ifsc": "RATN0VAAPIS",
          "bank_name": "RBL Bank",
          "name": "Acme Corp",
          "notes": [],
          "account_number": "1112220061746877"
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
      "close_by": 1574427237,
      "closed_at": 1574164078,
      "created_at": 1574143517
    },
    {
      "id": "va_Dho86Avmdw6h09",
      "name": "Acme Corp",
      "entity": "virtual_account",
      "status": "active",
      "description": "Customer Identifier created for Raftar Soft",
      "amount_expected": null,
      "notes": {
        "material": "oakwood"
      },
      "amount_paid": 0,
      "customer_id": "cust_DOMUFFiGdCaDNK",
      "receivers": [
        {
          "id": "ba_Dho86DoV16LqiO",
          "entity": "bank_account",
          "ifsc": "RATN0VAAPIS",
          "bank_name": "RBL Bank",
          "name": "Acme Corp",
          "notes": [],
          "account_number": "1112220046254840"
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
      "close_by": 1574427237,
      "closed_at": null,
      "created_at": 1574081690
    }
  ]
}
```

###### Query Parameters

`from`

`integer`

Timestamp, in seconds, from when Customer Identifiers are to be fetched.

`to`

`integer`

Timestamp, in seconds, till when Customer Identifiers are to be fetched.

`count`

`integer`

Number of Customer Identifiers to be fetched. The default value is 10 and the maximum value is 100. This can be used for pagination, in combination with `skip`.

`skip`

`integer`

Number of records to be skipped while fetching the Customer Identifiers. This can be used for pagination, in combination with `count`.

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

# Fetch All Customer Identifiers With TPV

Copy for AI

View as Markdown

`GET`

`/v1/virtual_accounts`

Use this endpoint to fetch the details of all Customer Identifiers.

Query Parameters

4

Response Parameters

Errors

###### Query Parameters

`from`

`integer`

Timestamp, in seconds, from when Customer Identifiers are to be fetched.

`to`

`integer`

Timestamp, in seconds, till when Customer Identifiers are to be fetched.

`count`

`integer`

Number of Customer Identifiers to be fetched. The default value is 10 and the maximum value is 100. This can be used for pagination, in combination with `skip`.

`skip`

`integer`

Number of records to be skipped while fetching the Customer Identifiers. This can be used for pagination, in combination with `count`.

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
https://api.razorpay.com/v1/virtual_accounts \
```

Success

Failure

```json
{
  "entity": "collection",
  "count": 2,
  "items": [
    {
      "id": "va_Di5gbNptcWV8fQ",
      "name": "Acme Corp",
      "entity": "virtual_account",
      "status": "closed",
      "description": "Customer Identifier created for M/S ABC Exports",
      "amount_expected": 2300,
      "notes": {
        "material": "teakwood"
      },
      "amount_paid": 239000,
      "customer_id": "cust_DOMUFFiGdCaCUJ",
      "receivers": [
        {
          "id": "ba_Di5gbQsGn0QSz3",
          "entity": "bank_account",
          "ifsc": "RATN0VAAPIS",
          "bank_name": "RBL Bank",
          "name": "Acme Corp",
          "notes": [],
          "account_number": "1112220061746877"
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
      "close_by": 1574427237,
      "closed_at": 1574164078,
      "created_at": 1574143517
    },
    {
      "id": "va_Dho86Avmdw6h09",
      "name": "Acme Corp",
      "entity": "virtual_account",
      "status": "active",
      "description": "Customer Identifier created for Raftar Soft",
      "amount_expected": null,
      "notes": {
        "material": "oakwood"
      },
      "amount_paid": 0,
      "customer_id": "cust_DOMUFFiGdCaDNK",
      "receivers": [
        {
          "id": "ba_Dho86DoV16LqiO",
          "entity": "bank_account",
          "ifsc": "RATN0VAAPIS",
          "bank_name": "RBL Bank",
          "name": "Acme Corp",
          "notes": [],
          "account_number": "1112220046254840"
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
      "close_by": 1574427237,
      "closed_at": null,
      "created_at": 1574081690
    }
  ]
}
```
