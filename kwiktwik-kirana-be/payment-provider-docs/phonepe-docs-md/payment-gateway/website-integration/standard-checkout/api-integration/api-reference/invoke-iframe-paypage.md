<!-- Source: https://developer.phonepe.com/payment-gateway/website-integration/standard-checkout/api-integration/api-reference/invoke-iframe-paypage -->

# Invoke iframe PayPage

---

To start accepting payments using PhonePe’s PayPage, you need to include the PhonePe Checkout script in your checkout page. This script helps show the payment page to users and supports two ways of opening it:

- **In IFrame** (Recommended) – the PayPage opens within your website.
- **In Redirect Mode** – the user is redirected to a new page.

## Include the PhonePe Checkout Script

To begin, add the following JavaScript file to your checkout page:

Include script

```
<script src="https://mercury.phonepe.com/web/bundle/checkout.js"></script>
```

After adding this script:

- This script will append the `PhonePeCheckout` object in the `window` object.
- This object provides two functions:
  - `PhonePeCheckout.transact`: used to open the PayPage.
  - `PhonePeCheckout.closePage`: used to manually close the PayPage when it’s in IFrame mode.

Use these functions in your checkout flow as per your payment experience requirement.

## Invoking PayPage in IFrame Mode (Recommended)

To open the PayPage directly within your website using an IFrame, call the `transact()` function like this:

Code reference

```
window.PhonePeCheckout.transact({ tokenUrl: "https://merchant-t2.phonepe.com/transact....", callback, type: "IFRAME" });
```

- `tokenUrl` should be passed with the `redirectUrl` received in the Payment API response payload from your backend server.
- `callback` is a function that runs after the PayPage is closed.

Here’s an example callback function:

Code reference

```
function callback (response) {
  if (response === 'USER_CANCEL') {
    /* Add merchant's logic if they have any custom thing to trigger on UI after the transaction is cancelled by the user*/
    return;
  } else if (response === 'CONCLUDED') {
    /* Add merchant's logic if they have any custom thing to trigger on UI after the transaction is in terminal state*/
    return;
  }
}
```

The `response` will either be ‘**USER\_CANCEL**‘ or ‘**CONCLUDED**‘, so you can update your UI based on the result.

## Closing the PayPage IFrame Manually

If you want to close the PayPage on your own logic (only in IFrame mode), use this function:

Code reference

```
window.PhonePeCheckout.closePage();
```

⚠️ ****Use Only for Exceptional Cases****!

---

This function is not recommended for standard use cases, as the IFrame will close automatically once the payment is done. Only use it if you have a specific reason to manually close the PayPage.

## Invoking PayPage in Redirect Mode

If you want to open the PayPage in a new tab or redirect the user to it, use the `transact()` function like this:

Code reference

```
window.PhonePeCheckout.transact({ tokenUrl });
```

- `tokenUrl` is the PayPage link that your backend will get through a webhook call.
- This will take the user to PhonePe’s PayPage.
- After completing the payment, the user will be redirected back to your website.

Make sure your backend verifies the payment status and shows the appropriate message or page to the user.

## Integrating PhonePe Checkout with Flutter Web.

If you’re building a Flutter web application, follow these steps to integrate the PayPage.

- **Include the PhonePe Checkout JavaScript Package**
  - Add the PhonePe Checkout JavaScript package to your project by including the following script.
  - This will load the PhonePe Checkout package into your project and make the PhonePeCheckout object available in the global window context.

Include script

```
<script src="https://mercury-stg.phonepe.com/web/bundle/checkout.js" defer></script>
```

- **Define a JavaScript Function to Invoke PayPage**
  - Create a JavaScript function that calls the PhonePe Checkout transact function with a callback. This function should accept three parameters: tokenUrl, type, and callback.
  - This function checks if the PhonePeCheckout object and its transact method are available, then calls transact with the provided parameters.

Code reference

```
window.checkout = (tokenUrl, type, callback) => {
  if(window && window.PhonePeCheckout && window.PhonePeCheckout.transact) {
     window.PhonePeCheckout.transact({tokenUrl, callback, type});
  }
}
```

- **Define a Callback Function in Your Dart Code**
  - In your Flutter Dart code, define a callback function that will be triggered when a transaction either concludes or is canceled.
  - This callback function receives a response parameter, which indicates the transaction status. You can use this parameter to update your UI or trigger any custom logic depending on whether the user canceled the transaction or it was completed successfully.

Code reference

```
void callback(response) {
   if (response === 'USER_CANCEL') {
     // Add merchant's logic if they have any custom thing to trigger on UI after the transaction is canceled by the user
     return;
   } else if (response === 'CONCLUDED') {
     // Add merchant's logic if they have any custom thing to trigger on UI after the transaction is in terminal state
     return;
   }
}
```

- **Call the Checkout Function from Dart to Open PayPage**
  - When you want to open the PayPage from your Flutter web app, you can check if the checkout function is defined in the JavaScript context and then call it with the required parameters: tokenUrl, type, and the callback wrapped with js.allowInterop.

Code reference

```
import 'dart:js' as js;
void handlePayPage() {
   if(js.context.hasProperty('checkout')) {
      // The package is loaded   
      const redirectUrl = "PayPage Generated URL";
      const type = "IFRAME";    
      js.context.callMethod('checkout', [redirectUrl, type, js.allowInterop(callback)]);
   }
}
```

## What’s Next?

Once the PayPage has been presented and the customer completes the payment, you’ll want to track the status of the transaction to confirm whether it was successful, failed, or is still in progress.

Head over to the next section to learn how to verify the final status of a payment.
