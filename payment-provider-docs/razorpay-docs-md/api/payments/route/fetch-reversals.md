<!-- Source: https://razorpay.com/docs/api/payments/route/fetch-reversals -->

# Fetch Reversals for a Transfer

Copy for AI

View as Markdown

`GET`

`/v1/transfers/:id/reversals`

Use this endpoint to retrieve a list of reversals made for a transfer.

Sample Code

Path Parameters

1

Response Parameters

Errors

Curl

```bash
curl -X GET https://api.razorpay.com/v1/transfers/trf_Lt048W7cgLdo1u/reversals \
-u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
```

Success

Failure

```json
{
   "entity":"collection",
   "count":1,
   "items":[
      {
         "id":"rvrsl_Lt09xvyzskI7KZ",
         "entity":"reversal",
         "transfer_id":"trf_Lt048W7cgLdo1u",
         "amount":50000,
         "fee":0,
         "tax":0,
         "currency":"INR",
         "notes":[
            
         ],
         "initiator_id":"Ghri4beeOuMTAb",
         "customer_refund_id":null,
         "utr":null,
         "created_at":1684822489
      }
   ]
}
```

###### Path Parameters

`id`

\*

`string`

Unique identifier of the transfer.

###### Response Parameters

`id`

`string`

The unique identifier of the reversal.

`entity`

`string`

The name of the entity. Here, it is `reversal`.

`transfer_id`

`string`

The unique identifier of the transfer that was reversed.

`amount`

`integer`

The amount that was reversed, in paise.

`currency`

`string`

ISO currency code. We support route reversals only in INR.

`initiator_id`

`string`

The unique identifier of the merchant (MID).

`created_at`

`integer`

Timestamp in Unix. This indicates the time at which the reversal was created.

###### Errors

The API key/secret provided is invalid.

Error Status: 4xx

This error occurs when there is a mismatch between the API credentials passed in the API call and the API credentials generated on the Dashboard.

Solution

# Fetch Reversals for a Transfer

Copy for AI

View as Markdown

`GET`

`/v1/transfers/:id/reversals`

Use this endpoint to retrieve a list of reversals made for a transfer.

Path Parameters

1

Response Parameters

Errors

###### Path Parameters

`id`

\*

`string`

Unique identifier of the transfer.

###### Response Parameters

`id`

`string`

The unique identifier of the reversal.

`entity`

`string`

The name of the entity. Here, it is `reversal`.

`transfer_id`

`string`

The unique identifier of the transfer that was reversed.

`amount`

`integer`

The amount that was reversed, in paise.

`currency`

`string`

ISO currency code. We support route reversals only in INR.

`initiator_id`

`string`

The unique identifier of the merchant (MID).

`created_at`

`integer`

Timestamp in Unix. This indicates the time at which the reversal was created.

###### Errors

The API key/secret provided is invalid.

Error Status: 4xx

This error occurs when there is a mismatch between the API credentials passed in the API call and the API credentials generated on the Dashboard.

Solution

Curl

```bash
curl -X GET https://api.razorpay.com/v1/transfers/trf_Lt048W7cgLdo1u/reversals \
-u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
```

Success

Failure

```json
{
   "entity":"collection",
   "count":1,
   "items":[
      {
         "id":"rvrsl_Lt09xvyzskI7KZ",
         "entity":"reversal",
         "transfer_id":"trf_Lt048W7cgLdo1u",
         "amount":50000,
         "fee":0,
         "tax":0,
         "currency":"INR",
         "notes":[
            
         ],
         "initiator_id":"Ghri4beeOuMTAb",
         "customer_refund_id":null,
         "utr":null,
         "created_at":1684822489
      }
   ]
}
```
