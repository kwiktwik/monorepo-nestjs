<!-- Source: https://razorpay.com/docs/api/payments/smart-collect-tpv/add-allowed-payer -->

# Add an Allowed Payer With TPV

`POST`

`/v1/virtual_accounts/:va_id/allowed_payers`

Use this endpoint to add an allowed payer's account.

Sample Code

Path Parameters

1

Request Parameters

Response Parameters

Errors

Curl

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X POST https://api.razorpay.com/v1/virtual_accounts/{va_id}/allowed_payers \
-H "Content-Type: application/json" \
-d '{
   "type":"bank_account",
   "bank_account":{
      "ifsc":"UTIB0000013",
      "account_number":"914010012345679"
   }
}'
```

Success

Failure

```json
{
  "id": "va_IUVQ3usNTeteGl",
  "name": "Smart Grofers",
  "entity": "virtual_account",
  "status": "active",
  "description": "Customer Identifier created for Raftar Soft",
  "amount_expected": null,
  "notes": {
    "project_name": "Banking Software"
  },
  "amount_paid": 10000,
  "customer_id": null,
  "receivers": [
    {
      "id": "ba_IUVQ424tVVobzZ",
      "entity": "bank_account",
      "ifsc": "RAZR0000001",
      "bank_name": null,
      "name": "Smart Grofers",
      "notes": [],
      "account_number": "1112220007297133"
    },
    {
      "id": "vpa_IUVRKM3WejBvhc",
      "entity": "vpa",
      "username": "rzr.payto000007005195066",
      "handle": "icic",
      "address": "rzr.payto000007005195066@icic"
    }
  ],
  "allowed_payers": [
    {
      "type": "bank_account",
      "id": "ba_JRSigCQ3MUCBYn",
      "bank_account": {
        "ifsc": "UTIB0000013",
        "account_number": "914010012345679"
      }
    }
  ],
  "close_by": 1681615838,
  "closed_at": null,
  "created_at": 1638862811
}
```

###### Path Parameters

`va_id`

\*

`string`

The unique identifier of the Customer Identifier to which you want to add `allowed_payers` account details.

###### Request Parameters

`type`

\*

`string`

The type of account. Possible value is `bank_account`.

`bank_account`

\*

`object`

Indicates the bank account details such as `ifsc` and `account_number`.

Show child parameters (2)

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

Account validation is only applicable on bank account as a receiver type

Error Status: 400

This error occurs when you try to add an allowed payer account on a Customer Identifier with VPA added as a receiver (with or without a Bank account).

Solution

Only 10 allowed payer accounts can be added.

Error Status: 400

This error occurs when you try to add new allowed payer accounts when the overall `allowed_payers` limit is exceeded. You can only add up to 10 allowed payer accounts.

Solution

The bank account.account number field is required when bank account is present.

Error Status: 400

This error occurs when you do not pass the bank account number in the request.

Solution

The bank account.ifsc field is required when bank account is present

Error Status: 400

This error occurs when you do not pass the IFSC in the request.

Solution

The ifsc must be 11 characters.

Error Status: 400

This error occurs when you pass an incorrect IFSC in the request. An IFSC must be 11 characters.

Solution

Payer detail already exist for virtual account.

Error Status: 400

This error occurs when you try to add a duplicate allowed payer's account with the same IFSC and account number that already exists.

Solution

Bharat QR not supported for Customer Identifier.

Error Status: 400

Passing the receivers as `qr`.

Solution

Bharat QR not enabled.

Error Status: 400

If you are a new merchant trying to create a Bharat QR code.

Solution

# Add an Allowed Payer With TPV

`POST`

`/v1/virtual_accounts/:va_id/allowed_payers`

Use this endpoint to add an allowed payer's account.

Path Parameters

1

Request Parameters

Response Parameters

Errors

###### Path Parameters

`va_id`

\*

`string`

The unique identifier of the Customer Identifier to which you want to add `allowed_payers` account details.

###### Request Parameters

`type`

\*

`string`

The type of account. Possible value is `bank_account`.

`bank_account`

\*

`object`

Indicates the bank account details such as `ifsc` and `account_number`.

Show child parameters (2)

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

Account validation is only applicable on bank account as a receiver type

Error Status: 400

This error occurs when you try to add an allowed payer account on a Customer Identifier with VPA added as a receiver (with or without a Bank account).

Solution

Only 10 allowed payer accounts can be added.

Error Status: 400

This error occurs when you try to add new allowed payer accounts when the overall `allowed_payers` limit is exceeded. You can only add up to 10 allowed payer accounts.

Solution

The bank account.account number field is required when bank account is present.

Error Status: 400

This error occurs when you do not pass the bank account number in the request.

Solution

The bank account.ifsc field is required when bank account is present

Error Status: 400

This error occurs when you do not pass the IFSC in the request.

Solution

The ifsc must be 11 characters.

Error Status: 400

This error occurs when you pass an incorrect IFSC in the request. An IFSC must be 11 characters.

Solution

Payer detail already exist for virtual account.

Error Status: 400

This error occurs when you try to add a duplicate allowed payer's account with the same IFSC and account number that already exists.

Solution

Bharat QR not supported for Customer Identifier.

Error Status: 400

Passing the receivers as `qr`.

Solution

Bharat QR not enabled.

Error Status: 400

If you are a new merchant trying to create a Bharat QR code.

Solution

Curl

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X POST https://api.razorpay.com/v1/virtual_accounts/{va_id}/allowed_payers \
-H "Content-Type: application/json" \
-d '{
   "type":"bank_account",
   "bank_account":{
      "ifsc":"UTIB0000013",
      "account_number":"914010012345679"
   }
}'
```

Success

Failure

```json
{
  "id": "va_IUVQ3usNTeteGl",
  "name": "Smart Grofers",
  "entity": "virtual_account",
  "status": "active",
  "description": "Customer Identifier created for Raftar Soft",
  "amount_expected": null,
  "notes": {
    "project_name": "Banking Software"
  },
  "amount_paid": 10000,
  "customer_id": null,
  "receivers": [
    {
      "id": "ba_IUVQ424tVVobzZ",
      "entity": "bank_account",
      "ifsc": "RAZR0000001",
      "bank_name": null,
      "name": "Smart Grofers",
      "notes": [],
      "account_number": "1112220007297133"
    },
    {
      "id": "vpa_IUVRKM3WejBvhc",
      "entity": "vpa",
      "username": "rzr.payto000007005195066",
      "handle": "icic",
      "address": "rzr.payto000007005195066@icic"
    }
  ],
  "allowed_payers": [
    {
      "type": "bank_account",
      "id": "ba_JRSigCQ3MUCBYn",
      "bank_account": {
        "ifsc": "UTIB0000013",
        "account_number": "914010012345679"
      }
    }
  ],
  "close_by": 1681615838,
  "closed_at": null,
  "created_at": 1638862811
}
```
