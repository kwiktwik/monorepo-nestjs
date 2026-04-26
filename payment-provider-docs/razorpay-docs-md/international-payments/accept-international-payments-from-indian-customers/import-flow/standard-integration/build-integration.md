<!-- Source: https://razorpay.com/docs/payments/international-payments/accept-international-payments-from-indian-customers/import-flow/standard-integration/build-integration -->

Follow these steps to integrate the standard checkout form on your website:

**1.1** [Create a customer in server](/razorpay-docs-md/international-payments/accept-international-payments-from-indian-customers/import-flow/standard-integration/build-integration.md#11-create-a-customer-in-server).

**1.2** [Create an order in server](/razorpay-docs-md/international-payments/accept-international-payments-from-indian-customers/import-flow/standard-integration/build-integration.md#12-create-an-order-in-server).

**1.3** [Integrate with checkout on client-side](/razorpay-docs-md/international-payments/accept-international-payments-from-indian-customers/import-flow/standard-integration/build-integration.md#13-integrate-with-checkout-on-client-side).

**1.4** [Handle payment success and failure](/razorpay-docs-md/international-payments/accept-international-payments-from-indian-customers/import-flow/standard-integration/build-integration.md#14-handle-payment-success-and-failure).

**1.5** [Store fields in server](/razorpay-docs-md/international-payments/accept-international-payments-from-indian-customers/import-flow/standard-integration/build-integration.md#15-store-fields-in-your-server).

**1.6** [Verify payment signature](/razorpay-docs-md/international-payments/accept-international-payments-from-indian-customers/import-flow/standard-integration/build-integration.md#16-verify-payment-signature).

**1.7** [Verify payment status](/razorpay-docs-md/international-payments/accept-international-payments-from-indian-customers/import-flow/standard-integration/build-integration.md#17-verify-payment-status).

**1.8** [Invoice collection](/razorpay-docs-md/international-payments/accept-international-payments-from-indian-customers/import-flow/standard-integration/build-integration.md#18-invoice-collection).

## 1.1 Create a Customer in Server

Use Customers API to create customers with basic details such as name, email and contact details.

You can try out our APIs on the Razorpay Postman Public Workspace. Fork the workspace and test the APIs with your [Test API Keys](/razorpay-docs-md/api/authentication.md#test-mode-api-keys). [![Run in Postman](https://run.pstmn.io/button.svg)](https://www.postman.com/razorpaydev/workspace/razorpay-public-workspace/request/12492020-85efcb7a-1506-4539-b26e-892169fe46f8)

POST

/customers

Request Parameters

name

optional

`string` Customer's name. The name must be between 3-50 characters in length. For example, `Gaurav Kumar`.

contact

mandatory

`string` The customer's phone number. A maximum length of 15 characters including country code. For example, `+919000090000`.

email

optional

`string` The customer's email address. A maximum length of 64 characters for the username. For example, in " [gaurav.kumar@example.com](mailto:gaurav.kumar@example.com)

", "gaurav.kumar" must not exceed 64 characters.

fail\_existing

optional

`string` The request throws an exception by default if a customer with the exact details already exists. You can pass an additional parameter `fail_existing` to get the existing customer's details in the response. Possible values:

- `1` (default): If a customer with the same details already exists, throws an error.
- `0`: If a customer with the same details already exists, fetches details of the existing customer.

gstin

optional

`string` Customer's GST number, if available.
 For example, `29XAbbA4369J1PA`.

notes

optional

`object` Key-value pair used to store additional information about the entity. Holds 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

Response Parameters

id

`string` Unique identifier of the customer. For example, `cust_1Aa00000000004`.

entity

`string` Indicates the type of entity.

name

`string` Customer's name. The name must be between 3-50 characters in length. For example, `Gaurav Kumar`.

contact

`string` The customer's phone number. A maximum length of 15 characters including country code. For example, `+919000090000`.

email

`string` The customer's email address. A maximum length of 64 characters for the username. For example, in " [gaurav.kumar@example.com](mailto:gaurav.kumar@example.com)

", "gaurav.kumar" must not exceed 64 characters.

gstin

`string` GST number linked to the customer.
 For example, `29XAbbA4369J1PA`.

notes

`object` Key-value pair used to store additional information about the entity. Holds 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

created\_at

`integer` UNIX timestamp, when the customer was created. For example, `1234567890`.

Error Response Parameters

## 1.2 Create an Order in Server

You can create an order using the following API and send the additional information required for Import Flow.

POST

/orders

Request Parameters

amount

mandatory

`integer` Payment amount in the smallest currency sub-unit. For example, if the amount to be charged is ₹299, then pass `29900` in this field. In the case of three decimal currencies, such as KWD, BHD and OMR, to accept a payment of 295.991, pass the value as 295990. And in the case of zero decimal currencies such as JPY, to accept a payment of 295, pass the value as 295.

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

customer\_id

optional

`string` Unique identifier of customer received in response of Create Customer API. This will be `mandatory` field if you are creating a customer using Create Customer API. This is an `optional` field if you are directly creating an order without creating a customer.

customer\_details

optional

`json object` Details about the customer/user.

name

optional

`string` The customer’s name. For example, Gaurav Kumar.

contact

optional

`string` The customer's phone number. A maximum length of 15 characters, including country code. For example, +919000090000.

email

optional

`string` The customer’s email address. For example, [gaurav.kumar@example.com](mailto:gaurav.kumar@example.com).

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

optional

`string`  unique product id defined by the business.

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

`integer` Offer price of the product. The offer price can be lower than the price if the business is running any discount on the product.

tax\_amount

optional

`integer` Tax amount that needs to be added to the product. In case the **offer\_price** is tax-inclusive, keep it blank.

hotel

optional

`json object` Details about the type-specific data points. Will vary based on the type selected.

sub\_type

optional

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

`string` Represents an ISO 8601-encoded date string. For example, September 7, 2019 is represented as "2019-07-16".

checkout\_date

optional

`string` Represents an ISO 8601-encoded date string. For example, September 7, 2019 is represented as "2019-07-16".

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

`float` Latitude of the position expressed in decimal degrees (WSG 84), for example, 6.244203. A positive value denotes the northern hemisphere or the equator, and a negative value denotes the southern hemisphere. The number of digits represents the precision of the coordinate.

longitude

optional

`float` Longitude of the position expressed in decimal degrees (WSG 84), for example, -75.581211. A positive value denotes east longitude or the prime meridian, and a negative value denotes west longitude. The number of digits represents the precision of the coordinate.

travellers

optional

`JSON object` Details associated with passengers/travellers/beneficiaries.

name

optional

`string` Name of the passenger/traveler/beneficiary.

email

optional

`string` Email address of the passenger/traveler/beneficiary.

contact

optional

`JSON object` Details associated with passengers/travelers/beneficiaries.

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

`JSON object` Identity details of the passenger/beneficiary.

unique\_national\_id

optional

`string` National ID number. For example, Adhaar number for India.

tax\_id

optional

`string` Passport number of the individual.

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

`string` The referrer of the marketing event. Example values: google, newsletter.

medium

optional

`string` The medium that the campaign is using. Example values: cpc, banner, etc.

notes

mandatory

`json object` Key-value pair that can be used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

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

`object` Key-value pair used to store additional information about the entity. Holds 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty"`.

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
    "customer_id": "cust_MpINfSkdEvtdxb",
    "order_id": "order_NGrgEcmYJsfUyl", //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
    "callback_url": "https://eneqd3r9zrjok.x.pipedream.net/",
    "notes": {
        "partner_reservation_id": "12345",
        "invoice_number": "order_NGrgEcmYJsfUyl",
        "partner_guest_id": "abcd"
    },
};
var rzp1 = new Razorpay(options);
document.getElementById('rzp-button1').onclick = function(e){
    rzp1.open();
    e.preventDefault();
}
</script>
```

**Handy Tips**

Test your integration using these [test cards](/razorpay-docs-md/payment-gateway/web-integration/standard/integration-steps.md#2-test-integration).

#### Supported Payment Methods

Following payment methods are supported under the Import Flow:

- Netbanking
- UPI
- Cards

Request Parameters

key

mandatory

`string` API Key ID generated from the Razorpay Dashboard.

amount

mandatory

`integer` The amount to be paid by the customer in currency subunits. For example, if the amount is ₹500, enter `50000`.

currency

mandatory

`string` The currency in which the payment should be made by the customer. See the list of [supported currencies](/razorpay-docs-md/international-payments.md#supported-currencies).

name

mandatory

`string` Your Business/Enterprise name shown on the Checkout form. For example, **Acme Corp**.

description

optional

`string` Description of the purchase item shown on the Checkout form. It should start with an alphanumeric character.

image

optional

`string` Link to an image (usually your business logo) shown on the Checkout form. Can also be a **base64** string if you are not loading the image from a network.

customer\_id

optional

`string` Unique identifier of the customer received in response of Create Customer API. This will be `mandatory` field if you are creating a customer using Create Customer API. This is an `optional` field if you are directly creating an order without creating a customer.

order\_id

mandatory

`string` Unique identifier of the order received in response of Create Order API.

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

`function` Used to track the status of Checkout. You can pass a modal object with `ondismiss: function()\{\}` as options. This function is called when the modal is closed by the user.

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

send\_sms\_hash

optional

`boolean` Used to auto-read OTP for cards and net banking pages. Applicable from Android SDK version 1.5.9 and above. Possible values:

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

- `true` (default): Enables customers to retry payments with the suggested next best option.
- `false`: Disables customers from retrying the payment.

max\_count

`integer` The number of times the customer can retry the payment with the suggested next best option. We recommend you to set this to 4. Having a larger number here can cause loops to occur.

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

notes

mandatory

`object` Key-value pair that can be used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

partner\_reservation\_id

mandatory

`string` unique identifier for reservation from the business.

invoice\_number

mandatory

`string` Order ID received in response of the Create an Order API. Example `order_NGrgEcmYJsfUyl`.

partner\_guest\_id

mandatory

`string` Unique identifier from business end.

**Handy Tips**

The open method of Razorpay object (`rzp1.open()`) must be invoked by your site's JavaScript, which may or may not be a user-driven action such as a click.

## Errors

Given below is a list of errors you may face while integrating with checkout on the client-side.

### Configure Payment Methods (Optional)

Multiple payment methods are available on the Razorpay Web Standard Checkout.

- The payment methods are **fixed** and cannot be changed.
- You can configure the order or make certain payment methods prominent. Know more about [configuring payment methods](/razorpay-docs-md/payment-gateway/web-integration/standard/configure-payment-methods.md)  .

## 1.4 Handle Payment Success and Failure

The way the Payment Success and Failure scenarios are handled depends on the [Checkout Sample Code](/razorpay-docs-md/international-payments/accept-international-payments-from-indian-customers/import-flow/standard-integration/build-integration.md#code-to-add-pay-button) you used in the last step.

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

![Payment details on Dashboard](https://razorpay.com/docs/payments/international-payments/accept-international-payments-from-indian-customers/import-flow/standard-integration/build/browser/assets/images/testpayment.jpg)

## 1.8 Invoice Collection

**Watch Out!**

1. Invoice collection is mandatory for any import payment to be eligible for settlement.
2. Turnaround Time (TAT) for settlement begins **only after a valid invoice** is uploaded.
3. Ensure each invoice contains the following details:
   - Unique invoice number (Partner's invoice ID or Razorpay Order ID).
   - Partner's or business name.
   - Partner's or business address.
   - Customer's complete address.
   - Description of goods/services.
   - Units sold (time period, quantity and so on).
   - Amount in INR (2 decimal places only. For example, ₹2,341.23).
   - Taxes applied.

## Invoice Submission via SFTP

You can automate invoice uploads using **Secure File Transfer Protocol (SFTP)**, enabling streamlined, secure file transfer.

### Steps to Connect with Razorpay via SFTP

1. Share Your Public Key

- Required for setting up SFTP credentials and folder access.
- Submit your SSH public key to your Razorpay point of contact.
- **Supported SSH key formats**:
  - RSA (2048-bit or higher). For example, `ssh-rsa`.
  - ECDSA. For example, `ssh-ecdsa`.
  - Ed25519. For example, `ssh-ed25519`.
- Ensure your key is in the correct format. Using an unsupported or incorrectly formatted key will result in authentication failure.

**Watch Out!**

Never share your private key with anyone. Only the public key should be provided to Razorpay.

2. IP Whitelisting

- Only requests from your whitelisted IPs will be accepted.
- Share a list of authorised outbound IPs to enable secure access.
- Maximum of 4 IP addresses can be whitelisted.
- SFTP access will work only from the whitelisted IPs. Attempting to connect from any other IP address will result in connection failure.

3. Credentials & Access Details

- Razorpay will provide:
  - Hostname: `sftp.razorpay.com`
  - Port: `22`
  - Username
  - Path prefix (based on your `MID`)
- Use your **private key** (corresponding to the public key you shared) to authenticate while connecting to Razorpay's SFTP.
- Use an SFTP client to connect.
- **Test your connection**: Run `telnet sftp.razorpay.com 22` to verify connectivity before attempting SFTP access.

## How to Share Invoices via SFTP

File Path Format

Use the following folder and file structure:
"/invoiceUpload/automated/< MID >/YYYY-MM-DD/InvoiceNumber.pdf."
For example: `/invoiceUpload/automated/MDoeHNNpi0nB7m/2025-05-10/INV_09876.pdf`

**Watch Out!**

- You must include your Merchant ID (MID) in the path.
- You must include the date folder in `YYYY-MM-DD` format.
- Missing either component will result in upload failure.
- Once uploaded, invoices become read-only. You cannot edit, rename or delete files after you upload.
- Do not attempt to upload the same invoice multiple times to the same path.

File Types and Flows

## Invoice ID Validation Process

Razorpay enforces strong validation rules to prevent duplicate or invalid invoice usage.

Successful Payments

- **Status**: `Captured`
- **Invoice Action**: Permanently blocked
- **Note**: Same invoice ID cannot be reused.

Failed Payments

- **Status**: `Failed`
- **Invoice Action**: Released
- **Note**: Invoice ID can be reused.

Payments in Intermediate States

- **Status**: `Created` or `Authorised`
- **Invoice Action**: Temporarily blocked
- **Note**: Invoice ID is reusable only after final status (`Failed` or `Captured`) is reached.

### Refunded Payments

Auto-Refunded (Never Captured)

- **Status**: `Refunded`
- **Action**: Invoice ID is released.
- **Note**: ID can be reused.

Merchant-Initiated Refund (Post-Capture)

- **Status**: `Refunded`
- **Action**: Invoice ID is permanently blocked.
- **Note**: Cannot be reused.

Partial capture scenarios are not validated by default. Contact Razorpay [Support team](https://razorpay.com/support/).

## AML Screening Process

As per RBI regulations, payments to offshore accounts must undergo AML (Anti-Money Laundering) checks by Razorpay's Authorised Dealer (AD) Bank.

Daily AML Communication

- You will receive daily emails listing transactions **flagged** for additional details.
- **Subject Line**: `Additional Details Required - [Business Name]_MDoeHNNpi0nB7m`.

Turnaround Time

- Share required information within **5 working days** to avoid auto-cancellation.
- Information may include: Full name, address, ownership, percentage of ownership, nature of business, purpose of payment, business website, company, date of birth/incorporation, place of birth/incorporation and so on.

Consequences of Delay

Missing TAT results in:

- Razorpay lien-marking the funds or
- Refund initiation via Dashboard/API.

## Best Practices for Invoice IDs

To ensure seamless experience and compliance:

- **Always generate unique invoice IDs** per payment.
- Acceptable IDs:
  - Razorpay `order_id`.
  - Your internal unique invoice number.
- Do not reuse invoice IDs for different transactions unless the original payment has failed.

## Next Steps [Step 2: Test Integration](/razorpay-docs-md/international-payments/accept-international-payments-from-indian-customers/import-flow/standard-integration/test-integration.md)
