<!-- Source: https://razorpay.com/docs/api/x/account-validation/vpa -->

# Validate a VPA

Copy for AI

View as Markdown

`POST`

`/v1/fund_accounts/validations`

Use this endpoint to create a VPA (UPI) account validation transaction.

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
    "validation_type": "pennydrop",
    "reference_id": "112233",
    "notes": {
      "key_1": "value_1",
      "key_2": "value_2"
    },
    "fund_account": {
      "account_type": "vpa",
      "vpa": {
        "address": "gaurav.kumar@exampleupi"
      },
      "contact": {
        "name": "Gaurav Kumar",
        "email": "gaurav.kumar@example.com",
        "contact": "9123456789",
        "type": "employee",
        "reference_id": "Contact_12345"
      }
    }
  }'
```

Success

Failure

```json
{
  "id": "fav_00000000000001",
  "entity": "fund_account.validation",
  "status": "completed",
  "validation_results": {
    "account_status": "active",
    "registered_name": "Gaurav Kumar",
    "details": "The beneficiary account is valid",
    "name_match_score": 100,
    "validated_account_type": "bank_account",
    "bank_account": {
      "bank_routing_code": "ICIC0000047",
      "account_number": "XXXXXXXX5599",
      "bank_name": "ICICI Bank",
      "account_type": "savings"
    }
  },
  "status_details": {
    "description": "Validation request is completed",
    "source": "beneficiary_bank",
    "reason": "validation_completed"
  },
  "reference_id": "112233",
  "fund_account": {
    "id": "fa_00000000000001",
    "entity": "fund_account",
    "account_type": "vpa",
    "vpa": {
      "address": "gaurav.kumar@exampleupi"
    },
    "active": true,
    "created_at": 1567064019,
    "contact": {
      "id": "cont_00000000000001",
      "entity": "contact",
      "name": "Gaurav Kumar",
      "email": "gaurav.kumar@example.com",
      "contact": "9123456789",
      "type": "employee",
      "reference_id": "Contact_12345",
      "active": true
    }
  }
}
```

###### Request Parameters

`source_account_number`

\*

`string`

The account from which money should be deducted for the account validation transaction.

- Pass your customer identifier if you want money to be deducted from RazorpayX Lite.

**Watch Out!**

- This is **not** your contact's bank account number. Log in to your [**RazorpayX Dashboard**](https://x.razorpay.com/auth/?intent=current_account)

  and go to **My Account & Settings → Banking → Customer Identifier**.
- This value is different for Test Mode and Live Mode.

`validation_type`

\*

`string`

The method used for validating the bank account. In this case, `pennydrop`.

`reference_id`

`string`

Maximum 40 characters. A user-entered reference for the contact. For example, `Acme Contact ID 12345`.

`notes`

`object`

Key-value pair that can be used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

`fund_account`

\*

`object`

The fund account id you want to validate.

Show child parameters (2)

`contact`

\*

`object`

The details of the contact.

`name`

`string`

The customer’s name. For example, Gaurav Kumar.

`email`

`string`

The customer’s email address. For example, [gaurav.kumar@example.com](mailto:gaurav.kumar@example.com).

`contact`

`string`

The customer's phone number. A maximum length of 15 characters, including country code. For example, `+919000090000`.

`type`

`string`

Defines the contact type . For example, `employee`

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

# Validate a VPA

Copy for AI

View as Markdown

`POST`

`/v1/fund_accounts/validations`

Use this endpoint to create a VPA (UPI) account validation transaction.

Request Parameters

Response Parameters

###### Request Parameters

`source_account_number`

\*

`string`

The account from which money should be deducted for the account validation transaction.

- Pass your customer identifier if you want money to be deducted from RazorpayX Lite.

**Watch Out!**

- This is **not** your contact's bank account number. Log in to your [**RazorpayX Dashboard**](https://x.razorpay.com/auth/?intent=current_account)

  and go to **My Account & Settings → Banking → Customer Identifier**.
- This value is different for Test Mode and Live Mode.

`validation_type`

\*

`string`

The method used for validating the bank account. In this case, `pennydrop`.

`reference_id`

`string`

Maximum 40 characters. A user-entered reference for the contact. For example, `Acme Contact ID 12345`.

`notes`

`object`

Key-value pair that can be used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

`fund_account`

\*

`object`

The fund account id you want to validate.

Show child parameters (2)

`contact`

\*

`object`

The details of the contact.

`name`

`string`

The customer’s name. For example, Gaurav Kumar.

`email`

`string`

The customer’s email address. For example, [gaurav.kumar@example.com](mailto:gaurav.kumar@example.com).

`contact`

`string`

The customer's phone number. A maximum length of 15 characters, including country code. For example, `+919000090000`.

`type`

`string`

Defines the contact type . For example, `employee`

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
  -X POST https://api.razorpay.com/v1/fund_accounts/validations \
  -H "Content-Type: application/json" \
  -d '{
    "source_account_number": "7878780080316316",
    "validation_type": "pennydrop",
    "reference_id": "112233",
    "notes": {
      "key_1": "value_1",
      "key_2": "value_2"
    },
    "fund_account": {
      "account_type": "vpa",
      "vpa": {
        "address": "gaurav.kumar@exampleupi"
      },
      "contact": {
        "name": "Gaurav Kumar",
        "email": "gaurav.kumar@example.com",
        "contact": "9123456789",
        "type": "employee",
        "reference_id": "Contact_12345"
      }
    }
  }'
```

Success

Failure

```json
{
  "id": "fav_00000000000001",
  "entity": "fund_account.validation",
  "status": "completed",
  "validation_results": {
    "account_status": "active",
    "registered_name": "Gaurav Kumar",
    "details": "The beneficiary account is valid",
    "name_match_score": 100,
    "validated_account_type": "bank_account",
    "bank_account": {
      "bank_routing_code": "ICIC0000047",
      "account_number": "XXXXXXXX5599",
      "bank_name": "ICICI Bank",
      "account_type": "savings"
    }
  },
  "status_details": {
    "description": "Validation request is completed",
    "source": "beneficiary_bank",
    "reason": "validation_completed"
  },
  "reference_id": "112233",
  "fund_account": {
    "id": "fa_00000000000001",
    "entity": "fund_account",
    "account_type": "vpa",
    "vpa": {
      "address": "gaurav.kumar@exampleupi"
    },
    "active": true,
    "created_at": 1567064019,
    "contact": {
      "id": "cont_00000000000001",
      "entity": "contact",
      "name": "Gaurav Kumar",
      "email": "gaurav.kumar@example.com",
      "contact": "9123456789",
      "type": "employee",
      "reference_id": "Contact_12345",
      "active": true
    }
  }
}
```
