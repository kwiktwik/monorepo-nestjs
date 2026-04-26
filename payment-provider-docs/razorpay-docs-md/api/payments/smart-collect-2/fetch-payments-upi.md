<!-- Source: https://razorpay.com/docs/api/payments/smart-collect-2/fetch-payments-upi -->

# Fetch Payments Made Using UPI (Smart Collect 2.0)

Copy for AI

View as Markdown

`GET`

`/v1/payments/:id/upi_transfer`

Use this endpoint to retrieve details of payments made using the UPI payment method.

Sample Code

Path Parameters

1

Response Parameters

Curl

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X GET \
https://api.razorpay.com/v1/payments/pay_E5YETrWuVgP3fI/upi_transfer \
```

Success

```json
{
  "id": "ut_E5YEUKb9yA0YvX",
  "entity": "upi_transfer",
  "amount": 100,
  "payer_vpa": "gauravkumar@exampleupi",
  "payer_bank": "HDFC BANK LTD",
  "payer_account": "50100000000001",
  "payer_ifsc": "HDFC0000004",
  "payment_id": "pay_E5YETrWuVgP3fI",
  "npci_reference_id": "001718859181",
  "virtual_account_id": "va_E5V3Rb3sQaMS5v",
  "virtual_account": {
    "id": "va_E5V3Rb3sQaMS5v",
    "name": "Acme Corp",
    "entity": "virtual_account",
    "status": "active",
    "description": "First Customer Identifier",
    "amount_expected": null,
    "notes": [],
    "amount_paid": 200,
    "customer_id": "cust_9xnHzNGIEY4TAV",
    "receivers": [
      {
        "id": "vpa_E5V3RsO1g4QK7t",
        "entity": "vpa",
        "username": "rpy.payto00000gaurikumari",
        "handle": "icici",
        "address": "rpy.payto00000gaurikumari@icici"
      }
    ],
    "close_by": null,
    "closed_at": null,
    "created_at": 1579254678
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

The unique identifier of the UPI transfer.

`entity`

`string`

The name of the entity. Here, it is `upi_transfer`.

`amount`

`integer`

The amount paid by the customer.

`payer_vpa`

`string`

The UPI ID of the customer that is used to make the payment.

`payer_bank`

`string`

The name of the customer's bank.

`payer_account`

`string`

The bank account number of the customer that is linked to the UPI ID.

`payer_ifsc`

`string`

The IFSC associated with the bank account.

`payment_id`

`string`

The unique identifier of the payment made by the customer.

`npci_reference_id`

`string`

The unique reference number provided by NPCI for the payment.

`virtual_account_id`

`string`

The unique identifier of the Customer Identifier.

`virtual_account`

`object`

Details of the Customer Identifier.

Show child parameters (12)

# Fetch Payments Made Using UPI (Smart Collect 2.0)

Copy for AI

View as Markdown

`GET`

`/v1/payments/:id/upi_transfer`

Use this endpoint to retrieve details of payments made using the UPI payment method.

Path Parameters

1

Response Parameters

###### Path Parameters

`id`

\*

`string`

The unique identifier of the payment made to the Customer Identifier.

###### Response Parameters

`id`

`string`

The unique identifier of the UPI transfer.

`entity`

`string`

The name of the entity. Here, it is `upi_transfer`.

`amount`

`integer`

The amount paid by the customer.

`payer_vpa`

`string`

The UPI ID of the customer that is used to make the payment.

`payer_bank`

`string`

The name of the customer's bank.

`payer_account`

`string`

The bank account number of the customer that is linked to the UPI ID.

`payer_ifsc`

`string`

The IFSC associated with the bank account.

`payment_id`

`string`

The unique identifier of the payment made by the customer.

`npci_reference_id`

`string`

The unique reference number provided by NPCI for the payment.

`virtual_account_id`

`string`

The unique identifier of the Customer Identifier.

`virtual_account`

`object`

Details of the Customer Identifier.

Show child parameters (12)

Curl

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X GET \
https://api.razorpay.com/v1/payments/pay_E5YETrWuVgP3fI/upi_transfer \
```

Success

```json
{
  "id": "ut_E5YEUKb9yA0YvX",
  "entity": "upi_transfer",
  "amount": 100,
  "payer_vpa": "gauravkumar@exampleupi",
  "payer_bank": "HDFC BANK LTD",
  "payer_account": "50100000000001",
  "payer_ifsc": "HDFC0000004",
  "payment_id": "pay_E5YETrWuVgP3fI",
  "npci_reference_id": "001718859181",
  "virtual_account_id": "va_E5V3Rb3sQaMS5v",
  "virtual_account": {
    "id": "va_E5V3Rb3sQaMS5v",
    "name": "Acme Corp",
    "entity": "virtual_account",
    "status": "active",
    "description": "First Customer Identifier",
    "amount_expected": null,
    "notes": [],
    "amount_paid": 200,
    "customer_id": "cust_9xnHzNGIEY4TAV",
    "receivers": [
      {
        "id": "vpa_E5V3RsO1g4QK7t",
        "entity": "vpa",
        "username": "rpy.payto00000gaurikumari",
        "handle": "icici",
        "address": "rpy.payto00000gaurikumari@icici"
      }
    ],
    "close_by": null,
    "closed_at": null,
    "created_at": 1579254678
  }
}
```
