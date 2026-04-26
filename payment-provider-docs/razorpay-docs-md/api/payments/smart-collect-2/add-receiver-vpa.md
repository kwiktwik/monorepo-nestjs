<!-- Source: https://razorpay.com/docs/api/payments/smart-collect-2/add-receiver-vpa -->

# Add VPA Receiver to an Existing Customer Identifier (Smart Collect 2.0)

Copy for AI

View as Markdown

`POST`

`/v1/virtual_accounts/:id/receivers`

Use this endpoint to add a VPA receiver to an existing Customer Identifier.
If you have created a Customer Identifier with only a VPA receiver, you cannot replace or update it using this endpoint.

Sample Code

Path Parameters

1

Request Parameters

Response Parameters

Curl

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET]
-X POST https://api.razorpay.com/v1/virtual_accounts/va_DzcFjMezDcN8vv/receivers
-H 'content-type: application/json'
-d '{
  "types": [
    "vpa"
  ],
  "vpa": {
    "descriptor": "gaurikumari"
  }
}'
```

Success

```json
{
  "id": "va_DzcFjMezDcN8vv",
  "name": "Acme Corp",
  "entity": "virtual_account",
  "status": "active",
  "description": "",
  "amount_expected": null,
  "notes": [],
  "amount_paid": 0,
  "customer_id": "cust_DzbSeP2RJD1ZHg",
  "receivers": [
    {
      "id": "ba_DzcFjVqAMSCEIW",
      "entity": "bank_account",
      "ifsc":"RATN0VAAPIS",
      "bank_name": "RBL Bank",
      "name": "Acme Corp",
      "notes": [],
      "account_number": "2223333232194699"
    },
    {
      "id": "vpa_DzcZR5ofjCUKAx",
      "entity": "vpa",
      "username": "rpy.payto00000gaurikumari",
      "handle": "icici",
      "address": "rpy.payto00000gaurikumari@icici"
    }
  ],
  "close_by": null,
  "closed_at": null,
  "created_at": 1577969986
}
```

###### Path Parameters

`id`

\*

`string`

The unique identifier of the Customer Identifier to which another receiver type is to be added.

###### Request Parameters

`types`

\*

`array`

The receiver type to be added to the Customer Identifier. Possible values are:

- `bank_account`
- `vpa`

`vpa`

`json object`

Descriptor details for the virtual UPI ID. This is to be passed only when `vpa` is passed as the receiver `types`.

Show child parameters (1)

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

Any custom notes you might want to add to the Customer Identifier can be entered here. Know more about [notes](/razorpay-docs-md/api/understand.md).

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

# Add VPA Receiver to an Existing Customer Identifier (Smart Collect 2.0)

Copy for AI

View as Markdown

`POST`

`/v1/virtual_accounts/:id/receivers`

Use this endpoint to add a VPA receiver to an existing Customer Identifier.
If you have created a Customer Identifier with only a VPA receiver, you cannot replace or update it using this endpoint.

Path Parameters

1

Request Parameters

Response Parameters

###### Path Parameters

`id`

\*

`string`

The unique identifier of the Customer Identifier to which another receiver type is to be added.

###### Request Parameters

`types`

\*

`array`

The receiver type to be added to the Customer Identifier. Possible values are:

- `bank_account`
- `vpa`

`vpa`

`json object`

Descriptor details for the virtual UPI ID. This is to be passed only when `vpa` is passed as the receiver `types`.

Show child parameters (1)

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

Any custom notes you might want to add to the Customer Identifier can be entered here. Know more about [notes](/razorpay-docs-md/api/understand.md).

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

Curl

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET]
-X POST https://api.razorpay.com/v1/virtual_accounts/va_DzcFjMezDcN8vv/receivers
-H 'content-type: application/json'
-d '{
  "types": [
    "vpa"
  ],
  "vpa": {
    "descriptor": "gaurikumari"
  }
}'
```

Success

```json
{
  "id": "va_DzcFjMezDcN8vv",
  "name": "Acme Corp",
  "entity": "virtual_account",
  "status": "active",
  "description": "",
  "amount_expected": null,
  "notes": [],
  "amount_paid": 0,
  "customer_id": "cust_DzbSeP2RJD1ZHg",
  "receivers": [
    {
      "id": "ba_DzcFjVqAMSCEIW",
      "entity": "bank_account",
      "ifsc":"RATN0VAAPIS",
      "bank_name": "RBL Bank",
      "name": "Acme Corp",
      "notes": [],
      "account_number": "2223333232194699"
    },
    {
      "id": "vpa_DzcZR5ofjCUKAx",
      "entity": "vpa",
      "username": "rpy.payto00000gaurikumari",
      "handle": "icici",
      "address": "rpy.payto00000gaurikumari@icici"
    }
  ],
  "close_by": null,
  "closed_at": null,
  "created_at": 1577969986
}
```
