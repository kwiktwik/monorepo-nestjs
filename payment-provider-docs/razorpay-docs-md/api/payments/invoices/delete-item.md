<!-- Source: https://razorpay.com/docs/api/payments/invoices/delete-item -->

# Delete an Item

`DELETE`

`/v1/items/:id`

Use this endpoint to delete an item.

Sample Code

Path Parameters

1

Errors

Curl

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
  -X DELETE https://api.razorpay.com/v1/items/item_7Oy8OMV6BdEAac \
```

Success

Failure

```json
[]
```

###### Path Parameters

`id`

\*

`string`

The unique identifier of the item that must be deleted.

###### Errors

The API <key/secret> provided is invalid.

Error Status: 4xx

The API key or secret are not entered or an invalid API key is used.

Solution

The id provided does not exist.

Error Status: 400

The invoice id entered is either invalid or does not belong to the requester account.

Solution

# Delete an Item

`DELETE`

`/v1/items/:id`

Use this endpoint to delete an item.

Path Parameters

1

Errors

###### Path Parameters

`id`

\*

`string`

The unique identifier of the item that must be deleted.

###### Errors

The API <key/secret> provided is invalid.

Error Status: 4xx

The API key or secret are not entered or an invalid API key is used.

Solution

The id provided does not exist.

Error Status: 400

The invoice id entered is either invalid or does not belong to the requester account.

Solution

Curl

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
  -X DELETE https://api.razorpay.com/v1/items/item_7Oy8OMV6BdEAac \
```

Success

Failure

```json
[]
```
