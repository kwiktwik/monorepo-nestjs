<!-- Source: https://razorpay.com/docs/api/payments/smart-collect/close -->

# Close a Customer Identifier

Copy for AI

View as Markdown

`POST`

`/v1/virtual_accounts/:id/close`

Use this endpoint to close a Customer Identifier.

Sample Code

Path Parameters

1

Response Parameters

Errors

Curl

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X POST https://api.razorpay.com/v1/virtual_accounts/va_Di5gbNptcWV8fQ/close
```

Success - vpa

Success - bank account

Failure

```json
{
  "id":"va_Di5gbNptcWV8fQ",
  "name":"Acme Corp",
  "entity":"virtual_account",
  "status":"closed",
  "description":"Customer Identifier created for M/S ABC Exports",
  "amount_expected":null,
  "notes":{
    "material":"teakwood"
  },
  "amount_paid":239000,
  "customer_id":"cust_DOMUFFiGdCaCUJ",
  "receivers":[
    {
      "id":"vpa_CkTmLXqVYPkbxx",
      "entity":"vpa",
      "username": "rpy.payto00000468657501",
      "handle": "icici",
      "address": "rpy.payto00000468657501@icici"
    }
  ],
  "close_by":1574427237,
  "closed_at":1574164078,
  "created_at":1574143517
}
```

###### Path Parameters

`id`

\*

`string`

The unique identifier of the Customer Identifier that is to be closed.

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

# Close a Customer Identifier

Copy for AI

View as Markdown

`POST`

`/v1/virtual_accounts/:id/close`

Use this endpoint to close a Customer Identifier.

Path Parameters

1

Response Parameters

Errors

###### Path Parameters

`id`

\*

`string`

The unique identifier of the Customer Identifier that is to be closed.

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
-X POST https://api.razorpay.com/v1/virtual_accounts/va_Di5gbNptcWV8fQ/close
```

Success - vpa

Success - bank account

Failure

```json
{
  "id":"va_Di5gbNptcWV8fQ",
  "name":"Acme Corp",
  "entity":"virtual_account",
  "status":"closed",
  "description":"Customer Identifier created for M/S ABC Exports",
  "amount_expected":null,
  "notes":{
    "material":"teakwood"
  },
  "amount_paid":239000,
  "customer_id":"cust_DOMUFFiGdCaCUJ",
  "receivers":[
    {
      "id":"vpa_CkTmLXqVYPkbxx",
      "entity":"vpa",
      "username": "rpy.payto00000468657501",
      "handle": "icici",
      "address": "rpy.payto00000468657501@icici"
    }
  ],
  "close_by":1574427237,
  "closed_at":1574164078,
  "created_at":1574143517
}
```
