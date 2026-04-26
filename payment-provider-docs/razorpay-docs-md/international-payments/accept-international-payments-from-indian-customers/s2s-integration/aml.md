<!-- Source: https://razorpay.com/docs/payments/international-payments/accept-international-payments-from-indian-customers/s2s-integration/aml -->

Razorpay offers two Anti-Money Laundering (AML) solutions—Basic AML and Smart AML—designed to help businesses reduce settlement delays and minimise compliance-related transaction flags. Our risk prediction engine analyses historical transaction data and regulatory signals to accurately identify potential risks, reducing AML flags by up to 90% while maintaining compliance standards.

Advantages

- **Reduced AML Hits**: Up to 90% reduction in flagged transactions with proper implementation.
- **Faster Settlements**: Minimise manual reviews and accelerate fund availability.
- **Flexible Integration**: Choose between Basic AML for simplicity or Smart AML for intelligent risk management.
- **Improved Conversion**: Collect additional details only when necessary, reducing customer friction.
- **Regulatory Compliance**: Automatically meet RBI requirements for high-value transactions.

## Basic AML Integration

Basic AML enables you to proactively provide additional customer information with every order, thereby reducing the likelihood that it will be flagged for AML review.

You need to pass a few additional parameters related to AML in the Orders API. There is no other change in the rest of the [S2S integration steps](/razorpay-docs-md/international-payments/accept-international-payments-from-indian-customers/s2s-integration/build-integration.md).

Sample Code

POST

/orders

Request

