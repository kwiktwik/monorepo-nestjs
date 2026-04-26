<!-- Source: https://razorpay.com/docs/api/customers/customer-fund-account -->

Using Razorpay APIs, you can create a fund account for a customer. Know more about [customers](/razorpay-docs-md/customers.md).

## Create a Fund Account

You can use the below endpoint to create a fund account for a customer.

POST

/fund\_accounts

CurlJavaPythonGoPHPRubyNode.js.NETResponse

copy

```bash
curl -u <YOUR_KEY>:<YOUR_SECRET> \
-X POST https://api.razorpay.com/v1/fund_accounts \
-H "Content-Type: application/json" \
-d '{
  "customer_id":"cust_Aa000000000001",
  "account_type":"bank_account",
  "bank_account":{
    "name":"Gaurav Kumar",
    "account_number":"11214311215411",
    "ifsc":"HDFC0000053"
  }
}'
```

### Request Parameters

customer\_id

mandatory

`string` This is the unique ID linked to a customer. For example, `cust_Aa000000000001`.

account\_type

mandatory

`string` The type of account to be linked to the customer ID. In this case it will be `bank_account`.

bank\_account

`object` Customer bank account details.

name

mandatory

`string` Name of account holder as per bank records. For example, `Gaurav Kumar`.

ifsc

mandatory

`string` Customer's bank IFSC. For example, `HDFC0000053`.

account\_number

mandatory

`string` Beneficiary account number. For example, `11214311215411`.

### Response Parameters

id

`string` The unique ID linked to the fund account. For example, `fa_Aa000000000001`.

entity

`string` The name of the Razorpay entity. In this case it will be `fund_account`.

customer\_id

`string` This is the unique ID linked to a customer. For example, `cust_Aa000000000001`.

account\_type

`string` The type of account to be linked to the customer ID. In this case it will be `bank_account`.

bank\_account

`object` Customer bank account details.

name

`string` Name of account holder as per bank records. For example, `Gaurav Kumar`.

account\_number

`string` Beneficiary account number. For example, `11214311215411`.

ifsc

`string` Customer's bank IFSC. For example, `HDFC0000053`.

bank\_name

`string` Customer's bank name. For example `HDFC`.

active

`string` Status of the fund account. Possible values:

- `true`: Fund account is active.
- `false`: Fund account is inactive.

created\_at

`integer` The time at which the account was created at Razorpay. The output for this parameter is date and time in the Unix format, for example, `1543650891`.

## Fetch all Fund Accounts

You can use the below endpoint to fetch all fund accounts linked to your account.

CurlJavaPythonGoPHPRubyNode.js.NETResponse

copy

```bash
curl -u <YOUR_KEY>:<YOUR_SECRET> \
-X GET https://api.razorpay.com/v1/fund_accounts?customer_id=cust_Aa000000000001
```

### Query Parameter

customer\_id

mandatory

`string` This is the unique ID linked to a customer. For example, `cust_Aa000000000001`.
