<!-- Source: https://razorpay.com/docs/payments/payment-gateway/react-native-integration/custom/additional-features -->

Use the Razorpay React Native Custom UI SDK to integrate supported payment methods on the Checkout form of your app as per your business requirements.

**Handy Tips**

Ensure you have called `Razorpay.initRazorpay(key)` in your build integration before using any of the methods on this page. Know more about [initializing the SDK](/razorpay-docs-md/payment-gateway/react-native-integration/custom/additional-features.md).

- [Fetch Payment Methods](/razorpay-docs-md/payment-gateway/react-native-integration/custom/additional-features.md#fetch-payment-methods)
- [Debit and Credit Card](/razorpay-docs-md/payment-gateway/react-native-integration/custom/additional-features.md#debit-and-credit-card)
- [EMI on Credit and Debit Cards](/razorpay-docs-md/payment-gateway/react-native-integration/custom/additional-features.md#emi-on-credit-and-debit-cards)
- [Cardless EMI](/razorpay-docs-md/payment-gateway/react-native-integration/custom/additional-features.md#cardless-emi)
- [Netbanking](/razorpay-docs-md/payment-gateway/react-native-integration/custom/additional-features.md#netbanking)
- [Wallet](/razorpay-docs-md/payment-gateway/react-native-integration/custom/additional-features.md#wallet)
- [UPI](/razorpay-docs-md/payment-gateway/react-native-integration/custom/additional-features.md#upi)
- [Pay Later](/razorpay-docs-md/payment-gateway/react-native-integration/custom/additional-features.md#pay-later)
- [Emandate](/razorpay-docs-md/payment-gateway/react-native-integration/custom/additional-features.md#emandate)
- [CRED](/razorpay-docs-md/payment-gateway/react-native-integration/custom/additional-features.md#cred)

- [Card Utilities](/razorpay-docs-md/payment-gateway/react-native-integration/custom/additional-features.md#card-utilities)
- [Logo](/razorpay-docs-md/payment-gateway/react-native-integration/custom/additional-features.md#logo)

## Fetch Payment Methods

Use the [Fetch Payment Methods API](/razorpay-docs-md/payment-gateway/android-integration/custom/build-integration.md#14-fetch-payment-methods) to fetch the payment methods available for your account.

JavaScript

copy

```javascript
Razorpay.getPaymentMethods().then(paymentMethods => {
  console.log(paymentMethods);
});
```

The response includes the list of enabled payment methods, available banks for netbanking, and EMI plans for eligible cards.

Below are the sample payloads for each payment method.

## Debit and Credit Card

For card payments, specify `method` as `card` and pass the card details as shown below:

JavaScript

copy

```javascript
Razorpay.open({
  description: 'Credits towards consultation',
  currency: 'INR',
  key_id: '<YOUR_KEY_ID>',
  amount: '5000',
  email: 'gaurav.kumar@example.com',
  contact: '9000090000',
  order_id: 'order_9A33XWu170gUtm',
  method: 'card',
  card: {
    number: '4386289407660153',
    name: 'Gaurav Kumar',
    expiry_month: '10',
    expiry_year: '30',
    cvv: '566'
  }
}).then((data) => {
  // handle success
  alert(`Success: ${data.razorpay_payment_id}`);
}).catch((error) => {
  // handle failure
  alert(`Error: ${error.code} | ${error.description}`);
});
```

## EMI on Credit and Debit Cards

For EMI payments, specify `method` as `emi` and include the `emi_duration` field corresponding to the number of months for the EMI plan selected by the customer.

JavaScript

copy

```javascript
Razorpay.open({
  description: 'Credits towards consultation',
  currency: 'INR',
  key_id: '<YOUR_KEY_ID>',
  amount: '300000',
  email: 'gaurav.kumar@example.com',
  contact: '9000090000',
  order_id: 'order_9A33XWu170gUtm',
  method: 'emi',
  emi_duration: 9,
  card: {
    number: '5241810000000000',
    name: 'Gaurav Kumar',
    expiry_month: '10',
    expiry_year: '30',
    cvv: '123'
  }
}).then((data) => {
  // handle success
  alert(`Success: ${data.razorpay_payment_id}`);
}).catch((error) => {
  // handle failure
  alert(`Error: ${error.code} | ${error.description}`);
});
```

#### Fetch EMI Plans

EMI plans are included in the `getPaymentMethods()` response. You can use this to display available plans and interest rates to your customers.

JavaScript

copy

```javascript
Razorpay.getPaymentMethods().then(paymentMethods => {
  console.log(paymentMethods.emi_plans);
});
```

Response

copy

```json
{
  "HDFC": {
    "min_amount": 300000,
    "plans": {
      "3": 12,
      "6": 12,
      "9": 13,
      "12": 13,
      "18": 15,
      "24": 15
    }
  },
  "AMEX": {
    "min_amount": 500000,
    "plans": {
      "3": 15,
      "6": 15,
      "9": 15,
      "12": 15
    }
  }
}
```

emi\_plans

`string` Lists the EMI-supported banks with their respective interest rates.

#### Calculate EMI

Use `Razorpay.calculateEmi` to calculate the instalment amount for a given principal, duration, and interest rate.

JavaScript

copy

```javascript
Razorpay.calculateEmi(principalAmount, durationInMonths, annualInterestRate);
```

The code below calculates the EMI for a principal amount of 10000 (in paisa), that is, ₹100 over 12 months at an annual interest rate of 9%:

JavaScript

copy

```javascript
Razorpay.calculateEmi(10000, 12, 9);
// = 874
```

**Handy Tips**

The above code does not do any unit conversion of the principal amount. The returned amount will have the same unit as the principal. If the principal amount is in paisa, the returned EMI amount will also be in paisa.

## Cardless EMI

Cardless EMI is a checkout payment method that allows customers to convert their payment amount to EMIs without a debit or credit card.

**Feature Request**

This is an on-demand feature. Please raise a request with our [Support team](https://razorpay.com/support/#request) to get this feature activated on your Razorpay account.

For cardless EMI payments, specify `method` as `cardless_emi` and pass the `provider` as shown below:

JavaScript

copy

```javascript
Razorpay.open({
  description: 'Credits towards consultation',
  currency: 'INR',
  key_id: '<YOUR_KEY_ID>',
  amount: '5000',
  email: 'gaurav.kumar@example.com',
  contact: '9000090000',
  order_id: 'order_9A33XWu170gUtm',
  method: 'cardless_emi',
  provider: '<provider_name>'
}).then((data) => {
  // handle success
  alert(`Success: ${data.razorpay_payment_id}`);
}).catch((error) => {
  // handle failure
  alert(`Error: ${error.code} | ${error.description}`);
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

For netbanking payments, specify `method` as `netbanking` and pass the bank code as shown below:

JavaScript

copy

```javascript
Razorpay.open({
  description: 'Credits towards consultation',
  currency: 'INR',
  key_id: '<YOUR_KEY_ID>',
  amount: '5000',
  email: 'gaurav.kumar@example.com',
  contact: '9000090000',
  order_id: 'order_9A33XWu170gUtm',
  method: 'netbanking',
  bank: 'HDFC'
}).then((data) => {
  // handle success
  alert(`Success: ${data.razorpay_payment_id}`);
}).catch((error) => {
  // handle failure
  alert(`Error: ${error.code} | ${error.description}`);
});
```

You can list the available banks using a drop-down for customers. Obtain the list of banks from the `getPaymentMethods()` response.

## Wallet

For wallet payments, specify `method` as `wallet` and pass the wallet code as shown below:

JavaScript

copy

```javascript
Razorpay.open({
  description: 'Credits towards consultation',
  currency: 'INR',
  key_id: '<YOUR_KEY_ID>',
  amount: '5000',
  email: 'gaurav.kumar@example.com',
  contact: '9000090000',
  order_id: 'order_9A33XWu170gUtm',
  method: 'wallet',
  wallet: 'mobikwik'
}).then((data) => {
  // handle success
  alert(`Success: ${data.razorpay_payment_id}`);
}).catch((error) => {
  // handle failure
  alert(`Error: ${error.code} | ${error.description}`);
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
- `bajajpay` (requires [approval](https://razorpay.com/support/#request)

  )
- `paypal` (requires [approval](https://razorpay.com/support/#request)

  )
- `phonepeswitch` (requires [approval](https://razorpay.com/support/#request)

  )

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

Follow the steps given below to use UPI Intent flow in Razorpay's React Native Custom UI plugin:

1. Call `getAppsWhichSupportUPI` to get all UPI apps available on the customer's device.

JavaScript

copy

```javascript
Razorpay.open({
  description: 'Credits towards consultation',
  currency: 'INR',
  key_id: '<YOUR_KEY_ID>',
  amount: '5000',
  email: 'gaurav.kumar@example.com',
  contact: '9000090000',
  order_id: 'order_9A33XWu170gUtm',
  method: 'card',
  card: {
    number: '4386289407660153',
    name: 'Gaurav Kumar',
    expiry_month: '10',
    expiry_year: '30',
    cvv: '566'
  }
}).then((data) => {
  // handle success
  alert(`Success: ${data.razorpay_payment_id}`);
}).catch((error) => {
  // handle failure
  alert(`Error: ${error.code} | ${error.description}`);
});
```0

1. Pass the `upi_app_package_name` from the `getAppsWhichSupportUPI()` response. Ensure you pass the exact package name, otherwise it will not pass validation.

JavaScript

copy

```javascript
Razorpay.open({
  description: 'Credits towards consultation',
  currency: 'INR',
  key_id: '<YOUR_KEY_ID>',
  amount: '5000',
  email: 'gaurav.kumar@example.com',
  contact: '9000090000',
  order_id: 'order_9A33XWu170gUtm',
  method: 'card',
  card: {
    number: '4386289407660153',
    name: 'Gaurav Kumar',
    expiry_month: '10',
    expiry_year: '30',
    cvv: '566'
  }
}).then((data) => {
  // handle success
  alert(`Success: ${data.razorpay_payment_id}`);
}).catch((error) => {
  // handle failure
  alert(`Error: ${error.code} | ${error.description}`);
});
```1

1. For iOS, add the following to your app's `info.plist` file to allow your app to open UPI PSP apps:

XML

copy

```javascript
Razorpay.open({
  description: 'Credits towards consultation',
  currency: 'INR',
  key_id: '<YOUR_KEY_ID>',
  amount: '5000',
  email: 'gaurav.kumar@example.com',
  contact: '9000090000',
  order_id: 'order_9A33XWu170gUtm',
  method: 'card',
  card: {
    number: '4386289407660153',
    name: 'Gaurav Kumar',
    expiry_month: '10',
    expiry_year: '30',
    cvv: '566'
  }
}).then((data) => {
  // handle success
  alert(`Success: ${data.razorpay_payment_id}`);
}).catch((error) => {
  // handle failure
  alert(`Error: ${error.code} | ${error.description}`);
});
```2

Check the complete list of [UPI supported apps and their package names](/razorpay-docs-md/payment-methods/upi/supported-apps.md).

#### Collect Flow

**Deprecation Notice**

UPI Collect is deprecated effective 28 February 2026. This is applicable only for exempted businesses. If you are not covered by the exemptions, refer to the [migration documentation](/docs/announcements/upi-collect-migration/custom-integration/) to switch to UPI Intent.

JavaScript

copy

```javascript
Razorpay.open({
  description: 'Credits towards consultation',
  currency: 'INR',
  key_id: '<YOUR_KEY_ID>',
  amount: '5000',
  email: 'gaurav.kumar@example.com',
  contact: '9000090000',
  order_id: 'order_9A33XWu170gUtm',
  method: 'card',
  card: {
    number: '4386289407660153',
    name: 'Gaurav Kumar',
    expiry_month: '10',
    expiry_year: '30',
    cvv: '566'
  }
}).then((data) => {
  // handle success
  alert(`Success: ${data.razorpay_payment_id}`);
}).catch((error) => {
  // handle failure
  alert(`Error: ${error.code} | ${error.description}`);
});
```3

## Pay Later

You can enable your customers to make payments using the Pay Later service offered by various third-party providers.

**Feature Request**

This is an on-demand feature. Please raise a request with our [Support team](https://razorpay.com/support/#request) to get this feature activated on your Razorpay account.

For Pay Later payments, specify `method` as `paylater` and pass the `provider` as shown below:

JavaScript

copy

```javascript
Razorpay.open({
  description: 'Credits towards consultation',
  currency: 'INR',
  key_id: '<YOUR_KEY_ID>',
  amount: '5000',
  email: 'gaurav.kumar@example.com',
  contact: '9000090000',
  order_id: 'order_9A33XWu170gUtm',
  method: 'card',
  card: {
    number: '4386289407660153',
    name: 'Gaurav Kumar',
    expiry_month: '10',
    expiry_year: '30',
    cvv: '566'
  }
}).then((data) => {
  // handle success
  alert(`Success: ${data.razorpay_payment_id}`);
}).catch((error) => {
  // handle failure
  alert(`Error: ${error.code} | ${error.description}`);
});
```4

Possible values for `provider`:

- `lazypay`
- `paypal`

## Emandate

You can accept recurring payments from your customers using `emandate` as the method. For more information about authorisation and subsequent payments, refer to the [Recurring Payments documentation](/razorpay-docs-md/recurring-payments.md).

**Feature Request**

This is an on-demand feature. Please raise a request with our [Support team](https://razorpay.com/support/#request) to get this feature activated on your Razorpay account.

Emandate (Netbanking)

copy

```javascript
Razorpay.open({
  description: 'Credits towards consultation',
  currency: 'INR',
  key_id: '<YOUR_KEY_ID>',
  amount: '5000',
  email: 'gaurav.kumar@example.com',
  contact: '9000090000',
  order_id: 'order_9A33XWu170gUtm',
  method: 'card',
  card: {
    number: '4386289407660153',
    name: 'Gaurav Kumar',
    expiry_month: '10',
    expiry_year: '30',
    cvv: '566'
  }
}).then((data) => {
  // handle success
  alert(`Success: ${data.razorpay_payment_id}`);
}).catch((error) => {
  // handle failure
  alert(`Error: ${error.code} | ${error.description}`);
});
```5

Emandate (Debit Card)

copy

```javascript
Razorpay.open({
  description: 'Credits towards consultation',
  currency: 'INR',
  key_id: '<YOUR_KEY_ID>',
  amount: '5000',
  email: 'gaurav.kumar@example.com',
  contact: '9000090000',
  order_id: 'order_9A33XWu170gUtm',
  method: 'card',
  card: {
    number: '4386289407660153',
    name: 'Gaurav Kumar',
    expiry_month: '10',
    expiry_year: '30',
    cvv: '566'
  }
}).then((data) => {
  // handle success
  alert(`Success: ${data.razorpay_payment_id}`);
}).catch((error) => {
  // handle failure
  alert(`Error: ${error.code} | ${error.description}`);
});
```6

Emandate (Aadhaar)

copy

```javascript
Razorpay.open({
  description: 'Credits towards consultation',
  currency: 'INR',
  key_id: '<YOUR_KEY_ID>',
  amount: '5000',
  email: 'gaurav.kumar@example.com',
  contact: '9000090000',
  order_id: 'order_9A33XWu170gUtm',
  method: 'card',
  card: {
    number: '4386289407660153',
    name: 'Gaurav Kumar',
    expiry_month: '10',
    expiry_year: '30',
    cvv: '566'
  }
}).then((data) => {
  // handle success
  alert(`Success: ${data.razorpay_payment_id}`);
}).catch((error) => {
  // handle failure
  alert(`Error: ${error.code} | ${error.description}`);
});
```7

## Card Utilities

You can use these methods for card payment method integration.

#### Fetch Card Network

The SDK provides a method to get the card network name of the card number.

- At least 6 digits of the card number are required to identify the network.
- Possible values returned by this method are `visa`, `mastercard`, `maestro16`, `amex`, `rupay`, `maestro`, `diners` and `unknown`.
- If it cannot identify the network, it returns `unknown`.

JavaScript

copy

```javascript
Razorpay.open({
  description: 'Credits towards consultation',
  currency: 'INR',
  key_id: '<YOUR_KEY_ID>',
  amount: '5000',
  email: 'gaurav.kumar@example.com',
  contact: '9000090000',
  order_id: 'order_9A33XWu170gUtm',
  method: 'card',
  card: {
    number: '4386289407660153',
    name: 'Gaurav Kumar',
    expiry_month: '10',
    expiry_year: '30',
    cvv: '566'
  }
}).then((data) => {
  // handle success
  alert(`Success: ${data.razorpay_payment_id}`);
}).catch((error) => {
  // handle failure
  alert(`Error: ${error.code} | ${error.description}`);
});
```8

#### Card Number Validation

The SDK provides a checksum-based method to determine if the entered card number is valid or not.

JavaScript

copy

```javascript
Razorpay.open({
  description: 'Credits towards consultation',
  currency: 'INR',
  key_id: '<YOUR_KEY_ID>',
  amount: '5000',
  email: 'gaurav.kumar@example.com',
  contact: '9000090000',
  order_id: 'order_9A33XWu170gUtm',
  method: 'card',
  card: {
    number: '4386289407660153',
    name: 'Gaurav Kumar',
    expiry_month: '10',
    expiry_year: '30',
    cvv: '566'
  }
}).then((data) => {
  // handle success
  alert(`Success: ${data.razorpay_payment_id}`);
}).catch((error) => {
  // handle failure
  alert(`Error: ${error.code} | ${error.description}`);
});
```9

#### Fetch Card Number Length for Card Network

The SDK provides a method to get the card number length for a specific card network.

JavaScript

copy

```javascript
Razorpay.open({
  description: 'Credits towards consultation',
  currency: 'INR',
  key_id: '<YOUR_KEY_ID>',
  amount: '300000',
  email: 'gaurav.kumar@example.com',
  contact: '9000090000',
  order_id: 'order_9A33XWu170gUtm',
  method: 'emi',
  emi_duration: 9,
  card: {
    number: '5241810000000000',
    name: 'Gaurav Kumar',
    expiry_month: '10',
    expiry_year: '30',
    cvv: '123'
  }
}).then((data) => {
  // handle success
  alert(`Success: ${data.razorpay_payment_id}`);
}).catch((error) => {
  // handle failure
  alert(`Error: ${error.code} | ${error.description}`);
});
```0

## Validate VPA

The SDK provides a method to determine if the entered Virtual Payment Address (VPA) is valid or not. A failure response is triggered when the VPA is empty or the device is not connected to data to make the validation.

JavaScript

copy

```javascript
Razorpay.open({
  description: 'Credits towards consultation',
  currency: 'INR',
  key_id: '<YOUR_KEY_ID>',
  amount: '300000',
  email: 'gaurav.kumar@example.com',
  contact: '9000090000',
  order_id: 'order_9A33XWu170gUtm',
  method: 'emi',
  emi_duration: 9,
  card: {
    number: '5241810000000000',
    name: 'Gaurav Kumar',
    expiry_month: '10',
    expiry_year: '30',
    cvv: '123'
  }
}).then((data) => {
  // handle success
  alert(`Success: ${data.razorpay_payment_id}`);
}).catch((error) => {
  // handle failure
  alert(`Error: ${error.code} | ${error.description}`);
});
```1

## Logo

Given below are the sample codes for fetching various payment method logo URLs.

#### Fetch Bank Logo URL

The SDK provides a method to fetch the bank logo URL. The `bankCode` is available in the `getPaymentMethods()` response.

JavaScript

copy

```javascript
Razorpay.open({
  description: 'Credits towards consultation',
  currency: 'INR',
  key_id: '<YOUR_KEY_ID>',
  amount: '300000',
  email: 'gaurav.kumar@example.com',
  contact: '9000090000',
  order_id: 'order_9A33XWu170gUtm',
  method: 'emi',
  emi_duration: 9,
  card: {
    number: '5241810000000000',
    name: 'Gaurav Kumar',
    expiry_month: '10',
    expiry_year: '30',
    cvv: '123'
  }
}).then((data) => {
  // handle success
  alert(`Success: ${data.razorpay_payment_id}`);
}).catch((error) => {
  // handle failure
  alert(`Error: ${error.code} | ${error.description}`);
});
```2

#### Fetch Wallet Logo URL

The SDK provides a method to get the wallet logo URL.

JavaScript

copy

```javascript
Razorpay.open({
  description: 'Credits towards consultation',
  currency: 'INR',
  key_id: '<YOUR_KEY_ID>',
  amount: '300000',
  email: 'gaurav.kumar@example.com',
  contact: '9000090000',
  order_id: 'order_9A33XWu170gUtm',
  method: 'emi',
  emi_duration: 9,
  card: {
    number: '5241810000000000',
    name: 'Gaurav Kumar',
    expiry_month: '10',
    expiry_year: '30',
    cvv: '123'
  }
}).then((data) => {
  // handle success
  alert(`Success: ${data.razorpay_payment_id}`);
}).catch((error) => {
  // handle failure
  alert(`Error: ${error.code} | ${error.description}`);
});
```3

#### Fetch Wallet Square Logo URL

The SDK provides a method to get the wallet's square-shaped logo URL.

JavaScript

copy

```javascript
Razorpay.open({
  description: 'Credits towards consultation',
  currency: 'INR',
  key_id: '<YOUR_KEY_ID>',
  amount: '300000',
  email: 'gaurav.kumar@example.com',
  contact: '9000090000',
  order_id: 'order_9A33XWu170gUtm',
  method: 'emi',
  emi_duration: 9,
  card: {
    number: '5241810000000000',
    name: 'Gaurav Kumar',
    expiry_month: '10',
    expiry_year: '30',
    cvv: '123'
  }
}).then((data) => {
  // handle success
  alert(`Success: ${data.razorpay_payment_id}`);
}).catch((error) => {
  // handle failure
  alert(`Error: ${error.code} | ${error.description}`);
});
```4

## CRED

Use the SDK to check if the CRED app is installed on the customer's device before initiating a CRED payment.

**Step 1:** Check if CRED app is available.

JavaScript

copy

```javascript
Razorpay.open({
  description: 'Credits towards consultation',
  currency: 'INR',
  key_id: '<YOUR_KEY_ID>',
  amount: '300000',
  email: 'gaurav.kumar@example.com',
  contact: '9000090000',
  order_id: 'order_9A33XWu170gUtm',
  method: 'emi',
  emi_duration: 9,
  card: {
    number: '5241810000000000',
    name: 'Gaurav Kumar',
    expiry_month: '10',
    expiry_year: '30',
    cvv: '123'
  }
}).then((data) => {
  // handle success
  alert(`Success: ${data.razorpay_payment_id}`);
}).catch((error) => {
  // handle failure
  alert(`Error: ${error.code} | ${error.description}`);
});
```5

**Step 2:** If CRED is available, initiate the payment using `method: 'app'` and `provider: 'cred'`.

JavaScript

copy

```javascript
Razorpay.open({
  description: 'Credits towards consultation',
  currency: 'INR',
  key_id: '<YOUR_KEY_ID>',
  amount: '300000',
  email: 'gaurav.kumar@example.com',
  contact: '9000090000',
  order_id: 'order_9A33XWu170gUtm',
  method: 'emi',
  emi_duration: 9,
  card: {
    number: '5241810000000000',
    name: 'Gaurav Kumar',
    expiry_month: '10',
    expiry_year: '30',
    cvv: '123'
  }
}).then((data) => {
  // handle success
  alert(`Success: ${data.razorpay_payment_id}`);
}).catch((error) => {
  // handle failure
  alert(`Error: ${error.code} | ${error.description}`);
});
```6

## Related information

- [Saved Cards](/razorpay-docs-md/payment-gateway/web-integration/custom/features/saved-cards/scenario-1.md)
