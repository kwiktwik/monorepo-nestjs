<!-- Source: https://razorpay.com/docs/payments/optimizer/capture-refund-settings -->

Use Optimizer to accept online payments from your customers. Check the payment states flow and configurations to capture and refund customer payments.

## Optimizer Payment States Flow

When a customer makes a payment, it usually flows through the following states:

The following state diagram depicts the flow of money through the payment states:

![Auto-capture All Payments process flows](https://razorpay.com/docs/payments/optimizer/build/browser/assets/images/payment-capture-payment-states.jpg)

1. By default, once your customer completes a payment, it is automatically moved to the `captured` state. However, in case of delayed authorisation, the payment can remain in the `authorized` state.
2. External factors such as network issues or problems with the payment provider can cause delays in Optimizer receiving payment status. In such cases, Optimizer polls the APIs intermittently for 3 days to check the status. If the payment status is successfully received during this time, the payment is moved to the `authorized` state. Know more about [late authorisation](/razorpay-docs-md/payments/late-authorisation.md)   .
3. The system ensures that all payments in the `authorized` state are moved to the `captured` state within 3 days of their creation. This is mandatory because payments that are not captured within this time period will be refunded automatically to customers.

You can configure **Payment Capture settings** on the Dashboard. You can choose to:

- [Auto-capture all payments](/razorpay-docs-md/optimizer/capture-refund-settings.md#auto-capture-all-payments)
- [Auto-capture with set timeouts](/razorpay-docs-md/optimizer/capture-refund-settings.md#auto-capture-with-custom-timeouts)

**Handy Tips**

Only a Razorpay account owner can configure payment capture settings on the Dashboard. Users with other roles are not allowed to configure this setting.

## Auto-capture All Payments

Capture all `authorized` payments automatically. This eliminates the time and effort spent manually capturing payments.

**Handy Tips**

This is the default setting for all customers. If the payments are not captured within the selected time frame, they are automatically refunded.

![ Auto-capture all payments process flow.](https://razorpay.com/docs/payments/optimizer/build/browser/assets/images/payment-capture-auto-capture-all-payments.jpg)

Watch this video to see how to set up the **Automatic Capture** option for all payments.

![ Auto-capture all payments process flow.](https://razorpay.com/docs/payments/optimizer/build/browser/assets/images/auto-capture-all-payments-optimizer.gif)

To auto-capture all `authorized` payments:

1. Log in to the Dashboard.
2. Navigate to the **Account & Settings** → **Capture and refund settings (under Payments and refunds section)**.
3. Click **Change** next to **Automatic Capture**.
4. Under **Automatic Capture**, click the drop-down and select the time period in the **Capture all payments authorised within** field. For example, 3 days.
5. Click **Next**.
6. Click **Normal Speed** and **Save**.

## Auto-Capture with Custom Timeouts

Once the payment is `created`, you can:

- auto-capture payments that are `authorized` within a certain time period, and
- auto refund the payments that are `authorized` after that time period.

You can do this by setting up custom timeouts for automatic capture.

## Auto-capture Timeout

Let us say you only want to auto-capture payments that are `authorized` within 3 days of creation, then select the following settings:

**Handy Tips**

If the payments are not captured within the selected time frame, they are automatically refunded.

![Auto Capture Timeout process flow](https://razorpay.com/docs/payments/optimizer/build/browser/assets/images/payment-capture-auto-capture-timeout.jpg)

Watch this video to see how to set up the **Automatic Capture with Timeout** option.

![ Auto-capture all payments process flow.](https://razorpay.com/docs/payments/optimizer/build/browser/assets/images/auto-capture-custom-payments.gif)

To auto-capture all `authorized` payments with timeout:

1. Log in to the Dashboard.
2. Navigate to the **Account & Settings** → **Capture and refund settings (under Payments and refunds section)**.
3. Click **Change** next to **Automatic Capture**.
4. Under **Automatic Capture**, click the drop-down and select the time period in the **Capture all payments authorised within** field. For example, 3 days.
5. Click **Next**.
6. Select **Refund Automatically** option and click **Next**.
7. Click **Normal Speed** and **Save**.

## Manual Capture Timeouts

**Watch Out!**

- [Manual Capture](/razorpay-docs-md/payments/capture-settings/api.md)

  settings only apply to payments processed via Razorpay.
- Optimizer will auto capture the payment if the payment is authorised within a certain time period.
- Any payment authorised after that time period (auto capture time period) will be auto refunded.
- Any manual capture time period set on the Dashboard will not apply to payments processed through payment providers other than Razorpay. Such payments will be automatically captured by default.

Ensuring that you reflect the correct information is crucial because downstream payment providers will mark the payment as successful and settle the amount to your account as per the settlement schedule, even if Optimizer waits for you to manually capture the payment.

## Configure Payment Capture Settings Using Orders API

Capture values passed in the [Orders API](/razorpay-docs-md/payments/capture-settings/api.md) take precedence over the Payment Capture settings configured on the Dashboard. You can use this to change the capture settings for individual payments.

### Related Information

- [Orders API](/razorpay-docs-md/api/orders.md)
- [Payment States](/razorpay-docs-md/payments.md#payment-life-cycle)
- [Refunds](/razorpay-docs-md/refunds.md)
- [Manually capture payments using Capture API](/razorpay-docs-md/api/payments.md#capture-a-payment)
- [Manually capture payments from the Dashboard](/razorpay-docs-md/payments/dashboard.md#manually-capture-payments)
