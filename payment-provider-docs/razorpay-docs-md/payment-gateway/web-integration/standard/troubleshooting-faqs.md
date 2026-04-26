<!-- Source: https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/troubleshooting-faqs -->

1. Why are my customer payments being automatically refunded?

Payments made without an `order_id` cannot be captured and are automatically refunded. Create an order using the [Orders API](/razorpay-docs-md/payment-gateway/web-integration/standard/integration-steps.md#11-create-an-order-in-server) before initiating payments.

View Port Meta Tag

copy

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
```

3. Is a timeout applicable on transactions?

Transaction timeout is applicable only when your customer attempts the payment. It times outs between 3 to 15 minutes.

The customer is redirected to the checkout if a payment fails due to timeout.

4. Can I track the status of the checkout modal?

Yes, you can track the status of the checkout modal. You can do this by passing a modal object with `ondismiss: function(){}` as `options`. The `ondismiss` function is called when the modal is closed by the user.

Javascript

copy

```javascript
var options = {
    "key": "<YOUR_KEY_ID>", // Enter the Key ID generated from the Dashboard
    "amount": "29935",
    "name": "Acme Corp",
    "description": "A Wild Sheep Chase is the third novel by Japanese author Haruki Murakami",
    "image": "http://example.com/your_logo.jpg",
    "handler": function (response){
        alert(response.razorpay_payment_id);
    },
    /**
      * You can track the modal lifecycle by * adding the below code in your options
      */
    "modal": {
        "ondismiss": function(){
            console.log('Checkout form closed');
        }
    }
};
var rzp1 = new Razorpay(options);
```

You can utilise the `handler` function called on every successful transaction for tracking payment completion.

5. What is the difference between webhooks and callback URL?

You can use Callback URL and webhook to get the status of the transaction for a payment source.

6. How do I resolve a 500 internal server error?

Multiple factors can cause a 500 internal server error. Ensure that the required features are enabled on your account. Additionally, verify that you are calling the API correctly. If the issue is still not resolved, contact our [Support team](https://razorpay.com/support/#request).

7. Is Razorpay Checkout supported on Internet Explorer?

No, Razorpay Checkout is not supported on the Internet Explorer browser.

8. How can I enable customer information autofill at checkout?

Customer information autofill is enabled by default for all businesses using Razorpay Standard Checkout. It prefills details like contact information, addresses and more, making the checkout process faster and smoother for your customers.

9. Can customers edit pre-filled information on checkout?

Yes, customers can edit all pre-filled information based on their requirement.

10. Is the autofill feature supported on all platforms?

No, autofill is supported only on Instagram, Facebook and iOS browsers.

11. Can I accept payments through my Instagram page even if I do not have a website?

Yes, you can accept payments without a website using Razorpay's no-code products such as [Payment Links](/razorpay-docs-md/payment-links.md), [Payment Pages](/razorpay-docs-md/payment-pages.md) or [Payment Button](/razorpay-docs-md/payment-button.md), as Razorpay does not offer a direct Instagram integration.

12. Are language-based SDKs available?

Yes, language-based SDKs are available [here](/razorpay-docs-md/server-integration.md).

13. The  netbanking    bank page is not opening on the Firefox browser. How to resolve this?

Mozilla Firefox users may not be able to open the bank page while making a netbanking payment on your checkout. This issue may be due to a browser setting that blocks the webpage from opening a pop-up page.

Your customers can follow these steps to unblock the pop-up page:

- At **page level**: Modify settings on the bank page.
- At **browser level**: Modify Firefox browser's settings.

### Page Level

Modify the settings on your bank page. Follow these steps:

1. Open Mozilla Firefox.
2. Navigate to **Tools** → **Page Info** → **Permissions**
3. Set **Open Pop-up Windows** to Allow.

### Browser Level

Modify the settings of your Firefox browser. Follow these steps:

1. Open Mozilla Firefox.
2. Navigate to **Preferences** → **Privacy & Security** → **Permissions**.
3. Disable the **Block pop-up windows** option.

14. Which payment methods appear on Instagram/Facebook browsers?

Payment methods like [UPI Intent](/razorpay-docs-md/payment-methods/upi/upi-intent.md) and [Cards](/razorpay-docs-md/payment-methods/cards.md) will appear on Instagram/Facebook browsers. These browsers do not support any other payment method that opens on a pop-up page.

15. Can I enable UPI Intent in WebView on my app?

Yes, you can enable UPI Intent in WebView on your:

- [Android app](/razorpay-docs-md/payment-gateway/web-integration/standard/webview/upi-intent-android.md)
- [iOS app](/razorpay-docs-md/payment-gateway/web-integration/standard/webview/upi-intent-ios.md)

16. While using Razorpay UPI Intent, my customers are encountering this error, "Safari cannot open the page because the address is invalid." How can I resolve this?

To resolve the error, request your customers to refresh the page and clear the browser cache.

17. How can I accept payments on my Android or iOS apps without integrating with the native SDKs?

If you want to accept payments on your Android or iOS apps without integrating with our native SDKs, you can reuse your Standard Integration code. This approach opens the checkout form in a WebView within your mobile app. Know more about [Webview for Mobile Apps](/razorpay-docs-md/payment-gateway/web-integration/standard/webview.md).

18. How do I accept international payments on checkout?

You need to enable the international payments feature on your Razorpay account. Refer to [international payments](/razorpay-docs-md/international-payments.md).

19. What languages are supported on Razorpay checkout?

Razorpay checkout fields support multiple languages, with English as the default. Customers can also choose Hindi, Marathi, Gujarati, Telugu, Tamil, Bengali and Kannada. Know more about [checkout in local languages](/razorpay-docs-md/payment-gateway/features.md).

20. Can I switch between Standard Integration and Quick Integration?

Yes, it is possible to easily switch from one integration method to another. If you were earlier using Standard Integration, you can switch to using [Quick Integration](/razorpay-docs-md/payment-gateway/quick-integration.md).

- This is possible because the Standard Integration searches for the `data-key` field inside the `<script>` tag, that when found, switches to automatic mode.
- It also creates a button alongside the `<script>` tag and attaches its 'onclick event handler' (created internally) to the `.open` method of the Razorpay object.
