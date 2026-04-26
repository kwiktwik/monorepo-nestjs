<!-- Source: https://razorpay.com/docs/api/settlements/fetch-recon -->

# Fetch Settlement Recon Details

`GET`

`/v1/settlements/recon/combined?year=yyyy&month=mm`

Use this endpoint to return a list of all transactions such as payments, refunds, transfers and adjustments settled to your account on a particular day or month. In the example request and response, we are fetching the settlement report for a particular day, that is `11/06/2022`.

Sample Code

Query Parameters

5

Response Parameters

Errors

Curl

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X GET \
https://api.razorpay.com/v1/settlements/recon/combined?year=2022&month=06&day=11 \
```

Success

Failure

```json
{
  "entity": "collection",
  "count": 4,
  "items": [
    {
      "entity_id": "pay_DEXrnipqTmWVGE",
      "type": "payment",
      "debit": 0,
      "credit": 97100,
      "amount": 100000,
      "currency": "INR",
      "fee": 2900,
      "tax": 0,
      "on_hold": false,
      "settled": true,
      "created_at": 1567692556,
      "settled_at": 1568176960,
      "settlement_id": "setl_DGlQ1Rj8os78Ec",
      "posted_at": null,
      "credit_type": "default",
      "description": "Recurring Payment via Subscription",
      "notes": "Beam me up Scotty.",
      "payment_id": null,
      "settlement_utr": "1568176960vxp0rj",
      "order_id": "order_DEXrnRiR3SNDHA",
      "order_receipt": null,
      "method": "card",
      "card_network": "MasterCard",
      "card_issuer": "KARB",
      "card_type": "credit",
      "dispute_id": null
    },
    {
      "entity_id": "rfnd_DGRcGzZSLyEdg1",
      "type": "refund",
      "debit": 242500,
      "credit": 0,
      "amount": 242500,
      "currency": "INR",
      "fee": 0,
      "tax": 0,
      "on_hold": false,
      "settled": true,
      "created_at": 1568107224,
      "settled_at": 1568176960,
      "settlement_id": "setl_DGlQ1Rj8os78Ec",
      "posted_at": null,
      "credit_type": "default",
      "description": null,
      "notes": "Beam me up Scotty.",
      "payment_id": "pay_DEXq1pACSqFxtS",
      "settlement_utr": "1568176960vxp0rj",
      "order_id": "order_DEXpmZgffXNvuI",
      "order_receipt": null,
      "method": "card",
      "card_network": "MasterCard",
      "card_issuer": "KARB",
      "card_type": "credit",
      "dispute_id": null
    },
    {
      "entity_id": "trf_DEUoCEtdsJgvl7",
      "type": "transfer",
      "debit": 100296,
      "credit": 0,
      "amount": 100000,
      "currency": "INR",
      "fee": 296,
      "tax": 46,
      "on_hold": false,
      "settled": true,
      "created_at": 1567681786,
      "settled_at": 1568176960,
      "settlement_id": "setl_DGlQ1Rj8os78Ec",
      "posted_at": null,
      "credit_type": "default",
      "description": null,
      "notes": null,
      "payment_id": "pay_DEApNNTR6xmqJy",
      "settlement_utr": "1568176960vxp0rj",
      "order_id": null,
      "order_receipt": null,
      "method": null,
      "card_network": null,
      "card_issuer": null,
      "card_type": null,
      "dispute_id": null
    },
    {
      "entity_id": "adj_EhcHONhX4ChgNC",
      "type": "adjustment",
      "debit": 0,
      "credit": 1012,
      "amount": 1012,
      "currency": "INR",
      "fee": 0,
      "tax": 0,
      "on_hold": false,
      "settled": true,
      "created_at": 1567681786,
      "settled_at": 1568176960,
      "settlement_id": "setl_DGlQ1Rj8os78Ec",
      "posted_at": null,
      "description": "test reason",
      "notes": null,
      "payment_id": null,
      "settlement_utr": null,
      "order_id": null,
      "order_receipt": null,
      "method": null,
      "card_network": null,
      "card_issuer": null,
      "card_type": null,
      "dispute_id": null
    }
  ]
}
```

###### Query Parameters

`year`

\*

`integer`

The year the settlement was received in the `YYYY` format. For example, `2022`.

`month`

\*

`integer`

The month the settlement was received in the `MM` format. For example, `06`.

`day`

`integer`

The date on which the settlement was received in the `DD` format. For example, `11`.

`count`

`integer`

Specifies the number of available settlements to be fetched. Possible values: `1` to `1000`.

`skip`

`integer`

Specifies the number of available settlements to be skipped when fetching a count.

###### Response Parameters

`entity_id`

`string`

The unique identifier of the transaction that has been settled.

`type`

`string`

Indicates the type of transaction. Possible values:

- `payment`
- `refund`
- `transfer`
- `adjustment`

`debit`

`integer`

The amount, in currency subunits, that has been debited from your account.

`credit`

`integer`

The amount, in currency subunits, that has been credited to your account.

`amount`

`integer`

The total amount, in currency subunits, debited or credited from your account.

`currency`

`string`

The 3-letter ISO currency code for the transaction.

`fee`

`integer`

The fees, in currency subunits, charged to process the transaction.

`tax`

`integer`

The tax on the fee, in currency subunits, charged to process the transaction.

`on_hold`

`boolean`

Indicates whether the account settlement for transfer is on hold. Possible values:

- `true`: The settlement for transfer is on hold.
- `false`: The settlement for transfer is released.

`settled`

`boolean`

Indicates whether the transaction has been settled or not. Possible values:

- `true`
- `false`

`created_at`

`integer`

Unix timestamp at which the transaction was created.

`settled_at`

`integer`

Unix timestamp when the transaction was settled.

`settlement_id`

`string`

The unique identifier of the settlement transaction.

`description`

`string`

Brief description about the transaction.

`notes`

`object`

Notes for the transaction. For example, `Beam me up Scotty.`

`payment_id`

`string`

The unique identifier of the payment linked to `refund` or `transfer` that has been settled. For example, `pay_DEApNNTR6xmqJy`. It is `null` for `payments`.

`settlement_utr`

`string`

The unique reference number linked to the settlement. For example, `KKBKH14156891582`.

`order_id`

`string`

Order id linked to the payment made by the customer that has been settled. For example, `order_DEXrnRiR3SNDHA`.

`order_receipt`

`string`

Receipt number entered while [creating the Order](/razorpay-docs-md/api/orders.md#create-an-order).

`method`

`string`

The payment method used to complete the payment. Possible values:

- `card`
- `netbanking`
- `wallet`
- `upi`
- `emi`

`card_network`

`string`

The card network used to process the payment. Possible values:

- `American Express`
- `Diners Club`
- `Maestro`
- `MasterCard`
- `RuPay`
- `Visa`
- `unknown`

`card_issuer`

`string`

This is a 4-character code denoting the issuing bank. For example, `KARB`.

This attribute will not be set for international cards, that is, for cards issued by foreign banks.

`card_type`

`string`

The card type used to process the payment. Possible values:

- `credit`
- `debit`

`dispute_id`

`string`

The unique identifier of any dispute, if any, for this transaction.

###### Errors

The API {key/secret} provided is invalid.

Error Status: 4xx

The API credentials passed in the API call differ from the ones generated on the Dashboard.

Solution

The year must be 4 digits.

Error Status: 400

An invalid year is entered.

Solution

The month is not a valid month.

Error Status: 400

An invalid month is entered.

Solution

The day must be between 1 and 2 digits.

Error Status: 400

An invalid day is entered.

Solution

The count must be at least 1.

Error Status: 400

The count passed is `0`.

Solution

# Fetch Settlement Recon Details

`GET`

`/v1/settlements/recon/combined?year=yyyy&month=mm`

Use this endpoint to return a list of all transactions such as payments, refunds, transfers and adjustments settled to your account on a particular day or month. In the example request and response, we are fetching the settlement report for a particular day, that is `11/06/2022`.

Query Parameters

5

Response Parameters

Errors

###### Query Parameters

`year`

\*

`integer`

The year the settlement was received in the `YYYY` format. For example, `2022`.

`month`

\*

`integer`

The month the settlement was received in the `MM` format. For example, `06`.

`day`

`integer`

The date on which the settlement was received in the `DD` format. For example, `11`.

`count`

`integer`

Specifies the number of available settlements to be fetched. Possible values: `1` to `1000`.

`skip`

`integer`

Specifies the number of available settlements to be skipped when fetching a count.

###### Response Parameters

`entity_id`

`string`

The unique identifier of the transaction that has been settled.

`type`

`string`

Indicates the type of transaction. Possible values:

- `payment`
- `refund`
- `transfer`
- `adjustment`

`debit`

`integer`

The amount, in currency subunits, that has been debited from your account.

`credit`

`integer`

The amount, in currency subunits, that has been credited to your account.

`amount`

`integer`

The total amount, in currency subunits, debited or credited from your account.

`currency`

`string`

The 3-letter ISO currency code for the transaction.

`fee`

`integer`

The fees, in currency subunits, charged to process the transaction.

`tax`

`integer`

The tax on the fee, in currency subunits, charged to process the transaction.

`on_hold`

`boolean`

Indicates whether the account settlement for transfer is on hold. Possible values:

- `true`: The settlement for transfer is on hold.
- `false`: The settlement for transfer is released.

`settled`

`boolean`

Indicates whether the transaction has been settled or not. Possible values:

- `true`
- `false`

`created_at`

`integer`

Unix timestamp at which the transaction was created.

`settled_at`

`integer`

Unix timestamp when the transaction was settled.

`settlement_id`

`string`

The unique identifier of the settlement transaction.

`description`

`string`

Brief description about the transaction.

`notes`

`object`

Notes for the transaction. For example, `Beam me up Scotty.`

`payment_id`

`string`

The unique identifier of the payment linked to `refund` or `transfer` that has been settled. For example, `pay_DEApNNTR6xmqJy`. It is `null` for `payments`.

`settlement_utr`

`string`

The unique reference number linked to the settlement. For example, `KKBKH14156891582`.

`order_id`

`string`

Order id linked to the payment made by the customer that has been settled. For example, `order_DEXrnRiR3SNDHA`.

`order_receipt`

`string`

Receipt number entered while [creating the Order](/razorpay-docs-md/api/orders.md#create-an-order).

`method`

`string`

The payment method used to complete the payment. Possible values:

- `card`
- `netbanking`
- `wallet`
- `upi`
- `emi`

`card_network`

`string`

The card network used to process the payment. Possible values:

- `American Express`
- `Diners Club`
- `Maestro`
- `MasterCard`
- `RuPay`
- `Visa`
- `unknown`

`card_issuer`

`string`

This is a 4-character code denoting the issuing bank. For example, `KARB`.

This attribute will not be set for international cards, that is, for cards issued by foreign banks.

`card_type`

`string`

The card type used to process the payment. Possible values:

- `credit`
- `debit`

`dispute_id`

`string`

The unique identifier of any dispute, if any, for this transaction.

###### Errors

The API {key/secret} provided is invalid.

Error Status: 4xx

The API credentials passed in the API call differ from the ones generated on the Dashboard.

Solution

The year must be 4 digits.

Error Status: 400

An invalid year is entered.

Solution

The month is not a valid month.

Error Status: 400

An invalid month is entered.

Solution

The day must be between 1 and 2 digits.

Error Status: 400

An invalid day is entered.

Solution

The count must be at least 1.

Error Status: 400

The count passed is `0`.

Solution

Curl

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X GET \
https://api.razorpay.com/v1/settlements/recon/combined?year=2022&month=06&day=11 \
```

