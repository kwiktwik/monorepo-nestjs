<!-- Source: https://razorpay.com/docs/payments/international-payments/accept-international-payments-from-indian-customers/s2s-integration/recurring-payments/upi-tpv/authorization-transaction -->

Given below are the steps to create an authorisation transaction using the Razorpay APIs.

## 1.1 Create a Customer

Razorpay links recurring tokens to customers using a unique identifier generated through the Customer API.

You can create [customers](/razorpay-docs-md/api/customers.md) with basic information such as `email` and `contact` and use them for various Razorpay offerings. The following endpoint creates a customer.

POST

/customers

Sample Code

Request Parameters

name

`string` The name of the customer. For example, `Gaurav Kumar`.

email

`string` The email address of the customer. For example, `gaurav.kumar@example.com`.

contact

`string` The phone number of the customer. For example, `9876543210`.

fail\_existing

optional

`string` The request throws an exception by default if a customer with the exact details already exists. You can pass an additional parameter `fail_existing` to get the existing customer's details in the response. Possible values:

- `1` (default): If a customer with the same details already exists, throws an error.
- `0`: If a customer with the same details already exists, fetches details of the existing customer.

notes

optional

`object` Key-value pair that can be used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

Response Parameters

id

`string` The unique identifier of the customer. For example `cust_1Aa00000000001`.

entity

`string` The name of the entity. Here, it is `customer`.

name

`string` The name of the customer. For example, `Gaurav Kumar`.

email

`string` The email address of the customer. For example, `gaurav.kumar@example.com`.

contact

`string` The phone number of the customer. For example, `9876543210`.

notes

`object` Key-value pair that can be used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

created\_at

`integer` A Unix timestamp, at which the customer was created.

You can create an order once you create a customer for the payment authorisation.

## 1.2 Create an Order

Use the [Orders API](/razorpay-docs-md/api/orders.md) to create a unique Razorpay `order_id` that is associated with the authorisation transaction. The following endpoint creates an order.

POST

/orders

Request

copy

```bash
curl -u <YOUR_KEY_ID>:<YOUR_KEY_SECRET> \
-X POST https://api.razorpay.com/v1/orders \
-H "Content-Type: application/json" \
-d '{
    "amount": 1000,
    "currency": "INR",
    "merchant_id": "D2eavTHExqy97j",
    "customer_id": "cust_N8fv8Nftx5hato",
    "method": "upi",
    "token": {
        "max_amount": 200000,
        "expire_at": 1709971120,
        "frequency": "monthly",
        "recurring_value": 9,
        "recurring_type": "on"
    },
    "bank_account": {
        "account_number": "123456789012345",
        "name": "Gaurav Kumar",
        "ifsc": "HDFC0000053"
    },
    "customer_details": {
        "name": "Gaurav Kumar",
        "email": "gaurav.kumar@example.com",
        "contact": "9000090000",
        "shipping_address": {
            "line1": "Mantri apartment",
            "line2": "Koramangala",
            "city": "Bengaluru",
            "country": "IND",
            "state": "Karnataka",
            "zipcode": "560032",
            "latitude": "123123",
            "longitude": "1231231"
        },
        "insights": {
            "order_count": "22",
            "chargeback_count": "4",
            "tier": "gold",
            "booking_channel": "agent",
            "has_account": true,
            "registered_at": 1234567890
        }
    },
    "receipt": "Receipt No. 1",
    "notes": {
        "notes_key_1": "Tea, Earl Grey, Hot",
        "notes_key_2": "Tea, Earl Grey… decaf."
    }
}'
```

SuccessFailure

copy

```json
{
    "amount": 1000,
    "amount_due": 1000,
    "amount_paid": 0,
    "attempts": 0,
    "created_at": 1707468938,
    "currency": "INR",
    "entity": "order",
    "id": "order_NYirPLFPraZLtB",
    "notes": {
        "notes_key_1": "Tea, Earl Grey, Hot",
        "notes_key_2": "Tea, Earl Grey… decaf."
    },
    "offer_id": null,
    "receipt": "Receipt No. 1",
    "status": "created"
}
```

Request Parameters

amount

mandatory

`integer` Amount in currency subunits.

currency

mandatory

