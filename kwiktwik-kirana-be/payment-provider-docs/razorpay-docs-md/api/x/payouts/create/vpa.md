<!-- Source: https://razorpay.com/docs/api/x/payouts/create/vpa -->

# Create a Payout to a VPA

Copy for AI

View as Markdown

`POST`

`/v1/payouts`

Use this endpoint to create a payout to fund account type `vpa`.

To understand the status of the payouts, refer to [Payout Status Details](/docs/errors/x/payout-status-details/).

**Watch Out!**

Ensure you [allowlist IPs](/docs/x/dashboard/allowlist-ip/) and pass the [idempotency key](/razorpay-docs-md/api/x/payout-idempotency/make-request.md) to make a successful payout.

Sample Code

Request Parameters

Response Parameters

Curl

```bash
curl -u <YOUR_KEY>:<YOUR_SECRET> \
-X POST https://api.razorpay.com/v1/payouts \
-H "Content-Type: application/json" \
-H "X-Payout-Idempotency: 53cda91c-8f81-4e77-bbb9-7388f4ac6bf4" \
-d '{
  "account_number": "7878780080316316",
  "fund_account_id": "fa_00000000000001",
  "amount": 1000000,
  "currency": "INR",
  "mode": "UPI",
  "purpose": "refund",
  "queue_if_low_balance": true,
  "reference_id": "Acme Transaction ID 12345",
  "narration": "Acme Corp Fund Transfer",
  "notes": {
    "notes_key_1":"Tea, Earl Grey, Hot",
    "notes_key_2":"Tea, Earl Grey… decaf."
  }
}'
```

Success

```json
{
  "id": "pout_00000000000001",
  "entity": "payout",
  "fund_account_id": "fa_00000000000001",
  "amount": 1000000,
  "currency": "INR",
  "notes": {
    "notes_key_1":"Tea, Earl Grey, Hot",
    "notes_key_2":"Tea, Earl Grey… decaf."
  },
  "fees": 0,
  "tax": 0,
  "status": "queued",
  "utr": null,
  "mode": "UPI",
  "purpose": "refund",
  "reference_id": "Acme Transaction ID 12345",
  "narration": "Acme Corp Fund Transfer",
  "batch_id": null,
  "status_details": {
    "description": "Payout is queued as there is insufficient balance in your business account to process the payout",
    "source": "business",
    "reason": "low_balance"
    }
  "created_at": 1545383037
}
```

###### Request Parameters

`account_number`

\*

`string`

The account from which you want to make the payout. For example, `7878780080316316`.

- Pass your customer identifier if you want money to be deducted from RazorpayX Lite.
- Pass your Current Account number if you want money to be deducted from your Current Account.

**Watch Out!**

- This is **not** your contact's bank account number. Log in to your [**RazorpayX Dashboard**](https://x.razorpay.com/auth/?intent=current_account)

  and go to **My Account & Settings → Banking → Customer Identifier**.
- This value is different for Test Mode and Live Mode.

`fund_account_id`

\*

`string`

The unique identifier linked to a fund account. For example, `fa_00000000000001`.

`amount`

\*

`integer`

The payout amount, in paise. For example, pass `1000000` to transfer an amount of ₹10,000. Minimum value `100`.
 The value passed here does not include fees and tax. Fees and tax, if any, are deducted from your account balance.

`currency`

\*

`string`

The payout currency. Here, it is `INR`.

`mode`

\*

`string`

The mode to be used to create the payout. Available mode is `UPI`. Ensure you enter the payout modes in upper case as the payout modes are case-sensitive.

`purpose`

\*

`string`

The purpose of the payout that is being created. The following classifications are available in the system by default:

- `refund`
- `cashback`
- `payout`
- `salary`
- `utility bill`
- `vendor bill`

