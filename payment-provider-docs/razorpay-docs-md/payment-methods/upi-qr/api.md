<!-- Source: https://razorpay.com/docs/payments/payment-methods/upi-qr/api -->

UPI QR Code is a payment method that allows you to accept payments from your customers using the generated QR code. Razorpay UPI QR Codes are built around Razorpay's Virtual Account APIs. You can create virtual accounts and tag them to individual customers to track the customers' payments. Razorpay notifies you about the payment made to any of the virtual accounts and handles the complexity of reconciling these payments.

## UPI QR Code Workflow

1. Send a request to create a virtual account with `receiver.type` as `qr_code`. A QR code is generated as a result of virtual account creation.
2. Display the QR code on your app used for collecting payments.
3. Customers scan and pay using any of the UPI apps on their mobile devices.
4. Verify the payment status either by polling Razorpay APIs or by [subscribing to Webhook events](/docs/webhooks/)   .

## Prerequisites

1. Ensure that you have the API key required for integration.

   - Log in to the Dashboard with appropriate credentials.
   - Select the mode (**Test** or **Live**) for which you want to generate the API key.

   **Handy Tips**

   You have to generate separate API Keys for the test and live modes. No money is deducted from your account in the test mode.

   - Navigate to **Settings** → **API Keys** → **Generate Key** to generate key for the selected mode.

   **Watch Out!**

   After generating the keys from the Dashboard, download and save them securely. If you do not remember your API Keys, you need to re-generate them from the Dashboard.
2. Verify that the `virtual_account` feature enabled on your account.
   If you are already using the [Smart Collect](/razorpay-docs-md/smart-collect.md)

   product of Razorpay, this feature is enabled for your account. If you are not, then you must log in to Dashboard and complete the onboarding process of the Smart Collect product for the `virtual_account` feature to be enabled for your account.

   ![](https://razorpay.com/docs/payments/payment-methods/upi-qr/build/browser/assets/images/smart-collect-onboarding.jpg)
3. Know about the [Virtual Accounts APIs](/razorpay-docs-md/api/payments/smart-collect.md)   .

## Integration flow

### Step 1: Creating a QR code

To start accepting payments using UPI QR Code, a virtual account should be created with a `receiver`, which defines the payment collection method associated with it. For UPI QR Code, the receiver type is `qr_code`, which allows your customers to make payments using UPI by scanning the QR code.

You need to create a virtual account by sending an API request to Razorpay for generating the QR code for each payment.

POST

/virtual\_accounts

#### Request Parameters

receivers

mandatory

`object` Object consisting of configured receivers types.

types

mandatory

`array` List of desired receiver types.
 In this case, it will be `qr_code`.

qr\_code

mandatory

`array` The payment method that should be used to make the payment.

card

optional

`boolean` Indicates whether card payment should be allowed with the QR Code or not.
 By default, it is set to `true`. In case of UPI QR payments, set this value to `false`.

upi

mandatory

`boolean` Indicates whether UPI payment should be allowed with the QR Code or not.
 By default, the value is set to `true`.

description

optional

`string` A brief description of the payment.

customer\_id

optional

`string` Unique identifier of the customer for whom UPI QR Code is created. Know more about the [Customers API](/razorpay-docs-md/api/customers.md).

close\_by

optional

`integer` Specifies the UNIX timestamp at which the virtual account is scheduled to be automatically closed. It should be set at least 15 minutes after the time of creation.

notes

optional

`object` Object consisting of key value pairs that allow you to store additional data.
 Know more about [Notes](/razorpay-docs-md/api/understand.md#notes).

amount\_expected

mandatory

`integer` The maximum amount you expect to receive in this virtual account. Pass `69999` = ₹699.99 (INR is the default currency).

#### Response Parameters

id

`string` Unique identifier of the generated QR Code.
For example, `qr_4lsdkfldlteskf`

entity

`string` Name of the entity in the response. In this case, it is `qr_code`.

short\_url

`string` URL of the QR code.
 A sample short URL looks like this

<http://rzp.io/l6MS>

. Clicking on the link will download the code for offline use.

status

`string` The status of the virtual account. Possible values:
-`active`
- `closed`

closed\_at

`integer` Specifies the timestamp(in Unix format) at which the virtual account was closed.

### Step 2: Verifying the Payment Status

To know if the customer has made the payment or not, you can track the payment status either by polling the Razorpay servers or subscribing to [specific events generated in our system](/docs/webhooks/).

#### Fetch All Virtual Accounts

To fetch all the payments received using the QR Code, send the following API request to Razorpay:

GET

/virtual\_accounts

#### Fetching a Virtual Account

To fetch a specific payment, send the following request to Razorpay:

GET

/virtual\_accounts/:id

#### Path Parameters

id

mandatory

`string` Unique identifier of a specific virtual account whose details are to be retrieved.

#### Fetching all payments of a Virtual account

To fetch all the payments made to a virtual account, send the following request:

GET

/virtual\_accounts/:id/payments

#### Path Parameters

id

mandatory

`string` Unique identifier of a virtual account whose payments should be retrieved.

#### Closing a Virtual Account

After you have received the payment, you may choose to close the virtual account.

POST

/virtual\_accounts/:id/close

#### Path Parameter

id

mandatory

`string` Unique identifier of the virtual account that should be closed.
