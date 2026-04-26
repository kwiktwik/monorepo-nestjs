<!-- Source: https://razorpay.com/docs/payments/disputes -->

A dispute is a situation where a customer or the issuing bank questions the validity of payments. It may arise due to unauthorised charges, failure to deliver the promised merchandise or excessive charges levied by the business.

## Dispute Phases

A dispute can be in any of the following phases:

**Handy Tips**

The pre-arbitration and arbitration dispute phases are usually long-drawn, complicated, and challenging. It is advised to take remedial action during the retrievals and chargeback phases to avoid complications.

## Dispute States

A dispute can have any of the following statuses (in the Razorpay system).

![Dispute States](https://razorpay.com/docs/payments/build/browser/assets/images/dispute-status.jpg)

## Disputes Process Flow

Following is the process flow for disputes:

1. A dispute can be initiated in any of the following ways:

   1. **Initiated by the issuing bank**: The issuing bank suspects a fraudulent transaction and asks for your justification.
   2. **Initiated by the customer**: The customer claims that the transaction was unauthorised and raises it with the issuing bank.
2. You will be [notified about the dispute.](/razorpay-docs-md/disputes.md#notifications)

   - **Accept** the dispute. The customer is refunded. In the case of fraud, you must refund the amount. In other cases, Razorpay will auto-refund the amount.
   - [Contest the dispute by submitting evidence](/razorpay-docs-md/disputes/submit-evidence.md)

     to prove that the transaction was fair.
     - If you contest, the documents are sent to the customer’s bank. The bank reviews the case and provides a verdict.
     - If you lose the dispute, the amount would be deducted from your account and is sent to the customer.

## Notifications

Notifications are sent when disputes are created. These notifications are in the form of:

- **Emails**
  You will receive an email notification when a dispute is created. The email contains details of the transaction, amount and cause of dispute.
- **Webhooks**
  You can [subscribe to Webhook events](/razorpay-docs-md/disputes/dashboard.md#subscribe-to-webhook-events)

  to receive alerts whenever a dispute is created or there is a change in status.

**Disputes in International Payments**

For a dispute raised for international payment, the amount deducted from your account will be based on the day's currency conversion rate when the dispute was created. The currency conversion rate is dependent on the rate charged by processing banks. This conversion rate may vary from that on the day when the payment was created.

## Dashboard Actions

You can perform the following actions using the Dashboard:

- [View disputes](/razorpay-docs-md/disputes/dashboard.md#view-disputes-using-dashboard)
- [Accept disputes](/razorpay-docs-md/disputes/dashboard.md#accept-disputes-using-dashboard)
- [Contest disputes and submit evidence](/razorpay-docs-md/disputes/dashboard.md#contest-disputes-using-dashboard)
- [Subscribe to Webhook Events related to disputes](/razorpay-docs-md/disputes/dashboard.md#subscribe-to-webhook-events)

### Related Information

- [Submit Evidence](/razorpay-docs-md/disputes/submit-evidence.md)
- [View Disputes](/razorpay-docs-md/disputes/dashboard.md#view-disputes-using-dashboard)
- [Disputes - Dashboard Actions](/razorpay-docs-md/disputes/dashboard.md)
- [Dispute FAQs](/razorpay-docs-md/disputes/faqs.md)
- [Dispute APIs](/razorpay-docs-md/disputes/apis.md)
- [Contact Support](https://razorpay.com/support/#request)

  for additional help with disputes.
