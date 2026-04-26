<!-- Source: https://razorpay.com/docs/api/payments/smart-collect/fetch-with-id -->

# Fetch a Customer Identifier Using ID

Copy for AI

View as Markdown

`GET`

`/v1/virtual_accounts/:id`

Use this endpoint to fetch a Customer Identifier with id.

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

Success - bank account

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

**Watch Out!**

- Any request beyond `2147483647` UNIX timestamp will fail.
- A Customer Identifier API that has not been used for 90 days will be automatically closed even if no `close_by` date has been set.

`closed_at`

`integer`

UNIX timestamp at which the Customer Identifier is automatically closed.

`created_at`

`integer`

UNIX timestamp at which the Customer Identifier was created.

###### Errors

The API <key/secret> provided is invalid.

Error Status: 4xx

Occurs when there is a mismatch between the API credentials passed in the API call and the API credentials generated on the Dashboard.

Solution

# Fetch a Customer Identifier Using ID

Copy for AI

View as Markdown

`GET`

`/v1/virtual_accounts/:id`

Use this endpoint to fetch a Customer Identifier with id.

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

**Watch Out!**

- Any request beyond `2147483647` UNIX timestamp will fail.
- A Customer Identifier API that has not been used for 90 days will be automatically closed even if no `close_by` date has been set.

`closed_at`

`integer`

UNIX timestamp at which the Customer Identifier is automatically closed.

`created_at`

`integer`

UNIX timestamp at which the Customer Identifier was created.

###### Errors

The API <key/secret> provided is invalid.

Error Status: 4xx

Occurs when there is a mismatch between the API credentials passed in the API call and the API credentials generated on the Dashboard.

Solution

Curl

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X GET \
https://api.razorpay.com/v1/virtual_accounts/va_D6Vw6zyJ0OmRZg \
```

Success - bank account

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
  "close_by": null,
  "closed_at": 1568109789,
  "created_at": 1565939036
}
```
