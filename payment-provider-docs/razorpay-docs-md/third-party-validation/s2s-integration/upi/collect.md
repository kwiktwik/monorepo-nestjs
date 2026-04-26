<!-- Source: https://razorpay.com/docs/payments/third-party-validation/s2s-integration/upi/collect -->

With UPI payments, your customers can make payments using a Virtual Payment Address (VPA) without the need to enter the bank account details. In the UPI Collect flow, customers enter their registered VPA at checkout, open the UPI PSP app and complete the payment.

**UPI Collect Flow Deprecated**

According to NPCI guidelines, the UPI Collect flow is being deprecated effective 28 February 2026. Customers can no longer make payments or register UPI mandates by manually entering VPA/UPI id/mobile numbers.

**Exemptions:** UPI Collect will continue to be supported for:

- MCC 6012 & 6211 (IPO and secondary market transactions).
- iOS mobile app and mobile web transactions.
- UPI Mandates (execute/modify/revoke operations only)
- eRupi vouchers.
- PACB businesses (cross-border/international payments).

**Action Required:**

- If you are a new Razorpay user, use [UPI Intent](/razorpay-docs-md/payment-gateway/s2s-integration/payment-methods/upi/intent.md)  .
- If you are an existing Razorpay user not covered by exemptions, you must migrate to UPI Intent or UPI QR code to continue accepting UPI payments. For detailed migration steps, refer to the [migration documentation](/docs/announcements/upi-collect-migration/s2s-integration/)  .

**NPCI Restrictions for UPI Collect Flow**

As per NPCI guidelines, the following MCC codes are restricted and cannot accept UPI Collect payments:

Restricted MCC Codes

## Best Practices

Following are a few of the best practices to be followed to accept online payments using UPI Collect Flow:

1. You should validate the VPA before initiating the payment request. Know more about [VPA Validation](/razorpay-docs-md/payment-gateway/web-integration/custom/features/validate-vpa.md)   .
2. You should add a custom UPI Collect expiry based on the business requirement to provide enough time for the customer to complete the payment.
3. You should use the [Saved VPA](/razorpay-docs-md/payment-methods/upi/saved-vpa.md)

   feature provided by Razorpay to provide a better customer experience and have a better conversion.

## Prerequisites

