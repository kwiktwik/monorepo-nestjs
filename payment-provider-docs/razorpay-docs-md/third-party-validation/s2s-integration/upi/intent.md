<!-- Source: https://razorpay.com/docs/payments/third-party-validation/s2s-integration/upi/intent -->

You can collect payments using the UPI Intent Flow. In this flow, when customer selects UPI as the payment method, the list of UPI PSP apps is displayed. When the customer selects their preferred app, it opens automatically. They can complete the payment on the UPI PSP app.

## Best Practices

Following are a few of the best practices to be followed to accept online payments using UPI Intent Flow:

1. **Do not change Intent URL**
   Do not make changes to the intent URL shared by Razorpay as part of the API response. Making changes to the intent URL can lead to payment failure.
2. **Host UPI apps**
   It is recommended to host the UPI apps on your page/app instead of just hosting the Intent URI where the native Android drawer shows the apps. This improves conversion.
3. **Rank UPI Apps by Success Rate**
   Show the UPI PSP apps in the order of their success rate.
4. **Mobile site**
   If you have higher traffic via mobile site, make sure you provide the option of UPI intent payment to your users using [our m-site integration](/razorpay-docs-md/payment-methods/upi/google-pay/custom-integration.md)   . This will help you achieve better success rates.
5. **Gpay SDK**
   If your UPI transaction volumes are high, you can also explore integrating [Gpay SDK](/razorpay-docs-md/payment-methods/upi/google-pay.md#android-integration-using-google-pay-sdk)   . This provides a better user experience and about a 3-5% improvement in success rate.

## Prerequisites

- Contact our [Support Team](https://razorpay.com/support/#raise-a-request)

  to get this feature enabled for your account.
- Keep the API key (combination of `Key_Id` and `Key_Secret`) handy for integration.
- [Generate API Keys from the Dashboard](/razorpay-docs-md/api/authentication.md#generate-api-keys)

  if you have not done already.
- Configure the [payment capture settings](/razorpay-docs-md/payments/capture-settings.md)

  on the Dashboard.

## UPI Intent Flow

Following is the process for accepting payments using the UPI Intent Flow:

Customers need not enter VPA or phone number as these details are pre-filled and submitted along with the other payment details. While making the payment, customers select the UPI PSP app on your app. The UPI PSP app is launched automatically on their mobile devices, where the payment is completed.

1. The customer selects UPI as the payment method.
2. The customer chooses their preferred UPI PSP app from the list.
3. The UPI PSP app opens automatically and the customer completes the payment.

## Integration Steps

1. [Create an order](/razorpay-docs-md/third-party-validation/s2s-integration/upi/intent.md#step-1-create-an-order)

   .
2. [Initiate Payment using the intent URL](/razorpay-docs-md/third-party-validation/s2s-integration/upi/intent.md#step-2-initiate-a-payment)

   .
3. [Store Fields in Your Server](/razorpay-docs-md/third-party-validation/s2s-integration/upi/intent.md#step-3-store-fields-in-your-server)

   .
4. [Verify the Signature](/razorpay-docs-md/third-party-validation/s2s-integration/upi/intent.md#step-4-verify-the-signature)

   .

### Step 1: Create an Order

POST

/orders

Given below is the sample code when `method` is `upi`.

If the user selects the payment method within the Razorpay UI, there is no need to include the `method` field. Below is a sample code for reference.

#### Request Parameters

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

### Step 2: Initiate a Payment

POST

/payments/create/upi

RequestJavaPythonGoPHPRubyNode.js.NETResponse

copy

```bash
curl -u <YOUR_KEY_ID>:<YOUR_KEY_SECRET> \
  -X POST https://api.razorpay.com/v1/payments/create/upi \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100,
    "currency": "INR",
    "order_id": "order_Ee0biRtLOqzRjP",
    "email": "gaurav.kumar@example.com",
    "contact": "9000090000",
    "method": "upi",
    "ip": "192.168.0.103",
    "referer": "http",
    "user_agent": "Mozilla/5.0",
    "description": "Test flow",
    "notes": {
      "purpose": "UPI test payment"
    },
    "upi": {
      "flow" : "intent"
    }
  }'
```

**Do Not Make Changes to Link Received in Response**

Do not make changes to the link you receive in the response. This is the Razorpay Intent URL. Making changes to this URL can lead to payment failure or other unexpected errors with the payment.

#### Request Parameters

Following are the request parameters for the API:

amount

mandatory

`integer` The amount associated with the payment in the smallest unit of the supported currency. For example, 2000 means ₹20.

currency

mandatory

`string` ISO code of the currency associated with the payment amount. In this case, it is `INR`.

order\_id

mandatory

`string` Unique identifier of the order obtained from the response of the previous step.

method

mandatory

`string` The payment method used to make the payment. Possible values:

- `netbanking`
- `upi`

notes

optional

`json object` Key-value pair used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

description

optional

`string` Descriptive text of the payment.

contact

mandatory

`string` Phone number of the customer.

email

mandatory

`string` Email address of the customer.

callback\_url

optional

`string` URL where Razorpay will submit the final payment status.

ip

mandatory

`string` The client's browser IP address. For example, **117.217.74.98**

referer

mandatory

`string` Value of the `referer` header passed by the client's browser. For example, **<https://example.com/>**.

user\_agent

mandatory

`string` Value of the `user_agent` header passed by client's browser. For example, **Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36**

upi

mandatory

Details of the UPI payment

flow

`string` Type of the UPI method. In this case, it is `intent`.

You will get the UPI Intent URI as part of the payment response.

To pass the payment data to the respective UPI app and to initiate the payment, use the following code:

Pass data to UPI app

copy

```javascript
Intent i = new Intent(Intent.ACTION_VIEW);
        i.setData(Uri.parse(url)); //uri from the create S2S payment response
        i.setPackage(packageName); //package name from the `upi://pay` intent response

activity.startActivityForResult(i,2561); //unique activity code to get the callback
```

### Step 3: Store Fields in Your Server

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

### Step 4: Verify the Payment Signature

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

### Related Information

- [Webhooks](/docs/webhooks/)

  (Recommended)
- [Error Codes](/docs/errors/)

  (Recommended)
- [How Payment Gateway Works](/razorpay-docs-md/payment-gateway/how-it-works.md)
- [Payment States](/razorpay-docs-md/payments.md)
- [Settlements](/razorpay-docs-md/settlements.md)
- [Refunds](/razorpay-docs-md/refunds.md)
