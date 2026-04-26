<!-- Source: https://razorpay.com/docs/payments/refunds/refund-speed -->

You can configure the speed at which all the refunds should be processed for your customers.

## Set Default Speed of Refunds

Depending on your business needs, you can select from the following:

- **Normal Refund**

  In this mode, the speed attribute is set to `normal`. The customers will receive their refunds within 5-7 business days.
- **Instant Refund**

  In this mode, the speed attribute is set to `optimum`. Razorpay attempts to initiate fund transfer using IMPS, NEFT or UPI. The customer will receive the refunds instantly. If unsuccessful, Razorpay processes the refund via the `normal` speed.

The selected speed is set as the **default speed** and all the refunds, thereafter, will be processed at the chosen speed.

To set the default speed for all the refunds:

1. Log in to the Dashboard.
2. Navigate to **Account & Settings** and click **Capture and refund settings** under the **Payments and refunds** section.
3. In the **Default Refund Speed** section, choose between **Normal Refund** and **Instant Refund**.

   **Handy Tips**

   The chosen value is also applied as the default speed in the [Refund API request](/razorpay-docs-md/api/refunds.md)   .

## Override Default Refund Speed

You can override the default refund speed while refunding a payment from the **Transactions** → **Payments** tab of the Dashboard.

Watch this video to see how to override the default refund speed while issuing a refund.

The possible ways in which you can switch between Normal and Instant Refunds are listed below:

To set the default speed for all the refunds:

1. Log in to the Dashboard.
2. Navigate to **Account & Settings** and select **Capture and refund settings**.
3. In the **Default Refund Speed** section, choose between **Normal Refund** and **Instant Refund**.

   **Handy Tips**

   The chosen value is also applied as the default speed in the [Refund API request](/razorpay-docs-md/api/refunds.md)   .

### Related Information

- [About Refunds](/razorpay-docs-md/refunds.md)
- [Normal Refunds](/razorpay-docs-md/refunds/normal.md)
- [Batch Refunds](/razorpay-docs-md/refunds/batch.md)
- [Issue Refunds](/razorpay-docs-md/refunds/issue.md)
- [View Refunds](/razorpay-docs-md/refunds/view.md)
- [Refunds FAQs](/razorpay-docs-md/refunds/faqs.md)
