<!-- Source: https://razorpay.com/docs/payments/payment-gateway/web-integration/custom/features/native-otp -->

Native OTP helps generate and verify OTP on the customers’ browser without redirecting them to their bank's ACS page for authentication. Since there will be no redirection using the customers’ browser, it will reduce the dependency on the customers’ browser network, reduce the drop-off rates, and give a seamless consumer experience for card transactions.

## Advantages

- Increase success rates by up to 4%.
- Reduce payment failures due to low internet speeds.
- Avoid failures due to redirects to bank pages.
- Offer a consistent experience on mobile and web checkout.

## Prerequisites

- Verify that you are PCI compliant to accept and process customers' card details. Know more about [PCI compliance](https://www.pcicomplianceguide.org/faq/#1)  . The compliance certificate should be updated as per the yearly renewal cycle.
- Raise a request with our [Support](https://razorpay.com/support/#request)

  team to enable this feature on your Checkout page.
- Know about the [Razorpay Payment Flow](/razorpay-docs-md/payment-gateway/how-it-works.md)  .
- Integrate with [Razorpay Custom Checkout](/razorpay-docs-md/payment-gateway/web-integration/custom/build-integration.md)  .

## Integration Steps

Follow the integration steps given below:

**1.1** [Create an Order in Server](/razorpay-docs-md/payment-gateway/web-integration/custom/features/native-otp.md#11-create-an-order-in-server).

**1.2** [Integrate the getCardFlows Method](/razorpay-docs-md/payment-gateway/web-integration/custom/features/native-otp.md#12-integrate-the-getcardflows-method).

**1.3** [Create a Payment](/razorpay-docs-md/payment-gateway/web-integration/custom/features/native-otp.md#13-create-a-payment).

**1.4** [Display OTP UI](/razorpay-docs-md/payment-gateway/web-integration/custom/features/native-otp.md#14-display-otp-ui).

**1.5** [Perform OTP Authentication](/razorpay-docs-md/payment-gateway/web-integration/custom/features/native-otp.md#15-perform-otp-authentication).

**1.6** [Verify Payment Signature](/razorpay-docs-md/payment-gateway/web-integration/custom/features/native-otp.md#16-verify-payment-signature).

### 1.1 Create an Order in Server

Order is an important step in the payment process.

- An order should be created for every payment.
- You can create an order using the [Orders API](/razorpay-docs-md/payment-gateway/web-integration/custom/features/native-otp.md#api-sample-code)  . It is a server-side API call.  Know how to [authenticate](/razorpay-docs-md/api/authentication.md#generate-api-keys)

  Orders API.
- The order\_id received in the response should be passed to the checkout. This ties the Order with the payment and secures the request from being tampered.

**Watch Out!**

Payments made without an `order_id` cannot be captured and will be automatically refunded. You must create an order before initiating payments to ensure proper payment processing.

#### API Sample Code

The following is a sample API request and response for creating an order:

CurlJavaPythonPHPRubyNode.js.NETResponse

copy

```bash
curl -X POST https://api.razorpay.com/v1/orders
-u [YOUR_KEY_ID]:[YOUR_KEY_SECRET]
-H 'content-type:application/json'
-d '{
    "amount": 50000,
    "currency": "INR",
    "receipt": "rcptid_11",
    "partial_payment": true,
    "first_payment_min_amount": 23000
}'
```

#### Request Parameters

Here is the list of parameters and their description for creating an order:

amount

mandatory

`integer` Payment amount in the smallest currency sub-unit. For example, if the amount to be charged is ₹299, then pass `29900` in this field. In the case of three decimal currencies, such as KWD, BHD and OMR, to accept a payment of 295.991, pass the value as 295990. And in the case of zero decimal currencies such as JPY, to accept a payment of 295, pass the value as 295.

**Watch Out!**

As per payment guidelines, you should pass the last decimal number as 0 for three decimal currency payments. For example, if you want to charge a customer 99.991 KD for a transaction, you should pass the value for the amount parameter as `99990` and not `99991`.

currency

mandatory

`string` The currency in which the transaction should be made. See the [list of supported currencies](/razorpay-docs-md/international-payments.md#supported-currencies). Length must be 3 characters.

**Handy Tips**

Razorpay has added support for zero decimal currencies, such as JPY and three decimal currencies, such as KWD, BHD and OMR, allowing businesses to accept international payments in these currencies. Know more about [Currency Conversion](/razorpay-docs-md/international-payments/currency-conversion.md)

(May 2024).

receipt

optional

`string` Your receipt id for this order should be passed here. Maximum length is 40 characters.

notes

optional

`json object` Key-value pair that can be used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

partial\_payment

optional

`boolean` Indicates whether the customer can make a partial payment. Possible values:

- `true`: The customer can make partial payments.
- `false` (default): The customer cannot make partial payments.

id

mandatory

`string` Unique identifier of the customer. For example, `cust_1Aa00000000004`.

Know more about [Orders API](/razorpay-docs-md/api/orders.md).

#### Response Parameters

Descriptions for the response parameters are present in the [Orders Entity](/razorpay-docs-md/api/orders/entity.md) table.

#### Error Response Parameters

The error response parameters are available in the [API Reference Guide](/razorpay-docs-md/api/orders/create.md).

### 1.2 Integrate the getCardFlows Method

Validating the authentication type is critical. This will help you set the value of `auth_type` during [payment creation](/razorpay-docs-md/payment-gateway/web-integration/custom/features/native-otp.md#13-create-a-payment).

**Watch Out!**

If the value of `auth_type` is sent as an OTP for a BIN that is not validated successfully, the transaction will fail.

Use the `getCardFlows` method given below to check for the available flows on a given card number:

getcardsflow

copy

```java
razorpay.getCardFlows('438628', (flows) => {
      console.log(flows.otp);
    });
```

Use the `getCardFeatures` method given below to get the card features:

getCardFeatures

copy

```java
{
    "flows": {
        "otp": true,
        "recurring": false,
        "iframe": false,
        "emi": true
    },
    "type": "credit",
    "issuer": "HDFC",
    "network": "Diners Club",
    "cobranding_partner": null,
    "country": "IN",
    "http_status_code": 200
}
```

### 1.3 Create a Payment

While initiating payment for the card payment method, you must pass an additional parameter within the create payment function if the card flow function response is `otp = true`.

Create a Payment

copy

```java
function createRazorpayPayment (data) {
 rzp.createPayment(data, {
   nativeotp: true
 });
}
```

### 1.4 Display OTP UI

Use the sample code given below to display OTP UI to your customers:

OTP UI

copy

```java
rzp.on('payment.otp.required', function (data) {
 // Show OTP UI
// data = {
//   "metadata": {
//     "issuer": "HDFC",
//     "network": "MC",
//     "last4": "9275",
//     "iin": "512967"
//   },
//   "next": [
//     "otp_submit",
//     "otp_resend"
//   ],
//   "redirect": "https://api.razorpay.com/v1/payments/pay_E1xQsBuIZ02..."
// }
});
```

**Handy Tips**

- If you want to redirect the user to the bank ACS page, you should use the URL present in the response for creating a payment.
- To get post-transaction feedback from the bank page to your website, the callback URL needs to be defined while creating a payment. Razorpay will send the response to the defined callback URL after payment success or failure.

### 1.5 Perform OTP Authentication

After entering the OTP, the customer can perform either:

- [OTP Submit](/razorpay-docs-md/payment-gateway/web-integration/custom/features/native-otp.md#otp-submit)
- [OTP Resend](/razorpay-docs-md/payment-gateway/web-integration/custom/features/native-otp.md#otp-resend)
- [OTP Cancel](/razorpay-docs-md/payment-gateway/web-integration/custom/features/native-otp.md#otp-cancel)

#### OTP Submit

OTP submission is a part of the payment authentication process where the customer submits the OTP received through your application's frontend.

The customer receives the OTP for card payments via their preferred notification medium - SMS or email.

**Handy Tips**

Do not perform any validation on the length of the OTP since this can vary across banks. The OTP, however, should not be blank.

Use the following function to enable customers to submit OTP

OTP Submit

copy

```java
function submitRazorpayOTP (otp) {
 rzp.submitOTP(otp);
}
```

#### OTP Resend

There can be situations when customers must re-enter the OTP sent to them. The issuing bank determines the number of retries that the user is allowed. Given below is the sample code of the OTP Resend function:

OTP Resend

copy

```java
function resendRazorpayOTP () {
 rzp.resendOTP();
}
```

#### OTP Cancel

Customers can cancel the payment based on their requirements. Given below is the sample code of the OTP Cancel function:

OTP Cancel

copy

```java
function cancelRazorpayPayment () {
 rzp.emit('payment.cancel');
}
```

### 1.6 Verify Payment Signature

Once the payment process is completed, Razorpay will make a `POST` request to the `callback_url` on whether the payment was a success or a failure.

You can easily verify the payment signature using our SDKs:

JavaPythonGoPHPRubyNode.js.NET

copy

```java
String secret = "<YOUR_KEY_SECRET>";

JSONObject options = new JSONObject();
options.put("razorpay_order_id", "order_IEIaMR65cu6nz3");
options.put("razorpay_payment_id", "pay_IH4NVgf4Dreq1l");
options.put("razorpay_signature", "0d4e745a1838664ad6c9c9902212a32d627d68e917290b0ad5f08ff4561bc50f");

boolean status =  Utils.verifyPaymentSignature(options, secret);
```

If `razorpay_payment_id` is returned, the payment is successfully created and verified.

**Handy Tips**

A successful transaction results in creating the `razorpay_order_id` in your database. You can mark the corresponding transaction at your end as **paid** and notify the customer of the same.

#### Sample Code

You can use the sample code given below:

Sample Code

copy

```java
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
    <script
      type="text/javascript"
      src="https://checkout.razorpay.com/v1/razorpay.js"
    ></script>
  </head>
  <body>
    <p>Pay Rs. 5000</p>
    <h2>Payment Method</h2>
    <p id="method"></p>
    <button id="rzp-button1">Pay</button>
    <button id="rzp-button2">pop-up top</button>
  </body>

  <script>
    var razorpay = new Razorpay({
      key: 'YOUR_KEY_ID',
      image:
        'https://www.carlogos.org/car-logos/lamborghini-logo-1000x1100-show.png',
      callback_url: 'https://www.google.com/',
      redirect: true,
    });

    razorpay.once('ready', function (response) {
      // console.log(response.methods);
      // document.getElementById("method").innerHTML = JSON.stringify(response.methods);
    });

    razorpay.getCardFlows('438628', (flows) => {
      console.log(flows.otp);
    });

    var data = {
      amount: 100,
      email: 'gaurav.kumar@example.com',
      contact: '9000090000',
      //"order_id": "order_JyhxBsMXOOfJ4c",
      method: 'card',
      'card[name]': 'Gaurav Kumar',
      'card[number]': '4386289407660153',
      'card[cvv]': '566',
      'card[expiry_month]': '10',
      'card[expiry_year]': '26',
    };

    var btn = document.querySelector('#rzp-button1');
    btn.addEventListener('click', function () {
      razorpay.createPayment(data, {
        nativeotp: true,
      });

      razorpay.on('payment.otp.required', function (data) {
        // Show OTP UI
        console.log(data);
      });

      // razorpay.submitOTP('1234');
      //razorpay.resendOTP();
      //razorpay.emit('payment.cancel');
    });

    var btn1 = document.querySelector('#rzp-button2');
    btn1.addEventListener('click', function () {
      razorpay.focus(); // will bring popup to top
    });
  </script>
</html>
```
