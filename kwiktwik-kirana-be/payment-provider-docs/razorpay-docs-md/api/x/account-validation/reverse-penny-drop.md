<!-- Source: https://razorpay.com/docs/api/x/account-validation/reverse-penny-drop -->

# Validate VPA using Reverse Penny Drop

`POST`

`/v1/fund_accounts/validations`

Use this endpoint to validate the bank account details via Reverse Penny Drop.

Sample Code

Request Parameters

Response Parameters

Curl

```bash
curl -u [YOUR_KEY]:[YOUR_SECRET] \
-X POST https://api.razorpay.com/v1/fund_accounts/validations \
-H "Content-Type: application/json" \
-d '{
  "source_account_number": "7878780080316316",
  "validation_type": "upi_intent",
  "reference_id": "112233",
  "notes": {
    "random_key_1": "Make it so",
    "random_key_2": "Tea. Earl Grey. Hot."
  }
}'
```

Response - Initial

Response - After Payment

```json
{
  "id": "fav_00000000000001",
  "entity": "fund_account.validation",
  "status": "created",
  "utr": "123456789012",
  "upi_intent": {
    "intent_url": "upi://pay?pa=razorpayx@citibank&pn=RZPX%20PRIVATE%20LTD&mc=7413&cu=INR&am=1.00&tn=BAV&ver=01&mode=04&qrMedium=02&tr=RjY7anDJFuKQOB",
    "phonepe_url": "phonepe://upi/pay?pa=razorpayx@citibank&pn=RZPX%20PRIVATE%20LTD&mc=7413&cu=INR&am=1.00&tn=BAV&ver=01&mode=04&qrMedium=02&tr=RjY7anDJFuKQOB",
    "gpay_url": "tez://upi/pay?pa=razorpayx@citibank&pn=RZPX%20PRIVATE%20LTD&mc=7413&cu=INR&am=1.00&tn=BAV&ver=01&mode=04&qrMedium=02&tr=RjY7anDJFuKQOB",
    "paytm_url": "paytmmp://upi/pay?pa=razorpayx@citibank&pn=RZPX%20PRIVATE%20LTD&mc=7413&cu=INR&am=1.00&tn=BAV&ver=01&mode=04&qrMedium=02&tr=RjY7anDJFuKQOB",
    "bhim_url": "bhim://upi/pay?pa=razorpayx@citibank&pn=RZPX%20PRIVATE%20LTD&mc=7413&cu=INR&am=1.00&tn=BAV&ver=01&mode=04&qrMedium=02&tr=RjY7anDJFuKQOB",
    "encoded_qr_code": "iVBORw0KGgoAAAANSUhEUgAAAQAAAAEAAQMAAABmvDolAAAABlBMVEX///8AAABVwtN+AAACWUlEQVR42uyYy3E7LRDEe4sDR0IglM1sH+"
  },
  "validation_results": {
    "account_status": null,
    "registered_name": null,
    "details": null,
    "name_match_score": null,
    "validated_account_type": null,
    "bank_account": {
      "bank_routing_code": null,
      "account_number": null,
      "bank_name": null,
      "account_type": null
    }
  },
  "status_details": {
    "description": "Validation request is created",
    "source": "internal",
    "reason": "validation_request_created"
  },
  "reference_id": "112233",
  "notes": {
    "random_key_1": "Make it so.",
    "random_key_2": "Tea. Earl Grey. Hot."
  }
}
```

###### Request Parameters

`source_account_number`

\*

`string`

Bank account number being validated. For example, `765432123456789`.

`validation_type`

\*

`string`

The method used for validating the bank account. Here, it is `upi_intent`.

`reference_id`

`string`

Unique reference id of the fund account being validated.

`notes`

`object`

Key-value pair that can be used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each.

###### Response Parameters

`id`

`string`

The unique identifier linked to the fund account. For example, `fa_00000000000001`.

`entity`

`string`

Here it will be `fund_account.validation`.

`status`

`string`

The status of the fund account validation. For example, in the initial response, it could be `created` and in the after payment response, `completed`.

`utr`

`string`

The Unique Transaction Reference number assigned to the ₹1 UPI payment made by the end user. Use this to track or reconcile the transaction.

`upi_intent`

`object`

Contains deep links to launch specific UPI apps directly on the user's device, allowing them to complete the ₹1 payment without manually entering details.

Show child parameters (6)

`validation_results`

`object`

Contains the verified account details extracted from the payer's bank after the ₹1 payment is received.

Show child parameters (4)

`bank_account`

`object`

Contains the verified bank account details of the payer.

Show child parameters (4)

`status_details`

`object`

Contains details about the status of the validation.

Show child parameters (3)

