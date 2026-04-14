<!-- Source: https://razorpay.com/docs/api/payments/route/reverse-a-transfer -->

# Reverse a Transfer

Copy for AI

View as Markdown

`POST`

`/v1/transfers/:id/reversals`

Use this endpoint to create reversals on a particular `transfer_id`.

- The amount specified is debited from the Linked Account balance and credited to your balance.
- Partial reversals are also supported, and you can create multiple reversals on a `transfer_id`. If you do not provide the `amount` parameter in the request, then the entire amount of the transfer is reversed.

**Handy Tips**
If a reversal ID is generated, the reversal was successful.

Sample Code

Path Parameters

1

Request Parameters

Response Parameters

Errors

Curl

```bash
curl -X POST https://api.razorpay.com/v1/transfers/trf_EAznuJ9cDLnF7Y/reversals \
-u [YOUR_KEY_ID]:[YOUR_KEY_SECRET]
-H 'content-type: application/json'
-d '{
   "amount":100,
   "notes":{
      "branch":"Acme Corp Bangalore North",
      "name":"Gaurav Kumar"
   }
}'
```

Success

Failure

```json
{
  "id": "rvrsl_EB0BWgGDAu7tOz",
  "entity": "reversal",
  "transfer_id": "trf_EAznuJ9cDLnF7Y",
  "amount": 100,
  "fee": 0,
  "tax": 0,
  "currency": "INR",
  "notes": [],
  "initiator_id": "CJoeHMNpi0nC7k",
  "customer_refund_id": null,
  "created_at": 1580456007
}
```

###### Path Parameters

`id`

\*

`string`

Unique identifier of the transfer to be reversed.

###### Request Parameters

`amount`

`integer`

The amount to be reversed from the Linked Account to your account. If this parameter is not passed, the entire transfer amount will be reversed.

`notes`

`json object`

Set of key-value pairs that can be associated with an entity. These pairs can be useful for storing additional information about the entity. A maximum of 15 key-value pairs, each of 256 characters (maximum), are supported. For example, `"region": "south", "city": "Bangalore"`.

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

`created_at`

`integer`

Timestamp in Unix. This indicates the time at which the reversal was created.

###### Errors

The api key/secret provided is invalid

Error Status: 4xx

This error occurs when there is a mismatch between the API credentials passed in the API call and the API credentials generated on the Dashboard.

Solution

The amount must be at least INR 1.00

Error Status: 400

This error occurs when the amount is less than the minimum amount. The transaction amount expressed in the currency subunit, such as paise (in INR) should always be greater than or equal to ₹1.

Solution

transfer\_id is not a valid id

Error Status: 400

This error occurs when you pass an invalid `transfer_id` in the API endpoint.

Solution

The linked account does not have sufficient balance to process reversal.

Error Status: 400

Insufficient balance in the linked account to complete the reversal.

Solution

# Reverse a Transfer

Copy for AI

View as Markdown

`POST`

`/v1/transfers/:id/reversals`

Use this endpoint to create reversals on a particular `transfer_id`.

- The amount specified is debited from the Linked Account balance and credited to your balance.
- Partial reversals are also supported, and you can create multiple reversals on a `transfer_id`. If you do not provide the `amount` parameter in the request, then the entire amount of the transfer is reversed.

**Handy Tips**
If a reversal ID is generated, the reversal was successful.

Path Parameters

1

Request Parameters

Response Parameters

Errors

###### Path Parameters

`id`

\*

`string`

Unique identifier of the transfer to be reversed.

###### Request Parameters

`amount`

`integer`

The amount to be reversed from the Linked Account to your account. If this parameter is not passed, the entire transfer amount will be reversed.

`notes`

`json object`

Set of key-value pairs that can be associated with an entity. These pairs can be useful for storing additional information about the entity. A maximum of 15 key-value pairs, each of 256 characters (maximum), are supported. For example, `"region": "south", "city": "Bangalore"`.

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

`created_at`

`integer`

Timestamp in Unix. This indicates the time at which the reversal was created.

###### Errors

The api key/secret provided is invalid

Error Status: 4xx

This error occurs when there is a mismatch between the API credentials passed in the API call and the API credentials generated on the Dashboard.

Solution

The amount must be at least INR 1.00

Error Status: 400

This error occurs when the amount is less than the minimum amount. The transaction amount expressed in the currency subunit, such as paise (in INR) should always be greater than or equal to ₹1.

Solution

transfer\_id is not a valid id

Error Status: 400

This error occurs when you pass an invalid `transfer_id` in the API endpoint.

Solution

The linked account does not have sufficient balance to process reversal.

Error Status: 400

Insufficient balance in the linked account to complete the reversal.

Solution

Curl

```bash
curl -X POST https://api.razorpay.com/v1/transfers/trf_EAznuJ9cDLnF7Y/reversals \
-u [YOUR_KEY_ID]:[YOUR_KEY_SECRET]
-H 'content-type: application/json'
-d '{
   "amount":100,
   "notes":{
      "branch":"Acme Corp Bangalore North",
      "name":"Gaurav Kumar"
   }
}'
```

Success

Failure

```json
{
  "id": "rvrsl_EB0BWgGDAu7tOz",
  "entity": "reversal",
  "transfer_id": "trf_EAznuJ9cDLnF7Y",
  "amount": 100,
  "fee": 0,
  "tax": 0,
  "currency": "INR",
  "notes": [],
  "initiator_id": "CJoeHMNpi0nC7k",
  "customer_refund_id": null,
  "created_at": 1580456007
}
```
