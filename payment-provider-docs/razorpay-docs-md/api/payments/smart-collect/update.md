<!-- Source: https://razorpay.com/docs/api/payments/smart-collect/update -->

# Update a Customer Identifier

Copy for AI

View as Markdown

`PATCH`

`/v1/virtual_accounts/:id`

Use this endpoint to update your Customer Identifier. You cannot update the expiry date of a Customer Identifier that has been closed.

Sample Code

Path Parameters

1

Request Parameters

Response Parameters

Errors

Curl

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET]
-X PATCH https://api.razorpay.com/v1/virtual_accounts/va_KFIrkRmd70ylIg
-H 'content-type: application/json'
-d '{
    "close_by": 1981615845,
    "description": "VA creation for Raftar Soft",
    "notes": {
        "project_name": "Banking Software Work"
    }
}'
```

Success

Failure

```json
{
  "id": "va_KFIrkRmd70ylIg",
  "name": "Word Express",
  "entity": "virtual_account",
  "status": "active",
  "description": "VA creation for Raftar Soft",
  "amount_expected": null,
  "notes": {
    "project_name": "Banking Software Work"
  },
  "amount_paid": 0,
  "customer_id": "cust_FY61BIF7OVJLRp",
  "receivers": [
    {
      "id": "ba_KFIrkdawCUDC6n",
      "entity": "bank_account",
      "ifsc": "RAZR0000001",
      "bank_name": null,
      "name": "Word Express",
      "notes": [],
      "account_number": "1112220091736494"
    }
  ],
  "close_by": 1981615845,
  "closed_at": null,
  "created_at": 1577969986
}
```

###### Path Parameters

`id`

\*

`string`

The unique identifier of the Customer Identifier which you want to update.

###### Request Parameters

`close_by`

`integer`

UNIX timestamp at which the Customer Identifier is scheduled to be automatically closed. The time must be at least 15 minutes after current time. The date range can be set till `2147483647` in UNIX timestamp format (equivalent to Tuesday, January 19, 2038 8:44:07 AM GMT+05:30).

**Watch Out!**

- Any request beyond `2147483647` UNIX timestamp will fail.
- If a Customer Identifier API is not used for 90 days, it will automatically close even if no `close_by` date has been set.

`description`

`string`

A brief description of the Customer Identifier.

`notes`

`json object`

Any custom notes you might want to add to the Customer Identifier can be entered here. Refer to the [Notes section](/razorpay-docs-md/api/understand.md#notes) to learn more.

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

Show child parameters (7)

`close_by`

`integer`

UNIX timestamp at which the Customer Identifier is scheduled to be automatically closed. The time must be at least 15 minutes after current time. The date range can be set till `2147483647` in UNIX timestamp format (equivalent to Tuesday, January 19, 2038 8:44:07 AM GMT+05:30).

- Any request beyond `2147483647` UNIX timestamp will fail.
- A Customer Identifier API that has not been used for 90 days will be automatically closed even if no `close_by` date has been set.

`closed_at`

`integer`

UNIX timestamp at which the Customer Identifier is automatically closed.

`created_at`

`integer`

UNIX timestamp at which the Customer Identifier was created.

###### Errors

Customer Identifier cannot be updated

Error Status: 400

If you have created a Customer Identifier with only a VPA receiver, you cannot replace or update it.

Solution

Bank account Receiver already exists

Error Status: 400

If you have created a Customer Identifier with a receiver, for example, bank account, you cannot add another bank account receiver or replace it.

Solution

close by date should be atleast 15 min after current time

Error Status: 400

The epoch time passed is less than current time.

Solution

# Update a Customer Identifier

Copy for AI

View as Markdown

`PATCH`

`/v1/virtual_accounts/:id`

Use this endpoint to update your Customer Identifier. You cannot update the expiry date of a Customer Identifier that has been closed.

Path Parameters

1

Request Parameters

Response Parameters

Errors

###### Path Parameters

`id`

\*

`string`

The unique identifier of the Customer Identifier which you want to update.

###### Request Parameters

`close_by`

`integer`

UNIX timestamp at which the Customer Identifier is scheduled to be automatically closed. The time must be at least 15 minutes after current time. The date range can be set till `2147483647` in UNIX timestamp format (equivalent to Tuesday, January 19, 2038 8:44:07 AM GMT+05:30).

**Watch Out!**

- Any request beyond `2147483647` UNIX timestamp will fail.
- If a Customer Identifier API is not used for 90 days, it will automatically close even if no `close_by` date has been set.

`description`

`string`

A brief description of the Customer Identifier.

`notes`

`json object`

Any custom notes you might want to add to the Customer Identifier can be entered here. Refer to the [Notes section](/razorpay-docs-md/api/understand.md#notes) to learn more.

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

Show child parameters (7)

`close_by`

`integer`

UNIX timestamp at which the Customer Identifier is scheduled to be automatically closed. The time must be at least 15 minutes after current time. The date range can be set till `2147483647` in UNIX timestamp format (equivalent to Tuesday, January 19, 2038 8:44:07 AM GMT+05:30).

- Any request beyond `2147483647` UNIX timestamp will fail.
- A Customer Identifier API that has not been used for 90 days will be automatically closed even if no `close_by` date has been set.

`closed_at`

`integer`

UNIX timestamp at which the Customer Identifier is automatically closed.

`created_at`

`integer`

UNIX timestamp at which the Customer Identifier was created.

###### Errors

Customer Identifier cannot be updated

Error Status: 400

If you have created a Customer Identifier with only a VPA receiver, you cannot replace or update it.

Solution

Bank account Receiver already exists

Error Status: 400

If you have created a Customer Identifier with a receiver, for example, bank account, you cannot add another bank account receiver or replace it.

Solution

close by date should be atleast 15 min after current time

Error Status: 400

The epoch time passed is less than current time.

Solution

Curl

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET]
-X PATCH https://api.razorpay.com/v1/virtual_accounts/va_KFIrkRmd70ylIg
-H 'content-type: application/json'
-d '{
    "close_by": 1981615845,
    "description": "VA creation for Raftar Soft",
    "notes": {
        "project_name": "Banking Software Work"
    }
}'
```

Success

Failure

```json
{
  "id": "va_KFIrkRmd70ylIg",
  "name": "Word Express",
  "entity": "virtual_account",
  "status": "active",
  "description": "VA creation for Raftar Soft",
  "amount_expected": null,
  "notes": {
    "project_name": "Banking Software Work"
  },
  "amount_paid": 0,
  "customer_id": "cust_FY61BIF7OVJLRp",
  "receivers": [
    {
      "id": "ba_KFIrkdawCUDC6n",
      "entity": "bank_account",
      "ifsc": "RAZR0000001",
      "bank_name": null,
      "name": "Word Express",
      "notes": [],
      "account_number": "1112220091736494"
    }
  ],
  "close_by": 1981615845,
  "closed_at": null,
  "created_at": 1577969986
}
```
