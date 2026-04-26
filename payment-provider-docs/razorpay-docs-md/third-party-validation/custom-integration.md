<!-- Source: https://razorpay.com/docs/payments/third-party-validation/custom-integration -->

Third-Party Validation (TPV) of bank accounts is a mandatory requirement for merchants in the BFSI (Banking, Financial Services and Insurance) sector dealing with Securities, Broking and Mutual Funds. As per Securities and Exchange Board of India (SEBI) guidelines, transactions must be made by the investors **only** from those bank accounts provided when they registered with your business.

With Razorpay, you can comply with the SEBI guidelines for online payment collections by offering TPV integrations with [major banks](/razorpay-docs-md/third-party-validation/custom-integration/bank-list.md) at Checkout. Investors can make payments using netbanking, debit card or UPI. UPI supports both collect and intent flows at Razorpay Custom Integration checkout.

**Feature Request**

This is an on-demand feature. Please raise a request with our [Support team](https://razorpay.com/support/#request) to get this feature activated on your Razorpay account.

Prerequisites

- Contact our [Support Team](https://razorpay.com/support/#raise-a-request)

  to get this feature enabled for your account.
- Keep the API key (combination of `Key_Id` and `Key_Secret`) handy for integration.
- [Generate API Keys from the Dashboard](/razorpay-docs-md/api/authentication.md#generate-api-keys)

  if not done already.
- Configure the [payment capture settings](/razorpay-docs-md/payments/capture-settings.md)

  on the Dashboard.

## 1. Integration Flow

In TPV integration flow, Razorpay maps the investors' bank accounts to ensure that the payment is processed only from their registered bank accounts. Follow the steps given below:

1.1 Collect Investor Bank Account details

Collect the bank account details provided by the investor at the time of registration.

1.2 Create an Order

Pass the bank account details to the `bank_account` array of the Orders API:

POST

/orders

The investor needs to pay using the payment method specified by you in the order. For example, if you want the investor to pay using UPI, you must pass `method=upi`.

Netbanking

Given below is the sample code when the `method` is `netbanking`.

Debit Card

Given below is the sample code when the `method` is `card`.

UPI

Given below is the sample code when the `method` is `upi`.

#### Request Parameters

Create a request payload using the following attributes:

amount

mandatory

`integer` The transaction amount expressed in paise (currency supported is INR). For example, for an actual amount of ₹1, the value of this field should be `100`.

currency

mandatory

`string` The currency in which the transaction should be made. You can create orders in **INR** only.

receipt

optional

`string` Receipt number that corresponds to this order, set for your internal reference. Maximum length is 40 characters.

notes

optional

`json object` Key-value pair that can be used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

method

mandatory

`string` The payment method used to make the payment. If this parameter is not passed, investors will be able to make payments using both netbanking and UPI payment methods. Possible values:

- `netbanking`: Investors can make payments only using netbanking.
- `card`: Investors can make payments using debit card.
- `upi`: Investors can make payments only using UPI.

bank\_account

mandatory

`object` Details of the bank account that the investor has provided at the time of registration.

account\_number

mandatory

`string` The bank account number from which the investor should make the payment. For example, `765432123456789` Payments will not be processed for an incorrect account number.

name

mandatory

`string` The name linked to the bank account. For example, `Gaurav Kumar`.

ifsc

mandatory

`string` The bank IFSC. For example, `HDFC0000053`.

1.3 Fetch Payment Methods

When creating a custom checkout form for TPV, you can ensure that only the netbanking, debit card and UPI methods are displayed to the investor.

Use the sample code given below to fetch all payment methods available to you.

RequestResponse

copy

```javascript
var razorpay = new Razorpay({
  key: '<YOUR_KEY_ID>',
    // logo, displayed in the popup
  image: 'https://cdn.razorpay.com/logos/Du3F12cJXffdFe_large.jpg',
});
razorpay.once('ready', function(response) {
  console.log(response.methods);
})
```

Know more about the various [payment methods](/razorpay-docs-md/payment-methods.md).

1.4 Invoke Checkout and Pass Order Id and Other Options

1.4.1 Include the JavaScript code in your Webpage

Include the following script, preferably in the `<head>` section of your page:

Index HTML

copy

```html
<script type="text/javascript" src="https://checkout.razorpay.com/v1/razorpay.js"></script>
```

**Include the Javascript, Not the Library**

Include the script from `https://checkout.razorpay.com/v1/razorpay.js` instead of serving a copy from your own server. This allows new updates and bug fixes to the library to get automatically served to your application.

We always maintain backward compatibility with our code.

1.4.2 Instantiate Razorpay Custom Checkout

#### Single Instance on a Page

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

If you need multiple Razorpay instances on the same page, you can globally set some of the options:

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

1.4.3 Submit Payment Details

After the order is created and the investor's payment details are obtained, the information should be sent to Razorpay to complete the payment. The data that needs to be submitted depends upon the payment method selected by the investor.

You can do this by invoking the `createPayment` method:

Netbanking - Handler functionNetbanking - Callback URLUPI - Handler functionUPI - Callback URLDebit Card - Handler functionDebit Card - Callback URLjavascript

copy

```javascript
var data = {
  amount: 1000, // in currency subunits. Here 1000 = 1000 paise, which equals to ₹10
  currency: "INR",// Default is INR. 
  email: 'gaurav.kumar@example.com',
  contact: '9123456780',
  notes: {
    address: 'Ground Floor, SJR Cyber, Laskar Hosur Road, Bengaluru',
  },
  order_id: 'order_Dd3Wbag7QXDuuL', // Order ID generated in Step 1
  method: 'netbanking',
  bank: 'HDFC'
};

var btn = document.querySelector('#btn');
btn.addEventListener('click', function(){ // has to be placed within user initiated context, such as click, in order for popup to open.
  razorpay.createPayment(data);

  razorpay.on('payment.success', function(resp) {
    alert(resp.razorpay_payment_id),
    alert(resp.razorpay_order_id),
    alert(resp.razorpay_signature)}); // will pass payment ID, order ID, and Razorpay signature to success handler.

  razorpay.on('payment.error', function(resp){alert(resp.error.description)}); // will pass error object to error  handler

})
```

**Handler Function Vs. Callback URL**

- **Handler Function**:

  When you use the handler function, the response object of the successful payment (`razorpay_payment_id`, `razorpay_order_id` and `razorpay_signature`) is submitted to the Checkout Form. You need to collect these and send them to your server.
- **Callback URL**:

  When you use a Callback URL, the response object of the successful payment (`razorpay_payment_id`, `razorpay_order_id` and `razorpay_signature`) is submitted to the Callback URL.

1.5 Store Fields in Your Server

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

1.6 Verify the Signature

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

### Related Information

- [Webhooks](/docs/webhooks/)

  (Recommended)
- [Error Codes](/docs/errors/)

  (Recommended)
- [How Payment Gateway Works](/razorpay-docs-md/payment-gateway/how-it-works.md)
- [Payment States](/razorpay-docs-md/payments.md)
- [Settlements](/razorpay-docs-md/settlements.md)
- [Refunds](/razorpay-docs-md/refunds.md)
