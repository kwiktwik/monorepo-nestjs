<!-- Source: https://razorpay.com/docs/payments/subscriptions/supported-banks-apps -->

Razorpay Subscriptions supports recurring payments via Emandate, Cards and UPI Autopay. Use this page to check supported banks, apps and platform compatibility for each payment method.

**Dynamic Bank Lists**

The list of supported banks changes periodically. Use the [Methods API](/razorpay-docs-md/subscriptions/supported-banks-apps.md#methods-api) to fetch the current list programmatically.

## Emandate

Emandate supports recurring payments via netbanking, debit card or Aadhaar authentication. To fetch the current list of supported banks and their authentication types, call the [Methods API](/razorpay-docs-md/subscriptions/supported-banks-apps.md#methods-api). Supported banks appear under `recurring.emandate` in the response.

## Cards

We support Visa, Mastercard and RuPay cards from all major banks for recurring payments. To fetch the current list of supported card networks, call the [Methods API](/razorpay-docs-md/subscriptions/supported-banks-apps.md#methods-api). Supported networks appear under `recurring.card` in the response.

**Handy Tips**

Contact our [Support team](https://razorpay.com/support/#request) if you face difficulties with card payments from any major bank.

## UPI Autopay

We support all apps and banks listed on the [NPCI Autopay members page](https://www.npci.org.in/product/autopay/all-members).

### Supported Apps and Handles

The table below shows frequently used UPI apps, their handles and whether they support mandate amounts above ₹15,000.

Other UPI Apps and Handles

### Amount Limits

The default maximum mandate amount for UPI Autopay is ₹15,000 per transaction. For certain MCCs, the limit increases to ₹1,00,000.

MCCs with ₹1,00,000 Limit

## UPI Intent Support

UPI Intent allows customers to complete mandate registration directly in their preferred UPI app. Support varies by checkout integration and platform.

Standard Checkout

Custom Checkout

S2S Integration

### UPI Intent for TPV

Third-Party Validation (TPV) ensures payments are made only from pre-registered bank accounts. The table below shows intent support for TPV.

Standard Checkout

Custom Checkout

S2S Integration

**Watch Out!**

- Contact [Support](https://razorpay.com/support/#request)

  to enable PSP apps other than PhonePe and Paytm on Standard Checkout for UPI TPV.
- UPI Intent TPV is not supported for @okaxis handle.

### UPI Intent for OC125

OC125 restricts customers from pausing or cancelling mandates. This feature is available only for lending businesses.

Standard Checkout

Custom Checkout

S2S Integration

**Watch Out!**

- Contact [Support](https://razorpay.com/support/#request)

  to enable UPI Intent on Standard Checkout.
- UPI Intent is not supported for @okaxis handle.

## Methods API

Use the Methods API to fetch the current list of supported card networks and banks for subscriptions.

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

- [About Subscriptions](/razorpay-docs-md/subscriptions.md)
- [Subscription Workflow](/razorpay-docs-md/subscriptions/workflow.md)
- [Subscription States](/razorpay-docs-md/subscriptions/states.md)
- [Create Subscriptions](/razorpay-docs-md/subscriptions/create.md)
- [Test Subscriptions](/razorpay-docs-md/subscriptions/test.md)
- [Subscriptions APIs](/razorpay-docs-md/subscriptions/apis.md)
