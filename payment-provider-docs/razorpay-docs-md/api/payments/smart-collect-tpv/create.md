<!-- Source: https://razorpay.com/docs/api/payments/smart-collect-tpv/create -->

# Create a Customer Identifier With TPV

Copy for AI

View as Markdown

`POST`

`/v1/virtual_accounts`

Use this endpoint to create a Customer Identifier. While sharing the details of CIs (created using RBL bank) with the customers, ensure that the fifth character in the IFSC is number `0` and not the letter O. For example, valid IFSC is `RATN0VAAPIS` and not `RATNOVAAPIS`.

Sample Code

Request Parameters

Response Parameters

Errors

Curl

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X POST https://api.razorpay.com/v1/virtual_accounts \
-H "Content-Type: application/json" \
-d '{
    "receivers": {
        "types": [
            "bank_account"
        ],
        "bank_account":
        {
            "descriptor": "1234567890"
        }

    },
    "allowed_payers": [
      {
        "type": "bank_account",
        "bank_account": {
          "ifsc": "UTIB0000013",
          "account_number": "914010012345679"
        }
      },
      {
        "type": "bank_account",
        "bank_account": {
          "ifsc": "UTIB0000014",
          "account_number": "914010012345680"
        }
      }
    ],
    "description": "Customer Identifier created for Raftar Soft",
    "customer_id": "cust_CaVDm8eDRSXYME",
    "close_by": 1681615838,
    "notes": {
        "project_name": "Banking Software"
    }
}'
```

Success

Failure

```json
{
  "id":"va_DlGmm7jInLudH9",
  "name":"Acme Corp",
  "entity":"virtual_account",
  "status":"active",
  "description":"Customer Identifier created for Raftar Soft",
  "amount_expected":null,
  "notes":{
    "project_name":"Banking Software"
  },
  "amount_paid":0,
  "customer_id":"cust_CaVDm8eDRSXYME",
  "receivers":[
    {
      "id":"ba_DlGmm9mSj8fjRM",
      "entity":"bank_account",
      "ifsc":"RATN0VAAPIS",
      "bank_name": "RBL Bank",
      "name":"Acme Corp",
      "notes":[],
      "account_number":"2223330099089860"
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
  "close_by":1681615838,
  "closed_at":null,
  "created_at":1574837626
}
```

###### Request Parameters

`receivers`

\*

`json object`

Configuration of desired receivers for the Customer Identifier.

Show child parameters (2)

`allowed_payers`

\*

`array`

Details of customer bank accounts which will be allowed to make payments to your Customer Identifier. The parent parameter under which the customer bank account details must be passed as child parameters. You can add account details of 10 allowed payers for a Customer Identifier. For more details, refer to the [Third Party Validation](/razorpay-docs-md/smart-collect/third-party-validation.md) section.

Show child parameters (2)

`description`

`string`

A brief description of the Customer Identifier.

`customer_id`

`string`

Unique identifier of the customer to whom the Customer Identifier must be tagged. Refer to the [Customer API](/razorpay-docs-md/api/customers.md) documentation to learn how to create a customer.

`notes`

`json object`

Any custom notes you might want to add to the Customer Identifier can be entered here. Refer to the [Notes section](/razorpay-docs-md/api/understand.md#notes) to learn more.

`close_by`

`integer`

UNIX timestamp at which the Customer Identifier is scheduled to be automatically closed. For example, `1681615838`. This needs to be passed only if you want the Customer Identifier to be temporary and auto-deleted after a specific usage time.

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

UNIX timestamp at which the Customer Identifier is scheduled to be automatically closed. This is returned only if the UNIX timestamp was specified during the Customer Identifier creation. There is no expiry time for a Customer Identifier unless specified during creation.

`closed_at`

`integer`

UNIX timestamp at which the Customer Identifier is automatically closed.

`created_at`

`integer`

UNIX timestamp at which the Customer Identifier was created.

###### Errors

The API <key/secret> provided is invalid.

Error Status: 4xx

- Occurs when there is a mismatch between the API credentials passed in the API call and the API credentials generated on the Dashboard.
- `customer_id` is not correct.

Solution

The field name is required

Error Status: 400

Occurs when a mandatory field is empty.

Solution

The id provided does not exist

Error Status: 400

Occurs when the `customer_id` passed is wrong or does not belong to the identifier associated to the API keys used.

Solution

only 10 allowed payers can be added

Error Status: 400

Occurs when more than 10 allowed payers are added in the Dashboard.

Solution

Account validation is only applicable on bank account as receiver type.

Error Status: 400

This error occurs when you try to add an allowed payer account on a Customer Identifier with VPA added as a receiver (with or without a Bank account).

Solution

The bank account IFSC field is required when the bank is present ( in allowed payers)

Error Status: 400

This error occurs when you do not pass the IFSC code in the request.

Solution

Invalid IFSC OR IFSC must be 11 Characters

Error Status: 400

This error occurs when you pass an incorrect IFSC code in the request. An IFSC must be 11 characters.

Solution

# Create a Customer Identifier With TPV

Copy for AI

View as Markdown

`POST`

`/v1/virtual_accounts`

Use this endpoint to create a Customer Identifier. While sharing the details of CIs (created using RBL bank) with the customers, ensure that the fifth character in the IFSC is number `0` and not the letter O. For example, valid IFSC is `RATN0VAAPIS` and not `RATNOVAAPIS`.

Request Parameters

Response Parameters

Errors

###### Request Parameters

`receivers`

\*

`json object`

Configuration of desired receivers for the Customer Identifier.

Show child parameters (2)

`allowed_payers`

\*

`array`

Details of customer bank accounts which will be allowed to make payments to your Customer Identifier. The parent parameter under which the customer bank account details must be passed as child parameters. You can add account details of 10 allowed payers for a Customer Identifier. For more details, refer to the [Third Party Validation](/razorpay-docs-md/smart-collect/third-party-validation.md) section.

Show child parameters (2)

`description`

`string`

A brief description of the Customer Identifier.

`customer_id`

`string`

Unique identifier of the customer to whom the Customer Identifier must be tagged. Refer to the [Customer API](/razorpay-docs-md/api/customers.md) documentation to learn how to create a customer.

`notes`

`json object`

Any custom notes you might want to add to the Customer Identifier can be entered here. Refer to the [Notes section](/razorpay-docs-md/api/understand.md#notes) to learn more.

`close_by`

`integer`

UNIX timestamp at which the Customer Identifier is scheduled to be automatically closed. For example, `1681615838`. This needs to be passed only if you want the Customer Identifier to be temporary and auto-deleted after a specific usage time.

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

UNIX timestamp at which the Customer Identifier is scheduled to be automatically closed. This is returned only if the UNIX timestamp was specified during the Customer Identifier creation. There is no expiry time for a Customer Identifier unless specified during creation.

`closed_at`

`integer`

UNIX timestamp at which the Customer Identifier is automatically closed.

`created_at`

`integer`

UNIX timestamp at which the Customer Identifier was created.

###### Errors

The API <key/secret> provided is invalid.

Error Status: 4xx

- Occurs when there is a mismatch between the API credentials passed in the API call and the API credentials generated on the Dashboard.
- `customer_id` is not correct.

Solution

The field name is required

Error Status: 400

Occurs when a mandatory field is empty.

Solution

The id provided does not exist

Error Status: 400

Occurs when the `customer_id` passed is wrong or does not belong to the identifier associated to the API keys used.

Solution

only 10 allowed payers can be added

Error Status: 400

Occurs when more than 10 allowed payers are added in the Dashboard.

Solution

Account validation is only applicable on bank account as receiver type.

Error Status: 400

This error occurs when you try to add an allowed payer account on a Customer Identifier with VPA added as a receiver (with or without a Bank account).

Solution

The bank account IFSC field is required when the bank is present ( in allowed payers)

Error Status: 400

This error occurs when you do not pass the IFSC code in the request.

Solution

Invalid IFSC OR IFSC must be 11 Characters

Error Status: 400

This error occurs when you pass an incorrect IFSC code in the request. An IFSC must be 11 characters.

Solution

Curl

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X POST https://api.razorpay.com/v1/virtual_accounts \
-H "Content-Type: application/json" \
-d '{
    "receivers": {
        "types": [
            "bank_account"
        ],
        "bank_account":
        {
            "descriptor": "1234567890"
        }

    },
    "allowed_payers": [
      {
        "type": "bank_account",
        "bank_account": {
          "ifsc": "UTIB0000013",
          "account_number": "914010012345679"
        }
      },
      {
        "type": "bank_account",
        "bank_account": {
          "ifsc": "UTIB0000014",
          "account_number": "914010012345680"
        }
      }
    ],
    "description": "Customer Identifier created for Raftar Soft",
    "customer_id": "cust_CaVDm8eDRSXYME",
    "close_by": 1681615838,
    "notes": {
        "project_name": "Banking Software"
    }
}'
```

Success

Failure

```json
{
  "id":"va_DlGmm7jInLudH9",
  "name":"Acme Corp",
  "entity":"virtual_account",
  "status":"active",
  "description":"Customer Identifier created for Raftar Soft",
  "amount_expected":null,
  "notes":{
    "project_name":"Banking Software"
  },
  "amount_paid":0,
  "customer_id":"cust_CaVDm8eDRSXYME",
  "receivers":[
    {
      "id":"ba_DlGmm9mSj8fjRM",
      "entity":"bank_account",
      "ifsc":"RATN0VAAPIS",
      "bank_name": "RBL Bank",
      "name":"Acme Corp",
      "notes":[],
      "account_number":"2223330099089860"
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
  "close_by":1681615838,
  "closed_at":null,
  "created_at":1574837626
}
```
