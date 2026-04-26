<!-- Source: https://razorpay.com/docs/payments/magic-checkout/shopify/custom/web-integration-nextjs -->

Follow these steps to integrate the Razorpay Magic Checkout on your React (Next.JS) Website when using Shopify as your e-commerce platform. This integration treats the platform as Shopify while using a custom frontend, allowing unified order management in Shopify admin.

## Prerequisites

- Ensure you enable [Magic Checkout](/razorpay-docs-md/magic-checkout/troubleshooting-faqs.md#3-how-do-i-check-if-magic-checkout)

  on your account.
- Integrate [Magic Checkout With Shopify Store](/razorpay-docs-md/magic-checkout/shopify.md)  .
- Generate [Live API Keys](/razorpay-docs-md/dashboard/account-settings.md#api-keys)

  from the Dashboard.

#### 1. Build Integration

Integrate with React (Next.JS) Website for Shopify.

#### 2. Test Integration

Test the integration by making a test payment.

## 1. Build Integration

Follow the steps given below:

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

Create a Razorpay order id required for the payment modal. This API requires the `shopify_checkout_id` from [Step 1.1](/razorpay-docs-md/magic-checkout/shopify/custom/web-integration-nextjs.md#11-create-a-checkout-id).

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
      "user_agent": "Mozilla/5.0 (Linux; Android 12; SM-G991B)...",
      "utm_campaign": "feeding_bottle_sp",
      "utm_content": "ct", 
      "utm_medium": "product_sync",
      "utm_source": "google"
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

`string` Checkout id from [Step 1.1](/razorpay-docs-md/magic-checkout/shopify/custom/web-integration-nextjs.md#11-create-a-checkout-id).

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

1.3 Integrate Magic Checkout Web SDK

After successfully creating the order id, integrate the Magic Checkout Web SDK to display the payment interface and handle the checkout process.

1.3.1 Load the Magic Checkout Script

You can add the Razorpay Magic Checkout script to your Next.JS application in two ways:

Using next/script (Recommended)

Dynamic Loading in Component

JavaScript

copy

```javascript
// In your _app.js or specific page component
import Script from 'next/script';

export default function App({ Component, pageProps }) {
return (
    <>
    <Script 
        src="https://checkout.razorpay.com/v1/magic-checkout.js"
        strategy="lazyOnload"
    />
    <Component {...pageProps} />
    </>
);
}
```

1.3.2 Initialise and Open Magic Checkout

Create a function to initialise Magic Checkout with the required configuration options and open the payment modal.

Checkout Options

copy

```javascript
const openMagicCheckout = () => {
  const options = {
    key: 'rzp_live_XXXXXX', // Enter the Key id generated from the Dashboard
    name: 'Acme Corp', // Your business name
    order_id: 'order_EKwxwAgItmmXdp', // Order id from Step 2
    show_coupons: true, // default true; false if coupon widget should be hidden
    prefill: {
      name: 'Gaurav Kumar',
      email: 'gauravkumar@example.com',
      contact: '9000090000',
      coupon_code: 'MY_COUPON_20', // Coupon from your cart to auto-apply
    },
    handler: function (response) {
      // Handle successful payment
      // response.razorpay_payment_id
      // response.razorpay_order_id
      // response.razorpay_signature
      
      // Call Complete Checkout API (Step 5)
      completeCheckout(response);
    },
    modal: {
      ondismiss: function () {
        // Handle checkout modal close
        console.log('Checkout modal closed');
      },
    },
  };
  const rzp = new window.Razorpay(options);
  rzp.open();
};
```

Checkout Options

You must pass these parameters in Checkout to initiate the payment.

key

mandatory

`string` API Key id generated from the Razorpay Dashboard.

name

mandatory

`string` Your business name shown on the Checkout form. For example, **Your Store Name**.

order\_id

mandatory

`string` Order id from [Step 1.2](/razorpay-docs-md/magic-checkout/shopify/custom/web-integration-nextjs.md#12-create-order-id-on-server).

show\_coupons

optional

`boolean` Determines whether to show coupons to customer on checkout. Possible values:

- `true` (default): Enables the Coupon feature.
- `false`: Disables the Coupon feature.

prefill

optional

`object` You can prefill the following details at Checkout.

name

optional

`string` Customer's name to be prefilled. For example, **Customer Name**.

email

optional

`string` Customer's email address.

contact

optional

`string` Customer's phone number. The expected format is `+ {country code}{phone number}`. If country code is not specified, `91` will be used as default.

coupon\_code

optional

`string` Coupon code from your cart to auto-apply during checkout.

handler

mandatory

`function` Function called on successful payment. Returns payment response with `razorpay_payment_id`, `razorpay_order_id` and `razorpay_signature`.

**Watch Out!**

Ensure you handle the payment response in the `handler` function and call the Complete Checkout API to finalise the order in Shopify.

**Watch Out!**

To support theme colour in the progress bar, please pass HEX colour values only.

1.4 Coupon Handling

Since this is an SDK integration, Shopify coupons will not auto-apply like they do on the website. You must explicitly pass coupon codes to Magic Checkout. When initialising Magic Checkout, include the coupon code in the prefill options:

javascript

copy

```javascript
const options = {
key: 'rzp_live_XXXXXX',
order_id: 'order_EKwxwAgItmmXdp',
// ... other options

prefill: {
    coupon_code: 'MY_COUPON_NAME',  // Coupon from your cart to auto-apply
},
};

// Initialise Magic Checkout with options
MagicCheckout.open(options);
```

Your app captures the coupon applied on the cart page, then passes the coupon code in the `prefill.coupon_code` field. The SDK internally calls `applyCoupon('MY_COUPON_NAME')` and if the coupon is valid, it is automatically applied in Magic Checkout.

1.5 Complete Checkout Call

After a successful payment, call the complete checkout API to create the order in Shopify. You must make the call from the callback handler implemented when importing the React SDK. Ensure you redirect the user to the `order_status_url` to show them the order success page on Shopify.

POST

/1cc/shopify/complete?key\_id=rzp\_live\_XXXXXX

RequestResponse

copy

```bash
curl -X POST https://api.razorpay.com/v1/1cc/shopify/complete?key_id=rzp_live_XXXXXX \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "razorpay_payment_id": "pay_Rk3b76fSqXXXXX",
    "razorpay_order_id": "order_Rk3UmCXXW5XXXX"
  }'
```

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

```javascript
// When creating/updating Shopify cart
const cartPayload = {
  cart: {
    token: "your_cart_token",
    note: "Customer special instructions",
    attributes: {
      "Source": "Mobile App",
      "App Version": "2.1.0",
      "Campaign": "Summer Sale 2025",
      "Custom Field": "Your custom value"
    },
    item_count: 1,
    items: [/* ... */]
  },
  key: "rzp_live_XXXXXX"
};
```

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
