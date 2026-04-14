<!-- Source: https://razorpay.com/docs/payments/payment-methods/upi/vpa-validation -->

In UPI collect flow, the customers enter Virtual Payment Address (VPA) to make the payment. You can confirm the validity of VPA by sending an API request to Razorpay.

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

### API Sample Code

POST

/payments/validate/vpa

RequestResponse

copy

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X POST https://api.razorpay.com/v1/payments/validate/vpa \
-H "Content-Type: application/json" \
-d '{
      "vpa": "gauravkumar@exampleupi"
}'
```

Request Parameters

Response Parameters

vpa

mandatory

`string` The virtual payment address (VPA) you want to validate. For example, `gauravkumar@exampleupi`.

**Deprecation Notice**

UPI Collect is deprecated effective 28 February 2026. This tab is applicable only for exempted businesses. If you are not covered by the exemptions, refer to the [migration documentation](/docs/announcements/upi-collect-migration/standard-integration/) to switch to UPI Intent.
