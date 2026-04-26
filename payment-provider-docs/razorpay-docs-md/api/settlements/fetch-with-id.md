<!-- Source: https://razorpay.com/docs/api/settlements/fetch-with-id -->

# Fetch Settlements With ID

`GET`

`/v1/settlements/:id`

Use this endpoint to retrieve details of a settlement with its id.

Sample Code

Path Parameters

1

Response Parameters

Errors

Curl

```bash
curl -u <YOUR_KEY>:<YOUR_SECRET>\
- X GET \
https://api.razorpay.com/v1/settlements/setl_DGlQ1Rj8os78Ec
```

Success

Failure

```json
{
    "id": "setl_DGlQ1Rj8os78Ec",
    "entity": "settlement",
    "amount": 9973635,
    "status": "processed",
    "fees": 0,
    "tax": 0,
    "utr": "1568176960vxp0rj",
    "created_at": 1568176960
}
```

###### Path Parameters

`id`

\*

`string`

The unique identifier of the settlement to be retrieved.

###### Response Parameters

`id`

`string`

The unique identifier of the settlement transaction. For example, `setl_7IZKKI4Pnt2kEe`

`entity`

`string`

Indicates the type of entity. Here, it is `settlement`.

`amount`

`integer`

The amount to be settled (in the smallest unit of currency). For example, ₹500 will be `50000`.

`status`

`string`

Indicates the [settlement states](/razorpay-docs-md/settlements.md#settlement-states). Possible values:

- `created`
- `processed`
- `failed`

`fees`

`integer`

This is the total fee charged for processing all payments received from customers settled to you in this settlement transaction. In case of a normal settlement, the fee charge will be `0`.

`tax`

`integer`

The total tax, in currency subunits, charged on the fees collected to process all payments received from customers settled to you in this settlement transaction. In case of a normal settlement, the tax charge will be `0`.

`utr`

`string`

The Unique Transaction Reference (UTR) number available across banks, which can be used to track a particular settlement in your bank account. For example, `1597813219e1pq6w`.

`created_at`

`integer`

Unix timestamp at which the settlement transaction was created.

###### Errors

The API {key/secret} provided is invalid.

Error Status: 4xx

The API credentials passed in the API call differ from the ones generated on the Dashboard.

Solution

The id provided does not exist.

Error Status: 400

The settlement id does not belong to the requestor or does not exist.

Solution

# Fetch Settlements With ID

`GET`

`/v1/settlements/:id`

Use this endpoint to retrieve details of a settlement with its id.

Path Parameters

1

Response Parameters

Errors

###### Path Parameters

`id`

\*

`string`

The unique identifier of the settlement to be retrieved.

###### Response Parameters

`id`

`string`

The unique identifier of the settlement transaction. For example, `setl_7IZKKI4Pnt2kEe`

`entity`

`string`

Indicates the type of entity. Here, it is `settlement`.

`amount`

`integer`

The amount to be settled (in the smallest unit of currency). For example, ₹500 will be `50000`.

`status`

`string`

Indicates the [settlement states](/razorpay-docs-md/settlements.md#settlement-states). Possible values:

- `created`
- `processed`
- `failed`

`fees`

`integer`

This is the total fee charged for processing all payments received from customers settled to you in this settlement transaction. In case of a normal settlement, the fee charge will be `0`.

`tax`

`integer`

The total tax, in currency subunits, charged on the fees collected to process all payments received from customers settled to you in this settlement transaction. In case of a normal settlement, the tax charge will be `0`.

`utr`

`string`

The Unique Transaction Reference (UTR) number available across banks, which can be used to track a particular settlement in your bank account. For example, `1597813219e1pq6w`.

`created_at`

`integer`

Unix timestamp at which the settlement transaction was created.

###### Errors

The API {key/secret} provided is invalid.

Error Status: 4xx

The API credentials passed in the API call differ from the ones generated on the Dashboard.

Solution

The id provided does not exist.

Error Status: 400

The settlement id does not belong to the requestor or does not exist.

Solution

Curl

```bash
curl -u <YOUR_KEY>:<YOUR_SECRET>\
- X GET \
https://api.razorpay.com/v1/settlements/setl_DGlQ1Rj8os78Ec
```

Success

Failure

```json
{
    "id": "setl_DGlQ1Rj8os78Ec",
    "entity": "settlement",
    "amount": 9973635,
    "status": "processed",
    "fees": 0,
    "tax": 0,
    "utr": "1568176960vxp0rj",
    "created_at": 1568176960
}
```
