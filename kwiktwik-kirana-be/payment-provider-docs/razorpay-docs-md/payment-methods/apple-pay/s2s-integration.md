<!-- Source: https://razorpay.com/docs/payments/payment-methods/apple-pay/s2s-integration -->

Apple Pay is a secure, contactless payment method that allows customers to pay using their Apple devices with Face ID/Touch ID authentication. Once integrated, Apple Pay provides customers with a seamless and high-trust checkout experience. Know more about [Apple Pay](https://www.apple.com/apple-pay/).

Apple Pay integration works seamlessly with your existing international card payment flow, add our Apple Pay button to your checkout and include one additional parameter in your payment request.

Advantages

- Accept payments in over 120 currencies from international customers.
- Reduce checkout time by up to 75% with one-touch payments.
- Leverage biometric authentication (Face ID/Touch ID) for enhanced security.
- Go live quickly with minimal code changes to your existing S2S integration.
- No need to handle Apple certificates or domain verification - Razorpay manages it all.

## Prerequisites

Before you begin the integration, ensure you have:

- [**Existing S2S Integration**](/razorpay-docs-md/payment-gateway/s2s-integration/json/v2/build-integration/international-cards/e-commerce.md)

  : Active Server-to-Server integration with
  Razorpay
  .

- **International Payments Enabled**: Must be activated on your Razorpay account.

- **HTTPS Protocol**: Your website must be served over HTTPS for security compliance.

## Integration Steps

Follow the steps given below to integrate S2S JSON API with browser flow and accept payments using cards.

**1.1** [Add Apple Pay Button to Your Checkout](/razorpay-docs-md/payment-methods/apple-pay/s2s-integration.md#11-add-apple-pay-button-to-your-checkout)

**1.2** [Integrate Razorpay Shield JS](/razorpay-docs-md/payment-methods/apple-pay/s2s-integration.md#12-integrate-razorpay-shield-js)

**1.3** [Create Order and Payment](/razorpay-docs-md/payment-methods/apple-pay/s2s-integration.md#13-create-order-and-payment)

**1.4** [Handle Payment Success and Error Events](/razorpay-docs-md/payment-methods/apple-pay/s2s-integration.md#14-handle-payment-success-and-error-events)

**1.5** [Verify Payment Signature](/razorpay-docs-md/payment-methods/apple-pay/s2s-integration.md#15-verify-payment-signature)

**1.6** [Integrate Payments Rainy Day Kit](/razorpay-docs-md/payment-methods/apple-pay/s2s-integration.md#16-integrate-payments-rainy-day-kit)

**1.7** [Verify Payment Status](/razorpay-docs-md/payment-methods/apple-pay/s2s-integration.md#17-verify-payment-status)

### 1.1 Add Apple Pay Button to Your Checkout

Add the Apple Pay button to your checkout page to provide customers with the payment option.

Button Design Guidelines

**Watch Out!**

Use only Razorpay-provided Apple Pay button designs for both web and SDK implementations.

- Follow official [Apple Pay guidelines](https://developer.apple.com/apple-pay/marketing/)

  for button usage and placement.
- Use Apple Pay button designs provided by Razorpay (see design below).

  ![Apple Pay Button design](https://razorpay.com/docs/payments/payment-methods/apple-pay/build/browser/assets/images/apple-pay-button.jpg)
- Maintain consistent sizing with other payment options.
- Position prominently in your payment methods section.

When to Display the Button

For Web Integration

For SDK/Native App Integration

1. Integrate [Apple Pay JS API](https://developer.apple.com/documentation/applepayontheweb/apple-pay-js-api)   .
2. Perform [Apple Pay capabilities](https://developer.apple.com/documentation/applepayontheweb/applepaysession/applepaycapabilities)

   check.
3. Follow the display conditions below:

- If it returns `paymentCredentialsAvailable`, show button.
- If it returns `paymentCredentialStatusUnknown`, optionally show button (use this option only if you want customers to go through adding a new card journey, not recommended in the initial 2 months due to increased friction).
- For the value of `merchantIdentifier` to pass in this request, please contact our [Support team](https://razorpay.com/support/)  .

### 1.2 Integrate Razorpay Shield JS

Integrate Shield JS and pass razorpay\_session\_id in the [Create Order and Payment](/razorpay-docs-md/payment-methods/apple-pay/s2s-integration.md#13-create-order-and-payment) step.

JavaScript

copy

```bash
<script src="https://checkout.razorpay.com/v1/shield.js"></script>

// later, at the time of payment initialisation:
const checkout_session_id = await RazorpayShield.getCheckoutSessionId() // pass it to your backend
```

### 1.3 Create Order and Payment

This step demonstrates how to create an Order and process a Payment using Razorpay APIs. Depending on your integration type, you can choose between:

1. Consolidated Order and Payment API

Create an order along with payment using the consolidated order and payment API. This single API call combines order and payment creation, resulting in a more efficient and faster transaction process.

Create an order along with payment by:

- Making a single API call to Razorpay, combining order and payment creation.
- Authenticating using the provided credentials, ensuring access to the consolidated payment API.
- Manually integrating the API sample codes on your server.

The following API will create an order along with payment with `card` as the payment method:

POST

/orders

RequestResponse

copy

```bash
curl -X POST https://api.razorpay.com/v1/orders 
-U [YOUR_KEY_ID]:[YOUR_KEY_SECRET]
-H 'content-type:application/json'
-d '{
  "amount": 50000,
  "currency": "",
  "receipt": "receipt#1111",
  "partial_payment": false,
  "customer_details": {
    "name": "Gaurav Kumar",
    "contact": "+919876543210",
    "email": "gaurav.kumar@example.com",
    "insights": {
      "order_count": "22",
      "chargeback_count": "4",
      "tier": "gold",
      "booking_channel": "agent",
      "has_account": true,
      "registered_at": 1234567890
    },
    "shipping_address": {
      "line1": "Mantri apartment",
      "line2": "Koramangala",
      "city": "Bengaluru",
      "country": "IND",
      "state": "Karnataka",
      "zipcode": "560032",
      "latitude": null,
      "longitude": null
    },
    "billing_address": {
      "line1": "Mantri apartment",
      "line2": "Koramangala",
      "city": "Bengaluru",
      "country": "IND",
      "state": "Karnataka",
      "zipcode": "560032",
      "latitude": null,
      "longitude": null
    }
  },
  "shipping_details": {
    "method": "sameday",
    "gift_wrap": false
  },
  "line_items_total": 5000,
  "line_items": [
    {
      "type": "e_commerce",
      "sku": "1gr367",
      "name": "TEST",
      "description": "TEST",
      "quantity": 1,
      "image_url": "http://url",
      "product_url": "http://url",
      "price": 5000,
      "offer_price": 5000,
      "tax_amount": 0,
      "e_commerce": {
        "other_product_codes": {
          "upc": "12r34",
          "ean": "123r4",
          "unspsc": "123s4"
        }
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
    "contact": "+919876543210",
    "email": "gaurav.kumar@example.com",
    "callback_url": "https://merchant_callback_url..",
    "method": "card",
    "app": {
      "name": "apple_pay"
    },
    "authentication": {
      "authentication_channel": "browser"
    },
    "device_fingerprint": {
      "checkout_session_id": "qwerty12345",
      "browser": {
        "java_enabled": false,
        "javascript_enabled": false,
        "timezone_offset": 11,
        "color_depth": 23,
        "screen_width": 23,
        "screen_height": 100,
        "referer": "https://merchansite.com/example/paybill",
        "user_agent": "Mozilla/5.0"
      },
      "ip": "105.106.107.108"
    }
  }
}'
```

Request Parameters

amount

mandatory

`integer` Payment amount in the smallest currency sub-unit. For example, if the amount to be charged is ₹299, then pass `29900` in this field. In the case of three decimal currencies, such as KWD, BHD and OMR, to accept a payment of 295.991, pass the value as `295990`. And in the case of zero decimal currencies such as JPY, to accept a payment of 295, pass the value as `295`.

**Watch Out!**

As per payment guidelines, you should pass the last decimal number as 0 for three decimal currency payments. For example, if you want to charge a customer 99.991 KWD for a transaction, you should pass the value for the amount parameter as `99990` and not `99991`.

currency

mandatory

`string` The currency in which the transaction should be made. View the [list of supported currencies](/razorpay-docs-md/international-payments.md#supported-currencies). The length must be 3 characters.

**Handy Tips**

Razorpay has added support for zero decimal currencies, such as JPY, and three decimal currencies, such as KWD, BHD and OMR, allowing businesses to accept international payments in these currencies. Know more about [Currency Conversion](/razorpay-docs-md/international-payments/currency-conversion.md)

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

optional

`json object` Details about the customer/user.

name

optional

`string` The customer’s name. For example, `Gaurav Kumar`.

contact

optional

`string` The customer's phone number. A maximum length of 15 characters, including country code. For example, `9876543210`.

email

optional

`string` The customer’s email address. For example, `gaurav.kumar@example.com`.

insights

optional

`json object` Additional details of the customer, including past transaction data.

order\_count

optional

`integer` Total orders placed by the account so far on the merchant platform. For example, 22.

chargeback\_count

optional

`integer` Total chargeback received for the customer account on the merchant platform. For example, 4.

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

- `true`: If the user is logged into the account.
- `false`: If the user is on guest checkout.

registered\_at

optional

`integer` UNIX timestamp when the customer account was created with the merchant. For example, 1234567890.

shipping\_address

optional

`json object` This will have details about the order's shipping address.

line1

optional

`string` Address Line 1 of the address.

line2

optional

`string` Address Line 2 of the address.

city

optional

`string` city of the address. For example, `Bengaluru`.

country

optional

`string` ISO3 country code of the billing address. For example, `IND`.

state

optional

`string` name of the state. For example, `Bengaluru`.

zipcode

optional

`string` Zipcode of the state. For example, `560001`.

latitude

optional

`float` Latitude of the position expressed in decimal degrees (WSG 84), for example, 6.244203. A positive value denotes the northern hemisphere or the equator, and a negative value denotes the southern hemisphere. The number of digits represents the precision of the coordinate.

longitude

optional

`float` Longitude of the position expressed in decimal degrees (WSG 84), for example, -75.581211. A positive value denotes east longitude or the prime meridian, and a negative value denotes west longitude. The number of digits represents the precision of the coordinate.

billing\_address

optional

`json object` This will have details about the billing address of the customer/user.

line1

optional

`string` Address Line 1 of the address.

line2

optional

`string` Address Line 2 of the address.

city

optional

`string` city of the address. For example, `Bengaluru`.

country

optional

`string` ISO3 country code of the billing address. For example, `IND`.

state

optional

`string` name of the state. For example, `Bengaluru`.

zipcode

optional

`string` Zipcode of the state. For example, `560001`.

latitude

optional

`float` Latitude of the position expressed in decimal degrees (WSG 84), for example, 6.244203. A positive value denotes the northern hemisphere or the equator, and a negative value denotes the southern hemisphere. The number of digits represents the precision of the coordinate.

longitude

optional

`float` Longitude of the position expressed in decimal degrees (WSG 84), for example, -75.581211. A positive value denotes east longitude or the prime meridian, and a negative value denotes west longitude. The number of digits represents the precision of the coordinate.

shipping\_details

optional

`json object` This will have the order's shipping details.

method

optional

`enum` Shipping method for the product. Possible values:

- `lowcost`: Lowest-cost service.
- `sameday`: Courier or same-day service.
- `oneday`: Next-day or overnight service.
- `twoday`: Two-day service.
- `threeday`: Three-day service.
- `pickup`: Store pick-up.
- `other`: Other shipping method.
- `none`: No shipping method because the product is a service or subscription.

gift\_wrap

optional

`boolean` Indicates whether the customer requested gift wrapping for this purchase. This field can contain one of the following values:

- `true`: The customer requested gift wrapping.
- `false`: The customer did not request gift wrapping.

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
- `e_commerce`
- `mutual_fund`

sku

optional

`string`  The unique product id defined by the business.

name

optional

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

`integer` Offer price of the product. The offer price can be lower than the price if the business runs a discount on the product.

tax\_amount

optional

`integer` Tax amount that needs to be added to the product. In case the **offer\_price** is tax-inclusive, keep it blank.

e\_commerce

optional

`json object` Details about the type-specific data points. Will vary based on the type selected.

other\_product\_codes

optional

`object` Array to collect different codes that can identify the item type. Possible values:

upc

`string` Universal Product Code (UPC; redundantly: UPC code) is a barcode symbology used worldwide to track trade items in stores. UPC consists of 12 numeric digits that are uniquely assigned to each trade item

ean

`string` European Article Numbers (EAN) is a type of barcode that encodes an article number. Contains 8 (EAN-8) or 13 (EAN-13) numerical digits.

unspsc

`string` The United Nations Standard Products and Services Code (UNSPSC) is a taxonomy of products and services used in eCommerce. It is a four-level hierarchy coded as an eight-digit number, with an optional fifth level adding two more digits.

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

`JSON object` Details of the campaign. \*Can be extended to share UTM parameters.

external\_campaign\_id

optional

`string` Unique identifier of the campaign. For example, `PQR12453`.

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

`string` The referrer of the marketing event. Example values: `google`, `newsletter`.

medium

optional

`string` The medium that the campaign is using. Example values: `cpc`, `banner`, etc.

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

callback\_url

optional

`string` URL endpoint where Razorpay will submit the final payment status.

method

mandatory

`string` Name of the payment method. Possible value is `card`.

app

mandatory

`object` Container object for payment app configuration.

name

mandatory

`string` Name of the app. Here it is `apple_pay`.

authentication

optional

`object` Details of the authentication channel.

authentication\_channel

`string` The authentication channel for the payment. Possible values:

- `browser` (default)
- `app`

device\_fingerprint

mandatory

`string` Details of the device fingerprint.

checkout\_session\_id

mandatory

`object` id of the checkout entity that is created.

browser

mandatory

`object` Information regarding the customer's browser. This parameter need not be passed when `authentication_channel=app`.

java\_enabled

`boolean` Indicates whether the customer's browser supports Java. Obtained from the `navigator` HTML DOM object. Possible values:

- `true`: Customer's browser supports Java.
- `false`: Customer's browser does not support Java.

javascript\_enabled

`boolean` Indicates whether the customer's browser can execute JavaScript. Obtained from the `navigator` HTML DOM object. Possible values:

- `true`: Customer's browser can execute JavaScript.
- `false`: Customer's browser cannot execute JavaScript.

timezone\_offset

`integer` Time difference between UTC and the cardholder's browser local time. Obtained from the `getTimezoneOffset()` method applied to the `Date` object.

color\_depth

`integer` Obtained from the payer's browser using the `screen.colorDepth` HTML DOM property.

screen\_width

`integer` Total width of the payer's screen in pixels. Obtained from the `screen.width` HTML DOM property.

screen\_height

`integer` Obtained from the `navigator` HTML DOM object.

referrer

optional

`string` Referrer header passed by the client's browser.

user-agent

mandatory

`string` The User-Agent header of the user's browser. The default value will be passed by Razorpay if not provided by you.

ip

mandatory

`string` The customer's IP address.

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

mandatory

`string` The currency in which the transaction should be made. View the [list of supported currencies](/razorpay-docs-md/international-payments.md#supported-currencies). Length must be of 3 characters.

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
- `redirect`: Use this URL to redirect the customer to submit the OTP on the bank page.

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

2. Separate Order and Payment APIs

If you are using separate APIs to create Order and process Payment, follow the steps given below:

Step 1: Create an Order

Use the Orders API to create an order before initiating a payment.

POST

/orders

RequestResponse

copy

```bash
curl -X POST https://api.razorpay.com/v1/orders 
-U [YOUR_KEY_ID]:[YOUR_KEY_SECRET]
-H 'content-type:application/json'
-d '{
  "amount": 10000,
  "currency": "",
  "receipt": "receipt#1111",
  "partial_payment": false,
  "customer_details": {
    "name": "Gaurav Kumar",
    "contact": "+919876543210",
    "email": "gaurav.kumar@example.com",
    "insights": {
      "order_count": "22",
      "chargeback_count": "4",
      "tier": "gold",
      "booking_channel": "agent",
      "has_account": true,
      "registered_at": 1234567890
    },
    "shipping_address": {
      "line1": "Mantri apartment",
      "line2": "Koramangala",
      "city": "Bengaluru",
      "country": "IND",
      "state": "Karnataka",
      "zipcode": "560032",
      "latitude": null,
      "longitude": null
    },
    "billing_address": {
      "line1": "Mantri apartment",
      "line2": "Koramangala",
      "city": "Bengaluru",
      "country": "IND",
      "state": "Karnataka",
      "zipcode": "560032",
      "latitude": null,
      "longitude": null
    }
  },
  "shipping_details": {
    "method": "sameday",
    "gift_wrap": false
  },
  "line_items_total": 5000,
  "line_items": [
    {
      "type": "e_commerce",
      "sku": "1gr367",
      "name": "TEST",
      "description": "TEST",
      "quantity": 1,
      "image_url": "http://url",
      "product_url": "http://url",
      "price": 5000,
      "offer_price": 5000,
      "tax_amount": 0,
      "e_commerce": {
        "other_product_codes": {
          "upc": "12r34",
          "ean": "123r4",
          "unspsc": "123s4"
        }
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
    "key1": "value1",
    "key2": "value2"
  }
}'
```

Request Parameters

amount

mandatory

`integer` Payment amount in the smallest currency sub-unit. For example, if the amount to be charged is ₹299, then pass `29900` in this field. In the case of three decimal currencies, such as KWD, BHD and OMR, to accept a payment of 295.991, pass the value as `295990`. And in the case of zero decimal currencies such as JPY, to accept a payment of 295, pass the value as `295`.

**Watch Out!**

As per payment guidelines, you should pass the last decimal number as 0 for three decimal currency payments. For example, if you want to charge a customer 99.991 KWD for a transaction, you should pass the value for the amount parameter as `99990` and not `99991`.

currency

mandatory

`string` The currency in which the transaction should be made. View the [list of supported currencies](/razorpay-docs-md/international-payments.md#supported-currencies). The length must be 3 characters.

**Handy Tips**

Razorpay has added support for zero decimal currencies, such as JPY, and three decimal currencies, such as KWD, BHD and OMR, allowing businesses to accept international payments in these currencies. Know more about [Currency Conversion](/razorpay-docs-md/international-payments/currency-conversion.md)

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

optional

`json object` Details about the customer/user.

name

optional

`string` The customer’s name. For example, `Gaurav Kumar`.

contact

optional

`string` The customer's phone number. A maximum length of 15 characters, including country code. For example, `9876543210`.

email

optional

`string` The customer’s email address. For example, `gaurav.kumar@example.com`.

insights

optional

`json object` Additional details of the customer, including past transaction data.

order\_count

optional

`integer` Total orders placed by the account so far on the merchant platform. For example, 22.

chargeback\_count

optional

`integer` Total chargeback received for the customer account on the merchant platform. For example, 4.

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

- `true`: If the user is logged into the account.
- `false`: If the user is on guest checkout.

registered\_at

optional

`integer` UNIX timestamp when the customer account was created with the merchant. For example, 1234567890.

shipping\_address

optional

`json object` This will have details about the order's shipping address.

line1

optional

`string` Address Line 1 of the address

line2

optional

`string` Address Line 2 of the address

city

optional

`string` city of the address. For example, `Bengaluru`.

country

optional

`string` ISO3 country code of the billing address. For example, `IND`.

state

optional

`string` name of the state. For example, `Bengaluru`.

zipcode

optional

`string` Zipcode of the state. For example, `560001`.

latitude

optional

`float` Latitude of the position expressed in decimal degrees (WSG 84), for example, 6.244203. A positive value denotes the northern hemisphere or the equator, and a negative value denotes the southern hemisphere. The number of digits represents the precision of the coordinate.

longitude

optional

`float` Longitude of the position expressed in decimal degrees (WSG 84), for example, -75.581211. A positive value denotes east longitude or the prime meridian, and a negative value denotes west longitude. The number of digits represents the precision of the coordinate.

billing\_address

optional

`json object` This will have details about the billing address of the customer/user.

line1

optional

`string` Address Line 1 of the address.

line2

optional

`string` Address Line 2 of the address.

city

optional

`string` city of the address. For example, `Bengaluru`.

country

optional

`string` ISO3 country code of the billing address. For example, `IND`.

state

optional

`string` name of the state. For example, `Bengaluru`.

zipcode

optional

`string` Zipcode of the state. For example, `560001`.

latitude

optional

`float` Latitude of the position expressed in decimal degrees (WSG 84), for example, 6.244203. A positive value denotes the northern hemisphere or the equator, and a negative value denotes the southern hemisphere. The number of digits represents the precision of the coordinate.

longitude

optional

`float` Longitude of the position expressed in decimal degrees (WSG 84), for example, -75.581211. A positive value denotes east longitude or the prime meridian, and a negative value denotes west longitude. The number of digits represents the precision of the coordinate.

shipping\_details

optional

`json object` This will have the order's shipping details.

method

optional

`enum` Shipping method for the product. Possible values:

- `lowcost`: Lowest-cost service.
- `sameday`: Courier or same-day service.
- `oneday`: Next-day or overnight service.
- `twoday`: Two-day service.
- `threeday`: Three-day service.
- `pickup`: Store pick-up.
- `other`: Other shipping method.
- `none`: No shipping method because the product is a service or subscription.

gift\_wrap

optional

`boolean` Indicates whether the customer requested gift wrapping for this purchase. This field can contain one of the following values:

- `true`: The customer requested gift wrapping.
- `false`: The customer did not request gift wrapping.

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
- `e_commerce`
- `mutual_fund`

sku

optional

`string`  The unique product id defined by the business.

name

optional

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

`integer` Offer price of the product. The offer price can be lower than the price if the business runs a discount on the product.

tax\_amount

optional

`integer` Tax amount that needs to be added to the product. In case the **offer\_price** is tax-inclusive, keep it blank.

e\_commerce

optional

`json object` Details about the type-specific data points. Will vary based on the type selected.

other\_product\_codes

optional

`object` Array to collect different codes that can identify the item type. Possible values:

upc

`string` Universal Product Code (UPC; redundantly: UPC code) is a barcode symbology used worldwide to track trade items in stores. UPC consists of 12 numeric digits that are uniquely assigned to each trade item

ean

`string` European Article Numbers (EAN) is a type of barcode that encodes an article number. Contains 8 (EAN-8) or 13 (EAN-13) numerical digits.

unspsc

`string` The United Nations Standard Products and Services Code (UNSPSC) is a taxonomy of products and services used in eCommerce. It is a four-level hierarchy coded as an eight-digit number, with an optional fifth level adding two more digits.

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

`json object` Details of the campaign. \*Can be extended to share UTM parameters.

external\_campaign\_id

optional

`string` Unique identifier of the campaign. For example, `PQR12453`.

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

`string` The referrer of the marketing event. Example values: `google`, `newsletter`.

medium

optional

`string` The medium that the campaign is using. Example values: `cpc`, `banner`, etc.

notes

optional

`json object` Key-value pair that can be used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

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

mandatory

`string` The currency in which the transaction should be made. View the [list of supported currencies](/razorpay-docs-md/international-payments.md#supported-currencies). Length must be of 3 characters.

entity

`string` Name of the entity. Here, it is `order`.

id

`string` The unique identifier of the order.

notes

`json object` Key-value pair that can be used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

offer\_id

`string` The unique identifier of the offer.

receipt

`string` Your receipt id for this order should be passed here. Maximum length is 40 characters.

status

`string` The status of the order. Possible values:

- `created`: When you create an order, it is in the `created` state. It stays in this state till a payment is attempted on it.
- `attempted`: An order moves from `created` to `attempted` state when a payment is first attempted on it. It remains in the `attempted` state till one payment associated with that order is captured.
- `paid`: After the successful capture of the payment, the order moves to the `paid` state. No further payment requests are permitted once the order moves to the `paid` state. The order stays in the `paid` state even if the payment associated with the order is refunded.

Error Response Parameters

The error response parameters are available in the [API Reference Guide](/razorpay-docs-md/api/orders/create.md).

Step 2: Create a Payment

Once the order is created, pass the `order_id` from the Orders API response to the Payments API.

POST

/payments/create/json

RequestResponse

copy

```bash
curl -X POST \
https://api.razorpay.com/v1/payments/create/json \
-u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-H "Content-Type: application/json" \
-d '{
  "amount": 10000,
  "currency": "",
  "contact": "+919876543210",
  "email": "gaurav.kumar@example.com",
  "order_id": "order_PrcuyJDT7uSwaf",
  "callback_url": "https://merchant_callback_url..",
  "method": "card",
  "app": {
    "name": "apple_pay"
  },
  "authentication": {
    "authentication_channel": "browser"
  },
  "browser": {
    "java_enabled": false,
    "javascript_enabled": false,
    "timezone_offset": 11,
    "color_depth": 23,
    "screen_width": 23,
    "screen_height": 100
  },
  "ip": "105.106.107.108",
  "referer": "https://merchansite.com/example/paybill",
  "user_agent": "Mozilla/5.0"
}'
```

Request Parameters

amount

mandatory

`integer` Payment amount in the smallest currency sub-unit. For example, if the amount to be charged is ₹299, then pass `29900` in this field. In the case of three decimal currencies, such as KWD, BHD and OMR, to accept a payment of 295.991, pass the value as 295990. And in the case of zero decimal currencies such as JPY, to accept a payment of 295, pass the value as 295.

**Watch Out!**

As per payment guidelines, you should pass the last decimal number as 0 for three decimal currency payments. For example, if you want to charge a customer 99.991 KD for a transaction, you should pass the value for the amount parameter as `99990` and not `99991`.

currency

mandatory

`string` Currency code for the currency in which you want to accept the payment. For example, "INR". Refer to the list of supported currencies. The length must be 3 characters.

**Handy Tips**

Razorpay has added support for zero decimal currencies, such as JPY, and three decimal currencies, such as KWD, BHD, and OMR, allowing businesses to accept international payments in these currencies. Know more about [Currency Conversion](/razorpay-docs-md/international-payments/currency-conversion.md)

(May 2024).

order\_id

mandatory

`string` Unique identifier of the Order.

email

mandatory

`string` Email address of the customer. The maximum length supported is 40 characters.

contact

mandatory

`string` Phone number of the customer. The maximum length supported is 15 characters, inclusive of country code.

method

mandatory

`string` Name of the payment method. Possible value is `card`.

app

mandatory

`object` Container object for payment app configuration.

name

mandatory

`string` Name of the app. Here it is `apple_pay`.

user-agent

mandatory

`string` The User-Agent header of the user's browser. The default value will be passed by Razorpay if not provided by you.

ip

mandatory

`string` The customer's IP address.

authentication

optional

`object` Details of the authentication channel.

authentication\_channel

`string` The authentication channel for the payment. Possible values:

- `browser` (default)
- `app`

browser

mandatory

`object` Information regarding the customer's browser. This parameter need not be passed when `authentication_channel=app`.

java\_enabled

`boolean` Indicates whether the customer's browser supports Java. Obtained from the `navigator` HTML DOM object. Possible values:

- `true`: Customer's browser supports Java.
- `false`: Customer's browser does not support Java.

javascript\_enabled

`boolean` Indicates whether the customer's browser can execute JavaScript. Obtained from the `navigator` HTML DOM object. Possible values:

- `true`: Customer's browser can execute JavaScript.
- `false`: Customer's browser cannot execute JavaScript.

timezone\_offset

`integer` Time difference between UTC time and the cardholder's browser local time. Obtained from the `getTimezoneOffset()` method applied to the `Date` object.

screen\_width

`integer` Total width of the payer's screen in pixels. Obtained from the `screen.width` HTML DOM property.

screen\_height

`integer` Obtained from the `navigator` HTML DOM object.

color\_depth

`integer` Obtained from the payer's browser using the `screen.colorDepth` HTML DOM property.

language

`string` Obtained from the payer's browser using the `navigator.language` HTML DOM property. Maximum limit of 8 characters.

notes

optional

`object` Key-value object used for passing tracking info. Refer to [Notes](/razorpay-docs-md/api/understand.md#notes) for more details.

callback\_url

optional

`string` URL endpoint where Razorpay will submit the final payment status.

referrer

optional

`string` Referrer header passed by the client's browser.

Response Parameters

next

`array` A list of action objects available to continue the payment process. Present when the payment requires further processing.

action

`string` Indicates the next step to continue the payment process. Possible values:

- `otp_generate`: Use this URL to allow the customer to generate OTP and complete the payment on your webpage.
- `redirect`: Use this URL to redirect the customer to submit the OTP on the bank page.

url

`string` URL to be used for the action indicated.

razorpay\_payment\_id

`string` Unique identifier of the payment. Present for all responses.

Error Response Parameters

The error response parameters are available in the [API Reference Guide](/razorpay-docs-md/api/orders/create.md).

### 1.4 Handle Payment Success and Error Events

Once the payment is completed by the customer, a `POST` request is made to the `callback_url` provided in the payment request. The data contained in this request will depend on whether the payment was a **success** or a **failure**.

Success Callback

If the payment made by the customer is successful, the following fields are sent:

- `razorpay_payment_id`
- `razorpay_order_id`
- `razorpay_signature`

Callback Example

copy

```json
{
  "razorpay_payment_id": "pay_29QQoUBi66xm2f",
  "razorpay_order_id": "order_9A33XWu170gUtm",
  "razorpay_signature": "9ef4dffbfd84f1318f6739a3ce19f9d85851857ae648f114332d8401e0949a3d"
}
```

Failure Callback

If the payment has failed, the callback will contain details of the error. Refer to [Errors](/docs/errors/) for details.

### 1.5 Verify Payment Signature

Signature verification is a mandatory step to ensure that the callback is sent by Razorpay. The `razorpay_signature` contained in the callback can be regenerated by your system and verified as follows.

Create a string to be hashed using the `razorpay_payment_id` contained in the callback and the order id generated in the first step, separated by a `|`. Hash this string using SHA256 and your API Secret.

copy

```
generated_signature = hmac_sha256(order_id + "|" + razorpay_payment_id, secret);

if (generated_signature == razorpay_signature) {
    payment is successful
}
```

#### Generate Signature on your Server

Sample code

JavaPythonGoPHPRubyNode.js.NET

copy

```java
/**
* This class defines common routines for generating
* authentication signatures for Razorpay Webhook requests.
*/
public class Signature
{
    private static final String HMAC_SHA256_ALGORITHM = "HmacSHA256";
    /**
    * Computes RFC 2104-compliant HMAC signature.
    * * @param data
    * The data to be signed.
    * @param key
    * The signing key.
    * @return
    * The Base64-encoded RFC 2104-compliant HMAC signature.
    * @throws
    * java.security.SignatureException when signature generation fails
    */
    public static String calculateRFC2104HMAC(String data, String secret)
    throws java.security.SignatureException
    {
        String result;
        try {

            // get an hmac_sha256 key from the raw secret bytes
            SecretKeySpec signingKey = new SecretKeySpec(secret.getBytes(), HMAC_SHA256_ALGORITHM);

            // get an hmac_sha256 Mac instance and initialize with the signing key
            Mac mac = Mac.getInstance(HMAC_SHA256_ALGORITHM);
            mac.init(signingKey);

            // compute the hmac on input data bytes
            byte[] rawHmac = mac.doFinal(data.getBytes());

            // base64-encode the hmac
            result = DatatypeConverter.printHexBinary(rawHmac).toLowerCase();

        } catch (Exception e) {
            throw new SignatureException("Failed to generate HMAC : " + e.getMessage());
        }
        return result;
    }
}
```

### 1.6 Integrate Payments Rainy Day Kit

Use Payments Rainy Day kit to overcome payments exceptions such as:

- [Late Authorisation](/razorpay-docs-md/payments/late-authorisation.md)
- [Payment Downtime](/razorpay-docs-md/api/payments/downtime.md)
- [Payment Errors](/docs/errors/)

### 1.7 Verify Payment Status

**Handy Tips**

On the Razorpay Dashboard, ensure that the payment status is `captured`. Refer to the payment capture settings page to know how to [capture payments automatically](/razorpay-docs-md/payments/capture-settings.md).

You can track the payment status in three ways:

Verify Status from Dashboard

Subscribe to Webhook Events

Poll APIs

To verify the payment status from the Razorpay Dashboard:

1. Log in to the Razorpay Dashboard and navigate to **Transactions** → **Payments**.
2. Check if a **Payment Id** has been generated and note the status. In case of a successful payment, the status is marked as **Captured**.

![Payment details on Dashboard](https://razorpay.com/docs/payments/payment-methods/apple-pay/build/browser/assets/images/testpayment.jpg)

## Frequently Asked Questions

1. Do I need to handle Apple certificates or domain verification?

No, Razorpay handles all Apple Pay technical requirements including business verification and certificates.

2. Can customers save their preference for Apple Pay?

Yes, customers who use Apple Pay once can use it for future transactions with the same saved cards.

3. What happens if the customer cancels on the Apple Pay page?

They will be redirected to your failure URL with appropriate error codes, same as a failed card payment.

4. Are there additional charges for Apple Pay transactions?

Reach out to your account manager for details on Apple Pay transaction pricing.

5. Which countries support Apple Pay?

Apple Pay is available in 70+ countries. Customers from these regions can make payments to your business. See the full list of [supported countries](https://support.apple.com/en-in/102775).