Success

Failure

```json
{
  "entity": "collection",
  "count": 4,
  "items": [
    {
      "entity_id": "pay_DEXrnipqTmWVGE",
      "type": "payment",
      "debit": 0,
      "credit": 97100,
      "amount": 100000,
      "currency": "INR",
      "fee": 2900,
      "tax": 0,
      "on_hold": false,
      "settled": true,
      "created_at": 1567692556,
      "settled_at": 1568176960,
      "settlement_id": "setl_DGlQ1Rj8os78Ec",
      "posted_at": null,
      "credit_type": "default",
      "description": "Recurring Payment via Subscription",
      "notes": "Beam me up Scotty.",
      "payment_id": null,
      "settlement_utr": "1568176960vxp0rj",
      "order_id": "order_DEXrnRiR3SNDHA",
      "order_receipt": null,
      "method": "card",
      "card_network": "MasterCard",
      "card_issuer": "KARB",
      "card_type": "credit",
      "dispute_id": null
    },
    {
      "entity_id": "rfnd_DGRcGzZSLyEdg1",
      "type": "refund",
      "debit": 242500,
      "credit": 0,
      "amount": 242500,
      "currency": "INR",
      "fee": 0,
      "tax": 0,
      "on_hold": false,
      "settled": true,
      "created_at": 1568107224,
      "settled_at": 1568176960,
      "settlement_id": "setl_DGlQ1Rj8os78Ec",
      "posted_at": null,
      "credit_type": "default",
      "description": null,
      "notes": "Beam me up Scotty.",
      "payment_id": "pay_DEXq1pACSqFxtS",
      "settlement_utr": "1568176960vxp0rj",
      "order_id": "order_DEXpmZgffXNvuI",
      "order_receipt": null,
      "method": "card",
      "card_network": "MasterCard",
      "card_issuer": "KARB",
      "card_type": "credit",
      "dispute_id": null
    },
    {
      "entity_id": "trf_DEUoCEtdsJgvl7",
      "type": "transfer",
      "debit": 100296,
      "credit": 0,
      "amount": 100000,
      "currency": "INR",
      "fee": 296,
      "tax": 46,
      "on_hold": false,
      "settled": true,
      "created_at": 1567681786,
      "settled_at": 1568176960,
      "settlement_id": "setl_DGlQ1Rj8os78Ec",
      "posted_at": null,
      "credit_type": "default",
      "description": null,
      "notes": null,
      "payment_id": "pay_DEApNNTR6xmqJy",
      "settlement_utr": "1568176960vxp0rj",
      "order_id": null,
      "order_receipt": null,
      "method": null,
      "card_network": null,
      "card_issuer": null,
      "card_type": null,
      "dispute_id": null
    },
    {
      "entity_id": "adj_EhcHONhX4ChgNC",
      "type": "adjustment",
      "debit": 0,
      "credit": 1012,
      "amount": 1012,
      "currency": "INR",
      "fee": 0,
      "tax": 0,
      "on_hold": false,
      "settled": true,
      "created_at": 1567681786,
      "settled_at": 1568176960,
      "settlement_id": "setl_DGlQ1Rj8os78Ec",
      "posted_at": null,
      "description": "test reason",
      "notes": null,
      "payment_id": null,
      "settlement_utr": null,
      "order_id": null,
      "order_receipt": null,
      "method": null,
      "card_network": null,
      "card_issuer": null,
      "card_type": null,
      "dispute_id": null
    }
  ]
}
```
