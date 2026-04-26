<!-- Source: https://razorpay.com/docs/api/x/payout-composite/entity -->

# Payout Composite Entity

Copy for AI

View as Markdown

The Payout Composite Entity has the following parameters:

Sample Entity

```json
{
    "id": "pout_F681qslJ3ba70q",
    "entity": "payout",
    "fund_account_id": "fa_F681qr6Bqy1Je7",
    "fund_account": {
        "id": "fa_F681qr6Bqy1Je7",
        "entity": "fund_account",
        "contact_id": "cont_F681qmU11CfPDl",
        "contact": {
            "id": "cont_F681qmU11CfPDl",
            "entity": "contact",
            "name": "Gaurav Kumar",
            "contact": "9876543210",
            "email": "gaurav.kumar@example.com",
            "type": "employee",
            "reference_id": "Acme Contact ID 12345",
            "batch_id": null,
            "active": true,
            "notes": {
                "notes_key_1": "Tea, Earl Grey, Hot",
                "notes_key_2": "Tea, Earl Grey… decaf."
            },
            "created_at": 1592929016
        },
        "account_type": "bank_account",
        "bank_account": {
            "ifsc": "HDFC0001234",
            "bank_name": "HDFC Bank",
            "name": "Gaurav Kumar",
            "notes": [],
            "account_number": "1121431121541121"
        },
        "batch_id": null,
        "active": true,
        "created_at": 1592929016
    },
    "amount": 1000000,
    "currency": "INR",
    "notes": {
        "notes_key_1": "Beam me up Scotty",
        "notes_key_2": "Engage"
    },
    "fees": 590,
    "tax": 90,
    "status": "processed",
    "purpose": "refund",
    "utr": null,
    "mode": "NEFT",
    "reference_id": "Acme Transaction ID 12345",
    "narration": "Acme Corp Fund Transfer",
    "batch_id": null,
    "status_details": null,
    "created_at": 1592929017,
    "fee_type": "",
    "error": {
        "description": null,
        "source": null,
        "reason": null
    }
}
```

`id`

`string`

The unique identifier linked to the payout. For example, `pout_00000000000001`.

`entity`

`string`

The entity being created. Here, it will be `payout`.

`fund_account_id`

`string`

The unique identifier linked to the fund account. For example, `fa_00000000000001`.

`fund_account`

`object`

Contact and fund account details to which the payout was made.

Show child parameters (8)

`amount`

`integer`

Minimum value `100`. The payout amount, in paise. For example, if you want to transfer ₹10,000, pass `1000000`.
The value passed here does not include fees and tax. Fee and tax, if any, is deducted from your account balance.

`currency`

`string`

The payout currency. Here, it is `INR`.

`notes`

`object`

User-entered notes for internal reference. This is a key-value pair. You can enter a maximum of 15 key-value pairs. For example, `"note_key": "Beam me up Scotty”`.

`fees`

`integer`

The fees for the payout. This value is returned only when the payout moves to the `processing` state. For example, `5`.

`tax`

`integer`

The tax that is applicable for the fee being charged. This value is returned only when the payout moves to the `processing` state. For example, `1`.

`status`

`string`

The payout status. Possible payout states:

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

`purpose`

`string`

The purpose of the payout. Classifications available by default:

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

