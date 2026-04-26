<!-- Source: https://razorpay.com/docs/payments/international-payments/accept-international-payments-from-indian-customers/s2s-integration/recurring-payments/cards/tokens -->

Once you capture a payment, Razorpay returns a `razorpay_payment_id` that can be used to fetch the `token_id`. This is a manual process and can be done using either APIs or Webhooks. This `token_id` is used to create and charge subsequent payments.

**Handy Tips**

You can also [search for the Token](/razorpay-docs-md/recurring-payments/create.md#3-search-for-the-token) on your Dashboard.

## 2.1. Fetch Token by Payment ID

The following endpoint fetches a token id using the Payment id.

GET

/payments/:id

CurlJavaPythonGoPHPRubyNode.js.NET

copy

```bash
curl -u <YOUR_KEY_ID>:<YOUR_KEY_SECRET> \
-X GET https://api.razorpay.com/v1/payments/pay_1Aa00000000001
```

Response

copy

```json
{
  "id": "pay_FHfqtkRzWvxky4",
  "entity": "payment",
  "amount": 100,
  "currency": "",
  "status": "captured",
  "order_id": "order_FHfnswDdfu96HQ",
  "invoice_id": null,
  "international": false,
  "method": "card",
  "amount_refunded": 0,
  "refund_status": null,
  "captured": true,
  "description": null,
  "card_id": "card_F0zoXUp4IPPGoI",
  "bank": null,
  "wallet": null,
  "vpa": null,
  "email": "gaurav.kumar@example.com",
  "contact": "+919876543210",
  "customer_id": "cust_DtHaBuooGHTuyZ",
  "token_id": "token_FHfn3rIiM1Z8nr",
  "notes": {
    "note_key 1": "Beam me up Scotty",
    "note_key 2": "Tea. Earl Gray. Hot."
  },
  "fee": 0,
  "tax": 0,
  "error_code": null,
  "error_description": null,
  "error_source": null,
  "error_step": null,
  "error_reason": null,
  "acquirer_data": {
    "auth_code": "541898"
  },
  "created_at": 1595449871
}
```

**Handy Tips**

You can also retrieve the `token_id` from the [payment.authorized webhook](/razorpay-docs-md/api/payments/recurring-payments/webhooks.md#payment-authorized).

Path Parameter

id

mandatory

`string` The unique identifier of the payment to be retrieved. For example, `pay_1Aa00000000002`.

## 2.2. Fetch Tokens by Customer ID

A customer can have multiple tokens and these tokens can be used to create subsequent payments for multiple products or services. The following endpoint fetches tokens linked to a customer.

**Watch Out!**

This endpoint will not fetch the details of expired, rejected and unused tokens.

GET

/customers/:id/tokens

CurlJavaPythonGoPHPRubyNode.js.NET

copy

```bash
curl -u <YOUR_KEY_ID>:<YOUR_KEY_SECRET> \
-X GET https://api.razorpay.com/v1/customers/cust_1Aa00000000002/tokens
```

Response

copy

```json
{
   "entity":"collection",
   "count":1,
   "items":[
      {
         "id":"token_HouA2OQR5Z2jTL",
         "entity":"token",
         "token":"2JPRk664pZHUWG",
         "bank":null,
         "wallet":null,
         "method":"card",
         "card":{
            "entity":"card",
            "name":"Gaurav Kumar",
            "last4":"8950",
            "network":"Visa",
            "type":"credit",
            "issuer":"STCB",
            "international":false,
            "emi":false,
            "sub_type":"consumer",
            "expiry_month":12,
            "expiry_year":2030,
            "flows":{
               "otp":true,
               "recurring":true
            }
         },
         "recurring":true,
         "recurring_details":{
            "status":"confirmed",
            "failure_reason":null
         },
         "auth_type":null,
         "mrn":null,
         "used_at":1629779657,
         "created_at":1629779657,
         "expired_at":1640975399,
         "dcc_enabled":false,
         "billing_address":null
      }
   ]
}
```

Path Parameter

id

mandatory

`string` The unique identifier of the customer for whom tokens are to be retrieved. For example, `cust_1Aa00000000002`.

## 2.3. Delete Tokens

The following endpoint deletes a token.

DELETE

/customers/:customer\_id/tokens/:token\_id

Path Parameter

customer\_id

mandatory

`string` The unique identifier of the customer with whom the token is linked. For example, `cust_1Aa00000000002`.

token\_id

mandatory

`string` The unique identifier of the token that is to be deleted. For example, `token_1Aa00000000001`.
