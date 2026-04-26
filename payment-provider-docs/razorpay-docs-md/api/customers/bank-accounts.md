<!-- Source: https://razorpay.com/docs/api/customers/bank-accounts -->

Add or delete customer's bank account with basic details such as name, email and contact details. You can then offer various Razorpay solutions to your customers. Edit customer details as needed.

## Use Cases

1. [Add Bank Account of Customer](/razorpay-docs-md/api/customers/bank-accounts.md#1-add-bank-account-of-customer)
2. [Delete Bank Account of Customer.](/razorpay-docs-md/api/customers/bank-accounts.md#2-delete-bank-account-of-customer)

## 1. Add Bank Account of Customer

The following endpoint adds the customer's bank accounts.

POST

customers/:customer\_id/bank\_account

### Request Parameters

account\_number

`integer` Customer's bank account number. For example, `916010080000000`.

beneficiary\_name

`string` The name of the beneficiary associated with the bank account.

beneficiary\_address1

`string` The virtual payment address.

beneficiary\_email

`string` Email address of the beneficiary. For example, `gaurav.kumar@example.com`.

beneficiary\_mobile

`integer` Mobile number of the beneficiary.

beneficiary\_city

`string` The name of the city of the beneficiary.

beneficiary\_state

`string` The state of the beneficiary.

beneficiary\_country

`string` The country of the beneficiary.

beneficiary\_pin

`integer` The pin code of the beneficiary's address.

ifsc\_code

`string` The IFSC code of the bank branch associated with the account.

### Response Parameters

bank\_accounts

`array` An array containing bank account details.

id

`string` Unique identifier of the bank account.

entity

`string` The type of entity, which in this case is `bank_account`.

ifsc

`string` The IFSC code of the bank branch associated with the account.

bank\_name

`string` The name of the bank.

name

`string` The name associated with the bank account.

notes

`object` Set of key-value pairs that can be used to store additional information about the payment.

account\_number

`integer` Customer's bank account number. For example, `916010080000000`.

## 2. Delete Bank Account of Customer

You can also delete customer's bank accounts. Use the following endpoint to delete.

DELETE

customers/:customer\_id/bank\_account/:bank\_id

### Path Parameters

customer\_id

mandatory

`string` Customer id of the customer whose bank account is to be deleted.

bank\_id

mandatory

`string` The bank\_id that needs to be deleted.

### Response Parameters

id

`string` Bank\_id that is deleted.

ifsc

`string` IFSC code of bank.

bank\_name

`string` Bank name.

name

`string` Account holder name.

account\_number

`string` Bank account number.

status

`string` Status of the bank in bank\_account entity.
