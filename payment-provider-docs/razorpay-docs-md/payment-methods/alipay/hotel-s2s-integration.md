<!-- Source: https://razorpay.com/docs/payments/payment-methods/alipay/hotel-s2s-integration -->

Secure Server-to-Server (S2S) integration that enables seamless and reliable processing and a smooth payment experience for your customers.

**Feature Request**

- This is an on-demand feature. Please raise a request with our [Support team](https://razorpay.com/support/#request)

  to get this feature activated on your Razorpay account.
- Watch this video to know how to raise a feature enablement request on the Dashboard.

![Feature Request GIF](https://razorpay.com/docs/payments/payment-methods/alipay/build/browser/assets/images/feature-request.gif)

## Prerequisites

1. [Sign up](https://dashboard.razorpay.com/#/access/signup)

   for a Razorpay account.
2. Generate API Keys.
3. Follow the [Razorpay S2S Integration documentation](/razorpay-docs-md/payment-gateway/s2s-integration.md)   .

## Integrate Alipay on S2S

Create an Order and a Payment. And pass `method` and `wallet` parameters in the create an order and a payment API.

### Create an Order and a Payment

Create an order along with payment using the consolidated order and payment API. This single API call combines order and payment creation, resulting in a more efficient and faster transaction process.

Create an order along with payment by:

- Making a single API call to Razorpay, combining order and payment creation.
- Authenticating using the provided credentials, ensuring access to the consolidated payment API.
- Manually integrating the API sample codes on your server.

The following API will create an order along with payment with `wallet` as the payment method:

#### API Sample Code

The following is a sample API request and response for creating an order and payment:

POST

/orders

RequestSuccess

copy

```bash
curl -X POST https://api.razorpay.com/v1/orders 
-U [YOUR_KEY_ID]:[YOUR_KEY_SECRET]
-H 'content-type:application/json'
-d '{
  "amount": 50000,
  "currency": "INR",
  "receipt": "receipt#1111",
  "partial_payment": true,
  "customer_details": {
    "name": "Gaurav Kumar",
    "contact": "+919000090000",
    "email": "gauravkumar@example.com",
    "insights": {
      "order_count": "22",
      "chargeback_count": "4",
      "tier": "gold",
      "booking_channel": "agent",
      "has_account": true,
      "registered_at": 1234567890
    }
  },
  "line_items_total": 5000,
  "line_items": [
    {
      "type": "hotel",
      "sku": "1gr367",
      "name": "Grand Palace Hotel",
      "description": "2BHK villa",
      "quantity": 2,
      "image_url": "http://url",
      "product_url": "http://url",
      "price": 5000,
      "offer_price": 5000,
      "tax_amount": 0,
      "hotel": {
        "sub_type": "stay",
        "checkin_date": "2030-07-16",
        "checkout_date": "2030-07-16",
        "property_type": "",
        "star_rating": 5,
        "brand": "Grand Mercure",
        "address": {
          "line1": "Mantri apartment",
          "line2": "Koramangala",
          "city": "Bengaluru",
          "state": "Karnataka",
          "zipcode": "560032",
          "latitude": null,
          "longitude": null
        },
        "travellers": [
          {
            "name": "Gaurav Kumar",
            "email": "gaurav.kumar@example.com",
            "contact": "+919000090000",
            "age": 18,
            "class": "business",
            "identity": {
              "unique_national_id": "ABCDE1234Z",
              "tax_id": "ABCDE1234Z"
            }
          },
          {
            "name": "Gaurav Kumar",
            "email": "gaurav.kumar@example.com",
            "contact": "+919000090000",
            "age": 18,
            "class": "business",
            "identity": {
              "unique_national_id": "ABCDE1234Z",
              "tax_id": "ABCDE1234Z"
            }
          }
        ]
      }
    }
  ],
  "payment_config": {
    "capture": "automatic",
    "capture_options": {
      "automatic_expiry_period": 12,
      "manual_expiry_period": 7200,
      "refund_speed": "optimum"
    }
  },
  "refund_allowed": "full",
  "campaign": {
    "external_campaign_id": "PQR1234",
    "name": "",
    "description": "",
    "channel": "",
    "source": "website",
    "medium": ""
  },
  "notes": {
    "key1": "value3",
    "key2": "value2"
  },
  "payment": {
    "contact": "9000090000",
    "email": "gaurav.kumar@example.com",
    "method": "wallet",
    "wallet": "alipay"
  }
}'
```

Request Parameters

amount

mandatory

`integer` Payment amount in the smallest currency sub-unit. For example, if the amount to be charged is ₹299, then pass `29900` in this field. In the case of three decimal currencies, such as KWD, BHD and OMR, to accept a payment of 295.991, pass the value as `295990`. And in the case of zero decimal currencies such as JPY, to accept a payment of 295, pass the value as `295`.

**Watch Out!**

As per payment guidelines, you should pass the last decimal number as 0 for three decimal currency payments. For example, if you want to charge a customer 99.991 KD for a transaction, you should pass the value for the amount parameter as `99990` and not `99991`.

currency

mandatory

`string` The currency in which the transaction should be made. View the [list of supported currencies](/razorpay-docs-md/international-payments.md#supported-currencies). The length must be 3 characters.

**Handy Tips**

Razorpay has added support for zero decimal currencies, such as JPY, and three decimal currencies, such as KWD, BHD, and OMR, allowing businesses to accept international payments in these currencies. Know more about [Currency Conversion](/razorpay-docs-md/international-payments/currency-conversion.md)

(May 2024).

receipt

optional

`string` Your receipt id for this order should be passed here. Maximum length is 40 characters.

partial\_payment

optional

`boolean` Indicates whether the customer can make a partial payment. Possible values:

- `true`: The customer can make partial payments.
- `false` (default): The customer cannot make partial payments.

customer\_details

mandatory

`json object` Details about the customer/user.

name

mandatory

`string` The customer’s name. For example, `Gaurav Kumar`.

contact

mandatory

`string` The customer's phone number. A maximum length of 15 characters, including country code. For example, `+919000090000`.

email

mandatory

`string` The customer’s email address. For example, `gaurav.kumar@example.com`.

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

`string` Your company's passenger classification, such as with a frequent flyer program. In this case, you might use values such as:

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

- `true`: If the user is logged into the account.
- `false`: If the user is on guest checkout.

registered\_at

optional

`integer` UNIX timestamp when the customer account was created with the merchant. For example, 1234567890.

line\_items\_total

optional

`integer` Total sum of the cart value.

line\_items

mandatory

`json object` Details about the specific items added to the cart.

type

mandatory

`string` Defines the category type. Possible values:

- `travel`
- `hotel`
- `e-commerce`
- `mutual_fund`

sku

mandatory

`string` unique product id defined by the business.

name

mandatory

`string` The name of the product.

description

optional

`string` Description of the product.

quantity

optional

`integer` Number of tickets/items/quantity to be purchased.

image\_url

optional

`string` URL of the product image.

product\_url

optional

`string` URL of the product’s listing page.

price

optional

`integer` Unit price of the product in paisa. (needs to be inclusive of tax)

offer\_price

optional

`integer` Offer price of the product. The offer price can be lower than the price if the business is running any discount on the product.

tax\_amount

optional

`integer` Tax amount that needs to be added to the product. In case the **offer\_price** is tax-inclusive, keep it blank.

hotel

mandatory

`json object` Details about the type-specific data points. Will vary based on the type selected.

sub\_type

mandatory

`enum` The sub-type of the line item. Possible values:

- `stay`
- `breakfast`
- `dinner`
- `lunch`
- `early_checkin`
- `late_chechout`
- `others`

checkin\_date

optional

`string` Represents an ISO 8601-encoded date string. For example, September 7, 2019 is represented as "2019-09-07".

checkout\_date

optional

`string` Represents an ISO 8601-encoded date string. For example, September 7, 2019 is represented as "2019-09-07".

property\_type

optional

`string` Represents the type of the property. Possible values:

- `resort`
- `hostel`
- `hotel`
- `inn`
- `lodge`
- `motel`
- `apartment`
- `bed_and_breakfast`
- `tent`
- `villa`

star\_rating

optional

`integer` Denotes the star rating of the property. Possible values: 1 to 7.

brand

optional

`string` Brand name of the property. For example, Marriott Group.

address

optional

`json object` details of the property address.

line1

optional

`string` Address Line 1 of the address

line2

optional

`string` Address Line 2 of the address

city

optional

`string` city of the address. For example, Bengaluru

country

optional

`string` ISO3 country code of the billing address. For example, IND

state

optional

`string` Name of the state. For example, KA

zipcode

optional

`string` Zipcode of the state. For example, 560001.

latitude

optional

`float` Latitude of the position expressed in decimal degrees (WSG 84), e.g. 6.244203. A positive value denotes the northern hemisphere or the equator, and a negative value denotes the southern hemisphere. The number of digits represents the precision of the coordinate.

longitude

optional

`float` Longitude of the position expressed in decimal degrees (WSG 84), e.g. -75.581211. A positive value denotes east longitude or the prime meridian, and a negative value denotes west longitude. The number of digits represents the precision of the coordinate.

travellers

mandatory

`json object` Details associated with passengers/travellers/beneficiaries.

name

mandatory

`string` Name of the passenger/traveler/beneficiary.

email

optional

`string` Email address of the passenger/traveler/beneficiary.

contact

optional

`json object` Details associated with passengers/travelers/beneficiaries.

age

optional

`integer` UNIX timestamp of the date of birth of the individual. For example, 1234567890.

class

optional

`string` Type of the flight ticket. Possible values:

- `Business`
- `Suite`
- `Premium`
- `Deluxe`
- `Standard`

identity

optional

`json object` Identity details of the passenger/beneficiary.

unique\_national\_id

optional

`string` National identification number. For example, Adhaar number for India.

tax\_id

optional

`string` Passport number of the individual.

payment\_config

optional

`array` Payment capture settings for the payment. The options sent here override the [account level auto-capture settings](/razorpay-docs-md/payments/capture-settings.md) configured using the Dashboard.

capture

mandatory

`string` Option to automatically capture payment. Possible values:

- `automatic`: Payments are auto-captured according to the configurations specified in the `capture_options` array.
- `manual`: You have to manually capture payments using our [Capture API](/razorpay-docs-md/api/payments/capture.md)

  or from the [Dashboard](/razorpay-docs-md/payments/dashboard.md#manually-capture-payments)  .

capture\_options

optional

`array` Use this array to determine the expiry period for automatic and [manual capture](/razorpay-docs-md/payments/capture-settings/api.md) of payments and the refund speed in the case of non-capture.

automatic\_expiry\_period

mandatory if capture = automatic

`integer` Time in minutes till when payments in the `authorized` state should be auto-captured.
Minimum value `12` minutes. This parameter is mandatory only if the value of `capture` parameter is `automatic`.

manual\_expiry\_period

optional

`integer` Time in minutes till when you can manually capture payments in the `authorized` state.

- Must be equal to or greater than the `automatic_expiry_period` value.
- Default value `7200` minutes.
- Maximum value `7200` minutes.
- Payments in the `authorized` state after the `manual_expiry_period` are auto-refunded.

refund\_speed

mandatory

`string` Refund speed for payments that were not captured (automatically or manually). Possible values:

- `optimum`: We try to process the refund instantly. We charge a small fee for this. If it is not possible to process an instant refund, we will process a normal refund in 5-7 working days. [Learn more about instant refunds](/razorpay-docs-md/refunds.md#how-instant-refunds-work)  .
- `normal`: The refund is processed in 5-7 working days.

  If no value is passed, the refund is processed using the [default speed set on the Dashboard](/razorpay-docs-md/refunds.md#setting-the-default-speed-of-refunds)  .

refund\_allowed

optional

`string` Denotes if the cart items are refundable or not. Possible values:

- `full`
- `partial`
- `not_allowed`

campaign

optional

`json object` Details of the campaign. Can be extended to share UTM parameters.

external\_campaign\_id

optional

`string` Unique identifier of the campaign. For example, PQR12453.

name

optional

`string` Name of the campaign.

description

optional

`string` A human-readable description of the campaign.

channel

optional

`string` The marketing channel used.

source

optional

`string` The referrer of the marketing event. Possible values: google, newsletter.

medium

optional

`string` The medium that the campaign is using. Example values: cpc, banner and so on.

notes

optional

`json object` Key-value pair that can be used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

payment

mandatory

`json object` Details about the payment.

contact

mandatory

`string` Phone number of the customer. The maximum length supported is 15 characters, inclusive of country code.

email

mandatory

`string` Email address of the customer. The maximum length supported is 40 characters.

method

mandatory

`string` The method used to make the payment. Here, it should be `wallet`.

wallet

mandatory

`string` The wallet provider. Here, it should be `alipay`.

Response Parameters

amount

`integer` The transaction amount, expressed in the currency subunit. For example, for an actual amount of ₹299.35, the value of this field should be `29935`.

amount\_due

`integer` The amount pending against the order.

amount\_paid

`integer` The amount paid against the order.

attempts

`integer` The number of payment attempts, successful and failed, that have been made against this order.

created\_at

`integer` The UNIX timestamp at which the order is created.

currency

`string` The currency in which the transaction should be made. View the [list of supported currencies](/razorpay-docs-md/international-payments.md#supported-currencies). Length should be of 3 characters.

entity

`string` Name of the entity. Here, it is `order`.

id

`string` The unique identifier of the order.

notes

`json object` Key-value pair that can be used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

offer\_id

`string` The unique identifier of the offer.

next

`array` A list of action objects available to continue the payment process. Present when the payment requires further processing.

action

`string` Indicates the next step to continue the payment process. Possible values:

- `otp_generate`: Use this URL to allow the customer to generate OTP and complete the payment on your webpage.
- `redirect`: Use this URL to redirect the customer to submit the OTP on the provider page.

url

`string` URL to be used for the action indicated.

razorpay\_payment\_id

`string` Unique identifier of the payment. Present for all responses.

receipt

`string` Your receipt id for this order should be passed here. Maximum length is 40 characters.

status

`string` The status of the order. Possible values:

- `created`: When you create an order, it is in the `created` state. It stays in this state till a payment is attempted on it.
- `attempted`: An order moves from `created` to `attempted` state when a payment is first attempted on it. It remains in the `attempted` state till one payment associated with that order is captured.
- `paid`: After the successful capture of the payment, the order moves to the `paid` state. No further payment requests are permitted once the order moves to the `paid` state. The order stays in the `paid` state even if the payment associated with the order is refunded.

Error Response Parameters

The error response parameters are available in the [API Reference Guide](/razorpay-docs-md/api/orders/create.md).
