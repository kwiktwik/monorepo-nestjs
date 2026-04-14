<!-- Source: https://razorpay.com/docs/payments/subscriptions/supported-banks-apps -->

Check the banks and apps that support Subscriptions via Emandate (Netbanking, Debit Card, Aadhaar), Card and UPI.

## Emandate

The following table has links to the list of banks that support Emandate payments using netbanking, Aadhaar (eSign authentication) and debit card authorization types.

List of Banks - Emandate Payments Using Netbanking

List of Banks - Emandate Payments Using Debit Card

List of Banks - Emandate Payments using Aadhaar

List of Banks - Consolidated

## Cards

Following is the list of banks that support cards.

**Handy Tips**

- We support Visa, Mastercard and RuPay cards of all major banks.
- Please contact our support team if you are facing difficulties with card payments from any of the major banks on the above list.

## UPI Autopay

Following is the list of UPI Autopay supported banks and apps:

Frequently Used UPI Autopay Applications

Below are some of the frequently used UPI applications and their handles:

Other UPI Autopay Applications

Below are the other UPI applications and their handles:

Supported Amount Limit

Supported MCCs

For certain MCCs, the maximum amount limit for one transaction is ₹1,00,000. Given below is the list of supported MCCs, issuing banks and PSP applications.

### Intent Support With PSP Apps

The below table gives information about the frequently used intent-supported PSP apps on different platforms and checkout integrations.

Standard Checkout Integration

Custom Checkout Integration

S2S Checkout Integration

### Intent Support With PSP Apps for TPV

The below table gives information about the frequently used intent-supported PSP apps for TPV on different platforms and checkout integrations.

Standard Checkout Integration

Custom Checkout Integration

S2S Checkout Integration

**Watch Out!**

- You should contact our [Support team](https://razorpay.com/support/#request)

  to enable PSP apps other than PhonePe and Paytm on Standard Checkout for UPI TPV. Watch this video on how to get it enabled.

  ![Feature Request GIF](https://razorpay.com/docs/payments/subscriptions/build/browser/assets/images/feature-request.gif)
- UPI Intent TPV is not supported for @okaxis handle.

### Intent Support With PSP Apps for OC125

The below table gives information about the frequently used intent-supported PSP apps for OC125 (restrict pausing and cancelling mandate) on different platforms and checkout integrations.

**Watch Out!**

OC125 is supported only for lending businesses.

Standard Checkout Integration

Custom Checkout Integration

S2S Checkout Integration

**Watch Out!**

- You should contact our [Support team](https://razorpay.com/support/#request)

  to enable UPI Intent on Standard Checkout. Watch this video on how to get it enabled.

  ![Feature Request GIF](https://razorpay.com/docs/payments/subscriptions/build/browser/assets/images/feature-request.gif)
- UPI Intent is not supported for @okaxis handle.

## List of Supported Banks - UPI Autopay

Refer to the [list of banks that support UPI Autopay](/razorpay-docs-md/recurring-payments/upi/supported-banks.md#supported-banks).

## Fetch Supported Card Networks and Banks

Use the below endpoint to fetch a list of supported card networks and banks available for subscription.

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
