<!-- Source: https://razorpay.com/docs/payments/smart-collect/va-vpa-qr/api/fetch -->

You can retrieve details of Customer Identifiers and payments made to Customer Identifiers using these APIs.

APIs are available to:

- [Fetch Customer Identifier by ID](/razorpay-docs-md/smart-collect/va-vpa-qr/api/fetch.md#fetch-virtual-account-by-id)
- [Fetch All Customer Identifiers](/razorpay-docs-md/smart-collect/va-vpa-qr/api/fetch.md#fetch-all-virtual-accounts)
- [Fetch Payments made to a Customer Identifier](/razorpay-docs-md/smart-collect/va-vpa-qr/api/fetch.md#fetch-payments-made-to-a-virtual-account)
- [Fetch Payment Details using ID and Transfer Method](/razorpay-docs-md/smart-collect/va-vpa-qr/api/fetch.md#fetch-payment-details-using-id-and-transfer-method)

## Fetch Customer Identifier by ID

GET

/virtual\_accounts/:id

Retrieves a specific Customer Identifier using its ID.

## Path Parameter

id

mandatory

`string` The unique identifier of the virtual account whose details are to be fetched.

## Fetch All Customer Identifiers

GET

/virtual\_accounts

Retrieves all the Customer Identifiers that are created by you.

## Query Parameters

from

`integer` Timestamp, in seconds, from when virtual accounts are to be fetched.

to

`integer` Timestamp, in seconds, till when virtual accounts are to be fetched.

count

`integer` Number of virtual accounts to be fetched. The default value is 10 and the maximum value is 100. This can be used for pagination, in combination with `skip`.

skip

`integer` Number of records to be skipped while fetching the virtual accounts. This can be used for pagination, in combination with `count`.

## Fetch Payments made to a Customer Identifier

GET

/virtual\_accounts/:id/payments

Retrieves all the payments made to a specific Customer Identifier for a given ID.

## Path Parameter

id

mandatory

`string` The unique identifier of the virtual account for which the payment details are to be fetched.

The response parameters are the same as those mentioned in [Fetch a Payment API](/razorpay-docs-md/api/payments/fetch-with-id.md).

## Query Parameters

from

`integer` Timestamp, in seconds, from when payments are to be fetched.

to

`integer` Timestamp, in seconds, till when payments are to be fetched.

count

`integer` Number of payments to be fetched. The default value is 10 and the maximum value is 100. This can be used for pagination, in combination with `skip`.

skip

`integer` Number of records to be skipped while fetching the payments. This can be used for pagination, in combination with `count`.

## Fetch Payment Details using ID and Transfer Method

Retrieve the payment details for a given payment ID and transfer method.

### Bank Transfer

GET

/payments/:id/bank\_transfer

Retrieves the bank transfer details of a given payment ID.

**Note**

If Razorpay does not receive the bank account information of the customer from the remitting bank, the `payer_bank_account` key will be set to null.

### Path Parameter

id

mandatory

`string` The unique identifier of the payment made to the virtual account.

### Response Parameters

id

`string` The unique identifier of the bank transfer.

entity

`string` The name of the entity. Here, it is `bank_transfer`.

payment\_id

`string` The unique identifier of the payment.

mode

`string` The mode of bank transfer used. Possible values are:

- `NEFT`

- `RTGS`

- `IMPS`

- `UPI`

bank\_reference

`string` Unique reference number provided by the bank for the transaction.

payer\_bank\_account

`object` The payer bank account details from which payment is received.

id

`string` The unique identifier of the customer's bank account.

entity

`string` The name of the entity. Here, it is `bank_account`.

ifsc

`string` The IFSC associated with the bank account.

bank\_name

`string` The name of the bank in which the customer has an account.

notes

`object` Any custom notes added to the virtual bank account.

account\_number

`string` The unique account number of the customer.

virtual\_account\_id

`string` The unique identifier of the virtual account.

virtual\_account

`object` Details of the virtual account.

id

`string` The unique identifier of the virtual account.

name

`string` The `merchant billing label` as it appears on Dashboard.

entity

`string` The name of the entity. Here, it is `virtual account`.

status

`string` Indicates the status of the virtual account. Possible values are:
- `active`
- `closed`

description

`string` A brief description about the virtual account.

amount\_paid

`integer` The amount paid by the customer to the virtual account.

notes

`object` Any custom notes added during the creation of the virtual account.

customer\_id

`string` The unique identifier of the customer the virtual account is linked with. For more details, refer to the [Customers API](/razorpay-docs-md/api/customers.md).

receivers

`object` Configuration of desired receivers for the virtual account.

id

`string` The unique identifier of the virtual bank account. For example, `ba_Di5gbQsGn0QSz3`.

entity

`string` The name of the entity. Here, it is `bank_account`.

ifsc

`string` The IFSC for the virtual bank account created. For example, `RATN0VAAPIS`.

bank\_name

`string` The bank associated with the virtual bank account. For example, `RBL Bank`.

account\_number

`string` The unique account number provided by the bank. For example, `1112220061746877`.

name

`string` The `merchant billing label` as it appears on Dashboard.

notes

`object` Any custom notes added during the creation of the virtual account..

close\_by

`integer` UNIX timestamp at which the virtual account is scheduled to be automatically closed. The time must be at least 15 minutes after current time. The date range can be set till `2147483647` in UNIX timestamp format (equivalent to Tuesday, January 19, 2038 8:44:07 AM GMT+05:30).

**Note**

:
Any request beyond `2147483647` UNIX timestamp will fail.

closed\_at

`integer` UNIX timestamp at which the virtual account is automatically closed.

created\_at

`integer` UNIX timestamp at which the virtual account was created.

### UPI

GET

/payments/:id/upi\_transfer

Retrieves the UPI transfer details of a given payment ID.

### Path Parameter

id

mandatory

`string` The unique identifier of the payment made to the virtual account.

### Response Parameters

id

`string` The unique identifier of the UPI transfer.

entity

`string` The name of the entity. Here, it is `upi_transfer`.

amount

`integer` The amount paid by the customer.

payer\_vpa

`string` The UPI ID of the customer that is used to make the payment.

payer\_bank

`string` The name of the customer's bank.

payer\_account

`string` The bank account number of the customer that is linked to the UPI ID.

payer\_ifsc

`string` The IFSC associated with the bank account.

payment\_id

`string` The unique identifier of the payment made by the customer.

npci\_reference\_id

`string` The unique reference number provided by NPCI for the payment.

virtual\_account\_id

`string` The unique identifier of the virtual account.

virtual\_account

`object` Details of the virtual account.

id

`string` The unique identifier of the virtual account.

name

`string` The `merchant billing label` as it appears on Dashboard.

entity

`string` The name of the entity. Here, it is `virtual account`.

status

`string` Indicates the status of the virtual account. Possible values are:
- `active`
- `closed`

description

`string` A brief description about the virtual account.

amount\_paid

`integer` The amount paid by the customer into the virtual account.

notes

`object` Any custom notes added during the creation of the virtual account.

customer\_id

`string` The unique identifier of the customer the virtual account is linked with. For more details, refer to the [Customers API](/razorpay-docs-md/api/customers.md).

receivers

`object` Configuration of desired receivers for the virtual account.

id

`string` The unique identifier of the virtual UPI ID. For example, `vpa_CkTmLXqVYPkbxx`.

entity

`string` The name of the entity. Here, it is `vpa`.

username

`string` The unique identifier which forms the first half of the virtual UPI ID. For example, `rpy.payto00000gaurikumari`.

handle

`string` The bank name that forms the second half of the virtual UPI ID. For example, `icici`.

address

`string` The UPI ID that combines the `username` and the `handle` with the `@` symbol. For example, `rpy.payto00000gaurikumari@icici`. This parameter appears in the response only when `vpa` is passed as the receiver `type`.

close\_by

`integer` UNIX timestamp at which the virtual account is scheduled to be automatically closed. The time must be at least 15 minutes after current time. The date range can be set till `2147483647` in UNIX timestamp format (equivalent to Tuesday, January 19, 2038 8:44:07 AM GMT+05:30).

**Note**

:
Any request beyond `2147483647` UNIX timestamp will fail.

closed\_at

`integer` UNIX timestamp at which the virtual account is automatically closed.

created\_at

`integer` UNIX timestamp at which the virtual account was created.
