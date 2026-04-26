<!-- Source: https://razorpay.com/docs/api/documents/create -->

# Create a Document

Copy for AI

View as Markdown

`POST`

`/v1/documents`

Use this endpoint to upload a document onto the Razorpay ecosystem. After a document is successfully uploaded, the corresponding document id (present in response) can be provided in cases such as dispute evidence submission.

Sample Code

Response Parameters

Errors

Curl

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X POST 'https://api.razorpay.com/v1/documents' \
-H "Content-Type: multipart/form-data" \
-F 'purpose=dispute_evidence' \
-F 'file=@/Users/your_name/sample_uploaded.jpeg'
```

Success

Failure

```json
{
  "id": "doc_EsyWjHrfzb59Re",
  "entity": "document",
  "purpose": "dispute_evidence",
  "name": "doc_19_12_2020.jpg",
  "mime_type": "image/png",
  "size": 2863,
  "created_at": 1590604200
}
```

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

Error Status: 401

The API credentials passed in the API call differ from the ones generated on the Dashboard.

- Different keys for test mode and live modes.
- Expired API key.

Solution

# Create a Document

Copy for AI

View as Markdown

`POST`

`/v1/documents`

Use this endpoint to upload a document onto the Razorpay ecosystem. After a document is successfully uploaded, the corresponding document id (present in response) can be provided in cases such as dispute evidence submission.

Response Parameters

Errors

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

Error Status: 401

The API credentials passed in the API call differ from the ones generated on the Dashboard.

- Different keys for test mode and live modes.
- Expired API key.

Solution

Curl

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X POST 'https://api.razorpay.com/v1/documents' \
-H "Content-Type: multipart/form-data" \
-F 'purpose=dispute_evidence' \
-F 'file=@/Users/your_name/sample_uploaded.jpeg'
```

Success

Failure

```json
{
  "id": "doc_EsyWjHrfzb59Re",
  "entity": "document",
  "purpose": "dispute_evidence",
  "name": "doc_19_12_2020.jpg",
  "mime_type": "image/png",
  "size": 2863,
  "created_at": 1590604200
}
```
