<!-- Source: https://razorpay.com/docs/api/x/account-validation/bank-account -->

# Validate a Bank Account

`POST`

`/v1/fund_accounts/validations`

Use this endpoint to create a bank account validation transaction.

Sample Code

Request Parameters

Response Parameters

Curl

```bash
curl -u <YOUR_KEY>:<YOUR_SECRET> \
-X POST https://api.razorpay.com/v1/fund_accounts/validations \
-H "Content-Type: application/json" \
-d '{
  "account_number": "7878780080316316",
  "fund_account": {
    "id": "fa_00000000000001"
  },
  "amount": 100,
  "currency": "INR",
  "notes": {
    "random_key_1": "Make it so.",
    "random_key_2": "Tea. Earl Grey. Hot."
  }
}'
```

Created

Completed

Failed

```json
{
  "id": "fav_00000000000001",
  "entity": "fund_account.validation",
  "fund_account": {
    "id": "fa_00000000000001",
    "entity": "fund_account",
    "contact_id": "cont_00000000000001",
    "account_type": "bank_account",
    "bank_account": {
      "name": "Gaurav Kumar",
      "bank_name": "HDFC",
      "ifsc": "HDFC0000053",
      "account_number": "765432123456789"
    },
    "batch_id": null,
    "active": true,
    "created_at": 1567064019
  },
  "status": "created",
  "amount": 100,
  "currency": "INR",
  "notes": {
    "random_key_1": "Make it so.",
    "random_key_2": "Tea. Earl Grey. Hot."
  },
  "results": {
    "account_status": null,
    "registered_name": null
  },
  "created_at": 1547566278,
  "utr": null
}
```

###### Request Parameters

`account_number`

\*

`string`

The account from which money should be deducted for the account validation transaction.

- Pass your customer identifier if you want money to be deducted from RazorpayX Lite.

**Watch Out!**

- This is **not** your contact's bank account number. Log in to your [**RazorpayX Dashboard**](https://x.razorpay.com/auth/?intent=current_account)

  and go to **My Account & Settings → Banking → Customer Identifier**.
- This value is different for Test Mode and Live Mode.

`fund_account`

\*

`object`

The fund account id you want to validate.

Show child parameters (1)

`amount`

\*

`integer`

The amount, in paise, to be transferred. For example, pass `100` for ₹1. The default value for this parameter is `100`.
 The value passed here does not include fees and tax. Fees and tax, if any, are deducted from your account balance.

`currency`

`string`

The currency for the transfer. The value has to be `INR`. If no value is passed, it is assumed to be `INR`.

`notes`

`object`

Key-value pair that can be used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

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

# Validate a Bank Account

`POST`

`/v1/fund_accounts/validations`

Use this endpoint to create a bank account validation transaction.

Request Parameters

Response Parameters

###### Request Parameters

`account_number`

\*

`string`

The account from which money should be deducted for the account validation transaction.

- Pass your customer identifier if you want money to be deducted from RazorpayX Lite.

**Watch Out!**

- This is **not** your contact's bank account number. Log in to your [**RazorpayX Dashboard**](https://x.razorpay.com/auth/?intent=current_account)

  and go to **My Account & Settings → Banking → Customer Identifier**.
- This value is different for Test Mode and Live Mode.

`fund_account`

\*

`object`

The fund account id you want to validate.

Show child parameters (1)

`amount`

\*

`integer`

The amount, in paise, to be transferred. For example, pass `100` for ₹1. The default value for this parameter is `100`.
 The value passed here does not include fees and tax. Fees and tax, if any, are deducted from your account balance.

`currency`

`string`

The currency for the transfer. The value has to be `INR`. If no value is passed, it is assumed to be `INR`.

`notes`

`object`

Key-value pair that can be used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

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

Curl

```bash
curl -u <YOUR_KEY>:<YOUR_SECRET> \
-X POST https://api.razorpay.com/v1/fund_accounts/validations \
-H "Content-Type: application/json" \
-d '{
  "account_number": "7878780080316316",
  "fund_account": {
    "id": "fa_00000000000001"
  },
  "amount": 100,
  "currency": "INR",
  "notes": {
    "random_key_1": "Make it so.",
    "random_key_2": "Tea. Earl Grey. Hot."
  }
}'
```

Created

Completed

Failed

```json
{
  "id": "fav_00000000000001",
  "entity": "fund_account.validation",
  "fund_account": {
    "id": "fa_00000000000001",
    "entity": "fund_account",
    "contact_id": "cont_00000000000001",
    "account_type": "bank_account",
    "bank_account": {
      "name": "Gaurav Kumar",
      "bank_name": "HDFC",
      "ifsc": "HDFC0000053",
      "account_number": "765432123456789"
    },
    "batch_id": null,
    "active": true,
    "created_at": 1567064019
  },
  "status": "created",
  "amount": 100,
  "currency": "INR",
  "notes": {
    "random_key_1": "Make it so.",
    "random_key_2": "Tea. Earl Grey. Hot."
  },
  "results": {
    "account_status": null,
    "registered_name": null
  },
  "created_at": 1547566278,
  "utr": null
}
```
