<!-- Source: https://razorpay.com/docs/payments/payment-links/upi -->

You can send the UPI Payment Links as URLs to your customers to accept UPI payments. When the customers click on the URL, a list of UPI apps installed on their mobile device is displayed. Customers can select the UPI app of their choice to complete the payment. You can also use [Standard Payment Links](/razorpay-docs-md/payment-links/standard.md) to receive payments using payment methods such as netbanking, cards and UPI.

**Handy Tips**

- This feature works only on Android mobile devices.
- UPI Payment Links will work only in **Live Mode**.
- **Enable Partial Payments** feature is not applicable for UPI Payment Links.

## Advantages

- UPI is a popular payment method that helps customers to make quick payments.
- Customers do not have to enter card details, netbanking login details, thus avoiding manual errors and failed payments.
- UPI payments have a high success rate compared to other payment methods.

## Supported Features

UPI Payment Links support the following features: [Reminders](/razorpay-docs-md/payment-links/reminders.md) and [Batch Upload](/razorpay-docs-md/payment-links/batch.md).

## Payment Link States

Know about the different [UPI Payment Link states](/razorpay-docs-md/payment-links/states.md#upi-payment-links).

## Create

Create a UPI Payment Link from the [Dashboard](/razorpay-docs-md/payment-links/create.md#create-a-upi-payment-link) or using the [APIs](/razorpay-docs-md/api/payments/payment-links/create-upi.md).

## Customer Interaction

Watch this video to see the customer flow for UPI Payment Links. [

customer flow for UPI Payment Links

](/razorpay-docs-md/payment-links/build/browser/assets/images/payment-links-upi-customer-payment.md)

## UPI Apps Preinstalled/Not Installed

UPI Apps Preinstalled

UPI Apps not Installed

Watch this video to see how the UPI Payment Link works when your customers have UPI apps installed on their devices.

![UPI Payment Link - customer interaction with preinstalled upi apps](https://razorpay.com/docs/payments/payment-links/build/browser/assets/images/payment-links-upi-payment.gif)

### Paid, Expired or Cancelled Payment Links

When customers attempt payment for paid, expired or cancelled Payment Links, the respective statuses are displayed. They are not allowed to make payments using such links.

![UPI Payment Link - other upi payment statuses](https://razorpay.com/docs/payments/payment-links/build/browser/assets/images/payment-links-upi-status.jpg)

#### Related Information

- [How Payment Links Work](/razorpay-docs-md/payment-links/how-it-works.md)
- [Payment Links States](/razorpay-docs-md/payment-links/states.md)
- [Standard Payment Links](/razorpay-docs-md/payment-links/standard.md)
- [Create a Payment Link](/razorpay-docs-md/payment-links/create.md)
- [FAQs](/razorpay-docs-md/payment-links/faqs.md)
