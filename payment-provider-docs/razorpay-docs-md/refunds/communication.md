<!-- Source: https://razorpay.com/docs/payments/refunds/communication -->

If a customer is asking for a refund, the banking partner provides a unique reference number (either RRN, ARN or UTR) when a refund is processed. The customer can use this reference number to track the refund status with the bank.

As a customer, you will be notified of the specific payment to be refunded in 7-10 working days.

**Customer Looking for Refund**

If you are a customer looking for a refund, know more about [customer refunds](/razorpay-docs-md/customers/customer-refunds.md).

## Refund Mailers

Razorpay sends you the following email communications for refunds:

- Refund Mailer
   After you process the refund, Razorpay sends you an email with the refund id and unique reference number (ARN, RRN or UTR) provided by the bank.

![Refund Mailer](https://razorpay.com/docs/payments/refunds/build/browser/assets/images/normal_refund_mailer1.jpg)

- RRN/ARN Update Mailer
   When you refund a credit card payment, the banking partner will share an ARN with Razorpay. Razorpay sends you an email with this ARN number.

![RRN/ARN Update Mailer](https://razorpay.com/docs/payments/refunds/build/browser/assets/images/normal_arn_mailer.jpg)

**Handy Tips**

Razorpay sends the **Refund** and **RRN/ARN Update** emailers only if the customer email is passed to us.

### Related Information

- [Customer Refunds](/razorpay-docs-md/customers/customer-refunds.md)
- [Refunds APIs](/razorpay-docs-md/refunds/apis.md)
