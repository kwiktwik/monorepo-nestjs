<!-- Source: https://razorpay.com/docs/payments/payment-gateway/flutter-integration/custom/payment-methods/turbo-upi/integration-noui-tpv -->

Third-party validation (TPV) of bank accounts is mandatory for businesses in the BFSI (Banking, Financial Services and Insurance) sector dealing with Securities, Broking and Mutual Funds. You can accept customer payments by integrating with the Turbo UPI Headless - TPV SDK.

**Watch Out!**

Currently, Flutter SDK is supported only for Android.

Prerequisites

1. Contact our [integrations team](mailto:integrations@razorpay.com)

   to get your mobile number, app, and GitHub account whitelisted to get access to the `https://github.com/upi-turbo/android-turbo-sample-app` - sample app repository.
   - In this repository, you will find the AAR files (libraries for Turbo) and the sample app source code to help you with the integration.
   - The AARs on the main branch are for the UAT environment, and the ones on the prod branch are for the production environment.

   These are the important files in the sample app repo:

   - `app/libs`: All libraries (Bank, SecureComponent and Turbo) common for headless SDK.
   - `app/build.gradle`: All transitive dependencies needed to integrate the Turbo SDK.
2. Integrate with [Razorpay Flutter Custom Integration](/razorpay-docs-md/payment-gateway/flutter-integration/custom/build-integration.md)   .
3. Import the following frameworks:

   - Razorpay Turbo Wrapper Plugin SDK (maven)
   - Razorpay Turbo Core SDK
   - Razorpay SecureComponent SDK
   - Bank SDK
4. Add the following lines to your Android project's `gradle.properties` file:

   - `android.enableJetifier=true`
   - `android.useAndroidX=true`

**Watch Out!**

