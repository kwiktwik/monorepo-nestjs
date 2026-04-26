<!-- Source: https://razorpay.com/docs/payments/payment-gateway/emi²/widget/android -->

Integrate the Affordability Widget with your Android app to influence your customers' purchase decisions before they reach checkout by displaying various affordable payment options and offers.

## Prerequisites

- Create a [Razorpay account](https://dashboard.razorpay.com/signup)  .
- Generate the [API keys](/razorpay-docs-md/api/authentication.md#generate-api-keys)

  from the Dashboard by navigating to **Account & Settings** → **Website and app settings** → **API keys**.
- You can use the **Test Mode** keys to test the integration and preview the Widget. Later, switch to **Live Mode** of the Dashboard, generate the [Live API keys](/razorpay-docs-md/api/authentication.md#live-mode-api-keys)

  and replace it with the test keys.

## Integration Steps

Follow the integration steps given below to embed the widget on your website.

1. [Add Dependency in Build Gradle File](/razorpay-docs-md/payment-gateway/emi-/widget/android.md#step-1-add-dependency-in-build-gradle-file)
2. [Integrate the Widget](/razorpay-docs-md/payment-gateway/emi-/widget/android.md#step-2-integrate-the-widget)

   - [Static Integration](/razorpay-docs-md/payment-gateway/emi-/widget/android.md#static-integration)
   - [Dynamic Integration](/razorpay-docs-md/payment-gateway/emi-/widget/android.md#dynamic-integration)
3. [Render the Widget](/razorpay-docs-md/payment-gateway/emi-/widget/android.md#step-3-render-the-widget)

### Step 1: Add Dependency in Build Gradle File

Add the Affordability Widget dependency to your app's `build.gradle` file in the dependencies section.

xml

copy

```xml
dependencies {
   implementation 'com.razorpay:affordability-widget:1.0.0'//maven repo link
}
```

### Step 2: Integrate the Widget

You can integrate the widget statically (via XML) or dynamically (via class and objects) as per your project requirement.

#### Static Integration

Use the code given below to define the  `com.razorpay.affordability.Widget` layout in XML:

xml

copy

```xml
<com.razorpay.affordability.Widget
   android:id="@+id/web_test"
   android:layout_width="match_parent"
   android:layout_height="wrap_content"
/>
```

**Handy Tips**

You must add a frame layout if you want to use the widget without the parent layout in XML:

xml

copy

```xml
<FrameLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="wrap_content">

<com.razorpay.affordability.Widget
    android:id="@+id/web_item"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    />
</FrameLayout>
```

#### Dynamic Integration

Use the code given below to define the `com.razorpay.affordability.Widget` layout in the class file:

JavaKotlin

copy

```java
Widget widget = new Widget(this);
```

**Handy Tips**

You must add a frame layout if you want to use the widget without the parent layout to create `Widget`:

JavaKotlin

copy

```java
Widget widget = new Widget(this);
FrameLayout frameLayout = new FrameLayout(this);
frameLayout.addView(widget);
```

### Step 3: Render the Widget

Call the `render()` method to render the widget. Add the context, test key id generated from the Dashboard and amount (in paise).

JavaKotlin

copy

```java
JSONObject widgetConfig = new JSONObject(
    "{" +
        "\"key\": \"YOUR_KEY_ID\"," + // Enter your Test Key ID generated from the Dashboard
        "\"amount\": 400000," +
        "\"currency\": \"INR\"" +
    "}"
);

widget.render(this, widgetConfig);
```

**Watch Out!**

Ensure you pass the final amount in paise to the widget you want to display to your customers on the product and checkout pages.

You have successfully integrated the Affordability Widget with your Android application.

#### Proguard Rules

If you are using Proguard for your builds, you must add the following lines to your `proguard-rules.pro` file:

copy

```
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

-keepattributes JavascriptInterface
-keepattributes *Annotation*

-dontwarn com.razorpay.**
-keep class com.razorpay.** { *; }
-optimizations !method/inlining/*
```

### Switch to Live Mode

After you preview the widget, switch to live mode and replace the test API keys in the sample code with the live ones to take the integration live. Know more about [live API keys](/razorpay-docs-md/api/authentication.md#live-mode-api-keys).

## Successful Activation

Here is a glimpse of the default widget with enabled offers and payment method options.

![Glimpse of the default widget](https://razorpay.com/docs/payments/payment-gateway/emi²/widget/build/browser/assets/images/default-widget.jpg)

## Next Steps

After you successfully integrate the widget on your Android app, you can choose to [customise the widget](/razorpay-docs-md/payment-gateway/emi-/widget/android/customise.md) based on your requirement.

**Handy Tips**

- Fill in the [integration support form](https://form.typeform.com/to/Ro3nJPzp)

  in case you are facing any issues with the integration.
- In case you have any queries, raise a ticket on the [Razorpay Support Portal](https://razorpay.com/support/)  .

### Related Information

- [Affordability Widget](/razorpay-docs-md/payment-gateway/emi-/widget.md)
- [Affordability Widget FAQs](/razorpay-docs-md/payment-gateway/emi-/widget/faqs.md)
