<!-- Source: https://razorpay.com/docs/payments/payment-gateway/web-integration/custom/payment-methods -->

The Razorpay Web Custom SDK lets you integrate the supported payment methods on your website's checkout form.

## Fetch Payment Methods

Use the [Fetch Payment Methods API](/razorpay-docs-md/payment-gateway/android-integration/custom/build-integration.md#14-fetch-payment-methods) to fetch the payment methods available for your account.

Below are the sample payloads for each payment method.

## Bank Transfer

This payment method allows you to display your Customer Identifier details on the checkout. Your customers can make online bank transfers to this account.

**Feature Request**

- This is an on-demand feature. Please raise a request with our [Support team](https://razorpay.com/support/#request)

  to get this feature activated on your Razorpay account.
- Watch this video to know how to raise a feature enablement request on the Dashboard.

![Feature Request GIF](https://razorpay.com/docs/payments/payment-gateway/web-integration/custom/build/browser/assets/images/feature-request.gif)

There are no specific request parameters to be passed. Instead, you must pass the `fetchVirtualAccount` method for your Customer Identifier to get created and the details to appear on the checkout. Know more about [integrating bank transfer with Custom Checkout](/razorpay-docs-md/payment-methods/bank-transfer/custom-integration.md).

## Debit and Credit Card

In this case, `data.method` should be specified as `card`. Other required fields:

- `card[name]`
- `card[number]`
- `card[cvv]`
- `card[expiry_month]`
- `card[expiry_year]`

Example

copy

```javascript
razorpay.createPayment({
  amount: 5000,
  email: 'gaurav.kumar@example.com',
  contact: '9123456780',
  order_id: 'order_9A33XWu170gUtm',
  method: 'card',
  'card[name]': 'Gaurav Kumar',
  'card[number]': '4386289407660153',
  'card[cvv]': '566',
  'card[expiry_month]': '10',
  'card[expiry_year]': '20'
});
```

If you want to securely store the customer's card details as network tokens, know about [Saved Cards feature](/razorpay-docs-md/payment-gateway/web-integration/custom/features/saved-cards.md).

## EMI on Credit and Debit Cards

For EMIs, data is the same as the card, with the following differences:

- `method` should be `emi`
- An additional field, `emi_duration` corresponding to the number of months for EMI, should be included. After the customer selects the desired plan, pass the corresponding value in the `emi_duration` field.

Use the code given below:

Example

copy

```javascript
razorpay.createPayment({
  amount: 300000,
  email: 'gaurav.kumar@example.com',
  contact: '9000090000',
  order_id: 'order_9A33XWu170gUtm',
  method: 'emi',
  emi_duration: 9,
  'card[name]': 'Gaurav Kumar',
  'card[number]': '5241810000000000',
  'card[cvv]': '123',
  'card[expiry_month]': '10',
  'card[expiry_year]': '30'
});
```

#### Fetch EMI Plans

To display the available EMI plans, use the Razorpay checkout helper methods to fetch the details of the EMI plans and display them. You can use the event ready, as shown below:

RequestResponse

copy

```javascript
var razorpay = new Razorpay(...); // as before

    /**
       * The above code remains the same.
       * You can fetch the available EMI plans by adding the below code in your options.
       */
razorpay.once('ready', function() {
  console.log(razorpay.methods.emi_plans);
  console.log(razorpay.methods.netbanking);
})
```

razorpay.methods.emi\_plans

`string` Lists the EMI-supported banks with their respective interest rates.

razorpay.methods.netbanking

`string` Contains the list of all banks and bank codes.

#### Calculate EMI

You can use the function `Razorpay.emi.calculator` to calculate instalment amounts as shown below:

Request

copy

```javascript
Razorpay.emi.calculator(principal_amount, duration_in_month, annual_interest_rate);
```

The below code will calculate EMI for a principal amount of 10000(in paisa), that is, ₹100 over 12 months with an annual interest rate of 9%:

Request

copy

```javascript
Razorpay.emi.calculator(10000, 12, 9);
= 874
```

**Handy Tips**

The above code does not do any unit conversion of the principal amount. The returned amount will have the same unit as the principal. If the principal amount is in *paisa*, the returned EMI amount will also be in *paisa*.

## Cardless EMI

Cardless EMI is a checkout payment method that allows customers to convert their payment amount to EMIs. The user does not require a debit or credit card. Make payments via credits approved by the supported Cardless EMI payment partner.

**Feature Request**

- This is an on-demand feature. Please raise a request with our [Support team](https://razorpay.com/support/#request)

  to get this feature activated on your Razorpay account.
- Watch this video to know how to raise a feature enablement request on the Dashboard.

![Feature Request GIF](https://razorpay.com/docs/payments/payment-gateway/web-integration/custom/build/browser/assets/images/feature-request.gif)

Use the code given below:

Example

copy

```javascript
razorpay.createPayment({
  amount: 5000,
  email: 'gaurav.kumar@example.com',
  contact: '9000090000',
  order_id: 'order_9A33XWu170gUtm',
  method: 'cardless_emi',
  provider: '<provider_name>'
});
```

Possible values for `provider`:

- `hdfc`
- `icic`
- `idfb`
- `kkbk`
- `zestmoney`
- `earlysalary`
- `walnut369`
- `shopse`
- `snapmint`

## Netbanking

When `method` is `netbanking`, you need to pass an additional field `bank` as shown below:

Example

copy

```javascript
razorpay.createPayment({
  amount: 5000,
  email: 'gaurav.kumar@example.com',
  contact: '9123456780',
  order_id: 'order_9A33XWu170gUtm',
  method: 'netbanking',
  bank: 'SBIN'
})
```

You can list the available banks using a drop-down for customers. You can obtain a list of banks using the [Fetch Supported Methods API](/razorpay-docs-md/payment-gateway/web-integration/custom/build-integration.md#12-fetch-payment-methods).

## Wallet

When `method` is `wallet`, you need to pass an additional field `wallet` as shown below:

Example

copy

```javascript
razorpay.createPayment({
  amount: 5000,
  email: 'gaurav.kumar@example.com',
  contact: '9000090000',
  order_id: 'order_9A33XWu170gUtm',
  method: 'wallet',
  wallet: 'mobikwik'
});
```

Possible values for `wallet`:

- `payzapp` (default)
- `olamoney` (requires [approval](https://razorpay.com/support/#request)

  )
- `phonepe` (requires [approval](https://razorpay.com/support/#request)

  )
- `airtelmoney` (requires [approval](https://razorpay.com/support/#request)

  )
- `mobikwik` (requires [approval](https://razorpay.com/support/#request)

  )
- `jiomoney` (requires [approval](https://razorpay.com/support/#request)

  )
- `amazonpay` (requires [approval](https://razorpay.com/support/#request)

  )
- `bajajpay` (requires [approval](https://razorpay.com/support#request)

  )
- `paypal` (requires [approval](https://razorpay.com/support/#request)

  and [onboarding](/razorpay-docs-md/payment-methods/wallets/paypal.md)

  )
- `phonepeswitch` (requires [approval](https://razorpay.com/support/#request)

  )

#### PhonePe Switch

You can accept in-app payments from your customers transacting in PhonePe Switch. Know more about [PhonePe Switch Integration](/razorpay-docs-md/payment-gateway/web-integration/custom/phonepe-switch.md).

## UPI

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

#### Intent Flow

You can avail the UPI Intent flow by integrating with the [Google Pay SDK](/razorpay-docs-md/payment-methods/upi/google-pay/custom-integration.md).

#### Intent Flow for Mobile Web

Using Razorpay, you can let your customers make UPI Intent payments on your mobile website. Customers can then proceed with the payment without navigating away from your mobile website. This leads to a faster checkout experience with higher success rates.

Know how to integrate with [UPI Intent on Mobile Web](/razorpay-docs-md/payment-gateway/web-integration/custom/payment-methods/upi-intent-mweb.md).

**Feature Enablement**

The UPI Intent feature is usually available by default. If you are unable to access this feature, raise a request with our [Support team](https://razorpay.com/support/#request) to get this enabled on your Razorpay account.

#### Collect Flow

Customers enter their `vpa` or [phone number](/razorpay-docs-md/payment-gateway/web-integration/custom/payment-methods.md#upi-payments-using-phone-number) on your UI and complete the payments on their respective UPI apps in collect flow.

You can now pass the `vpa` parameter in the `upi` array as shown below:

Example

copy

```javascript
razorpay.createPayment({
  amount: 5000,
  email: 'gaurav.kumar@example.com',
  contact: '9123456780',
  order_id: 'order_9A33XWu170gUtm',
  method: 'upi',
  upi:
  {
    vpa: 'gauravkumar@somebank',
    flow: 'collect'
  }
});
```

You will need to collect the Virtual Payment Address (VPA) from the user. This should be a text field that validates against the regex `^.+@.+$`.

UPI Payments Using Phone Number

You can accept UPI payments using phone number for the collect flow. Follow the steps given below:

1. You must collect the customer's phone number from your end.
2. Check if any `vpa` is associated with the given number and get the `vpa_token` for that number using the sample code given below:

   JavaScript

   copy

   ```java
var razorpay = new Razorpay({
  key: '<YOUR_KEY_ID>',
});

razorpay.verifyVpa(number)
  .then((data) => {
    // get and store data.vpa_token for initiating payment
    // you will get data.masked_vpa in this response which you can show the end user to accept payment on this vpa associated app
  })
  .catch(() => {
    // no vpa associated with the number, show an error to the user
  });
```
3. Pass the `vpa_token` parameter in the `upi` array as shown below:

   JavaScript

   copy

   ```javascript
razorpay.createPayment({
  amount: 300000,
  email: 'gaurav.kumar@example.com',
  contact: '9000090000',
  order_id: 'order_9A33XWu170gUtm',
  method: 'emi',
  emi_duration: 9,
  'card[name]': 'Gaurav Kumar',
  'card[number]': '5241810000000000',
  'card[cvv]': '123',
  'card[expiry_month]': '10',
  'card[expiry_year]': '30'
});
```0

You can accept UPI payments using the collect flow. Know more about [Validate VPA](/razorpay-docs-md/payment-gateway/web-integration/custom/features/validate-vpa.md) and [Saved VPA](/razorpay-docs-md/payment-gateway/web-integration/custom/features/saved-vpa.md).

#### UPI QR Code

You can display a UPI QR Code at checkout. Customers can scan this QR code using a UPI app on their mobile phones to complete the payment.

Razorpay supports two flows for UPI QR payments:

- [Non-Redirect Flow](/razorpay-docs-md/payment-gateway/web-integration/custom/payment-methods.md#non-redirect-flow)

  *(Beta)*: Displays the QR directly on your checkout page.
- [Redirect Flow](/razorpay-docs-md/payment-gateway/web-integration/custom/payment-methods.md#redirect-flow)

  : Redirects customers to Razorpay's payment page to display the QR.

Flow Comparison

#### Non-Redirect Flow *(Beta)*

Display UPI QR codes directly on your checkout page without redirecting customers to Razorpay's payment page. This flow allows you to:

- Receive a UPI intent URL from Razorpay.
- Convert it to a QR code on your checkout page.
- Keep customers on your site for a seamless experience.

**Feature Enablement**

- This is an on-demand feature. Raise a request with your account manager to get this feature enabled on your account.
- This flow is available only for desktop websites.

Add the `flow` parameter to enable non-redirect flow:

RequestSuccess ResponseFailure Response

copy

```javascript
razorpay.createPayment({
  amount: 300000,
  email: 'gaurav.kumar@example.com',
  contact: '9000090000',
  order_id: 'order_9A33XWu170gUtm',
  method: 'emi',
  emi_duration: 9,
  'card[name]': 'Gaurav Kumar',
  'card[number]': '5241810000000000',
  'card[cvv]': '123',
  'card[expiry_month]': '10',
  'card[expiry_year]': '30'
});
```1

Request Parameters

amount

mandatory

`integer` Payment amount in the smallest currency subunit. For example, if the amount to be charged is ₹100.00, enter `10000` in this field.

method

mandatory

`string` The payment method selected by the customer. Must be set to `upi` for UPI QR payments.

email

optional

`string` Email address of the customer.

contact

optional

`string` Phone number of the customer.

app

optional

`string` UPI app preference for payment. Set to `any` to allow customers to use any UPI app for payment.

flow

optional

`string` Determines the UPI QR flow type. Set to `qr` to enable non-redirect flow where the UPI intent URL is returned instead of redirecting to Razorpay's payment page. If undefined or any other value, the standard redirect flow is used.

Response Parameters

qr\_url

`string` UPI intent URL that needs to be converted to a QR code image for display on your checkout page. The value is `undefined` when the status is `expired`.

expires\_on

`integer` Unix timestamp indicating when the QR code will expire. The QR code is valid for 10 minutes from creation.

status

`string` Current status of the UPI QR code. Possible values:

- `created`: QR code is active and can be scanned for payment.
- `expired`: QR code has expired and cannot be used for payment.

#### Redirect Flow

With this flow, customers are redirected to Razorpay's payment page where the QR code is displayed.

**Sample QR Code on Checkout**

Ensure that you invoke/activate the QR Code only after a user clicks **Show QR Code**.

![UPI QR code on Razorpay Payment Gateway custom web integration.](https://razorpay.com/docs/payments/payment-gateway/web-integration/custom/build/browser/assets/images/upi-qr-custom-web.jpg)

Pass the `qr` parameter in the `upi` array as shown below:

Example

copy

```javascript
razorpay.createPayment({
  amount: 300000,
  email: 'gaurav.kumar@example.com',
  contact: '9000090000',
  order_id: 'order_9A33XWu170gUtm',
  method: 'emi',
  emi_duration: 9,
  'card[name]': 'Gaurav Kumar',
  'card[number]': '5241810000000000',
  'card[cvv]': '123',
  'card[expiry_month]': '10',
  'card[expiry_year]': '30'
});
```2

timeout

optional

`integer` Indicates the time (in minutes) after which the QR code will expire. Possible values are between `1` to `10`. The default value is `10`.

**Watch Out!**

Some browsers may pause `JavaScript` timers when the user switches tabs, especially in power saver mode. This can cause the checkout session to stay active beyond the set timeout duration.

**Handy Tips**

For the best experience, show QR codes only on desktops.

## Pay Later

You can enable your customers to make payments using the **Pay Later** service offered by various third-party providers such as:

Before you begin, follow the steps given below:

- Contact our [Support Team](https://razorpay.com/support/#request)

  to get this payment method enabled for your account.
- Customers should be registered account holders of the Pay Later service providers.

#### Sample Code

After creating an order and obtaining the customer's payment details, send the information to Razorpay to complete the payment. You can do this by invoking `createPayment` and passing `method=paylater` and `provider=<provider_name>`.

Available providers with provider code:

- **LazyPay**: `lazypay`
- **PayPal**: `paypal`

Example

copy

```javascript
razorpay.createPayment({
  amount: 300000,
  email: 'gaurav.kumar@example.com',
  contact: '9000090000',
  order_id: 'order_9A33XWu170gUtm',
  method: 'emi',
  emi_duration: 9,
  'card[name]': 'Gaurav Kumar',
  'card[number]': '5241810000000000',
  'card[cvv]': '123',
  'card[expiry_month]': '10',
  'card[expiry_year]': '30'
});
```3

## Emandate

You can accept recurring payments from your customers using `emandate`, `card` or `upi` as the method. For more information about authorisation and subsequent payments, refer to the [Recurring Payments documentation](/razorpay-docs-md/recurring-payments.md).

**Feature Request**

- This is an on-demand feature. Please raise a request with our [Support team](https://razorpay.com/support/#request)

  to get this feature activated on your Razorpay account.
- Watch this video to know how to raise a feature enablement request on the Dashboard.

![Feature Request GIF](https://razorpay.com/docs/payments/payment-gateway/web-integration/custom/build/browser/assets/images/feature-request.gif)

#### Workflow

1. [Create a customer](/razorpay-docs-md/api/customers.md#create-a-customer)

   .
2. Create an Order with method as `emandate`, `nach` or `upi`.
3. Collect authorisation transaction.
   - Using custom checkout.
   - Using an authorisation link.
4. Verify Tokens.
5. Charge subsequent payments.

Know more about [Recurring Payments APIs](/razorpay-docs-md/api/payments/recurring-payments/custom.md).

#### Collect Authorisation Transaction

Use the sample checkout code given below:

Emandate (Netbanking)Emandate (Debit Card)Emandate (Aadhaar)CardUPI

copy

```javascript
razorpay.createPayment({
  amount: 300000,
  email: 'gaurav.kumar@example.com',
  contact: '9000090000',
  order_id: 'order_9A33XWu170gUtm',
  method: 'emi',
  emi_duration: 9,
  'card[name]': 'Gaurav Kumar',
  'card[number]': '5241810000000000',
  'card[cvv]': '123',
  'card[expiry_month]': '10',
  'card[expiry_year]': '30'
});
```4

## CRED

To add CRED as a payment method, you need to:

- Pass the `app_offer` parameter in Orders API.
- Pass the `method` and `provider` parameters in [Create Payment Method](/razorpay-docs-md/payment-gateway/web-integration/custom/build-integration.md#133-submit-payment-details)  .

#### 1. Pass app\_offer Parameter in Order

You must create an order using Orders API. In the response, you obtain an `order_id` which you must pass to Checkout.

POST

/orders

#### Request Parameters

amount

mandatory

`integer` The transaction amount, expressed in the currency subunit, such as paise (in case of INR). For example, for an actual amount of ₹299.35, the value of this field should be `29935`.

currency

mandatory

`string` The currency in which the transaction should be made. See the [list of supported currencies](/razorpay-docs-md/international-payments.md#supported-currencies). Default is `INR`.

app\_offer

optional

`boolean` Allow/do not allow customers to use CRED coins to make payments. This is used to prevent double discounting scenarios where customers have already availed discounts using voucher/coupon and you do not want them to redeem Coins as well. Possible values:

- `true`: Customer not allowed to use CRED coins to make payment.
- `false` (default): Customer can use CRED coins to make payment.

receipt

optional

`string` Your receipt id for this order should be passed here. Maximum length is 40 characters.

notes

optional

`object` Key-value pair that can be used to store additional information about the entity. Maximum 15 key-value pairs, 256 characters (maximum) each. For example, `"note_key": "Beam me up Scotty”`.

#### 2. Pass Method and Provider Parameters During Payment Creation

Cred

copy

```javascript
razorpay.createPayment({
  amount: 300000,
  email: 'gaurav.kumar@example.com',
  contact: '9000090000',
  order_id: 'order_9A33XWu170gUtm',
  method: 'emi',
  emi_duration: 9,
  'card[name]': 'Gaurav Kumar',
  'card[number]': '5241810000000000',
  'card[cvv]': '123',
  'card[expiry_month]': '10',
  'card[expiry_year]': '30'
});
```5

#### Request Parameters

Along with the other checkout options, you must pass:

method

mandatory

`string` The method used to make the payment. Here, it must be `app`.

provider

mandatory if method=app

`string` Name of the PSP app. Here, it must be `cred`.
