<!-- Source: https://razorpay.com/docs/api/refunds/fetch-all -->

# Fetch All Refunds

Copy for AI

View as Markdown

`GET`

`/v1/refunds/`

Use this endpoint to retrieve details of all refunds. However, by default, only the last 10 refunds are returned. You can use count and skip query parameters to change that behaviour.

Sample Code

Query Parameters

4

Response Parameters

Errors

Curl

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X GET https://api.razorpay.com/v1/refunds
```

Success

Failure

```json
{
  "entity": "collection",
  "count": 2,
  "items": [
    {
      "id": "rfnd_FFX6AnnIN3puqW",
      "entity": "refund",
      "amount": 88800,
      "currency": "INR",
      "payment_id": "pay_FFX5FdEYx8jPwA",
      "notes": {
        "comment": "Issuing an instant refund"
      },
      "receipt": null,
      "acquirer_data": {},
      "created_at": 1594982363,
      "batch_id": null,
      "status": "processed",
      "speed_processed": "optimum",
      "speed_requested": "optimum"
    },
    {
      "id": "rfnd_EqWThTE7dd7utf",
      "entity": "refund",
      "amount": 6000,
      "currency": "INR",
      "payment_id": "pay_EpkFDYRirena0f",
      "notes": {
        "comment": "Issuing a normal refund"
      },
      "receipt": null,
      "acquirer_data": {
        "arn": "10000000000000"
      },
      "created_at": 1589521675,
      "batch_id": null,
      "status": "processed",
      "speed_processed": "normal",
      "speed_requested": "normal"
    }
  ]
}
```

###### Query Parameters

`from`

`integer`

Unix timestamp at which the refunds were created.

`to`

`integer`

Unix timestamp till which the refunds were created.

`count`

`integer`

The number of refunds to fetch. You can fetch a maximum of 100 refunds.

`skip`

`integer`

The number of refunds to be skipped.

###### Response Parameters

`id`

`string`

The unique identifier of the refund. For example, `rfnd_FgRAHdNOM4ZVbO`.

`entity`

`string`

Indicates the type of entity. Here, it is `refund`.

`amount`

`integer`

The amount to be refunded (in the smallest unit of currency). For example, if the refund value is ₹30, it will be `3000`.

`currency`

`string`

The currency of a payment amount for which the refund is initiated. Check the list of [supported currencies](/razorpay-docs-md/international-payments.md#supported-currencies).

`payment_id`

`string`

The unique identifier of the payment for which a refund is initiated. For example, `pay_FgR9UMzgmKDJRi`.

`created_at`

`integer`

Unix timestamp at which the refund was created. For example, `1600856650`.

`batch_id`

`string`

This parameter is populated if the refund was created as part of a batch upload. For example, `batch_00000000000001`.

`notes`

`json object`

Key-value store for storing your reference data. A maximum of 15 key-value pairs can be included. For example, `"note_key": "Beam me up Scotty”`.

`receipt`

`string`

A unique identifier provided by you for your internal reference.

`acquirer_data`

`array`

A dynamic array consisting of a unique reference number (either RRN, ARN or UTR) that is provided by the banking partner when a refund is processed. This reference number can be used by the customer to track the status of the refund with the bank.

`status`

`string`

Indicates the state of the refund. Possible values:

- `pending`: This state indicates that Razorpay is attempting to process the refund.
- `processed`: This is the final state of the refund.
- `failed`: A refund can attain the failed state in the following scenarios:
  - Normal refund is not possible for a payment which is more than 6 months old.
  - Instant Refund can sometimes fail because of customer's account or bank-related issues.

`speed_requested`

`string`

The processing mode of the refund seen in the refund response.
 This attribute is seen in the refund response only if the `speed` parameter is set in the refund request.
Possible values:

- `normal`: Indicates that the refund will be processed via the normal speed. The refund will take 5-7 working days.
- `optimum`: Indicates that the refund will be processed at an optimal speed based on Razorpay's internal fund transfer logic.
  - If the refund can be processed instantly, Razorpay will do so, irrespective of the payment method used to make the payment.
  - If an instant refund is not possible, Razorpay will initiate a refund that is processed at the normal speed.

`speed_processed`

`string`

This is a parameter in the response which describes the mode used to process a refund.
 This attribute is seen in the refund response only if the `speed` parameter is set in the refund request. Possible values:

- `instant`: Indicates that the refund has been processed instantly via fund transfer.
- `normal`: Indicates that the refund has been processed by the payment processing partner. The refund will take 5-7 working days.

###### Errors

The API {key/secret} provided is invalid.

Error Status: 4xx

The API credentials passed in the API call differ from the ones generated on the Dashboard.

Solution

The requested URL was not found on the server.

Error Status: 400

The URL is wrong or is missing something.

Solution

The payment id field is required.

Error Status: 400

