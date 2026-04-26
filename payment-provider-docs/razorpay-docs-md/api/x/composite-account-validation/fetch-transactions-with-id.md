<!-- Source: https://razorpay.com/docs/api/x/composite-account-validation/fetch-transactions-with-id -->

# Fetch Account Validation Transactions With ID

Copy for AI

View as Markdown

`GET`

`/v1/fund_accounts/validations/:id`

Use this endpoint to retrieve a particular Fund Account Validation transaction with its id.

Sample Code

Path Parameters

1

Response Parameters

Curl

```bash
curl -u <YOUR_KEY>:<YOUR_SECRET> \
    -X GET https://api.razorpay.com/v1/fund_accounts/validations/fav_00000000000001
```

Success

```json
{
    "id": "fav_00000000000001",
    "entity": "fund_account.validation",
    "status": "completed",
    "validation_results": {
        "account_status": "valid",
        "registered_name": "Gaurav Kumar",
        "details": "The beneficiary account is valid.",
        "name_match_score": 100
    },
    "status_details": {
        "description": "Validation request is completed",
        "source": "beneficiary_bank",
        "reason": "validation_completed"
    },
    "reference_id": "112233",
    "notes": {
        "random_key_1": "Make it so.",
        "random_key_2": "Tea. Earl Grey. Hot."
    },
    "fund_account": {
        "id": "fa_00000000000001",
        "entity": "fund_account",
        "account_type": "bank_account",
        "bank_account": {
            "name": "Gaurav Kumar",
            "bank_name": "HDFC",
            "ifsc": "HDFC0000053",
            "account_number": "765432123456789"
        },
        "active": true,
        "created_at": 1567064019,
        "contact": {
            "id": "cont_00000000000001",
            "entity": "contact",
            "name": "Gaurav Kumar",
            "email": "gaurav.kumar@example.com",
            "contact": "9123456789",
            "type": "employee",
            "reference_id": "Acme Contact ID 12345",
            "active": true,
            "created_at": 1567064019,
            "notes": {
                "notes_key_1": "Tea, Earl Grey, Hot",
                "notes_key_2": "Tea, Earl Grey... decaf."
            }
        }
    }
}
```

###### Path Parameters

`id`

\*

`string`

This is the unique identifier linked to the account validation transaction. For example, `fav_00000000000001`.

###### Response Parameters

`id`

`string`

The unique identifier linked to the fund account. For example, `fav_000000000001`.

`entity`

`string`

Here it will be `fund_account.validation`.

`status`

`string`

The status of the account validation transaction.
Possible values:

- `created`
- `completed`
- `failed`

`utr`

`string`

A 12-digit unique identifier for the successful IMPS fund account validation transaction. For example, `123456789012`.

`validation_results`

`object`

Result of the validation.

Show child parameters (6)

`status_details`

`object`

This parameter returns the current status of the customer's bank account.

Show child parameters (3)

`fund_account`

`object`

Fund account details to which the payout was made.

Show child parameters (3)

`contact`

`object`

Contact details to which the payout was made.

Show child parameters (10)

# Fetch Account Validation Transactions With ID

Copy for AI

View as Markdown

`GET`

`/v1/fund_accounts/validations/:id`

Use this endpoint to retrieve a particular Fund Account Validation transaction with its id.

Path Parameters

1

Response Parameters

###### Path Parameters

`id`

\*

`string`

This is the unique identifier linked to the account validation transaction. For example, `fav_00000000000001`.

###### Response Parameters

`id`

`string`

The unique identifier linked to the fund account. For example, `fav_000000000001`.

`entity`

`string`

Here it will be `fund_account.validation`.

`status`

`string`

The status of the account validation transaction.
Possible values:

- `created`
- `completed`
- `failed`

`utr`

`string`

A 12-digit unique identifier for the successful IMPS fund account validation transaction. For example, `123456789012`.

`validation_results`

`object`

Result of the validation.

Show child parameters (6)

`status_details`

`object`

This parameter returns the current status of the customer's bank account.

Show child parameters (3)

`fund_account`

`object`

Fund account details to which the payout was made.

Show child parameters (3)

`contact`

`object`

Contact details to which the payout was made.

Show child parameters (10)

Curl

```bash
curl -u <YOUR_KEY>:<YOUR_SECRET> \
    -X GET https://api.razorpay.com/v1/fund_accounts/validations/fav_00000000000001
```

Success

```json
{
    "id": "fav_00000000000001",
    "entity": "fund_account.validation",
    "status": "completed",
    "validation_results": {
        "account_status": "valid",
        "registered_name": "Gaurav Kumar",
        "details": "The beneficiary account is valid.",
        "name_match_score": 100
    },
    "status_details": {
        "description": "Validation request is completed",
        "source": "beneficiary_bank",
        "reason": "validation_completed"
    },
    "reference_id": "112233",
    "notes": {
        "random_key_1": "Make it so.",
        "random_key_2": "Tea. Earl Grey. Hot."
    },
    "fund_account": {
        "id": "fa_00000000000001",
        "entity": "fund_account",
        "account_type": "bank_account",
        "bank_account": {
            "name": "Gaurav Kumar",
            "bank_name": "HDFC",
            "ifsc": "HDFC0000053",
            "account_number": "765432123456789"
        },
        "active": true,
        "created_at": 1567064019,
        "contact": {
            "id": "cont_00000000000001",
            "entity": "contact",
            "name": "Gaurav Kumar",
            "email": "gaurav.kumar@example.com",
            "contact": "9123456789",
            "type": "employee",
            "reference_id": "Acme Contact ID 12345",
            "active": true,
            "created_at": 1567064019,
            "notes": {
                "notes_key_1": "Tea, Earl Grey, Hot",
                "notes_key_2": "Tea, Earl Grey... decaf."
            }
        }
    }
}
```
