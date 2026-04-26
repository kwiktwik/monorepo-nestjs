<!-- Source: https://razorpay.com/docs/payments/payment-gateway/web-integration/custom/features/webview/upi-intent-ios -->

Follow the steps given below to enable UPI intent in WebView on your iOS application:

**1.1** [Setup App to Handle Deep Links](/razorpay-docs-md/payment-gateway/web-integration/custom/features/webview/upi-intent-ios.md#11-setup-app-to-handle-deep-links)

**1.2** [Setup WKNavigationDelegate for WKWebView](/razorpay-docs-md/payment-gateway/web-integration/custom/features/webview/upi-intent-ios.md#12-setup-wknavigationdelegate-for-wkwebview)

**1.3** [Conforming to WKNavigationDelegate](/razorpay-docs-md/payment-gateway/web-integration/custom/features/webview/upi-intent-ios.md#13-conforming-to-wknavigationdelegate)

**1.4** [Enable UPI Intent Support](/razorpay-docs-md/payment-gateway/web-integration/custom/features/webview/upi-intent-ios.md#14-enable-upi-intent-support)

## 1.1 Setup App to Handle Deep Links

Add the code given below to your `AppDelegate`. In this example, we override the `application(_:open:options:)` method to handle deep link URLs. You can use this method to parse the URL and determine which screen or content to display in your app.

SwiftObjective C

copy

```swift
func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
    return true
}
```

## 1.2 Setup WKNavigationDelegate for WKWebView

Get a reference to your `WKWebView` and call the `navigationDelegate` property to setup `WKWebView` using the following code. Add the `loadWebPage` function to load your content.

SwiftObjective C

copy

```swift
class CheckoutPaymentViewController: UIViewController {
    
    var checkoutUrl: String?

    // You can assign the checkout URL String to checkoutUrl property or pass it from previous page.
    
    @IBOutlet weak var wkWebView: WKWebView!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        wkWebView.navigationDelegate = self
        self.loadWebPage()
    }
    
    func loadWebPage() {
        guard let urlString = self.checkoutUrl else { return }
        guard let url = URL(string: urlString) else { return }
        self.wkWebView.load(URLRequest(url: url))
    }
}
```

## 1.3 Conforming to WKNavigationDelegate

Create a `WKNavigationDelegate` to handle navigation events in your `WKWebView`.
In this example, we override the WebView`(_:decidePolicyFor:decisionHandler:)` method to handle navigation events in the WKWebView. If the URL scheme is not `http` or `https`, then we check if the URL can be opened using the `UIApplication.shared.canOpenURL()` method.

- If yes, then we open the URL using the `UIApplication.shared.open()` method.
- If not, then we allow the navigation to continue using the `decisionHandler(.allow)` method.

SwiftObjective C

copy

```swift
extension CheckoutPaymentViewController: WKNavigationDelegate {
    func webView(_ webView: WKWebView,
                 decidePolicyFor navigationAction: WKNavigationAction,
                 decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        
        // If the request is a non-http(s) schema, then have the UIApplication handle opening the request.
        if let url = navigationAction.request.url,
           !url.absoluteString.hasPrefix("http://"),
           !url.absoluteString.hasPrefix("https://"),
           UIApplication.shared.canOpenURL(url) {
            
            // Have UIApplication handle the url (sms:, tel:, mailto:, ...)
            UIApplication.shared.open(url, options: [:], completionHandler: nil)
            
            // Cancel the request (handled by UIApplication).
            decisionHandler(.cancel)
        }
        else {
            // Allow the request.
            decisionHandler(.allow)
        }
    }
}
```

## 1.4 Enable UPI Intent Support

To enable and test UPI intent in WebView-based Checkout:

1. Open your website integrated with custom checkout.
2. Pass `webview_intent: true` parameter in the [payload](/razorpay-docs-md/payment-gateway/web-integration/custom/build-integration.md#132-instantiate-custom-checkout)

   sent to checkout to enable UPI intent support.
3. Ensure that UPI intent is triggered when the payment request is made.

**Watch Out!**

By default, the top PSP apps appear on the customer's mobile irrespective of the installation status of the UPI apps.

## List of Supported UPI Intent Apps

Given below is the list of supported UPI apps for Mobile Web.

- `gpay`
- `phonepe`
- `paytm`
