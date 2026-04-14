<!-- Source: https://razorpay.com/docs/api/payments/smart-collect-tpv/delete-allowed-payer -->

# Delete an Allowed Payer With TPV

`DELETE`

`/v1/virtual_accounts/:va_id/allowed_payers/:id`

Use this endpoint to delete the allowed payer's account details added to a Customer Identifier. You can delete one account detail in a single request.

Sample Code

Path Parameters

2

Request Parameters

Errors

Curl

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X DELETE https://api.razorpay.com/v1/virtual_accounts/va_DlGmm7jInLudH9/allowed_payers/ba_DlGmm9mSj8fjRM \
```

Response

```json
null
```

###### Path Parameters

`va_id`

\*

`string`

The unique identifier of the Customer Identifier from which the `allowed_payers` account details should be deleted.

`id`

\*

`string`

The unique identifier of the `allowed_payers` account that has to be deleted.

###### Request Parameters

`type`

\*

`string`

The type of account. Possible value is `bank_account`.

`bank_account`

\*

`object`

Indicates the bank account details such as `ifsc` and `account_number`.

Show child parameters (2)

###### Errors

Account validation is only applicable on bank account as a receiver type

Error Status: 400

This error occurs when you try to add an allowed payer account on a Customer Identifier with VPA added as a receiver (with or without a Bank account).

Solution

Only 10 allowed payer accounts can be added.

Error Status: 400

This error occurs when you try to add new allowed payer accounts when the overall `allowed_payers` limit is exceeded. You can only add up to 10 allowed payer accounts.

Solution

The bank account.account number field is required when bank account is present.

Error Status: 400

This error occurs when you do not pass the bank account number in the request.

Solution

Payer detail already exist for virtual account.

Error Status: 400

This error occurs when you try to add a duplicate allowed payer's account with the same IFSC and account number that already exists.

Solution

# Delete an Allowed Payer With TPV

`DELETE`

`/v1/virtual_accounts/:va_id/allowed_payers/:id`

Use this endpoint to delete the allowed payer's account details added to a Customer Identifier. You can delete one account detail in a single request.

Path Parameters

2

Request Parameters

Errors

###### Path Parameters

`va_id`

\*

`string`

The unique identifier of the Customer Identifier from which the `allowed_payers` account details should be deleted.

`id`

\*

`string`

The unique identifier of the `allowed_payers` account that has to be deleted.

###### Request Parameters

`type`

\*

`string`

The type of account. Possible value is `bank_account`.

`bank_account`

\*

`object`

Indicates the bank account details such as `ifsc` and `account_number`.

Show child parameters (2)

###### Errors

Account validation is only applicable on bank account as a receiver type

Error Status: 400

This error occurs when you try to add an allowed payer account on a Customer Identifier with VPA added as a receiver (with or without a Bank account).

Solution

Only 10 allowed payer accounts can be added.

Error Status: 400

This error occurs when you try to add new allowed payer accounts when the overall `allowed_payers` limit is exceeded. You can only add up to 10 allowed payer accounts.

Solution

The bank account.account number field is required when bank account is present.

Error Status: 400

This error occurs when you do not pass the bank account number in the request.

Solution

Payer detail already exist for virtual account.

Error Status: 400

This error occurs when you try to add a duplicate allowed payer's account with the same IFSC and account number that already exists.

Solution

Curl

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X DELETE https://api.razorpay.com/v1/virtual_accounts/va_DlGmm7jInLudH9/allowed_payers/ba_DlGmm9mSj8fjRM \
```

Response

```json
null
```
