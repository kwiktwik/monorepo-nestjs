<!-- Source: https://razorpay.com/docs/api/payments/downtime/fetch-all -->

# Fetch All Payment Downtime Details

`GET`

`/v1/payments/downtimes`

Use this endpoint to retrieve details of all payment downtimes.

Sample Code

Response Parameters

Errors

Curl

```bash
curl -u <YOUR_KEY_ID>:<YOUR_KEY_SECRET> \
-X GET https://api.razorpay.com/v1/payments/downtimes
-H "Content-Type: application/json" \
```

Netbanking

UPI Handle

UPI PSP

Turbo UPI

Card - Network

Card - Issuer

Card / Netbanking

Failure

```json
{
  "entity": "collection",
  "count": 2,
  "items": [
    {
      "id": "down_F1cxDoHWD4fkQt",
      "entity": "payment.downtime",
      "method": "netbanking",
      "begin": 1591946222,
      "end": null,
      "status": "started",
      "scheduled": false,
      "severity": "high",
      "instrument": {
        "bank": "COSB"
      },
      "created_at": 1591946223,
      "updated_at": 1591946297
    },
    {
      "id": "down_F1cxlArweEWitF",
      "entity": "payment.downtime",
      "method": "netbanking",
      "begin": 1591946222,
      "end": null,
      "status": "started",
      "scheduled": false,
      "severity": "high",
      "instrument": {
        "bank": "UTIB"
      },
      "created_at": 1591946254,
      "updated_at": 1591946298
    }
  ]
}
```

###### Response Parameters

`id`

`string`

Unique identifier of the downtime's occurrence.

`entity`

`string`

Here, it will be `payment.downtime`.

`method`

`string`

The payment method that is experiencing the downtime. Possible values include:

- `card`
- `netbanking`
- `upi`

`begin`

`integer`

Timestamp (in Unix) that indicates the start of the downtime. Applicable for both scheduled and unscheduled downtimes.

`end`

`integer`

Timestamp (in Unix) that indicates the end of the downtime.
 Available only for scheduled downtimes, where the end-time is known. Set to `null` when the end-time is unknown, possibly during unscheduled downtimes.

`status`

`string`

Status of the downtime.
Possible statuses are.

- `scheduled`: A downtime is scheduled to happen at a later time.
- `started`: The downtime has started and is ongoing.
- `updated`: An ongoing downtime that has been updated after its start. For example, when the severity of the downtime changes from medium to high.

`scheduled`

`boolean`

Possible values:

- `true`: This is a scheduled downtime by the issuer, network, or the bank, which was informed to Razorpay.
- `false`: This is an unscheduled downtime.

`severity`

`string`

Severity of the downtime.
Possible values:

- `high`: Possible when all the payment methods are affected by downtime. Observed when the issuer, bank or network is down.
- `medium`: Possible when a higher number of declines in transactions or low success rates are observed with the payment methods.
- `low`: Possible when the reason for the downtime is unknown. Impact on payment methods is minimal.

`instrument`

`string`

Payment method that is underperforming.

Show child parameters (7)

`created_at`

`integer`

Timestamp (in Unix) that indicates the time at which the downtime was recorded in Razorpay servers.

`updated_at`

`integer`

Timestamp (in Unix) that indicates the time at which the downtime record was updated in Razorpay servers.
Know more about [the possible values](/razorpay-docs-md/payment-methods/upi.md).

###### Errors

The API {key/secret} provided is invalid.

Error Status: 4xx

The API credentials passed in the API call differ from the ones generated on the Dashboard.

Solution

# Fetch All Payment Downtime Details

`GET`

`/v1/payments/downtimes`

Use this endpoint to retrieve details of all payment downtimes.

Response Parameters

Errors

###### Response Parameters

`id`

`string`

Unique identifier of the downtime's occurrence.

`entity`

`string`

Here, it will be `payment.downtime`.

`method`

`string`

The payment method that is experiencing the downtime. Possible values include:

- `card`
- `netbanking`
- `upi`

`begin`

`integer`

Timestamp (in Unix) that indicates the start of the downtime. Applicable for both scheduled and unscheduled downtimes.

`end`

`integer`

Timestamp (in Unix) that indicates the end of the downtime.
 Available only for scheduled downtimes, where the end-time is known. Set to `null` when the end-time is unknown, possibly during unscheduled downtimes.

`status`

`string`

Status of the downtime.
Possible statuses are.

- `scheduled`: A downtime is scheduled to happen at a later time.
- `started`: The downtime has started and is ongoing.
- `updated`: An ongoing downtime that has been updated after its start. For example, when the severity of the downtime changes from medium to high.

`scheduled`

`boolean`

Possible values:

- `true`: This is a scheduled downtime by the issuer, network, or the bank, which was informed to Razorpay.
- `false`: This is an unscheduled downtime.

`severity`

`string`

Severity of the downtime.
Possible values:

- `high`: Possible when all the payment methods are affected by downtime. Observed when the issuer, bank or network is down.
- `medium`: Possible when a higher number of declines in transactions or low success rates are observed with the payment methods.
- `low`: Possible when the reason for the downtime is unknown. Impact on payment methods is minimal.

`instrument`

`string`

Payment method that is underperforming.

Show child parameters (7)

`created_at`

`integer`

Timestamp (in Unix) that indicates the time at which the downtime was recorded in Razorpay servers.

`updated_at`

`integer`

Timestamp (in Unix) that indicates the time at which the downtime record was updated in Razorpay servers.
Know more about [the possible values](/razorpay-docs-md/payment-methods/upi.md).

###### Errors

The API {key/secret} provided is invalid.

Error Status: 4xx

The API credentials passed in the API call differ from the ones generated on the Dashboard.

Solution

Curl

```bash
curl -u <YOUR_KEY_ID>:<YOUR_KEY_SECRET> \
-X GET https://api.razorpay.com/v1/payments/downtimes
-H "Content-Type: application/json" \
```

Netbanking

UPI Handle

UPI PSP

Turbo UPI

Card - Network

Card - Issuer

Card / Netbanking

Failure

```json
{
  "entity": "collection",
  "count": 2,
  "items": [
    {
      "id": "down_F1cxDoHWD4fkQt",
      "entity": "payment.downtime",
      "method": "netbanking",
      "begin": 1591946222,
      "end": null,
      "status": "started",
      "scheduled": false,
      "severity": "high",
      "instrument": {
        "bank": "COSB"
      },
      "created_at": 1591946223,
      "updated_at": 1591946297
    },
    {
      "id": "down_F1cxlArweEWitF",
      "entity": "payment.downtime",
      "method": "netbanking",
      "begin": 1591946222,
      "end": null,
      "status": "started",
      "scheduled": false,
      "severity": "high",
      "instrument": {
        "bank": "UTIB"
      },
      "created_at": 1591946254,
      "updated_at": 1591946298
    }
  ]
}
```
