<!-- Source: https://razorpay.com/docs/payments/recurring-payments/upi/supported-banks -->

We support all the apps and banks mentioned in the [NPCI list](https://www.npci.org.in/what-we-do/autopay/list-of-banks-and-apps-live-on-autopay).

**Handy Tips**

For certain MCCs, the maximum amount limit for one transaction is ₹1,00,000.
Refer to the [list of supported MCCs, issuing banks and PSP applications](/razorpay-docs-md/subscriptions/supported-banks-apps.md#supported-mccs).

### Intent Support with PSP Apps

The below table gives information about the frequently used intent-supported PSP apps on different platforms and checkout integrations.

Standard Checkout Integration

Custom Checkout Integration

S2S Checkout Integration

#### Intent Support with PSP Apps for TPV

The below table gives information about the frequently used intent-supported PSP apps for TPV on different platforms and checkout integrations.

Standard Checkout Integration

Custom Checkout Integration

S2S Checkout Integration

**Watch Out!**

- Contact our [Support team](https://razorpay.com/support/#request)

  to enable PSP apps other than PhonePe and Paytm on Standard Checkout for UPI TPV. Watch this video on how to get it enabled.

  ![Feature Request GIF](https://razorpay.com/docs/payments/recurring-payments/upi/build/browser/assets/images/feature-request.gif)
- UPI Intent TPV is not supported for @okaxis handle.

### Intent Support with PSP Apps for OC125

The below table gives information about the frequently used intent-supported PSP apps for OC125 (restrict pausing and cancelling mandate) on different platforms and checkout integrations.

**Watch Out!**

OC125 is supported only for lending businesses.

Standard Checkout Integration

Custom Checkout Integration

S2S Checkout Integration

**Watch Out!**

- Contact our [Support team](https://razorpay.com/support/#request)

  to enable UPI Intent on Standard Checkout. Watch this video on how to get it enabled.

  ![Feature Request GIF](https://razorpay.com/docs/payments/recurring-payments/upi/build/browser/assets/images/feature-request.gif)
- UPI Intent is not supported for @okaxis handle.

## Fetch Supported Methods

Use the below endpoint to fetch a list of all methods enabled for your account.

GET

/methods

**[YOUR\_KEY\_ID] Required**

To fire this API, you need to provide your [KEY\_ID] for authorization. Your [KEY\_SECRET] is not required and should not be passed.

RequestResponse

copy

```bash
curl -u [YOUR_KEY_ID] \
    -X GET https://api.razorpay.com/v1/methods
```

### Related Information

- [Integrate Recurring Payments Using UPI](/razorpay-docs-md/recurring-payments/upi/integrate.md)
- [Recurring Payments APIs for UPI](/razorpay-docs-md/recurring-payments/upi/apis.md)
