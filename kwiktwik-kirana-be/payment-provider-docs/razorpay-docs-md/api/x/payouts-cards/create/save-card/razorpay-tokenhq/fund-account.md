<!-- Source: https://razorpay.com/docs/api/x/payouts-cards/create/save-card/razorpay-tokenhq/fund-account -->

# Create a Fund Account for Card with Razorpay TokenHQ

`POST`

`/v1/fund_accounts`

Use this endpoint to create a fund account type `card` by saving the card with [Razorpay TokenHQ](/razorpay-docs-md/payment-methods/cards/token-hq/razorpay-requestor-with-network-tokens.md).

Sample Code

Request Parameters

Response Parameters

Curl

```bash
curl -u <YOUR_KEY>:<YOUR_SECRET> \
-X POST https://api.razorpay.com/v1/fund_accounts \
-H "Content-Type: application/json" \
-d '{
  "contact_id": "cont_00000000000001",
  "account_type": "card",
  "card": {
    "token_id": "token_4lsdksD31GaZ09",
    "input_type": "razorpay_token",
    "token_provider": "razorpay"
  }
}'
```

Success

```json
{
  "id": "fa_00000000000001",
  "entity": "fund_account",
  "contact_id": "cont_00000000000001",
  "account_type": "card",
  "card": {
    "last4": "8430",
    "network": "Visa",
    "type": "credit",
    "issuer": "HDFC",
    "input_type": "razorpay_token",
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

The unique identifier of the contact for which you want to fetch payouts. For example, `cont_00000000000001`.

`account_type`

\*

`string`

The type of account linked to the contact id. Here, it will be `card`.

`card`

\*

`object`

The details of the card used.

Show child parameters (3)

###### Response Parameters

`id`

`string`

The unique identifier linked to the payout. For example, `pout_00000000000001`.

`entity`

`string`

The entity being created. For example, `payout`.

`fund_account_id`

`string`

The unique identifier linked to the fund account. For example, `fa_00000000000001`.

`fund_account`

`object`

The account to which you want to make the payout.

Show child parameters (5)

`amount`

`integer`

The payout amount, in paise. For example, if you want to transfer ₹10,000, pass `1000000`. Minimum value `100`.

 The value passed here does not include fees and tax. Fees and tax, if any, are deducted from your account balance.

`currency`

`string`

The payout currency. Here, it is `INR`.

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

`purpose`

`string`

The purpose of the payout that is being created. The following classifications are available in the system by default:

- `refund`
- `cashback`
- `payout`
- `salary`
- `utility bill`
- `vendor bill`

`utr`

`string`

The unique transaction number linked to a payout. For example, `HDFCN00000000001`.

`mode`

`string`

The mode used to make the payout. Available modes:

- `NEFT`
- `RTGS`
- `IMPS`
- `UPI`
- `card`

The payout modes are case-sensitive.

`reference_id`

`string`

Maximum length is 40 characters. A user-generated reference given to the payout. For example, `Acme Transaction ID 12345`. You can use this field to store your own transaction ID, if any.

`narration`

`string`

Maximum length 30 characters. Allowed characters: `a-z`, `A-Z`, `0-9` and space. This is a custom note that also appears on the bank statement. If no value is passed for this parameter, it defaults to the Merchant Billing Label.

 Enter the important text in the first 9 characters as banks truncate the rest as per their standards.

`batch_id`

`string`

This value is returned if the contact was created as part of a bulk upload. For example, `batch_00000000000001`.

`status_details`

`object`

This parameter returns the current status of the payout. For example, `IMPS is not enabled on beneficiary account, Retry with different mode.`

Show child parameters (3)

`created_at`

`integer`

Timestamp, in Unix, when the contact was created. For example, `1545320320`.

`fee_type`

`string`

Indicates the fee type charged for the payout. Possible value is `free_payout`.

# Create a Fund Account for Card with Razorpay TokenHQ

`POST`

`/v1/fund_accounts`

Use this endpoint to create a fund account type `card` by saving the card with [Razorpay TokenHQ](/razorpay-docs-md/payment-methods/cards/token-hq/razorpay-requestor-with-network-tokens.md).

Request Parameters

Response Parameters

###### Request Parameters

`contact_id`

\*

`string`

The unique identifier of the contact for which you want to fetch payouts. For example, `cont_00000000000001`.

`account_type`

\*

`string`

The type of account linked to the contact id. Here, it will be `card`.

`card`

\*

`object`

The details of the card used.

Show child parameters (3)

###### Response Parameters

`id`

`string`

The unique identifier linked to the payout. For example, `pout_00000000000001`.

`entity`

`string`

The entity being created. For example, `payout`.

`fund_account_id`

`string`

The unique identifier linked to the fund account. For example, `fa_00000000000001`.

`fund_account`

`object`

The account to which you want to make the payout.

Show child parameters (5)

`amount`

`integer`

The payout amount, in paise. For example, if you want to transfer ₹10,000, pass `1000000`. Minimum value `100`.

 The value passed here does not include fees and tax. Fees and tax, if any, are deducted from your account balance.

`currency`

`string`

The payout currency. Here, it is `INR`.

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

`purpose`

`string`

The purpose of the payout that is being created. The following classifications are available in the system by default:

- `refund`
- `cashback`
- `payout`
- `salary`
- `utility bill`
- `vendor bill`

`utr`

`string`

The unique transaction number linked to a payout. For example, `HDFCN00000000001`.

`mode`

`string`

The mode used to make the payout. Available modes:

- `NEFT`
- `RTGS`
- `IMPS`
- `UPI`
- `card`

The payout modes are case-sensitive.

`reference_id`

`string`

Maximum length is 40 characters. A user-generated reference given to the payout. For example, `Acme Transaction ID 12345`. You can use this field to store your own transaction ID, if any.

`narration`

`string`

Maximum length 30 characters. Allowed characters: `a-z`, `A-Z`, `0-9` and space. This is a custom note that also appears on the bank statement. If no value is passed for this parameter, it defaults to the Merchant Billing Label.

 Enter the important text in the first 9 characters as banks truncate the rest as per their standards.

`batch_id`

`string`

This value is returned if the contact was created as part of a bulk upload. For example, `batch_00000000000001`.

`status_details`

`object`

This parameter returns the current status of the payout. For example, `IMPS is not enabled on beneficiary account, Retry with different mode.`

Show child parameters (3)

`created_at`

`integer`

Timestamp, in Unix, when the contact was created. For example, `1545320320`.

`fee_type`

`string`

Indicates the fee type charged for the payout. Possible value is `free_payout`.

Curl

```bash
curl -u <YOUR_KEY>:<YOUR_SECRET> \
-X POST https://api.razorpay.com/v1/fund_accounts \
-H "Content-Type: application/json" \
-d '{
  "contact_id": "cont_00000000000001",
  "account_type": "card",
  "card": {
    "token_id": "token_4lsdksD31GaZ09",
    "input_type": "razorpay_token",
    "token_provider": "razorpay"
  }
}'
```

Success

```json
{
  "id": "fa_00000000000001",
  "entity": "fund_account",
  "contact_id": "cont_00000000000001",
  "account_type": "card",
  "card": {
    "last4": "8430",
    "network": "Visa",
    "type": "credit",
    "issuer": "HDFC",
    "input_type": "razorpay_token",
  },
  "active": true,
  "batch_id": null,
  "created_at": 1543650891
}
```
