<!-- Source: https://razorpay.com/docs/payments/payment-methods/emi/no-cost-emi/bajaj-finserv/custom-integration -->

You can display Bajaj Finserv No Cost EMI offers to your customers by integrating with Razorpay custom checkout.

## Prerequisites

- Create a [Razorpay account](https://razorpay.com/dashboard)  .
- Generate [API keys](/razorpay-docs-md/api/authentication.md#generate-api-keys)

  from the Dashboard.
- Refer to our [web custom integration document](/razorpay-docs-md/payment-gateway/web-integration/custom.md)  .

## Integration flow

If you want to display the No Cost EMI offered by Bajaj Finserv on the Checkout, you must associate the offer with an order. Follow the integration steps given below:

1. [Create No Cost EMI offers](/razorpay-docs-md/payment-methods/emi/no-cost-emi/bajaj-finserv/custom-integration.md#step-1-create-no-cost-emi-offers)

   .
2. [Create an order](/razorpay-docs-md/payment-methods/emi/no-cost-emi/bajaj-finserv/custom-integration.md#step-2-create-an-order)

   .
3. [Fetch payment methods](/razorpay-docs-md/payment-methods/emi/no-cost-emi/bajaj-finserv/custom-integration.md#step-3-fetch-payment-methods)

   .
4. [Invoke checkout and pass order\_id and other options](/razorpay-docs-md/payment-methods/emi/no-cost-emi/bajaj-finserv/custom-integration.md#step-4-invoke-checkout-and-pass-order-id)

   .
5. [Store fields in your server](/razorpay-docs-md/payment-methods/emi/no-cost-emi/bajaj-finserv/custom-integration.md#step-5-store-fields-in-your-server)

   .
6. [Verify payment signature](/razorpay-docs-md/payment-methods/emi/no-cost-emi/bajaj-finserv/custom-integration.md#step-6-verify-payment-signature)

   .

### Step 1: Create No Cost EMI Offers

Raise a request with the [Razorpay Support team](https://razorpay.com/support/#request) to create the relevant No Cost EMIs you want to display on the Checkout. Get the appropriate `offer_id` created for each EMI plan.

### Step 2: Create an Order

Obtain the `offer_id`. Let us say, `offer_ANZoaxsOww2X53`, from our Support team. Create an order for the transaction amount for which the created offer should be applied.

POST

/orders

amount

mandatory

`integer` Amount in currency subunits for which the order is created. For example, if the order is for ₹30,000, enter the value `3000000` (in paise).

currency

mandatory

`string` ISO code of the currency associated with the order amount.

notes

optional

`json object` Key-value pair that can be used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

offers

mandatory

`array` Unique identifier of the Offer.
 Pass the `offer_id` obtained from the Razorpay Support team.

discount

optional

`boolean` Indicate if a discount is to be applied by Razorpay or not. Possible values are:

- `true`: Discount is applied.
- `false`: Discount is not applied.

CurlJavaPythonGoPHPRubyNode.jsResponse

copy

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X POST https://api.razorpay.com/v1/orders \
-H "Content-Type: application/json" \
-d '{
  "amount": 1000000,
  "currency": "INR",
  "discount": true,
  "offers": [
    "offer_ANZoaxsOww2X53"
  ]
}'
```

### Step 3: Fetch Payment Methods

When creating a custom checkout form, you need to ensure that only the methods that are activated for your account are displayed to the customer.

Use the below methods to fetch all payments methods available to you.

RequestResponse

copy

```javascript
var razorpay = new Razorpay({
  key: '<YOUR_KEY_ID>',
    // logo, displayed in the popup
  image: 'https://i.imgur.com/n5tjHFD.jpg',
});
razorpay.once('ready', function(response) {
  console.log(response.methods);
})
```

Know more about [the various payment methods](/razorpay-docs-md/payment-methods.md) offered by Razorpay.

### Step 4: Invoke Checkout and Pass Order Id and Other Options

The list of checkout parameters is available [here](/razorpay-docs-md/payment-gateway/web-integration/custom/build-integration.md).

#### Step 4.1: Include the JavaScript code in your Webpage

Include the following script, preferably in `<head>` section of your page:

Index HTML

copy

```html
<script type="text/javascript" src="https://checkout.razorpay.com/v1/razorpay.js"></script>
```

**Including the Javascript, not the Library**

Include the script from `https://checkout.razorpay.com/v1/razorpay.js` instead of serving a copy from your own server. This allows new updates and bug fixes to the library to get automatically served to your application.

We always maintain backward compatibility with our code.

#### Step 4.2: Instantiate Razorpay Custom Checkout

You can choose to have:

- [A single instance on a page](/razorpay-docs-md/payment-methods/emi/no-cost-emi/bajaj-finserv/custom-integration.md#single-instance-on-a-page)
- [Multiple instances on the same page](/razorpay-docs-md/payment-methods/emi/no-cost-emi/bajaj-finserv/custom-integration.md#multiple-instances-on-same-page)

#### Single Instance on a Page

If you need a single instance on a page, use the code given below:

Invoke a Single Instance

copy

```javascript
var razorpay = new Razorpay({
  key: '<YOUR_KEY_ID>',
    // logo, displayed in the payment processing popup
  image: 'https://i.imgur.com/n5tjHFD.jpg',
});
```

#### Multiple Instances on Same Page

If you need multiple razorpay instances on same page, you can globally set some of the options:

Invoke Multiple Instances

copy

```javascript
Razorpay.configure({
  key: '<YOUR_KEY_ID>',
    // logo, displayed in the payment processing popup
  image: 'https://i.imgur.com/n5tjHFD.jpg',
})
new Razorpay({}); // will inherit key and image from above.
```

#### Step 4.3: Submit Payment Details

Once the order is created and the customer's payment details are obtained, the information should be sent to Razorpay to complete the payment. The data that needs to be submitted depends upon the payment method selected by the customer.

You can do this by invoking `createPayment` method:

createPayment with handler functioncreatePayment with callback URL

copy

```javascript
var data = {
  amount: 3000000, // in currency subunits. Here 1000 = 1000 paise, which equals to ₹10
  currency: "INR",// Default is INR. We support more than 90 currencies.
  email: 'gaurav.kumar@example.com',
  contact: '9123456780',
  notes: {
    address: 'Ground Floor, SJR Cyber, Laskar Hosur Road, Bengaluru',
  },
  order_id: 'order_CjyoZFRpB8r0AH',// Replace with Order ID generated in Step 2
  method: "emi",
  emi_duration: 3,
  provider: "bajajfinserv"
};

var btn = document.querySelector('#btn');
btn.addEventListener('click', function(){
  // has to be placed within user initiated context, such as click, in order for popup to open.
  razorpay.createPayment(data);

  razorpay.on('payment.success', function(resp) {
    alert(resp.razorpay_payment_id),
    alert(resp.razorpay_order_id),
    alert(resp.razorpay_signature)}); // will pass payment ID, order ID, and Razorpay signature to success handler.

  razorpay.on('payment.error', function(resp){alert(resp.error.description)}); // will pass error object to error handler

})
```

**Watch Out!**

The `createPayment` method should be called within an event listener triggered by user action to prevent the popup from being blocked. For example:

javascript

copy

```javascript
$('button').click( function (){ razorpay.createPayment(...) })
```

**Handler Function vs Callback URL**

- **Handler Function**

  When you use the handler function, the response object of the successful payment (`razorpay_payment_id`, `razorpay_order_id` and `razorpay_signature`) is submitted to the Checkout Form. You need to collect these and send them to your server.
- **Callback URL**

  When you use a callback URL, Razorpay makes a post call to the callback URL, with the `razorpay_payment_id`, `razorpay_order_id` and `razorpay_signature` in the response object of the successful payment (`razorpay_payment_id`, `razorpay_order_id`.

### Step 5: Store Fields in Your Server

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

### Step 6: Verify Payment Signature

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

### Payment Capture Settings

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

## Test Integration

After the integration is complete, you need to test the integration to ensure that it is working as expected. You can make a test transaction using the test cards, verify the payment status from the Dashboard or through APIs or subscribe to related Webhook events to take appropriate actions at your end. After testing the integration in test mode, you can start accepting actual payments from your customers.

#### Test Payments

You can make test payments using any of the payment methods configured at the Checkout. No money is deducted from the customer's account as this is a simulated transaction. In the Checkout code, ensure that you have entered the API keys generated in the test mode.

#### EMI Test Card

You can use the EMI test card given below to make transactions in the test mode. Use any valid expiration date in the future and any random CVV to create a successful payment.

#### Verify Payment Status

You can track the status of the payment from the Dashboard, subscribe to the Webhook event or poll our APIs.

#### From Dashboard

1. Log in to the Dashboard and navigate to **Transactions** → **Payments**.
2. Check if a `payment_ID` has been generated. If no `payment_ID` has been generated, it means that the transaction has failed.

![](https://razorpay.com/docs/payments/payment-methods/emi/no-cost-emi/bajaj-finserv/build/browser/assets/images/testpayment.jpg)

#### Subscribe to Webhook events

You can subscribe to a Webhook event that is generated when a certain event happens in our server. When one of those events is triggered, Razorpay sends the Webhook payload to the configured URL. [Know how to set up Webhooks.](/docs/webhooks/)

#### Poll APIs

You can retrieve the status of the payments by polling our [Payment APIs](/razorpay-docs-md/api/payments.md#fetch-multiple-payments).

### Accept Live Payments

After testing the flow of funds end-to-end in test mode and confident that the integration is working as expected, switch to the live mode and start accepting payments from customers. However, make sure that you **swap the test API keys with the live keys**.

To generate API key in live mode:

1. Log in to Dashboard and switch to **Live mode** on the menu.
2. Navigate to **Account & Settings** → **API Keys** → **Generate Key** to generate API key for live mode.
3. Download the keys and save them securely.
4. Replace the test API key with the Live Key in the Checkout code and start accepting actual payments.

### Related Information

- [Webhooks](/docs/webhooks/)

  (Recommended)
- [Error Codes](/docs/errors/)

  (Recommended)
- [How Payment Gateway Works](/razorpay-docs-md/payment-gateway/how-it-works.md)
- [Payment States](/razorpay-docs-md/payments.md)
- [Settlements](/razorpay-docs-md/settlements.md)
- [Refunds](/razorpay-docs-md/refunds.md)

### Next Steps

Once the customer has successfully made the payment after availing the desired Offer, you can check the status of the payment from the Dashboard.
