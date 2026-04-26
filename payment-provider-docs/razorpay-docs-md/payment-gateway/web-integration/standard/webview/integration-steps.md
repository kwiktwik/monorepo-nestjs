<!-- Source: https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/webview/integration-steps -->

## Create a WebView on Mobile App

#### Code Sample

JavaScript

copy

```javascript
var options = {
  ... // existing options
  callback_url: 'https://your-server/callback_url',
  redirect: true
}
```

The script that `callback_url` points to should to handle incoming `POST` requests.

For a successful payment, the callback URL will have **razorpay\_payment\_id**. In addition, **razorpay\_order\_id** and **razorpay\_signature** will be returned in the request body, provided your server-side has been integrated with Orders API. Know more about [Orders API](/razorpay-docs-md/api/orders.md).

**Handy Tips**

You can set query parameters with `callback_url` to map it with entities at your end. For example, following is a valid callback URL: `https://your-site.com/callback?cart_id=12345`

#### Failed Payment

## Hand Over Payment Result to Native App

If you are loading the checkout form to WebView on your native mobile app without using the Razorpay SDK, provide a `callback_url` in the Razorpay Checkout parameters. After a successful payment, a redirect is made to the specified URL. You can enable the handover control from the page loaded at **callback\_url** to your native app code.

## Payment Callbacks to Android Native Code

The webpage will be loaded into a WebView class. To communicate anything from the webpage loaded into WebView to native code, you would need to add a JavaScriptInterface to the WebView.

#### Add JavascriptInterface to WebView

java

copy

```java
webView.addJavascriptInterface("PaymentInterface", new PaymentInterface());
```

java

copy

```java
class PaymentInterface{
  @JavascriptInterface
  public void success(String data){
  }

  @JavascriptInterface
  public void error(String data){
  }
}
```

The JavaScript code loaded into WebView calls the native methods of **PaymentInterface** class, **PaymentInterface.success()** and **PaymentInterface.error()**.

## Enable Cookies

You should enable cookies on your app to access features such as **saved cards**. Know more about [saved cards](/razorpay-docs-md/dashboard/account-settings/checkout-features.md#flash-checkout).

## Code to Enable Cookies

Add the following code to your WebView to enable cookies.

Enable Cookies

copy

```java
if (android.os.Build.VERSION.SDK_INT >= 21) {   
     CookieManager.getInstance().setAcceptThirdPartyCookies(mWebView, true);
} else {
     CookieManager.getInstance().setAcceptCookie(true);
}
```

**Handy Tips**

Use `setAcceptThirdPartyCookies` for API level 21 and above.

## Payment Callbacks to iOS Native Code

**WKWebView** framework is used to implement a bridge between JavaScript and the native code as **UIWebView** does not provide this functionality. The bridge is added by passing an instance of **WKScriptMessageHandler** and a string (which is the name of the bridge).

swift

copy

```swift
webView.configuration.userContentController.add(self, name: "PaymentJSBridge")
```

The instance of WKScriptMessageHandler which is passed needs to implement a function userContentController(WKUserContentController, WKScriptMessage). Once the function is implemented, the data is sent by JavaScript and can be retrieved inside the function.

swift

copy

```swift
public func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
  if let messageBody = message.body as? [AnyHashable:Any]{

  }
}
```

At the JavaScript end, data is sent to the iOS native code by evaluating the following JavaScript.

JavaScript

copy

```javascript
window.webkit.messageHandlers.PaymentJSBridge.postMessage(messageBody)
```

**Handy Tips**

Only the function `userContentController` can be called from the JavaScript by evaluating the above-mentioned script. The `messageBody` passed by the script must contain the appropriate data to control the flow of the native code.