Additional purposes for payouts can be created via the [Dashboard](https://x.razorpay.com/) and then used in the API. However, it is not possible to create a new purpose for the payout via the API.

`queue_if_low_balance`

`boolean`

Possible values:

- `true`: The payout is queued when your business account does not have sufficient balance to process the payout.
- `false` (default): The payout is never queued. The payout fails if your business account does not have sufficient balance to process the payout.

`reference_id`

`string`

A user-generated reference given to the payout. Maximum length is 40 characters. For example, `Acme Transaction ID 12345`. You can use this field to store your own transaction ID, if any.

`narration`

`string`

Maximum length 30 characters. Allowed characters: a-z, A-Z, 0-9 and space. This is a custom note that also appears on the bank statement. If no value is passed for this parameter, it defaults to the Merchant Billing Label.

 Enter the important text in the first 9 characters as banks truncate the rest as per their standards.

`notes`

`array of objects`

Key-value pair that can be used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

###### Response Parameters

`id`

`string`

The unique identifier of the payout. For example, `pout_00000000000001`.

`entity`

`string`

The entity being created. Here, it will be `payout`.

`fund_account_id`

`string`

The unique identifier linked to the fund account. For example, `fa_00000000000001`.

`amount`

`integer`

The payout amount, in paise. For example, if you want to transfer ₹10,000, pass `1000000`. Minimum value `100`.
The value passed here does not include fees and tax. Fees and tax, if any, are deducted from your account balance.

`currency`

`string`

The payout's currency. Here, it is `INR`.

`notes`

`array of objects`

Key-value pair that can be used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

`fees`

`integer`

The fees for the payout. This value is returned only when the payout moves to the `processing` state. For example, `5`.

`tax`

`integer`

The tax that is applicable for the fee being charged. This value is returned only when the payout moves to the `processing` state. For example, `1`.

`status`

`string`

The status of the payout. Possible payout states:

- `queued`
- `pending` (if you have [Approval Workflow](/docs/x/manage-teams/approval-workflow/)

  enabled)
- `rejected` (if you have [Approval Workflow](/docs/x/manage-teams/approval-workflow/)

  enabled)
- `processing`
- `processed`
- `cancelled`
- `reversed`
- `failed`

Know more about [Payout States](/docs/x/payouts/states-life-cycle/) and [Payout Status Details](/docs/errors/x/payout-status-details/).

`utr`

`string`

The unique transaction number linked to a payout. For example, `HDFCN00000000001`.

`mode`

`string`

The mode used to make the payout. Available modes:

- `NEFT`
- `RTGS`
- `IMPS`
- `card`

The payout modes are case-sensitive.

`purpose`

`string`

The purpose of the payout that is being created. The following classifications are available in the system by default:

- `refund`
- `cashback`
- `payout`
- `salary`
- `utility bill`
- `vendor bill`

Additional purposes for payouts can be created via the [Dashboard](https://x.razorpay.com/) and then used in the API. However, it is not possible to create a new purpose for the payout via the API.

`reference_id`

`string`

Maximum length is 40 characters. A user-generated reference given to the payout. For example, `Acme Transaction ID 12345`. You can use this field to store your own transaction ID, if any.

`debit_account_number`

`string`

The account from which the payout was processed. For example, `002281300012871`.

`narration`

`string`

Custom note that also appears on the bank statement. Maximum length 30 characters. Allowed characters: `a-z`, `A-Z`, `0-9` and space.

 If no value is passed for this parameter, it defaults to the Merchant Billing Label. Ensure that the most important text forms the first 9 characters as banks may truncate the rest as per their standards.

`batch_id`

`string`

This value is returned if the contact was created as part of a bulk upload. For example, `batch_00000000000001`.

`status_details`

`object`

This parameter returns the current status of the payout. For example, `IMPS is not enabled on beneficiary account, Retry with different mode.`

Show child parameters (3)

`created_at`

`integer`

Indicates the Unix timestamp when this payout was created.

`fee_type`

`string`

Indicates the fee type charged for the payout. Possible values is `free_payout`.

# Create a Payout to a VPA

Copy for AI

View as Markdown

`POST`

`/v1/payouts`

Use this endpoint to create a payout to fund account type `vpa`.

To understand the status of the payouts, refer to [Payout Status Details](/docs/errors/x/payout-status-details/).

**Watch Out!**

Ensure you [allowlist IPs](/docs/x/dashboard/allowlist-ip/) and pass the [idempotency key](/razorpay-docs-md/api/x/payout-idempotency/make-request.md) to make a successful payout.

Request Parameters

Response Parameters

###### Request Parameters

`account_number`

\*

`string`

The account from which you want to make the payout. For example, `7878780080316316`.

- Pass your customer identifier if you want money to be deducted from RazorpayX Lite.
- Pass your Current Account number if you want money to be deducted from your Current Account.

**Watch Out!**

- This is **not** your contact's bank account number. Log in to your [**RazorpayX Dashboard**](https://x.razorpay.com/auth/?intent=current_account)

  and go to **My Account & Settings → Banking → Customer Identifier**.
- This value is different for Test Mode and Live Mode.

`fund_account_id`

\*

`string`

The unique identifier linked to a fund account. For example, `fa_00000000000001`.

`amount`

\*

`integer`

The payout amount, in paise. For example, pass `1000000` to transfer an amount of ₹10,000. Minimum value `100`.
 The value passed here does not include fees and tax. Fees and tax, if any, are deducted from your account balance.

`currency`

\*

`string`

The payout currency. Here, it is `INR`.

`mode`

\*

`string`

The mode to be used to create the payout. Available mode is `UPI`. Ensure you enter the payout modes in upper case as the payout modes are case-sensitive.

`purpose`

\*

`string`

The purpose of the payout that is being created. The following classifications are available in the system by default:

- `refund`
- `cashback`
- `payout`
- `salary`
- `utility bill`
- `vendor bill`

Additional purposes for payouts can be created via the [Dashboard](https://x.razorpay.com/) and then used in the API. However, it is not possible to create a new purpose for the payout via the API.

`queue_if_low_balance`

`boolean`

Possible values:

- `true`: The payout is queued when your business account does not have sufficient balance to process the payout.
- `false` (default): The payout is never queued. The payout fails if your business account does not have sufficient balance to process the payout.

`reference_id`

`string`

A user-generated reference given to the payout. Maximum length is 40 characters. For example, `Acme Transaction ID 12345`. You can use this field to store your own transaction ID, if any.

`narration`

`string`

Maximum length 30 characters. Allowed characters: a-z, A-Z, 0-9 and space. This is a custom note that also appears on the bank statement. If no value is passed for this parameter, it defaults to the Merchant Billing Label.

 Enter the important text in the first 9 characters as banks truncate the rest as per their standards.

`notes`

`array of objects`

Key-value pair that can be used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

###### Response Parameters

`id`

`string`

The unique identifier of the payout. For example, `pout_00000000000001`.

`entity`

`string`

The entity being created. Here, it will be `payout`.

`fund_account_id`

`string`

The unique identifier linked to the fund account. For example, `fa_00000000000001`.

`amount`

`integer`

The payout amount, in paise. For example, if you want to transfer ₹10,000, pass `1000000`. Minimum value `100`.
The value passed here does not include fees and tax. Fees and tax, if any, are deducted from your account balance.

`currency`

`string`

The payout's currency. Here, it is `INR`.

`notes`

`array of objects`

Key-value pair that can be used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

`fees`

`integer`

The fees for the payout. This value is returned only when the payout moves to the `processing` state. For example, `5`.

`tax`

`integer`

The tax that is applicable for the fee being charged. This value is returned only when the payout moves to the `processing` state. For example, `1`.

`status`

`string`

The status of the payout. Possible payout states:

- `queued`
- `pending` (if you have [Approval Workflow](/docs/x/manage-teams/approval-workflow/)

  enabled)
- `rejected` (if you have [Approval Workflow](/docs/x/manage-teams/approval-workflow/)

  enabled)
- `processing`
- `processed`
- `cancelled`
- `reversed`
- `failed`

Know more about [Payout States](/docs/x/payouts/states-life-cycle/) and [Payout Status Details](/docs/errors/x/payout-status-details/).

`utr`

`string`

The unique transaction number linked to a payout. For example, `HDFCN00000000001`.

`mode`

`string`

The mode used to make the payout. Available modes:

- `NEFT`
- `RTGS`
- `IMPS`
- `card`

The payout modes are case-sensitive.

`purpose`

`string`

The purpose of the payout that is being created. The following classifications are available in the system by default:

- `refund`
- `cashback`
- `payout`
- `salary`
- `utility bill`
- `vendor bill`

Additional purposes for payouts can be created via the [Dashboard](https://x.razorpay.com/) and then used in the API. However, it is not possible to create a new purpose for the payout via the API.

`reference_id`

`string`

Maximum length is 40 characters. A user-generated reference given to the payout. For example, `Acme Transaction ID 12345`. You can use this field to store your own transaction ID, if any.

`debit_account_number`

`string`

The account from which the payout was processed. For example, `002281300012871`.

`narration`

`string`

Custom note that also appears on the bank statement. Maximum length 30 characters. Allowed characters: `a-z`, `A-Z`, `0-9` and space.

 If no value is passed for this parameter, it defaults to the Merchant Billing Label. Ensure that the most important text forms the first 9 characters as banks may truncate the rest as per their standards.

`batch_id`

`string`

This value is returned if the contact was created as part of a bulk upload. For example, `batch_00000000000001`.

`status_details`

`object`

This parameter returns the current status of the payout. For example, `IMPS is not enabled on beneficiary account, Retry with different mode.`

Show child parameters (3)

`created_at`

`integer`

Indicates the Unix timestamp when this payout was created.

`fee_type`

`string`

Indicates the fee type charged for the payout. Possible values is `free_payout`.

Curl

```bash
curl -u <YOUR_KEY>:<YOUR_SECRET> \
-X POST https://api.razorpay.com/v1/payouts \
-H "Content-Type: application/json" \
-H "X-Payout-Idempotency: 53cda91c-8f81-4e77-bbb9-7388f4ac6bf4" \
-d '{
  "account_number": "7878780080316316",
  "fund_account_id": "fa_00000000000001",
  "amount": 1000000,
  "currency": "INR",
  "mode": "UPI",
  "purpose": "refund",
  "queue_if_low_balance": true,
  "reference_id": "Acme Transaction ID 12345",
  "narration": "Acme Corp Fund Transfer",
  "notes": {
    "notes_key_1":"Tea, Earl Grey, Hot",
    "notes_key_2":"Tea, Earl Grey… decaf."
  }
}'
```

Success

```json
{
  "id": "pout_00000000000001",
  "entity": "payout",
  "fund_account_id": "fa_00000000000001",
  "amount": 1000000,
  "currency": "INR",
  "notes": {
    "notes_key_1":"Tea, Earl Grey, Hot",
    "notes_key_2":"Tea, Earl Grey… decaf."
  },
  "fees": 0,
  "tax": 0,
  "status": "queued",
  "utr": null,
  "mode": "UPI",
  "purpose": "refund",
  "reference_id": "Acme Transaction ID 12345",
  "narration": "Acme Corp Fund Transfer",
  "batch_id": null,
  "status_details": {
    "description": "Payout is queued as there is insufficient balance in your business account to process the payout",
    "source": "business",
    "reason": "low_balance"
    }
  "created_at": 1545383037
}
```
