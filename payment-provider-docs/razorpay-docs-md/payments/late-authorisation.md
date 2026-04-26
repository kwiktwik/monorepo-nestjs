<!-- Source: https://razorpay.com/docs/payments/payments/late-authorisation -->

Late authorisation is a situation that arises when a payment is interrupted by external factors, such as network issues or technical errors at the customer's or bank's end. In such cases, funds may or may not get debited from the customer's bank account, and Razorpay does not receive a bank's payment status.

## How Late Authorisations are Handled

If there is no response from the bank about a payment that a customer has made, the Dashboard displays this transaction's status as `Created.` If there is no response, even after 10 minutes, the transaction is marked as `Failed` due to timeout. After that, Razorpay polls the bank at various intervals for 3 days, from the payment creation day. During this time, if our system receives the payment status from the bank as **Successful**, the payment is marked as `Authorized.` The payments authorised in this manner are considered as late authorised.

![Handle Late authorisation](https://razorpay.com/docs/payments/payments/build/browser/assets/images/late_auth.jpg)

**Handy Tips**

On average, less than 0.5% of the total number of payments get late authorised. In cases where funds get debited from the customer's bank account and are not [captured](/razorpay-docs-md/payments.md), the amount is automatically refunded to the customer. As a best practice, you should subscribe to the [**`payment.authorized`** webhook](/docs/webhooks/) to get notifications about authorised or failed payments.

Not all payments that appear as failed are considered as late authorised. Late authorisation is a special case of handling technical or manual interruptions that prevent Razorpay from receiving payment status from the bank and proceed with the payment flow.

## What Causes Late Authorisation

Interruptions that prevent a payment gateway from receiving payment status information from the bank is a common cause for late authorisations. In most cases, payments are interrupted because of any of the following reasons:

- Network issues at the customer's end.
- Technical issues at the customer's bank's end.
- Customers closing the pop-up window or pressing the back button after submitting the OTP.

If Razorpay receives the payment status from the bank later, payment is moved to the `authorized` state leading to late payment authorisation. You have little control over these interruptions. Know more about [handling late authorisations](/razorpay-docs-md/payments/late-authorisation/handle.md) to avoid customer inconvenience.

## Normal Authorisations Vs. Late Authorisations

The difference in the payment flow for a normal payment and a late authorised payment is explained in the table below:

**Handy Tips**

Authorised payments are payments that the customer completes. You need to capture the payment for it to be settled in your account.

### Related Information [Handle Late Payment Authorisations](/razorpay-docs-md/payments/late-authorisation/handle.md)
