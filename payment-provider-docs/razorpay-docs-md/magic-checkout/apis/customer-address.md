<!-- Source: https://razorpay.com/docs/payments/magic-checkout/apis/customer-address -->

Use this API to upload customers' billing and shipping addresses in bulk.

## Sample Code

POST

/customers/addresses

### Request Parameters

email

mandatory

`string` The customer's email address.

contact

mandatory

`string` The customer's phone number.

shipping\_address

mandatory

`object` The customer's shipping address details.

name

mandatory

`string` The customer's name.

line1

mandatory

`string` The customer's address.

line2

optional

`string` Additional line for the customer's address.

zipcode

mandatory

`string` The customer's ZIP code.

city

mandatory

`string` The name of the city.

state

mandatory

`string` The name of the state.

tag

mandatory

`string` The address tag. For example, `Home`, `Office`, and so on.

landmark

optional

`string` Nearest landmark to the delivery address.

primary

optional

`boolean` Indicates whether this is the customer's primary shipping address. Possible values:

- `true`: It is the customer's primary shipping address.
- `false`: It is not the customer's primary shipping address.

billing\_address

mandatory

`object` The customer's billing address details.

name

mandatory

`string` The customer's name.

line1

mandatory

`string` The customer's address.

line2

optional

`string` Additional line for the customer's address.

zipcode

mandatory

`string` The customer's ZIP code.

city

mandatory

`string` The name of the city.

state

mandatory

`string` The name of the state.

tag

mandatory

`string` The address tag. For example, `Home`, `Office`, and so on.

landmark

optional

`string` Nearest landmark to the delivery address.

primary

optional

`boolean` Indicates whether this is the customer's primary billing address. Possible values:

- `true`: It is the customer's primary billing address.
- `false`: It is not the customer's primary billing address.

### Response Parameters

shipping\_address

`object` Details of the customer's shipping address.

entity\_type

`string` The name of the entity. Here, it is `customer`.

entity\_id

`string` The unique identifier of the entity.

id

`string` The unique identifier of the shipping address.

billing\_address

`object` Details of the customer's billing address.

entity\_type

`string` The name of the entity. Here, it is `customer`.

entity\_id

`string` The unique identifier of the entity.

id

`string` The unique identifier of the billing address.

### Validation Error Parameters

error

`object` The error object.

code

`string` Type of the error.

description

`string` Descriptive text about the error.

field

`string` Name of the parameter in the API request that caused the error.

source

`string` The point of failure in the specific operation (payment in this case). For example, customer, business.

step

`string` The stage where the transaction failure occurred. The stages can vary depending on the payment method used to complete the transaction.

reason

`string` The exact error reason. It can be handled programmatically.

metadata

`object` Contains additional information about the request.