- `minSDKversion` for using Turbo UPI is currently 19 and cannot be overwritten.
- API Key Usage for Different Environments:
  - Use the `rzp_test_0wFRWIZnH65uny` API key id for testing on the UAT environment.
  - Use the [Razorpay live keys](/razorpay-docs-md/api/authentication.md#live-mode-api-keys)

    for prod testing.
- As a compliance requirement, you need to get approval from Google for **READ\_SMS** permission. Refer [to the Google article](https://support.google.com/googleplay/android-developer/answer/10208820?hl=en)

  for more details.

## 1. Integration Steps

Given below are the steps:

Step 1: Whitelist Customer Bank Accounts *(Optional)*

You can whitelist (also known as allowlist) your customer's bank accounts to ensure that only those accounts are considered during customer onboarding. By whitelisting the accounts at the start, you can avoid the bank account linking during payment. Use the Customer APIs to create customers and add their bank account details.

For example, if a customer, Gaurav, has two bank accounts ABC and XYZ, you can use the APIs to create a customer id and link the bank accounts to that id. You can then pass this customer id at the time of payment.

Follow these steps.

Step 1.1: Create a Customer

Use this endpoint to create or add a customer with basic details such as name and contact details.

RequestSuccess ResponseFailure Response

copy

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X POST https://api.razorpay.com/v1/customers \
-H "Content-Type: application/json" \
-d '{
    "name": "Gaurav Kumar",
    "contact": "9123456780",
    "email": "gaurav.kumar@example.com",
    "fail_existing": "0",
    "notes": {
        "notes_key_1": "Tea, Earl Grey, Hot",
        "notes_key_2": "Tea, Earl Grey… decaf."
    }
}'
```

Request Parameters

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

Response Parameters

id

`string` Unique identifier of the customer. For example, `cust_1Aa00000000004`.

name

`string` Customer's name. Alphanumeric, with period (.), apostrophe ('), forward slash (/), at (@) and parentheses allowed. The name must be between 3-50 characters in length. For example, `Gaurav Kumar`.

contact

`string` The customer's phone number. A maximum length of 15 characters including country code. For example, `+919876543210`.

email

`string` The customer's email address. A maximum length of 64 characters. For example, `gaurav.kumar@example.com`.

gstin

`string` GST number linked to the customer. For example, `29XAbbA4369J1PA`.

notes

`json object` This is a key-value pair that can be used to store additional information about the entity. It can hold a maximum of 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

created\_at

`integer` UNIX timestamp, when the customer was created. For example, `1234567890`.

Step 1.2: Add Customer's Bank Account

The following endpoint adds the customer's bank accounts.

RequestResponse

copy

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X POST https://api.razorpay.com/v1/customers/:customer_id/bank_account \
-H "Content-Type: application/json" \
-d '{
       "ifsc_code": "UTIB0000194",
       "account_number": "11214311215411",
       "beneficiary_name": "Gaurav",
       "beneficiary_address1": "address 1",
       "beneficiary_address2": "address 2",
       "beneficiary_address3": "address 3",
       "beneficiary_address4": "address 4",
       "beneficiary_email": "gaurav.kumar@gmail.com",
       "beneficiary_mobile": "9900990099",
       "beneficiary_city": "Bangalore",
       "beneficiary_state": "KA",
       "beneficiary_country": "IN"
   }'
```

Path Parameter

customer\_id

mandatory

`string` Customer id of the customer whose bank account is to be added.

Request Parameters

account\_number

mandatory

`string` Customer's bank account number. For example, `11214311215411`.

beneficiary\_name

mandatory

`string` The name of the beneficiary associated with the bank account.

beneficiary\_address1

optional

`string` The virtual payment address.

beneficiary\_email

optional

`string` Email address of the beneficiary. For example, `gaurav.kumar@example.com`.

beneficiary\_mobile

optional

`string` Mobile number of the beneficiary.

beneficiary\_city

optional

`string` The city of the beneficiary.

beneficiary\_state

optional

`string` The state of the beneficiary.

beneficiary\_country

optional

`string` The country of the beneficiary.

beneficiary\_pin

optional

`integer` The pin code of the beneficiary's address.

ifsc\_code

mandatory

`string` The IFSC of the bank branch associated with the account.

Response Parameters

bank\_accounts

`array` An array containing bank account details.

id

`string` Unique identifier of the bank account.

entity

`string` The type of entity, which in this case is `bank_account`.

ifsc

`string` The IFSC of the bank branch associated with the account.

bank\_name

`string` The name of the bank.

name

`string` The name associated with the bank account.

notes

`object` Set of key-value pairs that can be used to store additional information about the payment.

account\_number

`integer` Customer's bank account number. For example, `11214311215411`.

Step 2: Create an Order *(Mandatory)*

Pass the investor bank account details to the `bank_account` array of the Orders API. Given below is the sample code when the `method` is `upi`.

RequestResponse

copy

```bash
curl -u <YOUR_KEY_ID>:<YOUR_KEY_SECRET> \
-X POST https://api.razorpay.com/v1/orders \
-H "Content-Type: application/json" \
-d '{
   "amount": 500,
   "method": "upi",
   "receipt": "BILL13375649",
   "currency": "INR",
   "bank_account": {
       "account_number": "765432123456789",
       "name": "Gaurav Kumar",
       "ifsc": "HDFC0000053"
   }
}'
```

Request Parameters

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

Response Parameters

id

`string` Unique identifier of the order.

entity

`string` Indicates the type of entity. Here, it is `order`.

amount

`integer` The order amount represented in the smallest unit of the currency passed. For example, amount = 100 translates to 100 paise, that is ₹1 (default currency is INR).

amount\_paid

`integer` The amount that has been paid.

amount\_due

`integer` The amount that is yet to be paid.

currency

`string` The 3-letter ISO currency code for the payment. Currently, we support INR only.

receipt

`string` A unique identifier of the order entered by the user. For example, `BILL13375649`.

status

`string` The status of the order.

notes

`object` Key-value pair you can use to store additional information about the entity. Maximum of 15 key-value pairs, 256 characters each. For example, "note\_key": "Beam me up Scotty”.

created\_at

`integer` The Unix timestamp at which the order was created.

offer\_id

`string` Unique identifier of the offer.

attempts

`integer` The number of payment attempts, successful and failed, that have been made against this order.

Step 3: Turbo UPI Headless SDK Action

You need to link the customer's UPI account with your app. Use the code samples given below to [fetch the UPI account](/razorpay-docs-md/payment-gateway/flutter-integration/custom/payment-methods/turbo-upi/integration-noui-tpv.md#32-get-customer-s-linked-upi-account).

3.1 Initialise the SDK

Use the code given below to initialise the SDK.

Import Package

copy

```yml
import 'package:razorpay_flutter/razorpay_flutter.dart'; 
// Create a Razorpay instance
razorpay = Razorpay("YOUR_KEY_ID");
```

3.2 Get Customer's Linked UPI Account

Use the following code to fetch your customer's UPI account. If there are no linked UPI accounts, an empty list is returned.

Get Linked UPI Account

copy

```java
razorpay.upiTurbo.getLinkedUpiAccounts(customerMobile: mobileNumber,
    onSuccess: (List<UpiAccount> upiAccounts){
        //Display on boarded UpiAccounts.     
    },
    onFailure: (Error error) {
        //Display error message to user.             
    }
);
```

Request Parameter

Response Parameters

3.3 Link New UPI Account

Use the following code to link the newly created UPI account with your app. This function can be called from anywhere in the application, providing multiple entry points for customers to link their UPI account with your app.

Link New UPI Account

copy

```java
razorpay.upiTurbo.tpv
   .setcustomerMobile(919900990099)
   .setCustomerId(cust_BtQNqzmBlXXXX)
   .setOrderId(order_GAWN9beXgaqRyO)
   .setTpvBankAccount(bankAccount)
   .linkNewUpiAccount();
```

Request Parameters

Parameter Combinations and Descriptions

- Initialise the instance to handle the event using the code given below:

Instantiate

copy

```java
razorpay.on(Razorpay.EVENT_UPI_TURBO_LINK_NEW_UPI_ACCOUNT,
_handleLinkNewUpiAccountFlows);
```

- Handle dynamic responses to perform specific actions, including error handling and interactions with the integration, based on `type` and `action` properties.

**Watch Out!**

It is mandatory to add the import statement within the `linkNewUpiAccount` function for **RazorpayCard** access.

3.4 Submit Method

To accept payments, call Custom Checkout’s `submit` method with the following payload:

Submit Payment Details

copy

```java
Map<String, dynamic> payload = {
"key": "[YOUR_KEY_ID]",
"currency": "INR",
"amount": 100,
"contact": "9000090000",
"method": "upi",
"email": "gaurav.kumar@example.com",
"upi": {
    "flow": "in_app"
 }
};

Map<String, dynamic> turboPayload = {
"upiAccount": getUpiAccountStr(upiAccounts[0]),
"payload": payload,
};
razorpay.submit(turboPayload);
```

Request Parameter

Response Parameters

- Initialise the instance to handle the event using the code given below:

  Instantiate

  copy

  ```java
razorpay.on(Razorpay.EVENT_PAYMENT_SUCCESS, _handlePaymentSuccess);
razorpay.on(Razorpay.EVENT_PAYMENT_ERROR, _handlePaymentError);
```
- Print payment success and error responses by attaching event listeners to payment events as given below:

  Attach Event Listeners

  copy

  ```yml
void _handlePaymentSuccess(Map<dynamic, dynamic> response) {
   print('Payment Success Response : $response');
}

void _handlePaymentError(Map<dynamic, dynamic> response) {
print('Payment Error Response : $response');
}
```

Steps 4: Store Fields in Your Server

A successful payment returns the following fields to the Checkout form.

- You need to store these fields in your server.
- You can confirm the authenticity of these details by verifying the signature in the next step.

Success Callback

copy

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X POST https://api.razorpay.com/v1/customers/:customer_id/bank_account \
-H "Content-Type: application/json" \
-d '{
       "ifsc_code": "UTIB0000194",
       "account_number": "11214311215411",
       "beneficiary_name": "Gaurav",
       "beneficiary_address1": "address 1",
       "beneficiary_address2": "address 2",
       "beneficiary_address3": "address 3",
       "beneficiary_address4": "address 4",
       "beneficiary_email": "gaurav.kumar@gmail.com",
       "beneficiary_mobile": "9900990099",
       "beneficiary_city": "Bangalore",
       "beneficiary_state": "KA",
       "beneficiary_country": "IN"
   }'
