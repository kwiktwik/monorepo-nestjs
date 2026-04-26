<!-- Source: https://razorpay.com/docs/api/x/composite-account-validation/fetch-all-transactions -->

# Fetch All Account Validation Transactions

`GET`

`/v1/fund_accounts/validations?account_number={account number}`

Use this endpoint to retrieve the details of all Fund Account Validation transactions you have made.

Sample Code

Query Parameters

5

Response Parameters

Curl

```bash
curl -u <YOUR_KEY>:<YOUR_SECRET> \
    -X GET https://api.razorpay.com/v1/fund_accounts/validations?account_number=7878780080316316
```

Success

```json
{
  "entity":"collection",
  "count":2,
  "items":[
    {
     "id": "fav_00000000000001",
     "entity": "fund_account.validation",
     "status": "completed",
     "validation_results": {
        "account_status": "active",
        "registered_name": "Gaurav Kumar",
        "details": "The beneficiary account is valid." ,
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
    },
    {
     "id": "fav_00000000000002",
     "entity": "fund_account.validation",
     "status": "completed",
     "validation_results": {
        "account_status": "active",
        "registered_name": "Gauri Kumari",
        "details": "The beneficiary account is valid." ,
        "name_match_score": 100
        },
    "status_details": {
        "description": "Validation request is completed",
        "source": "beneficiary_bank",
        "reason": "validation_completed"
        },
    "reference_id": "112244",
    "notes": {
        "random_key_1": "Make it so.",
        "random_key_2": "Tea. Earl Grey. Hot."
    },
    "fund_account": {
        "id": "fa_00000000000002",
        "entity": "fund_account",
        "account_type": "bank_account",
        "bank_account": {
            "name": "Gauri Kumari",
            "bank_name": "HDFC",
            "ifsc": "HDFC0000054",
            "account_number": "765432123456798"
        },
        "active": true,
        "created_at": 1567064019,
        "contact": {
            "id": "cont_00000000000002",
            "entity": "contact",
            "name":"Gauri Kumari",
            "email":"gauri.kumari@example.com",
            "contact":"9999999999",
            "type":"employee",
            "reference_id":"Acme Contact ID 12354",
            "active": true,
            "created_at": 1567064120,
            "notes":{
            "notes_key_1":"Tea, Earl Grey, Hot",
            "notes_key_2":"Tea, Earl Grey... decaf."
                }
            }
        }
    }
  ]
}
```

###### Query Parameters

`account_number`

\*

`string`

The account that was used to debit money for validation transaction.
Account details can be found on the RazorpayX Dashboard. For example, `7878780080316316`.

- Pass your Customer Identifier (RazorpayX Lite number) if money was deducted from RazorpayX Lite.
- Pass your Current Account number if money was deducted from your Current Account.
- This is an alphanumeric or numeric value.

**Watch Out!**

- Log in to your [**RazorpayX Dashboard**](https://x.razorpay.com/auth/?intent=current_account)

  and go to **My Account & Settings → Banking → Customer Identifier**.
- This value is different for Test Mode and Live Mode.

`from`

`integer`

Timestamp in Unix from when you want to fetch payouts.

`to`

`integer`

Timestamp in Unix till when you want to fetch payouts.

`count`

`integer`

Number of payouts to be retrieved. Default value is `10`. Maximum value is `100`. This can be used for pagination, in combination with `skip`.

`skip`

`integer`

Number of payouts to be skipped. Default value is `0`. This can be used for pagination, in combination with `count`.

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

# Fetch All Account Validation Transactions

`GET`

`/v1/fund_accounts/validations?account_number={account number}`

Use this endpoint to retrieve the details of all Fund Account Validation transactions you have made.

Query Parameters

5

Response Parameters

###### Query Parameters

`account_number`

\*

`string`

The account that was used to debit money for validation transaction.
Account details can be found on the RazorpayX Dashboard. For example, `7878780080316316`.

- Pass your Customer Identifier (RazorpayX Lite number) if money was deducted from RazorpayX Lite.
- Pass your Current Account number if money was deducted from your Current Account.
- This is an alphanumeric or numeric value.

**Watch Out!**

- Log in to your [**RazorpayX Dashboard**](https://x.razorpay.com/auth/?intent=current_account)

  and go to **My Account & Settings → Banking → Customer Identifier**.
- This value is different for Test Mode and Live Mode.

`from`

`integer`

Timestamp in Unix from when you want to fetch payouts.

`to`

`integer`

Timestamp in Unix till when you want to fetch payouts.

`count`

`integer`

Number of payouts to be retrieved. Default value is `10`. Maximum value is `100`. This can be used for pagination, in combination with `skip`.

`skip`

`integer`

Number of payouts to be skipped. Default value is `0`. This can be used for pagination, in combination with `count`.

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
    -X GET https://api.razorpay.com/v1/fund_accounts/validations?account_number=7878780080316316
```

Success

```json
{
  "entity":"collection",
  "count":2,
  "items":[
    {
     "id": "fav_00000000000001",
     "entity": "fund_account.validation",
     "status": "completed",
     "validation_results": {
        "account_status": "active",
        "registered_name": "Gaurav Kumar",
        "details": "The beneficiary account is valid." ,
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
    },
    {
     "id": "fav_00000000000002",
     "entity": "fund_account.validation",
     "status": "completed",
     "validation_results": {
        "account_status": "active",
        "registered_name": "Gauri Kumari",
        "details": "The beneficiary account is valid." ,
        "name_match_score": 100
        },
    "status_details": {
        "description": "Validation request is completed",
        "source": "beneficiary_bank",
        "reason": "validation_completed"
        },
    "reference_id": "112244",
    "notes": {
        "random_key_1": "Make it so.",
        "random_key_2": "Tea. Earl Grey. Hot."
    },
    "fund_account": {
        "id": "fa_00000000000002",
        "entity": "fund_account",
        "account_type": "bank_account",
        "bank_account": {
            "name": "Gauri Kumari",
            "bank_name": "HDFC",
            "ifsc": "HDFC0000054",
            "account_number": "765432123456798"
        },
        "active": true,
        "created_at": 1567064019,
        "contact": {
            "id": "cont_00000000000002",
            "entity": "contact",
            "name":"Gauri Kumari",
            "email":"gauri.kumari@example.com",
            "contact":"9999999999",
            "type":"employee",
            "reference_id":"Acme Contact ID 12354",
            "active": true,
            "created_at": 1567064120,
            "notes":{
            "notes_key_1":"Tea, Earl Grey, Hot",
            "notes_key_2":"Tea, Earl Grey... decaf."
                }
            }
        }
    }
  ]
}
```
