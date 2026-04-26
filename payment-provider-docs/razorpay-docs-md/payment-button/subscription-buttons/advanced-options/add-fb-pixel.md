<!-- Source: https://razorpay.com/docs/payments/payment-button/subscription-buttons/advanced-options/add-fb-pixel -->

Do you use Razorpay Subscription Buttons to accept recurring payments from customers and redirect them to a success page post payment? Do you also advertise on Facebook and use Facebook Pixel to track conversions?

If yes, you should integrate Facebook Pixel on your payment success page to track and analyze ad conversion to payments.

## Prerequisite

- [Create a Facebook Pixel](https://www.facebook.com/business/help/952192354843755?id=1205376682832142&recommended_by=1700857106877546)

  .
- Create a payment success page on your domain and [add the Facebook Pixel to it](https://www.facebook.com/business/help/952192354843755?id=1205376682832142)  .

## Workflow

Let us assume you are a Internet Service Provider. You attract customers using advertisements on Facebook and attract subscribers on your website using Razorpay Subscription Button.

To track and measure the effectiveness of these Facebook ads and how many of them convert into purchases, you need to add a redirect from your Subscription Button to this success page.

To do this:

1. Navigate to your Subscription Button in edit mode, to the **Button Created Successfully** screen.
2. Click **Configure** against **Redirect URL and Custom Message**.
3. In the modal that appears, enable **Redirect URL**.
4. Add the redirect URL in the field.
5. Click **Save**.

![](https://razorpay.com/docs/payments/payment-button/subscription-buttons/advanced-options/build/browser/assets/images/payment-button-redirect.jpg)

Every time a customer successfully completes a payment, they will be directed to the success page. Facebook pixel will track this event.
