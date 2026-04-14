<!-- Source: https://razorpay.com/docs/payments/international-payments/accept-international-payments-from-indian-customers/standard-integration/recurring-payments/upi-tpv/subsequent-payments -->

You should perform the following steps to create and charge your customer subsequent payments:

## 3.1 Create an Order to Charge the Customer

You have to create a new order every time you want to charge your customers. This order is different from the one created during the authorisation transaction.

The following endpoint creates an order.

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

`integer` Amount in currency subunits. For cards, the amount should be `100` (₹1).

currency

mandatory

`string` The 3-letter ISO currency code for the payment. Currently, we only support `INR`.

merchant\_id

mandatory

`string` This is the Razorpay merchant ID for your Razorpay account. You can find this by logging in to the Dashboard and clicking the user icon in the top right corner.

customer\_id

mandatory

`string` The unique identifier of the customer. For example, `cust_4xbQrmEoA5WJ01`.

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

`string` The ZIP code must consist of 6-digit numeric characters. Only valid Indian ZIP codes will be accepted. Refer to the [list of supported ZIP codes](/razorpay-docs-md/international-payments/accept-international-payments-from-indian-customers/standard-integration/recurring-payments/upi-tpv/build/browser/assets/images/list-of-supported-zip-codes.md).

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
- `1`: If the user is logged into the account.

- `0`: If the user is on guest

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

method

`string` Payment method used to make the authorisation transaction. Here, it is `card`.

notes

`object` Key-value pair that can be used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

receipt

`string` A user-entered unique identifier of the order. For example, `Receipt No. 1`. You should map this parameter to the `order_id` sent by Razorpay.

status

`string` The status of the order.

You can create a payment against the `order_id` after you create an order.

Error Response Parameters

Given below is a list of possible errors you may face while creating an Order.

## 3.2 Create a Recurring Payment

Once you have generated an `order_id`, use it to create a payment and charge the customer. The following endpoint creates a payment to charge the customer.

POST

/payments/create/recurring

Request

copy

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X POST https://api.razorpay.com/v1/payments/create/recurring \
-H "Content-Type: application/json" \
-d '{
    "amount": 1000,
    "currency": "INR",
    "order_id": "order_NYMptG6ChGaFgj",
    "email": "gaurav.kumar@example.com",
    "contact": "9000090000",
    "customer_id": "cust_N8fv8Nftx5hato",
    "token": "token_NZveVUfP5fn0fq",
    "recurring": "1",
    "notes": {
        "invoice_number": "IRS1245",
        "goods_description": "Digital Lamp"
    }
}'
```

SuccessFailure

copy

```json
{
  "razorpay_payment_id" : "pay_1Aa00000000001"
}
```

**UPI Payments**

- We recommend sending a pre-debit notification to the customer 48 hours before the debit date.
- For UPI, it may take between 24-36 hours for the subsequent payment to reflect on your Dashboard.
- This is because of the failure of pre-debit notification and/or any retries that we attempt for the payment.
- Do not create another subsequent payment until you get the status of the previous one.

**UPI Payments**

For UPI, **do not** create subsequent payments on the last day of the cycle. This will cause the payment to fail.

Request Parameters

amount

mandatory

`integer` The amount associated with the payment in smallest unit of the supported currency. For example, `2000` means ₹20. Must match the amount in [Create an order to charge the customer](/razorpay-docs-md/international-payments/accept-international-payments-from-indian-customers/standard-integration/recurring-payments/upi-tpv/subsequent-payments.md#21-create-an-order-to-charge-the-customer).

currency

mandatory

`string` The 3-letter ISO currency code for the payment. Currently, we only support INR.

order\_id

mandatory

`string` The unique identifier of the order created in [Create an order to charge the customer](/razorpay-docs-md/international-payments/accept-international-payments-from-indian-customers/standard-integration/recurring-payments/upi-tpv/subsequent-payments.md#21-create-an-order-to-charge-the-customer).

email

mandatory

`string` The customer's email address. For example, `gaurav.kumar@example.com`.

contact

mandatory

`string` The customer's contact number. For example, `9000090000`.

customer\_id

mandatory

`string` Unique identifier of the customer, obtained from the response of Customer API.

token

mandatory

`string` The `token_id` generated when the customer successfully completes the authorisation payment. Different payment instruments for the same customer have different `token_id`.

recurring

mandatory

`string` Possible values:

- `1`: Recurring payment is enabled.
- `preferred`: Use this when you want to support recurring payments and one-time payment in the same flow.

notes

mandatory

`object` Key-value pair that can be used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

invoice\_number

mandatory

`string` Invoice number of the generated invoice. Ensure that each payment has a unique invoice number, with a length of fewer than 40 characters.

goods\_description

optional

`string` Description of the goods. For example, `Digital Lamp`.

Error Response Parameters

Given below is a list of possible errors you may face while creating a Recurring Payment.
