<!-- Source: https://razorpay.com/docs/payments/magic-checkout/flutter-integration -->

Follow these steps to integrate the Razorpay Magic Checkout on your Flutter application.

#### Prerequisites

- Create a Razorpay account.
- Generate [API Keys](/razorpay-docs-md/dashboard/account-settings.md#api-keys)

  from the Dashboard. To go live with the integration and start accepting real payments, generate Live Mode API Keys and replace them in the integration.

#### 1. Build Integration

Integrate with Flutter App.

#### 2. Test Integration

Test the integration by making a test payment.

#### 3. Go-live Checklist

Check the go-live checklist.

## 1. Build Integration

1.1 Enable/Disable Magic Checkout and Cash on Delivery

Enable Magic Checkout

Enable Cash on Delivery Payment Method

Raise a request with your Razorpay SPOC to get this feature enabled on your account.
Once this feature is enabled, the customer address saving and coupon features are enabled.

1.2 Create Promotions and Shipping Info API Endpoints

Follow the steps given below to create promotions and shipping info API endpoints:

**Watch Out!**

Ensure that the URLs are publicly accessible, require no authentication and are hosted on your server.

1. Log in to the Dashboard and navigate to **Magic Checkout**.
2. In the **Platform Setup**, select **Custom E-Commerce Platform** from the drop-down list and click **Next**.

   ![Choose custom platform](https://razorpay.com/docs/payments/magic-checkout/build/browser/assets/images/magic-custom-platform.jpg)
3. In the **Setup & Settings** section, click **Checkout Settings**.
4. In the **Coupon Settings** section, enter the following:
   1. **URL for get promotions**: The API URL should return a list of promotions applicable to the specified `order_id` and customer. Magic Checkout uses this endpoint to fetch these promotions from your server and display them to your customers in the checkout modal.
   2. **URL for apply promotions**: The API URL validates the promotion code applied by the customer and should return the discount amount. Magic Checkout uses this endpoint to apply promotions via your server.
5. Click **Save settings**.

   ![Add promotion URLs](https://razorpay.com/docs/payments/magic-checkout/build/browser/assets/images/magic-web-promo-url.jpg)
6. Navigate to **Shipping Setup**.
7. Select **API** as the Shipping Service type from the drop-down list.
8. Enter the **URL for shipping info**. The API URL should return shipping serviceability, COD serviceability, shipping fees and COD fees for a given list of customer addresses. Magic Checkout uses this endpoint to retrieve shipping information from your server.
9. Click **Save Settings**.

   ![Add shipping URL](https://razorpay.com/docs/payments/magic-checkout/build/browser/assets/images/magic-web-shipping-url.jpg)

1.3 Install Razorpay Flutter Plugin [Download the plugin](https://pub.dev/packages/razorpay_flutter) from Pub.dev.

Add the below code to `dependencies` in your app's `pubspec.yaml`

Add Dependencies

copy

```yml
razorpay_flutter: 1.4.0
```

Add Proguard Rules (Android Only)

If you are using Proguard for your builds, you need to add the following lines to the Proguard files:

Add Proguard Rules

copy

```java
-keepattributes *Annotation*
-dontwarn com.razorpay.**
-keep class com.razorpay.** {*;}
-optimizations !method/inlining/
-keepclasseswithmembers class * {
 public void onPayment*(...);
}
```

Know more about [Proguard rules](https://github.com/razorpay/razorpay-flutter/issues/42#issuecomment-550161626).

Get Packages

Run `flutter packages get` in the root directory of your app.

**Minimum Version Requirement**

- For **Android**, ensure that the minimum API level for your app is 19 or higher.
- For **iOS**, ensure that the minimum deployment target for your app is iOS 10.0 or higher. Also, do not forget to enable bitcode for your project.

1.4 Import Package and Create Razorpay Instance

Use the below code to import the `razorpay_flutter.dart` file to your project.

Import Package

copy

```yml
import 'package:razorpay_flutter/razorpay_flutter.dart';
```

Use the below code to create a Razorpay instance.

Instantiate

copy

```yml
_razorpay = Razorpay();
```

1.5 Attach Event Listeners

The plugin uses event-based communication and emits events when payments fail or succeed.

The event names are exposed via the constants `EVENT_PAYMENT_SUCCESS`, `EVENT_PAYMENT_ERROR` and `EVENT_EXTERNAL_WALLET` from the `Razorpay` class.

Use the `on(String event, Function handler)` method on the `Razorpay` instance to attach event listeners.

Attach Event Listeners

copy

```yml
_razorpay.on(Razorpay.EVENT_PAYMENT_SUCCESS, _handlePaymentSuccess);
_razorpay.on(Razorpay.EVENT_PAYMENT_ERROR, _handlePaymentError);
_razorpay.on(Razorpay.EVENT_EXTERNAL_WALLET, _handleExternalWallet);
```

The handlers would be defined in the class as:

Handlers

copy

```yml
void _handlePaymentSuccess(PaymentSuccessResponse response) {
  // Do something when payment succeeds
}

void _handlePaymentError(PaymentFailureResponse response) {
  // Do something when payment fails
}

void _handleExternalWallet(ExternalWalletResponse response) {
  // Do something when an external wallet is selected
}
```

To clear event listeners, use the `clear` method on the `Razorpay` instance.

Clear Event Listeners

copy

```yml
_razorpay.clear(); // Removes all listeners
```

1.6 Create an Order

You can create an order using the following API and send the additional information required for Magic Checkout. Pass the `order_id` received in response to the checkout code.

CurlJavaPythonGoPHPRubyNode.js.Net

copy

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X POST https://api.razorpay.com/v1/orders \
-H "content-type: application/json" \
-d '{
  "amount": 50000,
  "currency": "INR",
  "receipt": "receipt#1",
  "line_items_total": 50000,  // Mandatory for Magic Checkout
  "line_items": [
    {
      "sku": "1g234",
      "variant_id": "12r34",
      "price": 50000,
      "offer_price": 50000,
      "quantity": 1,
      "name": "Product Name"
      // ... other line item details
    }
  ]
}'
```

Response

copy

```json
{
  "id": "order_EKwxwAgItmmXdp",
  "entity": "order",
  "amount": 50000,
  "amount_paid": 0,
  "amount_due": 50000,
  "currency": "INR",
  "receipt": "receipt#1",
  "offer_id": null,
  "status": "created",
  "attempts": 0,
  "notes": [],
  "created_at": 1582628071,
  "line_items_total": 50000
}
```

Request Parameters

amount

mandatory

`integer` The transaction amount, expressed in the currency subunit, such as paise (in case of INR). For example, for an actual amount of ₹299.35, the value of this field should be `29935`.

currency

mandatory

`string` The currency in which the transaction should be made. See the [list of supported currencies](/razorpay-docs-md/international-payments.md#supported-currencies). Default is `INR`. Length must be of 3 characters.

receipt

mandatory

`string` Your receipt id for this order should be passed here. Maximum length of 40 characters.

notes

optional

`object` Key-value pair that can be used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty"`.

line\_items\_total

mandatory

`integer` Total of `offer_price` for all line items added to the cart, in paise. For example, if a shoe worth ₹8,000 and a shirt worth ₹10,000 are added, the `line_item_total` will be `1800000`. This amount is post-tax.

**Watch Out!**

To ensure the order is considered as a Magic Checkout order, you must pass this parameter. Otherwise, it will default to Standard Checkout order and customers will view the Standard Checkout UI instead of Magic Checkout. Know more about [Razorpay Standard Checkout](/razorpay-docs-md/payment-gateway/web-integration/standard.md).

line\_items

mandatory

`array` This will have the details about the specific items added to the cart.

sku

mandatory

`string` Unique product id defined by you. It can be alphanumeric.

variant\_id

mandatory

`string` Unique variant id defined by you. It can be alphanumeric.

price

mandatory

`integer` Price of the product in paise.

offer\_price

mandatory

`integer` Final price charged to the customer in paise, after applying any adjustments, such as product discounts.

**Handy Tips**

If no discount is applied, `price` and `offer_price` will be the same.

quantity

mandatory

`integer` Number of units added in the cart.

name

mandatory

`string` Name of the product.

description

mandatory

`string` Description of the product.

weight

optional

`integer` Weight of the product in grams.

dimensions

optional

`object` The dimensions of the product.

length

optional

`string` The length of the product in centimeters.

width

optional

`string` The width of the product in centimeters.

height

optional

`string` The height of the product in centimeters.

image\_url

mandatory

`string` The URL of the product image. This parameter is mandatory if you want to display product images on our iframe.

product\_url

optional

`string` URL of the product's listing page.

notes

optional

`object` Key-value pair that can be used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty"`.

Response Parameters

id

`string` The unique identifier of the order.

amount

`integer` Payment amount in the smallest currency sub-unit. For example, if the amount to be charged is ₹299, then pass `29900` in this field.

partial\_payment

`boolean` Indicates whether the customer can make a partial payment. Possible values:

- `true`: The customer can make partial payments.
- `false` (default): The customer cannot make partial payments.

amount\_paid

`integer` The amount paid against the order.

amount\_due

`integer` The amount pending against the order.

currency

`string` ISO code for the currency in which you want to accept the payment. The default length is 3 characters.

receipt

`string` Receipt number that corresponds to this order. Can have a maximum length of 40 characters and has to be unique.

status

`string` The status of the order. Possible values:

- `created`: When you create an order it is in the `created` state. It stays in this state till a payment is attempted on it.
- `attempted`: An order moves from `created` to `attempted` state when a payment is first attempted on it. It remains in the `attempted` state till one payment associated with that order is captured.
- `paid`: After the successful capture of the payment, the order moves to the `paid` state. No further payment requests are permitted once the order moves to the `paid` state. The order stays in the `paid` state even if the payment associated with the order is refunded.

attempts

`integer` The number of payment attempts, successful and failed, that have been made against this order.

notes

`json object` Key-value pair that can be used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty"`.

created\_at

`integer` Indicates the Unix timestamp when this order was created.

line\_items\_total

`integer` Total of `offer_price` for all line items added to the cart, in paise.

Error Response Parameters

The error response parameters are available in the [API Reference Guide](/razorpay-docs-md/api/orders/create.md).

Pre-discount Handling

Line items total should equal the sum of individual item prices after your discounts are applied. When applying discounts, reduce both `amount` and `line_items_total` by the same amount:

Example

copy

```json
{
  "amount": 45000,           // ₹500 - ₹50 discount = ₹450
  "line_items_total": 45000, // Must match the discounted amount
  "currency": "INR",
  "receipt": "receipt#1",
  "notes": {
    "prediscount_applied": "5000"  // Track discount in paise
  },
  "line_items": [
    // ... your line items with original prices
  ]
}
```

**Handy Tips**

Magic Checkout automatically handles all discount calculations on the UI. The system detects differences in checkout amounts and adjusts accordingly.

1.7 Interact with Shipping Info API

This API should return shipping serviceability, COD serviceability, shipping fees and COD fees for a given list of customer addresses.

POST

/your-server-url/shipping-info-api-path

RequestResponse

copy

```java
-keepattributes *Annotation*
-dontwarn com.razorpay.**
-keep class com.razorpay.** {*;}
-optimizations !method/inlining/
-keepclasseswithmembers class * {
 public void onPayment*(...);
}
```0

Request Parameters

order\_id

mandatory

`string` Unique identifier of the order created [previously](/razorpay-docs-md/magic-checkout/flutter-integration.md#16-create-an-order).

razorpay\_order\_id

mandatory

`string` Unique identifier for the order returned by Checkout.

email

optional

`string` Customer's email address.

contact

mandatory

`string` Customer's phone number.

addresses

mandatory

`array` Customer's address details.

id

mandatory

`string` Unique identifier of the customer's address.

zipcode

mandatory

`string` Customer's ZIP code.

state\_code

optional

`string` The code of the state where the customer resides.

country

mandatory

`string` Country where the customer resides. The length cannot exceed 2 characters.

Response Parameters

addresses

mandatory

`array` Customer's address details.

id

mandatory

`string` Unique identifier of the customer's address.

zipcode

mandatory

`string` Customer's ZIP code.

country

mandatory

`string` Country where the customer resides. The length cannot exceed 2 characters.

shipping\_methods

mandatory

`array` Details regarding the shipping methods.

id

mandatory

`string` Unique identifier of the shipping method.

description

`integer` Brief description of the shipping method.

name

mandatory

`string` Name of the shipping method.

serviceable

mandatory

`boolean` Indicates whether you deliver orders to the zipcode entered by the customer. This is based on the ZIP codes you have added in the serviceability setting on the Razorpay Dashboard. Possible values:

- `true`: Orders can be delivered to the added ZIP codes.
- `false`: Orders cannot be delivered to the added ZIP codes.

shipping\_fee

mandatory

`integer` Shipping charge in paise applicable to be paid by the customer.

cod

mandatory

`boolean` Indicates whether you support cash on delivery on this order.

- `true`: COD payment method is supported.
- `false`: COD payment method is not supported.

`cod_fee` *mandatory* : `integer` Cash on Delivery fee charged in paise. This amount is based on the COD settings configured in your Razorpay Dashboard.

**Handy Tips**

If the `cod` field is false, set the `cod_fee` field to 0.

1.8 Interact with Get Promotions API

This API should return the list of promotions applicable for the given `order_id` and customer.

POST

/your-server-url/create-promotions-api-path

RequestResponse

copy

```java
-keepattributes *Annotation*
-dontwarn com.razorpay.**
-keep class com.razorpay.** {*;}
-optimizations !method/inlining/
-keepclasseswithmembers class * {
 public void onPayment*(...);
}
```1

Request Parameters

order\_id

mandatory

`string` Unique identifier of the order created [previously](/razorpay-docs-md/magic-checkout/flutter-integration.md#16-create-an-order).

contact

optional

`string` Customer's phone number.

email

optional

`string` Customer's email address.

Response Parameters

promotions

mandatory

`array` Details of the promotions created.

code

mandatory

`string` Unique identifier of the promotion.

summary

mandatory

`string` Summary about the promotion. For example, 10% off on total cart value.

description

optional

`string` Brief description of the promotion. For example, 10% on total cart value upto ₹300.

1.8.1 Interact with Apply Promotions API

This API should validate the promotion code applied by the customer and return the discount amount.

POST

/your-server-url/create-promotions-api-path

RequestSuccess ResponseFailure Response

copy

```java
-keepattributes *Annotation*
-dontwarn com.razorpay.**
-keep class com.razorpay.** {*;}
-optimizations !method/inlining/
-keepclasseswithmembers class * {
 public void onPayment*(...);
}
```2

Request Parameters

order\_id

mandatory

`string` Unique identifier of the order created [previously](/razorpay-docs-md/magic-checkout/flutter-integration.md#16-create-an-order).

contact

optional

`string` Customer's phone number.

email

optional

`string` Customer's email address.

code

mandatory

`string` Promotion code used to avail discount on checkout.

Response Parameters

promotion

mandatory

`object` Used to pass all offer or discount-related information, including promotion code discount, method discount and so on.

reference\_id

mandatory

`string` Identifier of the offer you create.

code

optional

`string` Promotion code used to avail discount on checkout.

type

optional

`string` Type of offer. Possible values:

- `coupon`: A discount applied by customers during checkout. For example, customers can use a coupon like `Diwali Sale 500 Off` to get ₹500 off the total cart value.
- `offer`: A promotion you create for your customers. For example, you create an offer `Buy 4 t-shirts and get 2 free`. In this case, when customers add 4 t-shirts to their cart, the 2 additional t-shirts will be automatically added for free.

value

optional

`integer` The offer value that needs to be applied in paise. For example, if you want to offer a discount of ₹500, enter 50000.

value\_type

optional

`string` The type of value like:

- `fixed_amount`: A fixed amount discount value in the currency of the order. For example, ₹500.
- `percentage`: A percentage discount value. For example, 10%.
- `BXGY`: Buy X and Get Y. For example, if you buy 2 t-shirts, you a get a cap for free or at a discounted value.

  **Handy Tips**

  Regardless of the `value_type`, the amount specified in the `value` parameter is applied as-is. For example, if `value_type` is percentage and the `value` is 5000, 5000 is considered in currency subunits (paise).

description

optional

`string` Description of the promotion applied. For example, `New Year Sale Offer`.

Error Code, Description and Next Steps

1.9 Add Checkout Options

Pass the Checkout options. Ensure that you pass the `order_id` that you received in the response of the previous step.

Checkout Options

copy

```java
-keepattributes *Annotation*
-dontwarn com.razorpay.**
-keep class com.razorpay.** {*;}
-optimizations !method/inlining/
-keepclasseswithmembers class * {
 public void onPayment*(...);
}
```3

Checkout Options

You must pass these parameters in Checkout to initiate the payment.

key

mandatory

`string` API Key ID generated from the Dashboard.

amount

mandatory

`integer` Payment amount in the smallest currency subunit. For example, if the amount to be charged is ₹2,222.50, enter `222250` in this field. In the case of three decimal currencies, such as KWD, BHD and OMR, to accept a payment of 295.991, pass the value as 295990. And in the case of zero decimal currencies such as JPY, to accept a payment of 295, pass the value as 295.

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

`object` Parameters that enable checkout configuration. Know more about how to [configure payment methods on Razorpay standard checkout](/razorpay-docs-md/payment-gateway/web-integration/standard/configure-payment-methods.md).

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

1.9.1 Enable UPI Intent on iOS *(Optional)*

Provide your customers with a better payment experience by enabling UPI Intent on your app's Checkout form. In the UPI Intent flow:

1. Customer selects UPI as the payment method in your iOS app. A list of UPI apps supporting the intent flow is displayed. For example, PhonePe, Google Pay and Paytm.
2. Customer selects the preferred app. The UPI app opens with pre-populated payment details.
3. Customer enters their UPI PIN to complete their transactions.
4. Once the payment is successful, the customer is redirected to your app or website.

To enable this in your iOS integration, you must make the following changes in your app's info.plist file.

info.plist

copy

```java
-keepattributes *Annotation*
-dontwarn com.razorpay.**
-keep class com.razorpay.** {*;}
-optimizations !method/inlining/
-keepclasseswithmembers class * {
 public void onPayment*(...);
}
```4

Know more about [UPI Intent and its benefits](/razorpay-docs-md/payment-methods/upi/upi-intent.md).

### UPI Intent on Recurring Payments

Configure and initiate a recurring payment transaction on UPI Intent:

ViewController.swiftViewController.m

copy

```java
-keepattributes *Annotation*
-dontwarn com.razorpay.**
-keep class com.razorpay.** {*;}
-optimizations !method/inlining/
-keepclasseswithmembers class * {
 public void onPayment*(...);
}
```5

1.10 Open Checkout

Use the below code to open the Razorpay checkout.

Open Razorpay Checkout

copy

```java
-keepattributes *Annotation*
-dontwarn com.razorpay.**
-keep class com.razorpay.** {*;}
-optimizations !method/inlining/
-keepclasseswithmembers class * {
 public void onPayment*(...);
}
```6

1.11 Store Fields in Your Server

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

1.12 Verify Payment Signature

This is a mandatory step to confirm the authenticity of the details returned to the Checkout form for successful payments.

To verify the `razorpay_signature` returned to you by the Checkout form:

1. Create a signature in your server using the following attributes:

   - `order_id`: Retrieve the `order_id` from your server. Do not use the `razorpay_order_id` returned by Checkout.
   - `razorpay_payment_id`: Returned by Checkout.
   - `key_secret`: Available in your server. The `key_secret` that was generated from the [Dashboard](/razorpay-docs-md/dashboard/account-settings/api-keys.md#generate-api-keys)     .
2. Use the SHA256 algorithm, the `razorpay_payment_id` and the `order_id` to construct a HMAC hex digest as shown below:

   HMAC Hex Digest

   copy

   ```java
-keepattributes *Annotation*
-dontwarn com.razorpay.**
-keep class com.razorpay.** {*;}
-optimizations !method/inlining/
-keepclasseswithmembers class * {
 public void onPayment*(...);
}
```7
3. If the signature you generate on your server matches the `razorpay_signature` returned to you by the Checkout form, the payment received is from an authentic source.

Generate Signature on Your Server

Given below is the sample code for payment signature verification:

JavaPythonGoPHPRubyNode.js.NET

copy

```java
-keepattributes *Annotation*
-dontwarn com.razorpay.**
-keep class com.razorpay.** {*;}
-optimizations !method/inlining/
-keepclasseswithmembers class * {
 public void onPayment*(...);
}
```8

Post Signature Verification

After you have completed the integration, you can [set up webhooks](/docs/webhooks/setup-edit-payments/), make test payments, replace the test key with the live key and integrate with other [APIs](/razorpay-docs-md/api/index.md).

M1 MacBook Changes

If you use M1 MacBook, you need to make the following changes in your podfile.

**Handy Tips**

Add the following code inside `post_install do |installer|`.

podfile

copy

```java
-keepattributes *Annotation*
-dontwarn com.razorpay.**
-keep class com.razorpay.** {*;}
-optimizations !method/inlining/
-keepclasseswithmembers class * {
 public void onPayment*(...);
}
```9

1.13 Verify Payment Status

**Handy Tips**

On the Razorpay Dashboard, ensure that the payment status is `captured`. Refer to the payment capture settings page to know how to [capture payments automatically](/razorpay-docs-md/payments/capture-settings.md).

You can track the payment status in three ways:

Verify Status from Dashboard

Subscribe to Webhook Events

Poll APIs

To verify the payment status from the Razorpay Dashboard:

1. Log in to the Razorpay Dashboard and navigate to **Transactions** → **Payments**.
2. Check if a **Payment Id** has been generated and note the status. In case of a successful payment, the status is marked as **Captured**.

![Payment details on Dashboard](https://razorpay.com/docs/payments/magic-checkout/build/browser/assets/images/testpayment.jpg)

1.14 Perform Post Payment Processing

Based on the response, you can handle post-payment processing on your end.

**Timeout Handling**

If no API call is made within 45 seconds, our background job will assume there is a network drop off and will proceed to place the order on Shopify automatically.

Fetch an Order

Use the Fetch Orders API to retrieve order details, including customer information, address, shipping method and promotions of a particular order:

GET

v1/orders/:id

CurlJavaPythonGoPHPRubyNode.js

copy

```yml
import 'package:razorpay_flutter/razorpay_flutter.dart';
```0

Response: COD OrdersResponse: Prepaid Orders

copy

```yml
import 'package:razorpay_flutter/razorpay_flutter.dart';
```1

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

```yml
import 'package:razorpay_flutter/razorpay_flutter.dart';
```2

Response: COD OrdersResponse: Prepaid Orders

copy

```yml
import 'package:razorpay_flutter/razorpay_flutter.dart';
```3

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

## 2. Test Integration

After the integration is complete, a **Pay** button appears on your webpage/app.

Click the button and make a test transaction to ensure the integration is working as expected. You can start accepting actual payments from your customers once the test transaction is successful.

You can make test payments using one of the payment methods configured at the Checkout.

**Watch Out!**

This is a mock payment page that uses your test API keys, test card and payment details.

- Ensure you have entered only your [Test Mode API keys](/razorpay-docs-md/dashboard/account-settings/api-keys.md#generate-api-keys)

  in the Checkout code.
- Test mode features a mock bank page with **Success** and **Failure** buttons to replicate the live payment experience.
- No real money is deducted due to the usage of test API keys. This is a simulated transaction.

Supported Payment Methods

Following are all the payment modes that the customer can use to complete the payment on the Checkout. Some of them are available by default, while others may require approval from us. Raise a request from the Dashboard to enable such payment methods.

### Netbanking

You can select any of the listed banks. After choosing a bank, Razorpay will redirect to a mock page where you can make the payment `success` or a `failure`. Since this is Test Mode, we will not redirect you to the bank login portals.

Check the list of [supported banks](/razorpay-docs-md/payment-methods/netbanking.md#supported-banks).

### UPI

You can enter one of the following UPI IDs:

- `success@razorpay`: To make the payment successful.
- `failure@razorpay`: To fail the payment.

Check the following lists:

- [Supported UPI Flows](/razorpay-docs-md/payment-methods/upi.md)

  .
- [UPI Error Codes](/docs/errors/payments/upi/)

  .

**Handy Tips**

You can use **Test Mode** to test UPI payments, and **Live Mode** for UPI Intent and QR payments.

### Cards

You can use the following test cards to test transactions for your integration in Test Mode.

#### Domestic Cards

Use the following test cards for Indian payments:

Check the following lists:

- [Supported Card Networks](/razorpay-docs-md/payment-methods/cards.md)

  .
- [Cards Error Codes](/docs/errors/payments/cards/)

  .
- [Test Error Scenarios](/razorpay-docs-md/payments/test-card-details.md#error-scenario-test-cards)

  .

#### International Cards

Use the following test cards to test international payments. Use any valid expiration date in the future in the MM/YY format and any random CVV to create a successful payment.

### Wallet

You can select any of the listed wallets. After choosing a wallet, Razorpay will redirect to a mock page where you can make the payment `success` or a `failure`. Since this is Test Mode, we will not redirect you to the wallet login portals.

Check the list of [supported wallets](/razorpay-docs-md/payment-methods/wallets.md#supported-wallets).

## 3. Go-live Checklist

Check the go-live checklist for Razorpay Magic Checkout integration. Consider these steps before taking the integration live.

3.1 Accept Live Payments

Perform an end-to-end simulation of funds flow in the Test Mode. Once confident that the integration is working as expected, switch to the Live Mode and start accepting payments from customers.

**Watch Out!**

Ensure you are switching your test API keys with API keys generated in Live Mode.

To generate API Keys in Live Mode on your Razorpay Dashboard:

1. Log in to the Razorpay Dashboard and switch to **Live Mode** on the menu.
2. Navigate to **Account & Settings** → **API Keys** → **Generate Key** to generate the API Key for Live Mode.
3. Download the keys and save them securely.
4. Replace the Test API Key with the Live Key in the Checkout code and start accepting actual payments.

3.2 Payment Capture

After payment is `authorized`, you need to capture it to settle the amount to your bank account as per the settlement schedule. Payments that are not captured are auto-refunded after a fixed time.

**Watch Out**

- You should deliver the products or services to your customers only after the payment is captured. Razorpay automatically refunds all the uncaptured payments.
- You can track the payment status using our [Fetch a Payment API](/razorpay-docs-md/api/payments.md#fetch-a-payment)

  or webhooks.

Auto-capture Payments (Recommended)

Manually Capture Payments

Authorized payments can be automatically captured. You can auto-capture all payments [using global settings](/razorpay-docs-md/payments/capture-settings.md#auto-capture-all-payments) on the Razorpay Dashboard. Know more about [capture settings for payments](/razorpay-docs-md/payments/capture-settings.md).

**Watch Out!**

Payment capture settings work only if you have integrated with Orders API on your server side. Know more about the [Orders API](/razorpay-docs-md/api/orders/create.md).

3.3 Set Up Webhooks

Ensure you have [set up webhooks](/docs/webhooks/setup-edit-payments/) in the live mode and configured the events for which you want to receive notifications.

**Implementation Considerations**

Webhooks are the primary and most efficient method for event notifications. They are delivered asynchronously in near real-time. For critical user-facing flows that need instant confirmation (like showing "Payment Successful" immediately), supplement webhooks with API verification.

**Recommended approach**

- Rely on webhooks for all automation, which can be asynchronous.
- If a critical user-facing flow requires instant status, but the webhook notification has not arrived within the time mandated by your business needs, perform an immediate API Fetch call ( [Payments](/razorpay-docs-md/api/payments/fetch-with-id.md)  , [Orders](/razorpay-docs-md/api/orders/fetch-with-id.md)

  and [Refunds](/razorpay-docs-md/api/refunds/fetch-specific-refund-payment.md)

  ) to verify the status.

## Related Information [Flutter Standard Integration](/razorpay-docs-md/payment-gateway/flutter-integration/standard.md)
