<!-- Source: https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/chargeback/build-integration-travel -->

Follow these steps to integrate the standard checkout form on your website:

**1.1** [Generate API Keys](/razorpay-docs-md/payment-gateway/web-integration/standard/chargeback/build-integration-travel.md#11-generate-api-keys).

**1.2** [Create an order in server](/razorpay-docs-md/payment-gateway/web-integration/standard/chargeback/build-integration-travel.md#12-create-an-order-in-server).

**1.3** [Integrate with checkout on client-side](/razorpay-docs-md/payment-gateway/web-integration/standard/chargeback/build-integration-travel.md#13-integrate-with-checkout-on-client-side).

**1.4** [Handle payment success and failure](/razorpay-docs-md/payment-gateway/web-integration/standard/chargeback/build-integration-travel.md#14-handle-payment-success-and-failure).

**1.5** [Store fields in server](/razorpay-docs-md/payment-gateway/web-integration/standard/chargeback/build-integration-travel.md#15-store-fields-in-your-server).

**1.6** [Verify payment signature](/razorpay-docs-md/payment-gateway/web-integration/standard/chargeback/build-integration-travel.md#16-verify-payment-signature).

**1.7** [Verify payment status](/razorpay-docs-md/payment-gateway/web-integration/standard/chargeback/build-integration-travel.md#17-verify-payment-status).

## 1.1 Generate API Keys

Follow these steps to generate API keys:

#### Test Mode API Keys

Watch this video to see how to generate API keys in the Test mode.

#### Live Mode API Keys

Watch this video to see how to generate API keys in the Live mode.

1. Log in to your Dashboard with the appropriate credentials.
2. Select the mode (**Test** or **Live**) for which you want to generate the API key.
   - **Test Mode**: The test mode is a simulation mode that you can use to test your integration flow. **Your customers will not be able to make payments in this mode**.
   - **Live Mode**: When your integration is complete, switch to live mode and generate live mode API keys. In the integration, **replace test mode keys with live mode keys to accept customer payments**.
3. Navigate to **Account & Settings** → **API Keys** (under **Website and app settings**) → **Generate Key** to generate key for the selected mode.

**Watch Out!**

- After generating the keys from the Dashboard, download and save them securely. You can use only one set of API keys. If you do not remember your API keys, you must [regenerate them](/razorpay-docs-md/dashboard/account-settings/api-keys.md#regenerate-api-keys)

  from the Dashboard and update them wherever the previous keys were used for payment gateway integrations.
- API Keys are universal; that is, they are applicable to all websites and apps that you have whitelisted for your Merchant ID.
- **Do not share your API Key secret** with anyone or on any public platforms. **This can pose security threats to your Razorpay account**.
- Once you generate the API Keys, only the **Key Id** is visible on the Dashboard, **not the Key secret**, as it can pose security threats to your Razorpay account.
- Use the **Live API Keys** to accept live payments and the **Test API Keys** for test transactions.

Once generated, you will be able to see the Key id, the date the key was created and the expiry date for the API Key on screen.

**Watch Out!**

Save your Key ID and Key Secret securely (never expose the Key Secret in client-side code).

## 1.2 Create an Order in Server

Order is an important step in the payment process.

- An order should be created for every payment.
- You can create an order using the [Orders API](/razorpay-docs-md/payment-gateway/web-integration/standard/chargeback/build-integration-travel.md#api-sample-code)  . It is a server-side API call.  Know how to [authenticate](/razorpay-docs-md/api/authentication.md#generate-api-keys)

  Orders API.
- The order\_id received in the response should be passed to the checkout. This ties the Order with the payment and secures the request from being tampered.

**Watch Out!**

Payments made without an `order_id` cannot be captured and will be automatically refunded. You must create an order before initiating payments to ensure proper payment processing.

#### API Sample Code

The following is a sample API request and response for creating an order:

Curl

copy

```bash
curl -X POST https://api.razorpay.com/v1/orders
-u [YOUR_KEY_ID]:[YOUR_KEY_SECRET]
-H 'content-type:application/json'
-d '{
  "amount": 50000,
  "currency": "INR",
  "receipt": "receipt#1111",
  "partial_payment": false,
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
  "line_items_total": 5000,
  "line_items": [
    {
      "sku": "1gr367",
      "name": "Flight Ticket",
      "description": "Flight tickets",
      "quantity": 2,
      "type": "travel",
      "image_url": "http://url",
      "product_url": "http://url",
      "price": 5000,
      "offer_price": 5000,
      "tax_amount": 0,
      "travel": {
        "mode": "flight",
        "sub_type": "ticket",
        "carrier_code": "AA123",
        "departure_city": "UAM",
        "departure_timestamp": "1234567890",
        "arrival_city": "UAM",
        "travellers": [
          {
            "name": "Gaurav Kumar",
            "email": "gaurav.kumar@example.com",
            "contact": "+919000090000",
            "age": 18,
            "nationality": "IND",
            "class": "business",
            "identity": {
              "unique_national_id": "ABCDE12345Z",
              "tax_id": "ABCDE12345Z"
            }
          },
          {
            "name": "Gaurav Kumar",
            "email": "gaurav.kumar@example.com",
            "contact": "+919000090000",
            "age": 18,
            "nationality": "IND",
            "class": "business",
            "identity": {
              "unique_national_id": "ABCDE12345Z",
              "tax_id": "ABCDE12345Z"
            }
          }
        ]
      }
    },
    {
      "sku": "1gr368",
      "name": "Travel_Insurance",
      "description": "Flight_Travel_Insurance",
      "quantity": 1,
      "image_url": "http://url",
      "product_url": "http://url",
      "price": 5000,
      "offer_price": 5000,
      "tax_amount": 0,
      "type": "travel",
      "travel": {
        "mode": "flight",
        "sub_type": "insurance",
        "travellers": [
          {
            "name": "Gaurav Kumar",
            "email": "gaurav.kumar@example.com",
            "contact": "+919000090000",
            "age": 18,
            "nationality": "IND",
            "class": "business",
            "identity": {
              "unique_national_id": "ABCDE12345Z",
              "tax_id": "ABCDE12345Z"
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
  }
}'
```

Response

copy

```json
{
  "id": "order_QU1wpqJfs7smfR",
  "entity": "order",
  "amount": 50000,
  "amount_paid": 0,
  "amount_due": 50000,
  "currency": "INR",
  "receipt": "receipt#1111",
  "offer_id": null,
  "status": "created",
  "attempts": 0,
  "notes": {
    "key1": "value3",
    "key2": "value2"
  },
  "created_at": 1747055716
}
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

optional

`json object` Details about the customer/user.

name

optional

`string` The customer’s name. For example, `Gaurav Kumar`.

contact

optional

`string` The customer's phone number. A maximum length of 15 characters, including country code. For example, +919000090000.

email

optional

`string` The customer’s email address. For example, `gaurav.kumar@example.com`.

insights

optional

`json object` Additional details of the customer, including past transaction data.

order\_count

optional

`integer` Total orders placed by the account so far on the merchant platform. For example, `22`.

chargeback\_count

optional

`integer` Total chargeback received for the customer account on the merchant platform. For example, `4`.

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
`true`: If the user is logged into the account.
`false`: If the user is on guest checkout.

registered\_at

optional

`integer` UNIX timestamp when the customer account was created with the business. For example, 1234567890.

billing\_address

optional

`Json object` This will have details about the billing address of the customer/user.

line1

optional

`string` Address Line 1 of the address.

line2

optional

`string` Address Line 2 of the address.

city

optional

`string` City of the address. For example, `Bengaluru`.

country

optional

`string` ISO3 country code of the billing address. For example, `IND`.

state

optional

`string` Name of the state. For example, `KA`.

zipcode

optional

`string` Zipcode of the state. For example, `560001`.

latitude

optional

`float` Latitude of the position expressed in decimal degrees (WSG 84), for example, 6.244203. A positive value denotes the northern hemisphere or the equator, and a negative value denotes the southern hemisphere. The number of digits represents the precision of the coordinate.

longitude

optional

`float` Longitude of the position expressed in decimal degrees (WSG 84), for example, -75.581211. A positive value denotes east longitude or the prime meridian, and a negative value denotes west longitude. The number of digits represents the precision of the coordinate.

line\_items\_total

optional

`integer` Total sum of the cart value.

line\_items

mandatory

`json object` Details about the specific items added to the cart.

sku

optional

`string`  Unique product id defined by the business.

name

optional

`string` The name of the product.

description

optional

`string` Description of the product.

quantity

optional

`integer` Number of tickets/items/quantity to be purchased.

type

mandatory

`string` Defines the category type. Possible values:

- `travel`
- `hotel`
- `e_commerce`
- `mutual_fund`

image\_url

optional

`string` URL of the product image.

product\_url

optional

`string` URL of the product’s listing page.

price

optional

`integer` Unit price of the product in paisa (needs to be inclusive of tax).

offer\_price

optional

`integer` Offer price of the product. The offer price can be lower than the price if the business is running any discount on the product.

tax\_amount

optional

`integer` Tax amount that needs to be added to the product. In case the **offer\_price** is tax-inclusive, keep it blank.

travel

optional

`json object` Details about the type-specific data points. Will vary based on the type selected.

mode

optional

`string` The mode of travel. Possible values:

- `flight`
- `train`
- `bus`
- `cab`
- `others`

sub\_type

optional

`string` The subtype of the line item. Possible values:

- `ticket`
- `meal`
- `insurance`
- `preferred_seat`
- `others`

carrier\_code

optional

`string` Full flight number for this leg of the journey. For example, `AA123`.

departure\_city

optional

`string` 3 letter IATA airport code, also known as an IATA location identifier, IATA station code. For example, CPH for Copenhagen.

departure\_timestamp

optional

`integer` UNIX timestamp. For example, 1234567890.

arrival\_city

optional

`string` 3 letter IATA airport code, also known as an IATA location identifier, IATA station code. For example, CPH for Copenhagen

travellers

optional

`JSON object` Details associated with passengers/travellers/beneficiaries.

name

optional

`string` Name of the passenger/traveler/beneficiary.

email

optional

`string` Email address of the passenger/traveler/beneficiary.

age

optional

`integer` UNIX timestamp of the date of birth of the individual. For example, `1234567890`.

nationality

optional

`string` ISO3 country code to share the nationality of the individual. For example, `IND`.

class

optional

`string` Type of the flight ticket. Possible values:

- `economy`
- `premium_economy`
- `business`
- `SL`
- `3A`
- `2A`
- `1A`
- `CC`
- `others`

identity

optional

`JSON object` Identity details of the passenger/beneficiary.

tax\_id

optional

`string` Tax ID number. For example, PAN number for India.

unique\_national\_id

optional

`string` National ID number. For example, Adhaar number for India.

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
Minimum value `12` minutes. This parameter is mandatory only if the value of the `capture` parameter is `automatic`.

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

`string` The referrer of the marketing event. Example values:

- `google`
- `newsletter`

medium

optional

`string` The medium that the campaign is using. Example values:

- `cpc`
- `banner`

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

## 1.3 Integrate with Checkout on Client-Side

Add the Pay button on your web page using the checkout code, Handler Function or Callback URL.

### Handler Function or Callback URL

### Code to Add Pay Button

Copy-paste the parameters as `options` in your code:

Callback URL (JS) Checkout CodeHandler Functions (JS) Checkout Code

copy

```html
<button id="rzp-button1">Pay</button>
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
<script>
var options = {
    "key": "YOUR_KEY_ID", // Enter the Key ID generated from the Dashboard
    "amount": "50000", // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
    "currency": "INR",
    "name": "Acme Corp", //your business name
    "description": "Test Transaction",
    "image": "https://example.com/your_logo",
    "order_id": "order_9A33XWu170gUtm", //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
    "callback_url": "https://eneqd3r9zrjok.x.pipedream.net/",
    "prefill": { //We recommend using the prefill parameter to auto-fill customer's contact information especially their phone number
        "name": "Gaurav Kumar", //your customer's name
        "email": "gaurav.kumar@example.com",
        "contact": "9000090000" //Provide the customer's phone number for better conversion rates 
    },
    "notes": {
        "address": "Razorpay Corporate Office"
    },
    "theme": {
        "color": "#3399cc"
    }
};
var rzp1 = new Razorpay(options);
document.getElementById('rzp-button1').onclick = function(e){
    rzp1.open();
    e.preventDefault();
}
</script>
```

Checkout Parameters

key

mandatory

`string` API Key ID generated from the Dashboard.

amount

mandatory

`integer` Payment amount in the smallest currency subunit. For example, if the amount to be charged is ₹299, then pass `29900` in this field. In the case of three decimal currencies, such as KWD, BHD and OMR, to accept a payment of 295.991, pass the value as `295990`. And in the case of zero decimal currencies such as JPY, to accept a payment of 295, pass the value as `295`.

**Watch Out!**

As per payment guidelines, you should pass the last decimal number as 0 for three decimal currency payments. For example, if you want to charge a customer 99.991 KD for a transaction, you should pass the value for the amount parameter as `99990` and not `99991`.

currency

mandatory

`string` The currency in which the payment should be made by the customer. See the list of [supported currencies](/razorpay-docs-md/international-payments.md#supported-currencies).

**Handy Tips**

Razorpay has added support for zero decimal currencies, such as JPY, and three decimal currencies, such as KWD, BHD, and OMR, allowing businesses to accept international payments in these currencies. Know more about [Currency Conversion](/razorpay-docs-md/international-payments/currency-conversion.md)

(May 2024).

name

mandatory

`string` Your Business/Enterprise name shown on the Checkout form. For example, **Acme Corp**.

description

optional

`string` Description of the purchase item shown on the Checkout form. It should start with an alphanumeric character.

image

optional

`string` Link to an image (usually your business logo) shown on the Checkout form. Can also be a **base64** string if you are not loading the image from a network.

order\_id

mandatory

`string` Order ID generated via [Orders API](/razorpay-docs-md/api/orders.md).

prefill

`object` You can prefill the following details at Checkout.

**Boost Conversions and Minimise Drop-offs**

- Autofill customer contact details, especially phone number to ease form completion. Include customer’s phone number in the `contact` parameter of the JSON request's `prefill` object. Format: +(country code)(phone number). Example: "contact": "+919000090000".
- This is not applicable if you do not collect customer contact details on your website before checkout, have Shopify stores or use any of the no-code apps.

name

optional

`string` Cardholder's name to be prefilled if customer is to make card payments on Checkout. For example, **Gaurav Kumar**.

email

optional

`string` Email address of the customer.

contact

optional

`string` Phone number of the customer. The expected format of the phone number is `+ {country code}{phone number}`. If the country code is not specified, `91` will be used as the default value. This is particularly important while prefilling `contact` of customers with phone numbers issued outside India. **Examples**:

- +14155552671 (a valid non-Indian number)
- +919977665544 (a valid Indian number).
  If 9977665544 is entered, `+91` is added to it as +919977665544.

method

optional

`string` Pre-selection of the payment method for the customer. Will only work if `contact` and `email` are also prefilled. Possible values:

- `card`
- `netbanking`
- `wallet`
- `upi`
- `emi`

notes

optional

`object` Set of key-value pairs that can be used to store additional information about the payment. It can hold a maximum of 15 key-value pairs, each 256 characters long (maximum).

theme

`object` Thematic options to modify the appearance of Checkout.

color

optional

`string` Enter your brand colour's HEX code to alter the text, payment method icons and CTA (call-to-action) button colour of the Checkout form.

backdrop\_color

optional

`string` Enter a HEX code to change the Checkout's backdrop colour.

modal

`object` Options to handle the Checkout modal.

backdropclose

optional

`boolean` Indicates whether clicking the translucent blank space outside the Checkout form should close the form. Possible values:

- `true`: Closes the form when your customer clicks outside the checkout form.
- `false` (default): Does not close the form when customer clicks outside the checkout form.

escape

optional

`boolean` Indicates whether pressing the **escape** key should close the Checkout form. Possible values:

- `true` (default): Closes the form when the customer presses the **escape** key.
- `false`: Does not close the form when the customer presses the **escape** key.

handleback

optional

`boolean` Determines whether Checkout must behave similar to the browser when back button is pressed. Possible values:

- `true` (default): Checkout behaves similarly to the browser. That is, when the browser's back button is pressed, the Checkout also simulates a back press. This happens as long as the Checkout modal is open.
- `false`: Checkout does not simulate a back press when browser's back button is pressed.

confirm\_close

optional

`boolean` Determines whether a confirmation dialog box should be shown if customers attempts to close Checkout. Possible values:

- `true`: Confirmation dialog box is shown.
- `false` (default): Confirmation dialog box is not shown.

ondismiss

optional

`function` Used to track the status of Checkout. You can pass a modal object with `ondismiss: function()\{\}` as options. This function is called when the modal is closed by the user. If `retry` is `false`, the `ondismiss` function is triggered when checkout closes, even after a failure.

animation

optional

`boolean` Shows an animation before loading of Checkout. Possible values:

- `true`(default): Animation appears.
- `false`: Animation does not appear.

subscription\_id

optional

`string` If you are accepting recurring payments using Razorpay Checkout, you should pass the relevant `subscription_id` to the Checkout. Know more about [Subscriptions on Checkout](/razorpay-docs-md/api/payments/subscriptions.md#checkout-integration).

subscription\_card\_change

optional

`boolean` Permit or restrict customer from changing the card linked to the subscription. You can also do this from the [hosted page](/razorpay-docs-md/subscriptions/payment-retries.md#update-the-payment-method-via-our-hosted-page). Possible values:

- `true`: Allow the customer to change the card from Checkout.
- `false` (default): Do not allow the customer to change the card from Checkout.

recurring

optional

`boolean` Determines if you are accepting [recurring (charge-at-will) payments on Checkout](/razorpay-docs-md/api/payments/recurring-payments.md) via instruments such as emandate, paper NACH and so on. Possible values:

- `true`: You are accepting recurring payments.
- `false` (default): You are not accepting recurring payments.

callback\_url

optional

`string` Customers will be redirected to this URL on successful payment. Ensure that the domain of the Callback URL is allowlisted.

redirect

optional

`boolean` Determines whether to post a response to the event handler post payment completion or redirect to Callback URL. `callback_url` must be passed while using this parameter. Possible values:

- `true`: Customer is redirected to the specified callback URL in case of payment failure.
- `false` (default): Customer is shown the Checkout popup to retry the payment with the suggested next best option.

customer\_id

optional

`string` Unique identifier of customer. Used for:

- [Local saved cards feature](/razorpay-docs-md/payment-methods/cards/features/saved-cards.md#manage-saved-cards)

  .
- Static bank account details on Checkout in case of [Bank Transfer payment method](/razorpay-docs-md/payment-methods/bank-transfer.md)  .

remember\_customer

optional

`boolean` Determines whether to allow saving of cards. Can also be configured via the [Dashboard](/razorpay-docs-md/dashboard/account-settings/checkout-features.md#flash-checkout). Possible values:

- `true`: Enables card saving feature.
- `false` (default): Disables card saving feature.

timeout

optional

`integer` Sets a timeout on Checkout, in seconds. After the specified time limit, the customer will not be able to use Checkout.

**Watch Out!**

Some browsers may pause `JavaScript` timers when the user switches tabs, especially in power saver mode. This can cause the checkout session to stay active beyond the set timeout duration.

readonly

`object` Marks fields as read-only.

contact

optional

`boolean` Used to set the `contact` field as readonly. Possible values:

- `true`: Customer will not be able to edit this field.
- `false` (default): Customer will be able to edit this field.

email

optional

`boolean` Used to set the `email` field as readonly. Possible values:

- `true`: Customer will not be able to edit this field.
- `false` (default): Customer will be able to edit this field.

name

optional

`boolean` Used to set the `name` field as readonly. Possible values:

- `true`: Customer will not be able to edit this field.
- `false` (default): Customer will be able to edit this field.

hidden

`object` Hides the contact details.

contact

optional

`boolean` Used to set the `contact` field as optional. Possible values:

- `true`: Customer will not be able to view this field.
- `false` (default): Customer will be able to view this field.

email

optional

`boolean` Used to set the `email` field as optional. Possible values:

- `true`: Customer will not be able to view this field.
- `false` (default): Customer will be able to view this field.

send\_sms\_hash

optional

`boolean` Used to auto-read OTP for cards and netbanking pages. Applicable from Android SDK version 1.5.9 and above. Possible values:

- `true`: OTP is auto-read.
- `false` (default): OTP is not auto-read.

allow\_rotation

optional

`boolean` Used to rotate payment page as per screen orientation. Applicable from Android SDK version 1.6.4 and above. Possible values:

- `true`: Payment page can be rotated.
- `false` (default): Payment page cannot be rotated.

retry

optional

`object` Parameters that enable retry of payment on the checkout.

enabled

`boolean` Determines whether the customers can retry payments on the checkout. Possible values:

- `true` (default): Enables customers to retry payments.
- `false`: Disables customers from retrying the payment.

max\_count

`integer` The number of times the customer can retry the payment. We recommend you to set this to 4. Having a larger number here can cause loops to occur.

**Watch Out!**

Web Integration does not support the `max_count` parameter. It is applicable only in Android and iOS SDKs.

config

optional

`object` Parameters that enable checkout configuration.

display

`object` Child parameter that enables configuration of checkout display language.

language

`string` The language in which checkout should be displayed. Possible values:

- `en`: English
- `ben`: Bengali
- `hi`: Hindi
- `mar`: Marathi
- `guj`: Gujarati
- `tam`: Tamil
- `tel`: Telugu

**Handy Tips**

The open method of Razorpay object (`rzp1.open()`) must be invoked by your site's JavaScript, which may or may not be a user-driven action such as a click.

## Errors

Given below is a list of errors you may face while integrating with checkout on the client-side.

### Configure Payment Methods (Optional)

Multiple payment methods are available on the Razorpay Web Standard Checkout.

- The payment methods are **fixed** and cannot be changed.
- You can configure the order or make certain payment methods prominent. Know more about [configuring payment methods](/razorpay-docs-md/payment-gateway/web-integration/standard/configure-payment-methods.md)  .

## 1.4 Handle Payment Success and Failure

The way the Payment Success and Failure scenarios are handled depends on the [Checkout Sample Code](/razorpay-docs-md/payment-gateway/web-integration/standard/chargeback/build-integration-travel.md#code-to-add-pay-button) you used in the last step.

### Checkout with Handler Function

If you used the sample code with the handler function:

On Payment Success

On Payment Failure

The customer sees your website page. The checkout returns the response object of the successful payment (**razorpay\_payment\_id**, **razorpay\_order\_id** and **razorpay\_signature**). Collect these and send them to your server.

### Checkout with Callback URL

If you used the sample code with the callback URL:

On Payment Success

On Payment Failure

Razorpay makes a POST call to the callback URL with the **razorpay\_payment\_id**, **razorpay\_order\_id** and **razorpay\_signature** in the response object of the successful payment. Only successful authorisations are auto-submitted.

## 1.5 Store Fields in Your Server

A successful payment returns the following fields to the Checkout form.

Success Callback

- You need to store these fields in your server.
- You can confirm the authenticity of these details by verifying the signature in the next step.

razorpay\_payment\_id

`string` Unique identifier for the payment returned by Checkout **only** for successful payments.

razorpay\_order\_id

`string` Unique identifier for the order returned by Checkout.

razorpay\_signature

`string` Signature returned by the Checkout. This is used to verify the payment.

## 1.6 Verify Payment Signature

This is a mandatory step to confirm the authenticity of the details returned to the Checkout form for successful payments.

To verify the `razorpay_signature` returned to you by the Checkout form:

1. Create a signature in your server using the following attributes:

   - `order_id`: Retrieve the `order_id` from your server. Do not use the `razorpay_order_id` returned by Checkout.
   - `razorpay_payment_id`: Returned by Checkout.
   - `key_secret`: Available in your server. The `key_secret` that was generated from the [Dashboard](/razorpay-docs-md/dashboard/account-settings/api-keys.md#generate-api-keys)     .
2. Use the SHA256 algorithm, the `razorpay_payment_id` and the `order_id` to construct a HMAC hex digest as shown below:

   HMAC Hex Digest

   copy

   ```html
generated_signature = hmac_sha256(order_id + "|" + razorpay_payment_id, secret);

  if (generated_signature == razorpay_signature) {
    payment is successful
  }
```
3. If the signature you generate on your server matches the `razorpay_signature` returned to you by the Checkout form, the payment received is from an authentic source.

Generate Signature on Your Server

Given below is the sample code for payment signature verification:

JavaPythonGoPHPRubyNode.js.NET

copy

```java
RazorpayClient razorpay = new RazorpayClient("[YOUR_KEY_ID]", "[YOUR_KEY_SECRET]");

String secret = "EnLs21M47BllR3X8PSFtjtbd";

JSONObject options = new JSONObject();
options.put("razorpay_order_id", "order_IEIaMR65cu6nz3");
options.put("razorpay_payment_id", "pay_IH4NVgf4Dreq1l");
options.put("razorpay_signature", "0d4e745a1838664ad6c9c9902212a32d627d68e917290b0ad5f08ff4561bc50f");

boolean status =  Utils.verifyPaymentSignature(options, secret);
```

Post Signature Verification

After you have completed the integration, you can [set up webhooks](/docs/webhooks/setup-edit-payments/), make test payments, replace the test key with the live key and integrate with other [APIs](/razorpay-docs-md/api/index.md).

Here are the links to our [SDKs](/razorpay-docs-md/api/authentication.md#client-libraries) for the supported platforms.

## 1.7 Verify Payment Status

**Handy Tips**

On the Razorpay Dashboard, ensure that the payment status is `captured`. Refer to the payment capture settings page to know how to [capture payments automatically](/razorpay-docs-md/payments/capture-settings.md).

You can track the payment status in three ways:

Verify Status from Dashboard

Subscribe to Webhook Events

Poll APIs

To verify the payment status from the Razorpay Dashboard:

1. Log in to the Razorpay Dashboard and navigate to **Transactions** → **Payments**.
2. Check if a **Payment Id** has been generated and note the status. In case of a successful payment, the status is marked as **Captured**.

![Payment details on Dashboard](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/chargeback/build/browser/assets/images/testpayment.jpg)

## Next Steps [Step 2: Test Integration](/razorpay-docs-md/payment-gateway/web-integration/standard/chargeback/test-integration.md)
