<!-- Source: https://razorpay.com/docs/api/settlements/fetch-all -->

# Fetch All Settlements

`GET`

`/v1/settlements/`

Use this endpoint to retrieve details of all settlements.

Sample Code

Query Parameters

4

Response Parameters

Errors

Curl

```bash
curl -u <YOUR_KEY>:<YOUR_SECRET>\
- X GET \
https://api.razorpay.com/v1/settlements/
```

Success

Failure

```json
{
  "entity": "collection",
  "count": 2,
  "items": [
    {
      "id": "setl_DGlQ1Rj8os78Ec",
      "entity": "settlement",
      "amount": 9973635,
      "status": "processed",
      "fees": 0,
      "tax": 0,
      "utr": "1568176960vxp0rj",
      "created_at": 1568176960
    },
    {
      "id": "setl_4xbSwsPABDJ8oK",
      "entity": "settlement",
      "amount": 50000,
      "status": "processed",
      "fees": 0,
      "tax": 0,
      "utr": "RZRP173069230702",
      "created_at": 1509622306
    }
  ]
}
```

###### Query Parameters

`from`

`integer`

Unix timestamp (in seconds) from when settlements are to be fetched.

`to`

`integer`

Unix timestamp (in seconds) till when settlements are to be fetched.

`count`

`integer`

Number of settlement records to be fetched.

- Default value: `10`.
- Possible value: `1` to `100`.
- This can be used for pagination, in combination with `skip`.

`skip`

`integer`

Number of settlement records to be skipped.

- Default value: `0`
- This can be used for pagination, in combination with `count`.

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

This is the total fee charged for processing all payments received from customers settled to you in this settlement transaction. In case of a normal settlement the fee charge will be `0`.

`tax`

`integer`

The total tax, in currency subunits, charged on the fees collected to process all payments received from customers settled to you in this settlement transaction. In case of a normal settlement the tax charge will be `0`.

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

from must be between 946684800 and 4765046400.

Error Status: 400

The `from` UNIX timestamp is not between `946684800` and `4765046400`.

Solution

to must be between 946684800 and 4765046400.

Error Status: 400

The `to` UNIX timestamp is not between `946684800` and `4765046400`.

Solution

The count must be at least 1.

Error Status: 400

The count passed is `0`.

Solution

# Fetch All Settlements

`GET`

`/v1/settlements/`

Use this endpoint to retrieve details of all settlements.

Query Parameters

4

Response Parameters

Errors

###### Query Parameters

`from`

`integer`

Unix timestamp (in seconds) from when settlements are to be fetched.

`to`

`integer`

Unix timestamp (in seconds) till when settlements are to be fetched.

`count`

`integer`

Number of settlement records to be fetched.

- Default value: `10`.
- Possible value: `1` to `100`.
- This can be used for pagination, in combination with `skip`.

`skip`

`integer`

Number of settlement records to be skipped.

- Default value: `0`
- This can be used for pagination, in combination with `count`.

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

This is the total fee charged for processing all payments received from customers settled to you in this settlement transaction. In case of a normal settlement the fee charge will be `0`.

`tax`

`integer`

The total tax, in currency subunits, charged on the fees collected to process all payments received from customers settled to you in this settlement transaction. In case of a normal settlement the tax charge will be `0`.

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

from must be between 946684800 and 4765046400.

Error Status: 400

The `from` UNIX timestamp is not between `946684800` and `4765046400`.

Solution

to must be between 946684800 and 4765046400.

Error Status: 400

The `to` UNIX timestamp is not between `946684800` and `4765046400`.

Solution

The count must be at least 1.

Error Status: 400

The count passed is `0`.

Solution

Curl

```bash
curl -u <YOUR_KEY>:<YOUR_SECRET>\
- X GET \
https://api.razorpay.com/v1/settlements/
```

Success

Failure

```json
{
  "entity": "collection",
  "count": 2,
  "items": [
    {
      "id": "setl_DGlQ1Rj8os78Ec",
      "entity": "settlement",
      "amount": 9973635,
      "status": "processed",
      "fees": 0,
      "tax": 0,
      "utr": "1568176960vxp0rj",
      "created_at": 1568176960
    },
    {
      "id": "setl_4xbSwsPABDJ8oK",
      "entity": "settlement",
      "amount": 50000,
      "status": "processed",
      "fees": 0,
      "tax": 0,
      "utr": "RZRP173069230702",
      "created_at": 1509622306
    }
  ]
}
```
