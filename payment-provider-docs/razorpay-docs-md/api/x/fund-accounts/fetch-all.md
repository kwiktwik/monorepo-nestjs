<!-- Source: https://razorpay.com/docs/api/x/fund-accounts/fetch-all -->

# Fetch All Fund Accounts

`GET`

`/v1/fund_accounts`

Use this endpoint to retrieve all fund accounts.

Sample Code

Query Parameters

6

Response Parameters

Errors

Curl

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X GET https://api.razorpay.com/v1/fund_accounts
```

Success

```json
{
  "entity": "collection",
  "count": 3,
  "items": [
  {
  "id": "fa_00000000000001",
  "entity": "fund_account",
  "contact_id": "cont_00000000000001",
  "account_type": "bank_account",
  "bank_account": {
    "ifsc": "HDFC0000053",
    "bank_name": "HDFC Bank",
    "name": "Gaurav Kumar",
    "account_number": "765432123456789",
    "notes": []
  },
  "active": false,
  "batch_id": null,
  "created_at": 1545312598
  },
  {
  "id": "fa_00000000000002",
  "entity": "fund_account",
  "contact_id": "cont_00000000000001",
  "account_type": "vpa",
  "vpa": {
    "username": "gaurav.kumar",
    "handle": "exampleupi",
    "address": "gaurav.kumar@exampleupi"
  },
  "active": true,
  "batch_id": null,
  "created_at": 1545313478
  },
  {
  "id": "fa_00000000000001",
  "entity": "fund_account",
  "contact_id": "cont_00000000000001",
  "account_type": "card",
  "card": {
    "name": "Gaurav Kumar",
    "last4": "6789",
    "network": "Visa",
    "type": "credit",
    "issuer": "HDFC"
  },
  "active": false,
  "batch_id": null,
  "created_at": 1545312598
  }
 ]
}
```

###### Query Parameters

`account_type`

`string`

The fund account type to be retrieved. Possible values:

- `bank_account`
- `vpa`
- `card` (if [payouts to cards](/docs/x/payouts/cards/)

  is enabled on your account)

`contact_id`

`string`

The unique contact ID for which fund accounts are to be retrieved. For example, `cont_00000000000001`.

`from`

`integer`

Timestamp, in Unix, from when fund accounts are to be retrieved.

`to`

`integer`

Timestamp, in Unix, till when fund accounts are to be retrieved.

`count`

`integer`

The number of fund accounts to be retrieved. Default = `10`. Maximum = `100`. This can be used for pagination, in combination with `skip`.

`skip`

`integer`

The number of fund accounts to be skipped. Default = `0`. This can be used for pagination, in combination with `count`.

###### Response Parameters

`id`

`string`

The unique identifier linked to the fund account validation. For example, `fav_0000000001`.

`entity`

`string`

Here it is `fund_account.validation`.

`status`

`string`

The status of the account validation transaction.
Possible values:

- `created`
- `completed`
- `failed`

`validation_results`

`object`

Details extracted from the results of the fund account validation.

Show child parameters (4)

`validated_account_type`

`string`

Here it is `bank_account`.

Show child parameters (1)

`status_details`

`object`

Status of the fund account validation.

Show child parameters (3)

`reference_id`

`string`

Unique reference\_id generated for the validation transaction.

`fund_account`

`object`

The details of the fund account which was validated.

Show child parameters (3)

`vpa`

`object`

The details associated with the account holder's virtual payment address.

Show child parameters (1)

`active`

`boolean`

Possible values of fund account status:

- `true`: active
- `false`: inactive

`created_at`

`integer`

Timestamp, in unix, when the fund account was created. For example, `1543650891`.

`contact`

`object`

The contact's details.

Show child parameters (8)

###### Errors

<fund account id> is not a valid id.

Error Status: 4xx

The fund account ID entered is invalid.

Solution

# Fetch All Fund Accounts

`GET`

`/v1/fund_accounts`

Use this endpoint to retrieve all fund accounts.

Query Parameters

6

Response Parameters

Errors

###### Query Parameters

`account_type`

`string`

The fund account type to be retrieved. Possible values:

- `bank_account`
- `vpa`
- `card` (if [payouts to cards](/docs/x/payouts/cards/)

  is enabled on your account)

`contact_id`

`string`

The unique contact ID for which fund accounts are to be retrieved. For example, `cont_00000000000001`.

`from`

`integer`

Timestamp, in Unix, from when fund accounts are to be retrieved.

`to`

`integer`

Timestamp, in Unix, till when fund accounts are to be retrieved.

`count`

`integer`

The number of fund accounts to be retrieved. Default = `10`. Maximum = `100`. This can be used for pagination, in combination with `skip`.

`skip`

`integer`

The number of fund accounts to be skipped. Default = `0`. This can be used for pagination, in combination with `count`.

###### Response Parameters

`id`

`string`

The unique identifier linked to the fund account validation. For example, `fav_0000000001`.

`entity`

`string`

Here it is `fund_account.validation`.

`status`

`string`

The status of the account validation transaction.
Possible values:

- `created`
- `completed`
- `failed`

`validation_results`

`object`

Details extracted from the results of the fund account validation.

Show child parameters (4)

`validated_account_type`

`string`

Here it is `bank_account`.

Show child parameters (1)

`status_details`

`object`

Status of the fund account validation.

Show child parameters (3)

`reference_id`

`string`

Unique reference\_id generated for the validation transaction.

`fund_account`

`object`

The details of the fund account which was validated.

Show child parameters (3)

`vpa`

`object`

The details associated with the account holder's virtual payment address.

Show child parameters (1)

`active`

`boolean`

Possible values of fund account status:

- `true`: active
- `false`: inactive

`created_at`

`integer`

Timestamp, in unix, when the fund account was created. For example, `1543650891`.

`contact`

`object`

The contact's details.

Show child parameters (8)

###### Errors

<fund account id> is not a valid id.

Error Status: 4xx

The fund account ID entered is invalid.

Solution

Curl

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X GET https://api.razorpay.com/v1/fund_accounts
```

Success

```json
{
  "entity": "collection",
  "count": 3,
  "items": [
  {
  "id": "fa_00000000000001",
  "entity": "fund_account",
  "contact_id": "cont_00000000000001",
  "account_type": "bank_account",
  "bank_account": {
    "ifsc": "HDFC0000053",
    "bank_name": "HDFC Bank",
    "name": "Gaurav Kumar",
    "account_number": "765432123456789",
    "notes": []
  },
  "active": false,
  "batch_id": null,
  "created_at": 1545312598
  },
  {
  "id": "fa_00000000000002",
  "entity": "fund_account",
  "contact_id": "cont_00000000000001",
  "account_type": "vpa",
  "vpa": {
    "username": "gaurav.kumar",
    "handle": "exampleupi",
    "address": "gaurav.kumar@exampleupi"
  },
  "active": true,
  "batch_id": null,
  "created_at": 1545313478
  },
  {
  "id": "fa_00000000000001",
  "entity": "fund_account",
  "contact_id": "cont_00000000000001",
  "account_type": "card",
  "card": {
    "name": "Gaurav Kumar",
    "last4": "6789",
    "network": "Visa",
    "type": "credit",
    "issuer": "HDFC"
  },
  "active": false,
  "batch_id": null,
  "created_at": 1545312598
  }
 ]
}
```
