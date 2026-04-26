<!-- Source: https://razorpay.com/docs/payments/payment-methods/cards/authentication/native-otp/custom-integration/android -->

Razorpay Payment Gateway supports one-time passwords (OTPs) at the Checkout itself, preventing the customers from being redirected to the ACS page of their respective issuing banks.

## Advantages

Using the Native OTP feature, you can:

- Increase success rates by up to 4%.
- Reduce payment failures due to low internet speeds.
- Avoid failures due to redirects to bank pages.
- Offer a consistent experience on mobile and web checkout.

## Prerequisites

Before implementing the Native OTP feature, check the following prerequisites:

1. Log in to the Dashboard and generate the [API Keys](/razorpay-docs-md/dashboard/account-settings/api-keys.md)   .
2. Integrate with the [Razorpay Android Custom SDK](/razorpay-docs-md/payment-gateway/android-integration/custom.md)   .

## Integration Steps

**1.1** [Update Razorpay Android Custom SDK version](/razorpay-docs-md/payment-methods/cards/authentication/native-otp/custom-integration/android.md#11-update-razorpay-android-custom-sdk-version).

**1.2** [Implement `CardsFlowCallback` interface in the `getCardsFlow` function](/razorpay-docs-md/payment-methods/cards/authentication/native-otp/custom-integration/android.md#12-implement-cardsflowcallback-interface-in-getcardsflow-function).

**1.3** [Call `razorpay.getCardOtpData(CardsFlowCallback)` Function.](/razorpay-docs-md/payment-gateway/android-integration/custom/native-otp-integration.md#13-call-razorpaygetcardotpdata-cardsflowcallback-function)

**1.4** [Handle Success and Error Events](/razorpay-docs-md/payment-methods/cards/authentication/native-otp/custom-integration/android.md#14-handle-success-and-error-events).

**1.5** [Store Field in Server](/razorpay-docs-md/payment-methods/cards/authentication/native-otp/custom-integration/android.md#15-store-fields-in-server).

**1.6** [Verify Payment Signature](/razorpay-docs-md/payment-methods/cards/authentication/native-otp/custom-integration/android.md#16-verify-payment-signature).

### 1.1 Update Razorpay Android Custom SDK version

Update the [Android Custom SDK version](https://rzp-1415-prod-mobile.s3.amazonaws.com/customui/razorpay-android-3.9.3.aar). This feature is available from version 3.9.3 and above.

### 1.2 Implement CardsFlowCallback Interface in getCardsFlow Function

Implement the `CardsFlowCallback` interface in the `getCardsFlow` function in the payment activity.
The SDK fires the `isNativeOtpEnabled` function and determines whether the native OTP flow is enabled for the BIN.

#### Sample Code

JavaKotlin

copy

```java
razorpay.getCardsFlow(payload, new CardsFlowCallback() {
        @Override
        public void isNativeOtpEnabled(boolean isNativeOtpEnabled) {
            if (isNativeOtpEnabled) {
                //this generates the OTP for the card holder
                razorpay.getCardOtpData(this);
            }else{
                //use your normal payment flow here
                sendRequest();
            }
        }
```

### 1.3 Call razorpay.getCardOtpData(CardsFlowCallback) Function

If Native OTP is enabled for BIN, you should call the `razorpay.getCardOtpData(CardsFlowCallback)` function. The SDK then fires the `otpGenerateResponse(boolean otpGenerated)` function and confirms if the OTP was successfully sent to the customer. Based on this information, you can display the generated OTP UI to the customer.

After entering the OTP, the customer can either:

- **Submit OTP**
  The customer needs to submit the OTP for authenticating the payment. The customer receives the OTP through your application frontend. For card payments, the customer receives the OTP via their preferred notification medium, SMS or email.

  **Handy Tips**

  Do not perform any validation on the length of the OTP since this can vary across banks. However, the OTP should not be blank.
- **Request for OTP to be resent**
  There could be situations when customers have to re-enter the OTP sent to them. The bank determines the number of retries that the user is allowed.
- **Cancel OTP**
  Cancel the payment by cancelling the OTP.

#### Sample Code

JavaKotlin

copy

```java
@Override
        public void otpGenerateResponse(boolean otpGenerated) {
            //check if otp was generated successfully and show UI
            if (otpGenerated) {
                //show UI to the user here
                //will have submit_otp btn resend_otp btn & redirect_to_bank_page button
                razorpay.otpSubmit(otpEnteredByUser,this);//for submitting OTP entered by USER, if payment was successful, the onPaymentSuccess function will be called.
                razorpay.otpResend(this);//for resending the OTP to the user
                razorpay.redirectToBankPage();//to open webview and redirect the user to bank page no callback for this
            }else {
                //otp wasn't generated call getCardOtpData again
                razorpay.getCardOtpData(this);
            }
        }
        @Override
        public void otpResendResponse(boolean otpResent) {
            //status response for otp_resend function, change UI accordingly
        }
        @Override
        public void onOtpSubmitError(boolean otpSubmitError) {
            //status response for error during otp submit. Wrong OTP, network issue, or timeout, this function will be called with the boolean
            //change UI accordingly
        }
```

### 1.4 Handle Success and Error Events

You must handle the payment success and error events as shown in the code sample below:

JavaKotlin

copy

```java
try {
    razorpay.submit(data, new PaymentResultListener() {
        @Override
        public void onPaymentSuccess(String razorpayPaymentId) {
            // Razorpay payment ID is passed here after a successful payment
        }

        @Override
        public void onPaymentError(int code, String description) {
            // Error code and description is passed here
        }
    });

} catch (Exception e) {
    Log.e(TAG, "Error in submitting payment details", e);
}
```

**Handy Tips**

To reuse the Razorpay Checkout web integration inside a web view on Android or iOS, pass a [callback\_url](/razorpay-docs-md/payment-gateway/callback-url.md) along with other checkout options to process the desired payment.

#### Use `PaymentResultWithDataListener`

You have the option to implement `PaymentResultListener` or `PaymentResultWithDataListener` to receive callbacks for the payment result.

- `PaymentResultListener` provides only payment\_id as the payment result.
- `PaymentResultWithDataListener` provides additional payment data such as email and contact of the customer, along with the `order_id`, `payment_id`, `signature` and more.

Java

copy

```java
razorpay.submit(data, new PaymentResultWithDataListener() {
        @Override
        public void onPaymentSuccess(String razorpayPaymentId, PaymentData paymentData) {
            // Razorpay payment ID and PaymentData passed here after a successful payment
        }

        @Override
        public void onPaymentError(int code, String description) {
            // Error code and description is passed here
        }
    });

} catch (Exception e) {
    Log.e(TAG, "Error in submitting payment details", e);
}
```

### Step 5: Store the Fields in Server

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

## Test the Integration

After the integration is complete, a **Pay** button appears on your webpage/app.

![Test integration on your webpage/app](https://razorpay.com/docs/payments/payment-methods/cards/authentication/native-otp/custom-integration/build/browser/assets/images/test-int.gif)

Click the button and make a test transaction to ensure the integration is working as expected. You can start accepting actual payments from your customers once the test transaction is successful.

**Watch Out!**

This is a mock payment page that uses your test API keys, test card and payment details.

- Ensure you have entered only your [Test Mode API keys](/razorpay-docs-md/dashboard/account-settings/api-keys.md#generate-api-keys)

  in the Checkout code.
- Test mode features a mock bank page with **Success** and **Failure** buttons to replicate the live payment experience.
- No real money is deducted due to the usage of test API keys. This is a simulated transaction.

Following are all the payment modes that the customer can use to complete the payment on the Checkout. Some of them are available by default, while others may require approval from us. Raise a request from the Dashboard to enable such payment methods.

You can make test payments using one of the payment methods configured at the Checkout.

Netbanking

You can select any of the listed banks. After choosing a bank, Razorpay will redirect to a mock page where you can make the payment `success` or a `failure`. Since this is Test Mode, we will not redirect you to the bank login portals.

Check the list of [supported banks](/razorpay-docs-md/payment-methods/netbanking.md#supported-banks).

UPI

You can enter one of the following UPI IDs:

- `success@razorpay`: To make the payment successful.
- `failure@razorpay`: To fail the payment.

Check the list of [supported UPI flows](/razorpay-docs-md/payment-methods/upi.md).

**Handy Tips**

You can use **Test Mode** to test UPI payments, and **Live Mode** for UPI Intent and QR payments.

Cards

You can use the following test cards to test transactions for your integration in Test Mode.

### Domestic Cards

Use the following test cards for Indian payments:

#### Error Scenarios

Use these test cards to simulate payment errors. See the [complete list](/razorpay-docs-md/payments/test-card-details.md#error-scenario-test-cards) of error test cards with detailed scenarios.
Check the following lists:

- [Supported Card Networks](/razorpay-docs-md/payment-methods/cards.md)

  .
- [Cards Error Codes](/docs/errors/payments/cards/)

  .

### International Cards

Use the following test cards to test international payments. Use any valid expiration date in the future in the MM/YY format and any random CVV to create a successful payment.

Check the list of [supported card networks](/razorpay-docs-md/payment-methods/cards.md).

Wallet

You can select any of the listed wallets. After choosing a wallet, Razorpay will redirect to a mock page where you can make the payment `success` or a `failure`. Since this is Test Mode, we will not redirect you to the wallet login portals.

Check the list of [supported wallets](/razorpay-docs-md/payment-methods/wallets.md#supported-wallets).
