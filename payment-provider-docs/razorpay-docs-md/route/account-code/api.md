<!-- Source: https://razorpay.com/docs/payments/route/account-code/api -->

The `account_code` parameter must be passed only in Transfers API.

## Postman Collection

We have a Postman collection to make the integration quicker and easier. Click the **Download Postman Collection** button below to get started. [Download Postman Collection](https://app.getpostman.com/run-collection/e35a6d91a76a57519889)

## Instructions for Using Postman Collection

- All Razorpay APIs are authenticated using Basic Authentication.
  - [Generate API Keys](/razorpay-docs-md/api/authentication.md#generate-api-keys)

    from the Dashboard.
  - Add your API Keys in Postman. Selected the required API → Auth → Type = Basic Auth → Username = [Your\_Key\_ID]; Password = [Your\_Key\_secret]

  ![](https://razorpay.com/docs/payments/route/account-code/build/browser/assets/images/api-postman_basic_auth.gif)
- Some APIs in the collection require data specific to your account either in the request body or as path or query parameters.
  - For example, the create Transfers via Payments API requires you to add the `pay_id` as a path parameter in the endpoint.
  - These parameters are enclosed in {} in the collection. For example, {pay\_id}.
  - The API throws an error if this value is incorrect or does not exist in your system.

## Transfer Entity

The attributes of the `transfer` entity are listed below:

id

`string` Unique identifier of the transfer.

entity

`string` The name of the entity. Here, it is `transfer`.

source

`string` Unique identifier of the transfer source. The source can be a `payment` or an `order`.

recipient

`string` Unique identifier of the transfer destination, that is, the linked account.

account\_code

`string` An alternative to the linked account ID.
- Minimum character length is 3 and maximum is 20.
- Alphanumeric (A-Z, a-z, 0-9), periods (.), dashes(-) and underscores(\_). Alphabets are case-sensitive.

amount

`integer` The amount to be transferred to the linked account, in paise. For example, for an amount of ₹200.35, the value of this field should be 20035.

currency

`string` ISO currency code. We support route transfers only in `INR`.

amount\_reversed

`integer` Amount reversed from this transfer for refunds.

notes

`json object` Set of key-value pairs that can be associated with an entity. This can be useful for storing additional information about the entity. A maximum of 15 key-value pairs, each of 256 characters (maximum), are supported. For example, `"region": "south", "city": "bangalore"`.

linked\_account\_notes

`array` List of keys from the `notes` object which needs to be shown to linked accounts on their Dashboard. For example, `"region", "city"`. Only the keys will be shown, not values.

on\_hold

`boolean` Indicates whether the account settlement for transfer is on hold. Possible values:

- `true`: Puts the settlement on hold.
- `false`: Releases the settlement.

on\_hold\_until

`integer` Timestamp, in Unix format, that indicates until when the settlement of the transfer must be put on hold. If no value is passed, the settlement is put on hold indefinitely.

recipient\_settlement\_id

`string` Unique identifier of the settlement.

created\_at

`integer` Timestamp, in Unix, at which the record was created.

## Create Transfers from Orders

Use the following endpoint to create transfers from orders.

POST

/orders

You can set up transfer of funds right at the time of order creation using the Orders API. This can be done by passing the `transfers` parameters as part of the Order API request body.

POST

/orders

### Request Parameters

amount

mandatory

`integer` The transaction amount, in paise. For example, for an amount of ₹299.35, the value of this field should be 29935.

currency

mandatory

`string` The currency in which the transaction should be made. We support only `INR` for Route transactions.

receipt

optional

`string` Unique identifier that you can use for internal reference.

transfers

`json object` Details regarding the transfer.

account

mandatory if

`string` Unique identifier of the linked account to which the transfer is to be made.

account\_code

mandatory if

`string` An alternative unique identifier of the linked account ID.

amount

mandatory

`integer` The amount to be transferred to the linked account. For example, for an amount of ₹200.35, the value of this field should be 20035. This amount cannot exceed the order amount.

currency

mandatory

`string` The currency in which the transfer should be made. We support only `INR` for Route transactions.

notes

optional

`json object` Set of key-value pairs that can be associated with an entity. This can be useful for storing additional information about the entity. A maximum of 15 key-value pairs, each of 256 characters (maximum), are supported. For example, `"region": "south", "city": "bangalore"`.

linked\_account\_notes

optional

`array` List of keys from the `notes` object which needs to be shown to linked accounts on their Dashboard. For example, `"region", "city"`. Only the keys will be shown, not values.

on\_hold

optional

`boolean` Indicates whether the account settlement for transfer is on hold. Possible values:

- `true`: Puts the settlement on hold.
- `false`: Releases the settlement.

on\_hold\_until

optional

`integer` Timestamp, in Unix format, that indicates until when the settlement of the transfer must be put on hold. If no value is passed, the settlement is put on hold indefinitely.

**Note**

Pass either account or account\_code. Do not pass both the parameters.

### Response Parameters

id

`string` Unique identifier of the Order created.

entity

`string` The name of the entity. Here, it is `order`.

amount

`integer` The Order amount, in paise. For example, for an amount of ₹299.35, the value of this field should be 29935.

amount\_paid

`integer` The amount paid against the Order.

amount\_due

`integer` The amount pending against the Order.

currency

`string` The currency in which the order should be created. We support only `INR` for Route transactions.

receipt

`string` Unique identifier that you can use for internal reference.

status

`string` The status of the Order. Possible values:

- created
- attempted
- paid

notes

`json object` Set of key-value pairs that can be associated with an entity. This can be useful for storing additional information about the entity. A maximum of 15 key-value pairs, each of 256 characters (maximum), are supported.

created\_at

`integer` Timestamp, in Unix, that indicates when this Order was created.

transfers

`json object` Details regarding the transfer.

recipient

`string` Unique identifier of the linked account to which the transfer is to be made.

account\_code

`string` An alternative unique identifier of the linked account ID.

amount

`integer` The amount to be transferred to the linked account, in paise. For example, for an amount of ₹200.35, the value of this field should be 20035. This amount cannot exceed the order amount.

currency

`string` The currency in which the transfer should be made. We support only `INR` for Route transactions.

notes

`json object` Set of key-value pairs that can be associated with an entity. This can be useful for storing additional information about the entity. A maximum of 15 key-value pairs, each of 256 characters (maximum), are supported. For example, `"region": "south", "city": "bangalore"`.

linked\_account\_notes

`array` List of keys from the `notes` object which needs to be shown to linked accounts on their Dashboard. For example, `"region", "city"`. Only the keys will be shown, not values.

on\_hold

`boolean` Indicates whether the account settlement for transfer is on hold. Possible values:

- `true`: Puts the settlement on hold.
- `false`: Releases the settlement.

on\_hold\_until

`integer` Timestamp, in Unix, that indicates until when the settlement of the transfer must be put on hold. If no value is passed, the settlement is put on hold indefinitely.

**Notes**

- You cannot create transfers on an order which has `partial_payment` parameter enabled. Ensure that this parameter is set to `0`.
- You cannot create transfers on an order for international currencies. Currently, this feature only supports orders created using INR.

## Create Transfers from Payments

You can create and capture payments in the regular payments flow, using [Razorpay Checkout](/razorpay-docs-md/payment-gateway/web-integration/standard.md) and [Payment APIs](/razorpay-docs-md/api/payments.md#capture-a-payment).

To disburse payments using Razorpay Route, there is an additional step in the payment flow called transfers which is described below:

1. Customer pays the amount via normal payment flow.
2. Once the payment is `captured`, you can initiate a transfer to linked accounts with a transfer API call. You have to specify the details of the `account_id` and `amount`.

The following endpoint transfers a `captured` payment to one or more linked accounts using `account_id`. On a successful transfer, a response will be generated with a collection of transfer entities created for the payment.

POST

/payments/:id/transfers

**Transfer Requirements**

- Your account must have sufficient funds to process the transfer to the linked account. The transfer will fail in case of insufficient funds.
- Only `captured` payments can be transferred.
- You can create more than one transfer on a `payment_id`. This holds good as long as the total transfer amount does not exceed the captured payment amount.
- A transfer cannot be requested on a payment once a refund has been initiated.

In the sample request given, transfers to multiple linked accounts are specified. The payments transferred to the linked accounts will be settled to their respective bank accounts as per the pre-defined `settlement_period`.

### Path Parameter

id

mandatory

`string` Unique identifier of the payment on which the transfer must be created.

### Request Parameters

transfers

`json object` Details regarding the transfer.

account

mandatory if

`string` Unique identifier of the linked account to which the transfer is to be made.

account\_code

mandatory if

`string` An alternative unique identifier of the linked account ID.

amount

mandatory

`integer` The amount to be transferred to the linked account. For example, for an amount of ₹200.35, the value of this field should be 20035.

currency

mandatory

`string` The currency in which the transfer should be made. We support only `INR` for Route transactions.

notes

optional

`json object` Set of key-value pairs that can be associated with an entity. This can be useful for storing additional information about the entity. A maximum of 15 key-value pairs, each of 256 characters (maximum), are supported. For example, `"region": "south", "city": "bangalore"`.

linked\_account\_notes

optional

`array` List of keys from the `notes` object which needs to be shown to linked accounts on their Dashboard. For example, `"region", "city"`. Only the keys will be shown, not values.

on\_hold

`boolean` Indicates whether the account settlement for transfer is on hold. Possible values:

- `true`: Puts the settlement on hold.
- `false`: Releases the settlement.

on\_hold\_until

`integer` Timestamp, in Unix, that indicates until when the settlement of the transfer must be put on hold. If no value is passed, the settlement is put on hold indefinitely.

**Note**

Pass either account or account\_code. Do not pass both the params.

### Response Parameters

The response parameters are same as the [transfer entity parameters](/razorpay-docs-md/route/account-code/api.md#transfer-entity).

## Direct Transfers

You can transfer funds to your linked accounts directly from your account balance using the Direct Transfers API.

POST

/transfers

This API creates a direct transfer of funds from your account to linked account.
On successful creation, the API responds with the created `transfer` entity.

### Request Parameters

account

mandatory if

`string` Unique identifier of the linked account to which the transfer must be made.

account\_code

mandatory if

`string` Alternate unique identifier of the linked account to which the transfer must be made.

amount

mandatory

`integer` The amount (in paise) to be transferred to the linked account. For example, for an amount of ₹200.35, the value of this field should be 20035.

currency

mandatory

`string` The currency used in the transaction. We support only `INR` for Route transactions.

notes

optional

`json object` Set of key-value pairs that can be associated with an entity. This can be useful for storing additional information about the entity. A maximum of 15 key-value pairs, each of 256 characters (maximum), are supported.

**Note**

Pass either account or account\_code. Do not pass both the params.

The response parameters are same as the [transfer entity parameters](/razorpay-docs-md/route/account-code/api.md#transfer-entity).

## Webhook

The `account_code` parameter appears in the `transfer.processed` event payload.
