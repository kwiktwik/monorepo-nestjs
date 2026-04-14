<!-- Source: https://razorpay.com/docs/payments/payment-methods/upi/google-pay -->

Your customers can make payments using Google Pay™ at the Razorpay checkout. You can integrate and show Google Pay on any of the following platforms: Desktop Browser, Mobile Web (M-Web) and Android App.

## Integration on Standard Checkout - Web and Android

If you are using Razorpay's Standard Checkout, you do not need to make any change to integrate Google Pay on your checkout page. Razorpay will display Google Pay as an option under the **UPI** section on the checkout page.

![GooglePay Standard Checkout](https://razorpay.com/docs/payments/payment-methods/upi/build/browser/assets/images/upi-checkout-header-changes.jpg)

### Web

Collect Flow

Intent Flow

On your website, all Google Pay requests are Collect requests.

1. The customer selects the Google Pay option, enters their UPI handle and clicks **Pay**.
2. A request is sent to the Google Pay app installed on their mobile device.
3. The customer manually opens the Google Pay app and approves the request.

### Android

**UPI Collect Flow Deprecated**

According to NPCI guidelines, the UPI Collect flow is being deprecated effective 28 February 2026. Customers can no longer make payments or register UPI mandates by manually entering VPA/UPI id/mobile numbers.

**Exemptions:** UPI Collect will continue to be supported for:

- MCC 6012 & 6211 (IPO and secondary market transactions).
- iOS mobile app and mobile web transactions.
- UPI Mandates (execute/modify/revoke operations only)
- eRupi vouchers.
- PACB businesses (cross-border/international payments).

**Action Required:**

- If you are a new Razorpay user, use [UPI Intent](/razorpay-docs-md/payment-methods/upi/upi-intent.md)  .
- If you are an existing Razorpay user not covered by exemptions, you must migrate to UPI Intent or UPI QR code to continue accepting UPI payments. For detailed migration steps, refer to the [migration documentation](/docs/announcements/upi-collect-migration/standard-integration/)  .

Intent-Based Integration

Intent-Based Integration Using Google Pay SDK

Collect-Based Integration

When using the Standard Checkout, Google Pay is shown inside the payment method **UPI**. The customer selects Google Pay from the list of apps and click **Pay**. Customers are then redirected to the Google Pay application, provided it is installed on the mobile device they are using to access checkout, where they can make the payment.

## Integration on Custom Checkout

To enable Google Pay on your custom checkout:

1. Show Google Pay as a separate Option.
2. Trigger payment when a user clicks Google Pay on your checkout.

Know more about [Google Pay Custom Checkout Integration](/razorpay-docs-md/payment-methods/upi/google-pay/custom-integration.md).