```0

Parameters

razorpay\_payment\_id

`string` Unique identifier for the payment returned by Checkout **only** for successful payments.

razorpay\_order\_id

`string` Unique identifier for the order returned by Checkout.

razorpay\_signature

`string` Signature returned by the Checkout. This is used to verify the payment.

Step 5: Verify Signature

This is a mandatory step to confirm the authenticity of the details returned to the Checkout form for successful payments.

To verify the `razorpay_signature` returned to you by the Checkout form:

1. Create a signature in your server using the following attributes:

   - `order_id`: Retrieve the `order_id` from your server. Do not use the `razorpay_order_id` returned by Checkout.
   - `razorpay_payment_id`: Returned by Checkout.
   - `key_secret`: Available in your server. The `key_secret` that was generated from the [Dashboard](/razorpay-docs-md/dashboard/account-settings/api-keys.md#generate-api-keys)     .
2. Use the SHA256 algorithm, the `razorpay_payment_id` and the `order_id` to construct a HMAC hex digest as shown below:

   HMAC Hex Digest

   copy

   ```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X POST https://api.razorpay.com/v1/customers/:customer_id/bank_account \
-H "Content-Type: application/json" \
-d '{
       "ifsc_code": "UTIB0000194",
       "account_number": "11214311215411",
       "beneficiary_name": "Gaurav",
       "beneficiary_address1": "address 1",
       "beneficiary_address2": "address 2",
       "beneficiary_address3": "address 3",
       "beneficiary_address4": "address 4",
       "beneficiary_email": "gaurav.kumar@gmail.com",
       "beneficiary_mobile": "9900990099",
       "beneficiary_city": "Bangalore",
       "beneficiary_state": "KA",
       "beneficiary_country": "IN"
   }'
