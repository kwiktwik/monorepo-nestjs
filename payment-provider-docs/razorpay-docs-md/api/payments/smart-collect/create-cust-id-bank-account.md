<!-- Source: https://razorpay.com/docs/api/payments/smart-collect/create-cust-id-bank-account -->

# Create a Customer Identifier With Bank Account Receiver

`POST`

`/v1/virtual_accounts`

Use this endpoint to create a Customer Identifier with bank account receiver type.

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
    "bank_account": {
      "descriptor": "1234567890"
    }
  },
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

Show child parameters (3)

`description`

`string`

A brief description of the Customer Identifier.

`customer_id`

`string`

Unique identifier of the customer to whom the Customer Identifier must be tagged. Create a customer using the [Customer API](/razorpay-docs-md/api/customers.md).

`notes`

`json object`

Any custom notes you might want to add to the Customer Identifier can be entered here. Know more about [notes](/razorpay-docs-md/api/understand.md#notes).

`close_by`

`integer`

UNIX timestamp at which the Customer Identifier is scheduled to be automatically closed. For example, `1681615838`. This needs to be passed only if you want the Customer Identifier to be temporary and auto-deleted after a specific usage time.

**Watch Out!**

- While sharing the details of Customer Identifiers (created using RBL bank) with the customers, ensure that the fifth character in the IFSC is number `0` and not the letter O. For example, valid IFSC is `RATN0VAAPIS` and not `RATNOVAAPIS`.
- A Customer Identifier will close automatically only if the UNIX timestamp is passed in the `close_by` request parameter.

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

Any custom notes you might want to add to the Customer Identifier can be entered here. Know more about [notes](/razorpay-docs-md/api/understand.md#notes).

`customer_id`

`string`

Unique identifier of the customer the Customer Identifier is linked with. Know more about [Customer API](/razorpay-docs-md/api/customers.md).

`receivers`

`json object`

Configuration of desired receivers for the Customer Identifier.

Show child parameters (10)

`close_by`

`integer`

UNIX timestamp at which the Customer Identifier is scheduled to be automatically closed. For example,  `1681615838`. This is returned only if the UNIX timestamp was specified during the Customer Identifier creation. There is no expiry time for a Customer Identifier unless specified during creation.

`closed_at`

`integer`

UNIX timestamp at which the Customer Identifier is automatically closed.

`created_at`

`integer`

UNIX timestamp at which the Customer Identifier was created.

###### Errors

The api <key/secret> provided is invalid

Error Status: 4xx

Occurs when there is a mismatch between the API credentials passed in the API call and the API credentials generated on the Dashboard.

Solution

The field name is required

Error Status: 400

Occurs when a mandatory field is empty.

Solution

The id provided does not exist

Error Status: 400

Occurs when the `customer_id` passed is wrong or does not belong to the identifier associated to the API Keys used.

Solution

Receivers field is required

Error Status: 400

Occurs when the receivers field is empty.

Solution

An active Customer Identifier with the same descriptor already exists for your account.

Error Status: 400

The description provided by you already exists for another account.

Solution

# Create a Customer Identifier With Bank Account Receiver

`POST`

`/v1/virtual_accounts`

Use this endpoint to create a Customer Identifier with bank account receiver type.

Request Parameters

Response Parameters

Errors

###### Request Parameters

`receivers`

\*

`json object`

Configuration of desired receivers for the Customer Identifier.

Show child parameters (3)

`description`

`string`

A brief description of the Customer Identifier.

`customer_id`

`string`

Unique identifier of the customer to whom the Customer Identifier must be tagged. Create a customer using the [Customer API](/razorpay-docs-md/api/customers.md).

`notes`

`json object`

Any custom notes you might want to add to the Customer Identifier can be entered here. Know more about [notes](/razorpay-docs-md/api/understand.md#notes).

`close_by`

`integer`

UNIX timestamp at which the Customer Identifier is scheduled to be automatically closed. For example, `1681615838`. This needs to be passed only if you want the Customer Identifier to be temporary and auto-deleted after a specific usage time.

**Watch Out!**

- While sharing the details of Customer Identifiers (created using RBL bank) with the customers, ensure that the fifth character in the IFSC is number `0` and not the letter O. For example, valid IFSC is `RATN0VAAPIS` and not `RATNOVAAPIS`.
- A Customer Identifier will close automatically only if the UNIX timestamp is passed in the `close_by` request parameter.

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

Any custom notes you might want to add to the Customer Identifier can be entered here. Know more about [notes](/razorpay-docs-md/api/understand.md#notes).

`customer_id`

`string`

Unique identifier of the customer the Customer Identifier is linked with. Know more about [Customer API](/razorpay-docs-md/api/customers.md).

`receivers`

`json object`

Configuration of desired receivers for the Customer Identifier.

Show child parameters (10)

`close_by`

`integer`

UNIX timestamp at which the Customer Identifier is scheduled to be automatically closed. For example,  `1681615838`. This is returned only if the UNIX timestamp was specified during the Customer Identifier creation. There is no expiry time for a Customer Identifier unless specified during creation.

`closed_at`

`integer`

UNIX timestamp at which the Customer Identifier is automatically closed.

`created_at`

`integer`

UNIX timestamp at which the Customer Identifier was created.

###### Errors

The api <key/secret> provided is invalid

Error Status: 4xx

Occurs when there is a mismatch between the API credentials passed in the API call and the API credentials generated on the Dashboard.

Solution

The field name is required

Error Status: 400

Occurs when a mandatory field is empty.

Solution

The id provided does not exist

Error Status: 400

Occurs when the `customer_id` passed is wrong or does not belong to the identifier associated to the API Keys used.

Solution

Receivers field is required

Error Status: 400

Occurs when the receivers field is empty.

Solution

An active Customer Identifier with the same descriptor already exists for your account.

Error Status: 400

The description provided by you already exists for another account.

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
    "bank_account": {
      "descriptor": "1234567890"
    }
  },
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
  "close_by":1681615838,
  "closed_at":null,
  "created_at":1574837626
}
```
