<!-- Source: https://razorpay.com/docs/api/x/account-validation/balance-fetch -->

# Fetch Account Balances

`GET`

`/v1/banking_balances`

Use this endpoint to retrieve the balances of all accounts.

Sample Code

Query Parameters

4

Response Parameters

Errors

Curl

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X GET https://api.razorpay.com/v1/banking_balances
```

Success

Failure

```json
{
  "entity": "collection",
  "count": 4,
  "items": [
    {
      "entity": "banking_balance",
      "currency": "INR",
      "account_number": "409001396356",
      "account_type": "current_account",
      "bank_name": "RBL Bank",
      "bank_code": "RATN",
      "amount": 186682638,
      "available_amount": 186682638,
      "refreshed_at": 1721889110
    },
    {
      "entity": "banking_balance",
      "currency": "INR",
      "account_number": "002281300049209",
      "account_type": "current_account",
      "bank_name": "Yes Bank",
      "bank_code": "YESB",
      "amount": 10489829,
      "available_amount": 186682638,
      "refreshed_at": 1696419847
    },
    {
      "entity": "banking_balance",
      "currency": "INR",
      "account_number": "002281300012871",
      "account_type": "fixed_deposit",
      "bank_name": "Yes Bank",
      "bank_code": "YESB",
      "amount": 10489829,
      "available_amount": 186682638,
      "refreshed_at": 1696419847
    },
    {
      "entity": "banking_balance",
      "currency": "INR",
      "account_number": "984539953520846",
      "account_type": "razorpayx_lite",
      "bank_name": null,
      "bank": null,
      "amount": 1029,
      "available_amount": 1029,
      "refreshed_at": 1729847660
    }
  ]
}
```

###### Query Parameters

`account_type`

`string`

Filters account based on type. Possible values are `current_account` or `razorpayx_lite`. The parameter is case sensitive.

- `current_account`: Current Accounts and Escrow Accounts
- `razorpayx_lite`: RazorpayX Lite Accounts

`bank_code`

`string`

Filters based on bank name. This should be the first four characters of IFSC for any bank.
For example, `RATN`or `YESB`. The parameter is case sensitive.

`count`

`integer`

Number of accounts to be fetched based on the most recently refreshed balance.
This can be used for pagination, in combination with skip.

- Default value : `10`
- Maximum value : `100`

`skip`

`integer`

Numbers of balances to be skipped. This can be used for pagination, in combination with count.
Default value is `0`.

###### Response Parameters

`entity`

`string`

The entity being returned. For example, `banking_balance`.

`count`

`integer`

Count of items being returned. For example `2`.

`items`

`object`

Array of all accounts and their balances.

`currency`

`string`

Returns the currency in which the balance amount is relayed. For example, `INR`.

`amount`

`long`

The total INR balance amount in paise. For example, `6358629`.

`account_number`

`string`

Associated account number. For example, `123456789281`.

`account_type`

`string`

Returns associated account type. For example, `current_account`.

`bank_name`

`string`

Returns the full name of the bank.
For example `YESB`.

`bank_code`

`string`

Returns bank code. This will be the first four characters of IFSC for any bank.
For example `YESB`.

`refreshed_at`

`long`

The latest timestamp of Razorpay fetching balance from the bank in epoch format. For example `1729847660`.

`available_amount`

`long`

The net withdrawable INR balance amount in paise. This will deduct any lien balance and include any OD balance on the account. For example, `6358629`.

###### Errors

The selected account type is invalid

Error Status: 400

Query parameter `account_type` is incorrectly passed.

Solution

Invalid channel name: rbl

Error Status: 400

Query parameter `bank_code` is incorrectly passed.

Solution

The count may not be greater than 100

Error Status: 400

The `count` passed in the query parameter is greater than 100.

Solution

The count must be an integer

Error Status: 400

The `count` passed in the query parameter is not an integer

Solution

Authentication failed

Error Status: 401

Incorrect Key or Secret.

Solution

Throttling Error

Error Status: 429

The server is processing too many requests at once and is unable to process your request.

Solution

We are facing some trouble completing your request at the moment. Please try again shortly.

Error Status: 500

Internal Server Error. The server has encountered a situation it does not know how to handle.

Solution

Bad Gateway

Error Status: 502

The server got an invalid response while working as a gateway to get a response needed to handle the request.

Solution

Service Unavailable

Error Status: 503

The server is not ready to handle the request. Common causes are a server that is down for maintenance or is overloaded.

Solution

Gateway Timeout

Error Status: 504

This error response is given when the server acts as a gateway and cannot get a timely response.

Solution

# Fetch Account Balances

`GET`

`/v1/banking_balances`

Use this endpoint to retrieve the balances of all accounts.

Query Parameters

4

Response Parameters

Errors

###### Query Parameters

`account_type`

`string`

Filters account based on type. Possible values are `current_account` or `razorpayx_lite`. The parameter is case sensitive.

- `current_account`: Current Accounts and Escrow Accounts
- `razorpayx_lite`: RazorpayX Lite Accounts

`bank_code`

`string`

Filters based on bank name. This should be the first four characters of IFSC for any bank.
For example, `RATN`or `YESB`. The parameter is case sensitive.

`count`

`integer`

Number of accounts to be fetched based on the most recently refreshed balance.
This can be used for pagination, in combination with skip.

- Default value : `10`
- Maximum value : `100`

`skip`

`integer`

Numbers of balances to be skipped. This can be used for pagination, in combination with count.
Default value is `0`.

###### Response Parameters

`entity`

`string`

The entity being returned. For example, `banking_balance`.

`count`

`integer`

Count of items being returned. For example `2`.

`items`

`object`

Array of all accounts and their balances.

`currency`

`string`

Returns the currency in which the balance amount is relayed. For example, `INR`.

`amount`

`long`

The total INR balance amount in paise. For example, `6358629`.

`account_number`

`string`

Associated account number. For example, `123456789281`.

`account_type`

`string`

Returns associated account type. For example, `current_account`.

`bank_name`

`string`

Returns the full name of the bank.
For example `YESB`.

`bank_code`

`string`

Returns bank code. This will be the first four characters of IFSC for any bank.
For example `YESB`.

`refreshed_at`

`long`

The latest timestamp of Razorpay fetching balance from the bank in epoch format. For example `1729847660`.

`available_amount`

`long`

The net withdrawable INR balance amount in paise. This will deduct any lien balance and include any OD balance on the account. For example, `6358629`.

###### Errors

The selected account type is invalid

Error Status: 400

Query parameter `account_type` is incorrectly passed.

Solution

Invalid channel name: rbl

Error Status: 400

Query parameter `bank_code` is incorrectly passed.

Solution

The count may not be greater than 100

Error Status: 400

The `count` passed in the query parameter is greater than 100.

Solution

The count must be an integer

Error Status: 400

The `count` passed in the query parameter is not an integer

Solution

Authentication failed

Error Status: 401

Incorrect Key or Secret.

Solution

Throttling Error

Error Status: 429

The server is processing too many requests at once and is unable to process your request.

Solution

We are facing some trouble completing your request at the moment. Please try again shortly.

Error Status: 500

Internal Server Error. The server has encountered a situation it does not know how to handle.

Solution

Bad Gateway

Error Status: 502

The server got an invalid response while working as a gateway to get a response needed to handle the request.

Solution

Service Unavailable

Error Status: 503

The server is not ready to handle the request. Common causes are a server that is down for maintenance or is overloaded.

Solution

Gateway Timeout

Error Status: 504

This error response is given when the server acts as a gateway and cannot get a timely response.

Solution

Curl

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X GET https://api.razorpay.com/v1/banking_balances
```

