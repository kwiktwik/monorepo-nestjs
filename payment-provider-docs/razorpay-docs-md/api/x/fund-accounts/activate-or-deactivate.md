<!-- Source: https://razorpay.com/docs/api/x/fund-accounts/activate-or-deactivate -->

# Activate or Deactivate a Fund Account

Copy for AI

View as Markdown

`PATCH`

`/v1/fund_accounts/:id`

Use this endpoint to activate or deactivate a fund account. This helps you block payouts to certain fund accounts, as and when required.

Sample Code

Path Parameters

1

Request Parameters

Response Parameters

Errors

Curl

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X PATCH https://api.razorpay.com/v1/fund_accounts/fa_00000000000001 \
-H "Content-Type: application/json" \
-d '{
      "active": false
    }'
```

Success

```json
{
  "id": "fa_00000000000001",
  "entity": "fund_account",
  "contact_id": "cont_00000000000001",
  "account_type": "bank_account",
  "bank_account": {
    "ifsc": "HDFC0000053",
    "bank_name": "HDFC Bank",
    "name": "Gaurav Kumar",
    "account_number": "765432123456789"
  },
  "active": false,
  "batch_id": null,
  "created_at": 1545312598
}
```

###### Path Parameters

`id`

\*

`string`

The unique identifier linked to the fund account. For example, `fa_00000000000001`.

###### Request Parameters

`active`

\*

`boolean`

The state to which you want to move the fund account. Possible values:

- `true` (default): active
- `false`: inactive
  Pass `false` to deactivate an account and pass `true` to activate an account.

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

# Activate or Deactivate a Fund Account

Copy for AI

View as Markdown

`PATCH`

`/v1/fund_accounts/:id`

Use this endpoint to activate or deactivate a fund account. This helps you block payouts to certain fund accounts, as and when required.

Path Parameters

1

Request Parameters

Response Parameters

Errors

###### Path Parameters

`id`

\*

`string`

The unique identifier linked to the fund account. For example, `fa_00000000000001`.

###### Request Parameters

`active`

\*

`boolean`

The state to which you want to move the fund account. Possible values:

- `true` (default): active
- `false`: inactive
  Pass `false` to deactivate an account and pass `true` to activate an account.

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
-X PATCH https://api.razorpay.com/v1/fund_accounts/fa_00000000000001 \
-H "Content-Type: application/json" \
-d '{
      "active": false
    }'
```

Success

```json
{
  "id": "fa_00000000000001",
  "entity": "fund_account",
  "contact_id": "cont_00000000000001",
  "account_type": "bank_account",
  "bank_account": {
    "ifsc": "HDFC0000053",
    "bank_name": "HDFC Bank",
    "name": "Gaurav Kumar",
    "account_number": "765432123456789"
  },
  "active": false,
  "batch_id": null,
  "created_at": 1545312598
}
```
