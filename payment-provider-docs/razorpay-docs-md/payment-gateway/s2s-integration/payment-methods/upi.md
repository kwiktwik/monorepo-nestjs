<!-- Source: https://razorpay.com/docs/payments/payment-gateway/s2s-integration/payment-methods/upi -->

UPI is India's fastest-growing payment method and offers higher transaction success rates for your business.

## UPI Integrations

There are 2 UPI flows available for S2S.

- **Collect Flow**
  Customers enter their VPAs, open the respective UPI apps and complete the payment on their mobile devices. You can also [save VPAs of a customer](/razorpay-docs-md/payment-gateway/s2s-integration/payment-methods/upi/saved-vpa.md)  . Know more about [UPI collect flow on S2S](/razorpay-docs-md/payment-gateway/s2s-integration/payment-methods/upi/collect.md)  .
- **Intent Flow**
  When a customer selects the UPI payment app on checkout, the app is launched automatically on the mobile device. Customers need not enter VPA or phone numbers as these details are prefilled and submitted along with the other payment details. Know more about [UPI intent flow on S2S](/razorpay-docs-md/payment-gateway/s2s-integration/payment-methods/upi/intent.md)  .

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

### Related Information

- [UPI Error Codes](/docs/errors/)
- [UPI transaction limits](/razorpay-docs-md/payment-methods/transaction-limits/upi.md)
- [Saved VPA](/razorpay-docs-md/payment-gateway/s2s-integration/payment-methods/upi/saved-vpa.md)
