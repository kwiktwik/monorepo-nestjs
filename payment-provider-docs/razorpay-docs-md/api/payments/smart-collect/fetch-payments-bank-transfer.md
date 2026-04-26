<!-- Source: https://razorpay.com/docs/api/payments/smart-collect/fetch-payments-bank-transfer -->

# Fetch Payments Made By Bank Transfer

Copy for AI

View as Markdown

`GET`

`/v1/payments/:id/bank_transfer`

Use this endpoint to retrieve details of payments made using the bank transfer method.

If Razorpay does not receive the bank account information of the customer from the remitting bank, the `payer_bank_account` parameter will be set to null.

Sample Code

Path Parameters

1

Response Parameters

Errors

Curl

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X GET \
https://api.razorpay.com/v1/payments/pay_CmiztqmYJPtDAu/bank_transfer \
```

Success

Failure

```json
{
  "id": "bt_Di5iqCElVyRlCb",
  "entity": "bank_transfer",
  "payment_id": "pay_Di5iqCqA1WEHq6",
  "mode": "NEFT",
  "bank_reference": "157414364471",
  "amount": 239000,
  "payer_bank_account": {
    "id": "ba_Di5iqSxtYrTzPU",
    "entity": "bank_account",
    "ifsc": "UTIB0003198",
    "bank_name": "Axis Bank",
    "name": "Acme Corp",
    "notes": [],
    "account_number": "765432123456789"
  },
  "virtual_account_id": "va_Di5gbNptcWV8fQ",
  "virtual_account": {
    "id": "va_Di5gbNptcWV8fQ",
    "name": "Acme Corp",
    "entity": "virtual_account",
    "status": "closed",
    "description": "Customer Identifier created for M/S ABC Exports",
    "amount_expected": 2300,
    "notes": {
      "material": "teakwood"
    },
    "amount_paid": 239000,
    "customer_id": "cust_DOMUFFiGdCaCUJ",
    "receivers": [
      {
        "id": "ba_Di5gbQsGn0QSz3",
        "entity": "bank_account",
        "ifsc": "RATN0VAAPIS",
        "bank_name": "RBL Bank",
        "name": "Acme Corp",
        "notes": [],
        "account_number": "1112220061746877"
      }
    ],
    "close_by": 1574427237,
    "closed_at": 1574164078,
    "created_at": 1574143517
  }
}
```

###### Path Parameters

`id`

\*

`string`

The unique identifier of the payment made to the Customer Identifier.

###### Response Parameters

`id`

`string`

The unique identifier of the bank transfer.

`entity`

`string`

The name of the entity. Here, it is `bank_transfer`.

`payment_id`

`string`

The unique identifier of the payment.

`mode`

`string`

The mode of bank transfer used. Possible values are:

- `NEFT`
- `RTGS`
- `IMPS`
- `UPI`

`bank_reference`

`string`

Unique reference number provided by the bank for the transaction.

`payer_bank_account`

`object`

The payer bank account details from which payment is received.

Show child parameters (6)

`virtual_account_id`

`string`

The unique identifier of the Customer Identifier.

`virtual_account`

`object`

Details of the Customer Identifier.

Show child parameters (13)

###### Errors

The API <key/secret> provided is invalid.

Error Status: 4xx

Occurs when there is a mismatch between the API credentials passed in the API call and the API credentials generated on the dashboard.

Solution

# Fetch Payments Made By Bank Transfer

Copy for AI

View as Markdown

`GET`

`/v1/payments/:id/bank_transfer`

Use this endpoint to retrieve details of payments made using the bank transfer method.

If Razorpay does not receive the bank account information of the customer from the remitting bank, the `payer_bank_account` parameter will be set to null.

Path Parameters

1

Response Parameters

Errors

###### Path Parameters

`id`

\*

`string`

The unique identifier of the payment made to the Customer Identifier.

###### Response Parameters

`id`

`string`

The unique identifier of the bank transfer.

`entity`

`string`

The name of the entity. Here, it is `bank_transfer`.

`payment_id`

`string`

The unique identifier of the payment.

`mode`

`string`

The mode of bank transfer used. Possible values are:

- `NEFT`
- `RTGS`
- `IMPS`
- `UPI`

`bank_reference`

`string`

Unique reference number provided by the bank for the transaction.

`payer_bank_account`

`object`

The payer bank account details from which payment is received.

Show child parameters (6)

`virtual_account_id`

`string`

The unique identifier of the Customer Identifier.

`virtual_account`

`object`

Details of the Customer Identifier.

Show child parameters (13)

###### Errors

The API <key/secret> provided is invalid.

Error Status: 4xx

Occurs when there is a mismatch between the API credentials passed in the API call and the API credentials generated on the dashboard.

Solution

Curl

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X GET \
https://api.razorpay.com/v1/payments/pay_CmiztqmYJPtDAu/bank_transfer \
```

Success

Failure

```json
{
  "id": "bt_Di5iqCElVyRlCb",
  "entity": "bank_transfer",
  "payment_id": "pay_Di5iqCqA1WEHq6",
  "mode": "NEFT",
  "bank_reference": "157414364471",
  "amount": 239000,
  "payer_bank_account": {
    "id": "ba_Di5iqSxtYrTzPU",
    "entity": "bank_account",
    "ifsc": "UTIB0003198",
    "bank_name": "Axis Bank",
    "name": "Acme Corp",
    "notes": [],
    "account_number": "765432123456789"
  },
  "virtual_account_id": "va_Di5gbNptcWV8fQ",
  "virtual_account": {
    "id": "va_Di5gbNptcWV8fQ",
    "name": "Acme Corp",
    "entity": "virtual_account",
    "status": "closed",
    "description": "Customer Identifier created for M/S ABC Exports",
    "amount_expected": 2300,
    "notes": {
      "material": "teakwood"
    },
    "amount_paid": 239000,
    "customer_id": "cust_DOMUFFiGdCaCUJ",
    "receivers": [
      {
        "id": "ba_Di5gbQsGn0QSz3",
        "entity": "bank_account",
        "ifsc": "RATN0VAAPIS",
        "bank_name": "RBL Bank",
        "name": "Acme Corp",
        "notes": [],
        "account_number": "1112220061746877"
      }
    ],
    "close_by": 1574427237,
    "closed_at": 1574164078,
    "created_at": 1574143517
  }
}
```