A GET API is executed by POST method.

Solution

# Fetch All Refunds

Copy for AI

View as Markdown

`GET`

`/v1/refunds/`

Use this endpoint to retrieve details of all refunds. However, by default, only the last 10 refunds are returned. You can use count and skip query parameters to change that behaviour.

Query Parameters

4

Response Parameters

Errors

###### Query Parameters

`from`

`integer`

Unix timestamp at which the refunds were created.

`to`

`integer`

Unix timestamp till which the refunds were created.

`count`

`integer`

The number of refunds to fetch. You can fetch a maximum of 100 refunds.

`skip`

`integer`

The number of refunds to be skipped.

###### Response Parameters

`id`

`string`

The unique identifier of the refund. For example, `rfnd_FgRAHdNOM4ZVbO`.

`entity`

`string`

Indicates the type of entity. Here, it is `refund`.

`amount`

`integer`

The amount to be refunded (in the smallest unit of currency). For example, if the refund value is ₹30, it will be `3000`.

`currency`

`string`

The currency of a payment amount for which the refund is initiated. Check the list of [supported currencies](/razorpay-docs-md/international-payments.md#supported-currencies).

`payment_id`

`string`

The unique identifier of the payment for which a refund is initiated. For example, `pay_FgR9UMzgmKDJRi`.

`created_at`

`integer`

Unix timestamp at which the refund was created. For example, `1600856650`.

`batch_id`

`string`

This parameter is populated if the refund was created as part of a batch upload. For example, `batch_00000000000001`.

`notes`

`json object`

Key-value store for storing your reference data. A maximum of 15 key-value pairs can be included. For example, `"note_key": "Beam me up Scotty”`.

`receipt`

`string`

A unique identifier provided by you for your internal reference.

`acquirer_data`

`array`

A dynamic array consisting of a unique reference number (either RRN, ARN or UTR) that is provided by the banking partner when a refund is processed. This reference number can be used by the customer to track the status of the refund with the bank.

`status`

`string`

Indicates the state of the refund. Possible values:

- `pending`: This state indicates that Razorpay is attempting to process the refund.
- `processed`: This is the final state of the refund.
- `failed`: A refund can attain the failed state in the following scenarios:
  - Normal refund is not possible for a payment which is more than 6 months old.
  - Instant Refund can sometimes fail because of customer's account or bank-related issues.

`speed_requested`

`string`

The processing mode of the refund seen in the refund response.
 This attribute is seen in the refund response only if the `speed` parameter is set in the refund request.
Possible values:

- `normal`: Indicates that the refund will be processed via the normal speed. The refund will take 5-7 working days.
- `optimum`: Indicates that the refund will be processed at an optimal speed based on Razorpay's internal fund transfer logic.
  - If the refund can be processed instantly, Razorpay will do so, irrespective of the payment method used to make the payment.
  - If an instant refund is not possible, Razorpay will initiate a refund that is processed at the normal speed.

`speed_processed`

`string`

This is a parameter in the response which describes the mode used to process a refund.
 This attribute is seen in the refund response only if the `speed` parameter is set in the refund request. Possible values:

- `instant`: Indicates that the refund has been processed instantly via fund transfer.
- `normal`: Indicates that the refund has been processed by the payment processing partner. The refund will take 5-7 working days.

###### Errors

The API {key/secret} provided is invalid.

Error Status: 4xx

The API credentials passed in the API call differ from the ones generated on the Dashboard.

Solution

The requested URL was not found on the server.

Error Status: 400

The URL is wrong or is missing something.

Solution

The payment id field is required.

Error Status: 400

A GET API is executed by POST method.

Solution

Curl

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X GET https://api.razorpay.com/v1/refunds
```

Success

Failure

```json
{
  "entity": "collection",
  "count": 2,
  "items": [
    {
      "id": "rfnd_FFX6AnnIN3puqW",
      "entity": "refund",
      "amount": 88800,
      "currency": "INR",
      "payment_id": "pay_FFX5FdEYx8jPwA",
      "notes": {
        "comment": "Issuing an instant refund"
      },
      "receipt": null,
      "acquirer_data": {},
      "created_at": 1594982363,
      "batch_id": null,
      "status": "processed",
      "speed_processed": "optimum",
      "speed_requested": "optimum"
    },
    {
      "id": "rfnd_EqWThTE7dd7utf",
      "entity": "refund",
      "amount": 6000,
      "currency": "INR",
      "payment_id": "pay_EpkFDYRirena0f",
      "notes": {
        "comment": "Issuing a normal refund"
      },
      "receipt": null,
      "acquirer_data": {
        "arn": "10000000000000"
      },
      "created_at": 1589521675,
      "batch_id": null,
      "status": "processed",
      "speed_processed": "normal",
      "speed_requested": "normal"
    }
  ]
}
```
