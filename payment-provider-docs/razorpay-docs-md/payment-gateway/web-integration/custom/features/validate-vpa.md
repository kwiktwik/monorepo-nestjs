<!-- Source: https://razorpay.com/docs/payments/payment-gateway/web-integration/custom/features/validate-vpa -->

If the selected payment method is `upi`, the user has to enter the `vpa` in the Checkout form. You can check if the entered `vpa` is valid or not using the following code:

**UPI Collect Flow Deprecated**

According to NPCI guidelines, the UPI Collect flow is being deprecated effective 28 February 2026. Customers can no longer make payments or register UPI mandates by manually entering VPA/UPI id/mobile numbers.

**Exemptions:** UPI Collect will continue to be supported for:

- MCC 6012 & 6211 (IPO and secondary market transactions).
- iOS mobile app and mobile web transactions.
- UPI Mandates (execute/modify/revoke operations only)
- eRupi vouchers.
- PACB businesses (cross-border/international payments).

**Action Required:**

- If you are a new Razorpay user, use [UPI Intent](/razorpay-docs-md/payment-gateway/web-integration/custom/payment-methods.md#intent-flow)  .
- If you are an existing Razorpay user not covered by exemptions, you must migrate to UPI Intent or UPI QR code to continue accepting UPI payments. For detailed migration steps, refer to the [migration documentation](/docs/announcements/upi-collect-migration/custom-integration/)  .

#### Sample Code

javascript

copy

```javascript
var razorpay = new Razorpay({
  key: 'YOUR_KEY_ID',
});
razorpay.verifyVpa(vpa)
  .then(() => {
    // VPA is valid, ask the user to click Pay
  })
  .catch(() => {
    // VPA is invalid, show an error to the user
  });
```
