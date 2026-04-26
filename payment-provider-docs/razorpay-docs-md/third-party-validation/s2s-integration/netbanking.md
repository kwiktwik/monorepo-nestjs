<!-- Source: https://razorpay.com/docs/payments/third-party-validation/s2s-integration/netbanking -->

In the TPV integration flow, Razorpay maps the customer's bank accounts so that the payment is processed only from their registered bank accounts.

## Prerequisites

- Contact our [Support Team](https://razorpay.com/support/#raise-a-request)

  to get this feature enabled for your account.
- Keep the API key (combination of `Key_Id` and `Key_Secret`) handy for integration.
- [Generate API Keys from the Dashboard](/razorpay-docs-md/api/authentication.md#generate-api-keys)

  if you have not done already.
- Configure the [payment capture settings](/razorpay-docs-md/payments/capture-settings.md)

  on the Dashboard.

## Integration

Given below are the steps:

1. [Collect Customer Bank Account Details](/razorpay-docs-md/third-party-validation/s2s-integration/netbanking.md#step-1-collect-customer-bank-account-details)
2. [Create an Order](/razorpay-docs-md/third-party-validation/s2s-integration/netbanking.md#step-2-create-an-order)
3. [Create a Payment](/razorpay-docs-md/third-party-validation/s2s-integration/netbanking.md#step-3-create-a-payment)
4. [Store Fields in Your Server](/razorpay-docs-md/third-party-validation/s2s-integration/netbanking.md#step-4-store-fields-in-your-server)
5. [Verify the Signature](/razorpay-docs-md/third-party-validation/s2s-integration/netbanking.md#step-5-verify-the-signature)

### Step 1: Collect Customer Bank Account details

Collect the customer's bank details or UPI ID at the time of registration.

### Step 2: Create an Order

Pass the bank account details to the `bank_account` array of the Orders API:

POST

/orders

Given below is the sample code when `method` is `netbanking`.

If the user selects the payment method within the Razorpay UI, there is no need to include the `method` field. Below is a sample code for reference.

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

### Step 3: Create a Payment

POST

/payments/create/json

CurlJavaPythonGoPHPRubyNode.js.NETResponse

copy

```bash
curl -u <YOUR_KEY_ID>:<YOUR_KEY_SECRET> \
-X POST https://api.razorpay.com/v1/payments/create/json \
-H "Content-Type: application/json" \
 -d '{
  "amount": "100",
  "currency": "INR",
  "email": "gaurav.kumar@example.com",
  "contact": "9000090000",
  "order_id": "order_GAWN9beXgaqRyO",
  "method": "netbanking",
  "bank": "HDFC"
}'
```

#### Request Parameters

amount

mandatory

`integer` The transaction amount expressed in paise (currency supported is INR). For example, for an actual amount of ₹1, this field's value should be `100`.

currency

mandatory

`string` The currency in which the transaction should be made. You can create Orders in **INR** only.

order\_id

mandatory

`string` Unique identifier of the order created in the previous step.

method

mandatory

`string` The payment method used to make the payment. Possible value: `netbanking`

bank

mandatory

`string` The customer's bank code. For example, `HDFC`.

email

mandatory

`string` The customer's email address.

contact

mandatory

`string` The customer's phone number.

#### Response Parameters

If the payment request is valid, the response contains the following fields:

razorpay\_payment\_id

`string` Unique identifier of the payment. Present for all responses.

next

`array` A list of action objects available to you to continue the payment process. Present when the payment requires further processing.

action

`string` An indication of the next step available to you to continue the payment process. Possible values:

- `redirect` - Use this URL to redirect the customer to the bank page.
- `poll` - A payment request notification is sent to the customer's UPI PSP app.

url

`string` URL to be used for the action indicated.

### Step 4: Store Fields in Your Server

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

### Step 5: Verify the Signature

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
