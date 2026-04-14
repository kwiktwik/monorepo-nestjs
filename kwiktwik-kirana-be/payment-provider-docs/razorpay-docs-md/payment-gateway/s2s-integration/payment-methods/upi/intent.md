<!-- Source: https://razorpay.com/docs/payments/payment-gateway/s2s-integration/payment-methods/upi/intent -->

You can collect payments using the UPI intent flow that will be handled by UPI apps installed on your customers' mobile devices.

Customers need not enter VPA or phone numbers as these details are prefilled and submitted along with the other payment details. While making the payment, customers select the UPI PSP app on your UI. The app is launched automatically on their mobile devices where the payment is completed.

### Best Practices

If you have a significant amount of payment traffic coming from the Mobile Site, then it is advisable to use the Google Pay Intent flow available for the mSite:

1. **Do not change Intent URL**
   Do not make changes to the intent URL shared by Razorpay as part of the API response. Making changes to the intent URL can lead to payment failure.
2. **Host UPI apps**
   It is recommended to host the UPI apps on your page/app instead of just hosting the Intent URI where the apps are shown by the native Android drawer. This improves conversion.
3. **Rank UPI Apps by Success Rate**
   Show the UPI PSP apps in the order of their success rate.
4. **Mobile site**
   If you have higher traffic via mobile site, then make sure you provide the option of UPI intent payment to your users using our [m-site integration](/razorpay-docs-md/payment-methods/upi/google-pay/custom-integration.md)   . This will help you achieve better success rates.
5. **Gpay SDK**
   If your UPI transaction volumes are high, you can also explore integrating [Gpay SDK](/razorpay-docs-md/payment-methods/upi/google-pay.md#android-integration-using-google-pay-sdk)   . This provides a better user experience and about a 3-5% improvement in success rate.

## Prerequisites

- Reach out to our [Support Team](https://razorpay.com/support/#raise-a-request)

  to get this feature enabled for your account.
- Keep the API keys (`Key_Id` and `Key_Secret`) handy for integration.
- [Generate API Keys from the Dashboard](/razorpay-docs-md/api/authentication.md#generate-api-keys)

  if you have not done already.

## Integration Steps

1. [Create an order](/razorpay-docs-md/payment-gateway/s2s-integration/payment-methods/upi/intent.md#step-1-create-an-order)

   .
2. [Initiate Payment using the intent URL](/razorpay-docs-md/payment-gateway/s2s-integration/payment-methods/upi/intent.md#step-2-initiate-a-payment)

   .
3. [Verify the payment status](/razorpay-docs-md/payment-gateway/s2s-integration/payment-methods/upi/intent.md#step-3-verify-the-payment-status)

   .

### Step 1: Create an Order

You should create an order before initiating a payment at your end.

POST

/orders

RequestResponse

copy

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
-X POST https://api.razorpay.com/v1/orders \
-H "Content-Type: application/json" \
-d '{
  "amount": 200,
  "currency": "INR"
}'
```

#### Request Parameters

amount

mandatory

`integer` The amount for which the Order was created, in currency subunits. For example, for an amount of ₹295, enter `29500`.

currency

mandatory

`string` ISO code of the currency associated with the payment amount. Only `INR` is supported.

receipt

optional

`string` Receipt number that corresponds to this order, set for your internal reference. Maximum length of 40 characters supported.

notes

optional

`json object` Key-value pair that can be used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

### Step 2: Initiate a Payment

After creating an order, initiate a payment with `intent` flow.

POST

/payments/create/upi

RequestResponse

copy

```bash
curl -u [YOUR_KEY_ID]:[YOUR_KEY_SECRET] \
  -X POST https://api.razorpay.com/v1/payments/create/upi \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100,
    "currency": "INR",
    "order_id": "order_Ee0biRtLOqzRjP",
    "email": "gaurav.kumar@example.com",
    "contact": "9090909090",
    "method": "upi",
    "ip": "192.168.0.103",
    "referer": "http",
    "user_agent": "Mozilla/5.0",
    "description": "Test flow",
    "notes": {
      "purpose": "UPI test payment"
    },
    "upi": {
		  "flow" : "intent"
	  }
  }'
```

**Do not make changes to the link**

Do not make changes to the link you receive in the response. This is the Razorpay Intent URL. Making changes to this URL can lead to payment failure or other unexpected errors with the payment.

#### Request Parameters

The parameters needed for constructing the API request are described below:

amount

mandatory

`integer` The amount associated with the payment in smallest unit of the supported currency. For example, `2000` means ₹20.

currency

mandatory

`string` ISO code of the currency associated with the payment amount. In this case, it is `INR`.

order\_id

mandatory

`string` Unique identifier of the order, obtained from the response of the previous step.

contact

mandatory

`string` Phone number of the customer.

email

mandatory

`string` Email address of the customer.

ip

optional

`string` Client's browser IP address. For example, `117.217.74.98`.

referer

optional

`string` Value of the`referer` header passed by the client's browser. For example, `https://example.com/`.

user\_agent

optional

`string` Value of the `user_agent` header passed by client's browser. For example, **Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36**.

description

optional

`string` Descriptive text of the payment.

notes

optional

`json object` A key-value pair that can hold additional information about the payment.
 Refer the [Notes](/razorpay-docs-md/api/understand.md#notes) section of the API Reference Guide.

upi

mandatory

`object` Details of the UPI payment.

flow

`string` Type of the UPI method. In this case, it is `intent`.

You will get the UPI Intent URI as part of the payment response.

To pass the payment data to the respective UPI app and to initiate the payment, implement the code given below:

Pass data to UPI app

copy

```javascript
Intent i = new Intent(Intent.ACTION_VIEW);
        i.setData(Uri.parse(url)); //uri from the create S2S payment response
        i.setPackage(packageName); //package name from the `upi://pay` intent response

activity.startActivityForResult(i,2561); //unique activity code to get the callback
```

**Handy Tips**

For the package name, you can check the [list of supported UPI apps](/razorpay-docs-md/payment-methods/upi/supported-apps.md).

### Step 3: Verify the Payment Status

You can verify the status of the payments using any of the following methods:

- Poll Razorpay servers periodically for the payments made for the order using our [Fetch Payment APIs](/razorpay-docs-md/api/orders/fetch-payments.md)  .
- [Subscribe to the Webhook events](/docs/webhooks/setup-edit-payments/)

  created in our system for each of the following entities:
  - [payments](/docs/webhooks/payments/)
  - [orders](/docs/webhooks/orders/)

#### Payment failure and re-initiating payment

If the Order is not marked `paid` within 2-3 minutes, then you can re-initiate payment for the same.

### Related Information [Error reasons](/docs/errors/#list-of-error-reasons-for-payments)