copy

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X POST https://api.razorpay.com/v1/orders \
-H "Content-Type: application/json" \
-d '{
  "amount": 10000,
  "currency": "",
  "receipt": "receipt#1",
  "customer_id": "cust_OwZZseNBf9Uqsi",
  "customer_details": {
    "business_type": "individual",
    "name": "Gaurav Kumar",
    "email": "gaurav.kumar@example.com",
    "contact": "+919876543210",
    "individual": {
      "date_of_birth": {
        "day": 27,
        "month": 11,
        "year": 1993
      },
      "place_of_birth": "Bengaluru",
      "tax_identity": [
        {
          "name": "PAN",
          "value": "ABCDE1234F"
        }
      ]
    }
  }
}'
```

Response

copy

```json
{
  "amount": 10000,
  "amount_due": 10000,
  "amount_paid": 0,
  "attempts": 0,
  "created_at": 1703569876,
  "currency": "INR",
  "entity": "order",
  "id": "order_NGrgEcmYJsfUyl",
  "notes": {
    "key1": "value3",
    "key2": "value2"
  },
  "offer_id": null,
  "receipt": "receipt#1",
  "status": "created"
}
```

Request Parameters

amount

mandatory

`integer` The amount for which the order was created, in currency subunits. For example, for an amount of ₹295, enter `29500`. Payment can only be made for this amount against the Order.

currency

mandatory

`string` ISO code for the currency in which you want to accept the payment. The default length is 3 characters. For example, `INR`.

receipt

optional

`string` Receipt number that corresponds to this order, set for your internal reference. Can have a maximum length of 40 characters and has to be unique.

customer\_id

mandatory

`string` Unique identifier of the customer. For example, `cust_1Aa00000000004`.

customer\_details

mandatory

`object` This contains details about the customer.

business\_type

optional

`string` Indicates whether the customer is an individual or business entity. Possible values:

- `company`
- `individual`

  **Watch Out!**

  For transactions exceeding ₹2,50,000:

  - **Individual customers**: PAN is mandatory.
  - **Business customers**: GSTIN is mandatory.

name

mandatory

`string` Customer's name.

- Character length: Between 5 and 50 characters.
- Allowed characters: Uppercase letters (A-Z), lowercase letters (a-z), and spaces (not at the beginning).
- Not allowed characters: Numbers, special characters (For example, @, ", ,, ., and so on.), Unicode characters, emojis, and non-Latin scripts or regional languages.
- Prohibited names: Names must be meaningful and contextually appropriate.
  - Avoid using repetitive patterns (For example, aaa, xyz, kkk kk).
  - Names like litri litri, Hfg Gh, or husi husi are not permitted.
  - Curse words or offensive names are not prohibited.
- Example: `Gaurav Kumar`.

email

optional

`string` The customer's email address. A maximum length of 64 characters for the username. For example, in " [gaurav.kumar@example.com](mailto:gaurav.kumar@example.com)

", "gaurav.kumar" must not exceed 64 characters.

contact

optional

`string` The customer's phone number. A maximum length of 15 characters including country code. For example, `+919123456780`.

individual

`object` Required when `business_type` is `individual`.

date\_of\_birth

`object` Customer's date of birth (individuals) or date of incorporation (businesses).

day

`integer` Day of birth/incorporation (1-31).

month

`integer` Month of birth/incorporation (1-12).

year

`integer` Year of birth/incorporation (4-digit format).

place\_of\_birth

`string` Place where the customer was born or place of incorporation for businesses.

tax\_identity

`array` List of tax identifiers.

name

`string` Type of tax identifier.

value

`string` The identifier value matching the expected format.

Response Parameters

amount

`integer` The amount for which the order was created, in currency subunits. For example, for an amount of ₹295, enter `29500`.

amount\_due

`integer` The amount pending against the order.

amount\_paid

`integer` The amount paid against the order.

attempts

`integer` The number of payment attempts, successful and failed, that have been made against this order.

created\_at

`integer` Indicates the Unix timestamp when this order was created.

currency

`string` ISO code for the currency in which you want to accept the payment. The default length is 3 characters.

entity

`string` Name of the entity. Here, it is `order`.

id

`string` The unique identifier of the order.

notes

`object` Key-value pair used to store additional information about the entity. Holds 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

offer\_id

`string` The unique identifier of the offer. For example, `offer_JHD834hjbxzhd38d`.

receipt

`string` Receipt number that corresponds to this order. Can have a maximum length of 40 characters and has to be unique.

status

`string` The status of the order. Possible values:

- `created`: When you create an order, it is in the `created` state. It stays in this state till a payment is attempted on it.
- `attempted`: An order changes to the `attempted` state following the first payment attempt and remains in this state until at least one payment is successfully processed and captured.
- `paid`: After the successful capture of the payment, the order moves to the `paid` state. No further payment requests are permitted once the order moves to the `paid` state.
   The order stays in the `paid` state even if the payment associated with the order is refunded.

Error Response Parameters

## Smart AML Integration

Smart AML applies real-time risk assessment to determine whether additional customer information is required. It ensures minimal friction for low-risk transactions while maintaining strong compliance standards.

### Workflow

Smart Screening

Automatic Order Failure

Smart Screening allows you to receive risk assessments and decide whether to proceed, collect additional data or decline transactions based on your business logic.

1. Create Order with AML screening.
2. Fetch Order With Updated Risk Assessment (optional).
3. Patch Order (If High Risk).
4. Create a Payment.

Smart Screening vs Automatic Order Failure Comparison

### Integrate Smart Screening

Enable real-time risk assessment in your S2S integration:

Step 1: Create Order with AML Screening

POST

/orders

Request

copy

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X POST https://api.razorpay.com/v1/orders \
-H "Content-Type: application/json" \
-d '{
  "amount": 10000,
  "currency": "",
  "receipt": "receipt#1",
  "customer_id": "cust_OwZZseNBf9Uqsi",
  "reviews": {
    "screening": ["aml"]
  },
  "customer_details": {
    "name": "Gaurav Kumar",
    "email": "gaurav.kumar@example.com",
    "contact": "+919876543210",
    "billing_address": {
      "line1": "Mantri apartment",
      "line2": "Koramangala",
      "city": "Bengaluru",
      "country": "IND",
      "state": "Karnataka",
      "zipcode": "560032"
    },
    "shipping_address": {
      "line1": "Mantri apartment",
      "line2": "Koramangala",
      "city": "Bengaluru",
      "country": "IND",
      "state": "Karnataka",
      "zipcode": "560032"
    }
  }
}'
```

Success

copy

```json
{
  "id": "order_EKwxwAgItmmXdp",
  "entity": "order",
  "amount": 10000,
  "amount_paid": 0,
  "amount_due": 10000,
  "currency": "",
  "receipt": "receipt#1",
  "offer_id": null,
  "status": "created",
  "attempts": 0,
  "notes": [],
  "created_at": 1582628071,
  "reviews": {
    "entity": "collection",
    "count": 1,
    "items": [
      {
        "screening": "aml",
        "risk_tier": "high",
        "risk_factors_count": 1,
        "risk_factors": [
          {
            "reason": "name_match_sanction_list",
            "description": "Please share date of birth for better AML precision",
            "source": "customer_details.name"
          }
        ]
      }
    ]
  }
}
```

Request Parameters

amount

mandatory

`integer` The amount for which the order was created, in currency subunits. For example, for an amount of ₹295, enter `29500`. Payment can only be made for this amount against the Order.

currency

mandatory

`string` ISO code for the currency in which you want to accept the payment. The default length is 3 characters. For example, `INR`.

receipt

optional

`string` Receipt number that corresponds to this order, set for your internal reference. Can have a maximum length of 40 characters and has to be unique.