```1
3. If the signature you generate on your server matches the `razorpay_signature` returned to you by the Checkout form, the payment received is from an authentic source.

Generate Signature on Your Server

Given below is the sample code for payment signature verification:

JavaPythonGoPHPRubyNode.js.NET

copy

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X POST https://api.razorpay.com/v1/customers/:customer_id/bank_account \
-H "Content-Type: application/json" \
-d '{
       "ifsc_code": "UTIB0000194",
       "account_number": "11214311215411",
       "beneficiary_name": "Gaurav",
       "beneficiary_address1": "address 1",
       "beneficiary_address2": "address 2",
       "beneficiary_address3": "address 3",
       "beneficiary_address4": "address 4",
       "beneficiary_email": "gaurav.kumar@gmail.com",
       "beneficiary_mobile": "9900990099",
       "beneficiary_city": "Bangalore",
       "beneficiary_state": "KA",
       "beneficiary_country": "IN"
   }'
```2

Post Signature Verification

After you have completed the integration, you can [set up webhooks](/docs/webhooks/setup-edit-payments/), make test payments, replace the test key with the live key and integrate with other [APIs](/razorpay-docs-md/api/index.md).

### Non-Transactional Flow

You can directly interact with the exposed methods of the Turbo Framework to perform the non-transactional flows listed below.

Fetch Balance

Fetch the customer's account balance. Call `getBalance()` on the bank account object received from `upiAccount`.

Request Parameter

Response Parameters

Change UPI PIN

Provide the customer with the ability to change their UPI PIN. Call `changeUpiPin()` on the bank account object received from `UpiAccount`.

Request Parameter

Response Parameters

Reset UPI

Let your customers reset the PIN for their account.

Request Parameters

Response Parameters

Delink

Let your customers delink, that is, remove a selected UPI account from your application.

Request Parameter

Response Parameters

### Models Exposed from the SDKs

The SDKs given below provide access to exposed models for seamless integration.

BankAccount

Bank

AccountBalance

Error [Refer to the list of possible error reasons](/razorpay-docs-md/payment-gateway/flutter-integration/custom/payment-methods/turbo-upi/error-codes.md).

UpiAccount

SIM

Card

AllBanks

TPVBankAccount

## 2. Test Integration

We recommend the following:

- Complete the integration on UAT before using the prod builds.
- Perform the UAT using the Razorpay-provided API keys.

## 3. Go-live Checklist

Complete these steps to take your integration live:

- You should get your app id whitelisted by Razorpay to test on prod.

  **Handy Tips**

  Contact our [integrations team](mailto:integrations@razorpay.com)

  to get your mobile number and app whitelisted.
- Import the prod library from the GitHub repository → `https://github.com/upi-turbo/android-turbo-sample-app/tree/prod/app/libs` prod branch.
- Add Proguard rules:

  - `keepclassmembers,allowobfuscation class * { @com.google.gson.annotations.SerializedName <fields>; }`
  - `keepclassmembers enum * { *; }`
  - `keepclassmembers class * { @android.webkit.JavascriptInterface <methods>; }`
  - `dontwarn com.razorpay.**`
  - `keep class com.razorpay.** {*;}`
  - `keep class com.olivelib.** {*;}`
  - `keep class com.olive.** {*;}`
  - `keep class org.apache.xml.security.** {*;}`
  - `keep interface org.apache.xml.security.** {*;}`
  - `keep class org.npci.** {*;}`
  - `keep interface org.npci.** {*;}`
  - `keep class retrofit2.** { *; }`
  - `keep class okhttp3.** { *; }`
- Replace the UAT credential with the [Razorpay live keys](/razorpay-docs-md/api/authentication.md#live-mode-api-keys)

  for prod testing.