`string` The 3-letter ISO currency code for the payment. Currently, we only support `INR`.

merchant\_id

mandatory

`string` This is the Razorpay merchant ID for your Razorpay account. You can find this by logging in to the Dashboard and clicking the user icon in the top right corner.

customer\_id

mandatory

`string` The unique identifier of the customer. For example, `cust_4xbQrmEoA5WJ01`.

method

mandatory

`string` The authorisation method. Here, it is `upi`.

token

`object` Details related to the authorisation such as max amount, frequency and expiry information.

max\_amount

mandatory

`integer` The maximum amount that can be debited in a single charge.

For other categories and MCCs, the minimum value is `100` (₹1) and maximum value is 9999900 (₹99,999).

expire\_at

mandatory

`integer` The Unix timestamp that indicates when the authorisation transaction must expire. The default value is 10 years, and the maximum value allowed is 30 years.

frequency

mandatory

`string` The frequency at which you can charge your customer. Possible values:

- `daily`
- `weekly`
- `fortnightly`
- `bimonthly`
- `monthly`
- `quarterly`
- `half_yearly`
- `yearly`
- `as_presented`

recurring\_value

optional

`integer` Determines the exact date or range of dates for recurring debits. Possible values are:

- 1-7 for `weekly` frequency
- 1-31 for `fortnightly` frequency
- 1-31 for `bimonthly` frequency
- 1-31 for `monthly` frequency
- 1-31 for `quarterly` frequency
- 1-31 for `half_yearly` frequency
- 1-31 for `yearly` frequency and is not applicable for the `as_presented` frequency.

**Watch Out!**

If the date entered for the recurring debit is not available for a month, then the last day of the month is considered by default. For example, if the date entered is 31 and the month has only 28 days, then the date 28 is considered.

recurring\_type

optional

`string` Determines when the recurring debit can be done. Possible values are:

- `on`: Recurring debit happens on the exact day of every month.

  **Handy Tips**

  For creating an order with `recurring_type`=`on`, set the `recurring_value` parameter to the current date.
- `before`: Recurring debit can happen any time before the specified date.
- `after`: Recurring debit can happen any time after the specified date.

For example, if the `frequency` is `monthly`, `recurring_value` is `17`, and `recurring_type` is `before`, recurring debit can happen between the month's 1st and 17th. Similarly, if `recurring_type` is `after`, recurring debit can only happen on or after the 17th of the month.

bank\_account

mandatory

`object` Details of the bank account of the customer.

account\_number

mandatory

`string` The bank account number of the customer. For example, `123456789012345`.

ifsc

mandatory

`string` The IFSC of the bank. For example, `HDFC0000053`.

name

mandatory

`string` The name of the bank account holder.

customer\_details

mandatory

`object` This contains details about the customer details of the order.

name

mandatory

`string` Customer's name.