customer\_id

mandatory

`string` Unique identifier of the customer. For example, `cust_1Aa00000000004`.

reviews

optional

`object` Contains risk assessment features.

screening

optional

`array` Types of risk screening to perform. For example `aml`.

customer\_details

mandatory

`object` This contains details about the customer.

name

mandatory

`string` Customer's name.

- Character length: Between 5 and 50 characters.
- Allowed characters: Uppercase letters (A-Z), lowercase letters (a-z), and spaces (not at the beginning).
- Not allowed characters: Numbers, special characters (For example, @, ", ,, ., and so on.), Unicode characters, emojis, and non-Latin scripts or regional languages.
- Prohibited names: Names must be meaningful and contextually appropriate.
  - Avoid using repetitive patterns (For example, aaa, xyz, kkk kk).
  - Names like litri litri, Hfg Gh, or husi husi are not permitted.
  - Curse words or offensive names are not prohibited.
- Example: `Gaurav Kumar`.

email

optional

`string` The customer's email address. A maximum length of 64 characters for the username. For example, in " [gaurav.kumar@example.com](mailto:gaurav.kumar@example.com)

", "gaurav.kumar" must not exceed 64 characters.

contact

optional

`string` The customer's phone number. A maximum length of 15 characters including country code. For example, `+919123456780`.

billing\_address

mandatory

`object` This contains the billing address of the order.

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

`string` The ZIP code must consist of 6-digit numeric characters. Only valid Indian ZIP codes will be accepted. Refer to the [list of supported ZIP codes](/razorpay-docs-md/international-payments/accept-international-payments-from-indian-customers/s2s-integration/build/browser/assets/images/list-of-supported-zip-codes.md).

latitude

optional

`float` Latitude of the position expressed in decimal degrees (WSG 84), for example, 6.244203. A positive value denotes the northern hemisphere or the equator, and a negative value denotes the southern hemisphere. The number of digits to represent the precision of the coordinate.

longitude

optional

`float` Longitude of the position expressed in decimal degrees (WSG 84), for example, -75.581211. A positive value denotes east longitude or the prime meridian, and a negative value denotes west longitude. The number of digits to represent the precision of the coordinate.

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

`string` The ZIP code must consist of 6-digit numeric characters. Only valid Indian ZIP codes will be accepted. Refer to the [list of supported ZIP codes](/razorpay-docs-md/international-payments/accept-international-payments-from-indian-customers/s2s-integration/build/browser/assets/images/list-of-supported-zip-codes.md).

latitude

optional

`float` Latitude of the position expressed in decimal degrees (WSG 84), for example, 6.244203. A positive value denotes the northern hemisphere or the equator, and a negative value denotes the southern hemisphere. The number of digits to represent the precision of the coordinate.

longitude

optional

`float` Longitude of the position expressed in decimal degrees (WSG 84), for example, -75.581211. A positive value denotes east longitude or the prime meridian, and a negative value denotes west longitude. The number of digits to represent the precision of the coordinate.

Response Parameters

amount

`integer` The amount for which the order was created, in currency subunits. For example, for an amount of ₹295, enter `29500`.

amount\_due

`integer` The amount pending against the order.

amount\_paid

`integer` The amount paid against the order.

attempts

`integer` The number of payment attempts, successful and failed, that have been made against this order.

created\_at

`integer` Indicates the Unix timestamp when this order was created.

currency

`string` ISO code for the currency in which you want to accept the payment. The default length is 3 characters.

entity

`string` Name of the entity. Here, it is `order`.

id

`string` The unique identifier of the order.

notes

`object` Key-value pair used to store additional information about the entity. Holds 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

offer\_id

`string` The unique identifier of the offer. For example, `offer_JHD834hjbxzhd38d`.

receipt

`string` Receipt number that corresponds to this order. Can have a maximum length of 40 characters and has to be unique.

status

`string` The status of the order. Possible values:

- `created`: When you create an order, it is in the `created` state. It stays in this state till a payment is attempted on it.
- `attempted`: An order changes to the `attempted` state following the first payment attempt and remains in this state until at least one payment is successfully processed and captured.
- `paid`: After the successful capture of the payment, the order moves to the `paid` state. No further payment requests are permitted once the order moves to the `paid` state.
   The order stays in the `paid` state even if the payment associated with the order is refunded.

reviews

`object` Contains all risk assessment results.

entity

`string` Type of object. Here it is `collection`.

count

`integer` Number of risk assessments performed.

items

`array` List of risk assessment results.

screening

`string` Type of screening performed. Here it is `aml`.

risk\_tier

`string` Overall risk level of the transaction. Possible values:

- `high`
- `medium`
- `low`
- `pending`

risk\_factors\_count

`integer` Number of risk factors identified.

risk\_factors

`array` Detailed risk factor information.

reason

`string` Identifier for the specific risk factor. For example `name_match_sanction_list`.

description

`string` Description of the risk factor.

source

`string` Field or data point that triggered the risk factor. For example, `customer_details.name`.

Error Response Parameters

Step 2: Fetch Order With Updated Risk Assessment (optional)

After creating an order, retrieve the updated risk assessment.

GET

/orders/:order\_id?expand[]=order.reviews

Query Parameters

expands[]=order.reviews

`string` Use to expand the AML risk assessment details for an order. Returns the `reviews` object containing risk tier, risk factors count, and detailed risk factors with reasons, descriptions and sources.

Response Parameters

amount

`integer` The amount for which the order was created, in currency subunits. For example, for an amount of ₹295, enter `29500`.

amount\_due

`integer` The amount pending against the order.

amount\_paid

`integer` The amount paid against the order.

attempts

`integer` The number of payment attempts, successful and failed, that have been made against this order.

created\_at

`integer` Indicates the Unix timestamp when this order was created.

currency

`string` ISO code for the currency in which you want to accept the payment. The default length is 3 characters.

entity

`string` Name of the entity. Here, it is `order`.

id

`string` The unique identifier of the order.

notes

`object` Key-value pair used to store additional information about the entity. Holds 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

offer\_id

`string` The unique identifier of the offer. For example, `offer_JHD834hjbxzhd38d`.

receipt

`string` Receipt number that corresponds to this order. Can have a maximum length of 40 characters and has to be unique.

status

`string` The status of the order. Possible values:

- `created`: When you create an order, it is in the `created` state. It stays in this state till a payment is attempted on it.
- `attempted`: An order changes to the `attempted` state following the first payment attempt and remains in this state until at least one payment is successfully processed and captured.
- `paid`: After the successful capture of the payment, the order moves to the `paid` state. No further payment requests are permitted once the order moves to the `paid` state.
   The order stays in the `paid` state even if the payment associated with the order is refunded.

reviews

`object` Contains all risk assessment results.

entity

`string` Type of object. Here it is `collection`.

count

`integer` Number of risk assessments performed.

items

`array` List of risk assessment results.

screening

`string` Type of screening performed. Here it is `aml`.

risk\_tier

`string` Overall risk level of the transaction. Possible values:

- `high`
- `medium`
- `low`
- `pending`

risk\_factors\_count

`integer` Number of risk factors identified.

risk\_factors

`array` Detailed risk factor information.

reason

`string` Identifier for the specific risk factor. For example `name_match_sanction_list`.

description

`string` Description of the risk factor.

source

`string` Field or data point that triggered the risk factor. For example, `customer_details.name`.

Step 3: Patch Order (If High Risk)

Reduce the risk score by providing additional customer compliance information to the flagged order.

PATCH

/orders/:order\_id

Request Parameters

customer\_details

mandatory

`object` This contains details about the customer.

type

optional

`string` Indicates whether the customer is an individual or business entity. Possible values:

- `company`
- `individual`

  **Watch Out!**

  For transactions exceeding ₹2,50,000:

  - **Individual customers**: PAN is mandatory.
  - **Business customers**: GSTIN is mandatory.

name

mandatory

`string` Customer's name.

- Character length: Between 5 and 50 characters.
- Allowed characters: Uppercase letters (A-Z), lowercase letters (a-z), and spaces (not at the beginning).
- Not allowed characters: Numbers, special characters (For example, @, ", ,, ., and so on.), Unicode characters, emojis, and non-Latin scripts or regional languages.
- Prohibited names: Names must be meaningful and contextually appropriate.
  - Avoid using repetitive patterns (For example, aaa, xyz, kkk kk).
  - Names like litri litri, Hfg Gh, or husi husi are not permitted.
  - Curse words or offensive names are not prohibited.
- Example: `Gaurav Kumar`.

email

optional

`string` The customer's email address. A maximum length of 64 characters for the username. For example, in " [gaurav.kumar@example.com](mailto:gaurav.kumar@example.com)

", "gaurav.kumar" must not exceed 64 characters.

contact

optional

`string` The customer's phone number. A maximum length of 15 characters including country code. For example, `+919123456780`.

individual

`object` Required when `business_type` is `individual`.

date\_of\_birth

`object` Customer's date of birth (individuals) or date of incorporation (businesses).

day

`integer` Day of birth/incorporation (1-31).

month

`integer` Month of birth/incorporation (1-12).

year

`integer` Year of birth/incorporation (4-digit format).

place\_of\_birth

`string` Place where the customer was born or place of incorporation for businesses.

tax\_identity

`array` List of tax identifiers.

name

`string` Type of tax identifier.

value

`string` The identifier value matching the expected format.

Response Parameters

amount

`integer` The amount for which the order was created, in currency subunits. For example, for an amount of ₹295, enter `29500`.

amount\_due

`integer` The amount pending against the order.

amount\_paid

`integer` The amount paid against the order.

attempts

`integer` The number of payment attempts, successful and failed, that have been made against this order.

created\_at

`integer` Indicates the Unix timestamp when this order was created.

currency

`string` ISO code for the currency in which you want to accept the payment. The default length is 3 characters.

entity

`string` Name of the entity. Here, it is `order`.

id

`string` The unique identifier of the order.

notes

`object` Key-value pair used to store additional information about the entity. Holds 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

offer\_id

`string` The unique identifier of the offer. For example, `offer_JHD834hjbxzhd38d`.

receipt

`string` Receipt number that corresponds to this order. Can have a maximum length of 40 characters and has to be unique.

status

`string` The status of the order. Possible values:

- `created`: When you create an order, it is in the `created` state. It stays in this state till a payment is attempted on it.
- `attempted`: An order changes to the `attempted` state following the first payment attempt and remains in this state until at least one payment is successfully processed and captured.
- `paid`: After the successful capture of the payment, the order moves to the `paid` state. No further payment requests are permitted once the order moves to the `paid` state.
   The order stays in the `paid` state even if the payment associated with the order is refunded.

customer\_details

mandatory

`object` This contains details about the customer.

name

mandatory

`string` Customer's name.

- Character length: Between 5 and 50 characters.
- Allowed characters: Uppercase letters (A-Z), lowercase letters (a-z), and spaces (not at the beginning).
- Not allowed characters: Numbers, special characters (For example, @, ", ,, ., and so on.), Unicode characters, emojis, and non-Latin scripts or regional languages.
- Prohibited names: Names must be meaningful and contextually appropriate.
  - Avoid using repetitive patterns (For example, aaa, xyz, kkk kk).
  - Names like litri litri, Hfg Gh, or husi husi are not permitted.
  - Curse words or offensive names are not prohibited.
- Example: `Gaurav Kumar`.

email

optional

`string` The customer's email address. A maximum length of 64 characters for the username. For example, in " [gaurav.kumar@example.com](mailto:gaurav.kumar@example.com)

", "gaurav.kumar" must not exceed 64 characters.

contact

optional

`string` The customer's phone number. A maximum length of 15 characters including country code. For example, `+919123456780`.

business\_type

optional

`string` Indicates whether the customer is an individual or business entity. Possible values:

- `company`
- `individual`

**Watch Out!**

For transactions exceeding ₹2,50,000:

- **Individual customers**: PAN is mandatory.
- **Business customers**: GSTIN is mandatory.

individual

`object` Required when `business_type` is `individual`.

date\_of\_birth

`object` Customer's date of birth (individuals) or date of incorporation (businesses).

day

`integer` Day of birth/incorporation (1-31).

month

`integer` Month of birth/incorporation (1-12).

year

`integer` Year of birth/incorporation (4-digit format).

place\_of\_birth

`string` Place where the customer was born or place of incorporation for businesses.

tax\_identity

`array` List of tax identifiers.

name

`string` Type of tax identifier.

value

`string` The identifier value matching the expected format.

Error Response Parameters

Step 4: Create a Payment

Once the order is created, pass the order\_id from the Orders API response to the [Create a Payment API](/razorpay-docs-md/international-payments/accept-international-payments-from-indian-customers/s2s-integration/build-integration.md#13-create-a-payment).

### S2S API Integration with Automatic Order Failure

Automatic Failure Implementation

**How it works:**

- Razorpay automatically fails transactions predicted to be AML-positive at the Create Order step.
- Orders identified as high-risk are declined before payment processing.
- No additional data collection required from customers.
- Receive T+1 reports showing failed order statistics.

**Best for:**

- Businesses prioritising zero AML risk.
- Use cases where declining high-risk transactions is acceptable.
- Businesses unable to implement additional data collection.

**Reporting:**

- Daily T+1 reports showing:
  - Number of orders failed due to AML.
  - Percentage of total orders affected.

## Support

For further assistance, reach out to our [Support team](https://razorpay.com/support) or email us at `import-mission@razorpay.com`.

### Related Information [Test Integration](/razorpay-docs-md/international-payments/accept-international-payments-from-indian-customers/s2s-integration/test-integration.md)