`reference_id`

`string`

Unique reference id generated for the validation.

`notes`

`object`

Key-value pair that can be used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each.

# Validate VPA using Reverse Penny Drop

`POST`

`/v1/fund_accounts/validations`

Use this endpoint to validate the bank account details via Reverse Penny Drop.

Request Parameters

Response Parameters

###### Request Parameters

`source_account_number`

\*

`string`

Bank account number being validated. For example, `765432123456789`.

`validation_type`

\*

`string`

The method used for validating the bank account. Here, it is `upi_intent`.

`reference_id`

`string`

Unique reference id of the fund account being validated.

`notes`

`object`

Key-value pair that can be used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each.

###### Response Parameters

`id`

`string`

The unique identifier linked to the fund account. For example, `fa_00000000000001`.

`entity`

`string`

Here it will be `fund_account.validation`.

`status`

`string`

The status of the fund account validation. For example, in the initial response, it could be `created` and in the after payment response, `completed`.

`utr`

`string`

The Unique Transaction Reference number assigned to the ₹1 UPI payment made by the end user. Use this to track or reconcile the transaction.

`upi_intent`

`object`

Contains deep links to launch specific UPI apps directly on the user's device, allowing them to complete the ₹1 payment without manually entering details.

Show child parameters (6)

`validation_results`

`object`

Contains the verified account details extracted from the payer's bank after the ₹1 payment is received.

Show child parameters (4)

`bank_account`

`object`

Contains the verified bank account details of the payer.

Show child parameters (4)

`status_details`

`object`

Contains details about the status of the validation.

Show child parameters (3)

`reference_id`

`string`

Unique reference id generated for the validation.

`notes`

`object`

Key-value pair that can be used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each.

Curl

```bash
curl -u [YOUR_KEY]:[YOUR_SECRET] \
-X POST https://api.razorpay.com/v1/fund_accounts/validations \
-H "Content-Type: application/json" \
-d '{
  "source_account_number": "7878780080316316",
  "validation_type": "upi_intent",
  "reference_id": "112233",
  "notes": {
    "random_key_1": "Make it so",
    "random_key_2": "Tea. Earl Grey. Hot."
  }
}'
```

Response - Initial

Response - After Payment

```json
{
  "id": "fav_00000000000001",
  "entity": "fund_account.validation",
  "status": "created",
  "utr": "123456789012",
  "upi_intent": {
    "intent_url": "upi://pay?pa=razorpayx@citibank&pn=RZPX%20PRIVATE%20LTD&mc=7413&cu=INR&am=1.00&tn=BAV&ver=01&mode=04&qrMedium=02&tr=RjY7anDJFuKQOB",
    "phonepe_url": "phonepe://upi/pay?pa=razorpayx@citibank&pn=RZPX%20PRIVATE%20LTD&mc=7413&cu=INR&am=1.00&tn=BAV&ver=01&mode=04&qrMedium=02&tr=RjY7anDJFuKQOB",
    "gpay_url": "tez://upi/pay?pa=razorpayx@citibank&pn=RZPX%20PRIVATE%20LTD&mc=7413&cu=INR&am=1.00&tn=BAV&ver=01&mode=04&qrMedium=02&tr=RjY7anDJFuKQOB",
    "paytm_url": "paytmmp://upi/pay?pa=razorpayx@citibank&pn=RZPX%20PRIVATE%20LTD&mc=7413&cu=INR&am=1.00&tn=BAV&ver=01&mode=04&qrMedium=02&tr=RjY7anDJFuKQOB",
    "bhim_url": "bhim://upi/pay?pa=razorpayx@citibank&pn=RZPX%20PRIVATE%20LTD&mc=7413&cu=INR&am=1.00&tn=BAV&ver=01&mode=04&qrMedium=02&tr=RjY7anDJFuKQOB",
    "encoded_qr_code": "iVBORw0KGgoAAAANSUhEUgAAAQAAAAEAAQMAAABmvDolAAAABlBMVEX///8AAABVwtN+AAACWUlEQVR42uyYy3E7LRDEe4sDR0IglM1sH+"
  },
  "validation_results": {
    "account_status": null,
    "registered_name": null,
    "details": null,
    "name_match_score": null,
    "validated_account_type": null,
    "bank_account": {
      "bank_routing_code": null,
      "account_number": null,
      "bank_name": null,
      "account_type": null
    }
  },
  "status_details": {
    "description": "Validation request is created",
    "source": "internal",
    "reason": "validation_request_created"
  },
  "reference_id": "112233",
  "notes": {
    "random_key_1": "Make it so.",
    "random_key_2": "Tea. Earl Grey. Hot."
  }
}
```
