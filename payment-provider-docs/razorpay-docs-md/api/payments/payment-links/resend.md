<!-- Source: https://razorpay.com/docs/api/payments/payment-links/resend -->

# Send or Resend Notifications

`POST`

`/v1/payment_links/:id/notify_by/:medium`

Use this endpoint to send or resend notifications to your customers via email and SMS.

Sample Code

Path Parameters

2

Response Parameters

Errors

Curl

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X POST https://api.razorpay.com/v1/payment_links/plink_Et2G7ymGcTTuM5/notify_by/sms \
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

Unique identifier of the Payment Link that should be resent.

`medium`

\*

`string`

Medium through which the Payment Link must be resent. Possible values:

- `sms`
- `email`

###### Response Parameters

`success`

`boolean`

Indicates whether the notification was sent successfully. Possible value is `true`, which means the notification was sent successfully.

###### Errors

not a valid notification medium

Error Status: 400

Occurs when you try to resend a Payment Link to customers and medium of notification is not valid.

Solution

# Send or Resend Notifications

`POST`

`/v1/payment_links/:id/notify_by/:medium`

Use this endpoint to send or resend notifications to your customers via email and SMS.

Path Parameters

2

Response Parameters

Errors

###### Path Parameters

`id`

\*

`string`

Unique identifier of the Payment Link that should be resent.

`medium`

\*

`string`

Medium through which the Payment Link must be resent. Possible values:

- `sms`
- `email`

###### Response Parameters

`success`

`boolean`

Indicates whether the notification was sent successfully. Possible value is `true`, which means the notification was sent successfully.

###### Errors

not a valid notification medium

Error Status: 400

Occurs when you try to resend a Payment Link to customers and medium of notification is not valid.

Solution

Curl

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X POST https://api.razorpay.com/v1/payment_links/plink_Et2G7ymGcTTuM5/notify_by/sms \
```

Success

Failure

```json
{
    "success": true
}
```
