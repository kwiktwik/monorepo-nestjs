<!-- Source: https://razorpay.com/docs/api/customers/create -->

# Create a Customer

Copy for AI

View as Markdown

`POST`

`/v1/customers`

Use this endpoint to create or add a customer with basic details such as name and contact details.

Sample Code

Request Parameters

Response Parameters

Errors

Curl

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X POST https://api.razorpay.com/v1/customers \
-H "Content-Type: application/json" \
-d '{
    "name": "Gaurav Kumar",
    "contact": "9123456780",
    "email": "gaurav.kumar@example.com",
    "fail_existing": "0",
    "notes": {
      "notes_key_1": "Tea, Earl Grey, Hot",
      "notes_key_2": "Tea, Earl Grey… decaf."
  }
}'
```

Success

Failure

```json
{
  "id" : "cust_1Aa00000000004",
  "entity": "customer",
  "name" : "Gaurav Kumar",
  "email" : "gaurav.kumar@example.com",
  "contact" : "+919876543210",
  "gstin": null,
  "notes": {
    "notes_key_1":"Tea, Earl Grey, Hot",
    "notes_key_2":"Tea, Earl Grey… decaf."
  },
  "created_at ": 1234567890
}
```

###### Request Parameters

`name`

`string`

Customer's name. Alphanumeric value with period (.), apostrophe ('), forward slash (/), at (@) and parentheses are allowed. The name must be between 3-50 characters in length. For example, `Gaurav Kumar`.

`contact`

`string`

The customer's phone number. A maximum length of 15 characters including country code. For example, `+919876543210`.

`email`

`string`

The customer's email address. A maximum length of 64 characters. For example, `gaurav.kumar@example.com`.

`fail_existing`

`string`

Possible values:

- `1` (default): If a customer with the same details already exists, throws an error.
- `0`: If a customer with the same details already exists, fetches details of the existing customer.

`gstin`

`string`

Customer's GST number, if available. For example, `29XAbbA4369J1PA`.

`notes`

`object`

This is a key-value pair that can be used to store additional information about the entity. It can hold a maximum of 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

###### Response Parameters

`id`

`string`

Unique identifier of the customer. For example, `cust_1Aa00000000004`.

`entity`

`string`

Indicates the type of entity.

`name`

`string`

Customer's name. Alphanumeric, with period (.), apostrophe ('), forward slash (/), at (@) and parentheses allowed. The name must be between 3-50 characters in length.

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

`json object`

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

# Create a Customer

Copy for AI

View as Markdown

`POST`

`/v1/customers`

Use this endpoint to create or add a customer with basic details such as name and contact details.

Request Parameters

Response Parameters

Errors

###### Request Parameters

`name`

`string`

Customer's name. Alphanumeric value with period (.), apostrophe ('), forward slash (/), at (@) and parentheses are allowed. The name must be between 3-50 characters in length. For example, `Gaurav Kumar`.

`contact`

`string`

The customer's phone number. A maximum length of 15 characters including country code. For example, `+919876543210`.

`email`

`string`

The customer's email address. A maximum length of 64 characters. For example, `gaurav.kumar@example.com`.

`fail_existing`

`string`

Possible values:

- `1` (default): If a customer with the same details already exists, throws an error.
- `0`: If a customer with the same details already exists, fetches details of the existing customer.

`gstin`

`string`

Customer's GST number, if available. For example, `29XAbbA4369J1PA`.

`notes`

`object`

This is a key-value pair that can be used to store additional information about the entity. It can hold a maximum of 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

###### Response Parameters

`id`

`string`

Unique identifier of the customer. For example, `cust_1Aa00000000004`.

`entity`

`string`

Indicates the type of entity.

`name`

`string`

Customer's name. Alphanumeric, with period (.), apostrophe ('), forward slash (/), at (@) and parentheses allowed. The name must be between 3-50 characters in length.

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

`json object`

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

Curl

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X POST https://api.razorpay.com/v1/customers \
-H "Content-Type: application/json" \
-d '{
    "name": "Gaurav Kumar",
    "contact": "9123456780",
    "email": "gaurav.kumar@example.com",
    "fail_existing": "0",
    "notes": {
      "notes_key_1": "Tea, Earl Grey, Hot",
      "notes_key_2": "Tea, Earl Grey… decaf."
  }
}'
```

Success

Failure

```json
{
  "id" : "cust_1Aa00000000004",
  "entity": "customer",
  "name" : "Gaurav Kumar",
  "email" : "gaurav.kumar@example.com",
  "contact" : "+919876543210",
  "gstin": null,
  "notes": {
    "notes_key_1":"Tea, Earl Grey, Hot",
    "notes_key_2":"Tea, Earl Grey… decaf."
  },
  "created_at ": 1234567890
}
```