- Contact our [Support Team](https://razorpay.com/support/#raise-a-request)

  to get this feature enabled for your account.
- Keep the API key (combination of `Key_Id` and `Key_Secret`) handy for integration.
- [Generate API Keys from the Dashboard](/razorpay-docs-md/api/authentication.md#generate-api-keys)

  if you have not done already.
- Configure the [payment capture settings](/razorpay-docs-md/payments/capture-settings.md)

  on the Dashboard.

## UPI Collect Flow

Following is the process for accepting payments using the UPI Collect Flow:

1. The customer selects UPI as the payment method and enters their VPA on your app or website. Razorpay validates the VPA.
2. The customer saves the entered VPA details while completing the payment. Razorpay saves the valid VPA details as **tokens**.
3. The next time the customer wants to make a payment using VPA, the customer can select the saved VPA and complete the payment.

## Integration Steps

1. [Create a Payment and a VPA Token](/razorpay-docs-md/third-party-validation/s2s-integration/upi/collect.md#1-create-a-payment-and-a-vpa-token)
2. [Create Payments Using Tokens](/razorpay-docs-md/third-party-validation/s2s-integration/upi/collect.md#2-create-payments-using-tokens)

### 1. Create a Payment and a VPA Token

Follow these steps to create and save valid VPA tokens in the payment flow:

1. [Create a customer or fetch the customer for whom VPA should be saved.](/razorpay-docs-md/third-party-validation/s2s-integration/upi/collect.md#step-11-create-a-customer)
2. [Create an order.](/razorpay-docs-md/third-party-validation/s2s-integration/upi/collect.md#step-12-create-an-order)
3. [Validate the VPA entered by the customer.](/razorpay-docs-md/third-party-validation/s2s-integration/upi/collect.md#step-13-validate-the-vpa)
4. [Initiate a payment.](/razorpay-docs-md/third-party-validation/s2s-integration/upi/collect.md#step-14-initiate-a-payment)

### Step 1.1: Create a Customer

Skip this step if the customer is already created for your account.

Create a customer whose VPAs should be saved with details such as `email` and `contact`.

The following endpoint creates or add a customer with basic details such as name and contact details. You can use this API for various Razorpay Solution offerings.

POST

/customers

#### Request Parameters

name

optional

`string` Customer's name. Alphanumeric value with period (.), apostrophe ('), forward slash (/), at (@) and parentheses are allowed. The name must be between 3-50 characters in length. For example, `Gaurav Kumar`.

contact

optional

`string` The customer's phone number. A maximum length of 15 characters including country code. For example, `+919876543210`.

email

optional

`string` The customer's email address. A maximum length of 64 characters. For example, `gaurav.kumar@example.com`.

fail\_existing

optional

`string` Possible values:

- `1` (default): If a customer with the same details already exists, throws an error.
- `0`: If a customer with the same details already exists, fetches details of the existing customer.

gstin

optional

`string` Customer's GST number, if available. For example, `29XAbbA4369J1PA`.

notes

optional

`object` This is a key-value pair that can be used to store additional information about the entity. It can hold a maximum of 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

### Step 1.2: Create an Order

You need to create an order before initiating the payment.

POST

/orders

Given below is the sample code when `method` is `upi`.

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

### Step 1.3: Validate the VPA

Collect the VPA details of the customer and validate it as follows:

POST

/payments/validate/vpa

CurlJavaPythonGoPHPRubyNode.js.NETResponse

copy

```bash
curl -u <YOUR_KEY_ID>:<YOUR_KEY_SECRET> \
-X POST https://api.razorpay.com/v1/payments/validate/vpa \
-H "Content-Type: application/json" \
-d '{
  "vpa": "gauravkumar@exampleupi"
}'
```

#### Request Parameters

vpa

mandatory

`string` The virtual payment address (VPA) you want to validate. For example, `gauravkumar@exampleupi`.

**Deprecation Notice**

UPI Collect is deprecated effective 28 February 2026. This tab is applicable only for exempted businesses. If you are not covered by the exemptions, refer to the [migration documentation](/docs/announcements/upi-collect-migration/s2s-integration/) to switch to UPI Intent.

### Step 1.4: Initiate a Payment

Once validated, save the VPA provided by the customer. Create a payment with the valid `vpa` as follows:

POST

/payments/create/upi

#### Request Parameters

amount

mandatory

`integer` The amount associated with the payment in the smallest unit of the supported currency. For example, 2000 means ₹20.

currency

mandatory

`string` ISO code of the currency associated with the payment amount. Only `INR` is supported.

order\_id

mandatory

`string` Unique identifier of the order, obtained in the response of the previous step.

notes

optional

`json object` Key-value pairs that can hold additional information about the payment. Refer to the [Notes](/razorpay-docs-md/api/understand.md#notes) section of the API Reference Guide.

description

optional

`string` Descriptive text of the payment.

contact

mandatory

`string` Phone number of the customer.

email

mandatory

`string` Email address of the customer.

save

`boolean` Specifies if the VPA should be stored as tokens. Possible values:

- `true`: Saves the VPA details.
- `false`(default): Does not save the VPA details.

customer\_id

mandatory

`string` Unique identifier of the customer, obtained from the response of [Step 1](/razorpay-docs-md/third-party-validation/s2s-integration/upi/collect.md#step-1-create-a-customer).

callback\_url

optional

`string` URL where Razorpay will submit the final payment status.

ip

mandatory

`string` The client's browser IP address. For example, **117.217.74.98**

referer

mandatory

`string` Value of `referer` header passed by the client's browser. For example, **<https://example.com/>**

user\_agent

mandatory

`string` Value of `user_agent` header passed by the client's browser.
For example, **Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36**

upi

Details of the expiry of the UPI link

flow

mandatory

`string` Specify the type of the UPI payment flow.
 Possible values:

- `collect` (default)
- `intent`

vpa

mandatory

`string` VPA of the customer where the collect request will be sent.

expiry\_time

mandatory

`integer` Period of time (in minutes) after which the link will expire. The default value is **5**.

## 2. Create Payments Using Tokens

On a repeat transaction, customers can make payments using the VPA tokens, which were saved earlier. Follow these steps to create a payment using a saved token:

1. [Create an Order.](/razorpay-docs-md/third-party-validation/s2s-integration/upi/collect.md#step-21-create-an-order)
2. [Fetch all tokens of a customer.](/razorpay-docs-md/third-party-validation/s2s-integration/upi/collect.md#step-22-fetch-vpa-tokens-of-a-customer)
3. [Initiate a payment with the token selected by the customer.](/razorpay-docs-md/third-party-validation/s2s-integration/upi/collect.md#step-23-initiate-a-payment-using-vpa-token)
4. [Verify Payment Signature](/razorpay-docs-md/third-party-validation/s2s-integration/upi/collect.md#step-24-verify-the-payment-signature)

### Step 2.1: Create an Order

You need to create an order before initiating the payment.

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

### Step 2.2: Fetch VPA Tokens of a Customer

You can retrieve all the card and VPA tokens of a customer if they have been previously saved.

GET

/customers/:customer\_id/tokens

### Step 2.3: Initiate a Payment Using VPA Token

To initiate a payment using a VPA token, pass the `customer_id` and `token` parameters instead of the `vpa` parameter.

POST

/payments/create/upi

CurlJavaPythonGoPHPRubyNode.js.NETResponse

copy

```bash
curl -u <YOUR_KEY_ID>:<YOUR_KEY_SECRET> \
-X POST https://api.razorpay.com/v1/payments/create/upi \
-H "Content-Type: application/json" \
-d '{
  "amount": 100,
  "currency": "INR",
  "order_id": "order_ExhN1Y0100Dkjw",
  "email": "gaurav.kumar@example.com",
  "contact": "9000090000",
  "method": "upi",
  "customer_id": "cust_EIW4T2etiweBmG",
  "token": "token_EeO65VIv8BXZg5"
  "ip": "192.168.0.103",
  "referer": "http",
  "user_agent": "Mozilla/5.0",
  "description": "Test flow",
  "notes": {
    "note_key": "value1"
  }
}'
```

#### Request Parameters

amount

mandatory

`integer` The amount associated with the payment in the smallest unit of the supported currency. For example, 2000 means ₹20.

currency

mandatory

`string` ISO code of the currency associated with the payment amount. Only `INR` is supported.

order\_id

mandatory

`string` Unique identifier of the order, obtained in the response of the previous step.

customer\_id

mandatory

`string` Unique identifier of the customer.

token

mandatory

`string` Token of the saved VPA.

notes

optional

`json object` Key-value pairs that can hold additional information about the payment. Refer to the [Notes](/razorpay-docs-md/api/understand.md#notes) section of the API Reference Guide.

description

optional

`string` Descriptive text of the payment.

contact

mandatory

`string` Phone number of the customer.

email

mandatory

`string` Email address of the customer.

customer\_id

mandatory

`string` Unique identifier of the customer.

callback\_url

optional

`string` URL where Razorpay will submit the final payment status.

ip

mandatory

`string` The client's browser IP address. For example, **117.217.74.98**

referer

mandatory

`string` Value of `referer` header passed by the client's browser. For example, **<https://example.com/>**

user\_agent

mandatory

`string` Value of `user_agent` header passed by the client's browser.
For example, **Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36**

### Step 2.4: Verify the Payment Signature

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

After the integration is complete, a **Pay** button will appear on your webpage/app.

![Test integration on your webpage/app](https://razorpay.com/docs/payments/third-party-validation/s2s-integration/upi/build/browser/assets/images/test-int.gif)

Click the button and make a test transaction to ensure the integration is working as expected. You can start accepting actual payments from your customers once the test is successful.

You can make test payments using one of the payment methods configured at the Checkout.

**Watch Out!**

This is a mock payment page that uses your test API keys, test card and payment details.

- Ensure you have entered only your [Test Mode API keys](/razorpay-docs-md/dashboard/account-settings/api-keys.md#generate-api-keys)

  in the Checkout code.
- Test mode features a mock bank page with **Success** and **Failure** buttons to replicate the live payment experience.
- No real money is deducted due to the usage of test API keys. This is a simulated transaction.

### Supported Payment Methods

Following are all the payment modes that the customer can use to complete the payment on the Checkout. Some of them are available by default, while others require approval from us. Raise a request from the Dashboard to enable such payment methods.

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

### Related Information

- [Webhooks](/docs/webhooks/)

  (Recommended)
- [Error Codes](/docs/errors/)

  (Recommended)
- [How Payment Gateway Works](/razorpay-docs-md/payment-gateway/how-it-works.md)
- [Payment States](/razorpay-docs-md/payments.md)
- [Settlements](/razorpay-docs-md/settlements.md)
- [Refunds](/razorpay-docs-md/refunds.md)
