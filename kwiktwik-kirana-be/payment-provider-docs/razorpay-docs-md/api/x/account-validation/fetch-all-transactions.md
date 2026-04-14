<!-- Source: https://razorpay.com/docs/api/x/account-validation/fetch-all-transactions -->

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
      "fund_account":{
        "id": "fa_00000000000001",
        "entity": "fund_account",
        "contact_id":"cont_00000000000001",
        "account_type": "bank_account",
        "bank_account":{
          "name": "Gaurav Kumar",
          "bank_name": "HDFC",
          "ifsc": "HDFC0000053",
          "account_number": "765432123456789"
        },
        "batch_id": null,
        "active": true,
        "created_at": 1567064019
      },
      "status": "completed",
      "amount": 100,
      "currency": "INR",
      "notes":{
        "random_key_1": "Make it so.",
        "random_key_2": "Tea. Earl Grey. Hot."
      },
      "results":{
        "account_status": "active",
        "registered_name": "Gaurav Kumar"
      },
      "created_at": 1547566278,
      "utr": "XXXXR7310682908954385XX"
    },
    {
      "id":"fav_00000000000002",
      "entity":"fund_account.validation",
      "fund_account":{
        "id":"fa_00000000000002",
        "entity":"fund_account",
        "contact_id":"cont_00000000000001",
        "account_type":"vpa",
        "vpa":{
          "username": "gaurav.kumar",
          "handle": "exampleupi",
          "address":"gaurav.kumar@exampleupi"
        },
        "batch_id": null,
        "active":true,
        "created_at":1573110860
      },
      "status":"completed",
      "amount":null,
      "currency":null,
      "notes":{
        "random_key_1":"Make it so.",
        "random_key_2":"Tea. Earl Grey. Hot."
      },
      "results":{
        "account_status":"active",
        "registered_name":"Gaurav Kumar"
      },
      "created_at":1574244676,
      "utr": null
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
- This is an alphanumeric or numeric value.

`from`

`integer`

Timestamp in Unix from when you want to fetch payouts.

`to`

`integer`

Timestamp in Unix till when you want to fetch payouts.

`count`

`integer`

Number of payouts to be fetched. Default value is `10`. Maximum value is `100`. This can be used for pagination, in combination with `skip`.

`skip`

`integer`

Numbers of payouts to be skipped. Default value is `0`. This can be used for pagination, in combination with `count`.

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
- This is an alphanumeric or numeric value.

`from`

`integer`

Timestamp in Unix from when you want to fetch payouts.

`to`

`integer`

Timestamp in Unix till when you want to fetch payouts.

`count`

`integer`

Number of payouts to be fetched. Default value is `10`. Maximum value is `100`. This can be used for pagination, in combination with `skip`.

`skip`

`integer`

Numbers of payouts to be skipped. Default value is `0`. This can be used for pagination, in combination with `count`.

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
      "fund_account":{
        "id": "fa_00000000000001",
        "entity": "fund_account",
        "contact_id":"cont_00000000000001",
        "account_type": "bank_account",
        "bank_account":{
          "name": "Gaurav Kumar",
          "bank_name": "HDFC",
          "ifsc": "HDFC0000053",
          "account_number": "765432123456789"
        },
        "batch_id": null,
        "active": true,
        "created_at": 1567064019
      },
      "status": "completed",
      "amount": 100,
      "currency": "INR",
      "notes":{
        "random_key_1": "Make it so.",
        "random_key_2": "Tea. Earl Grey. Hot."
      },
      "results":{
        "account_status": "active",
        "registered_name": "Gaurav Kumar"
      },
      "created_at": 1547566278,
      "utr": "XXXXR7310682908954385XX"
    },
    {
      "id":"fav_00000000000002",
      "entity":"fund_account.validation",
      "fund_account":{
        "id":"fa_00000000000002",
        "entity":"fund_account",
        "contact_id":"cont_00000000000001",
        "account_type":"vpa",
        "vpa":{
          "username": "gaurav.kumar",
          "handle": "exampleupi",
          "address":"gaurav.kumar@exampleupi"
        },
        "batch_id": null,
        "active":true,
        "created_at":1573110860
      },
      "status":"completed",
      "amount":null,
      "currency":null,
      "notes":{
        "random_key_1":"Make it so.",
        "random_key_2":"Tea. Earl Grey. Hot."
      },
      "results":{
        "account_status":"active",
        "registered_name":"Gaurav Kumar"
      },
      "created_at":1574244676,
      "utr": null
    }
  ]
}
```
