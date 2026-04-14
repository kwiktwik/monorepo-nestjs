<!-- Source: https://razorpay.com/docs/api/x/composite-account-validation/bank-account -->

# Validate a Bank Account

Copy for AI

View as Markdown

`POST`

`/v1/fund_accounts/validations`

Use this endpoint to create contact, fund account and validate the bank account in a single API call.

Sample Code

Request Parameters

Response Parameters

Curl

```bash
curl -u <YOUR_KEY>:<YOUR_SECRET> \
-X POST https://api.razorpay.com/v1/fund_accounts/validations \
-H "Content-Type: application/json" \
-d '{
  "source_account_number": "7878780080316316", 
  "validation_type": "optimized", 
  "reference_id": "112233",
  "notes": {
    "random_key_1": "Make it so.",
    "random_key_2": "Tea. Earl Grey. Hot."
  },
  "fund_account": {
    "account_type":"bank_account", 
    "bank_account":{
        "name":"Gaurav Kumar", 
        "ifsc":"HDFC0000053", 
        "account_number":"765432123456789" 
    },
        "contact": {
            "name":"Gaurav Kumar",
            "email":"gaurav.kumar@example.com",
            "contact":"9123456789",
            "type":"employee",
            "reference_id":"Acme Contact ID 12345",
            "notes":{
                "notes_key_1":"Tea, Earl Grey, Hot",
                "notes_key_2":"Tea, Earl Grey... decaf."
            }
        }
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
  "status": "created",
  "utr" : "123456789012",
  "validation_results": {
      "account_status": null,
      "registered_name": null,
      "details": null,
      "name_match_score": null
   },
  "status_details": {
    "description": "Validation request is created",
    "source": "internal",
    "reason": "validation_request_created"
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
          "name":"Gaurav Kumar",
          "email":"gaurav.kumar@example.com",
          "contact":"9123456789",
          "type":"employee",
          "reference_id":"Acme Contact ID 12345",
          "active": true,
          "created_at": 1567064019,
          "notes":{
          "notes_key_1":"Tea, Earl Grey, Hot",
          "notes_key_2":"Tea, Earl Grey... decaf."
          }
      }
  }
}
```

###### Request Parameters

`source_account_number`

\*

`string`

The account from which money should be deducted for the account validation transaction.

`validation_type`

`string`

The chosen type of validation. Possible values:

- `pennydrop`: Razorpay will make a transaction for validation.
- `penniless`: Razorpay will validate the account without a transaction.
- `optimized` (default): Razorpay will decide whether the validation requires a transaction or not.

`fund_account`

\*

`object`

Fund account details to which the payout was made.

Show child parameters (1)

`contact`

\*

`object`

Contact details to which the payout was made.

Show child parameters (4)

`notes`

`object`

Key-value pair that can be used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

`reference_id`

`string`

A user-generated reference given to the payout. Maximum length is 40 characters. For example, `112233`. You can use this field to store your own transaction ID, if any.

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

# Validate a Bank Account

Copy for AI

View as Markdown

`POST`

`/v1/fund_accounts/validations`

Use this endpoint to create contact, fund account and validate the bank account in a single API call.

Request Parameters

Response Parameters

###### Request Parameters

`source_account_number`

\*

`string`

The account from which money should be deducted for the account validation transaction.

`validation_type`

`string`

The chosen type of validation. Possible values:

- `pennydrop`: Razorpay will make a transaction for validation.
- `penniless`: Razorpay will validate the account without a transaction.
- `optimized` (default): Razorpay will decide whether the validation requires a transaction or not.

`fund_account`

\*

`object`

Fund account details to which the payout was made.

Show child parameters (1)

`contact`

\*

`object`

Contact details to which the payout was made.

Show child parameters (4)

`notes`

`object`

Key-value pair that can be used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

`reference_id`

`string`

A user-generated reference given to the payout. Maximum length is 40 characters. For example, `112233`. You can use this field to store your own transaction ID, if any.

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
-X POST https://api.razorpay.com/v1/fund_accounts/validations \
-H "Content-Type: application/json" \
-d '{
  "source_account_number": "7878780080316316", 
  "validation_type": "optimized", 
  "reference_id": "112233",
  "notes": {
    "random_key_1": "Make it so.",
    "random_key_2": "Tea. Earl Grey. Hot."
  },
  "fund_account": {
    "account_type":"bank_account", 
    "bank_account":{
        "name":"Gaurav Kumar", 
        "ifsc":"HDFC0000053", 
        "account_number":"765432123456789" 
    },
        "contact": {
            "name":"Gaurav Kumar",
            "email":"gaurav.kumar@example.com",
            "contact":"9123456789",
            "type":"employee",
            "reference_id":"Acme Contact ID 12345",
            "notes":{
                "notes_key_1":"Tea, Earl Grey, Hot",
                "notes_key_2":"Tea, Earl Grey... decaf."
            }
        }
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
  "status": "created",
  "utr" : "123456789012",
  "validation_results": {
      "account_status": null,
      "registered_name": null,
      "details": null,
      "name_match_score": null
   },
  "status_details": {
    "description": "Validation request is created",
    "source": "internal",
    "reason": "validation_request_created"
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
          "name":"Gaurav Kumar",
          "email":"gaurav.kumar@example.com",
          "contact":"9123456789",
          "type":"employee",
          "reference_id":"Acme Contact ID 12345",
          "active": true,
          "created_at": 1567064019,
          "notes":{
          "notes_key_1":"Tea, Earl Grey, Hot",
          "notes_key_2":"Tea, Earl Grey... decaf."
          }
      }
  }
}
```
