<!-- Source: https://razorpay.com/docs/api/bills/delete -->

# Delete a Bill

`DELETE`

`/v1/bills/:bill_id`

Use this endpoint to delete a Bill.

Sample Code

Path Parameters

1

Errors

Curl

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET]
-X DELETE https://api.razorpay.com/v1/bills/bill_4a5e9ulyzk1mk2
```

Success

Failure

```json
{"status": "deleted"}
```

###### Path Parameters

`id`

\*

`string`

The unique identifier of the bill that must be deleted.

###### Errors

client not authorised to update

Error Status: 401

The client credentials are unauthorised to make changes to this bill.

Solution

Operation failed

Error Status: 500

There is an internal server error

Solution

# Delete a Bill

`DELETE`

`/v1/bills/:bill_id`

Use this endpoint to delete a Bill.

Path Parameters

1

Errors

###### Path Parameters

`id`

\*

`string`

The unique identifier of the bill that must be deleted.

###### Errors

client not authorised to update

Error Status: 401

The client credentials are unauthorised to make changes to this bill.

Solution

Operation failed

Error Status: 500

There is an internal server error

Solution

Curl

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET]
-X DELETE https://api.razorpay.com/v1/bills/bill_4a5e9ulyzk1mk2
```

Success

Failure

```json
{"status": "deleted"}
```
