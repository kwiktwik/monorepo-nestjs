<!-- Source: https://razorpay.com/docs/payments/international-payments/accept-international-payments-from-indian-customers/s2s-integration/recurring-payments/cards/authorization-transaction -->

Given below are the steps to create an authorisation transaction using the Razorpay APIs.

**Handy Tips**

Bank downtime can affect success rates when processing recurring payments via debit cards.

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

RequestResponse

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
    "method": "card",
    "token": {
        "max_amount": 100000000,
        "expire_at": 1709971120,
        "frequency": "monthly"
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
        "notes_key_2": "Tea, Earl Grey... decaf."
    }
}'
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

method

optional

`string` Payment method used to make the authorisation transaction. Here, it is `card`.

token

`object` Details related to the authorisation such as max amount, frequency and expiry information.

max\_amount

mandatory

`integer` The maximum amount that can be auto-debited in a single charge. The minimum value is `100` (₹1), and the maximum value is `100000000` (₹10,00,000). For an amount higher than this or the RBI limit of ₹15,000 (`1500000`), the cardholder should provide an Additional Factor of Authentication (AFA) as per RBI guidelines.

expire\_at

mandatory

`integer` The Unix timestamp that indicates when the authorisation transaction must expire. The card's expiry year is considered a default value.

frequency

mandatory

`string` The frequency at which you can charge your customer. Possible values:

- `weekly`
- `monthly`
- `yearly`
- `as_presented`

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

`string` The ZIP code must consist of 6-digit numeric characters. Only valid Indian ZIP codes will be accepted. Refer to the [list of supported ZIP codes](/razorpay-docs-md/international-payments/accept-international-payments-from-indian-customers/s2s-integration/recurring-payments/cards/build/browser/assets/images/list-of-supported-zip-codes.md).

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

token

`details` Details related to the authorisation such as max amount and bank account information.

expire\_at

`integer` The Unix timestamp to indicate till when you can use the token (authorisation on the payment method) to charge the customer subsequent payments. The default value is 10 years for `emandate`. This value can range from the current date to 31-12-2099 (`4102444799`).

max\_amount

`integer` The maximum amount in paise a customer can be charged in a transaction. The value can range from `500` to `100000000`. The default value is `9999900` (₹99,999).

You can create a payment against the `order_id` after you create an order.

## 1.3 Create an Authorisation Payment

Once an order is created, your next step is to create a payment. Use the below endpoint to create a payment with payment method `card`.

POST

/payments/create/json

RequestResponse

copy

```bash
curl -u <YOUR_KEY_ID>:<YOUR_KEY_SECRET> \
-X POST https://api.razorpay.com/v1/payments/create/json \
-H "Content-Type: application/json" \
 -d '{
    "amount": "1000",
    "currency": "INR",
    "order_id": "order_NYMDbygGb1DuDd",
    "recurring": true,
    "email": "gaurav.kumar@example.com",
    "contact": "9000090000",
    "method": "card",
    "card": {
        "number": "4854980604708430",
        "cvv": "",
        "expiry_month": "12",
        "expiry_year": "25",
        "name": "Gaurav Kumar"
    },
    "notes": {
        "invoice_number": "IRS1245",
        "goods_description": "Digital Lamp"
    }
}'
```

**Handy Tips**

- To process recurring transactions, customer card details will need to be secured/tokenised in accordance with the applicable laws. The merchant will be solely responsible for obtaining informed consent from customers for the processing of e-mandates and such consent shall be explicit and not by way of a forced/default/automatic selection of check box, radio button etc.
- When the merchant is sharing `recurring: 1` or `preferred`, it is for tokenising the card as per applicable rules for recurring mandate creation.
  If such consent is not shared during the payment flow, then Razorpay will not tokenise the card or process the e-mandate/ recurring transaction.

Request Parameters

amount

mandatory

`integer` Amount in currency subunits. For cards, the minimum value is `100` (₹1).

currency

mandatory

`string` The 3-letter ISO currency code for the payment. Currently, we only support INR.

order\_id

mandatory

`string` The unique identifier of the order created in [Step 1.2 Create an Order](/razorpay-docs-md/international-payments/accept-international-payments-from-indian-customers/s2s-integration/recurring-payments/cards/authorization-transaction.md#12-create-an-order).

recurring

mandatory

`boolean` Possible values:

- `true`: Recurring payment is enabled.
- `false`: Recurring payment is not enabled.

**Handy Tips**

You can also pass the value as 'preferred' when you want to support recurring payments and one-time payment in the same flow.

email

mandatory

`string` The customer's email address. For example, `gaurav.kumar@example.com`.

contact

mandatory

`string` The customer's contact number. For example, `9000090000`.

method

mandatory

`string` The payment method selected by the customer. Here, the value must be `card`.

card

`object` The attributes associated with a card.

number

mandatory

`integer` Unformatted card number. This field is required if value of `method` is `card`. Use one of our [test cards](/razorpay-docs-md/payments/test-card-details.md) to try out the payment flow.

cvv

mandatory

`integer` CVV printed on the back of the card.

**Handy Tips**

- CVV is not required by default for tokenised cards across all networks.
- CVV is optional for tokenised card payments. Do not pass dummy CVV values.
- To implement this change, skip passing the `cvv` parameter entirely, or pass a `null` or empty value in the CVV field.
- We recommend removing the CVV field from your checkout UI/UX for tokenised cards.
- If CVV is still collected for tokenised cards and the customer enters a CVV, pass the entered CVV value to Razorpay.

expiry\_month

mandatory

`integer` The expiry month of the card in `MM` format. For example, `01` for January and `12` for December.

expiry\_year

mandatory

`integer` Expiry year for card in the `YY` format. For example, 2025 will be in format `25`.

name

mandatory

`string` The name of the cardholder.

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

If the payment request is valid, the response contains the following fields. Refer to the [S2S Json V2 integration document](/razorpay-docs-md/payment-gateway/s2s-integration/json/v2.md#step-2-create-a-payment) for more details.

razorpay\_payment\_id

`string` Unique identifier of the payment. Present for all responses.

next

`array` A list of action objects available to you to continue the payment process. Present when the payment requires further processing.

action

`string` An indication of the next step available to you to continue the payment process. Possible values:

- `otp_generate` - Use this URL to allow the customer to generate OTP and complete the payment on your webpage.
- `redirect` - Use this URL to redirect the customer to submit the OTP on the bank page.

url

`string` URL to be used for the action indicated.
