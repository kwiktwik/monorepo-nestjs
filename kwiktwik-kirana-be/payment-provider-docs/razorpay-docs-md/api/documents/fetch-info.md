<!-- Source: https://razorpay.com/docs/api/documents/fetch-info -->

# Fetch Document Information

Copy for AI

View as Markdown

`GET`

`/v1/documents/:id`

Use this endpoint to retrieve the details of any document that was uploaded earlier.

Sample Code

Path Parameters

1

Response Parameters

Errors

Curl

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X GET https://api.razorpay.com/v1/documents/doc_EsyWjHrfzb59Re
```

Success

Failure

```json
{
  "id": "doc_EsyWjHrfzb59Re",
  "entity": "document",
  "purpose": "dispute_evidence",
  "name": "file_19_18_2020.jpg",
  "mime_type": "image/png",
  "size": 2863,
  "created_at": 1590604200
}
```

###### Path Parameters

`id`

\*

`string`

The unique identifier of the document.

###### Response Parameters

`id`

`string`

The unique identifier of the document uploaded.

`entity`

`string`

Indicates the type of entity. In this case, it is `document`.

`purpose`

`string`

The reason you are uploading this document. Here, it is `dispute_evidence`.

`size`

`integer`

Indicates the size of the document in bytes.

`mime_type`

`string`

Indicates the nature and format in which the document is uploaded. Possible values include:

- image/jpg
- image/jpeg
- image/png
- application/pdf

`created_at`

`integer`

Unix timestamp at which the document was uploaded.

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

# Fetch Document Information

Copy for AI

View as Markdown

`GET`

`/v1/documents/:id`

Use this endpoint to retrieve the details of any document that was uploaded earlier.

Path Parameters

1

Response Parameters

Errors

###### Path Parameters

`id`

\*

`string`

The unique identifier of the document.

###### Response Parameters

`id`

`string`

The unique identifier of the document uploaded.

`entity`

`string`

Indicates the type of entity. In this case, it is `document`.

`purpose`

`string`

The reason you are uploading this document. Here, it is `dispute_evidence`.

`size`

`integer`

Indicates the size of the document in bytes.

`mime_type`

`string`

Indicates the nature and format in which the document is uploaded. Possible values include:

- image/jpg
- image/jpeg
- image/png
- application/pdf

`created_at`

`integer`

Unix timestamp at which the document was uploaded.

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
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X GET https://api.razorpay.com/v1/documents/doc_EsyWjHrfzb59Re
```

Success

Failure

```json
{
  "id": "doc_EsyWjHrfzb59Re",
  "entity": "document",
  "purpose": "dispute_evidence",
  "name": "file_19_18_2020.jpg",
  "mime_type": "image/png",
  "size": 2863,
  "created_at": 1590604200
}
```
