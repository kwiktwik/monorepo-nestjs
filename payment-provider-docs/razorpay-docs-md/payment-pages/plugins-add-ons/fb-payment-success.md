<!-- Source: https://razorpay.com/docs/payments/payment-pages/plugins-add-ons/fb-payment-success -->

You should integrate Facebook Pixel on your payment success page to track and analyse the advertisement conversion to payments if you:

- Use Razorpay Payment Pages to accept payments from customers and redirect them to a success page post payment.
- And, advertise on Facebook and use Facebook Pixel to track conversions.

## Prerequisites

- [Create a Facebook Pixel](https://www.facebook.com/business/help/952192354843755?id=1205376682832142&recommended_by=1700857106877546)

  .
- Create a payment success page on your domain and [add the Facebook Pixel to it](https://www.facebook.com/business/help/952192354843755?id=1205376682832142)  .

## Workflow

Let us assume you run a website selling pet supplies. You attract customers using advertisements on Facebook and sell them pet products using Razorpay Payment Pages.

To track and measure the effectiveness of these Facebook advertisements and how many of them convert into purchases, you need to add a redirect from your Payment Page to this success page.

To add a redirect:

1. Navigate to your Payment Page in the edit mode.
2. Click **Page Settings**.
3. In the **Action after Success Payment** field, select **Redirect to your website**.
4. Enter your website's success page URL here as shown:

![](https://razorpay.com/docs/payments/payment-pages/plugins-add-ons/build/browser/assets/images/payment-pages-v3-add-redirect-url.jpg)

Every time a customer successfully completes a payment, they are directed to the success page. Facebook pixel tracks this event.

### Related Information

- [Add Facebook Pixel to Payment Page](/razorpay-docs-md/payment-pages/plugins-add-ons/fb-pixel.md)
- [Add Google Analytics Tracking ID](/razorpay-docs-md/payment-pages/plugins-add-ons/google-analytics.md)
