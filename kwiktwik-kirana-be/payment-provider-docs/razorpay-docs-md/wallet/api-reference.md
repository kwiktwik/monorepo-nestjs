<!-- Source: https://razorpay.com/docs/payments/wallet/api-reference -->

**Watch Out!**

We have discontinued support for this product, effective April 2023. As a result, we will not be onboarding new users for this product anymore.

Refer to the [API Reference](/razorpay-docs-md/api/index.md) guide to understand the basic concepts of API.

**Handy Tips**

Before creating a wallet, you must create a [customer](/razorpay-docs-md/api/customers.md#create-a-customer).

## Transfer a Payment

Use the below endpoint to transfer a payment to a customer's wallet. If the customer wallet entity does not exist, the `transfers` endpoint creates a wallet for a `customer_id`. The amount which you transfer gets credited to this wallet.

POST

/payments/:id/transfers

When the request is successful, the wallet gets credited with the transferred amount and the corresponding `customer_transaction` and `transfer` entities are created.

The following validations apply to the payment transfer request:

- The transfer amount can be set to a value less than or equal to the payment amount captured.
- The transfer amount is debited from your account balance. The transfer will fail if there is insufficient balance.
- You can only request for a transfer to one `customer_id` in an API call.
- The transfer request fails if the `customer_id` provided is invalid or does not exist.

**Watch Out!**

The wallet is created only if the customer’s contact number is a valid Indian mobile number, failing which, an error is returned.

RequestResponse

copy

```bash
curl -X POST https://api.razorpay.com/v1/payments/pay_00000000000001/transfers \
-u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-H 'content-type: application/json' \
-d '{
  "transfers": [
    {
      "customer": "cust_MrZYbZYSmbUxz9",
      "amount": 100,
      "currency": "INR",
      "notes": {
        "notes_key_1": "Tea, Earl Grey, Hot",
        "notes_key_2": "Tea, Earl Grey decaf"
      }
    }
  ]
}'
```

#### Path Parameters

id

mandatory

`string` Unique identifier for the payment which you want to transfer to the wallet. For example, `pay_00000000000001`.

#### Request Parameters

transfers

Details regarding the transfer.

customer

mandatory

`string` Unique identifier of the customer to whom the wallet is linked.

amount

mandatory

`integer` The amount to be transferred to the linked account. For an amount of ₹200.35, pass `20035`.

currency

mandatory

`string` The currency in which the transfer should be made. We support only `INR` for Route transactions.

notes

optional

`object` Key-value pairs you can attach to an entity for internal reference. Maximum 15 pairs, 256 characters each. For example,`"note_key": "Beam me up Scotty”`.

#### Response Parameters

id

`string` Unique identifier of the transfer. For example, `trf_00000000000001`.

entity

`string` The name of the entity. Here, it is `transfer`.

status

`string` The status of the transfer. Possible values:

- `created`
- `processed`
- `failed`

**Watch Out!**

The values `processed` and `failed` are relevant only for users who have subscribed to specific webhooks. Ensure that you have subscribed to the following webhooks to utilize these values:

- `transfer_processed`
- `transfer_failed`

source

`string` Unique identifier of the transfer source. For example, `pay_00000000000001`.

recipient

`string` Unique identifier of the customer to whom the transfer was made. For example, `cust_00000000000001`.

amount

`integer` The amount, in paise, to be transferred to the wallet. For an amount of ₹200.35, pass `20035`.

currency

`string` 3-letter ISO currency code for the transfer. Currently, we only support `INR`.

amount\_reversed

`integer` Amount reversed from this transfer for refunds.

fees

`integer` Fees, in paise, charged for the transfer. `500` means ₹5.

tax

`integer` Tax, in paise, deducted for the fee charged. `200` means ₹2.

notes

`json object` Set of key-value pairs that can be associated with an entity. This can be useful for storing additional information about the entity. A maximum of 15 key-value pairs, each of 256 characters (maximum), are supported. For example, `"region": "south", "city": "bangalore"`.

linked\_account\_notes

`array` List of keys from the `notes` object which needs to be shown to linked accounts on their Dashboard. For example, `"region", "city"`. Only the keys will be shown, not values.

on\_hold

`boolean` Indicates whether the account settlement for transfer is on hold. Possible values:

- `true`: Puts the settlement on hold.
- `false`: Releases the settlement.

on\_hold\_until

`integer` Timestamp, in Unix, that indicates until when the settlement of the transfer must be put on hold. If no value is passed, and `on_hold` = 1, the settlement is put on hold indefinitely.

recipient\_settlement\_id

`string` Unique identifier of the settlement.

created\_at

`integer` Timestamp, in Unix, at which the record was created. For example, `1462887226`.

#### Webhooks

The table below lists the Webhook events you can subscribe for this API:

#### Sample Payloads

## Create a Payment to a Customer's Wallet

To create a payment to a wallet, you must:

1. [Create an Order](/razorpay-docs-md/wallet/api-reference.md#create-an-order)
2. [Create a Payment](/razorpay-docs-md/wallet/api-reference.md#create-a-payment)

### Create an Order

Use the below endpoint to create an order.

POST

/orders

#### Request Parameters

Following are the parameters to be sent in the request body:

amount

mandatory

`integer` The amount, in paise. For example, enter `69999` for ₹699.99.

currency

mandatory

`string` 3-letter ISO currency code for the payment. Currently, we only support `INR`.

receipt

optional

`string` Maximum 40 characters. User-entered reference for the order.

payment\_capture

mandatory

`boolean` Determines if payment should be automatically captured. Possible values:

- `true` (recommended): Automatically capture the payment.
- `false` (default/not recommended): You have to manually capture payments.

  Know more about [payment capture settings](/razorpay-docs-md/payments/capture-settings.md)  .

notes

optional

`object` Key-value pair that can be used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

#### Response Parameters

id

`string` The unique identifier of the Order. For example, `order_Fa8N7puWEjpoQN`.

entity

`string` Here, it is `order`.

amount

`integer` The amount, in paise. For example, `69999` means ₹699.99.

amount\_paid

`integer` The amount, in paise, paid against the Order.

amount\_due

`integer` The amount, in paise, pending against the Order.

currency

`string` 3-letter ISO currency code for the payment. Currently, we only support `INR`.

receipt

`string` User-entered reference for the order.

offer\_id

`string` Unique identifier of offers linked to the order.

status

`string` The status of the Order. Possible values:

- `created`: When you create an order it is in the `created` state. It stays in this state till a payment is attempted on it.
- `attempted`: An order moves from `created` to `attempted` state when a payment is first attempted on it. It remains in the `attempted` state till one payment associated with that order is captured.
- `paid`: After the successful capture of the payment, the order moves to the `paid` state. No further payment requests are permitted once the order moves to the `paid` state. The order stays in the `paid` state even if the payment associated with the order is refunded.

attempts

`integer` The number of payment attempts, successful and failed, that have been made against this order.

notes

`object` Key-value pair that can be used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

created\_at

`integer` Timestamp, in Unix, when this Order was created.

### Create a Payment

Use the below endpoint to create a payment for a wallet.

POST

/payments/create/openwallet

**Customer Wallet Balance**

If the customer's wallet has an insufficient balance for the requested payment, the API returns an error. The customer must [load sufficient amount in the wallet](/razorpay-docs-md/wallet/wallet-operations.md#load-a-wallet) to complete the transaction.

RequestResponse

copy

```bash
curl -X POST https://api.razorpay.com/v1/payments/create/openwallet \
-u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-H 'content-type: application/json' \
-d '{
  "method": "wallet",
  "wallet": "openwallet",
  "customer_id": "cust_FVjPW3o1BxxOsa",
  "order_id": "order_Fa8AceMp2VLhZs",
  "amount": 5000,
  "currency": "INR",
  "contact": "9876543210",
  "email": "gaurav.kumar@example.com",
  "description": "Against order #1",
  "notes": {
    "notes_key_1":"Tea, Earl Grey, Hot",
    "notes_key_2":"Tea, Earl Grey… decaf."
  }
}'
```

#### Request Parameters

method

mandatory

`string` Here, it must be `wallet`.

wallet

mandatory

`string` Here, it must be `openwallet`.

customer\_id

mandatory

`string` Unique identifier linked to the customer. For example, `cust_00000000000001`.

order\_id

mandatory

`string` Unique identifier of the order created. For example, `order_00000000000001`.

amount

mandatory

`integer` Payment amount in the smallest currency subunit. For example, if the amount to be charged is ₹299, then pass `29900` in this field.

currency

mandatory

`string` 3-letter ISO code for the currency for the payment. You can make payments in **INR** only.

contact

mandatory

`string` Contact number of the customer. For example, `9876543210`.

email

mandatory

`string` email ID of the customer. For example, `gaurav.kumar@example.com`.

description

optional

`string` Description about the payment. For example, `Payment for seaweed`.

notes

optional

`object` Key-value pairs you can attach to an entity for internal reference. Maximum 15 pairs, 256 characters each. For example, `"note_key": "Beam me up Scotty”`.

#### Response Parameter

razorpay\_payment\_id

`string` Unique identifier of the created payment. For example, `pay_00000000000001`.

razorpay\_order\_id

`string` Unique identifier of the order. For example, `order_00000000000001`.

razorpay\_signature

`string` Signature for the payment. This can be used to verify the payment. For example, `ebfc4102fc6351218e8af613235918fae4cf2ad00004781ed3fdfb35eb889f69`.

## Refund to a Wallet

Use the below endpoint to refund a payment made using the wallet.

POST

/payments/:id/refund

RequestResponse

copy

```bash
curl -X POST https://api.razorpay.com/v1/payments/pay_00000000000001/refund \
-u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-H 'content-type: application/json' \
-d '{
  "amount": 50000,
  "receipt": "Receipt #1",
  "notes": {
    "notes_key_1": "Tea, Earl Grey, Hot",
    "notes_key_2": "Tea, Earl Grey… decaf."
  }
}'
```

#### Path Parameter

id

mandatory

`string` Unique identifier of the payment which is to be refunded. For example, `pay_00000000000001`.

#### Request parameter

amount

optional

`integer` The refund amount, in paise. Pass `50000` to refund ₹500.

receipt

optional

`string` The unique identifier provided by you for your internal reference. For example, `Receipt #1`.

notes

optional

`object` Key-value pairs you can attach to an entity for internal reference. Maximum 15 pairs, 256 characters each. For example, `"note_key": "Beam me up Scotty”`.

#### Response Parameter

id

`string` Unique identifier of the refund. For example, `rfnd_EcRsvf2ayIF9mE`.

entity

`string` Indicates the type of entity. Here, it is `refund`.

amount

`integer` The refund amount, in paise. `50000` means ₹500.

currency

`string` 3-letter ISO currency code for the refund. Currently, only `INR` is allowed.

payment\_id

`string` Unique identifier of the payment for which the refund is initiated. For example, `pay_00000000000001`.

notes

`object` Key-value pairs you can attach to an entity for internal reference. Maximum 15 pairs, 256 characters each. For example, `"note_key": "Beam me up Scotty”`.

receipt

`string` User-entered reference for the order.

acquirer\_data

`array` A dynamic array consisting of a unique reference number (either RRN, ARN or UTR) that is provided by the banking partner when a refund is processed. This reference number can be used by the customer to track the status of the refund with the bank.

created\_at

`integer` Timestamp, in Unix format, when the refund was created. For example, `1462887226`.

status

`string` Indicates the state of the refund. Possible values include:

- `pending`: This state indicates that Razorpay is attempting to process the refund.
- `processed`: This is the terminal state of the refund.

speed\_requested

`string` The processing mode of the refund seen in the refund response. Possible values:

- `normal`: Refund will be processed via the normal speed. That is, 5-7 working days.
- `optimum`: Refund will be processed at an optimal speed based on Razorpay's internal fund transfer logic. That is:
  - If the refund can be processed instantly, Razorpay will do so, irrespective of the payment method used to make the payment.
  - If an instant refund is not possible, Razorpay will initiate a refund that is processed at the normal speed.

speed\_processed

`string` The mode used to process a refund. Possible values:

- `instant`: This means that the refund has been processed instantly via fund transfer.
- `normal`: The refund will take 5-7 working days.

## Direct Transfer

Use the below endpoint to create a cashback to a customer's wallet.

POST

/transfers

**Handy Tips**

The Direct Transfer endpoint does not consume `payment_id`.

RequestResponse

copy

```bash
curl -X POST https://api.razorpay.com/v1/transfers \
-u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-H 'content-type: application/json' \
-d '{
  "customer": "cust_00000000000001",
  "amount": 5000,
  "currency": "INR",
  "notes": {
    "notes_key_1": "Tea, Earl Grey, Hot",
    "notes_key_2": "Tea, Earl Grey… decaf."
  }
}'
```

#### Request Parameters

customer\_id

mandatory

`string` Unique identifier linked to the customer. For example,  `cust_00000000000001`.

amount

mandatory

`integer` The amount (in paise) to be transferred to the linked account. For example, for an amount of ₹200.35, the value of this field should be 20035.

currency

mandatory

`string` 3-letter ISO currency code for the transaction. Currently, only `INR` is allowed.

notes

optional

`object` Key-value pairs you can attach to an entity for internal reference. Maximum 15 pairs, 256 characters each. For example,`"note_key": "Beam me up Scotty”`.

#### Response Parameters

id

`string` Unique identifier of the transfer. For example, `trf_00000000000001`.

entity

`string` The name of the entity. Here, it is `transfer`.

source

`string` Unique identifier of the transfer source. Here, the source is `payment`.

recipient

`string` Unique identifier of the customer to whom the transfer was made. For example, `cust_00000000000001`.

amount

`integer` The amount, in paise, to be transferred to the wallet. For an amount of ₹200.35, pass `20035`.

currency

`string` 3-letter ISO currency code for the transfer. Currently, we only support `INR`.

amount\_reversed

`integer` Amount reversed from this transfer for refunds.

fees

`integer` Fees, in paise, charged for the transfer. `500` means ₹5.

tax

`integer` Tax, in paise, deducted for the fee charged. `200` means ₹2.

on\_hold

`boolean` Indicates whether the account settlement for transfer is on hold. Possible values:

- `true`: Puts the settlement on hold.
- `false`: Releases the settlement.

on\_hold\_until

`integer` Timestamp, in Unix, that indicates until when the settlement of the transfer must be put on hold. If no value is passed, and `on_hold` = 1, the settlement is put on hold indefinitely.

recipient\_settlement\_id

`string` Unique identifier of the settlement.

created\_at

`integer` Timestamp, in Unix, at which the transfer was created. For example, `1462887226`.

notes

`json object` Set of key-value pairs that can be associated with an entity. This can be useful for storing additional information about the entity. A maximum of 15 key-value pairs, each of 256 characters (maximum), are supported. For example, `"region": "south", "city": "bangalore"`.

linked\_account\_notes

`array` List of keys from the `notes` object which needs to be shown to linked accounts on their Dashboard. For example, `"region", "city"`. Only the keys will be shown, not values.

created\_at

`integer` Timestamp, in Unix, at which the transfer was processed. For example, `1462887226`.

## Payout from Customer's Wallet

Payouts allow customers to transfer funds directly from their wallets to any of the linked bank (fund) accounts.

To make a payout to a customer's wallet, you must:

1. [Create a Fund Account](/razorpay-docs-md/wallet/api-reference.md#create-a-fund-account)
2. [Create a Payout](/razorpay-docs-md/wallet/api-reference.md#create-a-payout)

### Create a Fund Account

You can use the below endpoint to create a fund account for a customer.

POST

/fund\_accounts

Example RequestResponse

copy

```bash
curl -u <YOUR_KEY>:<YOUR_SECRET> \
-X POST https://api.razorpay.com/v1/fund_accounts \
-H "Content-Type: application/json" \
-d '{
  "customer_id":"cust_Aa000000000001",
  "account_type":"bank_account",
  "bank_account":{
    "name":"Gaurav Kumar",
    "account_number":"11214311215411",
    "ifsc":"HDFC0000053"
  }
}'
```

#### Request Parameters

customer\_id

mandatory

`string` This is the unique ID linked to a customer. For example, `cust_Aa000000000001`.

account\_type

mandatory

`string` The type of account to be linked to the customer ID. Here, it will be `bank_account`.

bank\_account

Customer bank account details.

name

mandatory

`string` Name of account holder as per bank records. For example, `Gaurav Kumar`.

ifsc

mandatory

`string` Customer's bank IFSC. For example, `HDFC0000053`.

account\_number

mandatory

`string` Beneficiary account number. For example, `11214311215411`.

#### Response Parameters

id

`string` The unique ID linked to the fund account. For example, `fa_Aa000000000001`.

entity

`string` The name of the Razorpay entity. Here, it will be `fund_account`.

customer\_id

`string` The unique identifier for a customer. For example, `cust_Aa000000000001`.

account\_type

`string` The type of account linked to the customer ID. Here, it will be `bank_account`.

bank\_account

Customer bank account details.

name

`string` Name of account holder as per bank records. For example, `Gaurav Kumar`.

account\_number

`string` Beneficiary account number. For example, `11214311215411`.

ifsc

`string` Customer's bank IFSC. For example, `HDFC0000053`.

bank\_name

`string` Beneficiary bank name. For example `HDFC`.

active

`string` Status of the fund account. Possible values:

- `true`: Fund account is active.
- `false`: Fund account is inactive.

created\_at

`integer` The timestamp, in Unix, from when the account was created at Razorpay. For example, `1543650891`.

### Create a Payout

Use the below endpoint to create a payout. Using a payout you can instantly transfer funds from a customer's wallet to the customer's fund account.

POST

/customers/:cust\_id/payouts

RequestResponse

copy

```bash
curl -u <YOUR_KEY>:<YOUR_SECRET> \
-X POST https://api.razorpay.com/v1/customers/cust_FVjPW3o1BxxOsa/payouts \
-H "Content-Type: application/json" \
-d '{
  "fund_account_id": "fa_FaSwoEzHbedyPz",
  "purpose": "refund",
  "amount": 100,
  "currency": "INR",
  "notes": {
    "notes_key_1": "Tea, Earl Grey, Hot",
    "notes_key_2": "Tea, Earl Grey… decaf."
  }
}'
```

#### Path Parameter

cust\_id

mandatory

`string` The unique identifier of the customer to whom the fund account is linked. For example, `cust_FVjPW3o1BxxOsa`.

#### Request Parameters

fund\_account\_id

mandatory

`string` The unique identifier of the fund account to which the payout is to be made.

purpose

mandatory

`string` The reason for the payout. For example, `refund`.

amount

mandatory

`integer` The payout amount (in paise). `500` means ₹5.

currency

mandatory

`string` 3-letter ISO currency code for the payout. Currently, only `INR` is allowed.

notes

optional

`object` Key-value pairs you can attach to an entity for internal reference. Maximum 15 pairs, 256 characters each. For example,`"note_key": "Beam me up Scotty”`.

#### Response Parameters

id

`string` Unique identifier of the payout. For example, `pout_00000000000001`.

entity

`string` The name of the Razorpay entity. Here it is `payout`.

customer\_id

`string` The unique identifier of the customer to whom the fund account is linked. For example, `cust_FVjPW3o1BxxOsa`.

fund\_account\_id

`string` Unique identifier for the fund account to which the payout is being made. For example, `fa_00000000000001`.

amount

`integer` The payout amount, in paise. `500` means ₹5.

currency

`string` 3-letter ISO currency code for the payout. Currently, only `INR` is allowed.

notes

`object` Key-value pair that can be used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

fees

`integer` Fees, in paise, charged for the transfer. `500` means ₹5.

tax

`integer` Tax, in paise, deducted for the fee charged. `200` means ₹2.

status

`string` The status of the payout. The possible values are:

- `processing`
- `processed`
- `reversed`

purpose

`string` The reason for the payout. For example, `refund`.

utr

`string` A unique transaction reference (UTR) number generated for all transactions. You can obtain UTR from the [`payout.updated` webhook payload](/docs/webhooks/).

reference\_id

`string` Maximum length is 40 characters. A user-generated reference given to the payout. For example, `Acme Transaction ID 12345`. You can use this field to store your own transaction ID, if any.

narration

`string` Maximum length 30 characters. Allowed characters: a-z, A-Z, 0-9 and space. This is a custom note that also appears on the bank statement.

**Handy Tips**

- If no value is passed for this parameter, it defaults to the Merchant Billing Label.
- Ensure that the most important text forms the first 9 characters as banks may truncate the rest as per their standards.

batch\_id

`string` This parameter is populated if the contact was created as part of a bulk upload. For example, `batch_00000000000001`.

failure\_reason

`string` The reason for the payout failing.

created\_at

`integer` Timestamp, in UNIX, when the payout was created.

fee\_type

`string` The fee type for the payout.

## Fetch Wallet Balance

Use the below endpoint to fetch the customer's wallet balance and the details about current usage.

GET

/customers/:id/balance

**Handy Tips**

The wallet APIs always return the amount in paise.

Example RequestResponse

copy

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X GET https://api.razorpay.com/v1/customers/cust_00000000000001/balance
```

#### Path Parameter

id

mandatory

`string` Unique identifier for the customer to whom the wallet is linked. For example, `cust_00000000000001`.

#### Response Parameters

balance

`integer` Balance in the wallet, in paise. `500` means ₹5.

monthly\_usage

`integer` Monthly usage for the wallet. `500` means ₹5.

max\_balance

`integer` Maximum balance in the wallet. `500` means ₹5.

## Fetch Wallet Statement

Use the below endpoint to fetch the transaction statement of a customer’s wallet associated with a `customer_id`.

GET

/customers/:id/statement

Retrieves the transaction statement of the customer’s wallet using the customer `id`.

Example RequestResponse

copy

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X GET https://api.razorpay.com/v1/customers/cust_00000000000001/statement
```

#### Path Parameter

id

mandatory

`string` Unique identifier of the customer to whom the wallet is linked. For example, `cust_00000000000001`.

#### Query Parameters

from

`integer` The timestamp, in Unix, from when the statement is to be fetched.

to

`integer` The timestamp, in Unix, till when the statement is to be fetched.

count

`integer` The number of entries to be fetched. Default value is 10. Maximum value is 100. This can be used for pagination, in combination with `skip`.

skip

`integer` The number of entries to be skipped. Default value is 0. This can be used for pagination, in combination with `count`.

#### Response Parameters

id

`string` Unique identifier for the transaction. For example, `ctxn_00000000000001`.

entity

`string` Name of the entity being fetched. Here, it is `customer_transaction`.

source

`string` Unique identifier of the transfer source. For example, `pay_00000000000001`.

status

`string` The status of the transaction. For example, `completed`.

type

`string` Type of transaction. Possible values:

- `transfer`
- `refund`

amount

`integer` Transaction amount, in paise. `500` means ₹5.

currency

`string` 3-letter ISO currency code.

credit

`integer` Credited amount, in paise. `500` means ₹5.

debit

`integer` Debited amount, in paise. `500` means ₹5.

balance

`integer` Wallet balance updated after the transaction, in paise. `500` means ₹5.

description

`string` Maximum 255 characters. Description for the transaction. For example, `Against order #1`.

created\_at

`integer` Timestamp, in Unix, at which the record was created. For example, `1462887226`.
