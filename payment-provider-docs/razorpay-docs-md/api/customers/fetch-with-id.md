<!-- Source: https://razorpay.com/docs/api/customers/fetch-with-id -->

# Fetch Customer With ID

Copy for AI

View as Markdown

`GET`

`/v1/customers/:id`

Use this endpoint to retrieve details of a customer with id.

Sample Code

Path Parameters

1

Response Parameters

Errors

Curl

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X GET https://api.razorpay.com/v1/customers/cust_1Aa00000000001 \
```

Success

Failure

```json
{
  "id": "cust_1Aa00000000001",
  "entity": "customer",
  "name": "Gaurav Kumar",
  "email": "gaurav.kumar@example.com",
  "contact": "9123456780",
  "gstin": null,
  "notes": {
    "notes_key_1": "Tea, Earl Grey, Hot",
    "notes_key_2": "Tea, Earl Grey… decaf."
  },
  "created_at": 1655298731
}
```

###### Path Parameters

`id`

\*

`string`

The unique identifier linked to the customer.

###### Response Parameters

`id`

`string`

Unique identifier of the customer. For example, `cust_1Aa00000000004`.

`entity`

`string`

Indicates the type of entity.

`name`

`string`

Customer's name. Alphanumeric, with period (.), apostrophe ('), forward slash (/), at (@) and parentheses allowed. The name must be between 3-50 characters in length. For example, `Gaurav Kumar`.

`contact`

`string`

The customer's phone number. A maximum length of 15 characters including country code. For example, `+919876543210`.

`email`

`string`

The customer's email address. A maximum length of 64 characters. For example, `gaurav.kumar@example.com`.

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

id is not a valid id.

Error Status: 400

The `customer_id` passed is invalid.

Solution

The id provided does not exist.

Error Status: 400

The `customer_id` does not exist or does not belong to the requestor.

Solution

# Fetch Customer With ID

Copy for AI

View as Markdown

`GET`

`/v1/customers/:id`

Use this endpoint to retrieve details of a customer with id.

Path Parameters

1

Response Parameters

Errors

###### Path Parameters

`id`

\*

`string`

The unique identifier linked to the customer.

###### Response Parameters

`id`

`string`

Unique identifier of the customer. For example, `cust_1Aa00000000004`.

`entity`

`string`

Indicates the type of entity.

`name`

`string`

Customer's name. Alphanumeric, with period (.), apostrophe ('), forward slash (/), at (@) and parentheses allowed. The name must be between 3-50 characters in length. For example, `Gaurav Kumar`.

`contact`

`string`

The customer's phone number. A maximum length of 15 characters including country code. For example, `+919876543210`.

`email`

`string`

The customer's email address. A maximum length of 64 characters. For example, `gaurav.kumar@example.com`.

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

id is not a valid id.

Error Status: 400

The `customer_id` passed is invalid.

Solution

The id provided does not exist.

Error Status: 400

The `customer_id` does not exist or does not belong to the requestor.

Solution

Curl

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X GET https://api.razorpay.com/v1/customers/cust_1Aa00000000001 \
```

Success

Failure

```json
{
  "id": "cust_1Aa00000000001",
  "entity": "customer",
  "name": "Gaurav Kumar",
  "email": "gaurav.kumar@example.com",
  "contact": "9123456780",
  "gstin": null,
  "notes": {
    "notes_key_1": "Tea, Earl Grey, Hot",
    "notes_key_2": "Tea, Earl Grey… decaf."
  },
  "created_at": 1655298731
}
```
