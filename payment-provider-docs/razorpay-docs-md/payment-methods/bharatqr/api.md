<!-- Source: https://razorpay.com/docs/payments/payment-methods/bharatqr/api -->

Learn how to create a BQR payment and perform other operations using Razorpay APIs. To understand the basic concepts of our API usage, refer our [API Documentation.](/razorpay-docs-md/api/index.md)

## Get Postman Collection

We have a Postman collection to make the integration quicker and easier. You can try out our APIs on the Razorpay Postman Public Workspace. [![Run in Postman](https://run.pstmn.io/button.svg)](https://www.postman.com/razorpaydev/workspace/razorpay-public-workspace/folder/12492020-11b2db21-9019-4814-9669-c70305b8fd6e)

## Create

Each BharatQR is mapped to a virtual account. In order to generate a BharatQR, a virtual account must be created with the appropriate receiver type. The receiver defines the method of payment collection. In the case of BharatQR, the receiver type is QR Code which allows you to accept payments made via UPI or Cards.

POST

/virtual\_accounts

RequestResponse

copy

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X POST https://api.razorpay.com/v1/virtual_accounts \
-H "Content-Type: application/json" \
-d '{
  "receivers": {
    "types": [
      "qr_code"
    ]
  },
  "description": "First Payment by BharatQR",
  "customer_id": "cust_805c8oBQdBGPwS",
  "notes": {
    "reference_key": "reference_value"
  }
}'
```

### Request Parameters

receivers

mandatory

`array` consisting of configured receivers types.

types

mandatory

`array` The receiver type. Here, it will be `qr_code`.

description

optional

`string` A brief description of the payment.

customer\_id

optional

`string` Unique identifier of customer for whom BharatQR is being created. Refer [Customer API.](/razorpay-docs-md/api/customers.md) notes

optional

`object` consisting of key value pairs as notes. Refer [here](/razorpay-docs-md/api/understand.md#notes) for more details.

amount\_expected

optional

`integer` The maximum amount you expect to receive in this virtual account. Pass `69999` for ₹699.99.

## Response Parameters

id

`string` The unique identifier of the generated QR code. A sample `id` for a QR code will look like this: `qr_4lsdkfldlteskf`.

entity

`string` The name of the response entity. Here, it is `qr_code`.

reference

`string` A 14-digit reference number or a receipt for the payment. It will be the same as the value of `id` without the prefix `qr_`. A sample `reference` value will look like this: `4lsdkfldlteskf`.

short\_url

The URL of the QR code. A sample short URL looks like this `http://rzp.io/l6MS`. Clicking on the link will download the code. This will be useful for offline merchants.

status

The status of the payment. It can have two values, `active` and `closed`.

## Fetch a Payment

The following endpoint retrieves details of a specific payment.

GET

/virtual\_accounts/:id

CurlResponse

copy

```bash
curl -u <YOUR_KEY>:<YOUR_KEY_SECRET> \
   -X GET \
   https://api.razorpay.com/v1/virtual_accounts/va_4xbQrmEoA5WJ0G
```

## Fetch All Payments

The following endpoint retrieves details of all the payments.

GET

/virtual\_accounts

CurlResponse

copy

```bash
curl -u <YOUR_KEY>:<YOUR_SECRET> \
   -X GET \
   https://api.razorpay.com/v1/virtual_accounts
```

## Close

POST

/virtual\_accounts/:id/close

### Path Parameter

id

mandatory

`string`The unique identifier of the virtual account that is to be closed.

RequestResponse

copy

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X POST https://api.razorpay.com/v1/virtual_accounts/va_FaulaIlvXeGqfV/close\
```
