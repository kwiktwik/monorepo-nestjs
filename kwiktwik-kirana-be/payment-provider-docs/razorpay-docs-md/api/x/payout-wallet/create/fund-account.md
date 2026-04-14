<!-- Source: https://razorpay.com/docs/api/x/payout-wallet/create/fund-account -->

# Create a Fund Account of Type Wallet

`POST`

`/v1/fund-accounts/`

Use this endpoint to create a Fund Account of the type `wallet`. A new Fund Account is created if any combination of the following details is unique: `contact_id`, `wallet.phone.number`, `wallet.phone.country_code`, and `wallet.email`.

- If **all** the above details match the details of an existing Fund Account, the API returns details of the existing Fund Account.
- You cannot edit the details of a Fund Account.

Sample Code

Request Parameters

Response Parameters

Curl

```bash
curl -u <YOUR_KEY_ID>:<YOUR_KEY_SECRET> \
-X POST https://api.razorpay.com/v1/fund_accounts \
-H "Content-Type: application/json" \
-d '{
  "contact_id": "cont_00000000000001",
  "account_type": "wallet",
  "wallet": {
    "provider": "amazonpay",
    "phone": "+919876543210",
    "email": "gaurav.kumar@example.com",
    "name": "Gaurav Kumar"
  }
}'
```

Success

```json
{
  "id": "fa_00000000000001",
  "entity": "fund_account",
  "contact_id": "cont_00000000000001",
  "account_type": "wallet",
  "wallet": {
    "provider": "amazonpay",
    "phone": "+919876543210",
    "email": "gaurav.kumar@example.com",
    "name": "Gaurav Kumar"
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

The unique identifier linked to a contact. For example, `cont_00000000000001`.

`account_type`

\*

`string`

The account type you want to link to the contact ID. Here, it is `wallet`.

`wallet`

\*

`object`

The contact's wallet details.

Show child parameters (4)

###### Response Parameters

`id`

`string`

The unique identifier linked to the fund account. For example, `fa_00000000000001`.

`entity`

`string`

Here it will be `fund_account`.

`contact_id`

`string`

The unique identifier linked to the contact. For example, `cont_00000000000001`.

`account_type`

`string`

The fund account type created. Here it is `wallet`.

`wallet`

`object`

The contact's wallet details.

Show child parameters (4)

`active`

`boolean`

Possible values:

- `true`: active
- `false`: inactive

`batch_id`

`string`

This parameter is populated if the fund account was created as part of a bulk upload. For example, `batch_00000000000001`.

`created_at`

`integer`

Timestamp, in Unix, when the fund account was created. For example, `1545320320`.

# Create a Fund Account of Type Wallet

`POST`

`/v1/fund-accounts/`

Use this endpoint to create a Fund Account of the type `wallet`. A new Fund Account is created if any combination of the following details is unique: `contact_id`, `wallet.phone.number`, `wallet.phone.country_code`, and `wallet.email`.

- If **all** the above details match the details of an existing Fund Account, the API returns details of the existing Fund Account.
- You cannot edit the details of a Fund Account.

Request Parameters

Response Parameters

###### Request Parameters

`contact_id`

\*

`string`

The unique identifier linked to a contact. For example, `cont_00000000000001`.

`account_type`

\*

`string`

The account type you want to link to the contact ID. Here, it is `wallet`.

`wallet`

\*

`object`

The contact's wallet details.

Show child parameters (4)

###### Response Parameters

`id`

`string`

The unique identifier linked to the fund account. For example, `fa_00000000000001`.

`entity`

`string`

Here it will be `fund_account`.

`contact_id`

`string`

The unique identifier linked to the contact. For example, `cont_00000000000001`.

`account_type`

`string`

The fund account type created. Here it is `wallet`.

`wallet`

`object`

The contact's wallet details.

Show child parameters (4)

`active`

`boolean`

Possible values:

- `true`: active
- `false`: inactive

`batch_id`

`string`

This parameter is populated if the fund account was created as part of a bulk upload. For example, `batch_00000000000001`.

`created_at`

`integer`

Timestamp, in Unix, when the fund account was created. For example, `1545320320`.

Curl

```bash
curl -u <YOUR_KEY_ID>:<YOUR_KEY_SECRET> \
-X POST https://api.razorpay.com/v1/fund_accounts \
-H "Content-Type: application/json" \
-d '{
  "contact_id": "cont_00000000000001",
  "account_type": "wallet",
  "wallet": {
    "provider": "amazonpay",
    "phone": "+919876543210",
    "email": "gaurav.kumar@example.com",
    "name": "Gaurav Kumar"
  }
}'
```

Success

```json
{
  "id": "fa_00000000000001",
  "entity": "fund_account",
  "contact_id": "cont_00000000000001",
  "account_type": "wallet",
  "wallet": {
    "provider": "amazonpay",
    "phone": "+919876543210",
    "email": "gaurav.kumar@example.com",
    "name": "Gaurav Kumar"
  },
  "active": true,
  "batch_id": null,
  "created_at": 1543650891
}
```