Success

Failure

```json
{
  "entity": "collection",
  "count": 4,
  "items": [
    {
      "entity": "banking_balance",
      "currency": "INR",
      "account_number": "409001396356",
      "account_type": "current_account",
      "bank_name": "RBL Bank",
      "bank_code": "RATN",
      "amount": 186682638,
      "available_amount": 186682638,
      "refreshed_at": 1721889110
    },
    {
      "entity": "banking_balance",
      "currency": "INR",
      "account_number": "002281300049209",
      "account_type": "current_account",
      "bank_name": "Yes Bank",
      "bank_code": "YESB",
      "amount": 10489829,
      "available_amount": 186682638,
      "refreshed_at": 1696419847
    },
    {
      "entity": "banking_balance",
      "currency": "INR",
      "account_number": "002281300012871",
      "account_type": "fixed_deposit",
      "bank_name": "Yes Bank",
      "bank_code": "YESB",
      "amount": 10489829,
      "available_amount": 186682638,
      "refreshed_at": 1696419847
    },
    {
      "entity": "banking_balance",
      "currency": "INR",
      "account_number": "984539953520846",
      "account_type": "razorpayx_lite",
      "bank_name": null,
      "bank": null,
      "amount": 1029,
      "available_amount": 1029,
      "refreshed_at": 1729847660
    }
  ]
}
```
