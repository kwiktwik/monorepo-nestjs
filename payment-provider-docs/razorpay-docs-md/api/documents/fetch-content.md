<!-- Source: https://razorpay.com/docs/api/documents/fetch-content -->

# Fetch Document Content

Copy for AI

View as Markdown

`POST`

`/v1/documents/:id/content`

Use this endpoint to download an earlier uploaded document.

Sample Code

Path Parameters

1

Errors

Curl

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET]
-X GET https://api.razorpay.com/v1/documents/:id/content
```

Failure

```json
{
  "error":{
    "status_code": 401,
    "description":"The API `<key/secret>` provided is invalid.",
    "code":"BAD_REQUEST_ERROR"
  }
}
```

###### Path Parameters

`id`

\*

`string`

The unique identifier of the document.

###### Errors

The API <key/secret> provided is invalid.

Error Status: 400

The API credentials passed in the API call differ from the ones generated on the Dashboard.

- Different keys for test mode and live modes.
- Expired API key.

Solution

\_id is not a valid id.

Error Status: 400

- The id is not 14 characters long.
- The id is not alphanumeric.

Solution

# Fetch Document Content

Copy for AI

View as Markdown

`POST`

`/v1/documents/:id/content`

Use this endpoint to download an earlier uploaded document.

Path Parameters

1

Errors

###### Path Parameters

`id`

\*

`string`

The unique identifier of the document.

###### Errors

The API <key/secret> provided is invalid.

Error Status: 400

The API credentials passed in the API call differ from the ones generated on the Dashboard.

- Different keys for test mode and live modes.
- Expired API key.

Solution

\_id is not a valid id.

Error Status: 400

- The id is not 14 characters long.
- The id is not alphanumeric.

Solution

Curl

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET]
-X GET https://api.razorpay.com/v1/documents/:id/content
```

Failure

```json
{
  "error":{
    "status_code": 401,
    "description":"The API `<key/secret>` provided is invalid.",
    "code":"BAD_REQUEST_ERROR"
  }
}
```
