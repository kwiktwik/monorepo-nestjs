<!-- Source: https://razorpay.com/docs/api/customers/edit -->

# Edit Customer Details

Copy for AI

View as Markdown

`PUT`

`/v1/customers/:id`

Use this endpoint to edit the customer details such as name, email and contact details. When editing a customer's details, ensure that the combination of the values in the `email` and `contact` attributes is unique for every customer.

Sample Code

Path Parameters

1

Request Parameters

Response Parameters

Errors

Curl

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X PUT https://api.razorpay.com/v1/customers/cust_1Aa00000000003 \
-H "Content-Type: application/json" \
-d '{
  "name": "Gaurav Kumar",
  "email": "gaurav.kumar@example.com",
  "contact": "+919876543210"
}'
```

###### Path Parameters

`id`

\*

`string`

The unique identifier linked to the customer.

###### Request Parameters

`name`

`string`

Customer's name. Alphanumeric, with period (.), apostrophe ('), forward slash (/), at (@) and parentheses allowed. The name must be between 3-50 characters in length. For example, `Gaurav Kumar`.

`contact`

`string`

The customer's phone number. A maximum length of 15 characters. For example, `+919876543210`.

`email`

`string`

The customer's email address. A maximum length of 64 characters. For example, `gaurav.kumar@example.com`.

###### Response Parameters

`id`

`string`

Unique identifier of the customer. For example, `cust_1Aa00000000004`.

`entity`

`string`

Indicates the type of entity.

`name`

`string`

Customer's name. Alphanumeric, with period (.), apostrophe (') and parentheses allowed. The name must be between 3-50 characters in length.

`contact`

`string`

The customer's phone number. A maximum length of 15 characters including country code.

`email`

`string`

The customer's email address. A maximum length of 64 characters.

`gstin`

`string`

GST number linked to the customer. For example, `29XAbbA4369J1PA`.

`notes`

`string`

This is a key-value pair that can be used to store additional information about the entity. It can hold a maximum of 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

`created_at`

`integer`

UNIX timestamp, when the customer was created. For example, `1234567890`.

###### Errors

The API <key/secret> provided is invalid.

Error Status: 4xx

The API credentials passed in the API call differ from the ones generated on the Dashboard. Possible reasons:

- Different keys for test mode and live modes.
- Expired API key.

Solution

Contact number should be at least 8 digits, including country code.

Error Status: 400

The contact number is less than 8 digits.

Solution

id is not a valid id.

Error Status: 400

The `customer_id` passed is invalid.

Solution

# Edit Customer Details

Copy for AI

View as Markdown

`PUT`

`/v1/customers/:id`

Use this endpoint to edit the customer details such as name, email and contact details. When editing a customer's details, ensure that the combination of the values in the `email` and `contact` attributes is unique for every customer.

Path Parameters

1

Request Parameters

Response Parameters

Errors

###### Path Parameters

`id`

\*

`string`

The unique identifier linked to the customer.

###### Request Parameters

`name`

`string`

Customer's name. Alphanumeric, with period (.), apostrophe ('), forward slash (/), at (@) and parentheses allowed. The name must be between 3-50 characters in length. For example, `Gaurav Kumar`.

`contact`

`string`

The customer's phone number. A maximum length of 15 characters. For example, `+919876543210`.

`email`

`string`

The customer's email address. A maximum length of 64 characters. For example, `gaurav.kumar@example.com`.

###### Response Parameters

`id`

`string`

Unique identifier of the customer. For example, `cust_1Aa00000000004`.

`entity`

`string`

Indicates the type of entity.

`name`

`string`

Customer's name. Alphanumeric, with period (.), apostrophe (') and parentheses allowed. The name must be between 3-50 characters in length.

`contact`

`string`

The customer's phone number. A maximum length of 15 characters including country code.

`email`

`string`

The customer's email address. A maximum length of 64 characters.

`gstin`

`string`

GST number linked to the customer. For example, `29XAbbA4369J1PA`.

`notes`

`string`

This is a key-value pair that can be used to store additional information about the entity. It can hold a maximum of 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

`created_at`

`integer`

UNIX timestamp, when the customer was created. For example, `1234567890`.

###### Errors

The API <key/secret> provided is invalid.

Error Status: 4xx

The API credentials passed in the API call differ from the ones generated on the Dashboard. Possible reasons:

- Different keys for test mode and live modes.
- Expired API key.

Solution

Contact number should be at least 8 digits, including country code.

Error Status: 400

The contact number is less than 8 digits.

Solution

id is not a valid id.

Error Status: 400

The `customer_id` passed is invalid.

Solution

Curl

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X PUT https://api.razorpay.com/v1/customers/cust_1Aa00000000003 \
-H "Content-Type: application/json" \
-d '{
  "name": "Gaurav Kumar",
  "email": "gaurav.kumar@example.com",
  "contact": "+919876543210"
}'
```
