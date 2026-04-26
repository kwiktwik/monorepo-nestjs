<!-- Source: https://razorpay.com/docs/api/payments/invoices/fetch-with-id-item -->

# Fetch Item With ID

Copy for AI

View as Markdown

`GET`

`/v1/items/:id`

Use this endpoint to retrieve the details of a specific item using the `Item_id`.

Sample Code

Path Parameters

1

Response Parameters

Errors

Curl

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
  - X GET https://api.razorpay.com/v1/items/item_7Oxp4hmm6T4SCn \
```

Success

Failure

```json
{
  "id": "item_7Oxp4hmm6T4SCn",
  "active": true,
  "name": "Book / English August",
  "description": "An indian story, Booker prize winner.",
  "amount": 20000,
  "unit_amount": 20000,
  "currency": "INR",
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

The unique identifier of the item whose details are to be fetched.

###### Response Parameters

`id`

`string`

The unique identifier of the item.

`active`

`boolean`

Indicates the status of the item. Possible values:

- true (default): Item is in active state.
- false: Item is in inactive state.

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

no Route matched with those values

Error Status: 400

This happens when the lenght of the id is incorrect.

Solution

# Fetch Item With ID

Copy for AI

View as Markdown

`GET`

`/v1/items/:id`

Use this endpoint to retrieve the details of a specific item using the `Item_id`.

Path Parameters

1

Response Parameters

Errors

###### Path Parameters

`id`

\*

`string`

The unique identifier of the item whose details are to be fetched.

###### Response Parameters

`id`

`string`

The unique identifier of the item.

`active`

`boolean`

Indicates the status of the item. Possible values:

- true (default): Item is in active state.
- false: Item is in inactive state.

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

no Route matched with those values

Error Status: 400

This happens when the lenght of the id is incorrect.

Solution

Curl

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
  - X GET https://api.razorpay.com/v1/items/item_7Oxp4hmm6T4SCn \
```

Success

Failure

```json
{
  "id": "item_7Oxp4hmm6T4SCn",
  "active": true,
  "name": "Book / English August",
  "description": "An indian story, Booker prize winner.",
  "amount": 20000,
  "unit_amount": 20000,
  "currency": "INR",
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