- Character length: Between 5 and 50 characters.
- Allowed characters: Uppercase letters (A-Z), lowercase letters (a-z), and spaces (not at the beginning).
- Not allowed characters: Numbers, special characters (e.g., @, ", ,, ., etc.), Unicode characters, emojis, and non-Latin scripts or regional languages.
- Prohibited names: Names must be meaningful and contextually appropriate.
  - Avoid using repetitive patterns (e.g., aaa, xyz, kkk kk).
  - Names like litri litri, Hfg Gh, or husi husi are not permitted.
  - Curse words or offensive names are not prohibited.
- Example: `Gaurav Kumar`.

email

optional

`string` The customer's email address. A maximum length of 64 characters for the username. For example, in " [gaurav.kumar@example.com](mailto:gaurav.kumar@example.com)

", "gaurav.kumar" must not exceed 64 characters.

contact

optional

`string` The customer's phone number. A maximum length of 15 characters including country code. For example, `+919000090000`.

shipping\_address

mandatory

`object` This contains the shipping address of the order.

line1

mandatory

`string` Address Line 1 of the address.

- Character length: Must be between 3 and 100 characters.
- Allowed characters: Uppercase letters (A-Z), lowercase letters (a-z), numbers (0-9), spaces, and special characters (\*&/-()#\_+[]:'".,.).
- Not allowed characters: Regional languages.

line2

mandatory

`string` Address Line 2 of the address.

- Character length: Must be between 3 and 100 characters.
- Allowed characters: Uppercase letters (A-Z), lowercase letters (a-z), numbers (0-9), spaces, and special characters (\*&/-()#\_+[]:'".,.).
- Not allowed characters: Regional languages.

city

mandatory

`string` Name of the city. Must be between 3 and 50 characters in length and can only include uppercase (A-Z) and lowercase (a-z) English letters, and spaces.

country

mandatory

`string` ISO3 country code of the billing address. Only `IND` is allowed.

state

mandatory

`string` Name of the state. It must be between 3 and 50 characters extended and can only include uppercase (A-Z) and lowercase (a-z) English letters and spaces. Please send the full name of the state, for example, Madhya Pradesh.

zipcode

mandatory

`string` The ZIP code must consist of 6-digit numeric characters. Only valid Indian ZIP codes will be accepted. Refer to the [list of supported ZIP codes](/razorpay-docs-md/international-payments/accept-international-payments-from-indian-customers/s2s-integration/recurring-payments/upi-tpv/build/browser/assets/images/list-of-supported-zip-codes.md).

latitude

optional

`float` Latitude of the position expressed in decimal degrees (WSG 84), for example, 6.244203. A positive value denotes the northern hemisphere or the equator, and a negative value denotes the southern hemisphere. The number of digits to represent the precision of the coordinate.

longitude

optional

`float` Longitude of the position expressed in decimal degrees (WSG 84), for example, -75.581211. A positive value denotes east longitude or the prime meridian, and a negative value denotes west longitude. The number of digits to represent the precision of the coordinate.

insights

optional

`json object` Additional details of the customer, including past transaction data.

order\_count

optional

`integer` Total orders placed by the account so far on the business platform. For example, 22.

chargeback\_count

optional

`integer` Total chargeback received for the customer account on the business platform. For example, 4.

tier

optional

`string`  Your company's passenger classification, such as with a frequent flyer program. In this case, you might use values such as:

- `standard`
- `gold`
- `platinum`

booking\_channel

optional

`string` To share if the user is an agent, corporate, or individual. Possible values:

- `agent`
- `corporate`
- `individual`

has\_account

optional

`boolean` To denote if the buyer is on guest checkout or has logged into the account. Possible values:
`- 1`: If the user is logged into the account.
`- 0`: If the user is on guest checkout.

registered\_at

optional

`integer` UNIX timestamp when the customer account was created. For example, 1234567890.

receipt

optional

`string` A user-entered unique identifier for the order. For example, `Receipt No. 1`. You should map this parameter to the `order_id` sent by Razorpay.

notes

optional

`object` Key-value pair you can use to store additional information about the entity. Maximum 15 key-value pairs, 256 characters each. For example, `"note_key": "Beam me up Scotty”`.

Response Parameters

amount

`integer` Amount in currency subunits. For cards, the amount should be `100` (₹1).

amount\_due

`integer` The amount that the customer has yet to pay.

amount\_paid

`integer` The amount that has been paid.

attempts

`integer` The number of payment attempts, successful and failed, that have been made against this order.

created\_at

`integer` The Unix timestamp at which the order was created.

currency

`string` The 3-letter ISO currency code for the payment. Currently, we only support `INR`.

entity

`string` Name of the entity. Here, it is `order`.

id

`string` A unique identifier of the order created. For example `order_1Aa00000000002`.

notes

`object` Key-value pair that can be used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

receipt

`string` A user-entered unique identifier of the order. For example, `Receipt No. 1`. You should map this parameter to the `order_id` sent by Razorpay.

status

`string` The status of the order.

Error Response Parameters

Given below is a list of possible errors you may face while creating an Order.

## 1.3 Validate the VPA (UPI ID)

Use the below endpoint to validate the customer's UPI ID.

POST

/payments/validate/vpa

RequestSuccess

copy

```bash
curl -u <YOUR_KEY_ID>:<YOUR_KEY_SECRET> \
-X POST https://api.razorpay.com/v1/payments/validate/vpa \
-H "Content-Type: application/json" \
-d '{
  "vpa": "9000090000@paytm"
}'
```

Request Parameters

vpa

mandatory

`string` The UPI ID you want to validate. For example, `gauravkumar@exampleupi`.

## 1.4 Create an Authorisation Payment

Once an order is created, your next step is to create a payment. Use the below endpoint to create a payment with payment method `upi`.

UPI Intent

UPI Collect

POST

/payments/create/upi

RequestResponse

copy

```bash
curl -u <YOUR_KEY_ID>:<YOUR_KEY_SECRET> \
-X POST https://api.razorpay.com/v1/payments/create/upi \
-H "Content-Type: application/json" \
-d '{
  "amount": 200,
  "currency": "INR",
  "order_id": "order_Ee0biRtLOqzRjP",
  "email": "gaurav.kumar@example.com",
  "contact": "9000090000",
  "customer_id": "cust_EIW4T2etiweBmG",
  "recurring": "1",
  "method": "upi",
  "upi": {
    "flow": "intent"
  },
  "ip": "192.168.0.103",
  "referer": "http",
  "user_agent": "Mozilla/5.0",
  "description": "Test flow",
  "notes": {
    "invoice_number": "IRS1245",
    "goods_description": "Digital Lamp"
  }
}'
```

Request Parameters

amount

mandatory

`integer` The amount associated with the payment in smallest unit of the supported currency. For example, `2000` means ₹20. Must match the amount in [Step 1.2 Create an Order](/razorpay-docs-md/international-payments/accept-international-payments-from-indian-customers/s2s-integration/recurring-payments/upi-tpv/authorization-transaction.md#12-create-an-order).

currency

mandatory

`string` The 3-letter ISO currency code for the payment. Currently, we only support INR.

order\_id

mandatory

`string` The unique identifier of the order created in [Step 1.2 Create an Order](/razorpay-docs-md/international-payments/accept-international-payments-from-indian-customers/s2s-integration/recurring-payments/upi-tpv/authorization-transaction.md#12-create-an-order).

email

mandatory

`string` The customer's email address. For example, `gaurav.kumar@example.com`.

contact

mandatory

`string` The customer's contact number. For example, `9123456780`.

customer\_id

mandatory

`string` Unique identifier of the customer, obtained from the response of [Step 1.1 Create an Customer](/razorpay-docs-md/international-payments/accept-international-payments-from-indian-customers/s2s-integration/recurring-payments/upi-tpv/authorization-transaction.md#11-create-a-customer).

recurring

mandatory

`string` Possible values:

- `1`: Recurring payment is enabled.
- `preferred`: Use this when you want to support recurring payments and one-time payment in the same flow.

method

mandatory

`string` The payment method selected by the customer. Here, the value must be `upi`.

upi

`object` Details of the expiry of the UPI link

flow

mandatory

`string` Specify the type of the UPI payment flow.
 Possible values are:

- `collect` (default)
- `intent`

vpa

mandatory

`string` VPA of the customer where the collect request will be sent.

expiry\_time

mandatory

`integer` Period of time (in minutes) after which the link will expire. The default value is **5**.

ip

mandatory

`string` Client's browser IP address. For example, **117.217.74.98**.

referer

mandatory

`string` Value of `referer` header passed by the client's browser. For example, **<https://example.com/>**

user\_agent

mandatory

`string` Value of `user_agent` header passed by the client's browser.
For example, **Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36**

description

optional

`string` Descriptive text of the payment.

save

optional

`boolean` Specifies if the VPA should be stored as a token. Possible values:

- `true`: Saves the VPA details.
- `false`(default): Does not save the VPA details.

notes

mandatory

`object` Key-value pair that can be used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

invoice\_number

mandatory

`string` Invoice number of the generated invoice. Ensure that each payment has a unique invoice number, with a length of fewer than 40 characters.

goods\_description

optional

`string` Description of the goods. For example, `Digital Lamp`.

Response Parameters

razorpay\_payment\_id

`string` Unique reference for the payment created. For example, `pay_EAm09NKReXi2e0`.

link

`string` UPI Intent deeplink that can be used to trigger UPI apps or displayed as a QR code.

If the payment request is valid, the response contains the following fields. Refer to the [UPI Collect Flow document](/razorpay-docs-md/payment-gateway/s2s-integration/payment-methods/upi/collect.md#step-4-initiate-a-payment) for more details.
