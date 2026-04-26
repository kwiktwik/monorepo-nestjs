<!-- Source: https://razorpay.com/docs/payments/international-payments/outward-remittances/standard-integration/build-integration -->

Follow these steps to integrate the standard checkout form on your website:

**1.1** [Create a customer in server](/razorpay-docs-md/international-payments/outward-remittances/standard-integration/build-integration.md#11-create-a-customer-in-server).

**1.2** [Create an order in server](/razorpay-docs-md/international-payments/outward-remittances/standard-integration/build-integration.md#12-create-an-order-in-server).

**1.3** [Integrate with checkout on client-side](/razorpay-docs-md/international-payments/outward-remittances/standard-integration/build-integration.md#13-integrate-with-checkout-on-client-side).

**1.4** [Handle payment success and failure](/razorpay-docs-md/international-payments/outward-remittances/standard-integration/build-integration.md#14-handle-payment-success-and-failure).

**1.5** [Store fields in server](/razorpay-docs-md/international-payments/outward-remittances/standard-integration/build-integration.md#15-store-fields-in-your-server).

**1.6** [Verify payment signature](/razorpay-docs-md/international-payments/outward-remittances/standard-integration/build-integration.md#16-verify-payment-signature).

**1.7** [Verify payment status](/razorpay-docs-md/international-payments/outward-remittances/standard-integration/build-integration.md#17-verify-payment-status).

## 1.1 Create a Customer in Server

**Watch Out!**

This step is `mandatory` if you are creating a customer using [Create Customer in Server API](/razorpay-docs-md/international-payments/outward-remittances/standard-integration/build-integration.md#11-create-a-customer-in-server). This is an `optional` step if you are directly [Create an Order in Server API](/razorpay-docs-md/international-payments/outward-remittances/standard-integration/build-integration.md#12-create-an-order-in-server) without creating a customer.

Creating a customer generates a unique `customer_id` by collecting basic details such as name, email, and contact details. This `customer_id` must be included when creating a payment request to link the payment to the customer. Use the following API to create a customer.

You can try out our APIs on the Razorpay Postman Public Workspace. Fork the workspace and test the APIs with your [Test API Keys](/razorpay-docs-md/api/authentication.md#test-mode-api-keys). [![Run in Postman](https://run.pstmn.io/button.svg)](https://www.postman.com/razorpaydev/workspace/razorpay-public-workspace/request/12492020-85efcb7a-1506-4539-b26e-892169fe46f8)

POST

/customers

Request Parameters

name

mandatory

`string` Customer's name.

- Name must be unique.
- Character length: Between 5 and 50 characters.
- Allowed characters: Uppercase letters (A-Z), lowercase letters (a-z), and spaces (not at the beginning).
- Not allowed characters: Numbers, special characters (For example, @, ", ,, ., etc.), Unicode characters, emojis, and non-Latin scripts or regional languages.
- Prohibited names: Names must be meaningful and contextually appropriate.
  - Avoid using repetitive patterns (For example, aaa, xyz, kkk kk).
  - Names like litri litri, Hfg Gh, or husi husi are not permitted.
  - Curse words or offensive names are prohibited.
- Example: `Gaurav Kumar`.

contact

mandatory

`string` The customer's phone number. A maximum length of 15 characters including country code. For example, `+919000090000`.

email

mandatory

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

`string` Customer's name.

- Character length: Between 5 and 50 characters.
- Allowed characters: Uppercase letters (A-Z), lowercase letters (a-z), and spaces (not at the beginning).
- Not allowed characters: Numbers, special characters (For example, @, ", ,, ., etc.), Unicode characters, emojis, and non-Latin scripts or regional languages.
- Prohibited names: Names must be meaningful and contextually appropriate.
  - Avoid using repetitive patterns (For example, aaa, xyz, kkk kk).
  - Names like litri litri, Hfg Gh, or husi husi are not permitted.
  - Curse words or offensive names are not prohibited.
- Example: `Gaurav Kumar`.

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

After a customer is created, an order needs to be generated using the Orders API. This order contains details such as the payment amount, currency, customer details and other custom notes. After the order is created, an `order_id` is generated, for example, `order_NGrgEcmYJsfUyl`. You must pass this `order_id` in the checkout code to associate this order with the payment. Know more about [Order and Payment states](/razorpay-docs-md/orders.md#order-states).

Use the API sample code given below to create an order.

POST

/orders

**Watch Out!**

- **Customer Information Collection**: PAN, DOB and TCS declaration will be collected from customers at checkout.
- **TCS Calculation**: Razorpay will automatically calculate TCS based on the line items passed in the Create Order API and apply the required TCS on customer payments according to the following slabs:

Request Parameters

amount

mandatory

`integer` The amount for which the order was created, in currency subunits. For example, for an amount of ₹295, enter `29500`. Payment can only be made for this amount against the Order.

currency

mandatory

`string` The currency code. The default length is 3 characters. For example, `INR`.

receipt

optional

`string` Receipt number that corresponds to this order, set for your internal reference. Can have a maximum length of 40 characters and has to be unique.

customer\_id

optional

`string` Unique identifier of customer.

customer\_details

mandatory

`object` This contains details about the customer details of the order.

name

mandatory

`string` Customer's name.

- Character length: Between 5 and 50 characters.
- Allowed characters: Uppercase letters (A-Z), lowercase letters (a-z), and spaces (not at the beginning).
- Not allowed characters: Numbers, special characters (For example, @, ", ,, ., etc.), Unicode characters, emojis, and non-Latin scripts or regional languages.
- Prohibited names: Names must be meaningful and contextually appropriate.
  - Avoid using repetitive patterns (For example, aaa, xyz, kkk kk).
  - Names like litri litri, Hfg Gh, or husi husi are not permitted.
  - Curse words or offensive names are prohibited.
- Example: `Gaurav Kumar`.

notes

optional

`json object` Key-value pair used to store additional information about the entity. Holds 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty"`.

line\_items

mandatory

`object` Contains the details of the booking itinerary.

type

mandatory

`string` Contains the type of item of booking. Possible values:

- `lrs_travel`
- `lrs_experience`
- `lrs_hotel`

name

optional

`string` Contains the name of the booking. For example, the name of the hotel, flight and so on.

description

optional

`string` Contains the description of the booking.

quantity

optional

`integer` Contains the quantity of the booking. For example, 1 flight or 2 rooms.

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
    "currency": "",
    "name": "Acme Corp", //your business name
    "description": "Test Transaction",
    "image": "https://example.com/your_logo",
    "customer_id": "cust_MpINfSkdEvtdxb",
    "order_id": "order_NGrgEcmYJsfUyl", //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
    "callback_url": "https://eneqd3r9zrjok.x.pipedream.net/",
    "prefill": { //We recommend using the prefill parameter to auto-fill customer's contact information especially their phone number
        "name": "Gaurav Kumar", //your customer's name
        "email": "gaurav.kumar@example.com",
        "contact": "+919876543210" //Provide the customer's phone number for better conversion rates 
    },
    "notes": {
        "invoice_number": "IRS1245",
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

**Handy Tips**

Test your integration using these [test cards](/razorpay-docs-md/international-payments/outward-remittances/standard-integration/test-integration.md#Cards).

**Watch Out!**

- The `invoice_number` field is mandatory for all payment methods. Ensure each payment has a unique invoice number.
- The `createPayment` method should be called within an event listener triggered by user action to prevent the popup from being blocked. For example:

javascript

copy

```javascript
$('button').click( function (){ razorpay.createPayment(...) })
```

Checkout Parameters

key

mandatory

`string` API Key ID generated from the Dashboard.

amount

mandatory

`integer` The amount to be paid by the customer in currency subunits. For example, if the amount is ₹500, enter `50000`.

currency

mandatory

`string` The currency code. The default length is 3 characters. For example, `INR`.

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

- Autofill customer contact details, especially phone number to ease form completion. Include customer’s phone number in the `contact` parameter of the JSON request's `prefill` object. Format: +(country code)(phone number). Example: “contact": "+919000090000").
- This is not applicable if you do not collect customer contact details on your website before checkout, have Shopify stores or use any of the no-code apps.

name

optional

`string` Cardholder's name to be pre-filled if customer is to make card payments on Checkout. For example, **Gaurav Kumar**.

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

`string` Pre-selection of the payment method for the customer. Will only work if `contact` and `email` are also pre-filled. Possible values:

- `card`
- `netbanking`
- `wallet`
- `emi`
- `upi`

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

customer\_id

optional

`string` Unique identifier of customer. Used for:

- [Local saved cards feature](/razorpay-docs-md/payment-methods/cards/features/saved-cards.md#save-card-details)

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

invoice\_number

mandatory

`string` Invoice number of the invoice generated. Ensure each payment has a unique invoice number.

**Handy Tips**

The open method of Razorpay object (`rzp1.open()`) must be invoked by your site's JavaScript, which may or may not be a user-driven action such as a click.

## Errors

Given below is a list of errors you may face while integrating with checkout on the client-side.

### Configure Payment Methods (Optional)

Multiple payment methods are available on the Razorpay Web Standard Checkout.

- The payment methods are **fixed** and cannot be changed.
- You can configure the order or make certain payment methods prominent. Know more about [configuring payment methods](/razorpay-docs-md/payment-gateway/web-integration/standard/configure-payment-methods.md)  .

## 1.4 Handle Payment Success and Failure

The way the Payment Success and Failure scenarios are handled depends on the [Checkout Sample Code](/razorpay-docs-md/international-payments/outward-remittances/standard-integration/build-integration.md#code-to-add-pay-button) you used in the last step.

### Checkout with Handler Function

If you used the sample code with the handler function:

Handler Function

On Payment Success

On Payment Failure

The customer sees your website page. The checkout returns the response object of the successful payment (**razorpay\_payment\_id**, **razorpay\_order\_id** and **razorpay\_signature**). Collect these and send them to your server.

### Checkout with Callback URL

If you used the sample code with the callback URL:

Callback URL

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

![Payment details on Dashboard](https://razorpay.com/docs/payments/international-payments/outward-remittances/standard-integration/build/browser/assets/images/testpayment.jpg)

## Additional APIs

### Fetch Payment Details With ID

Use this API to retrieve the details of a specific payment using its `razorpay_payment_id`.

CurlJavaPythonGoPHPRubyNode.js.NET

copy

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET]
-X GET https://api.razorpay.com/v1/payments/pay_DG4ZdRK8ZnXC3k
```

SuccessFailure

copy

```json
{
    "id": "pay_DG4ZdRK8ZnXC3k",
    "entity": "payment",
    "amount": 11000,
    "currency": "INR",
    "status": "captured",
    "order_id": "order_RAcmPp7jezbvjT",
    "invoice_id": null,
    "international": false,
    "method": "upi",
    "amount_refunded": 0,
    "refund_status": null,
    "captured": true,
    "description": null,
    "card_id": null,
    "bank": null,
    "wallet": null,
    "vpa": "success@razorpay",
    "email": "gaurav.kumar@example.com",
    "contact": "+919876543210",
    "notes": {
        "invoice_number": "order_RAcmPp7jezbvjT",
        "tcs_amount": 2200,
        "tcs_percentage": 20
    },
    "fee": 156,
    "tax": 24,
    "error_code": null,
    "error_description": null,
    "error_source": null,
    "error_step": null,
    "error_reason": null,
    "acquirer_data": {
        "rrn": "392715558317",
        "upi_transaction_id": "41CAC6648BFC65AAE036F8425078A8AA"
    },
    "created_at": 1756355904,
    "upi": {
        "vpa": "success@razorpay"
    }
}
```

Query Parameter

id

mandatory

`string` Unique identifier of the payment to be retrieved.

Response Parameter

id

`string` Unique identifier of the payment.

entity

`string` Indicates the type of entity.

amount

`integer` The payment amount in currency subunits. For example, for an amount of ₹1 enter 100.

currency

`string` The currency in which the payment is made. Refer to the list of [international currencies](/razorpay-docs-md/international-payments.md#supported-currencies) that we support.

method

`string` The payment method used for making the payment. Possible values:

- `card`
- `netbanking`
- `wallet`
- `emi`
- `upi`
- `paylater`

fee

`integer` Fee (including GST) charged by Razorpay.

tax

`integer` GST charged for the payment.

error\_code

`string` Error that occurred during payment. For example, `BAD_REQUEST_ERROR`.

error\_description

`string` Description of the error that occurred during payment. For example, `Payment processing failed because of incorrect OTP`

error\_source

`string` The point of failure. For example, `customer`.

error\_step

`string` The stage where the transaction failure occurred. The stages can vary depending on the payment method used to complete the transaction. For example, `payment_authentication`.

error\_reason

`string` The exact error reason. For example, `incorrect_otp`.

notes

`json object` Contains user-defined fields, stored for reference purposes.

invoice\_number

`string` Invoice number of the invoice generated. Ensure each payment has a unique invoice number.

tcs\_amount

`integer` The TCS (Tax Collected at Source) amount in the smallest currency unit.

tcs\_percentage

`integer` The TCS percentage rate applied to the payment.

created\_at

`integer` Timestamp, in UNIX format, on which the payment was created.

card\_id

`string` The unique identifier of the card used by the customer to make the payment.

card

`object` Details of the card used to make the payment.

id

`string` The unique identifier of the card used by the customer to make the payment.

entity

`string` The name of the entity. Here, it is `card`.

name

`string` Name of the cardholder.

last4

`integer` The last 4 digits of the card number.

network

`string` The card network. Possible values:

- `American Express`
- `Diners Club`
- `Maestro`
- `MasterCard`
- `RuPay`
- `Unknown`
- `Visa`

type

`string` The card type. Possible values:

- `credit`
- `debit`
- `prepaid`
- `unknown`

issuer

`string` The card issuer. The 4-character code denotes the issuing bank. This attribute will not be set for the card issued by a foreign bank.

emi

`boolean` Indicates whether the card can be used for EMI payment method. Possible values:

- `true`: Card can be used for EMI payments.
- `false`: Card cannot be used for EMI payments.

sub\_type

`string` The sub-type of the customer's card. Possible values:

- `customer`
- `business`

Know how to accept payments made by customers using [corporate cards](/razorpay-docs-md/payment-methods/cards/corporate-cards.md).

upi

`object` Details of the UPI payment received. Only applicable if `method` is `upi`.

payer\_account\_type

`string` The payment method used for making the payment. Possible values:

- `bank_account`
- `credit_card`
- `wallet`
- `credit_line`

vpa

`string` The customer's VPA (Virtual Payment Address) or UPI id used to make the payment. For example, `gauravkumar@exampleupi`.

flow

`string` The type of UPI flow. Possible values:

- `intent`: When a UPI app is selected and user is redirected to it.
- `collect`: The user enters their UPI ID and receives a notification from the UPI app. They open the app and complete the payment.
- `in_app`: In case of Turbo UPI Payments.

bank

`string` The 4-character bank code which the customer's account is associated with. For example, `UTIB` for Axis Bank.

vpa

`string` The customer's VPA (Virtual Payment Address) or UPI id used to make the payment. For example, `gauravkumar@exampleupi`.

wallet

`string` The name of the wallet used by the customer to make the payment. For example, `payzapp`.

acquirer\_data

`array` A dynamic array consisting of a unique reference numbers.

rrn

`string` A unique bank reference number provided by the banking partner when a refund is processed. This reference number can be used by the customer to track the status of the refund with the bank.

authentication\_reference\_number

`string` A unique reference number generated for RuPay card payments.

bank\_transaction\_id

`string` A unique reference number provided by the banking partner in case of netbanking payments.

Error Response Parameter

## Next Steps [Step 2: Test Integration](/razorpay-docs-md/international-payments/outward-remittances/standard-integration/test-integration.md)
