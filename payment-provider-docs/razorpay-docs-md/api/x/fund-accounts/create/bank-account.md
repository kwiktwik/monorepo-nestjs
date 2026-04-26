<!-- Source: https://razorpay.com/docs/api/x/fund-accounts/create/bank-account -->

# Create a Fund Account of Type Bank Account

Copy for AI

View as Markdown

`POST`

`/v1/fund_accounts`

Use this endpoint to create a fund account with bank account details.

- A new fund account is created if any combination of the following details is unique: `contact_id`, `bank_account.name`, `bank_account.ifsc` and `bank_account.account_number`.
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
  "contact_id":"cont_00000000000001",
  "account_type":"bank_account",
  "bank_account":{
    "name":"Gaurav Kumar",
    "ifsc":"HDFC0000053",
    "account_number":"765432123456789"
  }
}'
```

Success

```json
{
  "id" : "fa_00000000000001",
  "entity": "fund_account",
  "contact_id" : "cont_00000000000001",
  "account_type": "bank_account",
  "bank_account": {
    "ifsc": "HDFC0000053",
    "bank_name": "HDFC Bank",
    "name": "Gaurav Kumar",
    "account_number": "765432123456789",
    "notes": []
  },
  "active": true,
  "batch_id": null,
  "created_at": 1543650891
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

The account type you want to link to the contact ID. Here it is `bank_account`.

`bank_account`

\*

`object`

The contact's bank account details.

Show child parameters (3)

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

The contact id provided does not exist.

Error Status: 4xx

The contact ID provided is incorrect.

Solution

The IFSC must be 11 characters.

Error Status: 4xx

The IFSC code provided is either incorrect or does not have 11 characters.

Solution

The account number format is invalid.

Error Status: 4xx

The account number is incorrect.

Solution

# Create a Fund Account of Type Bank Account

Copy for AI

View as Markdown

`POST`

`/v1/fund_accounts`

Use this endpoint to create a fund account with bank account details.

- A new fund account is created if any combination of the following details is unique: `contact_id`, `bank_account.name`, `bank_account.ifsc` and `bank_account.account_number`.
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

The account type you want to link to the contact ID. Here it is `bank_account`.

`bank_account`

\*

`object`

The contact's bank account details.

Show child parameters (3)

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

The contact id provided does not exist.

Error Status: 4xx

The contact ID provided is incorrect.

Solution

The IFSC must be 11 characters.

Error Status: 4xx

The IFSC code provided is either incorrect or does not have 11 characters.

Solution

The account number format is invalid.

Error Status: 4xx

The account number is incorrect.

Solution

Curl

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X POST https://api.razorpay.com/v1/fund_accounts \
-H "Content-Type: application/json" \
-d '{
  "contact_id":"cont_00000000000001",
  "account_type":"bank_account",
  "bank_account":{
    "name":"Gaurav Kumar",
    "ifsc":"HDFC0000053",
    "account_number":"765432123456789"
  }
}'
```

Success

```json
{
  "id" : "fa_00000000000001",
  "entity": "fund_account",
  "contact_id" : "cont_00000000000001",
  "account_type": "bank_account",
  "bank_account": {
    "ifsc": "HDFC0000053",
    "bank_name": "HDFC Bank",
    "name": "Gaurav Kumar",
    "account_number": "765432123456789",
    "notes": []
  },
  "active": true,
  "batch_id": null,
  "created_at": 1543650891
}
```
