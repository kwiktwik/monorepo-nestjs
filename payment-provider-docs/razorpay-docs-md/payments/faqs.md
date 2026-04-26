<!-- Source: https://razorpay.com/docs/payments/payments/faqs -->

## Payments

1. How does a customer make payments using the Razorpay Payment Gateway?

Try [Razorpay Checkout](https://razorpay.com/demopg3/).

**Watch Out!**
This is a real transaction. The money will be deducted from your account when you complete the transaction. The money will be auto-refunded to your account in 4-5 days.

2. How much does Razorpay charge per transaction?

Under the standard plan designed for small and medium enterprises, Razorpay charges 2% per transaction. Razorpay also offers an enterprise plan designed for large volumes, which gives you the best prices possible for your business. Know more about [pricing](https://razorpay.com/pricing/).

3. Is GST mandatory to accept payments?

No, GST is not mandatory if your business does not have an annual turnover of over ₹20 lakhs. However, if you do not provide your GST details, you would not be able to claim TDS at the time of filing your tax returns.

4. What is the applicable GST? How is it charged?

18% GST is charged on the fee deducted for all payment methods except domestic card transactions of amount < = ₹ 2,000. You can check the [Monthly Invoice Report](/razorpay-docs-md/dashboard/reports.md#generate-reports) from the **Reports** section of your Dashboard to understand GST charged.

5. How can we test our website or mobile app integration with Razorpay Payment Gateway?

Razorpay offers a sandbox environment where you can test integrations before going live. To test your integration, [generate test API Keys](/razorpay-docs-md/api/authentication.md#generate-api-keys) in test mode and implement them in your code. Test mode features a mock bank page with **Success** and **Failure** buttons to replicate the live payment experience. No money is deducted as these are simulated transactions.

6. Do you have any test cards that we can use to check our website or mobile app integration with Razorpay Payment Gateway?

You can use the following test card details to inspect the payment flow with the available payment methods. Use any CVV and any future date as the expiry date.

- **Mastercard**: 5104015555555558 / 5104060000000008
- **Visa**: 4386289407660153
- **Subscription**: 5104015555555558
- **International MasterCard**: 5555555555554444 / 5105105105105100
- **International Visa**: 401288888881881 / 4000184186218826
- **AMEX**: 379862000000006

7. What is Standard Capture?

Standard capture is an authorisation followed by a `delayed` capture of the payment. In this scenario, if a customer makes a payment, the amount is deducted from the customer's bank account by Razorpay. The authorised amount is settled to your account only after you initiate a `capture` request.

8. What is auto-capture? How do I enable auto-capture for payments?

When a customer makes a payment, it goes to the `authorized` state. You need to capture the payments to get them settled to your account. Auto-capture enables the payments to be captured automatically as soon as they are `authorized`. Payments that are `authorized`, but not `captured` are automatically refunded to the customers in 5 days.
To set up automatic capture of payments, set up [Payment Capture settings](/razorpay-docs-md/payments/capture-settings.md) on your Dashboard.

9. How do I manually capture a payment?

You can manually capture payments:

- [From the Dashboard](/razorpay-docs-md/payments/capture-settings.md#manually-capture-payments)
- [Using APIs](/razorpay-docs-md/api/payments.md#capture-a-payment)

  You need to capture the payments to get them settled to your account. Payments that are `authorized`, but not `captured` are automatically refunded to the customers in 5 days.

10. Can I accept International Payments through Razorpay?

Yes, you can accept international payments using Razorpay Payment Gateway. Know more about [International Payments](/razorpay-docs-md/international-payments.md).

11. How are payments made by my customers settled to my account? Is any action required from my end?

No action is required from your end for the settlements. The captured payments are settled automatically to your account as per your settlement cycle. Know more about [Settlements](/razorpay-docs-md/settlements.md).

12. A payment is marked as 'failed' on my Dashboard but money is debited from the customer’s account. What do I do?

A payment is said to be in the 'failed' state when we do not receive a successful callback message on the transaction from the issuing bank. If the customer’s account is debited and we do not receive a successful callback, the amount will be auto-refunded by the customer’s issuing bank in 7-10 working days.
In case of a failed payment, we verify the status with the bank at regular intervals. If there is a change in status, the payment moves to the `authorized` state, and a notification is sent to you and the customer.
In such scenarios, you can choose to do any one of the following:

- **Provide services**: Capture the payment and provide the service/good as was promised earlier to the customer.
- **Refund the transaction**: If you are not able to provide service to the customer as per the agreed terms (Such as, time of delivery, cost of purchase or inventory issues), refund the payment to the customer.

13. Is Razorpay PCI-DSS compliant?

Yes, Razorpay is PCI-DSS compliant.

14. What is Late Authorisation?

Late authorisation is a situation that arises when a payment is interrupted by external factors such as network issues or technical errors at customer's or bank's end. In such cases, funds may or may not get debited from the customer's bank account and Razorpay does not receive a payment status from the bank. Know more about [Late Authorisation](/razorpay-docs-md/payments/late-authorisation.md).

15. Why am I facing issues with the checkout?

Facing issues with your checkout? Here are possible reasons:

- Checkout not loading:
  - Check for any incorrect parameters in the payload. See [Standard web integration best practices](/razorpay-docs-md/payment-gateway/web-integration/standard/best-practices.md)    .
  - Ensure that the API key in use is valid, non-expired and most recently generated one. See [API keys](/razorpay-docs-md/dashboard/account-settings/api-keys.md)    .
- Delay in payment processing on Checkout: The delay in payment confirmation, often referred to as 'Late Auth,' is a common issue within the payments ecosystem. Know more about [Late Authorisation](/razorpay-docs-md/payments/late-authorisation.md)  .
- Payment failed, but debited from customer: If the payment is debited from the customer but does not reflect on the dashboard, the amount will be refunded within 3-7 business days.
