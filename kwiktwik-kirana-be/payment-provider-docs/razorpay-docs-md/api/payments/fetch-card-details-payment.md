<!-- Source: https://razorpay.com/docs/api/payments/fetch-card-details-payment -->

# Fetch Card Details of a Payment

`GET`

`/v1/payments/:id/card`

Use this endpoint to retrieve the details of the card used to make a payment.

Sample Code

Path Parameters

1

Response Parameters

Errors

Curl

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET]
-X GET https://api.razorpay.com/v1/payments/pay_DtFYPi3IfUTgsL/card
```

Success

Failure

```json
{
  "id": "card_JXPULjlKqC5j0i",
  "entity": "card",
  "name": "Gaurav Kumar",
  "last4": "4366",
  "network": "Visa",
  "type": "credit",
  "issuer": "UTIB",
  "international": false,
  "emi": false,
  "sub_type": "consumer",
  "token_iin": null
}
```

###### Path Parameters

`id`

\*

`string`

Unique identifier of the payment for which you want to retrieve card details.

###### Response Parameters

`card`

`object`

Details of the card used to make the payment.

Show child parameters (9)

###### Errors

The API {key/secret} provided is invalid.

Error Status: 4xx

The API credentials passed in the API call differ from the ones generated on the Dashboard.

Solution

The id provided does not exist.

Error Status: 400

The `payment_id` provided is incorrect.

Solution

Payment was not done using card.

Error Status: 400

The payment for the `payment_id` entered was not completed using a card.

Solution

# Fetch Card Details of a Payment

`GET`

`/v1/payments/:id/card`

Use this endpoint to retrieve the details of the card used to make a payment.

Path Parameters

1

Response Parameters

Errors

###### Path Parameters

`id`

\*

`string`

Unique identifier of the payment for which you want to retrieve card details.

###### Response Parameters

`card`

`object`

Details of the card used to make the payment.

Show child parameters (9)

###### Errors

The API {key/secret} provided is invalid.

Error Status: 4xx

The API credentials passed in the API call differ from the ones generated on the Dashboard.

Solution

The id provided does not exist.

Error Status: 400

The `payment_id` provided is incorrect.

Solution

Payment was not done using card.

Error Status: 400

The payment for the `payment_id` entered was not completed using a card.

Solution

Curl

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET]
-X GET https://api.razorpay.com/v1/payments/pay_DtFYPi3IfUTgsL/card
```

Success

Failure

```json
{
  "id": "card_JXPULjlKqC5j0i",
  "entity": "card",
  "name": "Gaurav Kumar",
  "last4": "4366",
  "network": "Visa",
  "type": "credit",
  "issuer": "UTIB",
  "international": false,
  "emi": false,
  "sub_type": "consumer",
  "token_iin": null
}
```
