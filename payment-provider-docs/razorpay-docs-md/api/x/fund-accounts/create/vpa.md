<!-- Source: https://razorpay.com/docs/api/x/fund-accounts/create/vpa -->

# Create a Fund Account of Type VPA

`POST`

`/v1/fund_accounts`

Use this endpoint to create a fund account with VPA details.

- A new fund account is created if any combination of the following details is unique: `contact_id` and `vpa.address`.
- If **all** the above details match the details of an existing fund account, the API returns details of the existing fund account.
- You cannot edit the details of a fund account.

Sample Code

Request Parameters

Response Parameters

Errors

Curl

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X POST https://api.razorpay.com/v1/fund_accounts \
-H "Content-Type: application/json" \
-d '{
  "account_type":"vpa",
  "contact_id":"cont_00000000000001",
  "vpa":{
    "address":"gaurav.kumar@exampleupi"
  }
}'
```

Success

```json
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
  "created_at": 1545223741
}
```

###### Request Parameters

`contact_id`

\*

`string`

This is the unique identifier linked to a contact. For example, `cont_00000000000001`.

`account_type`

\*

`string`

The fund account type you want to link to the contact ID. Here it is `vpa`.

`vpa`

\*

`object`

The contact's virtual payment address (VPA) details.

Show child parameters (1)

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

The contact ID provided does not exist.

Error Status: 4xx

The contact id provided is incorrect.

Solution

# Create a Fund Account of Type VPA

`POST`

`/v1/fund_accounts`

Use this endpoint to create a fund account with VPA details.

- A new fund account is created if any combination of the following details is unique: `contact_id` and `vpa.address`.
- If **all** the above details match the details of an existing fund account, the API returns details of the existing fund account.
- You cannot edit the details of a fund account.

Request Parameters

Response Parameters

Errors

###### Request Parameters

`contact_id`

\*

`string`

This is the unique identifier linked to a contact. For example, `cont_00000000000001`.

`account_type`

\*

`string`

The fund account type you want to link to the contact ID. Here it is `vpa`.

`vpa`

\*

`object`

The contact's virtual payment address (VPA) details.

Show child parameters (1)

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

The contact ID provided does not exist.

Error Status: 4xx

The contact id provided is incorrect.

Solution

Curl

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X POST https://api.razorpay.com/v1/fund_accounts \
-H "Content-Type: application/json" \
-d '{
  "account_type":"vpa",
  "contact_id":"cont_00000000000001",
  "vpa":{
    "address":"gaurav.kumar@exampleupi"
  }
}'
```

Success

```json
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
  "created_at": 1545223741
}
```
