<!-- Source: https://razorpay.com/docs/payments/optimizer/native-otp -->

Razorpay's Native OTP feature allows direct usage of one-time passwords (OTPs) within the Checkout form, eliminating redirection to issuing banks' ACS (Access Control Server) pages. This provides a seamless OTP flow, reducing payment failures due to slow internet speeds and avoiding losses from redirects to external bank pages. Use this feature to enhance the user experience, saving time and reducing payment failures caused by poor internet connectivity. Shown below is a sample OTP input screen:

![native otp screen](https://razorpay.com/docs/payments/optimizer/build/browser/assets/images/rzp-acs_page.jpg)

Razorpay's Native OTP offers the following additional features:

- [Auto Read + Auto Fill](/razorpay-docs-md/optimizer/native-otp.md#auto-read-auto-fill)
- [Auto Submit](/razorpay-docs-md/optimizer/native-otp.md#auto-submit)

**Watch Out!**

The auto-read, auto-fill, and auto-submit features are compatible with merchants using the Android SDK for standard checkout.

## Auto Read + Auto Fill

Check how **Auto Read + Auto Fill** works:

![auto read fill otp](https://razorpay.com/docs/payments/optimizer/build/browser/assets/images/optimizer-auto-submit-otp-new1.gif)

1. Razorpay requests user permission to read SMS messages.
2. By obtaining permission to read SMS messages, Razorpay can:
   - Automatically extract the OTP from the received SMS.
   - Add the OTP to the Native OTP page.

#### Advantages

- Simplifies the payment process for users
- Increases Success Rate
- Eliminates the need for users to manually enter the OTP
- Reduces errors in OTP input
- Improves the overall user experience

## Auto Submit

Customers no longer need to manually enter one-time passwords (OTPs) for card payments.

![auto submit otp](https://razorpay.com/docs/payments/optimizer/build/browser/assets/images/optimizer-auto-submit-otp-new1.gif)

Razorpay handles the entire process seamlessly by obtaining permission to read SMS messages to:

- Automatically read the OTP.
- Fill the OTP.
- Submit the OTP on behalf of the customer.

#### Advantages

- Reduces friction during the transaction flow
- Increases Success Rate
- Reduces errors associated with manual entry of OTPs
- Lower transaction time by eliminating the manual OTP submission step

## Supported Payment Methods, Cards Networks and Payment Gateways

Below is a list of payment gateways and their respective card networks that support the Native OTP feature.

The Native OTP feature supports only **card** payments.
