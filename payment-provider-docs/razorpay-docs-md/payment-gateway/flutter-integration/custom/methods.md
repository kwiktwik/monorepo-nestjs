<!-- Source: https://razorpay.com/docs/payments/payment-gateway/flutter-integration/custom/methods -->

Documented below are the methods for the Flutter plugin.

## Interface Methods

### getPaymentMethods

Use this method for fetching the payment methods:

Get Payment Methods

copy

```javascript
onPressed: () {
   final paymentMethods = await _razorpay.getPaymentMethods();
}
```

### getAppsWhichSupportUpi

Use this method for fetching those apps on the customer's phone which support UPI payments:

Get Apps which support UPI

copy

```javascript
onPressed: () {
   final supportedUpiApps = _razorpay.getAppsWhichSupportUpi();
}
```

### getCardNetwork

Use this method to get the card network. This function expects the card number as a parameter and returns the card network. For example, VISA, Mastercard, RuPay and so on:

Get Card Network

copy

```javascript
onPressed: () {
   final cardNetwork = _razorpay.getCardsNetwork("<card-number>");
}
```

### isValidCardNumber

Use this method to validate the card number. This function returns a boolean value that determines the card is valid or invalid:

Is Valid Card Number

copy

```javascript
onPressed: () {
   final isValidCard = await _razorpay.isValidCardNumber('<card-number>');
}
```

### getBankLogoUrl

You must use bank code as the method parameter returned in the `getPaymentMethod()` to fetch the bank logo URL.

Get Bank Logo URL

copy

```javascript
onPressed: () {
final bankLogoUrl = _razorpay.getBankLogoUrl("<bank-code>");
}
```

### changeApiKey

Use this method for changing the API keys:

Change API Key

copy

```javascript
onPressed: () {
   _razorpay.changeApiKey(‘api-key’);
}
```

### getCardNetworkLength

Use this method for fetching the card network length:

Get Card Network Length

copy

```javascript
onPressed: () {
   final length = await _razorpay.getCardNetworkLenght('VISA');
}
```

### getSubscriptionAmount

Use this method for fetching the subscription amount using the `subscription_id`:

Get Subscription Amount

copy

```javascript
onPressed: () {
   final subAmount = await _razorpay.getSubscriptionAmount('sub_8tkmbhhROdiVSc');
}
```

### getWalletLogoUrl

Use this method for fetching the wallet logo URL:

Get Wallet Logo URL

copy

```javascript
onPressed: () {
   final walletLogo = await _razorpay.getWalletLogoUrl('paytm');
}
```

### Submit

Use this method for submitting the payment details:

Submit Payment Details

copy

```javascript
onPressed: () {
   var options = {
           'key': key,
           'amount': 100,
           'currency': '',
           'email': 'gaurav.kumar@example.com',
           'contact': '+919876543210',
           'method': 'netbanking',
           'bank': 'hdfc'
       };
   _razorpay.submit(options);
}
```

## Listening to Events

Events are triggered from the SDK for handling success or error on payments, Register for these events in the initState() method in their flutter apps as given below:

Listening to Events

copy

```javascript
onPressed: () {
   final supportedUpiApps = _razorpay.getAppsWhichSupportUpi();
}
```0

## Error Codes

The error codes have been exposed as integers by the `Razorpay` class. The error code is available as the code field of the `PaymentFailureResponse` instance passed to the callback.
