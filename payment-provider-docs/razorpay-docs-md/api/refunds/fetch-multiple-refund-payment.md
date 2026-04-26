<!-- Source: https://razorpay.com/docs/api/refunds/fetch-multiple-refund-payment -->

# Fetch Multiple Refunds for a Payment

Copy for AI

View as Markdown

`GET`

`/v1/payments/:id/refunds`

Use this endpoint to retrieve multiple refunds for a payment. By default, only the last 10 refunds are returned. You can use `count` and `skip` parameters to change that behaviour.

Sample Code

Path Parameters

1

Query Parameters

4

Response Parameters

Errors

Curl

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X GET https://api.razorpay.com/v1/payments/pay_29QQoUBi66xm2f/refunds?from=1500826740&to=1500826760
```

Success

Failure

```json
{
  "entity": "collection",
  "count": 2,
  "items": [
    {
      "id": "rfnd_FP8DDKxqJif6ca",
      "entity": "refund",
      "amount": 300100,
      "currency": "INR",
      "payment_id": "pay_29QQoUBi66xm2f",
      "notes": {
        "comment": "Comment for refund"
      },
      "receipt": null,
      "acquirer_data": {
        "arn": "10000000000000"
      },
      "created_at": 1597078124,
      "batch_id": null,
      "status": "processed",
      "speed_processed": "normal",
      "speed_requested": "optimum"
    },
    {
      "id": "rfnd_FP8DRfu3ygfOaC",
      "entity": "refund",
      "amount": 200000,
      "currency": "INR",
      "payment_id": "pay_29QQoUBi66xm2f",
      "notes": {
        "comment": "Comment for refund"
      },
      "receipt": null,
      "acquirer_data": {
        "arn": "10000000000000"
      },
      "created_at": 1597078137,
      "batch_id": null,
      "status": "processed",
      "speed_processed": "normal",
      "speed_requested": "optimum"
    }
  ]
}
```

###### Path Parameters

`id`

\*

`string`

Unique identifier of the payment for which refund has been requested.

###### Query Parameters

`from`

`integer`

Unix timestamp at which the refunds were created.

`to`

`integer`

Unix timestamp till which the refunds were created.

`count`

`integer`

The number of refunds to fetch for the payment.

`skip`

`integer`

The number of refunds to be skipped for the payment.

###### Response Parameters

`id`

`string`

The unique identifier of the refund. For example, `rfnd_FgRAHdNOM4ZVbO`.

`entity`

`string`

Indicates the type of entity. Here, it is `refund`.

`amount`

`integer`

The amount to be refunded (in the smallest unit of currency).
 For example, if the refund value is ₹30, it will be `3000`.

`currency`

`string`

The currency of payment amount for which the refund is initiated. Check the list of [supported currencies](/razorpay-docs-md/international-payments.md#supported-currencies).

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

Possible reasons:

- The URL is wrong or is missing something.
- A POST API is executed by GET method.

Solution

\_id is not a valid id

Error Status: 400

The `payment_id` entered is invalid or incomplete.

Solution

The id provided does not exist

Error Status: 400

The `payment_id` is not entered.

Solution

# Fetch Multiple Refunds for a Payment

Copy for AI

View as Markdown

`GET`

`/v1/payments/:id/refunds`

Use this endpoint to retrieve multiple refunds for a payment. By default, only the last 10 refunds are returned. You can use `count` and `skip` parameters to change that behaviour.

Path Parameters

1

Query Parameters

4

Response Parameters

Errors

###### Path Parameters

`id`

\*

`string`

Unique identifier of the payment for which refund has been requested.

###### Query Parameters

`from`

`integer`

Unix timestamp at which the refunds were created.

`to`

`integer`

Unix timestamp till which the refunds were created.

`count`

`integer`

The number of refunds to fetch for the payment.

`skip`

`integer`

The number of refunds to be skipped for the payment.

###### Response Parameters

`id`

`string`

The unique identifier of the refund. For example, `rfnd_FgRAHdNOM4ZVbO`.

`entity`

`string`

Indicates the type of entity. Here, it is `refund`.

`amount`

`integer`

The amount to be refunded (in the smallest unit of currency).
 For example, if the refund value is ₹30, it will be `3000`.

`currency`

`string`

The currency of payment amount for which the refund is initiated. Check the list of [supported currencies](/razorpay-docs-md/international-payments.md#supported-currencies).

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

Possible reasons:

- The URL is wrong or is missing something.
- A POST API is executed by GET method.

Solution

\_id is not a valid id

Error Status: 400

The `payment_id` entered is invalid or incomplete.

Solution

The id provided does not exist

Error Status: 400

The `payment_id` is not entered.

Solution

Curl

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X GET https://api.razorpay.com/v1/payments/pay_29QQoUBi66xm2f/refunds?from=1500826740&to=1500826760
```

Success

Failure

```json
{
  "entity": "collection",
  "count": 2,
  "items": [
    {
      "id": "rfnd_FP8DDKxqJif6ca",
      "entity": "refund",
      "amount": 300100,
      "currency": "INR",
      "payment_id": "pay_29QQoUBi66xm2f",
      "notes": {
        "comment": "Comment for refund"
      },
      "receipt": null,
      "acquirer_data": {
        "arn": "10000000000000"
      },
      "created_at": 1597078124,
      "batch_id": null,
      "status": "processed",
      "speed_processed": "normal",
      "speed_requested": "optimum"
    },
    {
      "id": "rfnd_FP8DRfu3ygfOaC",
      "entity": "refund",
      "amount": 200000,
      "currency": "INR",
      "payment_id": "pay_29QQoUBi66xm2f",
      "notes": {
        "comment": "Comment for refund"
      },
      "receipt": null,
      "acquirer_data": {
        "arn": "10000000000000"
      },
      "created_at": 1597078137,
      "batch_id": null,
      "status": "processed",
      "speed_processed": "normal",
      "speed_requested": "optimum"
    }
  ]
}
```
