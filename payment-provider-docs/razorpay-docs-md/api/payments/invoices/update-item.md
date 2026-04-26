<!-- Source: https://razorpay.com/docs/api/payments/invoices/update-item -->

# Update an Item

`PATCH`

`/v1/items/:id`

Use this endpoint to update the details of an item. You can also edit the details of a created item from the Dashboard by clicking on that specific item from the list of items.

Sample Code

Path Parameters

1

Request Parameters

Response Parameters

Errors

Curl

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
  -H "Content-Type: application/json" \
  -X PATCH https://api.razorpay.com/v1/items/item_7Oy8OMV6BdEAac \
  -d '{
        "name":"Book / Ignited Minds - Updated name!",
        "description":"New descirption too."
      }'
```

Success

Failure

```json
{
  "id": "item_7Oy8OMV6BdEAac",
  "active": true,
  "name": "Book / Ignited Minds - Updated name!",
  "description": "New descirption too.",
  "amount": 20000,
  "unit_amount": 20000,
  "currency": "",
  "type": "invoice",
  "unit": null,
  "tax_inclusive": false,
  "hsn_code": null,
  "sac_code": null,
  "tax_rate": null,
  "tax_id": null,
  "tax_group_id": null,
  "created_at": 1649843796
}
```

###### Path Parameters

`id`

\*

`string`

The unique identifer of the item whose details are to be updated.

###### Request Parameters

`name`

`string`

The name of the item.

`description`

`string`

A brief description about the item.

`amount`

`integer`

The price of the item in the lowest unit of currency.

`currency`

`string`

The currency in which the amount should be charged. Check the list of [supported currencies](/razorpay-docs-md/international-payments.md#supported-currencies).

`active`

`boolean`

Indicates the status of the item. Possible values:

- `true` (default): Item is in the active state.
- `false`: Item is in the inactive state.

###### Response Parameters

`id`

`string`

The unique identifier of the item.

`active`

`boolean`

Indicates the status of the item. Possible values:

- `true` (default): Item is in the active state.
- `false`: Item is in the inactive state.

`name`

`string`

The name of the item.

`description`

`string`

A text description about the item.

`amount`

`integer`

The price of the item.

`unit_amount`

`integer`

The per unit billing amount for each individual unit.

`currency`

`string`

The currency in which the amount should be charged. Check the list of [supported currencies](/razorpay-docs-md/international-payments.md#supported-currencies).

`type`

`string`

Here, it must be `invoice`.

`unit`

`integer`

The number of units of the item billed in the invoice.

`tax_inclusive`

`boolean`

Indicates whether the base amount includes tax.

- `true`: The base amount includes tax.
- `false`: The base amount does not include tax. By default, the value is set to `false`.

`hsn_code`

`integer`

The 8-digit code used to classify the product as per the Harmonised System of Nomenclature.

`sac_code`

`integer`

The 6-digit code used to classify the service as per the Services Accounting Code.

`tax_rate`

`string`

The percentage at which an individual or a corporation is taxed.

`tax_id`

`string`

The identification number that gets displayed on invoices issued to the customer.

`tax_group_id`

`string`

The identification number for the tax group. A tax group is a collection of taxes that can be applied as a single set of rules.

`created_at`

`integer`

Unix timestamp, at which the item was created. For example, `1649843796`.

###### Errors

The API <key/secret> provided is invalid.

Error Status: 4xx

The API key or secret are not entered or an invalid API key is used.

Solution

The id provided does not exist.

Error Status: 400

The invoice id entered is either invalid or does not belong to the requester account.

Solution

The amount field is required when item id is not present.

Error Status: 400

Only name is entered without item id or amount.

Solution

The name field is required when item id is not present.

Error Status: 400

Possible reasons:

- Only the amount field is entered without a name or item id.
- The amount, name or item id are not entered.

Solution

# Update an Item

`PATCH`

`/v1/items/:id`

Use this endpoint to update the details of an item. You can also edit the details of a created item from the Dashboard by clicking on that specific item from the list of items.

Path Parameters

1

Request Parameters

Response Parameters

Errors

###### Path Parameters

`id`

\*

`string`

The unique identifer of the item whose details are to be updated.

###### Request Parameters

`name`

`string`

The name of the item.

`description`

`string`

A brief description about the item.

`amount`

`integer`

The price of the item in the lowest unit of currency.

`currency`

`string`

The currency in which the amount should be charged. Check the list of [supported currencies](/razorpay-docs-md/international-payments.md#supported-currencies).

`active`

`boolean`

Indicates the status of the item. Possible values:

- `true` (default): Item is in the active state.
- `false`: Item is in the inactive state.

###### Response Parameters

`id`

`string`

The unique identifier of the item.

`active`

`boolean`

Indicates the status of the item. Possible values:

- `true` (default): Item is in the active state.
- `false`: Item is in the inactive state.

`name`

`string`

The name of the item.

`description`

`string`

A text description about the item.

`amount`

`integer`

The price of the item.

`unit_amount`

`integer`

The per unit billing amount for each individual unit.

`currency`

`string`

The currency in which the amount should be charged. Check the list of [supported currencies](/razorpay-docs-md/international-payments.md#supported-currencies).

`type`

`string`

Here, it must be `invoice`.

`unit`

`integer`

The number of units of the item billed in the invoice.

`tax_inclusive`

`boolean`

Indicates whether the base amount includes tax.

- `true`: The base amount includes tax.
- `false`: The base amount does not include tax. By default, the value is set to `false`.

`hsn_code`

`integer`

The 8-digit code used to classify the product as per the Harmonised System of Nomenclature.

`sac_code`

`integer`

The 6-digit code used to classify the service as per the Services Accounting Code.

`tax_rate`

`string`

The percentage at which an individual or a corporation is taxed.

`tax_id`

`string`

The identification number that gets displayed on invoices issued to the customer.

`tax_group_id`

`string`

The identification number for the tax group. A tax group is a collection of taxes that can be applied as a single set of rules.

`created_at`

`integer`

Unix timestamp, at which the item was created. For example, `1649843796`.

###### Errors

The API <key/secret> provided is invalid.

Error Status: 4xx

The API key or secret are not entered or an invalid API key is used.

Solution

The id provided does not exist.

Error Status: 400

The invoice id entered is either invalid or does not belong to the requester account.

Solution

The amount field is required when item id is not present.

Error Status: 400

Only name is entered without item id or amount.

Solution

The name field is required when item id is not present.

Error Status: 400

Possible reasons:

- Only the amount field is entered without a name or item id.
- The amount, name or item id are not entered.

Solution

Curl

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
  -H "Content-Type: application/json" \
  -X PATCH https://api.razorpay.com/v1/items/item_7Oy8OMV6BdEAac \
  -d '{
        "name":"Book / Ignited Minds - Updated name!",
        "description":"New descirption too."
      }'
```

Success

Failure

```json
{
  "id": "item_7Oy8OMV6BdEAac",
  "active": true,
  "name": "Book / Ignited Minds - Updated name!",
  "description": "New descirption too.",
  "amount": 20000,
  "unit_amount": 20000,
  "currency": "",
  "type": "invoice",
  "unit": null,
  "tax_inclusive": false,
  "hsn_code": null,
  "sac_code": null,
  "tax_rate": null,
  "tax_id": null,
  "tax_group_id": null,
  "created_at": 1649843796
}
```
