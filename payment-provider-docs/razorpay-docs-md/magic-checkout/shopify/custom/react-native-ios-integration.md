<!-- Source: https://razorpay.com/docs/payments/magic-checkout/shopify/custom/react-native-ios-integration -->

Follow these steps to integrate the Razorpay Magic Checkout on your React Native iOS application when using Shopify as your e-commerce platform.

## Prerequisites

- Ensure you enable [Magic Checkout](/razorpay-docs-md/magic-checkout/troubleshooting-faqs.md#3-how-do-i-check-if-magic-checkout)

  on your account.
- Integrate [Magic Checkout With Shopify Store](/razorpay-docs-md/magic-checkout/shopify.md)  .
- Integrate with [React Native: iOS Integration](/razorpay-docs-md/magic-checkout/react-native-ios-integration.md)  .
- Generate [Live API Keys](/razorpay-docs-md/dashboard/account-settings.md#api-keys)

  from the Dashboard.

#### 1. Build Integration

Integrate with React Native iOS App for Shopify.

#### 2. Test Integration

Test the integration by making a test payment.

## 1. Build Integration

Follow the steps given below:

**Watch Out!**

If you use M1 MacBook, you need to make [these changes](/razorpay-docs-md/magic-checkout/shopify/custom/react-native-ios-integration.md#m1-macbook-changes) in your `podfile`.

1.1 Create a Checkout id

Generate a unique cart identifier to initiate the Magic Checkout process.

**Important**

Ensure you create the Shopify cart before making this request as the cart token must be included in the payload.

POST

/magic/checkout/shopify?key\_id=rzp\_live\_XXXXXX

RequestResponse

copy

```bash
curl -X POST https://api.razorpay.com/v1/magic/checkout/shopify?key_id=rzp_live_XXXXXX \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "cart": {
      "token": "ashgad?key=abasab",
      "note": null,
      "attributes": {},
      "item_count": 1,
      "items": [
        {
          "id": 100000000001,
          "quantity": 1,
          "product_id": 832938123321,
          "variant_id": 100000000001,
          "properties": {}
        }
      ]
    }
  }'
```

Request Parameters

cart

mandatory

`object` Complete cart object from Shopify.

cart.token

mandatory

`string` Unique cart token from Shopify cart creation.

cart.note

optional

`string|null` Customer notes or special instructions.

cart.attributes

optional

`object` Custom attributes for the cart (key-value pairs).

cart.item\_count

mandatory

`integer` Total number of items in the cart.

cart.items

mandatory

`array` Array of cart items.

cart.items[].id

mandatory

`integer` Unique item identifier.

cart.items[].quantity

mandatory

`integer` Quantity of the item.

cart.items[].product\_id

mandatory

`integer` Shopify product identifier.

cart.items[].variant\_id

mandatory

`integer` Shopify variant identifier.

cart.items[].properties

optional

`object` Custom item properties.

Response Parameters

shopify\_checkout\_id

`string` Unique checkout identifier for Shopify integration.

tax\_details

`object` Tax information for the checkout.

total\_tax

`integer` Total tax amount in smallest currency unit (paise).

taxes\_included

`boolean` Whether taxes are included in item prices. Possible values:

- `true`: Taxes are included in item prices.
- `false`: Taxes are separate from item prices.

1.2 Create Order id on Server

Create a Razorpay order id required for the payment modal. This API requires the `shopify_checkout_id` from [Step 1.1](/razorpay-docs-md/magic-checkout/shopify/custom/react-native-ios-integration.md#11-create-a-checkout-id).

POST

/magic/order/shopify?key\_id=rzp\_live\_XXXXXX

RequestResponse

copy

```bash
curl -X POST https://api.razorpay.com/v1/magic/order/shopify?key_id=rzp_live_XXXXXX \
  -H "Content-Type: application/json" \
  -H "Accept: */*" \
  -H "Origin: https://api.razorpay.com" \
  -d '{
    "shopify_checkout_id": "gid://shopify/Cart/ashgad?key=abasab",
    "ga_id": "GA1.1.xxxxxxx.xxxxxxxx",
    "fb_analytics": {
      "external_id": "unique_fb_external_id",
      "fbp": "fb.1.xxxxxxx.xxxxxxxx",
      "fbc": "",
      "event_source_url": "https://your-store.com/"
    },
    "utm_parameters": {
      "landing_page_url": "https://your-store.com/",
      "user_agent": "Mozilla/5.0 (Linux; Android 12; SM-G991B)..."
    },
    "analytics": {
      "fb_analytics": {
        "external_id": "unique_fb_external_id",
        "fbp": "fb.1.xxxxxxx.xxxxxxxx",
        "fbc": ""
      },
      "ga4": {
        "session_ids": {
          "_ga_XXXXXXXXXX": "GS1.1.xxxxxxxx.x.x.x.x.x"
        },
        "client_id": "GA1.1.xxxxxxxx.xxxxxxxx"
      },
      "google_ads": {
        "gclid": "",
        "wbraid": "",
        "gbraid": ""
      },
      "source_url": "https://your-store.com/"
    }
  }'
```

Request Parameters

shopify\_checkout\_id

mandatory

`string` Checkout id from [Step 1.1](/razorpay-docs-md/magic-checkout/shopify/custom/react-native-ios-integration.md#11-create-a-checkout-id).

ga\_id

optional

`string` Google Analytics client identifier.

fb\_analytics

optional

`object` Facebook Analytics parameters.

external\_id

optional

`string` Unique external id for Facebook tracking.

fbp

optional

`string` Facebook browser pixel id.

fbc

optional

`string` Facebook click id.

event\_source\_url

optional

`string` Source URL for the event.

utm\_parameters

optional

`object` UTM tracking parameters.

landing\_page\_url

optional

`string` Landing page URL.

user\_agent

optional

`string` Browser user agent string.

analytics

optional

`object` Comprehensive analytics data.

fb\_analytics

optional

`object` Facebook Analytics configuration.

external\_id

optional

`string` Unique external id for Facebook tracking.

fbp

optional

`string` Facebook browser pixel id.

fbc

optional

`string` Facebook click id.

ga4

optional

`object` Google Analytics 4 configuration.

session\_ids

optional

`object` GA4 session identifiers.

client\_id

optional

`string` GA4 client identifier.

google\_ads

optional

`object` Google Ads tracking parameters.

gclid

optional

`string` Google Click Identifier.

wbraid

optional

`string` Web-to-app measurement parameter.

gbraid

optional

`string` Google Ads Broad match parameter.

source\_url

optional

`string` Source URL for analytics.

Response Parameters

preferences

`object|null` Customer preferences. Returns `null` if no preferences are set.

order\_id

`string` Unique Razorpay order identifier. For example, `order_EKwxwAgItmmXdp`.

1.3 Install Razorpay React Native SDK

Install the SDK using the following `npm` command in the **Terminal** window. If you are using Windows, please use **Git Bash** instead of the **Command Prompt** window. Ensure that you run this code within your React Native project folder in **Terminal** window.

Code

copy

```javascript
//using npm
$ npm install react-native-razorpay --save
```

Additionally, run the code given below if you are using `yarn` or `expo`:

Code using yarn

copy

```javascript
// using yarn
$ yarn add react-native-razorpay
```

Code using expo

copy

```javascript
// for expo
$ npx expo install react-native-razorpay
```

1.4 Open Podfile and Update Platform Version

Navigate to the **ios** folder and open **Podfile**. You can do this using the following code.

Open Podfile

copy

```javascript
$ cd ios && open podfile
```

Change the platform version from `9.0` to `10.0` in the Podfile.

![](https://razorpay.com/docs/payments/magic-checkout/shopify/custom/build/browser/assets/images/react-native-change_platform_version_podfile.jpg)

1.5 Install Pods Using Cocoapods

Install pods after updating the iOS platform. This will install all pods in the Podfile at the exact versions.

Cocoapod Step

copy

```javascript
pod install && cd ..
```

1.6 Run React Native App

Run the React Native app.

Run App

copy

```javascript
npx react-native run-ios
```

Expo Application

After adding the `react-native-razorpay` package, use the option to prebuild the app. This generates the **iOS** platform folders in the project to use native-modules.

Run

copy

```javascript
npx expo prebuild
```

The application is installed on the device/emulator.

javascript

copy

```javascript
npx expo run:[ios] --device
```

1.7 Coupon Handling

Since this is an SDK integration, Shopify coupons will not auto-apply like they do on the website. You must explicitly pass coupon codes to Magic Checkout. When initialising Magic Checkout, include the coupon code in the prefill options:

javascript

copy

```bash
curl -X POST https://api.razorpay.com/v1/magic/order/shopify?key_id=rzp_live_XXXXXX \
  -H "Content-Type: application/json" \
  -H "Accept: */*" \
  -H "Origin: https://api.razorpay.com" \
  -d '{
    "shopify_checkout_id": "gid://shopify/Cart/ashgad?key=abasab",
    "ga_id": "GA1.1.xxxxxxx.xxxxxxxx",
    "fb_analytics": {
      "external_id": "unique_fb_external_id",
      "fbp": "fb.1.xxxxxxx.xxxxxxxx",
      "fbc": "",
      "event_source_url": "https://your-store.com/"
    },
    "utm_parameters": {
      "landing_page_url": "https://your-store.com/",
      "user_agent": "Mozilla/5.0 (Linux; Android 12; SM-G991B)..."
    },
    "analytics": {
      "fb_analytics": {
        "external_id": "unique_fb_external_id",
        "fbp": "fb.1.xxxxxxx.xxxxxxxx",
        "fbc": ""
      },
      "ga4": {
        "session_ids": {
          "_ga_XXXXXXXXXX": "GS1.1.xxxxxxxx.x.x.x.x.x"
        },
        "client_id": "GA1.1.xxxxxxxx.xxxxxxxx"
      },
      "google_ads": {
        "gclid": "",
        "wbraid": "",
        "gbraid": ""
      },
      "source_url": "https://your-store.com/"
    }
  }'
```0

Your app captures the coupon applied on the cart page, then passes the coupon code in the `prefill.coupon_code` field. The SDK internally calls `applyCoupon('MY_COUPON_NAME')`, and if the coupon is valid, it is automatically applied in Magic Checkout.

1.8 Add Razorpay Checkout Options to .js File

To integrate the Razorpay Checkout with your React Native app, you must add the Checkout Display Options in the **.js** file.

Open the **.js** file in your project folder and perform the following:

1. Import the `RazorpayCheckout` module to your component.

   Import Razorpay Checkout Module

   copy

   ```bash
curl -X POST https://api.razorpay.com/v1/magic/order/shopify?key_id=rzp_live_XXXXXX \
  -H "Content-Type: application/json" \
  -H "Accept: */*" \
  -H "Origin: https://api.razorpay.com" \
  -d '{
    "shopify_checkout_id": "gid://shopify/Cart/ashgad?key=abasab",
    "ga_id": "GA1.1.xxxxxxx.xxxxxxxx",
    "fb_analytics": {
      "external_id": "unique_fb_external_id",
      "fbp": "fb.1.xxxxxxx.xxxxxxxx",
      "fbc": "",
      "event_source_url": "https://your-store.com/"
    },
    "utm_parameters": {
      "landing_page_url": "https://your-store.com/",
      "user_agent": "Mozilla/5.0 (Linux; Android 12; SM-G991B)..."
    },
    "analytics": {
      "fb_analytics": {
        "external_id": "unique_fb_external_id",
        "fbp": "fb.1.xxxxxxx.xxxxxxxx",
        "fbc": ""
      },
      "ga4": {
        "session_ids": {
          "_ga_XXXXXXXXXX": "GS1.1.xxxxxxxx.x.x.x.x.x"
        },
        "client_id": "GA1.1.xxxxxxxx.xxxxxxxx"
      },
      "google_ads": {
        "gclid": "",
        "wbraid": "",
        "gbraid": ""
      },
      "source_url": "https://your-store.com/"
    }
  }'
```1
2. Call the `RazorpayCheckout.open` method with the payment options. The method returns a JS Promise where the `then` part corresponds to a successful payment and the `catch` part corresponds to payment failure.

Checkout Options

copy

```bash
curl -X POST https://api.razorpay.com/v1/magic/order/shopify?key_id=rzp_live_XXXXXX \
  -H "Content-Type: application/json" \
  -H "Accept: */*" \
  -H "Origin: https://api.razorpay.com" \
  -d '{
    "shopify_checkout_id": "gid://shopify/Cart/ashgad?key=abasab",
    "ga_id": "GA1.1.xxxxxxx.xxxxxxxx",
    "fb_analytics": {
      "external_id": "unique_fb_external_id",
      "fbp": "fb.1.xxxxxxx.xxxxxxxx",
      "fbc": "",
      "event_source_url": "https://your-store.com/"
    },
    "utm_parameters": {
      "landing_page_url": "https://your-store.com/",
      "user_agent": "Mozilla/5.0 (Linux; Android 12; SM-G991B)..."
    },
    "analytics": {
      "fb_analytics": {
        "external_id": "unique_fb_external_id",
        "fbp": "fb.1.xxxxxxx.xxxxxxxx",
        "fbc": ""
      },
      "ga4": {
        "session_ids": {
          "_ga_XXXXXXXXXX": "GS1.1.xxxxxxxx.x.x.x.x.x"
        },
        "client_id": "GA1.1.xxxxxxxx.xxxxxxxx"
      },
      "google_ads": {
        "gclid": "",
        "wbraid": "",
        "gbraid": ""
      },
      "source_url": "https://your-store.com/"
    }
  }'
```2

Checkout Options

key

mandatory

`string` API key id generated from the Dashboard.

amount

mandatory

`integer` The amount to be paid by the customer in currency subunits. For example, if the amount is ₹500, enter `50000`.

currency

mandatory

`string` The currency in which the payment should be made by the customer. Length must be of 3 characters.

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

`string` Order id generated via [Orders API](/razorpay-docs-md/api/orders.md).

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
- `cod`

notes

optional

`object` Set of key-value pairs that can be used to store additional information about the payment. It can hold a maximum of 15 key-value pairs, each 256 characters long (maximum).

show\_coupons

optional

`boolean` Determines whether to show the coupons to customer on the checkout. Possible values:

- `true` (default): Enables the Coupon feature.
- `false`: Disables the Coupon feature.

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

`boolean` Used to set the `contact` field as read-only. Possible values:

- `true`: Customer will not be able to edit this field.
- `false` (default): Customer will be able to edit this field.

email

optional

`boolean` Used to set the `email` field as read-only. Possible values:

- `true`: Customer will not be able to edit this field.
- `false` (default): Customer will be able to edit this field.

name

optional

`boolean` Used to set the `name` field as read-only. Possible values:

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

You must pass these parameters in Checkout to initiate the payment.

1.8.1 Enable UPI Intent on iOS *(Optional)*

Provide your customers with a better payment experience by enabling UPI Intent on your app's Checkout form. In the UPI Intent flow:

1. Customer selects UPI as the payment method in your iOS app. A list of UPI apps supporting the intent flow is displayed. For example, PhonePe, Google Pay and Paytm.
2. Customer selects the preferred app. The UPI app opens with pre-populated payment details.
3. Customer enters their UPI PIN to complete their transactions.
4. Once the payment is successful, the customer is redirected to your app or website.

To enable this in your iOS integration, you must make the following changes in your app's info.plist file.

info.plist

copy

```bash
curl -X POST https://api.razorpay.com/v1/magic/order/shopify?key_id=rzp_live_XXXXXX \
  -H "Content-Type: application/json" \
  -H "Accept: */*" \
  -H "Origin: https://api.razorpay.com" \
  -d '{
    "shopify_checkout_id": "gid://shopify/Cart/ashgad?key=abasab",
    "ga_id": "GA1.1.xxxxxxx.xxxxxxxx",
    "fb_analytics": {
      "external_id": "unique_fb_external_id",
      "fbp": "fb.1.xxxxxxx.xxxxxxxx",
      "fbc": "",
      "event_source_url": "https://your-store.com/"
    },
    "utm_parameters": {
      "landing_page_url": "https://your-store.com/",
      "user_agent": "Mozilla/5.0 (Linux; Android 12; SM-G991B)..."
    },
    "analytics": {
      "fb_analytics": {
        "external_id": "unique_fb_external_id",
        "fbp": "fb.1.xxxxxxx.xxxxxxxx",
        "fbc": ""
      },
      "ga4": {
        "session_ids": {
          "_ga_XXXXXXXXXX": "GS1.1.xxxxxxxx.x.x.x.x.x"
        },
        "client_id": "GA1.1.xxxxxxxx.xxxxxxxx"
      },
      "google_ads": {
        "gclid": "",
        "wbraid": "",
        "gbraid": ""
      },
      "source_url": "https://your-store.com/"
    }
  }'
```3

Know more about [UPI Intent and its benefits](/razorpay-docs-md/payment-methods/upi/upi-intent.md).

1.9 Perform Post Payment Processing

Based on the response, you can handle post-payment processing on your end.

**Timeout Handling**

If no API call is made within 45 seconds, our background job will assume there is a network drop off and will proceed to place the order on Shopify automatically.

Fetch an Order

Use the Fetch Orders API to retrieve order details, including customer information, address, shipping method and promotions of a particular order:

GET

v1/orders/:id

CurlJavaPythonGoPHPRubyNode.js

copy

```bash
curl -X POST https://api.razorpay.com/v1/magic/order/shopify?key_id=rzp_live_XXXXXX \
  -H "Content-Type: application/json" \
  -H "Accept: */*" \
  -H "Origin: https://api.razorpay.com" \
  -d '{
    "shopify_checkout_id": "gid://shopify/Cart/ashgad?key=abasab",
    "ga_id": "GA1.1.xxxxxxx.xxxxxxxx",
    "fb_analytics": {
      "external_id": "unique_fb_external_id",
      "fbp": "fb.1.xxxxxxx.xxxxxxxx",
      "fbc": "",
      "event_source_url": "https://your-store.com/"
    },
    "utm_parameters": {
      "landing_page_url": "https://your-store.com/",
      "user_agent": "Mozilla/5.0 (Linux; Android 12; SM-G991B)..."
    },
    "analytics": {
      "fb_analytics": {
        "external_id": "unique_fb_external_id",
        "fbp": "fb.1.xxxxxxx.xxxxxxxx",
        "fbc": ""
      },
      "ga4": {
        "session_ids": {
          "_ga_XXXXXXXXXX": "GS1.1.xxxxxxxx.x.x.x.x.x"
        },
        "client_id": "GA1.1.xxxxxxxx.xxxxxxxx"
      },
      "google_ads": {
        "gclid": "",
        "wbraid": "",
        "gbraid": ""
      },
      "source_url": "https://your-store.com/"
    }
  }'
```4

Response: COD OrdersResponse: Prepaid Orders

copy

```bash
curl -X POST https://api.razorpay.com/v1/magic/order/shopify?key_id=rzp_live_XXXXXX \
  -H "Content-Type: application/json" \
  -H "Accept: */*" \
  -H "Origin: https://api.razorpay.com" \
  -d '{
    "shopify_checkout_id": "gid://shopify/Cart/ashgad?key=abasab",
    "ga_id": "GA1.1.xxxxxxx.xxxxxxxx",
    "fb_analytics": {
      "external_id": "unique_fb_external_id",
      "fbp": "fb.1.xxxxxxx.xxxxxxxx",
      "fbc": "",
      "event_source_url": "https://your-store.com/"
    },
    "utm_parameters": {
      "landing_page_url": "https://your-store.com/",
      "user_agent": "Mozilla/5.0 (Linux; Android 12; SM-G991B)..."
    },
    "analytics": {
      "fb_analytics": {
        "external_id": "unique_fb_external_id",
        "fbp": "fb.1.xxxxxxx.xxxxxxxx",
        "fbc": ""
      },
      "ga4": {
        "session_ids": {
          "_ga_XXXXXXXXXX": "GS1.1.xxxxxxxx.x.x.x.x.x"
        },
        "client_id": "GA1.1.xxxxxxxx.xxxxxxxx"
      },
      "google_ads": {
        "gclid": "",
        "wbraid": "",
        "gbraid": ""
      },
      "source_url": "https://your-store.com/"
    }
  }'
```5

Know more about the [Orders API.](/razorpay-docs-md/api/orders.md)

**Order Status**

Check the order status for the following:

- Prepaid orders: `paid`.
- COD orders: `placed`.

Path Parameter

id

mandatory

`string` Unique identifier of the order to be retrieved.

Response Parameters

id

`string` Unique identifier of the order. For example, `order_R1yDkxyIuKXXXX`.

entity

`string` Type of entity. Value is `order`.

amount

`integer` Total order amount in the smallest currency unit (paise).

amount\_paid

`integer` Amount paid towards the order in paise. For prepaid orders, this shows the actual amount paid. For COD orders, this is `0` until payment is collected.

amount\_due

`integer` Outstanding amount due in paise. For prepaid orders, this shows any remaining balance. For COD orders, this equals the `amount` field until payment is collected.

currency

`string` The 3-letter ISO currency code. For example, `INR`.

receipt

`string` Receipt identifier for internal reference. For example, `#30567`.

offers

`array` Array of offer IDs applied to the order.

status

`string` Current status of the order. Possible values:

- `placed`: Order placed but payment pending (COD orders).
- `paid`: Order placed and payment completed (prepaid orders).
- `cancelled`: Order cancelled.
- `refunded`: Order refunded.

attempts

`integer` Number of payment attempts made for this order. For example, `1`.

notes

`object` Custom notes added to the order containing integration-specific data.

cart\_id

`string` Shopping cart identifier.

storefront\_id

`string` Storefront system identifier.

shopify\_order\_id

`string` Shopify order reference.

flits\_cart\_token

`string` Flits integration token (optional).

created\_at

`integer` Unix timestamp indicating when the order was created. For example, `1756045901`.

description

`string|null` Order description. Returns `null` if no description is provided.

checkout

`string|null` Checkout identifier. Returns `null` if not applicable.

promotions

`array` Array of promotion objects applied to the order.

code

`string` Promotion code used. For example, `orderOff`.

type

`string` Type of promotion. For example, `cart_value`.

value

`integer` Discount value in paise. For example, `10000` for ₹100.

description

`string` Human-readable promotion description.

reference\_id

`string` Internal reference for the promotion.

cod\_fee

`integer` Cash on Delivery charges in paise. For COD orders, this contains the fee amount (for example, `5000` for ₹50). For prepaid orders, this is `0`.

shipping\_fee

`integer` Shipping charges in paise. For example, `700` for ₹7.

customer\_details

`object` Customer information.

contact

`string` Customer's phone number.

email

`string` Customer's email address.

shipping\_address

`object` Complete shipping address information.

city

`string` City name.

contact

`string` Contact number for delivery.

country

`string` Country code. For example, `in`.

id

`string` Address identifier (optional).

line1

`string` Address line 1.

line2

`string` Address line 2.

name

`string` Recipient name.

state

`string` State name.

tag

`string` Address tag. For example, `Home`.

type

`string` Address type. Value is `shipping_address`.

zipcode

`string` Postal code.

billing\_address

`object` Complete billing address information.

city

`string` City name.

contact

`string` Contact number for billing.

country

`string` Country code. For example, `in`.

id

`string` Address identifier (optional).

line1

`string` Address line 1.

line2

`string` Address line 2.

name

`string` Account holder name.

state

`string` State name.

tag

`string` Address tag. For example, `Home`.

type

`string` Address type. Value is `billing_address`.

zipcode

`string` Postal code.

line\_items\_total

`integer` Total value of line items in paise before adding shipping fees and COD fees, after applying promotions. For example, `60000` for ₹600.

tax\_details

`object` Tax information.

total\_tax

`integer` Total tax amount in paise. For example, `4128`.

taxes\_included

`boolean` Indicates whether taxes are included in the item prices. Possible values:

- `true`: Taxes are included in item prices.
- `false`: Taxes are separate from item prices.

Fetch a Payment

Use the Fetch Payments API to retrieve comprehensive payment details, including transaction status, payment method, customer information, settlement details, and the associated order information for a specific payment:

GET

v1/payments/:id

CurlJavaPythonGoPHPRubyNode.js.NET

copy

```bash
curl -X POST https://api.razorpay.com/v1/magic/order/shopify?key_id=rzp_live_XXXXXX \
  -H "Content-Type: application/json" \
  -H "Accept: */*" \
  -H "Origin: https://api.razorpay.com" \
  -d '{
    "shopify_checkout_id": "gid://shopify/Cart/ashgad?key=abasab",
    "ga_id": "GA1.1.xxxxxxx.xxxxxxxx",
    "fb_analytics": {
      "external_id": "unique_fb_external_id",
      "fbp": "fb.1.xxxxxxx.xxxxxxxx",
      "fbc": "",
      "event_source_url": "https://your-store.com/"
    },
    "utm_parameters": {
      "landing_page_url": "https://your-store.com/",
      "user_agent": "Mozilla/5.0 (Linux; Android 12; SM-G991B)..."
    },
    "analytics": {
      "fb_analytics": {
        "external_id": "unique_fb_external_id",
        "fbp": "fb.1.xxxxxxx.xxxxxxxx",
        "fbc": ""
      },
      "ga4": {
        "session_ids": {
          "_ga_XXXXXXXXXX": "GS1.1.xxxxxxxx.x.x.x.x.x"
        },
        "client_id": "GA1.1.xxxxxxxx.xxxxxxxx"
      },
      "google_ads": {
        "gclid": "",
        "wbraid": "",
        "gbraid": ""
      },
      "source_url": "https://your-store.com/"
    }
  }'
```6

Response: COD OrdersResponse: Prepaid Orders

copy

```bash
curl -X POST https://api.razorpay.com/v1/magic/order/shopify?key_id=rzp_live_XXXXXX \
  -H "Content-Type: application/json" \
  -H "Accept: */*" \
  -H "Origin: https://api.razorpay.com" \
  -d '{
    "shopify_checkout_id": "gid://shopify/Cart/ashgad?key=abasab",
    "ga_id": "GA1.1.xxxxxxx.xxxxxxxx",
    "fb_analytics": {
      "external_id": "unique_fb_external_id",
      "fbp": "fb.1.xxxxxxx.xxxxxxxx",
      "fbc": "",
      "event_source_url": "https://your-store.com/"
    },
    "utm_parameters": {
      "landing_page_url": "https://your-store.com/",
      "user_agent": "Mozilla/5.0 (Linux; Android 12; SM-G991B)..."
    },
    "analytics": {
      "fb_analytics": {
        "external_id": "unique_fb_external_id",
        "fbp": "fb.1.xxxxxxx.xxxxxxxx",
        "fbc": ""
      },
      "ga4": {
        "session_ids": {
          "_ga_XXXXXXXXXX": "GS1.1.xxxxxxxx.x.x.x.x.x"
        },
        "client_id": "GA1.1.xxxxxxxx.xxxxxxxx"
      },
      "google_ads": {
        "gclid": "",
        "wbraid": "",
        "gbraid": ""
      },
      "source_url": "https://your-store.com/"
    }
  }'
```7

Know more about the [Payments API](/razorpay-docs-md/api/payments.md).

Path Parameter

id

mandatory

`string` Unique identifier of the payment to be retrieved.

Response Parameters

id

`string` Unique identifier of the payment. For example, `pay_R1yFlWQar3XXXX`.

entity

`string` Type of entity. Value is `payment`.

amount

`integer` Payment amount in the smallest currency unit (paise). For COD payments, this includes the COD fee (for example, `55700` for ₹557). For prepaid payments, this equals the captured amount (for example, `90630` for ₹906.30).

currency

`string` The 3-letter ISO currency code. For example, `INR`.

status

`string` Current status of the payment. Possible values:

- `pending`: Payment pending collection (COD orders).
- `captured`: Payment successfully captured (prepaid orders).
- `authorized`: Payment authorized but not captured.
- `failed`: Payment attempt failed.

order\_id

`string` Unique identifier of the associated order. For example, `order_R1yDkxyIuKXXXX`.

invoice\_id

`string|null` Unique identifier of the associated invoice. Returns `null` if no invoice is linked.

international

`boolean` Indicates whether this is an international payment. Possible values:

- `true`: International payment.
- `false`: Domestic payment.

method

`string` Payment method used. Possible values include:

- `cod`
- `upi`
- `card`
- `netbanking`
- `wallet`

amount\_refunded

`integer` Amount refunded in paise. For example, `0` indicates no refund has been processed.

refund\_status

`string|null` Current refund status. Returns `null` if no refund is applicable. Possible values:

- `partial`: Partial refund processed.
- `full`: Full refund processed.

captured

`boolean` Indicates whether the payment has been captured. Possible values:

- `true`: Payment has been captured.
- `false`: Payment has not been captured.

description

`string|null` Payment description. Returns `null` if no description is provided.

card\_id

`string|null` Unique identifier of the card used for payment. Returns `null` for non-card payments.

bank

`string|null` Bank identifier for netbanking payments. Returns `null` for other payment methods.

wallet

`string|null` Wallet provider identifier. Returns `null` for non-wallet payments.

vpa

`string|null` Virtual Payment Address for UPI payments. For example, `gaurav.kumar@exampleupi`. Returns `null` for non-UPI payments.

email

`string` Customer's email address.

contact

`string` Customer's phone number.

notes

`object` Custom notes added to the payment containing integration-specific data.

cart\_id

`string` Shopping cart identifier.

storefront\_id

`string` Storefront system identifier.

flits\_cart\_token

`string` Flits integration token (optional).

optimizer\_provider\_name

`string` Payment optimizer provider name (optional).

fee

`integer|null` Processing fee charged in paise. For example, `0` indicates no fee. Returns `null` for COD payments.

tax

`integer|null` Tax amount on processing fee in paise. For example, `0` indicates no tax. Returns `null` for COD payments.

error\_code

`string|null` Error code if payment failed. Returns `null` for successful payments.

error\_description

`string|null` Human-readable error description. Returns `null` for successful payments.

error\_source

`string|null` Source of the error. Returns `null` for successful payments.

error\_step

`string|null` Step at which error occurred. Returns `null` for successful payments.

error\_reason

`string|null` Reason for the error. Returns `null` for successful payments.

acquirer\_data

`object` Data from the payment acquirer.

rrn

`string` Retrieval Reference Number from the acquirer (optional).

upi\_transaction\_id

`string` UPI transaction identifier from the acquirer (optional).

created\_at

`integer` Unix timestamp indicating when the payment was created. For example, `1756046099`.

receiver\_type

`string|null` Type of receiver for the payment. Returns `null` if not applicable.

upi

`object` UPI-specific payment details (only present for UPI payments).

vpa

`string` Virtual Payment Address used for the UPI payment.

1.10 Complete Checkout Call

After a successful payment, call the complete checkout API to create the order in Shopify. You must make the call from the callback handler implemented when importing the react SDK. Ensure you redirect the user to the `order_status_url` to show them the order success page on Shopify.

POST

/1cc/shopify/complete?key\_id=rzp\_live\_XXXXXX

RequestResponse

copy

```bash
curl -X POST https://api.razorpay.com/v1/magic/order/shopify?key_id=rzp_live_XXXXXX \
  -H "Content-Type: application/json" \
  -H "Accept: */*" \
  -H "Origin: https://api.razorpay.com" \
  -d '{
    "shopify_checkout_id": "gid://shopify/Cart/ashgad?key=abasab",
    "ga_id": "GA1.1.xxxxxxx.xxxxxxxx",
    "fb_analytics": {
      "external_id": "unique_fb_external_id",
      "fbp": "fb.1.xxxxxxx.xxxxxxxx",
      "fbc": "",
      "event_source_url": "https://your-store.com/"
    },
    "utm_parameters": {
      "landing_page_url": "https://your-store.com/",
      "user_agent": "Mozilla/5.0 (Linux; Android 12; SM-G991B)..."
    },
    "analytics": {
      "fb_analytics": {
        "external_id": "unique_fb_external_id",
        "fbp": "fb.1.xxxxxxx.xxxxxxxx",
        "fbc": ""
      },
      "ga4": {
        "session_ids": {
          "_ga_XXXXXXXXXX": "GS1.1.xxxxxxxx.x.x.x.x.x"
        },
        "client_id": "GA1.1.xxxxxxxx.xxxxxxxx"
      },
      "google_ads": {
        "gclid": "",
        "wbraid": "",
        "gbraid": ""
      },
      "source_url": "https://your-store.com/"
    }
  }'
```8

Request Parameters

razorpay\_payment\_id

mandatory

`string` Unique payment identifier. Format: `pay_` followed by 14 characters.

razorpay\_order\_id

mandatory

`string` Unique order identifier from Step 1.2. Format: `order_` followed by 14 characters.

Response Parameters

id

`integer` Unique Shopify order identifier. For example, `65157213390123`.

order\_id

`string` Human-readable order number. For example, `#32697`.

payment\_id

`string` Razorpay payment identifier. For example, `pay_Rk3b76fSqXXXXX`.

payment\_method

`string` Payment method used. Possible values include:

- `netbanking`
- `upi`
- `card`
- `wallet`

payment\_currency

`string` The 3-letter ISO currency code. For example, `INR`.

total\_amount

`integer` Total order amount in smallest currency unit (paise). For example, `659430` for ₹6594.30.

total\_tax

`string` Total tax amount as string. For example, `543.91`.

shipping\_fee

`integer` Shipping charges in smallest currency unit (paise). For example, `700` for ₹7.

cod\_fee

`integer` Cash on Delivery fee in smallest currency unit (paise). For example, `0` indicates no COD fee.

promotions

`array` Array of applied promotions/discounts.

reference\_id

`string` Internal reference for the promotion.

code

`string` Promotion code used.

type

`string` Type of promotion. Possible values:

- `automatic`: Automatically applied discount.
- `coupon`: Coupon-based discount.

value

`integer` Discount value in smallest currency unit (paise). For example, `100000` for ₹1000.

source

`string` Source of the promotion. For example, `shopify`.

shipping\_country

`string` Country code for shipping destination. For example, `in`.

customer\_details

`object` Complete customer information.

email

`string` Customer's email address.

contact

`string` Customer's phone number.

shipping\_address

`object` Complete shipping address information.

name

`string` Recipient name.

line1

`string` Address line 1.

city

`string` City name.

state

`string` State name.

zipcode

`string` Postal code.

country

`string` Country code. For example, `in`.

order\_status\_url

`string` Shopify order status page URL for customer.

is\_new\_customer

`boolean` Whether this is a new customer's first order. Possible values:

- `true`: New customer's first order.
- `false`: Existing customer order.

#### Pass Additional Attributes to Shopify Orders

Shopify orders support Tags and Additional Attributes (note attributes). Include the attributes in the Shopify cart's attributes object before initiating checkout:

javascript

copy

```bash
curl -X POST https://api.razorpay.com/v1/magic/order/shopify?key_id=rzp_live_XXXXXX \
  -H "Content-Type: application/json" \
  -H "Accept: */*" \
  -H "Origin: https://api.razorpay.com" \
  -d '{
    "shopify_checkout_id": "gid://shopify/Cart/ashgad?key=abasab",
    "ga_id": "GA1.1.xxxxxxx.xxxxxxxx",
    "fb_analytics": {
      "external_id": "unique_fb_external_id",
      "fbp": "fb.1.xxxxxxx.xxxxxxxx",
      "fbc": "",
      "event_source_url": "https://your-store.com/"
    },
    "utm_parameters": {
      "landing_page_url": "https://your-store.com/",
      "user_agent": "Mozilla/5.0 (Linux; Android 12; SM-G991B)..."
    },
    "analytics": {
      "fb_analytics": {
        "external_id": "unique_fb_external_id",
        "fbp": "fb.1.xxxxxxx.xxxxxxxx",
        "fbc": ""
      },
      "ga4": {
        "session_ids": {
          "_ga_XXXXXXXXXX": "GS1.1.xxxxxxxx.x.x.x.x.x"
        },
        "client_id": "GA1.1.xxxxxxxx.xxxxxxxx"
      },
      "google_ads": {
        "gclid": "",
        "wbraid": "",
        "gbraid": ""
      },
      "source_url": "https://your-store.com/"
    }
  }'
```9

These attributes will flow through to the Shopify order and appear in the additional attributes section in Shopify Admin.

## 2. Test Integration

Check the following checklist below:

- Shopify cart creation is working correctly.
- Checkout id is generated successfully.
- Order id is created with analytics parameters.
- Magic Checkout SDK opens without errors.
- Coupons apply correctly via prefill.
- Payment flow completes successfully.
- Complete Checkout API creates order in Shopify.
- Order appears in Shopify Admin with correct details.
- Additional attributes appear correctly in Shopify order.

## Error Handling

**Fallback to Shopify Checkout**

If any Magic Checkout API fails, redirect users to the standard Shopify checkout to ensure customers can still complete their purchase.

## Support

For integration support, reach out to your Razorpay account manager or raise a request with our [support team](https://razorpay.com/support/#request).
