<!-- Source: https://razorpay.com/docs/api/x/payout-composite/create/card -->

# Create a Payout to Card Using Composite API

Copy for AI

View as Markdown

`POST`

`/v1/payouts`

Use this endpoint to create a payout to card using Composite Payout API, without saving the details.

**Watch Out!**

Ensure you [allowlist IPs](/docs/x/dashboard/allowlist-ip/) and pass the [idempotency key](/razorpay-docs-md/api/x/payout-idempotency/make-request.md) to make a successful payout.

Payout to Cards is only available for PCI DSS compliant merchants. To enable the feature, [raise a request](/docs/x/support/) on the RazorpayX Dashboard. Refer to the [payouts to cards](/razorpay-docs-md/api/x/payouts-cards.md) documentation.

Consider the points given below before firing this API:

- Contact

  - A new contact is created if any combination of the following details is unique:
    - `fund_account.contact.name`
    - `fund_account.contact.email`
    - `fund_account.contact.contact`
    - `fund_account.contact.type`
    - `fund_account.contact.reference_id`
  - If **all** the above details match the details of an existing contact, the API returns details of the existing contact.
  - Use the [Update Contact API](/razorpay-docs-md/api/x/contacts/update.md)

    if you want to make changes to an existing contact.
- Fund Account

  - A new fund account is created if any combination of the following details is unique:
    - `fund_account.card.name`
    - `fund_account.card.number`
    - `fund_account.contact.name`
    - `fund_account.contact.email`
    - `fund_account.contact.contact`
    - `fund_account.contact.type`
    - `fund_account.contact.reference_id`
  - If **all** the above details match the details of an existing fund account, the API returns details of the existing fund account.
  - You cannot edit the details of a fund account.

