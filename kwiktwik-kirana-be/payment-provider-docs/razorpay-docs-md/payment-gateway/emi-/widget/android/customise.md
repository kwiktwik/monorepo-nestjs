<!-- Source: https://razorpay.com/docs/payments/payment-gateway/emi²/widget/android/customise -->

After you successfully integrate the widget on your Android app, create a JSON Object as per your customisation requirements and add it as an additional parameter in the `loadwidget()` method. Check all the [customisation options](/razorpay-docs-md/payment-gateway/emi-/widget/native-web/customise.md) available.

JavaKotlin

copy

```java
JSONObject widgetConfig = new JSONObject(
    "{" +
        "\"key\": \"YOUR_KEY_ID\"," + // Enter your Live Key ID generated from the Dashboard
        "\"amount\": 400000," +
        "\"currency\": \"INR\"," +
        "\"display\": {" +
            "\"offers\": false" +
        "}" +
    "}"
);

widget.render(this, widgetConfig);
```

### Related Information

- [FAQs](/razorpay-docs-md/payment-gateway/emi-/faqs.md)
- [About Affordability Widget](/razorpay-docs-md/payment-gateway/emi-/widget.md)