The mode used to make the payout. Refer to the [Payouts section](/docs/x/payouts/#payout-modes) for more details. Available modes:

- `NEFT`
- `RTGS`
- `IMPS`
- `UPI`
- `card`

`reference_id`

`string`

A reference you entered for the payout. For example, `Acme Transaction ID 12345`. You can use this field to store your own transaction ID, if any.

`narration`

`string`

This is a custom note that also appears on the bank statement.

If no value is passed for this parameter, it defaults to the Merchant Billing Label.

`batch_id`

`string`

This value is returned if the contact was created as part of a bulk upload. For example, `batch_00000000000001`.

`status_details`

`object`

This parameter returns the current status of the payout. For example, `IMPS is not enabled on beneficiary account, Retry with different mode.`

Show child parameters (3)

`created_at`

`integer`

Timestamp, in Unix, at which the payout was created. For example, `1545320320`.

`fee_type`

`string`

Indicates the fee type charged for the payout. Possible value is `free_payout`.

# Payout Composite Entity

Copy for AI

View as Markdown

The Payout Composite Entity has the following parameters:

`id`

`string`

The unique identifier linked to the payout. For example, `pout_00000000000001`.

`entity`

`string`

The entity being created. Here, it will be `payout`.

`fund_account_id`

`string`

The unique identifier linked to the fund account. For example, `fa_00000000000001`.

`fund_account`

`object`

Contact and fund account details to which the payout was made.

Show child parameters (8)

`amount`

`integer`

Minimum value `100`. The payout amount, in paise. For example, if you want to transfer ₹10,000, pass `1000000`.
The value passed here does not include fees and tax. Fee and tax, if any, is deducted from your account balance.

`currency`

`string`

The payout currency. Here, it is `INR`.

`notes`

`object`

User-entered notes for internal reference. This is a key-value pair. You can enter a maximum of 15 key-value pairs. For example, `"note_key": "Beam me up Scotty”`.

`fees`

`integer`

The fees for the payout. This value is returned only when the payout moves to the `processing` state. For example, `5`.

`tax`

`integer`

The tax that is applicable for the fee being charged. This value is returned only when the payout moves to the `processing` state. For example, `1`.

`status`

`string`

The payout status. Possible payout states:

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

`purpose`

`string`

The purpose of the payout. Classifications available by default:

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

The mode used to make the payout. Refer to the [Payouts section](/docs/x/payouts/#payout-modes) for more details. Available modes:

- `NEFT`
- `RTGS`
- `IMPS`
- `UPI`
- `card`

`reference_id`

`string`

A reference you entered for the payout. For example, `Acme Transaction ID 12345`. You can use this field to store your own transaction ID, if any.

`narration`

`string`

This is a custom note that also appears on the bank statement.

If no value is passed for this parameter, it defaults to the Merchant Billing Label.

`batch_id`

`string`

This value is returned if the contact was created as part of a bulk upload. For example, `batch_00000000000001`.

`status_details`

`object`

This parameter returns the current status of the payout. For example, `IMPS is not enabled on beneficiary account, Retry with different mode.`

Show child parameters (3)

`created_at`

`integer`

Timestamp, in Unix, at which the payout was created. For example, `1545320320`.

`fee_type`

`string`

Indicates the fee type charged for the payout. Possible value is `free_payout`.

Sample Entity

```json
{
    "id": "pout_F681qslJ3ba70q",
    "entity": "payout",
    "fund_account_id": "fa_F681qr6Bqy1Je7",
    "fund_account": {
        "id": "fa_F681qr6Bqy1Je7",
        "entity": "fund_account",
        "contact_id": "cont_F681qmU11CfPDl",
        "contact": {
            "id": "cont_F681qmU11CfPDl",
            "entity": "contact",
            "name": "Gaurav Kumar",
            "contact": "9876543210",
            "email": "gaurav.kumar@example.com",
            "type": "employee",
            "reference_id": "Acme Contact ID 12345",
            "batch_id": null,
            "active": true,
            "notes": {
                "notes_key_1": "Tea, Earl Grey, Hot",
                "notes_key_2": "Tea, Earl Grey… decaf."
            },
            "created_at": 1592929016
        },
        "account_type": "bank_account",
        "bank_account": {
            "ifsc": "HDFC0001234",
            "bank_name": "HDFC Bank",
            "name": "Gaurav Kumar",
            "notes": [],
            "account_number": "1121431121541121"
        },
        "batch_id": null,
        "active": true,
        "created_at": 1592929016
    },
    "amount": 1000000,
    "currency": "INR",
    "notes": {
        "notes_key_1": "Beam me up Scotty",
        "notes_key_2": "Engage"
    },
    "fees": 590,
    "tax": 90,
    "status": "processed",
    "purpose": "refund",
    "utr": null,
    "mode": "NEFT",
    "reference_id": "Acme Transaction ID 12345",
    "narration": "Acme Corp Fund Transfer",
    "batch_id": null,
    "status_details": null,
    "created_at": 1592929017,
    "fee_type": "",
    "error": {
        "description": null,
        "source": null,
        "reason": null
    }
}
```