To understand the status of the payouts, refer to [Payout Status Details](/docs/errors/x/payout-status-details/).

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
  "amount": 1000000,
  "currency": "INR",
  "mode": "NEFT",
  "purpose": "refund",
  "fund_account": {
    "account_type": "card",
    "card": {
      "number": "765432123456789",
      "name": "Gaurav Kumar",
      "input_type": "card"
    },
    "contact": {
      "email": "gaurav.kumar@example.com",
      "contact": "9876543210",
      "type": "employee",
      "reference_id": "Acme Contact ID 12345",
      "notes": {
        "notes_key_1": "Tea, Earl Grey, Hot",
        "notes_key_2": "Tea, Earl Grey… decaf."
      }
    }
  },
  "queue_if_low_balance": true,
  "reference_id": "Acme Transaction ID 12345",
  "narration": "Acme Corp Fund Transfer",
  "notes": {
    "notes_key_1": "Beam me up Scotty",
    "notes_key_2": "Engage"
  }
}'
```

Success

```json
{
  "id": "pout_00000000000001",
  "entity": "payout",
  "fund_account_id": "fa_00000000000001",
  "fund_account": {
    "id": "fa_00000000000001",
    "entity": "fund_account",
    "contact_id": "cont_00000000000001",
    "contact": {
      "id": "cont_00000000000001",
      "entity": "contact",
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
      "created_at": 1580817353
    },
    "account_type": "card",
    "card": {
      "last4": "6789",
      "network": "Visa",
      "type": "credit",
      "issuer": "HDFC",
      "input_type": "card"
    },
    "batch_id": null,
    "active": true,
    "created_at": 1581080272
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
  "purpose": "payout",
  "utr": null,
  "mode": "NEFT",
  "reference_id": "Acme Transaction ID 12345",
  "narration": "Acme Corp Fund Transfer",
  "batch_id": null,
  "failure_reason": null,
  "created_at": 1581499319,
  "fee_type": "",
  "error": {
    "description": null,
    "source": null,
    "reason": null
  }
}
```

###### Request Parameters

`account_number`

\*

`string`

The account from which you want to make the payout.
Account details can be found on the RazorpayX Dashboard. For example, `7878780080316316`.

- Pass your customer identifier if you want money to be deducted from RazorpayX Lite.
- Pass your Current Account number if you want money to be deducted from your Current Account.

**Watch Out!**

- This is **not** your contact's bank account number. Log in to your [**RazorpayX Dashboard**](https://x.razorpay.com/auth/?intent=current_account)

  and go to **My Account & Settings → Banking → Customer Identifier**.
- This value is different for Test Mode and Live Mode.

`amount`

\*

`integer`

The payout amount, in paise. For example, if you want to transfer ₹10000, pass `1000000`. Minimum value is `100`.

`currency`

\*

`string`

The payout currency. Here, it is `INR`.

`mode`

\*

`string`

The mode to be used to create the payout. Available modes:

- `NEFT`
- `RTGS`
- `IMPS`
- `UPI`
- `card`

The payout modes are case-sensitive. When creating payouts using APIs, ensure payout modes are entered in upper case.

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

- `true` : The payout is queued when your business account does not have sufficient balance to process the payout.
- `false` (default) : The payout is never queued. The payout fails if your business account does not have sufficient balance to process the payout.

`fund_account`

\*

`object`

The account to which you want to make the payout.

Show child parameters (3)

`reference_id`

`string`

Maximum length is 40 characters. A user-generated reference given to the payout. For example, `Acme Transaction ID 12345`. You can use this field to store your own transaction ID, if any.

`narration`

`string`

Maximum length 30 characters. Allowed characters: `a-z`, `A-Z`, `0-9` and space. This is a custom note that also appears on the bank statement. If no value is passed for this parameter, it defaults to the Merchant Billing Label.

 Enter the important text in the first 9 characters as banks truncate the rest as per their standards.

`notes`

`array of objects`

Key-value pair that can be used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

###### Response Parameters

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

# Create a Payout to Card Using Composite API

Copy for AI

View as Markdown

`POST`

`/v1/payouts`

Use this endpoint to create a payout to card using Composite Payout API, without saving the details.

**Watch Out!**

Ensure you [allowlist IPs](/docs/x/dashboard/allowlist-ip/) and pass the [idempotency key](/razorpay-docs-md/api/x/payout-idempotency/make-request.md) to make a successful payout.

Payout to Cards is only available for PCI DSS compliant merchants. To enable the feature, [raise a request](/docs/x/support/) on the RazorpayX Dashboard. Refer to the [payouts to cards](/razorpay-docs-md/api/x/payouts-cards.md) documentation.

Consider the points given below before firing this API:

- Contact

  - A new contact is created if any combination of the following details is unique:
    - `fund_account.contact.name`
    - `fund_account.contact.email`
    - `fund_account.contact.contact`
    - `fund_account.contact.type`
    - `fund_account.contact.reference_id`
  - If **all** the above details match the details of an existing contact, the API returns details of the existing contact.
  - Use the [Update Contact API](/razorpay-docs-md/api/x/contacts/update.md)

    if you want to make changes to an existing contact.
- Fund Account

  - A new fund account is created if any combination of the following details is unique:
    - `fund_account.card.name`
    - `fund_account.card.number`
    - `fund_account.contact.name`
    - `fund_account.contact.email`
    - `fund_account.contact.contact`
    - `fund_account.contact.type`
    - `fund_account.contact.reference_id`
  - If **all** the above details match the details of an existing fund account, the API returns details of the existing fund account.
  - You cannot edit the details of a fund account.

To understand the status of the payouts, refer to [Payout Status Details](/docs/errors/x/payout-status-details/).

Request Parameters

Response Parameters

###### Request Parameters

`account_number`

\*

`string`

The account from which you want to make the payout.
Account details can be found on the RazorpayX Dashboard. For example, `7878780080316316`.

- Pass your customer identifier if you want money to be deducted from RazorpayX Lite.
- Pass your Current Account number if you want money to be deducted from your Current Account.

**Watch Out!**

- This is **not** your contact's bank account number. Log in to your [**RazorpayX Dashboard**](https://x.razorpay.com/auth/?intent=current_account)

  and go to **My Account & Settings → Banking → Customer Identifier**.
- This value is different for Test Mode and Live Mode.

`amount`

\*

`integer`

The payout amount, in paise. For example, if you want to transfer ₹10000, pass `1000000`. Minimum value is `100`.

`currency`

\*

`string`

The payout currency. Here, it is `INR`.

`mode`

\*

`string`

The mode to be used to create the payout. Available modes:

- `NEFT`
- `RTGS`
- `IMPS`
- `UPI`
- `card`

The payout modes are case-sensitive. When creating payouts using APIs, ensure payout modes are entered in upper case.

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

- `true` : The payout is queued when your business account does not have sufficient balance to process the payout.
- `false` (default) : The payout is never queued. The payout fails if your business account does not have sufficient balance to process the payout.

`fund_account`

\*

`object`

The account to which you want to make the payout.

Show child parameters (3)

`reference_id`

`string`

Maximum length is 40 characters. A user-generated reference given to the payout. For example, `Acme Transaction ID 12345`. You can use this field to store your own transaction ID, if any.

`narration`

`string`

Maximum length 30 characters. Allowed characters: `a-z`, `A-Z`, `0-9` and space. This is a custom note that also appears on the bank statement. If no value is passed for this parameter, it defaults to the Merchant Billing Label.

 Enter the important text in the first 9 characters as banks truncate the rest as per their standards.

`notes`

`array of objects`

Key-value pair that can be used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

###### Response Parameters

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

Curl

```bash
curl -u <YOUR_KEY>:<YOUR_SECRET> \
-X POST https://api.razorpay.com/v1/payouts \
-H "Content-Type: application/json" \
-H "X-Payout-Idempotency: 53cda91c-8f81-4e77-bbb9-7388f4ac6bf4" \
-d '{
  "account_number": "7878780080316316",
  "amount": 1000000,
  "currency": "INR",
  "mode": "NEFT",
  "purpose": "refund",
  "fund_account": {
    "account_type": "card",
    "card": {
      "number": "765432123456789",
      "name": "Gaurav Kumar",
      "input_type": "card"
    },
    "contact": {
      "email": "gaurav.kumar@example.com",
      "contact": "9876543210",
      "type": "employee",
      "reference_id": "Acme Contact ID 12345",
      "notes": {
        "notes_key_1": "Tea, Earl Grey, Hot",
        "notes_key_2": "Tea, Earl Grey… decaf."
      }
    }
  },
  "queue_if_low_balance": true,
  "reference_id": "Acme Transaction ID 12345",
  "narration": "Acme Corp Fund Transfer",
  "notes": {
    "notes_key_1": "Beam me up Scotty",
    "notes_key_2": "Engage"
  }
}'
```

Success

```json
{
  "id": "pout_00000000000001",
  "entity": "payout",
  "fund_account_id": "fa_00000000000001",
  "fund_account": {
    "id": "fa_00000000000001",
    "entity": "fund_account",
    "contact_id": "cont_00000000000001",
    "contact": {
      "id": "cont_00000000000001",
      "entity": "contact",
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
      "created_at": 1580817353
    },
    "account_type": "card",
    "card": {
      "last4": "6789",
      "network": "Visa",
      "type": "credit",
      "issuer": "HDFC",
      "input_type": "card"
    },
    "batch_id": null,
    "active": true,
    "created_at": 1581080272
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
  "purpose": "payout",
  "utr": null,
  "mode": "NEFT",
  "reference_id": "Acme Transaction ID 12345",
  "narration": "Acme Corp Fund Transfer",
  "batch_id": null,
  "failure_reason": null,
  "created_at": 1581499319,
  "fee_type": "",
  "error": {
    "description": null,
    "source": null,
    "reason": null
  }
}
```
