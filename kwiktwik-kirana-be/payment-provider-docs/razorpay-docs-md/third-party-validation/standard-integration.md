<!-- Source: https://razorpay.com/docs/payments/third-party-validation/standard-integration -->

[Third-Party Validation (TPV)](/razorpay-docs-md/third-party-validation.md) of bank accounts is a mandatory requirement for merchants in the BFSI (Banking, Financial Services and Insurance) sector dealing with Securities, Broking and Mutual Funds. As per Securities and Exchange Board of India (SEBI) guidelines, transactions must be made by the customers **only** from those bank accounts, which are provided when they registered with your business.

Prerequisites

Before you integrate TPV on Razorpay Standard integration, you should fulfill the following requirements:

1. Set up your [Razorpay account](/razorpay-docs-md/set-up.md)   , if you have not done already.
2. Contact your dedicated support POC to enable the TPV feature for your account.
3. [Generate API keys](/razorpay-docs-md/api/authentication.md#generate-api-keys)

   required to authenticate API requests sent to Razorpay servers.
4. Check the [best practices](/razorpay-docs-md/third-party-validation/best-practices.md)   .

## 1. Build Integration

In the TPV integration flow, Razorpay maps the customers' bank accounts to ensure that the payment is processed only from their registered bank accounts. Follow the steps given below:

1.1 Collect Investor Bank Account details

You should collect the bank account details provided by the investor at the time of registration.

1.2 Create an Order

Pass the investor bank account details to the `bank_account` array of the Orders API. You can choose to make the investor pay using a certain payment method or permit them to choose any of the supported payment method, that is, netbanking, UPI or debit card.

POST

/orders

Scenario 1: Method Parameter is Passed

The investor needs to pay using the payment method specified by you in the order. For example, if you want the investor to pay using UPI, you must pass `method=upi`.

Netbanking

Given below is the sample code when the `method` is `netbanking`.

Debit Card

Given below is the sample code when the `method` is `card`.

UPI

Given below is the sample code when the `method` is `upi`.

Scenario 2: Method Parameter is Not Passed

If you want the investor to select any of the payment method, do not pass the `method` field. This way, they can choose netbanking, debit card or UPI to make the payment, as per their convenience.

#### Request and Response Parameters

Create a request payload using the following attributes:

Request Parameters

Response Parameters

amount

mandatory

`integer` The transaction amount expressed in paise (currency supported is INR). For example, for an actual amount of ₹1, the value of this field should be `100`.

currency

mandatory

`string` The currency in which the transaction should be made. You can create Orders in **INR** only.

receipt

optional

`string` Receipt number that corresponds to this Order, set for your internal reference. Maximum length is 40 characters.

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

Details of the bank account that the investor has provided at the time of registration.

account\_number

mandatory

`string` The bank account number from which the investor should make the payment. For example, `765432123456789` Payments will not be processed for an incorrect account number.

name

mandatory

`string` The name linked to the bank account. For example, `Gaurav Kumar`.

ifsc

mandatory

`string` The bank IFSC. For example, `HDFC0000053`.

1.3 Add Checkout Code

Send the `order_id` obtained in the response of the previous step along with the other Checkout attributes to trigger Razorpay Checkout.

Following are two sample codes for Checkout:

With Handler Function

With Callback URL

- On successful payment, your web page is displayed to the user.
- On payment failure, the customer is notified of the reason for failure and requested to retry the payment.

Copy-paste the form parameters as `options` in your HTML code:

Checkout with Handler FunctionCheckout with Callback URL

copy

```html
<button id="rzp-button1">Pay</button>
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
<script>
var options = {
    "key": "YOUR_KEY_ID", // Enter the Key ID generated from the Dashboard
    "amount": "50000", // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
    "currency": "INR",
    "name": "Acme Corp",
    "description": "Test Transaction",
    "image": "https://example.com/your_logo",
    "order_id": "order_Dd3Wbag7QXDuuL", //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
    "handler": function (response){
        alert(response.razorpay_payment_id);
        alert(response.razorpay_order_id);
        alert(response.razorpay_signature)
    },
    "prefill": {
        "name": "Gaurav Kumar",
        "email": "gaurav.kumar@example.com",
        "contact": "9000090000"
    },
    "notes": {
        "address": "Razorpay Corporate Office"
    },
    "theme": {
        "color": "#3399cc"
    }
};
var rzp1 = new Razorpay(options);
rzp1.on('payment.failed', function (response){
        alert(response.error.code);
        alert(response.error.description);
        alert(response.error.source);
        alert(response.error.step);
        alert(response.error.reason);
        alert(response.error.metadata.order_id);
        alert(response.error.metadata.payment_id);
});
document.getElementById('rzp-button1').onclick = function(e){
    rzp1.open();
    e.preventDefault();
}
</script>
```

Know more about the [Checkout Form Fields](/razorpay-docs-md/payment-gateway/web-integration/standard/integration-steps.md#checkout-options).

**Handy Tips**

- The open method of the Razorpay object (`rzp1.open()`) should be invoked by your site's JavaScript. This may or may not be a user-driven action such as a click.
- UPI Intent Apps will appear on the standard checkout if the method is `upi` in the Orders API.

1.4 Handle Payment Success and Failure

The way you handle payment success and failure scenarios depends on the Checkout sample code you opted for in the previous step.

#### Checkout with Handler Function

If you used **Sample Code with Handler Function**:

On Payment Success

On Payment Failure

Investor sees your application web page, and the Checkout returns the response object of the successful payment (`razorpay_payment_id`, `razorpay_order_id` and `razorpay_signature`). You need to collect these and send them to your server.

Success Handling Code

copy

```javascript
"handler": function (response){
alert(response.razorpay_payment_id);
alert(response.razorpay_order_id);
alert(response.razorpay_signature)}
```

#### Checkout with Callback URL

If you used the **Sample Code with the Callback URL**:

On Payment Success

On Payment Failure

When you use a Callback URL, the response object of the successful payment (`razorpay_payment_id`,`razorpay_order_id` and `razorpay_signature`) is submitted to the Callback URL. Only successful authorisations are auto-submitted.

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

1.6 Verify Signature

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

## 2. Test Integration

After the integration is complete, a **Pay** button will appear on your webpage/app.

Click the button and make a test transaction to ensure the integration is working as expected. You can start accepting actual payments from your customers once the test is successful.

You can make test payments using netbanking, card or UPI payment methods configured at the Checkout.

**Watch Out!**

This is a mock payment page that uses your test API keys, test card and payment details.

- Ensure you have entered only your [Test Mode API keys](/razorpay-docs-md/dashboard/account-settings/api-keys.md#generate-api-keys)

  in the Checkout code.
- Test mode features a mock bank page with **Success** and **Failure** buttons to replicate the live payment experience.
- No real money is deducted due to the usage of test API keys. This is a simulated transaction.

## 3. Go-Live

Consider these steps before taking the integration live.

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

After payment is `authorised`, you need to capture it to settle the amount to your bank account as per the settlement schedule. Payments that are not captured are auto-refunded after a fixed time.

**Watch Out**

- You should deliver the products or services to your customers only after the payment is captured. Razorpay automatically refunds all the uncaptured payments.
- You can track the payment status using our [Fetch a Payment API](/razorpay-docs-md/api/payments.md#fetch-a-payment)

  or webhooks.

#### How to Capture Payments

- **Auto-capture payments (recommended)**

  Authorised payments can be automatically captured. You can auto-capture all payments [using global settings](/razorpay-docs-md/payments/capture-settings.md#auto-capture-all-payments)

  on the Dashboard.

**Watch Out!**

Payment capture settings work only if you have integrated with Orders API on your server side. Know more about the [Orders API](/razorpay-docs-md/api/orders.md#create-an-order).

- **Manually capture payments**

  Each authorised payment can also be captured individually. You can manually capture payments using:
  - [Payment Capture API](/razorpay-docs-md/api/payments.md#capture-a-payment)
  - [Dashboard](/razorpay-docs-md/payments/dashboard.md#manually-capture-payments)

Know more about [Capture Settings for payments](/razorpay-docs-md/payments/capture-settings.md).

### Related Information

- [Webhooks](/docs/webhooks/)

  (Recommended)
- [Error Codes](/docs/errors/)

  (Recommended)
- [How Payment Gateway Works](/razorpay-docs-md/payment-gateway/how-it-works.md)
- [Payment States](/razorpay-docs-md/payments.md)
- [Settlements](/razorpay-docs-md/settlements.md)
- [Refunds](/razorpay-docs-md/refunds.md)
