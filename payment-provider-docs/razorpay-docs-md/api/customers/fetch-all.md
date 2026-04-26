<!-- Source: https://razorpay.com/docs/api/customers/fetch-all -->

# Fetch All Customers

Copy for AI

View as Markdown

`GET`

`/v1/customers`

Use this endpoint to retrieve the details of all the customers.

Sample Code

Query Parameters

2

Response Parameters

Errors

Curl

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X GET https://api.razorpay.com/v1/customers?count=2&skip=1
```

Success

Failure

```json
{
  "entity": "collection",
  "count": 2,
  "items": [
    {
      "id": "cust_LQPdeJqQeKQrJM",
      "entity": "customer",
      "name": "Gaurav Kumar",
      "email": "gaurav.kumar@example.com",
      "contact": "+919876543210",
      "gstin": null,
      "notes": [],
      "created_at": 1678580352
    },
    {
      "id": "cust_LQPd9lomgwDE5F",
      "entity": "customer",
      "name": "Saurav Kumar",
      "email": "saurav.kumar@example.com",
      "contact": "+919876543210",
      "gstin": null,
      "notes": [],
      "created_at": 1678580324
    }
  ]
}
```

###### Query Parameters

`count`

`integer`

The number of customer records to be retrieved from the system. The default value is 10. The maximum value is 100. This can be used for pagination in combination with `skip`.

`skip`

`integer`

The number of customer records that must be skipped. The default value is 0. This can be used for pagination in combination with `count`.

###### Response Parameters

`entity`

`string`

Indicates the type of entity.

`id`

`string`

Unique identifier of the customer. For example, `cust_1Aa00000000004`.

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

# Fetch All Customers

Copy for AI

View as Markdown

`GET`

`/v1/customers`

Use this endpoint to retrieve the details of all the customers.

Query Parameters

2

Response Parameters

Errors

###### Query Parameters

`count`

`integer`

The number of customer records to be retrieved from the system. The default value is 10. The maximum value is 100. This can be used for pagination in combination with `skip`.

`skip`

`integer`

The number of customer records that must be skipped. The default value is 0. This can be used for pagination in combination with `count`.

###### Response Parameters

`entity`

`string`

Indicates the type of entity.

`id`

`string`

Unique identifier of the customer. For example, `cust_1Aa00000000004`.

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

Curl

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X GET https://api.razorpay.com/v1/customers?count=2&skip=1
```

Success

Failure

```json
{
  "entity": "collection",
  "count": 2,
  "items": [
    {
      "id": "cust_LQPdeJqQeKQrJM",
      "entity": "customer",
      "name": "Gaurav Kumar",
      "email": "gaurav.kumar@example.com",
      "contact": "+919876543210",
      "gstin": null,
      "notes": [],
      "created_at": 1678580352
    },
    {
      "id": "cust_LQPd9lomgwDE5F",
      "entity": "customer",
      "name": "Saurav Kumar",
      "email": "saurav.kumar@example.com",
      "contact": "+919876543210",
      "gstin": null,
      "notes": [],
      "created_at": 1678580324
    }
  ]
}
```
