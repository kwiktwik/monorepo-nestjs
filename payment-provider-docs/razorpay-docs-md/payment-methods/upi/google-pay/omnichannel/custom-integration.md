<!-- Source: https://razorpay.com/docs/payments/payment-methods/upi/google-pay/omnichannel/custom-integration -->

You can integrate your custom applications or Android Apps with Google Omnichannel to enable your customers to make payments via GPay. The customers can click the notification sent by Google Pay and complete the payment on their mobile phones.

## Prerequisites

1. [Sign up](https://support.google.com/pay/business/answer/7684271?hl=en&ref_topic=7684388)

   for a business account with Google Pay.
2. [Contact our Support Team](https://razorpay.com/support/#request)

   and have them whitelist your UPI ID/VPA.
3. Verify your UPI ID/VPA details on the [Google Merchant Console](https://support.google.com/pay/business/answer/7684398?hl=en&ref_topic=7684388)   . Google deposits a small amount into the bank account linked to your VPA (UPI ID).
4. You should have already integrated the Razorpay Checkout with your application using one of the following:
   - [Razorpay Web Integration - Custom Checkout](/razorpay-docs-md/payment-gateway/web-integration/custom.md)
   - [Razorpay Android Integration - Custom Checkout](/razorpay-docs-md/payment-gateway/android-integration/custom.md)
5. [Generate API Keys](/razorpay-docs-md/api/authentication.md#generate-api-keys)

   from the Dashboard.

## Web Integration

While creating a request, there is no need to ask for vpa from your customer. The intent request is sent to the customer's registered phone number.

Example

copy

```json
razorpay.createPayment({
    "key": "<YOUR_KEY_ID>",
    "amount": 5000,
	  "email": "gaurav.kumar@example.com",
	  "contact": "9123456780",
	  "method": "upi",
	  "_[flow]": "intent",
    "upi_provider": "google_pay"
});
```

## Android Integration

When the user enters the phone number, along with the Checkout fields, you need to submit `method`, `upi_provider` and `_[flow]` options along with the other Checkout fields as shown below:

java

copy

```java
try
{
  JSONObject data = new JSONObject();
  data.put("amount", 100000); //pass in paise (amount: 100000 equals ₹1000)
  data.put("email", "gaurav.kumar@example.com");  //customer's email address
  data.put("contact", "9876543210");  //customer's mobile number

  JSONObject notes = new JSONObject();
  notes.put("custom_field", "Make it so.");  //notes for the payment, if any
  data.put("notes", notes);

  data.put("method", "upi"); // mandatory for Omnichannel
  data.put("_[flow]", "intent"); // mandatory for Omnichannel
  data.put("upi_provider", "google_pay"); // mandatory for Omnichannel
  razorpay.submit(data, new PaymentResultWithDataListener()

  .......... // add your custom logic
}
```
