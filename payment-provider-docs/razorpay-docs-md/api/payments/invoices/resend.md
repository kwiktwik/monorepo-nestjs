<!-- Source: https://razorpay.com/docs/api/payments/invoices/resend -->

# Send Notifications

`POST`

`/v1/invoices/:id/notify_by/:medium`

Use this endpoint to send notifications with the short URL to the customer via email or SMS.

Sample Code

Path Parameters

2

Response Parameters

Errors

Curl

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X POST https://api.razorpay.com/v1/invoices/inv_DAuFuwWYU3R9tg/notify_by/sms \
```

Success

Failure

```json
{
    "success": true
}
```

###### Path Parameters

`id`

\*

`string`

The unique identifier of the invoice whose link is to be sent by SMS or email.

`medium`

\*

`string`

Possible values:

- `sms`
- `email`

###### Response Parameters

`success`

`boolean`

Indicates whether the notifications were sent successfully. Possible values:

- `true`: The notifications were successfully via SMS, email or both.
- `false`: The notifications were not sent.

###### Errors

The API <key/secret> provided is invalid.

Error Status: 4xx

There is a mismatch between the API credentials passed in the API call and those generated on the Dashboard.

Solution

The id provided does not exist.

Error Status: 400

The invoice id entered is either invalid or does not belong to the requester account.

Solution

email is not a valid communication medium.

Error Status: 400

There is a spelling error in “email” in the URL.

Solution

# Send Notifications

`POST`

`/v1/invoices/:id/notify_by/:medium`

Use this endpoint to send notifications with the short URL to the customer via email or SMS.

Path Parameters

2

Response Parameters

Errors

###### Path Parameters

`id`

\*

`string`

The unique identifier of the invoice whose link is to be sent by SMS or email.

`medium`

\*

`string`

Possible values:

- `sms`
- `email`

###### Response Parameters

`success`

`boolean`

Indicates whether the notifications were sent successfully. Possible values:

- `true`: The notifications were successfully via SMS, email or both.
- `false`: The notifications were not sent.

###### Errors

The API <key/secret> provided is invalid.

Error Status: 4xx

There is a mismatch between the API credentials passed in the API call and those generated on the Dashboard.

Solution

The id provided does not exist.

Error Status: 400

The invoice id entered is either invalid or does not belong to the requester account.

Solution

email is not a valid communication medium.

Error Status: 400

There is a spelling error in “email” in the URL.

Solution

Curl

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X POST https://api.razorpay.com/v1/invoices/inv_DAuFuwWYU3R9tg/notify_by/sms \
```

Success

Failure

```json
{
    "success": true
}
```
